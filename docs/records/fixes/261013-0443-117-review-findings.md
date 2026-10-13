---
title: "Fix: the rest of the review of PR #117, where a moved reference document was still not checked for truth and the step-6 draft had loose ends"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-13
updated: 2026-10-13
ticket: https://github.com/lamngockhuong/aiteamkit/pull/117 (findings S6 to S9, S11 to S13, S15 to S19 and N9 to N24 of `docs/derived/reviews/117-261013-0412.md`)
---

# Fix: the rest of the review of PR #117

## In short

The review of PR #117 found that half of the PR's own acceptance was missing. `shared/spec-docs.md`
now asks for a moved reference document to be true, but `atk:review` still asked only that the
document came along: a fix whose new contract sentence one branch of the code does not honour would
still pass a review. It also found four loose ends in the report draft `atk:fix` now writes before
its review: the log could read as finished, the draft was reviewed as part of the change, it carried
`IN REVIEW` while half written, and it reached reviewer agents unmasked.

The commit on the branch, `78f60e7`, already carried S10, S14 and S20. Lam Ngoc Khuong chose the
scope of this run, every remaining `SHOULD FIX` and `NIT`, and one reading: under `Contract: first`
the line beside a sentence one branch does not honour yet is the not-implemented mark, so a document
at `implemented: yes` goes back to `partial` with it (S11). The self-review then raised three more,
each settled by the maintainer and fixed: S21, a mark shields only the branch its line names once
the diff implements the item; S22 and S23, a document in another repository reaches the review as a
second masked diff, narrowed by the caller to the document's own hunks. The S23 fix came after the
last review call and has not been reviewed again.

Four corrections belong to the previous record, `docs/records/fixes/261012-0950-fix-self-review.md`.
It is committed, so per `plugins/atk/shared/artifact-paths.md` it is not edited; they are stated here
and go into the pull request body:

- **S18.** Its section 6 says the verification block proves `docs/` and `docs/vi/` mirror and that
  manifests, hooks, labeler, secret scan and skill-eval are unchanged. The block compares the two
  file lists, not their content, which was read by hand; and a green run shows those checks pass,
  not that the files are unchanged.
- **S19.** Its section 7 omits what no check catches: a stale step number, the spelled-out
  shared-file count in three files, and the mention count, which rests on a script it did not name.
  The script is in section 3 below.
- **N18.** "The Definition of done gains three items": two were added and one was extended.
- **N20.** Its "as captured" block was edited beyond removing the client's details, punctuation and
  backticks included. It is quoted, with the client's details removed, rather than verbatim.

## 1. Symptom as captured

The findings as `docs/derived/reviews/117-261013-0412.md` states them, on head `1af0ea7`; the branch
head `78f60e7` is the same change plus S10, S14 and S20. Quoted from its summary:

```
Verdict: nothing blocks on the evidence available. 0 `BLOCKING`, 15 `SHOULD FIX`, 16 `NIT`.
- Half of the PR's own criterion (c) is missing. `spec-docs.md` now says `atk:review` checks that
  the document is true, but `atk:review`'s own text, the `contract` round row and step 4's
  `BLOCKING` rule, still asks only that the document came along (S6).
- The new step-6 draft report has four loose ends. Written at its final path before the review, it
  can make the progress log look finished (S7), is reviewed as part of the `--worktree` diff (S8),
  carries `IN REVIEW` while half-written (S9), and reaches reviewer agents unmasked (S13).
```

The remaining findings, S11, S12, S15 to S19 and N9 to N24, are in that report with their lines.

## 2. Root cause

One mechanism behind most of them: PR #117 moved the document step and the report draft before the
review, in `plugins/atk/skills/fix/SKILL.md` step 6, without carrying that move through the files the
review and the progress log read.

- **S6:** `plugins/atk/skills/review/SKILL.md:142-145` raised `BLOCKING` only when "neither the
  document nor a stated skip came with it"; the `contract` row at
  `plugins/atk/skills/review/references/review-rounds.md:48` asked only for the change to be
  "reflected in the docs"; the DoD at `review/SKILL.md:295` the same.
- **S7, S17:** `plugins/atk/shared/artifact-paths.md:348` closes a log with a bare artifact path, and
  `fix/SKILL.md:187` logged the draft path bare; a review-round entry was "its time and its result",
  so a resume could not name the first report or the touched files.
