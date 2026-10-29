---
name: estimate
description: >
  Estimate how many points and how many hours a task, a feature, or a screen takes: size each item
  with a stated basis, mark the confidence, and add the risk buffer as a visible line, so the
  numbers can be argued with in planning.
  Use for story points, hour or man-day estimates, and re-estimation after scope change.
  Triggers on: "estimate", "estimation", "story point", "man-day", "how long will this take",
  "ước lượng", "bao nhiêu point", "mất bao lâu", "見積", "工数", "何時間かかる", "/atk:estimate".
argument-hint: "[backlog-path|epic|ticket-ids] [--points|--days] [--out <path>]"
---

# Estimation (`atk:estimate`)

Produces an estimate whose numbers can be argued with, because every number carries the basis it
came from: a comparable past item, a decomposition, or a stated unknown. It answers how much each
item costs, in points and in hours; which items go into a sprint is the PM's call in sprint
planning, made from these numbers and the team's resources.

## Scope

Handles: sizing backlog items, recording the estimation basis and confidence, adding a risk buffer,
and flagging items too large or too vague to estimate.

Does NOT handle: writing the requirement (`atk:intake`), splitting work into tasks
(`atk:breakdown`), or the team's capacity and the sprint commitment, which the PM works out in
sprint planning from the people available and each member's load. This skill prepares the numbers.

## Roles

Tech Lead and Dev own the sizes. PM accepts the estimate, with the Stakeholder where a client asked
for it. QA owns its own test effort:
on a sheet with time, the skill drafts the QA line from comparables for QA to accept or change, as a separate line, never
folded silently into a Dev number. See `shared/team-roles.md`.

## Invocation

```bash
/atk:estimate <backlog-path>            # Estimate every item in a requirement or breakdown doc
/atk:estimate <epic-or-ticket-ids>      # Pull items from the detected tracker
/atk:estimate --points                  # Story points alone, no time
/atk:estimate --days                    # Time in person-days instead of hours
/atk:estimate --out <path>              # Override the default output path
```

Without either flag, the sheet carries both units: points for each task, and time for each line, in
the unit the tracker records actual time in, so the next estimate can be set against what this one
turned into, and in hours where it records none. A field the run could not read is not a tracker
that records none, per Detected is not reachable in `shared/ticket-adapters.md`: ask before sizing
whether to wait for access or go on in points alone, and record the choice in Appendix C of the
sheet.

Two more facts come from `.atk/overrides/estimate.md` before sizing, for a sheet with time: the
team's disciplines, such as `BE`, `FE`, `QA`, and, for a sheet in hours, the working hours in one person-day. Where it lacks
either, ask for what is missing in one turn, with the unit question when there is one, and
record the answers in Appendix C.

## Workflow

```
[1. Load items] -> [2. Find comparables] -> [3. Size] -> [4. Write the sheet]
```

Before step 1, read `.atk/overrides/estimate.md` when it exists, per rule 7 of `shared/team-roles.md`.
Then, before anything else, create this run's trace, `<docs root>/derived/traces/estimate/<run-id>.md`:
read the kit's `shared/run-trace.md` and do what it says before the file, at each step, and at the close.

### 1. Load items

Read each item and reject what cannot be estimated. An item with no acceptance criteria, or with an
open question that changes its size, is marked `NEEDS INTAKE` and excluded rather than guessed.

An estimate already on the ticket, in a comment or in the estimate field, is an opinion like any
other and never a basis. Re-check each assumption it rests on. A number taken over without that
check is marked as carried over, unchecked, in the basis column, so no reader takes it for one this
run produced.

An item already in progress is sized whole, as though it had not started, and the sheet records
the time already spent beside it from the tracker's actual time field. What is left is the
remainder, whole size less time spent, and the basis says so; a remainder near zero on an item
still open is a question for its owner, not a number to plan on.

### 2. Find comparables

Look for similar past work: a similar endpoint, a similar migration, a similar screen. Read the
tracker first, for closed items like it and the time actually spent on them, from the field
`shared/ticket-adapters.md` maps as Actual time. Then search the repository, or every repository the
work touches where the project has several, and the git history. The tracker comes first because a
squashed history records when work merged, not how long it took. A comparable with a real elapsed
time beats an opinion. Cite it, by ticket or pull request and the number taken from it.

A comparable supports `HIGH` confidence only when it sits in the same layer and technology as the
item and was built the same way, with AI assistance or by hand; a comparable whose way of building
is unknown counts as built differently. Where the override records when the
team's way of working changed, samples from before that date were not built the same way.

Check that an actual time was measured before it becomes a basis. When most of the comparables the
sheet cites record an actual exactly equal to their estimate, the field was most likely copied rather
than measured, and a project-wide share may be given beside that count: say so in
the artifact, and no item sized from those samples goes above `MEDIUM` confidence.

