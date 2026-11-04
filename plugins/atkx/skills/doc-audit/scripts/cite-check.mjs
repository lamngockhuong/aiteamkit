// atkx:doc-audit cite-check: every path and path:line a document cites, checked against the
// repository that holds the document, without an agent.
//
// A script because a citation either resolves or it does not, and the answer must be the same on
// every run; the pilot's agents also miscounted their own tables. references/cheap-pass.md says what
// each field means to the ranking and how to do the same by hand without Node.
//
// Usage: node cite-check.mjs [--code <dir>] [--exclude <dir>]... <file-or-dir>...
//   A directory is walked for *.md files; --exclude leaves a directory out, the language mirrors
//   among them. --code names the code root, inside the same repository, that a bare citation is
//   resolved against before the repository root. Every path is relative to the working directory,
//   and an --exclude or --code that does not exist there is refused, so a typo cannot leave a
//   mirror in without a word.
//
// Output, one JSON object on standard output:
//   { "repoRoot": path,
//     "documents": [ { "path": path, "status": "read" | "unread" | "outside" | "missing"
//                                        | "unreadable",
//                      "unclosedFence": n|null, "unclosedComment": n|null,
//                      "citations": [ { "line": n, "target": path, "from": n|null, "to": n|null,
//                                       "status": "ok" | "missing" | "out-of-range" | "stale"
//                                                 | "outside" | "unread" | "ambiguous"
//                                                 | "unreadable",
//                                       "directory": bool, "identifierNear": bool|null } ],
//                      "counts": { "citations": n, "withLine": n, "withoutLine": n,
//                                  "directories": n, "broken": n, "outside": n, "unread": n,
//                                  "lines": n } } ],
//     "summary": { "documents": n, "read": n, "citations": n, "broken": n } }
//
// What it never prints: a line of any file. Only paths, line numbers, booleans and counts leave
// this script, so a secret on a cited line cannot reach the session through it. One exception: a
// citation that does not resolve is printed as the document wrote it, which is text of the
// document the person asked to audit, never of a file it cites. `identifierNear` is a boolean for the same reason: the identifier itself is not
// printed.
//
// What it never opens: a path outside the repository, by `..`, an absolute path or a symbolic link,
// is refused before anything is read; a path the unread-path table names is matched without case on
// the path as cited and on its real path, and is never opened. A file that exists but cannot be read,
// or is not a regular file, is reported unreadable and the run goes on. Exit code 2 with one line on
// standard error when no document is given, the first one is in no git repository, a flag is unknown
// or has no value, or an --exclude or --code does not exist.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

// unread-paths: begin. Each Pattern cell of the table in references/safety.md section 1, verbatim
// and in order; tests/verify.sh compares this array with the origin table in atk, so a row added
// there fails the check until a matcher for it is added below.
const UNREAD_ROWS = [
  "`.env`, `.env.*` except the templates `.env.example`, `.env.sample`, `.env.template`, `.env.dist`, `.env.*.example` and `.env.*.sample`",
  "`*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`",
  "`id_rsa`, `id_dsa`, `id_ecdsa`, `id_ed25519`, and any file beside a `.pub` of the same name",
  "`credentials.json`, `serviceAccount*.json`, `secrets.` with `json`, `yml`, `yaml`, `toml`, `ini`, `env` or `txt`",
  "`.netrc`, `.pgpass`",
  "`.git-credentials`, `.pypirc`, `.aws/credentials`, `.docker/config.json`, `.kube/config`, `kubeconfig`, `*.tfstate`, `*.tfstate.backup`",
  "`*.sql` or `*.csv` over a megabyte",
];
// unread-paths: end

