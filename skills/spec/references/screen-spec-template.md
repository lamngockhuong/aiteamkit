# Screen spec template

Loaded by `atk:spec` for the `screen` kind: in step 2 for the shape, only when `docs/screens/` holds
nothing to copy it from, and in step 4 for the section on updating, on every run against a document
that already exists. One file per screen. How the design is read, what the four `design_*` fields
hold, and what to do with a value the design does not show, is in `shared/design-sources.md`; what the kind is, and how it splits with `feature`,
is in `shared/spec-docs.md`.

The reader is a developer building the screen, a QA engineer writing cases for it, and the BrSE
answering the client about it. All three need to find one component fast and trust what its row says.

## Shape

````markdown
---
title: "<screen_id> <screen name as the design shows it>"
status: IN REVIEW
owner: <person>
approver: <BrSE/BA>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <the ticket that last changed this, or none>
implemented: no | partial | yes
design_source: <https://www.figma.com/design/<key>/<name>, or the image directory>
design_node: [<screen frame node ID>, <each state frame node ID>]   # or the image file names
design_read: YYYY-MM-DD
design_fingerprint: sha256:<16 hex characters>
---

# <screen_id> <screen name>

> Ready for dev status could not be checked through the Figma connection. Confirm it with the
> designer.

One paragraph: what the screen is for, who reaches it, and from where. No implementation.

## Features served

| Feature | Document |
|---------|----------|
| Account lock | `docs/features/account-lock.md` |

## Components

| No | Node | itemName | nameJP | nameTrans | itemType | dataType | required | format | minLength | maxLength | defaultValue | validationNote | description | userAction | transitionNote | database | qa |
|----|------|----------|--------|-----------|----------|----------|----------|--------|-----------|-----------|--------------|----------------|-------------|------------|----------------|----------|----|
| 1 | `28256:70680` | Search area | 検索エリア | Search area | area | | | | | | | | | | | | |
| 1.1 | `I28090:91294;26137:51339` | Start date | 開始日 | Start date | input / date | date | yes | `YYYY/MM/DD` | | | | Proposed: not after today, as `docs/features/membership.md`, Start date | | Pick a date | | | Q1 |
| 1.2 | `28256:70702` | Search | 検索 | Search | button / primary | | | | | | | | | Click | Reloads the result list below | | |

## States

| screen_id | Node | Differs from the screen by |
|-----------|------|----------------------------|
| SA02_08_02 | `28256:70811` | A toast after a successful save |

## Open questions

| # | Question | Who answers | Blocks |
|---|----------|-------------|--------|
| Q1 | Is a future date allowed in Start date? | <BrSE name> | 1.1 |
````

The `States` section is left out when the design has no frame that differs only by a toast, a
dialog, or the state of a control, per One link, several screens in `shared/design-sources.md`.

## The columns

The component table takes its columns from a spreadsheet shape that Japanese projects already hand
to clients, so a team that used one recognises the other. One of that shape's columns is renamed and
five are folded into others, and each has its reason:

| Column | Holds | Folded in from |
|--------|-------|----------------|
| `No` | The component's number, hierarchical to at most three levels: `1`, `1.1`, `1.1.1` | |
| `Node` | The node ID, the stable key of the row; `<image file>#<n>` when the design was read from images | `itemId` |
| `itemName` | The name the user sees on the design, in the document's language | |
| `nameJP`, `nameTrans` | The same name in Japanese, and in English | |
| `itemType` | What the component is, qualified after a slash: `button / primary`, `input / date` | `itemSubtype`, `buttonType`, because both only qualify the type and are empty on most rows |
| `dataType`, `required`, `format`, `minLength`, `maxLength`, `defaultValue` | What the component accepts | |
| `validationNote` | The rule it enforces, or a pointer to the `feature` document that owns the rule | |
| `description` | Anything the row needs that no other column holds, and the not-implemented mark | |
| `userAction`, `transitionNote` | What the user does to it, and where that leads | |
| `database` | The table and column, linked to `docs/database/`, only where the source names them | `databaseTable`, `databaseColumn`, `databaseNote`, because all three stay blank unless the source is explicit, which it almost never is |
| `qa` | The number of the open question about this row | |

