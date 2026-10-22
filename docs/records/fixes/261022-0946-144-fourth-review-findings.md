---
title: "Fix: the review of PR #144 at 89be83f, where an outside master plan reached no approver and the master plan job sat on a piece's branch"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-22
ticket: https://github.com/lamngockhuong/aiteamkit/pull/144 (findings S20 to S33 and N12 to N45 of the review of PR #144, 2026-10-22 09:00)
---

# Fix: the review of PR #144 at `89be83f`

## In short

Take a team that keeps its master test plan in a wiki and names it in `.atk/overrides/qa.md`. At
`89be83f`, `atk:qa --master` told it the plan was "written" there while Writing it said it writes
nothing, a run with write tools on the wiki could edit the PM's thresholds with no approval (S20),
a password in the wiki's `Data` column reached `atk:run-cases` with no rule for it (S21), `atk:help`
and `atk:orchestrate` never saw the plan and kept proposing `--master` (S22), and the override line
had no place in an override and no approval rule (S23). The line now has a section of its own in
`shared/project-overrides.md`: `Master test plan: <location>` in `## Before` of the `qa` override,
read by five named skills, applied only from `APPROVED`. `--master` never writes through a
connection and shows each change as an open question for its owner; a credential found in a plan
read through a connection is never used or quoted; `atk:help` and `atk:orchestrate` read the line,
and an outside plan counts as present.

The `--master` job of `atk:orchestrate` committed on the first piece's branch, so any piece stacked
on it carried that piece's work (S27); the other pieces waited for a commit rather than an approval
(S26); a master plan merged into the base after a worktree was cut was covered by nothing (S28); and
the QA lead's merge was not recorded (S29). Lam Ngoc Khuong chose, before any edit, a branch of its
own for the job, cut from the run's base. Pieces now wait for the master plan's `APPROVED`, a tree
lacking a plan the base holds is handled like an existing worktree, and the `HEAD` after the QA
lead's merge or rebase is recorded as the piece's last commit.

Older feature plans no longer have the master Entry merged into theirs (S24), step 5 of `atk:qa`
writes the feature shape (S25), the QA row of the role defaults no longer lets the QA lead accept
the master plan (S30), the master plan resolves against the project's docs root (S31), and the
skills overview gives exit criteria and severity to the PM (S33). Twenty-two `NIT` items are fixed
in one clause each. S32 needs a trigger measurement and is left for later, with N28 to N32 by the
Tech Lead's choice. N12 to N17 point at the committed fix record `261022-0812`, which the kit never
edits once committed, so their corrections are in section 9b here.

Two review rounds ran. Round 1 closed all but S26 and raised S34 to S36, each in how
`atk:orchestrate` waits on the master plan or finds the override line; all four were fixed. Round 2
closed them and raised S37, from the S36 fix itself, which was fixed after the last call and read by
no review. Twelve `NIT` items from the two rounds are left. Lam Ngoc Khuong is the approver.

## Decisions taken before the fix

Asked at 09:52, answered by Lam Ngoc Khuong, the author and Tech Lead, the two open questions of the
review:

- A master test plan kept outside the repository is supported now, so S20 to S23 are fixed rather
  than the shape removed.
- The `--master` job runs on a branch of its own off the run's base (S27), which decides S26 and S29.
- `NIT` items that are one clause are fixed; N28 to N32, which add a check, an eval or a behaviour,
  are left for later.

## S20. An outside master plan is described as written, and its changes reach no approver

### 1. Symptom as captured

`plugins/atk/skills/qa/SKILL.md:176` at `89be83f`:

```
The master test plan at `docs/qa/master-test-plan.md`, or where the override says the team keeps it,
```

`plugins/atk/skills/qa/references/test-plan-template.md:140-142`:

```
Where the master plan is kept outside the repository, `--master` writes nothing into `docs/qa/`: it
reads that plan, shows the changes it would make, and leaves them to the plan's owner, since a second
copy in the repository would disagree with the one the team keeps.
```

### 2. Root cause

The Output line says a file is written at the outside location, and Writing it forbids a write into
`docs/qa/` only, so nothing stops a write through the connection, and "leaves them to the plan's
owner" names no approver for each value.

### 3. Evidence

