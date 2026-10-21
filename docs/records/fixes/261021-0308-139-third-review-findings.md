---
title: "Fix: the third review of PR #139, where a shared name word settled a question without the approver and row 1 of the state signals never cleared"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: https://github.com/lamngockhuong/aiteamkit/pull/139 (findings B2 to B4, S45, S54 to S75, N47, N60 and N61 to N95 of the review of PR #139, 2026-10-21 01:58)
---

# Fix: the third review of PR #139

## In short

Three cases from the third review show what was wrong. A question in a design names Tran Minh; a
client contact called Minh answers it in a meeting, and the answer is relayed. The name rule matched
"Minh" against "Tran Minh" as whole words, wrote the answer as Tran Minh's, and closed the question,
so the approver never saw that somebody else had answered for the role. Under `Contract: first`,
once the code a design asked for ships, its reference documents cite code instead of the design,
and row 1 of `shared/state-signals.md` held again: `atk:help` sent every run back to
`atk:spec --from` on finished work. And the Vietnamese mirror of `skills-overview.md` said an answer
"only partly correct" where the English means one that answers only part of the question.

The name rule now writes a Team row's Name unasked only on an exact match, case, diacritics and
honorifics aside. A partial match is confirmed with the person in the turn that collects the answer,
and a run with nobody to ask writes the name as given, so the wrong-person check compares what was
said. Row 1 now holds only for a named document that does not exist yet; one that exists, cites
neither the design nor its ticket, and has had no commit since the design's first one is listed under
`Waiting on people` with its approver, and the rows below are still read. The mirror says what the
English says.

Lam Ngoc Khuong chose three things on 2026-10-21:

- A partial name match is confirmed rather than taken (B3). This narrows the rule he chose earlier
  the same day, "names compare both ways", recorded in
  `docs/records/fixes/261021-0025-139-second-review-findings.md`.
- Every finding is fixed, the `NIT` ones included.
- S71 and S72 are fixed in the descriptions, without a trigger measurement.

The fix was reviewed twice with `atk:review`. The first round raised two `BLOCKING` and 34
`SHOULD FIX` in the fix itself, the largest being that the honorific list stripped Vietnamese given
names such as Anh, which reopened the B3 failure through an exact match, and that row 1 had stopped
recommending `--from` for a document the design names. For that one he chose on 2026-10-21 to keep
the recommendation and accept that a declined document repeats. All were fixed. The second round
closed every one of them and raised three `SHOULD FIX`, fixed after the last review call and not
reviewed again. Its 23 `NIT` findings are left to the author.

Two parts of N78 and N92 sit in the pull request body, which changes only on his yes.

Lam Ngoc Khuong is the approver of this report and the change.

## 1. Symptom as captured

The findings as the review stated them, the `atk:review` run of 2026-10-21 at 01:58, base `c122b2b`,
head `a4eb5d1`, 28 files, 756 lines, 3 `BLOCKING`, 23 `SHOULD FIX`, 37 `NIT`. The review's head is
the commit this run started from, so every line it cites is current.

