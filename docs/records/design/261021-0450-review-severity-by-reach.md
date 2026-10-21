---
title: atk:review weighs how often an agent rule's gap is met, and a fix leaves an uncovered state to one default
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

# atk:review weighs how often an agent rule's gap is met, and a fix leaves an uncovered state to one default

## In short

PR #139 went through four review rounds, and each round found new defects in the previous fix.
Twice, the next round's `BLOCKING` finding was caused by applying the previous round's suggested fix
word for word. A review asked for honorifics to be stripped so that "anh Khương" would match
"Lam Ngoc Khuong" (S60 of the 01:58 review). The fix stripped `anh` and `em` from both sides of the
comparison, so a Team row "Đức Anh" became "Đức". A different Đức then matched it exactly, which is
the wrong-person failure the earlier B3 finding existed to stop (B1 of the 04:08 review). Meanwhile
`plugins/atk/shared/run-trace.md`, which every run of every skill reads, grew from 21,028 to
24,781 bytes.

The findings were real; each was checked against the file. Two things made the loop grow instead of
close:

- **The review ranks by mechanism alone.** A gap in a rule an agent follows is `SHOULD FIX` once its
  mechanism can be named, whether or not anyone will ever meet it: two Team rows "Trần Thị Hà" and
  "Trần Thị Hạ", a Japanese `user.name`, a trace cut at midnight on its `end` line.
- **Every suggested fix is a new rule, and the fix adopts it.** Each new rule opens new states, and
  the next round finds those.

This design changes three things:

- `atk:review` gives each finding on a rule written for an agent a `Reach`: `ordinary` when the
  trigger is input the kit's users meet in normal work, `edge` when it is not. An `edge` finding is a
  `NIT` unless its consequence is one of five the kit never accepts.
- Rule 5 of `shared/team-roles.md` gains a default for any state no rule covers: say so, ask the
  person, and stop when nobody can be asked. A gap the default already handles correctly is not a
  finding.
- `atk:fix` and the review and fix loop take the narrowest of three fixes, and never a review's
  suggested rule unexamined.

Code is out of scope. A race condition or an off-by-one in a project's code keeps today's severity,
whatever its reach.

Lam Ngoc Khuong owns the change and approves it.

## Requirement

Asked for in the session of 2026-10-21, after PR #139 merged: a design for the change to
`atk:review` proposed there, and a change to `atk:fix` where it is needed. Acceptance criteria as
restated here:

1. A gap in an agent rule that nobody in the kit's teams meets in ordinary work no longer reaches
   `SHOULD FIX`, unless its consequence breaks the team premise, leaks a secret or a person's data,
   acts past a person's consent, loses history, or breaks a public contract.
2. A review can suggest leaving a state uncovered as a valid fix, not only adding a rule.
3. A fix chooses the narrowest change and says which one it chose, so it does not take on a
   suggested rule whose own gaps nobody weighed.
4. Defects in code are ranked as they are today.
5. Nothing a reviewer finds is dropped: an `edge` finding is still reported, at `NIT`.

## Current state

**Verdicts settle whether a finding is real, not how often it happens.**
`plugins/atk/skills/review/SKILL.md:155-177` gives each candidate `CONFIRMED`, `PLAUSIBLE` or
`REFUTED`, and forbids refuting one "for being unlikely" (`:170-173`). That rule is right for code:
it is "how a race condition ships". `PLAUSIBLE` covers a trigger that depends on timing or
configuration, and caps it at `SHOULD FIX`. Nothing covers a trigger that is certain once met and
rarely met. A gap in a prose rule is confirmed by reading it, so it takes any severity.

**Severity is consequence alone.** The table at `review/SKILL.md:197-201` reads "`SHOULD FIX`: Real
problem". A prose rule that leaves a state undefined is a real problem by that definition, at any
frequency.

**The `boundary` round hunts for states.** `plugins/atk/skills/review/references/review-rounds.md:45`
opens "Inputs and states, not lines" and is never skipped. In the four review rounds of PR #139, it
returned 21, 28, 27 and 1 findings. It was the largest source of findings in the three rounds over a
full change.

**A finding's `Fix` is a concrete change.**
`plugins/atk/skills/review/references/report-format.md:84` asks for "the concrete change", and
`:105` says "a finding with no suggestion is a complaint". In practice the concrete change for an
undefined state is a new clause.

**The loop fixes every `SHOULD FIX`.** `plugins/atk/shared/review-fix-loop.md:86-88`: "Fix it, unless
it is genuinely separate work". `:93` holds a fix to "the smallest change that removes the finding",
and `atk:fix` repeats that at step 3, `plugins/atk/skills/fix/SKILL.md:129-135`, and for the loop at
`:198`. Neither says how to tell a small change from a small-looking rule that opens new states.

