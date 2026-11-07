// results.json and report.md: per scenario and arm, each check as k/N over the runs that measured,
// each gate as k/N over every run that was checked, an errored one included, since a gate crossed
// before a run failed is still crossed; gate adherence as all-runs; the judged gate, a rubric item
// the judge returns as a gate check, kept out of the coded gates' adherence; the rubric mean with its lowest
// and highest run, session and helper cost apart, wall time, and kit minus bare for every rate both
// arms have. A review's findings are given apart, as recall, precision and severity agreement, each a
// mean over the measured runs with its lowest and highest, once per step that carries a findings check. A scenario of several steps adds a row per
// step, ran, errored and never reached, the runs in which every step ran, and the runner's approvals.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const usd = (x) => `${(x || 0).toFixed(2)} USD`;
const pct = (x) => `${Math.round(x * 100)}%`;
const measured = (runs) => runs.filter((r) => r.status === 'ok');
const checked = (runs) => runs.filter((r) => r.checks?.length);
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const spread = (a) => ({ mean: mean(a), min: Math.min(...a), max: Math.max(...a) });
const spreadCell = (v) => (v ? `${pct(v.mean)} (${pct(v.min)}, ${pct(v.max)})` : '-');
const deltaCell = (d) => `${d >= 0 ? '+' : ''}${Math.round(d * 100)} points`;
// A row or a measure of one step of a chain names the step; a single step's names none.
const stepLabel = (step, label) => (step ? `step ${step} ${label}` : label);

function checkTable(runs) {
  const table = new Map();
  for (const r of checked(runs)) {
    for (const c of r.checks) {
      // An errored run still counts for the gates a session crosses by acting, a push or a commit;
      // not for the trace, which a run the bench stopped never got to close. A grant error and an
      // unjudged gate are counted beside the rate, never in it; a check that could not run counts as
      // not passed, since a gate nobody could check is not a held one.
      if (c.type === 'findings' || c.status === 'skip' || (r.status !== 'ok' && (!c.gate || c.type === 'trace'))) continue;
      const base = c.type === 'trace' ? `trace (${c.skill})` : c.type === 'hidden-tests' ? `hidden-tests (${c.path})`
        : c.type === 'judged-gate' ? `judged gate (${c.id})` : c.type;
      const key = stepLabel(c.step, base);
      const row = table.get(key) || { pass: 0, of: 0, gate: !!c.gate, judged: !!c.judged, kitOnly: !!c.kitOnly, grantErrors: 0, unjudged: 0, errors: 0 };
      if (c.status === 'grant-error') row.grantErrors++;
      else if (c.status === 'unjudged') row.unjudged++;
      else { row.of++; if (c.status === 'pass') row.pass++; if (c.status === 'error') row.errors++; }
      table.set(key, row);
    }
  }
  return table;
}

function rubricStats(runs, kitOnlyItems = []) {
  // A run that errored after the rubric's step still carries that step's score.
  const scored = runs.map((r) => r.rubric).filter((x) => x && x.score !== null && x.score !== undefined);
  if (!scored.length) return null;
  const scores = scored.map((x) => x.score);
  // The figure both arms share leaves the kit-only items out.
  const shared = scored.map((x) => {
    const vals = Object.entries(x.items).filter(([id]) => !kitOnlyItems.includes(id)).map(([, v]) => v.value);
    return vals.length ? vals.filter(Boolean).length / vals.length : 0;
  });
  return { ...spread(scores), sharedMean: mean(shared), n: scores.length };
}

// The findings measures of the runs that measured, each as mean, lowest and highest, one group per
// step that carries a findings check, so a chain with two review steps keeps both; none when no run
// carried one. A group's `step` is null in a scenario of one step.
const FINDINGS_MEASURES = [['recall', 'findings recall'], ['precision', 'findings precision'], ['severityAgreement', 'severity agreement']];
function findingsStats(runs) {
  const rows = measured(runs).flatMap((r) => (r.checks || []).filter((c) => c.type === 'findings' && c.status === 'measured'));
  if (!rows.length) return null;
  const steps = [...new Set(rows.map((c) => c.step ?? null))];
  return steps.map((step) => {
    const of = rows.filter((c) => (c.step ?? null) === step);
    return Object.fromEntries([['step', step], ['unlocated', of.reduce((n, c) => n + (c.unlocated || 0), 0)], ['runs', of.length], ...FINDINGS_MEASURES.map(([k]) => {
      const vals = of.map((c) => c[k]).filter((v) => typeof v === 'number');
      return [k, vals.length ? spread(vals) : null];
    })]);
  });
}

// Per step of a scenario of several: how many runs it ran in, errored in, and never reached.
function stepStats(runs) {
  const n = Math.max(0, ...runs.map((r) => r.steps?.length || 0));
  if (n < 2) return null;
  const done = runs.filter((r) => r.steps?.length > 1 && r.steps.every((x) => x.status === 'ok')).length;
  return { done, rows: Array.from({ length: n }, (_, i) => {
    const of = runs.map((r) => r.steps?.[i]).filter(Boolean);
    const count = (st) => of.filter((x) => x.status === st).length;
    return { skill: of[0]?.skill || null, ok: count('ok'), error: count('error'), notRun: count('not run'), cost: of.reduce((s, x) => s + (x.cost || 0), 0) };
  }) };
}

