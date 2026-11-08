// The Bash guard on fixed commands, with no model call and no seed: each case names a command, the
// reason verdict() must give, or null where the guard lets it through, and the scenario kind the
// session runs under where it matters. A refusal names the form refused, so a session never reads the
// refusal of one git command as a refusal of all of git.
// It also holds that a refusal reaches the run's denials, read by readStream in lib/session.mjs.
// Run it after any change to bash-guard.mjs, to readStream, or to the scan block of
// plugins/atk/shared/secret-scan.md: node tests/bench/check-guard.mjs
// Exit 0 when every case holds, 1 otherwise.

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdict } from './lib/bash-guard.mjs';
import { newRunDir } from './lib/isolate.mjs';
import { readStream } from './lib/session.mjs';

const PLAIN = 'it is not one plain command: a separator, pipe, redirection, substitution, expansion or escape is not allowed';

// The masked diff atk:review writes for its agents, built here from the file as a session reads it:
// the two lines under Masking a diff, filled in, with the scan block as their here-document.
const SCAN_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'plugins', 'atk', 'shared', 'secret-scan.md');
const scanText = readFileSync(SCAN_FILE, 'utf8');
const open = "```bash\nsh -s -- staged <<'SCAN'\n";
const body = scanText.slice(scanText.indexOf(open) + open.length, scanText.indexOf('\nSCAN\n```'));
const two = scanText.slice(scanText.indexOf('```bash\nd=$(') + 8).split('\n```')[0];
const maskCommand = (arg, text = body) => `${two.replace('<skill>', 'review').replace('<run-id>', '261108-0900-orders').replace('<base>...HEAD', arg)} <<'SCAN'\n${text}\nSCAN`;
const MASK = maskCommand('origin/main...HEAD');
const ONLY_REVIEWS = (form) => `${form} is allowed only in a review scenario`;
const NOT_THE_BLOCK = "the scan is allowed only as the two lines of Masking a diff in shared/secret-scan.md with its block as the here-document, opened by <<'SCAN' once, after the argument or at the end of the second line, byte for byte as the file holds them now";
// The same command with the opener right after the argument, as the block's own first line has it.
const openerAfter = (command) => command.replace(" > \"$d/diff.patch\" 2> \"$d/masked.txt\" <<'SCAN'", " <<'SCAN' > \"$d/diff.patch\" 2> \"$d/masked.txt\"");

const CASES = [
  ['git check-ignore -q docs/derived/traces/review/x.md', null],
  ['git rev-parse --show-toplevel', null],
  ['git config user.name', null],
  ['git status --short', null],
  ['ls -la', null],
  ['node --test', null],
  ['npm test', null],
  ['git ls-files', ONLY_REVIEWS('git ls-files')],
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

  // git ls-files, in a review scenario only, with the options the scan block uses.
  ['git ls-files', null, 'reviews'],
  ['git ls-files -z --others --exclude-standard', null, 'reviews'],
  ["git ls-files -- '*.pub'", null, 'reviews'],
  ['git ls-files .env', null, 'reviews'],
  ['git ls-files --stage', 'git ls-files does not allow the option --stage', 'reviews'],
  ['git ls-files ../outside', '../outside is not a path or revision inside the working directory', 'reviews'],
  ['git ls-files', ONLY_REVIEWS('git ls-files'), 'changes-code'],

  // git rev-parse naming a path in the git directory, in a review scenario only.
  ['git rev-parse --path-format=absolute --git-path atk/review/261108-0900-orders', null, 'reviews'],
  ['git rev-parse --path-format=absolute --git-path ../x', '../x is not a path inside the git directory', 'reviews'],
  ['git rev-parse --path-format=relative --git-path atk/review/x', 'git rev-parse takes --path-format=absolute --git-path <path>, in that order and nothing else', 'reviews'],
  ['git rev-parse --path-format=absolute --git-path atk/review/x', ONLY_REVIEWS('git rev-parse --path-format=absolute --git-path'), 'changes-code'],
  ['git rev-parse --show-toplevel', null, 'reviews'],

  // The scan block, byte for byte as the file holds it, in a review scenario only.
  [MASK, null, 'reviews'],
  [maskCommand('--worktree'), null, 'reviews'],
  [maskCommand('abc123~1..abc123'), null, 'reviews'],
  [maskCommand('origin/main...HEAD', body.replace('mode=${1:-staged}', 'mode=${1:-mask}')), NOT_THE_BLOCK, 'reviews'],
  [`${MASK}\nrm -rf .`, NOT_THE_BLOCK, 'reviews'],
  [maskCommand('HEAD;rm'), NOT_THE_BLOCK, 'reviews'],
  [openerAfter(MASK), null, 'reviews'],
  [openerAfter(MASK).replace('"$d/masked.txt"\n', `"$d/masked.txt" <<'SCAN'\n`), NOT_THE_BLOCK, 'reviews'],
  [MASK, ONLY_REVIEWS('the scan block of shared/secret-scan.md'), 'drafts-artifact'],
  [MASK, ONLY_REVIEWS('the scan block of shared/secret-scan.md')],
];

