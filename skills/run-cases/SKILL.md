---
name: run-cases
description: >
  Execute approved test cases against a deployed DEV or staging environment through the browser:
  refuse production and the local stack, recon the accounts and data, triage every case as
  automatable, semi-automatable, manual, or blocked, naming the person who clears any obstacle the
  run cannot clear itself, agree the scope with the
  person before any case runs, run in at most three rounds, and write only the results it observed
  into a run record the QA lead approves and `atk:qa --bug` reads.
  Use when a cases file is approved, a non-production environment is deployed, and the team wants
  an agent to execute the automatable part instead of a tester clicking through it.
  Triggers on: "run the test cases", "execute test cases", "run these cases on staging",
  "automate these test cases on DEV", "chạy test case", "thực thi test case",
  "chạy test case trên STG", "chạy bộ test case trên môi trường DEV", "テストケース実行",
  "テスト実施", "STGでテストケースを実行", "/atk:run-cases".
argument-hint: "<cases-path> [--env <name>] [--only <IDs>] [--dry-run] [--out <path>]"
---

# Run Test Cases on a Deployed Environment (`atk:run-cases`)

Takes the cases `atk:qa` wrote and runs the part of them an agent can run honestly, on a deployed
environment that is not production, through the browser. What comes back is a run record in the shape
`atk:qa` already defines: the results the agent observed and nothing else, a defect for each failure,
and evidence beside it, waiting for the QA lead.

The skill exists because most of a regression pass is mechanical and some of it is not. It decides
which is which before touching anything, says so, and lets the person who started the run choose
what this session covers. A case it cannot observe is never given a result, and a case that would
change data somebody else is using is never automated at all.

## Scope

Handles: choosing the target from the test plan's environments and refusing production and the local
stack, logging in and reading the environment before scoring, triage of every case, the scope
question, execution in at most three rounds, creating the data a case needs through the product and
deleting it afterwards, the run record with its defects and evidence, and the triage report and run
log behind it.

Does NOT handle: writing or updating the cases, or the test plan, which is `atk:qa`; recording a run a
tester executed by hand, which is `atk:qa --record`; raising the defects on the tracker or retesting a
fix, which are `atk:qa --bug` and `atk:qa --retest` reading this skill's record; running the local
stack, which is `atk:verify`, the developer's check before handing work to QA; writing permanent
end-to-end test code (`atk:implement`); fixing what it finds (`atk:fix`); or deciding that the build
passes, which is the QA lead's call on the record.

The boundary with `atk:qa` is the one worth stating plainly. `atk:qa` never executes a case: it plans,
writes, and records what testers did. This skill executes, and hands `atk:qa` a record that its
`--bug` and `--retest` modes read exactly as they read a tester's. The boundary with `atk:verify` is
the environment: a local target is refused here and is that skill's.

## Roles

QA starts the run, answers the scope question, sets the security flag of each defect, sets its
severity or leaves it `TBD` for the QA lead, confirms every screenshot before the record links it, and
owns the record. The QA lead approves it, or the Tech Lead where the team has none. The environment
owner, the `Provided by` of the test plan's row and often the SRE, is the person a stop names and the
one who decides about data the run left behind. The obstacle of a `SEMI-2` or `SEMI-3` case is cleared
by a person named for it before the case enters the scope. See `shared/team-roles.md`.

## Invocation

```bash
/atk:run-cases <cases-path>               # Triage, agree the scope, run, and record
/atk:run-cases <cases-path> --env <name>  # Name the test plan's environment row up front
/atk:run-cases <cases-path> --only <IDs>  # Offer only these case IDs at the scope question
/atk:run-cases <cases-path> --dry-run     # Triage and the scope question, with no request to the environment
/atk:run-cases <cases-path> --out <path>  # Override the run record's path; its evidence goes beside it
```

`<cases-path>` is a cases file `atk:qa` wrote, `docs/qa/test-cases-<slug>.md`. A team whose cases live
in a spreadsheet of its own maps it with "Mapping to a spreadsheet form" in
`skills/qa/references/test-case-template.md` first; this skill reads the Markdown table only.

`.atk/profile.md` is read for its `Layers` and `Team` sections and is not required: without it the
skill continues, per the Required-soft group of `shared/project-profile.md`, and the triage report
and the record's `In short` open with the sentence that group uses.

## Workflow

```
[1. Load] -> [2. Target] -> [3. Recon] -> [4. Triage] -> [5. Scope] -> [6. Run rounds] -> [7. Clean up] -> [8. Record]
```

