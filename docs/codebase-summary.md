# Codebase Summary

File-by-file reference of every tracked file. This document goes stale the moment a file is added,
removed, or renamed; update it in the same commit.

## Root

| File | Purpose |
|------|---------|
| `README.md` | Public entry point: lifecycle diagram, the 21-skill table, invocation block, output convention, install instructions |
| `CLAUDE.md` | Maintainer guidance: the team premise, multi-manifest layout, skill anatomy, the `shared/` DRY rule, cross-file sync list, em-dash policy, the `CONV-NNN` review checklist this repository is held to, release flow, verification commands |
| `CHANGELOG.md` | Written by release-please from the commit types, never by hand. `feat:` and `fix:` appear; the other types are silent |
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
| `shared/team-roles.md` | Role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the seven rules every skill follows: name an owner, separate author from approver, do not decide what a role owns, write for the absent reader, ask only what the repository cannot answer, follow the team's language, honour the project's overrides |
| `shared/artifact-paths.md` | Docs root resolution, the default output path per skill, `YYMMDD` naming, the reference-document kinds table, the three persistence groups and which of them are committed, ADR numbering, the shared YAML front matter block, and the rule against overwriting an `APPROVED` record |
| `shared/ticket-adapters.md` | Tracker detection order, the atk-to-tracker vocabulary map for GitHub Issues, Jira, Backlog, and Redmine, the `gh` push commands, and the two-way linking rule |
| `shared/review-checklist.md` | The order that resolves where a project keeps its conventions, the rule that a project which already writes them keeps its own shape, the `CONV-NNN` rule record format that `convention` writes and `review` cites, what each skill does with it, the eight baseline items with default severities, and the rule for retiring a stale rule. Cited by `convention`, `review` and `implement` |
| `shared/project-profile.md` | What `.atk/profile.md` holds in the target project, why it lives there rather than in the kit, and the three-group rule deciding whether a skill stops, degrades, or ignores a missing profile |
| `shared/project-overrides.md` | What `.atk/overrides/<skill>.md` holds in the target project, why one file per skill rather than several, the `## Before` and `## After` sections, the seven things an override may never remove, and the line it makes a skill print when it skips one. Reached from rule 7 of `shared/team-roles.md`, so every skill honours it |
| `shared/finalize-steps.md` | The closing sequence for any finished work: the reference documents it owes, branch, commit, merge, and the consent line every action past the commit has to cross. `atk:git` carries it out; this file is the contract. Cited by every skill that finishes something |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not. Cited by `fix`, `implement`, and `verify`, so all three say the same thing about the same result |
| `shared/diagram-conventions.md` | When a diagram earns its place in an artifact, the four shapes the kit draws (approval flow, dependency graph, sequence, causal chain), and the rules that keep them readable: Mermaid only, `<br/>` not a literal newline, roles instead of names, both branches on every decision, no hardcoded fill colours. Cited by `catchup`, `design-doc`, `plan`, `breakdown`, and `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use and how to name one, the rule that a command from another kit still may not be named, what to do on a harness that has neither, the four rules of the tidy step, and the policy bounding how many reviewers a round runs at once. Cited by `fix`, `implement`, `verify`, and `review` |
| `shared/spec-docs.md` | What separates a reference document from a design document, the rule that the project's own document shape wins over a kit template, the five kinds of change that oblige a pull request to carry its reference document, and the line between drift and a question nobody has answered. Cited by `spec`, `design-doc`, `implement`, `fix`, `verify`, and `review` |
| `shared/host-file-locations.md` | Host detection in its own order, the locations GitHub and GitLab read `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, both spellings, and the rule that a file present at any of them is present, including why a stub counts as absent. Cited by `convention` to decide what is missing and by `git` to find the template it fills |
| `shared/tidy-pass.md` | The content of the tidy step: three lenses (reuse, clarity, efficiency), what may be changed, what is never touched, and what to read in the diff afterwards. Cited by `fix`, `implement`, and `verify` through `host-capabilities.md`, and the reason the kit ships no `simplify` skill |

## Hooks

