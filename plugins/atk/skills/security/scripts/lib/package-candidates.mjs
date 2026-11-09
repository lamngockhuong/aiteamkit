// atk:security package-candidates: the npm and Python rows of the supply-chain scan. Each candidate
// names its rule, path and line, and from the file at most a package name and a host with any login
// taken out; a line of a manifest or a configuration file is never returned, since `.npmrc`,
// `pip.conf` and an index URL can carry one. The design is fork 3 of
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md.
//
// Rules: install-script, private-registry-unscoped, no-lockfile, typosquat, extra-index-url,
// no-hashes. `files` maps a tracked path to its text; `paths` is every tracked path.

import { posix } from 'node:path';
import { NPM_LOCKS, PY_LOCKS, isRequirements } from './tracked-file-kinds.mjs';

const PUBLIC_NPM = new Set(['registry.npmjs.org', 'registry.npmjs.com', 'registry.yarnpkg.com']);
const DEP_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const JSON_KEY = /("(?:[^"\\]|\\.)*")\s*:/g;

// The host of a URL or an scp-style `user@host:path`, lowercased, with any `user[:password]@` taken
// out. Named only when that is certain: the value has at most one `@`, inside the authority, and what
// is left is a host name or an address. Anything else is null: a value from a variable, a login
// holding `/`, `?`, `#` or `@` (which moves the cut), and so also a path holding `@`, `/@scope`
// among them, since no rule tells that path from a login.
export function hostOf(url) {
  const s = String(url).trim().replace(/^["']|["']$/g, '');
  if (!s || s.includes('${') || /^\$[A-Za-z_]/.test(s)) return null;
  const scheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) || s.startsWith('//');
  const rest = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^\/\//, '');
  const auth = rest.split(/[/?#\s]/)[0];
  if ((rest.match(/@/g) || []).length > 1 || rest.slice(auth.length).includes('@')) return null;
  if (!scheme && !auth.includes('@') && /:(?!\d+$)/.test(auth)) return null; // `word:word`, a login or nothing
  const bare = auth.slice(auth.indexOf('@') + 1);
  const host = /^\[[0-9a-f:.]+\](:\d+)?$/i.test(bare) ? bare : bare.replace(/:(?!\d+$).*$/, ''); // `host:path` of scp
  return /^([a-z0-9_-]+\.)*[a-z0-9_-]+(:\d+)?$|^\[[0-9a-f:.]+\](:\d+)?$/i.test(host) ? host.toLowerCase() : null;
}

// The nearest directory at or above `dir` holding one of `names`, or null.
function nearest(paths, dir, names) {
  for (let d = dir; ; d = posix.dirname(d)) {
    for (const n of names) { const p = d === '.' ? n : d + '/' + n; if (paths.has(p)) return p; }
    if (d === '.') return null; // git's paths are relative, so dirname ends at '.'
  }
}

// Levenshtein distance, given up past `max`.
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let low = i;
    for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); low = Math.min(low, cur[j]); }
    if (low > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// The popular name a dependency is one or two edits from, when it is not itself one; each name is
// measured once per list, since a monorepo names the same dependencies in many manifests.
const measured = new WeakMap();
function typosquat(name, names) {
  if (!names || names.has(name)) return null;
  if (!measured.has(names)) measured.set(names, new Map());
  const seen = measured.get(names);
  if (!seen.has(name)) {
    let best = null; let bestD = 3;
    for (const p of names) { const d = distance(name, p, 2); if (d < bestD) { best = p; bestD = d; } }
    seen.set(name, best);
  }
  return seen.get(name);
}
const pyName = (n) => n.toLowerCase().replace(/[._]+/g, '-');

// Every JSON key with the first line from `from` on that holds it, so a lookup is one pass over the
// file rather than one per name; a one-line file gives every key line 1.
function keyLines(lines, from = 0) {
  const at = new Map();
  for (let i = from; i < lines.length; i++) {
    for (const m of lines[i].matchAll(JSON_KEY)) {
      try { const k = JSON.parse(m[1]); if (!at.has(k)) at.set(k, i + 1); } catch { /* not a key JSON reads */ }
    }
  }
  return at;
}

export function npmCandidates(files, paths, popular, add, note, fail) {
  for (const [path, text] of files) {
    const base = posix.basename(path); const dir = posix.dirname(path);
    if (base === 'package-lock.json' || base === 'npm-shrinkwrap.json') {
      let lock; try { lock = JSON.parse(text); } catch { fail(path, 'not valid JSON'); continue; }
      if (!(lock.lockfileVersion >= 2)) { note('install scripts in a lockfile of version 1', path); continue; }
      const scripted = Object.entries(lock.packages || {}).filter(([, entry]) => entry?.hasInstallScript);
      const at = scripted.length ? keyLines(text.split('\n')) : null;
      for (const [key] of scripted) add({ rule: 'install-script', path, line: at.get(key) ?? null, package: key.split('node_modules/').pop() || key });
    }
    if (base !== 'package.json') continue;
    let pkg; try { pkg = JSON.parse(text); } catch { fail(path, 'not valid JSON'); continue; }
    const lines = text.split('\n'); const deps = [];
    for (const f of DEP_FIELDS) {
      const names = Object.keys(pkg?.[f] || {});
      if (!names.length) continue;
      const from = lines.findIndex((l) => l.includes(JSON.stringify(f))); // the dependencies after the section's own line
      const at = from < 0 ? new Map() : keyLines(lines, from);
      for (const name of names) deps.push({ name, line: at.get(name) ?? null });
    }
    if (!deps.length) continue;
    if (!nearest(paths, dir, NPM_LOCKS)) add({ rule: 'no-lockfile', path, line: null });
    const npmrc = nearest(paths, dir, ['.npmrc']);
    let host = null;
    for (const l of (files.get(npmrc) || '').split('\n')) {
      const m = /^\s*registry\s*=\s*(.*?)\s*$/.exec(l);
      if (!m) continue;
      host = hostOf(m[1]);
      if (!host) note('an npm registry set from a variable', npmrc);
    }
    for (const d of deps) {
      const like = typosquat(d.name.toLowerCase(), popular.npm);
      if (like) add({ rule: 'typosquat', path, line: d.line, package: d.name, like });
      if (host && !PUBLIC_NPM.has(host) && !d.name.startsWith('@')) add({ rule: 'private-registry-unscoped', path, line: d.line, package: d.name, host });
    }
  }
}

// Every requirement and index line of a requirements file, continuation lines joined.
function requirementLines(text) {
  const out = []; let cur = null;
  text.split('\n').forEach((raw, i) => {
    const l = raw.replace(/(^|\s)#.*$/, '').trim(); const t = l.replace(/\\$/, '');
    if (cur) cur.text += ' ' + t; else cur = { n: i + 1, text: t };
    if (!l.endsWith('\\')) { if (cur.text.trim()) out.push(cur); cur = null; }
  });
  if (cur?.text.trim()) out.push(cur);
  return out;
}

const quoted = (s) => [...s.matchAll(/"([^"]*)"|'([^']*)'/g)].map((m) => m[1] ?? m[2]);
// Whether a line closes an array: a `]` outside quotes, so `"uvicorn[standard]"` does not.
const closes = (s) => s.replace(/"[^"]*"|'[^']*'/g, '').includes(']');
// The pyproject arrays holding requirements, by table and, where the table holds other keys, key.
const DEP_ARRAYS = [['project', 'dependencies'], ['project.optional-dependencies'], ['dependency-groups'],
  ['tool.uv', 'dev-dependencies'], ['tool.pdm.dev-dependencies'], ['build-system', 'requires']];

export function pythonCandidates(files, paths, popular, add, note) {
  const squat = (path, line, raw) => { const n = pyName(raw); const like = typosquat(n, popular.pypi); if (like) add({ rule: 'typosquat', path, line, package: n, like }); };
  const extra = (path, n, url) => add({ rule: 'extra-index-url', path, line: n, host: hostOf(url) });
  for (const [path, text] of files) {
    const base = posix.basename(path);
    if (isRequirements(path)) {
      let unhashed = false;
      for (const { n, text: l } of requirementLines(text)) {
        const x = /^--extra-index-url(?:\s*=\s*|\s+)(\S+)/.exec(l);
        if (x) { extra(path, n, x[1]); continue; }
        // a file `-r` or `-c` reaches is read where its own name is a requirements file's, named otherwise
        const inc = /^(?:-r|-c|--requirement|--constraint)(?:\s*=\s*|\s+)(\S+)/.exec(l);
        if (inc && /^[a-z][a-z0-9+.-]*:/i.test(inc[1])) {
          // a URL, which can carry a login: named by its host alone, and never as written
          note('a requirements file reached by -r or -c from a URL, not read', hostOf(inc[1]) ?? 'a host the scan could not name');
        } else if (inc) {
          const target = posix.normalize(posix.join(posix.dirname(path), inc[1]));
          if (!(paths.has(target) && isRequirements(target))) note('a requirements file reached by -r or -c, not read', target);
        }
        if (l.startsWith('-')) continue;
        if (!/--hash[=\s]/.test(l)) unhashed = true;
        const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)/.exec(l);
        if (m && !/^((git|hg|svn|bzr)\+[a-z]+|https?|file):/i.test(l)) squat(path, n, m[1]);
      }
      if (unhashed && !nearest(paths, posix.dirname(path), PY_LOCKS)) add({ rule: 'no-hashes', path, line: null });
    } else if (base === 'pip.conf' || base === 'pip.ini') {
      let inExtra = false;
      text.split('\n').forEach((l, i) => {
        const m = /^\s*extra[-_]index[-_]url\s*[=:]\s*(.*)$/i.exec(l);
        inExtra = !!m || (inExtra && /^\s+\S/.test(l)); // the key's own line, or a line continuing it
        // only a URL: a bare word on a continuation line, a login among them, is never taken for a host
        if (inExtra) for (const u of (m ? m[1] : l).split(/\s+/).filter((t) => t.includes('://'))) extra(path, i + 1, u);
      });
    } else if (base === 'pyproject.toml') {
      let table = ''; let array = null;
      text.split('\n').forEach((raw, i) => {
        const l = raw.replace(/\s#.*$/, '').trim(); const n = i + 1;
        const h = /^\[\[?([^\]]+)\]\]?$/.exec(l);
        if (h && !array) { table = h[1].trim(); return; }
        if (array) { for (const s of quoted(l)) array(s, n); if (closes(l)) array = null; return; }
        const kv = /^([A-Za-z0-9_."-]+)\s*=\s*(.*)$/.exec(l);
        if (!kv) return;
        const key = kv[1].replace(/"/g, '');
        let each = null;
        if (key === 'extra-index-url') each = (s, at) => extra(path, at, s);
        else if (DEP_ARRAYS.some(([t, k]) => t === table && (!k || k === key))) each =(s, at) => { const m = /^\s*([A-Za-z0-9][A-Za-z0-9._-]*)/.exec(s); if (m) squat(path, at, m[1]); };
        else if (/^tool\.poetry\.(dev-dependencies|dependencies|group\.[^.]+\.dependencies)$/.test(table) && key !== 'python') squat(path, n, key);
        if (!each) return;
        const rest = kv[2];
        for (const s of quoted(rest)) each(s, n);
        if (rest.startsWith('[') && !closes(rest)) array = each;
      });
    }
  }
}
