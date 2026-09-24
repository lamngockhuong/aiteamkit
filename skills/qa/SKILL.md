---
name: qa
description: >
  Plan and write the team's testing: a test plan with scope and exit criteria, test cases traced to
  acceptance criteria, a regression matrix, test data and environment needs, and the handoff a
  developer owes QA before a ticket moves to testing. Afterwards, records a test run the team
  executed, raises its failed cases as bugs, and records the retest of a fixed bug. Also brings
  existing cases level with a changed spec.
  Use when a feature reaches QA, when a release needs a regression pass, when a team has no
  written test cases, when the spec changed under existing cases, when test results need recording
  and their defects logging, or when a cases file needs a second person's review before approval.
  Triggers on: "test plan", "test case", "QA", "kiểm thử", "viết test case", "regression",
  "update the test cases", "cập nhật test case", "テストケース更新",
  "test results", "log the failed cases as bugs", "retest", "ghi kết quả test", "log bug",
  "review these test cases", "review test case", "duyệt test case", "テスト計画", "テストケース",
  "テスト結果", "不具合報告", "再テスト", "テストケースレビュー", "how do we test this", "QA handoff",
  "/atk:qa".
argument-hint: "[requirement-path|feature|release|cases-path|run-path|issue] [--plan|--cases|--regression|--update|--run|--bug|--retest|--review] [--lang <code>] [--out <path>]"
---

# QA Planning and Test Cases (`atk:qa`)

Produces test artifacts a QA engineer can execute without asking the developer what the feature was
supposed to do. Every case traces back to an acceptance criterion, so untested criteria and untraced
cases both become visible.

## Scope

Handles: writing the test plan, deriving test cases from acceptance criteria, adding negative and
boundary cases, building the regression matrix from change impact, listing test data and environment
needs, defining the QA entry and exit criteria, and afterwards recording what the team's own test
execution found: the run record, its defects raised on the tracker, and the retest of a fixed bug.

Does NOT handle: writing automated test code, which belongs to `atk:implement`; running the
suite or executing the cases, which the testers do; deciding a result on the tester's behalf; or
signing off a release (`atk:release`).

## Roles

QA owns the plan and the cases. BrSE/BA confirms cases match the requirement intent. Dev owns the
handoff and the test data. PM owns the exit criteria. The QA who ran the cases owns the run record
and its results, the QA lead approves it, or the Tech Lead where there is none. Under `--review` the
reviewer is the BrSE/BA or the QA lead, never the owner of the cases file. See
`shared/team-roles.md`.

## Invocation

```bash
/atk:qa <requirement-path>      # Test plan plus cases from a requirement artifact
/atk:qa --plan <feature>        # Test plan only
/atk:qa --cases <feature>       # Test cases only
/atk:qa --regression <release>  # Regression matrix for a release scope
/atk:qa --update <cases-path>   # Bring existing cases level with a changed source
/atk:qa --run <cases-path>      # Record the results of a test run the team executed
/atk:qa --bug <run-path>        # Raise the defects of a run record on the tracker
/atk:qa --retest <issue>        # Record a retest of a fixed bug and offer the verdict
/atk:qa --retest <run#Dn>       # The same, for a defect never raised on a tracker
/atk:qa --review <cases-path>   # A second person reviews a cases file somebody else wrote
/atk:qa --lang vi               # Write the artifacts in Vietnamese
/atk:qa --out <path>            # Override the default output path
```

## Workflow

```
[1. Read criteria] -> [2. Derive cases] -> [3. Negative and boundary] -> [4. Regression] -> [5. Entry and exit]
```

Before step 1, read `.atk/overrides/qa.md` when it exists, per rule 7 of `shared/team-roles.md`.

Where the cases file for the slug already exists, the five steps never write it from nothing: the run
is `--update`, and the session says so. Written again from step 2, every ID would be numbered afresh,
an approved file would change without a question, and a person's edits would be lost, while run
records and bugs already point at those IDs. The test plan beside it is updated in place like any
reference document.

`--update` replaces the five steps with `references/update-mode.md`: it compares each source with what
the cases file's Sources table recorded at the last run, and adds, rewrites, or strikes rows
accordingly, keeping every ID, rather than writing the file again. `--run`, `--bug` and `--retest` replace them
with `references/test-run.md`: recording what the team's own execution found, raising its defects,
and confirming a fix. `--review` replaces them with `references/review-mode.md`, which reads a cases
file against its sources and reports findings without editing it. The override is read either way.

### 1. Read the acceptance criteria

Load the requirement and design, and the reference documents for the area: the ones the design
names, and those under `docs/api/`, `docs/database/`, `docs/features/` and `docs/screens/` for what
the change touches, resolved per `shared/artifact-paths.md`. List every acceptance criterion with an
ID. A criterion that cannot be turned into a test is reported back as a requirement defect, not
quietly skipped.

Each source answers a different question, per `shared/spec-docs.md`. The design gives what a
reference document never carries: migration, rollback, backward compatibility, rollout, and the
performance expectation. Expected values, fields, status codes, error codes, limits, constraints,
come from where the agreed contract is, which the `Contract` line in the Docs section of
`.atk/profile.md` decides. Under `first`, the reference document is the contract, so it wins over
the design, and a disagreement between the two becomes an open question for the reference
document's approver: the Tech Lead for `api` and `db`, the BrSE/BA for `feature`. Under `code`, or
with no line, a reference document still describes the code before the change, so it gives the
expected values for what the change leaves alone, the regression cases, and the design gives them
for what the change alters.

