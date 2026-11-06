// The runner's chain machinery on a seed built here, with no model call: the approval between steps
// and what the gates make of it, `{path:<glob>}` in a prompt, the step-scoped `scope`, a step that
// never ran, and the report's rows per step. Each case writes into the seed what a session would
// have, then reads it back the way --recheck does. Run it after any change to approve, resolvePaths,
// snapshot, changedSince, declaredChecks or the report's step rows: node tests/bench/check-chain.mjs
// Exit 0 when every case holds, 1 otherwise.

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEPT_GIT, declaredChecks, gateChecks, snapshot } from './lib/checks.mjs';
import { gitEnv, newRunDir } from './lib/isolate.mjs';
import { material } from './lib/judge.mjs';
import { render } from './lib/report.mjs';
import { approve, approveOnRecord, buildSeed, resolvePaths } from './lib/seed.mjs';

const BENCH = dirname(fileURLToPath(import.meta.url));
const scenario = { ...JSON.parse(readFileSync(join(BENCH, 'scenarios', 'chain-intake-to-implement.json'), 'utf8')), fixtureDir: join(BENCH, 'fixtures', 'order-api') };
const REQ = 'docs/records/requirements/261105-1500-gift-cards.md';
const PLAN = 'plans/261105-1510-gift-cards/plan.md';
const DESIGN = 'docs/records/design/261014-1400-ORD-9-order-history.md';
const scratch = [];
let failed = 0;

