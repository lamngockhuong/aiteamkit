# Project profile

Shared contract for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/project-profile.md`, which is `../../shared/project-profile.md` relative to a skill file.

## Two different files

This file lives in the kit and describes the shape of a second file that does not:

| File | Lives in | Written by | Read by |
|------|----------|------------|---------|
| `shared/project-profile.md` | the `atk` kit | the kit maintainer | whoever writes a skill |
| `.atk/profile.md` | the **target project** | `atk:init`, then the team | every skill that needs project facts |

A freshly installed `atk` knows nothing about the project it was installed into, and that is the gap
`.atk/profile.md` closes. The kit ships no profile of that project.

It does ship one of its own. The kit is a project too and runs these skills on itself, so
`.atk/profile.md` sits at the root of the kit repository, and a plugin install copies the repository
whole and carries it along. It describes `aiteamkit` and nothing else. Nothing reads it for another
project: the citation rule below resolves `.atk/` from the root of the target project, never from
the kit directory.

`.atk/` is not only the profile. `.atk/overrides/<skill>.md` holds instructions a team adds to one
skill, and `shared/project-overrides.md` defines it, including the line between the two files: this
one records what the project **is**, an override records what a skill should **do** differently here.

## Why `.atk/` and not somewhere else

- Not inside the kit, for another project's facts: the plugin directory is read-only and shared
  across every project on the machine, while a profile is true of exactly one project.
- Not under `.claude/`: that ties the file to one harness. `atk` runs on three, and `.atk/` reads
  the same on all of them.
- Not under `docs/`: `docs/` holds artifacts a person reads, per `shared/artifact-paths.md`. A
  profile is data a skill reads. Mixing them makes the docs tree noisy.

The profile is committed. The whole point is that the next person on the team inherits it.

## When the repository will not take the file

Some projects are not the team's to shape. A client repository may accept no tooling files at all,
and a vendor repository may put every added path through a review that is not worth spending on a
profile. The skills still need the file: the Required group below stops without it, whoever owns the
repository.

Keep the profile on disk and exclude it on the machine instead of in the project, by adding one line
to `.git/info/exclude`:

```
.atk/
```

That file is part of the local clone and is never committed or pushed, so the exclusion binds one
machine and adds nothing to the repository. A line in `.gitignore` would be the tracked change the
repository refused in the first place, and it would impose the choice on everyone else working in
the repository, including the people who own it.

This is for a repository the team does not own. A team that owns its repository and leaves `.atk/`
untracked anyway pays the same price for nothing.

The price, worth naming before choosing it. Everyone who works on the project runs `/atk:init`
separately, and their answers drift apart with nothing to reconcile them. Anyone who has not run it
gets a hard stop from the Required group, and a hedged artifact from the Required-soft one. Overrides
drift the same way and more quietly, since a skill with no override file behaves exactly as shipped,
so two people review the same pull request under two different rules and neither has a way to see
why. Keep the answers somewhere the team does share, the team's own wiki or the ticket that set the
project up, so that the next person fills the profile from a record rather than from memory.

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
| Layers | Per layer: directory, standards document, reference module | plan, implement, fix, verify |
| Commands | Per app: test, build, lint, and any extra command a change requires | plan, implement, fix, verify |
| Docs | Docs root, the language that root is authored in and the mirrors beside it, each recorded on its own line, where conventions live and which of those documents carries the review checklist, where designs live, the agent instruction file if any, and the reference-document kinds table from `shared/artifact-paths.md` when the project changes a row or adds one | every skill that writes an artifact |
| Tracker | Tracker in use, repository owner, where the incoming specification lives | intake, catchup, review, release |
| Team | Role mapped to a real name and to the identifier its code host knows them by, who approves what, and the language the team writes artifacts in | all |
| Verify | How to start each app, how to know it is ready, where logs go, how to confirm a side effect, how to clean up, how to be sure the target is local | verify |

The authored language in Docs is not the working language in Team, and a profile that fills one
from the other will put a document in the wrong place. Team says which language a skill writes
prose in. Docs says which branch of a language-partitioned tree is the source the mirrors copy
from, which is a fact about the directory layout and stays true when a Vietnamese team writes an
English document. A tree that is not partitioned records that and nothing else;
`shared/artifact-paths.md` owns what each skill then does with it.

Every entry is a pointer or a command, never prose copied from elsewhere. A section that runs long
because it has started explaining instead of linking is duplicating a document; a section that runs
long because it is a list of short labelled fields, as Verify is, is fine.

An answer nobody has yet is recorded as `TBD` plus the name of the person who owes it. Never blank,
and never guessed.

## The precondition rule

Skills fall into three groups. The group decides what a skill does when `.atk/profile.md` is absent
or incomplete.

| Group | Skills | Behavior when the profile is missing |
|-------|--------|--------------------------------------|
| Required | implement, fix, verify | Stop. Say what is missing and that `/atk:init` creates it. Change nothing. |
| Required-soft | plan, review, qa, release, convention, spec | Continue, and state in the artifact that no profile was found, so every command and path in it is a guess. |
| Not needed | tailor, intake, catchup, estimate, design-doc, breakdown, incident, retro, onboard, handover | Never mention the profile. |

`atk:init` is in no group. It is the skill that writes the profile, so a missing one is its input
rather than its problem.

The column describes the missing case only. A `Not needed` skill may still read a section that helps
it when the profile happens to be there: `atk:catchup` reading Tracker to find the incoming specification
is the usual example. What the group forbids is the other three behaviours. It never requires the
profile, it never stops or degrades its output because the profile is absent, and it never mentions
the profile to the user in either state. A reader who has not run `/atk:init` must not be able to
tell from the artifact that the file exists as a concept, which is why `atk:intake` reads the same
Tracker row and says nothing.

The practical test: delete the profile, run the skill again, and compare. A `Not needed` skill
produces the same artifact with the same confidence, only having worked a little harder to find what
the profile would have told it.

`atk:spec` is Required-soft rather than Required because it has two other ways to find its
footing: the documents already in the directory, whose shape it copies, and the three default kinds.
What it loses without a profile is the project's own directory layout, so it says so and carries on.

Three groups rather than two, because the middle case is real: `atk:review` can still read a diff
against a requirement without knowing how the project builds. What it cannot do is run the
compile check. Saying so in the review is honest; skipping it silently is not.

A skill in the Required group checks for the section it actually uses, not merely for the file.
`atk:verify` without the Verify section is as blocked as `atk:verify` with no profile at all.

### The sentence to use

A Required-group skill that stops because there is no profile at all says, in the artifact and in the
session:

> No `.atk/profile.md` found in this project. This skill needs the `<section>` section to know how
> to `<what it would do>`. Run `/atk:init` to create it.

A Required-group skill that stops because the profile exists but the section it needs is absent, or
still `TBD`, says this instead:

> `.atk/profile.md` has no usable `<section>` section. This skill needs it to know how to `<what it
> would do>`. Run `/atk:init --audit` to fill it in.

Two sentences rather than one, because the difference matters to the person reading it. "Not found"
sends someone to create a file that is already there and already committed, and the minute they spend
establishing that is a minute the sentence cost them.

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

The rule is also not uniform. Ten skills need no profile at all, and a hook that blocks everything
would stop `atk:intake` from turning a chat message into requirements, which needs nothing from the
repository.

A hook is still useful as a reminder at session start. It answers one question, "does this project
have a profile yet", and it never blocks. The policy above stays here.
