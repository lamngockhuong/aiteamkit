---
name: verify
description: >
  Confirm a change works by running the real thing: start the app the way the project starts it,
  exercise it with real requests, assert the side effect in the data rather than the status code,
  compare the screen against the design when asked, and stop after three rounds with a named person
  rather than patching indefinitely.
  Use when the suite is green and nobody has yet seen the feature work, before handing a ticket to
  QA, or before a release goes out.
  Triggers on: "verify", "verify this works", "kiểm chứng", "chạy thử thật", "test thực tế",
  "đối chiếu thiết kế", "動作確認", "実機確認", "画面確認", "/atk:verify".
argument-hint: "[module|paths|ticket] [--ui] [--report-only] [--out <path>]"
---

# Verify on the Running System (`atk:verify`)

Runs the thing and looks. A green suite proves that the checks somebody wrote still pass; it does
not prove that the record was written, that the job reached the queue, or that the screen renders
what the design says. This skill closes that distance, on the real application, with the commands
the project itself uses.

It has one built-in limit. After three rounds of fix and retry it stops and hands the problem to a
person by name, because a failure that survives three fixes is usually a design question wearing a
bug's clothes.

## Scope

Handles: starting the application the way `.atk/profile.md` says to start it, waiting for the
readiness signal, exercising the change with real requests or real interaction, asserting the side
effect in data, queue, and logs, comparing screens against the design under `--ui`, retrying at most
three times, escalating by name past that, and stopping every process it started.

Does NOT handle: writing the test plan or the test cases, which is `atk:qa` and happens before this
skill has anything to run; proving the cause of a defect (`atk:fix`); building the change
(`atk:implement`), whose layer verification runs the suite rather than the application; approving a
release (`atk:release`); or signing off that a feature is accepted, which is QA's word and never
this skill's.

The boundary with `atk:qa` is worth stating plainly, because both talk about testing. `atk:qa`
decides what should be checked and writes it down. This skill takes what is already agreed, runs it
against the running system, and reports what happened. A gap discovered here that nobody had thought
to check goes back to `atk:qa` as a new case, not into this report as a passing line.

## Roles

Dev runs this and owns the evidence. QA owns whether the criteria are met, and reads this report as
input rather than as a verdict. Tech Lead is the name the ceiling escalates to, and the person who
answers when the failure turns out to be a design question. SRE owns the environment when the run
turns out not to be pointed at a local one. See `shared/team-roles.md`.

## Invocation

```bash
/atk:verify <module>         # Verify one module or feature by name
/atk:verify <paths>          # Verify what the given files affect
/atk:verify <ticket>         # Verify against the criteria on a ticket in the detected tracker
/atk:verify --ui             # Also compare the screens against the design
/atk:verify --report-only    # Run and report, change no file, even when a fix is obvious
/atk:verify --out <path>     # Override the default output path
```

`.atk/profile.md` is required, and specifically its `Verify` section. The file alone is not enough:
this skill needs the start command, the readiness signal, where the logs go, the read-only data
check, the cleanup command, and the local-only test. Without them it would be guessing at how to
start somebody else's application, and a guessed start command that happens to exit zero is the
worst evidence this skill can produce.

Stop when either is missing, and use the matching sentence from `shared/project-profile.md`: the
first one when there is no profile, the second when the profile is there but its `Verify` section is
absent or still `TBD`. Change nothing, start nothing.

Where the shape names member repositories, the section's `Runs from` field says which repository each
block belongs to, and every command in that block runs from that repository's path. A block with no
`Runs from` in such a project is the same hole as a missing command: stop and send the user to
`/atk:init --audit`, because a start command run from the wrong directory fails in a way that reads
like the application being broken.

The `Commands` and `Layers` sections are read too, for the suite commands a retry re-runs and for
the names the report uses.

## Workflow

```
[1. Preflight] -> [2. Start and wait] -> [3. Exercise and assert] -> [4. Fix and retry, at most 3]
  -> [5. Clean up and report]
```

