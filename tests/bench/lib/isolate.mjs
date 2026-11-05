// The environment every `claude -p` call of the bench gets, the skill session and the helpers alike,
// built on the isolation of atkx:skill-eval's trigger runner. A session runs Bash in a seed that may
// obey an instruction planted in a file, so its environment reaches none of the maintainer's own
// state: an empty Claude config holding the login only, a scratch HOME with no git credential helper,
// no gh login and no SSH keys, a global git config naming only Bench Lead, and the settings file the
// sweep of a dead runner finds its sessions by.
//
// That is the environment, not the filesystem. A session still runs as the maintainer, as the design
// accepts, so a granted Read or cat given an absolute path reaches the maintainer's files, the real
// ~/.claude and this repository's fixtures/*/hidden/ included, and code it writes runs when a granted
// command runs it.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  childEnv, credentials, killTree, makeRunDir, sweepStale, track,
} from '../../../plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs';

export { credentials, killTree, sweepStale, track };

export const PREFIX = 'atk-bench-';
export const BENCH_LEAD = { name: 'Bench Lead', email: 'lead@order-api.invalid' };

// One run directory per run: config/, seed/ and logs/ from makeRunDir, plus a scratch home, the
// helpers' own config and working directory, and settings.json.
export function newRunDir() {
  const runDir = makeRunDir(PREFIX);
  const home = join(runDir, 'home');
  for (const d of [home, join(home, '.config'), join(runDir, 'helper'), join(runDir, 'helper-config')]) mkdirSync(d, { recursive: true, mode: 0o700 });
  const gitconfig = join(home, '.gitconfig');
  writeFileSync(gitconfig, `[user]\n\tname = ${BENCH_LEAD.name}\n\temail = ${BENCH_LEAD.email}\n[init]\n\tdefaultBranch = main\n`);
  const settings = join(runDir, 'settings.json');
  writeFileSync(settings, '{}');
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

// Each secret is masked as it is and as JSON writes it inside a string, the form stream-json and
// the JSON output carry it in, so parsing the masked text can never restore it.
export function mask(text, secrets) {
  let out = text;
  for (const s of secrets) {
    for (const form of new Set([s, JSON.stringify(s).slice(1, -1)])) out = out.split(form).join('<redacted: login token>');
  }
  return out;
}
