---
title: "Fix: the review of PR #153 at 4c67eae, where the findings walk left states with no rule"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-24
updated: 2026-10-24
ticket: https://github.com/lamngockhuong/aiteamkit/pull/153 (findings S1 to S16 and fifteen NIT of the review of PR #153, docs/derived/reviews/153-261024-0615.md)
---

# Fix: the review of PR #153 at `4c67eae`

## In short

Suppose an author pushes two commits after a review and runs `/atk:fix <pr-url> --findings`. The
`atk:catchup` call inside it offers to check out the reviewed commit, the author says yes, and at
`4c67eae` nothing switched back: the fixes were then made on the old commit (S1). The same walk had
other states with no rule. Answers to a review kept only as a local report had no thread to go to
(S2). A finding the newer review kept against the author's answer was never asked about again (S3).
`atk:git` could still move the fixes of an open pull request to a new branch (S4). A merged pull
request (S7), a non-author running the walk (S8), a report path given without the flag (S9), and a
local report naming no branch (S10) were left to the agent's guess as well.

Each now has a rule, written as one clause or sentence where the state is met: the checkout is
refused on a dirty tree and switched back (S1), the answers go into one pull request comment (S2),
a kept finding is walked again (S3), `atk:git` skips the name check on an open pull request's branch
(S4), a plain "explain the review on this PR" is read as `--findings` (S5), the security cap binds
the layer's scenario (S6), the pull request's state, branch and author are settled before the walk
(S7, S8, S10), and a report path without the flag gets the one question (S9). The others correct
text this change made false: the Fidelity exception (S11), the trace line (S12), who reads the
review report (S13), the `state-signals.md` route (S14), the catchup definition of done (S15), and
the check that ties the walk to the page (S16), which now also holds the four answer kinds (N20).
Fifteen `NIT` ride with them, one clause each.

Lam Ngoc Khuong decided at 06:35 which findings to fix and answered the review's open questions, and
is the approver. Six `NIT` are deferred to a follow-up issue (section 9).

## After the last round

Nothing was fixed after the second review call, so no closing read was owed. Round 1 found one
`SHOULD FIX`: the new-branch choice for a merged pull request was undone by the bullet *The branch*
and by Step 7, which still put the fixes on the head branch. It was fixed before round 2, form
Correct, in `findings-mode.md` (*The branch* names the branch the person chose; Step 7 carries a new
branch from the base as new work with its own pull request on a yes). Round 2 found it closed and
raised nothing above `NIT`.

## Decisions taken before the fix

Asked at 06:35, answered by Lam Ngoc Khuong, Tech Lead and approver of the design:

- All sixteen `SHOULD FIX` are fixed in this change, S6, S7 and S8 included.
- S8: `atk:review` reads a reply written for the author by someone else, when the reply names who
  answered; the `Author` line names that person.
- S14: row 8 of `state-signals.md` routes to `atk:fix <pr-url or report path> --findings`;
  orchestrate's proposal keeps an `atk:implement` job, since its walk needs a person for every
  finding and a job has none beside it.
- `NIT`: N3, N4, N5, N6, N8, N9, N11, N12, N13, N14, N15, N18, N19, N20 and N21 are fixed; N1, N2,
  N7, N10, N16 and N17 are deferred.
- S12: the design `docs/records/design/261023-1609-review-findings-explained-and-answered.md:359`
  specified the `step 1-1 findings mode` line. As an `APPROVED` record it stays as written; this
  report is where the departure is recorded.

The review's input was a local report, not posted on the pull request, so no answer below has been
posted; section 10 lists them for the reply step.

Every finding below was proved the same way: the responsible lines quoted, read at `4c67eae`, which
is the review's head and was `HEAD` when the run started. One hypothesis per finding, proved; none
ruled out.

## S1. Checking out the reviewed commit is never undone

### 1. Symptom as captured

From the review: "The repository is now on a detached HEAD at the old commit, and no line of either
skill switches back."

### 2. Root cause

`plugins/atk/skills/catchup/references/document-explainer.md:221-227` at `4c67eae` offers the
checkout and says nothing of the branch before it or a dirty tree; `findings-mode.md:26-31` calls
catchup and never names the branch the fixes are made on.

### 3. Evidence

