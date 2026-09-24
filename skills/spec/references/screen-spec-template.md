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
design_source: <https://www.figma.com/design/<key>/<name>, the image directory, or retired (was <link>)>
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
| Membership | `docs/features/membership.md` |

## Components

| No | Node | itemName | nameJP | nameTrans | itemType | dataType | required | format | minLength | maxLength | defaultValue | validationNote | description | userAction | transitionNote | database | qa |
|----|------|----------|--------|-----------|----------|----------|----------|--------|-----------|-----------|--------------|----------------|-------------|------------|----------------|----------|----|
| 1 | `28256:70680` | Search area | 検索エリア | Search area | area | | | | | | | | | | | | |
| 1.1 | `I28090:91294;26137:51339` | Start date | 開始日 | Start date | input / date | date | yes | `YYYY/MM/DD` | | | | Proposed: not after today, as `docs/features/membership.md`, Start date | | Pick a date | | | |
| 1.2 | `28256:70702` | Search | 検索 | Search | button / primary | | | | | | | | | Click | Reloads the result list below | | Q1 |

## States

| screen_id | Node | Differs from the screen by |
|-----------|------|----------------------------|
| SA02_08_02 | `28256:70811` | A toast after a successful save |

## Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
| Q1 | What does the list show when the search finds nothing? | <BrSE name> | 1.2 | |
| Q2 | The design now labels 1.2 `Find`. Keep `Search`, or take `Find`? | <approver> | 1.2 | Keep the document, <approver>, YYYY-MM-DD |
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

A document whose `design_source` starts with `retired` follows the code instead, and nothing below applies
to it: see When the design is retired in `shared/spec-docs.md`.

A run against a document that exists reads the design from the document itself, never from the
link it was given: the file in `design_source` and exactly the nodes, or the images, in
`design_node`. A link given with `--design` is used only to add a frame the document does not yet
record, and one that names a different file is asked about before anything is written.

Rows are compared with the design by `Node`, never by `No`. From images the keys are not stable,
since one component added near the top shifts every `#n` after it, so rows read from images are
matched by visible name and position instead; so are the rows of a document whose keys changed
kind, written from images and read again through the connection or the other way round. Each
pairing is listed in the run summary, a matched row takes the new key and keeps its number, and a
row with no clear partner is asked about rather than struck and added again.

What the run may do next depends on whether the document has ever been `APPROVED`. Its git history
answers it: `git log --follow -S'status: APPROVED' -- <file>`, spelled the way the project's own
front matter spells that state. A document at `APPROVED` now has been. A shallow clone holds too
little history to answer, and is deepened, or the question asked, before any row is merged.

### What the approver has already answered

An open question about the design stays in the Open questions table once it is answered, with the
answer and who gave it, in two forms only: `Keep the document` or `Take the design`. A question
the sync raised because the code moved is answered `Keep the document` or `Take the code` instead,
per When the code moves on its own in `shared/spec-docs.md`, and is not one this section reads. A run reads
them before comparing anything:

- `Take the design` is applied by the run: the row is rewritten from the design, and the question
  is closed. The run does it because the approver said so.
- A row that carries a question about a design difference still open is left exactly as it is by
  every run, in either branch below, until the question is answered. Whoever last touched it, the
  row is waiting on a person, and nothing a later read finds may decide for them.
- `Keep the document` settles that difference for good: the same difference on a later run is not
  asked again and is not a change. A different difference on the same row is a new question.

A row the BrSE deleted by hand is not left absent, since an absent row is indistinguishable from a
node never read. The run puts it back struck through, with `Removed by hand on YYYY-MM-DD.` in
`description` and an open question asking whether the removal stands, so its number stays taken and
no later run adds it again. A row struck through because the design removed its component says
`Removed from the design` instead, and only that kind comes back when its node returns.

### Never approved: the rows are merged

Nobody has accepted the rows yet, so the run merges the design into them, except where the BrSE has
already worked on a row. A row is the BrSE's when it differs from what the previous read wrote for
it: a cell changed or filled by hand, a proposal with its `Proposed:` taken off. The previous read is
the document as the last commit that changed its `design_read` left it; a difference only in the
working tree counts as well. A row added by hand, with no `Node`, is always the BrSE's. A row nobody
can place either way is treated as the BrSE's, since an overwritten edit is lost and an extra
question only costs a question.

Only the cells the design itself answers are compared: `itemName`, `nameJP`, `itemType`, and what
the screen visibly shows. A cell the BrSE filled that the design never shows, a `maxLength` say, is
never a change.

1. A node that is new becomes a new row, numbered per the rule above. A node that matches a row
   struck through as removed from the design restores that row and its number instead.
2. A node that is gone strikes its row through as removed from the design, unless the row is the
   BrSE's; then the row is kept and an open question asks whether it goes, naming a new node of the
   same visible name and position as its likely successor where there is one, since a component a
   designer rebuilt comes back under a new node ID.
3. A node whose visible content changed has its row rewritten from the design, unless the row is
   the BrSE's; then the row is kept and an open question carries both versions.
4. A row whose node did not change is not touched, whatever the run would have written for it
   today. An update that rewrites unchanged rows is a diff nobody can review.

A row added or rewritten in steps 1 to 3 carries the not-implemented mark until its code agrees,
`Not implemented yet: <what the design changed>.` where code for it exists, unless the document is at
`implemented: no`.

### Approved at least once: nothing is merged

Every row has been accepted by the approver, so the run changes no row's design content on its own.
Each difference the design shows, a new node, a node gone, a node changed, a state added or gone,
becomes an open question carrying both versions, the row as approved and what the design now shows,
and naming the approver. The approver answers it in one of the two forms above, or by editing the
table, after which the row matches the design and nothing is asked. What the run still keeps true
on every row is what the code says: the not-implemented mark and the code citation follow
`implemented`, below, whatever the document's approval state.

### The States table

A state frame recorded in `States` is compared the same way as a row, under the same two branches.
In a document never approved, a state gone is struck through, a state whose layout now differs from
its screen is asked about, since it may have become a screen of its own, and a state frame the
design adds is recorded only when the link given with `--design` holds it. In an approved document
each of those is a question.

### Front matter

A question already open for the same row and the same difference is left as it is, and does not
count as a change: a run that re-asks it every time has made the document noisy and the status
meaningless.

When the run changed a row or added a question, `design_read` takes the new date, `design_node`
takes the frames and images of this read, and `status` goes back to `IN REVIEW`, since the document
now promises something new or has asked for a decision. `design_fingerprint` takes the new digest
once no question about a design difference, the kind that carries both versions, is left
unanswered: while one is, the old digest stays, so `--check` keeps reporting the screen. A question
about a cell the design never shows does not hold the digest. A difference answered `Keep the document` counts as answered.
And when every difference is already folded in or answered while the recorded digest differs from
the computed one, which is what the next run finds after the approver has answered the last
question, the run records the new digest and says so in the summary, so the screen stops being
reported.

`implemented` is set again from the comparison with the code in step 3 of the skill. When its value
changes, the mark and the code citation are set on every row that is not struck through, as
`--sync` does from `no`, which is the one exception to step 4 above: the field speaks for every row,
so every row has to agree with it. A row struck through as removed from the design whose component
the code still shows counts as not in code until the code drops it. At `implemented: no` no row
carries a mark. A run that found nothing to change touches no line of the file, front matter
included, and says so in the summary.
