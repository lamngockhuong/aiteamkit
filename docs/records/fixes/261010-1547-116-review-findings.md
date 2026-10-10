---
title: "Fix: a moved, copied, quoted or dumped rule 9 file still reached the session or diff.patch, plus the rest of the review of PR #116"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-10
updated: 2026-10-10
ticket: https://github.com/lamngockhuong/aiteamkit/pull/116 (findings B1 to B4, S1 to S19 and N1 to N19 of `docs/derived/reviews/116-261010-1334.md`)
---

# Fix: the review of PR #116

## In short

The review of PR #116 found four ways a secret could still reach the session or the diff handed to
reviewer agents. Each was reproduced on a scratch repository before anything changed:

- `mv .env env.bak` without `git mv`, then `atk:git`, printed the value;
- `atk:git` printed the staged diff after a clean scan, and that diff shows a deleted `.env`;
- a 1.1 MB CSV went whole into `diff.patch`;
- a rename to a name git quotes, `env "x".bak`, kept its content in the diff.

The scan now sees renames and copies in every mode. For `--worktree` it does this through a
throwaway copy of the index. It has a masked form for what is staged. It reads quoted paths and the
tab git appends to a path with a space. It leaves dumps and files beside a `.pub` unread, and it
names files git treats as binary. The nineteen `SHOULD FIX` and nineteen `NIT` findings are done as
well. They cover the progress log's resume answers, pull request reading in a fork, the
credential-location rule in review summaries, the read-only agent's list, an npm `_auth` shape, a
password-only `rediss://` URL, and the citation lists.

The Tech Lead chose the scope, all 42 findings, and two options. For B3, dumps and `.pub` siblings
stay files rule 9 keeps unread, and the block drops their hunks. For S15, `.npmrc` stays out of the
table and a new `_auth` shape catches its older login form. The change is still unrun on macOS awk
(section 7).

Three corrections belong to the previous record, `docs/records/fixes/261010-1010-113-deferred-review-findings.md`.
That record is already committed, so per `plugins/atk/shared/artifact-paths.md` it is not edited.
They are stated here instead and go into the pull request body:

- **S14.** It should say sixteen findings were left open and fifteen closed, S23 settled
  separately, not seventeen and sixteen.
- **S18.** "Every spawned agent reads only the masked `diff.patch`" holds for every agent the kit
  spawns. The host's clean-up capability is not one of them.
- **N16.** Its "none restates the old two-template list" missed `onboard` and `init`'s detection,
  which named only `.env.example`.

## 1. Symptom as captured

The symptoms are the findings as the review states them, on `76a6694`. The scan findings were turned
into a reproduction script with made-up values, `ZZ` plus a random number. It was run against the
block extracted from `plugins/atk/shared/secret-scan.md` at `76a6694`, before any edit:

```
B1 LEAK
B4 LEAK
B4b LEAK
B3 mask lines-with-value=100001 (d.csv: a .sql or .csv over a megabyte, ask whether it holds real data keys/deploy: a file beside a .pub of the same name )
B3 tree ok
S1 rename LEAK
S1 copy staged: rc=0 clean, 1 lines read
S6 staged: clean, 1 lines read
S7 staged: clean, 2 lines read
S15 staged: clean, 1 lines read
S4 rc=2 +x
```

`B1`: a tracked `.env` moved with `mv`, then `mask --worktree`. `B4`: `git mv .env 'env "x".bak'`,
committed, masked as a range. `B4b`: the old path quoted, `my"dir/.env`. `B3`: a committed 100,000
line CSV and `keys/deploy` beside `keys/deploy.pub`. `S1`: a two-line `.env` renamed with both
lines rewritten, and `cp .env env.bak` staged. `S6`: `conf.yml -diff` in `.gitattributes` with a
key in the file. `S7`: `rediss://:<password>@host` and `amqps://:<password>@host`. `S15`:
`//registry.npmjs.org/:_auth=<redacted: base64 login>`. `S4`: `mask --worktree` before the first
commit.

B2 is prose and was confirmed by reading `plugins/atk/skills/git/references/commit-craft.md:63-66`
on `76a6694`, together with the scan's `+`-only reporting at `secret-scan.md:140`. The other prose
findings were confirmed the same way, by reading the cited lines before editing them. Each still said
what the review quotes.

## 2. Root cause

One mechanism per group:

- **B1, S4.** The `--worktree` form ran `git diff HEAD`, which does not see an untracked file, and
  then printed every untracked file with `git diff --no-index`. Git pairs a rename only between files
  it has in one diff, so a deleted `.env` and an untracked `env.bak` were never paired. Before the
  first commit, `HEAD` does not exist and the diff failed. At `secret-scan.md:75` on `76a6694`.
- **B2.** `commit-craft.md:63-66` printed the plain `git diff --cached` on the strength of a clean
  `staged` scan. That scan reports only added lines and runs without text conversion, so a deleted
  file, a removed line and a decrypted file all reach the plain print.
- **B3.** `odd()` named dumps and `.pub` siblings, but only `mv[]` entries, the renamed files, had
  their hunks dropped, and the names were emitted after the diff. At `secret-scan.md:110` and `:126`.
- **B4.** The awk took the path from `+++ b/...` as written. Git quotes a path holding `"`, `\` or a
  control character, and appends a tab to one holding a space, so the key from `--name-status`
  never matched. `is()` also compared the old path with its quotes on. At `secret-scan.md:66` and
  `:126`.
- **S1.** `moved()` used `-M` (50%) and renames only, so a rename that rewrote half the file and any
  copy were never seen.
- **S6.** A binary file has no `---`/`+++` lines, only `Binary files ... differ`, which the awk
  printed and otherwise ignored.
- **S7, N5.** The generic URL branch required a non-empty user, and did not exclude `%`.
- **S15.** `_auth` holds none of the six name words.
- **N6, N7, N8, N19.** Case-sensitive pathspecs and `case`; a range check that accepted `main...`;
  tree mode split `path:line:content` at the first colon; `T` lacked `.env.*.example`.
- **S2 to S5, S8 to S14, S16 to S19, N1 to N4, N9 to N18.** Prose that stated less than the rule it
  cited, or more than the code did, at the lines the review names. Section 5 lists what each became.

## 3. Evidence

The reproduction above, re-run against the changed block on dash with gawk:

```
B1 ok (env.bak: renamed from .env, a file rule 9 names, not read )
B4 ok ("env \"x\".bak": renamed from .env, a file rule 9 names, not read )
B4b ok (env.bak: renamed from "my\"dir/.env", a file rule 9 names, not read )
B3 mask lines-with-value=0 (d.csv: a .sql or .csv over a megabyte, ask whether it holds real data keys/deploy: a file beside a .pub of the same name )
B3 tree ok
S1 rename LEAK
S1 copy staged: rc=1 1 lines matched, 0 lines read env.bak: copied from .env, a file rule 9 names, not read
S6 staged: clean, 1 lines read conf.yml: binary to git, not scanned
S7 staged: 2 lines matched, 2 lines read c.txt:1: connection string with a password c.txt:2: connection string with a password
S15 staged: 1 lines matched, 1 lines read .npmrc:1: npm registry login
S4 rc=0 +x
```

`S1 rename` still leaks, on purpose. The `.env` in that case had every line rewritten. Git cannot
pair a rename that keeps less than a fifth of the file, and no name-based check can either. The
limit is now named in `secret-scan.md`, beside the never-tracked case (section 7).

The same results come from dash with mawk 1.3.4, and from bash.

## 4. Why it surfaced now

`76a6694`, "fix: name the credential stores rule 9 keeps unread, report a renamed .env, and mask
every diff an agent reads". It made `mask --worktree` what `atk:git` step 1 prints, made the table
the definition of rule 9's list, and added the rename handling whose gaps B1 and B4 are. B3 and S6
were in the block before it; that commit made the block the one route on every harness.

## 4b. Recorded intent

The search covered the scan's own prose, `team-roles.md` rule 9, the review report's open
questions, and the previous record's Tech Lead decisions (S7 and S17 of #113). The open questions
were put to the Tech Lead before any change. B3: drop the hunks rather than narrow rule 9. S15: add
an `_auth` shape, `.npmrc` stays out of `F`. Scope: everything. The S7 decision of #113, a template
by any other name needs the person's word, still holds: the new `.env.*.example` and `.env.*.sample`
entries are listed suffixes, the form that decision chose.

One recorded rule changed the plan. `plugins/atk/shared/artifact-paths.md`, Record corrections,
says a record is not corrected once committed, so S14, S18 and N16 against the previous record are
corrected here and in the pull request body, not in that file.

## 5. The change

The scan block in `plugins/atk/shared/secret-scan.md` (B1 to B4, S1, S4, S6, S7, S15, N5 to N8,
N19):

- `--worktree` copies the index to a temporary directory and adds every untracked file to it
  intent-to-add. It diffs the working tree against `HEAD`, or against the empty tree before the
  first commit. Renames and copies are then seen, and the real index is never touched.
- `mask --cached` is a new form, for `commit-craft.md`.
- `moved()` lists renames at `-M20%` and exact copies through `--find-copies-harder`. It reports
  `renamed from` or `copied from`, and skips a destination that is a template.
- `names` runs before the diff, so a dump or a `.pub` sibling is in the skip set before its hunks
  arrive.
- `path()` reads git's quoted form and strips the trailing tab. The `Binary files` line is named as
  a note, not a hit.
- The URL branch allows an empty user and refuses `%`, and a new `npm registry login` shape catches
  `_auth`.
- Pathspecs are `icase`, and `is()` compares case-folded names.
- Tree mode splits on the NUL that `git grep --null` writes. A range needs a head.

Prose:

- **B2.** `commit-craft.md` prints the staged diff through `mask --cached`, and re-reads a hook's
  commit through `mask HEAD~1..HEAD` only after a clean `commit` scan.
- **B3, S2, N4.** `read-only-reviewer.md` restates the whole table, says how a search treats the
  two rows a pattern cannot express, and is rewrapped. The paragraph under the table in
  `secret-scan.md` says the same for prompts, and the three prompts that quote the table cite it.
- **S3, S8, S17, N9, N10.** In `artifact-paths.md`, every offer has three answers: resume, start
  fresh, or stop. "Leave" is gone. The exclude line names its repository, creates `info/`, is
  confirmed with `git check-ignore`, and is named in the closing message. The subject and branch
  forms are spelled out.
- **S4, N18.** `git/SKILL.md` step 1 has a route before the first commit, cites the exit codes, and
  says to write the mask to a file when untracked files are large.
- **S5.** `ticket-adapters.md` checks out first, every time, and resolves the base remote from
  `baseRepository`, by URL when no remote names it.
- **S9.** `help/SKILL.md` step 3 reads the first and last line of each progress log.
- **S10.** `help`, `spec --sync`, `security`, rule 3 of the tidy section and `tidy-pass.md` read a
  diff through the mask.
- **S11.** The one-commit and unchecked-branch forms are listed under Masking a diff, and
  `host-capabilities.md` and `review-rounds.md` cite them.
- **S12, S13.** `report-format.md` covers a named or recognised credential, and leaves a location
  out of a report the project commits.
- **S18.** In `host-capabilities.md`, the tidy pass runs by hand when the mask over the change masks
  or names anything.
- **S19.** The list of commands that print a patch unmasked now lives in one place, under Masking a
  diff, and the prompts quote it.
- **S16.** The `CLAUDE.md` check covers every new `F` and `T` entry, a staged rename, the unstaged
  `mv`, a renamed template, a copy, a template copied from `.env`, an upper-case rename, a quoted
  rename, a text dump and a `.pub` sibling, a binary file, the staged mask, a colon in a path, a
  range with no head, and the worktree mask before the first commit. In `atkx`, every
  `SECRET_FILE` alternative has a fixture each way.
- **N1, N13.** The sentence on the `sh` matcher now says it errs wide. Masking a diff covers the
  session.
- **N2, N12, N15, N17.** The citer lists of `secret-scan.md` agree in `CLAUDE.md`, the file itself,
  and `docs/codebase-summary.md` and `docs/system-architecture.md` with their `docs/vi/` mirrors.
  The summary row has its "why a hit stops the run" clause back, the architecture doc names the
  shared file, and the bug-form row names the agents.
- **N3, N14, N16.** The "has no shell" claim is scoped to Claude Code. `runtime-checks.md` cites the
  subject form. `onboard`, `init` detection and `.gitignore` name every template.
- **N11.** `static-check.mjs` matches without regard to case, `[^/]*\.pem`, and has a narrower
  comment.

Tidy step: the `mask --worktree` scan over this change masked nothing and named nothing, so
`/simplify` ran with four agents, each `atk:read-only-reviewer` reading the masked diff. Applied:

- one `mask` arm in place of three, and one error message;
- `base` computed only for `--worktree`;
- case folding once per row, in place of about 45 forks;
- one walk of the untracked files;
- a `Binary files` handler that falls through;
- the command list owned in one place, and the range forms, template list, subject form and exit
  codes cited rather than restated;
- a smaller CSV fixture and a named colon fixture;
- five prose duplicates cut.

Skipped:

- one matcher for `F` in place of the pathspec and `is()`;
- `-z` listings throughout;
- one sentence in rule 9 in place of the per-skill mask lines;
- `rev-parse` of the range head;
- moving `tr` into tree mode, since it also keeps NUL out of mawk;
- one `atkx` plugin for all names;
- blob comparison in place of `--find-copies-harder`.

Each is wider than this fix, or changes what an edge case reports.

## 6. Verified

- **The verification block.** `CLAUDE.md`, "Common verification commands", the profile's test
  command, run whole after the tidy step: 67 `OK` lines, nothing else printed, exit 0.
- **The four standalone greps.** CONV-003 (em-dash), CONV-004 (`ak:`), CONV-007 (fill) and
  CONV-011 (`atkx`, symlinks) all print nothing.
- **The scan check under each awk.** It is green on dash with gawk, dash with mawk 1.3.4, and the
  block run by bash.
- **Mutations.** Thirteen were applied one at a time to the block, and each makes the scan check
  fail. They remove: the template-destination exception, quoted-path reading, the dump and `.pub`
  drop, copy detection, the intent-to-add index, the NUL split, the binary note, the range-head
  check, case folding, `icase`, the `_auth` shape, and the empty-tree base. The case-folding
  mutation survived the first fixture set; the upper-case rename fixture was added for it.
- **The captured reproduction.** Re-run after the tidy step; section 3 is its output.
- **The index.** `git diff --cached --name-only` is empty after a `--worktree` mask; the check
  asserts it.
- **`SKILL.md` length.** Every touched `SKILL.md` is under 300 lines: `git` 275, `spec` 277,
  `help` 211.

## 7. Not verified

- **macOS awk and Git for Windows `sh`.** The block was not run on either. The new code uses
  `mktemp -d`, `git add --pathspec-from-file` (git 2.25 or later), `tr` over NUL, and an octal
  `"\001"` in awk. S23 settled the earlier block on macOS; this one needs the same run.
- **A rename that rewrites more than four fifths of a file, an edited copy, and a change past
  `diff.renameLimit`.** They still reach the diff as new files, now named in the prose as limits.
- **The cost of `--find-copies-harder` on a very large repository.** It lists every tracked file as
  a source; with `-C100%` only exact matches are computed, but the timing was not measured.
- **The prose behaviours themselves.** No skill was run against them:
  - the three resume answers;
  - the tidy-by-hand condition;
  - the base remote resolution in a fork clone;
  - `atk:help` reading progress logs;
  - the credential location left out of a committed report.
- **The `atkx` fixtures.** They show the gate reads each name, not how an installed plugin behaves.

## 8. Blast radius

Callers of the scan block, each read after the change:

- `plugins/atk/skills/git/SKILL.md` step 1 (`--worktree`) and step 2 (`staged`, `commit`).
  Exercised by the check.
- `plugins/atk/skills/git/references/commit-craft.md` (`--cached`, range). Exercised by the check.
- `plugins/atk/skills/security/SKILL.md` (`tree`, range). `tree` exercised by the check.
- `plugins/atk/shared/host-capabilities.md`, `plugins/atk/skills/review/references/review-rounds.md`,
  `plugins/atk/shared/ticket-adapters.md` (range, `--worktree`). The forms are exercised by the
  check; the skills were not run.
- `plugins/atk/shared/tidy-pass.md`, `plugins/atk/skills/spec/SKILL.md`,
  `plugins/atk/skills/help/SKILL.md`. Read, not run.
- `plugins/atkx/skills/skill-eval/scripts/static-check.mjs` `SECRET_FILE`. Exercised by the `atkx`
  behaviour block.
- Readers of rule 9's list: `plugins/atk/agents/read-only-reviewer.md`,
  `plugins/atk/shared/independent-challenge.md`, `plugins/atk/shared/team-roles.md`. Read, not run.

No public contract of a reference document changed; this repository has none, and the docs that
describe the scan (`docs/codebase-summary.md`, `docs/system-architecture.md`, both mirrors) moved
with it.

## 9. Left for later

- **Convention gaps, which the review lists for `atk:convention`.** No `CONV` row says each new `F`
  or `T` pattern carries a fixture. No row checks that the read-only agent's restated list matches
  the table.
- **The skipped tidy items in section 5.** The largest is one matcher for the rule 9 table in place
  of the pathspec and `is()`. The tree-mode keys of a quoted dump path go with it, because they
  differ from the diff-mode keys.
- **A rule 9 sentence that every diff in the session goes through the mask.** It would let the
  per-skill lines go.
- **The pull request body of #116 carries the S14, S18 and N16 corrections.** It is updated at the
  finalize step, with consent.
