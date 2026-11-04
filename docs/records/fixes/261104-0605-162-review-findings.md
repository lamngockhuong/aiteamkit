---
title: "Fix: the findings of the review of PR #162 on atkx:doc-audit"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-04
updated: 2026-11-04
ticket: https://github.com/lamngockhuong/aiteamkit/pull/162, docs/derived/reviews/162-261104-0425.md
---

# Fix: the findings of the review of PR #162

## In short

The review of pull request #162 (`atkx:doc-audit`, review report
`docs/derived/reviews/162-261104-0425.md`, head `bb12dfb`) found 0 BLOCKING, 20 SHOULD FIX and 34
NIT. Its author, Lam Ngoc Khuong, answered every one: all 20 SHOULD FIX and 30 NIT to fix, three NIT
deferred (N3, N13, N31), and N34 fixed in its JSON while its measurement waits. Each script finding
was reproduced at `bb12dfb` before anything changed: a file name beside a citation made a good one
`stale`, a path inside Japanese text took the words before it, a missing `../` path counted as
leaving the repository, a reference link resolved from the wrong folder, a mistyped `--exclude` was
silently ignored, and `tally.mjs` refused a header with no rows and counted a repeated row twice.
The prose findings were each proved by the lines they cite. The fixes change the two scripts, six
references, `SKILL.md`, the `atk:help` row, `CLAUDE.md`, four docs in both languages, the trigger
evals, the fixtures and `tests/verify.sh`. Lam Ngoc Khuong, as Tech Lead, approves the change, and
chose, as owner of the design, that the sources file is kept beside the report rather than deleted
(S18). The team review of this fix ran twice: the first round found 11 SHOULD FIX, all fixed, and
the second round found none.

## After the last round

The second review round closed S1 to S11 of the first and raised three NIT, N32 to N34, left in
section 9. Nothing was fixed after it, so there was no closing read. One first-round finding, S5,
was answered rather than changed in the code: Lam Ngoc Khuong, as owner of the design, accepted
that `git blame --incremental` shows the team's own email addresses in the session, and
`references/claims.md` now says they are never written.

## 1 to 4b. The defects

Every defect below is broken since it was written: the code and prose came in with `bb12dfb`, this
pull request's only commit, and no path exercised the case. Section 4b, for every defect: the design
`docs/records/design/261103-1035-atkx-doc-audit.md` and ADR 0012 were searched, and no recorded
decision says the current behaviour is intended; S18's `Decision` line is answered under it.

Reproductions ran in a scratch copy of `tests/doc-audit-fixtures/cite`, made a git repository, with
`node plugins/atkx/skills/doc-audit/scripts/cite-check.mjs` and `tally.mjs` at `bb12dfb`. The
captured output, verbatim, as `(line, target, status)`:

```
docs/repro.md 13 [(1, 'src/app.js', 'stale'), (2, '詳細はsrc/app.js', 'missing'), (3, '../api/orders.md', 'outside'), (4, 'README.md', 'ok'), (5, 'index.ts', 'missing'), (6, 'src', 'ok'), (8, 'src/gone2.js', 'missing'), (11, 'src/inner.js', 'missing')]
docs/sub/x.md 2 [(1, 'README.md', 'ok')]
== S10 exclude typo
['docs/guide.md', 'docs/repro.md', 'docs/sub/x.md', 'docs/unread.md', 'docs/vi/guide.md']
exit 0
== N11
node:path:1257
      validateString(path, `paths[${i}]`);
['--bogus', 'docs/repro.md']
== S3
{ "status": "refused", "errors": [ { "line": 0, "row": "-", "reason": "no table with a Document header found" } ] }
exit 1
== S5
      "claims": 2,
== N6
{ "status": "counted", ...
```