// One matcher per row above, in the same order. Each takes the path lowercased, with / separators,
// and the absolute path for the two rows that need the disk: a size, a sibling file.
const MATCHERS = [
  (p) => { const n = basename(p); return (n === '.env' || n.startsWith('.env.')) &&
    !['.env.example', '.env.sample', '.env.template', '.env.dist'].includes(n) && !/^\.env\..+\.(example|sample)$/.test(n); },
  (p) => /\.(pem|key|p12|pfx|jks)$/.test(p),
  (p, abs) => ['id_rsa', 'id_dsa', 'id_ecdsa', 'id_ed25519'].includes(basename(p)) || (abs !== null && existsSync(abs + '.pub')),
  (p) => { const n = basename(p); return n === 'credentials.json' || /^serviceaccount.*\.json$/.test(n) || /^secrets\.(json|yml|yaml|toml|ini|env|txt)$/.test(n); },
  (p) => ['.netrc', '.pgpass'].includes(basename(p)),
  (p) => ['.git-credentials', '.pypirc', 'kubeconfig'].includes(basename(p)) || /(^|\/)(\.aws\/credentials|\.docker\/config\.json|\.kube\/config)$/.test(p) || /\.tfstate(\.backup)?$/.test(p),
  (p, abs) => /\.(sql|csv)$/.test(p) && abs !== null && existsSync(abs) && statSync(abs).size > 1048576,
];
if (MATCHERS.length !== UNREAD_ROWS.length) fail('the unread-path rows and their matchers differ in number');

function fail(msg) { process.stderr.write(msg + '\n'); process.exit(2); }
const lower = (p) => p.split(sep).join('/').toLowerCase();
const unread = (p, abs) => MATCHERS.some((m) => m(lower(p), abs));

// Arguments
const args = process.argv.slice(2);
const inputs = [], excludes = [];
let code = null;
const value = (i) => (i < args.length && !args[i].startsWith('--') ? args[i] : fail(`${args[i - 1]} needs a directory`));
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--code') code = value(++i);
  else if (args[i] === '--exclude') excludes.push(value(++i));
  else if (args[i].startsWith('--')) fail(`unknown flag ${args[i]}`);
  else inputs.push(args[i]);
}
if (!inputs.length) fail('no document given: node cite-check.mjs [--code <dir>] [--exclude <dir>]... <file-or-dir>...');

let repoRoot;
try {
  const first = resolve(inputs[0]);
  const at = existsSync(first) && statSync(first).isDirectory() ? first : dirname(first);
  repoRoot = realpathSync(execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: at, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
} catch { fail(`${inputs[0]} is in no git repository`); }

const inside = (abs) => abs === repoRoot || abs.startsWith(repoRoot + sep);
// The real path, links resolved, so a link leaving the repository is caught. For a path that does not
// exist, the real path of its nearest existing parent with the rest appended, so a missing file
// under a linked directory is still caught leaving.
function real(abs) {
  const rest = [];
  for (let p = abs; ; p = dirname(p)) {
    try { return join(realpathSync(p), ...rest); } catch { /* not there yet: go up */ }
    if (dirname(p) === p) return abs;
    rest.unshift(basename(p));
  }
}
const excluded = excludes.map((e) => { const a = resolve(e); return existsSync(a) ? real(a) : fail(`--exclude ${e} does not exist`); });

let codeRoot = repoRoot;
if (code !== null) {
  const c = resolve(code);
  if (!existsSync(c)) fail(`--code ${code} does not exist`);
  codeRoot = inside(c) && inside(real(c)) ? real(c) : fail(`--code ${code} leaves the repository`);
}

// Documents: files as given, directories walked for *.md, .git and node_modules skipped
const docs = [];
function walk(dir) {
  if (excluded.some((e) => dir === e || dir.startsWith(e + sep))) return;
  let ents;
  // A directory that cannot be listed is reported as a document that cannot be read
  try { ents = readdirSync(dir, { withFileTypes: true }); } catch { docs.push(dir); return; }
  for (const ent of ents) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) docs.push(p);
  }
}
for (const input of inputs) {
  const abs = real(resolve(input));
  if (existsSync(abs) && statSync(abs).isDirectory() && inside(abs)) walk(abs);
  else docs.push(abs);
}

