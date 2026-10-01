# Answering a plan's open questions

Loaded by `atk:plan` under `--answer`. It closes the loop step 7 leaves open: the skill writes every
open question with the name of whoever must answer it, and until now nothing carried the answer back
into the plan. The answer lived in a chat thread, the phase it unblocked still read as blocked, and
the next reader found a question somebody had already settled.

This mode records what a person answered. It never answers a question itself: a question the
repository could have settled was settled by step 6 and is not open, and one a role owns is that
role's, per rule 3 of `shared/team-roles.md`.

## What it reads

A plan directory, its `plan.md` and every `phase-NN-*.md` beside it. Without a path, list the plan
directories resolved per `shared/artifact-paths.md` and ask which one, as `--review` does. Where
that directory is absent or empty, say so and stop.

`## Before any edit` below runs first. A plan whose open questions are all answered and that has no
objection left `Open` is said, and the run stops.

## Before any edit

Both modes that edit a plan already written run this, `--answer` and `<plan-path> --challenge`, and
`references/plan-challenge.md` cites it. Each check stops or changes the run before a file is
touched.

- **Not a plan of this kit.** A path outside the project root, or a directory with no `plan.md`
  carrying the phases table and section 5 of `references/plan-template.md`, is refused in one line:
  there is nowhere to record an answer or an objection.
- **About another repository.** The test is `## Is this plan about this repository` in
  `references/plan-review-mode.md`, and on positive evidence the run stops there, since step 6
  would "fix" every citation against the wrong tree.
- **Retired.** An index at `status: SUPERSEDED` is refused in one line: whatever is recorded in it is
  read by nobody.
- **Approved.** The approver read a version this run is about to change. While no phase is `done`
  or `in progress`, edit in place and, once anything was written, set the index back to
  `status: IN REVIEW` with the same `approver:`, and say in the session that this person has to read
  it again and what changed. Once a phase has started, the plan has been built from: supersede it
  per `## Before writing` in `shared/artifact-paths.md`. Copy the directory under a new name per
  Naming there, phase statuses included, make the edits in the copy, set the old index to
  `SUPERSEDED`, and link the two both ways.
- **In review.** Edit in place, and say in the session that the approver named in `approver:` is
  reading an older version.
- **In flight.** Below `APPROVED`, a phase at `done` or `in progress` that an edit would change is
  said and asked about before the edit: it lands on work somebody already did.

## Collecting the answers

List every open question of the index and of each phase file, numbered, each with the person it
names and the phase it blocks, and after them every objection of section 7 still answered `Open`,
with its ID and the person who settles it. Then ask, in one turn per `shared/host-capabilities.md`, which of
them are answered and what each answer is. Answers already in the prompt are taken from there, and
only the questions they leave unclear are asked about.

What is recorded per answer:

| Field | Holds |
|-------|-------|
| Question | As written in the plan, unchanged |
| Answer | Verbatim, as the person gave it. A summary is a second author |
| Answered by | The person who answered |
| Date | The date of the answer, or the date it was recorded, saying which |
| Relayed by | The person who brought the answer here, when that is not the person who answered |

"Verbatim" never means keeping a secret or a real person's data. A password, a token, an internal
host, a client's email address is replaced with `<redacted: kind>`, as
`skills/qa/references/test-run.md` does for a run record under The data a record must not carry, and
the session says what was redacted by kind, never by repeating it. The plan is committed, and a
later challenge hands it to agents.

**An answer from somebody other than the person the question names is recorded, and the record says
so.** The skill does not refuse it and does not decide whether it is enough: whether the Tech Lead's
answer to a question addressed to the PM settles it is the approver's call. A question answered only
in part stays open, with the part that was answered recorded beside it.

## Where it goes

The question leaves the open list it was in, in the index or in its phase file. The record goes into
an `Answered` subsection at the end of section 5 of the index, in the table above, so no section is
renumbered and every answer to the plan sits in one place. When the person does not say who
answered, ask: a record with no answerer is the chat thread again.

An answer to an objection also replaces its `Open` in section 7 with `Settled by <name>, <date>`,
and the row goes into the same `Answered` table with its ID as the question. So does the objection a
scope question came from, when that question is answered: one thing never reads `Open` in one place
and answered in another.

Each phase the answer changes is then edited to match it, and the edit names the question it came
from, so a reader can tell a step the author planned from one an answer put there. A phase the
answer does not change is not touched.

**An answer that opens two approaches is the design gate.** "Soft delete or archive table, whichever
is cheaper" is not an answer to sequence; it is a fork. Retire the plan per `## When the design gate
fires here` in `references/plan-self-review.md`, with the recorded answer kept in the index.

## After the edits

Step 6 runs over the plan as for a rewrite the person asked for, so its count of two passes starts
again, and it ends in `## The sweep after a correction` of `references/plan-self-review.md`: an
answer that renamed a table in phase 2 is searched for in phases 3 and 4 too. What step 6 corrects
it corrects anywhere in the plan, as on any read-back; the rule above that leaves other phases
alone binds the edits the answer makes, not the facts step 6 fixes, and the session names which
edits came from which.

Then the table in `## Whether to recommend a challenge` of `references/plan-challenge.md` is read
again, because an answer can create a signal the plan did not have. "Soft delete" brings a migration
with it, and a plan that needed no challenge yesterday may need one now. The recommendation is
delivered as at step 7 of `SKILL.md`, to the person who called. Under `--inline` it goes back to the
calling skill with the questions still open, as the handback of step 7, and no confirmation is
asked: nothing was planned for it to confirm. With `--challenge` beside `--answer` the order is the
answer, step 6, then the challenge per `references/plan-challenge.md`, and no recommendation, since
one was already asked for.

The session gets the questions answered, the phases edited, the questions still open with their
names, and the recommendation.

## Definition of done

- [ ] `## Before any edit` ran first, and an `APPROVED` plan went back to `IN REVIEW` naming its
      approver, or was superseded because a phase had started.
- [ ] No question was answered by the skill; every answer came from a person and is verbatim.
- [ ] No secret and no real person's data was written; each is `<redacted: kind>`.
- [ ] Every record carries the question, the answer, who answered, the date, and who relayed it when
      that is someone else.
- [ ] An answer from somebody other than the person named says so, and was neither refused nor
      judged.
- [ ] Each answered question left the open list, and its record is in the `Answered` subsection; a
      settled objection reads the same in section 7.
- [ ] Every phase the answer changed was edited and names the question; no other phase was edited
      for the answer, and a step 6 correction elsewhere is named as one.
- [ ] Step 6 ran with its count restarted and ended in the sweep.
- [ ] The challenge recommendation was read again and delivered.
