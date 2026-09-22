# Detection

Loaded by `atk:init` in step 1. Every row says where to look and what to do when the repository
gives more than one answer, or none.

The rule behind the whole file: detect what a file states, ask what only a person knows. A question
about something on disk is a defect here, not a question.

## What is detectable

### Repository shape

Resolve this before reading anything else. Every path the rest of this file produces hangs off the
project root, and a run that assumed the root records citations that resolve to nothing.

Six commands, in order:

1. `git rev-parse --show-toplevel` in the target directory. It prints the target where the target is
   a repository root, and prints a directory above it where the target is a subdirectory of one;
   there the repository top level is the candidate root rather than the directory the run started
   in. It fails where the directory is in no repository, and then the candidate root is the target
   directory itself. Say which of the three happened.

   A failure has two causes that are not the same fact. There is no repository here, and there is one
   git refuses to open: a permissions error, a `dubious ownership` refusal, a corrupt repository
   directory. Read what git printed and tell them apart, because the second is something to fix
   rather than a project that never had a repository, and a run that folds it into the first writes a
   profile nobody will ever be able to commit without saying why.
2. `git rev-parse --verify HEAD`, where step 1 found a top level. A repository with no commit yet is
   still a repository, and the profile can be its first commit. This separates that case from step
   1's failure and nothing else is concluded from it.
3. `.gitmodules` at the top level. Every entry is a member repository linked as a submodule.
4. Members that are not submodules: for each directory one and two levels below the candidate root,
   `git -C <dir> rev-parse --show-toplevel`. A directory that prints itself is a repository of its
   own; one that prints the candidate root is an ordinary directory inside it. Compare resolved
   paths, not the strings: git prints the real path, so a member reached through a symlink prints
   neither the scanned path nor the candidate root, and a string comparison puts it in no bucket at
   all. Two levels, because `apps/backend` is as ordinary as `backend`. Deeper than that, ask rather
   than walk the tree.

   Skip what a project does not author: `node_modules`, `vendor`, `third_party`, `.venv`, `dist`,
   `build`, and anything already ignored by git. A vendored library cloned instead of installed is a
   repository by this test and a member by nothing else, and treating it as one flips the shape,
   invents a docs root, and turns on the multi-repository commit sequence for something nobody
   ships.
5. `git remote get-url origin` per repository found, members included, falling back to `git -C <dir>
   remote` where `origin` is not the name. A member with no remote at all is a clone somebody made
   locally and never pushed, which is worth saying out loud.
6. Upward, once: is the target itself inside something larger?
   `git rev-parse --show-superproject-working-tree` names the superproject when the target is a
   submodule, and a `.atk/profile.md` in a directory above the candidate root names a project that
   may already list it. Either one is what raises the question below; without this step a run started
   inside one member can only ever see a single repository, and the question has no way to fire.

A member repository outside the project root's directory tree is not found by any of this, and that
is a limit rather than an oversight: the walk that finds the profile also only goes up. Where the
user names one, record it with its path as given and say that a profile is inherited by whoever
clones the project root, which that clone is not under.

The four shapes:

| What those commands found | Shape |
|---------------------------|-------|
| One repository, no members, one package | `single repo` |
| One repository, no members, a workspace file or several packages | `monorepo` |
| A repository at the root, with member repositories inside it | `parent + members` |
| No repository at the root, with member repositories inside it | `workspace` |

A target in no repository that holds no members either is recorded as `single repo`, because that
is what it is on its way to being, with a note that no repository was found. The profile written
there is tracked by nothing, which is the `workspace` cost with one directory instead of several,
and it is stated the same way.

`shared/project-profile.md` holds what each shape costs and where the profile goes under it. The
last two have a cost to state before the profile is written rather than after, which is step 4 of
`SKILL.md`.

One question this can raise, and it counts against the budget below: step 6 found a superproject or
a profile above the target, so the target is one member among several and the user may have meant the
whole project. Ask which directory is the project root, showing what step 6 found. Never widen a run
to a parent directory the user did not name, and never narrow one either.

Detection then runs once per repository. The package manager, the commands, the layers, how to start
the app, and whether the member keeps a docs tree of its own are per repository in the last two
shapes, and every source path is recorded from the project root, so a citation says which repository
it came from. A member with its own docs tree gets a line in the profile's `Docs` section, because
`shared/artifact-paths.md` sends that member's fix reports and verification records there rather than
to the project docs root.

