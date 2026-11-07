// The findings matcher on sample reports, with no model call and no seed: each case in
// matcher-cases/expected.json names a report, the answer key and what the matcher must make of it.
// A case may also name `turns`, files read as the closing messages of a run's turns, through the
// same filter the findings check applies to them.
// Run it after any change to measureTexts or what it calls: node tests/bench/check-matcher.mjs
// Exit 0 when every case holds, 1 otherwise. tests/verify.sh runs it.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureTexts } from './lib/checks.mjs';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'matcher-cases');
const spec = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf8'));
const key = JSON.parse(readFileSync(join(dir, spec.answer), 'utf8'));
const textOf = (f) => readFileSync(join(dir, f), 'utf8');
let failed = 0;
for (const c of spec.cases) {
  const { m, unlocated } = measureTexts({ reports: [textOf(c.text)], turns: (c.turns || []).map(textOf), files: spec.files, key, securityOnly: !!c.securityOnly });
  const got = {
    found: m.found,
    precision: m.counts.match(/(\d+\/\d+) findings true/)[1],
    severityDisagreements: m.severityDisagreements,
    unlocated,
  };
  const ok = JSON.stringify(got) === JSON.stringify(c.expect);
  if (!ok) failed++;
  process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${c.text}${c.turns ? ` with ${c.turns.join(', ')}` : ''}${ok ? '' : `\n  expected ${JSON.stringify(c.expect)}\n  got      ${JSON.stringify(got)}`}\n`);
}
process.exit(failed ? 1 : 0);
