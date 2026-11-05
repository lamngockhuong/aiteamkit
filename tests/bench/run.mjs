// The atk benchmark runner. Runs a scenario's steps in a fresh seed of a sample project, with the kit
// loaded and without it, plays the people between turns, checks the result by code and by a judged
// rubric, and writes results.json and report.md under docs/derived/bench/, which git ignores.
// docs/records/design/261105-0300-atk-benchmark.md is the design; ADR 0014 says why it lives here.
//
// It costs money: every session and helper call is a paid model call. It is run by hand only, never
// by tests/verify.sh, and --dry-run, which builds the seeds and prints the plan and the worst case,
// starts no session. --max-cost-usd stops launching runs once the finished ones have spent it; a run
// already going finishes. --recheck runs the checks, the judge and the report again on a finished run
// without starting a skill session; it pays only for the judge's votes, and never rewrites
// results.json.
//
// Usage: node tests/bench/run.mjs <scenario|all> [--runs n] [--arms kit,bare] [--model id]
//        [--max-cost-usd n] [--parallel n] [--timeout s] [--dry-run]
//        node tests/bench/run.mjs --recheck <results-dir>

import { randomUUID } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEPT_GIT, TRACE_GRANTS, checksOf, declaredChecks, gateChecks, judgedGateChecks, tips } from './lib/checks.mjs';
import { DEFAULTS, MAX_RUNS, UsageError, parseArgs } from './lib/cli.mjs';
import { credentials, gitEnv, kitCopy, newRunDir, secretsOf, sweepStale, PREFIX } from './lib/isolate.mjs';
import { judgeRubric, unjudgedGates } from './lib/judge.mjs';
import { write as writeReport, render } from './lib/report.mjs';
import { answer, classify, consentTurn } from './lib/responder.mjs';
import { assembledValues, buildSeed } from './lib/seed.mjs';
import { turn } from './lib/session.mjs';

const BENCH = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(BENCH, '..', '..');
const KIT = join(REPO, 'plugins', 'atk');
const RESULTS_ROOT = join(REPO, 'docs', 'derived', 'bench');

class Refusal extends Error {}

const rel = (p) => relative(REPO, p);
const stamp = () => new Date().toISOString().replace(/^\d\d(\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d).*/, '$1$2$3-$4$5');

function loadScenario(name) {
  const path = join(BENCH, 'scenarios', `${name}.json`);
  if (!/^[a-z0-9-]+$/.test(name) || !existsSync(path)) throw new Refusal(`no scenario ${name} in tests/bench/scenarios/`);
  const sc = JSON.parse(readFileSync(path, 'utf8'));
  const fixtureDir = join(BENCH, 'fixtures', sc.fixture || '');
  if (!sc.fixture || !existsSync(join(fixtureDir, 'history.json'))) throw new Refusal(`${name}: no fixture ${sc.fixture}`);
  if (!Array.isArray(sc.steps) || !sc.steps.length) throw new Refusal(`${name}: no steps`);
  if (sc.runs !== undefined && !(Number.isInteger(sc.runs) && sc.runs >= 1 && sc.runs <= MAX_RUNS)) throw new Refusal(`${name}: runs must be 1 to ${MAX_RUNS}`);
  if (sc.arms !== undefined && !(Array.isArray(sc.arms) && sc.arms.length && sc.arms.every((a) => DEFAULTS.arms.includes(a)) && new Set(sc.arms).size === sc.arms.length)) {
    throw new Refusal(`${name}: arms must be kit, bare or both, each once`);
  }
  // A step may ask a person something; with no fact sheet the responder could only invent.
  const asks = sc.steps.some((s) => s.questions !== false);
  if (asks && !(sc.facts && existsSync(join(BENCH, sc.facts)))) throw new Refusal(`${name}: a step may ask questions and the scenario has no fact sheet`);
  return { ...sc, fixtureDir };
}

function scenarioNames(target) {
  if (target !== 'all') return [target];
  return readdirSync(join(BENCH, 'scenarios')).filter((f) => f.endsWith('.json')).map((f) => basename(f, '.json')).sort();
}