A submodule of a submodule is the inner repository's own business and gets no row here. The parent
records its direct members, each member records its own, and a profile that reached two levels down
would be describing a project it does not own.

A member the run cannot read, an uninitialised submodule being the ordinary case, is recorded as a
member with its cells `TBD` and the reason. `git submodule status` prefixes such an entry with `-`.
Do not clone or initialise one to fill the cells in: that changes the working tree of a project this
run was asked to read.

### Package manager

The lock file decides, not the manifest.

| Lock file | Package manager |
|-----------|-----------------|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| `bun.lock` or `bun.lockb` | bun |
| `poetry.lock` | poetry |
| `uv.lock` | uv |
| `Pipfile.lock` | pipenv |
| `go.sum` | go modules |
| `Cargo.lock` | cargo |
| `Gemfile.lock` | bundler |
| `composer.lock` | composer |

Two lock files means a migration in progress. Show both and ask which one is current.

A lock file of zero bytes decides nothing on its own. Before asking, check whether the CI workflow
invokes a package manager (`pnpm install`, `poetry run`, `bundle exec`): a workflow that runs the
tool every day is better evidence than an empty file. Ask only when nothing corroborates it, and
until it resolves, leave the Commands cells `TBD` too, because a command with no prefix is a command
that does not run.

### Commands

Resolve **each cell separately**. Test, build, and lint are three questions, and a source that
answers two of them settles nothing about the third. Per cell, look in this order and stop at the
first that answers *that cell*:

1. The CI workflow (`.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`). This is the most
   honest source: it is what the project actually runs on every change.
2. `Makefile` or `Taskfile.yml` targets, and runner configs: `tox.ini`, `noxfile.py`.
3. The script block of the package manifest: `package.json` `scripts`, `composer.json` `scripts`,
   `Gemfile`/`Rakefile` tasks.
4. The agent instruction file (`CLAUDE.md`, `AGENTS.md`). A repository that ships content rather
   than an application often has its only checks written down here and nowhere else.
5. The language convention. Confirm it with the user; never record it as detected.

Python has no script block. `[project.scripts]` and `[tool.poetry.scripts]` in `pyproject.toml` are
console entry points, not test commands, and `[tool.pytest.ini_options]` is configuration. Look in
`tox.ini`, `noxfile.py`, or the `Makefile`. Apply this per cell like every other source: when all
three are silent about *this* cell, fall back to the language convention (`pytest`, `ruff check`,
`python -m build`) and confirm it in the step 2 pass rather than spending an interview turn.

A cell no source answers is `TBD`, not a guess borrowed from the cell next to it.

#### Monorepos: CI runs the aggregate, the profile records the parts

In a monorepo, CI almost always runs a root task runner across every package at once: `pnpm build`
delegating to `turbo run build`, or the `nx` and `lerna` equivalents. That single line is true of
the repository but useless to a skill working on one app, which needs the command for that app
alone.

Take the script name from the aggregate and add the package manager's workspace filter per member:
`pnpm -F api test`, `pnpm --filter web build`, `yarn workspace api lint`, `npm -w api run lint`.
Read the filter syntax off the package manager, not off another project. Keep the root aggregate as
one extra row when the team also runs it that way, and say which is which.

A member that does not define the script simply has no row for that cell. Read each member's own
manifest rather than assuming the root script exists everywhere; a package with no tests is
ordinary, and inventing `pnpm -F utils test` for it produces a command that fails on first use.

Flags on the aggregate that select a subset (`--affected`, `--since`, `--filter=...[origin/main]`)
belong to the aggregate row, never to a per-member row: they depend on git state and would silently
run nothing.

#### Every recorded command must run on a developer machine

`atk:verify` runs these commands locally. A command that only works in CI, or only inside an
already-activated environment, is worse than no command at all. Four consequences:

- **Carry the environment prefix.** `pytest` is not a command, `poetry run pytest` is. Whatever the
  package manager row says, the commands row must be runnable under it: `poetry run`, `uv run`,
  `pnpm`, `npm run`, `bundle exec`, `pipenv run`. CI files usually have the prefix already; runner
  configs and language conventions never do, so add it and say you did.
