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

PM owns capacity and the commitment. Tech Lead and Dev own the sizes. QA sizes its own test effort
as a separate line, never folded silently into a Dev number. See `shared/team-roles.md`.

## Invocation

```bash
/atk:estimate <backlog-path>            # Estimate every item in a requirement or breakdown doc
/atk:estimate <epic-or-ticket-ids>      # Pull items from the detected tracker
/atk:estimate --points                  # Fibonacci story points (default)
/atk:estimate --days                    # Person-days instead of points
/atk:estimate --sprint S12 --capacity 34  # Plan a named sprint against known net capacity
/atk:estimate --out <path>              # Override the default output path
```

## Workflow

```
[1. Load items] -> [2. Find comparables] -> [3. Size] -> [4. Capacity] -> [5. Commit sheet]
```

Before step 1, read `.atk/overrides/estimate.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Load items

Read each item and reject what cannot be estimated. An item with no acceptance criteria, or with an
open question that changes its size, is marked `NEEDS INTAKE` and excluded rather than guessed.

### 2. Find comparables

Search the repository, or every repository the work touches where the project has several, and the git history for similar past work: a similar endpoint, a similar
migration, a similar screen. A comparable with a real elapsed time beats an opinion. Cite it.

### 3. Size

Default scale is Fibonacci `1, 2, 3, 5, 8, 13`. Anything at `13` or above must be split before it is
committed. Each item records: size, basis, confidence (`HIGH`, `MEDIUM`, `LOW`), and the unknown
that would move it. Separate Dev, QA, and review effort into their own lines.

Apply the buffer explicitly as a visible line, not by inflating individual numbers. Default buffer
is 15 percent for `HIGH` confidence work and 30 percent when any `LOW` confidence item is in scope.

### 4. Capacity

Net capacity is headcount times sprint days, minus public holidays, leave, on-call, ceremonies, and
support duty. Ask for the leave plan if it is not in the repository. State the focus factor used and
why; do not hide it inside the arithmetic.

### 5. Commitment sheet

Fill the sprint up to net capacity, in priority order, and list what did not fit. The overflow list
is part of the output, not a leftover.

## Output

Written to `docs/records/planning/estimate-<sprint-or-date>.md` per `shared/artifact-paths.md`. Sections:
front matter, scale and buffer policy, per-item estimate table with basis and confidence, capacity
calculation showing every subtraction, sprint commitment, overflow, and estimation risks.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Estimates map to the tracker estimate field and the sprint field.
Write back only after the team accepts the numbers.

## Definition of done

- [ ] Every estimate states its basis and confidence.
- [ ] No committed item is larger than 8 points or 3 person-days without a split.
- [ ] QA and review effort appear as their own lines.
- [ ] The capacity calculation shows leave, holidays, and ceremonies as explicit subtractions.
- [ ] The overflow list exists, even when empty, so the cut is visible.
