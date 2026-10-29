---
title: "Fix: atk:estimate sheet too heavy for its first reader, an unreadable actual-time field read as none, and sprint planning out of scope"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-28
updated: 2026-10-29
ticket: docs/derived/feedback/estimate-261028-1455.md#1, docs/derived/feedback/estimate-261028-1455.md#2, docs/derived/feedback/estimate-261028-1455.md#3, docs/derived/feedback/estimate-261028-1455.md#4
---

# Fix: atk:estimate sheet too heavy for its first reader, an unreadable actual-time field read as none, and sprint planning out of scope

The source is an `atk:tailor --feedback` record of one `atk:estimate` run on a client project, a
backend and infrastructure epic of five stories. That record is derived and uncommitted; it is cited
here by its path inside this repository's working tree and its date, 2026-10-28.

## In short

One estimate run produced a sheet whose answer, points and hours per main task, sat in section 4 of
nine, cited comparables by codes such as `C4` that sent the reader to another table, carried hours
only although the tracker also keeps a points field, and before that had been written entirely in
points because the tracker's actual-time field, on a GitHub Project the token could not read, was
taken to be absent. Findings 1 to 3 were already fixed in the working tree by the maintainer: the
sheet now opens with a one-line total and a task table in both units, with the evidence folded into
an appendix and bases written as sentences. This run fixed finding 4: `atk:estimate` now treats an
unreadable field as unread rather than missing and asks whether to wait for access or go on in
points, and `shared/ticket-adapters.md` now says that `gh repo view` does not prove a Project and
that an unread field is never reported as absent. The feedback's first open question, how a
trace writes a capacity step whose input is owed, led the maintainer to take capacity and the sprint
commitment out of the skill (F5): `atk:estimate` now answers points and hours per task, feature or
screen, and the PM plans the sprint from those numbers and the team's resources, outside the kit.
Set beside a client project's own estimate skill, the sheet then gained a discipline on every line
with hours and man-days per discipline, one end-to-end QA line per feature, QA sized by the tester's
steps, and a stated point scope (F6). A trial run on the same client project showed two gaps, a
points scale taken from the tracker and review sized as an unmeasured share of Dev, both closed
(F7). The whole change went through `atk:review`, ending with no `BLOCKING` or `SHOULD FIX` open.
One question stays open with the maintainer: whether the Comparison column becomes one line.

## After the last round

The last review round, `docs/derived/reviews/main-worktree-261029-0641.md`, fixed nothing: it read
the fixes the round before it made for F7 (the Comparison column kept when a project has no
estimate model, the bug-fix share, the share rule narrowed to review and bug-fix lines, and line
wrapping) and closed all four, raising one `NIT`, N15, left for later in section 9.

## F1. The sheet is shaped for the evidence, not for its first reader

### 1. Symptom as captured

> the estimate report is hard to read and carries too much; only the main tasks with points and
> time are wanted

Feedback finding 1: the run wrote nine sections in order; points and hours per main task sat in
section 4, four lines per task with long basis cells, and the total in section 5. Cost: one full
rewrite of the sheet.

### 2. Root cause

The template fixed nine numbered sections ordered for the evidence and named the PM as reader
without giving that reader a first screen. Location: `plugins/atk/skills/estimate/references/estimate-template.md:3`,
`:12` as of `b7256ca`.

### 3. Evidence

The responsible lines, `b7256ca`: `estimate-template.md:12`, "front matter, a title, at most one
opening note, then nine numbered sections in the order below", with Items, Unit and policy,
Comparables, Estimate per item, Buffer, Capacity, Commitment, Overflow, Risks at `:46`-`:126`. The
check: the run followed them and produced the sheet the reader rejected, per the trace's
`corrected by hand` line at 14:33.

### 4. Why it surfaced now

