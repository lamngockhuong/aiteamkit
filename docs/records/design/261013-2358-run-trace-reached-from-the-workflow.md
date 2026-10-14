---
title: The run trace is started by a line in every skill's workflow, and kept out of git by an ignore file inside its own directory
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-13
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# The run trace is started by a line in every skill's workflow, and kept out of git by an ignore file inside its own directory

Supersedes `docs/records/design/261011-1626-run-trace.md`. Every decision of that design stands
except the two this one changes, listed under What changes: how a run comes to write its trace, and
how the trace is kept out of git. Read that design for everything else; this one repeats only what
the two changes touch.

## In short

The approved design put the obligation to leave a run trace in rule 10 of
`plugins/atk/shared/team-roles.md` alone, on the reasoning that every skill reads that file. Phase 1
of `plans/261012-0052-run-trace/` tested that reasoning, as its step 5 was written to, and it does
not hold: `/atk:help` ran twice, on two models, read its own `SKILL.md`, never opened
`team-roles.md`, and wrote no trace.

Two changes follow, each tried in a scratch project before it was written here:

- **Every `SKILL.md` gets one line of its own** at the top of `## Workflow`, under the override line
  every skill already has: create this run's trace at its path, and do what `shared/run-trace.md`
  says before the file, at each step, and at the close. With that line, the run read
  `run-trace.md` and followed it, three runs out of three.
- **The trace is kept out of git by `<docs root>/derived/traces/.gitignore` holding `*`**, not by a
  line in `.git/info/exclude`. Claude Code treats the exclude file as sensitive and refuses to let a
  headless run write it, which would have left exactly the unwatched runs this feature exists for
  with no trace at all.

Rule 10 stays where it is, as the obligation and as the tenth thing an override cannot remove.

## Requirement

Unchanged from the superseded design, AC1 to AC6. Two of them are what this revision answers:

| # | Criterion | Why it reopened |
|---|-----------|-----------------|
| AC1 | Each run of a skill leaves data that can later be used to improve the process and the skill | Two runs left none |
| AC2 | It works for runs nobody watched: subagents and other agents' CLIs, `atk:orchestrate` above all | A headless run cannot write `.git/info/exclude`, so it could never pass the check |

## Current state

- **Rule 10 is in the branch, and is not read.** `plugins/atk/shared/team-roles.md:122-129` on
  `feat/run-trace`. Each skill cites the file in its `## Roles` with "See `shared/team-roles.md`",
  `plugins/atk/skills/help/SKILL.md:47` among them, and nothing tells the agent to open it.
- **A direct mention in the skill is not read as an instruction either.** Step 4 of the plan edited
  `plugins/atk/skills/help/SKILL.md:24-25` to say the skill "writes nothing but its run trace, per
  rule 10 of `shared/team-roles.md`". The runs after it read that file and still wrote no trace.
- **One line in every workflow is already followed.** All 24 `SKILL.md` files open `## Workflow`
  with "Before step 1, read `.atk/overrides/<skill>.md` when it exists, per rule 7 of
  `shared/team-roles.md`." (`plugins/atk/skills/help/SKILL.md:64`). Every run below reported the
  override as absent, so that line was acted on each time.
- **The approved ignore mechanism writes inside the git directory.** `plugins/atk/shared/run-trace.md`
  on the branch, "Where it lives", copies the progress log's exclude line
  (`plugins/atk/shared/artifact-paths.md:325-333`).
- **`SKILL.md` length.** `plugins/atk/skills/review/SKILL.md` and `plugins/atk/skills/verify/SKILL.md`
  are at 299 lines against a ceiling of 300 (`CONV-006`); a two-line addition needs two lines found
  elsewhere in each.

## What was run

All in a scratch git repository holding one commit, with `claude -p "/atk:help"` loading a plugin
directory through `--plugin-dir`, and the installed `atk@atk` turned off for the run. The plugin
loaded was the branch's working copy, version 0.1.8 by the session's own report, or a copy of it in
a scratch directory with the one change named. Costs are what the session reported.

| # | Model | Plugin | Result | Cost |
|---|-------|--------|--------|------|
| R1 | sonnet | branch as is: rule 10, and `help/SKILL.md:24` naming it | No trace, no line saying why. `team-roles.md` never opened | $0.29 |
| R2 | opus-5-5 | same | Same as R1 | $0.64 |
| R3 | sonnet | the override line extended: "and open this run's trace per `shared/run-trace.md`" | Override checked; `run-trace.md` never opened; no trace | $0.34 |
| R4 | sonnet | a line of its own naming the trace path and the three moments | Opened `run-trace.md` and `team-roles.md`; the exclude write was blocked by a hook on this machine; wrote no trace and said so in one line, as the file requires | $0.44 |
| R5 | sonnet | as R4, that hook off for the run | Followed the file; Claude Code refused to edit `.git/info/exclude` as a sensitive file; wrote no trace and said so | $0.31 |
| R6 | sonnet | as R4, with the ignore file of this design in place of the exclude line | Wrote the ignore file and an 8-line, 520-byte trace; `git status` lists nothing; closing message named both files | $0.36 |

