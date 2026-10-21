---
title: "Fix: the second review of PR #139, where a draft design had no way forward and the gate-name rule failed on a solo profile"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: https://github.com/lamngockhuong/aiteamkit/pull/139 (findings S4, S11, S22, S27, S29 to S53, N7, N8 and N26 to N60 of the second review of PR #139, 2026-10-21 00:16)
---

# Fix: the second review of PR #139

## In short

Three cases from the second review show what was wrong. Ask `atk:design-doc` to pressure-test a
design still at `DRAFT`, and the run refused the path because it lacked `--answer`, then refused
`--answer` because that mode refuses `--challenge`. The draft could not be challenged, finished, or
revised. Run any skill in this repository, where Lam Ngoc Khuong holds both the Tech Lead and the PM
row, and a gate he answered matched two rows. "Exactly one row" failed, so the name fell through to
whatever form the session gave. And the trace example every run copies carried `flags: --no-review`
over a review that ran two rounds.

None of the three rules was wrong in what it meant. Each left a state it did not cover. A design
path is now taken up by its status: a `DRAFT` is the author's to finish, revise, challenge, or give
an ADR; `IN REVIEW` goes through `--answer`; from `APPROVED` nothing is edited. Rows that hold the
same Name count as one match, a `TBD` cell matches nobody, and names compare both ways, without case
or diacritics. The example's flags are `none`.

Lam Ngoc Khuong chose four things on 2026-10-21:

- A draft takes `--challenge` and its author's revision through its path.
- Every answer from the wrong person, and every partial one, is settled before `APPROVED`.
- The run trace no longer runs the harness's version command. This reverses the CLI fallback he
  chose for SP2 on 2026-10-20.
- An answer given in a headless prompt is still recorded as S13 chose, with the way the run started
  written into `Relayed by`.

All the other findings of the review were fixed too, the `NIT` ones included, at his word, apart from
N52 (section 9). The new length check in `tests/verify.sh` failed on `atk:catchup`, at 1,220
characters, outside this pull request; its prose was shortened and its triggers kept.

The fix was reviewed twice with `atk:review`. The first round raised three more, all fixed; the
second raised one, S4 of that review, which was fixed after the last review call and has not been
reviewed again. The pull request body (S29, N44, N45) was rewritten for `a4eb5d1` and posted at his
request after this report was written.

Lam Ngoc Khuong is the approver of this report and the change.

## 1. Symptom as captured

The findings as the review stated them, the `atk:review` run of 2026-10-21 at 00:16, base `main` @
`71ff246`, head `c122b2b`, 32 files, 1,236 lines, 0 `BLOCKING`, 29 `SHOULD FIX`, 37 `NIT`. The
review's head is the commit this run started from, so every line it cites is current.

```
S29. The pull request body still describes the change before its second commit
S30. `atk:plan --answer` settles an objection while the question it came from stays open
S31. The run-trace example runs a review its own header turned off
S32. An existing `DRAFT` design can be neither challenged, finished, nor revised
  Take "pressure-test this design from the QA and SRE side before it goes to review" on a draft
  already written. It is a positive at design-doc/evals/trigger_evals.json:16, and the run
  dead-ends: the design path without --answer is refused, pointing at --answer; --answer refuses
  --challenge; --answer stops when no question, objection or review request is open.
S33. An existing document the design names as made untrue is never signalled or listed
S34. The design's own search covers less than the `--from` search it feeds
S35. `## Scope` of `atk:design-doc` does not name `--answer`
S36. The answer-mode rules are copied between two skills and have already drifted
S37. Approving a design closes the only route for the approver's ruling
S38. "Its subject already has a design" names no matching key
S39. The `user.name` fallback is keyed on a header written before its evidence
S40. A name matches a Team row in one direction only
S41. One person holding several Team rows never matches
  This repository's own profile has Tech Lead and PM both as Lam Ngoc Khuong. When he answers a
  gate, two rows match, so "when exactly one row matches" fails.
