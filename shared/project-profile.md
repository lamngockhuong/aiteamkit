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

The profile is committed, and the whole point is that the next person on the team inherits it.
Two shapes do not reach that: a repository that will not take the file, which the section of that
name below holds, and `workspace`, where the root belongs to no repository at all.

## Where the project root is

The project root is the directory that holds `.atk/`. Every path a skill resolves against the target
project resolves against it: the docs root, the plans directory, and the paths the profile itself
records.

Finding it is a walk rather than an assumption. Start at the working directory and go up until a
`.atk/profile.md` appears, stopping at the home directory or the file system root, whichever comes
first. A repository boundary does not stop the walk, because a project may span several
repositories and the profile then sits above the one the work is in.

The nearest profile wins. A member repository carrying one of its own is read from that file rather
than from the one above it, which is what a team that clones its own repository alone ends up with.

**A profile found above the work is checked before it is used.** Where its shape names member
repositories, the directory the walk started in has to appear in its Repositories table, matched by
path from the project root or by remote. Where it does not, keep walking, and where nothing else
answers, report no profile found and let the three-group rule below take over.

Without that check the walk is proximity and nothing else, and proximity is not membership. Two
unrelated repositories under one directory is the ordinary layout of a developer machine, so a
profile written for one of them would be read as the other's: its docs root, its tracker, its team,
its commands. An artifact would land in a tree belonging to another project, and `atk:git` would be
working in a repository nobody named. A profile whose shape names no members needs no check, because
it sits at the root of the one repository it describes.

## Projects that span several repositories

The `Shape` field of the Project section records which of four a project is. The first two are one
repository, and everything above is already true of them.

| Shape | What it is | Where the profile lives |
|-------|------------|-------------------------|
| `single repo` | One repository, one application | Its root |
| `monorepo` | One repository, several packages | Its root |
| `parent + members` | A repository holding the shared specification and the documents, with the member repositories inside it, each a repository of its own, linked as a submodule or cloned in place | The parent's root |
| `workspace` | A directory holding several repositories and belonging to none of them | The workspace root, where nothing tracks it |

The last two each carry a cost the first two do not, and the cost is said before the profile is
written rather than found afterwards.

**`parent + members`.** The profile is committed in the parent, so whoever clones the parent
inherits it. Whoever clones one member alone inherits nothing: the walk above finds no profile, and
every skill in the Required group below stops for them. That is a real team rather than an edge
case, usually the one that works in its own repository and nowhere else. Two ways out, and the
parent's team decides which: clone the parent, or run `/atk:init` inside the member and keep a
second profile covering that repository alone. The second costs drift, because nothing reconciles
the two files, and Docs, Tracker and Team are the sections that drift first.

**`workspace`.** The root belongs to no repository, so nothing tracks the profile written there. It
cannot be committed, cannot be pushed, and cannot be inherited: it is one file on one machine for
one person. That is the same price as When the repository will not take the file below, arriving
without anybody having chosen it, which is why the run names it before writing instead of after.
What ends it for good is making the workspace root a repository, and that is the team's decision
rather than a skill's.

### What the Repositories table holds

A profile whose shape names member repositories carries a table of them in the Project section: the
name, the path from the project root, the remote, the team that owns it, and how it is linked, which
is `submodule` or `clone`. Those are the two ways detection can tell a member apart, so they are the
two values the column takes. The parent has no row: it is the project root, which every path in the
table is already written from.

**A name in that table is unique.** It is what the Tracker section names a member by and what a
consent question in `skills/git/references/multi-repo.md` names a repository by, so two members
called `frontend` turn "push `frontend`" into a question with two answers. Where two members share a
directory name, disambiguate with the segment above it and use that name everywhere.

That table is also what disambiguates every other path in the profile. A Layers row naming
`backend/` says nothing about whether that is a package of one repository or a repository of its own,
and the table answers it: a path under a member's path belongs to that member, so a change to a file
under it is a change in that member's repository.

A Commands row carries a name rather than a path, so it cannot be matched that way. In a project
whose shape names members, every Commands row and every entry of the Verify section names the
repository it runs from, and `skills/init/references/profile-template.md` holds the column and the
field that carry it. A command with no repository beside it is a command run from wherever the
session happens to be, which in a parent is a directory with no manifest in it, and the failure that
produces reads exactly like a failing test.

`single repo` and `monorepo` carry no such table. A project with one repository has nothing to
disambiguate, and a one-row table is noise.

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

The profile says how it is stored in the persistence line of its header, and
`skills/init/references/profile-template.md` carries a form for each of the three ways that can go.
That line is what `--audit` re-checks against the repository, so a profile carrying the wrong form
is the drift that hides the rest.

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

The root of the target project is the one Where the project root is defines above, and that section
holds both halves of finding it: the walk, and the check that the profile it lands on is this
project's. Find it by walking up from the working directory; do not take the top level of the current repository for it,
which is a different directory in two of the four shapes.

Read the profile once at the start of a run. Do not re-read it per step, and do not cache values
across runs.

## Sections

`.atk/profile.md` carries these seven sections and no more. A section with no skill consuming it is
a section to delete.

| Section | Holds | Read by |
|---------|-------|---------|
| Project | Name, repository, the shape from the four above, package manager, and, where the shape names them, the member repositories with their paths, remotes, owning teams, and how each is linked | all |
| Layers | Per layer: directory, standards document, reference module | plan, implement, fix, verify |
| Commands | Per app: test, build, lint, and any extra command a change requires | plan, implement, fix, verify |
| Docs | Docs root, a docs root of its own for any member that keeps one, the language that root is authored in and the mirrors beside it, each recorded on its own line, where conventions live and which of those documents carries the review checklist, where designs live, whether the project writes its reference documents before the code or after it, the agent instruction file if any, and the reference-document kinds table from `shared/artifact-paths.md` when the project changes a row or adds one | every skill that writes an artifact |
| Tracker | Tracker in use, repository owner, where the incoming specification lives | intake, catchup, review, release |
| Team | Role mapped to a real name and to the identifier its code host knows them by, who approves what, and the language the team writes artifacts in | all |
| Verify | How to start each app, how to know it is ready, where logs go, how to confirm a side effect, how to clean up, how to be sure the target is local | verify |

The authored language in Docs is not the working language in Team, and a profile that fills one
from the other will put a document in the wrong place. Team says which language a skill writes
prose in. Docs says which branch of a language-partitioned tree is the source the mirrors copy
from, which is a fact about the directory layout and stays true when a Vietnamese team writes an
English document. A tree that is not partitioned records that and nothing else;
`shared/artifact-paths.md` owns what each skill then does with it.

`Contract: first` or `Contract: code` in Docs is the one entry there that changes what a skill does
rather than where it writes: whether a reference document of any kind but `screen` may exist before
the code it describes.
`shared/spec-docs.md` owns what each value means, and why a missing line reads as `code`.

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
rather than its problem. `atk:help` is in no group either, for a neighbouring reason: a missing
profile is one of the states it reports, and it names `atk:init` when the skill it recommends would
stop without one.

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
footing: the documents already in the directory, whose shape it copies, and the four default kinds.
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
