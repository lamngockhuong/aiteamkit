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
argument-hint: "[pr-number|branch|commit|paths] [--against <design-path>] [--comment] [--strict] [--out <path>]"
---

# Team Code Review (`atk:review`)

Reviews a change the way a responsible colleague does: it starts from what the change was supposed
to do, not from the diff. Findings that block a merge are separated from findings that are taste,
because mixing them is what makes reviews feel arbitrary.

## Scope

Handles: reading the diff in the context of the requirement, design, and conventions, finding
correctness and regression risks, checking test coverage of the changed behavior, and writing
review comments that a person can act on.

Does NOT handle: approving or merging, which is a human act; rewriting the code (`ak:cook` or the
author does that); or deciding whether the requirement itself is right (`atk:intake`).

## Roles

The reviewer is never the author. Tech Lead holds the final call on a disputed blocking finding. QA
reviews test adequacy. See `shared/team-roles.md`.

## Invocation

```bash
/atk:review <pr-number>                   # Review a pull request from the detected tracker
/atk:review <branch|commit>               # Review a branch diff or a single commit
/atk:review <paths>                       # Review given paths in the working tree
/atk:review --against docs/design/x.md    # Review against a specific design document
/atk:review --comment                     # Post findings as inline PR comments
/atk:review --strict                      # Include low-severity and stylistic findings
/atk:review --out <path>                  # Write a review report as well
```

## Workflow

```
[1. Establish intent] -> [2. Read diff in context] -> [3. Find] -> [4. Verify] -> [5. Rank and write]
```

### 1. Establish intent

Find the requirement and design behind the change. Without them, say so in the review and review
against the PR description alone; a review with no stated intent is a style check.

### 2. Read the diff in context

Open the surrounding files, not only the changed lines. Most real defects live in what the change
implies elsewhere: a caller not updated, an enum case not handled, a migration without a backfill,
a cache not invalidated.

### 3. Find

Look for, in this order: behavior that contradicts an acceptance criterion, correctness bugs and
regressions, missing error and edge-case handling, security and data exposure, untested new
behavior, convention violations, then readability.

Convention checking runs off `shared/review-checklist.md`: read the review checklist section of the
project's `docs/conventions.md`, check each `REVIEWED` rule, and cite the rule ID with its text
quoted verbatim so the author can dispute the rule rather than the reviewer. When the project has no
recorded conventions, use the baseline items in that file and say so in the review. Do not invent
project-specific rules mid-review; report the gap so `atk:convention` can record it.

### 4. Verify before reporting

Every finding must survive a check: trace the code path, or state the concrete input that produces
the wrong output. A finding you cannot make concrete is dropped, not softened into a question.

### 5. Rank and write

| Severity | Meaning |
|----------|---------|
| `BLOCKING` | Wrong behavior, data risk, security risk, or a broken contract |
| `SHOULD FIX` | Real problem, safe to fix in a follow-up if the author agrees |
| `NIT` | Preference. Never blocks. Say so in the comment |

A convention violation takes the severity recorded against its rule. Raise it only when the concrete
failure is worse than the rule anticipated, and say why.

Each comment: the file and line, what goes wrong, and a concrete suggestion. Address the code, never
the author. State what the change does well in one line; a review with only negatives teaches
nothing about what to repeat.

## Output

By default the findings are reported in the session, grouped by severity. Under `--out`, a report is
written to `docs/reviews/<pr>-<date>.md` per `shared/artifact-paths.md`.

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
- [ ] No comment addresses the author rather than the code.