S42. "Is part of" matches a `TBD` placeholder
S43. The midnight cut leaves its own boundary undefined
S44. A continued trace pair can be split
S45. A session resumed after a restart has no rule for the steps already done
S46. The `--from` search reads ADRs as reference documents
S47. A yes under `--from` writes into a member repository without naming it
S48. `--answer` edits the design on whatever branch is checked out
S49. A headless prompt can credit a named person with an answer they never gave
S50. The version command can be a second permission question, the bar ADR 0006 records
S51. No `atk:design-doc` eval guards against stealing intake answers
S52. `atk:spec`'s evals were not touched, though `--from` gained the search and ask
S53. Nothing checks a description against the 1,024-character limit
S4.  Still open: the design exception does not name the rules it overrides
S11. Still open: summaries say a profile-less skill reads only the `Run trace` line
S22. Still open, in part: the version command's prompt can store a wide permission
S27. Still open: the records cite review files a pull-request reader cannot reach
N7, N8, N26 to N60: the NIT table of the review, each with its file and fix
```

## 2. Root cause

One cause under nearly all of them: the rules PR #139 added each named the case that prompted them
and not the states beside it. The name rule handled one name per row and not one person on two rows,
`plugins/atk/shared/run-trace.md:206-208` at `c122b2b`. The design-path refusal handled a design in
review and not a draft, `plugins/atk/skills/design-doc/SKILL.md:87-90`. The midnight cut named its
closing line and not its time, `run-trace.md:195-199`. The `--from` search left out
`docs/records/` and not the ADR directory, `plugins/atk/skills/spec/references/affected-documents.md:20-22`.

Three have narrower causes:

- S31: the example kept the `--no-review` header it had before the review lines were added below it.
- S36: the wrong-person rule and the answer table were pasted into `atk:plan` rather than cited, so
  the `atk:design-doc` copy gained the Team Name column alone.
- S29, S27: the corrections the second record said go into the pull request body were never carried
  there.

## 3. Evidence

Quoted lines at `c122b2b`, each read against the finding that cites it:

```
plugins/atk/shared/run-trace.md:100, :107-109
  skill: implement | ... | flags: --no-review
  15:50 review: 1 BLOCKING, 2 SHOULD FIX, round 2 of 2
  15:52 step 5 review and fix: failed, review ceiling reached
plugins/atk/shared/run-trace.md:207-208
  a name given in the session matches the row whose Name it equals or is part of, when exactly one
  row matches
.atk/profile.md:93-94
  | Tech Lead | Lam Ngoc Khuong | ...
  | PM        | Lam Ngoc Khuong | ...
plugins/atk/skills/init/references/profile-template.md:125-129
  an unknown Name is written `TBD (ask <person>)`        (and "is part of" matches the person named)
plugins/atk/skills/design-doc/SKILL.md:87-88
  A design path given without `--answer` is refused in one line that points at `--answer`
plugins/atk/skills/design-doc/references/answer-mode.md:17-18
  `--challenge` is refused in one line
plugins/atk/skills/spec/references/affected-documents.md:20-22
  Records under `docs/records/` and anything under `docs/derived/` are not searched
plugins/atk/shared/run-trace.md:119-125
  or else the one its own CLI prints for its version flag, `claude --version` on Claude Code
docs/adr/0006-run-trace-written-by-the-agent-until-measured.md:28-32
  a shell command and a file write are two questions in default mode, over the limit the
  maintainer set
plugins/atk/skills/catchup/SKILL.md:3-13, through atkx:skill-eval's static check
  "id": "description-length", "status": "fail", "value": 1220, "limit": 1024
