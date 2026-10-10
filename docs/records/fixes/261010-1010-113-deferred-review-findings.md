---
title: "Fix: credential stores and renamed environment files reach the session and the masked diff, plus the review findings deferred from PR #113"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-10
updated: 2026-10-10
ticket: https://github.com/lamngockhuong/aiteamkit/pull/113 (findings S7, S13, S16 to S19, N3, N6, N8, N10 to N14 and N19 of the atk:review report of 2026-10-10 06:08, deferred by the Tech Lead in `docs/records/fixes/261010-0713-113-review-findings.md`)
---

# Fix: the review findings deferred from PR #113

## In short

The review of PR #113 left seventeen findings open after the first fix. This change closes sixteen
of them. The most concrete: a `.git-credentials` file or a Terraform state file could be staged and
pass the scan, because rule 9 talked about "credential stores" without listing any. A `.env` renamed
to `env.bak` went into the masked diff the reviewer agents read, every value with no secret-looking
name included. On a harness without the kit's reviewer agent, a general agent could also read the
diff through `git diff` before anything masked it. The scan's table of paths is now the one list
rule 9 cites. A renamed rule 9 file is reported and its content is never read. Every spawned agent
reads only the masked `diff.patch`, on every harness. `atk:git` and pull request reading go through
the same mask. The rest are wording and placement: the scan moved to `shared/`, the progress log is
kept out of `git add .`, a third resume answer for a log another session is still writing, a
`state-signals` row, a label. The Tech Lead chose the scope and two options (S7: list the template
suffixes and ask about any other name; S17: an exclude line rather than a new path). The Tech Lead
settled S23 separately, on macOS at `48f2f0b`; the code this change adds to the block has not been
run on that awk, and section 7 says so.

## 1. Symptom as captured

The symptoms are the findings as `docs/derived/reviews/113-261010-0608.md` states them, each with
its file and line on `48f2f0b`. The scan-facing ones were turned into a reproduction script with
made-up values. It was written after the change and run against both versions of the block, the
`HEAD` copy at `plugins/atk/skills/git/references/secret-scan.md` and the new
`plugins/atk/shared/secret-scan.md`. So the "before" column is a re-run of the old code, not a
capture taken before any edit:

```
BEFORE
FAIL S16 staged names .git-credentials
FAIL S16 staged names infra/terraform.tfstate
FAIL S16 staged names .aws/credentials
FAIL S16 staged names .kube/config
FAIL S16 staged names .pypirc
FAIL S7 .env.template scanned, not named
FAIL S16 https user:pass@ found
FAIL N13 staged reports env.bak renamed from .env
FAIL N13 mask keeps the renamed .env content out of diff.patch
FAILED: 9
```

The prose findings (S13, S17 to S19, N3, N6, N8, N10 to N12, N14, N19) were confirmed by reading the
cited lines on `48f2f0b` before editing them. Each still said what the review quotes.

## 2. Root cause

One mechanism per group:

- **S16, S7.** Rule 9 (`plugins/atk/shared/team-roles.md:95-99` on `48f2f0b`) named "credential
  stores" and "the project's equivalent" of `.env.example` and pointed at no list. The scan's `F`
  held only environment files, keys and `secrets.*`, and its template exemption only `.example` and
  `.sample`. The connection-string shape knew six database schemes, so `https://<user>:<password>@host` never
  matched.
- **N13.** The scan's content diff excludes rule 9 files by pathspec, and git applies a pathspec
  before it detects renames. A tracked `.env` moved to `env.bak` therefore showed up as a new file,
  with nothing tying it to the excluded path.
- **S13, S19.** The rule that a diff is masked before an agent reads it was written as a Claude Code
  measure (`host-capabilities.md:188-191`, `review-rounds.md:363-366`), because only that agent type
  has no shell. `atk:git` step 1, `commit-craft.md:63` and `ticket-adapters.md:161` read raw diffs
  before any scan.
- **S17, S18, N3.** The progress log was kept out of commits by instructions alone. The stale-log
  prompt had two answers, and both changed the old log. The first line and the staleness test
  assumed a branch and a commit.
- **N19.** The scan lived in one skill's `references/` while four other files read it, against the
  `CLAUDE.md` rule that a rule several skills need sits in `shared/`.
- **N6, N8, N10, N11, N12, N14.** Each one is a missing line where the review says.

## 3. Evidence

The same script after the change:

```
AFTER
OK   S16 staged names .git-credentials
OK   S16 staged names infra/terraform.tfstate
OK   S16 staged names .aws/credentials
OK   S16 staged names .kube/config
OK   S16 staged names .pypirc
OK   S7 .env.template scanned, not named
OK   S16 https user:pass@ found
OK   N13 staged reports env.bak renamed from .env
OK   N13 mask keeps the renamed .env content out of diff.patch
FAILED: 0
```

