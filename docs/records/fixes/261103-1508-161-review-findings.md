---
title: "Fix: the review findings of PR #161 on the atk:estimate comparables pool"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-03
updated: 2026-11-03
ticket: "#161"
---

# Fix: the review findings of PR #161

## In short

The `atk:review` of PR #161 (`docs/derived/reviews/161-261103-1406.md`, head `afb3d68`) raised 16 `SHOULD FIX` and 21 `NIT` findings and no `BLOCKING` one. Nearly all of them are sentences in the new `plugins/atk/skills/estimate/references/comparables-pool.md` that either let an agent lose comparables silently or contradict each other. Lam Ngoc Khuong, the PR's author, answered every finding. Fifteen `SHOULD FIX` and eighteen `NIT` findings are fixed here. S8 is deferred to the trial run, N19 and N20 to an issue, N16 goes into the PR body, and N17 is the plan's approval, recorded by the approver.

Each fix is a sentence corrected or added in the reference, the estimate template, `SKILL.md`, `shared/artifact-paths.md`, the docs in both languages, and one glob in `tests/verify.sh`. The approved design and ADR are not edited, so where the reference now goes further than the design, the PR body says so. Lam Ngoc Khuong approves as Tech Lead.

## After the last round

The second review round raised `S17` again in narrower form, and the fix made after it was read once more by the closing read (`docs/derived/reviews/estimate-comparables-fix-worktree-261103-1526.md`). That read closed `S17`. It raised one new `SHOULD FIX`, `S20`, and two `NIT`, all recorded and none fixed, per The closing read in `shared/review-fix-loop.md`. `S20` is carried forward in section 9. Every other fix was covered by round 1 or round 2.

## Shared to every defect below

- **Symptom as captured:** each defect's symptom is the finding as the review wrote it, quoted from `docs/derived/reviews/161-261103-1406.md` under its ID.
- **Evidence form:** quoted lines with a specific check, the third form of `references/investigate.md`. The lines are at `afb3d68`. Three read-only agents and the session read each cited line against what it cites; the repository layer of `docs/derived/catchup/documents/261103-1449-review-report.md`, held out of git, holds their reading.
- **Why now:** every defect in `comparables-pool.md`, the template and `SKILL.md` was introduced by `afb3d68` (feat: read atk:estimate comparables once per run, with a dated snapshot), except where a block says otherwise.
- **Recorded intent:** the design `docs/records/design/261103-0629-estimate-comparables-read-once.md` and ADR 0013 are `APPROVED` (`:3` of each). No fix contradicts either; where a block names a decision, it is followed.
- **Hypotheses:** each cause was the first hypothesis and was proven; none was ruled out.

## Defects