**The kit has no default for an uncovered state.** Rule 5 of `plugins/atk/shared/team-roles.md:63-64`
says to ask only what the repository cannot answer. Nothing says what an agent does when a rule
simply does not reach the case in front of it. So each gap a review finds looks like a hole that only
a new rule can fill.

**What it cost on PR #139.** The four reviews are the `atk:review` runs of 2026-10-21 at 00:16,
01:58, 04:08 and 05:10:

| Review | Subject | `BLOCKING` | `SHOULD FIX` | `NIT` |
|---|---|---|---|---|
| 00:16 | the change | 0 | 29 | 37 |
| 01:58 | its fix | 3 | 23 | 37 |
| 04:08 | the next fix | 2 | 34 | 22 |
| 05:10 | that fix's fixes | 0 | 3 | 1 |

The 04:08 review's two `BLOCKING` findings each trace to a suggested fix applied as written:

- B1 came from S60 of 01:58, quoted above.
- B2 came from the fix of B2 of 01:58, which said to "limit" row 1 of `shared/state-signals.md`.
  Applied as written, that dropped the row's recommendation for an existing document the design
  names.

How the proposed `Reach` would sort a sample of the 04:08 `SHOULD FIX` findings. Each line is this
design's judgement, made after the fact, and is no measurement:

| Finding | Trigger | Reach | Consequence protected | Would be |
|---|---|---|---|---|
| S1 | Two Team rows differing only by tone marks | `edge` | no | `NIT` |
| S2 | `田中太郎さん` given with a glued suffix | `edge` | no | `NIT` |
| S6 | A one-word CJK `user.name` | `edge` | no | `NIT` |
| S34 | A session's first event after midnight is its close | `edge` | no | `NIT` |
| S12 | `--answer` run on a branch, PR read by checkout | `ordinary` | no | `SHOULD FIX` |
| S25 | `atk:orchestrate` meets a design left at `DRAFT` | `ordinary` | no | `SHOULD FIX` |
| S7 | Headless solo approver gives a short name | `edge` | yes, an approval held by the wrong rule | `SHOULD FIX` |
| B1 | Team row "Đức Anh", a relayed "anh Đức" | `ordinary` | yes, a role's decision taken by someone else | `BLOCKING` |

## Options

Criteria, in order: C1, the review still finds what will happen; C2, the loop converges; C3, the
cost on every run, through the shared files every run reads; C4, reversibility; C5, how much of
`atk:review` changes.

### A. Reach on agent-rule findings, a default for uncovered states, and the narrowest fix (chosen)

`atk:review` labels each finding on a rule written for an agent with `Reach: ordinary` or
`Reach: edge`. An `edge` finding is a `NIT` unless its consequence is one of the five protected ones.
Rule 5 of `shared/team-roles.md` gains the default for an uncovered state, and a gap the default
handles correctly is not a candidate. `atk:fix` and the loop choose the narrowest of three fixes.

- C1: kept. Every finding is still reported, and the protected consequences keep their weight
  whatever the reach.
- C2: strong. `edge` findings stop driving fixes, and the default stops gaps from needing rules.
- C3: one paragraph in `team-roles.md`, read by every run. That is the price, and it is small next to
  the 3,753 bytes `run-trace.md` gained from one review loop.
- C4: high. Prose only. Removing the label restores today's ranking.
- C5: moderate. One label, one severity rule, one change to the `boundary` round, one new `Fix` form.

### B. Change only `atk:fix` and the loop

Keep the review as it is, and let the fixer decide what not to fix.

- C1: kept.
- C2: weak. The fixer would decline `SHOULD FIX` findings case by case, and the loop table says a
  `SHOULD FIX` is fixed unless it is separate work. Each decline becomes a dispute for the Tech Lead.
- C3: none. C4: high. C5: none.
- Loses because the ranking stays wrong, and the cost moves to a person who reads every dispute.

### C. Cap what a review returns, or allow one round only

- C1: lost. A cap drops findings by count, not by weight. The 04:08 `BLOCKING` B1 was one of 58.
- C2: forced rather than earned. C3: none. C4: high.
- Loses on C1, the criterion that matters most.

### D. Do nothing, and find gaps from run traces instead

Stop reviewing prose for edge states, and let `atk:tailor --feedback` find what real runs hit.

