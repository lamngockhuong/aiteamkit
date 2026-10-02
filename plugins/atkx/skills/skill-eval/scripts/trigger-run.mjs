// atkx:skill-eval trigger runner: measures, on Claude Code, which skill each trigger case reaches.
//
// Each observable case runs in a child `claude -p` session, several times, in a temporary copy of
// the repository that holds the skill, under an empty temporary CLAUDE_CONFIG_DIR, with the login
// in its environment rather than on disk, and hook-log.mjs registered on PreToolUse for the Skill tool. The hook records the
// selected skill and denies the call, so the skill never runs; the runner stops the session as soon
// as that first call is logged, since nothing after it is counted. references/trigger-mode.md is
// the method this implements, and the reasons for each part of it.
//
// A plugin skill loads with its plugin, hooks included, because that is what an install runs. So
// the runner refuses a skill whose static check, or the static check of the hooks of its plugin and
// of the plugins it depends on, reports a credential or a gate failure; it leaves the repository's
// own .claude settings out of the seed, gives each session only the environment variables a session
// needs, and lists the hook commands that will run, which the agent shows before asking for the yes.
//
// It starts sessions only under --yes, which the agent passes after the user has seen the count
// from --dry-run and said yes; --dry-run copies nothing and starts nothing. Case text reaches a
// child on standard input only, never in an argument and never through a shell. Everything it
// creates sits in one directory under the OS temporary directory, removed on exit and on SIGINT,
// SIGTERM and SIGHUP; a directory left by a runner that was killed outright is removed by the next
// --yes run, once its PID is dead, and that run's sessions are stopped. --dry-run removes nothing:
// a count changes no state on the machine.
//
// Usage: node trigger-run.mjs <skill-dir> (--dry-run | --yes) [--runs <n>] [--model <id>]
//        [--timeout <seconds>] [--parallel <n>]
// Prints one JSON summary on standard output, and one progress line per session on standard error.

import { spawn, spawnSync } from 'node:child_process';
import {
  chmodSync, copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  readlinkSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeSkill, evaluate, evaluateHooks, findRoot } from './static-check.mjs';

const PREFIX = 'skill-eval-run-';
const RUN_DIR_NAME = /^skill-eval-run-[A-Za-z0-9]{6}$/;
const GIT_DIR = '.' + 'git';
const HOOK = fileURLToPath(new URL('./hook-log.mjs', import.meta.url));
const IS_WINDOWS = process.platform === 'win32';
// Selecting a skill takes one turn; a session that spends this much has stopped measuring anything.
const SESSION_BUDGET_USD = '1';
// How often a session's log is checked for its first Skill call; a stop within a second is enough.
const POLL_MS = 300;
// A run directory with no pid file yet may belong to a runner that has only just made it.
const YOUNG_MS = 60_000;
// The repository's own Claude Code settings carry hooks and pre-approved permissions; the seed
// leaves them out so that a measurement runs nothing the repository configured.
const SEED_EXCLUDE = new Set(['.claude/settings.json', '.claude/settings.local.json']);
// No ceiling on runs: the question before any session starts is the limit (AC 3.10). The timeout is
// bounded because a timer past about 24 days overflows to 1 ms, and parallel by what a machine runs.
const LIMITS = { runs: Infinity, timeout: 3600, parallel: 16 };

function parseArgs(argv) {
  const opts = { runs: 3, model: 'sonnet', timeout: 180, parallel: 3, dryRun: false, yes: false, dir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const num = (key) => {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 1 || n > LIMITS[key]) {
        fail('usage', `${a} needs a whole number of 1 or more${Number.isFinite(LIMITS[key]) ? `, at most ${LIMITS[key]}` : ''}`);
      }
      return n;
    };
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--yes') opts.yes = true;
    else if (a === '--runs') opts.runs = num('runs');
    else if (a === '--timeout') opts.timeout = num('timeout');
    else if (a === '--parallel') opts.parallel = num('parallel');
    else if (a === '--model') {
      opts.model = argv[++i];
      if (!opts.model || !/^[\w.:[\]][\w.:[\]-]*$/.test(opts.model)) fail('usage', '--model needs a model name');
    } else if (!opts.dir) opts.dir = a;
    else fail('usage', `unknown argument ${a}`);
  }
  if (!opts.dir || opts.dryRun === opts.yes) {
    fail('usage', 'node trigger-run.mjs <skill-dir> (--dry-run | --yes) [--runs n] [--model id] [--timeout s] [--parallel n]');
  }
  return opts;
}

