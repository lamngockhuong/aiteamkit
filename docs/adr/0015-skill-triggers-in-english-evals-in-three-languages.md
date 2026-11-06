---
title: "ADR 0015: Skill triggers are written in English, and the trigger evals keep three languages"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-06
updated: 2026-11-06
ticket: none
---

# ADR 0015: Skill triggers are written in English, and the trigger evals keep three languages

Measurement: "English-only triggers, measured" in `docs/trigger-eval-measurement.md`.

## Context

Every `description:` of both plugins listed its trigger phrases in English, Vietnamese, and
Japanese, because the teams the kit serves ask in all three. The rule rested on an assumption that
had never been measured: that a Vietnamese or Japanese request needs a phrase in its own language to
reach a skill.

The list had a cost. It took 6,989 of the 19,866 characters of the 25 `atk` descriptions, and it
sits at the end of each. Claude Code cuts a description short in its skill listing, at 1,536
characters per skill and further once many skills are installed. In a session with about 200 skills
installed, the listing showed `atk:estimate` whole, cut nine descriptions inside their trigger list,
and cut fifteen before it began.

## Decision

- A `description:` lists its triggers in English only. A Vietnamese or Japanese request reaches the
  skill through the meaning of the English description.
- `evals/trigger_evals.json` keeps its Vietnamese and Japanese cases. They are the check that the
  English description still reaches requests in those languages.
- When a measurement shows such a case lost, the English description is sharpened and measured
  again. Adding the phrase back is not the fix.

## Evidence

Measured on 2026-11-06 with the `atkx:skill-eval` trigger runner, model sonnet, Claude Code
2.1.319, two runs per case: 64 Vietnamese and Japanese cases across `review`, `qa`, and `fix`, run
against three versions of all 25 descriptions. The three-language list, English only, and a short
list of three phrases per language placed after the first sentence reached the right skill in 68,
68, and 70 of 74 positive runs, and kept away in all 54 negative runs each. The differences are one
or two runs, within what two runs per case can separate.

## Consequences

- The descriptions lose 3,396 characters across the 27 skills of both plugins, so less of each is
  cut when the listing is crowded.
- A team that asks in Vietnamese or Japanese depends on the trigger evals rather than on phrases in
  the description, so a description edit that drops one of those cases is caught only if someone
  runs the measurement.
- The result belongs to sonnet and to three skills. A smaller model, or a pair of skills with a
  narrower boundary, may need its own measurement before a description is trimmed further.

## Alternatives rejected

- **Keep the three-language list.** It measured no better and costs the most characters, the part
  most often cut.
- **A short list of three phrases per language after the first sentence.** It measured level with
  English only, and keeps a second and third language in every description to maintain.