The test document, `docs/repro.md`, line by line: 1 ``See `README.md`, the handler is at `src/app.js:3`.``,
2 `詳細はsrc/app.js:3を参照`, 3 ``The old api is `../api/orders.md`.``, 4 `[guide]: ./README.md`,
5 ``Ambiguous `index.ts:1` here.`` with two tracked `index.ts`, 6 ``A dir with a line `src/:10` here.``,
7 `A [titled](src/app.js 'T') link.`, 8 an HTML comment citing `src/gone2.js:1`, 9 to 12 a
four-backtick fence holding a three-backtick line and `src/inner.js:1`. `docs/sub/x.md` holds the
one line `[guide]: ./README.md`.

### Script defects

| ID | Symptom as captured | Root cause |
|----|---------------------|------------|
| `S3` | header-only table refused, "no table with a Document header found", exit 1 | the check tests `docs`, empty, rather than `seenHeader`, `scripts/tally.mjs:108` |
| `S5` | two identical rows give `claims: 2` | no key on Document, Line and Claim, `scripts/tally.mjs:64-106` |
| `S6` | line 1 `stale` | `identifiers()` keeps a file name with a capital and pushes `md`, `scripts/cite-check.mjs:183-184` |
| `S7` | line 2 target `詳細はsrc/app.js`, `missing` | `BARE` segments allow any letter, so a bare path runs on into CJK text, `scripts/cite-check.mjs:141`, `:147` |
| `S8` | line 3 `outside` | `lost ??= r` keeps the first base's `outside` over a later `missing`, `scripts/cite-check.mjs:226` |
| `S9` | `docs/sub/x.md` line 1 `ok` against the root `README.md` | a reference definition matches no link pattern and resolves as a bare token from the root first, `scripts/cite-check.mjs:145`, `:221` |
| `S10` | `--exclude docs/vii` walked `docs/vi`, exit 0 | excludes and `--code` are never checked to exist, `scripts/cite-check.mjs:101`, `:105-106` |
| `N1` | (read) a failing `readFileSync`, `readdirSync` or `git ls-files` throws | no guard at `scripts/cite-check.mjs:113`, `:247`, `:258`, `:273` |
| `N2` | a 12-line file reported `lines` 13 | the empty piece after the last newline counted, `scripts/cite-check.mjs:274` |
| `N4` | line 8 and line 11 counted | comments not skipped, fence closed on any three backticks, `scripts/cite-check.mjs:277-281` |
| `N5` | line 6 `ok` | the line check skips directories, `scripts/cite-check.mjs:293` |
| `N6` | line `0`, range `9-3`, evidence `at 10:30` and `host:80` counted | `scripts/tally.mjs:56`, `:68-69`, `:78` |
| `N7` | a file argument ignored, standard input read | arguments other than flags never looked at, `scripts/tally.mjs:58` |
| `N8` | line 5 `missing` | several matches by ending returned as `missing`, `scripts/cite-check.mjs:236` |
| `N9` | line 7 not a citation | `LINK` accepts double-quoted titles only, `scripts/cite-check.mjs:145` |
| `N10` | (read) `process.exit()` right after a write | `scripts/tally.mjs:46`, `:49`, `:116` |
| `N11` | trailing `--code` threw a `TypeError` stack; `--bogus` taken as a document | flag values unchecked, unknown flags pushed as inputs, `scripts/cite-check.mjs:76-78` |
| `N12` | (read) scratch files built before `try:` | `tests/verify.sh:301-316` |
| `N14` | (read) header says no cell but document and line is printed; reasons quote Type, Verdict, Second read | `scripts/tally.mjs:28`, `:79-80`, `:90` |
| `N15` | (read) header says only paths leave; a missing target is printed as written | `scripts/cite-check.mjs:25-28`, `:288` |
| `S14` | (read) a copy passes with its origin's first paragraph missing | the check tests the end only, `tests/verify.sh:270` |
| `S15` | (read) one block found passes | `assert n`, `tests/verify.sh:276` |

