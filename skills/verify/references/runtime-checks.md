# Runtime checks

Loaded by `atk:verify` in steps 2, 3, and 5. It answers four questions: how to bring the application
up, how to exercise it, how to assert that something really happened, and how to put the machine back
the way it was found.

Every command in this file is a blank. The real one comes from the `Verify` and `Commands` sections
of `.atk/profile.md`, which is per project. A tool name or a port number written into this file would
be right for one repository and wrong for every other, and would be copied anyway because a written
command looks authoritative.

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

Data written during the run is left where it is unless the profile says how to remove it. Deleting
rows to tidy up is a write against real data on a judgement this skill does not get to make, and the
rows are usually the evidence.
