# Supply chain

Loaded by `atk:security` in step 2, for the Supply chain bullet. How `scripts/supply-chain-scan.mjs`
is run and read, how each kind of candidate it prints is triaged against the assets of step 1, what
it cannot see, and the list of popular package names in `references/popular-packages.tsv` that a
typosquat candidate is measured against.

The script finds; the run judges. A candidate is a place to look, the way a dangerous function name
is in step 3: it becomes a finding only once the run has checked it against what it protects, and
it is recorded as `REFUTED` with the line that refutes it when it does not hold.

## Running it

`node <this skill>/scripts/supply-chain-scan.mjs` from the root of each repository in scope, once
per member where the profile names members. It takes no argument and reads the whole tracked tree as
git's index holds it, never the working tree: the workflows under `.github/workflows/`, every local
`action.yml`, and the manifests, lockfiles and registry settings of npm and Python. It starts only
`git`, sends nothing, and never opens a file the path list of `shared/secret-scan.md` names; such a
file, and a symbolic link, is named under `not_scanned` instead.

What it scans is the index of the checkout it runs in, not the scope the run resolved. Where the
scope's tip is not that index, a branch or a range not checked out, or paths whose edits are not
staged, the record says which tree was scanned, and the scope's own workflows and manifests are
checked by hand, per the rule below. Where the scope is part of the repository, one service of a
monorepo, candidates outside it are listed as out of scope and not triaged.

It prints one JSON object. Exit `0` is a finished scan, whatever it found. Exit `3` is a scan that
ran and did not read everything, `incomplete_reason` naming each file and why: a workflow its line
reader could not read, a manifest that is not valid JSON, a file in a merge conflict, git failing.
Exit `2`, or any other outcome, a killed process or output that is not one complete JSON object, is
not run, and nothing in it is read as a result. Without Node, the supply chain is not scanned, and
the record says so. A scan that did not exit `0` is never reported as clean: the record names what
was not read, and the run checks those files by hand, per the rule below, or leaves them as not
scanned.

What the script prints from a file is an action's name and ref, a job's name, a package name, and a
host with any login taken out. It never prints a line of a manifest or a configuration file, since
`.npmrc`, `pip.conf` and an index URL can carry a login. A secret shape on such a line is the `tree`
scan's finding, under Secrets in tracked files, not this script's, and the run does not open the
line to look.

The record's Checks run table quotes `scanned` and names every `not_scanned` entry: an ecosystem or
a CI system the scope holds that the script does not read, a lockfile that records no install script,
a tracked `node_modules`, a registry set from a variable. Each is not scanned, never passed over;
the run checks it by hand where it is in scope, and says which it did.

A check by hand never reads the value of a registry or index setting: `.npmrc`, `.yarnrc.yml`,
`pip.conf`, `pip.ini`, or the index lines of a manifest. The run searches for the key alone,
`registry`, `npmRegistryServer`, `extra-index-url`, with a search that returns the file and the line
number and never the line, and asks the person who owns the file which host each of those lines
names. The record cites the path and line, and the host as that person gave it, or that it is not
yet answered. A token line beside it is never opened.

## Triage per rule

`Reachable by` below is the value `references/record-template.md` defines. Severity is decided against
the assets of step 1, as for every finding: a workflow that can reach nothing but a test runner is not
ranked like one holding a deploy key.