- **Unwrap the runner, or invoke it whole, but do not mix.** `tox.ini` and `noxfile.py` hold
  commands written for the runner, not for a shell. Prefer invoking the runner whole
  (`poetry run tox -e lint`, prefix included), because the runner builds the environment its command
  expects; unwrap to the inner command only when the tool is also a project dependency, so the
  prefix alone is enough to run it. Never copy a placeholder out of the config: `{posargs}`,
  `{envdir}`, `{toxinidir}` mean something to tox and are a stray path to a shell. Name the
  environment explicitly, since bare `tox` has no defined default without `[tox] envlist`; when the
  test environment is an unnamed `[testenv]`, there is no name to give, so record the inner command
  instead and say why.
- **Drop any flag that does not behave the same locally.** Two disqualifying causes, one rule.
  First, the flag depends on running inside a CI runner: `--ci`, `--reporter=github`,
  `--watchAll=false`, anything reading a CI-only environment variable. Second, the flag needs an
  optional plugin the project does not depend on: `--coverage` makes vitest offer to install a
  coverage provider interactively when one is missing, which hangs exactly as a watch mode does, and
  `pytest --cov` exits with an unrecognized-argument error without `pytest-cov`. Keep a flag of the
  second kind only when the plugin is in the dependency list. Keep the workspace filter either way.
- **Installing dependencies is setup, not a cell.** It is the precondition of all three cells, so it
  belongs on its own `Setup:` line under the Commands table, recorded without `--frozen-lockfile`
  (which fails on a developer machine whose manifest has moved ahead of the lock file). This is
  different from a build that needs codegen first: that is a build step and stays in the Build cell
  as two entries.

Three traps worth a question rather than a guess:

- A script named `test` that starts a watch mode. It never exits, and it will hang `atk:verify`.
  String matching on `watch` misses the common case, because several runners watch by default when
  no subcommand is given: bare `vitest` (needs `vitest run`), `nodemon`, `tsc -w`, `jest` with
  `watch: true` in its config. Ask whenever the command is one of those bare invocations, as well as
  when the body contains `watch`, `--watch`, or a dev server.
  When CI already gave a safe command and only the script is unsafe, no question is needed, but the
  divergence is worth one comment on the row: a developer who types `npm test` still lands in the
  watch mode, and the profile is where that gets recorded.
- A script that only works after another command. A build that needs codegen first belongs in the
  Commands section as two entries, not one.
- A command that points at a file the repository does not have. `tsc -p tsconfig.json` in a repo
  with no `tsconfig.json` is a dead command that detection will happily record. Open the paths a
  candidate command names; a missing one means the script is stale, which is a finding for the user,
  not a value for the profile.

### Layers

Inside one repository, a monorepo if any of these exist: `pnpm-workspace.yaml`, a `workspaces` key in `package.json`,
`go.work`, `Cargo.toml` with `[workspace]`, `lerna.json`, `nx.json`. Read the globs to get the
member list rather than listing directories by hand. `turbo.json` is a weak signal on its own: it
appears in single-package repositories too, so confirm it against one of the others.

Otherwise a single repo with one layer.

Ask when the member list does not group cleanly. Twelve packages that split into backend, frontend,
and shared is a judgment the repository does not record.

Members of a multi-repository project are decided by Repository shape above and not here. A layer
row in one of those projects carries a path from the project root, and which repository that path
falls in is what the Repositories table of the profile answers.

### Docs root

First that exists: a docs path named in `CLAUDE.md` or `AGENTS.md`, then an existing `docs/`
directory, then `documentation/`, then nothing. Never create a second tree beside one that already
exists; `shared/artifact-paths.md` owns this rule and this is only its detection half.

Then whether that root is partitioned by language: a directory named with a language code that
shares at least one `.md` filename with the branch beside it. Overlap, not an equal set, because
the authored branch also holds the language directories themselves and whatever the mirrors have
not caught up with; a half-translated tree is the normal case. A subject directory such as
`docs/api/` is not one of these.

Where the root holds documents of its own beside the language directories, the root is the authored
branch and the rest are mirrors. Where every branch carries a language code and the root holds
nothing of its own, nothing in the tree says which one is the source, so ask rather than infer: the
answer decides where every reference document the team writes from now on lands. Nobody to ask yet
means `TBD` plus their name, as everywhere else, not a guess.

Most projects have no language directory at all. Record `none` as the mirrors and the working
language as the authored one, and move on; this is two lines, not an interview.

