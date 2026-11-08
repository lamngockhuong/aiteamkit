// A PreToolUse hook the runner registers for every session's Bash calls. The deny rules of
// settings.json govern the file tools only, and a granted shell command can name a file, glue a path
// to an option, or reach a shell construct a list of forbidden patterns never ends. So this hook
// allows rather than forbids: a command passes only when it is one of the shapes below, made of
// plain words, every option one that command's shape lists, and every other word a path or a
// revision inside the seed. Anything else is refused, which may refuse a harmless command now and
// then; a refusal reaches the session as a denial with the reason.
//
// It fails closed: an error inside the hook refuses the call rather than letting it through, since
// Claude Code runs a tool whose hook exited with anything but 2.
//
// A scenario of kind `reviews` is granted three forms more, the ones atk:review runs before it spawns
// its reviewer agents: `git ls-files` with the options the scan block uses, `git rev-parse` naming a
// path in the git directory, and the scan block of plugins/atk/shared/secret-scan.md with its `mask`
// lines. The block is matched against the file as it is when the call is made, so a command written
// from an older copy of it is refused rather than let through. Every other kind is refused all three,
// and so is a run that names no kind.
//
// Usage, as a hook command: node bash-guard.mjs <seed-dir> [<scenario-kind>]. Reads the hook's JSON
// on standard input; exit 2 with a reason on standard error refuses the call, exit 0 lets it through.

import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCAN_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'plugins', 'atk', 'shared', 'secret-scan.md');
const REVIEWS = 'reviews';

