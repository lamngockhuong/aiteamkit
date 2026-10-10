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

When it reports that the store holds everything the rest of `Prepare` brings in, and no migration
the branch does not have, nothing is prepared. A store holding every migration of the branch and
one more from another branch is a mismatch, and has diverged in the sense below. A check that covers only part of it, a migration status that says nothing about seeds,
grants, or test logins, vouches for that part alone: the steps it does not cover are run only under
the same question as a mismatch. When it reports a mismatch, the run stops and asks, every time.

First it tells which kind of mismatch it is. A store that lags holds only migrations the branch also
has, and is missing some of the rest. A store that has diverged holds at least one migration the
branch does not have, usually applied from another branch by another worktree. Telling them apart
takes the identities of the migrations, not their number: a store with 77 applied against 81 on the
branch can be either. A check that returns counts alone cannot tell, so the store is treated as
diverged, and the report names `/atk:init --audit` as what gives the line a check that compares
identities.

It shows what differs, which stores the `Shared stores` line says other sessions read, and the
options for its kind. For a store that lags:

- run the rest of `Prepare` against this store, when the person answering says no other session
  depends on its current state;
- point the run at a separate store the person sets up or asks this run to create, which is then a
  resource this run created, per the section below;
- stop here, and record the mismatch as the reason nothing was verified.

For a store that has diverged, running the rest of `Prepare` is not offered at all, and the warning
below the no-`Prepare` options is shown in its place. The options are the three given there: a
command the person answering names, a separate store, or stop. The foreign migrations are listed by
identity, so the person can see whose branch they came from.

It never migrates, seeds, or grants on its own judgement, because the store may be the one another
worktree is running against, and a migration applied under it is not undone by stopping this run.

Where the profile has no `Prepare` line, the check does not run and is not improvised: the report
says in Not verified that the data store's state was not checked, and names `/atk:init --audit` as
what adds the line. A `Prepare` or `Shared stores` line that reads `TBD` is treated as absent, and
the person the `TBD` names goes into Not verified with it.

A mismatch can still show itself later without a `Prepare` line, as a case failing on a table or a
column the branch adds. That case stops, and the question above is asked with the options that
remain when there is no `Prepare` to run:

- run a command the person answering names to bring the store level, recorded in the report as a
  command a person gave;
- point the run at a separate store, as above;
- stop that case, and record the mismatch as the reason it was not verified.

The run does not put forward a migrate or a seed of its own from the project's scripts. Nothing says
the store's migration history comes from this branch, and a migration run over another branch's
history fails at best and half-applies at worst, under a store another worktree may be using.

### Before a preparation writes to a store the run did not create

Any preparation that writes to a store this run did not create, a migration, a seed, a grant, a reset
or a drop, whether the command came from `Prepare` or from the person answering, is preceded by a
backup of that store. The store's current state belongs to somebody, and a person who answered "no
other session depends on it" may be wrong about a worktree they forgot. A store the run created
needs none: its removal command is already recorded, per Cleaning up. A case writing its own rows
is not a preparation and needs no backup; A shared database under Cleaning up covers it.

- **The commands come from the profile or a person.** The backup and restore commands come from the
  `Prepare` or `Shared stores` line. Where neither gives one, the run asks for both before the write,
  and the report lists them as commands a person gave. Neither is written from this file.
- **The backup outlives the session.** It goes to a path the person answering names, never to a
  session scratchpad or a temporary directory removed when the session ends: a backup nobody can
  find tomorrow restores nothing.
- **The report carries both.** Section 2 of the report holds the backup's path and the command that
  restores it, a credential in either redacted as under Knowing it is ready, and Cleanup leaves the backup in place with that command printed, like a resource the
  run created.
- **The application can use the store before the first case.** Grants, roles, and extensions often
  live outside the migrations, and a reset drops them without a word. So after the preparation, and
  before the first case, the profile's `Data check` command runs with the connection the
  application itself uses, not an administrator's. A failure there is repaired as environment work,
  recorded in section 2, and is not a round of step 4. Skipped, it comes back as the first case
  failing with a permission error that looks like a defect in the change.

## Fixtures for one case

Some cases need data the change only reads: rows a batch outside the change writes, or a
soft-deleted record for the filter to exclude. Writing them is setup, not tampering, when all three
hold: it happens before the first request of the run, into a store the run may write, and every write is
listed in the report with its command. A store only this run uses may be written; a shared
database only after the question in A shared database under Cleaning up, which is asked before any
fixture for that reason. Writing after a request,
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

A start command that exits before the signal, naming a missing environment variable or a missing
configuration file, is a gap in this machine's environment rather than a failure of the change, and
it stops the run with a question. The run does not fill in values of its own, not even from the
project's example file: a sample value can point at a real service, or switch off the behaviour a
case is about. It shows which values are missing, where the project documents them, and these
options:

