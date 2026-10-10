// atkx:skill-eval static check: structure, metadata, size, credentials and the security gate of
// one skill directory, printed as JSON for the agent to report.
//
// The answer has to be the same on every run, which is why this is a script and not an
// instruction: the sample skills in tests/skill-eval-fixtures/ are checked against expected.json,
// and a count done by hand drifts. references/static-checks.md says what each check looks for and
// how to do it by hand on a host without Node.
//
// Two promises hold on every path. It opens files for reading only, and it never starts a
// process: a script inside the evaluated skill is read as text and never run. A symbolic link
// whose target is outside the skill is reported and not followed, so its target is never read,
// and that holds for SKILL.md itself.
//
// Usage: node static-check.mjs <skill-dir | skill-dir/SKILL.md>

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DESCRIPTION_LIMIT = 1024;
const LINE_LIMIT = 300;
// Only the repository's own directory is skipped. A dependency tree shipped inside a skill is
// where a harmful script would be put, so node_modules is read like everything else.
const SKIP_DIRS = new Set(['.' + 'git']);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
// Files a skill can run: by extension, by a shebang, or by sitting under scripts/ or bin/.
const SCRIPT_EXT = new Set(['.sh', '.bash', '.zsh', '.fish', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts',
  '.tsx', '.py', '.rb', '.pl', '.php', '.ps1', '.psm1', '.bat', '.cmd', '.vbs', '.lua', '.go', '.rs', '.mk']);
// Files with no script extension that a tool runs commands from.
const SCRIPT_NAMES = new Set(['Makefile', 'makefile', 'GNUmakefile', 'package.json', 'Dockerfile', 'justfile', 'Justfile']);
const SCRIPT_DIRS = new Set(['scripts', 'bin']);
const MARKDOWN_EXT = new Set(['.md', '.mdx', '.markdown']);
// Binary formats a machine executes, by extension or by their first bytes.
const BINARY_EXT = new Set(['.exe', '.dll', '.so', '.dylib', '.node', '.wasm', '.jar', '.class', '.com']);
const EXECUTABLE_MAGIC = [[0x7f, 0x45, 0x4c, 0x46], [0x4d, 0x5a], [0xcf, 0xfa, 0xed, 0xfe], [0xce, 0xfa, 0xed, 0xfe],
  [0xfe, 0xed, 0xfa, 0xcf], [0xca, 0xfe, 0xba, 0xbe], [0x00, 0x61, 0x73, 0x6d]];
// Images, fonts and documents by their first bytes. Their executable bit is ignored, since it is set
// on every file of a Windows drive mounted in WSL and of a zip extracted on Windows.
const DATA_MAGIC = [[0x89, 0x50, 0x4e, 0x47], [0xff, 0xd8, 0xff], [0x47, 0x49, 0x46, 0x38], [0x25, 0x50, 0x44, 0x46],
  [0x52, 0x49, 0x46, 0x46], [0x00, 0x00, 0x01, 0x00], [0x42, 0x4d], [0x77, 0x4f, 0x46, 0x46], [0x77, 0x4f, 0x46, 0x32],
  [0x00, 0x01, 0x00, 0x00], [0x4f, 0x54, 0x54, 0x4f]];
const startsWith = (buf, sigs) => sigs.some((m) => m.every((b, i) => buf[i] === b));
const hasExecBit = (f) => {
  if (process.platform === 'win32') return false;
  try { return (statSync(f).mode & 0o111) !== 0; } catch { return false; }
};
const isExecutableBinary = (buf, f) => BINARY_EXT.has(extname(f).toLowerCase())
  || startsWith(buf, EXECUTABLE_MAGIC)
  || (!startsWith(buf, DATA_MAGIC) && hasExecBit(f));

// ---------------------------------------------------------------------------------------------
// Frontmatter: a small YAML reader, enough for skill frontmatter. Top-level keys only; a nested
// map or list is kept as raw text, because no check here needs more than its presence.

function unquote(v) {
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try { return JSON.parse(v); } catch { return v.slice(1, -1); }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

function foldLines(lines, literal) {
  // Folded (>) joins lines with a space and keeps blank lines as newlines; literal (|) keeps
  // every newline. Both end with one newline (clip), which callers strip when measuring.
  if (literal) return lines.join('\n').replace(/\n+$/, '') + '\n';
  let out = '';
  let prevBlank = true;
  for (const l of lines) {
    if (l === '') { out += '\n'; prevBlank = true; continue; }
    out += (prevBlank ? '' : ' ') + l;
    prevBlank = false;
  }
  return out.replace(/\n+$/, '') + '\n';
}

// A flow list split on commas outside quotes, so ["a, b", c] stays two items.
function splitFlow(inner) {
  const items = [];
  let cur = '';
  let q = null;
  for (const ch of inner) {
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === ',') { items.push(cur); cur = ''; continue; }
    cur += ch;
  }
  items.push(cur);
  return items.map((s) => unquote(s.trim())).filter(Boolean);
}

// A quoted value up to its closing quote, so a trailing comment is cut and a # inside stays text.
function quotedPart(raw) {
  const q = raw[0];
  for (let i = 1; i < raw.length; i++) {
    if (q === '"' && raw[i] === '\\') { i++; continue; }
    if (raw[i] === q) {
      if (q === "'" && raw[i + 1] === "'") { i++; continue; }
      const after = raw.slice(i + 1).trim();
      return after === '' || after.startsWith('#') ? raw.slice(0, i + 1) : raw;
    }
  }
  return raw;
}

export function parseFrontmatter(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0].trimEnd() !== '---') return { ok: false, error: 'SKILL.md does not open with a --- line' };
  const end = lines.findIndex((l, i) => i > 0 && l.trimEnd() === '---');
  if (end < 0) return { ok: false, error: 'no closing --- line' };
  const body = lines.slice(1, end);
  const data = {};
  const keyLines = {};
  let i = 0;
  while (i < body.length) {
    const line = body[i];
    if (line.trim() === '' || line.trimStart().startsWith('#')) { i++; continue; }
    const m = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(line);
    // The line number only: echoing the line would put text of an unknown file into the report.
    if (!m) return { ok: false, error: `line ${i + 2} is not a top-level key` };
    const key = m[1];
    const raw = (m[2] || '').trim();
    // A comment is cut only after an unquoted value; inside quotes a # is text.
    const rest = /^["']/.test(raw) ? quotedPart(raw) : raw.replace(/\s+#.*$/, '');
    keyLines[key] = i + 2;
    i++;
    const block = [];
    // A block is the indented lines below the key, and a list written at column 0 under it.
    while (i < body.length && (body[i].trim() === '' || /^\s/.test(body[i]) || /^-(?:\s|$)/.test(body[i]))) block.push(body[i++]);
    while (block.length && block[block.length - 1].trim() === '') block.pop();
    const indent = Math.min(...block.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length), Infinity);
    const stripped = block.map((l) => (l.trim() === '' ? '' : l.slice(indent)));
    if (/^[>|][+-]?$/.test(rest)) {
      let v = foldLines(stripped, rest.startsWith('|'));
      if (rest.endsWith('-')) v = v.replace(/\n$/, '');
      data[key] = v;
    } else if (rest === '') {
      data[key] = block.length ? { raw: stripped.join('\n') } : null;
    } else if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = splitFlow(rest.slice(1, -1));
    } else if (block.length) {
      data[key] = unquote([rest, ...stripped.map((l) => l.trim())].join(' ').replace(/\s+/g, ' ').trim());
    } else {
      data[key] = unquote(rest);
    }
  }
  return { ok: true, data, keyLines, endLine: end + 1 };
}

// ---------------------------------------------------------------------------------------------
// Reading. Every read goes through here, so an unreadable file is a finding and never a crash,
// and a UTF-16 file is decoded rather than mistaken for binary.

function decode(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) return { text: buf.subarray(2).toString('utf16le'), encoding: 'UTF-16' };
  if (buf[0] === 0xfe && buf[1] === 0xff) {
    const swapped = Buffer.from(buf.subarray(2));
    swapped.swap16();
    return { text: swapped.toString('utf16le'), encoding: 'UTF-16' };
  }
  return { text: buf.toString('utf8'), encoding: null };
}

