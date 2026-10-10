---
title: "Fix: the secret scan leaks into the masked diff and passes files it should name, plus the documents that disagree with it"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-10
updated: 2026-10-10
ticket: https://github.com/lamngockhuong/aiteamkit/pull/113 (findings B1 to B5, S1 to S6, S8 to S12, S14, S15, S20 to S22, S24 to S28, N1, N2, N4, N5, N7, N9, N15 to N18, N20 of the atk:review report of 2026-10-10 06:08)
---

# Fix: review findings on PR #113

## In short

The review of PR #113 reproduced a secret written into `diff.patch` by the scan meant to keep it
out: a settings file whose first line held a key put that value into the hunk header of every later
change, and a private key embedded in a fixture kept every line but its first. It also found a `.env`
committed after a clean scan because it sat in a directory named `renamer/`, an empty diff handed to
the reviewers for uncommitted work, and about twenty smaller gaps between the scan and the documents
around it. A reproduction script turned 12 of those into failing cases. All 12 now pass on gawk and
mawk, and the check in `CLAUDE.md` exercises them, so a regression fails the verification block. The
Tech Lead chose which findings went into this change and answered the open question on rule 9: the
`Local only` line of an approved profile may read an environment file and prints the host alone.
Six findings that change where diffs and logs live (S7, S13, S16 to S19) and S23 stay open for a
follow-up; nothing else is left to decide.

## 1. Symptom as captured

From `docs/derived/reviews/113-261010-0608.md`, B1 to B5 and the `SHOULD FIX` items listed in the
ticket line. The reproduction script written before any change, run against head `63bf5e0`:

```
FAIL B1 no value in hunk header
FAIL B2 no key body in mask
FAIL B3 staged names similarity-svc/secrets.json
OK   B3 tree names similarity-svc/secrets.json
FAIL B3 staged names renamer/.env
OK   B3 tree names renamer/.env
FAIL B4 worktree mask carries tracked and untracked
OK   B4 worktree mask leaves the index alone
FAIL S1 deleting .env passes
FAIL shapes hit [1, 2, 3, 4, 5, 8]
FAIL shapes clean [10, 11, 12]
FAIL S6 secrets.ts is code
FAIL S5 pub sibling, id_ecdsa, dump named
FAIL S25 masked.txt paths and old-side lines 'ev/null:0: secret-named assignment, secret-named literal\nkeep.txt:2: secret-named assignment, secret-named literal\n'
OK   S26 mask without range exits 2
OK   S27 commit mode
OK   S27 tree mode
OK   S28 showSignature quiet ''
FAILED: 12
```

Shapes hit 1 to 5 and 8 are S2 (`admin@...`, `Summer-...!`), S3 (`Hunter`), S4 (two dotted keys)
and N1 (`CACHE_KEY_PREFIX` with `app:v2`). Shapes clean 10 to 12 are S8 (`Bearer $TOKEN`,
`${DB_PASS}` in a URL) and N5 (`token_limit: 10000000`). Every value in the script is made up.
S26's unknown mode was not in the first run; it exited 0 when tried by hand, as the review says.

## 2. Root cause

All in `plugins/atk/skills/git/references/secret-scan.md`, the block at lines 20 to 135:

- **B1.** The awk printed `@@` lines whole in mask mode, and git appends to them the nearest line
  above the hunk that starts at column 0, which `hits()` never saw.
- **B2.** Only the `BEGIN ... PRIVATE KEY` line matched a shape. The base64 lines after it matched
  nothing and printed as they were.
- **B3.** The names of rule 9 files were told apart from diff lines by a negated prefix list, so a
  name starting with `rename`, `similarity`, `index ` or `Binary` was taken for a diff header and
  dropped.
- **B4.** `mask` took only a revision range, and no range carries an uncommitted change.
- **S1.** The name-only listings had no `--diff-filter=d`, so a staged deletion was listed.
- **S2, S3, N5.** The enum exemption matched `tolower()` of the line and ended its word at any
  character outside `[a-z0-9_]`, so `Hunter`, `admin@...` and `Summer-...!` counted as enum words.
- **S4.** The assignment shape refused a `.` before the name, and the literal shape's bare token
  allowed only `[a-z0-9_/+-]`.
- **S5, S6.** The `.pub` and dump rows of the table were never implemented, `id_dsa` and `id_ecdsa`
  were missing, and `secrets.*` matched source files.
- **S8.** The bearer and connection-string shapes did not exclude a value starting with `$`, `{` or
  `<`.
- **S25.** The path came from `+++` alone and removed lines used the new-side counter.
- **S26.** `exit 2` for an unknown mode ran on the left of the pipe, so awk saw no input and passed.
- **B5.** `docs/codebase-summary.md:69` was edited without the guard sentence its Vietnamese mirror
  carries.

The document findings (S9 to S12, S14, S15, S20 to S22, S24, N1, N2, N7, N9, N16, N17) are text
that disagrees with the scan or with another document. Each is located in the review report.

## 3. Evidence

The reproduction in section 1, written as a script before any change and run against `63bf5e0`.
Each `FAIL` line is a direct reproduction of the finding named on it.

## 4. Why it surfaced now

Commit `63bf5e0`, "feat: keep secrets and wide reading out of the session, resume long runs, ship a
read-only reviewer agent", introduced the block, its `mask` mode and the documents around them. B5
and the `secrets.*` breadth predate it.

## 4b. Recorded intent