The two quoted passages. Check: nothing in `test-plan-template.md` or `host-capabilities.md` at
`89be83f` forbids `--master` writing through a connection; `grep -n "through a connection"
plugins/atk/skills/qa/references/test-plan-template.md` finds only the read at `:250-251`.

### 4. Why it surfaced now

`62d12eb`, which introduced the master test plan and its outside location.

### 4b. Recorded intent

None for the outside shape beyond `62d12eb` itself; the Tech Lead confirmed it is supported now.

### 8. Blast radius

`atk:qa --master` only. Exercised by reading.

## S21. A password in an outside plan's `Data` cell reaches the session

### 1. Symptom as captured

`plugins/atk/skills/run-cases/references/environment-safety.md:148-149` at `89be83f`:

```
A credential found where it should not be, in a page, a response, or the cases file itself, is
reported in the session by kind and place, never by value,
```

### 2. Root cause

The rule lists three places and no plan read through a connection, and the `Data` row of the column
table (`:29`) says the run takes the test accounts from that cell without saying a credential is not
among them. A committed plan never held one, because the secret scan keeps it out.

### 3. Evidence

The quote and `:29`. `PLAUSIBLE` in the review: no run against an outside plan holding a password
was made here either.

### 4. Why it surfaced now

`62d12eb`, which let `atk:run-cases` read environments from an outside master plan.

### 4b. Recorded intent

Rule 9 of `shared/team-roles.md`: a credential is used, never quoted. A credential the run was not
given is not used either. No contradiction.

### 8. Blast radius

`atk:run-cases` recon and every login. Not exercised by a run.

## S22. `atk:help` and `atk:orchestrate` cannot see an outside master plan

### 1. Symptom as captured

`plugins/atk/shared/state-signals.md:68` at `89be83f`, row 13: "neither `docs/qa/master-test-plan.md`
nor one kept elsewhere that `.atk/overrides/qa.md` names". `plugins/atk/skills/help/SKILL.md:99-100`:
"Which `.atk/overrides/<skill>.md` files exist". `plugins/atk/skills/orchestrate/references/worktrees.md:21`:
"Step 1 of `SKILL.md` reads a piece's artifacts this way and no other."

### 2. Root cause

Row 13 depends on a line inside the `qa` override, while both readers of the row are told to read
only which override files exist, or only front matter.

### 3. Evidence

The three quotes, read together: no read named in either file reaches a line in an override's body.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None found.

### 8. Blast radius

`atk:help` state mode, `atk:orchestrate` step 1 and its proposal. Exercised by reading.

## S23. The override line has no place in an override

### 1. Symptom as captured

`plugins/atk/shared/project-overrides.md:65-66` at `89be83f`: "`atk:review` reads
`.atk/overrides/review.md` and nothing else". `:100-102`: "Any other heading is ignored, and so is
prose outside the two sections". `test-plan-template.md:25-27`: "names where in the override".

### 2. Root cause

The template asks for a location "in the override" without naming a section, and the overrides
contract says an override is read by its own skill only and applies only from `APPROVED`, with no
exception for this line.

### 3. Evidence

The three quotes.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

`shared/project-overrides.md` "Only an approved override applies": kept, and extended to the line.

### 8. Blast radius

Every reader of the line: `atk:qa`, `atk:run-cases`, `atk:release`, `atk:help`, `atk:orchestrate`.
`atk:tailor --audit` reads `## Before` and is unaffected, since the line sits inside it.

## S24. Older feature plans have their Entry merged with the master's

### 1. Symptom as captured

`test-plan-template.md:264-265` at `89be83f`: "its Entry is the master plan's Entry together with the
feature plan's, or the feature plan's alone in a plan that says `No master test plan`". `:244-245`:
"A plan written before the master plan existed looks the same".

### 2. Root cause

The exception keys on a header line `62d12eb` introduced, which an older plan does not have.

### 3. Evidence

`git show ca3509f:plugins/atk/skills/qa/references/test-plan-template.md | grep -c "No master test plan"`
prints `0`: no plan written from the template before this pull request carries the line.

### 4. Why it surfaced now

`89be83f`, which added the Entry merge for N8.

### 4b. Recorded intent

The pull request's intent that older plans work unchanged (`:244-245`).