// Earlier results of the same kind, for the dry run's estimate: the dearest run seen.
function dearestRun(kind) {
  if (!existsSync(RESULTS_ROOT)) return null;
  let max = null;
  for (const d of readdirSync(RESULTS_ROOT)) {
    const f = join(RESULTS_ROOT, d, 'results.json');
    if (!existsSync(f)) continue;
    try {
      for (const sc of JSON.parse(readFileSync(f, 'utf8')).scenarios) {
        if (sc.kind !== kind) continue;
        // An errored run spent money too, a run stopped at its budget the most.
        for (const r of sc.runs) if (r.status !== 'skipped') max = Math.max(max ?? 0, (r.cost?.session || 0) + (r.cost?.helper || 0));
      }
    } catch { /* an unreadable earlier result is no evidence */ }
  }
  return max;
}

// The turns a step may take: its own limit, and one more for each consent it gives.
const turnsOf = (step) => (step.maxTurns ?? DEFAULTS.maxTurns) + (step.after || []).length;

function plan(scenarios, opts) {
  return scenarios.map((sc) => {
    const runs = opts.runs ?? sc.runs ?? DEFAULTS.runs;
    const arms = opts.arms ?? sc.arms ?? DEFAULTS.arms;
    // A step stops once it is over its budget, so it can pass it by one turn's budget at most.
    const stepBudget = sc.steps.reduce((s, st) => s + (st.stepBudgetUsd ?? DEFAULTS.stepBudgetUsd) + (st.budgetUsd ?? DEFAULTS.budgetUsd), 0);
    const seen = dearestRun(sc.kind);
    const worstUsd = (seen ?? stepBudget) * runs * arms.length;
    // Each turn may take the timeout; beside it a classify and an answer, each a helper call of up
    // to two attempts of 180 s; one more classify where a step runs out of turns; and the judge's
    // votes, run at once, of two attempts each.
    const helperCall = 2 * 180;
    const runSeconds = sc.steps.reduce((s, st) => s + turnsOf(st) * (opts.timeout + 2 * helperCall) + helperCall, 0) + helperCall;
    return { sc, runs, arms, sessions: runs * arms.length, worstUsd, runSeconds,
      basis: seen === null
        ? `no earlier result of kind ${sc.kind}: ${runs * arms.length} runs times the step budgets with one turn of overshoot, ${stepBudget} USD; helper and judge calls, at most ${DEFAULTS.helperBudgetUsd} USD each, are not in it`
        : `the dearest earlier run of kind ${sc.kind}, ${seen.toFixed(2)} USD, times ${runs * arms.length} runs` };
  });
}

// The seed is kept without the files the builder assembled, and with its git directory under a name
// git does not recognise, so nothing run inside docs/derived/bench/ reads the config the session wrote.
function keep(run, out, before) {
  const assembled = new Set(before.assembled || []);
  const gitDir = join(run.seed, '.git');
  cpSync(run.seed, join(out, 'seed'), { recursive: true, verbatimSymlinks: true,
    filter: (src) => src !== gitDir && !assembled.has(relative(run.seed, src).split('\\').join('/')) });
  if (existsSync(gitDir)) cpSync(gitDir, join(out, 'seed', KEPT_GIT), { recursive: true, verbatimSymlinks: true });
  if (existsSync(join(run.runDir, 'origin.git'))) cpSync(join(run.runDir, 'origin.git'), join(out, 'origin.git'), { recursive: true });
  cpSync(join(run.runDir, 'before.json'), join(out, 'before.json'));
}