export function summarise(scenario) {
  const arms = {};
  for (const arm of [...new Set(scenario.runs.map((r) => r.arm))]) {
    const runs = scenario.runs.filter((r) => r.arm === arm);
    const ok = measured(runs);
    const table = checkTable(runs);
    const gates = [...table.values()].filter((row) => row.gate && !row.judged);
    const judged = [...table.values()].filter((row) => row.judged);
    const kitOnlyItems = runs.find((r) => r.rubric)?.rubric?.kitOnlyItems || [];
    arms[arm] = {
      runs: runs.length,
      measured: ok.length,
      errors: runs.filter((r) => r.status === 'error').length,
      skipped: runs.filter((r) => r.status === 'skipped').length,
      checks: Object.fromEntries(table),
      checked: checked(runs).length,
      gatesHeld: checked(runs).length > 0 && gates.every((g) => g.pass === g.of),
      rubric: rubricStats(runs, kitOnlyItems),
      findings: findingsStats(runs),
      steps: stepStats(runs),
      judgedCrossed: judged.length ? judged.reduce((n, row) => n + row.of - row.pass, 0) : null,
      cost: { session: runs.reduce((s, r) => s + (r.cost?.session || 0), 0), helper: runs.reduce((s, r) => s + (r.cost?.helper || 0), 0) },
      wallSeconds: Math.round(runs.reduce((s, r) => s + (r.wallMs || 0), 0) / 1000),
      denials: runs.reduce((s, r) => s + (r.denials?.length || 0), 0),
    };
  }
  const delta = {};
  if (arms.kit && arms.bare) {
    for (const [key, k] of Object.entries(arms.kit.checks)) {
      const b = arms.bare.checks[key];
      if (!b || k.kitOnly || !k.of || !b.of) continue;
      delta[key] = k.pass / k.of - b.pass / b.of;
    }
    for (const kg of arms.kit.findings || []) {
      const bg = arms.bare.findings?.find((g) => g.step === kg.step);
      for (const [k, label] of FINDINGS_MEASURES) if (kg[k] && bg?.[k]) delta[stepLabel(kg.step, label)] = kg[k].mean - bg[k].mean;
    }
    if (arms.kit.rubric && arms.bare.rubric) delta.rubric = arms.kit.rubric.sharedMean - arms.bare.rubric.sharedMean;
  }
  return { arms, delta };
}

function line(name, s) {
  const part = (arm) => {
    const a = s.arms[arm];
    if (!a) return null;
    const recalls = (a.findings || []).filter((g) => g.recall).map((g) => `, ${stepLabel(g.step, 'recall')} ${pct(g.recall.mean)}`).join('');
    const scores = `${recalls}${a.rubric ? `, rubric ${pct(a.rubric.mean)}` : ''}`;
    const gates = !a.checked ? 'had no run checked' : a.gatesHeld ? 'held every gate' : 'crossed a gate';
    const n = a.judgedCrossed;
    const judged = n === null ? '' : `, the judged gate ${n ? `crossed in ${n} run${n > 1 ? 's' : ''}` : 'held'}`;
    return `${arm} ${gates} in ${a.checked}/${a.runs} checked runs${judged}${scores}`;
  };
  const d = s.delta.rubric !== undefined ? `; kit minus bare on the shared rubric ${s.delta.rubric >= 0 ? '+' : ''}${Math.round(s.delta.rubric * 100)} points` : '';
  return `- **${name}**: ${[part('kit'), part('bare')].filter(Boolean).join('; ')}${d}`;
}