### S1
1. Captured: "The merge drops keys missing from the key-only read, but no step fetches a key the key-only read returns and the pool lacks."
2. Cause: the success branch of step 3 only replaces and drops rows, `plugins/atk/skills/estimate/references/comparables-pool.md:29-31`; the GitHub incremental filter is on the Project item's `updatedAt`, `:57`.
3. Evidence: `:29-31` reads "merge by ticket key, the newer `updated` winning; drop every row whose item no longer matches the filter, and every key missing from the key-only read; then write the snapshot." It has no add step. Check: an item closed after its actual was recorded does not move `updatedAt` (author's answer, 2026-11-03), so `updated:><date>` never returns it while `is:closed <slug>:>0` does.
4b. Design `:187-188` defines dropping only and says nothing on adding; no contradiction.

### S2
1. Captured: "A query written to that wording returns no key for a pull request, and `:30` then drops it."
2. Cause: the key-only cell asks for "each item's repository and issue number alone", `comparables-pool.md:57`.
3. Evidence: the full read keys a pull request item `<owner>/<repo>#<number>` (`:98-100`), while `:57` names issue numbers only, so the two reads disagree on a pull request item.
4b. Design `:335` measured issues only; nothing records excluding pull requests.

### S3
1. Captured: "On a self-hosted Jira or Redmine behind a VPN, a person removed from the project usually loses network access too, and the tracker answers host unreachable."
2. Cause: the fallback rests on the failure class alone, `comparables-pool.md:144-154`, and says nothing of revocation that shows as unreachable.
3. Evidence: `:149-151` covers forbidden, not found and authentication expired only. No sentence states what happens when revocation shows as host unreachable.
4b. Decision: O8, design `:354`, and the author's decline of 2026-11-03 (review `S3` Author line) keep the snapshot usable after forbidden. The fix follows it: it accepts the residual case in writing and does not mark the snapshot unusable.

### S4
1. Captured: "The committed `estimate-*.md` therefore carries what the ignored file hides."
2. Cause: the Basis and Appendix B bullets name no masking, `plugins/atk/skills/estimate/references/estimate-template.md:133-140`, `:150-157`.
3. Evidence: `comparables-pool.md:107-112` masks `title` by the list in `skills/qa/references/test-run.md`, and neither template bullet cites it.
4. Why now: older than `afb3d68` for the Basis column; `afb3d68` made it visible.
4b. O6, design `:352`, scoped masking to the snapshot and does not exempt the sheet.

### S5
1. Captured: "The ignore file keeps the snapshot out of git and out of nothing else."
2. Cause: `comparables-pool.md:130-140` borrows the trace's ignore steps without the warning of `plugins/atk/shared/run-trace.md:90-93`.
3. Evidence: `run-trace.md:90-93` names docs generators, archives and image builds; `:130-140` names none.
4b. None found. The switch the finding proposes does not exist and is left for later (section 9).

### S6
1. Captured: "`is:closed <slug>:>0` correctly returns zero while `is:closed` returns items, so every run treats the filter as failed."
2. Cause: the zero-match guard has no state for a confirmed slug, `comparables-pool.md:71-75`.
3. Evidence: `:72-74` treats any zero beside a non-zero `is:closed` as a failed filter. `shared/ticket-adapters.md:101` says the field exists only "when the team added one", which allows a field with no value yet.
4b. Design `:132-134` keeps the guard; the fix narrows when it fires and does not remove it.

### S7
1. Captured: "Line 73 says a zero match 'is a failed read' ... Lines 74-75 then say the run pages `is:closed` and records `filter: session`."
2. Cause: "it is a failed read", `comparables-pool.md:73`.
3. Evidence: under `:32-36` a failed read writes no snapshot, and `:74-75` describe a written `filter: session` snapshot, so both cannot hold.
4b. Design `:133-134` and ADR `:51-52` already say "failed filter"; the fix aligns the reference with them.

### S9
1. Captured: "Rate limited is none of the four classes, so the run reads it as forbidden."
2. Cause: no class for a rate limit, `comparables-pool.md:144-147`.
3. Evidence: `:146` places a timeout under host unreachable, and nothing places a rate limit. The four classes of `shared/ticket-adapters.md:70` include forbidden, which is what a 403 reads as.
4b. Design `:253-254` names unreachable and timeout only; no contradiction.

### S10
1. Captured: "The pool can also be none ... no part of the sheet holds it."
2. Cause: the pool item is written "only when the run used the snapshot or a partial read", `estimate-template.md:189-191`, `comparables-pool.md:176-179`.
3. Evidence: `comparables-pool.md:151-153` says the run "names the class of failure", and neither the template item nor `:176-179` gives that a place.
4b. Design `:257-258` sends none to the third outcome of `shared/ticket-adapters.md:59`, which requires the artifact to name the class; the fix carries that out.

### S11
1. Captured: "The person is steered to a points-only sheet on exactly the run the snapshot was built for."
2. Cause: the unit question of `plugins/atk/skills/estimate/SKILL.md:46-51` never mentions the snapshot.
3. Evidence: the snapshot header holds `actual field` and `unit` (`comparables-pool.md:93`), and step 1 loads it only when they match (`:15-17`). `SKILL.md:46-51` asks the question regardless.
4. Why now: the question is older than `afb3d68`; the snapshot that answers it came with it.
4b. None found.

### S12
1. Captured: "`Built` ... and the layer and technology need the PR or the body, and the pool stores neither."
2. Cause: the field list, `comparables-pool.md:59-61`, `:105`, holds no build or layer data, and nothing allows a further read.
3. Evidence: `estimate-template.md:150-155` asks for both, and `SKILL.md:95-98` caps an unknown `Built` below `HIGH`.
4b. Design `:218-222` lists the same fields and is silent on `Built`.

### S13
1. Captured: "That list names the estimate and the run trace, but not the snapshot."
2. Cause: `plugins/atk/shared/artifact-paths.md:23-30`.
3. Evidence: `comparables-pool.md:82-85` calls the snapshot "one of the project-level kinds of A project that spans several repositories", and `artifact-paths.md:23-28` does not list it.
4b. O4, design `:350`, intends it to be project-level.

### S14
1. Captured: "The reference lists the third as 'the closing message names it', calls `check-ignore` 'the last step', and then says 'where any of the three fails'."
2. Cause: `comparables-pool.md:132-139`.
3. Evidence: `run-trace.md` Where it lives has three steps, realpath, create, `check-ignore`; `:134-135` names realpath, create and the closing message.
4b. Design `:238-246` lists the steps correctly. ADR: disputed by the author, see section 10.

### S15
1. Captured: "Adding the ADR 0013 row makes the table 21 rows, and the sentence still says twenty."
2. Cause: `docs/codebase-summary.md:286`, `docs/vi/codebase-summary.md:287`.
3. Evidence: `docs/adr/` holds 0001 to 0013, and the table had rows for 0001 to 0010 and 0013, 21 rows with the ten other docs, under the word "twenty".
4. Why now: the missing 0011 and 0012 rows predate `afb3d68`; the stale count came with it.

### S16
1. Captured: "Nothing in `verify.sh` checks them."
2. Cause: the summary-row check covers `references/*.md` only, `tests/verify.sh:472-480`.
3. Evidence: with `docs/adr/*.md` added to that glob, the check fails at `afb3d68` on the 0011 and 0012 rows, which S15 found by hand.
4b. None found. The count-word check is left for later (section 9).

### NIT findings fixed: N1 to N15, N18, N21
Each is the table row of the review under its ID, captured there verbatim, with the cause at the location the row cites. The evidence is the cited line read with its check, as follows.
- N1: `:54` puts `"<date>"` into JQL, and the only time available is ISO `read` (`:94`).
- N2: `:22-23` fetches "whatever its state", while `:33` serves every partial row, and `:156` names no winner between rows.
- N3: `shared/ticket-adapters.md:101` maps the item's own field.
- N4: `:125` says a dead run's temporary file "costs nothing".
- N5: `:104` defines `items`, and nothing checks it.
- N6: `:80-82` flattens `_` and `-` alike.
- N7: `:93` says `unit: hours`, and Jira's `timespent` is in seconds.
- N8: `:54`, `:57` read one project, and `:7` says nothing of it.
- N9: `artifact-paths.md:354` reads "own ignore file, and the run trace".
- N10: `artifact-paths.md:7` says "The one exception", while `:144` and `:154` hold two more.
- N11 to N13: the estimate rows of `docs/codebase-summary.md:142`, `docs/flow/skill-chain.md:92` and `docs/skills-overview.md:227-230`, and their mirrors, omit the snapshot.
- N14: `artifact-paths.md:164` with no estimate exception.
- N15: `:107-110` names three kinds of the list.
- N18: `SKILL.md:184-195` has no AC4 item.
- N21: `:42` reads "in Detected is not reachable of".

The design is not contradicted by any of them. N4's cleanup, N3's aggregate time and N6's hash are not done, by the author's answer.

## 5. The change

Each defect is closed by correcting or adding the sentence its finding named. Every one is a rule an agent follows, so the form is the narrowest of `shared/review-fix-loop.md`: a corrected false sentence for S2, S7, S10, S14, S15, N1, N5, N9, N10, N14 and N21, and an added rule for the rest. The rules added open these states, which were weighed:
- S1: a fetch of the missing keys can fail, which makes the read a failed read.
- S3: none; it records a risk already decided.
- S6: the check page, which the review loop reshaped as S17 and the closing read questions as S20.
- S12: a pull request read where the local search finds nothing, reshaped as S19.
- N4: a temporary file that is deleted after a failed rename.

The approved design and ADR are not edited.

Files touched:
- `plugins/atk/skills/estimate/references/comparables-pool.md`: S1, S2, S3, S5, S6, S7, S9, S10, S12, S14, N1 to N8, N15, N21, and S17 to S19 from the review rounds.
- `plugins/atk/skills/estimate/references/estimate-template.md`: S4, S10, S11, N2, S18.
- `plugins/atk/skills/estimate/SKILL.md`: S11, N18, S18.
- `plugins/atk/shared/artifact-paths.md`: S13, N9, N10, N14. It grew from 48,593 to 48,860 bytes, about 0.5%, and every run reads it.
- `docs/codebase-summary.md` and its vi mirror: S15, N11.
- `docs/flow/skill-chain.md`, `docs/skills-overview.md` and their vi mirrors: N12, N13.
- `tests/verify.sh`: S16, the summary-row check now covers `docs/adr/*.md`.
- The gitignored plan: N17, its status recorded as `APPROVED` on the approver's word.

Tidy: the harness's clean-up capability works on code, so the pass ran by hand per `shared/tidy-pass.md`, inside the lines the fix touched. It rewrapped two long lines and split one sentence; `bash tests/verify.sh` was re-run after it.

Reference documents: the defects are in the reference documents of `atk:estimate` themselves, which moved here. No public contract of code changed.

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command: 79 lines, all `OK`, after the first fix set, after the tidy, after the round 1 fixes and after the round 2 fix. This proves the manifests, the mirrors, the citations and the summary rows, ADRs included, hold.
- The em-dash and `ak:` checks of `CLAUDE.md` print nothing for the changed files.
- The captured reproduction of each defect is its quoted line. Each was re-read after the fix, and the three review passes read every fix against its finding.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/estimate-comparables-fix-worktree-261103-1512.md`: 0 `BLOCKING`, 5 `SHOULD FIX`, 9 `NIT`. S17, S18 and S19 were fixed. S8 and S16 (count-word half) stay deferred by the author's answer. The NITs were left, per the loop.
- Round 2, `docs/derived/reviews/estimate-comparables-fix-worktree-261103-1522.md`: 0 `BLOCKING`, 3 `SHOULD FIX`, 10 `NIT`. S18 and S19 are closed. S17 was raised again narrower and fixed. N26 is new and left as a `NIT`.
- Closing read, `docs/derived/reviews/estimate-comparables-fix-worktree-261103-1526.md`: 0 `BLOCKING`, 1 `SHOULD FIX` (S20, carried forward), 2 `NIT` (N27, N28). Nothing was fixed after it.
- Each pass ran in one fresh `atk:read-only-reviewer` agent, band 1. `atk:verify` was not offered, because the profile has no Start command and this repository runs nothing.

## 7. Not verified

- No skill run exercised the new rules. The trial run on a GitHub Project that PR #161 names is what settles S2, S6/S17/S20, S8, S9, S11 and S12.
- The Jira, Backlog and Redmine claims (N1's date form, N3's own time, N7's seconds) rest on the trackers' documentation as the agents know it; no query was run.
- The vi docs were compared by reading, not by a check (N19).

## 8. Blast radius

- `atk:estimate` step 2 and the sheet: the reference and the template. They were read by all three passes, and no run exercised them.
- `shared/artifact-paths.md`: every skill reads it. The changed sentences are the estimate row, the multi-repository list, the never-staged list and the Markdown exception. They were read by `callers` in round 1, and nothing ran them.
- `tests/verify.sh`: exercised, passing.

## 9. Left for later

- S20 (closing read): the empty-pool check reads one page of `is:closed` in no stated order, so a wrong slug on a board that added the field partway through can still give a silent empty pool. Settled by the order `ProjectV2.items` returns, in the trial run.
- N22 to N28 (review loop NITs, not fixed by rule): GitHub's `updated:>` is exclusive (N22); a failed rename that always fails leaves the snapshot at its first write (N23); the codebase-summary row of `comparables-pool.md` (N24); `CLAUDE.md:751` still says only references (N25); the opening of the reference says reads never grow with the items while a cited pull request read can (N26), and whether that AC1 remainder needs recording against the approved design is a question for Lam Ngoc Khuong; "never an empty pool" before its exception (N27); how a failed check page is judged (N28). Also N2, N10 and N12 left partly open by round 1.
- S8: where a large pool's pages go, and a session that loses pages counted as a partial read, including the case where no temporary file is allowed (`comparables-pool.md:139`). Deferred to the trial run on a GitHub Project that PR #161 names.
- S5: a profile switch to turn the snapshot off, which would need a new line in `shared/project-profile.md`.
- S16: a check of the count words in `docs/artifact-lifecycle.md` and `shared/artifact-paths.md`, carried by the review's Convention gaps for `atk:convention`.
- N3: whether the pool should use aggregate time on Jira and Redmine.
- N4: removing temporary files of dead runs, which needs an age bound, since concurrent runs are allowed (`comparables-pool.md:167-169`).
- N19: a mirror check in `tests/verify.sh` that compares content, not only names.
- N20: a check tying the snapshot example's column line to the field list.
- Outside the findings: the vi design `docs/vi/records/design/261103-0629-estimate-comparables-read-once.md:140` holds a clause the English `:141` lacks. Both copies are `APPROVED`; Lam Ngoc Khuong decides whether a correction record is owed.
- Reference documents: the fix changes the rule an agent follows in the estimate reference and template, which are the documents themselves. No public contract of code changed.

## 10. Findings answered

| ID | Answer | Reason or place | Reply |
|----|--------|-----------------|-------|
| `S1` | `fixed` | see S1 above | not posted yet |
| `S2` | `fixed` | see S2 above | not posted yet |
| `S3` | `fixed` | a sentence accepting the residual risk; marking the snapshot unusable stays declined, per the decision of 2026-11-03 | not posted yet |
| `S4` | `fixed` | see S4 above | not posted yet |
| `S5` | `fixed` | the warning; the off switch is deferred, section 9 | not posted yet |
| `S6` | `fixed` | see S6 above | not posted yet |
| `S7` | `fixed` | the reference only; design and ADR already say "failed filter" | not posted yet |
| `S8` | `deferred` | the trial run named in PR #161 | not posted yet |
| `S9` | `fixed` | in `comparables-pool.md` | not posted yet |
| `S10` | `fixed` | see S10 above | not posted yet |
| `S11` | `fixed` | `SKILL.md` and Appendix C of the template | not posted yet |
| `S12` | `fixed` | see S12 above | not posted yet |
| `S13` | `fixed` | see S13 above | not posted yet |
| `S14` | `fixed` | in the reference. The ADR part is `disputed`: the passage is at ADR `:33-34`, not `:52-53`, "three containment checks" matches O7's own wording, and an `APPROVED` ADR is not edited | not posted yet |
| `S15` | `fixed` | rows 0011 and 0012 added, the count is twenty-three, in both languages | not posted yet |
| `S16` | `fixed` | the summary-row check now covers `docs/adr/*.md`; the count-word check is deferred, section 9 | not posted yet |
| `N1`-`N15`, `N18`, `N21` | `fixed` | see the NIT block above | not posted yet |
| `N16` | `disputed` | the reason for `-<random>` is in the shipped reference at `comparables-pool.md:121-123`, not only in the plan; the deviation from the design goes into the PR body | not posted yet |
| `N17` | `fixed` | Lam Ngoc Khuong approved the plan on 2026-11-03 and it records `APPROVED`; the plan is gitignored, so no commit carries it | not posted yet |
| `N19`, `N20` | `deferred` | an issue for new checks in `tests/verify.sh` | not posted yet |

Every reply is drafted at step 7. The `fixed` replies are posted only after the push, since the review was a local report and the PR thread has no review to reply in.
