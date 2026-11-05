// The findings matcher on sample reports, with no model call and no seed: each case in
// matcher-cases/expected.json names a report, the answer key and what the matcher must make of it.
// Run it after any change to findingsIn, matchFindings or severityOf: node tests/bench/check-matcher.mjs
// Exit 0 when every case holds, 1 otherwise.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findingsIn, matchFindings } from './lib/checks.mjs';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'matcher-cases');
const spec = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf8'));
const key = JSON.parse(readFileSync(join(dir, spec.answer), 'utf8'));
let failed = 0;
for (const c of spec.cases) {
  const read = findingsIn(readFileSync(join(dir, c.text), 'utf8'), spec.files);
  const m = matchFindings(read.findings, key, { securityOnly: !!c.securityOnly });
  const got = {
    found: m.found,
    precision: m.counts.match(/(\d+\/\d+) findings true/)[1],
    severityDisagreements: m.severityDisagreements,
    unlocated: read.unlocated,
  };
  const ok = JSON.stringify(got) === JSON.stringify(c.expect);
  if (!ok) failed++;
  process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${c.text}${ok ? '' : `\n  expected ${JSON.stringify(c.expect)}\n  got      ${JSON.stringify(got)}`}\n`);
}
process.exit(failed ? 1 : 0);