Rows marked (read) are proved by the quoted lines and the check the review ran; the others by the
reproduction above.

### Prose defects

Each is proved by the lines cited, read at `bb12dfb`; the explanation page of this run quotes the
repository layer for each.

- `S1`. The copied kinds table keeps "The `Evidence` field is the exception" (`references/safety.md:81`), the verdict table has an `Evidence` column (`references/full-audit.md:62`), and prompts quote the table without the notes under it (`references/safety.md:204-205`).
- `S2`. The sources file is written at `SKILL.md:113-116`, one bullet before its path is settled at `SKILL.md:117-118`.
- `S4`. A claim still unanswered after the retry keeps no second read (`references/re-verify.md:69-71`), which `tally.mjs --final` refuses (`scripts/tally.mjs:99`, `:112-113`), and nothing says what the row becomes.
- `S11`. `--source` is outside the boundary rule of `SKILL.md:102-105` and handed to agents as readable (`references/full-audit.md:26-27`).
- `S12`, `S13`. `git log -1 --no-patch -L` resolves the line in `HEAD` while the agent's lines come from disk, and depends on `--no-patch` holding with `-L` (`references/claims.md:63-65`).
- `S16`. ADR 0012 relies on `atk:help` telling `--red-team` from the challenges (`docs/adr/0012-doc-audit-checks-claims-against-sources.md:67-69`); its row says nothing of them (`plugins/atk/skills/help/references/atkx-skills.md:50`).
- `S17`. `SKILL.md:44` claims every step on Cursor; `plans/261103-1142-atkx-doc-audit/plan.md:117-118` records it unverified.
- `S18`. The sources file is "deleted when the run ends" (`SKILL.md:186`, `references/report-format.md:37-39`); the design allows no deleting command (`docs/records/design/261103-1035-atkx-doc-audit.md:411-412`). Intent: the design accepts masked text in an ignored report (`:412-414`); Lam Ngoc Khuong, its owner, chose to keep the file beside the report under the same rule, so no recorded decision is contradicted.
- `S19`. `CLAUDE.md` names doc-audit's copy of `secret-scan.md` only, while copies of `host-capabilities.md`, `independent-challenge.md` and `test-run.md` exist (`references/safety.md:66`, `:106`, `:151`, `references/red-team.md:35`, `:61`, `:73`).
- `S20`. The spawner lists (`docs/system-architecture.md:111-115`, `docs/codebase-summary.md:65`) omit doc-audit, which spawns the agent (`references/safety.md:180-181`).
- `N16`, `N21`, `N22`, `N25`. `references/report-format.md:24-27`, `:28-31`, `:36-38`, `:64-68` give no rule for `--report-dir` exiting 2, an `--out` directory, a leftover sources file, and a cheap-only report's counts.
- `N17`, `N18`, `N19`, `N20`, `N23`. `SKILL.md:78`, `:96-101`, `:102`, `:127`, `:197-199`: no outcome with nobody to ask, no root outside git, no rule for mixed inputs or two repositories, a misleading "No document found", and a done item asking for a name where a role is allowed (`references/claims.md:66-68`).
- `N24`. Two reads and the session disagreeing leave `Settled by` and `Owner` unruled (`references/re-verify.md:85-87`) while `tally.mjs` requires both (`scripts/tally.mjs:83-84`).
- `N26`. The quoted rule-9 paragraphs allow a large `.sql` on a yes (`references/safety.md:37-45`); the resolution (`:55-58`) is not in what prompts carry.
- `N27`. The model rule is stated with no `atkx` limit (`docs/system-architecture.md:126-129`) while doc-audit asks for no model (`references/safety.md:187-188`).
- `N28`, `N29`, `N32`. The help cell and the overview omit `--cheap`, `--code`, `--out` and say the cost comes "from earlier runs" (`atkx-skills.md:50`, `plugins/atk/skills/help/SKILL.md:32`, `docs/skills-overview.md:913-937`, `:923`).
- `N30`. ADR 0012 names rule 9 of `team-roles.md` as the mask's origin (`:59-60`); the markers name `test-run.md` and `secret-scan.md` (`references/safety.md:66`, `:84`).
- `N33`. `(AC1)` to `(AC7)` in `SKILL.md:199-211`, labels of a plan that does not ship.
- `N34`. No Vietnamese or Japanese negative for `atk:spec`, `atk:intake` or `atkx:skill-eval` (`evals/trigger_evals.json`).
- Also noted: `references/red-team.md:105` names the raw `--source` values where `SKILL.md:114-116` says agents read the sources file.

