# Test runs, bugs, and retests

Loaded by `atk:qa` under `--run`, `--bug`, and `--retest`, in place of the five workflow steps. The
cases file says what to test; a run record says what happened when somebody tested it, on one build,
in one environment, on one day. The two are kept apart on purpose: the cases file is a reference
document updated in place, and a pass written into it would be true of one build and read as true of
every one after it.

## The record and its name

A run record is a record, per `shared/artifact-paths.md`, at
`docs/records/test-runs/<YYMMDD-HHMM>-<ticket-or-slug>-<scope>.md`: the time the record is written,
the ticket where there is one or the cases file's slug where there is not, and the scope. A retest's
scope is `retest-<issue or defect>`. The time is what keeps two runs apart: a smoke run on Monday and a
regression run on Wednesday of one ticket, or a second retest after a failed first, each get a file of
their own. A path that already exists is never written again, whatever the general rule about updating
a file in place says; a collision within the same minute takes a `-2` suffix.

It is committed, and its content is never edited once written, with three exceptions, none of which
changes what the run found: its `status` moves, by its approver; `--bug` fills the `Ticket` cell of
each defect it raises, or marks it not raised; and a secret or personal data found in it later is
redacted, per The data a record must not carry, with a line at the end saying what was redacted, when,
and by whom. That is what lets a release ask which build passed, and a retest point at the run that
failed.

The values another skill reads by matching them stay spelled as this file spells them, whatever
language the prose is in, per rule 6 of `shared/team-roles.md`: the results `Passed`, `Failed`,
`Pending`, `N/A`; the scopes; `none` and `not raised` in `Ticket`; and the field labels of the header
and of a defect. A severity keeps the name the test plan gives it.

## Who does what

The QA who ran the cases writes the record, and the results in it are theirs: this skill never marks a
case `Passed` or `Failed` on its own judgement, and never runs the cases itself. The QA lead approves
the record, or the Tech Lead where the team has none. The Dev who fixes a bug is the one `atk:fix`
serves; the QA who raised it is the one who retests it and closes it, unless the team's own flow names
somebody else for closing.

The results arrive in the session, as a filled sheet, or as a CSV. A sheet or CSV the tester filled is
a copy outside `docs/qa/`, never the committed `docs/qa/test-cases-<slug>.csv`: that file is
regenerated from the Markdown with empty execution columns, and results typed into it are lost on the
next run that changes the cases. A filled copy handed over from inside `docs/qa/` is read, and the
session says to move it out before anything regenerates the CSV.

## The data a record must not carry

A run record is committed, and its defects may become issues other people read, so what a tester pastes
is checked before it is written, in every field, the steps and `Actual` included. "Verbatim" means the
message, the value, and the status code exactly as they appeared; it never means keeping a secret or a
real person's data. Replace each of these with `<redacted: kind>`, and say in the session what was
redacted and where:

| Kind | Examples |
|------|----------|
| Credentials and secrets | Passwords, API keys, access and refresh tokens, session cookies, JWTs, private keys, connection strings, signed URLs, one-time codes |
| Personal data of a real person | Names, email addresses, phone numbers, postal addresses, dates of birth, national or tax IDs, bank or card numbers, health data, photos, IP addresses tied to a person |
| Production data | Any record copied from production, even into staging, and any customer's business data |
| Internal infrastructure | Internal host names and IPs, private repository or storage URLs, stack traces naming server paths where they add nothing to the reproduction |

An account is named by its role or its test handle, `Service Admin test account`, never with its
password. Test data the team created for testing, `test@example.com`, stays as it is. Where it is not
clear whether a value is real, treat it as real and ask the tester.

Evidence links point at where the team keeps evidence; the record keeps the link, not the content. A
link to storage anyone holding the link can open is named as such in the session, since `--bug` would
publish it.

## `--run <cases-path>`: record a run

### What the run needs

Before writing anything, have from the person, and ask for what is missing rather than filling it:

- the build, version, or commit that was tested, and the environment, per the environments of the
  test plan;
- the scope: `full`, `smoke`, `regression`, or `ids` with the list of case IDs, since a run that
  covered part of the suite and reads as a full run is the release decision made on a guess;
