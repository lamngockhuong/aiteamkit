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
a file in place says; a collision within the same minute takes the next free suffix, `-2`, `-3`, and
records sort by the time, then by the suffix, the unsuffixed file first, whatever order a directory
listing shows.

The time is the local time of the person running the skill, and the same zone throughout a project:
the file-name time is what later runs sort records by. A ticket or an issue becomes its key, the
letters, digits and hyphens of `PROJ-12` or the number of `#12`, `12`; a link becomes the key it points
at; anything else is flattened to a hyphen. A defect retested without an issue is named by its record's
time and its ID, `retest-260924-1030-D2`. No `#` or `/` ever reaches a file name, since `#` is what
`--retest` uses to name a defect and what a Markdown link reads as a fragment.

It is committed, and its content is never edited once committed, with three exceptions, none of which
changes what the run found: its `status` moves, by its approver; `--bug` fills the `Ticket` cell of
each defect it raises, or marks it not raised; and a secret or personal data found in it later is
redacted, per The data a record must not carry, with a line at the end saying what was redacted, when,
and by whom. A redaction reaches every copy the kit made: an issue `--bug` raised from the defect is
offered the same redaction, shown first and edited on a yes. It does not reach git history, which
still holds the value, and it does not make a leaked credential safe: the session says so, and names
the credential's owner as the person who rotates it. That is what lets a release ask which build passed, and a retest point at the run that
failed.

The values another skill reads by matching them stay spelled as this file spells them, whatever
language the prose is in, per rule 6 of `shared/team-roles.md`: the results `Passed`, `Failed`,
`Pending`, `N/A`; the scopes `full`, `smoke`, `regression`, `ids`, `retest`; `none`, `not raised`, its five
reasons, and `private` in `Ticket`; `yes` and `no` in `Security`; `TBD` in `Severity`; the defect identifiers `D1`,
`D2`; the line `No test plan: exit criteria not assessed`; the headings `Summary`, `Results`,
`Defects`, `Open questions`; and the field labels of the header and of a defect. A severity keeps the
name the test plan gives it.

## Who does what

The QA who ran the cases writes the record, and the results in it are theirs: this skill never marks a
case `Passed` or `Failed` on its own judgement, and never runs the cases itself. The QA lead approves
the record, or the Tech Lead where the team has none. The Dev who fixes a bug is the one `atk:fix`
serves; the QA who raised it is the one who retests it and closes it, unless the team's own flow names
somebody else for closing.

The results arrive in the session, as a filled sheet, or as a CSV. A sheet or CSV the tester filled is
a copy outside the repository, or in a path the repository ignores, never the committed
`docs/qa/test-cases-<slug>.csv`: it holds `Actual` values and links before any redaction, and
committed it would publish them. The session names the file it read, so the person can remove it
once the record is written. Never the committed CSV either: that file is
regenerated from the Markdown with empty execution columns, and results typed into it are lost on the
next run that changes the cases. A filled copy handed over from inside `docs/qa/` is read, and the
session says to move it out before anything regenerates the CSV.

## The data a record must not carry

A run record is committed, and its defects may become issues other people read, so what a tester pastes
is checked before it is written, in every field, the steps and `Actual` included. "Verbatim" means the
message, the value, and the status code exactly as they appeared; it never means keeping a secret or a
real person's data. Replace each of these with `<redacted: kind>`, where the kind keeps what the
reproduction needs without the value, `<redacted: bearer token>`, `<redacted: customer email>`,
`<redacted: internal host, production database>`, and say in the session what was redacted and
where, by kind and field, never by repeating the value; the note a later redaction leaves says the
same and no more:

| Kind | Examples |
|------|----------|
| Credentials and secrets | Passwords, API keys, access and refresh tokens, session cookies, JWTs, private keys, connection strings, signed URLs, one-time codes |
| Personal data of a real person inside the system under test, a customer or an end user, never the team's own names in `Run by`, `Tester`, or `Ticket` | Names, email addresses, phone numbers, postal addresses, dates of birth, national or tax IDs, bank or card numbers, health data, photos, IP addresses tied to a person |
| Production data | Any record copied from production, even into staging, and any customer's business data |
| Internal infrastructure | Internal host names and IPs, private repository URLs, stack traces naming server paths where they add nothing to the reproduction. The `Evidence` field is the exception: it keeps its links to where the team keeps evidence, under the rule below |

Where a redaction was needed in an `Actual`, the application itself put that data in front of the
tester, a token in a response or another user's email on a screen, and that is often the defect. Ask
the tester whether it should be `Security: yes`, and say so in the session either way. The same
question is put when a case or its `Actual` points at a security finding on its own: another user's
data, an account the tester should not reach, a message that tells which accounts exist, a stack
trace. The skill proposes the value; the tester sets it.