export const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// A file's text, or null when it is binary; a UTF-16 file is text.
function textOf(buf) {
  const d = decode(buf);
  return isBinary(buf) && !d.encoding ? null : d.text;
}

function isBinary(buf) {
  if (buf.includes(0)) return true;
  // Control bytes other than tab, newlines and ESC (colour codes), as a share of the head.
  const head = buf.subarray(0, 4096);
  let ctrl = 0;
  for (const b of head) if ((b < 9 || (b > 13 && b < 32)) && b !== 0x1b) ctrl++;
  return head.length > 0 && ctrl / head.length > 0.05;
}

export function within(root, p) {
  const r = relative(root, p);
  return r === '' || (r.split(sep)[0] !== '..' && !isAbsolute(r));
}

// A file's real path, or null when it is a link that leaves `root` or points nowhere.
function insideTarget(p, realRoot) {
  try {
    const target = realpathSync(p);
    return within(realRoot, target) ? target : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Walking the skill directory. A link out of the skill is a finding, never a read. A link to a
// directory inside the skill is walked by the link's own path, since that is the path SKILL.md
// names and a harness runs. A file reached by several paths is read once, and every path that
// reaches it is kept, since each one is a name a harness may run it by. Every link that stays
// inside is listed in `inner`, a link to a directory already walked included.

function walk(root, problems) {
  const files = [];
  const links = [];
  const inner = [];
  const realRoot = realpathSync(root);
  const seen = new Set();
  const aliases = new Map();
  const addFile = (p) => {
    let real;
    try { real = realpathSync(p); } catch { real = p; }
    if (!aliases.has(real)) { aliases.set(real, []); files.push(real); }
    aliases.get(real).push(p);
  };
  const visit = (dir) => {
    let real;
    try { real = realpathSync(dir); } catch { real = dir; }
    if (seen.has(real)) return;
    seen.add(real);
    let names;
    try { names = readdirSync(dir).sort(); } catch (e) { problems.push({ file: relative(root, dir) || '.', detail: e.code || e.message }); return; }
    for (const name of names) {
      if (SKIP_DIRS.has(name) && dir === root) continue;
      const p = join(dir, name);
      let st;
      try { st = lstatSync(p); } catch (e) { problems.push({ file: relative(root, p), detail: e.code || e.message }); continue; }
      if (st.isSymbolicLink()) {
        if (!insideTarget(p, realRoot)) { links.push(relative(root, p)); continue; }
        inner.push(p);
        const t = statSync(p);
        if (t.isDirectory()) visit(p);
        else if (t.isFile()) addFile(p);
        continue;
      }
      if (st.isDirectory()) visit(p);
      else if (st.isFile()) addFile(p);
    }
  };
  visit(root);
  return { files: files.map((real) => aliases.get(real)), links, inner };
}

// ---------------------------------------------------------------------------------------------
// Patterns. Written with character classes and joined at run time so that this file, which is
// itself a script the gate reads, does not match its own patterns. They are a list, and a list
// misses what nobody wrote into it: references/static-checks.md says so to the reader.

// A prefixed token keeps its prefix, which says what kind it is; anything else, a password above
// all, keeps nothing, since four characters of an eight-character password is half of it.
const TOKEN_PREFIX = /^(?:sk-|gh[pousr]_|github_pat_|AKIA|xox[baprs]-)/;
const mask = (v) => (TOKEN_PREFIX.exec(v)?.[0] ?? '') + '********';
const secretOf = (m) => m.groups?.v ?? m[1] ?? m[0];
// Every credential on the value is masked, not only the first one found.
const maskIfSecret = (v) => {
  let out = v;
  for (const re of CREDENTIALS_ALL) {
    for (const m of out.matchAll(re)) out = out.replace(m[0], m[0].replace(secretOf(m), mask(secretOf(m))));
  }
  return out;
};

const CREDENTIALS = [
  { kind: 'private-key', re: /-{5}BEGIN [A-Z ]*PRIVATE KEY-{5}/ },
  { kind: 'api-token', re: /\b(sk-[A-Za-z0-9_-]{20,})/ },
  { kind: 'github-token', re: /\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{22,})/ },
  { kind: 'aws-key', re: /\b(AKIA[0-9A-Z]{16})\b/ },
  { kind: 'slack-token', re: /\b(xox[baprs]-[A-Za-z0-9-]{10,})/ },
  // A literal assigned to a secret-named key: quoted after = or :, or in a dotenv-style line, bare
  // or quoted. A value read from the environment or a call, process.env.API_KEY or getpass(), is
  // not a literal.
  {
    kind: 'password-assignment',
    re: /\b(?:pass(?:word|wd)?|secret|api[_-]?key|access[_-]?token)\b["']?\s*[:=]\s*["'](?<v>[^\s"'`<>${}]{8,})["']/i,
  },
  {
    kind: 'password-assignment',
    re: /^\s*(?:export\s+)?[A-Z0-9_]*(?:PASSWORD|PASSWD|SECRET|API_KEY|ACCESS_TOKEN)[A-Z0-9_]*\s*=\s*(["']?)(?<v>[^\s"'`<>${}()]{8,})\1\s*$/,
  },
];
const CREDENTIALS_ALL = CREDENTIALS.map((c) => new RegExp(c.re.source, c.re.flags + 'g'));

const word = (s) => s.split('~').join('');
// The command-line downloaders are named on their own, since piping into a shell needs one of them.
const DOWNLOADERS = ['c~u~r~l', 'w~g~e~t'].map(word);
const PS_DOWNLOADERS = ['i~w~r', 'i~r~m', 'Invoke-Web~Request', 'Invoke-Rest~Method'].map(word);
const FETCHERS = [...DOWNLOADERS, ...PS_DOWNLOADERS, `${word('f~e~t~c~h')}(?=\\s*\\()`,
  ...['a~x~i~o~s', 'u~r~l~l~i~b', 'Net\\.Web~Client', 'Download~String', 'Download~File'].map(word),
  'requests\\.(?:get|post|put|request)', 'https?\\.(?:get|request)', `${word('r~e~q~u~i~r~e')}\\s*\\(\\s*["'](?:node:)?https?["']`,
  'https?\\.client', 'HTTPS?Connection', ...['s~c~p', 'r~s~y~n~c', 's~f~t~p'].map(word)];
