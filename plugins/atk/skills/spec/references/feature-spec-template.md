# Feature spec template

Loaded by `atk:spec` in step 2, and only when `docs/features/` holds nothing to copy the shape from.
One file per feature, named after the feature.

The reader is a QA engineer writing test cases, a BrSE answering a client, or a developer joining the
team. All three need the same thing: what the product does, stated so that a disagreement with the
code is visible.

## Shape

````markdown
---
title: "<Feature>"
status: IN REVIEW
owner: <person>
approver: <BrSE/BA>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <the ticket that last changed this, or none>
implemented: no | partial | yes   # only where the profile says Contract: first; delete otherwise
---

# <Feature>

One paragraph: what the feature does, for whom, and what it is for. No implementation.

## Where it is reached

| Entry point | Who | Note |
|-------------|-----|------|
| `/business-office/reports` | Business office user | Main screen, see `docs/screens/SA03_01.md` |
| `POST /reports` | Same, through the API | See `docs/api/report.md` |
| Nightly job | Nobody | Closes expired rows |

Jobs and scheduled work are entry points. A feature documented only through its screens hides half
of itself. A screen that has a `screen` document links to it here, and that document lists this
feature among the ones it serves.

## Behaviour

One subsection per rule the feature enforces, each stating the condition and the outcome. Write the
condition first: a reader scanning for their case reads the conditions, not the outcomes.

Cover the ordinary path, then what happens when it is refused, when it is empty, when it is already
done, and when two people do it at once. The last is the one teams leave out and QA finds.

## States

Where the feature has a state machine, the states and what moves between them, as a Mermaid state
diagram per `shared/diagram-conventions.md` when there are more than three transitions.

## Permissions

| Role | May | May not |
|------|-----|---------|

A role that cannot see the feature at all is still a row. Its absence reads as an oversight.

## Validation and messages

Each rule with the field it applies to and the message identifier shown. Reference the code the
project uses for the message; do not transcribe the text, which gets reworded and translated without
anyone thinking of it as a change.

## Data touched

Which tables are read and written, linked to `docs/database/`.

## Known limits

What the feature deliberately does not do, and who decided. This section is what stops the same
question being asked every quarter.

## Open questions

Each with the name of the person who must answer it.
````

## Rules

- The feature spec describes the product, so it is written in the language the team writes artifacts
  in, per the Team section of `.atk/profile.md`. The `api` and `db` kinds follow the same setting.
- No component names from the code, no route file paths, no class names, no internal constants. A
  feature spec that names the component rendering a table stops being true at the next refactor, and
  nothing will catch it. The name a user sees on the screen is a different thing and is allowed, but
  the screen's parts, one row per component, belong to its `screen` document rather than here.
- Whether a rule is stated here or in a `screen` document is decided by the split in The `screen`
  kind in `shared/spec-docs.md`. A rule stated here is pointed to from each screen that shows it.
- Behaviour that only one role sees is stated with the role, not written as though it were universal.
- Where a rule exists because a client asked for it, say so in one clause. That clause is what stops
  it being optimised away by someone who reads it as an accident.
- Under `Contract: first` the unit that carries the not-implemented mark is the behaviour rule, per
  `shared/spec-docs.md`, and only at `implemented: partial`. Its subsection under Behaviour opens with one line: `Not implemented yet.`,
  or `Not implemented yet: <what the contract changes>.` for a rule that exists and is changing.
  Until the mark comes off, the rule cites the design section it came from, or the author who
  proposed a detail the design left open, instead of the code.