// A citation: a Markdown link target, or a span in backticks, or a bare token, that looks like a
// path with a slash or with a line, optionally followed by :n, :n-m, #Ln or #Ln-Lm. Addresses with a
// scheme are not citations: they are listed by the agent, never fetched.
//
// A span that names no line and ends in no extension a source or document file has is weak: in a
// document it is as often a MIME type, a route, a date format or a storage prefix as a path. A weak
// span counts only when it resolves to something in the repository, or names a file that is not
// read; a missing or outside one is not a citation at all. A strong one that is missing as cited,
// written relative to some module, is looked up once among the tracked files by its ending, and
// counts as found when exactly one file ends with it.
const KNOWN_EXT = new Set(['md', 'mdx', 'txt', 'rst', 'adoc', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json',
  'yml', 'yaml', 'toml', 'ini', 'xml', 'html', 'css', 'scss', 'vue', 'svelte', 'sql', 'prisma', 'graphql',
  'proto', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift', 'php', 'cs', 'c', 'h', 'cpp', 'sh', 'tf', 'csv', 'lock']);
const knownExt = (target) => KNOWN_EXT.has(target.match(/\.(\w+)$/)?.[1].toLowerCase());
const strong = (target, from) => from !== null || knownExt(target);
const SEG = String.raw`[\p{L}\p{N}_@.+%-]+`;
const pathOf = (seg) => String.raw`(?:\.{1,2}\/|~\/|\/)?${seg}(?:\/${seg})*\/?`;
const PATH = pathOf(SEG);
const LINES = String.raw`(?::(\d+)(?:-(\d+))?|#L(\d+)(?:-L(\d+))?)?`;
// A link target may sit in angle brackets, which allow spaces, and may carry a title after it
// A title after the target, in double or single quotes or in parentheses, is not part of it
const TITLE = String.raw`(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?`;
const LINK = new RegExp(String.raw`\]\((?!\w+:|#)<?((?:${PATH})|[^<>)]+(?=>))>?${LINES}(?:#[^)\s]*)?${TITLE}\)`, 'gu');
// A reference definition, [name]: target, is a link too, resolved as one
// A footnote, [^1]: text, is not a definition
const DEF = new RegExp(String.raw`^ {0,3}\[(?!\^)[^\]]+\]:\s*(?!\w+:|#)<?((?:${PATH})|[^<>\s]+(?=>))>?${LINES}(?:#\S*)?${TITLE}\s*$`, 'u');
const TICK = new RegExp('`(' + PATH + ')' + LINES + '`', 'gu');
// A bare path has no delimiter, so in text written without spaces, Japanese or Chinese, it would run
// on into the words before and after it. Its segments leave those scripts out, and those scripts may
// stand right before or after it; a link or a span in backticks keeps them, since there the
// delimiters say where the path ends
const CJK = String.raw`\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}`;
const BSEG = String.raw`(?:(?![${CJK}])[\p{L}\p{N}_@.+%-])+`;
const BPATH = pathOf(BSEG);
const BARE = new RegExp(String.raw`(?<!(?![${CJK}])[\p{L}\p{N}_\/.:\x60-])(${BPATH}\/${BSEG}\.\w+|${BSEG}\.\w+(?=:\d))${LINES}(?!(?![${CJK}])[\p{L}\p{N}_\/])`, 'gu');
const IDENT = /`([A-Za-z_][\w.]*?)(?:\(\))?`/g;

function citationsOf(line) {
  const found = [];
  const take = (matches, viaLink) => {
    for (const m of matches) {
      let target = m[1];
      try { target = decodeURIComponent(target); } catch { /* not encoded: keep as written */ }
      const from = m[2] ?? m[4] ?? null, to = m[3] ?? m[5] ?? null;
      // An address with a scheme, and a package name such as @scope/name, cite no file
      if (/^\w+:/.test(target) || target.includes('//') || target.startsWith('@')) continue;
      // In backticks or bare, a span with no slash is a path only with a line and a known extension:
      // `foo.md` alone is a name, often of a file the reader is meant to create, and a host and port
      // or a setting followed by a number is not a file. A name the unread-path table holds, .env
      // among them, is kept, so that it is reported as not read
      if (!viaLink && !target.includes('/') && (from === null || !knownExt(target)) && !unread(target, null)) continue;
      // An absolute link with no file extension is a route of the site, not a file
      if (viaLink && target.startsWith('/') && !strong(target, from)) continue;
      if (found.some((f) => f.target === target && f.from === from)) continue;
      found.push({ target, from: from && +from, to: to ? +to : from && +from, viaLink, weak: !viaLink && !strong(target, from) });
    }
  };
  const def = line.match(DEF);
  if (def) { take([def], true); line = ' '.repeat(line.length); }
  take(line.matchAll(LINK), true);
  // A link's label is what the reader sees, not what it cites: the target was taken above, so the
  // label is blanked before spans and bare tokens are looked for, or a label naming the file
  // relative to somewhere else reads as a missing citation.
  line = line.replace(/\[[^\]]*\]\([^)]*\)/g, (m) => ' '.repeat(m.length));
  take(line.matchAll(TICK), false); take(line.matchAll(BARE), false);
  return found;
}