## 5. The change

Shared by every defect; the ID each line closes is named.

- `scripts/cite-check.mjs`: `identifiers()` skips a file name of any case and an empty last part (S6); bare paths stop at CJK text before and after them, in `BARE` only (S7); a `missing` from a base inside the repository wins over an earlier `outside` (S8); a reference definition, `[name]: target`, is a link resolved from the document's directory, a footnote excepted (S9, review S3); a missing `--exclude` or `--code`, a flag with no value and an unknown flag exit 2 (S10, N11); a document, directory or cited file that cannot be read is `unreadable` and the run goes on (N1); `counts.lines` drops the empty piece after the last newline (N2); fences close on the same character at least as long, HTML comments are skipped, a `<!--` inside a code span opens none, and `unclosedFence` and `unclosedComment` are reported (N4, review S4); a directory cited with a line is `out-of-range` (N5); a partial path several files end with is `ambiguous`, not broken (N8); link titles in single quotes and parentheses (N9); the header states what it prints (N15).
- `scripts/tally.mjs`: a header with no row is counted, not refused (S3, one-line part); a repeated Document, Line and Claim is refused (S5); a header written `**Document**` or lowercase, a one-dash separator, line `0` and a backward range refused, and a time or `host:80` is not evidence while `Makefile:12` is (N6, review S2); a file argument or a terminal on standard input exits 2, read through `isatty` so a pipe stays blocking (N7); exit codes are set, never forced (N10); the header states what it prints (N14).
- `references/safety.md`: no field is exempt from the mask, said under the copy and in the prompt rules (S1); the prompt says nobody answers the `.sql` question (N26); copy markers take `after` (S14).
- `references/re-verify.md`: an unanswered second read becomes `UNVERIFIABLE`, and a lost `CORRECT` of the sample is replaced until the sample holds (S4, review S1); disagreeing reads name both lines and an owner (N24).
- `references/claims.md`: the owner by `git blame --incremental`, which blames the file on disk and prints no line of it, with `Not Committed Yet` and an untracked document going to the role (S12, S13, review S5).
- `references/report-format.md`: the sources file is written whenever commit messages or an issue were read, masks emails and handles, is kept, and is named in the closing message (S18, review S6, S10); `--report-dir` exiting 2 prints the report (N16); an `--out` directory is refused (N21); a leftover sources file is named (N22); a cheap-only report takes its figures from `cite-check.mjs` (N25); Notes statements for second reads not returned, sources not read, owners not found, unsettled citations (S4, S11, S12, review S7).
- `references/cheap-pass.md`: paths relative to the working directory, and exit 2 shows the line and asks or stops (S10, review S8); the new fields and statuses, reference definitions, titles, comments, fences (N1, N4, N5, N8, N9); the hand check names its root (N18).
- `references/full-audit.md`, `references/red-team.md`: the `--source` paths that passed step 1 and the sources file (S11, also noted).
- `SKILL.md`: the report path settled before the sources file (S2); `--source` checked like a citation (S11); Cursor expected, not verified (S17); the sources file kept and named (S18, review S6); no path and the source-or-mirror question with nobody to ask stop with one line (N17); documents in no repository stop the run, one repository per run (N18, N19); "No document found" names what was left out (N20); a role where no name is found (N23); the cheap-only report's counts (N25); the design's AC tags removed (N33); the Definition of done covers second reads not returned (review S1).
- `plugins/atk/skills/help/references/atkx-skills.md`, `help/SKILL.md`: the flags, `--red-team` against the two challenges, Cursor unverified, "an `atkx` skill" (S16, S17, N28).
- `CLAUDE.md`: doc-audit's four copy origins and their section counts, and the paragraph on `independent-challenge.md` (S19, review S9).
- `docs/` in both languages: the spawner list and the `atkx` model exemption in `system-architecture.md` (S20, N27); the copy rows, the read-only agent and the fixtures row in `codebase-summary.md` (S19, S20, review S9); the flags and the cost range in `skills-overview.md` (N29, N32); the mask's origin in ADR 0012 (N30).
- `evals/trigger_evals.json`: six Vietnamese and Japanese negatives for `atk:spec`, `atk:intake` and `atkx:skill-eval` (N34).
- `tests/verify.sh`: a copy must start at its section or after its `after` words, and every marker must be read as a block (S14, S15); the scratch repository is built inside `try` (N12); exit 2, unclosed fence and comment, and FIFO asserts (S10, N11, review S4, S11); fixtures `cite/docs/edge.md`, `cite/docs/comment.md`, `cite/pkg/a/twin.js`, `cite/src/a/twin.js`, `tally/empty.md`, `tally/root-file.md`, and three rows of `tally/malformed.md`.

