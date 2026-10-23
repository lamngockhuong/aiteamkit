# Review and fix loop

The loop that runs the team review against a skill's own change, and the ceiling that stops it from
hiding a design problem under patches. Referenced from `skills/<name>/SKILL.md` as
`shared/review-fix-loop.md`, which is `../../shared/review-fix-loop.md` relative to a skill file.

Cited by `implement` and `fix`, each once its change is written, verified, and tidied, and by
`orchestrate`, which runs the loop on each code job it has committed, the jobs run with `--no-review`.
Each keeps its own verification step and its own record; where this file says "the record" and "the
verification", it means the calling skill's. For `orchestrate` they are the implementation record
the code job wrote into the run directory, or, for an `atk:fix` job whose fix report is already
committed, the run state, never a committed file; either names the coordinator's review reports.
The verification is that job's own, re-run by each fix job.

Nothing here defines what a review looks for or how severe a finding is. `atk:review` owns the
checklist, the severity scale, and the breadth, and it reads the project's rules through
`shared/review-checklist.md`. A list of check items appearing in this file would be a second source
of truth for the same rules, and two sources of one rule drift apart quietly.

## The loop

```
[call atk:review] -> [classify] -> [fix BLOCKING and SHOULD FIX] -> [re-verify] -> [call again]
  -> after the second call's fixes: [re-verify] -> [closing read, nothing fixed after it]
```

At most twice, then one closing read of what the second round fixed, per The closing read below.
The second pass is there because a fix can introduce a finding; a third pass is there because the
first two did not work, which is a different problem from the one more fixing solves.

The second call reviews the fix, not one round picked because it raised the finding and not the
whole change again. The change is still uncommitted at this point, so nothing in git marks where the
first review stopped, and the call has to say it: in the prompt, name the first report's path as the
earlier report, never as a path to review, and list every file the fixes touched. `atk:review`
takes that list and what it reaches, per Called again after a fix in
`skills/review/references/review-rounds.md`. The record says which rounds ran the second time.

## Calling the review

Say what the review will cost before calling it: the band the change falls in, and the round runs
and agents that band asks for, per `skills/review/references/review-rounds.md` and the stated-total
rule in `shared/host-capabilities.md`. Add what the tidy step already spent. A person who sees the
number can take it, ask for a deeper review under `--parallel`, or say the change is small enough to
read by hand; a person who does not see it finds out when the session stops halfway through.

A change that alters a public contract moves its reference document before the first call, per the
first step of `shared/finalize-steps.md`, rather than at the finalize step. The review then reads
the document beside the code, and can check that what it says holds, per The sync obligation in
`shared/spec-docs.md`; a document moved after the review is one no review ever read. Where the
document cannot move now, the one line that step asks for, what is stale and who will fix it, is
written before the call too. There is no pull request yet for the review to find it in, so it goes
to the review with the intent, and a deliberate skip is not reported as a missing document. A
document in another repository, usually the parent of a member repository, is not in the change's
diff, so the call names its path and a second `diff.patch` of that repository, written with
`mask --worktree` of `shared/secret-scan.md` run there, and the record says which document moved
and where. That scan takes the whole working tree, so the caller looks at it first and, where
anything besides the document changed, names the document as the only part of the change. Otherwise the review never reads the sentences it
exists to check.

Call `atk:review` on the change, and give it what it needs to review against intent rather than
style: the ticket or the plan, the design document when one exists, the acceptance criteria the
work was built to, and any stale-document line from above. For a fix, that is the defect, the proven
cause, and what the report will leave for later, since the review checks the change against what it
claims to do and what it admits it does not. Its first step is establishing intent, and a review
with no stated intent is a style check.

A record drafted before the call, as `atk:fix` drafts its report, is named as intent and never as a
path to review; `atk:review` then keeps it out of the count and the rounds, per
`skills/review/references/review-rounds.md`. Its captured output still reaches every reviewer agent
through Read, outside the masked diff, so once it is written run `mask --worktree` of
`shared/secret-scan.md`: a line of the draft that `masked.txt` names is masked in the draft itself,
per rule 9 of `shared/team-roles.md`.