`document-explainer.md:222-223`: "Where the checkout is at another commit, the run says which, and
asks to check the reviewed commit out or to go on." Check: `grep -n "switch\|porcelain"` on both
files at `4c67eae` matches nothing.

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

Design AC1 asks the layer to be read at the reviewed commit; nothing recorded asks the walk to stay
there.

## S2. A local report's answers have no thread

### 1. Symptom as captured

From the review: "So the answers end up only in the fix report. The next `atk:review` reads answers
from the thread alone, so every declined or deferred finding comes back."

### 2. Root cause

`findings-mode.md:76-80` covered a thread and a local report with no pull request, not a local
report whose pull request has no posted review.

### 3. Evidence

`findings-mode.md:79-80`: "For a local report with no pull request, the drafts are shown for the
person to hand to the reviewer". This very run is the case: PR #153 is open and carries no review.

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

`findings-mode.md:6-7` states the purpose, "record each answer in a form the next review reads back";
`report-format.md:59-61` reads any comment of the author's naming an ID. The fix follows both.

## S3. A finding kept against the author's answer is skipped

### 1. Symptom as captured

From the review: "The finding the reviewer just pushed back on is never put to the author again."

### 2. Root cause

`findings-mode.md:37-38` counted any earlier answer as given.

### 3. Evidence

`findings-mode.md:37-38`: "A review whose findings are all answered already ... is listed with those
answers, and the run asks only about the rest." `report-format.md:128-131` keeps such a finding with
an `Author` line and "the one action that would close it".

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

None says a kept finding stays answered.

## S4. `atk:git` moves an open pull request's fixes to a new branch

### 1. Symptom as captured

From the review: "The fixes move to a new branch, no pull request is found for it at step 4, and a
second pull request is offered."

### 2. Root cause

`plugins/atk/skills/git/SKILL.md:167-170` restates step 2 of `finalize-steps.md` without the
exception `4c67eae` added to it at `finalize-steps.md:77-78`.

### 3. Evidence

`git/SKILL.md:167-169`: "check the current branch name against the rule just resolved before
committing onto it either. Both cases are step 2 of `shared/finalize-steps.md`: create the
conforming branch now". `finalize-steps.md:77-78`: "Work that belongs to a pull request already open
is committed on that pull request's head branch ...; no branch is created or renamed."

### 4. Why it surfaced now

`4c67eae` added the exception to `finalize-steps.md`; the `git/SKILL.md` text is from `ed02384`.

### 4b. Recorded intent

AC10 of the design and `finalize-steps.md:77-78`.

## S5. "Explain the review on this PR" gets the diff brief

### 1. Symptom as captured

From the review: "The skill triggers and then writes the diff brief, not the explanation the person
asked for (AC7)."

### 2. Root cause

`catchup/SKILL.md:97-100`: only the flag switches a pull request URL to the review.

### 3. Evidence

`catchup/SKILL.md:98-99`: "Under `--findings` it stays one, and the flag picks what is read".
`catchup/evals/trigger_evals.json:18` expects the review explained with no flag.

### 4. Why it surfaced now

`1c52b50` wrote the rule and the eval together.

### 4b. Recorded intent

AC7 of the design asks for the review posted on a pull request to be explained.

## S6. The layer's scenario against the exploit cap

### 1. Symptom as captured

From the review: "The run either breaks the cap or writes a scenario too thin to meet AC1."

### 2. Root cause

`document-explainer.md:173-174` caps detail at the document's own, and `:190` asks for a scenario
the reviewer never wrote; no line says which wins for a security finding.

### 3. Evidence

`:173-174`: "The page says what an actor does at the level of detail the document does, never
more." `:190`: "**A scenario**, with named actors and states." Sensitivity at `:237-242` lists
three cases, none a review report.

### 4. Why it surfaced now

The layer arrived in `4c67eae`; the cap is from `208c1c4`.

### 4b. Recorded intent

`docs/adr/0010-...:54-55` leaves `security-record` out of the layer for this reason.

## S7. A merged or closed pull request is not checked

### 1. Symptom as captured

From the review: "The fixes are committed and pushed to a head branch that no open pull request
uses ... Yet the thread says `<ID> fixed in <sha>`."

### 2. Root cause

`findings-mode.md:12` takes "the newest `atk:review` posted on it" with no read of its state.

### 3. Evidence

Check: `grep -n "merged\|closed" findings-mode.md` at `4c67eae` matches nothing.

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

None.

