---
title: "ADR 0003: atk:orchestrate proposes the jobs each piece of work needs, runs them in the way the machine offers, and never answers a gate"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-11
updated: 2026-10-15
ticket: none
---

# ADR 0003: atk:orchestrate proposes the jobs each piece of work needs, runs them in the way the machine offers, and never answers a gate

Design: `docs/records/design/261011-1538-orchestrate-team-work.md`

## Context

A person carries every piece of work through the kit by hand, one skill and one piece of work at a
time: a raw request through `atk:intake`, a requirement through `atk:design-doc` or `atk:plan`, a
plan through `atk:implement`, a defect through `atk:fix`. The maintainer wants a coordinator that:

- takes work at any stage;
- reads how far each piece has come;
- proposes the jobs, skills, and agents each still needs, for a person to approve;
- runs several pieces side by side, each in its own git worktree.

It should be able to open agents through a terminal multiplexer that reports whether each one is
idle, working, or blocked on a question. The maintainer also asked whether a skill that depends on an
outside tool belongs in `atk` at all.

`atk:help` already knows, for the work on the current branch, which artifacts gate and which skill
comes next. It keeps that in a reference file of its own.

Two probes on 2026-10-11 tried a multiplexer with a second agent CLI, with Claude Code as the
coordinator. Parallel worktrees worked, a job waiting for approval was detected, and a person's answer
let it resume. They also showed four limits:

- a sandbox limited to the worktree cannot commit in it;
- the screen is not a reliable way to read a result;
- agent CLI flags change between versions;
- an agent with write access and no approvals is refused by the session's safety classifier.

## Decision

`atk` gains a twenty-fifth skill, `atk:orchestrate`, right after `atk:help` in the lifecycle order.

- **It reads before it proposes.** For each piece of work it reads how far the piece has come, by the
  rules `atk:help` uses. Those rules move to `plugins/atk/shared/state-signals.md` so that both skills
  cite one copy.
- **It proposes a chain of jobs per piece.** Each job is one atk skill, with the agent chosen per job,
  the way it runs, and the person who answers its questions.
- **Approval comes in steps.** Approval covers each chain up to its first artifact that gates. The
  rest of the chain is proposed again once that artifact is approved.
- **Jobs never answer for a person.** A job runs one atk skill and no skill of another kit, and writes
  its result to a file. Every question a skill asks goes to the named person. Every gating artifact
  waits for its approver, and the coordinator never answers either.
- **Code ends at a local commit with an independent `atk:review`.** Push, pull request, and merge stay
  outside the skill.
- **Jobs run in the first way the machine offers, in a fixed order:**
  1. agents in terminal panes, through a multiplexer named only by what it does, stated as tried with
     Claude Code only;
  2. the host's own subagents;
  3. one at a time in the session, recorded as such.

  No step stops because a multiplexer is missing.

`plugins/atk/shared/host-capabilities.md` gains a section for agents that write. Until now every
agent the kit spawned read and changed nothing.

## Consequences

- **Every team gets the skill.** A team without a multiplexer runs it through subagents or
  sequentially.
- **`atk:help` and `atk:orchestrate` cannot drift apart** on what comes next, because they read one
  file.
- **Every skill list changes.** All twelve groups of `CONV-001` change, and every list of skills gains
  `orchestrate` after `help`.
- **A second skill now starts long-running things**, after `atk:verify`, so it carries a
  `## Process management` section.
- **Every commit is the coordinator's.** A job never stages or commits, since both write under the
  main repository's git directory, outside the worktree; it leaves its change in the working tree,
  and the coordinator commits it through `atk:git --commit`. The sandbox is never widened.
- **One repository only, for now.** A project whose profile names member repositories, or a
  workspace, is refused at the proposal: one worktree per piece cannot hold the parent's documents
  and a member's code.
- **`atk:verify` does not run in parallel worktrees**, because they would contend for one port. It is
  proposed per branch, one at a time.
- **The name is shared with another kit's skill** installed on the maintainer's machine. The
  `description` and the trigger evals have to keep the two apart, and no plugin file may name the
  other.

## Alternatives rejected

- **Writing the pattern down without a skill.** It leaves the person as the coordinator.
- **A fixed pipeline of one-shot headless processes.** A one-shot
  process has nobody to ask at a gate, and its unattended write mode is refused outright.
- **Placing it in `atkx`.** It reads requirements, designs, and plans, and produces artifacts and code
  a teammate reviews, which fails AC1 of
  `docs/records/design/260930-0933-atkx-utility-kit-placement.md`.
- **A third plugin.** It costs manifests, marketplace entries, and a release package, and buys nothing
  the `atk` skill lacks.
- **The names `coordinate`, `dispatch`, and `conduct`.** `orchestrate` was chosen on 2026-10-11 with
  the shared-name risk accepted.