- C1: weakened. A wrong-person approval would be found only after it happened in a team.
- C2: strong. C3: none. C4: high. C5: the `boundary` round would lose half its subject.
- The team would pick this by default, as the cheapest. It loses because the protected consequences
  must be caught before a run, not counted after. Traces still matter, and option A uses them as
  evidence below.

## Chosen approach

### `Reach`, and what it changes

Scope: a finding whose subject is a rule written for an agent to follow. That covers a skill's
`SKILL.md` and `references/`, a shared file, a prompt, a project's agent instructions file, or any
Markdown an agent reads as instructions. Code, configuration, schemas and tests keep today's ranking.
A finding on both, an instruction and the code it drives, is ranked as code.

- **`ordinary`.** The trigger is input or a state the kit's users meet in normal work: a common
  name in the teams it serves, a usual project shape, a run started the way a skill's `## Invocation`
  shows, a harness the kit supports. The finding says which.
- **`edge`.** The trigger needs a combination that is not ordinary: two people whose names differ
  only by marks, a script the team does not use, a session that ends on the stroke of midnight.
  Evidence moves a finding to `ordinary`: a run trace, a record, an issue or a test showing the
  trigger met once. There is no third value for a trigger seen in a run: it is `ordinary`, which
  gives it the same severity (Q1 in `Answered` below).

An `edge` finding is a `NIT`, unless its consequence is one of these five, which keep the severity
the consequence earns:

1. a role's decision taken, or an approval state entered, without the person who owns it, per rules
   2 and 3 of `shared/team-roles.md`;
2. a secret or a person's data written, sent or shown, per rule 9;
3. an action past the consent line of `shared/finalize-steps.md`;
4. history or a person's uncommitted work lost or overwritten;
5. a public contract broken, per `shared/spec-docs.md`.

The five are fixed in `review/SKILL.md`, as the floor of the kit, the way
`shared/project-overrides.md` fixes what an override may never remove. A project adds a consequence
of its own by recording a rule with its severity in its review checklist, per
`shared/review-checklist.md`, which reach never lowers (Q2 in `Answered` below).

`PLAUSIBLE` is unchanged and still caps at `SHOULD FIX`. Reach is a second label beside it, written
on the finding's `Raised by` line as `Reach: edge`, so `NIT` findings in the one-row form carry it
in that column.

### The default for a state no rule covers

Rule 5 of `shared/team-roles.md` gains one paragraph:

> A state no rule of the skill covers is not filled by guessing what the rule would have said. The
> run says the case is not covered, asks the person running the skill where the answer is theirs to
> give, and otherwise names the person rule 3 gives it to and asks them, then goes on with the
> answer; a run with nobody to ask stops and names the case in its closing message and its trace.

The `boundary` round and step 5 of `review/SKILL.md` drop a candidate on an uncovered state when this
default handles it correctly, that is, asking is safe and the person the default asks owns the
answer. A gap where the default itself goes wrong is still a finding: a run that cannot stop, an
answer whose owner the run cannot name, or a question that would leak a secret. The report names how many it
dropped this way, as it counts refuted ones.

### The `Fix` of a finding

`report-format.md` lets `Fix` take one of three forms, named first in the line:

- **Correct:** a sentence says something false, and it is rewritten.
- **Leave to the default:** a sentence fills a state no rule covered by guessing what the rule would
  have said, and rule 5's default answers that state correctly, so the sentence is removed or not
  added. A state that is merely uncovered, with the default right for it, is no finding at all.
- **Add a rule:** the default would give a wrong answer in an ordinary case. The finding names the
  states the new rule itself opens, in one line, so the fixer can weigh them.

### The narrowest fix

`shared/review-fix-loop.md`, the `SHOULD FIX` row and the paragraph under it, and `atk:fix` step 3:

- On a rule an agent follows, take the first of the three forms that removes the finding: correct,
  then leave to the default, then add a rule. A suggested fix is a suggestion. Where the fixer takes
  another form, it says which and why.
- A fix that adds a rule names the states the rule opens and weighs them before it lands.
- A fix that grows a file every run reads, `shared/team-roles.md`, `shared/run-trace.md` or
  `shared/artifact-paths.md`, writes its size before and after in the record.

The fix report template's section 5 gains one line: the form each finding took.

### Data model and migration

`N/A`. No stored data.

### API contract

`N/A`. No flag and no `argument-hint` changes. The review report gains a `Reach` label and a
`Fix` form. A reader of an older report finds neither, which means "not assessed".

### Error and edge cases

- A finding whose reach the reviewer cannot judge is `ordinary`. The cost of a wrong `ordinary` is
  one `SHOULD FIX`, and the cost of a wrong `edge` is a defect that ships at `NIT`.
