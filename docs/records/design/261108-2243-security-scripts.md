---
title: atk:security scripts - git history, supply chain, and delivery readiness
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-09
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-09, by instruction to the agent.

# atk:security scripts - git history, supply chain, and delivery readiness

## In short

`atk:security` reads the code as it stands at one commit. It never reads the history, where a key
deleted last year still sits in every clone, and it names the CI supply chain in its checklist
without any check that runs it. Before a repository is handed to a client, who receives that whole
history, nobody checks either. This design gives `atk:security` two Node scripts, the first
`scripts/` of any `atk` skill: `history-scan.mjs`, which walks every commit of every ref for secret
shapes, credential files, and, on request, staff emails and internal hosts; and
`supply-chain-scan.mjs`, which reads the CI workflows, manifests and lockfiles in scope. Both print
JSON, never a matched value, make no network call, and report a scan they could not finish as not
finished. Judgment stays in references: what a hit means against the assets of step 1. A new flag,
`--delivery`, runs the history scan for identities and hosts as well and ends in `READY` or
`NOT READY`, listing the owner's options and running none of them. Its report is written where git
ignores it, because a report listing what leaks must not itself be delivered.

## Requirement

The plan `plans/261108-2058-security-supply-chain-history-delivery/plan.md` (local, not committed),
section 1, acceptance criteria confirmed by Lam Ngoc Khuong on 2026-11-08. This design answers:

- **AC6.** `atk:security` scans the CI and dependency supply chain with a Node script and triages
  what it finds per a reference of its own.
- **AC7.** `atk:security` scans the whole git history for secrets with a Node script, reporting
  commit, path, line and shape, never the value, and whether `HEAD` still holds it.
- **AC8.** A delivery mode checks a repository before it is handed to a client and ends in `READY`
  or `NOT READY`, listing the owner's options without running any of them.
- **AC9.** Items 6 to 8 follow an approved design and an ADR, because they are the first `scripts/`
  in an `atk` skill.

AC1 to AC5 are the record shape, delivered by phase 1 (commit `ecaa39f` on
`feat/security-record-reach-chains-titles`); this design uses that shape and does not change it.

Decided before this design, by Lam Ngoc Khuong on 2026-11-08: the delivery check is a flag of
`atk:security`, not a step of `atk:release`; the history and supply-chain scans are Node scripts
with a design and an ADR, not `sh` blocks.

## Current state

- `plugins/atk/skills/security/SKILL.md:106` to `:127`, step 2 Automated checks: dependencies, the
  secret scan over tracked files (`:118`), configuration. Nothing reads history or CI workflows.
- `plugins/atk/skills/security/references/threat-checklist.md:104`: "Secrets in history" runs only
  with a history scanner the project already has, and otherwise the record says history was not
  scanned. `:133`, the `A03:2025` row, names pinned actions, workflow permissions and how a secret
  reaches a step, and no check produces any of them.
- `plugins/atk/shared/secret-scan.md:44` to `:180` is the scan, one `sh` block whose shapes are awk
  regular expressions at `:105` to `:126`, and whose paths that are a finding on their own are the
  globs at `:55` to `:60` and the table at `:316`. `:370` says it does not see a secret already in
  the history.
- `plugins/atkx/skills/doc-audit/scripts/cite-check.mjs` already restates part of that file: the
  table of `:316` as a marked array, held equal to its origin by `tests/verify.sh:289` to `:299`.
  `tests/verify.sh:301` onward builds its fixture in a temporary repository at test time, the values
  that must not leak assembled from parts so no committed file holds one.
- `plugins/atkx/skills/doc-audit/SKILL.md:160` runs a script as `node <this skill>/scripts/<name>.mjs`;
  `docs/adr/0002-skill-eval-scripts-for-repeatable-checks.md` sets the terms: Node only, only for
  checks whose answer must repeat, judgment in references, and a host without Node told what it lost.
- `CLAUDE.md:136` to `:140` and `docs/system-architecture.md:480`: an `atk` skill may carry
  `scripts/` since 2026-10-14, the first with a design and an ADR of its own; none does yet.