### 8. Blast radius

Readers of Entry through Reading a section: `atk:run-cases`, `atk:qa --record`. Exercised by reading.

## S25. Step 5 of `atk:qa` tells the feature plan to write what the master holds

### 1. Symptom as captured

`plugins/atk/skills/qa/SKILL.md:168-172` at `89be83f`:

```
Entry: what the developer must deliver before QA starts, including build, environment, test account,
seed data, and the list of what is not implemented yet. ... Exit: the pass rate, the severity thresholds
that block a release, and who signs off.
```

### 2. Root cause

Step 5's second paragraph kept the pre-split wording while its first paragraph and the template moved
to the feature shape.

### 3. Evidence

The quote against `test-plan-template.md:221`, whose Exit default is `As in the master plan`.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None found.

### 8. Blast radius

The default run and `--plan`. Exercised by reading.

## S26, S27 and S29. The master plan job and the pieces that wait on it

### 1. Symptom as captured

`plugins/atk/skills/orchestrate/references/proposal.md:186-187` at `89be83f`: "proposed once per run,
as a job of the first piece that reaches the row". `:198`: "gets one once the master plan is
committed". `:202`: "waits for the master plan's commit". `:204-206`: the QA lead merges or rebases,
and "A later run reads the piece's tree again".

### 2. Root cause

The job commits on a piece's branch, so that branch carries the piece's work too (S27); the wait ends
at the commit rather than the approval, unlike the rest of the proposal (S26); and the person's
merge is never recorded, so the next job's changed paths and review include the master plan (S29).

### 3. Evidence

The quotes against `worktrees.md:179-181` at `89be83f`: "every commit the coordinator makes in its
worktree ... is recorded as the piece's last", which a person's merge is not.

### 4. Why it surfaced now

`89be83f`, which wrote the paragraph; its fix record says no review read the last change to it.

### 4b. Recorded intent

The Tech Lead's decision in `261022-0812`, that the coordinator never merges: kept. The branch choice
was asked and answered before this fix.

### 8. Blast radius

`atk:orchestrate` proposal and step 1. Not exercised by a run.

## S28. A master plan merged into the base after a worktree was cut

### 1. Symptom as captured

`proposal.md:188-193` at `89be83f` looks "in each worktree and on each branch the run states of
earlier runs record", and not on the run's base.

### 2. Root cause

Neither bullet covers a piece whose tree predates the merge, so its `atk:qa` job follows Without a
master plan.

### 3. Evidence

The quote. `PLAUSIBLE` in the review; no run was made here.

### 4. Why it surfaced now

`89be83f`.

### 4b. Recorded intent

None found.

### 8. Blast radius

As S26.

## S30. The QA row lets the QA lead accept the master plan they write

### 1. Symptom as captured

`plugins/atk/skills/init/references/role-defaults.md:22` at `89be83f`, Accepts: "`qa`, as QA lead, run
records included". `test-plan-template.md:45`: the master plan's approver is the PM and the TL.

### 2. Root cause

The Accepts cell is unqualified.

### 3. Evidence

The two quotes.

### 4. Why it surfaced now

`62d12eb`, which made the QA lead the master plan's owner.

### 4b. Recorded intent

Rule 2 of `shared/team-roles.md`, author and approver differ: the fix follows it.

### 8. Blast radius

`atk:init`, which fills approvals from the table. Not exercised by a run.

## S31. The master plan's location in a project of several repositories

### 1. Symptom as captured

`plugins/atk/shared/artifact-paths.md:23-29` at `89be83f`: the list of artifacts that go under the
project root, without the master test plan.

### 2. Root cause

"One per project" is stated, but not where a member repository resolves it.

### 3. Evidence

The list. `PLAUSIBLE`; no run from a member repository was made.

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None found.

### 8. Blast radius

Every reader of Where the master plan is.

## S33. The skills overview gives severity and exit criteria to a QA team

### 1. Symptom as captured

`docs/skills-overview.md:619-620` at `89be83f`: "which a QA team decides for the whole project", and
the same in `docs/vi/skills-overview.md:628`.

### 2. Root cause

The overview was written against the plan's owner rather than its approvers.

### 3. Evidence