- who ran it, and on which dates;
- a result for every case in scope, plus the evidence the team keeps;
- for every `Failed` case, what actually happened, verbatim within the rule above, how often it
  happens, and the severity the tester chose against the definitions in the test plan. A severity
  nobody gave is written `TBD (ask <QA lead>)`, never picked by the skill.

A case in scope with no result is `Pending`, never `Passed`. A result given for an ID the cases file
does not have is asked about, not dropped and not added.

**Without a test plan.** Where the feature has no `docs/qa/test-plan-<slug>.md`, the record says
`No test plan: exit criteria not assessed`, takes the severity scale the tester names or leaves each
severity `TBD (ask <QA lead>)`, takes the environment from the tester, and offers `--plan` in the
session. It never invents definitions or criteria to fill the gap.

**What the cases were.** The header records the cases file's `status` and whether it had uncommitted
changes. A run against cases that are not `APPROVED`, or not committed, is recorded all the same, and
the header says so, because a release reading this record as sign-off has to know the cases themselves
were not yet accepted.

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

- Cases: `docs/qa/test-cases-<slug>.md`, as of commit `<short sha>`, status `<status>`, <clean | with uncommitted changes>
- Test plan: `docs/qa/test-plan-<slug>.md`, or `No test plan: exit criteria not assessed`
- Build: <version or commit>. Environment: <name>
- Scope: <full | smoke | regression | ids | retest>. Cases: <the IDs, where the scope is ids or retest>
- Run by: <names>, <dates>
- Retest of: <issue or defect, and the run record it failed in, only under `--retest`>

## Summary

| Result | Cases | Share |
|--------|-------|-------|
| Passed | 41 | 82% |
| Failed | 3 | 6% |
| Pending | 4 | 8% |
| N/A | 2 | 4% |
| Total in scope | 50 | |

Against the exit criteria of the test plan: <met, or which criterion is not, and by how much>.
Meeting them is the approver's call to confirm, not this record's.

## Results

| Case | Result | Tester | Date | Evidence | Defect |
|------|--------|--------|------|----------|--------|
| TC-SA0201-FUN-003 | Failed | <name> | YYYY-MM-DD | <link> | D1 |

## Defects

### D1. <one line: what goes wrong>

- Case: TC-SA0201-FUN-003. Criterion: AC-1. Testcase type: Abnormal_Others
- Severity: <a severity name from the test plan, or TBD (ask <QA lead>)>
- Security: <no | yes, per the tester or because the case is `Access control and security`>
- Environment: <build, environment, browser or device, account by role>
- Steps to reproduce:
  1. <copied from the case, with the data used, redacted per the rule above>
- Expected: <the case's expected result, and its source>
- Actual: <what happened, verbatim within the rule above>
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
and environment, and each of those four is a field here. A defect missing one of them is incomplete,
and the record says which.

### After writing

Recount the summary from the results table, never from the tester's own totals, and say in the
session where the two disagree. Then offer `--bug` for the defects, and stop: the record is written,
and what goes to the tracker is a separate yes.

## `--bug <run-path>`: raise the defects

1. **The list.** List every defect in the record whose `Ticket` is `none`, one line each with its
   severity and whether it is a security defect. Show with it the tracker that was detected, per
   `shared/ticket-adapters.md`, and who can read it: public, the organisation, or the team; where that
   cannot be read, say so and treat it as public. Say which fields an issue body carries, name every
   evidence link it would publish, and show a body in full when asked. Nothing is created before the
   person says which, since that file forbids tickets in bulk without the list first and a yes.
2. **Security defects.** A defect marked `Security: yes` is never filed on a tracker the public can
   read, the same rule `atk:security` follows: name the private channel instead, the code host's
   private security advisory or the team's private tracker, and let the QA lead choose. Its steps are
   what make it exploitable, and a public issue publishes them.
3. **Creating.** For each one chosen, create an issue of the tracker's `Bug` kind from the vocabulary
   map in that file. Its body is the defect section as written, with any evidence link the person
   dropped left out, plus the path of the run record; its title is the defect's one line. Labels,
   assignee, and parent issue are only what the team's own conventions or override name, never
   guessed from the tracker.
