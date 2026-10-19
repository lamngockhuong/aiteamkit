---
title: "Orchestration: atk:spec keeps real values out of every cell (#134) and closes four project-shape gaps (#135)"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-16
ticket: none
---

# Orchestration: atk:spec keeps real values out of every cell (#134) and closes four project-shape gaps (#135)

Run `261016-1507-134-135`, started from `main` at `f2dfd88`. The project is one repository (Shape:
single repo), and `.atk/profile.md` is present and `APPROVED`, so no `atk:init` runs first. The
profile names no one for orchestration in its `Approves` column, so the approver is the Tech Lead.

## Pieces

| Piece | Input | Where it stands | Base | Branch | Worktree | Plan files |
|-------|-------|-----------------|------|--------|----------|------------|
| r1 | GitHub issue #134 | A ticket holding only a request: no requirement, design or plan names it. The skill proposed `atk:intake`; the approver changed it to `atk:plan`, under Decisions | `f2dfd88` | `feat/spec-real-values-every-cell` | `../aiteamkit-orchestrate/261016-1507-134-135/r1` | named by its plan |
| r2 | GitHub issue #135 | The same, changed to `atk:plan` the same way | r1's branch, once r1 is committed and reviewed | `feat/spec-project-shape-gaps` | `../aiteamkit-orchestrate/261016-1507-134-135/r2` | named by its plan |

Row 15 of `shared/state-signals.md` is not read for a piece by this skill; `atk:help` reads it.

## Ways

- **Panes.** A terminal multiplexer that starts agents in panes is present (`HERDR_ENV=1`), and
  `claude` and `codex` are on the machine. Not probed, and not chosen.
- **Subagents.** Not offered. This session runs with approvals bypassed, so every agent it spawns
  would write without asking, which Agents that write in `shared/host-capabilities.md` rules out.
- **Session.** Available, and chosen for every job. Nothing runs in parallel; the jobs run one after
  another, and the coordinator asks the person directly where the skill asks.

## Jobs

| Job | Skill | Agent | Way | Answers | Waits for | Approval |
|-----|-------|-------|-----|---------|-----------|----------|
| r1-1 | `atk:plan #134` | this session | session | Lam Ngoc Khuong | nothing | this record |
| r1-2 | `atk:implement <r1 plan> --no-review --out docs/derived/orchestrate/261016-1507-134-135/r1-2-record.md` | this session | session | Lam Ngoc Khuong | r1-1 | this record |
| r2-1 | `atk:plan #135` | this session | session | Lam Ngoc Khuong | r1-2 committed and reviewed | this record |
| r2-2 | `atk:implement <r2 plan> --no-review --out docs/derived/orchestrate/261016-1507-134-135/r2-2-record.md` | this session | session | Lam Ngoc Khuong | r2-1 | this record |

A plan does not gate, per Which artifacts gate in `shared/state-signals.md`, so this record reaches
each chain to its end: a local commit and an `atk:review` report. A plan the Tech Lead moves to
`IN REVIEW` stops its chain until it is `APPROVED`.

Both issues name `plugins/atk/shared/spec-docs.md`, so r2 runs after r1 and is stacked on it: its
worktree starts from `feat/spec-real-values-every-cell` once r1 is committed and reviewed, its review
target is `feat/spec-real-values-every-cell...feat/spec-project-shape-gaps`, and r1's branch is
pushed first. Each plan is written under `plans/`, which this repository ignores, so it is copied
into the coordinator's `plans/` before its worktree is removed.

No row needs `atk:design-doc`: neither issue touches a schema, a public API, or more than one
service. A plan that finds otherwise stops at the plan gate of `atk:implement`, and the chain is
escalated to the Tech Lead.

## Cost

- Concurrency 1, since the session is the way. Timeout: none applies to a session job.
- 4 jobs, then 2 `atk:review` runs after the code jobs, with up to 2 fix jobs each, so at most 4 fix
  jobs and 4 review runs in all.
- Each `atk:review` run runs `bash tests/verify.sh` and the checks it names on code the jobs wrote,
  with the coordinator's rights.
- No commit hook or filter is configured for the clone, so a commit asks nothing beyond the commit
  itself; each commit of a job's change goes through `atk:git --commit` in its worktree.
- Writing in `../aiteamkit-orchestrate/` beside the repository: this session is not sandboxed, and
  the session itself creates the worktrees.

## Decisions

- 2026-10-16 15:16, Lam Ngoc Khuong, approver: changed the first job of both chains from
  `atk:intake` to `atk:plan`, since each issue already reads as a requirement, as the work for #133
  went straight to a plan; approved the record with that change.
