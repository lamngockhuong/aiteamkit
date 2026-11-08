// The environment every `claude -p` call of the bench gets, the skill session and the helpers alike,
// built on the isolation of atkx:skill-eval's trigger runner. A session runs Bash in a seed that may
// obey an instruction planted in a file, so its environment reaches none of the maintainer's own
// state: an empty Claude config holding the login only, a scratch HOME with no git credential helper,
// no gh login and no SSH keys, a global git config naming only Bench Lead, and the settings file the
// sweep of a dead runner finds its sessions by.
//
// The filesystem is bounded by permission rules rather than by the operating system. settings.json
// denies Read, Edit and Write on the maintainer's real home and on this repository, Read on /proc and
// on the parts of any bench run directory a session has no business reading, and Edit and Write on
// every part of its own run directory but the seed's working files: the kit copy it loads, its
// settings, its config, its home and git configuration, the seed's git directory, the seed's own
// Claude settings and origin. A deny rule never sees a shell command, so the same settings register
// bash-guard.mjs, which lets a Bash call through only when it is one of the command shapes it lists,
// with paths inside the seed, and refuses everything else. What stays open, and is stated in every report's design: a session
// runs as the maintainer, so code it writes in the seed runs as the maintainer when a granted
// command runs it, `node --test` and `npm test` among them, and reads whatever the maintainer can.

import { cpSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  childEnv, credentials, killTree, makeRunDir, sweepStale, track,
} from '../../../plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs';
import { within } from '../../../plugins/atkx/skills/skill-eval/scripts/static-check.mjs';

export { credentials, killTree, sweepStale, track };

export const PREFIX = 'atk-bench-';
export const BENCH_LEAD = { name: 'Bench Lead', email: 'lead@order-api.invalid' };

const LIB = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(LIB, '..', '..', '..');
const GUARD = join(LIB, 'bash-guard.mjs');

// The directories no session may read or write by a file tool: the maintainer's home, where the
// saved login and the SSH keys live, and this repository, whose fixtures hold the hidden tests and
// answer keys and whose docs/derived/bench/ holds earlier runs. Real paths, so a link cannot name its
// way around a rule.
export function deniedRoots() {
  return [...new Set([realpathSync(homedir()), realpathSync(REPO)])];
}

const rule = (tool, path) => `${tool}(/${path.split('\\').join('/')})`;

// The rules Claude Code reads from settings.json; `//` opens an absolute path in a rule.
export function denyRules(roots, runDir) {
  const out = roots.flatMap((root) => ['Read', 'Edit', 'Write'].map((tool) => rule(tool, `${root}/**`)));
  out.push(rule('Read', '/proc/**'));
  // The copies the checks make to run a hidden test, and in any bench run directory, this one or
  // another running beside it, the Claude configs holding the login and the scratch homes.
  out.push(rule('Read', `${dirname(runDir)}/atk-check-*/**`));
  for (const part of ['config', 'helper-config', 'home']) out.push(rule('Read', `${dirname(runDir)}/${PREFIX}*/${part}/**`));
  // In this run directory, everything a session could edit to change what runs or what is measured.
  for (const part of ['kit/**', 'settings.json', 'config/**', 'helper-config/**', 'helper/**', 'home/**', 'seed/.git/**', 'seed/.claude/**', 'origin.git/**', 'before.json', 'pid']) {
    out.push(rule('Edit', `${runDir}/${part}`), rule('Write', `${runDir}/${part}`));
  }
  return out;
}

// The settings every call gets: the deny rules, and the guard on every Bash call of a session. The
// guard is told the scenario's kind, since a review scenario is granted the forms atk:review runs
// before it spawns its agents; a run directory made for no scenario passes none and gets none of them.
function settingsOf(roots, runDir, kind) {
  const quote = (x) => `'${x.split("'").join("'\\''")}'`;
  const args = [GUARD, join(runDir, 'seed'), ...(kind ? [kind] : [])].map(quote).join(' ');
  return {
    permissions: { deny: denyRules(roots, runDir) },
    hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: `node ${args}` }] }] },
  };
}