Before step 1, read `.atk/overrides/verify.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Preflight

Read the profile once. Establish what is being verified and against which acceptance criteria: the
ticket, the plan, the implementation record, or the criteria given in the prompt. Verification with
no stated criteria degrades into clicking around and reporting that nothing looked wrong.

Then the local-only check, before anything is started. The profile says how to be sure the run is
pointed at a local environment. Run that check and read the result. A host, connection string, or
endpoint that points anywhere off this machine stops the run: this skill sends real requests and
writes real side effects, and doing that to a shared environment is a real outage rather than a
failed test. Say what was found, and hand it to the person the `Team` section names for the
environment. A role with no name attached reaches nobody, and a team that has no SRE deletes that row
from its profile, so "tell SRE" can resolve to no one at all.

Take the process inventory here as well, per `## Process management` below.

### 2. Start and wait

`references/runtime-checks.md` holds the order: what to start, how to know it is ready, and how to
capture the logs from the first line rather than from the moment somebody thinks to look.

Never treat a start command that returned as a ready application. Wait for the readiness signal the
profile names, with a stated timeout, and report a timeout as a failure of this run rather than
retrying silently. An assertion run against an application that had not finished starting produces a
failure that costs an hour to understand.

### 3. Exercise and assert

Send the real request, or perform the real interaction. Then assert, and the assertion is the point
of the skill.

Every case carries at least one side-effect assertion: the row that should exist, the job that
should be queued, the file that should be written, the log line that should or should not appear. A
status code is not an assertion, it is the transport agreeing to talk. Where a case genuinely has no
observable side effect, the report says which case and why, rather than letting a `200` stand in.

The three assertion shapes, with what each proves and how each is read out of a running system, are
in `references/runtime-checks.md`. Data checks use the read-only command from the profile. This
skill never writes to data by hand to make an assertion pass.

Under `--ui`, `references/ui-checks.md` adds the screen comparison: the widths to check, how to
compare against the design, what counts as a difference and what does not, and the console errors to
capture while doing it. The same three-round ceiling covers the whole run, not one ceiling per mode.

### 4. Fix and retry, at most three rounds

A failed assertion may be fixed and retried. Three rounds, counted across the whole run, and the
count goes in the report whether or not it was reached.

Each round: one change addressing one identified cause, re-run the narrowest thing that covers it
per `shared/layer-verification.md`, then re-run the failed case in full. A round that changes several
things at once destroys the evidence about which one mattered.

Past the third round the run stops. The escalation carries four things and is not complete without
the fourth:

1. What was tried, round by round, and what changed each time.
2. What still fails, with the assertion and its output verbatim.
3. The evidence: the logs, the data check result, the screenshot.
4. The name of the person who has to look, from the `Team` section of `.atk/profile.md`.

"Needs further investigation" is not an escalation. Rule 1 in `shared/team-roles.md` applies here as
everywhere: an owner is a person.

Under `--report-only` no round runs at all. The first failure is reported as found, no source file is
touched, and `git status` proves it. The report itself is still written: that is the flag's output,
not a change to the thing under verification.

### 5. Clean up and report

Stop every process this run started, in the reverse order it started them, using the cleanup command
from the profile. Then confirm they are gone rather than assuming the command worked. Cleanup is
part of done, not an optional last step: see `## Process management`.

Write the report from `references/report-template.md`. It is the same report whether the run passed,
failed, or escalated. A run that found nothing still records what was exercised and what was not,
because that is what the next person needs in order to trust it.

Where a round changed code, tidy it first, with the host's code clean-up capability, `/simplify` in
Claude Code, per `shared/host-capabilities.md`. It covers only what the rounds changed, and the case
that was failing is re-run after it: a clean-up that puts that case back to red is reverted rather
than debugged, and the report says so. A run whose rounds changed nothing skips this and the
paragraph below with it.

