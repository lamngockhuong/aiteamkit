---
title: atk project profile
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-17
updated: 2026-09-21
ticket: none
---

# atk project profile

This is the profile of the `aiteamkit` repository itself, not of your project. A plugin install
copies the repository whole, so this file arrives with the kit; no skill reads it for another
project, because every citation of `.atk/profile.md` resolves from the root of the project being
worked on. Run `/atk:init` there to write your own.

Written by `/atk:init`. Read by the atk skills that need project facts. Committed on purpose: the
next person on the team inherits it. Re-check it with `/atk:init --audit`.

## Project

- Name: aiteamkit
- Repository: lamngockhuong/aiteamkit <!-- source: git remote get-url origin -->
- Shape: single repo <!-- source: no pnpm-workspace.yaml, go.work, nx.json, lerna.json or turbo.json -->
- Package manager: none <!-- source: no lock file present; package.json is private with no dependencies -->

## Layers

| Layer | Directory | Standards | Reference module |
|-------|-----------|-----------|------------------|
| content | `skills/`, `shared/` | `CLAUDE.md` | `skills/review/` |
| docs | `docs/` | `CLAUDE.md`, sections "Docs are bilingual" and "Diagrams are Mermaid, except where they are not" | `docs/flow/skill-chain.md` |
| hooks | `hooks/` | `CLAUDE.md`, section "`hooks/` never holds a rule, and is never the only road to a behavior" | `hooks/check-profile.mjs` |

<!-- Not an application: the deliverable is Markdown skills plus three manifests. -->
<!-- Three rows because a change lands differently in each. A skill edit is one file with frontmatter
     and a 300-line ceiling. A docs edit is always two files, English and its `docs/vi/` mirror, with
     no frontmatter and no ceiling. A hook edit is executable Node whose standards are about runtime
     shape: exec form on Claude Code, a string command on Codex, silent when it has nothing to
     say. -->
<!-- Skill-generated documents under `docs/derived/` and `docs/records/` are not part of the docs
     layer. They are output, and their shape belongs to the skill that writes them. `docs/derived/`
     is gitignored; `docs/records/` is committed, because a record is the only account of what was
     true at a moment. Neither is mirrored in `docs/vi/`: translating a record would be translating
     history. CLAUDE.md, section "Docs are bilingual", carries the same exclusion. -->

## Commands

| App or package | Test                                                | Build | Lint | Extra |
| -------------- | --------------------------------------------------- | ----- | ---- | ----- |
| repo           | `CLAUDE.md`, section "Common verification commands" | none  | none | none  |

- Setup: none

<!-- source: CLAUDE.md -> "Common verification commands" -->
<!-- No package scripts and no test CI; .github/workflows/ carries release-please and the labeler.
     Those blocks are what stands in for a test suite, and CLAUDE.md is the single copy of
     them on purpose: an earlier profile pasted four of them inline and went stale when the repo
     gained hooks and trigger evals. Run the block, do not transcribe it. -->

Two further checks live outside that section, each beside the rule it enforces:

- No command from another kit: `CLAUDE.md`, section "The kit stands alone, but it may use the harness it runs on"
- No hardcoded diagram fill: `CLAUDE.md`, section "Diagrams are Mermaid, except where they are not"

## Docs

- Docs root: `docs/` <!-- source: existing directory -->
- Authored language: `en` <!-- source: CLAUDE.md, section "Docs are bilingual" -->
- Language mirrors: `docs/vi/`, file-for-file including subdirectories, except `docs/derived/` and
  `docs/records/`
- Conventions: `CLAUDE.md` <!-- source: no CONTRIBUTING.md, no .editorconfig -->
- Review checklist: `CLAUDE.md`, section "Review checklist" <!-- source: written by /atk:convention on 2026-09-18 -->
- Designs: `docs/system-architecture.md`
- Agent instructions: `CLAUDE.md`

## Tracker

- Tracker: GitHub Issues <!-- source: git remote host -->
- Repository owner: lamngockhuong
- Spec lives in: `docs/` for direction, GitHub Issues for individual requests
- Issue templates: bug report, feature request, skill run report <!-- source: .github/ISSUE_TEMPLATE/ -->

## Team

| Role      | Name            | Approves                             |
| --------- | --------------- | ------------------------------------ |
| Tech Lead | Lam Ngoc Khuong | layers, commands, the profile itself |
| PM        | Lam Ngoc Khuong | tracker and team sections            |

- Working language: English

<!-- QA, SRE and BrSE rows deleted: this project has no one in those roles today. -->
<!-- One maintainer holds both roles. The kit's own premise is that author and approver differ, so
     a contributor who is not Khuong still needs his approval, and the two rows stay separate for
     the day someone else fills one. -->
<!-- The issue reference format is not recorded here; shared/ticket-adapters.md owns it. -->

## Verify

- Start: none. This repo ships content, it does not run.
- Ready when: not applicable.
- Logs: not applicable.
- Data check: the checks named in the Commands section stand in for runtime verification.
- Cleanup: not applicable.
- Local only: not applicable; nothing is started.
