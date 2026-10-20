---
title: "Fix: run feedback on design-doc, spec, git and verify finds eight gaps in the definitions"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-20
updated: 2026-10-20
ticket: none
---

# Fix: eight gaps from the run feedback of 2026-10-20

## In short

Four `atk:tailor --feedback` records written on 2026-10-20, one each for `atk:design-doc`,
`atk:spec`, `atk:git` and `atk:verify`, found eleven things. Three of them the definition already
states and the run got wrong, so nothing changes for them. The other eight are places where the
definition says nothing or says two things, and each of them made a run guess. A design was edited
thirteen times while in review although `## Output` says a design is never edited afterwards. A
trace that ran over four days read its times out of order. A merge step that was never asked for
left no line, so it reads as forgotten. A closing line with a time in front of it reads, to the
letter, as an interrupted run.

Every one of the eight is now one rule, and the review that read the change ended with no `BLOCKING` finding open. The maintainer chose each rule on 2026-10-20, in this
session, from the options below. Lam Ngoc Khuong approves the change.

The source records are ignored by git, under `docs/derived/feedback/vi/`, so this report names
them by skill and date rather than by path, per Front matter in `plugins/atk/shared/artifact-paths.md`.

## Defects

| ID | Skill feedback | Finding | Changed |
|----|----------------|---------|---------|
| DD1 | design-doc #1 | no open questions section, and no way to record answers into a design in review | yes |
| DD2 | design-doc #2 | "neither is edited afterwards" reads two ways | yes |
| DD3 | design-doc #3 | a run over several days: times out of order, answers logged as `corrected by hand` | yes |
| DD4 | design-doc #4 | written in English against the working language | no, already stated |
| SP1 | spec #1 | `--from` writes only the documents the design names | yes |
| SP2 | spec #2 | `harness` drops its version where a shell could read it | yes |
| SP3 | spec #3 | trace lines out of time order | no, already stated |
| SP4 | spec #4 | gate line without the wait | no, already stated |
| GT1 | git #1 | a step never reached leaves no line | yes |
| VF1 | verify #1 | `end:` with or without a time | yes |
| VF2 | verify #2 | one person written under two names across traces | yes |

## DD1. A design has nowhere to put its open questions

### 1. Symptom as captured

> Skill nói gì: silent. Bước 5 (`SKILL.md:110-120`) chỉ yêu cầu đặt `status: IN REVIEW` và liệt kê
> người review. Không có mục câu hỏi mở, không nêu ai phải trả lời, và không có chế độ ghi câu trả lời
> vào.

The run made its own section of ten questions and took each answer in a separate session, from
2026-10-16 to 2026-10-20.

### 2. Root cause

`plugins/atk/skills/design-doc/SKILL.md`, steps 4 and 5, asked for no open questions and no
answerer, and the skill had no mode to record an answer. `atk:plan` has both, so the gap is
between the two skills rather than in the team premise.

### 3. Evidence

`grep -n -i "open question\|--answer" plugins/atk/skills/design-doc/SKILL.md plugins/atk/skills/design-doc/references/*.md`
printed nothing before the change; the same grep on `plugins/atk/skills/plan/SKILL.md` printed lines
8, 42, 82, 98, 117, 188, 207 and 223.

### 4. Why it surfaced now

Broken since the skill was written: no run before this one had a design in review long enough to
collect answers over several sessions.

### 4b. Recorded intent

None found for open questions. Searched `design-doc/SKILL.md`, its two references, `docs/adr/`, and
the design records of the skill. The answer mode depends on DD2, which did contradict a record.

## DD2. When a design stops being editable

### 1. Symptom as captured

> `skills/design-doc/SKILL.md:125`: "Both are records of a moment and neither is edited afterwards."
> Run đã làm gì: hiểu "afterwards" là sau khi được duyệt, nên sửa bản thiết kế và ADR 13 lần trong
> lúc còn `IN REVIEW`

### 2. Root cause

`design-doc/SKILL.md:125` did not say from when, and `plugins/atk/shared/artifact-paths.md` under
Before writing said a record whose name carries the time is never updated as an existing file, and
before its commit may only have its evidence corrected. Read together, a design could not change in
review at all, which is where a design changes.