| Rule | Judge it by | A finding when | The control to suggest |
|------|-------------|----------------|------------------------|
| `action-not-pinned` | Which repository owns the action, and what the job holds when it runs: secrets, a token with write permissions, a deploy step | The job holds anything step 1 names as an asset. Whoever controls the action's repository, or takes it over, can move the tag to code that runs with them. `Reachable by` whoever controls a dependency | Pin to the full commit SHA with the tag in a comment, and let the project's update tool move the pin |
| `pull-request-target` | Whether any job then runs code from the pull request, and what the token and secrets of that run can do | Alone, a candidate to read rather than a finding: the trigger runs with the base repository's secrets and a write token by design. It is a finding through the next rule, or through `event-in-run` in the same workflow. A job that calls a local reusable workflow passes the trigger on: that file is read as running under it, which the script does not do | `pull_request` for anything that builds or tests the pull request; `pull_request_target` only for labelling and commenting, with no checkout of the head |
| `pull-request-target-checks-out-head` | What runs after the checkout: an install, a build, a test, a script from the tree, each of which executes the pull request's code | Anything from the checked-out head runs. Critical when the job holds a secret or a write token: anyone who can open a pull request runs code with them. `Reachable by` any signed-in user on a public repository | Split the work: an unprivileged `pull_request` job builds, and a privileged job reads only its artifact, never the code |
| `event-in-run` | Which field is interpolated, and who can write it: a title, a body, a branch name, a comment is the author's own text; a number or a SHA is not | The field is text an outside actor writes. The expression is expanded before the shell runs, inside a shell comment too, so the text becomes a command. `Reachable by` Any signed-in user on a public repository, or the least access that can open the issue, pull request or comment that triggers the workflow | Pass the value through `env:` and quote the variable in the script |
| `secrets-inherit` | Which reusable workflow receives them, who owns it, and whether it is pinned | The called workflow belongs to another repository, or is not pinned to a commit: every secret of the caller reaches code the project does not control. Ranked with `action-not-pinned` when both hold | Pass the named secrets the called workflow needs, and pin it |
| `no-permissions` | What the repository's settings grant the token by default, which the script cannot see, and what the job does | The default grant is write and the job runs code it did not write, an action not pinned or a pull request's code. Otherwise Low, a missing layer | `permissions:` at workflow level, read-only, and widened per job where a job needs it |
| `install-script` | The package, whether the project expects it to build native code, and where installs run: developer machines, CI with secrets | Not on its own: many packages build native code. It is the place a malicious package acts, so it raises the rank of a typosquat or a malicious-package advisory on the same package | Install with scripts disabled where the project allows it, and an allow-list for the packages that need them |
| `private-registry-unscoped` | Whether the registry resolves a name it does not hold from the public registry, and whether the name is claimed there | An unscoped name the project publishes privately that the public registry does not hold, or does not hold for that owner: whoever claims it publicly with a higher version is installed instead. `Reachable by` whoever controls a dependency | A scope the organisation owns for every private package, and a registry setting per scope |
| `extra-index-url` | Whether the extra index holds private packages, and whether their names are claimed on the public index | pip takes the highest version from any index, so a private name claimed publicly wins. `Reachable by` whoever controls a dependency | One index that proxies the public one and serves private names first, or `--index-url` alone, with hashes |
| `no-lockfile` | Whether the manifest is installed anywhere: a deployable, CI, a published package | A deployable or CI installs from it: each install takes whatever version was published last, a malicious one included | Commit the lockfile the package manager writes, and install from it in CI |
| `no-hashes` | The same, for a requirements file with no lockfile beside it | The file is installed for a deployable or in CI with no hash: a replaced file on the index installs unchecked | `--require-hashes`, or a lockfile the tool verifies |
| `typosquat` | The `like` name it is one or two edits from: whether the project meant that package, who publishes the one it has, and how long it has existed | The project did not mean this package. Critical when it is installed anywhere, ranked as Malicious packages in `references/threat-checklist.md` ranks a malicious-package advisory, since its install script has already run. A short name close to another popular one is often a real package of its own, and is `REFUTED` once its publisher is confirmed | Replace it with the intended package, and treat every credential the installing machines held as exposed |

A candidate is reported with its rule, path and line, and with the action, job, package or host the
script printed. A finding cites the same, never the line.

## What the script cannot see

The script reads the files of the repository. These are not in them, and each is asked of whoever
administers the repository and recorded in the Checks run table as a check not run, with the
question and whom it was asked of, until answered:

- **The token's default permissions** in the repository or organisation settings. A workflow with no
  `permissions:` gets whatever they grant, read-only or write.
- **Self-hosted runners on a public repository.** A pull request from a fork can run on the
  machine, and what it leaves there persists to the next job.
- **Secrets shared at organisation level**, and which repositories each reaches. A secret the
  workflow names may hold more than the repository's own.
- **Branch protection and required reviews** on the branches the workflows deploy from.
- **Advisories.** A known vulnerability or a malicious-package advisory comes only from the
  scanner the project already runs, per the Dependency audit and Malicious packages rows of
  `references/threat-checklist.md`. The script fetches nothing.

The first version of the script also leaves these unread, in the files it does read, and the run
checks each by hand where the scope holds it: package sources in `[[tool.poetry.source]]`,
`[[tool.uv.index]]` and `[[tool.pdm.source]]`; `permissions: write-all`; event text in the `script:`
of `actions/github-script`, or reached through a function such as `format()`; the `workflow_run`
and `issue_comment` triggers, which run with the base repository's secrets as `pull_request_target`
does; and the images of a job's `container:` and `services:` and of a Docker action's `runs.image`.

## The popular names list

`references/popular-packages.tsv`: a header line, then one name per line, three fields separated by
a tab, in this order:

```
ecosystem  name  checked
```

- `ecosystem` is `npm` or `pypi`, the two the script reads. A Python name is written normalised, in
  lowercase with each run of `.`, `_` and `-` as one `-`, the form the script compares.
- `name` is a package that is among the most installed of its registry.
- `checked` is the date, `YYYY-MM-DD`, on which that was confirmed against the registry's own
  download figures: the npm download counts, and the monthly list of the most downloaded PyPI
  projects. Left empty where nobody confirmed it.

The script counts each ecosystem's names and prints the oldest `checked` date it used, with how many
lines were unchecked; the record quotes both, since a candidate measured against an old list can miss
a name that has become popular since. The kit's maintainer confirms the list again before a release
that changes the script or the list. A name is one more line, with no tab inside a field, and a
package that stops being popular is removed rather than left with an old date. The kit repository's
`tests/verify.sh`, which does not ship with the plugin, checks the field count and the date of every
line.
