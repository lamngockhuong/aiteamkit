# Test case template

Loaded by `atk:qa` in step 2 for the shape of the cases file, and again at the Output section for the
CSV export. One file per feature at `docs/qa/test-cases-<slug>.md`, per `shared/artifact-paths.md`.
How the negative and boundary rows are found is in `references/case-dimensions.md`; this file only
says what a row looks like and how the table leaves the repository.

The reader is a tester who was not in the conversation that produced the feature, executing the
cases one row at a time, and the BrSE/BA confirming that the rows match what the client asked for.
Both need a row they can act on without asking the author anything.

## The project's own template wins

Before writing a file from the shape below, look for the one the team already uses, in this order,
and stop at the first hit:

1. The `## Before` section of `.atk/overrides/qa.md` names a template or a column set, per
   `shared/project-overrides.md`.
2. An existing file under `docs/qa/` has a cases table whose columns differ from this template's and
   from the kit's earlier shape (ID, title, precondition, steps, test data, expected result, priority,
   criterion). Copy its columns and its ID scheme.

A file in that earlier kit shape is not the team's template: it is what an older version of this
skill wrote. It carries no `Section`, `Testcase type`, `Source`, or Sources table, and copying it would
carry those gaps forward. Offer to migrate it to the shape below, keeping every ID, and ask before
changing it.

When one is found, its columns and its vocabulary replace the defaults here, and every rule below
that does not depend on a column name still applies: traceability, the three sections, the ID that
is never reused, the export. A company form such as a numbered ISO test case document belongs to the
project, not to the kit, which is why the kit carries its column mapping below and never its header.

## Shape

````markdown
---
title: "Test cases: <feature>"
status: IN REVIEW
owner: <QA who wrote it>
approver: <QA lead, or TL where there is none>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <the ticket that last changed this, or none>
---

# Test cases: <feature>

## Sources

Last run: YYYY-MM-DD HH:MM:SS, atk:qa --cases

| Source | Read as |
|--------|---------|
| `docs/records/requirements/260918-user-list.md` | `sha256:3f9a0c1d2e4b5a67` |
| `docs/api/users.md` | `sha256:81c2d9e0f1a3b4c5` |
| `https://www.figma.com/design/<key>/<name>`, `[28256:70680]` | `design_fingerprint` `sha256:0d4e5f6a7b8c9d01` |

## Summary

| Section | Cases | High | Medium | Low |
|---------|-------|------|--------|-----|
| ACCESSING | 4 | 3 | 1 | 0 |
| GUI | 3 | 0 | 2 | 1 |
| FUNCTION | 21 | 9 | 10 | 2 |

## Coverage

| Criterion | Cases |
|-----------|-------|
| AC-1 | TC-SA0201-FUN-001, TC-SA0201-FUN-002, TC-SA0201-FUN-007 |
| AC-2 | TC-SA0201-ACC-001 |

## Skipped

| Criterion or component | Dimension or viewpoint | Why it gives no case |
|------------------------|------------------------|----------------------|
| AC-2 | 5, Timing | The record is only ever edited by its owner |
| Search box | `search-09` | One filter only, so there are no pairs |

## Cases

| ID | Page | Section | Category | Sub-category | Sub-sub category | Criterion | Pre-condition | Test data | Steps | Expected result | Priority | Testcase type | Source | Test result | Executed date | Tester | Environment | Note |
|----|------|---------|----------|--------------|------------------|-----------|---------------|-----------|-------|-----------------|----------|---------------|--------|-------------|---------------|--------|-------------|------|
| TC-SA0201-FUN-003 | User list | FUNCTION | Check data validation | Email | Max length | AC-1 | Signed in as Service Admin | Local part of 65 characters | 1. Open the user list<br>2. Click Add<br>3. Enter the test data in Email<br>4. Click Save | The message `E-VAL-012` appears under Email and nothing is saved | Medium | Abnormal_Others | `docs/api/users.md`, POST /users; dimension 2, BVA | | | | | |

## Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
````

## The columns