- A finding that is `edge` and also `PLAUSIBLE` is a `NIT`. Both labels are written.
- A project's convention rule with a recorded severity keeps that severity, per
  `review/SKILL.md:211-212`. Reach does not lower a rule the team wrote down.
- Code findings: no reach, by scope.

### Backward compatibility

Reports written before this change carry no `Reach`. A second review on the same target takes an
earlier finding's identifier as before, and gives it a reach. Under the renumbering rules of
`report-format.md:72`, a finding whose severity drops from `S` to `N` keeps its old ID in its title,
`(was S3)`.

### Rollout

One pull request: the review files, the loop, `atk:fix`, rule 5, and their docs in both languages.
The next review of a change to the kit applies it. Results are checked against the next two reviews
of a skill change, by their counts per severity and the number of `SHOULD FIX` findings each fix
round introduces.

### Rollback

Revert the pull request. Nothing depends on the label.

### Observability

The review report's `## Rounds` section counts findings by reach. It also counts the candidates
dropped because the default handled them. A fix record names the form each finding took. Together
these let the next review read how a fix loop converged. Run traces are unchanged.

### Security and permission impact

None widened. Protected consequences 2 and 3 keep secrets and consent at full severity whatever the
reach.

### Performance expectation

Rule 5 grows by about 400 bytes, read by every run. Reviews of agent rules should return fewer
`SHOULD FIX` findings. Fix loops on agent rules should add fewer lines per round. Neither figure is
measured yet.

### Files the implementation touches

- `plugins/atk/shared/team-roles.md`: rule 5, the default.
- `plugins/atk/skills/review/SKILL.md`: step 5, the dropped candidates; step 6, reach beside the
  severity table and the five protected consequences, fixed there (Q2).
- `plugins/atk/skills/review/references/review-rounds.md`: the `boundary` round and the report's
  `## Rounds` counts.
- `plugins/atk/skills/review/references/report-format.md`: `Reach` on `Raised by`, the three `Fix`
  forms, and the one-row `NIT` form.
- `plugins/atk/shared/review-fix-loop.md`: the `SHOULD FIX` row and the narrowest-fix paragraph.
- `plugins/atk/skills/fix/SKILL.md`: step 3, and the step 6 sentence that holds a loop fix to it.
- `plugins/atk/skills/fix/references/report-template.md`: section 5, the form per finding.
- `docs/skills-overview.md`, `docs/codebase-summary.md` and their `docs/vi/` mirrors, where they
  describe review severity or rule 5.

## Open questions

None open.

### Answered

| Question | Answer | Answered by | Date | Relayed by |
|---|---|---|---|---|
| Q1. Are the two reach values, `ordinary` and `edge`, enough, or should there be a third for a trigger a trace has shown? | "ok, đồng ý", agreeing to the proposal put to him in the session: no third value, since evidence already moves a finding to `ordinary` | Lam Ngoc Khuong | 2026-10-21 | |
| Q2. Should the five protected consequences live in `shared/review-checklist.md`, where a project could add its own, or stay fixed in `review/SKILL.md`? | "ok, đồng ý", agreeing to the proposal put to him in the session: fixed in `review/SKILL.md` as the kit's floor; a project adds its own through a rule with a severity in its review checklist | Lam Ngoc Khuong | 2026-10-21 | |
| Q3. S1 of the first implementation review: "Leave to the default" met the same condition as the dropped candidate. Which does it cover? | "Định nghĩa lại", choosing the proposal put to him: the form covers a sentence that guesses at a state the default answers, and its fix removes or leaves out that sentence; a state merely uncovered is dropped, not reported | Lam Ngoc Khuong | 2026-10-21 | |
| Q4. S2 of the same review: should rule 5's default ask the person running the skill when rule 3 gives the answer to another role? | "Thêm điều kiện", choosing the proposal put to him: ask the person running the skill where the answer is theirs to give, otherwise the person rule 3 gives it to | Lam Ngoc Khuong | 2026-10-21 | |

Q3 and Q4 were answered while the design was implemented. Q3 edited the `Leave to the default`
bullet of `### The Fix of a finding`; Q4 edited the quoted paragraph and the paragraph under it in
`### The default for a state no rule covers`, and the ADR.

Q1 edited `### Reach, and what it changes` (the `edge` bullet). Q2 edited the same section (the
paragraph after the five consequences) and `### Files the implementation touches`.

ADR: `docs/adr/0008-review-weighs-reach-of-agent-rule-gaps.md`