function print(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function fail(status, detail, extra = {}) {
  print({ status, detail, ...extra });
  process.exit(status === 'usage' ? 2 : 3);
}

// ---------------------------------------------------------------------------------------------
// What a killed runner left behind. Only this user's directories, only when their PID is dead.

function alive(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function sweepStale() {
  let removed = 0;
  const uid = typeof process.getuid === 'function' ? process.getuid() : null;
  for (const name of readdirSync(tmpdir())) {
    if (!RUN_DIR_NAME.test(name)) continue;
    const dir = join(tmpdir(), name);
    try {
      const st = lstatSync(dir);
      if (!st.isDirectory() || (uid !== null && st.uid !== uid)) continue;
      // No pid file means a session wrote into the directory after it was removed: debris, not a
      // run. Unless the directory is young, when its runner may simply not have written it yet.
      let pid = null;
      try { pid = Number(readFileSync(join(dir, 'pid'), 'utf8')); } catch { pid = null; }
      if (pid === null && Date.now() - st.mtimeMs < YOUNG_MS) continue;
      if (Number.isInteger(pid) && pid > 0 && alive(pid)) continue;
      // A runner killed outright stopped none of its sessions. Each one names this directory's
      // settings file on its command line, which is what tells them apart from anyone else's.
      // SIGKILL and a short wait, because a session still shutting down writes its config files
      // back into the directory after it is removed.
      if (!IS_WINDOWS && uid !== null) {
        // `--` ends pkill's options: the pattern itself starts with --settings.
        const r = spawnSync('pkill', ['-KILL', '-u', String(uid), '-f', '--', `--settings ${escapeRe(join(dir, 'settings.json'))}`], { stdio: 'ignore' });
        if (r.status === 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
      }
      rmSync(dir, { recursive: true, force: true });
      removed++;
    } catch { /* not ours, or already gone */ }
  }
  return removed;
}

// ---------------------------------------------------------------------------------------------
// The run directory and its cleanup

let runDir = null;
const children = new Set();

function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (IS_WINDOWS) spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGKILL');
  } catch { /* already gone */ }
}

function cleanup() {
  for (const c of children) killTree(c);
  children.clear();
  if (runDir) {
    try { rmSync(runDir, { recursive: true, force: true }); } catch { /* the next run sweeps it */ }
    runDir = null;
  }
}

process.on('exit', cleanup);
for (const [sig, code] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) {
  process.on(sig, () => {
    cleanup();
    process.exit(code);
  });
}

function makeRunDir() {
  runDir = mkdtempSync(join(tmpdir(), PREFIX));
  chmodSync(runDir, 0o700);
  writeFileSync(join(runDir, 'pid'), String(process.pid));
  for (const d of ['config', 'seed', 'logs']) mkdirSync(join(runDir, d), { mode: 0o700 });
  return runDir;
}

// ---------------------------------------------------------------------------------------------
// Seed: the files git lists, tracked and untracked but not ignored, plus the repository's own
// directory, so the branch, the commits and any uncommitted change are all there. The original is
// only read. A link is recreated as a link when it stays inside the repository and left out when
// it does not, so no file from outside the repository ever lands in the seed.

function seedFiles(repo) {
  const res = spawnSync('git', ['-C', repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  });
  if (res.status !== 0) fail('no-seed', `git could not list the files of ${repo}`);
  return [...new Set(res.stdout.split('\0').filter(Boolean))].filter((rel) => !SEED_EXCLUDE.has(rel.split(sep).join('/')));
}

function seedCopy(repo, dest, list) {
  const realRepo = realpathSync(repo);
  let files = 0;
  let links = 0;
  for (const rel of list) {
    const from = join(repo, rel);
    let st;
    try { st = lstatSync(from); } catch { continue; } // deleted in the working tree: absent in the copy too
    const to = join(dest, rel);
    if (st.isSymbolicLink()) {
      let target;
      try { target = realpathSync(from); } catch { continue; }
      const r = relative(realRepo, target);
      if (r.split(sep)[0] === '..' || isAbsolute(r)) continue;
      mkdirSync(dirname(to), { recursive: true });
      // An absolute link would still name the original, so a write through it in the seed would land
      // there; it becomes the relative link to the seed's copy of its target.
      const raw = readlinkSync(from);
      symlinkSync(isAbsolute(raw) ? relative(dirname(to), join(dest, r)) || '.' : raw, to);
      links++;
      continue;
    }
    if (!st.isFile()) continue;
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    files++;
  }
  cpSync(join(repo, GIT_DIR), join(dest, GIT_DIR), { recursive: true, verbatimSymlinks: true });
  return { files, links };
}

// The saved login reaches each session as CLAUDE_CODE_OAUTH_TOKEN, its access token alone, and never
// as a file: a copy on disk outlives a runner killed outright, refresh token included. A token that
// would expire before the run's worst-case end is not used, since a session cannot refresh it.
function credentials(worstCaseSeconds) {
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY) return { how: 'environment', env: {} };
  const home = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
  const file = join(home, '.credentials.json');
  if (!existsSync(file)) return null;
  let oauth = null;
  try { oauth = JSON.parse(readFileSync(file, 'utf8'))?.claudeAiOauth ?? null; } catch { oauth = null; }
  if (typeof oauth?.accessToken !== 'string' || !oauth.accessToken) return null;
  const minutesLeft = typeof oauth.expiresAt === 'number' ? Math.floor((oauth.expiresAt - Date.now()) / 60000) : null;
  if (minutesLeft !== null && minutesLeft * 60 < worstCaseSeconds + 300) return { how: 'expiring', minutesLeft };
  return { how: 'saved login, as an environment token', minutesLeft, env: { CLAUDE_CODE_OAUTH_TOKEN: oauth.accessToken } };
}

