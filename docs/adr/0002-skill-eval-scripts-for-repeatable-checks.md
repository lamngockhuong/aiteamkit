---
title: "ADR 0002: atkx:skill-eval keeps its repeatable checks in Node scripts"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-01
updated: 2026-10-01
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-01, by instruction to the agent.

# ADR 0002: atkx:skill-eval keeps its repeatable checks in Node scripts

Design: `docs/records/design/261001-1510-atkx-skill-eval.md`

## Context

`atkx:skill-eval` evaluates a skill: a static check with a security gate, the project's own rules,
trigger measurement on Claude Code, drafted trigger cases, a review of one run, and a composite
score. Sample skills shipped with it must get the same verdict on every run, so that a change to the
evaluator that breaks its judgment is caught.

Every existing skill in the kit is instructions alone. The only code the kit ships is two Node hooks,
Node because it behaves the same on Linux, macOS and Windows. The trigger method the repository
trusts had no runner kept anywhere; it was pasted into `docs/trigger-eval-measurement.md` and rebuilt
by hand.

## Decision

The checks whose answer must repeat are Node scripts under `plugins/atkx/skills/skill-eval/scripts/`:
the static check and security gate, the trigger runner and its hook, and the score. The checks that
need judgment stay with the agent, each in a reference file: the project's conventions, drafting
cases, reviewing a run, writing the report. A host without Node runs every mode but triggers by hand
from those references, and the report says so.

## Consequences

- The sample skills' verdicts are a command the maintainer runs, listed with the repository's other
  verification commands.
- `skill-eval` is the first skill in either kit with a `scripts/` directory. `CLAUDE.md` allows it for
  `atkx`, Node only, and only for checks that must repeat.
- The trigger runner lives in the skill, so `docs/trigger-eval-measurement.md` points at it instead of
  carrying its own copy.
- Four scripts are maintained beside the references, in the runtime the kit already requires.

## Alternatives rejected

- **Instructions only, as every other skill is.** Masking, host matching, and counting sixty session
  outcomes vary from run to run when an agent does them, so the sample verdicts would hold by luck,
  and every child session would sit in the agent's context.
- **Python scripts.** As repeatable as Node, but a second runtime the kit does not otherwise need,
  absent by default on Windows.
