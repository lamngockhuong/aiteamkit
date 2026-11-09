// atk:security identity-hosts: the identity pass of history-scan.mjs under --identities and --domains,
// and the --detail file, for a repository about to be handed to a client, who receives every commit
// of it, its message and its identities included. Which emails and hosts are reported, and the
// redacted form each is printed in, is ./host-classes.mjs.
//
// A hit in the scan's output: { "kind": "email" | "host", "class": why, "shown": redacted,
//   "shape": "author, committer, tagger", the roles an identity held, or "message", "tag message",
//   "content", "path" or "ref", "commit": sha | null, "path": path | null, redacted where it names a
//   host, "line": n | null, "at_head": as a secret's, or null for an identity, a message or a ref }.
//   A secret in a message is a "secret" hit at no path. Under --domains: "domains": { "identities":
//   [ { "domain", "count" } ], "remotes": [domain] }, each domain as ./host-classes.mjs proposable()
//   gives it, the count being of addresses. Under --detail: "detail": { "path", "count" }, the path
//   relative to the repository, the count of rows below the file's header.
//
// Identities are read raw, with .mailmap turned off: the client receives the commit objects as they
// were written, and a mailmap changes only how git displays them. The .mailmap file itself, which
// holds the old addresses, is a tracked file the content pass reads like any other. A commit's
// message, trailers such as Signed-off-by and Co-authored-by among them, is read in the identity walk,
// every line indented by git so that none can pass for the walk's own markers; a tag's message is read
// from the tags, after it; each line as content, and for the secret shapes.

import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { stream } from './git-history-stream.mjs';
import { contentHits, emailHit, pathHosts, proposable } from './host-classes.mjs';
import { shapesOf } from './secret-shapes.mjs';

// Under --identities, a function that hears each path the names pass sees added and pushes a host hit
// for each host the path names, once per path and host; otherwise one that does nothing.
export function pathHitsFor(opt, hits) {
  if (!opt.identities) return () => {};
  const seen = new Set();
  return (path, commit) => {
    for (const h of pathHosts(path, opt.internal).hits) {
      if (seen.has(path + '\0' + h.full)) continue;
      seen.add(path + '\0' + h.full); hits.push({ ...h, shape: 'path', commit, path, line: null, at_head: null });
    }
  };
}

// The last step before printing. Under --identities, a host hit for each ref that names a host; then
// the --detail file, with every full value and the full path of every hit whose path names a host;
// then `full` and `block` deleted from every hit, and under --identities or --domains each path, ref
// and remote name printed with every host and local part it holds redacted, under --domains with no
// domain confirmed yet. Returns the `detail` field, or null.
export function finishHits(hits, { opt, detail, refs, remotes, stop }) {
  if (!opt.identities && !opt.domains) { for (const h of hits) { delete h.block; delete h.full; } return null; }
  // with no domain confirmed yet, a name of three labels or more is folded as proposable() folds one
  const fold = (p) => p.replace(/(?<![A-Za-z0-9.-])[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z][A-Za-z0-9-]*(?![A-Za-z0-9.-])/g, (n) => (n.split('.').length > 2 ? proposable(n) : n));
  const red = (p) => (!p ? p : opt.domains ? fold(pathHosts(p, []).shown) : pathHosts(p, opt.internal).shown);
  if (opt.identities) {
    for (const ref of refs) for (const h of pathHosts(ref, opt.internal).hits) hits.push({ ...h, shape: 'ref', commit: null, path: ref, line: null, at_head: null });
  }
  let out = null;
  if (detail) try { out = { path: detail.rel, count: writeDetail(detail.abs, hits.filter((h) => h.full || (h.path && red(h.path) !== h.path))) }; } catch { stop('the --detail file could not be written'); }
  for (const h of hits) { delete h.block; delete h.full; h.path = red(h.path); if (h.from) h.from = red(h.from); }
  refs.splice(0, refs.length, ...refs.map(red));
  for (const r of remotes) r.name = red(r.name);
  return out;
}

// Every author and committer address of every ref, and every tagger address, raw and lowercased: a
// Map from the address to the roles it held and the first commit that carries it; and the email and
// host hits of every commit and tag message, each once, at the first commit that holds it. stop(why)
// hears each reason the read did not finish.
async function readIdentities(top, run, deadline, opt, stop) {
  const seen = new Map(); const messages = new Map();
  const note = (addr, role, commit) => {
    const a = (addr || '').toLowerCase();
    if (!a) return;
    const e = seen.get(a) || seen.set(a, { roles: new Set(), commit }).get(a);
    e.roles.add(role);
  };
  // a secret in a message is a hit of the line's shapes, the line itself never kept past the run
  const read = (text, shape, commit) => {
    if (!opt.identities) return;
    const found = contentHits(text, opt.internal).map((h) => [h.kind + '\0' + h.full, h]);
    const s = shapesOf(text);
    if (s) found.push(['secret\0' + text, { kind: 'secret', shape: s }]);
    for (const [k, h] of found) if (!messages.has(k)) messages.set(k, { ...h, shape: h.kind === 'secret' ? h.shape : shape, commit, path: null, line: null, at_head: null });
  };
  // %w indents every line of the message by one space, so no line of it can start with the walk's
  // `#commit ` header or the identity line's \x01; it also cuts its output at a NUL byte, so the two
  // addresses are parted by \x02
  stop(await stream(top, ['-c', 'log.mailmap=false', 'log', '--all', '--reverse', '--topo-order', '--no-use-mailmap',
    '--no-color', '--format=#commit %H%n%x01%ae%x02%ce%n%w(0,1,1)%B'], deadline, (l, commit) => {
    if (l[0] !== '\x01') return read(l.slice(1), 'message', commit);
    const [a, c] = l.slice(1).split('\x02'); note(a, 'author', commit); note(c, 'committer', commit);
  }));
  try {
    const fmt = '--format=%(objecttype)%00%(*objectname)%00%(taggeremail)%00%(contents)%02';
    for (const rec of run(['for-each-ref', fmt, 'refs/tags']).split('\x02')) {
      const [type, commit, addr, body] = rec.replace(/^\n/, '').split('\0');
      if (type !== 'tag') continue; // a lightweight tag: no tagger, no message of its own
      note((addr || '').replace(/^<|>$/g, ''), 'tagger', commit || null);
      for (const l of (body || '').split('\n')) read(l, 'tag message', commit || null);
    }
  } catch { stop('git could not read the tags'); }
  return { addresses: seen, messages: [...messages.values()] };
}