// What a session needs from the runner's environment: finding programs and its home, the locale and
// the temporary directory, a proxy and its certificates, the login, and the settings Claude Code reads
// from its own variables. Everything else, a cloud key or a token for another service, stays behind,
// since the hooks of the evaluated plugin run in the session.
const ENV_KEEP = /^(?:PATH|PATHEXT|HOME|USER|LOGNAME|USERNAME|USERPROFILE|HOMEDRIVE|HOMEPATH|SHELL|COMSPEC|SYSTEMROOT|SYSTEMDRIVE|WINDIR|APPDATA|LOCALAPPDATA|PROGRAMDATA|PROGRAMFILES|TMPDIR|TEMP|TMP|LANG|LANGUAGE|LC_[A-Z]+|TERM|TZ|XDG_[A-Z_]+|HTTPS?_PROXY|NO_PROXY|ALL_PROXY|NODE_EXTRA_CA_CERTS|SSL_CERT_FILE|SSL_CERT_DIR|ANTHROPIC_[A-Z0-9_]+|CLAUDE_CODE_[A-Z0-9_]+)$/i;
function childEnv(extra) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (ENV_KEEP.test(k)) env[k] = v;
  return { ...env, ...extra };
}

// The plugin directories a session loads, the skill's own and every dependency found beside it.
function pluginDirs(skill) {
  if (!skill.pluginRoot) return [];
  return [skill.pluginRoot, ...skill.dependencies.map((dep) => join(dirname(skill.pluginRoot), dep))
    .filter((d) => existsSync(join(d, '.claude-plugin', 'plugin.json')))];
}

