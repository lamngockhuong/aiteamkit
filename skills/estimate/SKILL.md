---
name: estimate
description: >
  Estimate a backlog and fill a sprint against real team capacity: size each item with a stated
  basis, mark the confidence, add the risk buffer, subtract leave and meetings, and produce a sprint
  commitment the team can defend in planning.
  Use for story points, man-day estimates, sprint planning, capacity checks, and re-estimation after
  scope change.
  Triggers on: "estimate", "estimation", "story point", "man-day", "ước lượng", "estimate sprint",
  "sprint planning", "capacity", "見積", "工数", "how long will this take", "/atk:estimate".
argument-hint: "[backlog-path|epic|ticket-ids] [--points|--days] [--sprint <name>] [--capacity <person-days>] [--out <path>]"
---

# Estimation and Sprint Planning (`atk:estimate`)

Produces an estimate whose numbers can be argued with, because every number carries the basis it
came from: a comparable past item, a decomposition, or a stated unknown. Then turns the estimate
into a sprint commitment that respects the capacity the team actually has.

## Scope

Handles: sizing backlog items, recording the estimation basis and confidence, adding a risk buffer,
computing net capacity from headcount and leave, selecting the sprint scope, and flagging items too
large or too vague to estimate.

Does NOT handle: writing the requirement (`atk:intake`), splitting work into tasks
(`atk:breakdown`), or committing the team. The team commits; this skill prepares the numbers.

## Roles

PM owns capacity and the commitment. Tech Lead and Dev own the sizes. QA owns its own test effort:
the skill drafts the QA line from comparables for QA to accept or change, as a separate line, never
folded silently into a Dev number. See `shared/team-roles.md`.

## Invocation

```bash
/atk:estimate <backlog-path>            # Estimate every item in a requirement or breakdown doc
/atk:estimate <epic-or-ticket-ids>      # Pull items from the detected tracker
/atk:estimate --points                  # Fibonacci story points
/atk:estimate --days                    # Person-days instead of points
/atk:estimate --sprint S12 --capacity 34  # Plan a named sprint against known net capacity
/atk:estimate --out <path>              # Override the default output path
```

Without either flag, the unit is the one the tracker records actual time in, so the next estimate can
be set against what this one turned into; where the tracker records no actual time, it is points.

## Workflow

```
[1. Load items] -> [2. Find comparables] -> [3. Size] -> [4. Capacity] -> [5. Commit sheet]
```

Before step 1, read `.atk/overrides/estimate.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Load items

Read each item and reject what cannot be estimated. An item with no acceptance criteria, or with an
open question that changes its size, is marked `NEEDS INTAKE` and excluded rather than guessed.

An estimate already on the ticket, in a comment or in the estimate field, is an opinion like any
other and never a basis. Re-check each assumption it rests on. A number taken over without that
check is marked as carried over, unchecked, in the basis column, so no reader takes it for one this
run produced.

An item already in progress is sized whole, as though it had not started, and the sheet records
the time already spent beside it from the tracker's actual time field. What the sprint carries is
the remainder, whole size less time spent, and the basis says so; a remainder near zero on an item
still open is a question for its owner, not a number to commit.

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

Default scale is Fibonacci `1, 2, 3, 5, 8, 13`. `13` means too large to commit: an item above `8`
points, 3 person-days, or 24 hours is split before it is committed, the same threshold the
Definition of done checks. Each item records: size, basis, confidence (`HIGH`, `MEDIUM`, `LOW`), and the unknown
that would move it. Judge complexity from the countable drivers in `references/complexity-drivers.md`,
not from how hard the work feels; a rubric in the project's override replaces or extends them.

Separate Dev, QA, review, and fixing the bugs QA finds into their own lines. The bug-fix line is
sized from the bugs found on a comparable item and the time spent fixing them: it is predictable
work, not buffer. Where the team has a person understand the spec before coding, as the
understanding check of `atk:catchup` does, that is a line too, sized from the spec per the same
reference and never derived from the Dev line, since reading a spec does not get faster when the
code is generated.

Points measure how complex an item is and do not change as the team gets faster; hours measure how
fast this team delivers it now. Every number comes from a measured comparable or from a
decomposition into the steps that cost a person time, such as understanding, steering and reading a
generated change, review, and verification, never from the volume of code. A rate of hours per
point is a basis only when the sheet shows the actual times it was calibrated from, and those
samples were built the same way as the work. A formula, a rate with no calibration shown, or an
estimate model the project keeps otherwise goes in a separate comparison column, labelled as not
the basis, so the gap between the two stays visible.

Apply the buffer explicitly as a visible line, not by inflating individual numbers. Each line takes
the rate of its own confidence: 15 percent for `HIGH`, 20 percent for `MEDIUM`, 30 percent for `LOW`,
and the buffer line is their sum, shown by confidence. A small `LOW` line therefore adds its own 30
percent rather than raising the rate of every line beside it. These are defaults. A project sets its own rates in
`.atk/overrides/estimate.md`, and the sheet states the rates it used and where they came from.

### 4. Capacity

Net capacity is headcount times sprint days, minus public holidays, leave, on-call, ceremonies, and
support duty. Ask for the leave plan if it is not in the repository. Where the sheet is in hours,
state the hours in one person-day and where that figure came from, the profile, the override, or
the PM when neither says, and express capacity in hours, so the sum stays visible. State the focus
factor used and why; do not hide it inside the arithmetic. Where the sheet covers part of a sprint,
one epic among several, the share of capacity it may use is an input the PM gives, a row like any
other.

### 5. Commitment sheet

Fill the sprint up to net capacity, in priority order, with each item carrying its share of the
buffer, and list what did not fit. The overflow list is part of the output, not a leftover. While a
capacity input is still owed, nothing is cut: the items are listed as proposed, in priority order,
and the overflow says that the cut waits on capacity and who owes it. Write the sheet in the shape `references/estimate-template.md`
fixes.

## Output

Written to `docs/records/planning/estimate-<sprint-or-date>-<ticket>.md` per `shared/artifact-paths.md`, in the
shape `references/estimate-template.md` fixes: front matter, then nine numbered sections in the same
order on every run, so two estimates for two tickets can be read side by side.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Estimates map to the tracker estimate field and the sprint field,
in the unit that field holds: points go to a points field such as Jira's Story Points, and hours to a
time estimate such as Jira's Original Estimate. A number in one unit is never written into a field
kept in the other.
Write back only after the team accepts the numbers.

## Definition of done

- [ ] Every estimate states its basis and confidence.
- [ ] No number rests on a formula, an uncalibrated rate, or an estimate carried over unchecked
      unless the basis column marks it so.
- [ ] No committed item is larger than 8 points, 3 person-days, or 24 hours without a split,
      measured on the sum of its lines before buffer.
- [ ] QA, review, bug-fix, and, where the team runs one, understanding effort appear as their own lines.
- [ ] The capacity calculation shows leave, holidays, and ceremonies as explicit subtractions.
- [ ] The overflow list exists, even when empty, so the cut is visible, or says the cut waits on
      capacity and names who owes it.
