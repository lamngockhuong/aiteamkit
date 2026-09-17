# Project Roadmap

## Status

| Phase | State | Summary |
|-------|-------|---------|
| 1. Kit scaffold | DONE | Repository, three manifests, release automation, bilingual docs |
| 2. Skill coverage | DONE | 18 `SKILL.md` files covering the lifecycle, sharing one section contract |
| 3. Reference depth | IN PROGRESS | `references/` per skill. Done for the six execution skills, pending for the twelve original ones |
| 4. Trigger evals | IN PROGRESS | `evals/trigger_evals.json` per skill. Done for the six execution skills, pending for the twelve original ones. A runner is still missing |
| 5. Field validation | NOT STARTED | Run the kit on a real project team and fix what breaks |
| 6. Publication | NOT STARTED | Marketplace listing on all three harnesses |

## Phase 1: Kit scaffold (done)

Repository layout mirroring a working multi-harness plugin: `.claude-plugin/`, `.cursor-plugin/`,
`.codex-plugin/`, `skills/`, `shared/`, `assets/`, bilingual `docs/`, release-please on push to
`main`, and GitHub issue and pull request templates.

## Phase 2: Skill coverage (done)

Eighteen skills, each a `SKILL.md` under 300 lines following one section contract: frontmatter with
multilingual triggers, scope, roles, invocation, workflow, output, ticket, and a definition of done.

Twelve of them cover the process a team runs around the code. Six were added afterwards so the kit
also covers the work on the code itself, and so it stops where a role owns the decision rather than
where another kit would have taken over: `init` records what the project is, `catchup` brings
someone up to speed on work they did not help start, `plan` breaks a piece of work into reviewable
phases, `implement` writes the code, `fix` proves a defect's cause before changing a line, and
`verify` exercises the running system.

The `shared/` layer holds what would otherwise be repeated eighteen times: the role vocabulary, the
artifact path convention, and the tracker adapters, cited by every skill. Four more files are
contracts between smaller groups: `review-checklist.md` between `convention` and `review`,
`finalize-steps.md` and `layer-verification.md` between the three skills that change code, and
`project-profile.md`, which describes `.atk/profile.md`, a file that lives in the target project
rather than in the kit.

## Phase 3: Reference depth (in progress)

The six execution skills ship with `references/` already. The twelve original ones do not. For those
whose output is a document with a fixed shape, the template is re-derived on every run:

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

One `evals/trigger_evals.json` per skill, each an array of `{query, should_trigger}`. The six
execution skills have theirs; the twelve original ones do not. The cases that matter are the
near-misses between neighbours: `intake` against `design-doc`, `plan` against `breakdown`, `fix`
against `incident`, `review` against `qa`, `qa` against `verify`, `onboard` against `handover`. Add
a runner that reports which description changes broke which case.

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
- Is a nineteenth skill for daily and weekly reporting worth it, or does `atk:retro --report` already
  cover the need at a lower cadence?
- The session-start hook reminds only on Claude Code. Codex and Cursor can package hooks too; is the
  reminder worth maintaining three times, given that the real gate lives in the skills?
- `shared/project-profile.md` puts `review`, `qa`, `release` and `convention` in the Required-soft
  group, meant to continue without a profile and say so in the artifact. None of those four
  `SKILL.md` files cites the profile at all, so nothing implements it; `plan` is the only Required-
  soft skill that does. Wire the other four, or move them to the group that needs nothing.