async function score({ out, record, scenario, ctx, logins = ctx?.secrets || [] }) {
  // The planted values are derived again from the fixture, and the login tokens are the ones this
  // process knows; neither is stored with the results.
  const planted = assembledValues(scenario.fixtureDir);
  record.checks = [...gateChecks({ dir: out, run: record, scenario, planted, logins }),
    ...declaredChecks({ dir: out, run: record, scenario, fixtureDir: scenario.fixtureDir })];
  for (const c of record.checks) if (c.file) c.file = rel(c.file);
  // The trace the report points at is the one the trace check read.
  record.trace = record.checks.find((c) => c.type === 'trace' && c.file)?.file ?? null;
  const rubric = checksOf(scenario).find((c) => c.type === 'rubric');
  if (rubric && record.status === 'ok') {
    record.rubric = await judgeRubric({ dir: out, run: record, check: rubric, fixtureDir: scenario.fixtureDir, benchDir: BENCH, ctx });
    record.cost.helper += record.rubric.cost;
    record.checks.push(...judgedGateChecks(record.rubric.gates));
  } else if (rubric) {
    record.checks.push(...judgedGateChecks(unjudgedGates({ check: rubric, benchDir: BENCH, why: `the run ended ${record.status}, so the judge did not read it` })));
  }
}

async function runOne({ scenario, arm, n, opts, auth, secrets, resultsDir }) {
  const out = join(resultsDir, `${arm}-${n}`);
  mkdirSync(out, { recursive: true });
  const transcript = join(out, 'transcript.jsonl');
  const record = { arm, n, status: 'ok', error: null, cost: { session: 0, helper: 0 }, wallMs: 0, turns: 0, denials: [], consents: [], toolCalls: {}, lastText: '' };
  const run = newRunDir();
  const ctx = { run, auth, secrets };
  const facts = scenario.facts ? readFileSync(join(BENCH, scenario.facts), 'utf8') : '';
  const started = Date.now();
  let before = null;
  try {
    ({ before } = buildSeed({ fixtureDir: scenario.fixtureDir, scenario, runDir: run.runDir, gitEnv: gitEnv(run) }));
    const sessionId = randomUUID();
    let resumed = false;
    const allowed = [...new Set([...(scenario.allowedTools || []), ...(arm === 'kit' ? TRACE_GRANTS : [])])];
    // The kit is loaded from a copy in the run directory, since the session is denied the repository.
    const pluginDir = arm === 'kit' ? kitCopy(run, KIT) : null;
    for (const step of scenario.steps) {
      const stepBudget = step.stepBudgetUsd ?? DEFAULTS.stepBudgetUsd;
      let stepCost = 0;
      let turns = 0;
      const say = async (prompt) => {
        const t = await turn({ run, auth, secrets, prompt, sessionId, resume: resumed, model: opts.model, allowedTools: allowed,
          pluginDir, budgetUsd: step.budgetUsd ?? DEFAULTS.budgetUsd, timeoutMs: opts.timeout * 1000, transcript });
        resumed = true;
        turns++;
        stepCost += t.cost;
        record.cost.session += t.cost;
        record.turns += t.turns;
        record.denials.push(...t.denials);
        for (const u of t.toolUses) record.toolCalls[u.name] = (record.toolCalls[u.name] || 0) + 1;
        record.lastText = t.lastText;
        if (t.error) throw new Error(t.error);
        if (stepCost > stepBudget) throw new Error(`the step spent ${stepCost.toFixed(2)} USD, over its budget of ${stepBudget} USD`);
      };
      const ask = async () => {
        const v = await classify(ctx, record.lastText);
        record.cost.helper += v.cost;
        if (v.error) throw new Error(v.error);
        return v;
      };
      // Answers questions until the agent stops asking or the turns run out. A step that runs out
      // while the agent still waits is marked, so it never reads as one that finished.
      const converse = async (limit) => {
        if (step.questions === false) return;
        while (turns < limit) {
          const v = await ask();
          if (!v.waiting) return;
          const a = await answer(ctx, facts, v);
          record.cost.helper += a.cost;
          if (a.error) throw new Error(a.error);
          await say(a.text || 'I do not know; that is for Bench Lead.');
        }
        if ((await ask()).waiting) record.turnsExhausted = true;
      };
      const maxTurns = step.maxTurns ?? DEFAULTS.maxTurns;
      await say(`${arm === 'kit' ? step.kitPrefix || '' : ''}${step.prompt}`);
      await converse(maxTurns);
      for (const entry of step.after || []) {
        if (!entry.consent) continue;
        record.consents.push({ kind: entry.consent, refs: tips(run.seed, gitEnv(run)) });
        await say(consentTurn(entry.consent));
        await converse(turnsOf(step));
      }
    }
  } catch (e) {
    record.status = 'error';
    record.error = e.message;
  }
  record.wallMs = Date.now() - started;
  // Keeping and scoring read what the session left, which can be anything; a failure there ends this
  // run as an error and never the runs beside it.
  try {
    if (before) {
      keep(run, out, before);
      writeFileSync(join(out, 'run.json'), `${JSON.stringify(record, null, 2)}\n`);
      await score({ out, record, scenario, ctx });
    }
  } catch (e) {
    record.status = 'error';
    record.error = `${record.error ? `${record.error}; then ` : ''}keeping or checking the run failed: ${e.message}`;
    record.checks ??= [];
  }
  rmSync(run.runDir, { recursive: true, force: true });
  record.transcript = rel(transcript);
  record.trace ??= null;
  record.checks ??= [];
  const { lastText, ...kept } = record;
  return kept;
}