const seed = mkdtempSync(join(tmpdir(), 'atk-guard-'));
let failed = 0;
const report = (label, ok, expect, got) => {
  if (!ok) failed++;
  process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${label}${ok ? '' : `\n  expected ${JSON.stringify(expect)}\n  got      ${JSON.stringify(got)}`}\n`);
};
const short = (command) => (command.length > 90 ? `${command.split('\n')[0].slice(0, 70)}... (${command.split('\n').length} lines)` : command);
try {
  for (const [command, expect, kind] of CASES) {
    const got = verdict(command, seed, kind);
    report(`${kind || 'no kind'}: ${short(command)}`, got === expect, expect, got);
  }
  // When the file changes, the command built from the old file is refused rather than let through.
  const changed = join(seed, 'secret-scan.md');
  writeFileSync(changed, scanText.replace('mode=${1:-staged}', 'mode=${1:-tree}'));
  const got = verdict(MASK, seed, 'reviews', { scanFile: changed });
  report('reviews: the scan block of a file that has changed since', got === NOT_THE_BLOCK, NOT_THE_BLOCK, got);
} finally {
  rmSync(seed, { recursive: true, force: true });
}

// The hook as a session's settings run it: the kind a run directory is made for reaches the guard,
// and the scan is matched against the kit copy beside the seed, the file the session read.
const hook = (run, command) => {
  const settings = JSON.parse(readFileSync(run.settings, 'utf8'));
  const r = spawnSync('sh', ['-c', settings.hooks.PreToolUse[0].hooks[0].command], { input: JSON.stringify({ tool_input: { command } }), encoding: 'utf8' });
  return r.status === 0 ? null : r.stderr.replace(/^The bench refused this command: (.*)\. Run one plain command, with paths relative to the working directory\.\n$/s, '$1');
};
// A second result event, as a background agent's notification adds, must not drop the first one's denials.
const refusal = (id) => ({ tool_name: 'Bash', tool_use_id: id });
const stream = [[refusal('t1'), refusal('t2')], [refusal('t2')]]
  .map((d) => JSON.stringify({ type: 'result', subtype: 'success', permission_denials: d })).join('\n');
const ids = readStream(stream).denials.map((d) => d.tool_use_id);
const want = ['t1', 't2'];
report('denials: every result event of a call, each refusal once', ids.join() === want.join(), want, ids);
const firstFailed = readStream([{ type: 'result', subtype: 'error_max_budget_usd', is_error: true }, { type: 'result', subtype: 'success' }]
  .map((e) => JSON.stringify(e)).join('\n')).failed;
report('failure: an earlier result event that failed is kept', firstFailed === 'error_max_budget_usd', 'error_max_budget_usd', firstFailed);

const runs = [];
try {
  const review = newRunDir('reviews');
  const none = newRunDir();
  runs.push(review.runDir, none.runDir);
  report('hook, reviews: git ls-files', hook(review, 'git ls-files') === null, null, hook(review, 'git ls-files'));
  report('hook, no kind: git ls-files', hook(none, 'git ls-files') === ONLY_REVIEWS('git ls-files'), ONLY_REVIEWS('git ls-files'), hook(none, 'git ls-files'));
  const copy = join(review.runDir, 'kit', 'shared');
  mkdirSync(copy, { recursive: true });
  writeFileSync(join(copy, 'secret-scan.md'), scanText.replace('mode=${1:-staged}', 'mode=${1:-tree}'));
  const fromCopy = maskCommand('origin/main...HEAD', body.replace('mode=${1:-staged}', 'mode=${1:-tree}'));
  report('hook, reviews: the scan block as the kit copy holds it', hook(review, fromCopy) === null, null, hook(review, fromCopy));
  report('hook, reviews: the scan block of the repository when the kit copy differs', hook(review, MASK) === NOT_THE_BLOCK, NOT_THE_BLOCK, hook(review, MASK));
} finally {
  for (const d of runs) rmSync(d, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
