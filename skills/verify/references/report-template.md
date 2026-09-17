# Verification report template

Loaded by `atk:verify` in step 5. The reader is QA, or the reviewer, or the person who picks this up
next week: someone who was not watching the screen while the run happened and has to decide how much
of it to believe. Every section exists so they can check a claim rather than trust one.

The same template is used whether the run passed, failed, or hit the ceiling. A report that only
appears when something went wrong turns its own existence into the finding.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Verified: <what was verified, not what was fixed>"
status: IN REVIEW
owner: <the person who ran it>
approver: <the person in QA who accepts it, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL, or none>
---
```

The approver is a person, taken from the `Team` section of `.atk/profile.md` or asked for; when
neither gives one, `TBD` naming who can assign them, per `shared/team-roles.md`. Writing `QA` there
is writing a role, and a role approves nothing.

`status` opens at `IN REVIEW` and never at `APPROVED`. This skill produces evidence; approving it is
somebody else's act. Where the run escalated, the status is `DRAFT` instead, because the work is not
finished and a reader who sees `IN REVIEW` will assume it is.

## 1. What was verified, and against what

The change or feature, and the criteria it was checked against, quoted rather than referenced:
acceptance criteria from the ticket, the plan, or the implementation record. Where the criteria were
given in the prompt and exist nowhere else, say that, because it tells the reader that this list was
not reviewed by anybody before the run.

Anything in scope that was deliberately not verified goes here too, with the reason, rather than in
section 6. Something excluded on purpose is different from something that could not be checked.

## 2. Environment

The result of the local-only check from step 1, with the command and its output. This is first
because it is the section that stops a reader worrying that these assertions were made against a
shared environment.

Then the processes started, one row each: command, PID, port, and what the readiness signal was and
how long it took.

## 3. Cases

One block per case. Each block holds:

- **Sent**: the request or the interaction, in full.
- **Received**: the response, including the status, or the screen.
- **Asserted**: the side-effect assertion, its shape from `references/runtime-checks.md`, and its
  before and after where the shape is data.
- **Result**: pass or fail, and for a fail, what the difference was.

A case with no side-effect assertion says so in its own **Asserted** line, with the reason. This is
the line the whole report is built to make visible: a case whose evidence is a status code is either
a read, or it is unverified and pretending otherwise.

## 4. Screens

**Only under `--ui`.** Per screen: the widths checked, the states checked, the reference compared
against, the screenshots, and the differences found. Differences judged not to count are listed too,
with the judgement, per `references/ui-checks.md`.

Console output belongs here: every error, the warnings that name the change's own code, and the
pre-existing warnings with the evidence that they are pre-existing.

## 5. Rounds

How many rounds of fix and retry ran, out of three. For each: what failed, what one change was made,
and what happened on the retry.

Write this section even when the answer is zero rounds. "Passed on the first run" is information
about the change, and a missing section reads as a forgotten one.

Where the ceiling was hit, this section carries the four parts of the escalation from step 4 of
`SKILL.md`, ending with the name of the person who has to look. The report then stops here: no
conclusion, no recommendation dressed as a result.

## 6. Not verified

What could not be checked, and why. A queue with no consumer running, a screen with no design to
compare against, a case whose data could not be set up, a path that needs an integration this machine
cannot reach.

An empty section here is a strong claim. Write it only when every case in section 1 was actually
exercised and asserted, and say so in those words.

## 7. Cleanup

The cleanup command, its result, and the post-run inventory showing nothing is left listening. Both
halves. "Cleanup ran" and "nothing is left" are different claims, and only the second is worth the
reader's trust.

Anything deliberately left running, why, and how to stop it.

## 8. Found on the way

Anything noticed that is not this verification's to fix: a case nobody had thought to check, which
goes back to `atk:qa`; a second defect, which goes to `atk:fix`; a gap in the design. One line each,
with enough detail to become a ticket.

An empty section is fine and common. A section used to park something this run should have verified
is not.
