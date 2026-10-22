---
title: "Fix: the review of PR #144, where orchestrate's SKILL.md passed 300 lines and a Differences table read as a feature plan's whole section"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-22
ticket: https://github.com/lamngockhuong/aiteamkit/pull/144 (findings B1, S10, S11, S12 and N8 of the review of PR #144, 2026-10-22 08:08)
---

# Fix: the review of PR #144

## In short

A feature plan that adds one sandbox environment holds a one-row `### Environments` table under
`Differences from the master plan`. Reading a section matched that sub-heading as the feature plan's
own `Environments` section, so `atk:run-cases` offered the sandbox alone and `--env staging` matched
nothing (S10). Step 1 of Reading a section now counts only a top-level heading, and says the
Differences tables are applied in step 2 alone; `environment-safety.md` says the same. The same step
now gives a feature's Entry as the master plan's Entry together with the feature plan's (N8).

The stacking rule for the master test plan job had pushed `orchestrate/SKILL.md` to 304 lines (B1),
covered only a piece with no worktree yet (S11), and never looked for a master plan an earlier run
left on an unmerged branch (S12). It now sits in `references/proposal.md` under The master test plan,
with the look at earlier runs' worktrees and branches, and `SKILL.md` points at it in one sentence,
at 299 lines. A piece with no worktree is stacked on the master plan's branch; a piece whose worktree
already exists is never merged into by the coordinator: its chain waits on the QA lead, who brings
the master plan into its branch, a choice Lam Ngoc Khuong made after the second review round.

Two review rounds ran. Round 1 closed all five findings and raised S13 to S16, all fixed. Round 2
closed those and raised S17 to S19 against the coordinator's merge; the merge was dropped, which
removes what they rest on, and that last change was read by no review. The Tech Lead, Lam Ngoc
Khuong, approves.

## B1. `orchestrate/SKILL.md` is 304 lines

### 1. Symptom as captured

```
$ wc -l plugins/atk/skills/orchestrate/SKILL.md
304 plugins/atk/skills/orchestrate/SKILL.md
```

On `main` it is 299. `CONV-006`: "A `SKILL.md` stays under 300 lines". `tests/verify.sh` counts no
lines, so it printed every line `OK`.

### 2. Root cause

The stacking rule for the master test plan job, five lines added to step 1 after the last review,
`plugins/atk/skills/orchestrate/SKILL.md:98-103` at `62d12eb`, put the detail of one row in the skill
body rather than in `references/proposal.md`, which owns how pieces are ordered.

### 3. Evidence

The `wc -l` above, a direct reproduction.

### 4. Why it surfaced now

`62d12eb` "feat: split the atk:qa test plan into a master test plan and per-feature plans".

### 4b. Recorded intent

No design record or ADR covers the master test plan; the stacking rule was written in this pull
request. Searched `docs/records/design/`, `docs/adr/`, and the commits on the branch.

### 8. Blast radius

`plugins/atk/shared/state-signals.md:68`, row 13, which restates the rule in its Next cell.

## S10. A Differences table is read as the feature plan's whole section

### 1. Symptom as captured

From the review: a feature plan that adds one sandbox environment holds
`## 2. Differences from the master plan` with a `### Environments` table of one row. Step 1 matches
"a heading by its name with any leading number ignored" and takes "the feature plan's own section of
that name, whole", so step 2 is never reached; `atk:run-cases` offers only the sandbox row, and
`--env staging` matches nothing. A second `Performance` row under `### Test types` drops the
project's other test types the same way.

### 2. Root cause

Reading a section step 1, `plugins/atk/skills/qa/references/test-plan-template.md:259-264` at
`62d12eb`, matches a heading of any level, and the feature plan template puts headings of the same
names, `### Test types`, `### Environments`, `### Compatibility`, under Differences
(`test-plan-template.md:181-194`). `plugins/atk/skills/run-cases/references/environment-safety.md:12-15`
repeats the ambiguity.

### 3. Evidence

