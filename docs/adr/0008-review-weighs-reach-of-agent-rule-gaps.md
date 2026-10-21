---
title: "ADR 0008: atk:review weighs how often an agent rule's gap is met, and a fix leaves an uncovered state to one default"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-21, by instruction to the agent. Returned to `IN REVIEW` on
2026-10-21 by his instruction, to carry Q3 and Q4, answered during implementation, and approved again
by him the same day.

# ADR 0008: atk:review weighs how often an agent rule's gap is met, and a fix leaves an uncovered state to one default

Design: `docs/records/design/261021-0450-review-severity-by-reach.md`

## Context

`atk:review` ranks a finding by its consequence alone, and forbids refuting a candidate for being
unlikely, which is right for code. Most of the kit's own rules are prose an agent follows. A gap in
such a rule is confirmed by reading it, so it reaches `SHOULD FIX` however rarely anyone meets it.
Each finding's `Fix` is a concrete change, which for an undefined state means a new clause. The
review and fix loop fixes every `SHOULD FIX`.

On PR #139 this made four review rounds. Twice, the next round's `BLOCKING` finding came from a
suggested fix applied as written. `plugins/atk/shared/run-trace.md`, read by every run, grew from
21,028 to 24,781 bytes.

## Decision

- A finding on a rule written for an agent carries `Reach: ordinary` or `Reach: edge`. An `edge`
  finding is a `NIT` unless its consequence is one of five the kit never accepts: a role's decision
  or approval taken without its owner, a secret or a person's data exposed, an action past the
  consent line, history or uncommitted work lost, a public contract broken. The five are fixed in
  `review/SKILL.md` as the kit's floor; a project adds its own through a rule with a severity in its
  review checklist, which reach never lowers. A trigger seen in a run is `ordinary`, with no third
  value. Code keeps today's ranking.
- Rule 5 of `shared/team-roles.md` gains a default for a state no rule covers: say so, ask the
  person running the skill where the answer is theirs to give and otherwise the person rule 3 gives
  it to, and stop when nobody can be asked. A gap the default handles correctly is not a finding.
- A finding's `Fix` is one of three forms: correct a false sentence, leave to the default by
  removing a sentence that guesses at a state the default answers, or add a rule. A rule added must
  name the states it opens.
- `atk:fix` and the review and fix loop take the first form that removes the finding. A suggested
  fix is a suggestion, and the record names the form taken.

## Consequences

- Fewer `SHOULD FIX` findings on agent rules, and fix loops that add fewer clauses per round. These
  are expected, not yet measured.
- Every run reads about 400 more bytes, in rule 5.
- A reviewer judges reach, and can misjudge it. A finding whose reach cannot be judged is
  `ordinary`, so a wrong call costs one `SHOULD FIX` rather than shipping a defect at `NIT`.
- Older reports carry no `Reach`, which reads as not assessed.

## Alternatives rejected

- **Change only `atk:fix` and the loop.** The ranking would stay wrong. Every `SHOULD FIX` a fixer
  declined would become a dispute for the Tech Lead.
- **Cap what a review returns, or allow one round only.** A cap drops findings by count, not weight.
  The `BLOCKING` finding of the 04:08 review was one of 58.
- **Do nothing, and find gaps from run traces.** A wrong-person approval would be found only after
  it happened in a team.
