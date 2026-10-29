# Estimate template

Loaded by `atk:estimate` when it writes the sheet. The first reader is the PM or the client asking
what the work is and what it costs: the main tasks, their points, and their hours. That reader stops
after the first screen, so the first screen answers it. Everything a reviewer needs to argue with a
number, the lines, the bases, the comparables and the buffer, sits in an appendix folded under it. Every run writes the same shape, so two estimates can be compared section
by section.

## The file

One file, at `docs/records/planning/estimate-<date>-<ticket>.md` per
`shared/artifact-paths.md`: front matter, a title, the summary line, two numbered sections, then
the appendix. A section with nothing in it is kept and says why it is empty: a missing heading reads
as a section the run forgot.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Estimate: <the epic or tickets estimated>"
status: IN REVIEW
owner: <the person who ran the estimate>
approver: <the PM who accepts the estimate, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <epic or ticket ids or URLs, comma separated, or none>
---
```

`status` is `IN REVIEW` once every section holds its numbers, and never `APPROVED` on this skill's
own: the team accepts the numbers, not the run, and the approver moves it or tells the agent to,
per rule 2 of `shared/team-roles.md`.

## Title and summary

`# Estimate: <same line as the front matter title>`, then one bold line and nothing else before
section 1:

```markdown
**Total: <points> SP · <hours> h (<hours with buffer> h with buffer, <man-days> man-days) · confidence <lowest> · <status>**
```

The line carries both units, per Units below. Under `--points` it reads `**Total: <points> SP
(<points with buffer> SP with buffer) · confidence <lowest> · <status>**`, the buffered points to
one decimal. Man-days are the
hours with buffer divided by the working day in Appendix C, rounded to one decimal, and are left
out when the sheet is already in days or has no time. A reader who stops
here has the answer. Do not add an opening paragraph; a sheet that
re-estimates an earlier one says so in a second sentence of the same line, with a link.

## 1. Tasks

One row per main task, in priority order, and a total row:

| # | Task | SP | Hours | With buffer | Confidence |
|---|------|----|-------|-------------|------------|

- **Task** is a few words a PM recognises, with its ticket or `AC N.M` in brackets. A main task is
  what the team would put on the board, not a line: Dev, QA, review and bug fix are folded into its
  hours here, and split out in Appendix A, except under `--points`, which has no lines.
- **SP** is the task's points from Appendix A. **Hours** is the sum of the task's lines before
  buffer, in the sheet's time unit; **With buffer** adds its own share, per Appendix D. Under
  `--points` the Hours column is dropped and **With buffer** holds the task's points with buffer,
  to one decimal, per Appendix D.
- **Confidence** is the lowest of the task's lines, or under `--points` its points row's.
- A task already in progress keeps its whole size here, and its remainder, whole size less time
  already spent, follows in brackets in the Hours cell.

Under it, the same total by discipline, because the PM fills a sprint with people, and a person is
a BE developer, an FE developer or a tester rather than a share of a task:

| Discipline | Hours | Left | With buffer | Man-days |
|------------|-------|------|-------------|----------|

One row per discipline present in Appendix A, then a total row. **Hours** is whole size, like
section 1. **Left** takes off the time already spent on that discipline's lines of a task in
progress, as the tracker records it; time the tracker records against the task alone is named under
the table rather than split by guess. The PM plans on Left, so **With buffer** and **Man-days**
here are worked out on Left, at each line's own rate; Man-days are dropped where the summary line
drops them, and the table is dropped under `--points`.

Under the tables, a short list headed `Not estimated:` names each item marked `NEEDS INTAKE`, the
question that blocks it, and the person who must answer. Write `Not estimated: none.` when there is
nothing.

## 2. Open questions

At most the five unknowns that would move the total most, one line each: the question, the task it
moves and by roughly how much, and the person who must answer it, per rule 1 of
`shared/team-roles.md`. The rest go in Appendix A, beside the line they move.

## Appendix

The whole appendix is one block, so it stays folded where the Markdown renderer supports it:

```markdown
<details>
<summary>Appendix: points, lines, bases, comparables, units, buffer</summary>

### A. Points and lines per task
...
</details>
```

Keep a blank line after `<summary>` and before `</details>`, or the tables inside render as text.

### A. Points and lines per task

First the points, one row per task, on every sheet:

| Task | SP | Basis | Confidence |
|------|----|-------|------------|

The basis names the driver counts that decided the points, `2 tables written, 1 external call, 3
screen states`, per `references/complexity-drivers.md`, or the calibrated rate and the hours it was
applied to, per Units below.

Then the lines, one row per task, line and discipline, a line being `Understanding`, `Dev`, `QA`, `Review` or
`Bug fix`. `Understanding` appears only where the team has a person understand the spec before
coding:

| Task | Line | Discipline | Hours | Basis | Confidence | Unknown that would move it | Comparison |
|------|------|------------|-------|-------|------------|----------------------------|------------|

- **Discipline** is one of the disciplines recorded in Appendix C, per step 3 of `SKILL.md`. A
  feature's end-to-end QA appears once, on the task where it becomes testable.