## S8. A non-author's answers

### 1. Symptom as captured

From the review: "`report-format.md` reads "the author's replies", so the next review ignores them
and every finding comes back."

### 2. Root cause

`findings-mode.md:5-8` assumes the person running is the author; `report-format.md:59-61` reads the
author's replies only.

### 3. Evidence

`report-format.md:59`: "The same read takes the author's replies". Check: `grep -n "author"`
in `findings-mode.md` at `4c67eae` finds no match against the person running.

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

None; Lam Ngoc Khuong decided at 06:35 that such a reply is read, with the answerer named.

## S9. A report path without the flag

### 1. Symptom as captured

From the review: "A report path goes to "an existing investigation write-up", and every finding
becomes a defect to fix with no triage." This run's own input was that case.

### 2. Root cause

`fix/SKILL.md:91-93` and `findings-mode.md:19-22` ask the question for a pull request URL only.

### 3. Evidence

`fix/SKILL.md:91-92`: "Under `--findings`, and for a pull request URL whose thread it reads to ask
whether to walk a review posted there".

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

None.

## S10. The branch a local report names

### 1. Symptom as captured

From the review: "They name no branch, so the instruction cannot be carried out."

### 2. Root cause

`findings-mode.md:114-115`.

### 3. Evidence

`findings-mode.md:114-115`: "For a local report, the branch is the one the report names as its
target." `report-format.md:202`: `# Review: <PR, branch, commit, range or paths>`.

### 4. Why it surfaced now

Broken since it was written, in `4c67eae`.

### 4b. Recorded intent

None.

## S11. Fidelity's exception misses Terms and the model

### 1. Symptom as captured

From the review: "An agent following Fidelity writes "the document does not say" for the model, and
AC6 is not met."

### 2. Root cause

`document-explainer.md:165-167` names only the layer as the exception.

### 3. Evidence

`:130-133` cites the model "by `path:line` from the sources of The repository layer"; `:165`: "The
one exception is a line of The repository layer below".

### 4. Why it surfaced now

`4c67eae`.

### 4b. Recorded intent

AC6 of the design.

## S12. `step 1-1 findings mode` misuses the trace format

### 1. Symptom as captured

From the review: "Every `--findings` trace says step 1 was replaced and then logs step 1 again".

### 2. Root cause

`findings-mode.md:121`.

### 3. Evidence

`findings-mode.md:121`: "`step 1-1 findings mode: ran` comes before the usual steps".
`run-trace.md:175` keeps that shape for "Steps a mode takes the place of".

### 4. Why it surfaced now

`4c67eae`, copying the design at `:359`.

### 4b. Recorded intent, and the conflict

The approved design specified the line; Lam Ngoc Khuong chose at 06:35 to fix the skill and leave
the design as written.

## S13. Who reads the review report and the page

### 1. Symptom as captured

From the review: "A team weighing what deleting a review report costs is told it costs nothing
downstream".

### 2. Root cause

`plugins/atk/shared/artifact-paths.md:324-339` and `docs/artifact-lifecycle.md:96-110`, both
languages, predate `fix --findings`.

### 3. Evidence

`artifact-paths.md:325`: "and no skill reads it"; `:338-339`: "Nothing else reads any of the ten".

### 4. Why it surfaced now

`4c67eae` made `fix` a reader; the text is from `208c1c4`.

### 4b. Recorded intent

None.

## S14. Row 8 routes to `atk:implement`

### 1. Symptom as captured

From the review: "Two routes for one state means two different records of the answers."

### 2. Root cause

`plugins/atk/shared/state-signals.md:63`.

### 3. Evidence

Row 8: "`atk:implement "address the BLOCKING findings in <report path>"`".

### 4. Why it surfaced now

`4c67eae` built the other route; row 8 is from `ed02384`.

### 4b. Recorded intent

Decided by Lam Ngoc Khuong at 06:35.

## S15. No definition-of-done box for the layer

### 1. Symptom as captured

From the review: "A run can tick every box and still skip all of them."

### 2. Root cause and 3. Evidence

`catchup/SKILL.md:283-288`: the three document-mode boxes name no layer, `review_commit`, checkout,
credential finding or writer check.

### 4. Why it surfaced now

`4c67eae`.

### 4b. Recorded intent

None.

## S16 and N20. The field-name check guards two names

### 1. Symptom as captured

