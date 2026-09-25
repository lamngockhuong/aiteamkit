---
title: "Fix: atk:estimate let a conversion factor stand in for a measured basis, and wrote no fixed sheet shape"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# atk:estimate: basis, actual time, and one sheet shape

The source is a `--feedback` record written in a client project on 2026-09-25,
`docs/derived/feedback/estimate-2026-09-25.md`. It is gitignored there, so
`ticket` is `none` and its findings are cited here by their numbers, `#1` to `#9`. The run compared
two estimates of the same epic: one built on the project's points-to-hours factor (74.88h) and one
built on the tracker's actual times (50.03h).

Seven findings were in scope for the kit, plus two raised by the owner in the conversation: `T1`, no
template, and `T2`, what a size is judged from and whether it is for people or for AI, answered by
reading the project's own estimate skill for what the kit should learn from it. `#8` belongs in that project's `.atk/overrides/estimate.md`, and `#9` is a run that did
not follow a definition that was already clear; neither changes the kit.

## 1. Symptom as captured

From the record, verbatim:

> Tổng lệch 24.85h (74.88h so với 50.03h). Dòng FE lệch 8.7h, vì việc sửa một hằng số cũng bị tính
> 2.09h. Understanding Check lệch 7.1h. QA lệch 7.2h. Người dùng phải yêu cầu làm lại toàn bộ.

And from the owner in this session:

> report estimate nên có một template, hiện tại tôi thấy có vẻ chưa có, nếu chạy estimate nhiều
> lần, hoặc cho các ticket khác nhau thì không ra một format thống nhất nhỉ?

And, later in the session:

> Estimate phán đoán độ phức tạp dựa vào đâu? Có phụ thuộc công nghệ không?

## 2. Root cause

One mechanism behind `#1` to `#5`: the definition named where a basis comes from only as "the
repository and the git history" (`skills/estimate/SKILL.md:60`), and never said what does not count
as one. A squashed history carries no elapsed time, so the run had nothing measured, and filled the
gap with the nearest number it could find: the project's conversion factor (`#1`) and the estimate
already on the ticket (`#3`). The tracker's actual time was the missing source, and
`shared/ticket-adapters.md:94` mapped no field for it (`#2`). Nothing asked whether an actual was
measured (`#5`), and the separate lines stopped at Dev, QA and review (`:67`), leaving the bug-fix
work QA predictably produces off the sheet (`#4`).

`#6`: the buffer rule at `:69-70` named `HIGH` and `LOW` and nothing between. `#7`: the unit came
from a flag alone (`:39-40`), and the split threshold at `:102` had no hours form. `T1`: the Output
section listed sections in one sentence and no reference fixed their order or columns. `T2`: step 3
named a scale and a confidence but no driver of complexity, so a size could only come from a
comparable or from feel; nothing separated how complex an item is from how fast the team now
delivers it, which is the axis generated code moves; and nothing distinguished a comparable built by
hand from one built with AI assistance, or in another stack.

## 3. Evidence

The responsible lines, as they stood at `0b31930`:

```
60  Search the repository, or every repository the work touches where the project has several, and the git history for similar past work: ...
61  migration, a similar screen. A comparable with a real elapsed time beats an opinion. Cite it.
67  that would move it. Separate Dev, QA, and review effort into their own lines.
69  Apply the buffer explicitly as a visible line, not by inflating individual numbers. Default buffer
70  is 15 percent for `HIGH` confidence work and 30 percent when any `LOW` confidence item is in scope.
102 - [ ] No committed item is larger than 8 points or 3 person-days without a split.
```

`shared/ticket-adapters.md:94`, the only time-related row in the vocabulary map:

```
| Estimate | Custom field or label | Story Points | Estimated hours | Estimated time |
```

`ls skills/estimate` printed `SKILL.md` and `evals`, with no `references/`. The check that shows the
lines produced the behaviour is the record's own comparison: the rerun that read the project field
a custom actual-effort field on the tracker for 20 comparable tasks landed 24.85h below the factor-based run.

## 4. Why it surfaced now

Broken since it was written: `215a0fa` introduced the skill with the same step 2 and the same
vocabulary row. It surfaced now because this was the first run against a tracker that records actual
time and a project that keeps its own conversion factor.

## 4b. Recorded intent, and the conflict when there is one