- **S8, S13:** `review-rounds.md:368-370` reads an uncommitted change through `--worktree`, which
  carries untracked files; nothing kept the draft out, and only `diff.patch` is masked.
- **S9:** `fix/references/report-template.md:23-27` opens every report at `IN REVIEW`; step 6 named
  no status for its draft.
- **S11, N16:** `plugins/atk/shared/spec-docs.md:217` exempted only the not-implemented mark, and
  named no source for "the person who decides".
- **S12:** no route took a document in another repository to the review.
- **S15, S16:** section 6b of the template listed no escalated outcome and no mark for a fix made
  after the last call.
- The `NIT`s are wording and citer lists, each at the lines the review gives.

## 3. Evidence

Quoted lines with the check that shows them, read at `78f60e7` before any edit (one hypothesis per
finding, none ruled out):

```
review/SKILL.md:142  Raise a `BLOCKING` finding when a contract moved and neither the document nor
review/SKILL.md:143  a stated skip came with it; ...
review-rounds.md:48  | `contract` | ... | Public behavior change is reflected in the docs that describe it; ...
artifact-paths.md:348  - **Last line.** The path of the artifact the run wrote, or `no artifact:` and why.
fix/SKILL.md:187     section asks for, and the path goes into the progress log so a resume finds it.
report-template.md:23  status: IN REVIEW
spec-docs.md:217     gap is closed in the same change. A sentence the code does not honour, outside the not-implemented
spec-docs.md:218     mark of Whether the code exists yet above, is drift ...
```

Check: a fix whose new sentence one branch does not honour carries the document, so step 4's
condition is false and no line of `review` raises it; a log whose last line is the bare draft path
matches the "last line" rule, so `atk:help` row 5 does not fire.

Mention count for S19, which gives 181 mentions in 109 ordered pairs at `78f60e7` and after this
change:

```
python3 -c "
import glob,os,re
skills={os.path.basename(os.path.dirname(f)) for f in glob.glob('plugins/atk/skills/*/SKILL.md')}
n=0;pairs=set()
for s in skills:
    for m in re.finditer(r'atk:([a-z-]+)', open('plugins/atk/skills/%s/SKILL.md'%s).read()):
        o=m.group(1)
        if o in skills and o!=s: n+=1; pairs.add((s,o))
print(n,len(pairs))"
```

## 4. Why it surfaced now

PR #117 (`1af0ea7`, then `78f60e7`) introduced step 6 of `atk:fix` and the truth clause of the sync
obligation. The review side and the progress log predate it and were never updated with it. N13's
summaries and N17's precondition date from before the PR.

## 4b. Recorded intent, and the conflict when there is one

Searched `docs/records/fixes/261012-0950-fix-self-review.md`, `docs/derived/feedback/fix-261012.md`,
the PR body and `plugins/atk/shared/review-fix-loop.md`. Acceptance (c) of the PR asks that
`atk:review` checks the document is true, which S6 completes. The loop's rule that a `NIT` is never
fixed governs the loop's own calls; this run fixes a pull request review at the maintainer's request,
as the run on PR #116 did. No conflict.

## 5. The change

Text only, in the files each finding names: `atk:review` step 4, its DoD and the `contract` row ask
for the document to be left true and cite The sync obligation (S6, S21); `shared/spec-docs.md` makes
the line beside an unhonoured branch the not-implemented mark under `Contract: first` and names the
approver as the default decider (S11, N16); `shared/artifact-paths.md` labels a path logged before
the closing step and has a review-round entry name its report and the files its fixes touched (S7,
S17); `shared/review-fix-loop.md` keeps the draft as intent, masks it once written, routes a document
in another repository as a second masked diff narrowed to the document, treats a declined review or
one with no report as `--no-review`, and marks fixes after the last call as unreviewed (S8, S12, S13,
S16, S22, S23, N15); `review-rounds.md` holds the review side of the same rules; `atk:fix` step 6
writes the draft at `DRAFT`, step 7 sets `IN REVIEW`, and the report template gains the escalated
outcome (S9, S15); the `NIT`s are wording, citer lists, and "and leave it true" in every summary of
the obligation, mirrors included (N9 to N24). No `SKILL.md` grew past its limit: `review` 299 lines,
`fix` 285.

