---
title: "Fix: the review of PR #148 at f3ecfb1, where nothing guarded that atk names no model"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-23
updated: 2026-10-23
ticket: https://github.com/lamngockhuong/aiteamkit/pull/148 (findings S3 and N1 to N5 of the review of PR #148, docs/derived/reviews/148-261023-0829.md)
---

# Fix: the review of PR #148 at `f3ecfb1`

## In short

Suppose a later edit writes `sonnet` into a skill as a suggested reviewer model. At `f3ecfb1`,
`bash tests/verify.sh` still printed every line `OK`, so the design's first criterion, that the kit
ships no model name, held only as long as somebody remembered to run a grep by hand (S3). It is now
a check in `tests/verify.sh`: any line under `plugins/atk`, its three plugin manifests included,
naming a Claude family (`sonnet`, `haiku`, `opus`, `fable`) or a GPT model (`gpt-5-codex`) fails
it, apart from two lines allowed by their text, a measurement in `run-trace.md` and the example
value in `project-profile.md`. `atkx:skill-eval` sets a default model of its own for trigger runs
and stays outside the check.

Five one-clause corrections ride with it: a paragraph that said "only two things" and then named a
third (N1), a clause about the model that read as applying only when memory cannot be read (N2),
`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` left out of the precedence on Claude Code (N3), a message form
that always named `Review agent model` even for a reading agent (N4), and `project-profile.md`
missing from the "Cited by" cells of `host-capabilities.md` (N5).

Lam Ngoc Khuong decided at 08:53 to put S3 in this pull request as a `tests/verify.sh` check and to
fix all five `NIT` items, and is the approver. Two review rounds ran. Round 1 found that the first
form of the check caught Claude names only (S5) and never read the manifests, which sit in
dot-directories a recursive glob skips (S6); both were fixed and round 2 closed them. Three `NIT`
items are left for Lam Ngoc Khuong: N5 in one further place, N6, and N7, Gemini, Grok and the Codex
o-series names that still pass the check while `CLAUDE.md` says the kit names no model.

## Decisions taken before the fix

Asked at 08:53, answered by Lam Ngoc Khuong, Tech Lead and approver, the open question of the review:

- S3 goes into this pull request, as a check in `tests/verify.sh` rather than a grep kept in
  `CLAUDE.md`. `plans/261023-0153-agent-model-from-profile/plan.md:121-122` puts a check of profile
  values out of scope; this is a check of the kit's own text, which that line does not cover.
- N1 to N5 are fixed in this run.

## S3. Nothing the repository runs guards "the kit ships no model name"

### 1. Symptom as captured

From the review, verbatim:

```
Suppose a later edit writes `sonnet` into a skill as a suggested value, which is how a default
starts. `bash tests/verify.sh` still prints every line `OK`.
```

### 2. Root cause

Criterion 1 of `docs/records/design/261022-0830-agent-model-from-profile.md` was verified once, by
the grep in the pull request description, and never written into `tests/verify.sh`, the only
command the repository runs as its suite.

### 3. Evidence

At `f3ecfb1`, `grep -n "sonnet\|haiku\|opus" tests/verify.sh` prints nothing, and
`grep -rniE "\b(sonnet|haiku|opus)\b" plugins/atk --exclude=CHANGELOG.md` prints exactly:

```
plugins/atk/shared/run-trace.md:302:Measured on 2026-10-14 with Claude Code 2.1.296, model sonnet, each skill run headless in a scratch
plugins/atk/shared/project-profile.md:252:  `- Reading agent model: claude-code sonnet; codex <a model ID Codex accepts>`.
```

### 4. Why it surfaced now

`f3ecfb1`, "feat: let the team choose the model of the read-only agents atk spawns", made the rule;
no check came with it.

### 4b. Recorded intent

`plan.md:121-122`: "A check in `tests/verify.sh` for the new lines. No check reads profile values
today, and the design names none." That excludes checking the values a team writes, not the kit's
text; Lam Ngoc Khuong confirmed the reading by choosing the check.

