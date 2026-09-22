# Collaboration files

Loaded by `atk:convention` at step 6, and by `--scaffold`. Three files decide how a change is
proposed, what a reviewer is shown, and who is asked to look at it. A project that has none of them
has those three answers in people's heads, where a new joiner cannot read them.

This file says what each one holds and what the draft is built from. Where each one lives, how the
host is detected, and when a file counts as present are in `shared/host-file-locations.md`, because
`atk:git` resolves the same question from the other side. What this file does not do is make any of
them appear: the user picks which files are written, and picking none ends the step.

| File | The question it answers | Built from |
|------|-------------------------|------------|
| `CONTRIBUTING.md` | How does a person get from a clone to a merged change here | The conventions document, plus what the repository really does |
| The pull request template | What is every reviewer shown, every time | The enforcement table, and the baseline items below |
| `CODEOWNERS` | Who is asked to review which part | The Team section of `.atk/profile.md` |

All three follow the team's working language under rule 6 of `shared/team-roles.md`, the same as any
other written output, and notwithstanding that they are the project's files rather than artifacts of
this kit. Where the repository already keeps its public-facing files in another language, that wins:
an outside contributor reads what is already there, not what the profile says.

## `CONTRIBUTING.md`

The flow a person follows: how to set the project up, how to branch, how to commit, how to open a
pull request, and what happens to it afterwards. The build and test commands come from
`.atk/profile.md`, and the branch and commit rules from the conventions document.

Link, do not copy. That holds for the conventions document, and equally for the onboarding document
where `atk:onboard` has written one: two files stating the same setup drift apart, and the reader
cannot tell which of them lost. Read it before drafting, and where it already carries the setup, the
draft points at it and covers only what it does not. A project that onboards several roles holds one
such document per role, per `shared/artifact-paths.md`. The setup section is the part that does not
vary by role, so any of them answers this.

Name a variable, never its value. A profile's commands can carry an internal registry, a staging
host, or a seeding command with a credential in it, and `CONTRIBUTING.md` at the repository root is
the most widely read file in a repository and public on a public one.

Where the project has recorded no conventions, the branch and commit sections say so and name who
owes them, exactly as the `--audit` rule does. Never link to `docs/conventions.md` as though it
existed.

## The pull request template

Its sections are what reviewers here are actually shown, not a list from another project. The
verification section comes from the enforcement table:

- An `ENFORCED` rule is already checked by a tool. It belongs in a line naming the tool that runs,
  not in a checkbox, because a reviewer who ticks it is repeating what the pipeline already said.
- A `REVIEWED` rule the team has agreed to is exactly what a checkbox is for: a person claims they
  checked it.
- A rule still marked as a proposal, which is every rule `--init` wrote and the Tech Lead has not
  yet accepted, stays out. A checkbox binds every contributor who opens a pull request from then on,
  and that is how a team ends up bound by something nobody agreed to.
- An `ASPIRATIONAL` rule belongs in neither. A checkbox nobody can honestly tick teaches the team to
  tick without reading.

Where the project has recorded no rules at all, the template still carries the baseline items from
`shared/review-checklist.md`, marked as the kit's baseline rather than the team's rules. They are
true in any project, `atk:review` checks them whatever the project has recorded, and a template that
left them out would show the reviewer nothing while the review still blocks on them. What is never
done is borrowing a checklist from another project.

How a template is filled once it exists belongs to the skill that opens pull requests, in
`skills/git/references/pr-body.md`.

## `CODEOWNERS`

This file routes reviews, and on a protected branch it can block a merge. A wrong entry is worse
than an absent file, so it has a precondition the other two do not.

**Owners come from the Team section of `.atk/profile.md`**, which carries a host identifier beside
each name for exactly this. A name alone is not an owner: `CODEOWNERS` needs `@handle`, `@org/team`,
or an email address, and a file of real names is a file the host ignores.

**Never from git history, and never a handle read out of commit metadata.** The person who touched a
file last is not its owner, and an address lifted from a commit belongs to whoever wrote it rather
than to whoever owns the path. `atk:git` refuses to request a review on that basis for the same
reason; a file that encoded it would defeat the rule permanently rather than once.

So, when it is offered at all:

- No profile, no Team section, or no host identifiers in it: do not offer this file. Say that the
  Team section of `.atk/profile.md` is what it needs and that `atk:init` fills it, and offer the
  other two. A `TBD` entry is not an owner.
- A path nobody named is written as a comment carrying the question and the name of whoever can
  settle it, never a guess. On a monorepo the path-to-owner map is what the file is for, and the
  profile holds roles rather than paths, so ask for the mapping or leave it to comments.
- A Team section resolving to one person: say in the offer that the host never requests a review
  from the author, so the file will request nothing, and that under a branch protection requiring
  code owner review it can leave that person unable to merge. Then let them pick.

This skill never changes a branch protection setting, which is the other half of what makes the file
bite.

## What the step never does

- Overwrite a file the project already has, at any of the locations in
  `shared/host-file-locations.md`. Outside `--sync` a disagreement is an open question for the
  owner, per rule 3 of `shared/team-roles.md`; under `--sync` it is a change shown and picked, which
  is the section below. Neither is a rewrite nobody asked for.
- Write any of these as a side effect of another run. They are offered, picked, and written, in that
  order, every time. Where no user is reachable to pick, nothing is written.
- Add a rule the conventions document does not carry. A file that quietly introduces a rule is how a
  team ends up bound by something nobody agreed to.
- Install or configure tooling to make a drafted check pass, which step 4 already proposes rather
  than does.

## Keeping a file in step, under `--sync`

Two of the three are built from something that keeps moving, so a file written months ago can be
wrong without anyone touching it:

| File | The source moved when |
|------|-----------------------|
| The pull request template | The enforcement table gained, lost, or reclassified a rule the checklist carries |
| `CODEOWNERS` | The Team section named someone new, dropped someone, or changed an identifier |
| `CONTRIBUTING.md` | The conventions document moved, or the command it links to is no longer what the profile says |

Show the change, not a new draft. A fresh draft laid over the file hides whatever the team wrote by
hand in the meantime, and the person deciding cannot see what they are about to lose. Name what
moved and in which direction, show the lines that would change, and write only what is picked.

Where the file has been edited by hand into something the source no longer explains, that is not
drift and not a change to offer. Say what disagrees and who can settle it, and leave the file
alone: the team meant that edit.

## Approval, and what happens to the files

They are committed, like the project's linter config, and they are the project's own from the moment
they land. None of the three can carry the front matter block from `shared/artifact-paths.md`: a
pull request template renders into every pull request, and `CODEOWNERS` is not Markdown at all. So
the draft is a proposal the same way an unagreed rule is, and the record of that lives where the
run's other output lives: the conventions document under a full run, and the session report under
`--scaffold`, naming who picked the file and which role approves it.

The approval itself is the Tech Lead accepting the pull request that carries them. Getting there is
`atk:git`'s, under the consent line in `shared/finalize-steps.md`: the push and the pull request are
asked for every time, and nothing here makes either of them automatic.
