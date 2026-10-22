# Test plan template

Loaded by `atk:qa` in steps 4 and 5, under `--master`, and on any run that writes or reads a plan:
the default run, `--plan`, `--regression`, `--update`, and `--retest`, which read the Regression
section. `atk:run-cases` reads the environments and `atk:release` the defect severity through Reading
a section, below.

A project has two kinds of test plan, following the master test plan and the level test plans of
IEEE 829 and the ISTQB glossary, which ISO/IEC/IEEE 29119 calls the project test plan:

- **The master test plan**, one per project at `docs/qa/master-test-plan.md`: what the team decides
  once, when the project starts, and holds for every feature. The test levels, the test types, the
  environments, compatibility, the default exit criteria, and the defect severity.
- **The test plan of a feature or a release**, at `docs/qa/test-plan-<slug>.md`, per
  `shared/artifact-paths.md`: its scope, its regression, its entry criteria, and only the places where
  it differs from the master plan.

The standards split the lower plans by test level; a team splits them by feature, and the feature plan
here is that, not a level test plan. A company test strategy, which holds for every project of the
company, is neither: where one exists, the master plan names it on its `Basis` line and does not copy
it.

The project's own template wins over these shapes in the same order as
`references/test-case-template.md` gives: an override that names one, then an existing plan under
`docs/qa/`. A team that keeps its master plan outside the repository, in a spreadsheet or a wiki,
names where in the override, and Where the master plan is, under Reading a section, is the one place
that location is resolved.

Two things no plan ever does. It never places a value nobody gave: a date, a response target, an
environment URL left unknown stays empty with the name of who will fill it, because a provisional
value in a plan reads as an agreed one. And it never carries the test schedule itself: dates and
effort belong to `atk:estimate` and `atk:breakdown`, and the plan points at their artifacts.

## The master test plan

Its readers are the PM, who owns the exit criteria and the defect severity, the Tech Lead, who
provides the environments, and every QA who writes a feature plan. Each needs to find their part
without reading the rest.

````markdown
---
title: "Master test plan: <project>"
status: IN REVIEW
owner: <QA lead>
approver: <PM for the exit criteria, the defect severity, and a test level nobody decided; TL for the environments and the rest>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket, or none>
---

# Master test plan: <project>

- Basis: <the company's test strategy, by path or link, or none>

## 1. Scope

What the project tests: the applications or repositories, and the levels below. What it does not
test, each with the reason and who decided.

## 2. Test levels

| Level | Purpose | Done here | Performed by | Notes |
|-------|---------|-----------|--------------|-------|
| UT | Each unit behaves as its code says | <yes, or no with the reason> | Dev | Written with the code, per `atk:implement` |
| IT | Units work together, API with database, screen with API | <yes, or no with the reason> | Dev and QA | |
| ST | The whole system against the requirement, non-functional included | <yes, or no with the reason> | QA | The cases in each feature's `docs/qa/test-cases-<slug>.md` |
| UAT | The client's business runs on it | <yes, or no with the reason and who decided> | Client | |

A level marked `no` says why. A level nobody decided about is an open question for the PM.

## 3. Test types

One row per non-functional requirement the project actually states, and none for one it does not.

| Type | Level | Requirement | How it is checked |
|------|-------|-------------|-------------------|
| Performance | ST | <the requirement's expectation, quoted> | <tool or procedure> |
| Compatibility | ST | Section 5 below | Cross-browser run |

## 4. Environments

| Environment | Kind | Used for | URL or location | Data | Provided by |
|-------------|------|----------|-----------------|------|-------------|
| <name> | <production, staging, development, or local> | <levels> | <URL, or empty with who will give it> | <how the data is prepared, the test accounts by role, and how many failed logins lock one> | <the TL's name> |

`Kind` is one of `production`, `staging`, `development`, or `local`, or the project's own term with one
of those four beside it, `UAT (staging)`. It exists so that a skill sending real requests can tell
from the plan whether a row may be touched: `atk:run-cases` refuses `production` and `local`.

## 5. Compatibility

| Browser, OS, or device | Version | Responsive checked |
|------------------------|---------|--------------------|
| <from the requirement> | <from the requirement> | <yes or no> |