## N1. "Read only two things", then a third

### 1. Symptom as captured

`docs/flow/skill-lifecycle.md:47` at `f3ecfb1`: "and read only two things of it: its `Run trace`
line ... The three of them that spawn a read-only agent ... read a third". The same in
`docs/vi/flow/skill-lifecycle.md:47` ("chỉ đọc hai thứ") and `docs/vi/system-architecture.md:302`.

### 2. Root cause

The sentence predates the model lines; `f3ecfb1` appended a third item without dropping "only".

### 3. Evidence

The quoted lines. `docs/system-architecture.md:304` already reads "read two things of it", with no
"only".

### 4. Why it surfaced now

`f3ecfb1`.

### 4b. Recorded intent

None against: the English architecture file already has the corrected wording.

## N2. The model clause hangs on the memory sentence

### 1. Symptom as captured

`plugins/atk/shared/independent-challenge.md:41-42` at `f3ecfb1`: "Where the memory cannot be read,
run at most two agents at once and say so in the statement, which also names any model asked for."

### 2. Root cause

The clause was appended to the last sentence about the statement rather than to the sentence that
defines it.

### 3. Evidence

The quoted line; `host-capabilities.md:314-316` states the general rule, naming the model wherever
the run states what it spawns.

### 4. Why it surfaced now

`f3ecfb1`.

### 4b. Recorded intent

None against.

## N3. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` left out

### 1. Symptom as captured

`docs/system-architecture.md:131-132` at `f3ecfb1`: "Claude Code takes a `model` parameter on the
`Agent` tool, ahead of the agent's frontmatter and of `CLAUDE_CODE_SUBAGENT_MODEL`;". The same in
`docs/vi/system-architecture.md:130-131`.

### 2. Root cause

The design's harness table row was summarised without its last clause.

### 3. Evidence

`docs/records/design/261022-0830-agent-model-from-profile.md:82`: "`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`
overrides both".

### 4. Why it surfaced now

`f3ecfb1`.

### 4b. Recorded intent

The design row quoted above, which the fix now matches.

## N4. One message form names `Review agent model` for every agent

### 1. Symptom as captured

`plugins/atk/shared/host-capabilities.md:325-326` at `f3ecfb1`: "names the line in those sentences:
`the line Review agent model named <model> for this harness, which could not be passed`."

### 2. Root cause

The Required-group form was written with one kind's line name fixed in it, while the `Not needed`
forms below give both kinds.

### 3. Evidence

The quoted line. `atk:spec` is Required-soft and reads wide, so its agent takes `Reading agent model`
(`host-capabilities.md:303-312`), and copying the form names the wrong line.

### 4. Why it surfaced now

`f3ecfb1`.

### 4b. Recorded intent

None against.

## N5. `project-profile.md` missing from the "Cited by" cells

### 1. Symptom as captured

`CLAUDE.md:176`, `docs/codebase-summary.md:48`, `docs/vi/codebase-summary.md:48` at `f3ecfb1`: the
`host-capabilities.md` row lists `design-sources.md`, `independent-challenge.md` (and in `CLAUDE.md`
`review-fix-loop.md`) among shared files, and not `project-profile.md`.

### 2. Root cause

`f3ecfb1` added three citations of `host-capabilities.md` to `project-profile.md` and did not move
the three rows that list who cites it.

### 3. Evidence

`grep -c host-capabilities plugins/atk/shared/project-profile.md` prints `3`.

### 4. Why it surfaced now

`f3ecfb1`.

### 4b. Recorded intent

None against.

## 5. The change (shared)

- S3: one check in `tests/verify.sh`, after the run-trace example check, and its line in the "In
  order" list of `CLAUDE.md`. It fails on a model name under `plugins/atk` and also when either
  allowed line moves or changes, so the allowance cannot go stale silently. After review round 1,
  the pattern also takes `gpt-?\d...` (S5) and the three `.*-plugin/plugin.json` manifests are
  added by name (S6). The narrowest form: one check, no CONV row, no change to any skill.
