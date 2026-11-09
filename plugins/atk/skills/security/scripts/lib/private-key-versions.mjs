// atk:security private-key-versions: which versions of a file the history scan reads whole for a
// private key. A key is read from the whole file rather than from a diff, since a diff shows only the
// lines that changed and a key whose body alone was replaced shows no BEGIN line; reading every
// version of a file that ever held a BEGIN line is too much for a large file with many versions, a
// bundle naming the marker in its code among them, so a version is read only when it can hold a
// complete block, and one at a time.
//
// A version can hold a complete block only when the version it replaced held one, or its diff added
// a BEGIN or an END line or removed a BEGIN line. Otherwise every BEGIN and END line it holds, and
// every BEGIN line between them, was already in the version before, which then held the same block.
// The version before is the old blob of the diff, read earlier, since the history is walked parents
// first; a file that only names the marker is read once, for the diff that added the line.

import { BLOCK_BEGIN, BLOCK_END, keyBlocks } from './secret-shapes.mjs';

// Whether one line of a diff, its `+` or `-` included, can make or unmake a complete block.
export function touchesBlock(l) {
  if (!l.includes('-----')) return false;
  if (l[0] === '+') return BLOCK_BEGIN.test(l) || BLOCK_END.test(l);
  return l[0] === '-' && BLOCK_BEGIN.test(l);
}

// Reads, in the order given, each version that can hold a complete block, and hands each block on
// with its version. versions: { blob, old, path, commit, touched }, touched from touchesBlock over
// that version's diff. read(blob) resolves to its text or null; a rejection stops here and reaches
// the caller, which keeps the blocks already handed on.
export async function readKeyVersions(versions, read, onBlock) {
  const withBlocks = new Set(); const done = new Set();
  for (const v of versions) {
    const key = v.blob + '\0' + v.path;
    if (done.has(key) || !(v.touched || withBlocks.has(v.old))) continue;
    done.add(key);
    const text = (await read(v.blob)) ?? '';
    const blocks = text.includes('PRIVATE KEY-----') ? keyBlocks(text) : [];
    if (blocks.length) withBlocks.add(v.blob);
    // each line copied, so a block kept as a hit does not keep the whole file it was cut from
    for (const b of blocks) onBlock(v, { line: b.line, lines: b.lines.map((s) => Buffer.from(s).toString()) });
  }
}
