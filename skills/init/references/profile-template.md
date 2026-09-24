# Profile template

The file `atk:init` writes to `.atk/profile.md` in the target project. `shared/project-profile.md`
owns what each section means and which skills read it; this file is the shape to fill.

Keep every entry a pointer or a command. The five-line guidance in `shared/project-profile.md` is
about prose: a section that starts explaining instead of linking has begun duplicating a document.
A list of short labelled fields, like Verify below, is not that.

## Template

````markdown
---
title: atk project profile
status: DRAFT
owner: <name>
approver: <name, or "TBD (ask <person>)">
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
ticket: none
---

# atk project profile

Written by `/atk:init`. Read by the atk skills that need project facts. Re-check it with
`/atk:init --audit`.

<!-- Persistence line. Keep exactly one of the three blocks below, whichever matches how this
     profile is actually stored, and delete the other two. This is the line `/atk:init --audit`
     re-checks against the repository. -->

Committed on purpose: the next person on the team inherits it.

Not committed: this repository will not take the file, so `.atk/` sits in `.git/info/exclude`.
Nobody inherits this profile. Everyone working here runs `/atk:init` for themselves and their
answers drift apart with nothing to reconcile them, so keep the answers somewhere the team shares.

Not committed: under the `workspace` shape this root belongs to no repository, so nothing tracks
this file and there is nowhere to commit it. It costs what the excluded form above costs.

## Project

- Name: <name>
- Repository: <owner/repo>
- Shape: <single repo | monorepo | parent + members | workspace>
- Package manager: <name>  <!-- source: <lock file> -->

### Repositories

| Repository | Path | Remote | Team | Linked as |
|------------|------|--------|------|-----------|
| <name> | `<path from the project root>` | <remote name and owner/repo, or none> | <team that owns it> | <submodule, or clone> |

<!-- Only under a shape that names members. A single repo and a monorepo delete this subsection. -->
<!-- The parent has no row. It is the project root, which every Path above is written from. -->
<!-- A name is unique: the Commands, Verify and Tracker entries below name a repository by it, and
     so does every consent question atk:git asks. Two members called `frontend` get the segment
     above them in the name. -->
<!-- A Layers path under a member's path is a change in that member's repository. -->

## Layers

| Layer | Directory | Standards | Reference module |
|-------|-----------|-----------|------------------|
| <name> | `<path>` | `<doc path or none>` | `<path to a module to copy from>` |

<!-- A single repo has one row. Reference module is the thing a new change should look like. -->

## Commands

| App or package | Repository | Test | Build | Lint | Extra |
|----------------|------------|------|-------|------|-------|
| <name> | <repository name, or "-" in a single repository> | `<command>` | `<command>` | `<command>` | `<codegen, migration, or none>` |

- Setup: `<command that installs dependencies>` or none

<!-- Repository names a row of the Repositories table, and the command is run from that row's Path.
     A single repo and a monorepo put "-" there: there is one place to run everything. -->

<!-- source: <CI workflow path, or manifest path> -->
<!-- Commands come from CI with local-unsafe flags stripped; see references/detection.md. -->
<!-- Setup is the precondition of every cell above, not a cell of its own. -->

## Docs

- Docs root: `<path>`
- Docs root for <member>: `<path>`  <!-- one line per member that keeps a docs tree of its own -->
- Authored language: `<code>` or `TBD (ask <person>)`
- Language mirrors: `<paths>` or `none`
- Conventions: `<path>` or `TBD (ask <person>)`
- Designs: `<path>` or `TBD (ask <person>)`
- Contract: `first`, `code`, or `TBD (ask <person>)`  <!-- first: API, schema and feature docs are approved before the code; absent or TBD reads as code, per shared/spec-docs.md -->
- Agent instructions: `<CLAUDE.md, AGENTS.md, or none>`

## Tracker

- Tracker: <GitHub Issues | Jira | Backlog | Redmine | other>
- Repository owner: <owner>
- Spec lives in: <where the requirement text actually is>
- Tracker for <member>: <tracker>  <!-- one line per member that does not use the project tracker -->

## Team

| Role | Name | Host identifier | Approves |
|------|------|-----------------|----------|
| PM | <name, or "TBD (ask <person>)"> | <@handle, @org/team, or an email> | <what this person signs off> |
| BrSE / BA | <name, or "TBD (ask <person>)"> | | |
| Tech Lead | <name, or "TBD (ask <person>)"> | | |
| QA | <name, or "TBD (ask <person>)"> | | |
| SRE | <name, or "TBD (ask <person>)"> | | |

- Working language: <language the team writes artifacts in>

<!-- Roles the team does not have are omitted, not filled with a placeholder person. -->
<!-- The host identifier is what a code host knows the person by, and it is what a CODEOWNERS
     entry or a review request has to carry. A real name is not one. Leave it empty where the
     person has not given it; never take one from commit metadata. -->
<!-- The issue reference format is not recorded here; shared/ticket-adapters.md owns it. -->

## Verify

- Runs from: <repository name, or "-" in a single repository>
- Start: `<command that runs the app locally>`
- Ready when: <the log line, port, or health check that proves it started>
- Logs: `<path or how to read them>`
- Data check: `<read-only command to confirm a side effect>`
- Cleanup: `<how to stop what was started>`
- Local only: <how to be sure this points at a local environment>

<!-- One block per app. A project whose apps live in different repositories has one block each, and
     `Runs from` is what says which. -->
````

## Filling rules

**Paths are written from the project root.** In a project of one repository that is its root and
nothing changes. Where the shape names members, a path such as `backend/src/` says which repository
it belongs to only through the Repositories table, so the table is what a reader resolves it
against, and a row whose repository is not in that table is a row pointing nowhere.

**A command says where it runs from.** A Commands row carries a name rather than a path, so the
`Repository` column is the only thing that can place it, and the Verify block says the same through
`Runs from`. A command with neither runs wherever the session happens to be, which in a parent is a
directory with no manifest, and what that produces reads like a failing test rather than a profile
with a hole in it.

**`TBD` names a person.** `approver: TBD` is a hole nobody owns. Write `approver: TBD (ask Minh)`.
Every skill that meets a `TBD` repeats the name, so the hole stays attached to whoever can close it.

**A role the team does not have is deleted, not filled.** A five-person team with no SRE deletes the
row. Assigning the Tech Lead to a role they do not play makes the profile lie about approvals.

**No credentials.** No token, password, or connection string, in any section. Name where the value
is stored instead: `see 1Password vault "project-x"`.

**The Verify section decides whether `atk:verify` can run at all.** A profile complete everywhere
else but empty here blocks that skill just as thoroughly as a missing file, which is why
`shared/project-profile.md` tells a Required-group skill to check its section rather than the file.

**Sources stay in the file.** The `<!-- source: ... -->` comments are what `--audit` compares
against. Stripping them to tidy the file removes the ability to tell drift from a deliberate edit.