An account is named by its role or its test handle, `Service Admin test account`, never with its
password. Test data the team created for testing, `test@example.com`, stays as it is. Where it is not
clear whether a value is real, treat it as real and ask the tester.

Evidence links point at where the team keeps evidence; the record keeps the link, not the content. The
content still counts: a screenshot showing a real customer's name, or a log carrying a token, is the
same leak behind a link. Ask the tester to confirm that the evidence carries none of the kinds above,
and mark a link whose content nobody confirmed as `unchecked` beside it. A HAR file, a network capture,
or an application log counts as carrying session cookies and tokens unless the tester confirms it was
scrubbed. A link to storage anyone
holding the link can open is named as such in the session, since `--bug` would publish it.

## `--run <cases-path>`: record a run

### What the run needs

Before writing anything, have from the person, and ask for what is missing rather than filling it:

- the build, version, or commit that was tested, and the environment, per the environments of the
  test plan;
- the scope: `full`, `smoke`, `regression`, or `ids` with the list of case IDs, since a run that
  covered part of the suite and reads as a full run is the release decision made on a guess;
- who ran it, and on which dates;
- a result for every case in scope: `Passed`, `Failed`, `Pending` (not yet run), or `N/A` (does not
  apply to this build, and always with the reason, which goes in the Note column), plus the evidence
  the team keeps, a screenshot, a log, a recording;
- for every `Failed` case, what actually happened, verbatim within the rule above, how often it
  happens, and the severity the tester chose against the definitions in the test plan. A severity
  nobody gave is written `TBD (ask <QA lead>)`, never picked by the skill.

A case in scope with no result is `Pending`, never `Passed`. A result given for an ID the cases file
does not have, or for a case struck through as removed, is asked about, not dropped and not added. A
scope of `ids` with no IDs in it is not a run: ask for the list.

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

- Cases: `docs/qa/test-cases-<slug>.md`, as of `<short sha>` of the last commit that changed it, or `not tracked`, status `<status>`, <clean | with uncommitted changes>
- Test plan: `docs/qa/test-plan-<slug>.md`, or `No test plan: exit criteria not assessed`
- Build: <version or commit>. Environment: <name>
- Scope: <full | smoke | regression | ids | retest>. Case IDs: <the IDs, where the scope is ids or retest>
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

| Case | Result | Tester | Date | Evidence | Defect | Note |
|------|--------|--------|------|----------|--------|------|
| TC-SA0201-FUN-003 | Failed | <name> | YYYY-MM-DD | <link> | D1 | |
| TC-SA0201-GUI-002 | N/A | <name> | YYYY-MM-DD | | | Responsive layout not in this build |

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
and environment, and each of those four is a field here, copied rather than paraphrased, a redaction
per The data a record must not carry being the only change allowed. A defect missing one of them is
incomplete, and the record says which.

### After writing

Recount the summary from the results table, never from the tester's own totals, and say in the
session where the two disagree.

Where any defect is `Security: yes`, the record itself names an unfixed vulnerability with the steps
that exploit it. Before it is committed to a repository the client or the public can read, say so and
let the QA lead decide where it lives, as `atk:security` does for its own records: this repository, or
the team's private repository or tracker. The record is written whole wherever it goes, since a record
with its steps held back is incomplete for `atk:fix` and cannot have them put back later. Until that
answer, the record is not committed.

Then offer `--bug` for the defects, and stop: the record is written, and what goes to the tracker is a
separate yes.

## `--bug <run-path>`: raise the defects

1. **The list.** List every defect in the record whose `Ticket` is `none`, one line each with its
   severity and whether it is a security defect. Check each body against The data a record must not
   carry first, since a record written by hand or by an older version of this skill may carry what the
   rule would have caught; anything found is redacted in the record, as that rule allows, before it
   can reach an issue. Show with it the tracker that was detected, per
   `shared/ticket-adapters.md`, and who can read it: public, the organisation, or the team; where that
   cannot be read, say so and treat it as public. Say which fields an issue body carries, name every
   evidence link it would publish, and show a body in full when asked. Nothing is created before the
   person says which, since that file forbids tickets in bulk without the list first and a yes.
2. **Security defects.** A defect marked `Security: yes` is never filed on a tracker the public can
   read. At the list, the QA lead may mark any other defect as a security one, a failed
   `Access control and security` case being the usual candidate, and that defect is then handled the
   same way; the mark goes into its `Ticket` cell as `private: ...`, since `Security` itself cannot
   change once written. A defect so marked is never filed on a tracker the public can read either, the same rule `atk:security` follows: name the private channel instead, the code host's
   private security advisory or the team's private tracker, and let the QA lead choose. Its steps are
   what make it exploitable, and a public issue publishes them. The QA lead files it there; the skill
   drafts what to file. Its `Ticket` becomes `private: <where, and the reference if there is one>`,
   so no later `--bug` offers it again. Where no private channel exists, the QA lead decides what
   happens to it, and the cell records that decision, `not raised: no private channel, <who>`; the
   defect is never filed publicly for want of somewhere else to put it.