const NETWORK = new RegExp(`(?:^|[^\\w.-])(?:${FETCHERS.join('|')})\\b`, 'i');
// Raw sockets name their host as an argument.
const SOCKET_TOOLS = ['n~c', 'n~c~a~t', 's~o~c~a~t'].map(word);
const SOCKETS = new RegExp(`(?:^|[^\\w.-])(?:${SOCKET_TOOLS.join('|')})\\s+\\S`, 'i');
// git's own transport subcommands talk to the repository's remotes, unless a URL or host follows.
const GIT_REMOTE = /\bgit\s+(?:fetch|pull|push|clone|ls-remote|remote)\b/i;
const URL_TOKEN = new RegExp('\\b[a-z][a-z0-9+.-]*:\\/' + '\\/[^\\s"\'`<>)]+', 'gi');
const HOST = '(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,}|\\d{1,3}(?:\\.\\d{1,3}){3}';
// A file name is not a host: notes.txt given to -T is the upload, not where it goes.
const FILE_TLD = /\.(?:txt|md|json|ya?ml|sh|js|mjs|ts|py|rb|html?|csv|log|tar|gz|tgz|zip|xml|conf|cfg|ini|env|pem|key|crt|png|jpe?g|gif|svg|pdf|lock|toml|out|bin|tmp)$/i;
// A bare host argument to a downloader, host.tld with an optional port and path.
const BARE_HOST = new RegExp(`(?:${DOWNLOADERS.join('|')})\\b([^|;&\\n]*)`, 'i');
const BARE_ARG = new RegExp(`(?:^|\\s)["']?(${HOST})(?::\\d+)?(?=[/"'\\s]|$)`, 'g');
// user@host: and host: as the copy tools write them, and the host a remote shell session opens.
const REMOTE_SHELL = new RegExp(`\\b(?:${['s~c~p', 'r~s~y~n~c', 's~f~t~p', 's~s~h'].map(word).join('|')})\\b[^\\n]*?\\s(?:[\\w.-]+@)?(${HOST})(?=[:\\s]|$)`, 'i');
const SOCKET_HOST = new RegExp(`(?:${SOCKET_TOOLS.slice(0, 2).join('|')})\\s+(?:-\\S+\\s+(?:\\d+\\s+)?)*([A-Za-z0-9][\\w.-]*)`, 'i');
const SOCAT_HOST = /\b(?:TCP|UDP|SSL|OPENSSL)[46]?(?:-CONNECT)?:([^:\s]+):/gi;
// A shell, by name or by path, behind an optional sudo, env, xargs, exec, command or busybox.
const SHELLS = ['sh', 'bash', 'zsh', 'dash', 'ksh', 'python3?', 'node', 'perl', 'ruby', 'iex', 'Invoke-Expression', 'pwsh', 'powershell'];
const SHELL = `(?:(?:sudo|env|xargs|exec|command|busybox)(?:\\s+-\\S+)*\\s+)*(?:\\S*\\/)?(?:${SHELLS.join('|')})\\b`;
const DECODERS = 'base64|atob|Buffer\\.from|fromCharCode|decode';
const DL = `(?:${DOWNLOADERS.join('|')})\\b`;
const REMOTE_EXEC = [
  // a download piped, through any number of pipes, into a shell
  { re: new RegExp(`(?:${[...DOWNLOADERS, ...PS_DOWNLOADERS].join('|')})\\b[^\\n]*\\|\\s*${SHELL}`, 'i') },
  // a download run through command or process substitution, $(...) or <(...)
  { re: new RegExp(`[$<]\\(\\s*${DL}`, 'i') },
  // and through backticks, which in Markdown open a code span: only in a script or a fenced block
  { re: new RegExp(`\`\\s*${DL}`, 'i'), shellOnly: true },
  // PowerShell's own: the expression cmdlet given a web request or a WebClient download in brackets
  { re: new RegExp(`(?:\\biex|Invoke-Expression)\\s*\\(+\\s*(?:${PS_DOWNLOADERS.join('|')}|New-Object\\s+Net\\.WebClient)\\b`, 'i') },
  // a download saved to a file, by -o or a redirect, and then run, sourced, or made executable
  { re: new RegExp(`${DL}[^\\n]*?(?:\\s-(?:[A-Za-z]*[oO]|-output)\\s*|>>?\\s*)\\S+[^\\n]*?(?:&&|;|\\|\\|)\\s*(?:(?:sudo\\s+)?(?:${SHELL}|source|\\.)\\s+\\S|\\.\\/|chmod\\s+\\S*x|[~/]\\S*\\s*(?:$|[;&|]))`, 'i') },
  // encoded content decoded straight into a shell
  { re: new RegExp(`\\bbase64\\s+(?:-[A-Za-z]*[dD]\\b|--decode)[^\\n]*\\|\\s*${SHELL}`, 'i') },
  // decoded or fetched content evaluated: a call form, never the word inside a name such as skill-eval
  { re: new RegExp(`(?<![\\w:-])${word('e~v~a~l')}\\s*(?:\\(|\\s+["'$])[^\\n]{0,60}?(?:${DOWNLOADERS.join('|')}|${word('f~e~t~c~h')}|${DECODERS})`, 'i') },
  { re: new RegExp(`(?<![\\w.])(?:new\\s+${word('F~u~n~c~t~i~o~n')}|${word('e~x~e~c')}(?:Sync|File|FileSync)?|spawnSync)\\s*\\([^\\n]{0,60}?(?:${DECODERS})`, 'i') },
];
const SAFETY_OFF = [
  /\bauto[- ]?approv(?:e|es|ed|ing|al)\b/gi,
  /\bdangerously[-_ ](?:skip[-_ ]permissions|bypass[-_ ]approvals)\b/gi,
  /\bbypass[-_ ]?permissions\b/gi,
  // switching a check off, but not skipping the setup of one
  /\b(?:dis[a]ble|turn\s+off|switch\s+off|skip)\s+(?:the\s+|all\s+|every\s+)?(?:safety|sandbox(?:ing)?|permission|approval)s?\b(?!\s+(?:setup|set-up|installation|install|configuration|config)\b)/gi,
  /\bapprove\s+(?:all|every)\s+(?:tool\s+)?(?:calls?|commands?|actions?)\b/gi,
  /--yo[l]o\b/g,
  // Codex's own: the bypass flag, the unsandboxed mode, full-auto, and never asking
  /\bdanger-full-access\b/gi,
  new RegExp('--full' + '-auto\\b', 'g'),
  /--ask-for-approval[ =]never\b/g,
  /\bacceptEdits\b/g,
];
// A sentence forbidding the thing is not an instruction to do it, but only when the negation governs
// the verb, as "never" or "nothing gets" right before the match does. "Don't forget to" and "not
// optional to" before it instruct, which is why the words allowed between the negation and the
// match are a short list and not any three words.
const NEGATION = /\b(?:never|not|don't|doesn't|do\s+not|does\s+not|must\s+not|mustn't|cannot|can't|should\s+not|shouldn't|nothing|nobody|without)\s+(?:(?:ever|be|been|is|are|get|gets|got|used|to|you|we|it|they|the|just|automatically|accidentally|run|use|pipe|execute|call|type|paste|copy|try)\s+)*[`'"]?$/i;
const BASE64_RUN = /[A-Za-z0-9+/=]{201,}/;
const CODE_SPAN = /`([^`\s]+)`/g;
const LINK_TARGET = /\]\(([^)\s]+)\)/g;
const ABSOLUTE = /^(?:~[\\/]|\/(?:home|Users|root|etc|usr|var|opt|mnt|srv|tmp|private|Volumes|Library|workspace|proc)[\\/]|[A-Za-z]:[\\/])/;
const LONG_LINE = 1000;
// Where an interpreter or a device a hook command names lives, rather than code of its own.
const SYSTEM_PATH = /^(?:\/(?:bin|sbin|dev|usr\/bin|usr\/sbin|usr\/local\/bin|opt\/homebrew\/bin)\/|[A-Za-z]:[\\/]Windows[\\/])/i;
const FENCE = /^\s*(`{3,}|~{3,})/;
// A comment line in a script, where a URL is a reference for the reader and not a call.
const COMMENT = /^\s*(?:#|\/\/|\/\*|\*|--\s|REM\b|::)/i;

function negated(line, index) {
  return NEGATION.test(line.slice(0, index).split(/[.;:!?,]/).pop());
}

// Every match on the line is examined, so a negated one does not hide the instruction after it.
// In a file a skill can run there is no prose, and nothing is negated.
function safetyOff(line, prose) {
  for (const r of SAFETY_OFF) {
    for (const m of line.matchAll(r)) if (!(prose && negated(line, m.index))) return true;
  }
  return false;
}

// In prose a download-and-run that the sentence forbids is not an instruction; in a script it is.
// `shell` is false for Markdown prose outside a fenced block, where a backtick opens a code span.
function remoteExec(line, prose, shell) {
  const l = line.replace(/[\u2028\u2029\u0085]/g, ' ');
  for (const { re, shellOnly } of REMOTE_EXEC) {
    if (shellOnly && !shell) continue;
    const m = re.exec(l);
    if (m && !(prose && negated(l, m.index))) return true;
  }
  return false;
}

// The parts of a line a shell runs one after another, so a git command beside a download does not
// take the download with it.
const segments = (line) => line.split(/;|&&|\|\||\|/);

function hostsOf(line) {
  const hosts = new Set();
  for (const m of line.matchAll(URL_TOKEN)) {
    const token = m[0].replace(/[.,;:!?'")\]]+$/, '');
    try { hosts.add(new URL(token).hostname.toLowerCase().replace(/^\[|\]$/g, '')); } catch { /* not a URL */ }
  }
  const noUrls = line.replace(URL_TOKEN, ' ');
  for (const seg of segments(noUrls)) {
    const args = BARE_HOST.exec(seg)?.[1];
    if (args) for (const m of args.matchAll(BARE_ARG)) if (!FILE_TLD.test(m[1])) hosts.add(m[1].toLowerCase());
    const remote = REMOTE_SHELL.exec(seg)?.[1];
    if (remote && !FILE_TLD.test(remote)) hosts.add(remote.toLowerCase());
    const sock = SOCKET_HOST.exec(seg)?.[1];
    if (sock && SOCKETS.test(seg)) hosts.add(sock.toLowerCase());
    for (const m of seg.matchAll(SOCAT_HOST)) hosts.add(m[1].toLowerCase());
  }
  return [...hosts].filter(Boolean);
}

// A line that calls out: a fetcher or a socket in any part of it, a git transport command only when
// a URL or a host follows it, and, in a file a skill can run, any URL outside a comment.
function networkCall(line, runnable) {
  const parts = segments(line);
  const fetches = parts.some((s) => NETWORK.test(s) && !GIT_REMOTE.test(s));
  const gitOut = parts.some((s) => GIT_REMOTE.test(s) && hostsOf(s).length > 0);
  const socket = parts.some((s) => SOCKETS.test(s));
  const url = runnable && !COMMENT.test(line) && hostsOf(line.match(URL_TOKEN)?.join(' ') ?? '').length > 0;
  return { any: fetches || gitOut || socket || url };
}

// Commands that download a package and run it, so the code that runs is fetched at run time and was
// never in the plugin. Checked in what a plugin's processes run, not in a skill's own scripts. `create`
// and `init` with a package name run that package's create- script.
const COMMAND_START = `(?:^|[\\s;&|(\`'"/\\\\=])`;
const PACKAGE_MANAGERS = ['n~p~m', 'y~a~r~n', 'p~n~p~m', 'b~u~n'].map(word).join('|');
const PACKAGE_RUNNER = new RegExp(`${COMMAND_START}(?:(?:${['n~p~x', 'p~n~p~x', 'b~u~n~x', 'u~v~x', 'u~v\\s+t~o~o~l\\s+r~u~n', 'p~n~p~m\\s+d~l~x',
  'y~a~r~n\\s+d~l~x', 'b~u~n\\s+x', 'n~p~m\\s+x', 'p~i~p~x\\s+r~u~n', 'n~p~m\\s+e~x~e~c'].map(word).join('|')})\\b`
  + `|(?:${PACKAGE_MANAGERS})\\s+(?:${['c~r~e~a~t~e', 'i~n~i~t'].map(word).join('|')})\\s+(?=[\\w@]))`, 'i');
// Commands that run a script the working directory defines, a package.json script, a Makefile target
// or a module found on the working directory first, which no command line names. Outside the plugin
// that is code the gate never read, so they pass only when the line moves into the plugin first.
const WORKDIR_RUNNER = new RegExp(`${COMMAND_START}(?:(?:${PACKAGE_MANAGERS})\\s+(?:run|run-script|test|start|stop|restart)`
  + `|${['m~a~k~e', 'j~u~s~t', 'r~a~k~e', 'd~e~n~o\\s+t~a~s~k', 'p~y~t~h~o~n[\\d.]*\\s+-m'].map(word).join('|')})\\b`, 'i');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const names = (text, host) => new RegExp(`(?<![\\w.-])${escapeRe(host)}(?![\\w-])`, 'i').test(text);

// ---------------------------------------------------------------------------------------------

export function findRoot(start, marker) {
  let d = resolve(start);
  for (;;) {
    if (existsSync(join(d, marker))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}

// The skill as the trigger mode needs it: its name, and the plugin that namespaces it. A plugin
// counts only when the skill sits at <plugin>/skills/<name>, the place a harness loads it from.
export function describeSkill(dir) {
  const root = resolve(dir);
  const skillFile = join(root, 'SKILL.md');
  let name = null;
  let skillLinksOut = false;
  if (!insideTarget(skillFile, realpathSync(root))) skillLinksOut = true;
  else {
    try {
      const fm = parseFrontmatter(decode(readFileSync(skillFile)).text);
      name = fm.ok && typeof fm.data.name === 'string' ? fm.data.name : null;
    } catch { name = null; }
  }
  const candidate = dirname(dirname(root));
  const pluginRoot = basename(dirname(root)) === 'skills' && existsSync(join(candidate, '.claude-plugin', 'plugin.json'))
    ? candidate : null;
  let manifest = null;
  let manifestError = null;
  if (pluginRoot) {
    // The parser's message quotes the input, which may hold a token; only its position is kept.
    try { manifest = JSON.parse(readFileSync(join(pluginRoot, '.claude-plugin', 'plugin.json'), 'utf8')); } catch (e) {
      manifestError = `not valid JSON${/position \d+/.exec(e.message) ? ` at ${/position \d+/.exec(e.message)[0]}` : ''}`;
    }
  }
  const plugin = manifest?.name || null;
  return {
    path: root, name, plugin, fullName: plugin && name ? `${plugin}:${name}` : name,
    pluginRoot, manifestError, skillLinksOut,
    // A dependency is a plugin beside this one, named plainly: a name that is a path or not a string
    // would let a manifest load any directory.
    dependencies: Array.isArray(manifest?.dependencies)
      ? manifest.dependencies.filter((d) => typeof d === 'string' && /^(?!\.{1,2}$)[\w.-]+$/.test(d)) : [],
    repoRoot: findRoot(root, '.' + 'git'),
  };
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: node static-check.mjs <skill-dir | skill-dir/SKILL.md>');
    process.exit(2);
  }
  let root = resolve(arg);
  if (basename(root) === 'SKILL.md' && existsSync(root)) root = dirname(root);
  if (!existsSync(join(root, 'SKILL.md')) && !lstatOk(join(root, 'SKILL.md'))) {
    console.log(`No SKILL.md in ${root}: nothing to evaluate.`);
    process.exit(2);
  }
  console.log(JSON.stringify(evaluate(root), null, 2));
}

// The whole static check of one skill directory, returned rather than printed, so the trigger
// runner can refuse a skill that fails it.
export function evaluate(dir) {
  const root = resolve(dir);
  const skillFile = join(root, 'SKILL.md');
  const checks = [];
  const add = (c) => checks.push(c);
  const skill = describeSkill(root);
  const { pluginRoot, plugin, repoRoot } = skill;
  const realRoot = realpathSync(root);
  const finish = (creds, gate) => {
    const count = (s) => checks.filter((c) => c.status === s).length;
    return {
      skill: { path: root, name: skill.name, plugin, fullName: skill.fullName, pluginRoot, repoRoot },
      checks,
      summary: { passed: count('pass'), failed: count('fail'), info: count('info'), credentials: creds, gate },
    };
  };

  // A SKILL.md that is a link out of the skill is reported and never opened: nothing else about
  // the skill can be read without reading it.
  if (skill.skillLinksOut) {
    add({ id: 'symlink-outside', status: 'fail', value: 'SKILL.md', detail: 'SKILL.md links out of the skill; not followed, target not read', file: 'SKILL.md' });
    add({ id: 'gate-unreadable', kind: 'unreadable', status: 'fail', file: 'SKILL.md', line: 1, detail: 'the gate could not run: SKILL.md is not read' });
    return finish(0, 1);
  }
  if (skill.manifestError) add({ id: 'plugin-manifest', status: 'fail', file: relative(root, join(pluginRoot, '.claude-plugin', 'plugin.json')), detail: `the plugin manifest does not parse: ${skill.manifestError}` });

  let raw;
  try { raw = readFileSync(skillFile); } catch (e) {
    add({ id: 'unreadable', status: 'fail', file: 'SKILL.md', detail: e.code || e.message });
    add({ id: 'gate-unreadable', kind: 'unreadable', status: 'fail', file: 'SKILL.md', line: 1, detail: 'the gate could not run: SKILL.md cannot be read' });
    return finish(0, 1);
  }
  const { text, encoding } = decode(raw);
  if (encoding) add({ id: 'encoding', status: 'fail', file: 'SKILL.md', value: encoding, detail: 'harnesses read SKILL.md as UTF-8' });
  const fm = parseFrontmatter(text);
  const dirName = basename(root);

  // Structure and metadata (AC 1.1)
  add({ id: 'frontmatter', status: fm.ok ? 'pass' : 'fail', value: fm.ok ? null : fm.error, file: 'SKILL.md', line: 1 });
  const data = fm.ok ? fm.data : {};
  const name = typeof data.name === 'string' ? data.name : null;
  add({ id: 'name-present', status: name ? 'pass' : 'fail', value: name, file: 'SKILL.md', line: fm.keyLines?.name ?? 1 });
  if (name) {
    add({ id: 'name-format', status: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ? 'pass' : 'fail', value: name, file: 'SKILL.md', line: fm.keyLines.name });
    add({ id: 'name-matches-dir', status: name === dirName ? 'pass' : 'fail', value: name, detail: `directory is ${dirName}`, file: 'SKILL.md', line: fm.keyLines.name });
  }
  const desc = typeof data.description === 'string' ? data.description.replace(/\n$/, '') : null;
  add({ id: 'description-present', status: desc ? 'pass' : 'fail', value: desc ? null : 'missing', file: 'SKILL.md', line: fm.keyLines?.description ?? 1 });
  if (desc) {
    const n = Array.from(desc).length;
    add({ id: 'description-length', status: n <= DESCRIPTION_LIMIT ? 'pass' : 'fail', value: n, limit: DESCRIPTION_LIMIT, file: 'SKILL.md', line: fm.keyLines.description });
  }
  const lineCount = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  add({ id: 'line-count', status: lineCount <= LINE_LIMIT ? 'pass' : 'fail', value: lineCount, limit: LINE_LIMIT, file: 'SKILL.md' });

  // Frontmatter keys only some harnesses read (AC 1.5): information, never a failure
  const keyTable = loadKeyTable();
  for (const key of Object.keys(data)) {
    if (key === 'name' || key === 'description') continue;
    const readers = keyTable.get(key) || [];
    const all = ['Claude Code', 'Codex', 'Cursor'].every((h) => readers.includes(h));
    if (all) continue;
    add({
      id: 'frontmatter-key', status: 'info', value: key, harnesses: readers,
      detail: readers.length ? `${key}: read by ${readers.join(', ')} only` : `${key}: read by none of Claude Code, Codex, Cursor`,
      file: 'SKILL.md', line: fm.keyLines[key],
    });
  }

  // Cited references/, scripts/, assets/ paths exist (AC 1.1)
  const cite = /(?<![\w./-])(?:skills\/([\w-]+)\/)?((?:references|scripts|assets)\/[\w./-]*[\w-])/g;
  const missing = [];
  let cited = 0;
  text.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(cite)) {
      cited++;
      const base = m[1] && pluginRoot ? join(pluginRoot, 'skills', m[1]) : root;
      const target = join(base, m[2]);
      if (!within(pluginRoot || root, target)) continue; // the outside-path check reports it
      if (!existsSync(target)) missing.push({ path: m[0], line: i + 1 });
    }
  });
  if (missing.length) for (const x of missing) add({ id: 'cited-path', status: 'fail', value: maskIfSecret(x.path), detail: 'cited but not in the skill', file: 'SKILL.md', line: x.line });
  else add({ id: 'cited-paths', status: 'pass', value: cited, file: 'SKILL.md' });

  // Walk every file once for the remaining checks
  const problems = [];
  const { files: reached, links } = walk(root, problems);
  const files = reached.map((paths) => paths[0]);
  if (links.length) for (const l of links) add({ id: 'symlink-outside', status: 'fail', value: l, detail: 'link leaves the skill; not followed, target not read', file: l });
  else add({ id: 'symlinks', status: 'pass', value: 0 });

  // Read each file once. A file that cannot be read is a finding of its own.
  const texts = new Map();
  for (const f of files) {
    try {
      const buf = readFileSync(f);
      texts.set(f, textOf(buf));
    } catch (e) { problems.push({ file: relative(root, f), detail: e.code || e.message }); }
  }

  // Paths outside the skill (AC 1.4), in every Markdown file
  const outside = [];
  const allowed = pluginRoot || root;
  for (const f of files.filter((p) => MARKDOWN_EXT.has(extname(p).toLowerCase()) && typeof texts.get(p) === 'string')) {
    const rel = relative(root, f);
    texts.get(f).split('\n').forEach((l, i) => {
      const spans = [...l.matchAll(CODE_SPAN), ...l.matchAll(LINK_TARGET)].map((m) => m[1]);
      for (const s of spans) {
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) continue;
        if (/\.\.\.|[<>*{}$]/.test(s)) continue; // a placeholder or a glob, not a file
        if (ABSOLUTE.test(s)) outside.push({ file: rel, line: i + 1, value: s });
        else if (s.split(/[\\/]/).includes('..') && !within(allowed, resolve(dirname(f), s))) outside.push({ file: rel, line: i + 1, value: s });
      }
    });
  }
  // A path SKILL.md cites outside a code span that climbs out of the skill
  text.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(cite)) {
      const base = m[1] && pluginRoot ? join(pluginRoot, 'skills', m[1]) : root;
      if (!within(allowed, join(base, m[2])) && !outside.some((o) => o.file === 'SKILL.md' && o.line === i + 1)) {
        outside.push({ file: 'SKILL.md', line: i + 1, value: m[0] });
      }
    }
  });
  if (outside.length) for (const o of outside) add({ id: 'outside-path', status: 'fail', value: maskIfSecret(o.value), detail: 'cites a file outside the skill, which an install does not copy', file: o.file, line: o.line });
  else add({ id: 'outside-paths', status: 'pass', value: 0 });

  // Credentials (AC 1.3) in every text file. The gate (AC 1.7, 1.8): every file a skill can run
  // gets every pattern, every Markdown file the remote-exec and safety-off patterns, and no path
  // is exempt (AC 9.4)
  let creds = 0;
  let gate = 0;
  // A file or directory that cannot be read is one the gate did not read: a gate failure, not a skip.
  for (const p of problems) {
    gate++;
    add({ id: 'gate-unreadable', kind: 'unreadable', status: 'fail', file: p.file, line: 1, detail: `cannot be read (${p.detail}), so the gate did not read it` });
  }
  const declared = declaredHosts(text);
  const items = reached.filter((paths) => texts.has(paths[0])).map((paths) => ({ paths, content: texts.get(paths[0]) }));
  const found = gateItems(items, { root, skillFile, declared, add });
  creds += found.creds;
  gate += found.gate;
  if (!creds) add({ id: 'credentials', status: 'pass', value: 0 });
  if (!gate) add({ id: 'gate', status: 'pass', value: 0 });
  return finish(creds, gate);
}

