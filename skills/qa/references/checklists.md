# Component checklists

Loaded by `atk:qa` in step 3, after each criterion has been walked through the ten dimensions of
`references/case-dimensions.md`. The viewpoints are listed in `references/checklists.tsv`; this file
holds what each field means and what a run may do with a line.

A dimension asks where a criterion could break. A checklist asks the same question of a component:
the things an input box, a date picker, or a paginated list tends to get wrong regardless of the
feature it sits in. The dimensions come from the requirement and the checklist from the screen, and
a case the author would only have thought of on a good day comes from the second.

The kit wrote these viewpoints itself. A company that keeps its own checklist, a common QA checklist
of several thousand viewpoints for instance, keeps using it: see The project's own checklist wins.

## The list

`references/checklists.tsv`: a header line, then one viewpoint per line, seven fields separated by a
tab, in this order:

```
id  component  target  viewpoint  expected  dimension  technique
```

- `id` is `<component>-NN`, `input-03`. It is what a case cites in its `Source` column, per
  `references/test-case-template.md`, and like a case ID it is never given to a second viewpoint: a
  viewpoint that stops applying is removed, and its number is not reused.
- `component` is one of the keys in Components below.
- `target` narrows the component when the viewpoint only holds for one kind of it: `email`,
  `password`, `required field`. Empty when it holds for every one.
- `viewpoint` is the question, phrased as the check a tester makes.
- `expected` is what a correct screen does, where that does not depend on the project's own rules.
  Where it does, the field says so, `per spec`, and the expected result of the case comes from the
  spec, never from this file.
- `dimension` is the number of the dimension in `references/case-dimensions.md` the viewpoint belongs
  to, so a case found here and a case found by walking the dimensions are recognisably the same case.
- `technique` is the technique from the same file that decides how many cases the viewpoint gives:
  `EP` equivalence partitioning, `BVA` boundary value analysis, `DT` decision table, `ST` state
  transition, `PW` pairwise, `EG` error guessing. Empty when the viewpoint gives one case.

Tabs rather than commas, for the reason `skills/convention/references/standard-sources.md` gives: a
viewpoint routinely holds a comma. No field holds a tab. `CLAUDE.md`, under "Common verification
commands", checks the field count of every line, that every `id` is unique and matches its
`component`, that `dimension` is 1 to 10, and that `technique` is one of the six codes or empty.

## Components

| Key | Component |
|-----|-----------|
| `input` | Single-line text input |
| `textarea` | Multi-line text input |
| `select` | Select box and combo box |
| `choice` | Checkbox and radio button |
| `date` | Date picker and date range |
| `table` | List and table display |
| `sort` | Sorting a list |
| `paging` | Pagination |
| `search` | Search and filter |
| `dialog` | Dialog, modal, and popup |
| `file` | Upload and download |
| `import` | Import and export of CSV or spreadsheet files |
| `login` | Sign-in and session |
| `password` | Password change, reset, and forgot flows |
| `crud` | Create, edit, and delete a record |
| `permission` | Access by role |
| `notify` | Notification and email |
| `nav` | Navigation, breadcrumb, and links |

## What a run may do with a line

- Open only the lines whose component appears on the screen or in the flow under test. A typical
  screen has three to six components; reading every line is the cost this file is split to avoid.
- A viewpoint is a question, not a quota. Where it applies, it gives the cases its `technique` says,
  written as ordinary rows with the viewpoint `id` in `Source`. Where it does not apply, it is skipped
  with the reason, the same way a dimension is.
- Where a case from the dimension walk already covers the viewpoint, add the viewpoint `id` to that
  case's `Source` rather than writing a second row. That counts as the viewpoint giving its case.
- A viewpoint never adds behaviour the sources do not state. `Search is case insensitive` is a
  question to ask the spec, not an expected result: where the spec is silent, the case carries
  `[ASSUMPTION]` and the question goes to the BrSE/BA, per `references/case-dimensions.md`.
- A component on the screen that has no line here is covered from the spec alone, and the cases file
  says so, rather than borrowing viewpoints from a component that only looks similar.

## The project's own checklist wins

Where the `## Before` section of `.atk/overrides/qa.md` names a checklist the team already keeps, a
company checklist or the project's own, that checklist replaces this list for the components it
covers, and this list still covers the ones it does not. Its viewpoints are cited in `Source` by
whatever identifier it uses. The kit does not carry a company's checklist, for the same reason it
does not carry a company's test case form: it belongs to the company.

## Adding a viewpoint

One more line, with the next number for its component. A viewpoint earns its line when it names a
defect that recurs across features, not one that happened once on one screen: the second belongs in
that feature's cases, and a checklist padded with them stops being read.