export function render(results) {
  const out = [`# Benchmark report`, '', `Started ${results.started}, model \`${results.model}\`, ${results.mode}.`, '',
    `Cost: sessions ${usd(results.totals.session)}, helpers ${usd(results.totals.helper)}.`, ''];
  const summaries = results.scenarios.map((sc) => ({ sc, s: summarise(sc) }));
  for (const { sc, s } of summaries) out.push(line(sc.name, s));
  for (const { sc, s } of summaries) {
    const arms = Object.keys(s.arms);
    const both = !!(s.arms.kit && s.arms.bare);
    out.push('', `## ${sc.name}`, '');
    out.push(`| Check | ${arms.join(' | ')} |${both ? ' kit minus bare |' : ''}`);
    out.push(`|---|${arms.map(() => '---').join('|')}|${both ? '---|' : ''}`);
    const keys = [...new Set(arms.flatMap((a) => Object.keys(s.arms[a].checks)))];
    for (const key of keys) {
      const cells = arms.map((a) => {
        const c = s.arms[a].checks[key];
        if (!c) return '-';
        return `${c.pass}/${c.of}${c.judged ? ' (judged gate)' : c.gate ? ' (gate)' : ''}${c.grantErrors ? `, ${c.grantErrors} grant error` : ''}${c.unjudged ? `, ${c.unjudged} unjudged` : ''}${c.errors ? `, ${c.errors} could not run` : ''}`;
      });
      const d = key in s.delta ? deltaCell(s.delta[key]) : both ? 'n/a' : null;
      out.push(`| ${key} | ${cells.join(' | ')} |${d === null ? '' : ` ${d} |`}`);
    }
    const row = (label, f) => `| ${label} | ${arms.map((a) => f(s.arms[a])).join(' | ')} |${both ? ' |' : ''}`;
    out.push(row('coded gates held, all runs', (a) => (!a.checked ? '-' : a.gatesHeld ? 'yes' : 'no')));
    // A chain: one row per step, ran, errored and never reached, then the runs in which every step ran.
    const chain = arms.map((a) => s.arms[a].steps).find(Boolean);
    for (const [i, { skill }] of (chain?.rows || []).entries()) {
      out.push(row(`step ${i + 1}${skill ? ` (${skill})` : ''}: ran, errored, not run; cost`, (a) => {
        const x = a.steps?.rows[i];
        return x ? `${x.ok}, ${x.error}, ${x.notRun}; ${usd(x.cost)}` : '-';
      }));
    }
    if (chain) out.push(row('chain ran every step', (a) => (a.steps ? `${a.steps.done}/${a.runs}` : '-')));
    const findingSteps = [...new Set(arms.flatMap((a) => (s.arms[a].findings || []).map((g) => g.step)))];
    for (const step of findingSteps) {
      const group = (a) => a.findings?.find((g) => g.step === step);
      for (const [k, label] of FINDINGS_MEASURES) {
        const name = stepLabel(step, label);
        const d = name in s.delta ? deltaCell(s.delta[name]) : both ? 'n/a' : null;
        out.push(`| ${name} (lowest, highest) | ${arms.map((a) => spreadCell(group(s.arms[a])?.[k])).join(' | ')} |${d === null ? '' : ` ${d} |`}`);
      }
      // A finding that names a file and no line cannot be matched, so a low recall beside a high
      // count here is the citation's failure rather than a defect missed.
      out.push(row(stepLabel(step, 'blocks naming a file with no line, not matched'), (a) => (group(a) ? String(group(a).unlocated) : '-')));
      out.push(row(stepLabel(step, 'runs whose findings were measured'), (a) => (group(a) ? `${group(a).runs}/${a.measured}` : '-')));
    }
    out.push(row('rubric mean (lowest, highest)', (a) => spreadCell(a.rubric)));
    out.push(row('rubric, shared items', (a) => (a.rubric ? pct(a.rubric.sharedMean) : '-')));
    out.push(row('session cost', (a) => usd(a.cost.session)));
    out.push(row('helper cost', (a) => usd(a.cost.helper)));
    out.push(row('wall time', (a) => `${a.wallSeconds} s`));
    out.push(row('permission denials', (a) => String(a.denials)));
    out.push(row('runs measured, errors, skipped', (a) => `${a.measured}, ${a.errors}, ${a.skipped}`));
    // The runner's approvals, which no-approval sets aside, so a reader can see what was set aside.
    const approvals = sc.runs.flatMap((r) => (r.approvals || []).map((x) => `${r.arm} ${r.n}, after step ${x.step}: ${x.path ? `\`${x.path}\`` : `skipped, ${x.skipped}`}`));
    if (approvals.length) out.push('', 'Approved by the runner between steps, as the approver editing the file:', '', ...approvals.map((x) => `- ${x}`));
    // A findings check measures rather than fails, but a defect it missed or a severity it disagreed
    // on is what a reader of the report goes looking for, so the run is listed with its detail.
    const short = (c) => c.type === 'findings' && c.status === 'measured' && (c.missed?.length || c.severityDisagreements?.length);
    const bad = (c) => c.status === 'fail' || c.status === 'error' || short(c);
    const failing = sc.runs.filter((r) => r.status !== 'ok' || r.turnsExhausted || r.checks.some(bad) || r.rubric?.status === 'error');
    if (failing.length) {
      out.push('', 'Runs that failed a check, missed a defect, ran out of turns, or did not measure:', '');
      for (const r of failing) {
        const why = [r.status !== 'ok' ? `${r.status}: ${r.error || ''}` : null, r.turnsExhausted ? 'ran out of turns while the agent still waited' : null,
          ...r.checks.filter(bad).map((c) => `${stepLabel(c.step, c.type)} (${c.detail})`)].filter(Boolean).join('; ');
        out.push(`- ${r.arm} ${r.n}: ${why}. Transcript \`${r.transcript}\`${r.trace ? `, trace \`${r.trace}\`` : ''}`);
      }
    }
  }
  return `${out.join('\n')}\n`;
}

export function write(dir, results, name) {
  writeFileSync(join(dir, name), `${JSON.stringify(results, null, 2)}\n`);
  writeFileSync(join(dir, 'report.md'), render(results));
}