### 3. Size

Points take the scale `.atk/overrides/estimate.md` sets, and Fibonacci `1, 2, 3, 5, 8, 13` where it
sets none. A run never picks another scale on its own, not even the one the tracker's points field
records, and where the two differ Appendix C says so. `13` means too large to plan as one item: an
item above `8` points, 3 person-days, or 24 hours is split before it is planned, the same threshold
the Definition of done checks. Each item records: size, basis, confidence (`HIGH`, `MEDIUM`, `LOW`), and the unknown
that would move it. Judge complexity from the countable drivers in `references/complexity-drivers.md`,
not from how hard the work feels; a rubric in the project's override replaces or extends them.

Under `--points` no lines are sized: each task takes its points from the drivers, and QA's
effort shows in its drivers and its confidence. Otherwise, separate Dev, QA, review, and fixing the
bugs QA finds into their own lines. The bug-fix line is
sized from the bugs found on a comparable item and the time spent fixing them, or from a share
measured on such items per the rate rule below: it is predictable work, not buffer. Where the team
has a person understand the spec before coding, as the understanding check of `atk:catchup` does,
that is a line too, sized from the spec per the same reference and never derived from the Dev line,
since reading a spec does not get faster when the code is generated.

Each line belongs to one discipline: a line spanning two is split, and review and bug fix follow the
discipline whose code they touch. QA that tests a feature end to end is one line, on the task where
the feature becomes testable; a task tested before that carries only the QA of its own layer. A QA
line sized by decomposition names the tester's steps, writing cases, reviewing them, executing, and
the smoke and final run, each sized from the cases it covers and never as a fixed share of another
line.

Points measure how complex an item is and leave out the `Understanding` lines, unless the override
includes them; hours measure how
fast this team delivers it now. Every number comes from a measured comparable or from a
decomposition into the steps that cost a person time, such as understanding, steering and reading a
generated change, review, and verification, never from the volume of code. A rate of hours per
point is a basis only when the sheet shows the actual times it was calibrated from, and those
samples were built the same way as the work. A review or bug-fix line sized as a share of another,
review at 15 percent of Dev or bug fix at 10 percent, is a rate too, held to the same terms: the
item pairs it was measured on are shown, and where most of them record an actual equal to their
estimate, the share is a ratio of estimates and the basis says so. A formula, a rate or share with
no calibration shown, or an estimate model the project keeps otherwise goes in a separate
comparison column, labelled as not the basis, so the gap between the two stays visible.

Apply the buffer explicitly as a visible line, not by inflating individual numbers. Each line takes
the rate of its own confidence: 15 percent for `HIGH`, 20 percent for `MEDIUM`, 30 percent for `LOW`,
and the buffer line is their sum, shown by confidence. A small `LOW` line therefore adds its own 30
percent rather than raising the rate of every line beside it. These are defaults. A project sets its own rates in
`.atk/overrides/estimate.md`, and the sheet states the rates it used and where they came from.

Unless `--points` was passed, the sheet shows each task in both units: time from its lines, and
points from the driver counts or from a calibrated rate, per Units in
`references/estimate-template.md`, never from a rate with no samples shown.

### 4. Write the sheet

Write the sheet in the shape `references/estimate-template.md` fixes: the main tasks with their
points and hours on the first screen, the same total by discipline under them, and the lines, bases and buffer in a folded appendix beneath
them. List the tasks in the priority order the items came in, so the PM can take them into sprint
planning as they stand.

## Output

Written to `docs/records/planning/estimate-<date>-<ticket>.md` per `shared/artifact-paths.md`, in the
shape `references/estimate-template.md` fixes: front matter, a one-line total, two numbered
sections (tasks, open questions), then a folded appendix, in the same order on every
run, so two estimates for two tickets can be read side by side.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Estimates map to the tracker estimate field, in the unit that
field holds: points go to a points field such as Jira's Story Points, and hours to a
time estimate such as Jira's Original Estimate. A number in one unit is never written into a field
kept in the other.
Write back only after the team accepts the numbers.

## Definition of done

- [ ] Every estimate states its basis and confidence.
- [ ] No number rests on a formula, an uncalibrated rate, or an estimate carried over unchecked
      unless the basis column marks it so.
- [ ] No item is larger than 8 points, 3 person-days, or 24 hours without a split,
      measured on the sum of its lines before buffer, or on its points under `--points`.
- [ ] On a sheet with time, QA, review, bug-fix, and, where the team runs one, understanding
      effort appear as their own lines.
- [ ] On a sheet with time, every line names one discipline, section 1 totals each discipline, and
      no feature's end-to-end QA is counted on more than one task.
- [ ] The buffer is a visible line by confidence, not folded into the sizes.
