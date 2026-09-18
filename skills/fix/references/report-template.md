# Fix report template

Loaded by `atk:fix` in step 5. The reader is a reviewer who was not part of the investigation and
who has to decide whether to approve the change. Everything here exists so they can check a claim
rather than trust one.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Fix: <one line, the failure, not the change>"
status: IN REVIEW
owner: <the person who made the fix>
approver: <the reviewer, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <bug URL or id, or none>
---
```

`status` opens at `IN REVIEW`, never `APPROVED`. The approver is a person, taken from the Team
section of `.atk/profile.md` or asked for; when neither gives one, `TBD` naming who can assign a
reviewer, per `shared/team-roles.md`. Under `--investigate-only` the status is `DRAFT`, because
there is nothing to approve yet.

## 1. Symptom as captured

The verbatim block from step 0: the error or failing assertion, the reproduction steps, expected
against actual, and the environment. Unedited, including the parts that turned out to be irrelevant.

Editing this section after the cause is known is the most tempting and most damaging change to the
report, because it converts a record of what was seen into a summary of what was concluded.

## 2. Root cause

One sentence naming the mechanism, then the location as `path:line`, then every other file in the
trace. The mechanism, not the symptom: "the list renders before the fetch resolves", not "the list
is empty".

## 3. Evidence

One of the three accepted forms from `references/investigate.md`, verbatim. A red test goes in with
its name and its failure output. A reproduction goes in with its command and its output. Quoted
lines go in with the check that shows they produce the behaviour.

This section is never a summary of the evidence. It is the evidence.

## 4. Why it surfaced now

The commit that made it reachable, with hash and subject, or the sentence that it has been broken
since it was written and which path never exercised it.

## 4b. Recorded intent, and the conflict when there is one

What step 6 of the investigation found, or the sentence that nothing was found and where it was
searched.

When it found a decision that contradicts the requested behaviour, this section carries the four
parts the gate demands and the report goes no further: the decision with its source as `path:line`,
a test name, or a commit; the concern raised now; the trade-off; and the two to four options, each
with its cost. The report then stops here and waits for the person who owns the decision.

## 5. The change

**Skipped under `--investigate-only` and when the conflict gate stopped the work.** There is no
change to describe, and a section with a plan in it reads like a change that was made.

What changed, in one paragraph, and why this is the smallest change that removes the cause. Where a
wider change was needed, what forced it.

Then one line for the tidy step per `shared/host-capabilities.md`: what the clean-up changed inside
those lines, or that it changed nothing, or that it was reverted and why, or that the harness has no
such capability. A reader comparing the diff against "the smallest change" needs to know which lines
came from the fix and which from the clean-up after it.

## 6. Verified

**Skipped under `--investigate-only` and when the conflict gate stopped the work**, for the same
reason.

Per layer: the command run, taken from `.atk/profile.md`, and what its result proves. Include the
re-run of the captured reproduction, showing it no longer reproduces.

A pass is reported as what it covers, not as "tests pass".

## 7. Not verified

What could not be checked, and why. An infrastructure change that only had its syntax validated
belongs here, as does a caller that has no test and was not exercised by hand.

An empty section here is a strong claim. Write it only when every caller in the blast radius was
actually run, and say so in those words.

## 8. Blast radius

Every other caller of the changed code, as `path:line`, each marked exercised or not. This is the
list section 7 draws from, and the first thing a reviewer will check against the diff.

## 9. Left for later

Anything found during the investigation and deliberately not done: the second bug, the refactor the
file needs, the missing test elsewhere. One line each, with enough detail to become a ticket.

An empty section is fine and common. A section used as a place to put work that this fix actually
needed is not.
