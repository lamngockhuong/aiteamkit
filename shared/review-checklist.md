# Review checklist

Shared contract between `atk:convention` (which writes the rules) and `atk:review` (which enforces
them), so a rule is written once and checked in the same words it was written. Referenced from
`skills/<name>/SKILL.md` as `shared/review-checklist.md`, which is
`../../shared/review-checklist.md` relative to a skill file.

The project's actual rules live in the target project, in the document that Where the rules live
resolves to below. This file defines that resolution, the record format both skills use, the rule
that a project which already writes conventions keeps its own shape, and the baseline items that
hold in any project.

## Where the rules live

`docs/conventions.md` is the default recorded in `shared/artifact-paths.md`, not an address.
Resolve the conventions document in this order and use the first that answers:

1. The Docs section of `.atk/profile.md`, which records where this project keeps its conventions.
2. The project's `CLAUDE.md` or `AGENTS.md`, where it names the location.
3. A convention document or standards directory already under the docs root, found by reading.
4. `docs/conventions.md`.

When every step comes up empty, the project has recorded no conventions and the skill says so. It
does not invent an address, and it does not treat the default as a document that exists.

A project whose conventions are a directory of many files, one per topic or per side of the stack,
keeps its rules in all of them and its checklist in exactly one. `atk:review` reads one review
checklist section, so the `CONV-NNN` rows go in the index document of that set, the one that already
links to the rest, and the individual documents stay the prose they are. Which document carries the
checklist belongs in the Docs section of the profile, so the next skill does not resolve it again by
guessing.

## The project's own shape wins

A project that already writes conventions writes them in its own shape: heading order, how rules are
grouped, one document or thirty, the language they are in. `atk:convention` adds to that shape
rather than converting it into the kit's. The rule and the reason are the ones `shared/spec-docs.md`
states for reference documents, and the conventions document is one of those.

The one thing the kit does ask for is the review checklist section, because `atk:review` cites rule
IDs out of it and a finding that cannot name its rule leaves the author arguing with the reviewer
instead of with the rule. Adding that section to a set of documents that has none is an addition to
the shape, not a rewrite of it.

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

**`atk:convention` produces.** It writes the rows into the review checklist section of the
conventions document. Only `REVIEWED` rules belong there: an `ENFORCED` rule is already checked by
a tool, and repeating it wastes a reviewer's attention. An `ASPIRATIONAL` rule is listed separately
and explicitly marked as not checked by anyone.

**`atk:review` consumes.** It reads that section and checks each `REVIEWED` rule against the diff.
A finding cites the rule ID and quotes the rule text verbatim, so the author can dispute the rule
rather than the reviewer. A violation takes the rule's `severity` unless the concrete failure is
worse than the rule anticipated, in which case the review says why it raised it.

Where the conventions document has no checklist section, or the resolution above found no document
at all, `atk:review` uses the baseline below and reports that the project has no recorded
conventions. It does not invent project-specific rules mid-review.

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

A rule the reviewer keeps repeating by hand belongs in the conventions document: `atk:review`
reports it as a convention gap rather than writing it there itself, because adding a team rule is
the Tech Lead's call. A rule in the checklist that no review has cited in a long time is a candidate for
retirement, which `atk:convention --audit` reports.
