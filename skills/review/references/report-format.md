# Review report format

Loaded by `atk:review` at step 6, when the ranked list becomes a file. It holds the **shape** of that
file. What has to be in it is settled elsewhere and not repeated here: step 6 of `SKILL.md` for what
a comment carries, `references/review-rounds.md` under *What the report adds* for the band, the
rounds and the `[k/N]` tags, and `shared/artifact-paths.md` for the path and the front matter block.

The shape is here because prose swallows structure. A report written free-hand reads well and cannot
be quoted from: nobody can name one finding out loud, nobody can check the round count against the
band, and the next reviewer re-derives what this one already verified.

## Finding identifiers

Every finding carries an ID: **`B`** for `BLOCKING`, **`S`** for `SHOULD FIX`, **`N`** for `NIT`,
numbered from 1 **within its own severity**. `B1`, `B2`, `S1`, `N1`. Never one sequence running
across the three, which would make `5` mean nothing until the reader has found it.

The ID is the only part of a review that survives being spoken. "Please fix `B1` and `S2`" works in a
stand-up, in a chat thread and in a pull request comment; "the fifth one" needs the file open.

**An ID carries across runs on the same target.** Before writing, read the report already at the
path, per `## Output` of `SKILL.md`: a second review of the same pull request is what the identifier
was built for, and an author who was asked to fix `B1` has to find `B1` in the new report too. A
finding still present keeps its number. A new one takes the next number above the highest that
report used, never one left free by a finding since fixed. Where there is no earlier report, because
none was written or the project does not keep `docs/derived/`, numbering starts at 1 and
`## What this was reviewed against` says so, so nobody reads a fresh `B1` as the old one.

**Severity wins over continuity when the two collide.** A finding that was `S3` and comes back
`BLOCKING` takes a `B` number and names the old one in its title: `### B2. ... (was S3)`. The
prefix has to match the section the finding sits in, and the old number is retired rather than
reissued. Decide the severity, then number.

## A finding

```markdown
### B1. Short title naming the problem, not the file

- **File:** `path/to/file.ts:32-40`, `path/to/other.ts:118`
- **Rule:** `CONV-004` - "the rule, quoted exactly as the project wrote it"
- **Issue:** What goes wrong, and the input or state that triggers it.
- **Fix:** The concrete change, naming the function, file or pattern to use.
- **Raised by:** `[3/3 lines]` `[2/2 boundary]` `criteria`
```

Each label is a list item, and a label that runs onto a second line indents its continuation by two
spaces. Without the list, Markdown joins the five consecutive lines into one paragraph, and a reader
previewing the report gets a wall of bold labels run together, which is the one thing the structure
exists to prevent.

- **Title.** The problem, in a phrase. Not the path, which is on the next line.
- **File.** Every location the finding touches, on one line. A finding spanning four files is one
  finding with four locations, never four bullets or four findings.
- **Rule.** The convention rule's ID and its text quoted verbatim, so the author can dispute the
  rule rather than the reviewer, per `shared/review-checklist.md`. Required on every finding the
  `rules` round raised, and absent from every other finding. A baseline item carries the words
  `baseline item` in place of an ID, because the project never recorded one. Where the finding is
  raised above the severity recorded against its rule, this line says why.
- **Issue.** What breaks and why it matters. `BLOCKING` names a failing input or a broken contract,
  per the definition of done.
- **Fix.** What to do. A finding with no suggestion is a complaint.
- **Raised by.** The tags from `references/review-rounds.md`: `[k/N]` for a replicated round, the
  round name alone where it ran once, `sweep` for the closing pass. A `PLAUSIBLE` verdict is stated
  here with the one check that would settle it. `CONFIRMED` is the default and is not written out,
  because a word on every finding stops being read.

## The report

In this order. The order is fixed; the list is not closed. A run adds a section when it has
something to declare that none of these holds, and two cases recur: that the reviewer was also the
author, which `## Roles` of `SKILL.md` makes a thing to say out loud, and a section a project's
`.atk/overrides/review.md` asks for.

A section with nothing in it is dropped, except `## Cap` and the three severity sections, which are
written with `None.` instead. A review that found nothing blocking and a review that lost its
blocking section look identical otherwise, and the reader who most needs to tell them apart is the
approver.

**Language.** The headings and the labels are written in the team's working language, per rule 6 of
`shared/team-roles.md`. Three things stay in English whatever that language is, because something
else matches on them: the severity names `BLOCKING`, `SHOULD FIX` and `NIT`; the `B` / `S` / `N`
prefixes on the identifiers; and the order of the sections. A comment posted under `--comment` and a
later review of the same target both find a finding by its identifier, so the identifier cannot be
translated.

```markdown
---
title: <one line>
status: IN REVIEW
owner: <the reviewer>
approver: <person, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL>
---

# Review: <PR, branch, commit or paths>

<the change in one line> · base `<ref>` @ `<sha>` · head `<sha>` · author <handle>

| | |
|---|---|
| Counted | 43 files, 1,349 lines |
| Changed | 45 files, 1,864 lines |
| Not counted | `apps/api/openapi.yaml`, `.../api-types.generated.ts`: generated, 515 lines, opened by `contract`, `exposure` and `callers` |

## What this was reviewed against
## What the change does well
## BLOCKING
## SHOULD FIX
## NIT
## Cap
## Rounds
## Type check
## Verified and dropped
## Convention gaps
## Open questions
```