Searched `README.md`, `docs/`, `shared/` and `git log --grep=estimate`. No record says a conversion
factor or a prior estimate is an acceptable basis; `docs/project-overview-pdr.md:36` says the
opposite ("An estimate is a number with no basis ... is never learned from"). The buffer rates,
the unit, and whether a project's own model may appear at all are the kit author's decisions, and
the owner made them in this session: tiered buffer overridable per project, unit from the tracker
with no new flag, and a project's model confined to a comparison column. After reading
the project's own estimate skill, the owner revised the last one: a rate per point is a basis when the sheet shows the
actual times it was calibrated from and those samples were built the same way, which is what the
source record itself asked for ("Công thức chỉ được dùng khi đã đối chiếu với giờ thực tế").

## 5. The change

`skills/estimate/SKILL.md`: step 1 treats an estimate already on the ticket as an opinion and marks
a number taken over unchecked (`#3`); step 2 reads the tracker's actual time before git and checks
that it was measured, capping confidence at `MEDIUM` when actuals equal estimates (`#2`, `#5`); step
3 adds the bug-fix line (`#4`), says what is not a basis and confines a project's model to a
comparison column unless its calibration from actual times is shown (`#1`), and tiers the buffer 15, 20 and 30 percent by the lowest confidence, as
defaults a project overrides in `.atk/overrides/estimate.md` (`#6`). Invocation takes the unit from
the tracker when no flag is given; the DoD split threshold gains 24 hours (`#7`). Step 5 and Output
point at the new `skills/estimate/references/estimate-template.md`, nine numbered sections (`T1`).
`shared/ticket-adapters.md` gains an Actual time row. `CLAUDE.md` and both `codebase-summary.md`
files move the count of skills with `references/` from seventeen to eighteen and list the template;
both `skills-overview.md` files stop naming git history as the usual source of a comparable.

`T2`, from reading the client project's own estimate skill: a new
`skills/estimate/references/complexity-drivers.md` holds countable drivers per layer, why technology
and verification cost weigh more once code is generated, QA risk by feature type, and the drivers of
understanding a spec, with a project's own rubric going in its override. Step 3 points at it, adds
an `Understanding` line where the team runs one, separates points (complexity) from hours (current
speed), and requires a decomposition by the steps that cost a person time rather than by code
volume. Step 2 lets a comparable lift an item to `HIGH` only when it matches layer, technology, and
way of building. The template gains `Layer and technology` and `Built` columns, the rate and rubric
lines in section 2, and a closing rule that totals reconcile. Not taken from that skill: its fixed
ratios, its velocity phases tied to sprint numbers, a bug-fix reserve outside the total, and an
`Actual` column filled in later, since a committed record is not edited and the actual already lives
on the tracker, where the next run reads it.

No flag was added, so the flag touch list in `CLAUDE.md` does not apply, and `argument-hint` and the
`README.md` invocation block stand. Review effort by pull request count, proposed in the record, was
left out: it is one team's method, and step 3's basis rule already refuses an unfounded percentage.

After the review of PR 72 (`docs/derived/reviews/72-260925-0659.md`, derived and not committed),
every finding was taken:

- `B1`: `skills/catchup/references/understanding-check.md` already said a second feature
  classification must not be built, and named `shared/feature-types.md` as the destination. The
  table moved there with a `QA risk` column beside the `catchup` questions, `Low` for a feature no
  row describes; both references now cite it. `CLAUDE.md`, both `system-architecture.md`, both
  `codebase-summary.md` and both `project-roadmap.md` count fifteen shared files.
- `S1`: the DoD allows an estimate carried over unchecked when the basis column marks it so, which
  is what step 1 asks.
- `S2`: the Ticket section writes points to a points field and hours to a time estimate, never one
  into the other.
- `S3`: step 4 and template section 6 state the hours in one person-day and their source.
- `S4`: section 7 commits each item at its total plus the buffer rate; committed plus overflow,
  before buffer, equals section 4.
- `S5`: `complexity-drivers.md` allows a decomposition beside a comparable, as step 3 does.
- `S6`, `N1`, `N2`, `N3`: roadmap counts, row order, lifecycle order, and the `DRAFT` state in the
  phase table.
- `S8`: this record named the client project, its custom field, its ticket, and its own skill; they
  are now described neutrally. `CLAUDE.md` gains "A record here names no client" and `CONV-010`, and
  the one record on `main` that named the same project,
  `docs/records/fixes/260921-skill-run-silences-git-and-init.md`, carries a recorded redaction.
- `S7`: see section 6.

The re-run in section 6 then reported sixteen places the definition left a run to guess. Nine were
taken here, all inside `atk:estimate`:

