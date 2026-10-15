---
title: "Fix: atk:orchestrate edge cases left open by the review of #122, and atk:review taking no base"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-15
updated: 2026-10-15
ticket: "#123"
---

# Fix: atk:orchestrate edge cases left open by the review of #122, and atk:review taking no base

## In short

Issue #123 held eighteen `SHOULD FIX` findings that the merge of `atk:orchestrate` (#122) left
open: seventeen edge cases in how the coordinator checks, commits and relays a job's work (`S12` to
`S28` of the first review), and one about reviewing a branch stacked on another (`S7` of the second
review). Each is a gap in the skill's text rather than a wrong line: a case the instructions do not
cover, so an agent following them would either miss it or have to guess. The fix writes each case
into the reference file that owns it, and gives `atk:review` a `<base>...<branch>` target so the
coordinator can name the base it reviews against.

Lam Ngoc Khuong set the scope on 2026-10-15 (all eighteen in this run) and decided `S17`: decision 4
keeps its list, the proposal states the risk of a pre-commit hook, and where the repository has one,
each commit of a job's change is asked about first. Lam Ngoc Khuong approves this report.

## Several defects in one report

Every defect below has the same shape, so sections 1 to 4b are written once per defect, with the
shared parts here:

- **Symptom (1).** The finding as the review wrote it, quoted from `docs/derived/reviews/122-261015-1043.md`
  (`S12` to `S28`) and `docs/derived/reviews/feat-orchestrate-fix-261015-1640.md` (`S7`), both local
  review reports, and restated in issue #123. No run of the skill produced them: the skill has not
  been run since #122, as the issue says.
- **Evidence (3).** The third accepted form: the lines quoted, on `3a33ece`, with the check that
  shows the case is not handled. Each defect's block names them.