The trace R6 wrote:

```
skill: help | kit: unknown | harness: claude-code | way: session | flags: (none)
subject: state | branch: main | start: d76e7cc | profile: absent | override: none
23:57 step 1 pick the mode: ran, state (no argument)
23:58 step 2 read the kit: ran, 25 skills read from skills/*/SKILL.md
23:58 step 3 read the project: ran, no .atk, docs, plans; tree clean; no tags; no pull request source checked
23:59 step 4 match: ran, row 19 holds (no conventions recorded)
23:59 step 5 answer: ran
end: no artifact: help writes none
```

Three things in it are wrong, and none is a reason to change the approach: `kit: unknown` although
a manifest sat beside the skill, "25 skills" where there are 24, and `way: session` for a run another
agent started headless. They go to the shape file, under What changes.

One run per variant is evidence of a direction, not a rate. Phase 1, step 5 of the plan still runs
three skills of different length and `atk:help` on Codex before the release.

## Decision criteria

1. **Reached by an unwatched run** (AC1, AC2), on the evidence above rather than by argument.
2. **Never staged** (AC5), against a project `.gitignore` that negates `docs/derived/`.
3. **Fit with the kit**: no rule in a hook, the DRY layer kept, the 300-line ceiling kept.
4. **Cost** in lines across 24 skills and in what every run reads.

## Options: how a run comes to write its trace

### A. Rule 10 alone (the superseded design)

- Reached: **no**, R1 and R2.
- Fit: the cleanest; no `SKILL.md` changes.

### B. A mention in the skill's own prose

- Reached: **no**. R1 and R2 ran with `help/SKILL.md:24` naming rule 10.

### C. The override line extended to point at the trace file

- Reached: **no**, R3. The half of the sentence that names a concrete path to check was done; the
  half that sends the reader to another file was not.
- Fit: no new line in any `SKILL.md`.

### D. A line of its own in every workflow, naming the path and the three moments (chosen)

- Reached: **yes**, R4 to R6, each of which opened `run-trace.md` and did what it said, refusal
  included.
- Fit: one line pair per `SKILL.md`, 48 lines across the kit; the procedure stays in
  `shared/run-trace.md`, so nothing is restated. `review` and `verify` need two lines found.

### E. A hook writes or starts the trace

- Reached: **no** in the cases that matter. The `PreToolUse` hook with matcher `Skill` fires when the
  model calls the Skill tool, not when a person types the slash command, and Cursor has no matching
  event. It also makes a hook the only road to a behaviour, which `CLAUDE.md` forbids.

### F. The whole procedure written into every `SKILL.md`

- Reached: likely, untested.
- Fit: **fails**. Twenty-four copies of one procedure, and two skills already at the ceiling.

| Criterion | A | B | C | D | E | F |
|-----------|---|---|---|---|---|---|
| 1. Reached | no | no | no | yes, 3 of 3 | not for typed commands | untested |
| 3. Fit | yes | yes | yes | yes, 48 lines | breaks the hook rule | 24 copies |
| 4. Cost | none | none | none | 2 lines a skill | small | large |

## Options: how a trace is kept out of git

### A. A line in the local exclude file (the superseded design)

- Never staged: yes, but a negation in the project's `.gitignore` overrides it, which is why the
  check exists.
- Reached by an unwatched run: **no**, R5. Claude Code asks before editing `.git/info/exclude` and a
  headless run cannot answer, so a subagent or a pane run fails the check every time until some
  interactive run has written the line in that clone.

### B. `.gitignore` holding `*` inside `<docs root>/derived/traces/` (chosen)

- Never staged: yes, and stronger than A. A pattern in a `.gitignore` deeper in the tree outranks
  one higher up, so `!docs/derived/**` in the project's root `.gitignore` does not reach the traces,
  and `*` matches the ignore file itself, so it is never staged either. Checked in a scratch
  repository on 2026-10-13: `git check-ignore -q` passes on a trace and on the ignore file with that
  negation present, and `git add .` stages neither. `git add -f` still stages a trace, as it would
  under A.
- Reached: yes, R6. It is a file of the working tree, and writing it needed no permission a headless
  run lacks.
- What it costs: one file in the person's working tree that git does not show, where A wrote one
  line in the clone's git directory.

### C. Traces outside the repository, in the user's state directory

- Never staged: trivially.
- Fit: **fails**. `atk:tailor --feedback --runs` reads a project's runs from the project; a trace
  that lives beside the user rather than the project mixes projects and is lost to a teammate's
  clone for no gain.

