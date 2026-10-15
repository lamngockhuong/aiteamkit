---
title: "Fix: atk:orchestrate stalls on an approval made in a worktree and on a profile committed off the base, plus 26 gaps of review 122"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong)
created: 2026-10-15
updated: 2026-10-15
ticket: "#122"
---

# Fix: review 122 findings on `atk:orchestrate`

## In short

The team review of pull request #122 (`docs/derived/reviews/122-261015-1043.md`, on head `686c7d4`)
found two ways a chain of `atk:orchestrate` stops for good. First, an approver who edits an artifact
in its worktree, as the skill tells them to, is never seen, because the skill read state only from
commits (`B1`). Second, in a project with no profile, the profile is committed on a branch the
worktrees are not made from, so every job that needs it stops (`B2`). It also found 42 `SHOULD FIX`
gaps.

Lam Ngoc Khuong set the scope on 2026-10-15: `B1`, `B2`, `S1` to `S11`, and `S29` to `S42`. `S12` to
`S28` go to a follow-up issue, and no `NIT` is fixed. Every finding in scope is fixed, in the
orchestrate skill, its four references, three shared files, both `skills-overview.md` files and the
design record.

`atk:review` ran twice on this fix and reached its ceiling with one `BLOCKING` finding still open:
where a run's worktrees start. Lam Ngoc Khuong chose the answer: the commit whose profile the
coordinator read. That change, and four smaller ones, came after the last review, so **Lam Ngoc
Khuong reviews them by hand**; section 6b lists them. Lam Ngoc Khuong also decided that the approved
design record may still be corrected while its branch is unmerged (`S42`).

## Defects

Every defect below was introduced by this pull request: all of `plugins/atk/skills/orchestrate/`
and the orchestrate lines of the shared files arrived in the branch commits after `aba7ebb`, and
none of it is on `main`. Section 4 is therefore the same for each one, and is not repeated. The
evidence for each is the lines it quotes, read on `686c7d4`, with the check named. No defect needed
a second hypothesis.

### B1. An approval made in a worktree is never read

1. Symptom: review 122, `B1`. A chain waiting on a `DRAFT` requirement never moves once the approver
   edits it in the worktree.
2. Cause: step 1 read state only through `git ls-tree <ref>` and `git show <ref>:<path>`
   (`SKILL.md:100-106` on `686c7d4`), and no step committed the approver's edit.
3. Evidence: `SKILL.md:168-171` told the approver to "edit that file". `SKILL.md:107-111` said
   uncommitted work is "never committed unasked". `SKILL.md:195` fires step 6 only on an `APPROVED`
   artifact. Check: no line of `SKILL.md` or `references/` reads a working-tree file, and none
   commits that edit.
4b. Intent: nothing records committed-only reads as a decision; decision 3 of the PR body concerns
   row 6, not where an artifact's state is read.

### B2. The profile commit lands on a branch the worktrees are not made from

1. Symptom: review 122, `B2`.
2. Cause: `references/worktrees.md:41-42` made worktrees from "the default branch", while the
   profile commit of `atk:init` goes through `atk:git`, which never commits there
   (`shared/finalize-steps.md:64`).
3. Evidence: `worktrees.md:18-20` promised that "every worktree starts from a commit that holds it".
   Check: no line recorded the profile commit or used it as a base.
4b. Intent: decision 5 of the PR body requires `atk:init` before any worktree, and this fix keeps
   that. Nothing records the base as the default branch on purpose.

### S1 to S11, S29 to S41

Each finding is quoted in full, with its lines, in review 122. The table gives its cause as the
review located it, and the check that confirmed it on `686c7d4`. No record contradicts any of them.