- **Why now (4).** Every one has been open since `atk:orchestrate` was written, in `10f30b1` (#122);
  the fix of that review, `fd98e05`, left them out by the scope decision of 2026-10-15.
- **Hypotheses.** One per defect, proved: the text does not cover the case. None was ruled out.
- **Intent (4b).** Searched for every defect: the design record
  `docs/records/design/261011-1538-orchestrate-team-work.md` (decisions, the probe table), ADR
  `docs/adr/0003-orchestrate-runs-jobs-in-the-way-the-machine-offers.md`, and both review reports.
  No record says any of these cases is meant to go unhandled. Decision 4 of the design record
  (`:498-499`) is kept as written; `S17` adds to it on its owner's word, below.

### S12. The check for writes outside a worktree looks only at the coordinator's tree

1. Symptom: "The check for writes outside a worktree looks only at the coordinator's tree. It misses
   another piece's worktree, the common git directory (`config`, `hooks/`, `info/exclude`), ignored
   paths, and anything outside the repository."
2. Cause: step 1 of After a job ends ran `git status --porcelain` in the coordinator's tree alone.
   `plugins/atk/skills/orchestrate/references/worktrees.md:90-93` on `3a33ece`.
3. Evidence: those lines are the whole check; `git status` never lists the common git directory,
   lists no ignored path without `--ignored`, and runs in one tree.

### S13. `git status --porcelain` misses an untracked file inside a new directory and a second write

1. Symptom: "`git status --porcelain` shows an untracked directory as one line and misses a second
   write to a dirty file. Use `--untracked-files=all` and compare content hashes."
2. Cause: the same check compared status lines only. `worktrees.md:90-93`.
3. Evidence: a file already shown ` M` stays ` M` after a second write, and `?? dir/` stays one line
   whatever is added under it, so a comparison of lines sees neither.

### S14. An approver's own edit to a proposal record reads as a job writing outside its worktree

1. Symptom: "An approver's own edit to a proposal record in the coordinator's tree is reported as a
   job writing outside its worktree."
2. Cause: `SKILL.md:131-132` has the approver edit the record in the coordinator's tree, and
   `worktrees.md:90-93` treated every change there since the coordinator's last write as a job's.
3. Evidence: those two passages together, with nothing that tells the two writers apart.

### S15. A mismatch between `changed:` and `git status` had no consequence

1. Symptom: "A mismatch between a job's `changed:` line and `git status` has no consequence."
2. Cause: `worktrees.md:94-95` said to compare the two and nothing after.
3. Evidence: the step ends at "compare it with the job's `changed:` line".

### S16. A change to a worktree's own `.git` file could not be seen

1. Symptom: "A change to a worktree's own `.git` file cannot be seen. Record its `gitdir:` line when
   the worktree is made."
2. Cause: step 3 named "the worktree's own `.git` file" as a file to check (`worktrees.md:98-100`),
   but step 2 found changes through `git status`, which never lists `.git`.
3. Evidence: no step recorded the file's content to compare against.

### S17. A pre-commit hook runs files the hook gate does not list

1. Symptom: "A pre-commit hook runs files the hook gate does not list, such as lint config, package
   scripts, tests and source, with the coordinator's rights."
2. Cause: decision 4 lists the hooks, a hook manager's configuration and `.git`;
   `atk:git --commit` runs the repository's pre-commit hook, which loads files outside that list.
   `worktrees.md:98-103`, `shared/host-capabilities.md`, the "Commits are the calling skill's" bullet.
3. Evidence: a job changes `eslint.config.js`; it is in no listed path, so step 3 passes, and the
   commit's hook loads it under the coordinator's rights.
4b. Decision 4, design record `:498-499`, Lam Ngoc Khuong, 2026-10-15. Asked on 2026-10-15 whether it
   covers files a hook loads; answer: it keeps its list, the proposal's cost states the risk, and
   where the repository has a pre-commit hook each job commit is asked about first, naming that risk.

### S18. A pane's timeout kept running while it waited on a person

1. Symptom: "A pane's timeout keeps running while it waits on a person. Pause it while the job is
   `blocked` or `needs-person`."
2. Cause: `ways-to-run.md:42-44` counted the timeout per job with no pause.
3. Evidence: a person slower than the timeout turns an interview `failed` mid-question.

### S19. A subagent spawned again could loop on its resume offer

1. Symptom: "A subagent spawned again can loop on its resume offer. Relay the offer to the person
   once, then pass their choice in the new prompt."
2. Cause: `ways-to-run.md:59-61` spawned the job again "with the answer and that log, which the
   skill offers to resume"; the offer is a gate the coordinator may not answer.
3. Evidence: the new agent meets the offer first and returns `needs-person` again.

### S20. An input path was checked against the coordinator's tree, not the ref the worktree starts from

1. Symptom: "An input path is checked against the coordinator's tree, not against the base. Check it
   with `git cat-file -e <base>:<path>`."
2. Cause: `worktrees.md:55-58` named the base but checked "untracked or changed in the
   coordinator's tree". Since `fd98e05` the base is `HEAD` of that tree, which closes the first
   case; a piece that reuses an existing branch still starts from a ref the check never read.
3. Evidence: `worktrees.md:75` reuses an existing branch with `git worktree add <path> <branch>`.

### S21. A question for someone not in the session had nowhere to go

1. Symptom: "A question for someone not in the session has no way to reach them. Park that chain
   while the others continue."
2. Cause: `SKILL.md:160-163` relays a stop to "the person" with no case for one who is absent.
3. Evidence: the States of `proposal.md:163` name the person but give the chain no way to wait.

### S22. A malformed result file had no defined outcome

1. Symptom: "A malformed result file has no defined outcome. Fail the job as `malformed result`."
2. Cause: `job-prompt.md:69-74` reports an off-shape line to the person and stops there.
3. Evidence: a file with no `state:` line is neither `running` nor missing, the two cases defined.

### S23. A crash between a job's end and its commit left it ambiguous; a stale `index.lock` was not handled

1. Symptom: "A crash between a job's end and its commit leaves the job ambiguous, and a stale
   `index.lock` is not handled."
2. Cause: `worktrees.md:86-121` recorded no point between `done` and the commit.
3. Evidence: on a resume, a job `done` whose change is uncommitted matches no case of State and
   resuming in `SKILL.md`.

### S24. A plan naming no files was taken as sharing none; running pieces were never compared

1. Symptom: "A plan that names no files is treated as sharing nothing, and the `changed:` lines of
   running pieces are never compared."
2. Cause: `proposal.md:133-142` compares plans only by the files they name, once.
3. Evidence: no step after a job ends looks at another piece's changes.

### S25. One piece given in two forms became two pieces

1. Symptom: "One piece given in two forms, a ticket and its plan path, becomes two pieces."
2. Cause: `SKILL.md:89-90`: "the same ticket or path given twice is one piece", and nothing else.
3. Evidence: a ticket and a plan whose front matter names it are a ticket and a path, not the same
   one twice.

### S26. Four base and branch cases were not handled

1. Symptom: "no `origin/HEAD`, a repository with no commit, a detached `HEAD`, and branch names that
   collide within one run."
2. Cause: `worktrees.md:40-48` and `:72-76` assumed a default branch, a commit, a named branch, and
   distinct names.
3. Evidence: those passages name none of the four cases.

### S27. In the session way, a job's files could land in the coordinator's tree

1. Symptom: "In the session way, a job's files may land in the coordinator's tree. Pin the worktree
   with absolute paths, `-C`, and the project root."
2. Cause: `ways-to-run.md:70-73` held the session to the job prompt but listed only its other items.
3. Evidence: the session starts in the coordinator's tree, and nothing moved it.

### S28. Codex's sandbox may refuse writes beside the repository rather than ask

1. Symptom: "Codex's sandbox may refuse writes beside the repository rather than ask. Probe that a
   worktree is writable before the proposal."
2. Cause: The probe in `ways-to-run.md:8-26` checks each way's presence, not its right to write
   where `worktrees.md:62-68` puts the worktrees.
3. Evidence: no probe line writes there. `PLAUSIBLE` in the review: not run on Codex in this fix.

### S7. A stacked branch's base could not be passed to `atk:review`

1. Symptom: "A stacked branch's base cannot be passed to `atk:review`. Its `argument-hint` takes no
   base, so a piece serialised after another may be reviewed against the default branch."
2. Cause: `plugins/atk/skills/review/SKILL.md:10` takes `pr-number|branch|commit|paths`;
   `shared/secret-scan.md:276-278` has the review resolve the base itself.
3. Evidence: `proposal.md:136-138` asked for a review over `<earlier branch>...<its branch>`, which
   no target form carried. `PLAUSIBLE` in the review; not settled by a run here.
4b. Changing another skill's contract was Lam Ngoc Khuong's call; on 2026-10-15 they chose to do it
   in this run.

## 5. The change

Each defect is closed in the reference file that owns it, so `SKILL.md` gains only the pointers it
needs and stays at 299 lines:

- `references/worktrees.md`, Before the first worktree and After a job ends: a baseline per tree,
  recorded again after each write of the coordinator's own, holding listings and hashes for the
  coordinator's tree, each worktree, the common git directory (`config`, `info/exclude`, the hooks
  directory `git rev-parse --git-path hooks` resolves), each `gitdir:` line and `config.worktree`
  (S12, S13, S16); edits by an approver asked about rather than reported (S14); a `changed:` mismatch
  that holds the commit (S15); the pre-commit question (S17); a resume that re-checks a job found
  `done`, or a commit found after a crash, and a stale `index.lock` (S23); input paths checked on the
  ref the worktree starts from (S20); a repository with no commit, a detached `HEAD`, no
  `origin/HEAD`, and colliding branch names (S26).