// Splits a command into words the way a shell would for plain words and quotes, and refuses every
// character that would make the shell do more than that: a separator, a pipe, a redirection, a
// substitution, an expansion, a glob or an escape outside quotes, and a substitution inside double
// quotes. Returns null when the command is not plain.
export function words(command) {
  const out = [];
  let word = null;
  let quoted = false;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (ch === "'" || ch === '"') {
      const end = command.indexOf(ch, i + 1);
      if (end < 0) return null;
      const inner = command.slice(i + 1, end);
      if (ch === '"' && /[$`\\]/.test(inner)) return null;
      word = (word ?? '') + inner;
      quoted = true;
      i = end;
    } else if (ch === ' ' || ch === '\t') {
      if (word !== null) out.push({ text: word, quoted });
      word = null;
      quoted = false;
    } else if (/[A-Za-z0-9_.\/:+@,%=^~-]/.test(ch)) {
      word = (word ?? '') + ch;
    } else {
      return null;
    }
  }
  if (word !== null) out.push({ text: word, quoted });
  return out;
}

// The shapes a granted command may take. `flags` are options standing alone; `valued` take a value,
// glued with `=` or as the next word; `max` caps the number of positional words, paths or revisions.
const SHAPES = {
  'git status': { flags: ['-s', '--short', '--porcelain', '-b', '--branch', '-uno', '-u', '--untracked-files=no', '--untracked-files=all'], max: 99 },
  'git diff': { flags: ['--stat', '--shortstat', '--numstat', '--name-only', '--name-status', '--cached', '--staged', '--no-color', '--color=never', '-w', '-p', '--patch', '--check', '--exit-code', '--quiet', '-U0', '-U1', '-U3', '-U5'], max: 99 },
  'git log': { flags: ['--oneline', '--stat', '--shortstat', '-p', '--patch', '--graph', '--decorate', '--all', '--no-color', '--reverse', '--name-only', '--name-status', '--follow', '--first-parent', '--no-merges', '--date=short', '--date=iso'], valued: ['-n', '--max-count', '--format', '--pretty', '--since', '--until', '--author', '--grep'], numeric: true, max: 99 },
  'git show': { flags: ['--stat', '--shortstat', '--name-only', '--name-status', '-p', '--patch', '--no-color', '--oneline', '--summary', '-s', '--no-patch'], valued: ['--format', '--pretty'], max: 99 },
  'git blame': { flags: ['-w', '-s', '-e', '--porcelain', '-c'], valued: ['-L'], max: 3 },
  'git branch': { flags: ['--show-current', '-a', '--all', '-v', '-vv', '--list', '-r', '--remotes', '--merged', '--no-merged'], max: 2 },
  'git add': { flags: ['-A', '--all', '-u', '--update', '-v', '--verbose'], max: 99 },
  'git commit': { flags: ['-q', '--quiet', '--allow-empty'], valued: ['-m', '--message'], message: true, max: 0 },
  'git push': { flags: [], words: ['origin', 'main', 'HEAD'], max: 2 },
  'git rev-parse': { flags: ['--show-toplevel', '--show-prefix', '--is-inside-work-tree', '--abbrev-ref', '--short', '--verify', '-q', '--quiet'], max: 2 },
  'git check-ignore': { flags: ['-q', '--quiet', '-v', '--verbose', '-n', '--non-matching'], max: 99 },
  'git config': { exact: [['user.name'], ['--get', 'user.name']] },
  ls: { flags: ['-l', '-a', '-A', '-la', '-al', '-1', '-R', '-F', '-lh', '-lah'], max: 99 },
  mkdir: { flags: ['-p'], max: 99 },
  wc: { flags: ['-l', '-c', '-w', '-m'], max: 99 },
  'node --test': { flags: ['--test-reporter=spec', '--test-reporter=tap', '--test-only'], max: 99 },
  'npm test': { exact: [[], ['--silent']] },
};

// The shapes only a review scenario is granted.
const REVIEW_SHAPES = {
  'git ls-files': { flags: ['-z', '--others', '--exclude-standard'], max: 99 },
};
const REVIEW_TABLE = { ...SHAPES, ...REVIEW_SHAPES };

// The permission rules a review scenario's session needs for the same forms. The guard only refuses
// or lets a call go on to Claude Code's own permission check, which in `-p` refuses a command no
// `--allowedTools` rule covers, so each form the guard grants needs its rule as well: `mkdir` and
// `git rev-parse` are granted to every run already, and the scan's `sh` is named to its mode.
export const REVIEW_GRANTS = ['Bash(git ls-files:*)', 'Bash(sh -s -- mask:*)'];
const GIT_PATH = ['--path-format=absolute', '--git-path'];

// The scan as Masking a diff in secret-scan.md writes it for an agent: its two lines, the second
// carrying the block as a here-document, its opener right after the argument as the block's own
// first line has it or at the end of the line, the block byte for byte as the file holds it. `<skill>` is
// review, `<run-id>` a plain name, and `<base>...HEAD` one of the arguments that section lists: a
// range of plain revisions, `--cached` or `--worktree`. Null when the file does not hold both parts in
// the shape this reads, which refuses the form.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const REV = '[A-Za-z0-9_][A-Za-z0-9_./~^-]*';
export function scanForm(text) {
  const open = "```bash\nsh -s -- staged <<'SCAN'\n";
  const at = text.indexOf(open);
  const close = text.indexOf('\nSCAN\n```', at);
  const lines = text.match(/```bash\n(d=\$\(git rev-parse [^\n]*\n[^\n]*)\n```/);
  if (at < 0 || close < 0 || !lines) return null;
  const two = lines[1];
  if (!['<skill>', '<run-id>', '<base>...HEAD'].every((p) => two.split(p).length === 2)) return null;
  const head = esc(two).replace(esc('<skill>'), 'review').replace(esc('<run-id>'), '[A-Za-z0-9][A-Za-z0-9._-]*')
    .replace(esc('<base>...HEAD'), `(?:--cached|--worktree|${REV}\\.\\.\\.?${REV})(?<opener> <<'SCAN')?`);
  const form = new RegExp(`^${head}(?<tail> <<'SCAN')?\\n${esc(text.slice(at + open.length, close))}\\nSCAN$`);
  return { test: (command) => { const m = form.exec(command); return Boolean(m && !m.groups.opener !== !m.groups.tail); } };
}

const SCAN_NAME = 'the scan block of shared/secret-scan.md';
const NOT_THE_BLOCK = "the scan is allowed only as the two lines of Masking a diff in shared/secret-scan.md with its block as the here-document, opened by <<'SCAN' once, after the argument or at the end of the second line, byte for byte as the file holds them now";
const onlyReviews = (form) => `${form} is allowed only in a review scenario`;

// A call that reads as the scan block: its here-document opener, or the first of its two lines.
function scanVerdict(command, kind, scanFile) {
  if (kind !== REVIEWS) return onlyReviews(SCAN_NAME);
  let form = null;
  try { form = scanForm(readFileSync(scanFile, 'utf8')); } catch { form = null; }
  return form && form.test(command) ? null : NOT_THE_BLOCK;
}

// Values checked by shape, where a value could name a file: a count is a number, and a line range
// for blame is numbers, never a `:<file>` form. Messages, formats and dates are text git never opens.
const VALUE = { '-n': /^\d+$/, '--max-count': /^\d+$/, '-L': /^\d+(,[+-]?\d+)?$/ };

// A path or a revision inside the seed: no option, no absolute path, no home, no `..` segment, in
// any part of a `rev:path` or `a..b` word.
function inside(text, seed) {
  if (!text || text.startsWith('-') || text.startsWith('~')) return false;
  for (const part of text.split(':')) {
    if (isAbsolute(part) || part.split('/').includes('..')) return false;
    const r = relative(seed, resolve(seed, part));
    if (r.split(/[\\/]/)[0] === '..' || isAbsolute(r)) return false;
  }
  return true;
}

export function verdict(command, seed, kind, { scanFile = SCAN_FILE } = {}) {
  const trimmed = command.trim();
  if (trimmed.includes("<<'SCAN'") || trimmed.startsWith('d=$(git rev-parse')) return scanVerdict(trimmed, kind, scanFile);
  const ws = words(trimmed);
  if (!ws || !ws.length) return 'it is not one plain command: a separator, pipe, redirection, substitution, expansion or escape is not allowed';
  const first = ws.slice(0, 2).map((w) => w.text).join(' ');
  if (REVIEW_SHAPES[first] && kind !== REVIEWS) return onlyReviews(first);
  if (first === 'git rev-parse' && ws.slice(2).some((w) => w.text === '--git-path' || w.text.startsWith('--path-format'))) {
    const rest = ws.slice(2).map((w) => w.text);
    const exact = rest.length === 3 && GIT_PATH.every((x, i) => rest[i] === x);
    if (exact && kind !== REVIEWS) return onlyReviews(`git rev-parse ${GIT_PATH.join(' ')}`);
    if (exact) return inside(rest[2], seed) ? null : `${rest[2]} is not a path inside the git directory`;
    if (kind === REVIEWS) return `git rev-parse takes ${GIT_PATH.join(' ')} <path>, in that order and nothing else`;
  }
  const shapes = kind === REVIEWS ? REVIEW_TABLE : SHAPES;
  const name = [2, 1].map((n) => ws.slice(0, n).map((w) => w.text).join(' ')).find((k) => shapes[k]);
  // Name the form refused, not the program: "git is not allowed" for `git ls-files` reads as every
  // git command refused, and a session then skips the ones it is granted.
  if (!name) {
    const program = ws[0].text;
    if (ws.length > 1 && Object.keys(shapes).some((k) => k.startsWith(`${program} `))) {
      return `${program} ${ws[1].text} is not a form of ${program} the bench allows`;
    }
    return `${program} is not a command the bench allows`;
  }
  const shape = shapes[name];
  const rest = ws.slice(name.split(' ').length);
  if (shape.exact) return shape.exact.some((e) => e.length === rest.length && e.every((x, i) => x === rest[i].text)) ? null : `that form of ${name} is not allowed`;
  let positional = 0;
  let message = false;
  let afterDashes = false;
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i].text;
    if (!afterDashes && t === '--') { afterDashes = true; continue; }
    if (!afterDashes && t.startsWith('-')) {
      if (shape.flags.includes(t)) continue;
      if (shape.numeric && /^-\d+$/.test(t)) continue;
      const v = (shape.valued || []).find((f) => t === f || t.startsWith(`${f}=`) || (f.length === 2 && t.startsWith(f) && t.length > 2));
      if (!v) return `${name} does not allow the option ${t}`;
      let value = t === v ? null : t.slice(t.startsWith(`${v}=`) ? v.length + 1 : v.length);
      // A value given as the next word must not look like an option: git lets `--pretty` stand alone,
      // so the word after it may be an option git reads as one, `--output=<path>` among them.
      if (value === null) {
        if (++i >= rest.length) return `${t} needs a value`;
        value = rest[i].text;
        if (value.startsWith('-')) return `${t} takes its value glued with =, or a value that is not an option`;
      }
      if (VALUE[v] && !VALUE[v].test(value)) return `${v} does not take ${value}`;
      if (v === '-m' || v === '--message') message = true;
      continue;
    }
    if (shape.words && !shape.words.includes(t)) return `${name} does not allow ${t}`;
    if (!inside(t, seed)) return `${t} is not a path or revision inside the working directory`;
    if (++positional > shape.max) return `${name} takes at most ${shape.max} path or revision${shape.max === 1 ? '' : 's'}`;
  }
  if (shape.message && !message) return `${name} needs its message as -m`;
  return null;
}

// The copy of secret-scan.md the session's kit was loaded from, beside its seed, where the run has
// one: that is the block the session read, since it is denied this repository. A run with no kit
// copy, the bare arm, falls back to this repository's file.
function scanFileOf(seed) {
  const copy = resolve(seed, '..', 'kit', 'shared', 'secret-scan.md');
  return existsSync(copy) ? copy : SCAN_FILE;
}

function main() {
  const seed = realpathSync(process.argv[2]);
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { input = {}; }
  const why = verdict(String(input?.tool_input?.command || ''), seed, process.argv[3], { scanFile: scanFileOf(seed) });
  if (why) {
    process.stderr.write(`The bench refused this command: ${why}. Run one plain command, with paths relative to the working directory.\n`);
    process.exit(2);
  }
}

// Run as the hook, not when imported. The file path comes from fileURLToPath, which decodes a space
// or a non-ASCII name and gives a Windows drive path, where the URL's own pathname would not.
const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) {
  try { main(); } catch (e) {
    process.stderr.write(`The bench refused this command: its guard failed (${e.message}).\n`);
    process.exit(2);
  }
}