**The two counts.** Counted is changed minus what the repository regenerates. The same counted
numbers chose the band, so a reader comparing the header against the `## Rounds` section finds one
arithmetic rather than two. Where nothing was excluded, the `Not counted` row goes.

The row says `Not counted`, never `not read`: the exclusion takes a file out of two numbers and out
of nothing else, and `references/review-rounds.md` names the rounds that still open it. The cell
carries them, and the evidence that the file is generated, so a reader who disagrees with an
exclusion can see what it rested on instead of re-deriving it.

**What this was reviewed against.** The requirement and design from step 1, by identifier, or the
statement that neither exists and the review ran against the pull request description alone. The
conventions document resolved per `shared/review-checklist.md` belongs here too, by path.

**What the change does well.** One line at least. A review of only negatives teaches nothing about
what to repeat.

**Cap.** How many findings were cut and at what severity, and, where the cut group is worth a second
pass, what is in it. The author has to know whether the list is the whole of it.

**Rounds.** The band and the count that put the change in it, then one row per round:

```markdown
Band **2**, `--parallel 3`: 1,349 counted lines across 43 counted files. 16 round runs in 13
agents, plus the sweep: 14, which is what the flag asks for.

| Round | Copies | Findings | Note |
|---|---|---|---|
| `lines` | 3 of 3 | 6 | |
| `boundary` | 2 of 3 | 4 | one copy held down by the memory cap |
| `removed` | 2 of 2 | 0 | empty |
| `contract` | 1 of 1 | 2 | shares an agent with `rules` and `tests` |
| `tests` | - | - | skipped: the diff changes no behaviour |
| `callers` | 0 of 2 | - | dead: dispatched twice, died twice; not run |
| sweep | - | 3 | not a round; first attempt died, re-run |
```

One row per round, and the three states of `references/review-rounds.md` are three different rows:
`skipped` names the condition that fired, `empty` means it ran and reported nothing, `dead` says so
and whether the re-run landed. The sweep is not a round and takes no copy count, because a `1` there
would read as the `[1/1]` that both files ban. `Findings` counts what that round contributed to the
merged list after deduplication and before the cap, so the column will not add up to the number of
findings in the report, and is not meant to.

The line above the table carries the agent count as well as the band, because the numbers
`references/review-rounds.md` offers to be checked against are agents rather than round runs, and a
`Copies` column alone cannot produce them: a band-1 run is 9 round runs and the sweep in 1 agent, a
default run above the band is 9 round runs in 6 agents plus the sweep, 7 in total, `--parallel 2`
is 11 in 8 plus the sweep, 9, and `--parallel 3` is 16 in 13 plus the sweep, 14. Combined comparing
rounds are invisible in the per-round rows, so the count is stated rather than left to be added up,
and any deviation from it, a round re-run, a copy the machine held down, is named in the `Note`
column that caused it.

The same line carries what the run was told it would cost before it spawned anything, or that it
spawned nothing at all, and any deviation the machine forced: a cap that held the copies down, and a cap that held the run to one
round at a time instead of one round ahead, per `references/review-rounds.md`. A review that took
twice the wall clock for that reason is not a slow review, it is a review on a small machine, and
the two read identically without the line.

A table because those numbers exist to be checked against, and prose cannot be checked against
anything. A round that did not run, one that ran and returned
nothing, and one that died are three different rows and are never collapsed. Close the section with
the line that `[k/N]` counts copies of one model's work and is not agreement between people.

**Type check.** Its own section, not a line inside the preparation the agents shared. A reader
asking "does this compile" should not have to find out how the review was organised. The verdict, the
command or CI job that produced it, and pre-existing failures separated from introduced ones by
count and location.

**Verified and dropped.** What was refuted and on what line, type, guard or absent effect, so the
next reviewer does not pay for it twice.

**Convention gaps.** Rules the review wanted and the project has not recorded, reported for
`atk:convention` and not applied as if agreed.

**Open questions.** Each one carrying the name of the person who can answer it, per rule 1 of
`shared/team-roles.md`, and the findings it bears on. "The team" is nobody.

## No score

The report carries no number out of ten, and no grade of any kind.
`skills/tailor/references/feedback.md` bans one in a feedback record because a score is the author
marking their own work, and the same holds here with one more reason: the reviewer is not the
approver. A score invites the approver to read the number instead of the findings, which moves a
decision they own into a line the reviewer wrote. Severity already carries everything a score would:
a `BLOCKING` finding blocks whatever the rest of the list says.

## Under `--comment`

The inline comment on a line opens with the finding's ID, so the thread on GitHub and the report say
the same name for the same thing. The summary comment carries the counts per severity and the
blocking titles with their IDs, and points at the report for the argument.
