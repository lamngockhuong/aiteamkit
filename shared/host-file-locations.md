# Host file locations

Shared resolution for the three files a code host reads: `CONTRIBUTING.md`, the pull request
template, and `CODEOWNERS`. Referenced from `skills/<name>/SKILL.md` as
`shared/host-file-locations.md`, which is `../../shared/host-file-locations.md` relative to a skill
file.

Three skills need this and need the same answer. `atk:convention` asks whether the project has one
of these files, because a file it believes absent is a file it offers to draft. `atk:git` asks where
the pull request template is, because that template is the shape of a pull request body. `atk:init`
asks where `CODEOWNERS` is, because the handles in it are host identifiers the interview would
otherwise spend a turn asking for. A narrower answer in any of the three produces the same failure
from three directions: a second file lands beside the team's own, the host picks one by its own
precedence, and the team believes it is covered by the one the host ignored. For `atk:init` the
failure is quieter and no less real: a team asked for what a tracked file already states.

## Detect the host first

The tracker and the code host are different things, and `shared/ticket-adapters.md` resolves the
first. Resolve this one in its own order, and say which step decided it:

1. `git remote get-url origin`, and the other remotes where that one says nothing.
2. An existing `.github/` or `.gitlab/` directory in the repository.
3. The user, asked.

Where none of the three settles it, say so rather than assuming. A file written to a path the host
does not read is not a smaller mistake than no file: it is the same gap with a reassurance on top.

## Where each file lives

**GitHub** reads each of these from three places, in this order, and uses the first it finds:

| File | Locations, in the order GitHub resolves them |
|------|----------------------------------------------|
| `CONTRIBUTING.md` | `.github/`, the repository root, `docs/` |
| Pull request template | `.github/PULL_REQUEST_TEMPLATE.md`, the repository root, `docs/PULL_REQUEST_TEMPLATE.md`, and a `PULL_REQUEST_TEMPLATE/` directory beside any of the three |
| `CODEOWNERS` | `.github/`, the repository root, `docs/` |

Both spellings, `PULL_REQUEST_TEMPLATE.md` and `pull_request_template.md`, at every one of those
locations. A case-sensitive check finds nothing on a repository that chose the other one.

**GitLab** keeps the template at `.gitlab/merge_request_templates/<name>.md`, one file per template,
and `CODEOWNERS` at `.gitlab/CODEOWNERS` or the repository root. `CONTRIBUTING.md` sits at the root.

**A host with no equivalent** is a real answer. Bitbucket Cloud has no repository `CODEOWNERS`; it
keeps default reviewers in a repository setting. Say that the host has no such file rather than
writing one it will never read.

## When a file counts as present

Present at any one of its locations means present. This is what decides whether `atk:convention`
offers to draft it, and getting it wrong is how a project that already has a template acquires a
second one that outranks it.

A directory of templates counts as having a template. A team that keeps several chose that
deliberately, and adding a single top-level file changes the default body of every pull request
without touching a byte of theirs.

One exception, and it is the same rule step 1 of `atk:convention` already applies to conventions: a
file that answers nothing answers nothing. A `CONTRIBUTING.md` holding only a heading and a `TODO`,
or a `CODEOWNERS` of comments alone, is reported as absent, with the path and what is in it named,
so the person choosing can see what they would be replacing.
