---
name: review
description: >
  Review a teammate's pull request the way a team reviewer should: against the requirement, the
  design, and the team conventions, with findings ranked by severity, each one citing a line and
  stating the failure it causes, and blocking issues separated from preferences.
  Use before approving a PR, when reviewing a colleague's branch, or when a review needs a second
  opinion.
  Triggers on: "review PR", "code review", "review this branch", "review giúp", "duyệt code",
  "check PR", "レビュー", "approve this", "is this ready to merge", "/atk:review".
argument-hint: "[pr-number|branch|commit|paths] [--against <design-path>] [--comment] [--strict] [--parallel <N>] [--out <path>]"
---

# Team Code Review (`atk:review`)

Reviews a change the way a responsible colleague does: it starts from what the change was supposed
to do, not from the diff. Findings that block a merge are separated from findings that are taste,
because mixing them is what makes reviews feel arbitrary.

## Scope

Handles: reading the diff in the context of the requirement, design, and conventions, deciding how
many independent passes the change is worth, finding correctness and regression risks, checking test
coverage of the changed behavior, and writing review comments that a person can act on.

Does NOT handle: approving or merging, which is a human act; rewriting the code, which the author
does with `atk:implement` or `atk:fix`; or deciding whether the requirement itself is right
(`atk:intake`).

## Roles

The reviewer is never the author. Tech Lead holds the final call on a disputed blocking finding. QA
reviews test adequacy. See `shared/team-roles.md`.

## Invocation

```bash
/atk:review <pr-number>                   # Review a pull request from the detected tracker
/atk:review <branch|commit>               # Review a branch diff or a single commit
/atk:review <paths>                       # Review given paths in the working tree
/atk:review --against <design-path>       # Review against a specific design document
/atk:review --comment                     # Post findings as inline PR comments
/atk:review --strict                      # Include low-severity and stylistic findings
/atk:review --parallel 5                  # Force the number of independent passes over the diff
/atk:review --out <path>                  # Write a review report as well
```

## Workflow

```
[1. Establish intent] -> [2. Read diff in context] -> [3. Choose the width] -> [4. Find]
  -> [5. Verify] -> [6. Rank and write]
```

### 1. Establish intent

Find the requirement and design behind the change. Without them, say so in the review and review
against the PR description alone; a review with no stated intent is a style check.

### 2. Read the diff in context

Open the surrounding files, not only the changed lines. Most real defects live in what the change
implies elsewhere: a caller not updated, an enum case not handled, a migration without a backfill,
a cache not invalidated.

### 3. Choose the width

A change large enough to be worth more than one pass gets more than one, using the host's ability to
run agents in parallel per `shared/host-capabilities.md`. `references/parallel-review.md` holds the
width table, the memory cap that bounds it, what every reviewer is given, and how the findings are
merged back into one list.

Five files or fewer stay in this agent, and `--parallel <N>` overrides the table but not the cap. The
reviewers all read the same diff: independence is the point, so splitting the files between them
would produce agreement that means nothing.

Steps 1, 5, and 6 are never delegated. Intent is what the passes are measured against, and ranking
one list out of several needs all of them in one context.

Where the harness cannot spawn agents, one pass runs and the report says so.

### 4. Find

Look for, in this order: behavior that contradicts an acceptance criterion, correctness bugs and
regressions, missing error and edge-case handling, security and data exposure, untested new
behavior, a public contract changed without its reference document, convention violations, then
readability.

Convention checking runs off `shared/review-checklist.md`: resolve the project's conventions
document per Where the rules live in that file, read its review checklist section, check each
`REVIEWED` rule, and cite the rule ID with its text quoted verbatim so the author can dispute the
rule rather than the reviewer. When the project has no recorded conventions, use the baseline items
in that file and say so in the review. Do not invent
project-specific rules mid-review; report the gap so `atk:convention` can record it.

The reference-document check is the sync obligation in `shared/spec-docs.md`, which lists the five
kinds of change that trigger it. Raise a `BLOCKING` finding when a contract moved and neither the
document nor a stated skip came with it. Where the pull request says what is stale and who will fix
it, the obligation was met and there is no finding.

Do not fix the document as the reviewer. That moves the work to the wrong person and teaches the next
author that the rule is optional. Something the document never settled is an open question, not
drift, per the same file.

### 5. Verify before reporting

Every finding must survive a check: trace the code path, or state the concrete input that produces
the wrong output. A finding you cannot make concrete is dropped, not softened into a question.

### 6. Rank and write

| Severity | Meaning |
|----------|---------|
| `BLOCKING` | Wrong behavior, data risk, security risk, or a broken contract |
| `SHOULD FIX` | Real problem, safe to fix in a follow-up if the author agrees |
| `NIT` | Preference. Never blocks. Say so in the comment |

Where several reviewers ran, each finding carries how many of them raised it, and a finding only one
reviewer raised was checked against the code before it reached this list. The report says which width
ran. It never presents a count of agreeing reviewers as agreement between people.

A convention violation takes the severity recorded against its rule. Raise it only when the concrete
failure is worse than the rule anticipated, and say why.

Each comment: the file and line, what goes wrong, and a concrete suggestion. Address the code, never
the author. State what the change does well in one line; a review with only negatives teaches
nothing about what to repeat.

## Output

By default the findings are reported in the session, grouped by severity. Under `--out`, a report is
written to `docs/derived/reviews/<pr>-<date>.md` per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Under `--comment`, post each finding as an inline comment on the
line it cites, and the summary as one review comment. Post nothing before showing the list. A
`BLOCKING` finding requests changes; `NIT` findings never do.

## Definition of done

- [ ] The requirement or design the change was reviewed against is named, or its absence is stated.
- [ ] Every `BLOCKING` finding names a concrete failing input or broken contract.
- [ ] Preferences are labelled `NIT` and do not block.
- [ ] New behavior without a test is reported as a finding.
- [ ] Every convention finding cites a rule ID and quotes the rule, or is marked as a baseline item.
- [ ] A rule the review wanted but the project has not recorded is reported as a convention gap, not applied as if agreed.
- [ ] The width that ran is stated, and a width the machine forced down says so.
- [ ] Every reviewer received the same scope, and a finding only one of them raised was checked
      against the code before it was reported.
- [ ] A change touching a public contract either carried its reference document or stated the skip,
      and neither was silently fixed by the reviewer.
- [ ] No comment addresses the author rather than the code.