3. **Creating.** For each one chosen, create an issue of the tracker's `Bug` kind from the vocabulary
   map in that file. Its body is the defect section as written, with any evidence link the person
   dropped left out, plus the path of the run record; its title is the defect's one line. Labels,
   assignee, and parent issue are only what the team's own conventions or override name, never
   guessed from the tracker.
4. **Outcomes.** With no tracker detected, nothing is created, every `Ticket` stays `none`, the run
   record is the only copy, and the session says so; the list is still shown, so the person can mark a
   defect `not raised`.
   With one detected but unreachable, nothing is created, and the session says which class of failure
   it was, never the tool's own error text. A creation that fails partway through the list reports
   each chosen defect as created, with its number, or not created, with the class of failure, and
   carries on with the rest.

The only edit to the record is the `Ticket` cell of each defect handled: the issue's key for one
raised, `private: ...` for one filed privately, or `not raised: <reason>, <who decided>` for one the
person chose not to raise, where the reason is one of `not a bug`, `duplicate of <key or defect>`,
`raised by hand as <key>`, `retest of <defect>`, or `no private channel`, spelled so, per rule 6. Each stops a later
`--bug`, and `atk:help`, from offering the same defect again. Write each cell as soon as its issue
exists, not at the end, so a run that stops halfway leaves no created issue looking unraised. A defect
not created because of a failure keeps `none`. The run summary lists each cell it set.

## `--retest <issue | run-path#D<n>>`: confirm a fix

A retest is a new, narrow run. It exists because QA confirms a fix against the reproduction in the
report, not against the developer's word, which is what `atk:fix` says it hands over for. It takes the
issue the defect became, or, where there is no tracker or the defect was never raised, the run record
and the defect's ID, `docs/records/test-runs/<file>.md#D2`.

1. **Find the defect.** Under an issue, the run records whose defect `Ticket` cell holds that issue:
   turn both sides into the tracker's key before comparing, so `#12`, `12` and the issue's link match
   one another and `#12` never matches `#120`. Where the project has more than one tracker, one per
   member repository, the key carries the repository as well. Several records match once a retest has
   failed: take the defect from the original run, the oldest by file-name time, for the reproduction,
   and name it and the newest failed retest both in `Retest of`. Or find it by the path in the issue
   body.
   Where none is found, the issue was not raised by this skill: take the reproduction from the issue
   itself, redacted per The data a record must not carry, and say so. Where the tracker cannot be
   reached, say which class of failure it was and ask for a run path instead.
2. **The scope.** The defect's case, plus the cases the fix may have reached. Where a fix record for
   this issue or this defect exists, in `docs/records/fixes/` of the project and of each member
   repository per the Repositories table of `shared/project-profile.md`, naming any member that could
   not be read, take the files it changed and the callers its blast radius names. A fix record names a
   defect with no issue by the run record path and the defect ID, `<run-path>#D2`. Match them through the reference documents that describe those files, their
   subjects and screens, against the `Source` and `Page` columns of the cases file, and through the
   Regression section of the test plan: a feature marked `MUST TEST` there brings in the cases of its
   own cases file whose `Page` or `Source` touches what the fix changed. Show the candidate cases to the QA who retests, say plainly
   when the list holds only the defect's own case, and record the scope that QA chooses, with the
   reason for any candidate left out.
3. **Record it** with `--run`'s shape: `Scope: retest`, the chosen case IDs on the `Case IDs:` part of the Scope line,
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
      body or comment; every redaction was said in the session, and evidence nobody checked is marked
      `unchecked`.
- [ ] A record naming a security defect was not committed before the QA lead said where it lives.
- [ ] The summary was recounted from the results and set against the plan's exit criteria, without
      calling them met, or the record says there was no plan.
- [ ] Every defect carries the four things `atk:fix` needs, copied rather than paraphrased apart from
      a redaction, and every `N/A` carries its reason.
- [ ] Nothing was created on the tracker and nothing was commented without the list or the text shown
      first, the tracker's visibility named, and a yes; no security defect went to a public tracker.
- [ ] No run record's content was edited after it was committed, beyond its `status`, the `Ticket` cells
      `--bug` set, and a redaction recorded as such; a retest is a record of its own.
- [ ] No severity, actual result, or frequency was filled in by the skill.
