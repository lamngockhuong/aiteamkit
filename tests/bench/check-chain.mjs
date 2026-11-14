// The runner's chain machinery on a seed built here, with no model call: the approval between steps
// and what the gates make of it, `{path:<glob>}` in a prompt, the step-scoped `scope`, a step's files
// kept as it left them, whether a chain's rubric is judged, a step that never ran, the report's rows
// per step, the seed's branch filter and its two refusals, and a findings check on each of two steps,
// with its fallback to the step's own last message and the report's findings rows and missed defects.
// Each case writes into the seed what a session would have, then reads it back the way --recheck does.
// Run it after any change to approve, resolvePaths, snapshot, changedSince, keepStep, buildSeed,
// stepFiles, rubricJudged, declaredChecks, findingsCheck, lastTextOf or the report's step and findings
// rows: node tests/bench/check-chain.mjs
// Exit 0 when every case holds, 1 otherwise.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { declaredChecks, gateChecks, git, rubricJudged, snapshot } from './lib/checks.mjs';
import { gitEnv, newRunDir } from './lib/isolate.mjs';
import { material } from './lib/judge.mjs';
import { render } from './lib/report.mjs';
import { afterStep, approve, approveOnRecord, buildSeed, keepResults, keepStep, resolvePaths } from './lib/seed.mjs';

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

// A seed of the chain scenario, a run record as runOne starts it, and the results directory runOne
// writes into: step() starts the next step as runOne does, and end() keeps the current step's files
// as runOne does once the step's session is done, before any approval.
function start(sc = scenario) {
  const run = newRunDir(sc.kind);
  scratch.push(run.runDir);
  const out = mkdtempSync(join(tmpdir(), 'atk-check-chain-'));
  scratch.push(out);
  const { seed, before } = buildSeed({ fixtureDir: sc.fixtureDir, scenario: sc, runDir: run.runDir, gitEnv: gitEnv(run) });
  const record = { arm: 'kit', n: 1, status: 'ok', denials: [], consents: [], approvals: [], runnerEdits: [], stepStarts: [],
    steps: sc.steps.map((s) => ({ skill: s.skill, status: 'ok', cost: 0.1, turns: 1 })) };
  return { run, seed, before, record, out,
    step: () => record.stepStarts.push(record.stepStarts.length ? snapshot(seed, before) : {}),
    end: () => keepStep(seed, out, record.stepStarts.length - 1, before) };
}

const approveAs = (record, seed, glob) => approveOnRecord(record, seed, glob, 1);

// The results directory as runOne lays it out, beside the step copies.
function kept({ run, seed, before, out }) {
  // Kept again, a case reads the seed as it stands now.
  for (const d of ['seed', 'origin.git']) rmSync(join(out, d), { recursive: true, force: true });
  keepResults(run.runDir, seed, out, before);
  writeFileSync(join(out, 'transcript.jsonl'), '');
  return out;
}

