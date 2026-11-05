---
title: "ADR 0014: the kit's benchmark is a runner of its own under tests/bench/"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-05
updated: 2026-11-05
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-05, by instruction to the agent.

# ADR 0014: the kit's benchmark is a runner of its own under tests/bench/

Design: `docs/records/design/261105-0300-atk-benchmark.md`

## Context

The repository checks that its files are well formed and which skill a phrasing reaches. Nothing
measures whether a skill does its job, whether it stops where a person must decide, or whether the
kit does better than the same model without it. Skills stop for approval, so a benchmark must play
the people between steps without letting a skill approve its own work, which rule 2 of
`plugins/atk/shared/team-roles.md` forbids.

## Decision

A Node runner under `tests/bench/`, Claude Code only to begin with, runs scenarios against a sample
project built fresh for every run. Each scenario runs N times in two arms, with `atk` loaded and
without it. Between turns a responder answers questions from a fixed fact sheet and never approves;
between steps the runner approves an artifact by editing its status, as the approver editing the
file, and gives commit or push consent as a turn from the approver. Gate adherence, hidden tests and
git state are checked by code; artifact quality by a rubric a separate model judges. The isolation
of `atkx:skill-eval`'s trigger runner is reused by export, not copied.

## Consequences

- Nothing ships: fixtures, hidden tests and answer keys stay outside both plugins.
- The repository gains its first check that costs money to run; it stays out of `tests/verify.sh`.
- `trigger-run.mjs` exports its isolation functions, and must keep its CLI behaving as before.
- The benchmark depends on `claude -p --resume` holding a skill's question across turns, measured
  to hold on `atk:intake` on 2026-11-05 with Claude Code 2.1.318.
- It is run by hand, at most three runs per scenario, and its results are reference only: they are
  not committed and block no release.
- Codex and Cursor are not measured until the runner gains a driver for them.

## Alternatives rejected

- **`claude plugin eval`.** It has the with-and-without ablation, but no scripted second turn, so no
  chain and no interview; no grader that runs code, so no hidden test and no git state; and cases
  below the plugin, so every install would copy the fixtures. To revisit if those change.
- **A `--bench` mode of `atkx:skill-eval`.** Its scope excludes measuring a skill with and without
  itself, it evaluates a project's skill rather than the kit, and an `atkx` install would carry the
  fixtures.