These cases are now part of the secret scan check in `CLAUDE.md`, so the verification block fails if
they regress. Removing `**/.git-credentials` from `F` makes that check fail. So does removing the
rename handling from mask mode or from commit mode.

## 4. Why it surfaced now

None of these broke on a recent commit. All of them came in with #113 (`48f2f0b`), which added rule
9, the mask mode and the progress log. The review raised them, and the Tech Lead deferred them out of
that pull request.

## 4b. Recorded intent

Each finding carried "Open, deferred by the Tech Lead" in the review report. That records the timing,
not a decision on the behaviour. The Tech Lead set this run's scope and picked the options for S7
and S17. Three decisions stand and are kept: the rule 9 standing read of an approved profile's
`Local only` line, `diff.patch` under `git rev-parse --git-path`, and the progress log path. Nothing
contradicted the requested changes.

## 5. The change

- **Scan (`plugins/atk/shared/secret-scan.md`, moved from `skills/git/references/`).**
  - `F` gains `.git-credentials`, `.pypirc`, `.aws/credentials`, `.docker/config.json`,
    `.kube/config`, `kubeconfig`, `*.tfstate` and `*.tfstate.backup`.
  - A new `T` lists the four templates (`.env.example`, `.env.sample`, `.env.template`, `.env.dist`).
    They are excluded from the named-file pathspec and scanned like any file.
  - `moved()` lists renames with `-M` before the content diff, in `staged`, `commit` and both `mask`
    forms. A new path whose old path is in `F`, and is not a template, is reported as
    `renamed from <old>, a file rule 9 names, not read`. Its hunks are dropped.
  - The connection-string shape also matches any scheme with `user:pass@`, where neither part holds
    `/` or a quote.
  - `.npmrc` is left out of `F` on purpose: projects commit it for registry settings, and its
    `_authToken=` line is already a secret-named assignment. The table says so.
- **Rule 9 and the prompts.**
  - Rule 9 names the four templates. It cites the scan's table as the list of files it keeps unread.
    It asks the person about a template under any other name, and asks for the variable names when a
    project has no template.
  - `read-only-reviewer.md` restates the list.
  - `review-rounds.md`, `host-capabilities.md` and `independent-challenge.md` quote the list into
    every prompt.
  - `diff.patch` is the route on every harness, and a spawned agent is told never to run `git diff`,
    `git show` or `gh pr diff` (S13).
- **Reading a diff (S19).**
  - `atk:git` step 1 reads `git status`, `git diff --stat HEAD`, then the hunks through
    `mask --worktree`.
  - `commit-craft.md` prints the staged diff only after a clean `staged` scan.
  - `ticket-adapters.md` reads a pull request's hunks through `mask origin/<base>...HEAD` after
    checkout, never through `gh pr diff`.
- **Progress log (`plugins/atk/shared/artifact-paths.md`).**
  - Creating a log adds `/<docs root>/derived/<skill>/*/progress.md` to `.git/info/exclude` once
    (S17).
  - A stale log gets a third answer, "still running elsewhere": a fresh log, and the old one left
    untouched (S18).
  - `(detached)` and `(none)` cover a detached `HEAD` and a repository with no commit, and staleness
    compares only what exists (N3).
  - The first line takes a pull request as `#<n>`, and `verify` uses it (N10).
- **Smaller ones.**
  - N6: the `area: agents` labeler entry and label, and a bug-report option.
  - N8: `state-signals.md` row 5 for an unfinished progress log, rows renumbered, prose references
    updated.
  - N11: `git log` stays in the session in `fix/references/investigate.md`.
  - N12: `implement` ends the log with `no artifact: sent to design-doc` on a large-gate stop.
  - N14: under `--comment`, a finding on a masked credential gets no inline comment, and the summary
    omits its location.
  - `atkx`'s `SECRET_FILE` regex brought level with the new list.
- **Docs for the move (N19).** The `CLAUDE.md` shared table and its count (18), a paragraph on why
  the scan moved, `system-architecture.md` and `codebase-summary.md` with their `docs/vi/` mirrors.

The widest single change is the move to `shared/`. It touched eleven citing lines and the docs that
count shared files, and nothing in behaviour.

Tidy step: `/simplify`, four agents, on the code lines only.
- Applied:
  - the template exclusion moved into the pathspec, so `T` is the one list;
  - `moved()` built on `run()`, splitting with `IFS` and `read`;
  - rename rows folded into the existing names rule;
  - a `templates` list in the fixtures, and a commit-mode rename assertion;
  - a shorter lookahead in `atkx`;
  - a prose note on the `sh` matcher and the untracked-copy limit.