// Hosts are declared by the skill's own SKILL.md, the one a harness reads; a nested one declares
// nothing, and neither does a line of it that is itself a call, or two calls would declare each other.
const declaredHosts = (skillText) => skillText.split('\n').filter((l) => !networkCall(l, false).any).join('\n');

// The credentials in one text, one finding per line at most, each value masked.
function credentialsIn(text, rel, add) {
  let n = 0;
  text.split('\n').forEach((l, i) => {
    for (const c of CREDENTIALS) {
      const m = c.re.exec(l);
      if (m) { n++; add({ id: 'credential', kind: c.kind, status: 'fail', file: rel, line: i + 1, value: c.kind === 'private-key' ? m[0] : mask(secretOf(m)) }); break; }
    }
  });
  return n;
}

// The credential and gate checks over a list of files, each { paths, content }, where content is
// null for binary. An item may carry runnable: true, for text a harness runs that is not a file of
// its own, such as the command line of a hook.
function gateItems(items, { root, skillFile, declared, add, packageRunners = false, credentials = true }) {
  let creds = 0;
  let gate = 0;
  for (const item of items) {
    const { paths, content } = item;
    const f = paths[0];
    // A file is judged by the strongest of the names it is reached by: run by one, it is a script,
    // and reached as the root SKILL.md, it is that.
    const isMdPath = (p) => MARKDOWN_EXT.has(extname(p).toLowerCase());
    const runnableAt = (p) => !isMdPath(p) && (SCRIPT_EXT.has(extname(p).toLowerCase()) || SCRIPT_NAMES.has(basename(p))
      || relative(root, p).split(sep).some((d) => SCRIPT_DIRS.has(d))
      || (typeof content === 'string' && content.replace(/^\uFEFF/, '').startsWith('#!'))
      || (extname(p) === '' && hasExecBit(f)));
    const isRootSkillMd = skillFile !== null && paths.includes(skillFile);
    const runnable = item.runnable === true || (!isRootSkillMd && paths.some(runnableAt));
    const isMarkdown = !runnable && paths.some(isMdPath);
    const shown = isRootSkillMd ? skillFile : (item.runnable ? f : paths.find(runnableAt) || f);
    const rel = relative(root, shown);
    const fail = (kind, i, detail) => { gate++; add({ id: `gate-${kind}`, kind, status: 'fail', file: rel, line: i + 1, detail }); };
    if (content === null) {
      // Binary content: a gate failure when it is Markdown or something a machine runs; an image is not.
      let buf = null;
      try { buf = readFileSync(f); } catch { buf = null; }
      if (isMarkdown || runnable || (buf && isExecutableBinary(buf, f))) fail('unreadable', 0, 'binary content the gate cannot read, in a file a skill can run or an agent reads');
      continue;
    }
    const lines = content.split('\n');
    if (credentials) creds += credentialsIn(content, rel, add);
    // Any other text file, data or prose a tool might still run, gets the download-and-run check.
    if (!runnable && !isMarkdown) {
      lines.forEach((l, i) => { if (remoteExec(l, false, true)) fail('remote-exec', i, 'download piped into a shell, or fetched or decoded content evaluated'); });
      continue;
    }
    let fence = null;
    lines.forEach((l, i) => {
      // Inside a fenced block of Markdown a backtick is shell again, outside it opens a code span.
      const f0 = isMarkdown ? FENCE.exec(l) : null;
      if (f0) fence = fence === null ? f0[1][0] : (f0[1][0] === fence ? null : fence);
      const call = networkCall(l, runnable);
      if ((runnable || basename(shown) === 'SKILL.md') && call.any) {
        const hosts = hostsOf(l);
        if (!hosts.length && runnable) fail('network', i, 'network call whose host is not written on the line, so it cannot be checked against SKILL.md');
        for (const host of hosts) {
          if (names(declared, host)) add({ id: 'gate-network', kind: 'network', status: 'info', file: rel, line: i + 1, value: host, detail: `network call to ${host}, named in SKILL.md` });
          else fail('network', i, `network call to ${host}, not named in SKILL.md`);
        }
      }
      if (remoteExec(l, isMarkdown, !isMarkdown || fence !== null)) fail('remote-exec', i, 'download piped into a shell, or fetched or decoded content evaluated');
      if (safetyOff(l, isMarkdown)) fail('safety-off', i, 'instruction to approve automatically or to switch off a permission or safety check');
      if (packageRunners && runnable && (item.commandLine || !COMMENT.test(l)) && PACKAGE_RUNNER.test(l)) fail('network', i, 'package runner, which fetches code at run time');
      if (runnable) {
        if (l.length > LONG_LINE) fail('unreadable', i, `line of ${l.length} characters, not readable as source`);
        else if (BASE64_RUN.test(l)) fail('unreadable', i, 'encoded run of more than 200 characters');
      }
    });
  }
  return { creds, gate };
}