The quote against `plugins/atk/skills/qa/SKILL.md:42-43`: "PM owns the exit criteria and the defect
severity scale, and the Tech Lead the environments".

### 4. Why it surfaced now

`62d12eb`.

### 4b. Recorded intent

None that contradicts.

### 8. Blast radius

Readers of the overview only.

## The `NIT` items fixed

Each one is a single clause, at the location the review names.

| ID | Change |
|---|---|
| `N18` | The list of readers of the override line is now complete, in the new section of `project-overrides.md` |
| `N19` | "In the Test types and Compatibility tables" |
| `N20` | The 29119 clause sits beside the master test plan |
| `N21` | The `--master` Definition of done names the profile's Team section |
| `N22` | Without a master plan writes Entry out whole, the environment and the accounts by role included |
| `N23` | "The Compatibility section below" |
| `N24` | "With neither plan" in `atk:release` |
| `N25` | Step 2 of Reading a section removes a level the feature's Scope skips |
| `N26` | `skill-chain.md` and its mirror: the `--master` inputs of `qa`, and the severity `release` reads |
| `N27` | `artifact-paths.md` names the master test plan among the undated names, after the project |
| `N33` | "once older plans drop their copy" |
| `N34` | With both a repository plan and an outside one, the reader names both and asks the QA lead |
| `N35` | `atk:release` cites Where the master plan is |
| `N36` | Row 13 reads "no feature test plan or cases" |
| `N37` | The feature approver names the PM for a test level nobody decided |
| `N38` | An outside plan is named in a header as `the master test plan named in .atk/overrides/qa.md`, never by its link |
| `N39` | The merge question says whether the piece's worktree holds uncommitted edits |
| `N40` | "Loaded by" names `--record` and `--review` |
| `N41` | "the plan that holds the row, whose owner edits it" |
| `N42` | A feature's `Performance` row quotes the design |
| `N43` | "A project starts testing" in both overviews |
| `N44` | "entry and exit criteria" in the template and both overviews |

## 5. The change

Each finding is fixed at the location the review names, in the narrowest form: a sentence corrected
where the rule said something wrong (S20, S24, S25, S30, S33 and the `NIT` items), a rule added where
none covered the case (S21, S22, S23, S28, S29, S31), and for S26 and S27 the paragraph on the
master test plan in `orchestrate/references/proposal.md` rewritten around the branch the Tech Lead
chose. S23 adds one subsection, The one line other skills read, to `shared/project-overrides.md`; the
template, `atk:help`, `atk:orchestrate`, `atk:run-cases` and `atk:release` cite it rather than
restate it. Files: `shared/artifact-paths.md`, `shared/project-overrides.md`, `shared/state-signals.md`,
`help/SKILL.md`, `init/references/role-defaults.md`, `orchestrate/references/proposal.md`,
`orchestrate/references/worktrees.md`, `qa/SKILL.md`, `qa/references/test-plan-template.md`,
`qa/references/test-run.md`, `release/SKILL.md`, `run-cases/references/environment-safety.md`,
`tailor/references/interview.md`, `tailor/references/audit.md`, and the `docs/` and `docs/vi/` copies
of `flow/project-flow.md`, `flow/skill-chain.md` and `skills-overview.md`.

Review findings fixed, each a rule for an agent:

- `S26` (still open after round 1), **Correct**: the master plan chain's `needs-approval` is the wait
  itself, not an end of it.
- `S34`, **Add a rule**: a piece whose tree lacks the approved override line the base holds goes to
  the QA lead, like one lacking the base's plan. It opens no new state.
- `S35`, **Add a rule**: the line's exact form in `project-overrides.md`; `atk:tailor` writes it so,
  and its audit flags any other form, as a fourth cheap check.
- `S36`, **Add a rule**: where the base is brought in, the base commit becomes the piece's base.
- `S37`, **Correct**, after the last call: only where the piece's base was the run's base; a piece
  stacked on another's branch keeps that branch.

Tidy: run by hand per `shared/tidy-pass.md`, since the change is prose; it reflowed over-long lines
and made one case explicit, that a master plan the base holds counts as present.

Reference documents: the change is to the kit's own rules, and the docs describing them,
`skills-overview.md`, `flow/skill-chain.md` and `flow/project-flow.md`, moved with it in both
languages. No public contract of a project changed.