Quoted lines, `test-plan-template.md:256-260` at `62d12eb`:

```
criteria, or Defect severity finds it in this order, matching a heading by its name with any leading
number ignored:

1. **The feature plan's own section of that name, whole.** A plan written without a master plan, or
```

and `test-plan-template.md:175-186`, the feature plan template:

```
## 2. Differences from the master plan
...
### Environments
```

Check: `### Environments` is a heading named `Environments` with no leading number, so it satisfies
the match in step 1, and nothing in step 1 excludes a heading nested under Differences.

### 4. Why it surfaced now

`62d12eb`, which introduced both the Differences tables and Reading a section.

### 4b. Recorded intent

None found beyond the template itself, whose Differences section says the tables hold "only the rows
this feature adds or replaces", which the fix carries out.

### 8. Blast radius

Readers of Reading a section: `plugins/atk/skills/run-cases/references/environment-safety.md:11`,
`plugins/atk/skills/qa/references/test-run.md:37`, `plugins/atk/skills/release/SKILL.md:105`.

## S11. The stacking rule gives a new worktree to a piece that already has one

### 1. Symptom as captured

From the review: the usual piece at row 13 was written by an earlier run, since its requirement's
approval happens between runs, so it already has a worktree and branch. "gets its worktree once the
master plan is committed, stacked on that branch" cannot apply to it, and the waits of Pieces that
share files only make an existing worktree's jobs wait, which does not bring the master plan into its
tree.

### 2. Root cause

`plugins/atk/skills/orchestrate/SKILL.md:100-103` at `62d12eb` covers only a piece with no worktree;
`plugins/atk/skills/orchestrate/references/proposal.md:172-176` makes an existing worktree's jobs
wait and says nothing about the master plan reaching that tree.

### 3. Evidence

Quoted lines, `SKILL.md:100-103` at `62d12eb`: "it gets its worktree once the master plan is
committed, stacked on that branch". Check: step 1's Where it is read, `SKILL.md:105-108`, reads a
piece in the worktree a previous run left, so such a piece reaches row 13 with a worktree, and no
sentence covers it.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None beyond the rule itself; the fix keeps it for a piece with no worktree.

### 8. Blast radius

`plugins/atk/shared/state-signals.md:68`, which said the other pieces start "on top of it".

## S12. A later run proposes `--master` again (`PLAUSIBLE`)

### 1. Symptom as captured

From the review: run 1 writes `docs/qa/master-test-plan.md` on piece 1's branch, which waits for a
push and merge. Run 2, started before that merge with a new piece at row 13, reads the project-wide
rows once per run, and on its base no master plan exists, so it proposes `atk:qa --master` again: two
master plans on two branches, the same questions to the PM and Tech Lead twice, and a conflict at
merge.

### 2. Root cause

`plugins/atk/skills/orchestrate/SKILL.md:96-100` at `62d12eb` says the project-wide rows are read
once per run without saying from which tree, and nothing has the master plan check consult the
worktrees and branches earlier runs recorded.

### 3. Evidence

Quoted lines, `SKILL.md:96-100`; `grep -n -i "master" plugins/atk/skills/orchestrate/references/*.md`
at `62d12eb` prints no line about where a master plan is looked for. The reviewer marked it
`PLAUSIBLE`: settled by reading, not by two runs.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None.

### 8. Blast radius

`plugins/atk/skills/orchestrate/references/worktrees.md`, Reading a piece, which the new paragraph
cites for how an earlier run's worktree or branch is read.

## N8. The master plan's default Entry is never read

### 1. Symptom as captured

From the review: the master plan's Entry and exit is "the defaults every feature plan starts from",
and the feature plan's Entry asks only for "the accounts this feature needs beyond the master
plan's", but Reading a section said "its Entry is always the feature plan's", so a reader got only
the extras.

### 2. Root cause

`plugins/atk/skills/qa/references/test-plan-template.md:262` at `62d12eb`.

### 3. Evidence