Tidy: `/simplify` with four read-only agents over the tracked diff, after `mask --worktree` masked
nothing. Applied: citations in place of four restatements of the truth rule and of the progress-log
and `TBD` rules, shorter wording in nine places, the draft masked once rather than before every
call. Skipped: dropping the per-round touched-file list, which the second call needs; the status
words in step 6 and 7; moving the Team-section rule into the loop.

Reference documents: the change is to the kit's own content and alters no public contract in the
sense of `plugins/atk/shared/spec-docs.md`.

## 6. Verified

- **Content, docs, hooks:** the whole "Common verification commands" block of `CLAUDE.md`, run after
  the tidy, after round 1's fixes and after the S23 fix: 67 `OK` lines, nothing else, exit 0. That
  proves the checks pass; the content of `docs/` against `docs/vi/` was read by hand, since the block
  compares only the file lists.
- **Greps:** the em-dash, `ak:`, `atkx` and fill checks print nothing.
- **Count:** the script in section 3 gives 181 mentions in 109 pairs, unchanged, since no
  `atk:` mention between `SKILL.md` files was added.
- **Reproduction re-run:** the quoted lines of section 3 now read as the findings ask:
  `review/SKILL.md` step 4 raises an untrue document, the draft is logged with its label, the
  template opens the draft at `DRAFT`.

## 6b. Reviewed

- **Round 1** (`docs/derived/reviews/fix-skill-self-review-261013-0730.md`, band 1, 160 lines, one
  agent): 24 of the 26 findings closed, N15 in part; 0 `BLOCKING`, 2 `SHOULD FIX`. `S21` fixed after
  Lam Ngoc Khuong decided the mark shields the branch its line names; `S22` fixed.
- **Round 2** (`docs/derived/reviews/fix-skill-self-review-261013-0745.md`, band 1, 35 lines, one
  agent): S21 and S22 closed; 0 `BLOCKING`, 1 `SHOULD FIX`. `S23` fixed after Lam Ngoc Khuong chose
  the caller narrowing, **after the last call: fixed and not reviewed again**. The ceiling was
  reached and no third round ran.
- **`NIT`s:** N15 (the DoD half), N25 to N35 are left for the author, as the loop requires; listed in
  section 9.
- **`atk:verify`:** not offered. This repository has nothing that runs; section 6 stands in.

## 7. Not verified

- The S23 fix, made after the last review call, was checked by the verification block only.
- No check exercises a second diff from another repository; S22, S23 and N32 to N34 rest on reading.
- The two new trigger cases of `fix` parse, but the description was not measured.
- Nothing re-derives a "Cited by" list, a spelled-out count of shared files, or a step number; those
  were checked by reading (the convention gap below).

## 8. Blast radius

Every reader of the changed rules, each read against the new text:

- `atk:help` row 5 (`plugins/atk/skills/help/references/state-signals.md:46`) defers to Progress log,
  so a log ending in a labelled draft entry still reads as unfinished: read.
- `atk:implement` steps 1, 5 and 6 cite the same loop and progress log: read.
- `atk:verify` and `shared/finalize-steps.md`, which carry the sync obligation: read.
- `atk:spec --sync` and `--check`, which take marks off: not changed, and the narrower shield of S21
  applies only in `atk:review`; not exercised.

## 9. Left for later

- `N22`: two trigger cases were added to `plugins/atk/skills/fix/evals/trigger_evals.json`; the
  description was not measured per `docs/trigger-eval-measurement.md`, which costs sessions.
- The `NIT`s of the self-review, for the author: N15 (the DoD item does not name a declined review),
  N25 (a draft in an ignored directory is not in `--worktree`), N26 (the intent draft shares the
  `Not counted` row with generated files), N27 (the mark rule for a `screen` document under
  `Contract: code`), N28 ("Cited by" lists lag `CLAUDE.md`), N29 (`finalize-steps.md` "found done"
  wording), N30 (template "loaded in step 7"), N31 (`skill-chain.md` antecedent), N32 (the second
  diff's `masked.txt` does not reach `rules`), N33 (agent prompt names one `diff.patch`), N34 (who
  deletes the second diff), N35 (`spec-docs.md` does not ask the line to name the branch). Each is in
  `docs/derived/reviews/fix-skill-self-review-261013-0745.md` with its lines.
- The review's convention gap: no rule says a count a document spells out is re-derived by a
  command. Owner: Lam Ngoc Khuong, through `atk:convention`.

No reference document is owed: the change is to the kit's own content, which has no public contract
in the sense of `plugins/atk/shared/spec-docs.md`.
