# Runtime checks

Loaded by `atk:verify` in steps 1, 2, 3, and 5. It answers five questions: whether the data the
application reads matches the branch, how to bring the application up, how to exercise it, how to
assert that something really happened, and how to put the machine back the way it was found.

Every command in this file is a blank. The real one comes from the `Verify` and `Commands` sections
of `.atk/profile.md`, which is per project. A tool name or a port number written into this file would
be right for one repository and wrong for every other, and would be copied anyway because a written
command looks authoritative.

## The data store before anything starts

A local database that has not had the branch's migrations, or holds an older revision of a table
the change adds, fails in a way that looks like the change. So the first command of the profile's
`Prepare` line, the read-only one, runs in step 1, before any process starts.

When it reports that the store matches, nothing is prepared. When it reports a mismatch, the run
stops and asks, every time. It shows what differs, which stores the `Shared stores` line says
other sessions read, and these options:

- run the rest of `Prepare` against this store, when the person answering says no other session
  depends on its current state;
- point the run at a separate store the person sets up or asks this run to create, which is then a
  resource this run created, per the section below;
- stop here, and record the mismatch as the reason nothing was verified.

It never migrates, seeds, or grants on its own judgement, because the store may be the one another
worktree is running against, and a migration applied under it is not undone by stopping this run.

Where the profile has no `Prepare` line, the check does not run and is not improvised: the report
says in Not verified that the data store's state was not checked, and names `/atk:init --audit` as
what adds the line.

## Fixtures for one case

Some cases need data the change only reads: rows a batch outside the change writes, or a
soft-deleted record for the filter to exclude. Writing them is setup, not tampering, when all three
hold: it happens before the first request of the run, into a store the run may write per the
section above, and every write is listed in the report with its command. Writing after a request,
to change what an assertion sees, is tampering whatever the reason, and is what step 3 forbids.

A fixture is the one command of a run that may come from outside the profile, since no profile can
list the rows each case needs. It still comes from the project's own shape: the table's schema, a
factory the tests use, a seed file.

## Starting

Start in dependency order, and treat each step as unfinished until its readiness signal appears.

1. **Data and infrastructure first.** Whatever the application connects to on startup. An application
   started before its dependencies produces a failure that looks like the change and is not.
2. **The application.** The start command from the profile.
3. **Anything that consumes in the background.** Workers and schedulers, when the case under
   verification depends on one. A queue assertion against a system with no consumer running proves
   only that the message was enqueued, which is worth writing down as exactly that.

Record the command, the PID, and the port for each, as `## Process management` in `SKILL.md`
requires. Record them as they start, not at the end from memory.

## Knowing it is ready

The profile names the signal: a log line, a port accepting connections, or a health endpoint
answering. Use it, with a timeout, and state the timeout in the report.

A start command that returns is not a signal. Neither is a fixed sleep: a sleep long enough to be
safe on a slow machine wastes minutes on every run, and a sleep short enough to be quick is a flaky
run waiting to happen. A timeout that expires is a failure of this run and is reported as one, with
the last lines of the log attached. It is not retried silently, because an application that took
twice as long as usual to start is itself a finding.

## Capturing logs

Start the capture before the application, not after the first failure. The lines that explain a
startup failure are the ones printed before anybody thought to look.

Keep the whole log for the run, and quote from it rather than summarising it. Note the point in the
log where each case begins, so a reader can line up an assertion with what the application was doing
at the time.

## Exercising

Send the real request or perform the real interaction, using whatever the profile names for the job.
Record, for every case: what was sent, in full, including headers and payload where they matter; and
what came back, in full, including the status.

Then assert. What came back is context for the assertion, not the assertion.

## The three assertion shapes

| Shape | How it is read | It proves | It does not prove |
|-------|----------------|-----------|-------------------|
| Data | The read-only check command from the profile, run before and after | The record exists, with the values asserted, and did not exist before | Anything about rows the check did not select, or about what another request would see |
| Queue | The consumer log, or the queue's own read-only inspection | The message was produced, with the payload asserted | That it was consumed, unless a consumer was running and its effect was asserted too |
| Log | A search of the captured log for the line that should appear, and for the classes of line that should not | The application reached that point, and that no error of the named class was raised | That nothing went wrong quietly. A missing error line is weak evidence on its own |

Before and after matters for the data shape. A row that was already there proves nothing about this
run, and "the query returns a row" is the single most common false pass in this whole skill. Run the
check first, keep the result, run it again after, and report the difference.

The log shape is the weakest of the three and is never the only assertion for a case that writes
anything. It earns its place for the cases where the observable effect really is a log line, and as
the second assertion that catches the error the happy path swallowed.

## Cases with no side effect

Some cases genuinely have none: a read endpoint, a validation rejection, a screen that only displays.
For those, the assertion is on the response content against the expected values, and the report says
in that case's own line that it has no side effect and why. What is not allowed is silence, which
reads identically to an assertion that was forgotten.

A validation rejection has a second assertion available and worth making: that nothing was written.
Run the data check and show the count unchanged. A rejection that returns the right error while still
writing the row is a real defect and it passes every check that only reads the response.

## Cleaning up

In reverse order of starting, using the cleanup command from the profile. Then confirm, with the same
inventory command used before the run started, and put both results in the report.

Cleanup runs even when the run failed, even when it escalated, and even when the verification was
abandoned at step 1. The only reason to leave a process running is that the user asked for it to be
left for their own inspection, and then the report says which process, on which port, and how to stop
it.

Data written during the run into a store only this run uses is left where it is unless the profile
says how to remove it. Deleting rows to tidy up is a write against real data on a judgement this
skill does not get to make, and the rows are usually the evidence.

A store another session reads is different, because what this run left there is served to that
session: a cache entry shared across users, an object in a bucket another worktree lists. For each
cache or bucket the `Shared stores` line names, list its entries before the first request, list them
again after the last, and remove exactly the entries that appeared in between, by name, with the
removal command from the same line. Then list once more and put all three listings in the report. An
entry that was there before the run is never removed, even when it looks like debris. Where the
application writes to a store the line does not name, the report says so in Not verified rather than
guessing at a removal command.

A shared database cannot be handled that way, because nothing lists every row of every table, and a
removal chosen from a partial listing deletes another session's data. So a case that writes to a
database the `Shared stores` line names, a fixture included, is not run until the user answers,
asked once before the first such case with the cases listed. The options:

- run them and leave the rows, each case's rows named in the report so the owner of the store can
  remove them;
- point the run at a separate store, per the data-store section above;
- skip those cases, each recorded in Not verified with this as the reason.

A resource the run itself created, a database, a container, a bucket, a file outside the working
tree, is recorded like a process as it is created: what it is, and the command that removes it. At
cleanup it is either removed, or left in place as evidence with that command printed in the report.
One that nobody wrote down is left behind for good.
