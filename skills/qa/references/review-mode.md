# Reviewing a cases file

Loaded by `atk:qa` under `--review <cases-path>`, in place of the five workflow steps. A second
person reads a cases file somebody else wrote and says what is wrong with it before it is approved:
the gate between author and approver that `shared/team-roles.md` asks for, applied to test cases.
`atk:review` is the same gate for a pull request; this one reads a cases file against its sources,
not a diff against its code.

It fixes nothing. The findings go to the author, who changes the file, and the approver decides
whether it is ready. A review that edited the cases would leave the author defending changes they did
not make, and the approver reading a file nobody wrote.

## Who runs it

The reviewer is never the cases file's `owner`: a run where the person asking is the owner says so at
the top of the report, since a self-review catches slips and no judgement errors. The usual reviewer
is the BrSE/BA, for whether the cases match what the client asked for, or the QA lead, for whether
they are executable and complete. The approver named in the front matter still approves.

## What it reads

The cases file; its test plan beside it, when there is one; and the sources its Sources table names,
opened, not remembered: the requirement, the reference documents, the screen spec, or the design,
per `shared/design-sources.md` for a design. It also reads `references/test-case-template.md`,
`references/case-dimensions.md`, and `references/checklists.md` with its list, since those are what
the cases were supposed to follow; where the override names the team's own template or checklist,
that one is what they were supposed to follow instead.

A source the reviewer cannot open is said at the top of the report, and every pass that needed it
says it did not run rather than coming back clean.

## The passes

Each pass asks one question of every row. A pass that finds nothing says so; a pass that could not run
says why.

| Pass | Asks | Typical finding |
|------|------|-----------------|
| Structure | Is every required column filled, is every ID unique and shaped as the template says, is no ID reused after a struck row, does every struck row carry its `Removed` note, are the execution columns empty, are there no two cases with the same steps and the same expected result, and are the steps numbered with one action each and a pre-condition given wherever a step needs one | A duplicate case, a missing `Section`, a `Passed` left in the cases file |
| Classification | Does the section, the category, and the testcase type match what the case actually checks, is each category spelled one way across the file, and is `Sub-sub category` filled wherever the case narrows to one rule | A layout check filed under `FUNCTION`, an access check typed `Normal_Others`, `Accessing` in one row and `Access` in the next |
| Traceability | Does every acceptance criterion reach a happy-path case and at least one negative case, or else show in the Dimensions pass that every dimension was skipped with its assumption, does every case reach a criterion or say `exploratory`, and do the Summary and Coverage tables match the rows | A criterion with only its happy path; a Coverage table counting struck rows |
| Dimensions | Was each criterion walked through the ten dimensions of `references/case-dimensions.md`, and does every dimension it skipped carry the assumption that made it irrelevant | A criterion on a shared record with no timing case and no note saying why |
| Sources | Does each expected result say what its `Source` says, and does that source still say it | An expected message that differs from the reference document |
| Technique | Does every field with a stated limit have its boundary cases, every rule with several conditions a decision table or pairwise set, every validation rule one accepted and one rejected or boundary case, and no two cases from one equivalence class | `maxLength` 50 with no case at 51 |
| Checklist | Does every viewpoint for a component the screen has give a case or a reason it was skipped, does every item the screen spec or design lists, each input, button, option list, and error, loading, or empty state, reach a case, and is a component with no checklist line said to be covered from the spec alone | A paginated list with no case past the last page; an empty state nobody tests |
| Clarity | Could a tester who never saw the feature run the steps, is each expected result something they can observe, does each negative case name the message or the behaviour, and do the steps agree with the pre-condition | "Works correctly"; a step that needs data the test data column does not give |
| Assumptions | Is every inferred value marked `[ASSUMPTION]` with an open question naming who answers, and is any marked value now settled by its source | An unmarked label taken from a `Proposed:` row of the screen spec |
| Priority | Does each priority follow the table in `references/case-dimensions.md`, from what breaks | A permission case at `Low` |
| Data | Does any test data hold a real credential, real personal data, or anything from production | A real email address in `Test data` |

Three things a reviewer elsewhere might produce are left out on purpose. A corrected copy of the
cases, because the review fixes nothing and the author makes the changes. A score, because a number
reads as a verdict and the approval is the approver's, the same reason `atk:review` gives none. And
tables of counts by category or type, because the cases file's own Summary already carries them and
the Structure pass checks it.

The last pass is never a matter of taste: a real credential or real personal data in a committed file
is reported at `BLOCKING` whatever else the case gets right, and its value is never copied into the
report.

## Severity and the finding

The scale is the one `atk:review` uses, so a team reads one scale across both:

| Severity | Means here |
|----------|------------|
| `BLOCKING` | A criterion with no case, a case asserting something its source contradicts, a case nobody can execute, a reused ID, or real data in the file |
| `SHOULD FIX` | A gap in boundary or technique coverage, a wrong classification, a vague expected result, an unmarked assumption, a priority that hides a risk |
| `NIT` | Wording, ordering, a category name a colleague would choose differently. Never blocks |

Each finding carries an identifier prefixed by its severity, `B1`, `S1`, `N1`, numbered within that
severity; the case ID or IDs it concerns; what goes wrong if the case stays as it is, in terms of what
a tester would do or miss; and a concrete suggestion, including a new case written as a row of the
template where the finding is a missing case. The finding addresses the case, never the author.

A second review of the same cases file reads the earlier report first: the newest
report named `qa-<slug>-` followed by exactly six digits and `.md`, whatever its date, so that the
report of another cases file whose slug merely starts the same way is never picked up, since a re-review usually comes on another
day after the author fixed something. It keeps that report's identifiers, so an author asked to fix
`B1` finds `B1` again, and follows `skills/review/references/report-format.md` for what happens when a
finding is fixed or changes severity, and for numbering from 1 when there is no earlier report.

## The report

Written to `docs/derived/reviews/qa-<slug>-<date>.md` per `shared/artifact-paths.md`, on every run.
It is derived: safe to delete, and rebuilt by running the review again. `--out` moves it.

It opens with the front matter block of `shared/artifact-paths.md`, the reviewer as `owner` and the
cases file's approver as `approver`. Then, in order: what was reviewed and against which sources, and
anything that could not be opened; one line on what the cases do well; the findings, `BLOCKING`
first; a table of the passes, each marked ran, found nothing, or could not run; and the open
questions, each with the person who answers. Three rules come from
`skills/review/references/report-format.md` unchanged: a severity section with nothing in it says
`None.` rather than disappearing, the severity names and the `B` / `S` / `N` prefixes stay in English
whatever `--lang` asks for, since the next review matches on them, and no score appears anywhere.

The session gets the counts per severity, the `BLOCKING` findings in one line each, and the report's
path. The cases file, its `status`, and its approver are left exactly as they were.

## Definition of done for this mode

- [ ] Every pass ran, or the report says why it could not.
- [ ] Every finding names a case ID and what a tester would do or miss because of it.
- [ ] A missing case is suggested as a row of the template, not as a sentence.
- [ ] No real credential or personal data was copied into the report.
- [ ] The cases file was not edited, and its `status` did not move.
- [ ] A run by the file's owner says so at the top of the report.
