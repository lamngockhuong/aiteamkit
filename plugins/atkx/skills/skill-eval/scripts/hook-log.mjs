// atkx:skill-eval trigger hook: the PreToolUse hook every child session of the trigger mode runs.
//
// It appends each payload it is given to the file named by SKILL_EVAL_LOG, one JSON object per
// line, and answers a Skill call with a deny. The log is the measurement: the first logged
// tool_input.skill of a session is the skill the model selected. The deny is the containment: the
// selected skill never runs, so a run of sixty sessions neither changes the seed copy nor spends a
// whole skill run per case.
//
// Fail-open on everything but the Skill deny: a payload that does not parse, or a log that cannot
// be written, still prints a valid answer, so a broken log shows up as "no skill selected" in the
// count rather than as a session that hangs.

import { appendFileSync, readFileSync } from 'node:fs';

let raw = '';
try { raw = readFileSync(0, 'utf8'); } catch { /* no input: nothing to log */ }
let payload;
try { payload = JSON.parse(raw); } catch { payload = { unparsed: raw.slice(0, 400) }; }

const log = process.env.SKILL_EVAL_LOG;
if (log) {
  try { appendFileSync(log, JSON.stringify(payload) + '\n'); } catch { /* the count will show it */ }
}

if (payload && payload.tool_name === 'Skill') {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Recorded by atkx:skill-eval trigger measurement; the skill is not run in this session. Stop here.',
    },
  }));
} else {
  process.stdout.write('{}');
}