- start the process with the values the person names, for this process only, writing no file;
- the person sets the configuration up, and the run starts again from the local-only check;
- stop here, with the missing configuration as the reason nothing was verified.

Values supplied the first way go through the local-only check before the start is retried, since a
host or a key named in them is exactly what that check exists to catch. The report lists each by
variable name as a difference between this run's environment and the project's own, never by a
value that is a credential. The same holds for the start command the report records for the
process, and for every other command it records, the backup and restore commands of a preparation
included: a supplied value there is written `<KEY>=<redacted: kind>`, per rule 9 of
`shared/team-roles.md`, and a password inside a connection URL `<redacted: password>`, because an inline assignment is the ordinary way to pass it and the
report is committed, or posted on a pull request.

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
removal command from the same line. Then list once more. The report carries the number of entries
each of the three listings held and the names of the entries added and removed, never a full
listing: a shared cache runs to thousands of keys, and its key names routinely carry a session
identifier or an email. A name that carries a credential, a session identifier, or personal data is
written by its kind instead, `<redacted: session key>`, since the report is committed. An entry
that was there before the run is never removed, even when it looks like debris. Where the
application writes to a store the line does not name, the report says so in Not verified rather than
guessing at a removal command.

A mail catcher, or any other channel a login code or a confirmation link reaches the run through, is
a shared store whether the `Shared stores` line names it or not. Every session running against the
same local environment sends to it, and a code another session is waiting for sits in it. List its
messages before the request that sends the code, then read the code from a message that arrived
after that request, addressed to the account the case used. Where more than one such message
arrived, another session is logging in with the same account, and the run does not choose between
them: it stops that case and asks, since taking the other session's code spends it. Nothing is
deleted from it, neither to make room before the request nor at cleanup, and a message this run
caused is left as evidence: an extra message costs another session nothing, and a deleted one cannot
be sent again. The commands that list and read messages come from the `Shared stores` line; where
the line has none, the run asks for them before that request, and the report lists them as commands
a person gave. The report carries the number of messages each listing held and which message the
code was read from, never the code or the link itself.

A shared database cannot be handled that way, because nothing lists every row of every table, and a
removal chosen from a partial listing deletes another session's data. So a case that writes to a
database the `Shared stores` line names, a fixture included, is not run until the user answers. The
question is asked once, after step 1 and before any fixture is written or any request is sent,
with every case and fixture that writes to such a database listed. Asked later, it would come after
a request, and a fixture answered then would be written too late to count as setup. The options:

- run them and leave the rows, each case's rows named in the report so the owner of the store can
  remove them;
- point the run at a separate store, per the data-store section above;
- skip those cases, each recorded in Not verified with this as the reason.

A profile with no `Shared stores` line cannot say which database is shared, and treating that as
"none" is how a run writes into the store another worktree is using. So, at the same moment and in
the same question, the run names each database the cases write to and asks whether another session
reads it; one the user calls shared is handled as if the line named it. The report says in Not
verified that the profile has no `Shared stores` line, and names `/atk:init --audit`.

A resource the run itself created, a database, a container, a bucket, a file outside the working
tree, is recorded like a process as it is created: what it is, and the command that removes it. At
cleanup it is either removed, or left in place as evidence with that command printed in the report.
One that nobody wrote down is left behind for good.

## The progress log

A run of this skill keeps a progress log as it goes, per Progress log in `shared/artifact-paths.md`,
so a session that ends between rounds is resumed rather than started again.

Before step 1, resume or start fresh as that section says, the subject written as Progress log there
writes it: a module or a set of paths is the slug of a description.

Write an entry when the preflight passes, when the application is ready, after each case with its
result, and after each round of fix and retry, with the cause it addressed and the result of the
re-run. Each process and each resource the run starts goes into the log with its command, PID and
port, or the command that removes it, at the moment it starts, not only into the report.

On a resume:

- A run resumed after its third round goes straight to the escalation of step 4.
- The processes and resources the log records were started by this run, and only those whose command
  and port the inventory still shows as the log recorded them. The log holds the command masked
  under rule 9 of `shared/team-roles.md`, so the command the inventory shows is masked the same way
  before the two are compared: a raw `--password=` argument never equals its masked form, and the
  run's own process would otherwise be called somebody else's and left running. A PID or a port now
  held by another program is not this run's: it is reported and left alone, under the rule to stop
  only what this run started. One that still matches is reused only when `HEAD` is the commit the
  log started from and `git status` shows nothing changed since apart from the progress log and this
  run's report, since otherwise it serves older code; it is stopped and started again, and either
  way stopped at cleanup. One no longer running is noted as gone.
- The data store check of step 1 runs again. What the earlier session saw may no longer be true.

A fresh start chosen by the person counts from zero and treats nothing in the old log as its own:
a process that log recorded and the inventory still finds is reported to the person as left by an
earlier run, and is not stopped without their word.