// A plugin skill loads through --plugin-dir, from the seed copy when the plugin is there, with
// every plugin it declares as a dependency found beside it. A skill under the seed's
// .claude/skills/ is already there. Any other skill, or one the seed lacks because the repository
// ignores it, is copied into the config.
function loading(skill, repo, seed, config) {
  const inSeed = (p) => {
    const rel = relative(repo, p);
    if (rel.split(sep)[0] === '..' || isAbsolute(rel)) return p;
    return seed && existsSync(join(seed, rel, '.claude-plugin', 'plugin.json')) ? join(seed, rel) : p;
  };
  if (skill.pluginRoot) {
    const dirs = [inSeed(skill.pluginRoot)];
    const missing = [];
    for (const dep of skill.dependencies) {
      const beside = join(dirname(skill.pluginRoot), dep);
      if (existsSync(join(beside, '.claude-plugin', 'plugin.json'))) dirs.push(inSeed(beside));
      else missing.push(dep);
    }
    return { args: dirs.flatMap((d) => ['--plugin-dir', d]), how: 'plugin, hooks included', missing };
  }
  const rel = relative(repo, skill.path);
  const projectSkill = rel.split(sep).slice(0, 2).join('/') === '.claude/skills';
  if (projectSkill && (!seed || existsSync(join(seed, rel, 'SKILL.md')))) return { args: [], how: 'project skill', missing: [] };
  if (config) cpSync(skill.path, join(config, 'skills', basename(skill.path)), { recursive: true });
  return { args: [], how: 'copied into the config', missing: [] };
}

// ---------------------------------------------------------------------------------------------
// One session

function firstSkill(log) {
  let text = '';
  try { text = readFileSync(log, 'utf8'); } catch { return null; }
  for (const line of text.split('\n')) {
    try {
      const p = JSON.parse(line);
      if (p.tool_name === 'Skill' && p.tool_input && typeof p.tool_input.skill === 'string') return p.tool_input.skill;
    } catch { /* partial line while the hook writes */ }
  }
  return null;
}

// Windows starts claude.cmd only through a shell, which joins the arguments; each is quoted so a
// path with a space stays one argument. No case text is ever among them.
const winQuote = (a) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);

function session({ query, log, args, cwd, env, timeout }) {
  return new Promise((done) => {
    const child = spawn('claude', IS_WINDOWS ? args.map(winQuote) : args, {
      cwd, env, stdio: ['pipe', 'pipe', 'pipe'], detached: !IS_WINDOWS, shell: IS_WINDOWS,
    });
    children.add(child);
    let timedOut = false;
    let stopped = false;
    let tail = '';
    const keep = (b) => { tail = (tail + b.toString('utf8')).slice(-600); };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);
    let finished = false;
    // A session that ended on its own with a failure and selected nothing did not measure: a login
    // that failed reads exactly like "no skill selected" otherwise, and would be counted as one. A
    // session stopped at the timeout without a selection did measure: it selected nothing.
    const finish = (code) => {
      if (finished) return;
      finished = true;
      clearInterval(poll);
      clearTimeout(timer);
      children.delete(child);
      const selected = firstSkill(log);
      let error = null;
      if (!selected && !stopped && code !== 0) error = tail.trim().split('\n').pop() || `exit ${code}`;
      done({ selected, timedOut, error });
    };
    const stop = () => { stopped = true; killTree(child); };
    // The hook writes the log only on a Skill call, so until the file exists there is nothing to read.
    const poll = setInterval(() => { if (existsSync(log) && firstSkill(log)) stop(); }, POLL_MS);
    const timer = setTimeout(() => { timedOut = true; stop(); }, timeout * 1000);
    child.on('error', (e) => { tail = e.message; finish(-1); });
    child.on('exit', (code) => finish(code));
    child.stdin.on('error', () => { /* the child left before reading */ });
    child.stdin.end(query);
  });
}

async function pool(items, size, work) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await work(items[i], i);
    }
  }));
  return out;
}

// ---------------------------------------------------------------------------------------------