Then close it by handing off to `atk:git`, like any other change the kit makes: the reference
documents the change owes, the branch, the commit, and the consent line that everything past the
commit has to cross, all of it the contract in `shared/finalize-steps.md`. A
verification that ends with edited files sitting in the working tree and no decision about them is
how a fix made at six o'clock gets committed by somebody else tomorrow, inside a commit about
something else. A run that changed nothing skips this and says so.

## Process management

This skill starts long-running processes, which makes it the one skill in the kit that can leave a
machine worse than it found it. These rules are binding rather than advisory.

**Work out the port before starting.** The profile does not carry one, on purpose: a port is a value
copied out of the application's own configuration, and a copy drifts. Read it from where the
application reads it, which is the `Start` command, the `Ready when` signal when that names a port,
or the configuration those two load. Put it in the report, so the next run recognises what this one
left behind.

**Take an inventory before starting.** Check whether something is already listening on that port,
with `lsof -i :PORT` or `ss -ltnp` on macOS and Linux, `netstat -ano` on Windows. An occupied port is
answered by identifying and stopping the stale owner, or by reusing it when it is the same
application. It is never answered by letting the application pick another port: that is how a machine
ends up with six copies of one application and no way to tell which one the browser is talking to.

Where the application chooses a port at random and nothing fixes it, say so in the report and
inventory by process instead. A port that changes every run cannot be used to recognise a leftover,
and pretending otherwise produces a check that always passes.

**Record what was started.** Command, PID, and port, for every process, in the report. A process
nobody wrote down is a process nobody will stop.

**Stop cleanly.** The profile's cleanup command first, then `SIGTERM`, and only then a hard kill.
Stop only what this run started. Anything else on the machine belongs to the user or to another
session, and this skill does not get to decide that it is stale.

**Confirm.** After cleanup, run the inventory again and put the result in the report. "Cleanup ran"
and "nothing is left" are different claims, and only the second one is worth writing down.

## Output

Written to `docs/records/verification/<ticket-or-date>-<slug>.md` per `shared/artifact-paths.md`, opening
with the shared front matter block. `--out` overrides the path.

The report holds: what was verified and against which criteria; the local-only check and its result;
the processes started, with command, PID, and port; per case, what was sent, what was asserted, and
the evidence; the side-effect assertion for every case, or the reason a case has none; the retry
count and what each round changed; what could not be verified and why; and the cleanup confirmation.
`references/report-template.md` has the sections and the reason each one exists.

## Ticket

Follow `shared/ticket-adapters.md`. The report is offered as the comment on the ticket, shown first
and posted on a yes, per the consent line in `shared/finalize-steps.md`. Do not move the ticket to
done or to any accepted state. This skill produces evidence; accepting it is QA's act, and the
distance between those two is the whole reason the kit separates the roles.

## Definition of done

- [ ] The `Verify` section of `.atk/profile.md` was present and complete, and the run stopped when it
      was not.
- [ ] The local-only check ran before anything was started, and its result is in the report.
- [ ] Every command that started, queried, or stopped anything came from the profile.
- [ ] The readiness signal was waited for, not assumed from the start command returning.
- [ ] Every case has at least one side-effect assertion, or a stated reason why it has none.
- [ ] No status code is reported as an assertion on its own.
- [ ] The retry count is recorded, and no run exceeded three rounds.
- [ ] A run that hit the ceiling escalated with all four parts, including a person's name.
- [ ] Code changed during a round was tidied per `shared/host-capabilities.md`, with the failing case
      re-run afterwards, and the report says what the clean-up changed or why it did not run.
- [ ] Code changed during a round went through `shared/finalize-steps.md`, and a run that changed
      nothing says so.
- [ ] A round that changed a public contract carried its reference document, per
      `shared/spec-docs.md`.
- [ ] Under `--report-only`, `git status` shows no source file touched.
- [ ] Every process this run started is stopped, and the post-run inventory confirming it is in the
      report.
- [ ] The report names what could not be verified and why.