async function pool(items, size, work) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await work(items[i], i);
    }
  }));
  return out;
}

function resultsDirFor(name, at) {
  let dir = join(RESULTS_ROOT, `${at}-${name}`);
  for (let i = 2; existsSync(dir); i++) dir = join(RESULTS_ROOT, `${at}-${name}-${i}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function login(worstSeconds) {
  const auth = credentials(worstSeconds);
  if (!auth) throw new Refusal('no CLAUDE_CODE_OAUTH_TOKEN or ANTHROPIC_API_KEY in the environment and no saved login');
  if (auth.how === 'expiring') throw new Refusal(`the saved login expires in ${auth.minutesLeft} minutes; run any claude command to refresh it`);
  return auth;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.recheck) return recheck(opts);
  const scenarios = scenarioNames(opts.target).map(loadScenario);
  const planned = plan(scenarios, opts);
  if (opts.dryRun) {
    for (const p of planned) {
      const run = newRunDir();
      buildSeed({ fixtureDir: p.sc.fixtureDir, scenario: p.sc, runDir: run.runDir, gitEnv: gitEnv(run) });
      rmSync(run.runDir, { recursive: true, force: true });
      process.stdout.write(`${p.sc.name}: seed of ${p.sc.fixture} built, ${p.runs} runs x ${p.arms.join(',')} = ${p.sessions} sessions of ${p.sc.steps.length} step(s); worst case ${p.worstUsd.toFixed(2)} USD (${p.basis})\n`);
    }
    const total = planned.reduce((s, p) => s + p.worstUsd, 0);
    process.stdout.write(`total worst case ${total.toFixed(2)} USD${opts.maxCostUsd ? `, capped by --max-cost-usd at ${opts.maxCostUsd} USD for what is launched` : ''}; no session started\n`);
    return;
  }
  const worstSeconds = planned.reduce((s, p) => s + Math.ceil(p.sessions / opts.parallel) * p.runSeconds, 0);
  const auth = login(worstSeconds);
  const secrets = secretsOf(auth);
  sweepStale(PREFIX);
  const at = stamp();
  let spent = 0;
  for (const p of planned) {
    const resultsDir = resultsDirFor(p.sc.name, at);
    const jobs = [];
    for (let n = 1; n <= p.runs; n++) for (const arm of p.arms) jobs.push({ arm, n });
    const { fixtureDir, ...scenarioKept } = p.sc;
    const results = { started: new Date().toISOString(), model: opts.model, mode: 'run', scenarioFile: scenarioKept,
      totals: { session: 0, helper: 0 }, scenarios: [{ name: p.sc.name, kind: p.sc.kind, runs: [] }] };
    // Written again after every run, so an interrupted scenario still records what it spent.
    const save = (r) => {
      results.scenarios[0].runs.push(r);
      results.scenarios[0].runs.sort((a, b) => a.n - b.n || a.arm.localeCompare(b.arm));
      results.totals.session += r.cost.session;
      results.totals.helper += r.cost.helper;
      writeReport(resultsDir, results, 'results.json');
    };
    await pool(jobs, opts.parallel, async ({ arm, n }) => {
      // The cap stops launching runs; one already running finishes and is counted.
      if (opts.maxCostUsd && spent >= opts.maxCostUsd) return save({ arm, n, status: 'skipped', error: `--max-cost-usd ${opts.maxCostUsd} reached`, cost: { session: 0, helper: 0 }, checks: [], transcript: null });
      const r = await runOne({ scenario: p.sc, arm, n, opts, auth, secrets, resultsDir });
      spent += r.cost.session + r.cost.helper;
      process.stderr.write(`[${p.sc.name} ${arm} ${n}] ${r.status}${r.error ? `: ${r.error}` : ''}, ${(r.cost.session + r.cost.helper).toFixed(2)} USD\n`);
      return save(r);
    });
    process.stdout.write(`${rel(join(resultsDir, 'report.md'))}\n`);
  }
}

// Runs the checks, the judge and the report again on a finished results directory, starting no
// skill session. Writes recheck.json and a fresh report.md; results.json is left as it was.
async function recheck(opts) {
  const dir = resolve(opts.recheck);
  const results = JSON.parse(readFileSync(join(dir, 'results.json'), 'utf8'));
  let auth = null;
  let ctx = null;
  let judgeCost = 0;
  for (const sc of results.scenarios) {
    // The scenario as it is now, so a check written since can be tried on a finished run; when it no
    // longer matches the one that ran, the recheck says so.
    const scenario = loadScenario(sc.name);
    const { fixtureDir, ...now } = scenario;
    if (results.scenarioFile && JSON.stringify(now) !== JSON.stringify(results.scenarioFile)) {
      process.stderr.write(`bench: ${sc.name} has changed since this run; the recheck uses the scenario as it is now\n`);
    }
    const needsJudge = checksOf(scenario).some((c) => c.type === 'rubric');
    if (needsJudge && !ctx) {
      auth = login(3600);
      ctx = { run: newRunDir(), auth, secrets: secretsOf(auth) };
    }
    // With no judge to call, the login tokens are still looked for in what the run left; a saved
    // login within five minutes of its expiry gives none, and the leak check then says so.
    const logins = ctx?.secrets || secretsOf(credentials(0) || {});
    for (const r of sc.runs) {
      const out = join(dir, `${r.arm}-${r.n}`);
      if (!existsSync(join(out, 'run.json'))) continue;
      const record = JSON.parse(readFileSync(join(out, 'run.json'), 'utf8'));
      record.cost.helper = 0;
      await score({ out, record, scenario, ctx, logins });
      judgeCost += record.rubric?.cost || 0;
      if (r.rubric?.material !== record.rubric?.material && record.rubric) {
        process.stderr.write(`bench: ${sc.name} ${r.arm} ${r.n}: the judge now reads ${record.rubric.material}, the run was judged on ${r.rubric?.material || 'files and the last message only'}\n`);
      }
      Object.assign(r, { checks: record.checks, rubric: record.rubric });
    }
  }
  const rechecked = { ...results, mode: `recheck of ${rel(dir)}`, rechecked: new Date().toISOString(), judgeCostUsd: judgeCost };
  writeFileSync(join(dir, 'recheck.json'), `${JSON.stringify(rechecked, null, 2)}\n`);
  writeFileSync(join(dir, 'report.md'), render(rechecked));
  process.stdout.write(`${rel(join(dir, 'report.md'))}; the judge cost ${judgeCost.toFixed(2)} USD\n`);
}

main().catch((e) => {
  const code = e instanceof UsageError || e instanceof Refusal ? 2 : 3;
  process.stderr.write(`bench: ${e.message}\n`);
  process.exit(code);
});