Before step 1, read `.atk/overrides/run-cases.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Load

Read the cases file and its test plan, `docs/qa/test-plan-<slug>.md`, skipping the rows struck
through as removed, per The cases to triage in `references/triage.md`. Note the cases file's `status`
and whether it has uncommitted changes, for the record's header. A file that is not `APPROVED` is
asked about before anything else: the person may run it all the same, and the record says so, as
`skills/qa/references/test-run.md` does under What the cases were.

Check whether the harness offers browser automation, per Browser automation in
`shared/host-capabilities.md`. Where it offers none, the run carries on as a dry run and ends after
step 5, handing the agreed scope to `atk:qa --record`, and the session says so now rather than after
the triage.

Read the newest run log of an earlier run of this cases file, per The run log in
`references/execution.md`: offer its deferred cases as `--only`, so a run split over several sessions
picks up where it stopped, and name to the person any data it shows created with no record after it.

### 2. Target

Choose and check the environment per `references/environment-safety.md`: the test plan's row, its
`Kind`, the person's confirmation, the refusals for production and for the local stack, the owner
by name, the reachability check, the lock threshold, and where credentials may come from. Every stop
about the target happens here, before any login; the lock and credential rules in that file apply
again at every login after it, which is why later steps reopen it. Under `--dry-run` the reachability
check is skipped, since a dry run sends nothing.

### 3. Recon

Ground the cases in the code and look at the environment, per Ground the cases in the code and Recon
the environment in `references/triage.md`. Under `--dry-run` there is no recon and nothing is sent to
the environment.

### 4. Triage

Score every case in the file and give it `AUTO`, `SEMI-1`, `SEMI-2`, `SEMI-3`, `MANUAL`, or `BLOCKED`,
per `references/triage.md`, against what recon observed. Write the triage report before the next step,
so the person answering the scope question can open it.

### 5. Scope

Ask the scope question in `references/triage.md`, and wait for the answer. No case runs before it, and
no case is dropped on the skill's own judgement. The answer goes into the triage report and the run
log. Under `--dry-run`, with no browser automation, or with a budget of zero, the run ends here: the
triage report, with the agreed scope written into it, is the output, and the session names
`atk:qa --record` as the way that scope gets executed by hand.

### 6. Run rounds

Execute the agreed scope per `references/execution.md`: grouped by account, a person asked at once for
a step only they can do, a refused tool call checked against the code before anyone is asked, `Passed`
only for what was observed, a failure re-run once from a clean state, at most three rounds. The run
log is written as the run goes.

Before the session's room runs out, stop and go to step 7 with what has been settled. Cases never
reached are deferred, not `Pending`.

### 7. Clean up

Delete what the run created, by the identifiers the run log holds and never by pattern, keep what a
defect needs to be reproduced, sign out, and close the browser session this run opened, per Clean-up
in `references/execution.md`. Every early stop from step 3 on runs this as far as it can, and the
record is written after it, so it can say what the run left on the environment.

### 8. Record

Show the person every screenshot the record would link, per Evidence in `references/execution.md`:
a confirmed one moves beside the record, one not confirmed is deleted. Then write the run record per
The record in that file, in the shape of `skills/qa/references/test-run.md`, at `status: IN REVIEW`.
Where no case ran, no record is written. Recount the summary from `Results`, then offer
`atk:qa --bug <record>` for the defects.

## Output

| Artifact | Path | Group, per `shared/artifact-paths.md` |
|----------|------|---------------------------------------|
| Run record | `docs/records/test-runs/<YYMMDD-HHMM>-<ticket-or-slug>-ids.md`, never written over | record, committed |
| Evidence | `docs/records/test-runs/<record name>/`, beside the record, `<record name>` being its file name without `.md`; held until confirmed in `docs/derived/run-cases/<run-id>/evidence/` | committed with it, once confirmed |
| Triage report | `docs/derived/run-cases/<run-id>/triage.md` | derived |
| Run log | `docs/derived/run-cases/<run-id>/run-log.md` | derived |

`<run-id>` is `<YYMMDD-HHMM>-<slug>-<handle>`, the time the run started, the cases file's slug, and the
code host handle of the person who started it from the `Team` section of the profile, or their
initials, so two people starting the same minute on two machines never share a directory or a
marker; the next free suffix, `-2`, `-3`, covers the same person twice in one minute. `--out` moves the
record, and its evidence directory moves with it; a path that already exists is never written over and
takes the next free suffix, as `skills/qa/references/test-run.md` requires. The record
opens with the shared front matter block and its `## In short` section follows
`shared/plain-writing.md`, as the shape it reuses already requires. Committing the record and its
evidence is `atk:git`'s, after the QA lead has said where a record naming a security defect lives,
which holds back the evidence directory and this run's `docs/derived/run-cases/<run-id>/` with it, per
The record in `references/execution.md`.

## Ticket

This skill writes nothing to the tracker. The record's `ticket` is the cases file's ticket, or `none`.
Its defects become issues only through `atk:qa --bug <record>`, which shows the list first, per
`shared/ticket-adapters.md`, and a fixed defect is confirmed through `atk:qa --retest`. Moving a
ticket into or out of testing is the QA lead's act, never this run's.

## Definition of done

- [ ] The target was a test plan row whose kind is staging or development, confirmed by the person; a
      production or local target, or a row with no named owner, stopped the run before any request.
- [ ] No case that changes data the run did not create, and no case submitting wrong credentials, was
      automated; no account reached its lock threshold, and none was tried again after a failed
      login where the threshold is `TBD`.
- [ ] Every case in the file but the removed rows has a triage verdict, every `SEMI-2` and `SEMI-3`
      case in scope a named person, and the triage report was written before the scope question.
- [ ] No case ran before the person answered the scope question, and none was left out except by
      their choice.
- [ ] Every `Passed` and `Failed` was observed in this run against the case's own expected result;
      every failure was re-run once, in its round, from a clean state; nothing unresolved was
      written as `Passed`.
- [ ] No more than three rounds ran; every case attempted and still unresolved is `Pending` with a
      concrete reason; deferred cases are listed in `In short` and are neither rows nor counted.
- [ ] The record has the shape and path of `skills/qa/references/test-run.md`, `status: IN REVIEW`,
      the host agent in `Run by` and `Tester`, the QA lead as approver, and its summary recounted
      from `Results`.
- [ ] No credential, one-time code, or real person's data is in the record, the triage report, the run
      log, or a screenshot, and no screenshot reached the record without the person confirming it.
- [ ] Nothing about one project, its stack, its login provider, its thresholds, or its file formats,
      was taken from anywhere but the test plan, the profile, the code, or the person.
- [ ] Every record the run created was deleted by its identifier or kept with the reason, and the
      browser session this run opened is closed.
- [ ] A local target was refused and named as `atk:verify`'s.