| File | Purpose |
|------|---------|
| `hooks/hooks.json` | Registers two Claude Code hooks, both in exec form so no shell is involved on any platform: `"command": "node"` plus `${CLAUDE_PLUGIN_ROOT}` in `args` |
| `hooks/check-profile.mjs` | `SessionStart`. Node ESM, so it behaves the same on Linux, macOS, and Windows. Prints one reminder when a git repository has no `.atk/profile.md`, once per project, and exits 0 on every path. Never blocks, never writes into the user's repository. Codex and Cursor have no wrapper yet |
| `hooks/load-overrides.mjs` | `PreToolUse` with matcher `Skill`. Puts `.atk/overrides/<skill>.md` in front of the skill that owns it, saving a read and nothing more. Answers only for skills under the `atk:` namespace, so another kit's same-named skill never receives this project's instructions. Prints an empty object for another tool, another namespace, a bare name, a missing file, a name with a path separator, or malformed input, and names rather than inlines a file past 4096 characters. Every skill opens the file itself where no hook ran |

## `.atk/` in this repository

The kit applied to itself. Written by `atk:init` and `atk:tailor` in this repository, read by the
skills at the top of their workflow, and committed so the next maintainer inherits both.

| File | Purpose |
|------|---------|
| `.atk/profile.md` | This repository's own profile: no build and no test command, so the Commands section carries the four verification checks from `CLAUDE.md` instead, plus one content layer, `docs/` as the docs root, `CLAUDE.md` as both the conventions and the review checklist, and GitHub Issues as the tracker |
| `.atk/overrides/review.md` | The override `atk:tailor` wrote for `atk:review` here: a diff touching a verification command block in `CLAUDE.md` has to be checked by running the block, not by reading it, at `BLOCKING`. The repository's content rules stay out of it; those are the `CONV-NNN` rows in `CLAUDE.md` |

## Skills

Each skill is one `SKILL.md` with an `evals/trigger_evals.json` beside it. Eleven also carry
`references/`; the other ten do not yet.

| File | Stage | Produces |
|------|-------|----------|
| `skills/init/SKILL.md` | Setup | `.atk/profile.md`: commands, layers, docs roots, tracker, team, and how to verify at runtime |
| `skills/tailor/SKILL.md` | Setup | `.atk/overrides/<skill>.md`: what this team wants one skill to do differently, with the owning role as approver |
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
| `skills/git/SKILL.md` | Version control | The diff read before staging, a scan that stops on a credential, commits that revert alone, and push, pull request and merge each behind their own yes |
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
| `skills/tailor/references/interview.md` | The five groups of question, the filter that sends an answer to `init` or `convention` instead, and a worked example per group |
| `skills/tailor/references/audit.md` | The three `--audit` checks, why a conflict is a fact and a stale anchor is a question, and the rule that it changes nothing |
| `skills/tailor/references/feedback.md` | The three-way fork a bad run splits into, what the `--feedback` record holds, and the two things it may never hold |
| `skills/catchup/references/brief-template.md` | One skeleton for both modes, with the epic and pull-request differences marked per section |
| `skills/catchup/references/understanding-check.md` | The fixed questions, the feature type table, and the two rules deciding whether the check is worth anything |
| `skills/convention/references/collaboration-files.md` | What `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` each carry, where each host keeps them, and why an owner never comes from git history |
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
| `skills/review/references/review-rounds.md` | The nine rounds and what each one opens first, which of them run several copies and which run once, how the calling agent drives them one round ahead without showing any of them what the others found, and how a round's findings become one ranked list |
| `skills/verify/references/runtime-checks.md` | Bringing the application up, exercising it, asserting a real side effect, and cleaning up |
| `skills/verify/references/ui-checks.md` | The `--ui` pass: comparing a screen against the design |
| `skills/verify/references/report-template.md` | The verification report, naming what was proven and what was not |
| `skills/git/references/secret-scan.md` | The patterns scanned for in the staged diff, the paths that are a finding on their own, and why a hit stops the whole run |
| `skills/git/references/commit-craft.md` | Where one commit ends and the next begins, the formatting sweep trap, and what evidence the body carries |
| `skills/git/references/repair.md` | Rebase, conflict resolution and fixup, with the three checks that come before any rewrite of remote history |
| `skills/git/references/stacked.md` | The stacked pull request lifecycle, and where to stop: one consent and one readiness gate per layer |
| `skills/git/references/pr-body.md` | Where a project's pull request template is found, how the artifact fills it, and why a ticked checkbox is a claim rather than decoration |