function readCases(casesFile) {
  const rel = relative(process.cwd(), casesFile);
  if (!existsSync(casesFile)) fail('no-cases', `no ${rel}: draft cases first`);
  let cases;
  try { cases = JSON.parse(readFileSync(casesFile, 'utf8')); } catch (e) { fail('no-cases', `${rel} does not parse: ${e.message}`); }
  if (!Array.isArray(cases) || !cases.length) fail('no-cases', `${rel} is not a non-empty array`);
  cases.forEach((c, i) => {
    const ok = c && typeof c === 'object' && typeof c.query === 'string' && c.query.trim() && typeof c.should_trigger === 'boolean';
    if (!ok) fail('no-cases', `${rel}: case ${i} is not {query: non-empty string, should_trigger: true or false}`);
  });
  return cases;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let dir = resolve(opts.dir);
  if (basename(dir) === 'SKILL.md' && existsSync(dir)) dir = dirname(dir);
  if (!existsSync(join(dir, 'SKILL.md'))) fail('no-skill', `No SKILL.md in ${dir}`);
  const skill = describeSkill(dir);
  if (skill.skillLinksOut) fail('no-skill', `${dir}/SKILL.md links out of the skill and is not read`);
  if (skill.manifestError) fail('no-skill', `the plugin manifest of ${skill.pluginRoot} does not parse: ${skill.manifestError}`);
  if (!skill.fullName) fail('no-skill', `the SKILL.md in ${dir} has no name`);

  // A skill that fails the static check's credential or gate checks is not run, hooks and all, in
  // sessions that hold the user's login. Its static report says why.
  const verdict = evaluate(dir).summary;
  if (verdict.credentials || verdict.gate) {
    fail('gate-failed', `the static check found ${verdict.credentials} credential and ${verdict.gate} security gate findings; fix them before measuring triggers`);
  }
  // The hooks of every plugin a session loads run in it, so they pass the same gate.
  let declared = '';
  try { declared = readFileSync(join(dir, 'SKILL.md'), 'utf8'); } catch { declared = ''; }
  const hookReports = pluginDirs(skill).map((d) => evaluateHooks(d, declared));
  const hookFails = hookReports.filter((h) => h.summary.credentials || h.summary.gate);
  if (hookFails.length) {
    fail('gate-failed', `the hooks of ${hookFails.map((h) => h.plugin).join(', ')} failed the static check; a session would run them, so triggers are not measured`, {
      hookFindings: hookFails.flatMap((h) => h.checks.filter((c) => c.status === 'fail').map((c) => ({ plugin: h.plugin, ...c }))),
    });
  }
  const hookCommands = hookReports.flatMap((h) => h.commands.map((c) => ({ plugin: h.plugin, ...c })));

  const cases = readCases(join(dir, 'evals', 'trigger_evals.json'));
  const isSlash = (c) => c.query.trimStart().startsWith('/');
  const skipped = cases.filter(isSlash)
    .map((c) => ({ query: c.query, reason: 'a slash command expands into the prompt and calls no tool, so nothing can observe it' }));
  const observable = cases.filter((c) => !isSlash(c));
  if (!observable.length) fail('no-observable-cases', 'every case is a slash command, which nothing can observe; add cases phrased as requests', { skipped });

  const repo = skill.repoRoot || findRoot(process.cwd(), GIT_DIR);
  if (!repo) fail('no-seed', 'neither the skill nor the working directory is in a git repository; with no seed every session would read zero');
  if (!statSync(join(repo, GIT_DIR)).isDirectory()) {
    fail('no-seed', `${repo} is a git worktree or submodule, whose repository directory is shared with another checkout; a seed copy would write into it, so measure from the main checkout`);
  }

  const sessions = observable.length * opts.runs;
  const worstCaseSeconds = Math.ceil(sessions / opts.parallel) * opts.timeout;
  // Each session stops at its budget, so the sessions times the budget bounds what a run can spend.
  const worstCaseUsd = sessions * Number(SESSION_BUDGET_USD);
  // Only a run that starts sessions sweeps, after every refusal, so a count or a refused run touches
  // no directory and no process of an earlier run.
  const removed = opts.yes ? sweepStale() : 0;
  const base = {
    fullName: skill.fullName, model: opts.model, runs: opts.runs, date: new Date().toISOString().slice(0, 10),
    cases: cases.length, observable: observable.length, skipped, sessions, worstCaseSeconds, worstCaseUsd,
    timeoutSeconds: opts.timeout, parallel: opts.parallel, removedStale: removed, hookCommands,
  };
  const list = seedFiles(repo);

  if (opts.dryRun) {
    const auth = credentials(worstCaseSeconds);
    const load = loading(skill, repo, null, null);
    print({
      status: 'dry-run', ...base, how: load.how, missingDependencies: load.missing, seedFiles: list.length,
      credentials: auth ? auth.how : 'none found', credentialsMinutesLeft: auth?.minutesLeft ?? null,
    });
    return;
  }

  makeRunDir();
  const config = join(runDir, 'config');
  const seed = join(runDir, 'seed');
  const auth = credentials(worstCaseSeconds);
  if (!auth) fail('no-credentials', 'no CLAUDE_CODE_OAUTH_TOKEN or ANTHROPIC_API_KEY in the environment and no access token in .credentials.json; on macOS the login sits in the keychain, so set CLAUDE_CODE_OAUTH_TOKEN', base);
  if (auth.how === 'expiring') {
    fail('no-credentials', `the saved login expires in ${auth.minutesLeft} minutes, before this run could end (up to ${Math.ceil(worstCaseSeconds / 60)}); run any claude command to refresh it, or set CLAUDE_CODE_OAUTH_TOKEN, then start again`, base);
  }
  const seeded = seedCopy(repo, seed, list);
  const load = loading(skill, repo, seed, config);
  const settings = join(runDir, 'settings.json');
  writeFileSync(settings, JSON.stringify({
    hooks: { PreToolUse: [{ matcher: 'Skill', hooks: [{ type: 'command', command: `node "${HOOK}"` }] }] },
  }));
  const loaded = { how: load.how, missingDependencies: load.missing, seededFiles: seeded.files, seededLinks: seeded.links, credentials: auth.how };

  // The budget bounds a session nobody stops: the runner stops each one at its first Skill call or
  // at the timeout, but a runner killed outright stops nothing, and its children would run on.
  const args = ['-p', '--settings', settings, '--model', opts.model, '--strict-mcp-config',
    '--max-budget-usd', SESSION_BUDGET_USD, ...load.args];
  const jobs = observable.flatMap((c, ci) => Array.from({ length: opts.runs }, (_, r) => ({ c, ci, r })));
  let n = 0;
  const results = await pool(jobs, opts.parallel, async ({ c, ci, r }) => {
    const log = join(runDir, 'logs', `${ci}-${r}.jsonl`);
    const env = childEnv({ ...auth.env, CLAUDE_CONFIG_DIR: config, SKILL_EVAL_LOG: log });
    const res = await session({ query: c.query, log, args, cwd: seed, env, timeout: opts.timeout });
    const what = res.error ? `error: ${res.error}` : (res.selected || 'none') + (res.timedOut ? ' (timed out)' : '');
    process.stderr.write(`[${++n}/${jobs.length}] ${what}: ${c.query.slice(0, 60)}\n`);
    return { ci, ...res };
  });

  // Errored sessions measured nothing, so they are left out of every figure and counted apart.
  const measured = results.filter((x) => !x.error);
  const errors = results.filter((x) => x.error).map((x) => ({ query: observable[x.ci].query, error: x.error }));
  const perCase = observable.map((c, ci) => {
    const selected = measured.filter((x) => x.ci === ci).map((x) => x.selected || 'none');
    const hits = selected.filter((s) => s === skill.fullName).length;
    const correct = c.should_trigger ? hits : selected.length - hits;
    return { query: c.query, should_trigger: c.should_trigger, belongs_to: c.belongs_to || null, selected, correct, of: selected.length };
  });
  const timedOut = results.filter((x) => x.timedOut).length;

  if (!measured.length) {
    print({ status: 'error', detail: `every session failed before measuring anything; the first said: ${errors[0]?.error}`, ...base, ...loaded, timedOut, errors });
    return;
  }
  if (measured.every((x) => !x.selected)) {
    print({ status: 'broken', detail: 'no session selected any skill, so the measurement did not work and gives no figures', ...base, ...loaded, timedOut, errors, perCase });
    return;
  }
  const tp = perCase.filter((c) => c.should_trigger).reduce((a, c) => a + c.correct, 0);
  const positives = perCase.filter((c) => c.should_trigger).reduce((a, c) => a + c.of, 0);
  const fp = perCase.filter((c) => !c.should_trigger).reduce((a, c) => a + (c.of - c.correct), 0);
  const correct = perCase.reduce((a, c) => a + c.correct, 0);
  const round = (x) => Math.round(x * 1000) / 10;
  print({
    status: 'measured', ...base, ...loaded, timedOut, errors,
    score: round(correct / measured.length),
    precision: tp + fp ? round(tp / (tp + fp)) : null,
    recall: positives ? round(tp / positives) : null,
    recallIsLowerBound: true,
    perCase,
  });
}

main();