- `references/proposal.md`: the cost states the pre-commit risk and what the outside-write check
  cannot see (S17, S12); a plan naming no file waits for the others and starts from the run's base;
  overlapping changes of pieces running side by side (S24); a question for an absent person parks
  its chain (S21).
- `references/ways-to-run.md`: the probe writes beside the repository (S28); a timeout paused while
  a job waits (S18); a re-spawned subagent given the person's choice on the resume offer (S19); the
  session way pinned to the worktree (S27).
- `references/job-prompt.md`: a malformed result file fails the job (S22).
- `SKILL.md`: one piece for a path whose front matter names a ticket also given (S25); the parked
  chain pointer (S21); step 5 reviews `"<base>...<branch>"` (S7).
- `shared/host-capabilities.md`: one sentence beside decision 4 for the pre-commit hook (S17).
- `atk:review` takes a range target (S7): `argument-hint`, the Invocation block, `## Output` and the
  report title in `references/report-format.md`; `shared/secret-scan.md` names the range as a mask
  argument; `README.md` and both `skills-overview.md` files carry it, per the flag rule in `CLAUDE.md`.

Smallest change: each edit adds the case to the step that already handles its neighbours. The review
rounds widened the outside-write check beyond the first draft (a baseline per worktree, the hooks
directory listed, the run state hashed), because a narrower check reported ordinary work as a stray
write.

Tidy: four read-only agents read the diff for reuse, simplification, efficiency and altitude. Applied:
the pre-commit rule cited from `host-capabilities.md` rather than restated twice, the session pinning
cited from item 1 of `job-prompt.md`, one `git hash-object --stdin-paths` per tree, one check per
batch of ended jobs, step 2 reusing step 1's listing, one probe agent instead of two, and three
redundant clauses cut. Four altitude suggestions change behaviour and were not applied; see 9.

