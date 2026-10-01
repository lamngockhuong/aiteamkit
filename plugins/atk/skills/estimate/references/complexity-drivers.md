# Complexity drivers

Loaded by `atk:estimate` in step 3. It answers what a size is judged from, so that two people sizing
the same item count the same things, and a reader can see which count moved it.

## Count, do not feel

A size rests on facts a second person can count again: how many tables a change writes, how many
external systems it calls, how many screens share its state. "It feels like a 5" cannot be argued
with, and a count can. The counts that decided a size go into its basis, in a few words.

Drivers decide the points and the confidence. They never convert to hours: the hours come from a
comparable of similar complexity, or from a decomposition, per step 2 and step 3 of `SKILL.md`.
This file therefore carries no coefficient, and a project that wants one calibrates it from its own
actual times.

## Generic drivers

What holds in most stacks. Each one moves an item up when the count grows.

| Layer | Drivers |
|-------|---------|
| Data | Tables written; existing data migrated; a table another process also writes, such as a batch job, a worker, or a second service |
| Logic and API | Branches and business rules; a transaction or a compensating action on failure; calls to an external system; permission rules added or changed |
| Screen | Components; state shared across them; forms and their validation; API calls; states and breakpoints to render |
| Across layers | Repositories and layers touched; callers of the code that changes; how much of the area has tests, since verification is paid by a person |

Two drivers matter more now that code is mostly generated:

- **Technology.** A mainstream stack is where generated code is usually right the first time, and the
  cost moves to review. A niche framework, an internal one, or legacy code with no tests is where it
  goes wrong, and each correction is a person's time. Record which kind the item is.
- **Verification cost.** A change that can only be checked against a real environment, such as
  infrastructure, a migration, or an external integration, gets little shorter from generation.

## QA risk by feature type

QA effort depends on what the feature does, not on its size alone. Classify the item against the
table in `shared/feature-types.md`, the same classification `atk:catchup` asks its questions from,
and read its `QA risk` column. `High` caps the confidence of the QA line at `MEDIUM`; `Medium` and
`Low` leave it to the comparables. The hours still come from a comparable of similar complexity, or
from a decomposition.

## Understanding drivers

Where the team has a person understand the spec before coding, that cost follows the spec, not the
code:

- **Spec size**: screens, tables, and derived values the reader has to hold at once.
- **New domain**: a business area the team has not worked in before.
- **Spec language**: a spec that exists only in a language the team does not work in.
- **Spec gap**: a rule the work depends on that exists only in a diagram, or no API spec at all. The
  structure can look small while the work cannot start until someone writes the rule down.
- **Sibling screens**: within one epic, the screen with the widest data surface pays in full, and
  the screens sharing its tables, statuses, and vocabulary pay less. A screen touching a different
  set of tables is not a sibling.

It is paid once per screen for each layer whose implementer has to understand it, and a second task
on the same screen and layer pays little, because the answers already exist.

## A project's own rubric

The drivers above are deliberately stack-neutral. A project with its own, such as the number of
row-level security policies changed or the queues a screen enqueues to, writes it in the `## Before`
section of `.atk/overrides/estimate.md`, saying whether it replaces this table or adds to it. The
sheet then names the rubric it used in section 2 of `references/estimate-template.md`.
