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

Written by `/atk:init`. Read by the atk skills that need project facts. Committed on purpose: the
next person on the team inherits it. Re-check it with `/atk:init --audit`.

## Project

- Name: <name>
- Repository: <owner/repo>
- Shape: <single repo | monorepo>
- Package manager: <name>  <!-- source: <lock file> -->

## Layers

| Layer | Directory | Standards | Reference module |
|-------|-----------|-----------|------------------|
| <name> | `<path>` | `<doc path or none>` | `<path to a module to copy from>` |

<!-- A single repo has one row. Reference module is the thing a new change should look like. -->

## Commands

| App or package | Test | Build | Lint | Extra |
|----------------|------|-------|------|-------|
| <name> | `<command>` | `<command>` | `<command>` | `<codegen, migration, or none>` |

- Setup: `<command that installs dependencies>` or none

<!-- source: <CI workflow path, or manifest path> -->
<!-- Commands come from CI with local-unsafe flags stripped; see references/detection.md. -->
<!-- Setup is the precondition of every cell above, not a cell of its own. -->

## Docs

- Docs root: `<path>`
- Conventions: `<path>` or `TBD (ask <person>)`
- Designs: `<path>` or `TBD (ask <person>)`
- Agent instructions: `<CLAUDE.md, AGENTS.md, or none>`

## Tracker

- Tracker: <GitHub Issues | Jira | Backlog | Redmine | other>
- Repository owner: <owner>
- Spec lives in: <where the requirement text actually is>

## Team

| Role | Name | Approves |
|------|------|----------|
| PM | <name, or "TBD (ask <person>)"> | <what this person signs off> |
| BrSE / BA | <name, or "TBD (ask <person>)"> | |
| Tech Lead | <name, or "TBD (ask <person>)"> | |
| QA | <name, or "TBD (ask <person>)"> | |
| SRE | <name, or "TBD (ask <person>)"> | |

- Working language: <language the team writes artifacts in>

<!-- Roles the team does not have are omitted, not filled with a placeholder person. -->
<!-- The issue reference format is not recorded here; shared/ticket-adapters.md owns it. -->

## Verify

- Start: `<command that runs the app locally>`
- Ready when: <the log line, port, or health check that proves it started>
- Logs: `<path or how to read them>`
- Data check: `<read-only command to confirm a side effect>`
- Cleanup: `<how to stop what was started>`
- Local only: <how to be sure this points at a local environment>
````

## Filling rules

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