- `plugins/atk/shared/artifact-paths.md:157`, the security row: a committed record under
  `docs/records/security/`. A record there is committed to the repository it describes, which is the
  repository a delivery hands over.
- `plugins/atk/shared/project-profile.md:180`: the profile carries seven sections and no more, so a
  list of the company's domains has no place there without changing that file's contract.

## Decision criteria

1. **Repeatable.** The same repository gives the same hits on every run and every harness.
2. **No value leaks.** Nothing the scan matched reaches its output, the session, or a record.
3. **Runs everywhere the kit runs.** Windows, macOS, Linux, without a tool the project does not have.
4. **Nothing sent outside.** The record's line that no request left the machine stays true.
5. **Maintenance.** One source per rule, held by a check when it must be copied.
6. **Effort.** What it costs to build and to review.

## Options

### Option A: `sh` blocks in references, like the secret scan (the default pick)

The kit's precedent for a deterministic check is `shared/secret-scan.md`: one `sh` block, run
everywhere. A `history` mode would pipe `git log -p --all` through the same awk program. It reuses
every shape with no copy. It loses on what the other two scans need: YAML of workflows, JSON and
TOML of lockfiles, an edit distance for typosquats, all of which are a program rather than a pipe,
and an awk program over a large history has no way to report a partial walk except by its exit
code. Lam Ngoc Khuong ruled it out on 2026-11-08.

### Option B: rely on scanners the project already has

Keep the prose: history with gitleaks or trufflehog, workflows with zizmor, dependencies with
osv-scanner, each only where the project runs it, as `threat-checklist.md:11` says today. Nothing to
build. Most projects run none of these, so the record keeps saying "not scanned", and where one runs,
two projects get two different answers to the same question.

### Option C: two Node scripts and a shared module (chosen)

`plugins/atk/skills/security/scripts/history-scan.mjs` and `supply-chain-scan.mjs`, both importing
`scripts/lib/secret-shapes.mjs`. Node's standard library and `git` only, invoked with argument
arrays and no shell. JSON on stdout. A scanner the project already has still runs beside them and
is named in the record; the scripts are the floor, not a replacement.

### Scores

| Criterion | A: `sh` blocks | B: project scanners | C: Node scripts |
|-----------|----------------|---------------------|-----------------|
| Repeatable | Yes for secrets, no parser for the rest | No, differs per tool | Yes |
| No value leaks | Yes, the scan's own rule | Depends on the tool's output | Yes, held by a test |
| Runs everywhere | Needs `sh` and awk | Only where installed | Needs Node, as the hooks do |
| Nothing sent outside | Yes | Some tools fetch advisories | Yes, held by a test |
| Maintenance | One copy of the shapes | None here | Shapes copied, held by a check |
| Effort | Low for history, high for the rest | None | Medium |

## Chosen approach: Option C

### Layout

```
plugins/atk/skills/security/
  scripts/history-scan.mjs        every commit of every ref: secrets, credential files, identities, hosts
  scripts/supply-chain-scan.mjs   workflows, manifests, lockfiles of the tracked tree
  scripts/lib/secret-shapes.mjs   the shapes and the credential-file globs, restated from shared/secret-scan.md
  references/supply-chain.md      triage of each candidate kind, and what the script cannot see
  references/delivery-readiness.md  the delivery triage table, the verdict rule, the owner's options
  references/popular-packages.tsv   names typosquat candidates are measured against, per ecosystem
tests/security-fixtures/          fixture inputs; the git histories are built at test time
```

### Fork 1: where the secret shapes come from

Restated in `scripts/lib/secret-shapes.mjs`, each shape with the label `shared/secret-scan.md`
prints, and held to the origin by behaviour rather than by text. The awk expressions of
`secret-scan.md:105` to `:126` and JavaScript expressions cannot be compared as strings, since the
two dialects differ (`[[:space:]]` against `\s`), so `tests/verify.sh` feeds one fixture of lines,
each built at test time to match exactly one shape or none, to the `tree` mode of the `sh` scan and
to the module, and fails when any line gets a different label. The credential-file globs are a marked
array checked against `secret-scan.md:55` to `:60` as text, the way `cite-check.mjs` is checked
today.