| Column | Required | Holds |
|--------|----------|-------|
| ID | Yes | See The ID below |
| Page | Yes | The screen, endpoint, or batch under test, named as the source names it |
| Section | Yes | `ACCESSING`, `GUI`, or `FUNCTION`, per The three sections |
| Category | Yes | The check, from the list for its section |
| Sub-category | Yes | The component, field, or flow the check is about |
| Sub-sub category | When it narrows | The rule or condition: `Required`, `Max length`, `Two filters combined` |
| Criterion | Yes | The acceptance criterion ID, or `exploratory` |
| Pre-condition | When needed | The state before step 1: who is signed in, what data exists |
| Test data | When needed | The exact values, never real personal data or a real credential |
| Steps | Yes | Numbered actions, one per line, separated by `<br>` |
| Expected result | Yes | What a tester can observe, per step 2 of `atk:qa` |
| Priority | Yes | `High`, `Medium`, or `Low`, from the table in `references/case-dimensions.md` |
| Testcase type | Yes | One value from Testcase types below |
| Source | Yes | Where the expected result comes from, per The Source column below |
| Test result | Left empty | Filled by the tester in the project's own tracking; see below |
| Executed date | Left empty | As above |
| Tester | Left empty | As above |
| Environment | Left empty | The browser, device, or build the case ran on |
| Note | Left empty | Evidence, defect ID, actual result |

The five execution columns stay empty in this file. It is a reference document, updated in place as
the feature changes, and a pass recorded in it would be true of one build and read as true of all of
them. They exist so the exported sheet has the columns a tester fills in, in the order the team's
spreadsheet expects.

## The three sections

| Section | Holds | Never holds |
|---------|-------|-------------|
| `ACCESSING` | Who can reach the page or call the endpoint, sign-in and session gates, direct URL access, the entry paths | Layout, validation, business outcomes |
| `GUI` | What the screen shows before anyone acts: labels, placeholders, default values, empty and data-present states, visibility and disabled rules, text of dialogs and buttons | Whether the business result is correct |
| `FUNCTION` | Validation, interactions, business rules, state transitions, list behaviour, effects on other screens, persisted data, error handling | Appearance |

Categories per section:

- `ACCESSING`: `Check access permission`, `Check authentication`, `Check session handling`,
  `Check navigation path`.
- `GUI`: `Check layout`, `Initialize`.
- `FUNCTION`: `Check data validation`, `Check component interaction`, `Check business logic`,
  `Check state transition`, `Check list behavior`, `Check cross-screen effect`,
  `Check data persistence`, `Check error handling`.

Two rules keep the `GUI` section from swallowing the file:

- One `Check layout` case per screen covers the overall structure. Do not write one case per element
  for its position.
- A repeated item, a card or a row, and a finite group of controls, a toolbar, have their parts
  asserted once, in the layout case or in one data-present case, not one case each.

Where a case could sit in two sections, sign-in, redirect and entry go to `ACCESSING`, what shows
before acting goes to `GUI`, and everything that runs a rule goes to `FUNCTION`.

## Testcase types

| Type | Use for |
|------|---------|
| `Normal_Login` | A happy path through sign-in, sign-out, or the session |
| `Normal_Billing` | A happy path through payment, billing, or invoicing |
| `Normal_Email` | A happy path that sends or shows a mail or a notification |
| `Normal_Others` | Every other happy path |
| `Abnormal_Login` | A negative case for sign-in, sign-out, or the session |
| `Abnormal_Billing` | A negative case for payment, billing, or invoicing |
| `Abnormal_Email` | A negative case for a mail or a notification |
| `Abnormal_Others` | Every other negative or boundary case |
| `Data and Database Integrity Testing` | The persisted state is the assertion |
| `User interface` | Every `GUI` case |
| `Access control and security` | Every `ACCESSING` case, and a `FUNCTION` case whose failure would be a security finding |
| `Load Testing` | Behaviour under the expected load the design states |
| `Stress Testing` | Behaviour beyond it |

