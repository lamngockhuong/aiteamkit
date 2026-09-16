# Codebase Summary

File-by-file reference of every tracked file. This document goes stale the moment a file is added,
removed, or renamed; update it in the same commit.

## Root

| File | Purpose |
|------|---------|
| `README.md` | Public entry point: lifecycle diagram, the 12-skill table, invocation block, output convention, install instructions |
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
| `shared/artifact-paths.md` | Docs root resolution, the default output path per skill, `YYMMDD` naming, ADR numbering, the shared YAML front matter block, and the rule against overwriting an `APPROVED` artifact |
| `shared/ticket-adapters.md` | Tracker detection order, the atk-to-tracker vocabulary map for GitHub Issues, Jira, Backlog, and Redmine, the `gh` push commands, and the two-way linking rule |
| `shared/review-checklist.md` | The `CONV-NNN` rule record format that `convention` writes and `review` cites, what each skill does with it, the eight baseline items with default severities, and the rule for retiring a stale rule. Cited by `convention` and `review` only |

## Skills

Each is a single `SKILL.md` with no `references/` or `evals/` yet.

| File | Stage | Produces |
|------|-------|----------|
| `skills/intake/SKILL.md` | Requirement | User stories, acceptance criteria, non-goals, open questions with owners |
| `skills/estimate/SKILL.md` | Planning | Sizes with basis and confidence, capacity, sprint commitment, overflow |
| `skills/design-doc/SKILL.md` | Design | Technical design with compared options, plus the ADR |
| `skills/breakdown/SKILL.md` | Planning | Owned tasks, dependency graph, parallel lanes with file ownership |
| `skills/convention/SKILL.md` | Development | Team conventions classified enforced / reviewed / aspirational |
| `skills/review/SKILL.md` | Development | Findings ranked blocking / should fix / nit, optionally posted to the PR |
| `skills/qa/SKILL.md` | Verification | Test plan, traced test cases, regression matrix, entry and exit criteria |
| `skills/release/SKILL.md` | Delivery | Notes per audience, checklist with owners, migrations, rollback, sign-offs |
| `skills/incident/SKILL.md` | Operation | Timeline, proven root cause, blameless postmortem, actions, runbook |
| `skills/retro/SKILL.md` | Improvement | Previous actions verified, sprint evidence, three actions, status report |
| `skills/onboard/SKILL.md` | Team | Verified setup, access list, code map, first week ending in a merged change |
| `skills/handover/SKILL.md` | Team | True state of in-flight work, decisions, traps, access transfer, receiver sign-off |

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
| `docs/codebase-summary.md` | This file |
| `docs/project-roadmap.md` | Phase plan and status |
| `docs/vi/*.md` | Vietnamese mirror of the five files above |

## GitHub

| File | Purpose |
|------|---------|
| `.github/workflows/release-please.yml` | Runs release-please on push to `main` |
| `.github/PULL_REQUEST_TEMPLATE.md` | Conventional Commit guidance, affected harnesses, and the verification checklist including the cross-file sync items |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank issues, links to Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Bug form with harness and component dropdowns. The component list must include all 12 skills |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Feature form asking for the team situation before the proposed capability |