## 6. Verified

- `bash tests/verify.sh`: 76 lines, every one `OK`, after the first fix, after round 1's fixes, and
  after S37. It covers manifests, names, mirrors of `docs/` and `docs/vi/`, citations inside the
  plugin, and the rest listed in `CLAUDE.md`; it reads no prose for meaning.
- The em-dash, `ak:` and `atkx` checks of `CLAUDE.md`: nothing in the changed files.
- `wc -l`: `qa/SKILL.md` 226, `help/SKILL.md` 220, `orchestrate/SKILL.md` unchanged at 299.
- The reproduction of each finding is the quoted line in its section 1; each was re-read in the
  working tree and no longer says what was quoted.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/fix-144-worktree-261022-r3.md` (local only, `docs/derived/` is
  ignored): 0 `BLOCKING`, 4 `SHOULD FIX`. S26 still open, S34, S35, S36 new: all fixed. 6 `NIT`
  (N46 to N51) left.
- Round 2, `docs/derived/reviews/fix-144-worktree-261022-r4.md` (local only): 0 `BLOCKING`, 1
  `SHOULD FIX`. S26, S34 to S36 and N51 closed; S37 new, fixed after the last call, **not reviewed
  again**. 7 `NIT` left: N46 to N50, N52, N53.
- Both rounds ran band 1, one `atk:read-only-reviewer` agent each, given no conversation.
- `atk:verify` was not offered: this repository has nothing that runs, per its profile.

## 7. Not verified

- No `atk:orchestrate`, `atk:run-cases`, `atk:tailor` or `atk:help` run was made against the new
  rules. S21, S28, S31, S34, S35 and S37 were `PLAUSIBLE` and stay unsettled by a run; each review
  names the run that would settle it.
- S37's fix was read by no review.
- No CI job judges content here: `.github/workflows/` holds release-please and the labeler only.

## 9. Left for later

- **S32**, the two triggers that left the `atk:qa` description: evals 19 and 21 need the trigger
  measurement of `docs/trigger-eval-measurement.md` before either trigger is restored. Lam Ngoc
  Khuong.
- **N28**, negatives for "lập kế hoạch kiểm thử tổng thể" and "マスターテスト計画" in
  `plan/evals/trigger_evals.json`. **N29**, a check in `tests/verify.sh` that the headings Reading a
  section matches on are in the template. **N30**, a `wc -l` check of every `SKILL.md`. **N31**, a
  suggestion in row 13 that a master plan may wait on another branch. **N32**, asking about a
  `Replaces` cell that names no master row. Each left by the Tech Lead's choice at 09:52.
- From the fix rounds: **N46** (`project-overrides.md`, "of an override that carries the line"),
  **N47** (a base-held plan at `IN REVIEW`), **N48** (`project-overrides.md:19`, `:65-66` still say
  an override is read by its own skill only), **N49** (the descriptions of `project-overrides.md` in
  `CLAUDE.md` and both `system-architecture.md`), **N50** (`test-plan-template.md`, "before the kit
  had a master test plan"), **N52** (a master plan chain `done` with no plan), **N53** (the audit
  check is a judgement). Lam Ngoc Khuong.
- No reference document is owed: the change is to the kit's own rules, and the docs that describe
  them moved with it.

## 9b. Corrections to `261022-0812-144-review-findings.md`

That record is committed, so it is not edited, per Before writing in `shared/artifact-paths.md`.
What the review found wrong in it:

- `N12`: `:17` says step 1 "counts only a top-level heading"; the rule at `89be83f` is a heading of
  that name anywhere but under Differences, as its §5 says.
- `N13`: `:240-241` says every change is **Correct**, "no rule added"; S11 and S12 each added a rule.
- `N14`: `:231-232` says the piece is "parked on the QA lead"; the state is `needs-person`, or
  `parked` when that person is not in the session.
- `N15`: `:31-32` "approves" should read "is the approver", since the record is `IN REVIEW`.
- `N16`: `:122` cites `environment-safety.md:11`, which is blank at `89be83f`; the line is `:12`.
- `N17`: §6b cites review reports under `docs/derived/reviews/`, which is gitignored; those reports
  exist only on the author's machine.