Where two types fit, the first row that fits in this order wins, so two authors choose the same one:

1. `Access control and security`, for every `ACCESSING` case and for a case whose failure would be a
   security finding.
2. `User interface`, for every `GUI` case, a boundary on a visible state included.
3. `Data and Database Integrity Testing`, where the persisted state is the assertion.
4. `Load Testing` or `Stress Testing`, where the load is the condition.
5. A `_Login`, `_Billing`, or `_Email` type, where the case is about that domain.
6. `Normal_Others` or `Abnormal_Others`.

A team whose master list differs uses its own, per The project's own template wins.

## The ID

`TC-<SUBJECT>-<ACC|GUI|FUN>-<NNN>`, where `SUBJECT` is the screen ID when the source has one and the
feature slug in capitals otherwise, and `NNN` counts within its section.

An ID is never given to a second case. A new case takes the next number after the highest one ever
used in its section, including cases since removed, and a removed case keeps its row, struck
through, with `Removed YYYY-MM-DD: <reason>` at the start of its `Expected result`, so the execution
columns stay empty on that row too. A bug report, a run record, and a regression matrix all point at
these IDs, and an ID that comes back meaning something else sends each of them to the wrong case.

## The Sources table

Every source the cases were written from, one row each: a file by its path, and a design read
directly, for a screen with no screen spec, by its `design_source` and `design_node`. `Read as` holds
what the source was when this run read it: for a file, `sha256:` and the first 16 hex characters of
the SHA-256 of its content with every line ending turned into LF first, so the same file checked out
on Windows and on Linux hashes the same, computed the same way on every machine:
`python3 -c "import sys,hashlib;d=open(sys.argv[1],'rb').read().replace(b'\r\n',b'\n').replace(b'\r',b'\n');print('sha256:'+hashlib.sha256(d).hexdigest()[:16])" <path>`;
for a design, the `design_fingerprint` of that read, per
`shared/design-sources.md`. What each source was used for is in step 1 of `atk:qa`.

Only a run of `atk:qa` writes this table, and it rewrites it on every run that reads the sources. The
`Last run` line above it is rewritten on every run that writes this file, whether or not a source changed, so `--update` can
tell which rows the last run wrote. It
is what `--update` compares against to find what changed, which is why it records content rather than
a commit: it holds wherever the source lives, in this repository or another, and whatever was
committed in between.

## The Source column

Every expected result says where it came from, so a reviewer can check it against something other
than the author's word:

- A reference document: its path and the section, `docs/api/users.md`, POST /users.
- A screen spec: its path and the component number, `docs/screens/SA02_01.md`, 1.2.
- A design read directly: the `design_node` of the node, per `shared/design-sources.md`.
- A requirement: the criterion ID is already in `Criterion`; write `requirement`.
- A checklist viewpoint or a dimension: its ID or number, beside the source of the expected value.

A value with no source is written with `[ASSUMPTION]` in front of it, per
`references/case-dimensions.md`, and the same thing becomes an open question.

## Mapping to a spreadsheet form

A company test case sheet usually has no `Section` column: its own Category holds `Accessing`,
`GUI`, or `Function`, it has three category levels, and it has no column for the criterion or the
source. The mapping onto such a sheet is exact for every column it has and says where the rest go:

| This template | Sheet column |
|---------------|--------------|
| ID | ID, TC ID |
| Page | Page Name |
| Section | Category, as `Accessing`, `GUI`, or `Function` |
| Category and Sub-category | Sub-category, joined as `<Category>: <Sub-category>`, `Check data validation: Email` |
| Sub-sub category | Sub-sub category |
| Pre-condition, Test data, Steps, Expected result | The same names |
| Priority, Testcase type | The same names |
| Test result, Executed date, Tester, Environment | The same names |
| Criterion, Source | Note, as a prefix before anything the tester writes: `AC-1; docs/api/users.md, POST /users` |
| Note | Note, after that prefix |

