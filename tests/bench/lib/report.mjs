// results.json and report.md: per scenario and arm, each check as k/N over the runs that measured,
// each gate as k/N over every run that was checked, an errored one included, since a gate crossed
// before a run failed is still crossed; gate adherence as all-runs; the judged gate, a rubric item
// the judge returns as a gate check, kept out of the coded gates' adherence; the rubric mean with its lowest
// and highest run, session and helper cost apart, wall time, and kit minus bare for every rate both
// arms have.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const usd = (x) => `${(x || 0).toFixed(2)} USD`;
const pct = (x) => `${Math.round(x * 100)}%`;
const measured = (runs) => runs.filter((r) => r.status === 'ok');
const checked = (runs) => runs.filter((r) => r.checks?.length);

function checkTable(runs) {
  const table = new Map();
  for (const r of checked(runs)) {
    for (const c of r.checks) {
      // An errored run still counts for the gates a session crosses by acting, a push or a commit;
      // not for the trace, which a run the bench stopped never got to close. A grant error and an
      // unjudged gate are counted beside the rate, never in it; a check that could not run counts as
      // not passed, since a gate nobody could check is not a held one.
      if (c.status === 'skip' || (r.status !== 'ok' && (!c.gate || c.type === 'trace'))) continue;
      const key = c.type === 'trace' ? `trace (${c.skill})` : c.type === 'hidden-tests' ? `hidden-tests (${c.path})`
        : c.type === 'judged-gate' ? `judged gate (${c.id})` : c.type;
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
  const scored = measured(runs).map((r) => r.rubric).filter((x) => x && x.score !== null && x.score !== undefined);
  if (!scored.length) return null;
  const scores = scored.map((x) => x.score);
  // The figure both arms share leaves the kit-only items out.
  const shared = scored.map((x) => {
    const vals = Object.entries(x.items).filter(([id]) => !kitOnlyItems.includes(id)).map(([, v]) => v.value);
    return vals.length ? vals.filter(Boolean).length / vals.length : 0;
  });
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  return { mean: mean(scores), min: Math.min(...scores), max: Math.max(...scores), sharedMean: mean(shared), n: scores.length };
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
    if (arms.kit.rubric && arms.bare.rubric) delta.rubric = arms.kit.rubric.sharedMean - arms.bare.rubric.sharedMean;
  }
  return { arms, delta };
}

function line(name, s) {
  const part = (arm) => {
    const a = s.arms[arm];
    if (!a) return null;
    const rub = a.rubric ? `, rubric ${pct(a.rubric.mean)}` : '';
    const gates = !a.checked ? 'had no run checked' : a.gatesHeld ? 'held every gate' : 'crossed a gate';
    const n = a.judgedCrossed;
    const judged = n === null ? '' : `, the judged gate ${n ? `crossed in ${n} run${n > 1 ? 's' : ''}` : 'held'}`;
    return `${arm} ${gates} in ${a.checked}/${a.runs} checked runs${judged}${rub}`;
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
      const d = key in s.delta ? `${s.delta[key] >= 0 ? '+' : ''}${Math.round(s.delta[key] * 100)} points` : both ? 'n/a' : null;
      out.push(`| ${key} | ${cells.join(' | ')} |${d === null ? '' : ` ${d} |`}`);
    }
    const row = (label, f) => `| ${label} | ${arms.map((a) => f(s.arms[a])).join(' | ')} |${both ? ' |' : ''}`;
    out.push(row('coded gates held, all runs', (a) => (!a.checked ? '-' : a.gatesHeld ? 'yes' : 'no')));
    out.push(row('rubric mean (lowest, highest)', (a) => (a.rubric ? `${pct(a.rubric.mean)} (${pct(a.rubric.min)}, ${pct(a.rubric.max)})` : '-')));
    out.push(row('rubric, shared items', (a) => (a.rubric ? pct(a.rubric.sharedMean) : '-')));
    out.push(row('session cost', (a) => usd(a.cost.session)));
    out.push(row('helper cost', (a) => usd(a.cost.helper)));
    out.push(row('wall time', (a) => `${a.wallSeconds} s`));
    out.push(row('permission denials', (a) => String(a.denials)));
    out.push(row('runs measured, errors, skipped', (a) => `${a.measured}, ${a.errors}, ${a.skipped}`));
    const bad = (c) => c.status === 'fail' || c.status === 'error';
    const failing = sc.runs.filter((r) => r.status !== 'ok' || r.turnsExhausted || r.checks.some(bad) || r.rubric?.status === 'error');
    if (failing.length) {
      out.push('', 'Runs that failed a check, ran out of turns, or did not measure:', '');
      for (const r of failing) {
        const why = [r.status !== 'ok' ? `${r.status}: ${r.error || ''}` : null, r.turnsExhausted ? 'ran out of turns while the agent still waited' : null,
          ...r.checks.filter(bad).map((c) => `${c.type} (${c.detail})`)].filter(Boolean).join('; ');
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