The shapes are not all the history must keep from the `sh` scan. Its handling of the files rule 9
names is restated too, as it applies to a history: the content of such a file is excluded from the
diff stream by pathspec and never read (`secret-scan.md:62`, `:67`); a separate name-only pass over
every commit reports each one ever added, and each one renamed or copied away to a name that no
longer matches, with `-M` and `-C` as `secret-scan.md:79` to `:83` do; a file beside a `.pub` of the
same name, and a `.sql` or `.csv` whose blob is over a megabyte, measured with `git cat-file -s` and
never opened, as `:69` to `:73` do; and a private key block followed across lines, as `:165` to
`:167` do. The fixtures of fork 6 hold each of these, so a walk that streamed an environment file
or lost one to a rename fails a check.

Rejected: parsing `secret-scan.md` at run time. It ties the script to the layout of a Markdown file,
and an edit to its prose breaks a scan in every user's project with no test in between.

### Fork 2: identities and internal hosts, and how the company's domains reach the script

`--delivery` asks `history-scan.mjs` for `--identities` as well, with the internal domains as
`--internal <domain>[,<domain>]`. The domains are not stored. Where the user did not give them,
the run proposes them from the history itself, the domains of committer and author emails and the
host of the remote, as one question with the proposal, and continues once answered; the report says
who confirmed the list. Hosts are reported when they end in a confirmed domain, when they are a
private address (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`) or a loopback name
other than `localhost`, or when they end in `.internal`, `.local`, `.corp`, or `.lan`.

What is printed on stdout, which the session reads: an email as `<redacted: email>@<domain>`, never
its local part, since a person is named by it and the domain is all triage needs; a host as
`<redacted: host>.<domain>` for a confirmed domain, or as its class, `private address` or
`internal suffix`, never in full. The owner has to find and judge each one, so the full host goes
only to the file named by `--detail <path>`, which the script writes itself into the report's
directory of fork 4 and which the session never reads; stdout gives that path and the count.

Rejected: a profile line, which `project-profile.md:180` closes to new sections, for a list one
skill reads; an override file, which holds instructions to a skill rather than data.

### Fork 3: the supply-chain scan's first version

Read from tracked files only (`git ls-files`), in the scope the run resolved:

| Ecosystem | Read | Candidates |
|-----------|------|------------|
| GitHub Actions | `.github/workflows/*.yml`, `.yaml`, and local composite `action.yml` | a third-party `uses:` not pinned to a 40-hex commit; `pull_request_target`, marked when a job checks out the pull request head; `${{ github.event.* }}` or `${{ github.head_ref }}` inside `run:`; `secrets: inherit` into a reusable workflow; no `permissions:` at workflow or job level |
| npm, pnpm, yarn | `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `.npmrc` | a dependency with an install script (`hasInstallScript` in a v2 or v3 lockfile); an unscoped dependency while `.npmrc` sets a registry other than the public one; a manifest with no lockfile; a typosquat candidate |
| Python | `requirements*.txt`, `pip.conf`, `pyproject.toml`, `poetry.lock`, `uv.lock` | `--extra-index-url` or `extra-index-url`; a requirements file without hashes or a lockfile; a typosquat candidate |

Any other ecosystem or CI system in scope is listed under `not_scanned` by name, never passed over.
A typosquat candidate is a name at edit distance one or two from a name in
`references/popular-packages.tsv` and not itself in the list. The list is a `.tsv` per CLAUDE.md
"Skill folder layout", fields `ecosystem`, `name`, `checked`, refreshed by the kit's maintainer before
a release that touches it, and the script prints the oldest `checked` date it used. YAML is read with
a small line-oriented reader inside the script, covering the shapes above and reporting a workflow it
could not read rather than guessing; no dependency is added.

### Fork 4: the delivery flag and where its report lands

`--delivery`. The report and the `--detail` file go to `<docs root>/derived/security/delivery/`,
held out of git by an ignore file holding `*` in that directory, created when missing and never
overwritten, then confirmed with `git check-ignore -q`, the pattern `shared/artifact-paths.md:144`
and `:372` already use, since `docs/derived/` is tracked unless a project ignores it (`:308`). Where
the check fails, a negation in the project's `.gitignore` overriding it, the run says so and writes
nothing; there is no temporary-directory fallback, which a reboot clears and Windows cannot make
private. The security record of the same run, if one is written, carries the verdict, the counts by
kind, and the report's path, and none of the commits, paths, domains or hosts.

An ignored file still leaves in a copy or an archive of the working directory. The report says that
how the repository is handed over is a question for its owner, and that a handover by copy or
archive deletes that directory first; `references/delivery-readiness.md` lists it with the options.

Rejected: a section of the security record, or a record of its own under `docs/records/security/`.
Either is committed to the repository being delivered, which hands the client the list of what leaks
alongside the leak. `shared/artifact-paths.md` gains the derived row.

### Fork 5: output contract and exit codes

Each script prints one JSON object:

```json
{
  "tool": "history-scan", "version": 1, "complete": true, "incomplete_reason": null,
  "scanned": { "refs": 12, "commits": 3480, "binary_skipped": 41 },
  "hits": [ { "kind": "secret", "shape": "AWS access key", "commit": "a1b2c3d", "path": "config/prod.js", "line": 14, "at_head": "removed" } ],
  "not_scanned": []
}
```

`at_head` is `present` when `HEAD` holds the same line at that path, `removed` when the path exists
and no line equals it, and `path-gone` when the path is gone. The comparison is made inside the
script; neither the line nor any hash of it is printed, since a hash of a short secret can be
reversed by trying candidates. Hit kinds: `secret`, `credential-file`, `email`, `host`;
`supply-chain-scan` uses `candidate` with a `rule` field naming the row of fork 3, its `path` and
`line`, and, for an index or a registry, its host with any user and password removed. A line of a
manifest or a configuration file is never printed, since `.npmrc`, `pip.conf` and an index URL can
carry a login; a secret shape on such a line is the `tree` scan's finding, not this script's.

The walk asks git for one form, whatever the user configured, as the `sh` scan does
(`secret-scan.md:64` to `:65`): `-c core.quotePath=false -c log.showSignature=false
-c diff.noprefix=false`, and `--no-color --no-ext-diff --no-textconv --src-prefix=a/
--dst-prefix=b/`, so a textconv driver or git-crypt cannot change what is read on one machine and
not another. Merge commits are read with `-m`, each against every parent, so a secret added while
resolving a conflict is seen; a line a merge only carries over from a parent is reported once, at the
commit that first added it.

`scanned.refs` lists the refs walked by name. A clone holds only what was fetched: a branch on the
remote never fetched, or a host's own refs such as `refs/pull/*`, is not walked, and the script
cannot know of it without the network. So the output says which remotes the clone has and when each
was last fetched, from `FETCH_HEAD` where present, and makes no claim beyond the refs it lists.

Exit `0` when the walk finished, whatever it found. Exit `3` when it ran but did not finish, a
shallow clone, a ref it could not read, a time limit, with `complete: false` and the reason. Exit `2`
when it could not run: not a repository, `git` missing, an argument it does not take. The skill
reports `3` as partial and `2` as not run, never either as clean, per step 2 of `SKILL.md`. Any other
outcome, a process the host killed, another exit status, or output that is not one complete JSON
object, is reported as not run, and nothing in it is read as a result.

### Fork 6: fixtures and tests

`tests/security-fixtures/` holds inputs that are safe to commit: workflow and manifest files, the
popular-names sample. Every git history and every secret-shaped value is built at test time in a
temporary directory by `tests/verify.sh`, values assembled from parts as `tests/verify.sh:301` does,
so no committed file holds one. The checks: the history scan finds a secret committed then deleted
as `removed`, one still present as `present`, a credential file ever committed, an email and an
internal host under `--identities`; a secret added only in a merge's conflict resolution; an
environment file committed, renamed to a name that no longer matches, then deleted; a key beside a
`.pub`; the same hits with `diff.noprefix`, `core.quotePath` and a textconv driver configured in the
fixture; no value, no local part and no full host anywhere in stdout or stderr of either script, and
no line of an environment file read; a shallow clone exits `3`; the shapes agree with the `sh` scan
(fork 1); the supply-chain scan reports each candidate of fork 3, prints an index URL carrying a
login with the login removed, and lists an unknown ecosystem under `not_scanned`. On Windows the
scripts are run by `node` with `git` from `PATH`; `tests/verify.sh` itself runs under a POSIX shell,
as today.

### Fork 7: no network

Neither script imports `http`, `https`, `net`, `tls`, `dgram`, or calls `fetch`, and
`tests/verify.sh` greps the two scripts and the module for those names. Advisory data is never
fetched: a malicious-package or vulnerability advisory comes only from a scanner the project already
runs, per phase 1's Malicious packages row.

### How the skill uses them

- Step 2 gains a History bullet: `history-scan.mjs` over every ref beside the `tree` scan, started
  in the background where the harness can run a command that way, so a host's limit on how long one
  command runs does not cut a long walk short, and otherwise in the foreground with a kill read as
  not run, per fork 5; a hit
  with `at_head: removed` or `path-gone` is Critical until its owner rotates the credential, per a
  new line in the Secrets in history row of `threat-checklist.md`, which also drops "only with a
  scanner the project already has". The record cites commit, path, line and shape.
- Step 2 gains a Supply chain bullet: `supply-chain-scan.mjs`, each candidate triaged per
  `references/supply-chain.md` against the assets of step 1, which also names what the script cannot
  see: the permissions a workflow is granted in the repository settings, self-hosted runners on a
  public repository, secrets an organisation shares.
- `--delivery` runs step 1 with the whole repository as scope, both scripts, and `--identities`,
  then the verdict of `references/delivery-readiness.md`: `NOT READY` while any secret, credential
  file, or unconfirmed internal email or host is open, and while the owner has not confirmed that
  the refs the scan lists are every ref to be handed over, since a ref the clone never fetched was
  not walked (fork 5); the client's own hosts are something to confirm, not a leak. The options it lists for the owner, none of which it runs: rotate first, hand
  over a fresh history, rewrite history, map identities.
- Without Node, each script is reported as not run, and history stays "not scanned" in the record.

### Data model and migration

`N/A`: no data store. The record shape is phase 1's.

### API contracts

The JSON of fork 5 is a contract between the scripts and the skill's references, versioned by its
`version` field. It is not a public interface of the kit.

### Backward compatibility

Additive. A record written before this change stays valid. A project whose override forbids a step
keeps forbidding it; the scripts are run by the skill's workflow and an override can remove them as
it can any automated check, with the record saying so.

### Rollout and rollback

Phases 3, 4 and 5 of the plan, each one merge, and not independent. `scripts/lib/secret-shapes.mjs`
and the documentation edits saying an `atk` skill carries scripts land with whichever of phases 3 and
4 merges first, and phase 5 calls the script of phase 3. Rollback runs in reverse: phase 5 before
phase 3; the module, and the documentation edits, only once neither script is left. Nothing persisted
depends on the scripts, so a revert leaves the workflow at "history not scanned". A revert reaches
users only as a new release of `atk`, which release-please cuts from `main`; a user who does not
update keeps the scripts they have.

### Observability

The JSON carries counts, `complete`, and `not_scanned`; the record's Checks run table quotes them.

### Security and permission impact

The scripts read the repository and nothing else, start only `git`, and send nothing. They write
stdout, and `history-scan.mjs` writes the `--detail` file of fork 2 into the ignored directory of
fork 4 and nowhere else; what stdout carries enters the session and its transcript, which is why it
holds no value, no local part and no full host. The output names commits, paths and lines of secrets, which is itself sensitive; the
delivery report's location is fork 4, and the security record keeps phase 1's redaction.

### Performance

The history walk is one `git log -p -m --all` stream with the options of fork 5, plus one
name-only pass for the files of fork 1, read line by line with no whole-history buffer.
It is linear in the size of the history's added lines; a repository of tens of thousands of commits
is expected to take minutes, and `--max-seconds <n>` stops the walk with exit `3` rather than
running unbounded.

## Traceability

| Criterion | Where the design answers it |
|-----------|-----------------------------|
| AC6 | Fork 3, `references/supply-chain.md`, Supply chain bullet |
| AC7 | Fork 1, fork 5 `at_head`, History bullet |
| AC8 | Forks 2 and 4, `references/delivery-readiness.md`, `--delivery` |
| AC9 | This design and ADR 0017 |

## Open questions

None.

### Answered

| Question | Answer | Answered by | Date |
|----------|--------|-------------|------|
| Is a time limit by default right, or only when `--max-seconds` is given? | No default limit; only `--max-seconds` stops the walk | Lam Ngoc Khuong | 2026-11-09 |

## Pre-review objections

Raised by one agent per role over the draft; simulated perspectives, not a review and not an approval.

| ID | Role | Section | Objection | Answer |
|----|------|---------|-----------|--------|
| O1 | TL, Security lens | Fork 5, Performance | The walk named no git options, so a textconv driver, git-crypt, `diff.noprefix` or `core.quotePath` changes what is read per machine, and `git log -p` prints no diff for a merge, so a secret added in a conflict resolution is missed with `complete: true` | Changed: fork 5 names the options, after `secret-scan.md:64`, and reads merges with `-m`; fork 6 tests a merge and each configuration |
| O2 | Security lens | Fork 5, Fork 4 | `--all` walks only fetched refs, so an unfetched branch or a host's `refs/pull/*` is never walked while the verdict reads complete | Changed: fork 5 lists the refs walked and the remotes with their last fetch; `--delivery` stays `NOT READY` until the owner confirms the listed refs are all that will be handed over |
| O3 | Security lens | Fork 2, Fork 5 | Stdout, which the session and its transcript read, carried full internal hosts and the confirmed domains, against criterion 2 | Changed: stdout carries `<redacted: host>.<domain>` or a class; the full host goes only to the `--detail` file in the ignored directory |
| O4 | Security lens | Fork 3, Fork 5 | A supply-chain candidate on an index URL or `.npmrc` line could print a login carried in it | Changed: a candidate gives path, line, rule and a host with any login removed, never the line; fork 6 tests it |
| O5 | TL | Fork 1 | Restating only the shapes either streams every environment file ever committed through the script or misses one renamed in history, and drops the `.pub` and large-dump rules | Changed: fork 1 restates the rule-9 handling as it applies to a history, and fork 6 tests each part |
| O6 | TL | Fork 4 | `docs/derived/` is tracked by default, so the temporary-directory fallback was the usual path, cleared on reboot and not private on Windows; an archive of the working directory would carry an ignored report | Changed: the ignore file holding `*` in the report's directory, no fallback, and the handover-by-copy warning in the report and its reference |
| O7 | TL | How the skill uses them, Performance | With no default limit, a long walk is killed by the host's own command limit and leaves no JSON, which could read as clean | Changed: the walk starts in the background where the harness can, and any outcome other than a complete JSON object with exit `0`, `2` or `3` is not run; the decision of no default limit stands |
| O8 | TL | Rollout and rollback | The three phases share a module and a dependency, so reverting one merge can break another, and a revert reaches users only as a release | Changed: the rollout names the coupling and the reverse order, and how a revert reaches users |

Agents that ran: two, the Tech Lead and the security lens, each a read-only search agent of the
harness on its default model, since the profile names no review agent model; the kit's
`atk:read-only-reviewer` agent was not available in the installed version. Roles left out: QA,
SRE and BrSE/BA, none named in `.atk/profile.md` as a reviewer of this design. Raised 10, merged 3
into one, dropped 0.

## ADR

`docs/adr/0017-security-scripts-for-history-and-supply-chain.md`.

## Reviewers

Lam Ngoc Khuong, Tech Lead, approves. No SRE or security officer is named in `.atk/profile.md`.
