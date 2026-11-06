---
title: "Fix: the review findings on PR #182, English-only triggers"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-06
updated: 2026-11-06
ticket: "#182"
---

# Fix: the review findings on PR #182

## In short

The review of PR #182 (`docs/derived/reviews/182-261106-0943.md`, head `6ad70f4`) raised 1 BLOCKING, 5 SHOULD FIX and 15 NIT findings, and the author answered all 21 with "fix". B1 was real: the branch's ADR took number 0014, which `main` gave to the benchmark ADR after the branch was cut, so the branch was rebased onto `main` and the ADR renumbered 0015. The five SHOULD FIX findings shared one cause: the trigger evals became the only guard for Vietnamese and Japanese, but nothing required a new skill to have such cases, nothing checked them, and the measurement left its own phrasings and its scope unrecorded. The fix makes the rule require positives in all three languages and adds a `tests/verify.sh` check for it. It puts rewritten forms of the measured phrasings into the evals and states in the ADR and the measurement doc that 24 descriptions are unmeasured. Two follow-up issues still need opening. Lam Ngoc Khuong approves, as the author and approver of the PR.

## After the last round

The second review round fixed nothing. It closed S3 for the two codebase summary rows that round 1 had kept, and kept S3 open only for the PR body, which is deferred. Nothing was changed after it, so there was no closing read.

## Defects

### B1. ADR number 0014 collides with `main`

1. **Symptom as captured.** From the review: "A trial merge of the head into `main` conflicts in `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`, and where it does not conflict it leaves two files numbered 0014."
2. **Root cause.** The branch was cut from `35b08c9`; `main` then added `docs/adr/0014-benchmark-runner-under-tests.md`, and the branch named its ADR 0014 too. Locations: the ADR and its mirror, `CLAUDE.md:577`, `CLAUDE.md:656`, both codebase summaries, both `project-overview-pdr.md`, both `trigger-eval-measurement.md`.
3. **Evidence.** `git ls-tree --name-only origin/main docs/adr/` lists `docs/adr/0014-benchmark-runner-under-tests.md`. `git rebase origin/main` stopped with `CONFLICT` in `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`, both on the row after `0013`.
4. **Why now.** `main` gained its ADR 0014 with the benchmark work, merged after `35b08c9`, the branch point.
4b. **Recorded intent.** No spec; the ADR numbering is sequential by `CLAUDE.md`'s docs table. Nothing recorded says the trigger ADR must be 0014.

### S1, N9, N11. A new skill gets no Vietnamese or Japanese eval cases

1. **Symptom.** From the review: "A skill added under the new rule therefore ships with no case in the two languages the ADR names as its only check, and `CONV-006` as written passes it."
2. **Root cause.** The rule says the evals "keep" their cases (`CLAUDE.md:580` at `6ad70f4`, `CONV-006`), which binds only existing files, and `plugins/atkx/skills/skill-eval/references/draft-cases.md:36-38` drafts positives per language "of the description", now English only.
3. **Evidence.** The lines quoted: `draft-cases.md:36-38` "When the `description` lists triggers in several languages, the draft has positives in each of them"; `CONV-006` "its trigger evals keeping their Vietnamese and Japanese cases"; `project-conventions.md:57` example row naming triggers only.
4. **Why now.** `6ad70f4`, this PR's commit, which made descriptions English-only.
4b. **Recorded intent.** The ADR's decision is that the evals carry the two languages; the fix applies it to new skills.

### S2, N12. The measured phrasings are kept nowhere

1. **Symptom.** From the review: "None of them is in any `trigger_evals.json`; the diff touches no eval file."
2. **Root cause.** The run's twelve phrasings were not committed; Lam Ngoc Khuong confirmed they were not saved (answer to the review's open question; a search of the scratch and home directories found none).
3. **Evidence.** `git diff --stat 35b08c9 6ad70f4 -- '*.json'` printed nothing; `plugins/atk/skills/fix/evals/trigger_evals.json:7` holds only "this test started failing and I do not know why".
4. **Why now.** Broken since `6ad70f4`.
4b. **Recorded intent.** `docs/trigger-eval-measurement.md` asks that a measurement be repeatable; nothing contradicts adding cases.

### S3. Twenty-four descriptions unmeasured, not said

1. **Symptom.** From the review: "The PR says 'descriptions only, measured to trigger the same', which reads as covering all 27."
2. **Root cause.** The measurement section and the ADR describe the three-skill run but do not say the other 24 changed without one.
3. **Evidence.** `docs/trigger-eval-measurement.md:120-142` and the ADR's Evidence section at `6ad70f4` name `review`, `qa`, `fix` only and say nothing about the rest.
4. **Why now.** `6ad70f4`.
4b. **Recorded intent.** Lam Ngoc Khuong chose to state the gap and file the run rather than measure before merging.