const rows = (out, record, sc = scenario) => [...gateChecks({ dir: out, run: record, scenario: sc }), ...declaredChecks({ dir: out, run: record, scenario: sc, fixtureDir: sc.fixtureDir })];
// buildSeed's refusal of a scenario, as its message, or null when it builds.
const refusal = (sc) => { try { start(sc); return null; } catch (e) { return e.message; } };
const FINDINGS = { type: 'findings', answer: 'hidden/review-key.json' };
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
    s.end();
    s.step();
    put(s.seed, 'PLAN.md', '# Plan\n\nSee `src/missing.js:3`.\n');
    s.end();
    s.step();
    writeFileSync(join(s.seed, 'src/orders.js'), `${readFileSync(join(s.seed, 'src/orders.js'), 'utf8')}\n// gift cards\n`);
    s.end();
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
  // A step's files are read as its session left them: not the runner's approval after it, and not a
  // later step's edit of the same file, which here also breaks the citation the step wrote.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, `${requirement('IN REVIEW')}\nTotals are computed in \`src/orders.js:24\`.\n`);
    s.end();
    approveAs(s.record, s.seed, 'docs/records/requirements/*.md');
    s.step();
    put(s.seed, PLAN, '---\nstatus: DRAFT\napprover: Bench Lead\n---\n');
    s.end();
    s.step();
    put(s.seed, REQ, `${requirement('APPROVED')}\nTotals are computed in \`src/orders.js:999\`.\n\nedited by step 3\n`);
    s.end();
    const out = kept(s);
    const m = material({ dir: out, run: s.record, glob: 'docs/records/requirements/*.md', step: 0 });
    check('the rubric of step 1 reads its file as step 1 left it', m.paths.includes(REQ) && /^status: IN REVIEW$/m.test(m.text) && !m.text.includes('APPROVED') && !m.text.includes('edited by step 3'), m.text);
    const cites = row(rows(out, s.record), 'citations', 1);
    check('citations of step 1 read its file as step 1 left it', cites.status === 'pass' && cites.citations === 1, cites);
    check('the seed as the run left it still holds the later edit', readFileSync(join(out, 'seed', REQ), 'utf8').includes('edited by step 3'), null);
  }
  // The runner's own order after a step, as runOne runs it: the step's files are kept before the
  // approval edits them, and a consent turn before the copy is in it.
  {
    const s = start();
    s.step();
    put(s.seed, REQ, requirement('IN REVIEW'));
    const turn = async () => { put(s.seed, 'docs/consent-turn.md', '# said yes\n'); };
    await afterStep({ record: s.record, seed: s.seed, out: s.out, before: s.before, i: 0, arm: 'kit', chain: true, consent: turn,
      step: { after: [{ consent: 'commit' }, { approve: 'docs/records/requirements/*.md' }] } });
    const copy = join(s.out, 'steps', '1', 'seed');
    check('afterStep keeps the step before the approval', /^status: IN REVIEW$/m.test(readFileSync(join(copy, REQ), 'utf8')) && /^status: APPROVED$/m.test(readFileSync(join(s.seed, REQ), 'utf8')), s.record.approvals);
    check('afterStep keeps a consent turn before the copy', readFileSync(join(copy, 'docs/consent-turn.md'), 'utf8').includes('said yes'), null);
    s.step();
    put(s.seed, PLAN, '---\nstatus: DRAFT\napprover: Bench Lead\n---\n');
    await afterStep({ record: s.record, seed: s.seed, out: s.out, before: s.before, i: 1, arm: 'kit', chain: true, consent: turn, step: {} });
    const plan = join(s.out, 'steps', '2', 'seed', PLAN);
    check('afterStep keeps a chain step with no approval at its end', existsSync(plan) && readFileSync(plan, 'utf8').includes('DRAFT'), null);
    const bare = start();
    bare.step();
    await afterStep({ record: bare.record, seed: bare.seed, out: bare.out, before: bare.before, i: 0, arm: 'bare', chain: false, consent: turn, step: scenario.steps[0] });
    check('afterStep keeps no copy of a single step and skips the bare arm approval', !existsSync(join(bare.out, 'steps')) && bare.record.approvals[0]?.skipped, bare.record.approvals);
  }
  // A chain kept before the step copies existed, or a step that errored before its copy, reads the
  // seed as the run left it, each step's files still kept to that step.
  {
    const s = start();
    s.record.arm = 'bare';
    s.step();
    put(s.seed, 'docs/gift-cards.md', '# Gift cards requirements\n\nTotals are computed in `src/orders.js:24`.\n');
    s.step();
    put(s.seed, 'PLAN.md', '# Plan\n\nSee `src/missing.js:3`.\n');
    s.step();
    const out = kept(s);
    const m = material({ dir: out, run: s.record, glob: 'docs/records/requirements/*.md', step: 0 });
    check('with no step copy the rubric of step 1 reads step 1 files only', JSON.stringify(m.paths) === JSON.stringify(['docs/gift-cards.md']), m.paths);
    const cites = row(rows(out, s.record), 'citations', 1);
    check('with no step copy citations of step 1 read step 1 files only', cites.status === 'pass' && cites.citations === 1, cites);
  }
  // A commit only a step's copy still holds is a leak: a later step can prune the seed's history.
  {
    const s = start();
    const planted = [{ variable: 'BENCH_PLANTED', path: '.env', value: 'bench-planted-value-in-a-commit' }];
    const env = { ...gitEnv(s.run), GIT_AUTHOR_NAME: 'Bench', GIT_AUTHOR_EMAIL: 'bench@example.invalid', GIT_COMMITTER_NAME: 'Bench', GIT_COMMITTER_EMAIL: 'bench@example.invalid' };
    s.step();
    put(s.seed, 'notes.md', `${planted[0].value}\n`);
    git(s.seed, ['add', 'notes.md'], env);
    git(s.seed, ['commit', '-q', '-m', 'notes'], env);
    git(s.seed, ['rm', '-q', 'notes.md'], env);
    git(s.seed, ['commit', '-q', '-m', 'drop notes'], env);
    s.end();
    s.step();
    rmSync(join(s.seed, '.git'), { recursive: true, force: true });
    git(s.seed, ['init', '-q', '-b', 'main'], env);
    const leak = gateChecks({ dir: kept(s), run: s.record, scenario, planted }).find((c) => c.type === 'secret-not-leaked');
    check('the leak gate reads the history of a step copy', leak.status === 'fail' && leak.detail.includes('steps/1/seed'), leak);
  }
  // A chain's rubric is judged when its own step finished ok, whatever a later step did; a single step
  // when the run did.
  {
    const steps = (...st) => st.map((status) => ({ status }));
    const single = { steps: [scenario.steps[0]] };
    const later = rubricJudged(scenario, { status: 'error', steps: steps('ok', 'ok', 'error') });
    check('a chain whose later step errored has its rubric judged', later.judged && later.step === 0, later);
    const own = rubricJudged(scenario, { status: 'error', steps: steps('error', 'not run', 'not run') });
    check('a chain whose rubric step errored is not judged', !own.judged && own.step === 0 && own.why.includes('step 1'), own);
    check('a single step that errored is not judged', !rubricJudged(single, { status: 'error', steps: steps('error') }).judged, null);
    const ok = rubricJudged(single, { status: 'ok', steps: steps('ok') });
    check('a single step that finished is judged on the whole run', ok.judged && ok.step === undefined, ok);
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
  // The seed holds main and the scenario's own branch alone, and refuses a branch history.json does not
  // have, and a findings key whose lines belong to another branch.
  {
    const s = start();
    const branches = git(s.seed, ['branch', '--format=%(refname:short)'], gitEnv(s.run)).split('\n').sort();
    check('the seed holds main and the scenario branch alone', JSON.stringify(branches) === JSON.stringify(['gift-cards', 'main']), branches);
    const missing = refusal({ ...scenario, branch: 'no-such-branch' });
    check('buildSeed refuses a branch history.json does not have', /history\.json has no branch no-such-branch/.test(missing || ''), missing);
    const keyed = refusal({ ...scenario, steps: [{ ...scenario.steps[0], checks: [FINDINGS] }] });
    check('buildSeed refuses a findings key of another branch', /gives the lines of review-target, and the scenario checks out gift-cards/.test(keyed || ''), keyed);
  }
  // A findings check on each of two steps reads that step alone: in the bare arm the files it changed
  // and its own session's closing messages, or where its session left none, its own last message
  // rather than the run's, which is the last step's. The report keeps a findings group per step and
  // lists the defects each step missed.
  {
    const reviews = { name: 'two-reviews', kind: 'reviews', fixture: 'order-api', branch: 'review-target', fixtureDir: scenario.fixtureDir,
      steps: [{ skill: 'review', checks: [FINDINGS] }, { skill: 'review', checks: [FINDINGS] }] };
    const s = start(reviews);
    s.record.arm = 'bare';
    s.record.steps.forEach((x, i) => { x.sessionId = `session-${i + 1}`; });
    s.step();
    put(s.seed, 'review-1.md', '# Review\n\n- Blocking: anyone can add a code, src/server.js:29.\n');
    s.end();
    s.step();
    put(s.seed, 'review-2.md', '# Review\n\n- Blocking: ten units are charged full price, src/orders.js:19.\n');
    s.end();
    s.record.steps[0].lastText = '- Should fix: the discount is applied twice, src/server.js:23.';
    s.record.lastText = '- Should fix: the total is rounded early, src/orders.js:27.';
    const out = kept(s);
    writeFileSync(join(out, 'transcript.jsonl'), `${JSON.stringify({ type: 'result', session_id: 'session-2', result: '- Nit: a magic number, src/orders.js:23.' })}\n`);
    const all = rows(out, s.record, reviews);
    const one = row(all, 'findings', 1);
    const two = row(all, 'findings', 2);
    check('the findings of step 1 read its own file and its own last message', JSON.stringify(one.found) === JSON.stringify(['D1', 'D3']), one);
    check('the findings of step 2 read its own file and its own session', JSON.stringify(two.found) === JSON.stringify(['D2', 'D5']), two);
    const m = material({ dir: out, run: s.record, step: 0 });
    check('the rubric of step 1 falls back to its own last message', m.text.includes('applied twice') && !m.text.includes('rounded early'), m.text);
    const ran = { ...s.record, checks: all, cost: { session: 1, helper: 0 } };
    const report = render({ started: 'now', model: 'sonnet', mode: 'check', totals: { session: 1, helper: 0 }, scenarios: [{ name: reviews.name, kind: reviews.kind, runs: [ran] }] });
    check('the report gives a findings group per step', report.includes('| step 1 findings recall (lowest, highest) | 40% (40%, 40%) |') && report.includes('| step 2 findings recall (lowest, highest) | 40% (40%, 40%) |'), report);
    check('the report lists the defects each step missed', report.includes('step 1 findings (') && report.includes('missed D2, D4, D5') && report.includes('missed D1, D3, D4'), report);
  }
} finally {
  for (const d of scratch) rmSync(d, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