A person who declines the review once its cost is stated, and a call that ends without writing a
report, leave the record where `--no-review` leaves it, below. Neither counts as a round.

Do not pass `--strict`. That flag widens the review to stylistic findings, and this loop deliberately
does not act on those.

The reviewer is still a person. This call finds what a careful pass finds before a colleague spends
their time on it; it does not stand in for the colleague, and the record never presents it as an
approval.

## What gets fixed

| Severity | In this loop |
|----------|--------------|
| `BLOCKING` | Fix it, or escalate it. There is no third option |
| `SHOULD FIX` | Fix it, in the narrowest form below, unless it is genuinely separate work, in which case record it as carried forward with the reason |
| `NIT` | Never fixed here. Never blocks. Leave it for the author and the reviewer |

The `NIT` rule is not laziness. A loop that silently applies preferences makes the diff larger for
reasons no one agreed to, and buries the findings that mattered among them.

A fix here is the smallest change that removes the finding. The loop is not the place for a
refactor: a wider change made while responding to a review arrives after the verification that
covered the original change, which is the worst moment available for it.

On a rule written for an agent, the smallest change is the first of the three forms in
`skills/review/references/report-format.md` that removes the finding: correct the false sentence,
then remove or leave out a clause that guesses at a state the default of rule 5 in
`shared/team-roles.md` already answers, then add a rule. A false sentence that is itself such a
guess, where the default is right for its state, is removed rather than rewritten. Leaving to the
default applies only to a rule an `atk` run follows; a project's own agent file has no such default.
A suggested fix is a suggestion: the record names the form each fix to an agent rule took, and
where the fixer takes another form than the finding's `Fix` line, says why. A form that changes no
text, or that rests on the default being right where the finding says it is wrong, is not a fix but
a dispute, per Disputing a finding below. Adding a rule is the form for a default that is wrong in an
ordinary case, or in any case whose consequence is one of the five of step 6 of
`skills/review/SKILL.md`, or, on an agent file rule 5 does not govern, for a state that needs an
answer the file does not give; an `edge` finding kept for its consequence is fixed, not disputed. A
fix that adds a rule names the states that rule opens and weighs them before it lands, since each
one is what the next round finds. A fix that grows a file every run reads, `shared/team-roles.md`,
`shared/run-trace.md` or `shared/artifact-paths.md`, writes that file's size before and after in
the record.

## Disputing a finding

Not every finding is right. A finding the author believes is wrong is not fixed and not quietly
dropped: it goes to the Tech Lead, who holds the final call on a disputed blocking finding per
`atk:review`'s Roles section, with the finding, the reason it is disputed, and what the author would
do instead.

The work waits on that answer where the finding is `BLOCKING`. It carries on where the finding is
`SHOULD FIX`, with the dispute recorded.

A dispute never changes the severity. The finding stays at the severity `atk:review` gave it, with
the dispute beside it: lowering a `BLOCKING` to `SHOULD FIX` so the work can carry on is the move the
ceiling below forbids, reached by a different road. That holds most of all when the reason is that
the finding contradicts a decision already recorded in the plan or a design document. `atk:review`
labels that case with the decision and the person who made it, and the answer is theirs, not the
author's.

Waiting means what it means after an escalation: the finalize step goes as far as the commit and stops, per
`atk:git --commit`, so nothing is pushed, opened, or merged. Say so to the user in plain words, with
the finding, the reason it is disputed, and who has to answer. A user who
is told only that a dispute was recorded, and then asked whether to push, is being asked a question
the skill has already answered.

## Re-verify after each round

Every round of fixes goes back through the calling skill's verification step before the review is
called again, and for `atk:fix` the captured reproduction is re-run with it, by `orchestrate`'s fix
job too, whose prompt names the fix report that holds it. Not the full order every time: the
narrowest check covering what the fix touched, the layer,
and the blast radius if the fix widened it.

Fixes made after the second call are re-verified the same way, and then read once more, per The
closing read below.

