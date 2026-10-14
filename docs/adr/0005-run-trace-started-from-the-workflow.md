---
title: "ADR 0005: the run trace is started by a line in every skill's workflow, and kept out of git by an ignore file in its own directory"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-13
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# ADR 0005: the run trace is started by a line in every skill's workflow, and kept out of git by an ignore file in its own directory

Design: `docs/records/design/261013-2358-run-trace-reached-from-the-workflow.md`

Supersedes `docs/adr/0004-every-skill-leaves-a-run-trace.md`. Every decision of ADR 0004 stands
except the two below.

## Context

ADR 0004 put the obligation to leave a run trace in rule 10 of `plugins/atk/shared/team-roles.md`
alone, and kept the trace out of git with a line in the clone's `.git/info/exclude`. Both failed when
tried on 2026-10-13:

- `/atk:help`, run twice on two models, never opened `team-roles.md` and wrote no trace, even with
  its own `SKILL.md` naming rule 10.
- Claude Code refuses to let a headless run edit `.git/info/exclude`, so a subagent or pane run could
  never pass the check that must come before the trace is written.

## Decision

- **Every `SKILL.md` opens its workflow with a line that starts the trace**, directly under the
  override line: create this run's trace at its path, and do what `shared/run-trace.md` says before
  the file, at each step, and at the close. Rule 10 stays as the obligation and as the tenth thing an
  override cannot remove.
- **A trace is kept out of git by `<docs root>/derived/traces/.gitignore` holding `*`.** It outranks
  a negation in the project's root `.gitignore`, ignores itself, and lives in the working tree, so a
  headless run can write it. `git check-ignore -q` before the trace stays mandatory.

## Consequences

- **The trace is written**, in the scratch run that tested it: an 8-line, 520-byte trace, nothing
  staged.
- **Every `SKILL.md` gains two lines**, 48 across the kit, and `review` and `verify`, at 299 lines,
  find two lines each to stay under 300.
- **A new skill must carry the line**, which `CLAUDE.md` says where it lists what a skill matches.
- **Nothing is written into the git directory** for a trace. The progress log still is, and has the
  same exposure in a headless run; that is not changed here.

## Alternatives rejected

- **Rule 10 alone, or a mention of it in a skill's prose.** Not read, two runs of two.
- **Extending the override line to point at the trace file.** The override half was done, the trace
  half was not.
- **A hook starting the trace.** It does not fire for a typed slash command or on Cursor, and a hook
  may not be the only road to a behaviour.
- **The whole procedure in every `SKILL.md`.** Twenty-four copies, and two skills at the ceiling.
- **The local exclude file.** Refused to a headless run.
- **Traces outside the repository.** Lost to the project that `atk:tailor --feedback --runs` reads.
