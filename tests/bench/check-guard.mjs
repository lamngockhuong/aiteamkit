// The Bash guard on fixed commands, with no model call and no seed: each case names a command and
// the reason verdict() must give, or null where the guard lets it through. A refusal names the form
// refused, so a session never reads the refusal of one git command as a refusal of all of git.
// Run it after any change to bash-guard.mjs: node tests/bench/check-guard.mjs
// Exit 0 when every case holds, 1 otherwise.

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verdict } from './lib/bash-guard.mjs';

const PLAIN = 'it is not one plain command: a separator, pipe, redirection, substitution, expansion or escape is not allowed';
const CASES = [
  ['git check-ignore -q docs/derived/traces/review/x.md', null],
  ['git rev-parse --show-toplevel', null],
  ['git config user.name', null],
  ['git status --short', null],
  ['ls -la', null],
  ['node --test', null],
  ['npm test', null],
  ['git ls-files', 'git ls-files is not a form of git the bench allows'],
  ['git ls-tree -r --name-only HEAD', 'git ls-tree is not a form of git the bench allows'],
  ['node foo.js', 'node foo.js is not a form of node the bench allows'],
  ['npm install', 'npm install is not a form of npm the bench allows'],
  ['git', 'git is not a command the bench allows'],
  ['cat x', 'cat is not a command the bench allows'],
  ['date +%y%m%d-%H%M', 'date is not a command the bench allows'],
  ['git config core.editor', 'that form of git config is not allowed'],
  ['git status --ignored', 'git status does not allow the option --ignored'],
  ['git diff /etc/passwd', '/etc/passwd is not a path or revision inside the working directory'],
  ['git status; ls', PLAIN],
];

const seed = mkdtempSync(join(tmpdir(), 'atk-guard-'));
let failed = 0;
try {
  for (const [command, expect] of CASES) {
    const got = verdict(command, seed);
    const ok = got === expect;
    if (!ok) failed++;
    process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${command}${ok ? '' : `\n  expected ${JSON.stringify(expect)}\n  got      ${JSON.stringify(got)}`}\n`);
  }
} finally {
  rmSync(seed, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