From the review: "Renaming a key or adding an eighth field passes `tests/verify.sh`."

### 2. Root cause and 3. Evidence

`tests/verify.sh:571-578` at `4c67eae` compares `['What the repository says', 'What the fix costs']`
only.

### 4. Why it surfaced now

`4c67eae`.

### 4b. Recorded intent

None.

## NIT fixed

Each is one clause, proved by reading the cited lines at `4c67eae`; why now is `4c67eae` or
`1c52b50` for every one, and no recorded intent stands against any.

- `N3`: `findings-mode.md:90-91` promised "the newer answer" with no rule in `report-format.md`.
- `N4`, `N5`: the `review-report` row of `document-explainer.md:41` recognised by directory, so
  a report moved by `--out` was missed while a `plan-` report matched.
- `N6`: catchup and fix found only a summary that opens with `atk:review`.
- `N8`: `catchup/SKILL.md:169` "traces no code" beside the layer's read.
- `N9`: a credential finding kept its `File:` line.
- `N11`: a credential fix's commit message could name the file.
- `N12`: "symbolic links followed" beside "a link met while reading is not followed".
- `N13`: any inline comment opening with an ID could be read as the finding.
- `N14`: the trace slug under `--findings` named in `SKILL.md` but `document` in the explainer and
  the box.
- `N15`: the writer check named `.atk/profile.md` in a skill that never mentions it.
- `N18`: the dated-name check skips `docs/vi/records/` with no comment saying so.
- `N19`: no cross negative between catchup and fix, no vi or ja positive for fix's new triggers.
- `N21`: `help/SKILL.md:39` ran to 149 characters.

## 5. The change

Sixteen files, every change a clause or a sentence where the state is met:

- `plugins/atk/skills/fix/references/findings-mode.md`: S1 (head branch, clean tree, switch back
  after catchup), S2 (one pull request comment for an unposted review), S3 (a kept finding walked
  again), S7 (merged or closed state; round 1 S1 the new branch carried as new work), S8 (Who
  answers, the `(answered for the author by <name>)` ending), S9 (the question for a report path),
  S10 (the branch for a local report), S12 (no `step` line, `gate` lines and the `step 1` line),
  N6, N11, N13, N21.
- `plugins/atk/skills/catchup/references/document-explainer.md`: S1 (refuse a dirty checkout,
  record and switch back), S6 (cap binds the scenario, a fourth Sensitivity case), S11, N4, N5, N6,
  N9, N12, N13, N14, N15.
- `plugins/atk/skills/catchup/SKILL.md`: S5, S15 (a new definition-of-done box), N8, N14; 293 lines.
- `plugins/atk/skills/git/SKILL.md:174-176`: S4; 281 lines.
- `plugins/atk/skills/fix/SKILL.md:91-92`: S9, same line count, 299.
- `plugins/atk/shared/state-signals.md` row 8 and `plugins/atk/skills/orchestrate/references/proposal.md`:
  S14.
- `plugins/atk/skills/review/references/report-format.md`: S8, N3.
- `plugins/atk/skills/fix/references/report-template.md` section 10: S8.
- `plugins/atk/shared/artifact-paths.md`, `docs/artifact-lifecycle.md`, `docs/vi/artifact-lifecycle.md`:
  S13.
- `tests/verify.sh`: S16 and N20 (five names, seven fields counted, four answer kinds), N18.
- `plugins/atk/skills/catchup/evals/trigger_evals.json`, `plugins/atk/skills/fix/evals/trigger_evals.json`:
  N19 (one cross negative each, a vi and a ja positive for `fix`).
- `plugins/atk/skills/help/SKILL.md:39`: N21.

The fix changes no public contract in the sense of `shared/spec-docs.md`: no API, schema, feature
reference or screen. `docs/artifact-lifecycle.md`, the one doc a claim of this change made false,
moved with it in both languages.

## 6. Verified

- `bash tests/verify.sh`: 79 lines, all `OK`, after the fix, after the tidy, and after the round 1
  fix.
- The widened check was made red three ways and restored: `review_commit` renamed in
  `findings-mode.md`, an eighth field added to `document-explainer.md`, `fixed` renamed in
  `report-format.md`. Each failed with its own message.
- The `ak:`, `atkx`, em-dash, `fill:#` and symlink checks of `CLAUDE.md` print nothing for this
  change; the one em-dash the em-dash grep prints sits in an older record under `docs/records/`.