### 3. Evidence

Quoted lines, before the change: `artifact-paths.md:539-540` "A record whose file name carries the
time ... is never updated as an existing file", and `:547-549` "A correction fixes what the record
got wrong about its own evidence and never rewrites what it found". A design is named
`<date>-<ticket>-<slug>.md` (`artifact-paths.md:144`), so both apply to it.

### 4. Why it surfaced now

Broken since the skill was written; the first design kept in review across days found it.

### 4b. Recorded intent, and the conflict

The decision: `artifact-paths.md:539-553`, records are not edited. The concern: a design under
review has to change, and a new file per answer leaves a chain of designs for one decision. The
trade-off: an editable record loses "what was true at the moment" for the review period, which the
pull request history keeps anyway. Options put to the maintainer: edit in place until `APPROVED`
and supersede after, as plans already do; or keep the rule and write a new design per change.
The maintainer chose the first on 2026-10-20.

## DD3. A trace that runs over several days

### 1. Symptom as captured

> Thứ tự giờ đọc ra là 05:15 → 09:05 → 02:55 → 07:40 → … → 09:35, có hai dòng `09:05` thuộc hai
> ngày khác nhau. 13 quyết định (trả lời Q1–Q10, chọn phương án) bị ghi dưới dạng `corrected by hand`.

### 2. Root cause

`plugins/atk/shared/run-trace.md`, The shape, gives each line a time and no date, and says nothing
about a run that continues in a later session; and its event table did not say that an answer the
run asked for is a `gate` rather than a `corrected by hand`.

### 3. Evidence

Quoted lines, before the change: `run-trace.md:92` "one line per event, each opening with its time",
and the `corrected by hand` row, "what a person changed afterwards ... that person says so in the
session". Neither excludes an answer, and neither bounds a trace to one session.

### 4. Why it surfaced now

Broken since the trace was introduced in `03c655e`; this was the first run kept open over days.

### 4b. Recorded intent

`run-trace.md` holds "Six kinds, and no others", and ADRs 0004 to 0006 record no decision on dates.
Options put to the maintainer: one trace per session; a date on lines written on another day; a
seventh kind for decisions. The maintainer chose one trace per session, with answers as `gate` lines.

## SP1. `--from` writes only the documents a design names

### 1. Symptom as captured

> `261020 #2` chạy lại chỉ để thêm 3 tài liệu design không liệt kê (một tài liệu enum, một tài liệu
> feature xác thực, một tài liệu chuẩn backend về xác thực), theo yêu cầu của người chạy.

### 2. Root cause

`plugins/atk/skills/spec/SKILL.md` step 1 resolves the documents of `--from` from the design alone,
and `design-doc/SKILL.md` step 4 asked a `Contract: first` design to name only the documents
`atk:spec --from` would write. Neither looked for the others the change makes untrue.

### 3. Evidence

Quoted lines, before the change: `design-doc/SKILL.md:113-114` "this section names each of them by
path", where "them" is the documents `atk:spec --from` writes; `spec/SKILL.md` step 1 and step 3
under `--from` name no search of the docs root.

### 4. Why it surfaced now

Broken since `--from` was added; this was the first design whose change reached documents it did
not name.

### 4b. Recorded intent

None found. The open question in the feedback asked which skill owns the list; the maintainer chose
both on 2026-10-20: the design names them, and `--from` searches and asks.

## SP2. `harness` without a version

### 1. Symptom as captured

> cả `261020 #1` và `261020 #2` ghi `harness: claude-code`, không phiên bản. Run `atk:tailor` đọc các
> trace này lấy được phiên bản bằng một lệnh shell trong cùng máy.

### 2. Root cause

`run-trace.md`, the `harness` field: "where the harness says it" did not say whether asking the
harness's CLI counts.

### 3. Evidence

Quoted line, before the change, `run-trace.md:111-112`: "the harness and its version, where the
harness says it. The version is left out when it does not." In this session `claude --version`
printed `2.1.304 (Claude Code)`.