Copied from the requirement or the non-functional list, which is authoritative for the values. A
project that states none has this section say so, and the question of which to test goes to the PM.

## 6. Entry and exit criteria

The defaults every feature plan starts from.

| Level | Entry | Exit |
|-------|-------|------|
| ST | <what holds for every feature: the environment ready, the accounts by role, and who delivers each> | <PM's threshold: cases executed, open defects allowed by severity, pass rate> |

Entry names who delivers each item. Exit names who signs off, and the figure in it is the PM's.

## 7. Defect severity

| Severity | Means | Response target |
|----------|-------|-----------------|
| Critical | The business cannot proceed and there is no workaround, or data is lost or exposed | |
| High | A main function fails and a workaround exists | |
| Medium | A secondary function is affected | |
| Low | Cosmetic, or wording | |

The response targets are the PM's to set with the client; they stay empty until one is given. A case's
priority, from `references/case-dimensions.md`, says how much a failure would matter before it
happens; severity says how much an actual defect matters, and a High case can fail with a Low defect.

## 8. Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
````

### Writing it

`--master` writes this file, and updates it in place when it exists, never writing it again from
nothing. It starts from what the project already holds, so nobody is asked again what they already
answered:

1. The project-level sections of the feature plans under `docs/qa/`, `APPROVED` ones first: a plan
   written before this file existed carries its own test levels, environments, and severity.
2. The non-functional requirements, the profile's Team section for the names, and the company test
   strategy where the person names one.
3. The person, for what neither gives.

Where the master plan is kept outside the repository, `--master` writes nothing into `docs/qa/`: it
reads that plan, shows the changes it would make, and leaves them to the plan's owner, since a second
copy in the repository would disagree with the one the team keeps.

Where two feature plans disagree on a value, two severity scales, two URLs for one environment, the
value is an open question for its owner, the PM or the Tech Lead, and none of them is picked. The run
edits no feature plan: it lists the ones that carry their own copy of a section, since each keeps
winning for its feature, per Reading a section, until its owner removes that copy.

## The feature test plan

Its readers are the QA who executes it, the PM who owns its exit criteria where they differ from the
master plan, and the Tech Lead who provides any environment it adds.

````markdown
---
title: "Test plan: <feature or release>"
status: IN REVIEW
owner: <QA>
approver: <PM for the exit criteria, and for the defect severity where this plan carries it; TL for the environments this plan carries or adds; QA lead or TL for the rest>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket, or none>
---

# Test plan: <feature or release>

- Master test plan: <its location, per Where the master plan is>, status <status>; or `No master test plan`

## 1. Scope

What is tested, as acceptance criterion IDs and the requirement they come from. What is not tested,
each with the reason and who decided. A test level the master plan runs and this feature skips is
written here, with the reason and who decided.

## 2. Differences from the master plan

`None` when the feature follows the master plan. Otherwise one table per section that differs, in that
section's shape, holding only the rows this feature adds or replaces, each with the reason and who
decided.

### Test types

| Type | Level | Requirement | How it is checked | Replaces | Reason | Decided by |
|------|-------|-------------|-------------------|----------|--------|------------|

### Environments

| Environment | Kind | Used for | URL or location | Data | Provided by | Reason | Decided by |
|-------------|------|----------|-----------------|------|-------------|--------|------------|

A row whose `Environment` matches a master row replaces it for this feature; any other row adds one.
An environment's name is what a run names it by, so two rows of one name cannot both stand.

### Compatibility

| Browser, OS, or device | Version | Responsive checked | Replaces | Reason | Decided by |
|------------------------|---------|--------------------|----------|--------|------------|

In these two tables a row replaces a master row only when its `Replaces` cell names that row, as the
master plan writes it; any other row is added, `none` in the cell included. A feature with a
performance figure of its own beside the project's has two `Performance` rows, and both are tested.

## 3. Regression

The existing features that share a module, a table, or an endpoint with the change, each marked from
the diff or the design, never from intuition, and the migration, rollback, compatibility, rollout, and
performance cases the design calls for, one case each.

| Feature | Shares | Mark | Reason |
|---------|--------|------|--------|
| <feature> | <module, table, or endpoint> | <MUST TEST, SPOT CHECK, or NOT AFFECTED> | <why> |