function identifiers(line, targets) {
  const out = [];
  for (const m of line.matchAll(IDENT)) {
    const id = m[1];
    // A file name is not an identifier, whatever its case: README.md would leave md to look for
    if (id.length < 3 || targets.some((t) => t.includes(id)) || knownExt(id) || /\.\w{1,4}$/.test(id) && !/[A-Z_]/.test(id)) continue;
    const last = id.split('.').pop();
    if (last) out.push(last);
  }
  return out;
}

// The one place a candidate path is judged before anything is opened: its real path inside the
// repository, then the unread-path table on the path as written and as resolved, then the disk
function check(abs) {
  const r = real(abs);
  if (!inside(r)) return { status: 'outside' };
  const rel = relative(repoRoot, abs);
  if (unread(rel, abs) || (r !== abs && unread(relative(repoRoot, r), r))) return { status: 'unread' };
  return existsSync(r) ? { status: 'ok', abs: r } : { status: 'missing' };
}

const resolved = new Map();
function resolveTarget(target, docDir, viaLink, weak) {
  const key = `${viaLink}\0${weak}\0${docDir}\0${target}`;
  if (!resolved.has(key)) resolved.set(key, resolveOnce(target, docDir, viaLink, weak));
  return resolved.get(key);
}

function resolveOnce(target, docDir, viaLink, weak) {
  if (target.startsWith('~')) return { status: 'outside' };
  // A leading slash is the repository root on a code host, and only that: it is a repository path
  // when its first segment is a directory at the root, and missing when the rest is not there; any
  // other absolute path is outside. An elided start, .../x, names x by its ending
  if (isAbsolute(target)) {
    const rest = target.replace(/^\/+/, '');
    const first = rest.split('/')[0];
    if (!first || !existsSync(join(repoRoot, first))) return { status: 'outside' };
    return check(join(repoRoot, rest));
  }
  if (target.startsWith('.../')) return resolveOnce(target.slice(4), docDir, false, weak);
  if (unread(target, null)) return { status: 'unread' };
  let lost = null;
  // A link resolves from the document's directory alone, as a code host resolves it when clicked
  for (const base of viaLink ? [docDir] : [codeRoot, repoRoot, docDir]) {
    const abs = resolve(base, target);
    if (!inside(abs)) { lost ??= { status: 'outside' }; continue; }
    const r = check(abs);
    if (r.status !== 'missing') return r;
    // Missing from a base that stays inside says more than leaving from another base
    lost = r;
  }
  lost ??= { status: 'missing' };
  // Only a strong span, missing as written and not written relative to a document, is looked up by
  // its ending; a weak one that is missing is dropped by the caller anyway, and a link is broken
  // when clicked whatever else ends the same way
  if (viaLink || weak || lost.status !== 'missing' || /^\.{0,2}\//.test(target)) return lost;
  const hits = byName().get(basename(target.replace(/\/$/, ''))) || [];
  const suffix = '/' + target.replace(/\/$/, '');
  const match = hits.filter((f) => ('/' + f).endsWith(suffix));
  if (match.length > 1) return { status: 'ambiguous' };
  if (match.length !== 1) return lost;
  const r = check(join(repoRoot, match[0]));
  return r.status === 'missing' ? lost : r;
}

// The tracked files by base name, read once and only when a citation needs its ending looked up:
// names only, through git, so no file is opened
let trackedByName = null;
function byName() {
  if (!trackedByName) {
    trackedByName = new Map();
    let list = '';
    try { list = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 28 }); } catch { /* no lookup by ending */ }
    for (const f of list.split('\0')) {
      if (f) (trackedByName.get(basename(f)) ?? trackedByName.set(basename(f), []).get(basename(f))).push(f);
    }
  }
  return trackedByName;
}

// A cited file's lines, read once however many citations name it
const bodies = new Map();
function body(abs) {
  if (!bodies.has(abs)) {
    let b = null;
    try { if (statSync(abs).isFile()) b = readFileSync(abs, 'utf8').split('\n'); } catch { /* left null */ }
    bodies.set(abs, b && { lines: b, n: b.length - (b[b.length - 1] === '' ? 1 : 0) });
  }
  return bodies.get(abs);
}

