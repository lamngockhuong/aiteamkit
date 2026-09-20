# Detection

Loaded by `atk:init` in step 1. Every row says where to look and what to do when the repository
gives more than one answer, or none.

The rule behind the whole file: detect what a file states, ask what only a person knows. A question
about something on disk is a defect here, not a question.

## What is detectable

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

A monorepo if any of these exist: `pnpm-workspace.yaml`, a `workspaces` key in `package.json`,
`go.work`, `Cargo.toml` with `[workspace]`, `lerna.json`, `nx.json`. Read the globs to get the
member list rather than listing directories by hand. `turbo.json` is a weak signal on its own: it
appears in single-package repositories too, so confirm it against one of the others.

Otherwise a single repo with one layer.

Ask when the member list does not group cleanly. Twelve packages that split into backend, frontend,
and shared is a judgment the repository does not record.

### Docs root

First that exists: a docs path named in `CLAUDE.md` or `AGENTS.md`, then an existing `docs/`
directory, then `documentation/`, then nothing. Never create a second tree beside one that already
exists; `shared/artifact-paths.md` owns this rule and this is only its detection half.

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

Whether a detected value is still current is not on this list. That belongs to step 2, where every
detected value is shown for confirmation in one pass, not to the interview.

## The question budget

The unit is **one turn asking the user**, not one fact. Four turns are fixed: the team table (all
roles, their host identifiers and their approvals in a single question, never one question per role
and never a second turn for the identifiers), the working language, where the spec lives, and who
approves the profile.

That leaves four turns for the ambiguities the section above can raise: two lock files, a watch-mode
test script, a command that needs another command first, a member list that does not group cleanly,
a tracker that may not match the git host, and more than one way to start the app. Six possible
ambiguities, four turns. When more than four appear, ask about the ones that would break a later
skill (the test command and how to start the app come first, because `atk:verify` runs both), and
write the rest as `TBD` with an owner for `--audit` to pick up.

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
