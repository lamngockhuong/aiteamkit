# Project Roadmap

## Status

| Phase | State | Summary |
|-------|-------|---------|
| 1. Kit scaffold | DONE | Repository, three manifests, release automation, bilingual docs |
| 2. Skill coverage | DONE | 22 `SKILL.md` files covering the lifecycle, sharing one section contract |
| 3. Reference depth | IN PROGRESS | `references/` per skill. Done for fourteen, pending for the other eight |
| 4. Trigger evals | DONE | `evals/trigger_evals.json` for all 22 skills. The kit ships no runner; `docs/trigger-eval-measurement.md` says how to measure one |
| 5. Field validation | NOT STARTED | Run the kit on a real project team and fix what breaks |
| 6. Publication | NOT STARTED | Marketplace listing on all three harnesses |

## Phase 1: Kit scaffold (done)

Repository layout mirroring a working multi-harness plugin: `.claude-plugin/`, `.cursor-plugin/`,
`.codex-plugin/`, `skills/`, `shared/`, `assets/`, bilingual `docs/`, release-please on push to
`main`, and GitHub issue and pull request templates.

## Phase 2: Skill coverage (done)

Twenty-two skills, each a `SKILL.md` under 300 lines following one section contract: frontmatter
with multilingual triggers, scope, roles, invocation, workflow, output, ticket, and a definition of
done.

Twelve of them cover the process a team runs around the code. Eight were added afterwards so the kit
also covers the work on the code itself, and so it stops where a role owns the decision rather than
where another kit would have taken over: `init` records what the project is, `catchup` brings
someone up to speed on work they did not help start, `plan` breaks a piece of work into reviewable
phases, `implement` writes the code, `fix` proves a defect's cause before changing a line, `verify`
exercises the running system, and `spec` keeps the documents that say what the API, the schema and
each feature do today.

`help` came last. It writes nothing and answers which of the others to run, read from the state of
the project rather than from a list, so a skill added later is one it already knows.

The `shared/` layer holds what would otherwise be repeated twenty-two times: the role vocabulary,
the artifact path convention, and the tracker adapters, cited by every skill. Eleven more files are
contracts between smaller groups: `review-checklist.md` between `convention` and `review`,
`finalize-steps.md` and `layer-verification.md` between the three skills that change code,
`diagram-conventions.md` between the five whose artifacts carry a diagram, `host-capabilities.md`
and `tidy-pass.md` around what the harness itself provides, `spec-docs.md` between `spec` and the
five skills that have to leave its documents true, `host-file-locations.md` between `convention`,
which asks whether a collaboration file is missing, `git`, which has to find the pull request
template, and `init`, which reads the team's handles out of `CODEOWNERS`, `design-sources.md`,
which says how `spec` and `intake` read a Figma design, `project-profile.md`,
which describes `.atk/profile.md`, a file that lives in the target project rather than in the kit,
and `project-overrides.md`, which describes `.atk/overrides/<skill>.md` and reaches every skill
through rule 7 of `team-roles.md` rather than by being cited directly.

## Phase 3: Reference depth (in progress)

Fourteen skills ship with `references/` already. The other eight do not. Where the output is a
document with a fixed shape and no reference holds that shape, the template is re-derived on every
run:

| Skill | Reference to add |
|-------|------------------|
| `intake` | An interview question bank. The requirement template is done: `skills/intake/references/requirement-template.md` |
| `estimate` | The sizing scales with one worked example each, and the capacity worksheet |
| `design-doc` | Design document template, ADR template, the option-comparison criteria set. The spike mode is done: `skills/design-doc/references/spike.md` |
| `breakdown` | Task table schema and the file-ownership rules for parallel lanes |
| `qa` | Test case table schema. The negative and boundary dimensions are done: `skills/qa/references/case-dimensions.md` |
| `release` | Checklist template per environment, the client-notes style rules |
| `incident` | Severity rubric, timeline format, postmortem template |
| `retro` | The evidence-gathering command set for git, CI, and each tracker |
| `convention` | The derivation heuristics per language and framework |
| `handover` | Document templates and the interview bank |

The constraint stays: `SKILL.md` under 300 lines, detail moves to `references/`.

## Phase 4: Trigger evals (done)

One `evals/trigger_evals.json` per skill, each an array of `{query, should_trigger}` split between
phrasings that must trigger the skill and phrasings that must not. The twelve written last carry 20
to 22 cases each; the eight written earlier range from 16 to 31, because they were sized one at a
time as each skill landed. The cases that earn
their place are the near-misses between neighbours, and every pair now has a file on both sides:
`intake` against `design-doc`, `plan` against `breakdown`, `fix` against `incident`, `review`
against `qa`, `qa` against `verify`, `onboard` against `handover`. Each file also covers the three
trigger languages, so dropping the Vietnamese or Japanese phrasings from a `description` fails a
case rather than passing unnoticed.

The kit ships no runner on purpose: one more slash command with no artifact and no approver is not
what the kit is for. Measuring a case is not as simple as pointing a generic harness at the file,
which reports a vacuous score against an installed plugin;
[trigger-eval-measurement.md](trigger-eval-measurement.md) holds the method that works and the
cases nothing can observe.

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
- Is a further skill for daily and weekly reporting worth it, or does `atk:retro --report` already
  cover the need at a lower cadence?
- The session-start hook now runs on Claude Code and on Codex, which reach the same script through
  two registration files. The override loader is registered on Codex too, and has never been observed
  matching a skill invocation there. Cursor can package hooks too; is a third registration worth
  maintaining, given that the reminder is a convenience and the override loader only saves a file
  read the skill would otherwise do itself?
- `shared/project-profile.md` puts `review`, `qa`, `release` and `convention` in the Required-soft
  group, meant to continue without a profile and say so in the artifact. `plan` and `convention`
  implement it; `review`, `qa` and `release` do not cite the profile at all, so for them nothing
  does. Wire the other three, or move them to the group that needs nothing.
