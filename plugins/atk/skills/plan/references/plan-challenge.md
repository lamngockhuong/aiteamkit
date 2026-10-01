# Plan challenge

Loaded by `atk:plan` under `--challenge`, after step 6 has read the plan back, and at step 7 to
decide whether to recommend one. One agent per lens reads the written plan cold and raises what a
reviewer of that lens would raise, so the objection a Tech Lead brings to the plan reaches its author
first.

The procedure is `shared/independent-challenge.md`. This file holds what is particular to a plan:
the lenses, what an objection may not do to a plan, where the result is written, and when a
challenge is worth recommending at all.

## The lenses

| Lens | The questions it brings |
|------|-------------------------|
| Stopping halfway | What is wrong if the work stops after phase N for two weeks? Does each step's rollback really go back, or only forward? Does the deploy order hold against data already written? |
| Assumptions | Which assumption, gone, makes an acceptance criterion fail? Can it break while the plan runs, because another branch or another team changes it? |
| Scope | Which step builds what the request did not ask for? Which acceptance criterion is satisfied by more than the request needs? |
| Security | Which trust boundary does the plan cross or add, what does it store that it did not before, and who can now do what they could not? |

The security lens runs only when the plan adds a trust boundary, stores personal data or
credentials, touches money, or changes a permission, the same trigger
`skills/design-doc/references/role-challenge.md` uses for a design. When it does not run, the
section says why in one line. At most four agents, then, and three on most plans.

A team whose override for `plan` names other lenses or other questions uses those instead, per rule
7 of `shared/team-roles.md`.

## What an objection may not do

**A scope objection never removes a step.** What the request asked for is not the author's to cut,
and less still an agent's. A kept scope objection becomes an open question in section 5 of the
index, naming whoever owns the request, per rule 1 of `shared/team-roles.md`, and its answer reads
`Open`.

**An objection showing two approaches is the design gate.** When answering it would mean choosing
between two ways of building the work, the plan is retired per `## When the design gate fires here`
in `references/plan-self-review.md`, and the fork goes to `atk:design-doc`. Answering it inside the
plan would be the comparison step 3 of `SKILL.md` refuses.

An objection left `Open` stays in the table for the plan's `approver:` to settle, or for the person
the open question it became names.

## Where the result goes

A section 7, `Pre-review objections`, in `plan.md`, after the open questions and the verification,
in the shape `shared/independent-challenge.md` gives, with `Lens` as the second column and the
opening line "Raised by one agent per lens over the draft; simulated perspectives, not a review and
not an approval." The section is written only after a challenge ran; a plan never challenged has no
section 7.

## The order of a run

Given a plan path, steps 1 to 5 do not run: the plan exists, so the run starts at step 6, then
challenges, then ends at step 7 without a recommendation. Without a path, the plan is the one this
run just wrote.

1. Step 6 has already read the plan back. A challenge of a plan nobody has read back spends agents
   on stale line numbers.
2. The challenge runs, and each kept objection is answered `Changed` or `Open`.
3. The sweep in `## The sweep after a correction` of `references/plan-self-review.md` runs once over
   every plan file, for the old form of whatever a `Changed` answer replaced.

The challenge does not count against the two passes step 6 allows: it is a round of its own, with
its own agents, and the cap in `references/plan-self-review.md` counts the author's readings. The
sweep after it is not followed by another reading, so the section says which corrections went out
unverified, or that none did.

## Whether to recommend a challenge

Read at step 7, from the plan as written. The reason printed with a recommendation cites the line of
the plan that carries its signal.

| Signal in the plan | Recommendation |
|--------------------|----------------|
| The Tech Lead boundary of `## Roles` in `SKILL.md`: a schema, a public contract, or more than one service | Challenge; the Tech Lead still reviews |
| A trust boundary, personal data, money, or a permission | Challenge, with the security lens |
| Three or more phases, or dependencies that are not a straight line | Challenge |
| An open question the whole plan rests on: one that blocks every phase, directly or through `Depends on` | Answer it first with `/atk:plan <plan-path> --answer`, then run the challenge; a challenge of a plan that may change is wasted |
| None of the above | No challenge, with the reason |

The table is read again at the end of every `--answer` run, per `references/answer-mode.md`,
because an answer can bring a signal the plan did not carry.

The fourth row wins over the first three: a plan that rests on an unanswered question is not
challenged whatever else it touches. With no signal, the recommendation is still printed, as "no,
because" and what was looked for, so the reader can tell it from a check that never ran.

How it is delivered depends on who called:

- **A person.** Where the recommendation is to challenge, print it, its reason, the number of
  agents a challenge would spawn and the concurrency cap measured per
  `shared/independent-challenge.md`, and ask one question: run it now or not. On a no, print the
  line to type later and stop. Where it is to answer first, or no, print it with its reason and
  stop: there is nothing to ask.
- **`--inline`.** The recommendation rides inside the one confirmation step 7 already asks, with
  its reason. Where it is to challenge, the answers are yes, no, or challenge first, and the
  confirmation states the agent count and the measured cap; on "challenge first"
  the challenge runs and the same confirmation is asked again. Where it is to answer first, the
  question goes back as one the whole plan rests on, per step 7 of `SKILL.md`, and no challenge is
  offered. Where it is no, the reason is printed and the answers stay yes or no. Either way it goes
  into the handback, so the caller knows it was made.
- **`--challenge` passed, or `--review`.** No recommendation. The first already asked for one, and a
  review edits nothing a challenge could change. A challenge whose answers left the plan resting on
  an open question still says so at the end, naming the question and who answers it, since that is
  what step 7 hands back on any run.