4. **Outcomes.** With no tracker detected, the run record is the only copy, and the session says so.
   With one detected but unreachable, nothing is created, and the session says which class of failure
   it was, never the tool's own error text. A creation that fails partway through the list reports
   each chosen defect as created, with its number, or not created, with the class of failure, and
   carries on with the rest.

The only edit to the record is the `Ticket` cell of each defect handled: the issue's number or link
for one raised, or `not raised: <reason, who decided>` for one the person chose not to raise, a
duplicate, not a bug, or already raised by hand. Both stop a later `--bug`, and `atk:help`, from
offering the same defect again. A defect not created because of a failure keeps `none`. The run
summary lists each cell it set.

## `--retest <issue | run-path#Dn>`: confirm a fix

A retest is a new, narrow run. It exists because QA confirms a fix against the reproduction in the
report, not against the developer's word, which is what `atk:fix` says it hands over for. It takes the
issue the defect became, or, where there is no tracker or the defect was never raised, the run record
and the defect's ID, `docs/records/test-runs/<file>.md#D2`.

1. **Find the defect.** Under an issue, the run record whose defect `Ticket` cell holds exactly that
   issue, matched on the whole value, `#12` never matching `#120`, or by the path in the issue body.
   Where none is found, the issue was not raised by this skill: take the reproduction from the issue
   itself, redacted per The data a record must not carry, and say so. Where the tracker cannot be
   reached, say which class of failure it was and ask for a run path instead.
2. **The scope.** The defect's case, plus the cases the fix may have reached. Where a fix record for
   this issue exists, in `docs/records/fixes/` of the project and of each member repository per the
   Repositories table of `shared/project-profile.md`, naming any member that could not be read, take
   the files it names. Match them through the reference documents that describe those files, their
   subjects and screens, against the `Source` and `Page` columns of the cases file, and through the
   regression section of the test plan. Show the candidate cases to the QA who retests, say plainly
   when the list holds only the defect's own case, and record the scope that QA chooses, with the
   reason for any candidate left out.
3. **Record it** with `--run`'s shape: `Scope: retest`, the chosen case IDs on the Cases line,
   `Retest of` filled, and the build carrying the fix. A retested case that fails again gets a defect
   section whose `Ticket` is the issue being retested, or `not raised: retest of <defect>` where there
   is no issue, so no second issue is raised for a bug already open.
4. **The verdict** is per case and comes from the tester:
   - `Passed`: the steps to reproduce, followed exactly, no longer produce the actual result, and the
     expected result holds;
   - `Failed`: the tester gives what happened this time, verbatim within the rule above. The skill
     never fills it in from the earlier run.
5. **The comment.** Where there is an issue, offer a comment carrying the verdict, the build, and the
   path of the retest record, never the `Actual`. It is shown first and posted on a yes, per the
   consent line in `shared/finalize-steps.md`; an unreachable tracker is said by its class of failure.
   Closing the issue is not this skill's: it is the QA who raised the bug who closes it, or whoever
   the team's own flow names, and a failed retest reopens nothing by itself either; it says so, and
   that person decides.

## Definition of done for these modes

- [ ] Every result in the record came from the tester; no case was marked on the skill's judgement.
- [ ] The build, the environment, the scope, who ran it, and the cases file's status are stated, and a
      case in scope with no result is `Pending`.
- [ ] The record's path carries the time and did not exist before.
- [ ] No secret, credential, real personal data, or production data is in the record or in any issue
      body or comment; every redaction was said in the session.
- [ ] The summary was recounted from the results and set against the plan's exit criteria, without
      calling them met, or the record says there was no plan.
- [ ] Every defect carries the four things `atk:fix` needs.
- [ ] Nothing was created on the tracker and nothing was commented without the list or the text shown
      first, the tracker's visibility named, and a yes; no security defect went to a public tracker.
- [ ] No run record's content was edited after it was written, beyond its `status`, the `Ticket` cells
      `--bug` set, and a redaction recorded as such; a retest is a record of its own.
- [ ] No severity, actual result, or frequency was filled in by the skill.
