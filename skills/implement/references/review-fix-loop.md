# Review and fix loop

Loaded by `atk:implement` once the change is written and verified. It holds the loop that runs the
team review against the skill's own output, and the ceiling that stops the loop from hiding a design
problem under patches.

Nothing here defines what a review looks for or how severe a finding is. `atk:review` owns the
checklist, the severity scale, and the breadth, and it reads the project's rules through
`shared/review-checklist.md`. A list of check items appearing in this file would be a second source
of truth for the same rules, and two sources of one rule drift apart quietly.

## The loop

```
[call atk:review] -> [classify] -> [fix BLOCKING and SHOULD FIX] -> [re-verify] -> [call again]
```

At most twice. The second pass is there because a fix can introduce a finding; a third pass is there
because the first two did not work, which is a different problem from the one more fixing solves.

## Calling the review

Call `atk:review` on the change, and give it what it needs to review against intent rather than
style: the ticket or the plan, the design document when one exists, and the acceptance criteria the
work was built to. Its first step is establishing intent, and a review with no stated intent is a
style check.

Do not pass `--strict`. That flag widens the review to stylistic findings, and this loop deliberately
does not act on those.

The reviewer is still a person. This call finds what a careful pass finds before a colleague spends
their time on it; it does not stand in for the colleague, and the record never presents it as an
approval.

## What gets fixed

| Severity | In this loop |
|----------|--------------|
| `BLOCKING` | Fix it, or escalate it. There is no third option |
| `SHOULD FIX` | Fix it, unless it is genuinely separate work, in which case record it as carried forward with the reason |
| `NIT` | Never fixed here. Never blocks. Leave it for the author and the reviewer |

The `NIT` rule is not laziness. A loop that silently applies preferences makes the diff larger for
reasons no one agreed to, and buries the findings that mattered among them.

A fix here is the smallest change that removes the finding. The loop is not the place for a
refactor: a wider change made while responding to a review arrives after the verification that
covered the original change, which is the worst moment available for it.

## Disputing a finding

Not every finding is right. A finding the author believes is wrong is not fixed and not quietly
dropped: it goes to the Tech Lead, who holds the final call on a disputed blocking finding per
`atk:review`'s Roles section, with the finding, the reason it is disputed, and what the author would
do instead.

The work waits on that answer where the finding is `BLOCKING`. It carries on where the finding is
`SHOULD FIX`, with the dispute recorded.

## Re-verify after each round

Every round of fixes goes back through `references/verification.md` before the review is called
again. Not the full order every time: the narrowest check covering what the fix touched, the layer,
and the blast radius if the fix widened it.

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

Nothing is pushed, opened, or merged after an escalation. The change stays committed on its branch,
where the named person can read it.

## Under `--no-review`

The loop does not run. The record says so in its own line: that the review was skipped, that the
change is unreviewed, and who must review it before merge.

The flag exists for the case where a review is already arranged through another route, not as a way
to move faster. A skipped review that leaves no trace is indistinguishable from one that was
forgotten, and it is the record, not the intention, that the next person reads.
