# Review checklist

Shared contract between `atk:convention` (which writes the rules) and `atk:review` (which enforces
them), so a rule is written once and checked in the same words it was written. Referenced from
`skills/<name>/SKILL.md` as `shared/review-checklist.md`, which is
`../../shared/review-checklist.md` relative to a skill file.

The project's actual rules live in the target project at `docs/conventions.md`. This file defines
the record format both skills use, and the baseline items that hold in any project.

## Rule record format

`atk:convention` writes each rule as one row, and `atk:review` cites the ID in its findings:

| Field | Values | Notes |
|-------|--------|-------|
| `id` | `CONV-NNN` | Sequential, never reused. A retired rule is struck through, not deleted, so old reviews stay readable |
| `rule` | One sentence, imperative | Checkable by someone who did not write it |
| `bucket` | `ENFORCED`, `REVIEWED`, `ASPIRATIONAL` | Defined in `atk:convention` step 3 |
| `tool` | Command or config path, or `none` | What fails the build for an `ENFORCED` rule |
| `severity` | `BLOCKING`, `SHOULD FIX`, `NIT` | The default severity `atk:review` gives a violation |
| `source` | `path:line` or `agreed <date>` | Where the rule came from |

## What each skill does with it

**`atk:convention` produces.** It writes the rows into the review checklist section of
`docs/conventions.md`. Only `REVIEWED` rules belong there: an `ENFORCED` rule is already checked by
a tool, and repeating it wastes a reviewer's attention. An `ASPIRATIONAL` rule is listed separately
and explicitly marked as not checked by anyone.

**`atk:review` consumes.** It reads that section and checks each `REVIEWED` rule against the diff.
A finding cites the rule ID and quotes the rule text verbatim, so the author can dispute the rule
rather than the reviewer. A violation takes the rule's `severity` unless the concrete failure is
worse than the rule anticipated, in which case the review says why it raised it.

If `docs/conventions.md` has no checklist section, `atk:review` uses the baseline below and reports
that the project has no recorded conventions. It does not invent project-specific rules mid-review.

## Baseline items

True in any project, so `atk:convention` seeds them and `atk:review` checks them even when the
project has recorded nothing. They carry no `CONV-` ID because they are not the team's rules.

| Item | Default severity |
|------|------------------|
| New or changed behavior has a test that fails without the change | `SHOULD FIX` |
| Error paths and edge cases are handled, not only the happy path | `BLOCKING` |
| No secret, token, key, or credential in the diff | `BLOCKING` |
| No debug statement, commented-out code, or stray `TODO` without a ticket | `NIT` |
| Every caller of a changed signature or contract is updated | `BLOCKING` |
| A schema migration is reversible, or its irreversibility is stated | `BLOCKING` |
| User input crossing a trust boundary is validated | `BLOCKING` |
| Public behavior change is reflected in the docs that describe it | `SHOULD FIX` |

## Keeping them in step

A rule the reviewer keeps repeating by hand belongs in `docs/conventions.md`: `atk:review` reports
it as a convention gap rather than writing it there itself, because adding a team rule is the Tech
Lead's call. A rule in the checklist that no review has cited in a long time is a candidate for
retirement, which `atk:convention --audit` reports.