// The processes a plugin registers, each kind with the file loaded when the manifest names none and
// the manifest key that names its own. All of them start in every session that loads the plugin.
const REGISTRATIONS = [
  { kind: 'hook', file: 'hooks/hooks.json', key: 'hooks' },
  { kind: 'monitor', file: 'monitors/monitors.json', key: 'monitors' },
  { kind: 'lsp', file: '.lsp.json', key: 'lspServers' },
  { kind: 'mcp', file: '.mcp.json', key: 'mcpServers' },
];
const ROOT_VARS = /\$\{(?:CLAUDE_PLUGIN_ROOT|PLUGIN_ROOT)\}|\$(?:CLAUDE_PLUGIN_ROOT|PLUGIN_ROOT)\b/g;
const PROJECT_VARS = /\$\{CLAUDE_PROJECT_DIR\}|\$CLAUDE_PROJECT_DIR\b/g;
// Text that reads differently from what runs: bidirectional controls and marks, zero-width and other
// invisible characters, tag characters a model reads and a person does not, ESC, and a carriage
// return that is not a line ending. A byte order mark at the very start is an encoding, not one of
// them. Markdown keeps the zero-width joiners, which emoji and some scripts need.
const INVISIBLE = /[\u202A-\u202E\u2066-\u2069\u200E\u200F\u061C\u200B\u2060-\u2064\u00AD\u180E\u001B]|\r(?!\n)|(?<!^)\uFEFF|\uDB40[\uDC00-\uDC7F]/;
const JOINERS = /[\u200C\u200D]/;
// Files that hold credentials by their name: the path list of the secret scan atk's git skill runs,
// except that any secrets.* counts here, since a plugin has no reason to ship a file of that name.
const SECRET_FILE = /(?:^|\/)(?:\.env(?:\.(?!example$|sample$)[^/]*)?|id_rsa|id_dsa|id_ecdsa|id_ed25519|\.netrc|\.pgpass|credentials\.json|secrets\.[^/]+|serviceAccount[^/]*\.json|[^/]+\.(?:pem|key|p12|pfx|jks))$/;

