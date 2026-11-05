// The bench playing the people inside a step. After each turn one closed question is asked about the
// agent's last message: is it waiting for a person, and for what. A question is answered from the
// scenario's fact sheet only; a request for an approval or a consent is answered "not yet", since
// approval and consent are the runner's, between steps or as an `after` entry, never the responder's.

import { DEFAULTS } from './cli.mjs';
import { firstJson, helper } from './session.mjs';

const CLASSIFY = `You read the last message an AI coding agent wrote in a terminal session and answer one
closed question: does the message end by waiting for an answer from a person before the agent can
go on?

Reply with one JSON object and nothing else:
{"waiting": true or false, "kind": "question" or "approval" or "consent" or "none", "question": "<what is asked, in one or two sentences, or empty>"}

- "question": the agent asks for a fact, a choice or a decision it cannot find itself.
- "approval": the agent asks a person to approve, sign off or accept an artifact or a plan.
- "consent": the agent asks whether it may commit, push, open or merge a pull request, or post somewhere.
- "none" with "waiting": false when the agent reports what it did, or only offers optional next steps.

The message:
`;

const ANSWER = `You play the people of a small software team answering an AI coding agent. You know only
what the fact sheet below says.

Rules:
- Answer each thing asked from the fact sheet, briefly, as the person the sheet names for it.
- For anything the sheet does not hold, say "I do not know; that is for <owner>", naming the person
  the sheet gives as owner of that kind of decision, or Bench Lead when it names nobody.
- Never approve anything, never give consent to commit, push or open a pull request, and never
  invent a fact, a name or a number.

Fact sheet:
`;

export async function classify(ctx, lastText) {
  const r = await helper({ ...ctx, prompt: CLASSIFY + lastText.slice(-8000), model: DEFAULTS.helperModel, budgetUsd: DEFAULTS.helperBudgetUsd,
    accept: (t) => typeof firstJson(t)?.waiting === 'boolean' });
  const j = r.error ? null : firstJson(r.text);
  if (!j || typeof j.waiting !== 'boolean') return { waiting: false, kind: 'none', question: '', cost: r.cost, error: r.error || 'the classifier gave no verdict' };
  return { waiting: j.waiting, kind: j.kind || 'none', question: String(j.question || ''), cost: r.cost, error: null };
}

export async function answer(ctx, facts, verdict) {
  if (verdict.kind === 'approval' || verdict.kind === 'consent') return { text: 'Not yet.', cost: 0, error: null };
  const r = await helper({ ...ctx, prompt: `${ANSWER}${facts}\n\nThe agent asks:\n${verdict.question}\n`, model: DEFAULTS.helperModel, budgetUsd: DEFAULTS.helperBudgetUsd });
  return { text: r.text.trim(), cost: r.cost, error: r.error };
}

// The consent an `after` entry gives, as the sentence a person says.
export function consentTurn(kind) {
  if (kind === 'push') return 'Bench Lead here. You have my consent to push this branch. Do not open a pull request.';
  return 'Bench Lead here. You have my consent to commit this change. Do not push.';
}