The change did not alter a public contract of `atk`; the `atkx` reference documents it changes moved with it in this diff.

## 6. Verified

- `bash tests/verify.sh`: every line `OK`, 84 lines, after the fix, after the tidy step, and after each review round.
- The reproduction of section 1 re-run: line 1 `ok`, line 2 target `src/app.js` `ok`, line 3 `missing`, line 4 `./README.md` `missing`, line 5 `ambiguous`, line 6 `out-of-range`, line 7 a citation, lines 8 and 11 not read; `docs/sub/x.md` `./README.md` `missing`; `--exclude docs/vii`, a trailing `--code` and `--bogus` exit 2; `tally.mjs` counts a header-only table, refuses the repeated row, line `0`, `9-3`, `at 10:30` and `host:80`, accepts `Makefile:12`, and exits 2 on a file argument. A 3,000-row refusal piped in parsed whole.
- The `CLAUDE.md` checks for `ak:`, `atkx` in `plugins/atk/`, symlinks and the em-dash print nothing for this change; the em-dash check prints one line in `docs/records/fixes/261016-0613-review-author-replies.md:38`, a committed record this change does not touch.
- The tidy step: `/simplify`, four cleanup agents on the two scripts and `tests/verify.sh`, the touched lines only; applied: the document read through `body()`, an unlistable directory reported by the main loop, `take()` taking matches, `pathOf(seg)`, one `resolve` per `--exclude`, one `body()` per citation, `norm(body)` once per copy block, the row key built once; skipped: moving the directory-with-a-line case out of the main loop. The prose was tidied by hand per `shared/tidy-pass.md`, with no change. The reproduction and `verify.sh` passed after it.

## 6b. Reviewed

`atk:review` ran twice on the change. Round 1, band 2 (668 changed lines, 7 agents): `docs/derived/reviews/plugins-atkx-skills-doc-audit-and-13-paths-261104-0735.md`, 0 BLOCKING, 11 SHOULD FIX, 31 NIT. All 11 SHOULD FIX were fixed, S5 by the design owner's answer. Round 2, band 1: `docs/derived/reviews/plugins-atkx-skills-doc-audit-and-13-paths-261104-0826.md`, 0 BLOCKING, 0 SHOULD FIX, 3 NIT, S1 to S11 closed. No `NIT` of either round was fixed. `atk:verify` was not offered: the profile's Verify section says nothing in this repository runs. The reviewer is still Lam Ngoc Khuong.

