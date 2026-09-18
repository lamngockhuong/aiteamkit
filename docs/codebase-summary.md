# Codebase Summary

File-by-file reference of every tracked file. This document goes stale the moment a file is added,
removed, or renamed; update it in the same commit.

## Root

| File | Purpose |
|------|---------|
| `README.md` | Public entry point: lifecycle diagram, the 19-skill table, invocation block, output convention, install instructions |
| `CLAUDE.md` | Maintainer guidance: the team premise, multi-manifest layout, skill anatomy, the `shared/` DRY rule, cross-file sync list, em-dash policy, release flow, verification commands |
| `LICENSE` | MIT |
| `package.json` | `private: true`, no scripts; exists to carry the version and repository metadata |
| `release-please-config.json` | Release automation: `simple` release type, pre-1.0 bump flags, and the five version `extra-files` |
| `.release-please-manifest.json` | Release-please state file holding the current version. Never hand-edit |
| `.gitignore` | macOS, Python, Node artifacts |

## Manifests

| File | Purpose |
|------|---------|
| `.claude-plugin/plugin.json` | Claude Code plugin metadata. No `skills` key: Claude auto-discovers `skills/` |
| `.claude-plugin/marketplace.json` | Claude Code marketplace entry pointing at `./` |
| `.cursor-plugin/plugin.json` | Cursor plugin metadata with `displayName` and `"skills": "./skills/"` |
| `.codex-plugin/plugin.json` | Codex CLI metadata with `"skills": "./skills/"` plus the `interface{}` listing block: descriptions, `defaultPrompt`, `brandColor`, icon paths |

## Shared layer