A fix that was never re-verified is a change nobody has run, arriving at the end of the process when
attention is lowest.

## The ceiling

Two rounds. Still `BLOCKING` after the second, the loop stops and escalates. It does not try a third
time, and it does not lower a finding's severity to get past it.

The escalation says five things:

1. What remains, each finding with its file and line and the severity `atk:review` gave it.
2. What was tried in each of the two rounds, and what changed as a result.
3. Why the author believes it is still failing: a fix that does not hold twice usually points at the
   design, not at the code.
4. What the skill recommends, as options rather than as a decision.
5. The name of the person who has to look, from the Team section of `.atk/profile.md`.

The fifth is the one that decides whether the escalation works. "This needs another look" reaches
nobody. Rule 1 in `shared/team-roles.md` applies here as anywhere: an owner is a person.

Nothing is pushed, opened, or merged after an escalation. The finalize step commits the change on its branch
through `atk:git --commit` and stops there, because the commit stays inside the local repository per
the consent line in `shared/finalize-steps.md`. The named person is given the findings with their
file and line and the path of the review report, since a branch nobody pushed is readable only on
the author's machine.

## The closing read

Fixes made after the second call are read once more by `atk:review`, and nothing is fixed after that
read. It is a review, not a third round: the ceiling above still counts two rounds of fixing, and the
read neither adds one nor resets the count.

It runs once those fixes pass the re-verification above, given what the second call is given: the
files the fixes touched, the second call's report named as the earlier report and the first beside
it as history, neither as a path to review, per Called again after a fix in
`skills/review/references/review-rounds.md`. Its cost is said first, as in Calling the review. A
person who declines it, and a call that ends without writing a report, leave those fixes not read:
the record marks each as fixed and not reviewed again, says why and, for a decline, who declined,
and lists it among what was not verified.

What it finds is recorded, never fixed:

| Severity | After the closing read |
|----------|------------------------|
| `BLOCKING` | Escalates as The ceiling says, beside any finding the second round left, and the finalize step stops at the commit |
| `SHOULD FIX` | Carried forward, with the closing read as the reason |
| `NIT` | Recorded, as in the rounds |

A finding the author believes is wrong goes as Disputing a finding says, and is still not fixed.

No closing read runs when nothing was fixed after the second call, including a loop that never
reached one, or under `--no-review`, below. The record then says there was nothing to read. A resumed
run that finds a closing read in its progress log does not run it again.

The record carries a section, After the last round, ahead of everything but its `In short`, so the
reviewer reads it first. It lists each fix made after the second call with its finding ID, its
`path:line` range, its form, and what the closing read found in it, or that it was not read and why.
Fixes that added a rule come first, each naming the states that rule opens, since each one is what a
reader finds next. With no such fix, the section is one line saying so; under `--no-review` it holds
the line that section below asks for. It also names the closing read's report path and its counts by
severity, apart from the two rounds.

## When the loop comes out clean

A clean loop means no `BLOCKING` finding remains. It does not mean anybody has seen the change run.
Everything verified up to this point was verified by the suite, and the suite is a set of checks
somebody wrote earlier against what they expected.

So the loop hands over to `atk:verify`, which starts the application and asserts the side effect in
real data. Offer it, with what to verify and against which acceptance criteria, or for a fix the
captured reproduction and the blast radius, and record whether it ran. Work that goes to a reviewer having never been run is worth
flagging as exactly that, in the record, where the reviewer can see it.

The handoff is an offer and not an automatic step, because `atk:verify` starts processes and writes
real side effects, and `shared/finalize-steps.md` holds the rule about acting on an assumed yes.

## Under `--no-review`

The loop does not run, and neither does the closing read. The record says so in its own line: that
the review was skipped, that the change is unreviewed, and who must review it before merge. Where
the caller reviews the change itself, as `orchestrate` does for its jobs, that caller adds the path
of its review report beside the line.

The flag exists for the case where a review is already arranged through another route, not as a way
to move faster. A skipped review that leaves no trace is indistinguishable from one that was
forgotten, and it is the record, not the intention, that the next person reads.