Reference documents: the kit keeps none for its skills. The contract that moved is `atk:review`'s
target, carried by its `SKILL.md`, `README.md` and both `skills-overview.md` files.

## 6. Verified

- The verification block of `CLAUDE.md`, "Common verification commands", run whole after the fix,
  after the tidy step, and after each review round: 69 `OK` lines and no other output each time,
  manifests, trace lines, mirrors, hooks, citations, labeler, secret scan and `skill-eval` included.
- The four greps outside that block (em-dash, another kit's command, hardcoded fill, `atkx`): empty.
- `wc -l`: `plugins/atk/skills/orchestrate/SKILL.md` and `plugins/atk/skills/review/SKILL.md` at 299.
- `git status --porcelain --untracked-files=all --ignored=matching` in a scratch repository lists an
  untracked file inside a new directory by its own path and an ignored directory as one line, as
  step 1 relies on.
- The reproduction for each defect was reading the lines it cites; on the fixed tree each block's
  case has a sentence that handles it, which both review rounds confirmed for S12 to S28 and S7.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/123-fix-261015-1650.md`: 0 `BLOCKING`, 14 `SHOULD FIX`, 3 `NIT`.
  S1 to S13 fixed, S10 and S11 on Lam Ngoc Khuong's answers of 2026-10-15 (the run's base, not
  stacked; the close stops a parked job's agent and says its question is asked again). S14 carried
  forward: it asks for the trial section 9 owes, which is separate work. NITs not fixed.
- Round 2, `docs/derived/reviews/123-fix-261015-1726.md`: 0 `BLOCKING`, 4 `SHOULD FIX`, 4 `NIT`.
  S1 to S13 closed. S15 (worktrees holding a change left uncommitted read as stray writes), S16 (the
  no-file rule could wait forever) and S17 (a commit found after a crash skipped steps 1 to 4) were
  **fixed after the last review call**, with `N4` (a range report name that was not a slug), and no
  review round read them: Lam Ngoc Khuong reads them. S14 still carried. Re-verified: 69 `OK`.
- The loop ended within two rounds with no `BLOCKING` finding, so nothing was escalated.
- `atk:verify` was not offered: the profile's Verify section says this repository starts nothing.
- A local hook kept the first round's reviewer from reading a diff written inside the repository's
  git directory; the masked diff was written to the session's scratch directory and the round re-run.

## 7. Not verified

- No text of `atk:orchestrate` has been run, before or after this fix: every rule here is read, not
  exercised. The trial owed since #122 is the check (S14).
- `S28` and the probe's third outcome need Codex with its default sandbox; not run.
- `S7` needs `atk:review "<base>...<branch>"` run on a branch stacked on an unpushed one; not run.
- Whether `git rev-parse --git-path hooks` follows `core.hooksPath` on every git version a team runs
  was not checked beyond this machine.
- S15, S16, S17 and N4 as fixed were read by no review round.

## 8. Blast radius

- `plugins/atk/shared/host-capabilities.md`, Agents that write: the commit bullet is acted on by
  `atk:orchestrate` alone; read, not exercised.
- `plugins/atk/shared/secret-scan.md`, Masking a diff: read by `atk:review`, `atk:git`,
  `atk:security` and the read-only reviewer; the new bullet adds an argument form and changes no
  other. The block's own test in `CLAUDE.md` passed, `HEAD~1...HEAD` included.
- `atk:review`'s targets: `atk:implement`, `atk:fix` and `atk:orchestrate` call it; only
  `atk:orchestrate` passes a range, the others pass what they passed before. Read, not exercised.
- `atk:help` and `atk:convention` read review reports by name; a range report's name is new and
  neither has met one. Not exercised.

## 9. Left for later

- The trial owed since #122, "no profile, approve in the worktree", has still not run. None of the
  orchestrate text, before or after this fix, has been run end to end. Owner: Lam Ngoc Khuong.
- `S28` and `S7` are fixed in text but were not settled by a run: `S28` needs Codex with its default
  sandbox, and `S7` a review of a branch stacked on an unpushed one.
- Four suggestions from the tidy step change behaviour and were not applied: a question before a
  commit that fires any hook or filter, not only a pre-commit hook; pieces keyed by the ticket they
  resolve to, so two paths naming one ticket are one piece; an existing branch reused only when the
  run state says it is this piece's; and a general list of stops already answered, passed to a job
  spawned again. Each needs Lam Ngoc Khuong's word before it is written.
- No reference document is stale: the kit keeps none for its skills; `README.md` and both
  `skills-overview.md` files carry the new `atk:review` target.