// The command lines of one registration document, as { event, matcher, name, type, line }. A hook
// carries an event; a monitor, an LSP server and an MCP server carry a name. A line holds every
// field that names something to run: the command, its arguments, a URL, a working directory, and the
// values of its environment, where NODE_OPTIONS or LD_PRELOAD can load a file of their own.
function commandLines(kind, key, data, inline = false) {
  const line = (e) => [e?.command, e?.args, e?.url, e?.cwd, e?.env && typeof e.env === 'object' ? Object.values(e.env) : null]
    .flat(2).filter((x) => typeof x === 'string').join(' ');
  const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  // A shape the gate cannot read comes back as { malformed }, since what a harness makes of it is
  // unknown, and the gate does not pass what it did not read.
  const entries = (list, what, read) => list.map((x) => (isObject(x) ? read(x) : { malformed: what }));
  if (kind === 'hook') {
    const events = data?.hooks ?? data;
    if (!isObject(events)) return [{ malformed: 'its hooks are not a map of events' }];
    return Object.entries(events).flatMap(([event, groups]) => entries([groups].flat(), `a group of ${event} that is not an object`, (group) => (
      Array.isArray(group.hooks)
        ? entries(group.hooks, `a hook of ${event} that is not an object`, (h) => ({ event, matcher: group.matcher ?? null, type: h.type ?? null, line: line(h) }))
        : [{ malformed: `a group of ${event} whose hooks are not a list` }])).flat());
  }
  if (kind === 'monitor') {
    const list = Array.isArray(data) ? data : Array.isArray(data?.monitors) ? data.monitors : data?.command ? [data] : null;
    if (!list) return [{ malformed: 'monitors that are not a list' }];
    return entries(list, 'a monitor that is not an object', (m) => ({ name: m.name ?? null, type: 'command', line: line(m), workdir: m.cwd }));
  }
  const servers = inline ? data : data?.[key] ?? data;
  if (!isObject(servers)) return [{ malformed: 'servers that are not a map of names' }];
  return Object.entries(servers).map(([name, s]) => (isObject(s) ? { name, type: 'command', line: line(s), workdir: s.cwd } : { malformed: `a server ${name} that is not an object` }));
}

