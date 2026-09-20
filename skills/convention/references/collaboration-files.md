# Collaboration files

Loaded by `atk:convention` at step 6, and by `--scaffold`. Three files decide how a change is
proposed, what a reviewer is shown, and who is asked to look at it. A project that has none of them
has those three answers in people's heads, where a new joiner cannot read them.

This file says what each one holds, where it lives, and what the draft is built from. What it does
not do is make any of them appear: the user picks which files to write, and picking none ends the
step.

| File | The question it answers | Built from |
|------|-------------------------|------------|
| `CONTRIBUTING.md` | How does a person get from a clone to a merged change here | The conventions document, plus what the repository really does |
| The pull request template | What is every reviewer shown, every time | The enforcement table built in step 4 |
| `CODEOWNERS` | Who is asked to review which part | The Team section of `.atk/profile.md` |

## Where they live

`CONTRIBUTING.md` sits at the repository root on every host. The other two are the host's own
convention: on GitHub, `.github/PULL_REQUEST_TEMPLATE.md` and `.github/CODEOWNERS`; on GitLab,
`.gitlab/merge_request_templates/<name>.md` and `.gitlab/CODEOWNERS`.

Detect the host the way `shared/ticket-adapters.md` detects the tracker, and say which location was
used. A file written to the wrong path is not a smaller mistake than no file: the host ignores it,
and the team believes it is covered.

## `CONTRIBUTING.md`

The flow a person follows: how to set the project up, how to branch, how to commit, how to open a
pull request, and what happens to it afterwards. The build and test commands come from
`.atk/profile.md`, and the branch and commit rules from the conventions document.

Link to the conventions rather than copying them, which is already the rule in step 5 of the skill.
Two files stating the same rule drift apart, and the reader cannot tell which of them lost.

## The pull request template

Its sections are what reviewers here are actually shown, not a list from another project. The
verification section comes from the enforcement table:

- An `ENFORCED` rule is already checked by a tool. It belongs in a line naming the tool that runs,
  not in a checkbox, because a reviewer who ticks it is repeating what the pipeline already said.
- A `REVIEWED` rule is exactly what a checkbox is for: a person claims they checked it.
- An `ASPIRATIONAL` rule belongs in neither. A checkbox nobody can honestly tick teaches the team to
  tick without reading.

Where the project has recorded no rules at all, the template says so and carries the summary and the
linked issue sections alone. An empty checklist is better than a borrowed one, because the first
thing a borrowed checklist does is get ticked unread.

How a template is filled once it exists belongs to the skill that opens pull requests, in
`skills/git/references/pr-body.md`.

## `CODEOWNERS`

Owners come from the Team section of `.atk/profile.md` and from what the team has stated about who
owns which area.

**Never from git history.** The person who touched a file last is not its owner, and a `CODEOWNERS`
built that way sends every review to whoever was busiest. `atk:git` refuses to request a review on
that basis for the same reason; a file that encodes it would defeat the rule permanently rather than
once.

A path nobody named is written as a comment carrying the question and the name of whoever can settle
it, never a guess. A `CODEOWNERS` with a wrong owner is worse than a short one: the host will block
merges on a person who never agreed to be there.

## What the step never does

- Overwrite a file the project already has. Where an existing file disagrees with what this run
  found, that is an open question for the owner, per rule 3 of `shared/team-roles.md`.
- Write any of these as a side effect of another run. They are offered, picked, and written, in that
  order, every time.
- Add a rule the conventions document does not carry. A file that quietly introduces a rule is how a
  team ends up bound by something nobody agreed to.
- Install or configure tooling to make a drafted check pass, which step 4 already proposes rather
  than does.

## Approval

None of the three can carry the front matter block from `shared/artifact-paths.md`: a pull request
template renders into every pull request, and `CODEOWNERS` is not Markdown at all. The approval is
the Tech Lead accepting the pull request that carries them, which is why they land through
`atk:git` in a commit of their own rather than folded into unrelated work.
