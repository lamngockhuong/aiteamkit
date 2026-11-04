// atkx:doc-audit tally: validates the verdict table and counts it.
//
// A script because the pilot's agent miscounted its own table, and because a verdict outside the
// three, or a WRONG with no evidence, must be refused the same way every time. The table and its
// rules are those of the skill's full-audit and claims references; the two must agree.
//
// Usage:
//   node tally.mjs [--final] < table.md   validate and count the table on standard input
//   node tally.mjs --report-dir           make a directory readable by the user alone under the
//                                         system's temporary directory and print its path
//
// Input: Markdown, any lines; the rows are those after a header row whose first cell is Document,
// nine cells each: Document | Line | Claim | Type | Verdict | Evidence | Settled by | Owner |
// Second read. A cell holding a pipe writes it as \|.
//
// --final also requires what step 5 must have done: every WRONG read a second time, and per
// document a sample of the CORRECT verdicts read a second time, a tenth of them and at least three,
// or all of them when there are fewer.
//
// Output, one JSON object on standard output:
//   valid:   { "status": "counted", "documents": { <path>: <counts> }, "total": <counts> }, exit 0
//            <counts> = { "claims", "CORRECT", "WRONG", "UNVERIFIABLE", "BEHAVIOUR", "INTENT",
//                         "wrongRead", "wrongOverturned", "sampleRead", "sampleOverturned",
//                         "cannotTell" }
//   refused: { "status": "refused", "errors": [ { "line": n, "row": "<document>:<line>",
//                                                  "reason": text } ] }, exit 1
//   --report-dir: { "status": "created", "path": path }, exit 0
// It prints no cell of the table other than a row's document and line.

import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const VERDICTS = ['CORRECT', 'WRONG', 'UNVERIFIABLE'];
const TYPES = ['BEHAVIOUR', 'INTENT'];
const SAMPLE_RATE = 0.1, SAMPLE_MIN = 3;

const print = (o) => process.stdout.write(JSON.stringify(o, null, 2) + '\n');

if (process.argv.includes('--report-dir')) {
  const dir = mkdtempSync(join(tmpdir(), 'doc-audit-'));
  chmodSync(dir, 0o700);
  // Set, then checked rather than assumed; a directory that still lets others in is removed
  if (process.platform !== 'win32' && (statSync(dir).mode & 0o077) !== 0) {
    rmSync(dir, { recursive: true, force: true });
    process.stderr.write(`${dir} is readable by others; not used\n`); process.exit(2);
  }
  print({ status: 'created', path: dir });
  process.exit(0);
}

const final = process.argv.includes('--final');
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
const empty = (c) => c === '' || c === '-';
// A path:line, a quoted line, or for a claim that something is absent, the search that found none
const evidence = (c) => /[\w./-]+:\d+/.test(c) || /["“][^"”]{3,}["”]/.test(c) || /^searched .+: none\b/.test(c);

const lines = readFileSync(0, 'utf8').split('\n');
const errors = [], docs = {}, firstCorrect = {};
const zero = () => ({ claims: 0, CORRECT: 0, WRONG: 0, UNVERIFIABLE: 0, BEHAVIOUR: 0, INTENT: 0,
  wrongRead: 0, wrongOverturned: 0, sampleRead: 0, sampleOverturned: 0, cannotTell: 0 });
let inTable = false, seenHeader = false;

lines.forEach((raw, i) => {
  const n = i + 1;
  if (!raw.trim().startsWith('|')) { inTable = false; return; }
  const c = cells(raw);
  if (c[0] === 'Document') { inTable = true; seenHeader = true; return; }
  if (c.every((x) => /^:?-{3,}:?$/.test(x))) return;
  // A row after a line that broke the table, a blank line where per-section tables were joined, is
  // refused rather than skipped: skipped, it would drop out of the counts and of --final unseen
  if (!inTable) { if (seenHeader) errors.push({ line: n, row: `${c[0]}:${c[1]}`, reason: 'a row outside a table: repeat the Document header above it, or remove the line that broke the table' }); return; }
  const row = `${c[0]}:${c[1]}`;
  const err = (reason) => errors.push({ line: n, row, reason });
  if (c.length !== 9) return err(`${c.length} cells, not 9`);
  const [doc, at, , type, verdict, ev, settledBy, owner, second] = c;
  if (empty(doc)) err('no document');
  if (!/^\d+(-\d+)?$/.test(at)) err('the line is not a number or a range');
  if (!TYPES.includes(type)) err(`type ${JSON.stringify(type)} is not BEHAVIOUR or INTENT`);
  if (!VERDICTS.includes(verdict)) return err(`verdict ${JSON.stringify(verdict)} is not one of CORRECT, WRONG, UNVERIFIABLE`);
  if (verdict === 'UNVERIFIABLE') {
    if (empty(ev)) err('UNVERIFIABLE without the reason no source settled it');
    if (empty(settledBy)) err('UNVERIFIABLE without the source that would settle it');
    if (empty(owner)) err('UNVERIFIABLE without an owner');
    else if (owner.includes('@') || /^(the )?team$/i.test(owner)) err('the owner is not a name or a role');
  } else if (!evidence(ev)) err(`${verdict} without evidence: no path:line, no quoted line and no search that found none`);
  let first = null, answer = null;
  if (!empty(second)) {
    const m = second.match(/^(CORRECT|WRONG|UNVERIFIABLE) (holds|overturned|cannot tell)$/);
    if (!m) err(`second read ${JSON.stringify(second)} is not "<first verdict> holds|overturned|cannot tell"`);
    else {
      [, first, answer] = m;
      if (first === 'UNVERIFIABLE') err('an UNVERIFIABLE verdict is not read a second time');
      if (answer === 'holds' && verdict !== first) err(`second read says ${first} holds, but the verdict is ${verdict}`);
      if (answer === 'overturned' && verdict === first) err(`second read says ${first} was overturned, but the verdict is still ${verdict}`);
      if (answer === 'cannot tell' && verdict !== 'UNVERIFIABLE') err('second read could not tell, but the verdict is not UNVERIFIABLE');
    }
  }
  if (final && verdict === 'WRONG' && !first) err('a WRONG verdict not read a second time');
  const d = (docs[doc] ??= zero());
  d.claims++; d[verdict]++; if (TYPES.includes(type)) d[type]++;
  if (answer === 'cannot tell') d.cannotTell++;
  if (first === 'WRONG') { d.wrongRead++; if (answer === 'overturned') d.wrongOverturned++; }
  if (first === 'CORRECT') { d.sampleRead++; if (answer === 'overturned') d.sampleOverturned++; }
  if (first === 'CORRECT' || (!first && verdict === 'CORRECT')) firstCorrect[doc] = (firstCorrect[doc] ?? 0) + 1;
});

if (!Object.keys(docs).length && !errors.length) errors.push({ line: 0, row: '-', reason: 'no table with a Document header found' });
if (final) {
  for (const [doc, d] of Object.entries(docs)) {
    const fc = firstCorrect[doc] ?? 0;
    const want = Math.min(fc, Math.max(SAMPLE_MIN, Math.ceil(fc * SAMPLE_RATE)));
    if (d.sampleRead < want) errors.push({ line: 0, row: doc, reason: `${d.sampleRead} CORRECT verdicts read a second time, at least ${want} required` });
  }
}
if (errors.length) { print({ status: 'refused', errors }); process.exit(1); }

const total = zero();
for (const d of Object.values(docs)) for (const k of Object.keys(total)) total[k] += d[k];
print({ status: 'counted', documents: docs, total });
