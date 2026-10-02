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

import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
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

function isBinary(buf) {
  if (buf.includes(0)) return true;
  // Control bytes other than tab, newlines and ESC (colour codes), as a share of the head.
  const head = buf.subarray(0, 4096);
  let ctrl = 0;
  for (const b of head) if ((b < 9 || (b > 13 && b < 32)) && b !== 0x1b) ctrl++;
  return head.length > 0 && ctrl / head.length > 0.05;
}

function within(root, p) {
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
// reaches it is kept, since each one is a name a harness may run it by.

function walk(root, problems) {
  const files = [];
  const links = [];
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
  return { files: files.map((real) => aliases.get(real)), links };
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
    dependencies: Array.isArray(manifest?.dependencies) ? manifest.dependencies : [],
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
      texts.set(f, isBinary(buf) && !decode(buf).encoding ? null : decode(buf).text);
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

// The credential and gate checks over a list of files, each { paths, content }, where content is
// null for binary. An item may carry runnable: true, for text a harness runs that is not a file of
// its own, such as the command line of a hook.
function gateItems(items, { root, skillFile, declared, add }) {
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
    lines.forEach((l, i) => {
      for (const c of CREDENTIALS) {
        const m = c.re.exec(l);
        if (m) { creds++; add({ id: 'credential', kind: c.kind, status: 'fail', file: rel, line: i + 1, value: c.kind === 'private-key' ? m[0] : mask(secretOf(m)) }); break; }
      }
    });
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
      if (runnable) {
        if (l.length > LONG_LINE) fail('unreadable', i, `line of ${l.length} characters, not readable as source`);
        else if (BASE64_RUN.test(l)) fail('unreadable', i, 'encoded run of more than 200 characters');
      }
    });
  }
  return { creds, gate };
}

// The hooks a plugin brings with it, which run in every session that loads the plugin: the
// registrations in hooks/hooks.json and in the manifest's hooks key, every file under hooks/, every
// file inside the plugin a hook command names, and each command line itself as a script. The trigger
// runner refuses a plugin that fails this as it refuses a skill that fails evaluate(). A command
// naming a file outside the plugin is a gate failure, since that file is not read. `declared` is the
// SKILL.md text whose hosts a hook may call.
export function evaluateHooks(pluginRoot, declared = '') {
  const root = resolve(pluginRoot);
  const realRoot = realpathSync(root);
  const checks = [];
  const add = (c) => checks.push(c);
  const commands = [];
  let gate = 0;
  const unread = (file, detail) => { gate++; add({ id: 'gate-unreadable', kind: 'unreadable', status: 'fail', file, line: 1, detail }); };

  const registrations = [];
  const readRegistration = (p) => {
    const rel = relative(root, p);
    if (!existsSync(p)) return;
    if (!insideTarget(p, realRoot)) { unread(rel, 'hook registration links out of the plugin; not followed, target not read'); return; }
    try { registrations.push({ file: rel, data: JSON.parse(readFileSync(p, 'utf8')) }); } catch { unread(rel, 'hook registration does not parse, so the gate cannot tell what it runs'); }
  };
  readRegistration(join(root, 'hooks', 'hooks.json'));
  let manifest = null;
  try { manifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8')); } catch { manifest = null; }
  const declaredHooks = manifest?.hooks;
  for (const h of [declaredHooks].flat()) {
    if (typeof h === 'string') {
      const p = resolve(root, h);
      if (!within(root, p)) unread(h, 'hook registration outside the plugin; not read');
      else if (p !== join(root, 'hooks', 'hooks.json')) readRegistration(p);
    } else if (h && typeof h === 'object') registrations.push({ file: '.claude-plugin/plugin.json', data: { hooks: h.hooks ?? h } });
  }

  // Every command, and every file inside the plugin it names
  const named = new Set();
  const lines = [];
  for (const { file, data } of registrations) {
    for (const [event, groups] of Object.entries(data?.hooks ?? {})) {
      for (const group of [groups].flat()) {
        for (const h of group?.hooks ?? []) {
          const line = [h.command, ...(Array.isArray(h.args) ? h.args : [])].filter((x) => typeof x === 'string').join(' ');
          commands.push({ event, matcher: group.matcher ?? null, type: h.type ?? null, command: maskIfSecret(line), file });
          if (h.type !== 'command') continue;
          lines.push(line);
          const expanded = line.replace(/\$\{(?:CLAUDE_PLUGIN_ROOT|PLUGIN_ROOT)\}|\$(?:CLAUDE_PLUGIN_ROOT|PLUGIN_ROOT)\b/g, root);
          for (const token of expanded.split(/[\s"'=;&|()<>]+/)) {
            if (!/[\\/]/.test(token) || /^[a-z][a-z0-9+.-]*:\/\//i.test(token)) continue;
            if (!isAbsolute(token)) continue; // relative to the session's directory, not to the plugin
            if (!within(root, token)) {
              // An interpreter or a device, /usr/bin/env or /dev/null, is the system's; any other file
              // outside the plugin is code the gate never read.
              if (!SYSTEM_PATH.test(token)) unread(token, `hook in ${file} runs a file outside the plugin, which the gate does not read`);
              continue;
            }
            if (existsSync(token) && statSync(token).isFile()) named.add(token);
          }
        }
      }
    }
  }

  const problems = [];
  const items = [];
  const hooksDir = join(root, 'hooks');
  if (existsSync(hooksDir)) {
    const { files: reached, links } = walk(hooksDir, problems);
    for (const l of links) unread(join('hooks', l), 'link leaves the hooks directory; not followed, target not read');
    for (const paths of reached) items.push({ paths });
  }
  const inHooks = new Set(items.map((i) => i.paths[0]));
  for (const p of named) {
    const real = insideTarget(p, realRoot);
    if (!real) unread(relative(root, p), 'a file a hook runs links out of the plugin; not followed, target not read');
    else if (!inHooks.has(real)) items.push({ paths: [p], runnable: true });
  }
  for (const p of problems) unread(join('hooks', p.file), `cannot be read (${p.detail}), so the gate did not read it`);
  const readable = [];
  for (const item of items) {
    try {
      const buf = readFileSync(item.paths[0]);
      readable.push({ ...item, content: isBinary(buf) && !decode(buf).encoding ? null : decode(buf).text });
    } catch (e) { unread(relative(root, item.paths[0]), `cannot be read (${e.code || e.message}), so the gate did not read it`); }
  }
  if (lines.length) readable.push({ paths: [join(root, 'hooks', 'commands')], content: lines.join('\n'), runnable: true });

  const found = gateItems(readable, { root, skillFile: null, declared, add });
  gate += found.gate;
  if (!found.creds) add({ id: 'credentials', status: 'pass', value: 0 });
  if (!gate) add({ id: 'gate', status: 'pass', value: 0 });
  return { plugin: root, commands, checks, summary: { credentials: found.creds, gate } };
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
