# Test runs, bugs, and retests

Loaded by `atk:qa` under `--run`, `--bug`, and `--retest`, in place of the five workflow steps. The
cases file says what to test; a run record says what happened when somebody tested it, on one build,
in one environment, on one day. The two are kept apart on purpose: the cases file is a reference
document updated in place, and a pass written into it would be true of one build and read as true of
every one after it.

A run record is a record, per `shared/artifact-paths.md`: `docs/records/test-runs/<ticket-or-date>-<slug>.md`,
committed, and its content never edited once written, with two exceptions that are pointers rather
than content: its `status` moves, by its approver, and `--bug` fills the `Ticket` cell of each defect
it raises. A second run of the same cases is a second record. That is
what lets a release ask which build passed, and a retest point at the run that failed.

## Who does what

The QA who ran the cases writes the record, and the results in it are theirs: this skill never marks a
case `Passed` or `Failed` on its own judgement, and never runs the cases itself. It takes the results
the tester gives, in the session, as a filled sheet, or as the execution columns of an exported CSV,
and turns them into the record. The QA lead approves the record, or the Tech Lead where the team has
none. The Dev who fixes a bug is the one `atk:fix` serves; the QA who raised it is the one who
retests it and closes it, unless the team's own flow names somebody else for closing.

## `--run <cases-path>`: record a run

### What the run needs

Before writing anything, have from the person, and ask for what is missing rather than filling it:

- the build, version, or commit that was tested, and the environment, per the environments of the
  test plan;
- the scope: `full`, `smoke`, `regression`, or the list of case IDs, since a run that covered part of
  the suite and reads as a full run is the release decision made on a guess;
- who ran it, and on which dates;
- a result for every case in scope: `Passed`, `Failed`, `Pending` (not yet run), or `N/A` (does not
  apply to this build, with the reason), plus the evidence the team keeps, a screenshot link, a log,
  a recording;
- for every `Failed` case, what actually happened, verbatim, how often it happens, and the severity
  the tester chose against the definitions in the test plan. A severity nobody gave is written
  `TBD (ask <QA lead>)`, never picked by the skill.

A case in scope with no result is `Pending`, never `Passed`. A result given for an ID the cases file
does not have is asked about, not dropped and not added.

### The shape

````markdown
---
title: "Test run: <feature or release>, <scope>"
status: IN REVIEW
owner: <QA who ran it>
approver: <QA lead, or TL where there is none>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket, or none>
---

# Test run: <feature or release>, <scope>

- Cases: `docs/qa/test-cases-<slug>.md`, as of commit `<short sha>`
- Build: <version or commit>. Environment: <name, per the test plan>
- Scope: <full | smoke | regression | retest | the IDs>. Run by <names>, <dates>
- Retest of: <bug and the run it failed in, only under `--retest`>

## Summary

| Result | Cases | Share |
|--------|-------|-------|
| Passed | 41 | 82% |
| Failed | 3 | 6% |
| Pending | 4 | 8% |
| N/A | 2 | 4% |
| Total in scope | 50 | |

Against the exit criteria of `docs/qa/test-plan-<slug>.md`: <met, or which criterion is not, and by
how much>. Meeting them is the approver's call to confirm, not this record's.

## Results

| Case | Result | Tester | Date | Evidence | Defect |
|------|--------|--------|------|----------|--------|
| TC-SA0201-FUN-003 | Failed | <name> | YYYY-MM-DD | <link> | D1 |

## Defects

### D1. <one line: what goes wrong>

- Case: TC-SA0201-FUN-003. Criterion: AC-1
- Severity: <per the definitions in the test plan>
- Environment: <build, environment, browser or device, account used>
- Steps to reproduce:
  1. <copied from the case, with the exact data used>
- Expected: <the case's expected result, and its source>
- Actual: <what happened, verbatim: the message, the value, the status code>
- Frequency: <every time, or n of m attempts>
- Evidence: <links>
- Ticket: <none, until `--bug` fills it>

## Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
````

