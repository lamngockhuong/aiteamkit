// atk:security head-at-hit-compare: the `at_head` of each history-scan hit, decided inside the script
// from HEAD's tree and the blob of each path hit, so that neither the line nor any hash of it is ever
// printed. One file is read at a time and with no time limit, since a hit left unread would read as
// removed; never a blob of a file rule 9 of shared/team-roles.md names, and nothing at all in a
// partial clone, whose trees may be missing.

import { blobReader } from './git-history-stream.mjs';

// Whether a lowercased text holds a value at its own edges, so `10.1.2.3` is not found inside
// `110.1.2.30`, nor `a@b.com` inside `xa@b.com`. A quote before an email is part of its local part
// only after a letter, as in `o'brien`, so `'a@b.com'` holds it; a host never takes one.
function holds(low, value) {
  const email = value.includes('@');
  for (let i = low.indexOf(value); i >= 0; i = low.indexOf(value, i + 1)) {
    const before = low[i - 1] || ''; const after = low.slice(i + value.length, i + value.length + 2);
    const joined = email
      ? /[a-z0-9._%+-]/.test(before) || (before === "'" && /\p{L}/u.test(low[i - 2] || ''))
      : /[a-z0-9.-]/.test(before);
    if (!joined && !/^(?:[a-z0-9_-]|\.[a-z0-9])/.test(after)) return true;
  }
  return false;
}

// Sets at_head on every hit: `present` when HEAD holds the same lines at that path, `removed` when
// the path is there without them, `path-gone` when it is not. An email or a host is compared by its
// value rather than its line, since the line that first held it may since have changed around it. A
// credential file, never read, and a path that is itself a host are `present` while the path is; an
// identity or a message, at no path, keeps null, and so does every hit when HEAD names no commit or
// could not be listed, and a hit HEAD could not be read for. A hit to compare carries its lines in
// `block`. stop(why) hears what git could not do.
export async function decideAtHead(hits, { top, run, headSha, partial, stop }) {
  let headPaths = new Set(); let listed = false;
  if (headSha && !partial) try { headPaths = new Set(run(['ls-tree', '-r', '-z', '--name-only', 'HEAD']).split('\0').filter(Boolean)); listed = true; } catch { stop('git could not list HEAD'); }
  if (!listed) return;
  const read = hits.filter((h) => h.block && h.kind !== 'credential-file' && headPaths.has(h.path)).sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const head = read.length ? blobReader(top, Infinity) : null; let at = null; let text = ''; let low = '';
  const unknown = new Set();
  try {
    for (const h of read) {
      if (h.path !== at) { text = '\n' + ((await head.read('HEAD:' + (at = h.path))) ?? '') + '\n'; low = text.toLowerCase(); }
      const held = h.full ? holds(low, h.full) : text.includes('\n' + h.block.join('\n') + '\n');
      h.at_head = held ? 'present' : 'removed';
    }
  } catch { stop('git could not read HEAD to compare the hits with'); for (const h of read) if (!h.at_head) unknown.add(h); } finally { head?.end(); }
  for (const h of hits) {
    if (h.path === null || unknown.has(h) || h.shape === 'ref') continue;
    if (!headPaths.has(h.path)) h.at_head = 'path-gone';
    else if (h.kind === 'credential-file' || h.shape === 'path') h.at_head = 'present';
    else h.at_head ??= 'removed';
  }
}