| ID | Cause, `686c7d4` | Confirmed by |
|----|------------------|--------------|
| `S1` | `references/proposal.md:63`: profile jobs proposed "once that commit exists", but no step writes that record | no follow-up record outside step 6, which needs an approved artifact |
| `S2` | `SKILL.md:170-171` offered "say so to a job's skill there", which `worktrees.md:73-75` fails | both lines read together |
| `S3` | `SKILL.md:119-121` stopped at the first gating artifact, above rows 1 and 2 of `shared/state-signals.md` | `state-signals.md:86-87` gives the reason row 2 sits above row 3 |
| `S4` | `shared/state-signals.md:19-28` listed three exceptions, none a proposal record | the Record group in `shared/artifact-paths.md` holds proposal records |
| `S5` | no row from 10 to 13 leads an approved small requirement to `atk:plan` | `state-signals.md` rows 10 to 13 |
| `S6` | rows 4 and 14 need a diff and a commit date; step 1 allowed front matter only | `SKILL.md:103-106` |
| `S7` | the fix job was a description scored by the plan gate, and was in no record or cost | `skills/implement/SKILL.md:89-93`, `references/proposal.md:48` |
| `S8` | the loop's record for a fix job was a committed fix report | `shared/review-fix-loop.md:9-12` |
| `S9` | the fix job was `atk:implement`, which knows no reproduction | `shared/review-fix-loop.md:121-122` |
| `S10` | a job skips its skill's hand-off, which is where `atk:implement` moves the document under `--no-review` | `references/job-prompt.md:38-41`, `skills/implement/SKILL.md:199-209` |
| `S11` | orchestrate's resume offer ignores the subject, with three answers | `shared/artifact-paths.md` Progress log |
| `S29` | "a skill that Progress log names" also reaches `run-cases`, named there as the instance | `shared/artifact-paths.md:338`, `skills/git/SKILL.md:137` |
| `S30` | a serialised piece's review covered its predecessor's commits, and the close named no base | `SKILL.md:181`, `references/proposal.md` Pieces that share files |
| `S31` | how `atk:verify` runs was unsaid, and cleanup could remove its worktree | `SKILL.md:202-204` |
| `S32` | removal named no command and no failure path | `references/worktrees.md:87-93` |
| `S33` | panes and workspaces were never closed | `SKILL.md:235-243` |
| `S34` | review reports under the run directory were invisible to the kit's other readers | `SKILL.md:181-182` |
| `S35` | the prompt's route into the multiplexer was unsaid | `references/ways-to-run.md:30` |
| `S36` | names a job created reached commands unchecked | `SKILL.md:103-104`, `worktrees.md:82` |
| `S37` | result-file paths were followed unchecked | `references/job-prompt.md:66-69` |
| `S38` | step 4 checked only the job's own artifact | `worktrees.md:73-75` |
| `S39` | sending client work to another provider had only the Tech Lead's yes | `references/proposal.md:34-35` |
| `S40` | a subagent may inherit a mode that writes without asking | `references/ways-to-run.md:16-19` |
| `S41` | the trigger evals lacked negatives for `atk:plan`, Japanese `help` and multi-agent, Vietnamese `breakdown` and `implement`, and "resume" | `evals/trigger_evals.json` |

### S42. The design record disagrees with the skill

1. Symptom: review 122, `S42`.
2. Cause: `docs/records/design/261011-1538-orchestrate-team-work.md:340` says a `BLOCKING` finding
   goes back; `:423` says no other skill changes behaviour; Decisions recorded holds two of the six
   decisions of 2026-10-15.
3. Evidence: those lines, read on `686c7d4`.
4b. Intent, and the conflict: Before writing in `shared/artifact-paths.md` lets a record be
   corrected only until it is committed: "From the commit on, every rule above holds". The record is
   `APPROVED` and was committed in `5baa793`. The review's fix assumes a correction window that
   closed with that commit. Options for Lam Ngoc Khuong:
   - (a) Leave the record as it stands. The PR body and this report carry the three decisions, and a
     later design record supersedes it when one is written. Cost: a reader of the record alone sees
     two wrong lines.
   - (b) Add only the three decisions under Decisions recorded, as something that happened after the
     record was written, which that section allows, and leave `:340` and `:423`. Cost: two wrong lines
     remain.
   - (c) Correct the record on this unmerged branch anyway, with a dated note, treating "committed" as
     "merged". Cost: it bends the rule the correction window states.

   Lam Ngoc Khuong chose (c) on 2026-10-15. The record now carries the third correction note, the
   two lines are corrected, and the three decisions are added.

## 5. The change

Step 1 reads a piece in its worktree from the working-tree files, and an approver's status edit is
committed through `atk:git --commit` on their word before anything builds on it (`B1`, `S2`, `S4`).
The base of every worktree is the commit whose profile the coordinator read and judged ready, with
the pieces' branches stacked on its branch and pushed after it (`B2`, review round 2 `B1`). The
profile jobs get a follow-up record (`S1`). Reading stops at row 3, so rows 1 and 2 still apply
(`S3`). A proposal record is the fourth kind that does not gate (`S4`). Row 22 with an approved
requirement proposes `atk:plan <ticket>` (`S5`). Rows 4 and 14 get named reads (`S6`). A fix job is
counted, approved with its code job, and handled when its plan gate scores it (`S7`). An `atk:fix`
job's report stays committed, and the loop's lines go to the run state (`S8`). A fix job re-runs the
captured reproduction (`S9`). A job still moves the reference document it owes (`S10`). The resume
offer adds Run separately and lists several logs (`S11`). The remaining entries are `S29` to `S41`,
one change each, as the table above names them.