`Share` is of the cases in scope, not of the whole suite. A defect's `Expected` is the case's expected
result and never a new one: a tester who expected something the case does not say has found a case to
fix or a requirement question, and it goes to the open questions with the BrSE/BA's name.

A defect is written so that `atk:fix` can start from it without asking anybody anything: step 1 of
`skills/fix/references/investigate.md` restates a symptom as input, observed output, expected output,
and environment, and each of those four is a field here, copied rather than paraphrased. A defect
missing one of them is incomplete, and the record says which.

### After writing

Recount the summary from the results table, never from the tester's own totals, and say in the
session where the two disagree. Then offer `--bug` for the defects, and stop: the record is written,
and what goes to the tracker is a separate yes.

## `--bug <run-path>`: raise the defects

1. List every defect in the record whose `Ticket` is `none`, one line each with its severity, and
   show the list. Nothing is created before the person says which, per `shared/ticket-adapters.md`,
   which forbids tickets in bulk without the list first and a yes.
2. For each one chosen, create an issue of the tracker's `Bug` kind from the vocabulary map in that
   file. Its body is the defect section as written, plus the path of the run record; its title is the
   defect's one line. Labels, assignee, and parent issue are only what the team's own conventions or
   override name, never guessed from the tracker.
3. Name the tracker that was detected, per the same file. With none detected, the run record is the
   only copy, and the session says so. With one detected but unreachable, nothing is created, and the
   session says which class of failure it was. A creation that fails partway through the list reports
   each chosen defect as created, with its number, or not created, with the class of failure, and
   carries on with the rest; a defect not created keeps `Ticket` at `none`.

The only edit to the record is the `Ticket` cell of each defect raised, set to the issue's number or
link, so the record and the issue point at each other and a second `--bug` does not raise the same
defect again. Nothing else in the record changes, and the run summary lists each cell it set.

## `--retest <issue>`: confirm a fix

A retest is a new, narrow run. It exists because QA confirms a fix against the reproduction in the
report, not against the developer's word, which is what `atk:fix` says it hands over for.

1. Find the defect: the run record whose defect `Ticket` cell holds the issue, by the path in the
   issue body or by searching `docs/records/test-runs/` for the issue number. Where none is found, the issue
   was not raised by this skill; take the reproduction from the issue itself and say so.
2. The scope is the defect's case, plus the cases the fix may have reached. Where
   `docs/records/fixes/` holds a record for this issue, take the files and callers it names, match them
   against the regression matrix and the `Source` column of the cases file, and show the candidate
   cases to the QA who retests. The scope is what that QA chooses from them, recorded with the reason
   for any candidate left out: a fix that touched shared code has a blast radius, and the retest covers
   what the QA decides it must.
3. Record it with `--run`'s shape, `Retest of` filled, the slug carrying `retest-<issue>`. The build is
   the one carrying the fix.
4. The verdict is per case and comes from the tester:
   - `Passed`: the steps to reproduce, followed exactly, no longer produce the actual result, and the
     expected result holds;
   - `Failed`: the tester gives what happened this time, verbatim. The skill never fills it in from the
     earlier run.
5. Offer a comment on the issue carrying the verdict, the build, and the path of the retest record.
   It is shown first and posted on a yes, per the consent line in `shared/finalize-steps.md`. Closing
   the issue is not this skill's: it is the QA who raised the bug who closes it, or whoever the team's
   own flow names, and a failed retest reopens nothing by itself either; it says so, and that person
   decides.

## Definition of done for these modes

- [ ] Every result in the record came from the tester; no case was marked on the skill's judgement.
- [ ] The build, the environment, the scope, and who ran it are stated, and a case in scope with no
      result is `Pending`.
- [ ] The summary was recounted from the results and set against the plan's exit criteria, without
      calling them met.
- [ ] Every defect carries the four things `atk:fix` needs, copied rather than paraphrased.
- [ ] Nothing was created on the tracker and nothing was commented without the list or the text shown
      first and a yes.
- [ ] No run record's content was edited after it was written, beyond its `status` and the `Ticket`
      cells `--bug` set; a retest is a record of its own.
- [ ] No severity, actual result, or frequency was filled in by the skill.
