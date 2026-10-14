---
title: "ADR 0004: every atk skill leaves a run trace by default, and atk:tailor --feedback reads many of them"
status: SUPERSEDED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-11
updated: 2026-10-14
ticket: none
---

Superseded on 2026-10-14 by `docs/adr/0005-run-trace-started-from-the-workflow.md`, which changes how a run comes to write its trace and how the trace is kept out of git; every other decision here stands.

# ADR 0004: every atk skill leaves a run trace by default, and atk:tailor --feedback reads many of them

Design: `docs/records/design/261011-1626-run-trace.md`

## Context

`atk:tailor --feedback` turns a run that went wrong into an override, a record for the skill's
author, or nothing. It can read only the run in the current session. Runs in subagents, in other
agents' CLIs, or in earlier sessions leave nothing to read, and `atk:orchestrate` would produce many
such runs at once. The maintainer wants data from every run, on by default and turned off per
project.

Three skills already write a progress log, but it holds what a resume needs, not what an analysis
needs. `atk:run-cases` already uses the name "run log" for a log of its own.

## Decision

- **Every run leaves a run trace.** It is a derived file at
  `<docs root>/derived/traces/<skill>/<run-id>.md`, with one fixed-shape line per observable fact:
  - a step that ran or was skipped;
  - a question, who was asked, and how long it waited;
  - a ceiling that stopped the run;
  - review counts;
  - a correction a person reports;
  - the end of the run.
- **The rule and the shape live in `shared/`.** The rule is rule 10 of
  `plugins/atk/shared/team-roles.md`. The shape, what is never written, and the retention of twenty
  traces per skill are in a new `plugins/atk/shared/run-trace.md`.
- **On by default.** A missing profile line and a missing profile both mean on. `Run trace: off` in
  `.atk/profile.md` turns it off for the project. There is no per-run switch.
- **Never committed.** A trace is excluded from git by a check that is mandatory. Where that check
  fails, the run writes no trace.
- **`atk:tailor --feedback` gains `--runs`.** It reads many traces of one skill, counts the patterns,
  and puts each pattern through the fork it already uses.
- **`atk:orchestrate` keeps job traces.** It copies each job's trace out of the job's worktree before
  removing the worktree.

## Consequences

- **Unwatched runs can be improved from evidence.** That includes runs of `atk:orchestrate`.
- **Every run pays a few lines of writing**, including in teams that never read a trace. The cost is
  measured before release and stated in `shared/run-trace.md`.
- **"The nine rules" becomes "the ten rules"** in `CLAUDE.md`, `docs/system-architecture.md`,
  `docs/codebase-summary.md`, and their mirrors.
- **`.atk/profile.md` gains a second line that changes behaviour**, beside `Contract`.
- **Git never carries a trace, but the docs root does.** A docs generator, an archive or an image
  build that reads the docs root reads the traces too, unless the project leaves `derived/` out of
  it. Anything `tailor` sends to the kit is neutralized per `CONV-010`, and only on request.

## Alternatives rejected

- **Keeping `tailor --feedback` as it is.** It cannot see unwatched runs.
- **A journal skill invoked after a run.** Nobody invokes it after dozens of jobs. Its prose cannot be
  counted, and it duplicates the judgement `tailor` makes.
- **Reading the harness's transcripts.** They hold what rule 9 keeps unread, in a format per harness.
- **A hook writing the trace.** A hook never holds a rule, cannot see a skill's steps, and does not
  fire on every harness.
- **A per-run switch.** Rejected by the maintainer on 2026-10-11. Deleting a derived trace does the
  same at no cost.