Smallest change: each edit adds the missing rule where the finding located the gap, or cites the
file that already owns it. Nothing outside the findings was rewritten, apart from the line reflow
that kept `SKILL.md` under 300 lines; it is now 298.

Tidy: the host's `/simplify` ran four agents over the changed lines. Eight restatements became
citations of the file that owns the rule. Their other suggestions were skipped where they would undo
a review fix, or where they reached outside the diff.

Reference documents: the kit has no public contract a reference document describes. The user-facing
`--resume` description in `docs/skills-overview.md` and its `docs/vi/` mirror moved with the change.

## 6. Verified

- The "Common verification commands" block of `CLAUDE.md`, run on the working tree after the last
  change: 69 `OK` lines and no failure. It covers 25 skills with their trace lines, 1,181 citations
  resolved inside the plugin, the labeler, the evals, and versions.
- The em-dash, `ak:`, diagram-fill and `CONV-011` greps printed nothing, and the `docs/` and
  `docs/vi/` listings match.
- `evals/trigger_evals.json` parses, with eight new negative cases.
- No CI job judges content in this repository, so that block is the gate.

## 6b. Reviewed

- Round 1: `docs/derived/reviews/feat-orchestrate-fix-261015-1600.md`. 1 `BLOCKING`, 8 `SHOULD FIX`,
  1 `NIT`. `B1` and `S1` to `S6` and `S8` were fixed. `S7` was carried forward, because it needs
  `atk:review` to accept a base, which changes another skill's contract. `N1` was left as a `NIT`.
- Round 2: `docs/derived/reviews/feat-orchestrate-fix-261015-1640.md`. `S1`, `S2`, `S4`, `S5`, `S6`
  and `S8` closed. `B1` was still open, `S3` partly open, `S7` carried, and three new findings came
  in: `S9`, `S10` and `S11`.
- The ceiling was reached, and the escalation went to Lam Ngoc Khuong, who chose the base rule.
- **Fixed after the last call, reviewed by no review run, for Lam Ngoc Khuong to read:**
  - `B1`: the base is the commit whose profile was read (`references/worktrees.md`, "The profile"
    and "From what").
  - `S3`: with no ticket, the piece waits on the requirement's approver.
  - `S9`: the status check compares with `HEAD`.
  - `S10`: the `--resume` wording, in `SKILL.md` and both `skills-overview.md` files.
  - `S11`: the review-report copy keeps its ignore check, and a failure leaves the report in the run
    directory.
- `atk:verify` was not offered: this repository runs nothing.

## 7. Not verified

- None of the fixed text has been run. The trial the review asks for, "no profile, approve in the
  worktree", has not been run, nor any other orchestrate run.
- The edits listed in 6b as fixed after the last call have had no review run.
- Round 2's `S7` stays open as `PLAUSIBLE`.
- The trigger evals parse, but triggering was not measured.

## 8. Blast radius

Written per defect group, since the change is prose an agent follows:

- `atk:help` reads `shared/state-signals.md`. The fourth gating kind and the new line in Waiting on
  people change its state-mode list (`S4`). Row 5 is unchanged.
- `atk:git` step 2 and `atk:help` read "a skill that Progress log names". The `S29` sentence now
  limits that phrase to fix, verify, implement and orchestrate. `run-cases` keeps its own rule.
- `atk:implement` and `atk:fix` read `shared/review-fix-loop.md`. The changed sentences name
  orchestrate alone (`S8`, `S9`).
- Every reader of Progress log in `shared/artifact-paths.md`, for the Run separately answer, which is
  orchestrate's alone (`S11`).

## 9. Left for later

- Round 2 `S7`: a stacked branch's base cannot be passed to `atk:review`. It needs a documented way
  for `atk:review` to take a base.
- `S12` to `S28`: a follow-up issue, by Lam Ngoc Khuong's scope decision of 2026-10-15. `S17` also
  needs that person's answer on whether decision 4 covers files a hook loads indirectly.
- `N1` to `N25`: not fixed by this loop.
- The trial the review asks the author to run, "no profile, approve in the worktree", has not been
  run. No reference document of a public contract changed: the kit has none.
