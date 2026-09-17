# Artifact paths

Shared output convention for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/artifact-paths.md`, which is `../../shared/artifact-paths.md` relative to a skill file.

Every skill writes Markdown into the **target project**, never into the atk kit itself.

## Root

The docs root is `docs/` unless the project says otherwise. Before writing, check in this order and
use the first that exists: the project `CLAUDE.md` or `AGENTS.md`, an existing docs folder with the
same shape, then `docs/`. Never create a second parallel tree beside one that already exists.

## Default paths

| Skill | Default output |
|-------|----------------|
| `init` | `.atk/profile.md` (see the exception below) |
| `intake` | `docs/requirements/<ticket-or-date>-<slug>.md` |
| `catchup` | `docs/catchup/<ticket-or-date>-<slug>.md` |
| `estimate` | `docs/planning/estimate-<sprint-or-date>.md` |
| `design-doc` | `docs/design/<ticket-or-date>-<slug>.md`, ADR at `docs/adr/NNNN-<slug>.md` |
| `breakdown` | `docs/planning/breakdown-<epic>.md` |
| `convention` | `docs/conventions.md` (and `CONTRIBUTING.md` when the project has one) |
| `fix` | `docs/fixes/<ticket-or-date>-<slug>.md` |
| `review` | Review comments go to the pull request; an optional report goes to `docs/reviews/<pr>-<date>.md` |
| `qa` | `docs/qa/test-plan-<slug>.md`, `docs/qa/test-cases-<slug>.md` |
| `release` | `docs/releases/<version>.md` |
| `incident` | `docs/incidents/<date>-<slug>.md`, runbook at `docs/runbooks/<slug>.md` |
| `retro` | `docs/retros/<sprint-or-date>.md` |
| `onboard` | `docs/onboarding.md` |
| `handover` | `docs/handover/<date>-<from>-to-<to>.md` |

`--out <path>` overrides the default on every skill.

### The one exception: `init`

`atk:init` writes to `.atk/profile.md`, outside the docs root. Every other artifact here is prose a
person reads and reviews; the profile is data a skill reads, and mixing the two makes the docs tree
noisy. It is still committed, and `shared/project-profile.md` explains the rest.

## Naming

- Dates are `YYMMDD`, taken from `date +%y%m%d` on macOS and Linux or
  `Get-Date -UFormat "%y%m%d"` on Windows PowerShell. Do not guess today's date.
- Slugs are lowercase kebab-case, derived from the title, at most six words.
- ADR numbers are zero-padded to four digits and never reused. Read the existing `docs/adr/`
  directory to find the next one.

## Front matter

Every artifact opens with the same block so a reader knows its state without reading the body. A
`TBD` always carries the name of whoever can resolve it; a bare `TBD` is a hole nobody owns:

```yaml
---
title: <one line>
status: DRAFT | IN REVIEW | APPROVED | SUPERSEDED
owner: <person>
approver: <person, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL, or none>
---
```

## Before writing

Read the file if it already exists and update it in place. Do not overwrite an `APPROVED` artifact:
supersede it, link the replacement, and say which decision changed.