Where conventions live: a convention document, a directory of standards documents split by topic or
by side of the stack, `CONTRIBUTING.md`, `.editorconfig`, or the linter config. Record every one
found; they are different kinds of rule. Where the project keeps a set of documents rather than one,
record which of them carries the review checklist, or that none does yet. That is the answer
`shared/review-checklist.md` looks for first, and the profile is the only place it can be recorded
once.

### Tracker and repository owner

`git remote get-url origin` gives the host and the `owner/repo` pair. Map the host to a tracker with
`shared/ticket-adapters.md`.

The remote only proves where the code lives. A team that hosts code on GitHub and tracks work in
Jira or Backlog is ordinary, so confirm rather than conclude.

Where the shape names member repositories, read the remote of each one. Members usually share a
tracker and sometimes do not, a backend repository with its own issue list beside a project board
being the ordinary exception, so record the project tracker in the Tracker section and name the
member whose tracker differs on a line of its own.

### How to start the app

`docker-compose.yml` services, a `dev` or `start` script, a `Procfile`, a console entry point in
`[project.scripts]` or `[tool.poetry.scripts]`, or the run command in the project README. Multiple
candidates means a question, because the wrong one wastes every later run of `atk:verify`.

A repository that ships content rather than an application has nothing to start. Record that, and
let the Verify section point at the check commands instead.

## What is never detectable

Ask these, and nothing else:

| Fact | Why no file holds it |
|------|----------------------|
| Role to real name | Git history shows who commits, not who is Tech Lead |
| A person's host identifier | Commit metadata carries the address that wrote a commit, which is neither the handle the host knows them by nor a statement that they own anything |
| Who approves what | An approval rule is an agreement, not a file |
| Working language | The repository may be English while the team works in another language |
| Where the spec lives | Often a wiki, a drive, or a chat channel outside the repository |

**Except where the project wrote it down.** A stated value is detected with its source and not
asked for, the same way the Commands section above takes a cell out of `CLAUDE.md` when that is the
only place the project recorded it. Two rows meet this in practice: `CODEOWNERS` states a person's
host identifier and the paths they own, and an agent instruction file sometimes states where the
spec lives. `shared/host-file-locations.md` holds where each host reads `CODEOWNERS` from and when
one counts as present.

What `CODEOWNERS` never states is the role name. A line giving `@handle` ownership of `apps/api`
says nothing about whether that person is the Tech Lead or the BrSE, so take the handles and their
scope from the file and leave the role mapping to the fixed turn that owns it.

Whether a detected value is still current is not on this list. That belongs to step 2, where every
detected value is shown for confirmation in one pass, not to the interview.

## The question budget

The unit is **one turn asking the user**, not one fact, and a harness that carries several questions
in a single prompt spends one turn on that prompt, per Several questions in one prompt in
`shared/host-capabilities.md`. Four turns are fixed: the team table (all roles, their host
identifiers and their approvals in a single question, never one question per role and never a second
turn for the identifiers), the working language, where the spec lives, and who approves the profile.

That leaves four turns for the ambiguities the section above can raise: which directory is the
project root, two lock files, a watch-mode test script, a command that needs another command first,
a member list that does not group cleanly, a tracker that may not match the git host, and more than
one way to start the app. Seven possible ambiguities, four turns. When more than four appear, ask
about the ones that would break a later skill, and the project root comes before all of them,
because every path in the profile is written from it; then the test command and how to start the
app, because `atk:verify` runs both. Write the rest as `TBD` with an owner for `--audit` to pick up.

Eight is a ceiling, not a target. Most projects raise no ambiguity at all and finish in four.

## The budget on a re-run

The four fixed turns assume there is no profile yet. Against one that already exists, three of them
are usually answered in the file being re-read, and asking again is the defect step 1 exists to
prevent. Owe only the fixed turns the existing profile leaves unanswered, plus the ambiguities the
comparison raises, and count a value that matches what the profile records as already confirmed.
`SKILL.md`, under "Re-running against an existing profile", owns that rule; this is its half of the
budget.

## Recording a source

Every detected value carries the file it came from, as a repository-relative path with a line number
where one applies. This is what makes `--audit` possible: without a source, a drifted value cannot
be traced back to what changed.

## When detection finds nothing

A repository with no lock file, no CI, and no manifest is a valid input. Say what was searched, mark
the sections `TBD`, and let the interview fill what the user knows. An empty profile that states its
own gaps is more useful than a profile of guesses.
