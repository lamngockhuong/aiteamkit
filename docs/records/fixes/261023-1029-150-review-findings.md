---
title: "Fix: the review of PR #150 at dcda24e, where an orchestrate job's leftovers had no road to the later issue offer"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-23
updated: 2026-10-23
ticket: https://github.com/lamngockhuong/aiteamkit/pull/150 (findings S1 and N1 to N6 of the review of PR #150, docs/derived/reviews/150-261023-1017.md)
---

# Fix: the review of PR #150 at `dcda24e`

## In short

Suppose `atk:orchestrate` runs an `atk:implement` job whose review carries a `SHOULD FIX` finding
forward. The job ends at its local commit and makes no issue offer, as AC 1.10 asks. Later the person
types `/atk:git` on that branch. At `dcda24e` nothing told them to name the job's implementation
record, so `atk:git` took the No artifact path, step 5 of `shared/finalize-steps.md` had no record
to read, and the offer said `N/A`, "no item to offer". The finding was lost at merge (S1). The close
of `atk:orchestrate` now names, per branch, each record to give `atk:git` as the artifact: the code
job's implementation record, or an `atk:fix` job's fix report, and the implementation record of
each fix job that addressed its review findings, the records by their copies in the coordinator's
run directory.

Six `NIT` items ride with it, one clause each where they are prose: `atk:git` still called the whole
ticket step `N/A` with no ticket (N1); the issue search's single quotes broke on an apostrophe (N2);
two definition-of-done lines could not be ticked when a person declined the closing read (N3); the
pull request body put After the last round above `In short`, against `review-fix-loop.md` (N4); no
check guarded the citers of the closing read and the offer (N5, now one check in
`tests/verify.sh`); and five "Cited by" lists missed `git` (N6).

Lam Ngoc Khuong decided at 10:35 to fix all seven, is the approver, and also confirmed the plan's
two items added during planning and moved the plan to `APPROVED`. Two review rounds and a closing
read ran on this change. Round 1 found that the first wording of the S1 sentence named the wrong
kind of job and left out the fix jobs' records; round 2 found the "or" placed so a fix report could
replace the fix jobs' records too. Both are fixed, and the closing read found nothing above `NIT`.
Seven `NIT` items are left for Lam Ngoc Khuong, the review's own N1 to N7.

## After the last round

One fix was made after the second review call, and the closing read covered it.

- `S2` of round 2, `plugins/atk/skills/orchestrate/SKILL.md:211-213`, form Correct: the fix report
  is now the alternative to the code job's implementation record only, and each fix job's record is
  named on its own. The closing read found `S2` closed and raised `N7` on the same lines, `NIT`,
  reach edge: the list can still be split as "(artifacts, record) or (fix report and fix-job
  records)", which on an `atk:implement` piece would drop the fix jobs' records. Not fixed, as the
  closing read requires.

Closing read: `docs/derived/reviews/fix-pr150-261023-closing.md`, 0 `BLOCKING`, 0 `SHOULD FIX`,
7 `NIT` (N1 to N6 carried, N7 new).

## Decisions taken before the fix

Asked at 10:35, answered by Lam Ngoc Khuong, Tech Lead and approver:

- S1 and N1 to N6 are fixed in this run, N5 as a check in `tests/verify.sh`.
- At 10:55, after round 1: S2 of that round is fixed by naming each fix job's record at the close,
  not by copying the records into one; an `atk:fix` job's carried-forward findings, which sit in the
  run state, are left for a later pull request.
- The open question of the review: both items `plan.md:22-30` added during planning, the
  `closing read` trace line and no assignee or label on a created issue, are confirmed, and the plan
  is `APPROVED`. The plan sits under `plans/`, which `.gitignore` excludes, so that edit is local and
  is not part of this change.

## S1. An orchestrate job's leftovers have no road to the later `atk:git` offer

### 1. Symptom as captured

From the review, verbatim:

```
A person who later types `/atk:git` on the branch takes the No artifact path (`pr-body.md:40-46`).
Step 5 then has no record to read, and the offer reports `N/A` with "no item to offer".
```

### 2. Root cause