### 4. Why it surfaced now

Broken since the trace was introduced in `03c655e`.

### 4b. Recorded intent

None found. The maintainer chose the shell on 2026-10-20.

## GT1. A step the invocation never reaches

### 1. Symptom as captured

> 261020 #1 ghi bước 1 đến 4 rồi `end:`, không có dòng `step 5`.

### 2. Root cause

`run-trace.md`, the `step` row: "each numbered step ... reaches an outcome" did not say whether a
step that runs only when asked reaches one.

### 3. Evidence

Quoted lines, before the change: the `step` row of the event table, and
`plugins/atk/skills/git/SKILL.md:222`, which runs step 5 only when a pull request to merge is named.

### 4. Why it surfaced now

Broken since the trace was introduced in `03c655e`.

### 4b. Recorded intent

None found. The maintainer chose `skipped (not requested)` on 2026-10-20.

## VF1. `end:` with or without a time

### 1. Symptom as captured

> 261020 #1 kết thúc bằng `07:50 end: <đường dẫn bản ghi>`.

### 2. Root cause

`run-trace.md` said every line opens with its time, and its example wrote `end:` with none;
`plugins/atk/skills/tailor/references/feedback.md:189` counted a last line that "is not `end:`" as
interrupted, which a timed `end` line is, read to the letter.

### 3. Evidence

Quoted lines, before the change: `run-trace.md:92` "each opening with its time", `:102`
`end: no artifact: ...` with no time, and `feedback.md:189` "A trace whose last line is not `end:`".

### 4. Why it surfaced now

Broken since the trace was introduced in `03c655e`.

### 4b. Recorded intent

None found. The maintainer chose a time on `end`, with the reader accepting both forms, on
2026-10-20.

## VF2. One person under two names

### 1. Symptom as captured

> 261020 #1 của `verify` ghi một dạng ngắn của tên; 261019 #1 của `fix` và 261020 #1 của `git` ghi tên
> đầy đủ của cùng người đó.

### 2. Root cause

`run-trace.md`, the paragraph on names: "The names of the people who answered a gate stay" said
nothing about which form.

### 3. Evidence

Quoted line, before the change, `run-trace.md:178`.

### 4. Why it surfaced now

Broken since the trace was introduced in `03c655e`.

### 4b. Recorded intent

None found. The maintainer chose the Name column of the profile's Team section on 2026-10-20.

## DD4, SP3, SP4. Already stated

DD4: `plugins/atk/shared/team-roles.md:65-69` already says an artifact follows the working language,
and the line for it reached the profile after the run started. SP3: `run-trace.md:82` already says a
trace is written as the run goes. SP4: the `gate` row already asks for the wait. Each was a run that
did not follow the definition, and nothing changes for it.

## 5. The change

Each defect is fixed in the file that owns its rule, and no rule is copied into a second file.

- DD1: `design-doc/SKILL.md` step 4 ends a design with its open questions, each naming who answers it.
  A new `--answer` mode, in `references/answer-mode.md`, records the answers verbatim, in the same
  table `atk:plan --answer` uses, settles objections still `Open for <role>`, and edits only the
  sections an answer changes. It stops on an `APPROVED` design.
- DD2: `## Output` of `design-doc/SKILL.md` and a second exception under Before writing in
  `shared/artifact-paths.md` both say a design and its ADR are edited in place while `DRAFT` or
  `IN REVIEW`, and frozen from `APPROVED`. The ADR wording and the Record row of
  `docs/artifact-lifecycle.md` (en, vi) and the README now say the same.
- DD3: `shared/run-trace.md` says one trace is one session. A later session on the same artifact is
  a new run. An answer the run asked for is a `gate` line, never `corrected by hand`.
- SP1: design-doc step 4 names every reference document the change makes untrue. `spec --from` step 1
  searches the docs root and names each document found with the line that writes it, per the new
  `spec/references/affected-documents.md`. It writes only its own subject and asks nothing.
  `spec/SKILL.md` stays at 299 lines.
