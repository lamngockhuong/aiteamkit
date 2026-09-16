# Project Roadmap

## Status

| Phase | State | Summary |
|-------|-------|---------|
| 1. Kit scaffold | DONE | Repository, three manifests, release automation, bilingual docs |
| 2. Skill skeletons | DONE | 12 `SKILL.md` files covering the lifecycle, sharing one section contract |
| 3. Reference depth | NOT STARTED | `references/` templates, checklists, and schemas per skill |
| 4. Trigger evals | NOT STARTED | `evals/trigger_evals.json` per skill, and a runner |
| 5. Field validation | NOT STARTED | Run the kit on a real project team and fix what breaks |
| 6. Publication | NOT STARTED | Marketplace listing on all three harnesses |

## Phase 1: Kit scaffold (done)

Repository layout mirroring a working multi-harness plugin: `.claude-plugin/`, `.cursor-plugin/`,
`.codex-plugin/`, `skills/`, `shared/`, `assets/`, bilingual `docs/`, release-please on push to
`main`, and GitHub issue and pull request templates.

## Phase 2: Skill skeletons (done)

Twelve skills, each a single `SKILL.md` of roughly 95 to 115 lines following one section contract:
frontmatter with multilingual triggers, scope, roles, invocation, workflow, output, ticket, and a
definition of done. The `shared/` layer holds the role vocabulary, the artifact path convention, and
the tracker adapters, so none of it is repeated twelve times.

It also holds `shared/review-checklist.md`, the contract that lets `atk:convention` write a rule
once and `atk:review` enforce it in the same words, citing the rule by ID.

## Phase 3: Reference depth (next)

Add `references/` to the skills whose output is a document with a fixed shape, so the templates stop
being re-derived on every run:

| Skill | Reference to add |
|-------|------------------|
| `intake` | Story and acceptance-criteria templates, an interview question bank |
| `design-doc` | Design document template, ADR template, the option-comparison criteria set |
| `qa` | Test case table schema, a negative and boundary case checklist by input type |
| `release` | Checklist template per environment, the client-notes style rules |
| `incident` | Severity rubric, timeline format, postmortem template |
| `retro` | The evidence-gathering command set for git, CI, and each tracker |
| `convention` | The derivation heuristics per language and framework |
| `onboard`, `handover` | Document templates and the interview banks |

The constraint stays: `SKILL.md` under 300 lines, detail moves to `references/`.

## Phase 4: Trigger evals

One `evals/trigger_evals.json` per skill, each an array of `{query, should_trigger}`. The cases that
matter are the near-misses between neighbours: `intake` against `design-doc`, `review` against `qa`,
`incident` against `release`, `onboard` against `handover`. Add a runner that reports which
description changes broke which case.

## Phase 5: Field validation

Run the kit on a real team for a full sprint cycle. Expected findings: interviews that ask what the
repository could have answered, artifacts nobody reads, and skills that quietly decide something a
role owns. The last category is a defect, not a preference.

## Phase 6: Publication

List on the Claude Code, Cursor, and Codex marketplaces once phases 3 to 5 close. Graduate from
pre-1.0 by dropping the two `bump-*-pre-major` flags in `release-please-config.json`.

## Open questions

- Do teams tracking work in Backlog or Redmine need a real adapter with API calls, or is the
  vocabulary map plus manual paste enough?
- Is a thirteenth skill for daily and weekly reporting worth it, or does `atk:retro --report` already
  cover the need at a lower cadence?