The close of `atk:orchestrate` listed each branch's implementation record as one item among several
and never said it is the artifact `atk:git` must be given, so the step that offers its items cannot
find it: `plugins/atk/skills/orchestrate/SKILL.md:210-213` at `dcda24e`. The rest of the trace:
`orchestrate/references/job-prompt.md:47-52` (the job takes no hand-off to `atk:git`),
`git/references/pr-body.md:40-46` (No artifact), `shared/finalize-steps.md:119-123` (the skill that
wrote the record hands it to `atk:git` and makes no offer itself).

### 3. Evidence

Quoted lines with the check that shows them. At `dcda24e`, `orchestrate/SKILL.md:210-212`:

```
Close with the branches that wait for a push, each with its base, the order to push them in where one
is based on another, its artifacts, its implementation record, its review report, and who must say
yes to the push, per the consent line in
```

Check: `git show dcda24e:plugins/atk/skills/orchestrate/SKILL.md | grep -n "atk:git"` matches
`:41`, `:177`, `:269`, `:277` and `:291`: the scope line, a gate's edit, the proposal records, the
declined offers and the coordinator's commits. None names the record a later `atk:git` run is to
be given. `job-prompt.md:47-52` says the job "never runs `git add` or `git commit`, and its
skill's own hand-off to `atk:git` is not taken", and `finalize-steps.md:123` says the writing skill
"makes no offer of its own". No line between the job and the later `atk:git` run names the record.

### 4. Why it surfaced now

`dcda24e`, "feat: read the review loop's last fixes once more and offer its leftovers as issues",
moved the offer into `atk:git` and wrote AC 1.10's waiting state; the close it relies on predates it
unchanged (`main:plugins/atk/skills/orchestrate/SKILL.md:211`).

### 4b. Recorded intent

AC 1.10, `docs/records/requirements/261022-0900-left-for-later-tickets.md:144-146`: the items "stay
in its record for the person's later `atk:git` run to offer". The fix carries that out; nothing
recorded says the later run should go without the record.

## N1. `atk:git` calls the whole ticket step `N/A` with no ticket

### 1. Symptom as captured

From the review: "With no ticket, `atk:git` still says "report the step as `N/A`" and then runs the
offer."

### 2. Root cause

`git/SKILL.md:218-219` and its definition of done at `:269-270` kept the wording from before step 5
gained the offer; `finalize-steps.md:143-144` now makes only the comment and the move `N/A`.

### 3. Evidence

`git/SKILL.md:218-219` at `dcda24e`: "With no ticket behind the change, report the step as `N/A`",
followed on `:219-220` by "Then offer the record's left-for-later items ... as issues".

### 4. Why it surfaced now

`dcda24e` added the offer to step 5; the `N/A` sentence is unchanged from `main` (`:219`, `:269`).

### 4b. Recorded intent

`finalize-steps.md:143-144`: "Where there is no ticket, the comment and the move are `N/A`, and the
offer above still runs where there is a tracker". The fix follows it.

## N2. An apostrophe ends the search's single quotes

### 1. Symptom as captured

From the review: "Item words with an apostrophe, such as "author's", leave the quote unterminated."

### 2. Root cause

`shared/ticket-adapters.md:228-230` put the item's words inside single quotes with no limit on which
characters they hold.

### 3. Evidence

The rule at `dcda24e`: "inside single quotes and without the record's backticks, so the shell runs
nothing in them". In `sh`, `'a author's b'` ends the quote at the apostrophe; a second apostrophe
leaves the text between unquoted.

### 4. Why it surfaced now

`dcda24e` wrote Search open issues.

### 4b. Recorded intent

None found beyond the sentence's own aim, that the shell runs nothing; the fix keeps it.

## N3. Two definition-of-done lines cannot be ticked after a declined closing read

### 1. Symptom as captured

From the review: "A run cannot tick that when the person declined the read, which
`review-fix-loop.md:186-189` allows."

### 2. Root cause

`fix/SKILL.md:282-284` and `implement/SKILL.md:264-265` required that a fix made after the second
call "had the closing read", with no case for a fix left not read.

### 3. Evidence

`review-fix-loop.md:186-189`: "A person who declines it, and a call that ends without writing a
report, leave those fixes not read: the record marks each as fixed and not reviewed again, says why".

### 4. Why it surfaced now

`dcda24e` added both lines.

### 4b. Recorded intent

`review-fix-loop.md:186-189`, as above; the fix matches it.