// The identity pass of history-scan.mjs: under --identities a hit for each address in an internal
// domain, at the first commit that carries it and at no path, and each email and host a message
// holds; under --domains the domains the identities use, counted by address, and the domains of the
// remotes, each as proposable() prints it. A git failure reaches stop(), never read as no identity.
export async function identityPass(top, run, deadline, opt, stop) {
  const { addresses, messages } = await readIdentities(top, run, deadline, opt, stop);
  const hits = [];
  for (const [addr, { roles, commit }] of addresses) {
    const h = opt.identities && emailHit(addr, opt.internal);
    if (h) hits.push({ ...h, shape: [...roles].join(', '), commit, path: null, line: null, at_head: null });
  }
  hits.push(...messages);
  if (!opt.domains) return { hits, domains: null };
  const count = new Map(); const remotes = new Set();
  for (const addr of addresses.keys()) {
    const at = addr.lastIndexOf('@'); const d = at > 0 && at < addr.length - 1 ? proposable(addr.slice(at + 1)) : '<redacted: address with no domain>';
    count.set(d, (count.get(d) || 0) + 1);
  }
  // every fetch and push URL of every remote, as stored; exit 1 is a repository with none
  let urls = '';
  try { urls = run(['config', '--get-regexp', '^remote\\..*\\.(url|pushurl)$']); } catch (e) { if (e.status !== 1) stop('git could not read the remotes'); }
  for (const l of urls.split('\n')) { const r = l.includes(' ') ? remoteDomain(l.slice(l.indexOf(' ') + 1).trim()) : null; if (r) remotes.add(r); }
  return { hits, domains: { identities: [...count].sort().map(([domain, n]) => ({ domain, count: n })), remotes: [...remotes].sort() } };
}

// The domain of a remote as proposable() prints it, read from the URL the repository stores rather
// than one a user's insteadOf rewrites to; null for a path. The URL and its login are never kept.
function remoteDomain(url) {
  let h = '';
  try { h = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? new URL(url).hostname : ''; } catch { h = ''; }
  if (!h) { const m = /^(?:[^@/:\\]+@)?([^:/\\]+):(?!\/\/)/.exec(url); h = m && m[1].length > 1 ? m[1] : ''; }
  return h ? proposable(h.replace(/^\[|\]$/g, '')) : null;
}

// The --detail path, checked before the walk: inside the repository, in a directory that exists, not
// a file already there, and ignored by git, so the full emails and hosts it will hold never reach a
// commit. Returns the absolute path and the path relative to the repository, or throws with why.
export function detailPath(top, run, given) {
  const abs = resolve(given);
  let dir;
  // the native call, which also expands a Windows short name, so both sides are spelled one way
  try { dir = realpathSync.native(dirname(abs)); } catch { throw new Error('the directory of --detail does not exist'); }
  const rel = relative(realpathSync.native(top), resolve(dir, basename(abs)));
  if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) throw new Error('--detail is outside the repository');
  if (existsSync(abs)) throw new Error('--detail names a file that already exists');
  const posix = rel.split(sep).join('/');
  let ignored = false;
  try { run(['check-ignore', '-q', '--', posix]); ignored = true; } catch (e) { if (e.status !== 1) throw new Error('git could not say whether --detail is ignored, so nothing was written'); }
  if (!ignored) throw new Error('--detail is not ignored by git, so nothing was written');
  return { abs, rel: posix };
}

// The detail file, one tab-separated line per email or host hit with its full value and full path;
// written once, readable by its owner alone where the system allows it, a cell that a spreadsheet
// would read as a formula opened with a quote. Returns how many lines it holds.
export function writeDetail(abs, hits) {
  const cell = (v) => String(v ?? '').replace(/[\t\r\n]/g, ' ').replace(/^[=+\-@]/, "'$&");
  const rows = hits.filter((h) => h.full).map((h) => [h.kind, h.class, h.shape, h.full, h.commit, h.path, h.line, h.at_head].map(cell).join('\t'));
  writeFileSync(abs, ['kind\tclass\twhere\tvalue\tcommit\tpath\tline\tat_head', ...rows].join('\n') + '\n', { flag: 'wx', mode: 0o600 });
  return rows.length;
}