- N1: "only" dropped in three files. N2: the model clause moved into the paragraph's first
  sentence, paragraph reflowed. N3: the `FORCE=1` clause added in both languages, paragraph
  reflowed. N4: the form names `<name>`, either line as the agent's kind takes. N5: `project-profile.md`
  added to three "Cited by" cells.
- Tidy: run by hand per `shared/tidy-pass.md`, since the diff is prose plus one embedded Python
  block; it reflowed two paragraphs and split one `CLAUDE.md` line, nothing else.
- Reference documents: no public contract of a skill changed. N4 corrects a message form in
  `host-capabilities.md`, which the shared file itself owns; no `docs/` reference document cites it.

## 6. Verified (shared)

- `bash tests/verify.sh`: 77 lines, every one `OK`, one more than at `f3ecfb1`, the new
  `OK atk names no model, 2 allowed lines`.
- The new check red, three probes, each removed or restored afterwards: `plugins/atk/shared/zz-probe.md`
  holding "Default reviewer: sonnet", then "codex runs on gpt-5-codex", and a line
  `"note": "reviews run on sonnet",` in `plugins/atk/.codex-plugin/plugin.json`. Each printed an
  `AssertionError` naming the file; `git status` shows the manifest unchanged afterwards.
- The `ak:`, `atkx`, em-dash (with `/usr/bin/grep`) and symlink checks from `CLAUDE.md` print
  nothing; `git diff --check` is clean.
- The reproduction of S3, the grep over `plugins/atk`, now runs inside the suite.
- Gate: no CI job checks content in this repository, so `tests/verify.sh` run locally is the gate.

## 6b. Reviewed (shared)

- Round 1, `docs/derived/reviews/working-tree-fix-of-pr148-review-261023-0857.md`: 0 `BLOCKING`,
  `S5` and `S6` `SHOULD FIX`, fixed as section 5 says; `N5` (one further place) and `N6` left as
  `NIT`.
- Round 2, `docs/derived/reviews/working-tree-fix-of-pr148-review-261023-0905.md`: 0 `BLOCKING`,
  0 `SHOULD FIX`; S5 and S6 closed; `N5`, `N6` carried and `N7` new, all left as `NIT`.
- Nothing was fixed after the last call. `atk:verify` was not offered: nothing in this repository
  runs as a system, so the suite is the whole runtime.
- Both rounds ran in a fresh reviewer agent with no conversation, and do not replace Lam Ngoc
  Khuong reading the change.

## 7. Not verified (shared)

- Python older than 3.8 was not tried; the check uses nothing newer than the rest of the suite.
- Model names outside the pattern, Gemini, Grok, Composer and the Codex o-series, pass the check
  (`N7`); nothing in the kit names one today.

## 8. Blast radius (shared)

- `tests/verify.sh`: the new block reads every file under `plugins/atk`; run whole, exercised.
- `CLAUDE.md:752-753`, the "In order" list: read by people, now names the check.
- The changed prose in `host-capabilities.md` and `independent-challenge.md` is read by the skills
  that spawn read-only agents; wording only, no step added or removed, exercised by no command.

## 9. Left for later

- The header comment of `tests/verify.sh` says the rules each check holds are the `CONV-NNN` rows of
  `CLAUDE.md`; the new check holds criterion 1 of the design, which has no `CONV` row. A row, if the
  team wants one, is Lam Ngoc Khuong's to add.
- The `CLAUDE.md` "Cited by" cell of `host-capabilities.md` lists `review-fix-loop.md`, and neither
  codebase summary does; that predates this pull request and is not touched here.
- No reference document is owed: the fix changes no public contract of a skill, only a check and
  wording inside shared files.
- `N5` still open in the "Cited by" header of `plugins/atk/shared/host-capabilities.md:7-16`; `N6`,
  the `tests/verify.sh` rows of both codebase summaries leave out the model check; `N7`, widen the
  pattern to Gemini, Grok, Composer and the Codex o-series, or narrow the `CLAUDE.md` sentence. All
  three `NIT`, Lam Ngoc Khuong's to decide.