## N4. After the last round placed above `In short` in the pull request body

### 1. Symptom as captured

From the review: "Puts After the last round "above the template's first section".
`review-fix-loop.md:205` puts it after the record's `In short`."

### 2. Root cause

`git/references/pr-body.md:55-58` named the template's first section as the anchor, which is
`In short` itself where the template opens with the record's summary.

### 3. Evidence

`review-fix-loop.md:205`: "The record carries a section, After the last round, ahead of everything
but its `In short`".

### 4. Why it surfaced now

`dcda24e` added the bullet.

### 4b. Recorded intent

`review-fix-loop.md:205`, as above; the fix follows it.

## N5. Nothing the repository runs guards the citers of the closing read and the offer

### 1. Symptom as captured

From the review: "Nothing the repository runs would catch a citer losing The closing read or the
offer."

### 2. Root cause

`dcda24e` added the citations without a check in `tests/verify.sh`, the repository's only suite.

### 3. Evidence

At `dcda24e`, `grep -n "closing read\|left-for-later" tests/verify.sh` prints nothing.

### 4. Why it surfaced now

`dcda24e`.

### 4b. Recorded intent

The review's own model is the existing "default of rule 5" phrase check, `tests/verify.sh:537-540`;
the new check copies its form.

## N6. "Cited by" lists of `review-fix-loop.md` miss `git` and `run-trace.md`

### 1. Symptom as captured

From the review: "Someone who changes After the last round and follows the list misses
`pr-body.md`."

### 2. Root cause

`dcda24e` added two citers, `git/references/pr-body.md:56` and `shared/run-trace.md:178`, and left
five lists unchanged: `CLAUDE.md:185`, both `codebase-summary.md:54`, both
`system-architecture.md:233-234`.

### 3. Evidence

`grep -rln review-fix-loop plugins/` at `dcda24e` lists `git/references/pr-body.md` and
`shared/run-trace.md`; none of the five lists names either.

### 4. Why it surfaced now

`dcda24e`.

### 4b. Recorded intent

`CLAUDE.md`, the shared-layer table, gives each file's citers; nothing says to leave one out.

## 5. The change (shared)

S1: the close of step 7 in `plugins/atk/skills/orchestrate/SKILL.md:210-214` names the records
`atk:git` is to be given, as one rewritten sentence, since the file is at 299 lines. It adds two
skill mentions, `atk:git` and `atk:fix`, so the skill-lifecycle count moved from 221 to 223 in
`docs/flow/skill-lifecycle.md:77`, `docs/vi/flow/skill-lifecycle.md:79` and the counts check in
`tests/verify.sh`. N1: `git/SKILL.md:218-219` and `:270-271`. N2: `shared/ticket-adapters.md:231-233`.
N3: `fix/SKILL.md:282-284`, `implement/SKILL.md:264-265`. N4: `git/references/pr-body.md:55-58`.
N5: one check in `tests/verify.sh`, after the rule 5 check. N6: `CLAUDE.md:185`, both
`codebase-summary.md:54`, both `system-architecture.md:235-236`. Each is the one clause its finding
named; none changes behaviour beyond what the finding asked.