### S4, N7. Nothing checks the three-language evals

1. **Symptom.** From the review: "An edit that drops every Vietnamese or Japanese positive from one skill's evals passes every check."
2. **Root cause.** `tests/verify.sh:595-630` at `6ad70f4` checks parse, single-claim positives and description length only.
3. **Evidence.** The red test below, under The change: a copy with `qa`'s Japanese positives removed and a Vietnamese phrase in `git`'s description passed every check at `6ad70f4`.
4. **Why now.** `6ad70f4`.
4b. **Recorded intent.** The ADR names the evals as the check; nothing records a choice not to verify them.

### S5. Stale "three trigger languages"

1. **Symptom.** `docs/codebase-summary.md:200-201`: "in all three trigger languages".
2. **Root cause.** The sentence was not updated with the rule.
3. **Evidence.** The quoted line, and its mirror "bằng cả ba ngôn ngữ trigger".
4. **Why now.** `6ad70f4`.
4b. **Recorded intent.** None needed.

### N1-N6, N8, N10, N13-N15

Wording and layout findings, each proved by the lines the review cites, quoted on the explanation page `docs/derived/catchup/documents/261106-1017-review-report.md` (not committed). N2's numbers were recounted at `35b08c9` with `tests/verify.sh`'s counting: 19,841 characters plus 25 separators gives 19,866, the trigger lists 6,964 plus 25 gives 6,989, and 3,396 characters were removed. Counted as bytes the total would be 21,485, so the unit is characters. N8 was answered by retyping the commit `fix:` during the rebase.

## 5. The change

The B1 fix sits in the rebased commit `a9043c9`, which also retypes the commit `fix:` for N8. The ADR and its mirror are renamed 0015, with both titles and every citation in both languages. `CLAUDE.md`'s ADR row now names 0014 as the benchmark and 0015 as this decision. The rows of both codebase summaries were resolved, and the mirror count was counted at twenty-five. The rest is uncommitted on top of it:

- **S1, N9, N11, N10.** The `CLAUDE.md` trigger section and the `CONV-006` row require positives in all three languages for every skill, including a new one. They let a wrong case be corrected, and name the Tech Lead's fallback where English cannot be sharpened. `draft-cases.md` drafts positives in the languages the project's conventions name for evals. `project-conventions.md:57` carries the eval half. The ADR in both languages matches.
- **S4, N7.** A `tests/verify.sh` check fails an eval file with no Vietnamese or no Japanese positive, and a description holding a Vietnamese or Japanese letter. `CLAUDE.md`'s list of checks names it.
- **S2, N12.** Four positives each were added to `review`, `qa` and `fix`. They are rewritten forms of the measured kinds, not the measured text, and include a Vietnamese request typed without diacritics and a kana-only Japanese one.
- **S3.** `CLAUDE.md`, the ADR, the measurement doc and both codebase summaries say that 24 descriptions are unmeasured and that a follow-up issue holds that run.
- **S5, N1 to N6, N13 to N15.** Wording in the codebase summaries, the ADR, the measurement doc, the PDR and the roadmap, all in both languages. The re-wrapping is in `convention/SKILL.md` and `CLAUDE.md`.

The changes are the smallest that close each finding. No public contract moved: the edits are to this repository's rules and docs, and every English document moved with its `docs/vi/` mirror.

Tidy: `/simplify`, with two agents on the `tests/verify.sh` block. It made the description be read with the 1,024-character check's own regex and `assert`, and narrowed the Vietnamese class to letters only Vietnamese marks. Merging the block into the existing blocks was skipped, since those lines sit outside the fix. A note that the check "contradicts CLAUDE.md" was skipped too: it read `main`'s `CLAUDE.md`, not this branch's. The red test was re-run after the tidy, with the same result.

## 6. Verified

| Layer | Command | What it proves |
|-------|---------|----------------|
| content, docs, hooks | `bash tests/verify.sh` | 86 lines OK, exit 0, before the review and again after round 1. The mirror, the parse, the single-claim positives and the new eval-language check all pass on the tree |
| the new check | the check's block run on a scratch copy with `qa`'s Japanese positives removed and a Vietnamese phrase in `git`'s description and a Japanese one in `plan`'s | `AssertionError` naming all three. Before the fix the same copy passed every check, which is the S4 reproduction, and now it fails |
| CONV-003, -004, -011 | the em-dash, `ak:` and `atkx` greps | print nothing for the changed files |

B1's reproduction, the conflict, is gone: the branch now sits on `1a6d6e2`. `git ls-tree` shows 0014 as the benchmark and 0015 as this ADR. The round 1 reviewer checked every 0014 and 0015 citation in the tree.