```

The rest are cited with their lines in the review; each was read at the same commit before it was
changed. One hypothesis per finding, none ruled out.

## 4. Why it surfaced now

Introduced by `7662946` ("feat: close eight definition gaps found by the 2026-10-20 run feedback")
and `be31c23` ("fix: settle the review of PR #139 on --from, --answer and the run trace"), the two
commits under review. The catchup description has been over the limit since its document mode was
added, before this pull request; no check measured it until this run added one.

## 4b. Recorded intent

Two findings reopen choices recorded on 2026-10-20, and three more needed a choice no record held.
Lam Ngoc Khuong answered on 2026-10-21:

| Finding | Recorded before | Chosen |
|---|---|---|
| S32, S37 | Design path refused without `--answer` (first review's S5) | A `DRAFT` design path takes `--challenge` and its author's revision, resuming at the first missing section; every `answered by ..., not ...` and `partial` row is settled before `APPROVED` |
| S50, S22 | SP2: the version from the context, else the CLI (`docs/records/fixes/261020-1032-none-run-trace-and-design-doc-feedback.md:297`) | No command is run; the version comes from the context or is left out. SP2's CLI fallback is reversed |
| S49 | S13: an answer in the prompt is a `gate` line named for whoever brought it (`docs/records/fixes/261020-1334-139-review-findings.md`) | S13 kept; a headless run writes the way it was started into `Relayed by` |

Scope, also his: every `SHOULD FIX` and every `NIT`, the new `tests/verify.sh` checks included, and
the pull request body after his yes.

## 5. The change

Each finding was fixed where it points, in the file that owns the rule, and cited from the rest
rather than restated:

- `plugins/atk/shared/run-trace.md`: S31 (example flags `none`), S50 and S22 (no version command,
  the version only from the context), S39 to S42 (the name rule: whole words both ways, no case or
  diacritics, rows with one Name as one match, `TBD` left out, a missing Team section as no table,
  `user.name` keyed on the person running the skill), S43 (cut at the first event after midnight,
  closing `23:59 end`, a gate across midnight in the new trace), S44 (a pair kept and removed
  together), S45 (steps done in an earlier session written `skipped (done in <run-id>)`), N31, N33,
  N35, N42. The Cost line now reads 21,028 bytes.
- `plugins/atk/skills/tailor/references/feedback.md`: S44 (`--since` keeps both halves, a missing
  half is interrupted), N39.
- `plugins/atk/skills/design-doc/SKILL.md`: S32 (a design path taken up by its status, a `DRAFT`
  finished, revised, challenged or given its ADR), S34 (the search scope cited from
  `affected-documents.md`), S35, S37 (no `APPROVED` while a wrong-person or partial row is open),
  S38 (a design matches by ticket or requirement path), N8, N26 (description at 1,023), N41, N54.
- `plugins/atk/skills/design-doc/references/answer-mode.md`: S32 (the refusals name the route),
  S37, S48 (the branch carrying the version in review), S49 (`Relayed by` holds the way a headless
  run started), N29, N30, N34, N36 (a design and ADR whose statuses disagree stop the run), N37, N38.
- `plugins/atk/skills/plan/references/answer-mode.md`: S30, S36 (the table and the wrong-person rule
  cited from `atk:design-doc`), N32, N38, N56.
- `plugins/atk/skills/spec/references/affected-documents.md`: S33 (a named existing document that
  does not cite the design is listed), S46 (ADRs not searched), S47 (member repository and branch
  named), N27, N43, N59, N60; `plugins/atk/shared/state-signals.md` row 1: S33.
- `plugins/atk/shared/artifact-paths.md`: S4, N56; `project-profile.md`: N40;
  `host-capabilities.md`: N56.
- Docs, in both languages where mirrored: S11, N7, N8, N46, N47, N48, N55, N56, in `CLAUDE.md`,
  `README.md`, `codebase-summary.md`, `skills-overview.md`, `system-architecture.md`,
  `flow/skill-chain.md` and `flow/skill-lifecycle.md`.
- Evals: S51, S52, N57, in `design-doc` and `spec`.
- `tests/verify.sh`: S53 (descriptions within 1,024), N49 (every reference has a summary row in
  both languages), N50 (the trace example shape), N51 (220 mentions in 125 pairs), N58 (a positive
  in one skill only).
- `docs/records/fixes/261020-1334-139-review-findings.md`, still `IN REVIEW`: S29's two missing
  corrections (`:24`, `:360`), S27 (review runs cited by time), N53.
- Wider than the review: `plugins/atk/skills/catchup/SKILL.md`, whose description was 1,220
  characters and failed S53's check. Its prose was shortened to 1,020; every trigger stayed, in all
  three languages.

Tidy: run by hand per `plugins/atk/shared/tidy-pass.md`, since the change is prose; it rewrapped
three lines and reworded one clause in `design-doc/SKILL.md`, and changed nothing else.

Reference documents: none moved. The change is to the kit's own skills and shared files, which are
not reference documents of any project.

Corrections to the committed record `docs/records/fixes/261020-1032-none-run-trace-and-design-doc-feedback.md`,
which is not edited: SP2's rule (`:297`) that `harness` takes the version from the CLI when the
context names none is reversed by Lam Ngoc Khuong's choice of 2026-10-21; no command is run.

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command: every line `OK`, 75 lines, five of them the
  new checks. Before the catchup fix the description check failed on it at 1,220; after, it passed.
- `node plugins/atkx/skills/skill-eval/scripts/static-check.mjs` on `design-doc` and `catchup`:
  `description-length` passes, 1,023 and 1,020.
- The standalone checks of `CLAUDE.md`: `ak:`, `atkx`, `fill:#` and symlinks print nothing; the
  em-dash check prints only the known line named in section 9.