### 2. Derive the happy-path cases

One case per criterion at minimum, written as a row of `references/test-case-template.md`, which
holds the columns, the three sections `ACCESSING`, `GUI` and `FUNCTION`, the testcase types, and the ID
that is never reused. A team that already has a template keeps it, per that file. Every expected
result names its source in the `Source` column, and states an observable outcome, not "works as
expected".
The file's Sources table records what each source was when it was read, which `--update` later
compares against.

`GUI` cases take their labels, placeholders, and the text of dialogs and buttons from the screen spec
under `docs/screens/`, citing the component number. Text from a spec that is not `APPROVED`, or from a
row whose `qa` cell holds an open question or whose value is marked `Proposed:`, carries
`[ASSUMPTION]` and points at that question rather than opening a second one. Where the screen has no
spec, read the design per `shared/design-sources.md` and cite the node. Where there is neither, the
`GUI` cases carry `[ASSUMPTION]` and the cases file says its `GUI` coverage is reduced.

### 3. Negative, boundary, and cross-cutting cases

Walk each criterion through the ten dimensions in `references/case-dimensions.md`: actor, input,
quantity, state, timing, failure, environment, data, integration, and rules. The techniques in that
file, equivalence partitioning, boundary values, decision tables, state transitions, and pairwise,
decide how many cases each dimension produces. A dimension that gives no case is skipped with the
assumption that makes it irrelevant, written in the Skipped table of the cases file, so a reader can
tell a dimension that was asked from one nobody thought of.

Then open the lines of `references/checklists.tsv` for the components the screen or flow has, per
`references/checklists.md`, which also says when a checklist the override names takes their place.
Each viewpoint that applies gives its cases, cited by the viewpoint ID in `Source`; one that does not
is skipped, with the reason in the same Skipped table. Then cover the concerns that span the feature:
permissions by role, i18n and locale, timezone, and accessibility where the project requires it.

### 4. Regression matrix

Derive impact from the diff or the design, not from intuition. The migration, rollback, compatibility,
rollout and performance cases the design calls for go here beside the regression rows, one case
each, with the design's performance expectation as the expected result of its case. List the existing features that share
a module, a table, or an endpoint with the change, and mark each `MUST TEST`, `SPOT CHECK`, or
`NOT AFFECTED`, with the reason. The matrix is the Regression section of the test plan, per
`references/test-plan-template.md`; under `--regression` for a release scope it is the same section
in the release's plan. `--update` and `--retest` read it there.

### 5. Entry and exit criteria

The test plan takes the shape of `references/test-plan-template.md`: levels, test types, environments,
compatibility, and defect severity beside the criteria below.

Entry: what the developer must deliver before QA starts, including build, environment, test account,
seed data, and the list of what is not implemented yet. Where a reference document carries
`implemented`, per `shared/spec-docs.md`, that list starts from its value and its marks rather than
from memory. Exit: the pass rate, the severity thresholds
that block a release, and who signs off.

## Output

Test plan at `docs/qa/test-plan-<slug>.md` and cases at `docs/qa/test-cases-<slug>.md` per
`shared/artifact-paths.md`. The Markdown table is the source. A CSV beside it,
`docs/qa/test-cases-<slug>.csv`, is written by the export rules in `references/test-case-template.md`
when the person asks for one, when the override asks for one, or when one already exists; an existing
CSV is regenerated in the same run that changes the Markdown, and never edited by hand. A run or a
retest writes a record at `docs/records/test-runs/<ticket-or-date>-<slug>.md`, whose content is never
edited once written, apart from its `status` and the `Ticket` cells `--bug` fills. A review writes only
its report, at `docs/derived/reviews/qa-cases-<slug>-<date>.md`.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Bugs found during execution become issues through `--bug`, one
per defect the person picks from the list shown first, each carrying the case ID, the criterion ID,
and the path of the run record. A retest verdict is offered as a comment on its issue, shown first and
posted on a yes, per the consent line in `shared/finalize-steps.md`. Neither closes an issue: the QA
who raised the bug closes it, or whoever the team's own flow names. The whole procedure is `references/test-run.md`.

## Definition of done

- [ ] Every acceptance criterion maps to at least one test case.
- [ ] Every test case maps back to a criterion, or is labelled exploratory.
- [ ] Negative and boundary cases exist, not only happy paths, and every dimension skipped for a
      criterion carries the assumption that made it irrelevant.
- [ ] The regression matrix justifies each entry with a shared module, table, or endpoint.
- [ ] Entry and exit criteria name who provides what and who signs off.
- [ ] Every case has a section, a testcase type, and a source, and no ID was given to a second case.
- [ ] Every field with a stated limit has its boundary cases, and every validation rule has one
      accepted and one rejected case.
- [ ] Every `[ASSUMPTION]` has an open question naming who answers it.
- [ ] Every checklist viewpoint for a component the screen has gives a case or a reason it was skipped.
- [ ] Under `--update`, no ID changed or was reused, every rewritten case has empty execution cells,
      an approved file had its existing rows changed only through an answered question, and the run
      summary lists every row the diff touches.
- [ ] Under `--run`, `--bug` and `--retest`, the definition of done in `references/test-run.md` holds.
- [ ] Under `--review`, the definition of done in `references/review-mode.md` holds.
