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
// Usage, as a hook command: node bash-guard.mjs <seed-dir>. Reads the hook's JSON on standard input;
// exit 2 with a reason on standard error refuses the call, exit 0 lets it through.

import { readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function verdict(command, seed) {
  const ws = words(command.trim());
  if (!ws || !ws.length) return 'it is not one plain command: a separator, pipe, redirection, substitution, expansion or escape is not allowed';
  const name = [2, 1].map((n) => ws.slice(0, n).map((w) => w.text).join(' ')).find((k) => SHAPES[k]);
  if (!name) return `${ws[0].text} is not a command the bench allows`;
  const shape = SHAPES[name];
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

function main() {
  const seed = realpathSync(process.argv[2]);
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { input = {}; }
  const why = verdict(String(input?.tool_input?.command || ''), seed);
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