- With capacity still owed, nothing is cut: items are listed as proposed, and section 8 says the
  cut waits on capacity and who owes it, rather than "Nothing overflowed". The share of a sprint one
  epic may use is a capacity input the PM gives.
- An item already in progress is sized whole, with the time spent beside it, and the sprint carries
  the remainder.
- A comparable whose way of building is unknown counts as built differently.
- "Most" in the measurement check counts the comparables the sheet cites.
- `High` QA risk caps the QA line at `MEDIUM`.
- Each line takes the buffer rate of its own confidence, so one small `LOW` line, an understanding
  line with nothing measured behind it, no longer lifts every line to 30 percent. The three tiers the
  owner chose stand; only what they apply to changed.
- The split threshold is measured on the sum of an item's lines before buffer.
- QA owns its test effort: the skill drafts the QA line for QA to accept.

Tidy step: the change is Markdown prose, which the host's clean-up capability is not built for, so
the pass was run by hand per `shared/tidy-pass.md`. It added the pointer from step 5 to the template,
which `CLAUDE.md` requires of a new reference, and changed nothing else.

## 6. Verified

From `CLAUDE.md`, "Common verification commands", as the profile directs:

- Manifests parse: all five, no failure printed.
- Name matches folder: `OK name` for `estimate`.
- Mirror: the `diff` of the two `find` listings printed nothing, `OK mirror`.
- Em-dash `grep`, other-kit `grep`, dated-name `grep`: each exited 1, nothing printed.
- `wc -l skills/estimate/SKILL.md`: 146, under the 300 ceiling.
- `check_translation.py docs/vi --source docs`: no failure or warning on the lines changed; the
  failures it prints sit on lines this change did not touch.

The reproduction is an agent run, and it was re-run: a fresh agent with no conversation history
followed the working-tree definition against the same epic in the client project, on 2026-09-25,
and wrote its sheet there. It followed the nine sections, cited a comparable or a decomposition for
every number, filled the new comparables columns, and its totals reconciled when checked by script.
It landed at 54.0h before buffer and 70.2h after, against 50.03h and 74.88h for the two earlier
sheets. Most of the gap to 50.03h is one Dev line decomposed with tests and review rework the
earlier sheet left out, and the buffer went to 30 percent because the understanding and bug-fix
lines had nothing measured behind them. The sheet stayed `DRAFT`: no capacity input was on disk.

## 7. Not verified

- Steps 4 and 5 of the re-run: every capacity input was missing, so no commitment was cut.
- The re-run reported gaps in the definition itself, listed in section 9.
- The Actual time cells for Jira, Backlog and Redmine come from each tracker's documented field
  names, not from a live instance.
- The generic drivers in `complexity-drivers.md` are stated without calibration on purpose; how well
  they separate sizes is untested on any project.
- Trigger evals: the description is unchanged, so they were not re-measured.

## 8. Blast radius

- `shared/ticket-adapters.md` vocabulary map, cited by every skill: the row is additive; no skill
  reads a row by position. Read, not exercised.
- `skills/catchup/references/understanding-check.md`: now reads its questions from
  `shared/feature-types.md`; the nine rows and their questions are unchanged. Read, not exercised by
  a `catchup` run.
- `skills/tailor/references/interview.md:57`: already treats a buffer rate as a constraint the team
  owns, which agrees with the override sentence. Read.
- `skills/help/references/state-signals.md:52`, `skills/breakdown/SKILL.md:26`,
  `skills/retro/SKILL.md:27`: name the skill, read none of the sheet's sections. Read.

## 9. Left for later

From the re-run, each touching a contract every skill shares, so kept for their own change:

- `shared/artifact-paths.md`: the default `estimate-<sprint-or-date>` name collides when two epics
  are estimated for one sprint.
- `shared/ticket-adapters.md`: a passing `gh auth status` proves a login, not that the repository is
  readable by that account.
- `shared/project-overrides.md`: says nothing on whether an override still `IN REVIEW` applies.

Not the kit's to change: a project that tracks review rework as its own ticket type, two places the
client project's override and the template disagree (the override is what moves), and an ignored
records directory, which the persistence check caught as designed.

- `#8`, in the client project: an `.atk/overrides/estimate.md` naming its custom actual-effort
  field, hours with AI support as the unit, and its own estimate skill as the comparison column. Written with
  `/atk:tailor` there; approver the project PM.
- The record's open question 2, whether AI-supported hours are a valid actual while points stay
  unchanged, is the project PM's to answer, not the kit's.
- Step 3 splits at `13` points while the DoD splits above `8`; the gap between them predates this
  change and was not touched.
