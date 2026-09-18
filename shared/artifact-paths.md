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
| `spec` | `docs/api/<resource>.md`, `docs/database/<table>.md`, `docs/features/<slug>.md` (see below) |
| `breakdown` | `docs/planning/breakdown-<epic>.md` |
| `convention` | `docs/conventions.md` (and `CONTRIBUTING.md` when the project has one) |
| `plan` | `plans/<YYMMDD-HHMM>-<slug>/` holding `plan.md` and one file per phase (see below) |
| `implement` | The code; the implementation record becomes the pull request body, and an optional file goes to `docs/implementation/<ticket-or-date>-<slug>.md` |
| `fix` | `docs/fixes/<ticket-or-date>-<slug>.md` |
| `review` | Review comments go to the pull request; an optional report goes to `docs/reviews/<pr>-<date>.md` |
| `qa` | `docs/qa/test-plan-<slug>.md`, `docs/qa/test-cases-<slug>.md` |
| `verify` | `docs/verification/<ticket-or-date>-<slug>.md`, with any screenshots in `docs/verification/<ticket-or-date>-<slug>/` beside it |
| `release` | `docs/releases/<version>.md` |
| `incident` | `docs/incidents/<date>-<slug>.md`, runbook at `docs/runbooks/<slug>.md` |
| `retro` | `docs/retros/<sprint-or-date>.md` |
| `onboard` | `docs/onboarding.md` |
| `handover` | `docs/handover/<date>-<from>-to-<to>.md` |

`--out <path>` overrides the default on every skill.

### The exceptions: `init` and `plan`

Two skills write outside the docs root, for two different reasons.

`atk:init` writes to `.atk/profile.md`. Every other artifact here is prose a person reads and
reviews; the profile is data a skill reads, and mixing the two makes the docs tree noisy. It is
still committed, and `shared/project-profile.md` explains the rest.

`atk:plan` writes a directory under `plans/` at the repository root, not under the docs root, and
names it `<YYMMDD-HHMM>-<slug>` rather than by ticket. Both choices exist so the output sits where
other planning tools in the ecosystem already look, and so a project that has a `plans/` tree does
not end up with two of them. The ticket is not lost: it stays in the `ticket:` field of the index
front matter, which is where every other artifact carries it anyway.

A project that keeps its plans somewhere else says so in its `CLAUDE.md` or `AGENTS.md`, and that
wins, exactly as the docs root rule works above.

### Named after the subject: `plan` is dated, `spec` is not

`atk:spec` is the one skill whose file names carry neither a ticket nor a date. A reference document
is named after the thing it describes, one file per resource, per table, or per feature, because the
next person looks for the resource rather than for the sprint it was built in. The default kinds:

| Kind | Directory | One file per |
|------|-----------|--------------|
| `api` | `docs/api/` | resource |
| `db` | `docs/database/` | table |
| `feature` | `docs/features/` | feature |

A project overrides a row, or adds a row of its own, in the `Docs` section of `.atk/profile.md`. The
kind name is also the value of `--kind`, so a kind the project declared is invocable without touching
the kit.

## Persistence

Three groups, and the group decides what happens to a file after the work that produced it is merged.

| Group | Which | After the merge |
|-------|-------|-----------------|
| Reference | the `spec` kinds, `docs/conventions.md`, `docs/onboarding.md`, `docs/runbooks/<slug>.md`, `.atk/profile.md` | Updated in place. It claims to describe what the project does today, so a stale line in it is wrong rather than old |
| Record | every row above named `<ticket-or-date>` or `<sprint-or-date>` | Left alone. It describes a moment, and rewriting it destroys the only account of what was true then |
| Not a file | the implementation record, review comments | Lives on the pull request |

Every file in the first two groups is committed, the same as `.atk/profile.md`. The kit writes no
artifact meant to stay untracked.

The split is why `docs/design/<ticket>-<slug>.md` and `docs/api/<resource>.md` are two documents
rather than one. A design argues for a change and cites the code as it stood before it; the day the
change merges, that citation stops being true and the document becomes an account of a decision. The
reference document begins where the design ends, and from then on it is the code that has to keep up
with it, or it with the code.

## Naming

- Dates are `YYMMDD`, taken from `date +%y%m%d` on macOS and Linux or
  `Get-Date -UFormat "%y%m%d"` on Windows PowerShell. Do not guess today's date.
- Plan directories carry the time too, `YYMMDD-HHMM`, from `date +%y%m%d-%H%M`. Two plans started on
  one day are common; two started in one minute are not.
- Slugs are lowercase kebab-case, derived from the title, at most six words.
- A reference document takes its name from its subject, not from a title: the resource, the table,
  or the feature. Lowercase kebab-case, and it does not change when the subject is extended.
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

The no-overwrite rule is about records. A reference document is updated in place by design, and
superseding one would leave the project holding two files that both claim to describe the same live
endpoint. Its front matter goes back to `IN REVIEW` when an update changes what it promises.

A plan directory never collides, because its name carries the time, so updating in place cannot
happen by accident there. Planning the same work again therefore has to supersede by hand: set the
old index `status` to `SUPERSEDED`, link the new directory from it, and link back. Otherwise the
project accumulates plans that all look current.