### Trigger evals

One per skill, each an array of `{query, should_trigger}` testing that skill's `description`, in
all three trigger languages. The kit ships no runner; see `docs/project-roadmap.md` phase 4.

| File | Purpose |
|------|---------|
| `skills/init/evals/trigger_evals.json` | Setup phrasing against project configuration requests that are not `init` |
| `skills/tailor/evals/trigger_evals.json` | Tailoring a skill, against the `convention` and `init` pairs it must not steal |
| `skills/intake/evals/trigger_evals.json` | A raw request becoming stories, against `design-doc`, `estimate`, and `breakdown` |
| `skills/catchup/evals/trigger_evals.json` | Catching up on existing work against `intake` and `onboard` |
| `skills/estimate/evals/trigger_evals.json` | Sizing and capacity, against `breakdown` and `retro` |
| `skills/design-doc/evals/trigger_evals.json` | Choosing an approach, against `intake`, `spec`, and `plan` |
| `skills/spec/evals/trigger_evals.json` | Reference documents against `design-doc`, `intake`, and code generation |
| `skills/breakdown/evals/trigger_evals.json` | Dividing work between people, against `plan` and `estimate` |
| `skills/convention/evals/trigger_evals.json` | Recording the team's rules, against `review`, `init`, and `tailor` |
| `skills/plan/evals/trigger_evals.json` | Planning one person's work against `breakdown` and `design-doc` |
| `skills/implement/evals/trigger_evals.json` | Building against planning and reviewing |
| `skills/fix/evals/trigger_evals.json` | A defect against `incident` and ordinary implementation |
| `skills/review/evals/trigger_evals.json` | Reading a diff, against `qa`, `verify`, `fix`, and `catchup` |
| `skills/qa/evals/trigger_evals.json` | Written cases and plans, against `verify` and automated test code |
| `skills/verify/evals/trigger_evals.json` | Runtime confirmation against `qa` and `review` |
| `skills/git/evals/trigger_evals.json` | Commits, pull requests and rebases, against `review`, `release` and `implement` |
| `skills/release/evals/trigger_evals.json` | Notes and the deploy checklist, against `incident` and `qa` |
| `skills/incident/evals/trigger_evals.json` | An outage and its postmortem, against `fix` and `release` |
| `skills/retro/evals/trigger_evals.json` | Sprint evidence and the status report, against `estimate` and `handover` |
| `skills/onboard/evals/trigger_evals.json` | A person joining, against `handover`, `init`, and `catchup` |
| `skills/handover/evals/trigger_evals.json` | A person leaving, against `onboard` and `catchup` |

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
| `docs/trigger-eval-measurement.md` | How to get a true reading out of `evals/trigger_evals.json`: why a generic harness reports a vacuous score, the `PreToolUse` hook that does measure selection, the three conditions a run needs, and the cases nothing can observe |
| `docs/flow/project-flow.md` | The 21 skills placed in delivery phases, with the author and the approver of each artifact and the loop back when one is rejected |
| `docs/flow/skill-chain.md` | The artifact chain: what each skill reads, what it leaves behind, which skill picks that up, and the three ways a chain breaks |
| `docs/flow/skill-lifecycle.md` | Inside one skill: the nine sections every `SKILL.md` carries, the five stages of a run, and the five kinds of edge between skills, of which only four happen at run time |
| `docs/vi/**/*.md` | Vietnamese mirror of the ten files above, at the same relative paths |

## GitHub

| File | Purpose |
|------|---------|
| `.github/workflows/release-please.yml` | Runs release-please on push to `main` |
| `.github/PULL_REQUEST_TEMPLATE.md` | Conventional Commit guidance, affected harnesses, and the verification checklist including the cross-file sync items |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank issues, links to Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Bug form with harness and component dropdowns. The component list must include all 21 skills, plus the profile, the overrides, the shared layer, and the hooks |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Feature form asking for the team situation before the proposed capability |
| `.github/ISSUE_TEMPLATE/skill-run-report.yml` | Skill run form taking a `--feedback` record: what was asked, which steps ran, where the skill was silent, and what the team expected |