| Design case | Case ID | Expected result |
|-------------|---------|-----------------|
| <migration, rollback, compatibility, rollout, or performance> | <ID in the cases file> | <the design's expectation, quoted> |

## 4. Entry and exit criteria

| Level | Entry | Exit |
|-------|-------|------|
| ST | <build, seed data, the accounts this feature needs beyond the master plan's, the not-implemented list, and who delivers each> | <`As in the master plan`, or this feature's threshold with the PM who set it> |

## 5. Schedule

A link to the estimate or breakdown that holds the test effort and dates, or `none yet (ask <PM>)`.

## 6. Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
````

Test levels and defect severity have no table under Differences. A level one feature skips is part of
its scope, and the project keeps one severity scale, because `atk:release` reads every feature's
defects against it in one release.

### Without a master plan

Where no master plan exists, per Where the master plan is, the session says so and offers `--master`
first, since a feature plan written now asks the PM what the master plan would ask once for every
feature. Where the person goes on, the feature plan carries the master plan's sections itself, Test
levels, Test types, Environments, Compatibility, and Defect severity, in the master plan's shapes
and in place of Differences, with its Exit written out rather than `As in the master plan`, and its
header line says `No master test plan`. A plan written before the master plan existed looks the
same, and Reading a section reads both alike.

## Reading a section

**Where the master plan is.** `docs/qa/master-test-plan.md`, or the location `.atk/overrides/qa.md`
names for a master plan the team keeps outside the repository. A reader opens an outside one per Read
through a connection in `shared/host-capabilities.md`, and asks the person for a value when no
connection reaches it. A skill that does not otherwise read the `qa` override, `atk:run-cases` and
`atk:release`, opens it for this line alone. Either location is a master plan wherever the kit asks
whether one exists, and every other mention of the master plan's path means this one.

A skill that needs a feature's Test levels, Test types, Environments, Compatibility, Entry and exit
criteria, or Defect severity finds it in this order, matching a heading by its name with any leading
number ignored:

1. **The feature plan's own section of that name, whole.** A plan written without a master plan, or
   before one existed, carries it, and for that feature it wins, since its approver approved it. Entry
   and exit criteria is the one section every feature plan has: its Entry is always the feature
   plan's, and so is its Exit, unless the cell says `As in the master plan`, which sends the reader to
   the Exit of the master plan's `Entry and exit criteria`.
2. **The master plan's section, with the feature plan's Differences applied.** A row there replaces a
   master row as Differences from the master plan says, by its `Environment` name or its `Replaces`
   cell; any other row is added. With no feature plan at all, the master plan's section is read
   alone.
3. **Neither.** The section does not exist for that feature, and the reader does what it does when
   there is no test plan.

What a reader writes from a section names the plan it came from, so a run record that took its
severity scale from the master plan says so. A master plan that is not `APPROVED` is read all the
same, and what the reader writes gives its status, as it does for a cases file.

## Values a later run matches on

Per rule 6 of `shared/team-roles.md`, these stay spelled exactly as here whatever language the rest of
a plan is written in, because `atk:qa --record`, `--update`, `--retest`, `atk:run-cases` and
`atk:release` find them by matching: the path `docs/qa/master-test-plan.md`; the headings
`Test levels`, `Test types`, `Environments`, `Compatibility`, `Entry and exit criteria`,
`Defect severity`, `Differences from the master plan`, and `Regression`; the column names of every
table; the marks `MUST TEST`, `SPOT CHECK` and `NOT AFFECTED`; the lines `None`,
`As in the master plan`, and `No master test plan`; and the front matter keys and statuses. A
severity's name is the master plan's to choose, and stays however it spells it.

## Updating

Both plans are reference documents like the cases beside them: updated in place as the project or
the feature changes, with `status` back to `IN REVIEW` on any change the approver has not seen. A
change to the master plan reaches every feature that reads from it, so the run that makes it lists,
for their owners, both sets of feature plans: those that read the changed row from the master plan,
whose tests just changed under them, and those whose own section or Differences row overrides it,
which now differ from the project in a way their owner may want to keep or drop.