Forms, for the rules an agent follows: S1 Add a rule (the close names the artifact; the state it
opens is the record's path after the worktree is removed, answered by the copy); N1 to N4 Correct;
review fixes: round 1 `S1` Correct, round 1 `S2` Add a rule (each fix job's record named, which opens
`atk:git` being given several records, left by the review to the default of rule 5), round 2 `S2`
Correct.

Tidy: run by hand per `shared/tidy-pass.md`, inside the touched lines only: the S1 sentence clarified
for a fix job and reflowed, the `pr-body.md` and `fix/SKILL.md` lines reflowed. Nothing reverted.

Reference documents: the fix changed no public contract; it changes skill rules and the kit's own
docs, all in the diff.

## 6. Verified (shared)

- `bash tests/verify.sh`, the Test command of `.atk/profile.md`: 78 lines, every one `OK`, after the
  last fix, including `OK closing read cited by fix, implement and orchestrate, leftovers offered by
  git` and `OK skill-lifecycle counts, 223 mentions in 125 pairs`.
- The new check was shown red on a probe, `fix/SKILL.md` with "The closing read" renamed, then green
  with the file restored.
- The checks kept beside their rules in `CLAUDE.md`: `ak:`, em-dash, `atkx`, `fill:#`, and
  `find plugins -type l`: no output.
- `wc -l`: `orchestrate/SKILL.md` 299, `fix/SKILL.md` 293, `git/SKILL.md` 279,
  `implement/SKILL.md` 272.
- The reproduction for S1 is reading: the close now names the record, and `pr-body.md:40-46`, No
  artifact, is no longer the path a person following the close takes.

## 6b. Reviewed (shared)

- Round 1, `docs/derived/reviews/fix-pr150-261023-r1.md`: 0 `BLOCKING`, 2 `SHOULD FIX`, 6 `NIT`.
  `S1` (the close named "a fix job's fix report"; a fix job writes an implementation record) fixed,
  Correct. `S2` (the fix jobs' records were not named) fixed, Add a rule, on Lam Ngoc Khuong's choice.
  `N1` to `N6` left as `NIT`.
- Round 2, `docs/derived/reviews/fix-pr150-261023-r2.md`: 0 `BLOCKING`, 1 `SHOULD FIX`, 6 `NIT`.
  `S1` closed. `S2` narrower (the "or" could drop the fix jobs' records on an `atk:fix` piece) fixed
  after the second call, Correct. `N1` to `N6` left as `NIT`.
- Closing read, `docs/derived/reviews/fix-pr150-261023-closing.md`: 0 `BLOCKING`, 0 `SHOULD FIX`,
  7 `NIT`. `S2` closed; `N7` new, recorded and not fixed.
- `atk:verify` was not offered: nothing in this repository runs, per the Verify section of the profile.

## 7. Not verified

- Every change here is a rule an agent reads; none was exercised by running `atk:orchestrate` or
  `atk:git`. The settling checks the reviews name, an `atk:orchestrate` run on a piece whose fix job
  lists an out-of-scope item followed by `/atk:git` on its branch, and `gh issue list --search` with a
  word starting with `-`, were not run.
- No CI gate runs content: `.github/workflows/` carries release-please and the labeler only, so
  `tests/verify.sh` run locally is the whole check.

## 8. Blast radius (shared)

- `orchestrate/SKILL.md` close: read by `## Output` (`:265-267`, not updated, `N1`), `references/proposal.md`
  and `references/worktrees.md` (consistent, checked by the reviews). Not exercised by a run.
- Step 5 of `shared/finalize-steps.md`, which reads the record given: unchanged; reviewed.
- `git/SKILL.md` and `git/references/pr-body.md`: wording only; `pr-body.md` follows `review-fix-loop.md:205`.
- `ticket-adapters.md` Search open issues: the one command it builds; not run against GitHub.
- `tests/verify.sh`: run in full.
- The five "Cited by" lists and the skill-lifecycle counts: checked by `tests/verify.sh` (counts) and by
  reading (lists).

## 9. Left for later

- S1, an `atk:fix` job: `shared/review-fix-loop.md:10-12` keeps the `SHOULD FIX` findings carried
  forward for an `atk:fix` job whose fix report is already committed in the run state, not in the fix
  report. Giving `atk:git` the fix report offers its section 9, but those findings stay in the run
  state, which step 5 does not read. Closing it means either writing them into the fix report or
  naming the run state as a second source in step 5. Lam Ngoc Khuong left it for a later pull request
  at 10:55.
- `N1` to `N7` of the review rounds, left as `NIT`: `## Output` of `orchestrate` does not list the
  records (`N1`); `pr-body.md:55-58` when `In short` is not the template's first section (`N2`); a
  search word starting with `-` (`N3`); the check lists in `CLAUDE.md` and both codebase summaries
  omit the new check (`N4`); no check guards the close's sentence (`N5`); long lines in
  `orchestrate/SKILL.md:211-214` with the file at 299 lines (`N6`); the close's list can still be
  split the wrong way (`N7`). Lam Ngoc Khuong decides which become work.
- N6, a further stale list found on the way: `shared/host-capabilities.md` cites
  `review-fix-loop.md` on `main` already, and the `CLAUDE.md:185` row does not name it. It predates
  this pull request.
- No reference document is owed: the change is to skill rules and the kit's own docs, and every
  file it moved is in the diff.