- SP2: `harness` takes the version from context, or else from the harness CLI's version flag. A
  refused command leaves out only the version. "What a run needs" and Cost name the command.
- GT1: a step this invocation never reaches is `skipped (not requested)`. `atk:tailor` counts those
  steps apart.
- VF1: `end` opens with its time. `atk:tailor` and `run-trace.md` read `end` and `end: interrupted`
  with or without the time.
- VF2: the names on gate lines come from the Name column of the profile's Team section. A person not
  in that table is written as `git config user.name` when they are running, and otherwise as they
  gave it.

The flag is documented in the README, both `skills-overview.md` files, both `codebase-summary.md`
files, and both `docs/flow/skill-chain.md` files. Trigger evals for `--answer` are added to
`design-doc`, with matching negative cases in `plan`. The `design-doc` description was shortened to
999 characters to stay under the limit of 1024.

The tidy pass was run by hand, per `plugins/atk/shared/tidy-pass.md`. It found two wordings to
tighten and one line to reflow, and changed nothing else.

No public contract of a product changed. The skill definitions are the kit's contract, and the docs
that describe them moved in the same change.

## 6. Verified

- `bash tests/verify.sh`: every line `OK`, after each round of fixes.
- `node plugins/atkx/skills/skill-eval/scripts/static-check.mjs` on `design-doc`, `spec`, `tailor`:
  no failure, and the `design-doc` description is at 999 of 1024.
- The em-dash, `ak:`, `atkx` and symlink checks of `CLAUDE.md` print nothing for the lines this
  change added.
- `wc -l plugins/atk/skills/spec/SKILL.md`: 299.
- `wc -c plugins/atk/shared/run-trace.md`: 17,286, which is now the figure under Cost.

The original symptoms are definition gaps, not failing commands, so no reproduction can be re-run.
Each cited line now says one thing. The reviewer checked this in round 2 for every defect except
the S10 and S11 fixes.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/feedback-batch-fix-261020.md`: 1 BLOCKING, 9 SHOULD FIX, 4 NIT.
  B1 (description over 1024) and S1 to S9 are fixed. N2 was fixed alongside S2. N1, N3 and N4 are
  left as NIT.
- Round 2, `docs/derived/reviews/feedback-batch-fix-261020-1101.md`: B1, S1 to S9 and N2 are closed.
  The fixes introduced S10 and S11, and N5 to N7 are left as NIT.
- S10 (the `APPROVED` path of `--answer`) and S11 (a stale row in `codebase-summary.md`, en and vi)
  were fixed after the last call and were not reviewed again. The loop's ceiling is two rounds.
  Lam Ngoc Khuong reads both fixes before merge.
- `atk:verify` was not offered: the repository starts nothing, per the Verify section of the profile.

## 7. Not verified

- How the trigger evals separate `design-doc --answer` from `plan --answer`. The cases were added,
  but no measurement per `docs/trigger-eval-measurement.md` was run.
- A headless run allowed only `Bash(git:*)`: whether it writes its trace with the version left out
  (S7, PLAUSIBLE).
- The S10 and S11 fixes, which no review read.
- No run of `atk:design-doc --answer` or of `atk:spec --from` with the new search has been made.

## 8. Blast radius

- Every skill writes a run trace, so the changes to `run-trace.md` reach all 25 skills. Their
  workflows only point at the file and were not edited. Exercised: none by a run; the rules were
  read by the review.
- `atk:tailor --feedback --runs` (`tailor/references/feedback.md`) was updated with the reader rules.
- `atk:plan` gains negative eval cases only.
- `shared/state-signals.md` row 1 is unchanged and still holds: one `--from` run per document.

## 9. Left for later

- NIT N1, N3 to N7 of the two reviews, for the author.
- `CLAUDE.md`, "When changing only a flag", omits `docs/flow/skill-chain.md` and the SKILL.md row of
  `codebase-summary.md`, a convention gap for `atk:convention`.
- DD3: traces already written across several days stay as they are; a trace is derived and nothing
  rewrites it.
- The feedback records for design-doc and spec carry an open question each; this change answers
  both, and their status stays with their owner, Khuong.