```
B2. Row 1 of `state-signals.md` holds again once the code lands, and sends `--from` against
    finished documents
  Take a `Contract: first` project whose design is `APPROVED`. The change that implements the last
  item sets `implemented: yes`, and every item is then cited as `path:line` [...]. Row 1 now holds
  again: design `APPROVED`, a named document exists, "holds no item that cites the design".
B3. A shared whole word maps an outsider onto a Team row, and the wrong-person gate never fires
  A question names Tran Minh. A client contact called Minh answers in a meeting, relayed as "Minh
  said retry three times". `{minh}` is among the words of `Tran Minh`, one row matches, so
  `Answered by` is written `Tran Minh`, the answer counts as the named person's, no
  `answered by <name>, not <named person>` row is written, the question leaves the open list.
B4. The Vietnamese mirror turns "partial" into "partly correct"
S45. Still open in part: `tailor` counts a resumed run's earlier steps as skipped, and the run twice
S54. Row 1 never clears for a named document `--from` will not write, or one the person declined
S55. A design in review that needs an ADR or a challenge bounces between refusals
S56. The "version under review" check stops every `--answer` session after the first until a push
S57. `project-profile.md` and `run-trace.md` give different names when there is no profile
S58. A person's first message is `way: unknown`, so the line names the way instead of the person
S59. A runner who answers without giving a name has no rule
S60. Honorifics and Japanese names without spaces never match
S61. A handle is never matched against the Team table's Host identifier column
S62. An empty Name cell is matched by every name, so nobody matches
S63. A `DRAFT` design with an `IN REVIEW` ADR stops by one file and proceeds by the other
S64. `atk:plan --answer` gets the headless `Relayed by` value but not the headless rule
S65. The template exclusion by file name drops real documents about templates
S66. A spike record matches the plain run's duplicate check and dead-ends the design after it
S67. Two designs under one ticket cannot coexist
S68. Row 3 reports a `DRAFT` design as waiting on its approver, never naming the author's route
S69. `CLAUDE.md` and both codebase summaries list the `verify.sh` checks without the five new ones
S70. The description-length check passes on block forms it does not parse
S71. `atk:catchup`'s shortened description no longer covers kit records, which two positives test
S72. The three new "finish the draft" positives have nothing in the description to match
S73. The `DRAFT` path skips the identity checks the `--answer` path runs
S74. `Answered by` takes the gate line's name, which for a relayed answer is the relayer
S75. A side file the design changes is never offered when no subject of its kind is written
N47, N60 still open in part; N61 to N95 as listed in the review's NIT table
```

## 2. Root cause

**B2.** Row 1 tested the citation in a document's items to tell whether `--from` had written it, but
`shared/spec-docs.md:85-86` takes the design citation off each item once it is built, so the test
cannot tell a finished document from an untouched one. `plugins/atk/shared/state-signals.md:56`,
and the same test at `plugins/atk/skills/spec/references/affected-documents.md:30-33` and `:79-82`.

**B3.** The name rule treated a partial whole-word match as identity, with no confirmation, so a word
two people share decided who answered. `plugins/atk/shared/run-trace.md:213-218`, read by
`plugins/atk/skills/design-doc/references/answer-mode.md:100` and `:113-120`, and through it by
`plugins/atk/skills/plan/references/answer-mode.md:58-61`.

**B4.** A translation choice: "đúng một phần" means partly correct. `docs/vi/skills-overview.md:268`.

The `SHOULD FIX` findings share two causes with these. The name rule left states uncovered: a
runner who gives no name (S59), a handle (S61), an honorific (S60), an empty cell (S62), a relayed
answer whose answerer and relayer differ (S74), a person's first message read as `way: unknown`
(S58), and the no-profile fallback stated differently in two files (S57). The `DRAFT` path of
`atk:design-doc` added routes that its refusals and checks did not yet know about (S55, S63, S66,
S67, S68, S73). The rest are each a single gap at the line the review cites.

## 3. Evidence

Quoted lines, with the check that shows they produce the behaviour.

**B2.** `plugins/atk/shared/state-signals.md:56` at `a4eb5d1`:

```
| 1 | The Docs section of `.atk/profile.md` says `Contract: first`, the design for the work in hand
is `IN REVIEW` or `APPROVED`, and a reference document it names does not exist yet, or exists and
holds no item that cites the design. [...]
```

`plugins/atk/shared/spec-docs.md:85-86`:

```
- `yes`: every item is in the code, cited as `path:line`, and no mark is left.
```

Check: a document at `implemented: yes` written from the design satisfies "exists and holds no item
that cites the design", and nothing else in the row tells it apart, so the row holds for good.

**B3.** `plugins/atk/shared/run-trace.md:213-218` at `a4eb5d1`:

```
person is counted once across skills. A name given in the session matches a row when the words of
either name all appear among the words of the other, compared as whole words, without case and
without diacritics, so `Khuong`, `Khương` and `Lam Ngoc Khuong` all match a row that holds any of
them, and `An` does not match `Thanh`.
```

Check: the words of `Minh` all appear among the words of `Tran Minh`, so the row matches, and
`answer-mode.md:100` writes that row's Name in `Answered by`. The question names Tran Minh, the
answerer reads Tran Minh, and `answer-mode.md:113-115` never fires.

**B4.** `docs/vi/skills-overview.md:268` at `a4eb5d1`, against `docs/skills-overview.md:264`:

```
bản mới. Câu trả lời đến từ người khác người được nêu tên, hay câu trả lời mới đúng một phần, đều
Every answer from someone other than the person named, and every partial one, is settled by the
```

Hypotheses: one per finding, each proved by its first reading.

## 4. Why it surfaced now

All three were introduced by `a4eb5d1` ("fix: give a draft design a way forward and one name per
person on gate lines"): B2 by the clause it added to row 1 for S33, B3 by the both-ways match it
chose for S40 and S41, B4 by the mirror sentence it added for S37. The `SHOULD FIX` and `NIT`
findings come from the same commit, apart from S45, N47 and N60, which it closed only in part.

## 4b. Recorded intent, and the conflict when there is one

B3 contradicted a recorded decision: "names compare both ways", chosen by Lam Ngoc Khuong on
2026-10-21, `docs/records/fixes/261021-0025-139-second-review-findings.md:26` and `:172`. The run
stopped and put the concern, the trade-off (an exact rule makes `Khuong` stop matching
`Lam Ngoc Khuong` unasked, and every partial match costs one question), and three options to him.
He chose to confirm a partial match. S71 and S72 depended on whether a trigger measurement runs
before merge; he chose to fix the descriptions without one. Nothing else in the findings
contradicts a recorded decision: every other fix fills a state the rules did not cover.

## 5. The change

The name rule in `plugins/atk/shared/run-trace.md` now compares names as words in any order, with
case, punctuation and diacritics aside; strips an honorific only from the given name; writes a Team
row's Name unasked only on an exact match on one Name; and confirms anything else, or writes the
name as given where nobody can be asked. `design-doc/references/answer-mode.md` applies it to
`Answered by` and to the approver's ruling. Row 1 of `plugins/atk/shared/state-signals.md` holds for
a named document that does not exist or has not been rewritten from the design, defined once there
and cited by `spec/references/affected-documents.md`, and `atk:help` and `atk:orchestrate` were given
the reads it needs. The `DRAFT` route of `atk:design-doc` gained its checks, the ADR status pairs, a
recorded `--no-adr`, and a stop for every headless case. Every other finding is one sentence at the
line it cites. The change is the smallest that closes each finding; it is wide because the review
was, 63 findings and then 36 more from the fix's own review.

Tidy step: run by hand per `shared/tidy-pass.md`, since the change is prose; it reworded one reason
clause in row 1 and rewrapped the paragraphs the fix touched. Claude Code's `/simplify` targets code
and was not used.

Reference documents: the change is to the kit's own rules and their docs, `docs/` and `docs/vi/`
moved together; the fix changed no public contract of a project.

## 6. Verified

- `bash tests/verify.sh` (the profile's Test command): 75 lines, all `OK`, after each round of fixes
  and at the end. It proves the manifests, names, mirrors, summary rows, description lengths, the
  run-trace example shape and the skill-lifecycle counts (now 221 mentions in 125 pairs, since
  `atk:orchestrate` names `atk:design-doc` once more); it proves nothing about how an agent follows
  the rules.
- The standalone checks of `CLAUDE.md`: `ak:`, `atkx`, `fill:#` and symlinks print nothing; the
  em-dash check prints only `docs/records/fixes/261016-0613-review-author-replies.md:38`, outside
  this change.
- The captured symptoms no longer hold, read against the lines: `run-trace.md` no longer maps
  `Minh` onto `Tran Minh` unasked; row 1 no longer holds for a document with commits since the
  design; `docs/vi/skills-overview.md` reads "trả lời được một phần câu hỏi".
- The new `tests/verify.sh` description parser was run by hand on `description: |`, `>+ `, `|2`
  and a plain value in the session scratchpad: each block form is counted, none passes unparsed.
- `wc -c plugins/atk/shared/run-trace.md`: 24,781, the figure in its Cost section.

## 6b. Reviewed

- Round 1, `atk:review` at 04:08 (`docs/derived/reviews/139-fix-findings-261021-0408.md`), band 2,
  seven agents: 2 `BLOCKING`, 34 `SHOULD FIX`, 22 `NIT`. B1 and B2 and every `SHOULD FIX` fixed;
  B2 by Lam Ngoc Khuong's choice above. `NIT` left to the author.
- Round 2, at 05:10 (`docs/derived/reviews/139-fix-findings-261021-0510.md`), band 1: 0
  `BLOCKING`, every round 1 finding closed, 3 new `SHOULD FIX` (S35 honorific suffixes inside a
  name, S36 where a later challenge goes, S37 the reads `atk:orchestrate` needs for row 1), 1 `NIT`.
- S35, S36 and S37 were fixed after the last review call and have not been reviewed again: the
  ceiling of two rounds was reached. Lam Ngoc Khuong reads them before merge.
- `atk:verify` was not offered: the repository has nothing that runs, per the Verify section of
  `.atk/profile.md`.

## 7. Not verified

- No agent was run against the changed rules. How an agent applies the name rule, the
  confirmation question, the `DRAFT` route, the ADR pairs, row 1's commit test, and `tailor`'s
  merging is untested, the same gap as N52 of the earlier review.
- The trigger descriptions of `atk:catchup` and `atk:design-doc` were not measured (S71, S72), by
  his choice.
- The commands named for `atk:orchestrate`'s row 1 reads (`git grep -c -F`, `git log --reverse`)
  were not run against a project.
- The CI gate: none runs content in this repository; `.github/workflows/` holds release-please and
  the labeler only.

## 8. Blast radius

Every reader of the rules that moved, as `atk:review`'s `callers` round listed them:
`atk:help` (`plugins/atk/skills/help/SKILL.md`, updated), `atk:orchestrate` (`SKILL.md` and
`references/worktrees.md`, updated), `atk:tailor --feedback` (`references/feedback.md`, updated),
`atk:plan --answer` and `plan-challenge.md` (cite the changed design-doc and independent-challenge
rules, read), `atk:spec --from` (`SKILL.md` and `affected-documents.md`, updated), every skill's run
trace through `shared/run-trace.md`. None exercised by an agent run; each read against the changed
text by the two review rounds.

## 9. Left for later

- The pull request body, N78 (`:361` should read `:360`) and N92 ("all fixed in `a4eb5d1` but N52"
  overstates: S45, N47 and N60 were partial): changed only on Lam Ngoc Khuong's yes, since it
  leaves the local repository.
- N52 of the earlier review stays open as before: no behaviour of `--answer`, of a `DRAFT` design
  path, of the `--from` search, or of the gate-name rule has been exercised by an agent run.
- No trigger measurement ran for `atk:catchup` or `atk:design-doc` (S71, S72), by his choice.
- N94: the answer-recording rule stays in `atk:design-doc`'s references, cited by `atk:plan`; the
  plan file now records why, and it moves to `shared/` when a third skill needs it. The review's
  convention gap, a rule for where such a rule goes, is for `atk:convention`.
- The 22 `NIT` findings of the 04:08 review and N23 of the 05:10 review, left to the author by the
  loop's rule; each is in its report with a fix.
- The em-dash check still prints `docs/records/fixes/261016-0613-review-author-replies.md:38`,
  outside this change, as the review notes.