- The reproduction: the quoted lines of section 3 no longer read as quoted. The trace example
  carries `flags: none`; the name rule counts rows holding one Name as one match; a `DRAFT` design
  path is taken up rather than refused.
- CI gate: none. `.github/workflows/` runs release-please and the labeler, and neither checks
  content, so `tests/verify.sh` run here is the whole gate.

## 6b. Reviewed

| Round | Report | Result |
|---|---|---|
| 1 | the `atk:review` run of 2026-10-21 at 00:39 | 0 `BLOCKING`, 3 `SHOULD FIX`, 5 `NIT`. S1 (the name rule matched substrings) fixed with whole words; S2 (a stale sentence keeping the version token) fixed; S3 (an approved ADR beside an open design) fixed with its own stop. N1 to N5 left as `NIT` for the author |
| 2 | the `atk:review` run of 2026-10-21 at 00:49 | S1 to S3 closed; 0 `BLOCKING`, 1 `SHOULD FIX`. S4 (the ADR check knew only `APPROVED`, not `Accepted` or `SUPERSEDED`) fixed after the last call: **not reviewed again** |

The ceiling was reached at two rounds. `atk:verify` was not offered: the loop did not come out
clean, and the repository starts nothing to run against.

## 7. Not verified

- No behaviour of the changed skills was exercised by a run: `--answer`, a `DRAFT` design path, the
  `--from` search, and the name rule are prose an agent follows, and nothing here runs an agent
  against them (N52, section 9).
- S4's fix after the last review call.
- The cross-references added, `What is searched` cited from `design-doc/SKILL.md` and the answer
  table cited from `plan/references/answer-mode.md`, were checked by reading; `tests/verify.sh`
  checks that the files exist, not the section names.

## 8. Blast radius

- Every skill that writes a `gate` line reads the name rule of `run-trace.md`: all 25, by its two
  workflow lines. Not exercised by a run.
- `atk:tailor --feedback --runs` reads traces, and gained the pair rule. Not exercised.
- `atk:help` and `atk:orchestrate` read `state-signals.md` row 1. Not exercised.
- `atk:plan --answer` now reads its table from `design-doc/references/answer-mode.md`. Not exercised.
- `atk:catchup` triggers: description prose changed, triggers unchanged; its evals parse. Trigger
  rates not measured.

## 9. Left for later

- N52: no behaviour of `--answer` or of the `--from` search is exercised by anything that runs. A
  fixture under `tests/` would only be exercised by an agent run, which nothing in the repository
  performs and no CI job exists to host. It belongs to whoever owns the repository's tooling,
  Lam Ngoc Khuong.
- The em-dash check prints `docs/records/fixes/261016-0613-review-author-replies.md:38` because
  `grep -rn ... .` prints paths without `./` here, so the filter `^\./(plans|docs)/` in `CLAUDE.md`
  never matches. That line is outside this change and its record is not edited; the check's filter is
  for whoever owns the checks.
- N1 to N5 of the first fix review, `NIT` for the author: an ADR written alone at `DRAFT` taken up
  through design steps; "Five corrections" in record 261020-1334 now listing seven; the skill-chain
  design-doc row and the codebase-summary affected-documents row lagging in both languages;
  `README.md:73` reading the `DRAFT` path as part of `--answer`; new lines past 100 columns and a
  blank line splitting the Retention list in `run-trace.md`.
- The pull request body (S29, N44, N45): rewritten for the current head on Lam Ngoc Khuong's yes,
  with the corrections to both committed records in a block of their own.
- No reference document moved: the change is to the kit's own skills and shared files, which are not
  reference documents of any project.
