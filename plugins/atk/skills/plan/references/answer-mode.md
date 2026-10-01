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
directories resolved per `shared/artifact-paths.md` and ask which one, as `--review` does.

An index at `status: SUPERSEDED` is refused in one line: the plan was retired, and an answer
recorded in it would be read by nobody. A plan whose open questions are all `None.` is said and
stops.

`--answer` with `--review` is refused in one line, before anything is read: a review edits nothing,
and recording an answer is an edit.

## Collecting the answers

List every open question of the index and of each phase file, numbered, each with the person it
names and the phase it blocks. Then ask, in one turn per `shared/host-capabilities.md`, which of
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

**An answer from somebody other than the person the question names is recorded, and the record says
so.** The skill does not refuse it and does not decide whether it is enough: whether the Tech Lead's
answer to a question addressed to the PM settles it is the approver's call. A question answered only
in part stays open, with the part that was answered recorded beside it.

## Where it goes

The question leaves the open list it was in, in the index or in its phase file. The record goes into
an `Answered` subsection at the end of section 5 of the index, in the table above, so no section is
renumbered and every answer to the plan sits in one place.

Each phase the answer changes is then edited to match it, and the edit names the question it came
from, so a reader can tell a step the author planned from one an answer put there. A phase the
answer does not change is not touched. A phase at `done` or `in progress` that the answer would
change is said and asked about before any edit: the answer lands on work somebody already did.

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
delivered as at step 7 of `SKILL.md`, to the person who called.

The session gets the questions answered, the phases edited, the questions still open with their
names, and the recommendation.

## Definition of done

- [ ] No question was answered by the skill; every answer came from a person and is verbatim.
- [ ] Every record carries the question, the answer, who answered, the date, and who relayed it when
      that is someone else.
- [ ] An answer from somebody other than the person named says so, and was neither refused nor
      judged.
- [ ] Each answered question left the open list, and its record is in the `Answered` subsection.
- [ ] Every phase the answer changed was edited and names the question; no other phase was edited
      for the answer, and a step 6 correction elsewhere is named as one.
- [ ] Step 6 ran with its count restarted and ended in the sweep.
- [ ] The challenge recommendation was read again and delivered.