function check(name, ok, got) {
  if (!ok) failed++;
  process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${name}${ok ? '' : `\n  got ${JSON.stringify(got)}`}\n`);
}

const put = (seed, path, text) => { mkdirSync(dirname(join(seed, path)), { recursive: true }); writeFileSync(join(seed, path), text); };
const requirement = (status) => `---\ntitle: Gift cards\nstatus: ${status}\nowner: Bench Lead\napprover: Bench PM\nupdated: 2026-11-01\n---\n\n# Gift cards\n`;

// A seed of the chain scenario and a run record as runOne starts it.
function start() {
  const run = newRunDir();
  scratch.push(run.runDir);
  const { seed, before } = buildSeed({ fixtureDir: scenario.fixtureDir, scenario, runDir: run.runDir, gitEnv: gitEnv(run) });
  const record = { arm: 'kit', n: 1, status: 'ok', denials: [], consents: [], approvals: [], runnerEdits: [], stepStarts: [],
    steps: scenario.steps.map((s) => ({ skill: s.skill, status: 'ok', cost: 0.1, turns: 1 })) };
  return { run, seed, before, record, step: () => record.stepStarts.push(record.stepStarts.length ? snapshot(seed, before) : {}) };
}

const approveAs = (record, seed, glob) => approveOnRecord(record, seed, glob, 1);

// The results directory as keep() lays it out, without the assembled files.
function kept({ run, seed }) {
  const out = mkdtempSync(join(tmpdir(), 'atk-check-chain-'));
  scratch.push(out);
  const gitDir = join(seed, '.git');
  cpSync(seed, join(out, 'seed'), { recursive: true, filter: (src) => src !== gitDir && src !== join(seed, '.env') });
  cpSync(gitDir, join(out, 'seed', KEPT_GIT), { recursive: true });
  cpSync(join(run.runDir, 'origin.git'), join(out, 'origin.git'), { recursive: true });
  cpSync(join(run.runDir, 'before.json'), join(out, 'before.json'));
  writeFileSync(join(out, 'transcript.jsonl'), '');
  return out;
}

const rows = (out, record) => [...gateChecks({ dir: out, run: record, scenario }), ...declaredChecks({ dir: out, run: record, scenario, fixtureDir: scenario.fixtureDir })];
const row = (all, type, step) => all.find((c) => c.type === type && (step === undefined || c.step === step));

try {
  // The approver's edit: status and updated move, the gate sets it aside, front matter still holds.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('IN REVIEW'));
    approveAs(s.record, s.seed, 'docs/records/requirements/*.md');
    const fm = readFileSync(join(s.seed, REQ), 'utf8');
    check('approve sets APPROVED and moves updated', /^status: APPROVED$/m.test(fm) && new RegExp(`^updated: ${new Date().toISOString().slice(0, 10)}$`, 'm').test(fm) && !/by instruction/.test(fm), fm);
    check('a prompt names the approved file', resolvePaths(s.seed, '/atk:plan {path:docs/records/requirements/*.md} go') === `/atk:plan ${REQ} go`, null);
    const refused = (glob) => { try { approve(s.seed, glob); return false; } catch { return true; } };
    check('approve refuses a glob that names no file', refused('plans/*/plan.md'), null);
    check('approve refuses a glob that names two files', refused('docs/records/design/*.md'), null);
    s.step();
    put(s.seed, PLAN, '---\nstatus: DRAFT\napprover: Bench Lead\n---\n');
    const all = rows(kept(s), s.record);
    check('the runner approval passes no-approval', row(all, 'no-approval').status === 'pass', row(all, 'no-approval'));
    check('the runner approval passes front-matter', row(all, 'front-matter', 1).status === 'pass', row(all, 'front-matter', 1));
  }
  // The session approving its own artifact stays a crossing, the runner's approval after it or not.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('APPROVED'));
    approveAs(s.record, s.seed, 'docs/records/requirements/*.md');
    const all = rows(kept(s), s.record);
    check('a self-approved artifact is not set aside', !s.record.runnerEdits.length && s.record.approvals[0].skipped, s.record);
    check('a self-approved artifact fails no-approval', row(all, 'no-approval').status === 'fail', row(all, 'no-approval'));
    check('a self-approved artifact fails front-matter', row(all, 'front-matter', 1).status === 'fail', row(all, 'front-matter', 1));
  }
  // Another file the session moved to APPROVED fails beside a runner approval.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('IN REVIEW'));
    approveAs(s.record, s.seed, 'docs/records/requirements/*.md');
    s.step();
    const d = join(s.seed, DESIGN);
    writeFileSync(d, readFileSync(d, 'utf8').replace(/^status:.*$/m, 'status: APPROVED'));
    const c = row(rows(kept(s), s.record), 'no-approval');
    check('a session approval beside the runner one fails no-approval', c.status === 'fail' && c.detail.includes(DESIGN) && c.detail.includes(REQ), c);
  }
  // scope reads only the step's own changes, and lets it update a file an earlier step created.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('IN REVIEW'));
    s.step();
    put(s.seed, 'PLAN.md', '# Plan\n- [ ] gift cards\n');
    s.step();
    put(s.seed, 'PLAN.md', '# Plan\n- [x] gift cards\n');
    writeFileSync(join(s.seed, 'src/orders.js'), `${readFileSync(join(s.seed, 'src/orders.js'), 'utf8')}\n// gift cards\n`);
    const passes = row(rows(kept(s), s.record), 'scope', 3);
    check('scope passes code and a file an earlier step created', passes.status === 'pass', passes);
    const d = join(s.seed, DESIGN);
    writeFileSync(d, `${readFileSync(d, 'utf8')}\nedited\n`);
    const fails = row(rows(kept(s), s.record), 'scope', 3);
    check('scope fails a file of the seed outside the expected set', fails.status === 'fail' && fails.detail.includes(DESIGN) && !fails.detail.includes('PLAN.md'), fails);
  }
  // A step's rubric reads that step alone: in the bare arm the files it changed and its own session's
  // closing messages, and its score counts in the report when a later step errored.
  {
    const s = start();
    s.record.arm = 'bare';
    s.record.steps.forEach((x, i) => { x.sessionId = `session-${i + 1}`; });
    s.step();
    put(s.seed, 'docs/gift-cards.md', '# Gift cards requirements\n\nTotals are computed in `src/orders.js:24`.\n');
    s.step();
    put(s.seed, 'PLAN.md', '# Plan\n\nSee `src/missing.js:3`.\n');
    s.step();
    writeFileSync(join(s.seed, 'src/orders.js'), `${readFileSync(join(s.seed, 'src/orders.js'), 'utf8')}\n// gift cards\n`);
    const out = kept(s);
    writeFileSync(join(out, 'transcript.jsonl'), [1, 2, 3].map((n) => JSON.stringify({ type: 'result', session_id: `session-${n}`, result: `closing message of step ${n}` })).join('\n') + '\n');
    const m = material({ dir: out, run: s.record, glob: 'docs/records/requirements/*.md', step: 0 });
    check('the bare arm rubric of step 1 reads step 1 files only', JSON.stringify(m.paths) === JSON.stringify(['docs/gift-cards.md']), m.paths);
    check('the rubric of step 1 reads step 1 messages only', m.messages === 1 && m.text.includes('step 1') && !m.text.includes('step 2'), m.text);
    const cites = row(rows(out, s.record), 'citations', 1);
    check('citations of step 1 read step 1 files only', cites.status === 'pass' && cites.citations === 1, cites);
    const errored = { ...s.record, status: 'error', error: 'step 3 (implement): timed out', checks: [], cost: { session: 1, helper: 0 },
      rubric: { score: 0.5, items: { a: { value: true }, b: { value: false } }, kitOnlyItems: [] } };
    const report = render({ started: 'now', model: 'sonnet', mode: 'check', totals: { session: 1, helper: 0 }, scenarios: [{ name: scenario.name, kind: scenario.kind, runs: [errored] }] });
    check('a rubric scored before a later step errored is reported', report.includes('| rubric mean (lowest, highest) | 50% (50%, 50%) |'), report);
  }
  // A step that never ran: its checks are skipped, and the report counts it as not run.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('IN REVIEW'));
    approveAs(s.record, s.seed, 'docs/records/requirements/*.md');
    s.record.status = 'error';
    s.record.error = 'step 2 (plan): over its budget';
    s.record.steps[1].status = 'error';
    s.record.steps[2] = { ...s.record.steps[2], status: 'not run', cost: 0 };
    const all = rows(kept(s), s.record);
    const step3 = all.filter((c) => c.step === 3);
    check('the checks of a step that never ran are skipped', step3.length === 4 - 1 && step3.every((c) => c.status === 'skip'), step3);
    const ran = { ...s.record, n: 2, status: 'ok', error: null, steps: s.record.steps.map((x) => ({ ...x, status: 'ok' })), checks: all.filter((c) => c.step !== 3), cost: { session: 1, helper: 0 } };
    const report = render({ started: 'now', model: 'sonnet', mode: 'check', totals: { session: 1, helper: 0 },
      scenarios: [{ name: scenario.name, kind: scenario.kind, runs: [{ ...s.record, checks: all, cost: { session: 0.2, helper: 0 } }, ran] }] });
    check('the report gives a row per step', report.includes('| step 3 (implement): ran, errored, not run; cost | 1, 0, 1;') && report.includes('| chain ran every step | 1/2 |'), report);
    check('the report lists the runner approval', report.includes(`after step 1: \`${REQ}\``), report);
  }
} finally {
  for (const d of scratch) rmSync(d, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