## 6b. Reviewed

- Round 1: `docs/derived/reviews/docs-english-only-triggers-worktree-261106-1049.md`, band 1, one reviewer agent. 0 BLOCKING, 1 SHOULD FIX, 4 NIT. B1, S1, S2, S4, S5 and N1 to N15 were closed. S3 was kept for the codebase summary rows and fixed in the loop.
- Round 2: `docs/derived/reviews/docs-english-only-triggers-worktree-261106-1055.md`. 0 BLOCKING, 1 SHOULD FIX, 4 NIT. S3 was closed for the rows and stays open for the PR body, carried forward in section 9. N16 to N19 were left as `NIT`s.
- Closing read: there was nothing to read, since nothing was fixed after round 2.
- `atk:verify` was not offered, because the profile's Verify section says nothing runs in this repository.

## 7. Not verified

- Whether the English descriptions route Vietnamese and Japanese requests correctly for the 24 unmeasured skills. That needs a paid trigger run (S3, section 9).
- Whether the new eval cases pass. They were not run. The two `fix` cases of the "test suddenly failing" kind are expected to miss until the `atk:fix` description gap is closed.
- CI runs nothing for content in this repository. `tests/verify.sh` is the gate, and it was run by hand.

## 8. Blast radius

- `tests/verify.sh` is run by maintainers only, and was exercised.
- `plugins/atkx/skills/skill-eval/references/draft-cases.md` is read by `atkx:skill-eval --draft-cases` in any project. The new rule adds languages only where a project names them, and was not exercised.
- `plugins/atkx/skills/skill-eval/references/project-conventions.md` is only an example row, and was not exercised.
- `plugins/atk/skills/convention/SKILL.md` only had its description re-wrapped. Its folded text is unchanged, as checked by the 1,024-character check that reads it. Exercised.
- The three eval files are read by `tests/verify.sh`, which was exercised, and by `atkx:skill-eval --trigger`, which was not run.

## 9. Left for later

- An issue for running the trigger evals of the 24 unmeasured descriptions, at least `verify`, `plan`, `design-doc`, `spec`, `security`, `git`, `release` and `doc-audit` with both plugins loaded, at base and head. Owner: Lam Ngoc Khuong. Offered at step 7 and not opened then; the docs say "a follow-up issue" until one exists (S3).
- An issue for the `atk:fix` description gap: a test that suddenly started failing, asked in Vietnamese or Japanese, reaches no skill. Three runs before the description changes. Owner: Lam Ngoc Khuong. Offered at step 7 and not opened then (S2).
- Once the two issues exist, `CLAUDE.md`, the ADR and the measurement doc can cite them by number. They now say "a follow-up issue".
- The PR #182 body: change the checklist line to "descriptions only; `review`, `qa` and `fix` measured to trigger the same, the other 24 unmeasured" and drop "hence `refactor:`". Change the "Not measured" line to "the other 22 `atk` skills and both `atkx` skills". This is S3 as round 2 kept it. Owner: Lam Ngoc Khuong.
- N16: `docs/trigger-eval-measurement.md:149-150` and its mirror name `review` among the unmeasured; it was measured.
- N17: the `tests/verify.sh` row of both codebase summaries omits the new check.
- N18: `CLAUDE.md:585-586` says a missing positive in any of the three languages fails; only a missing Vietnamese or Japanese one does.
- N19: the description half of the check misses Vietnamese marked only with Latin-1 letters ("xem giúp"); flag `[À-ÿ]` in descriptions only.
- Nothing else holds the new Japanese class to Japanese rather than Chinese; the evals hold no Chinese, so it was left.

## 10. Findings answered

All answered by Lam Ngoc Khuong, the PR author. The review was a local report with no thread on the PR, so nothing has been posted yet.

| ID | Answer | Reason or place | Reply |
|----|--------|-----------------|-------|
| `B1` | `fixed` | `a9043c9`, block B1 above | not posted, pending the push |
| `S1` | `fixed` | block S1 above | not posted, pending the commit |
| `S2` | `fixed` | block S2 above; the `atk:fix` gap issue is in section 9 | not posted, pending the commit |
| `S3` | `fixed` | block S3 above; the PR body and the measurement issue are in section 9 | not posted, pending the commit |
| `S4` | `fixed` | block S4 above | not posted, pending the commit |
| `S5` | `fixed` | block S5 above | not posted, pending the commit |
| `N1`-`N15` | `fixed` | block N1-N15 above; N7 with S4, N9 and N11 with S1, N12 with S2, N8 in `a9043c9` | not posted, pending the commit |