## Chosen approach

### The workflow line

Every `SKILL.md`, directly under its override line at the top of `## Workflow`:

```
Then, before anything else, create this run's trace, `<docs root>/derived/traces/<skill>/<run-id>.md`:
read `shared/run-trace.md` and do what it says before the file, at each step, and at the close.
```

with `<skill>` written out as the folder name, the same way the override line names its own file.
The condition, `Run trace: off`, stays in `shared/run-trace.md`, so a `Not needed` skill's
`SKILL.md` does not name the profile. The wording is the one R4 to R6 ran; a change to it is a
change to what was tested.

Rule 10 of `team-roles.md` stays as the obligation, and stays in the list of what an override cannot
remove. It now says that every skill's workflow opens the trace, so a reader of the rule finds where
it is carried out. A new skill carries the line from its first commit, which `CLAUDE.md` adds to
what a new skill must match.

### The ignore file

`shared/run-trace.md`, "Where it lives", replaces the exclude line with the ignore file:

- Before its first step the run makes sure `<docs root>/derived/traces/.gitignore` exists and holds
  the line `*`, creating the directory and the file where missing and leaving an existing one alone.
- `git check-ignore -q <trace path>` stays mandatory. It now fails only where the docs root is in no
  git repository, and then the run writes no trace and says so in one line, as before.
- The closing message names the ignore file when the run created it.
- Retention and `atk:tailor --runs` still act only on traces the check confirms as ignored.

The progress log keeps its exclude line; it is outside this design. It has the same exposure in a
headless run of `atk:fix`, `atk:verify` or `atk:implement`, noted here for whoever owns that file and
not changed.

### Specified sections

| Section | Answer |
|---------|--------|
| Data model and migration | N/A. No data store. A clone that already has the exclude line from a branch build keeps it; it ignores the same directory and is removed by hand |
| API contracts | N/A. Unchanged from the superseded design |
| Errors and edge cases | The ignore file exists with other content: left alone, and the check decides. Not a git repository: no trace, one line. A harness that refuses the write of the ignore file: the check fails, no trace, one line |
| Backward compatibility | No skill changes what it produces. The line is an addition at the top of each workflow |
| Rollout | Unchanged: one `feat:` patch release with both phases of the plan |
| Rollback | Revert the plan's one pull request. The ignore file and traces left in a working tree are ignored by git and deleted with the directory |
| Observability | The trace is the observability |
| Security and permission | AC5 holds more strongly than under the superseded design, since a root negation no longer reaches the traces. Nothing is written into the git directory |
| Performance | R6: 8 lines, 520 bytes, about 130 tokens estimated at 4 bytes a token. Each traced run also reads `shared/run-trace.md`, 8,869 bytes on the branch, about 2,200 tokens by the same estimate, and R4 to R6 read `team-roles.md` as well, 10,562 bytes. Measured properly, three skills and Codex, in phase 1, step 5 |

## What changes

Relative to the superseded design and the branch `feat/run-trace` as it stands:

- **All 24 `plugins/atk/skills/<name>/SKILL.md`:** the two-line workflow line. `review` and `verify`
  find two lines each to stay under 300.
- **`plugins/atk/shared/run-trace.md`:** the ignore file in place of the exclude line; and from R6,
  that `kit` is read from `../../.claude-plugin/plugin.json` relative to the `SKILL.md` before
  `unknown` is written, and that a run whose task arrived with no person in the conversation is not
  `session`.
- **`plugins/atk/shared/team-roles.md`, rule 10:** names the workflow line as where it is carried out.
- **`CLAUDE.md`:** the `SKILL.md` section order names the workflow line beside the override line,
  so a new skill matches it; the `shared/` row and paragraph for `run-trace.md` say how it is reached.
- **The plan** `plans/261012-0052-run-trace/` takes these as a revision to phase 1, before step 5 is
  run again.

## Traceability

| Criterion | Met by |
|-----------|--------|
| AC1 | The workflow line, R6 |
| AC2 | The workflow line, and the ignore file a headless run can write, R6. Subagent, Codex and orchestrate runs as in the plan |
| AC3 to AC6 | Unchanged from the superseded design; AC5 strengthened by the ignore file |

## Decisions recorded

Proposed, and each waits on the approver:

- The trace is started by a line in every `SKILL.md`, not by rule 10 alone.
- The trace is kept out of git by an ignore file inside its directory, not by the local exclude file.

## Open questions

None.

## Reviewers

- Tech Lead: Lam Ngoc Khuong, approver. `.atk/profile.md` lists no BrSE or SRE for this repository.

ADR: `docs/adr/0005-run-trace-started-from-the-workflow.md`, superseding
`docs/adr/0004-every-skill-leaves-a-run-trace.md`.
