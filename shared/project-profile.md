# Project profile

Shared contract for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/project-profile.md`, which is `../../shared/project-profile.md` relative to a skill file.

## Two different files

This file lives in the kit and describes the shape of a second file that does not:

| File | Lives in | Written by | Read by |
|------|----------|------------|---------|
| `shared/project-profile.md` | the `atk` kit | the kit maintainer | whoever writes a skill |
| `.atk/profile.md` | the **target project** | `atk:init`, then the team | every skill that needs project facts |

The kit ships no profile. A freshly installed `atk` knows nothing about the project it was installed
into, and that is the gap `.atk/profile.md` closes.

## Why `.atk/` and not somewhere else

- Not inside the kit: the plugin directory is read-only and shared across every project on the
  machine, while a profile is true of exactly one project.
- Not under `.claude/`: that ties the file to one harness. `atk` runs on three, and `.atk/` reads
  the same on all of them.
- Not under `docs/`: `docs/` holds artifacts a person reads, per `shared/artifact-paths.md`. A
  profile is data a skill reads. Mixing them makes the docs tree noisy.

The profile is committed. The whole point is that the next person on the team inherits it.

## How a skill cites it

Write the path as `.atk/profile.md`, resolved from the root of the target project, never relative to
the skill file. This is deliberately unlike the other kit-side shared files, which a skill cites as
`shared/<file>.md`: those ship with the kit, this one does not.

Read the profile once at the start of a run. Do not re-read it per step, and do not cache values
across runs.

## Sections

`.atk/profile.md` carries these seven sections and no more. A section with no skill consuming it is
a section to delete.

| Section | Holds | Read by |
|---------|-------|---------|
| Project | Name, repository, single repo or monorepo, package manager | all |
| Layers | Per layer: directory, standards document, reference module | implement, fix, verify |
| Commands | Per app: test, build, lint, and any extra command a change requires | implement, fix, verify |
| Docs | Docs root, where conventions live, where designs live | every skill that writes an artifact |
| Tracker | Tracker in use, repository owner, where the spec lives | intake, catchup, review, release |
| Team | Role mapped to a real name, and who approves what | all |
| Verify | How to start each app, how to confirm a side effect, how to clean up | verify |

Every entry is a pointer or a command, never prose copied from elsewhere. A section longer than five
lines is usually a section that has started duplicating a document instead of linking it.

An answer nobody has yet is recorded as `TBD` plus the name of the person who owes it. Never blank,
and never guessed.

## The precondition rule

Skills fall into three groups. The group decides what a skill does when `.atk/profile.md` is absent
or incomplete.

| Group | Skills | Behavior when the profile is missing |
|-------|--------|--------------------------------------|
| Required | implement, fix, verify | Stop. Say what is missing and that `/atk:init` creates it. Change nothing. |
| Required-soft | plan, review, qa, release, convention | Continue, and state in the artifact that no profile was found, so every command and path in it is a guess. |
| Not needed | intake, catchup, estimate, design-doc, breakdown, incident, retro, onboard, handover | Never mention the profile. |

`atk:init` is in no group. It is the skill that writes the profile, so a missing one is its input
rather than its problem.

Three groups rather than two, because the middle case is real: `atk:review` can still read a diff
against a requirement without knowing how the project builds. What it cannot do is run the
compile check. Saying so in the review is honest; skipping it silently is not.

A skill in the Required group checks for the section it actually uses, not merely for the file.
`atk:verify` without the Verify section is as blocked as `atk:verify` with no profile at all.

### The sentence to use

A Required-group skill that stops says, in the artifact and in the session:

> No `.atk/profile.md` found in this project. This skill needs the `<section>` section to know how
> to `<what it would do>`. Run `/atk:init` to create it.

A Required-soft skill that continues opens its artifact with:

> No `.atk/profile.md` found. Commands and paths below are inferred from the repository and have not
> been confirmed by the team.

## Why this rule lives in a skill and not in a hook

All three harnesses can ship a hook inside a plugin, so the gate could technically live there. It
does not, for two reasons.

The three hook dialects differ in event names and output contracts: Claude Code and Codex fire
`SessionStart`, Cursor fires `workspaceOpen`. Putting the rule in a hook means maintaining three
implementations of one rule, and three implementations of one rule drift apart. That breaks the
property the whole kit is built on: write `SKILL.md` once, all three manifests pick it up.

The rule is also not uniform. Nine skills need no profile at all, and a hook that blocks everything
would stop `atk:intake` from turning a chat message into requirements, which needs nothing from the
repository.

A hook is still useful as a reminder at session start. It answers one question, "does this project
have a profile yet", and it never blocks. The policy above stays here.