## 7. Not verified

- No hand run of the installed skill on any harness: the skill's prose changes were checked by reading and by the review, not by running `atkx:doc-audit` end to end. The plan's hand runs on Claude Code and Codex are still owed.
- Cursor is not verified, as `SKILL.md` now says.
- `tally.mjs --report-dir` exiting 2 needs a filesystem that ignores `chmod`, not available here.
- The pipe behaviour of N10 on macOS was not run; the fix sets the exit code instead of forcing it.
- `git blame --incremental` was run on git 2.34.1 only.

## 8. Blast radius

Callers of what changed: the cheap pass and the full audit read `cite-check.mjs` and `tally.mjs` through `SKILL.md` steps 2, 4, 5 and 8 and `references/cheap-pass.md`, `references/claims.md`; every one of them was updated in this change. `tests/verify.sh` is the only other caller of the scripts and was run. The copy check reads every `<!-- copied from` marker under `plugins/atkx/`, all eight read. `atk:help` reads `atkx-skills.md`, whose row changed; its `verify.sh` check passed. No `atk` skill calls `atkx`.

## 9. Left for later

- `N3`: widen the documents `cite-check.mjs` walks beyond `.md`, or state the `.md` limit in Scope, and count symlinked documents skipped. Doc-audit follow-up, Lam Ngoc Khuong.
- `N13`: fixtures for the unread-table rows and `tally.mjs` branches still untested, `id_rsa`, `credentials.json`, `.pgpass`, `.pypirc`, `.docker/config.json`, `kubeconfig`, `.tfstate.backup`, a large `.csv`, `.env.*.example`, `~/`, ranges, a bad type. Doc-audit follow-up, Lam Ngoc Khuong.
- `N31`: record the second pilot's figures behind the cost range, the ranking order and the records exclusion in a committed place, in neutral terms reviewed under `CONV-010`. Doc-audit follow-up, Lam Ngoc Khuong.
- `N34`: measure the new trigger negatives per `docs/trigger-eval-measurement.md`. Doc-audit follow-up, with the hand runs.
- `S3`, the part not taken: a document whose table is a header alone drops out of the counts when other documents have rows; passing `tally.mjs` the expected document paths would give it a zero entry.
- `S7`: a bare path whose own segments are in a CJK script, `notes/仕様.txt` unquoted, is no longer taken as a citation; in a link or backticks it still is.
- The design's AC7 still claims Cursor (`docs/records/design/261103-1035-atkx-doc-audit.md:55`, `:420`); the design is `APPROVED` and is not edited.
- First-round NITs of this fix's review, N1 to N31 of `docs/derived/reviews/plugins-atkx-skills-doc-audit-and-13-paths-261104-0735.md`, and second-round N32 to N34 of `-0826.md`: not fixed, per the review loop. Doc-audit follow-up, Lam Ngoc Khuong.

## 10. Findings answered

All answered by Lam Ngoc Khuong, the pull request's author. Replies are drafted at step 7 and posted only on a yes; the review has no thread on the pull request, so they go as one comment naming each ID.

| ID | Answer | Reason or place | Reply |
|----|--------|-----------------|-------|
| `S1`-`S20` | `fixed` | sections 1 to 5; S3 its one-line part, S7 in `BARE` only, S17 Cursor only, S18 the sources file kept by the design owner | not posted |
| `N1`, `N2`, `N4`-`N12`, `N14`-`N30`, `N32`, `N33` | `fixed` | section 5; N27 answered as a deliberate exemption, written in `docs/system-architecture.md` | not posted |
| `N34` | `fixed` | the JSON; the measurement deferred to the doc-audit follow-up | not posted |
| `N3` | `deferred` | doc-audit follow-up | not posted |
| `N13` | `deferred` | doc-audit follow-up | not posted |
| `N31` | `deferred` | doc-audit follow-up, neutral figures under `CONV-010` | not posted |