- **Basis** is a sentence a reader understands without opening anything else. A comparable is
  cited by its ticket and what it measured, `like #42, which took 6 h to add a similar export
  endpoint`, never by a code that sends the reader to another table. A decomposition names its
  steps with their hours, `2 h query and filters, 2 h file writer, 2 h tests`, and the driver
  counts that decided it, or for a QA line the tester's steps, `1 h writing 8 cases, 0.5 h
  reviewing them, 2 h executing, 0.5 h smoke and final run`. A share of another line names the
  pairs it was measured on, per step 3 of `SKILL.md`. A number taken over unchecked says
  `carried over, unchecked` with a link to where it came from.
- **Hours** is in the sheet's time unit, hours or person-days. Under `--points` the lines table is
  left out, since a line is time and the sheet has none.
- **Comparison** holds the figure of the model named in Appendix C, and any formula, rate or share
  that step 3 of `SKILL.md` sends there, each labelled with where it came from. The column is
  dropped when there is none of these, and it never feeds a total.
- A total per line, a total per discipline and a grand total close the table, before the buffer.

### B. Comparables

| Ticket or PR | What it was | Layer and technology | Built | Estimated | Actual | Source of the actual |
|--------------|-------------|----------------------|-------|-----------|--------|----------------------|

The table is the record of every comparable the lines cite, keyed by its ticket, which is how the
lines cite it. `Built` is `AI assisted`, `by hand`, or `unknown`. A row whose layer, technology, or way of building
differs from the task it supports cannot lift that task to `HIGH` confidence. Below the table, one
line with the measurement check from step 2: how many samples record an actual exactly equal to
their estimate, the project-wide share where the run measured it, and what that did to confidence.
An estimate already on the ticket is not a comparable and does not appear here.

### C. Units, scale, and policy

A list, one item each:

- **Time unit** and why: the flag that named it, the tracker field that records actual time, or
  hours because it records none; or no time, under `--points` or because the field could not be
  read, with the class of failure, and the person chose to go on in points alone.
- **Points**, per Units below: sized from the drivers or from a calibrated rate, and for a rate the
  samples it was calibrated from and the period they cover.
- **Points cover**: whether the points include the `Understanding` lines, per step 3 of
  `SKILL.md`, and so whether points and hours cover the same scope. Under `--points` it also says
  that QA, review and bug fix are inside the points rather than left out.
- **Disciplines**: the list the lines use, and whether it came from `.atk/overrides/estimate.md` or
  from the person, asked.
- **Scale**: the steps for points, per step 3 of `SKILL.md`, and whether they are the kit's
  Fibonacci default or come from `.atk/overrides/estimate.md`, with the scale the tracker's points
  field records where it differs; the rounding used for hours or days.
- **Working day**: hours per person-day, and whether it came from `.atk/overrides/estimate.md` or
  from the person, asked. Left out with the man-days.
- **Buffer rates**: the rate per confidence level, and whether they are the kit's defaults or come
  from `.atk/overrides/estimate.md`.
- **Complexity rubric**: the drivers of `references/complexity-drivers.md`, or the project's own, and
  whether it replaced or extended them.
- **Comparison model**: the estimate model the project already keeps, and any formula, rate or
  share the Comparison column holds, each named as a source of that column and not of any basis;
  `none` when the column is dropped.

### D. Buffer

One row per confidence level present: the Appendix A total at that confidence, its rate, and what it
adds. The buffer is their sum, and the total with buffer follows. A task's share
is its own lines at their own rates, which is what its `With buffer` cell in section 1 carries; a
discipline's is worked out the same way on its Left, per section 1.
Under `--points` the rows are the points table's, by confidence, and the buffer is in points.

## Units

A reader asking "how many points and how long" needs both, so every sheet carries both unless
`--points` was passed, whether or not the tracker keeps a field for each. The time unit is set per
Invocation in `SKILL.md`, and every line of Appendix A is in it, since a line is time a person
spends. Points size the task as a whole, and come from one of two places, which Appendix C names:

- **Sized on their own**: from the complexity drivers, with the counts as the basis. Then points and
  hours may disagree, and that is information, not an error.
- **A calibrated rate**: hours per point taken from finished items in the same tracker that record
  both, with the samples, the period and the median shown, applied to the task's hours less the
  lines Points cover leaves out, and rounded to the nearest step of the scale. Where most of those
  samples record an actual equal to their estimate, the rate is a ratio of estimates, and Appendix
  C says so.

## Before the status moves to `IN REVIEW`

Every total equals the sum of the rows above it, and a figure carried elsewhere is the same figure:
each task's points in section 1 are its row in the points table of Appendix A, and the SP total
their sum; each task's hours in section 1 is the sum of its lines in Appendix A, and so is each
discipline's; the two tables of section 1 end on the same Hours total, while their `With buffer` totals differ
by the buffer on time already spent; the grand total of Appendix A
is the base of Appendix D and the hours in the summary line, or under `--points` the SP total is.
Check the sums before setting the status; a sheet whose columns do not add up is not ready for
review.
