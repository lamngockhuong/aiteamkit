---
title: atk project profile
status: DRAFT
owner: Lam Ngoc Khuong
approver: TBD (ask Khuong)
created: 2026-09-17
updated: 2026-09-17
ticket: none
---

# atk project profile

Written by `/atk:init`. Read by the atk skills that need project facts. Committed on purpose: the
next person on the team inherits it. Re-check it with `/atk:init --audit`.

## Project

- Name: aiteamkit
- Repository: lamngockhuong/aiteamkit  <!-- source: git remote get-url origin -->
- Shape: single repo
- Package manager: none  <!-- source: no lock file present; package.json is private with no dependencies -->

## Layers

| Layer | Directory | Standards | Reference module |
|-------|-----------|-----------|------------------|
| content | `skills/`, `shared/` | `CLAUDE.md` | `skills/review/` |

<!-- Not an application: the deliverable is Markdown skills plus three manifests. -->

## Commands

| App or package | Test | Build | Lint | Extra |
|----------------|------|-------|------|-------|
| repo | see the four checks below | none | none | none |

<!-- source: CLAUDE.md -> "Common verification commands" -->
<!-- No package scripts and no test CI; these checks are what stands in for a test suite. -->

1. Manifests parse: `for f in package.json .claude-plugin/plugin.json .claude-plugin/marketplace.json .cursor-plugin/plugin.json .codex-plugin/plugin.json; do python3 -c "import json,sys; json.load(open('$f'))"; done`
2. Skill name matches folder: `for d in skills/*/; do n=$(basename "$d"); grep -q "^name: $n$" "$d/SKILL.md" || echo "MISMATCH $n"; done`
3. Docs mirrored: `diff <(ls docs/*.md | xargs -n1 basename) <(ls docs/vi/*.md | xargs -n1 basename)`
4. No em-dash: `grep -rn "—" . --exclude-dir=.git --exclude=CLAUDE.md | grep -v -E '(plans|docs)/'`

## Docs

- Docs root: `docs/`  <!-- source: existing directory -->
- Conventions: `CLAUDE.md`  <!-- source: no CONTRIBUTING.md, no .editorconfig -->
- Designs: `docs/system-architecture.md`
- Agent instructions: `CLAUDE.md`

## Tracker

- Tracker: GitHub Issues  <!-- source: git remote host -->
- Repository owner: lamngockhuong
- Spec lives in: `docs/` for direction, GitHub Issues for individual requests

## Team

| Role | Name | Approves |
|------|------|----------|
| Tech Lead | TBD (ask Khuong) | layers, commands, the profile itself |
| PM | TBD (ask Khuong) | tracker and team sections |

- Working language: English. `docs/vi/` mirrors `docs/` but English is the source.

<!-- QA, SRE and BrSE rows deleted: this project has no one in those roles today. -->
<!-- The issue reference format is not recorded here; shared/ticket-adapters.md owns it. -->

## Verify

- Start: none. This repo ships content, it does not run.
- Ready when: not applicable.
- Logs: not applicable.
- Data check: the four commands in the Commands section stand in for runtime verification.
- Cleanup: not applicable.
- Local only: not applicable; nothing is started.
