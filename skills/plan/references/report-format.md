# Plan review report format

Loaded by `atk:plan` under `--review`, when the results become a file. It holds the **shape** of that
file. What goes into it is settled elsewhere and not repeated here: `references/plan-review-mode.md`
for what may be reviewed, which results exist and what severity each one takes;
`references/plan-self-review.md` for the six claims the pass reopens; and `shared/artifact-paths.md`
for the path and the front matter block.

The shape is here for the reason `atk:review` keeps its own in a file: prose swallows structure. A
report written free-hand reads well and cannot be quoted from. Nobody can name one result out loud,
the approver cannot tell which phase is the expensive one without reading all of it, and the next
review re-derives what this one already settled.

## Result identifiers

Every result carries an ID: **`B`** for `BLOCKING`, **`S`** for `SHOULD FIX`, **`N`** for `NIT`,
numbered from 1 **within its own severity**. `B1`, `B2`, `S1`, `N1`. Never one sequence running
across the three, which makes `5` mean nothing until the reader has found it.

The ID is the part of a review that survives being spoken. "B2 and S1 before you start phase 2"
works in a stand-up and in a pull request comment; "the fourth one" needs the file open.

**An ID carries across runs on the same plan**, per the next section. A result still present keeps
its number. A new one takes the next number above the highest that report used, never one left free
by a result the author has since fixed.

**Severity wins over continuity when the two collide.** A result that was `S2` and comes back
`BLOCKING`, because the plan moved and made it worse, takes a `B` number and names the old one in
its title: `### B3. ... (was S2)`. The prefix has to match the section the result sits in.

## Reading the review already there

Before writing, open the report already in `docs/derived/reviews/` for this plan. Look it up by
`<slug>`, not by the whole file name: a review from two days ago carries a different date and is
still about the same plan.

It is what the identifiers above carry across, and it separates two things a single report cannot
tell apart: a citation that has just decayed, and one reported days ago and left alone. The first is
a plan aging. The second is a plan nobody is maintaining, and those are different decisions for the
approver.

What comes of it:

- A result in both reports keeps its identifier and says in its title that it is a repeat, with the
  date of the earlier report: `### N1. ... (also 260921)`.
- A result in the earlier report and not in this one goes in `## Closed since the last review`, one
  line each, saying whether the plan was fixed or the repository moved under it. It is the only
  section that reports something the plan got right.
- Where no earlier report exists, numbering starts at 1 and the header table says so, so nobody
  reads a fresh `B1` as one they were already asked about.

This licenses nothing else. The earlier report is read, never rewritten, and a result it raised that
the author chose not to act on is still a result here rather than an argument.

## A result

```markdown
### B1. Short title naming what breaks, not the file

- **Where:** `phase-01-<slug>.md`, step 2, the `Files` cell
- **What the plan says:** quoted, short
- **What the repository says:** the evidence, as `path:line`
- **Following the plan:** what it produces, or where it stops
- **Found by:** which of the six claims, or the backward test on the `Check` column
```

**There is no `Fix` label, and the absence is the rule rather than an omission.** `atk:review`
requires one on every finding, because a diff is a change and a reviewer of a change may say what
the change should have been. This mode fixes nothing: `references/plan-review-mode.md` under The pass
turns every disposition that would edit a plan into a result instead, so a label naming the
correction would walk the report straight back across that line. State what goes wrong and stop.

**`Found by` earns its line** because the six claims do not cost the same to re-run. An author
looking at eight results wants to know which of them a fresh `--review` will raise again by itself,
and which came out of somebody reading.

## The report

In this order. The order is fixed; the list is not closed. A run adds a section when it has something
to declare that none of these holds, and the recurring case is a plan this session wrote, which
`references/plan-review-mode.md` makes a thing to say out loud.

A section with nothing in it is dropped, except the three severity sections and
`## What could not be checked`, which are written with `None.` instead. A review that found nothing
blocking and a review whose blocking section fell out look identical otherwise, and the approver is
the reader who most needs to tell them apart.

```markdown
---
title: <one line>
status: DRAFT
owner: <the reviewer>
approver: <copied from the plan index, or "TBD (ask <person>)" where the index says that>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL, or none>
---

# Plan review: <plan directory, phase file, or pull request>

| | |
|---|---|
| Source | `plans/<YYMMDD-HHMM>-<slug>/`, read from the working tree |
| Files read | `plan.md` and 3 phase files |
| Index | `status: DRAFT`, owner <name>, approver <name> |
| Phases | 1 `pending`, 2 `pending`, 3 `pending` |
| Reviewed against | `main` at `<sha>`, <date> |
| Plan written against | `<sha>`, <date>, where the plan or its history says |
| Written by this session | no |
| Earlier review | `plan-<slug>-<date>.md`, or none, so numbering starts at 1 |

## Results by phase
## BLOCKING
## SHOULD FIX
## NIT
## Closed since the last review
## What could not be checked
## Checked and clean
```

**Two fields of that block need saying, because the obvious way to fill each one is wrong here.**

`status` stays `DRAFT` and never moves. The other three values in `shared/artifact-paths.md` describe
an artifact travelling towards somebody's acceptance, and this one never travels: it is derived, it
is rebuilt by running the review again, and it ends in no verdict for anyone to accept. A report at
`APPROVED` would be claiming the thing the last section of this file says the review must not claim.

`approver` is copied from the plan's own index, and is the one field the reviewer does not choose. It
says who owns the plan, not who owes an answer to this report: `references/plan-review-mode.md` under
The pass keeps a reviewer from assigning anybody, and a name picked here rather than copied is that
assignment wearing a front matter field. Where the index carries `TBD (ask <person>)`, carry that
across unchanged.

**`## Results by phase`** is one table and nothing else:

| File | `BLOCKING` | `SHOULD FIX` | `NIT` |
|------|------------|--------------|-------|
| `plan.md` | B2, B3 | S4, S5 | N2 |
| `phase-01-<slug>.md` | B1 | S1, S2 | N1, N3 |
| `phase-02-<slug>.md` | | S3 | N1 |

It is what grouping by severity costs, and it buys the cost back in three lines. A reader who came
to ask about one phase would otherwise read all three severity sections to find out.

Identifiers rather than counts. A count says how bad a phase is and then sends the reader looking for
which ones; an identifier is the answer. A result touching two files appears in both rows and is
written once.

**`## What could not be checked`** is the table in `references/plan-review-mode.md` under What cannot
be checked, and when: what was missing, and which claim therefore did not run. It is never dropped.
A claim that reads as satisfied while having had nothing to run against is the one way this pass
reports a clean result having checked nothing.

**`## Checked and clean`** is its counterpart, one line per claim. The `--audit` mode of
`atk:convention` carries the same rule for the same reason: "checked, no drift" has to read as
different from "not checked".

## Language

The headings and the labels are written in the team's working language, per rule 6 of
`shared/team-roles.md`. What something else matches on stays as spelled here whatever that language
is, per the same rule: the severity names `BLOCKING`, `SHOULD FIX` and `NIT`; the `B`, `S` and `N`
prefixes; and the order of the sections. A later review of the same plan finds a result by its
identifier, so the identifier cannot be translated.

## No verdict, and no score

Neither appears anywhere, per the end of `## The report` in `references/plan-review-mode.md`. The
header table counts files and phases, `## Results by phase` places the results, and there it stops.
Whether a plan with two blocking results is worth starting from is the approver's call under rule 3
of `shared/team-roles.md`, and a number at the top of the report would take that call while looking
like a summary.