// The processes a plugin brings with it, which run in every session that loads the plugin: hooks,
// monitors, LSP servers and MCP servers, from their default files and from the manifest. The gate
// reads every registration, every file under hooks/, every file a command names, and each command
// line as a script. A command naming a path outside the plugin, by a path or a bare name, a path that
// resolves to nothing, a path built from ~ or a variable, a file: URL outside the plugin, a script the
// working directory defines, a manifest that does not parse, or a package runner fails it. For a
// plugin that registers any process, so do a link leaving the plugin or naming it absolutely, a file
// that is not text and not an image or data, an executable binary, text holding invisible
// characters, a credential in any text file, and a file named for a credential. The trigger runner
// refuses a plugin that fails this as it refuses a skill that fails evaluate().
//
// For such a plugin it also returns codeFiles, what a person reads before a run: every text file but
// each skill's own SKILL.md, since a process can load any file by a path built at run time. codeDigest is over
// every file of the plugin and every path that reaches it, shown or not, so a change anywhere, a link
// re-pointed included, changes it. `declared` is the SKILL.md text whose hosts a command may call;
// `cwd` is the directory a session runs in, which a relative path in a command is resolved against;
// `include`, when given, is the test a path relative to the plugin passes to be part of it, which is
// how the runner limits a plugin inside a repository to the files git carries into the seed.
export function evaluateHooks(pluginRoot, declared = '', cwd = null, include = null) {
  const root = resolve(pluginRoot);
  const realRoot = realpathSync(root);
  const checks = [];
  const add = (c) => checks.push(c);
  const commands = [];
  let gate = 0;
  let creds = 0;
  // `needsCwd` marks a finding that only a missing session directory causes, which the runner reports
  // as the missing repository instead.
  const unread = (file, detail, needsCwd = false) => { gate++; add({ id: 'gate-unreadable', kind: 'unreadable', status: 'fail', file: maskIfSecret(file), line: 1, detail, ...(needsCwd ? { needsCwd } : {}) }); };
  const kept = (rel) => !include || include(rel.split(sep).join('/'));

  // A manifest that is there and does not parse may still register processes the gate cannot see.
  let manifest = null;
  const manifestFile = join(root, '.claude-plugin', 'plugin.json');
  if (lstatOk(manifestFile)) {
    try { manifest = JSON.parse(readFileSync(manifestFile, 'utf8')); } catch {
      unread(join('.claude-plugin', 'plugin.json'), 'plugin manifest does not parse, so the gate cannot tell what it registers');
    }
  }

  // Every registration document, with the kind it registers and the file it came from
  const registrations = [];
  const registrationFiles = new Set();
  const readRegistration = (kind, p) => {
    const rel = relative(root, p);
    if (!lstatOk(p) || !kept(rel)) return;
    if (!insideTarget(p, realRoot)) { unread(rel, `${kind} registration links out of the plugin; not followed, target not read`); return; }
    registrationFiles.add(rel);
    let text;
    try { text = readFileSync(p, 'utf8'); } catch (e) { unread(rel, `${kind} registration cannot be read (${e.code || e.message})`); return; }
    try { registrations.push({ kind, file: rel, data: JSON.parse(text) }); } catch { unread(rel, `${kind} registration does not parse, so the gate cannot tell what it runs`); }
  };
  for (const { kind, file, key } of REGISTRATIONS) {
    const declaredHere = manifest?.[key];
    const paths = new Set();
    const inline = [];
    for (const h of [declaredHere].flat()) {
      if (typeof h === 'string') {
        const p = resolve(root, h);
        if (!within(root, p)) unread(h, `${kind} registration outside the plugin; not read`);
        else paths.add(p);
      } else if (h && typeof h === 'object') inline.push(h);
    }
    // Monitors written in the manifest are one array of entries; every other kind is one object each.
    if (inline.length) {
      for (const data of kind === 'monitor' ? [inline] : inline) registrations.push({ kind, file: '.claude-plugin/plugin.json', data, inline: true });
      registrationFiles.add(join('.claude-plugin', 'plugin.json'));
    }
    // The default file loads alongside a manifest key for hooks, and in place of one for the others;
    // reading it either way never misses what runs.
    paths.add(join(root, file));
    for (const p of paths) readRegistration(kind, p);
  }

  // Every command, and every file inside the plugin it names. A line is split before its variables
  // are expanded, so a path holding a space stays one token.
  const named = new Set();
  const lines = new Map();
  const inside = (p) => within(root, p) || within(realRoot, p);
  const CD_INTO_PLUGIN = new RegExp(`(?:\\bcd|--prefix|--cwd|--dir|-C)[\\s=]+["']?${escapeRe(root)}(?=[\\\\/"'\\s;&|)]|$)`);
  for (const { kind, file, data, inline } of registrations) {
    for (const c of commandLines(kind, REGISTRATIONS.find((r) => r.kind === kind).key, data, inline)) {
      if (c.malformed) { unread(file, `${kind} registration has ${c.malformed}, so the gate cannot tell what it runs`); continue; }
      commands.push({ kind, event: c.event ?? null, matcher: c.matcher ?? null, name: c.name ?? null, type: c.type, command: maskIfSecret(c.line), file });
      // An http hook sends the event to its URL, which the network check reads like any call.
      if ((c.type !== 'command' && c.type !== 'http') || !c.line) continue;
      if (!lines.has(kind)) lines.set(kind, []);
      lines.get(kind).push(c.line);
      if (c.type !== 'command') continue;
      // A line that moves into the plugin before it runs anything, through cd, an option naming the
      // directory, or a server's own cwd, runs its relative paths and its working-directory scripts there.
      const expanded = c.line.replace(ROOT_VARS, root);
      const intoPlugin = CD_INTO_PLUGIN.test(expanded)
        || (typeof c.workdir === 'string' && within(root, resolve(root, c.workdir.replace(ROOT_VARS, root))));
      if (!intoPlugin && WORKDIR_RUNNER.test(expanded)) {
        unread(file, `${kind} command in ${file} runs a script the working directory defines, which the gate does not read`);
      }
      const bases = intoPlugin ? [root] : cwd ? [cwd, root] : [];
      for (const piece of c.line.split(/[\s"'=;&|()<>]+/)) {
        if (!piece) continue;
        let token = piece.replace(ROOT_VARS, root);
        if (cwd) token = token.replace(PROJECT_VARS, cwd);
        if (/^file:/i.test(token)) {
          try { token = fileURLToPath(token); } catch { unread(piece, `${kind} command in ${file} names a file: URL the gate cannot resolve`); continue; }
        } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(token)) continue;
        if (!cwd && /\$\{?CLAUDE_PROJECT_DIR\b/.test(piece)) {
          unread(piece, `${kind} command in ${file} names the project directory, with no session directory to resolve it against`, true);
          continue;
        }
        if (token.startsWith('~') || (token.includes('$') && /[\\/]/.test(token))) {
          unread(piece, `${kind} command in ${file} builds a path from ~ or a variable, which the gate cannot resolve`);
          continue;
        }
        if (token.includes('$')) continue;
        // A path glued to a one-letter option, as in -I/lib or -I./lib, is a path all the same.
        const glued = /^-[A-Za-z]((?:[A-Za-z]:)?[\\/].*|\.\.?[\\/].*|[^-].*[\\/].*)$/.exec(token);
        if (glued) token = glued[1];
        const slash = /[\\/]/.test(token);
        // A word is a path when it starts like one, /x, //x, C:\x, ./x or ../x, or names something that
        // exists; application/json and s/a/b/ are words.
        const explicit = isAbsolute(token) || /^(?:[A-Za-z]:[\\/]|\.\.?[\\/])/.test(token);
        if (!explicit && !slash && !cwd) continue;
        let ps;
        if (isAbsolute(token)) ps = [token];
        else if (bases.length) ps = bases.map((b) => resolve(b, token));
        else { unread(piece, `${kind} command in ${file} names a relative path, with no session directory to resolve it against`, true); continue; }
        // A relative path is read against every directory a process may run it from: the session's,
        // and the plugin's, which a line may cd into. What exists in neither is a word, unless it was
        // written as a path.
        const found = ps.filter(lstatOk);
        if (!found.length) {
          const p = ps[0];
          if (!explicit) continue;
          if (inside(p)) unread(relative(root, p), `${kind} command in ${file} names a path that resolves to nothing`);
          else if (!SYSTEM_PATH.test(token)) unread(piece, `${kind} command in ${file} runs a file outside the plugin, which the gate does not read`);
          continue;
        }
        for (const p of found) {
          if (!inside(p)) {
            // An interpreter or a device, /usr/bin/env or /dev/null, is the system's; any other file
            // outside the plugin, named by a bare word or a path, is code the gate never read.
            if (!(isAbsolute(token) && SYSTEM_PATH.test(token))) unread(piece, `${kind} command in ${file} runs a file outside the plugin, which the gate does not read`);
            continue;
          }
          try { if (statSync(p).isFile()) named.add(p); } catch { unread(relative(root, p), `${kind} command in ${file} names a link that resolves to nothing`); }
        }
      }
    }
  }

  // One walk of the whole plugin: what the gate reads, what a person reads, what the digest covers,
  // and what nothing may hide in. Each file is read, decoded and hashed once.
  const registers = commands.length > 0 || registrationFiles.size > 0;
  const problems = [];
  const all = walk(root, problems);
  if (registers) {
    for (const l of all.links) if (kept(l)) unread(l, 'link leaves the plugin; not followed, target not read');
    for (const p of problems) if (kept(p.file)) unread(p.file, `cannot be read (${p.detail}), so the gate did not read it`);
  }
  const files = [];
  const byReal = new Map();
  for (const aliases of all.files) {
    let paths = aliases.filter((p) => kept(relative(root, p)));
    if (!paths.length) {
      // A file reached only through a link to a directory is listed by git at its real place.
      let realRel = null;
      try { realRel = relative(realRoot, realpathSync(aliases[0])); } catch { realRel = null; }
      if (realRel === null || !kept(realRel)) continue;
      paths = aliases;
    }
    const rel = relative(root, paths[0]);
    let buf;
    try { buf = readFileSync(paths[0]); } catch (e) { if (registers) unread(rel, `cannot be read (${e.code || e.message}), so the gate did not read it`); continue; }
    const real = realpathSync(paths[0]);
    const file = { rel, paths, real, text: textOf(buf), sha: sha256(buf) };
    files.push(file);
    byReal.set(real, file);
    if (!registers) continue;
    // A file that is not text cannot be shown, and whatever its name or first bytes, a process can run
    // it: Node as a module, a shell line by line. So a plugin that starts processes holds none.
    if (file.text === null) unread(rel, 'not text, in a plugin that starts processes; it cannot be shown, and a process could run it');
    const markdown = MARKDOWN_EXT.has(extname(rel).toLowerCase());
    if (file.text !== null && (INVISIBLE.test(file.text) || (!markdown && JOINERS.test(file.text)))) {
      unread(rel, 'invisible or bidirectional control characters, so the text read is not the text that runs');
    }
    if (SECRET_FILE.test(rel.split(sep).join('/'))) { creds++; add({ id: 'credential', kind: 'secret-file', status: 'fail', file: rel, line: 1, value: '********' }); }
    else if (file.text !== null) creds += credentialsIn(file.text, rel, add);
  }
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));

  // Every link inside the plugin, a link to a directory already walked included. One named absolutely
  // still names the original once the plugin is copied; one whose target git does not carry dangles
  // in the seed. Each is part of the digest, so a link re-pointed changes it.
  const linkEntries = [];
  if (registers) {
    for (const p of all.inner) {
      const rel = relative(root, p);
      // A link inside a directory reached through another link is listed by git where it really sits.
      if (!kept(rel) && !kept(relative(realRoot, join(realpathSync(dirname(p)), basename(p))))) continue;
      const raw = readlinkSync(p);
      if (isAbsolute(raw)) {
        linkEntries.push(`${rel}\0->${raw}\n`);
        unread(rel, 'link named by an absolute path, which a copy of the plugin would still resolve to the original');
        continue;
      }
      // Recorded by where it leads rather than how it is written, since the seed rewrites every link
      // to its shortest form; a link re-pointed still changes the digest.
      const target = relative(realRoot, realpathSync(p));
      linkEntries.push(`${rel}\0->${target}\n`);
      if (!kept(target)) unread(rel, 'link to a path git does not carry into the seed, so it would resolve to nothing there');
    }
  }

  // What the gate reads: every file under hooks/, by any path that reaches it or by its real place,
  // and every file a command names, which is read as a script whatever its name.
  const hooksDir = join(root, 'hooks');
  const realHooks = existsSync(hooksDir) ? realpathSync(hooksDir) : null;
  const namedReal = new Map();
  for (const p of named) {
    const real = insideTarget(p, realRoot);
    if (!real) unread(relative(root, p), 'a file a command runs links out of the plugin; not followed, target not read');
    else if (!byReal.has(real)) unread(relative(root, p), 'a file a command runs is not part of the plugin the gate read, so it was not read');
    else if (!namedReal.has(real)) namedReal.set(real, p);
  }
  const readable = [];
  for (const file of files) {
    const run = namedReal.get(file.real);
    const inHooks = realHooks && (file.paths.some((p) => within(hooksDir, p)) || within(realHooks, file.real));
    if (!inHooks && !run) continue;
    readable.push(run ? { paths: [run], content: file.text, runnable: true } : { paths: file.paths, content: file.text });
  }

  let codeFiles = [];
  let codeDigest = '';
  if (registers) {
    // Every text file but a skill's own SKILL.md: a process can load any of them, Markdown by a path
    // built at run time included, and consent covers only what was shown.
    const skillFile = (f) => f.paths.every((p) => /^skills[\\/][^\\/]+[\\/]SKILL\.md$/.test(relative(root, p)));
    codeFiles = files.filter((f) => f.text !== null && !skillFile(f))
      .map((f) => ({ path: f.rel, lines: f.text.split('\n').length, sha256: f.sha, ...(f.paths.length > 1 ? { reachedBy: f.paths.map((p) => relative(root, p)) } : {}) }));
    codeDigest = sha256([...files.flatMap((f) => f.paths.map((p) => `${relative(root, p)}\0${f.sha}\n`)), ...linkEntries].sort().join(''));
  }

  for (const [kind, ls] of lines) readable.push({ paths: [join(root, `${kind} commands`)], content: ls.join('\n'), runnable: true, commandLine: true });

  const found = gateItems(readable, { root, skillFile: null, declared, add, packageRunners: true, credentials: false });
  gate += found.gate;
  if (!creds) add({ id: 'credentials', status: 'pass', value: 0 });
  if (!gate) add({ id: 'gate', status: 'pass', value: 0 });
  return { plugin: root, registers, commands, codeFiles, codeDigest, checks, summary: { credentials: creds, gate } };
}

function lstatOk(p) {
  try { lstatSync(p); return true; } catch { return false; }
}

function loadKeyTable() {
  const table = new Map();
  try {
    const rows = readFileSync(join(SCRIPT_DIR, '..', 'references', 'frontmatter-keys.tsv'), 'utf8').trim().split('\n');
    const head = rows.shift().split('\t');
    const k = head.indexOf('key');
    const h = head.indexOf('harness');
    for (const r of rows) {
      const f = r.split('\t');
      if (!table.has(f[k])) table.set(f[k], []);
      table.get(f[k]).push(f[h]);
    }
  } catch { /* without the table every extra key is reported as read by no listed harness */ }
  return table;
}

// Compared by real path: run through a linked directory, argv[1] is the link and import.meta.url
// the target, and a plain comparison would skip main() and print nothing.
const invoked = (() => { try { return realpathSync(process.argv[1]); } catch { return null; } })();
if (invoked && invoked === realpathSync(fileURLToPath(import.meta.url))) main();
