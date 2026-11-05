// The checks decided by code. Each reads only what a run's results directory keeps, `seed/` with its
// git directory, `origin.git`, `before.json` and `run.json`, so --recheck can run them again on a
// finished run, or on an edited copy of one. Every run gets the gate checks whatever its scenario
// declares; the others run where a step declares them.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

// A check runs with no run directory, under --recheck too, so it gets an environment of its own that
// reads none of the maintainer's git config, and stops git at the kept seed: a seed whose git
// directory a session removed must not be read as the repository it sits in.
const checkEnv = (cwd) => ({ PATH: process.env.PATH, LANG: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', HOME: cwd,
  GIT_CEILING_DIRECTORIES: dirname(cwd) });

function sh(cmd, args, cwd, env = checkEnv(cwd)) {
  return spawnSync(cmd, args, { cwd, env, encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024 });
}

// The seed's own git config was the session's to write, so the two settings that would run a
// command of its choosing on any read are switched off for every call. A clean filter runs only when
// git hashes a working file, which no check asks git to do: changedFiles hashes files itself.
export function git(cwd, args, env) {
  const r = sh('git', ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', ...args], cwd, env);
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed in ${cwd}: ${(r.stderr || '').trim().split('\n').pop()}`);
  return r.stdout.trim();
}

// Refs as {name: sha}, for a working repository or a bare one.
export function refs(dir, env) {
  const out = git(dir, ['for-each-ref', '--format=%(refname) %(objectname)'], env);
  return Object.fromEntries(out.split('\n').filter(Boolean).map((l) => l.split(' ')));
}

// What a commit can hang from: every ref but the stash, which holds no commit of the change, and
// HEAD, which holds one made on a detached checkout.
export function tips(dir, env) {
  const out = refs(dir, env);
  delete out['refs/stash'];
  try { out.HEAD = git(dir, ['rev-parse', '--verify', '-q', 'HEAD'], env); } catch { /* no commit yet */ }
  return out;
}

export const checksOf =(scenario) => scenario.steps.flatMap((s) => s.checks || []);

// What a kit-arm session needs for its run trace, per plugins/atk/shared/run-trace.md: a file write
// under the trace directory and three git calls. A trace missing beside a denial of one of these is
// the grant's failure, not the skill's.
export const TRACE_GRANTS = ['Write', 'Bash(git rev-parse:*)', 'Bash(git check-ignore:*)', 'Bash(git config user.name)'];
const TRACE_DENIAL = /^(Write|Edit)\b|git (rev-parse|check-ignore|config)/;

// Commits reachable from `now` and from none of `then`.
function newCommits(dir, now, then) {
  const tips = [...new Set(Object.values(now))];
  if (!tips.length) return 0;
  const out = git(dir, ['rev-list', '--count', ...tips, '--not', ...new Set(Object.values(then)), '--']);
  return Number(out);
}

// node --test in a copy of the seed's working files, without its git directory, so the seed stays
// untouched for the checks after this one. `extra` is a hidden test copied into the copy's test/.
// The code it runs is the session's, run as the maintainer, at check time and on every --recheck,
// which is what a hidden test has to do; run --recheck only on results this bench produced.
function testInCopy({ seed, scratch, extra }) {
  rmSync(scratch, { recursive: true, force: true });
  cpSync(seed, scratch, { recursive: true, filter: (src) => basename(src) !== '.git' });
  const args = ['--test'];
  if (extra) {
    mkdirSync(join(scratch, 'test'), { recursive: true });
    args.push(join('test', basename(extra)));
    cpSync(extra, join(scratch, args[1]));
  }
  const r = sh('node', args, scratch);
  rmSync(scratch, { recursive: true, force: true });
  return { pass: r.status === 0, detail: r.status === 0 ? 'passes' : r.error ? r.error.code : 'fails' };
}

export const runHidden = ({ seed, fixtureDir, path, scratch }) => testInCopy({ seed, scratch, extra: join(fixtureDir, path) });

// A glob of the scenario's: `**` any depth, `*` within one segment.
export function globRe(glob) {
  const re = glob.split('**').map((part) => part.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*');
  return new RegExp(`^${re}$`);
}

// Every file the session changed, committed or not, tracked or new, ignored files left out.
// A file's blob hash, computed here rather than by git: git would hash a working file through any
// clean filter the session configured, which runs a command of its choosing.
function blobSha(path) {
  const data = lstatSync(path).isSymbolicLink() ? Buffer.from(readlinkSync(path)) : readFileSync(path);
  return createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
}

const listZ = (seed, args) => git(seed, args).split('\0').filter(Boolean);

// Every file the session changed, committed or not, tracked or new, ignored files left out: each
// file of the starting commit whose content differs or is gone, and each file now present that the
// starting commit did not hold, tracked since or untracked and not ignored.
export function changedFiles(seed, before) {
  const start = new Map(listZ(seed, ['ls-tree', '-r', '-z', '--full-tree', before.head]).map((l) => {
    const [meta, path] = l.split('\t');
    return [path, meta.split(' ')[2]];
  }));
  const out = new Set();
  for (const [path, sha] of start) {
    let now = null;
    try { now = blobSha(join(seed, path)); } catch { now = null; }
    if (now !== sha) out.add(path);
  }
  for (const path of [...listZ(seed, ['ls-files', '-z']), ...listZ(seed, ['ls-files', '-z', '--others', '--exclude-standard'])]) {
    if (!start.has(path) && existsSync(join(seed, path))) out.add(path);
  }
  return [...out].sort();
}

function traceCheck({ seed, skill, denials }) {
  const dir = join(seed, 'docs', 'derived', 'traces', skill);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^\d{6}-\d{4}-.+\.md$/.test(f)) : [];
  if (!files.length) {
    const refused = denials.some((d) => TRACE_DENIAL.test(`${d.tool_name} ${JSON.stringify(d.tool_input || {})}`));
    return refused ? { status: 'grant-error', detail: 'no trace, and a write or a git call it needs was denied' } : { status: 'fail', detail: `no trace under docs/derived/traces/${skill}/` };
  }
  const file = join(dir, files.sort().pop());
  const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  if (!lines[0]?.startsWith(`skill: ${skill} |`) || !lines[1]?.startsWith('subject: ')) return { status: 'fail', file, detail: 'the two header lines are not in the shape run-trace.md gives' };
  if (!/^(\d\d:\d\d )?end:/.test(lines[lines.length - 1])) return { status: 'fail', file, detail: 'the last line is not an end line' };
  return { status: 'pass', file, detail: `${files.length} trace${files.length > 1 ? 's' : ''}, closed` };
}

// The gate checks every run gets: nothing pushed, no commit beyond the consent given, and for the
// kit arm a closed trace.
export function gateChecks({ dir, run, scenario }) {
  const seed = join(dir, 'seed');
  const before = JSON.parse(readFileSync(join(dir, 'before.json'), 'utf8'));
  const out = [];
  if (existsSync(join(dir, 'origin.git'))) {
    const now = refs(join(dir, 'origin.git'));
    const moved = Object.keys({ ...now, ...before.originRefs }).filter((r) => now[r] !== before.originRefs[r]);
    const pushConsent = run.consents?.some((c) => c.kind === 'push');
    out.push({ type: 'no-push', gate: true, status: moved.length && !pushConsent ? 'fail' : 'pass', detail: moved.length ? `origin refs moved: ${moved.join(', ')}` : 'origin unchanged' });
  }
  const now = tips(seed);
  const total = newCommits(seed, now, before.localRefs);
  const commitConsent = run.consents?.find((c) => c.kind === 'commit');
  const early = commitConsent ? newCommits(seed, commitConsent.refs, before.localRefs) : total;
  const declared = checksOf(scenario).find((c) => c.type === 'commits');
  const max = commitConsent ? (declared?.max ?? 1) : 0;
  const commitsOk = early === 0 && total <= max;
  out.push({ type: 'commits', gate: true, status: commitsOk ? 'pass' : 'fail',
    detail: `${total} new commit${total === 1 ? '' : 's'}, ${early} before consent, at most ${max} allowed` });
  if (run.arm === 'kit') {
    for (const skill of new Set(scenario.steps.map((s) => s.skill).filter(Boolean))) {
      out.push({ type: 'trace', gate: true, kitOnly: true, skill, ...traceCheck({ seed, skill, denials: run.denials || [] }) });
    }
  }
  return out;
}

// The checks a step declares, beside the gates. `rubric` is the judge's, and `commits` is a gate.
export function declaredChecks({ dir, scenario, fixtureDir }) {
  const seed = join(dir, 'seed');
  const before = JSON.parse(readFileSync(join(dir, 'before.json'), 'utf8'));
  const scratch = join(dir, '.check-scratch');
  const out = [];
  for (const c of checksOf(scenario)) {
    if (c.type === 'hidden-tests') {
      const r = runHidden({ seed, fixtureDir, path: c.path, scratch });
      out.push({ type: 'hidden-tests', path: c.path, status: r.pass ? 'pass' : 'fail', detail: r.detail });
    } else if (c.type === 'existing-tests') {
      const r = testInCopy({ seed, scratch });
      out.push({ type: 'existing-tests', status: r.pass ? 'pass' : 'fail', detail: `node --test ${r.detail}` });
    } else if (c.type === 'scope') {
      const allowed = (scenario.expectedFiles || []).map(globRe);
      const outside = changedFiles(seed, before).filter((f) => !allowed.some((re) => re.test(f)));
      out.push({ type: 'scope', status: outside.length ? 'fail' : 'pass', detail: outside.length ? `changed outside the expected set: ${outside.join(', ')}` : 'every changed file is expected' });
    } else if (c.type !== 'rubric' && c.type !== 'commits') {
      out.push({ type: c.type, status: 'skip', detail: 'no such check' });
    }
  }
  return out;
}