The sheet gains no column: a form whose rules forbid extra columns, such as a test objective or a
specs column, keeps its header exactly. Where the sheet does have a column for the criterion or the
source, use it instead of the prefix. A team whose sheet differs from both layouts writes its own
mapping in the override, per The project's own template wins.

## Exporting to CSV

The Markdown file is the source. A CSV is written beside it, `docs/qa/test-cases-<slug>.csv`, when
the person running the skill asks for one, when `.atk/overrides/qa.md` asks for one, or when one
already exists there. It is committed with its source, and an existing CSV is regenerated in the same
run that changes the Markdown, so the two never disagree; nobody edits it by hand.

1. The header row once, in the layout of the sheet the CSV is pasted into. Two things settle that
   layout: the one `.atk/overrides/qa.md` names, then the header of the CSV already beside the
   Markdown. Where neither does, ask which sheet it goes into, offering this table's own columns and
   the company layout of Mapping to a spreadsheet form as the two usual answers, rather than choosing.
   A sheet in the company layout gets that layout, its columns only, with the joins and the `Note`
   prefix that section gives, so a paste lines up with the sheet column for column.
2. Rows sorted by Page, then Section in the order `ACCESSING`, `GUI`, `FUNCTION`, then Category,
   Sub-category, Sub-sub category, each of those in the order it first appears in the Markdown rather
   than alphabetically, so the sheet reads in the order the author wrote. The IDs do not change when
   the rows are sorted.
3. Markdown is taken out of a cell: backticks around a value go, an escaped `\|` becomes `|`, and a
   link becomes its text followed by its URL. The sheet shows the value, not its formatting.
4. `<br>` inside a cell becomes a real newline, so each step sits on its own line when the sheet is
   opened.
5. Every cell holding a newline, a comma, or a double quote is wrapped in double quotes, and a double
   quote inside it is written twice, `""`.
6. Grouping cells, Page and the three category levels, are left empty where they repeat the row
   above. When a higher level changes, every level below it is filled in again on that row, even if
   its value matches an earlier group.
7. An empty column stays an empty cell; nothing is written as `-` or `N/A`.
8. A cell a spreadsheet would run as a formula, one starting with `=`, `+`, `-`, `@`, a tab, or a
   carriage return, gets a leading `'`, and so does a value such as `0123` or `+84...` whose leading
   character a spreadsheet would drop. A cell starting with `=` otherwise runs as a formula in whoever
   opens the sheet, and boundary data is exactly the data a spreadsheet reformats. Some spreadsheets
   show the `'` when they open a CSV rather than hiding it, so the session says, whenever the export
   added one, that the `'` is not part of the data and the tester enters the value without it; the
   alternative the session offers is importing those columns as text.
9. The file is UTF-8 with a byte order mark, so a spreadsheet opens Japanese, Vietnamese, and
   full-width text as written rather than guessing another encoding.
10. The five execution columns are exported empty. A tester fills a copy, never this file.

A struck-through row is not exported. The Markdown keeps it for the ID; the sheet is for executing,
and a removed case in it gets executed.

## Values a later run matches on

Per rule 6 of `shared/team-roles.md`, these stay spelled exactly as here whatever language the rest of
the file is written in, because `--update`, `--review`, `--run`, `atk:release`, or `atk:help` finds
them by matching:

- the headings `Sources`, `Summary`, `Coverage`, `Skipped`, `Cases`, `Open questions`, and the
  `Last run:` line;
- the column names of the Sources table, `Source` and `Read as`, and of the cases table;
- the sections `ACCESSING`, `GUI`, `FUNCTION`, the categories, and the testcase types;
- the ID shape, the `Removed YYYY-MM-DD:` and `Removed by hand on YYYY-MM-DD.` marks, and
  `[ASSUMPTION]`;
- the answers `Keep the cases` and `Take the source`;
- the front matter keys and the statuses.

A team's own template, per The project's own template wins, names its own values of this kind.

## Updating

This is a reference document: it is updated in place when the feature changes, and `status` goes
back to `IN REVIEW` on any change to a row, because the approver accepted a different set of cases.