## Rules

- **Nothing invented.** A cell the design does not answer is proposed or asked, per What the design
  does not show in `shared/design-sources.md`. An asked cell stays empty and the row's `qa` cell
  holds the number of its open question. A placeholder goes into `description`, never into
  `defaultValue`.
- **Visible names, never code names.** `itemName` is the label the user reads, or, for a control
  with no label, what it plainly is. The component name in the code, and the layer name in Figma
  where it differs from the label, are neither: both change without the screen changing.
- **No questions about colours, spacing, or fonts.** They are the design's business, and the
  fingerprint ignores them for the same reason.
- **Numbers are never renumbered or reissued.** A component added later takes one past the highest
  number at its level, removed rows counted, even when that leaves the visual order out of step
  with the numbers. A component the design removed keeps its row, struck through, with
  `Removed from the design on YYYY-MM-DD.` in `description`, so its number stays taken. Test cases
  and tickets cite `1.2`; a number that moves, or comes back meaning something else, breaks every
  one of them silently.
- **A rule that holds beyond this screen points, it does not restate.** Its `validationNote` cell
  links to the `feature` document that owns it, per the split in `shared/spec-docs.md`.
- **The not-implemented mark**, at `implemented: partial` only, opens the row's `description` cell:
  `Not implemented yet.`, or `Not implemented yet: <what the design changed>.` for a component that
  exists in code and is changing. A row without the mark cites the code that renders it, as
  `path:line` at the end of `description`, beside its node ID and never in its place: the node ID is
  the key every later run matches on.
- Written in the language the team writes artifacts in, per the Team section of `.atk/profile.md`.
  The column headers stay as they are in every language, so a table can be read across projects.

## Updating from a changed design

A run against a document that exists reads the design again and compares it with the document row
by row, keyed by `Node`, never by `No`.

First, which rows the BrSE has settled. A row is settled when the document has been `APPROVED`
since the row was last written, or when the row differs from what the previous read would have
written for it: a cell changed or filled by hand, a proposal with its `Proposed:` taken off. The
previous read is the document as the last commit that changed its `design_read` left it, and a
difference in the working tree counts as well as one in history. A row nobody can place either way
counts as settled, since a settled row wrongly treated as open is overwritten, and an open row
wrongly treated as settled only costs a question. A row with no `Node`, added by hand, is always
settled.

Then, row by row:

1. A node that is new becomes a new row, numbered per the rule above.
2. A node that is gone: an open row is struck through as removed; a settled row is kept as it is,
   and an open question asks the approver whether it goes.
3. A node whose visible content changed: an open row is rewritten from the design; a settled row is
   kept as it is, and an open question carries both versions, the settled one and what the design
   now shows.
4. A row whose node did not change is not touched, whatever the run would have written for it
   today. An update that rewrites unchanged rows is a diff nobody can review.

Where the keys changed kind, a document written from images read again through the connection or
the other way round, no key matches and steps 1 and 2 would replace every row. Match the rows
instead by visible name and position, list each pairing in the run summary, and ask about any row
that has no clear partner; a matched row takes the new key and keeps its number.

When anything changed, the front matter follows. `design_read` takes the new date. `design_fingerprint` takes the new digest
only when every change was folded in: while a settled row conflicts with the design, the old digest
stays, so `--check` keeps reporting the screen until the approver answers, and the summary says so.
`status` goes back to `IN REVIEW` when any row changed or any question was added, since the
document now promises something new or has asked for a decision. `implemented` is set again from
the comparison with the code in step 3 of the skill; a row the design added or changed carries the
mark until its code agrees, so at `yes` such a row turns the value to `partial`, while a removed row
changes nothing. At `implemented: no` no row carries a mark, because the field already says it of all
of them. A run that found nothing to change touches no line of the file, front matter included, and
says so in the summary.