Broken since written, `555f463` (#72), which introduced the nine-section shape; this was the first
run read by a person who wanted the summary rather than the evidence.

### 4b. Recorded intent

`docs/records/fixes/260925-0628-estimate-basis-and-sheet-shape.md` records "one sheet shape" so two
estimates compare side by side; the new shape keeps a fixed order, so it does not contradict it.

### 8. Blast radius

`plugins/atk/skills/estimate/SKILL.md` step 5 and `## Output`, `references/complexity-drivers.md:66`
(which pointed at section 2), both `codebase-summary.md` rows: all moved in the working tree.

## F2. Comparables cited by code

### 1. Symptom as captured

> the lines per task are hard to understand; why write C1, C2 in them, it makes it hard to read

### 2. Root cause

The template required a basis to cite a comparable by an ID assigned in another section.
Location: `estimate-template.md:91` and `:70` as of `b7256ca`.

### 3. Evidence

`estimate-template.md:91` at `b7256ca`, "**Basis** cites a comparable by its ID from section 3", and
`:70`, which assigns `C1`, `C2`. The run wrote cells such as "C4 (12 h) ... C8, C9, C10" as told.

### 4. Why it surfaced now

Broken since written, `555f463`.

### 4b. Recorded intent

Nothing records that a basis must use a code; searched `docs/records/fixes/` and `docs/adr/`.

### 8. Blast radius

Appendix B of the template, now keyed by ticket. Exercised by reading.

## F3. One unit where the reader asks for two

### 1. Symptom as captured

The same correction as F1, "only the main tasks with points and time are wanted". The run wrote
hours only, although the tracker keeps a Story Point field the team fills.

### 2. Root cause

`plugins/atk/skills/estimate/SKILL.md:46-47` chooses one unit per sheet, and nothing covered a
tracker that keeps both a points field and an hours field.

### 3. Evidence

`SKILL.md:46-47` at `b7256ca`, "the unit is the one the tracker records actual time in ... where the
tracker records no actual time, it is points", and no other line of the skill or its references
names a second unit (`grep -n -i "second unit\|both units" plugins/atk/skills/estimate` at
`b7256ca`: no hit).

### 4. Why it surfaced now

Broken since written, `555f463`.

### 4b. Recorded intent

`260925-0628-estimate-basis-and-sheet-shape.md:93-95` records "unit from the tracker with no new
flag". The primary unit still comes from the tracker; a second unit beside it, calibrated or sized
on its own, does not contradict it.

### 8. Blast radius

`## Ticket` of `SKILL.md`, which writes a number only into the field of its own unit: unchanged and
still holds, since each unit goes to its own field. Exercised by reading.

## F4. An unreadable actual-time field read as no actual time

### 1. Symptom as captured

Feedback finding 4: the run concluded the tracker records no actual time, chose points and wrote the
whole sheet in points. When the person changed the token's permission, the field existed and was
filled on most items, and the sheet was redone in hours. Cost: the first full sheet was discarded.
The trace holds no `corrected by hand` line for it; the person said in the session that the
permission had changed and asked the run to read the project.

### 2. Root cause

`SKILL.md:46-47` gave two branches, a tracker that records actual time and one that records none,
and nothing in the skill named a field that exists but could not be read, so a read refused for a
missing Project scope fell into the second branch. `shared/ticket-adapters.md` already put a
partial-permission read in "Detected but unreachable" for one item, but its proof call,
`gh repo view`, proves issues and not a Project, and the skill never applied that row to the unit
choice. Location: `plugins/atk/skills/estimate/SKILL.md:46-47`; `plugins/atk/shared/ticket-adapters.md:43-49`, `:62-65`, `:98`.

### 3. Evidence

The responsible lines, `b7256ca`:

```
plugins/atk/skills/estimate/SKILL.md:46  Without either flag, the unit is the one the tracker records actual time in, so the next estimate can
plugins/atk/skills/estimate/SKILL.md:47  be set against what this one turned into; where the tracker records no actual time, it is points.
plugins/atk/shared/ticket-adapters.md:98 | Actual time | A number field on a Project, when the team added one; none by default | ...
```

The check: `grep -n -i -E "unreach|could not be read|cannot be read|permission|access"` over
`plugins/atk/skills/estimate/SKILL.md` and its `references/` returns one hit, a complexity driver
about permission rules in the code being estimated, and nothing about a field the run cannot read.

### 4. Why it surfaced now

Broken since written, `555f463` (#72), which introduced the unit rule and the Actual time row; this
was the first run whose token could read issues but not the Project.

### 4b. Recorded intent

`260925-0628-estimate-basis-and-sheet-shape.md:93-95`: "unit from the tracker with no new flag".
Nothing records that an unreadable field counts as none; searched `docs/records/`, `docs/adr/`,
`docs/*.md` and `plugins/`.

### 8. Blast radius

- `plugins/atk/skills/estimate/SKILL.md:73` (time already spent on an item in progress) and `:79-84`
  (comparables from the Actual time field): read the same field, and already fall under the per-item
  rule of `shared/ticket-adapters.md`, which now also says an unread field is never reported missing.
  Not exercised by a run.
- Every skill that reads a GitHub Project field through `shared/ticket-adapters.md`, the sprint
  window and status above all (`ticket-adapters.md:92`, `:96`, `:100`, `:110`): the new sentence
  reaches them through the shared file. Not exercised by a run.

## F5. Capacity and the sprint commitment leave the skill

### 4b. Recorded intent, and the decision that changes it

Asked on 2026-10-28 what the estimate is for, the maintainer, Lam Ngoc Khuong, answered: a person
running it wants the points and hours to finish a task, a feature or a screen; once the estimate has
numbers, the PM puts tasks into the sprint at sprint planning from the team's resources and each
member's load; sprint fit is removed entirely, not kept behind a flag; and the change goes in the
same pull request as F1 to F4, since it changes how the skill works. It reverses part of
`docs/records/fixes/260925-0628-estimate-basis-and-sheet-shape.md` (capacity owed means nothing is
cut; an item in progress carries its remainder into the sprint), by the same owner who made it.

## F6. Lines with no discipline, and QA counted per task

### 4b. Recorded intent, and the request

Compared on 2026-10-29 with a client project's own estimate skill, the maintainer asked for five
things: every line names its discipline and the first screen totals hours per discipline; man-days
beside hours, from the working day in the override or asked once; a feature's end-to-end QA counted
once, on the task where it becomes testable; a QA line sized by the tester's steps, never a fixed
share; and Appendix C saying whether points include the `Understanding` lines. Asked whether a sheet
carries one unit or both, the maintainer chose both, always, unless `--points`. The plan is
`plans/261029-0026-estimate-discipline-lines/`, kept outside the repository's history.

## F7. A trial run: the tracker's points scale, and review as a share of Dev

### 1. Symptom as captured

A run of the new skill on the same client project, an epic of five stories, wrote points of 3.5,
7.5 and 2.5: hours divided by a calibrated rate and rounded to halves, because the tracker's points
field holds halves. It sized every review line at a median share of Dev taken from item pairs whose
actuals mostly equal their estimates, and the sheet named the median but not the pairs.

### 2. Root cause

`SKILL.md` step 3 called Fibonacci a default without saying who may change it, and the template's
Units said nothing about rounding a calibrated rate; the rule that a rate is a basis only with its
samples shown named hours per point alone, so a share of another line passed as a measured basis.

## 5. The change

F1 to F3, made by the maintainer before this run and checked here against the findings:
`references/estimate-template.md` now opens with a one-line total in points and hours, numbered
sections for tasks with both units and at most five open questions with owners (a third, sprint
fit, was removed by F5), and a `<details>` appendix with lines per task, comparables keyed by
ticket, units and calibration, and buffer; a basis is a sentence that cites a ticket and what it measured; a Units section
says a second unit comes from a calibrated rate with samples shown or is sized on its own, and is
left out otherwise. `SKILL.md` step 3, step 5 and `## Output`, `references/complexity-drivers.md:66`
and both `codebase-summary.md` rows follow.

F4, this run: `SKILL.md:48-50` says a field the run could not read is not a tracker that records
none, per Detected is not reachable, and asks before sizing whether to wait for access or go on in
points, recording the choice in Appendix C. Appendix C's Primary unit item names that reason with
the class of failure. `shared/ticket-adapters.md` gains two sentences: on GitHub, `gh repo view`
proves issues and not a Project, so a Project field can still fail to read; and an unread field is
unread, not missing. The shared half is wider than the minimal fix; the maintainer chose to make it
now, since a sprint window or a status read on GitHub has the same gap. Also corrected: the Units
section of the template said the primary unit is chosen in step 3, when it is chosen under
Invocation.

Form of the change to an agent rule: a sentence added to the rule the run follows at the point it
decides (the unit rule), and a sentence in the shared file every tracker read already goes through,
not a new step or flag.

Tidy: the host's clean-up capability, `/simplify`, ran four agents over the lines F4 touched. Applied:
the restated "class of failure and who can grant access" became a pointer to the shared file, the
negated phrasing became positive, "Appendix C says which" became "record the choice in Appendix C",
and the template bullet and Units pointer were reworded. Skipped: reusing step 2's read for the unit
choice and a standing answer in the override, both behaviour changes listed in section 9. The move
of the GitHub fact to `shared/ticket-adapters.md` was raised there and made afterwards on the
maintainer's yes.

Reference documents: no public contract of an application changed. The kit's own docs that describe
`shared/ticket-adapters.md` (`CLAUDE.md`, both `system-architecture.md`, both `codebase-summary.md`)
still read true; the template rows in both `codebase-summary.md` moved with F1 to F3.

F5, this run, on the maintainer's decision below: `atk:estimate` no longer computes capacity or
fills a sprint. `SKILL.md` loses step 4 Capacity and the `--sprint` and `--capacity` flags; step 5
becomes step 4, Write the sheet, which lists tasks in the order the items came in; the description,
title, Scope, Roles, `## Ticket` (no sprint field), `## Output` and the Definition of done follow,
the last replacing the capacity and overflow items with one for the visible buffer. The template
loses section 3 Sprint fit, Appendix E Capacity and the `DRAFT` status that waited on capacity; a
task in progress shows its remainder in section 1. The default path becomes
`estimate-<date>-<ticket>.md` in `shared/artifact-paths.md`. Moved with it: `README.md`, both
`skills-overview.md`, both `codebase-summary.md`, both `flow/skill-chain.md` and
`flow/project-flow.md`, the PM row of `skills/init/references/role-defaults.md`, the Codex
`longDescription`, `atk:retro`'s Scope, which named `atk:estimate` as the owner of next-sprint
priority and now names the PM, the trigger evals (sprint-capacity queries are now a negative), and
the skill-lifecycle counts in both `flow/skill-lifecycle.md` and `tests/verify.sh`, 229 mentions in
126 pairs, since `atk:retro` no longer names `atk:estimate`.

F6, on the maintainer's request: Appendix A gains a points table and a Discipline column on every
line; section 1 gains a table by discipline with Hours, Left, With buffer and Man-days, With buffer
and Man-days worked on Left; the summary line carries man-days; Appendix C gains Points cover,
Disciplines and Working day; Appendix D defines a task's and a discipline's share of the buffer.
`SKILL.md` asks for the disciplines and the working day in one turn when the override lacks them,
splits a line spanning two disciplines, counts end-to-end QA once, sizes a QA line by the tester's
steps, and under `--points` sizes no lines at all. `complexity-drivers.md` charges `Understanding` per
discipline, and both `skills-overview.md` and `codebase-summary.md` follow.

F7, after the trial run: points take the scale the override sets, or Fibonacci, and a run never
adopts the tracker's own; Appendix C says where they differ, and points from a calibrated rate round
to a step of the scale. A review or bug-fix line sized as a share of another is a rate held to the
same terms as hours per point, its item pairs shown; otherwise it sits in the Comparison column,
which is now kept for that even when the project has no estimate model.

## 6. Verified

- `bash tests/verify.sh` (the profile's Test command): every line `OK`, after the fix, after the
  tidy, and after the shared-file change. It proves manifests and frontmatter parse, `SKILL.md`
  names and the trace lines hold, docs are mirrored, citations resolve inside the plugin, and every
  description fits; it does not prove a run follows the new prose.
- The `ak:`, `atkx`, em-dash and symlink checks of `CLAUDE.md`: clean. A first run of the em-dash
  check printed one line, `docs/records/fixes/261016-0613-review-author-replies.md:38`, because the
  session's `grep` was a wrapper around `ugrep`, which prints paths without their `./`; with the
  system `grep` the check prints nothing, per the review of 2026-10-29.
- `wc -l plugins/atk/skills/estimate/SKILL.md`: 189 after F7, under 300. After F5, `tests/verify.sh` failed on
  the skill-lifecycle counts (229 mentions in 126 pairs against 230 in 127) until both documents and
  the check were updated; every line `OK` afterwards.
- One run of `atk:estimate` on the client project after F6, before F7: the sheet carried a
  discipline on every line, a discipline table whose totals match the task table, man-days at the
  working day given, end-to-end QA once and a QA line by the tester's steps, and the run asked for the
  disciplines and the working day in one turn. It is what surfaced F7.

## 6b. Reviewed

F4 was first made under `--no-review`; the whole working tree was then reviewed by `atk:review`,
reports in `docs/derived/reviews/main-worktree-261029-*.md`. The rounds of 0052 and 0210 fixed one
`BLOCKING` (a section 9 item that quoted text pointing at the client project, removed) and every
`SHOULD FIX`; 0216 to 0233 closed the carried items; 0622 and 0641 reviewed F7. None is open at
`BLOCKING` or `SHOULD FIX`. `atk:verify` does not apply: the kit is prose and runs nowhere but in a
session, which the trial run above stands in for.

## 7. Not verified

- F7 was not re-run: whether a run now keeps the Fibonacci scale and shows its share pairs is
  unproven until the next run.
- No run was made against a GitHub Project the token cannot read (F4), nor under `--points` or
  `--days`, nor with a task in progress, so those paths of the sheet are read, not run.
- Other skills reading a GitHub sprint or status through the shared file were not run.
- The trigger evals were edited, not measured; per `docs/trigger-eval-measurement.md`, a real
  reading needs a run of their own.

## 9. Left for later

- Step 2 reads the same Actual time field again for comparables after the unit rule has read it;
  nothing says to reuse the first result. Owner: Lam Ngoc Khuong.
- A standing answer to "wait for access or go on in points" in `.atk/overrides/estimate.md`, so a
  project blocked the same way is not asked every run. A design choice. Owner: Lam Ngoc Khuong.
- No `atk` skill now handles a request about sprint capacity; a person asking it gets no skill,
  which the maintainer chose. `atk:help` routes by Scope and was not run against such a request.
  Owner: Lam Ngoc Khuong.
- Feedback open question 2, whether the Comparison column of Appendix A becomes one line under the
  table (`SKILL.md` step 3): needs discussion. Owner: Lam Ngoc Khuong.
- The `NIT` findings of the review reports, N1 to N4, N6, N7, N9 to N12 and N15, the last that the
  Definition of done still lets an uncalibrated rate stand in the basis column. Owner: Lam Ngoc Khuong.
- A calibrated hours-per-point rate may be cited by its median without the samples listed, which the
  trial run did. Owner: Lam Ngoc Khuong.