Searched: rule 9 in `plugins/atk/shared/team-roles.md`, the prose of `secret-scan.md`, the
reviewer rule in `plugins/atk/shared/host-capabilities.md`, and the check in `CLAUDE.md`. Each
records the behaviour the fix restores ("the diff never passes through the session unmasked", "a
failed scan is never reported as a pass", "a lower-case word"). No record defends the old behaviour.
The one decision this change needed, whether an approved profile's `Local only` command may read an
environment file, was put to the Tech Lead, who chose option 1 on 2026-10-10.

## 5. The change

The scan block is rewritten in place:

- Modes are validated before the pipeline.
- Rule 9 names follow a `#scan-names` sentinel instead of being told apart by prefix.
- `--diff-filter=d` and `-c log.showSignature=false` are added.
- `mask --worktree` diffs tracked files against `HEAD` and each untracked file against `/dev/null`.
- Mask mode prints a hunk header without its trailing text and masks every line of a private key,
  including a body line reached without its `BEGIN` line.
- The enum exemption is matched on the original case and ends only at whitespace, a quote, `,`,
  `;`, `)` or `}`.
- Dotted keys, symbol values, interpolated variables, `.pub` siblings and dumps over a megabyte are
  handled.
- `masked.txt` names a deleted file and a removed line correctly.

Around the block:

- The prose, the paths table and the examples in `secret-scan.md` now match the block.
- Rule 9 (`plugins/atk/shared/team-roles.md`) names the `Local only` check as a second standing
  read, and the profile template and `verify` step 1 say it prints the host alone.
- `host-capabilities.md`, `review-rounds.md` and the agent body say which range each review target
  uses, create the run directory with an absolute path, stop on a failed or empty mask, and read
  through Grep when Read is refused.
- Security, git, verify, the lifecycle documents, the codebase summary, the flow table, the
  architecture document, `project-overrides.md` and the `atkx` path list each carry the matching
  sentence. Both languages are updated where a mirror exists.
- The `CLAUDE.md` scan check runs all four modes and every case above, and removes its scratch
  directories. The agent check asserts `readonly: true`.

This is wider than one defect because the scan and its documents state one contract. Every changed
line traces to a listed finding.

Tidy step: `/simplify` ran four agents over the block and the check. The changes it made are these:

- `K = ci(k)`.
- `say()` is used at the tree and line sites.
- The dead `indiff` variable is removed.
- The private-key branch is flattened.
- The `hits()` regexes are built once in `BEGIN`.
- A `pair()` helper replaces four copies of the same diff pair.
- The `.pub` lookup no longer starts one git process per file.
- A `mask` range may not start with `-`, so it cannot become a git option.
- A dead fallback in `put()` is removed.

Skipped from that pass:

- Lowercasing the line before the enum exemption, which would let a capitalised word assigned to `PASSWORD` pass again.
- A single listing for `names`.
- One shared character set for `v` and `e`. The two sets differ on purpose.

## 6. Verified

- **Content layer, the scan.** The reproduction script now prints `ALL OK` on gawk 5.3.2 and on
  mawk 1.3.4, with `sh` as dash. The same cases in the `CLAUDE.md` check print
  `OK secret scan, 18 shapes found, 22 clean lines passed, four modes` on both awks. They were
  re-run after the tidy step.
- **Whole repository.** The "Common verification commands" block of `CLAUDE.md` prints 67 `OK`
  lines and nothing else, the same count as the review's run on `63bf5e0`. The greps for `CONV-003`,
  `CONV-004`, `CONV-007` and `CONV-011` print nothing.
- **Line limits.** Every `SKILL.md` stays under 300 lines; the largest are 299.
- **The change itself.** `mask --worktree` over this change exits 0: nothing in it matches a shape.
  An earlier run caught two examples written into `secret-scan.md` that would have stopped this
  commit, and they were reworded.

## 7. Not verified

- macOS `/usr/bin/awk` and busybox awk. The block runs on gawk and mawk 1.3.4 only (S23).
- PowerShell. The here-string form in `secret-scan.md` was written, not run.
- A reviewer agent reading `diff.patch` from `--worktree` inside a real `atk:implement` run. The
  form was tested on a scratch repository, not through the skill chain.
- `log.showSignature` with an actually signed commit. The check sets the option on unsigned commits.

## 8. Blast radius

Callers of the scan block, each read for the changed contract:

| Caller | Exercised? |
|--------|------------|
| `plugins/atk/skills/git/SKILL.md` step 2 (`staged`, `commit`) | Exercised by the check |
| `plugins/atk/skills/git/references/commit-craft.md` | Read only, unchanged |
| `plugins/atk/skills/security/SKILL.md` and `references/threat-checklist.md` (`tree`) | `tree` exercised; the text was changed for S10 and S20 |
| `plugins/atk/shared/host-capabilities.md` and `plugins/atk/skills/review/references/review-rounds.md` (`mask`) | Both forms exercised on scratch repositories; not exercised through `atk:review` |
| `plugins/atk/shared/team-roles.md` and `plugins/atk/shared/ticket-adapters.md` | Cite the file only; read, unchanged in behaviour |

No reference document under `docs/` describes the scan's contract beyond the codebase summary rows
updated here. This change touches no public contract outside the kit.

## 9. Left for later

- **S7.** Rule 9's "or the project's equivalent" against its own `.env.*` ban.
- **S13.** Use the masked diff on every harness, not only on Claude Code.
- **S16.** One list of credential stores, plus an `https://user:pass@` shape.
- **S17.** Move the progress log under the git directory or into `.git/info/exclude`.
- **S18.** A third answer, "still running elsewhere", when declining to resume a progress log.
- **S19.** `atk:git` step 1 and `gh pr diff` read raw diffs into the session.
- **S23.** Run the check under macOS awk.
- **N3, N6, N8, N10 to N14, N19.** As listed in the review report. N4 and N20 were done here as one-line changes beside S14 and S15.
- The convention gaps in the review report are for `atk:convention`.