- The tidy pass ran by hand per `shared/tidy-pass.md`: two paragraphs reflowed, nothing else. The
  host's `/simplify` reviews code, and this change is rule prose.

The reproduction of each finding is its cited lines, re-read after the change: each state now has
the rule quoted in section 5.

## 6b. Reviewed

Two rounds of `atk:review`, band 1, one reviewer agent each, given paths and no conversation.
Round 1, `docs/derived/reviews/fix-pr153-261024-r1.md`: 0 `BLOCKING`, 1 `SHOULD FIX`, 4 `NIT`; the
`SHOULD FIX` fixed. Round 2, `docs/derived/reviews/fix-pr153-261024-r2.md`: 0 `BLOCKING`,
0 `SHOULD FIX`, 6 `NIT`, round 1's `S1` closed. No `NIT` was fixed in the loop. `atk:verify` was
not offered: nothing in this repository runs.

## 7. Not verified

- No CI job judges this content: `.github/workflows/` carries release-please and the labeler only.
  `tests/verify.sh` is run by hand.
- The rules were not exercised by a live run of `atk:fix --findings` on a merged pull request, a
  non-author, or a dirty tree; each state is covered by reading only.
- The new trigger eval cases were parsed, not measured: trigger measurement needs the hook
  `docs/trigger-eval-measurement.md` describes.

## 8. Blast radius

The callers of what changed: `atk:help` and `atk:orchestrate` read `state-signals.md` row 8 (help
now names `atk:fix --findings`; orchestrate keeps its job, per the sentence added to
`proposal.md`); `atk:review` reads `report-format.md` on every later review (the two new sentences
add readings and remove none); `atk:git` is called by every code-changing skill (its new sentence
applies only to a branch with an open pull request, already the rule in `finalize-steps.md`).
Each was read against the change; none was run.

## 9. Left for later

- N1: progress-log answers are keyed by ID alone; a newer review between sessions may re-raise an ID
  a resume then skips. Each entry should name its `review_summary` or `review_commit`.
- N2: the thread and the progress log can disagree after an answer in the web UI; the newer should
  win and the conflict be shown.
- N7: `88 --findings`, or a ticket id resolving to a pull request, is refused before rule 3 of
  catchup's step 1 resolves it.
- N10: a defect block seeded from the page's scenario goes into a report offered as a pull request
  comment, while replies may not quote the layer.
- N16: step 7, Output and Ticket of `fix/SKILL.md` still say the report is the pull request body;
  `git/SKILL.md:196-198` already keeps an open body, and `fix/SKILL.md` is at 299 lines.
- N17: the `fix` to `catchup` edge in `docs/flow/skill-lifecycle.md`, six rows of
  `docs/codebase-summary.md`, the `CLAUDE.md` shared table and `docs/system-architecture.md`, each in
  both languages, do not mention the new behaviour.

- From the review rounds, all `NIT`, for Lam Ngoc Khuong: N1 (round 1), a reply ending
  `(answered for the author by <name>)` is read from any commenter, its writer not matched to the
  Team section; this narrows the S8 decision, so it is his call. N2, the trace sentence on `flags`
  is wrong when the mode was reached without the flag. N3, two new lines run past 100 characters
  (`catchup/SKILL.md:172`, `orchestrate/references/proposal.md:134`). N4, a closed, unmerged pull
  request is offered a new branch from the base, where its code is not. N5 (round 2), both
  `skills-overview.md` still say the walk opens no second pull request. N6 (round 2), a `fixed`
  reply on a merged pull request's thread names no new pull request.

No reference document is owed: the change moves skill rules, and `docs/artifact-lifecycle.md`, the
one doc whose claim it made false, moved with it in both languages.

## 10. Findings answered

| ID | Answer | Reason or place | Reply |
|----|--------|-----------------|-------|
| `S1` to `S16` | `fixed` | this change | not posted: the review was not posted on the pull request; one comment naming each ID is offered after the push |
| `N3` `N4` `N5` `N6` `N8` `N9` `N11` `N12` `N13` `N14` `N15` `N18` `N19` `N20` `N21` | `fixed` | this change | as above |
| `N1` `N2` `N7` `N10` `N16` `N17` | `deferred` | a follow-up issue, offered at step 5 of `shared/finalize-steps.md` | as above |
