---
title: "ADR 0009: The team chooses the model of the agents atk spawns, through the profile"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-23
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-23, by instruction to the agent.

# ADR 0009: The team chooses the model of the agents atk spawns, through the profile

Design: `docs/records/design/261022-0830-agent-model-from-profile.md`

## Context

No `atk` skill or agent names a model, so every agent a skill spawns runs on the harness's choice,
usually the session's model. The agents are where a run's cost multiplies: a review spawns one per
round, more under `--parallel`, a challenge one per lens, and seven skills hand wide reading to one.
Claude Code, Cursor and Codex all let the caller name a model when it spawns an agent, per their
documentation read on 2026-10-22. Choosing a cheaper model trades cost against what a review finds,
which is a decision a role owns, not the kit.

## Decision

Two optional lines in the Team section of `.atk/profile.md`, `Reading agent model` and
`Review agent model`, each a list of `<harness> <model>` pairs or `inherit`. A skill passes the
named model when it spawns an agent of that kind on that harness, and passes nothing when the line
or the harness is missing. The run states the model it asked for beside the number of agents it
spawns. A harness that cannot take a model at spawn spawns as today and the run says the line was
not applied.

The session's model, the band 1 reviewer of `atk:review`, and every agent that writes, the jobs of
`atk:orchestrate`, are never covered. The kit ships no model name and checks none.

## Consequences

- A project that writes nothing behaves exactly as today on every harness.
- A team can lower the cost of wide reading without touching review, or both, by editing its
  profile, and revert by deleting a line.
- A model named at spawn outranks a person's own default for subagents on Claude Code and Codex, for
  the kit's agents only and only where the team named one for that harness. The stated total shows it.
- Whether a cheaper review model misses findings is unmeasured. The Tech Lead allowed both lines
  anyway, answering Q1 of the design, and the review report names the model a round ran on.
- Cursor's honouring of a spawn model is documented but not measured here, and
  `docs/system-architecture.md` states it as read, per the answer to Q2 of the design.

## Alternatives rejected

- **Document the harness's own default for subagents and change no skill.** One value reaches every
  subagent, including the agents of `atk:orchestrate` that write code, so reading cannot be lowered
  without lowering them; Cursor documents no such default. It stays available to a person wherever
  the profile is silent.
- **Ship a second read-only agent with a cheaper model in its frontmatter.** The kit would pick the
  model, the name would mean nothing on Cursor or Codex, and it would go stale with each release.
- **A `model:` field in each `SKILL.md`.** The kit would pick, and on Claude Code it would change the
  session's own model for the turn, overriding the person's choice.