// One run directory per run: config/, seed/ and logs/ from makeRunDir, plus a scratch home, the
// helpers' own config and working directory, and settings.json with the deny rules. A run directory
// inside a denied root would deny the session its own seed, so it is refused. `kind` is the kind of the
// scenario the directory is made for, which the guard reads.
export function newRunDir(kind) {
  const runDir = makeRunDir(PREFIX);
  const roots = deniedRoots();
  const real = realpathSync(runDir);
  const inside = roots.find((root) => within(root, real));
  if (inside) throw new Error(`the run directory ${real} is inside ${inside}, which every session is denied; set TMPDIR to a directory outside it`);
  const home = join(runDir, 'home');
  for (const d of [home, join(home, '.config'), join(runDir, 'helper'), join(runDir, 'helper-config')]) mkdirSync(d, { recursive: true, mode: 0o700 });
  const gitconfig = join(home, '.gitconfig');
  writeFileSync(gitconfig, `[user]\n\tname = ${BENCH_LEAD.name}\n\temail = ${BENCH_LEAD.email}\n[init]\n\tdefaultBranch = main\n`);
  const settings = join(runDir, 'settings.json');
  writeFileSync(settings, `${JSON.stringify(settingsOf(roots, real, kind), null, 2)}\n`);
  return { runDir, home, gitconfig, settings, seed: join(runDir, 'seed'), config: join(runDir, 'config'), helperDir: join(runDir, 'helper'), helperConfig: join(runDir, 'helper-config') };
}

function scratchHome(run) {
  return {
    HOME: run.home,
    USERPROFILE: run.home,
    XDG_CONFIG_HOME: join(run.home, '.config'),
    XDG_DATA_HOME: join(run.home, '.local', 'share'),
    XDG_CACHE_HOME: join(run.home, '.cache'),
    XDG_STATE_HOME: join(run.home, '.local', 'state'),
    GH_CONFIG_DIR: join(run.home, '.config', 'gh'),
    GIT_CONFIG_GLOBAL: run.gitconfig,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
  };
}

// The kit a kit-arm session loads: a copy inside the run directory, so loading it reads nothing under
// the denied roots.
export function kitCopy(run, kitDir) {
  const dest = join(run.runDir, 'kit');
  cpSync(kitDir, dest, { recursive: true });
  return dest;
}

// What git needs to build the seed: no login, the scratch home, nothing of the maintainer's config.
export function gitEnv(run) {
  return { PATH: process.env.PATH, LANG: 'C', ...scratchHome(run) };
}

// What a session or a helper needs. `helper` gives the call its own config directory, so a helper
// never reads the session's.
export function claudeEnv(run, auth, { helper = false } = {}) {
  return childEnv({ ...auth.env, ...scratchHome(run), CLAUDE_CONFIG_DIR: helper ? run.helperConfig : run.config });
}

// The flags every call carries: the settings file the sweep finds a dead runner's sessions by, and
// no MCP server.
export function baseArgs(run) {
  return ['-p', '--settings', run.settings, '--strict-mcp-config'];
}

// Every value a kept file must never hold: the login, and every credential-like variable childEnv
// passes on, each ANTHROPIC_* value and the client key passphrase among them.
export function secretsOf(auth) {
  const passed = Object.entries(process.env)
    .filter(([k]) => /^(ANTHROPIC_|CLAUDE_CODE_(OAUTH_TOKEN|CLIENT_KEY_PASSPHRASE)$)/i.test(k) && !/^ANTHROPIC_(MODEL|BASE_URL|SMALL_FAST_MODEL|DEFAULT_\w+_MODEL)$/i.test(k))
    .map(([, v]) => v);
  return [...new Set([auth.env?.CLAUDE_CODE_OAUTH_TOKEN, ...passed].filter((v) => typeof v === 'string' && v.length >= 8))];
}

// What a masked secret reads as; the leak check looks for it in the transcript.
export const MASKED_LOGIN = '<redacted: login token>';

// Each secret is masked as it is and as JSON writes it inside a string, the form stream-json and
// the JSON output carry it in, so parsing the masked text can never restore it.
export function mask(text, secrets) {
  let out = text;
  for (const s of secrets) {
    for (const form of new Set([s, JSON.stringify(s).slice(1, -1)])) out = out.split(form).join(MASKED_LOGIN);
  }
  return out;
}
