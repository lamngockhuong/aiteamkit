// atkx:skill-eval score: turns the dimension results of one run into the composite and the grade.
//
// A script for the same reason as static-check.mjs: three weights to three decimals, a
// redistribution, and a veto are what a hand calculation gets slightly wrong. The rules are those
// references/report-format.md states, and the two must agree.
//
// Input, one JSON object on standard input or in the file named by the first argument:
//   { "static":      { "passed": n, "failed": n, "credentials": n, "gate": n } or { "score": n },
//     "conventions": { "passed": n, "failed": n } or { "score": n } or null when none were found,
//     "trigger":     { "status": "measured", "score": n } or { "status": "not-run" | "broken" } }
// The review of a run is not an input: it describes one run, not the skill.

import { readFileSync } from 'node:fs';

const WEIGHTS = { trigger: 0.6, static: 0.25, conventions: 0.15 };
const BANDS = [[90, 'A'], [80, 'B'], [70, 'C'], [60, 'D']];

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const band = (n) => (BANDS.find(([min]) => n >= min) || [0, 'F'])[1];

// A dimension's score from 0 to 100, or null when it has nothing to score. Anything that is not
// a number in range is refused rather than coerced, so "9" never becomes a 9.9.
function dimension(d, name) {
  if (d === null || d === undefined) return null;
  if (typeof d !== 'object') refuse(`${name} is not an object`);
  if ('score' in d) {
    if (typeof d.score !== 'number' || d.score < 0 || d.score > 100) refuse(`${name}.score is not a number from 0 to 100`);
    return d.score;
  }
  const passed = d.passed ?? 0;
  const failed = d.failed ?? 0;
  if (![passed, failed].every((n) => Number.isInteger(n) && n >= 0)) refuse(`${name}.passed and ${name}.failed must be whole numbers`);
  return passed + failed ? (100 * passed) / (passed + failed) : null;
}

function refuse(why) {
  console.error(`score.mjs: ${why}`);
  process.exit(2);
}

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(process.argv[2] || 0, 'utf8'));
  } catch (e) {
    refuse(`input is not JSON (${e.message})`);
  }
  if (!input || typeof input !== 'object') refuse('input is not a JSON object');
  const notes = [];
  const scores = {
    static: dimension(input.static, 'static'),
    conventions: dimension(input.conventions, 'conventions'),
    trigger: input.trigger?.status === 'measured' ? dimension(input.trigger, 'trigger') : null,
  };
  if (scores.static === null) refuse('no static result, nothing to score');
  // credentials and gate decide the F, so they are required whichever form static takes.
  for (const k of ['credentials', 'gate']) {
    if (!Number.isInteger(input.static[k]) || input.static[k] < 0) refuse(`static.${k} must be a whole number of 0 or more`);
  }
  if (input.trigger?.status === 'measured' && scores.trigger === null) refuse('trigger is measured but carries no score');
  if (scores.conventions === null) {
    const none = !input.conventions || (input.conventions.passed ?? 0) + (input.conventions.failed ?? 0) === 0 && !('score' in input.conventions);
    notes.push(input.conventions && none
      ? 'Project conventions apply but none could be checked from the skill alone: their weight is shared between the other dimensions in proportion.'
      : 'No project conventions found: their weight is shared between the other dimensions in proportion.');
  }
  const withoutTriggers = scores.trigger === null;
  const cred = input.static.credentials;
  const gate = input.static.gate;
  // The veto overrides the missing grade: a skill holding a credential is F with or without triggers.
  const vetoed = cred > 0 || gate > 0;
  if (withoutTriggers) {
    const why = input.trigger?.status === 'broken' ? 'Trigger measurement did not work' : 'Triggers were not measured';
    notes.push(`${why}: the score covers the other dimensions only${vetoed ? '' : ' and carries no grade'}.`);
  }

  const present = Object.keys(WEIGHTS).filter((k) => scores[k] !== null);
  const sum = present.reduce((a, k) => a + WEIGHTS[k], 0);
  const weights = Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, present.includes(k) ? round(WEIGHTS[k] / sum, 3) : 0]));
  // The grade is read off the figure the report prints, so a reader applying the bands to it agrees.
  const composite = round(present.reduce((a, k) => a + (scores[k] * WEIGHTS[k]) / sum, 0), 1);

  const reasons = [];
  if (cred) reasons.push(`${cred} credential finding${cred > 1 ? 's' : ''}`);
  if (gate) reasons.push(`${gate} security gate failure${gate > 1 ? 's' : ''}`);
  let grade = withoutTriggers ? null : band(composite);
  if (reasons.length) {
    grade = 'F';
    notes.push(`Grade F whatever the other figures: ${reasons.join(' and ')}.`);
  }

  console.log(JSON.stringify({
    composite,
    label: withoutTriggers ? 'without triggers' : 'all measured dimensions',
    grade,
    // band is the letter the composite alone would get. The fixture check compares it; the report
    // never prints it, since a score without triggers carries no grade.
    band: band(composite),
    scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v === null ? null : round(v, 1)])),
    weights,
    notes,
  }, null, 2));
}

main();