| File | Purpose |
|------|---------|
| `shared/team-roles.md` | Role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the six rules every skill follows: name an owner, separate author from approver, do not decide what a role owns, write for the absent reader, ask only what the repository cannot answer, follow the team's language |
| `shared/artifact-paths.md` | Docs root resolution, the default output path per skill, `YYMMDD` naming, the reference-document kinds table, the three persistence groups and which of them are committed, ADR numbering, the shared YAML front matter block, and the rule against overwriting an `APPROVED` record |
| `shared/ticket-adapters.md` | Tracker detection order, the atk-to-tracker vocabulary map for GitHub Issues, Jira, Backlog, and Redmine, the `gh` push commands, and the two-way linking rule |
| `shared/review-checklist.md` | The order that resolves where a project keeps its conventions, the rule that a project which already writes them keeps its own shape, the `CONV-NNN` rule record format that `convention` writes and `review` cites, what each skill does with it, the eight baseline items with default severities, and the rule for retiring a stale rule. Cited by `convention`, `review` and `implement` |
| `shared/project-profile.md` | What `.atk/profile.md` holds in the target project, why it lives there rather than in the kit, and the three-group rule deciding whether a skill stops, degrades, or ignores a missing profile |
| `shared/finalize-steps.md` | The closing sequence for a code change: the reference documents it owes, branch, commit, and the consent line every action past the commit has to cross. Cited by `fix`, `implement`, and `verify` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not. Cited by `fix`, `implement`, and `verify`, so all three say the same thing about the same result |
| `shared/diagram-conventions.md` | When a diagram earns its place in an artifact, the four shapes the kit draws (approval flow, dependency graph, sequence, causal chain), and the rules that keep them readable: Mermaid only, `<br/>` not a literal newline, roles instead of names, both branches on every decision, no hardcoded fill colours. Cited by `catchup`, `design-doc`, `plan`, `breakdown`, and `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use and how to name one, the rule that a command from another kit still may not be named, what to do on a harness that has neither, the four rules of the tidy step, and the policy bounding parallel reviewers. Cited by `fix`, `implement`, `verify`, and `review` |
| `shared/spec-docs.md` | What separates a reference document from a design document, the rule that the project's own document shape wins over a kit template, the five kinds of change that oblige a pull request to carry its reference document, and the line between drift and a question nobody has answered. Cited by `spec`, `design-doc`, `implement`, `fix`, `verify`, and `review` |
| `shared/tidy-pass.md` | The content of the tidy step: three lenses (reuse, clarity, efficiency), what may be changed, what is never touched, and what to read in the diff afterwards. Cited by `fix`, `implement`, and `verify` through `host-capabilities.md`, and the reason the kit ships no `simplify` skill |

## Hooks

| File | Purpose |
|------|---------|
| `hooks/hooks.json` | Registers one `SessionStart` hook for Claude Code, in exec form so no shell is involved on any platform: `"command": "node"` plus `${CLAUDE_PLUGIN_ROOT}` in `args` |
| `hooks/check-profile.mjs` | Node ESM, so it behaves the same on Linux, macOS, and Windows. Prints one reminder when a git repository has no `.atk/profile.md`, once per project, and exits 0 on every path. Never blocks, never writes into the user's repository. Codex and Cursor have no wrapper yet |

## Skills

Each skill is one `SKILL.md`. Seven skills also carry `references/` and `evals/`.
`review` carries `references/` alone; the other eleven original skills carry neither yet.

| File | Stage | Produces |
|------|-------|----------|
| `skills/init/SKILL.md` | Setup | `.atk/profile.md`: commands, layers, docs roots, tracker, team, and how to verify at runtime |
| `skills/intake/SKILL.md` | Requirement | User stories, acceptance criteria, non-goals, open questions with owners |
| `skills/catchup/SKILL.md` | Requirement | A brief for someone who was not in the conversation, plus the understanding check for an epic |
| `skills/estimate/SKILL.md` | Planning | Sizes with basis and confidence, capacity, sprint commitment, overflow |
| `skills/design-doc/SKILL.md` | Design | Technical design with compared options, plus the ADR |
| `skills/spec/SKILL.md` | Design | Reference documents for API, schema, and feature, updated in place, plus the drift check |
| `skills/breakdown/SKILL.md` | Planning | Owned tasks, dependency graph, parallel lanes with file ownership |
| `skills/convention/SKILL.md` | Development | Team conventions classified enforced / reviewed / aspirational |
| `skills/plan/SKILL.md` | Development | Phases ending in something reviewable, steps that leave the tree working, scope boundary |
| `skills/implement/SKILL.md` | Development | The code, verified by layer, plus the record that becomes the pull request body |
| `skills/fix/SKILL.md` | Development | A proven cause, the smallest change removing it, and a report of what was checked |
| `skills/review/SKILL.md` | Development | Findings ranked blocking / should fix / nit, optionally posted to the PR |
| `skills/qa/SKILL.md` | Verification | Test plan, traced test cases, regression matrix, entry and exit criteria |
| `skills/verify/SKILL.md` | Verification | The running system exercised, side effects asserted in data, escalation after three rounds |
| `skills/release/SKILL.md` | Delivery | Notes per audience, checklist with owners, migrations, rollback, sign-offs |
| `skills/incident/SKILL.md` | Operation | Timeline, proven root cause, blameless postmortem, actions, runbook |
| `skills/retro/SKILL.md` | Improvement | Previous actions verified, sprint evidence, three actions, status report |
| `skills/onboard/SKILL.md` | Team | Verified setup, access list, code map, first week ending in a merged change |
| `skills/handover/SKILL.md` | Team | True state of in-flight work, decisions, traps, access transfer, receiver sign-off |

### References

Loaded only when a workflow step opens them, so they stay out of the default context.

| File | Purpose |
|------|---------|
| `skills/init/references/detection.md` | Where to look for each profile field, and what to do when the repository gives several answers or none |
| `skills/init/references/profile-template.md` | The shape of `.atk/profile.md` that `init` fills in |
| `skills/catchup/references/brief-template.md` | One skeleton for both modes, with the epic and pull-request differences marked per section |
| `skills/catchup/references/understanding-check.md` | The fixed questions, the feature type table, and the two rules deciding whether the check is worth anything |
| `skills/plan/references/step-ordering.md` | The two cuts, phase and step, and the rule for each |
| `skills/plan/references/plan-template.md` | The plan index and the phase file |
| `skills/implement/references/plan-gate.md` | The three settings deciding how much agreement the work needs before code is written |
| `skills/implement/references/verification.md` | The order to run checks in, how far to reach, and when to stop |
| `skills/implement/references/review-fix-loop.md` | The team review run against the skill's own output, and the ceiling that stops the loop hiding a design problem |
| `skills/fix/references/investigate.md` | Proving the cause, the intent check, and the gate that decides whether a fix may happen at all |
| `skills/fix/references/layer-playbooks.md` | Per layer: where the cause usually hides, how to reproduce it, and how to confirm it is gone |
| `skills/fix/references/report-template.md` | The fix report, written for a reviewer who has to check a claim rather than trust it |
| `skills/spec/references/api-spec-template.md` | The API document shape for an empty directory: processing strategy first, then one block per endpoint |
| `skills/spec/references/db-spec-template.md` | The table document shape: columns, keys, the lifecycle of a row, access rules |
| `skills/spec/references/feature-spec-template.md` | The feature document shape: entry points including jobs, behaviour by condition, permissions by role |
| `skills/spec/references/drift-check.md` | The coverage checklist, the shape of a finding, the three severities, and the read-only boundary |
| `skills/review/references/parallel-review.md` | The width table and the memory cap bounding it, what every reviewer is given, and how several passes become one ranked list |
| `skills/verify/references/runtime-checks.md` | Bringing the application up, exercising it, asserting a real side effect, and cleaning up |
| `skills/verify/references/ui-checks.md` | The `--ui` pass: comparing a screen against the design |
| `skills/verify/references/report-template.md` | The verification report, naming what was proven and what was not |

### Trigger evals

Each holds an array of `{query, should_trigger}` testing the skill's `description`. There is no
runner yet; see `docs/project-roadmap.md` phase 4.

| File | Purpose |
|------|---------|
| `skills/init/evals/trigger_evals.json` | Setup phrasing against project configuration requests that are not `init` |
| `skills/catchup/evals/trigger_evals.json` | Catching up on existing work against `intake` and `onboard` |
| `skills/plan/evals/trigger_evals.json` | Planning one person's work against `breakdown` and `design-doc` |
| `skills/spec/evals/trigger_evals.json` | Reference documents against `design-doc`, `intake`, and code generation |
| `skills/implement/evals/trigger_evals.json` | Building against planning and reviewing |
| `skills/fix/evals/trigger_evals.json` | A defect against `incident` and ordinary implementation |
| `skills/verify/evals/trigger_evals.json` | Runtime confirmation against `qa` and `review` |

## Assets

| File | Purpose |
|------|---------|
| `assets/atk-icon.svg` | Square icon, two figures on a blue rounded square. Referenced by `.codex-plugin` as `composerIcon` |
| `assets/atk-logo.svg` | Horizontal logo, icon plus wordmark. Referenced by `.codex-plugin` as `logo` |

## Documentation

English is the source of truth; `docs/vi/` mirrors it file-for-file.

| File | Purpose |
|------|---------|
| `docs/project-overview-pdr.md` | What atk is, the process failures it addresses, goals, non-goals, audience, success criteria |
| `docs/system-architecture.md` | One content tree with three manifests, the load model and its size budget, the `shared/` layer, skill anatomy, runtime data flow |
| `docs/skills-overview.md` | Per skill: what it produces, when to use, when not to, and the one habit that makes it work |
| `docs/artifact-lifecycle.md` | Which artifacts to commit, which may be deleted, what each deletion costs, and the three policies a team can choose between |
| `docs/codebase-summary.md` | This file |
| `docs/project-roadmap.md` | Phase plan and status |
| `docs/flow/project-flow.md` | The 19 skills placed in delivery phases, with the author and the approver of each artifact and the loop back when one is rejected |
| `docs/flow/skill-chain.md` | The artifact chain: what each skill reads, what it leaves behind, which skill picks that up, and the three ways a chain breaks |
| `docs/flow/skill-lifecycle.md` | Inside one skill: the nine sections every `SKILL.md` carries, the five stages of a run, and the five kinds of edge between skills, of which only four happen at run time |
| `docs/vi/**/*.md` | Vietnamese mirror of the eight files above, at the same relative paths |

## GitHub

| File | Purpose |
|------|---------|
| `.github/workflows/release-please.yml` | Runs release-please on push to `main` |
| `.github/PULL_REQUEST_TEMPLATE.md` | Conventional Commit guidance, affected harnesses, and the verification checklist including the cross-file sync items |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank issues, links to Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Bug form with harness and component dropdowns. The component list must include all 19 skills, plus the profile, the shared layer, and the hook |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Feature form asking for the team situation before the proposed capability |