- Skipped:
  - deriving `skip` from `f in mv` (clearer as it is);
  - a shared `moved`/`pair` wrapper (it would add `-U0` to mask mode and change what reviewers read);
  - copy detection with `-C` (widens behaviour);
  - a drift check between `atkx` and `atk` lists (new tooling);
  - merging `moved` with the names listing;
  - excluding the renamed path from `pair`.

The reproduction and the full block were re-run after it.

## 6. Verified

| Layer | Command | Result | What it proves |
|---|---|---|---|
| content | the reproduction script above | 9 of 9 pass, 9 of 9 failed on the old block | The scan-facing findings are fixed, on dash with gawk |
| content | the secret scan check in `CLAUDE.md` | `OK secret scan, 20 shapes found, 25 clean lines passed, four modes` on dash with gawk, dash with mawk 1.3.4, and bash as `sh` | Old and new cases hold under three shell and awk pairs |
| content | the same check with `**/.git-credentials` removed, then with the commit-mode rename call removed | each fails with its own assertion | The new fixtures can fail |
| all | `CLAUDE.md`, "Common verification commands", run whole | 67 `OK`, nothing else printed | Manifests, mirrors, citations (the moved file included), labeler globs (the new `area: agents` included), hooks, `atkx` fixtures and behaviours |
| all | `CONV-003`, `CONV-004`, `CONV-007`, `CONV-011` greps, `find plugins -type l` | empty | No em-dash, no other kit's command, no fill, `atk` names no `atkx`, no symlink |
| content | `wc -l` on touched `SKILL.md` files | `git` 269, `implement` 265, `review` 299 untouched | Under 300 |

There is no CI that runs any of these; `.github/workflows/` carries release-please and the labeler.

## 7. Not verified

- **macOS awk on the new code.** The Tech Lead verified S23 on macOS 26.6.2 at `48f2f0b`: the scan
  check passed with `/usr/bin/awk` (BWK 20200816) under bash 3.2 and dash. That run predates this
  change. This machine has no BWK awk, so `moved()`, the `IFS`-tab `read`, the names-rule branch and
  the broadened regex ran only on gawk and mawk 1.3.4. They use only constructs that run already
  exercised: `case`, `read`, parameter expansion, and bracket expressions like the existing shapes.
  A re-run of the `CLAUDE.md` scan check on that Mac settles it. mawk 1.3.3 and busybox awk remain
  unrun, as the S23 status says.
- **Agent prompts.** Nothing was run under Cursor or Codex to show that a general agent honours "read
  `diff.patch`, never `git diff`". It rests on the prompt, as `host-capabilities.md` says.
- **Pull request reading.** No skill run was made against a real pull request through the new
  `ticket-adapters.md` sequence. The mask over a range is covered by the check; the
  `gh pr view`/`checkout`/`fetch` steps around it are not.
- **The exclude line and the third resume answer.** These are instructions, so the only thing to run
  is a skill. One case was exercised: this run added the exclude line to this repository by hand,
  following its own instruction.

## 8. Blast radius

- `plugins/atk/shared/secret-scan.md` citers, on the new tree: `git/SKILL.md:94`, `:135`;
  `git/references/commit-craft.md:84`; `security/SKILL.md:106`;
  `security/references/threat-checklist.md:31`; `host-capabilities.md:190`, `:206`, `:230`;
  `ticket-adapters.md:71`, `:164`; `team-roles.md:98`, `:115`; `independent-challenge.md:32`;
  `review-rounds.md:400`. All resolve under the `CONV-012` citation check.
- Rule 9 readers: `plain-writing.md:63`, `project-overrides.md:183`,
  `run-cases/references/environment-safety.md:122`, `verify/SKILL.md:101`, `:213`,
  `runtime-checks.md:147`, `:277`, `init/references/detection.md:300`,
  `init/references/profile-template.md:135`. Read: none restates the old two-template list, so none
  needed a change.
- `atkx` `SECRET_FILE`: exercised by the `atkx` fixture and behaviour blocks, which still pass.
- `state-signals.md` row numbers: no other file cites a row number. Checked with grep over
  `plugins/atk/skills/help/` and `docs/`.

## 9. Left for later

- Re-run the `CLAUDE.md` scan check on macOS `/usr/bin/awk` against this change, as S23 was run
  against `48f2f0b`.
- A drift check that `atkx`'s `SECRET_FILE` matches every pattern of the scan's `F` and none of `T`.
  Proposed in the tidy pass, about ten lines in `CLAUDE.md`.
- A copy of a tracked rule 9 file (`cp .env env.bak` while `.env` stays tracked) is not reported;
  `-C --find-copies-harder` would catch it, at a cost on large ranges.
- The review's convention gaps still stand: no `CONV` row for the agent tool list or the scan
  fixtures, and none checking section-heading citations.
