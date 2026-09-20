# Artifact paths

Shared output convention for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/artifact-paths.md`, which is `../../shared/artifact-paths.md` relative to a skill file.

Every skill writes Markdown into the **target project**, never into the atk kit itself. The one
exception is `atk:convention`, which may also write the project's own collaboration files, one of
which is not Markdown; the paragraph after the table says what they are.

## Root

The docs root is `docs/` unless the project says otherwise. Before writing, check in this order and
use the first that exists: the project `CLAUDE.md` or `AGENTS.md`, an existing docs folder with the
same shape, then `docs/`. Never create a second parallel tree beside one that already exists.

## Default paths

| Skill | Default output |
|-------|----------------|
| `init` | `.atk/profile.md` (see the exception below) |
| `tailor` | `.atk/overrides/<skill>.md` (see the exception below); a `--feedback` record at `docs/derived/feedback/<skill>-<date>.md` |
| `intake` | `docs/records/requirements/<ticket-or-date>-<slug>.md` |
| `catchup` | `docs/derived/catchup/<ticket-or-date>-<slug>.md` |
| `estimate` | `docs/records/planning/estimate-<sprint-or-date>.md` |
| `design-doc` | `docs/records/design/<ticket-or-date>-<slug>.md`, ADR at `docs/adr/NNNN-<slug>.md` |
| `spec` | `docs/api/<resource>.md`, `docs/database/<table>.md`, `docs/features/<slug>.md` (see below) |
| `breakdown` | `docs/records/planning/breakdown-<epic>.md` |
| `convention` | `docs/conventions.md`; on request, the collaboration files the project lacks (see below) |
| `plan` | `plans/<YYMMDD-HHMM>-<slug>/` holding `plan.md` and one file per phase (see below) |
| `implement` | The code; the implementation record becomes the pull request body, and an optional copy goes to `docs/derived/implementation/<ticket-or-date>-<slug>.md` |
| `fix` | `docs/records/fixes/<ticket-or-date>-<slug>.md` |
| `review` | Review comments go to the pull request; an optional copy goes to `docs/derived/reviews/<pr>-<date>.md` |
| `qa` | `docs/qa/test-plan-<slug>.md`, `docs/qa/test-cases-<slug>.md` |
| `verify` | `docs/records/verification/<ticket-or-date>-<slug>.md`, with any screenshots in `docs/records/verification/<ticket-or-date>-<slug>/` beside it |
| `git` | No document of its own: the commits and the pull request. An optional shipping record goes to `docs/derived/shipping/<date>-<slug>.md` |
| `release` | `docs/records/releases/<version>.md` |
| `incident` | `docs/records/incidents/<date>-<slug>.md`, runbook at `docs/runbooks/<slug>.md` |
| `retro` | `docs/records/retros/<sprint-or-date>.md` |
| `onboard` | `docs/onboarding.md` |
| `handover` | `docs/records/handover/<date>-<from>-to-<to>.md` |

`--out <path>` overrides the default on every skill.

`atk:convention` may also write `CONTRIBUTING.md`, the pull request template, and `CODEOWNERS`, each
at the location its host reads, per `shared/host-file-locations.md`, and never into the docs tree
this file governs. They are the project's own collaboration files rather than artifacts of this kit:
none carries the front matter block, `CODEOWNERS` is not Markdown at all, and the persistence groups
below do not classify them. What they do share with every group is that they are **committed**: the
team owns them afterwards the way it owns its linter config, and updates them the way it updates
one. `--out` does not move them, because a host reads them where it reads them and nowhere else.
`skills/convention/references/collaboration-files.md` holds the rest, including that they are
offered and picked rather than created.

### The exceptions: `init`, `tailor`, and `plan`

Three skills write **artifacts** outside the docs root, for two different reasons. The collaboration
files above are a separate case and not counted here: they are the project's files rather than this
kit's, and where they go is the host's decision rather than ours.

`atk:init` writes to `.atk/profile.md` and `atk:tailor` writes to `.atk/overrides/<skill>.md`. Every
other artifact here is prose a person reads and reviews; these two are read by a skill, and mixing
the two kinds makes the docs tree noisy. Both are still committed. `shared/project-profile.md` and
`shared/project-overrides.md` explain the rest, including what separates the two files.

The override file is named after the skill it belongs to, with no date and no ticket, for the reason
the next section gives: the next person looks for the skill, not for the sprint in which somebody
decided to change it.

`atk:plan` writes a directory under `plans/` at the repository root, not under the docs root, and
names it `<YYMMDD-HHMM>-<slug>` rather than by ticket. Both choices exist so the output sits where
other planning tools in the ecosystem already look, and so a project that has a `plans/` tree does
not end up with two of them. The ticket is not lost: it stays in the `ticket:` field of the index
front matter, which is where every other artifact carries it anyway.

A project that keeps its plans somewhere else says so in its `CLAUDE.md` or `AGENTS.md`, and that
wins, exactly as the docs root rule works above.

### Named after the subject: `plan` is dated, `spec` is not

`atk:spec`, `atk:qa` and `atk:tailor` are the three skills whose file names carry neither a ticket
nor a date. A reference document is named after the thing it describes, one file per resource, per
table, per feature, or per skill, because the next person looks for the subject rather than for the
sprint it was built in. The `spec` kinds:

| Kind | Directory | One file per |
|------|-----------|--------------|
| `api` | `docs/api/` | resource |
| `db` | `docs/database/` | table |
| `feature` | `docs/features/` | feature |

A project overrides a row, or adds a row of its own, in the `Docs` section of `.atk/profile.md`. The
kind name is also the value of `--kind`, so a kind the project declared is invocable without touching
the kit.

## Persistence

Three groups, and the group decides both what happens to a file after the work that produced it is
merged and which directory it goes in.

| Group | Which | Directory | After the merge |
|-------|-------|-----------|-----------------|
| Reference | the `spec` kinds, `docs/qa/`, `docs/conventions.md`, `docs/onboarding.md`, `docs/runbooks/<slug>.md`, `.atk/profile.md`, `.atk/overrides/<skill>.md` | the top level of the docs root, and `.atk/` for the profile and the overrides | Updated in place. It claims to describe what the project does today, so a stale line in it is wrong rather than old |
| Record | requirements, planning, design, fixes, verification, releases, incidents, retros, handover, and the ADR | `docs/records/<kind>/`, the ADR excepted | Left alone. It describes a moment, and rewriting it destroys the only account of what was true then |
| Derived | the implementation record, the review report, the catchup brief, the skill feedback record, the shipping record | `docs/derived/<kind>/` | Safe to delete. Nothing here is the only copy |

Three questions place a kind, in this order. Does something else already hold the original, or does
re-running the skill reproduce it? Then it is derived. Otherwise, does it describe a moment, which
its name says by carrying a ticket, a date, a sprint, or a version? Then it is a record. What is
left describes the system as it currently is, and that is reference.

The question about the name is the one that settles the cases people argue about. `docs/qa/` is
named after the feature rather than the sprint, and a regression suite is updated when the feature
changes rather than written again, so test cases are reference and sit at the top level.

One exception, and it is deliberate. ADRs stay at `docs/adr/` although they are records and are
never edited, because people browse that directory the way they browse reference: numbered, one
line per decision, the short permanent form of a design document that has grown long. Burying it
one level down hides the thing most likely to be looked up.

A project that already keeps these kinds at the top level of its docs root keeps them there. The
grouping is the kit's default for an empty tree, not a move to perform on a project that has been
writing to `docs/design/` for a year, and splitting a directory in half is worse than either shape.

Every file in the first two groups is committed, the same as `.atk/profile.md`.

`docs/derived/` is the only part of the tree a project may leave untracked, and nothing in the
chain breaks if it does: the implementation record, the review report and the shipping record are
copies of what lives on the pull request, a catchup brief is rebuilt by running `atk:catchup` again,
and a feedback record is a copy of what was filed on the kit repository. No skill reads any of the four. A team that wants a smaller repository adds one line to `.gitignore`; a team that
wants the copies keeps them. The kit writes no other artifact meant to stay untracked.

The split is why `docs/records/design/<ticket>-<slug>.md` and `docs/api/<resource>.md` are two
documents rather than one. A design argues for a change and cites the code as it stood before it;
the day the change merges, that citation stops being true and the document becomes an account of a
decision. The reference document begins where the design ends, and from then on it is the code that
has to keep up with it, or it with the code.

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

Every record works this way, not only plans. A design that replaces an earlier design, a
requirement document rewritten after the scope was renegotiated: the old file keeps its content,
takes `SUPERSEDED`, and carries the link to what replaced it. Two files that both read as current
is the failure this prevents, and it costs two links.