Quoted lines: `test-plan-template.md:101` "The defaults every feature plan starts from.",
`test-plan-template.md:221` "the accounts this feature needs beyond the master plan's", and
`test-plan-template.md:262-263` "its Entry is always the feature plan's". The three cannot all hold.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None.

### 8. Blast radius

No skill reads Entry mechanically today, per the review.

## 5. The change

- B1, S11, S12: the stacking detail left step 1 of `plugins/atk/skills/orchestrate/SKILL.md` for a
  paragraph of its own, The master test plan, in `references/proposal.md` under Pieces that share
  files: the job proposed once per run; a master plan on an earlier run's worktree or branch not
  proposed again; a piece with no worktree stacked on it; a piece with a worktree parked on the QA
  lead, who merges or rebases it in. Row 13 of `shared/state-signals.md` no longer says the pieces
  start "on top of it". `SKILL.md` is 299 lines.
- S10, N8: step 1 of Reading a section in `qa/references/test-plan-template.md` takes a heading of
  that name anywhere but under Differences from the master plan, and gives Entry as the master
  plan's together with the feature plan's; `run-cases/references/environment-safety.md` says the
  same of `Environments`.
- Both codebase summaries name the new paragraph in the `proposal.md` row.

Every change is to a rule an agent follows, in the form **Correct** of `shared/review-fix-loop.md`:
a sentence reworded or moved so that it says what was meant, no rule added beside it. Tidy: run by
hand per `shared/tidy-pass.md`, since the diff is prose; it changed nothing. Reference documents:
no public contract of a project changed.

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command: 76 lines, every one `OK`, after the first fix,
  after round 1's fixes, and after the last change. It proves the manifests, names, mirrors and
  citations hold; it reads none of this prose.
- `wc -l plugins/atk/skills/orchestrate/SKILL.md`: 299, the reproduction of B1, which no longer
  reproduces.
- The em-dash and `ak:` checks of `CLAUDE.md`: nothing printed.
- The other reproductions are readings of the quoted lines, re-read after the change by both review
  rounds.

## 6b. Reviewed

Band 1, one reviewer agent each round, nine rounds and the sweep.

- Round 1, `docs/derived/reviews/fix-144-worktree-261022.md`: B1, S10, S11, S12, N8 closed; 0
  `BLOCKING`, 4 `SHOULD FIX`, 1 `NIT`. S13 to S16 fixed: S13 the heading wording, S14 the other
  worktree route dropped, S15 a coordinator's merge with the base recorded, S16 every piece at the
  row named. N9 (`tests/verify.sh` counts no `SKILL.md` lines) left as a `NIT`.
- Round 2, `docs/derived/reviews/fix-144-worktree-261022-r2.md`: S13 to S16 closed, nothing
  reopened; 0 `BLOCKING`, 3 `SHOULD FIX`, 2 `NIT`. S17 (the merge skips the commit route of
  `worktrees.md`), S18 (the wait for a merge into the base never ends) and S19 (the Definition of done
  forbids the merge) all rest on the coordinator's merge. Lam Ngoc Khuong chose to drop it: the
  piece's chain waits on the QA lead, who makes the merge or rebase. **Fixed after the last call,
  not reviewed again.** N10 (the merge question) has no subject left; N11 (an appositive in
  `environment-safety.md:12-15`) left as a `NIT`.

`atk:verify` not offered: the profile says nothing in this repository runs.

## 7. Not verified

- The change after round 2, the paragraph for a piece whose worktree exists, was read by no review.
- No `atk:orchestrate` or `atk:run-cases` run exercised the new wording; S13 and S16 were
  `PLAUSIBLE`, settled by such a run.
- The trigger evals were not measured, as before.

## 9. Left for later

- The trigger evals of `atk:qa` were not measured, as the pull request body already says.
- N9: a `tests/verify.sh` check that every `SKILL.md` stays under 300 lines.
- N11: the appositive in `run-cases/references/environment-safety.md:12-15`.
- Nothing else. No reference document is owed: the change is to the kit's own rules, not a public
  contract of a project.