const BUCKET = { missing: 'broken', 'out-of-range': 'broken', stale: 'broken', outside: 'outside', unread: 'unread' };
const out = [];
for (const abs of docs) {
  const rel = inside(abs) ? relative(repoRoot, abs) : abs;
  const doc = { path: rel, status: 'read', unclosedFence: null, unclosedComment: null, citations: [], counts: { citations: 0, withLine: 0, withoutLine: 0, directories: 0, broken: 0, outside: 0, unread: 0, lines: 0 } };
  out.push(doc);
  if (!inside(abs)) { doc.status = 'outside'; doc.path = basename(abs); continue; }
  if (unread(rel, abs)) { doc.status = 'unread'; continue; }
  if (!existsSync(abs)) { doc.status = 'missing'; continue; }
  const own = body(abs);
  if (!own) { doc.status = 'unreadable'; continue; }
  const { lines } = own;
  doc.counts.lines = own.n;
  const dirs = new Set();
  // A fence closes only on a line of the character that opened it, at least as long, so a ~~~ line
  // inside a ``` block, or ``` inside ````, is text. An HTML comment is not read either; a <!-- inside
  // a code span opens none, since it is text being quoted
  let fence = null, fenceAt = 0, comment = false, commentAt = 0;
  lines.forEach((raw, i) => {
    const f = raw.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (fence === null && !comment && f) { fence = f; fenceAt = i + 1; return; }
    if (fence !== null) { if (f && f[0] === fence[0] && f.length >= fence.length && !raw.trim().slice(f.length)) fence = null; return; }
    let text = '';
    for (let rest = raw; rest.length;) {
      if (comment) {
        const end = rest.indexOf('-->');
        if (end < 0) break;
        comment = false; rest = rest.slice(end + 3);
      } else {
        const start = rest.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length)).indexOf('<!--');
        if (start < 0) { text += rest; break; }
        text += rest.slice(0, start); comment = true; commentAt = i + 1; rest = rest.slice(start + 4);
      }
    }
    const cites = citationsOf(text);
    if (!cites.length) return;
    const ids = identifiers(text, cites.map((c) => c.target));
    for (const c of cites) {
      const r = resolveTarget(c.target, dirname(abs), c.viaLink, c.weak);
      if (c.weak && (r.status === 'missing' || r.status === 'outside' || r.status === 'ambiguous')) continue;
      const entry = { line: i + 1, target: c.target, from: c.from, to: c.to, status: r.status, directory: false, identifierNear: null };
      if (r.status === 'ok') {
        entry.target = relative(repoRoot, r.abs) || '.';
        entry.directory = statSync(r.abs).isDirectory();
        dirs.add(entry.directory ? entry.target : dirname(entry.target));
        if (c.from !== null && entry.directory) entry.status = 'out-of-range';
        else if (c.from !== null) {
          const cited = body(r.abs);
          const { lines: b, n } = cited ?? {};
          if (!cited) entry.status = 'unreadable';
          else if (c.from < 1 || c.to > n || c.to < c.from) entry.status = 'out-of-range';
          else if (ids.length) {
            const near = b.slice(Math.max(0, c.from - 4), Math.min(n, c.to + 3)).join('\n');
            entry.identifierNear = ids.some((id) => near.includes(id));
            if (!entry.identifierNear) entry.status = 'stale';
          }
        }
      }
      doc.citations.push(entry);
      doc.counts.citations++;
      doc.counts[c.from !== null ? 'withLine' : 'withoutLine']++;
      if (BUCKET[entry.status]) doc.counts[BUCKET[entry.status]]++;
    }
  });
  doc.counts.directories = dirs.size;
  if (fence !== null) doc.unclosedFence = fenceAt;
  if (comment) doc.unclosedComment = commentAt;
}

const read = out.filter((d) => d.status === 'read');
process.stdout.write(JSON.stringify({
  repoRoot,
  documents: out,
  summary: {
    documents: out.length, read: read.length,
    citations: read.reduce((a, d) => a + d.counts.citations, 0),
    broken: read.reduce((a, d) => a + d.counts.broken, 0),
  },
}, null, 2) + '\n');
