---
title: "Fix: a headless atk:review spawned the read-only reviewer for band 1 with an unmasked diff, and the bench lost a turn's refusals"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-08
ticket: "#195, #196"
---

## In short

Both defects come from the bench run `review-planted-defects` of 2026-11-08, kit arm.

`#195`: a headless `atk:review` spawned `atk:read-only-reviewer` as its band 1 reviewer, and since
that agent cannot run `git`, pasted a diff it had read with `git diff -U0` into the agent's prompt,
unmasked. The rules that forbid both exist, but only in two files the session had not opened when it
spawned: the sentence in `atk:review`'s `SKILL.md` that tells it to spawn named neither the agent
type nor how the diff is read. The fix rewrites that sentence: count the lines without printing
them, spawn a general agent and never `atk:read-only-reviewer`, give it no diff, and let it read the
change through Masking a diff.

`#196`: the bench recorded no denials for the kit arm although the guard refused three commands. The
issue guessed that guard refusals never reach `permission_denials`; they do. The turn ended in two
`result` events, the second from the background reviewer's notification with an empty list, and
the runner kept only the last. The fix reads the denials of every `result` event, each tool call once,
and records a failure from any of them, not only the last; two cases in
`tests/bench/check-guard.mjs` hold both.

Lam Ngoc Khuong approves, and decides three things in section 9: whether guard refusals should still
be shown apart from permission denials, as #196 proposed; whether a run's turns and cost should read
every `result` event; and whether the paid run that would confirm #195 (review finding S2) blocks the
merge or follows it.

## After the last round

Round 2 led to no fix, so the closing read had nothing to read. S2 stays open, carried to section
9, and four `NIT` findings stay as written in the round 2 report.

## #195. A headless review reads the diff unmasked and hands band 1 to the read-only reviewer

### 1. Symptom as captured

From #195, verbatim:

> 1. It read the change with `git diff --numstat main...review-target`, then `git diff -U0 main...review-target`, a command that prints the patch unmasked. "Masking a diff" in `plugins/atk/shared/secret-scan.md` forbids it: a diff an agent needs is written through the `mask` scan to `diff.patch`, and never passes through the session unmasked.
> 2. It spawned one agent, `atk:read-only-reviewer`, as the band 1 reviewer. `plugins/atk/shared/host-capabilities.md` and `plugins/atk/skills/review/references/review-rounds.md` say every agent the review spawns is that type except the band 1 reviewer, which runs every round itself and needs a shell. No `diff.patch` was written for it.

Environment: bench run of 2026-11-08, sonnet, headless `claude -p`, `--runs 1`, kit arm, with the
masking path granted. Expected: a general agent spawned with the target and the paths, reading the
change through the scan. Actual: the read-only agent, with the diff in its prompt.

### 2. Root cause

The one sentence that makes the session spawn the band 1 reviewer, "spawn the reviewer agent at once
with the target and the paths" at `plugins/atk/skills/review/SKILL.md:60-62` before this change,
names neither the agent type nor how the diff reaches the agent, and "at once" sends the session to
spawn before it opens any reference. The rules it lacked are at
`plugins/atk/skills/review/references/review-rounds.md:398-406,452-459` and
`plugins/atk/shared/host-capabilities.md:265-290`, which the session never read. Left to itself, it
took the agent whose description says "Spawned by atk:review", found that agent had no shell, and
filled the gap with the diff.

### 3. Evidence

The session's own tool calls, from `docs/derived/bench/261108-0908-review-planted-defects/kit-1/transcript.jsonl`
(line number, which context, tool, target):

```
7   main Bash ls -a . .atk .atk/overrides 2>&1 | head -40; git diff --stat main...review-target; ...
8   main Read /tmp/atk-bench-B1C9C8/kit/shared/run-trace.md
13  main Bash git diff --numstat main...review-target
...
38  main Read /tmp/atk-bench-B1C9C8/kit/.claude-plugin/plugin.json
50  main Bash git diff -U0 main...review-target
57  main Agent {"description": "Band 1 review of review-target", "subagent_type": "atk:read-only-reviewer", ...
97  sub  Read /tmp/atk-bench-B1C9C8/kit/skills/review/references/review-rounds.md
115 main Write /tmp/atk-bench-B1C9C8/seed/docs/derived/reviews/review-target-2026-11-08.md
```

Before the spawn the session read `run-trace.md` and `plugin.json` and nothing else of the kit;
`review-rounds.md` was first opened by the spawned agent, at line 97. The prompt at line 57 reads
"You can't run git, so the diff is below", then "DIFF (`git diff -U0 main...review-target`):"
followed by the change. Because the agent cannot write, the session wrote the report itself (line
115).

### 4. Why it surfaced now

The spawn sentence and the read-only agent both arrived in `48f2f0b` and `92e1a54` on 2026-10-10
(#113, #116), and the sentence has been incomplete since. It surfaced in the first review run since
#174 that a person read for the masking path; earlier runs either wrote no trace or were not read
for it.

### 4b. Recorded intent, and the conflict when there is one

Spec: the rules are recorded, at the lines named in section 2, and say what the fix now says. No
record keeps the spawn sentence short of them; `CLAUDE.md`, "Skill folder layout", asks for a
reference to be pointed at from the workflow step that needs it. #195's second open question asks
whether `SKILL.md` should name the masked diff at the step that counts the lines; this fix answers
it yes, which Lam Ngoc Khuong approves or changes in review. No conflict.

## #196. A refusal by the bench's guard is missing from a run's denials

### 1. Symptom as captured

From #196, verbatim:

> The kit arm's `denials` in `results.json` is empty, yet its transcript shows `tests/bench/lib/bash-guard.mjs` refusing three Bash calls: a compound command (`ls ... | head; git diff ...`), `rm docs/derived/traces/review/.gitignore`, and `date +%y%m%d-%H%M`. A guard refusal reaches the session as a tool result reading `PreToolUse:Bash hook error: [...] The bench refused this command: <reason>`, while `denials` holds only what Claude Code's own permission check refused.

Environment: the same run. Expected: three denials for the kit arm. Actual: none, in both
`kit-1/run.json` and `results.json`.

### 2. Root cause

One call to `claude -p` printed two `result` events, and `turn()` kept the last one: the line
`if (ev.type === 'result') result = ev;` and then `out.denials = result.permission_denials || [];`, at
`tests/bench/lib/session.mjs:62,67` before this change. The first event carried the three refusals;
the second, from the background reviewer agent's notification, carried an empty list. The issue's
own guess, that guard refusals never reach `permission_denials`, is wrong: they reach it.

### 3. Evidence

The two events, from `kit-1/transcript.jsonl`:

```
121 {"num_turns": 17, "total_cost_usd": 0.427394, "origin": null, "permission_denials": [
      {"tool_name": "Bash", "tool_use_id": "toolu_015NE3n3d5y5A1uncNxb7gGj", "tool_input": {"command": "ls -a . .atk .atk/overrides 2>&1 | head -40; ..."}},
      {"tool_name": "Bash", "tool_use_id": "toolu_01RwVd4fCxdKQ3fDgwHiSeec", "tool_input": {"command": "rm docs/derived/traces/review/.gitignore"}},
      {"tool_name": "Bash", "tool_use_id": "toolu_01PMLcJM9fcUAyqDdkq4M7Yp", "tool_input": {"command": "date +%y%m%d-%H%M"}}]}
122 {"num_turns": 3, "total_cost_usd": 0.427394, "origin": {"kind": "task-notification", ...}, "permission_denials": []}
```

The red test, added to `tests/bench/check-guard.mjs` before the fix:

```
FAIL denials: every result event of a call, each refusal once
  expected ["t1","t2"]
  got      ["t2"]
```

And `readStream` run on the kept transcript: 0 denials before the fix, 3 after.

### 4. Why it surfaced now

Broken since it was written, in `292f08b` (#171, 2026-11-05). A turn ends in a second `result`
event only when a background agent's notification arrives after it, and this was the first run read
for its denials where the kit spawned one.

### 4b. Recorded intent, and the conflict when there is one

Spec: #196's proposal, for the Tech Lead to accept or change, is to collect guard refusals from the
transcript and show them apart. No record says the runner keeps only the last `result` event. The
fix removes the loss, which was the defect; the split the proposal asked for is a separate choice,
in section 9. No conflict.

## 5. The change

`#195`: `plugins/atk/skills/review/SKILL.md:60-63`, the sentence that spawns the band 1 reviewer, now
says to count the changed lines without printing them, to spawn a general agent and never
`atk:read-only-reviewer`, to give it the target and the paths and no diff, and that it reads the diff
through Masking a diff in `shared/secret-scan.md`. The rules were already recorded; this carries them
to the line the session acts on. Form: add a rule at the step that spawns, since rule 5's default
gave a wrong answer whose consequence is a secret shown (consequence 2). The first paragraph of step
3 was rewrapped, whitespace only, to keep the file at 299 lines.

`#196`: `tests/bench/lib/session.mjs` gains `readStream`, the stream parsing `turn()` did inline,
moved out so a case can call it. It collects the denials of every `result` event, keyed by
`tool_use_id`, and `failed`, the subtype of the first event that failed, which `turn()` now uses for
its error. Cost, turns and the closing text still come from the last event. Two cases in
`tests/bench/check-guard.mjs`, which `tests/verify.sh` runs, and three header lines naming them.

Tidy: the host's `/simplify` with four agents removed a duplicate `result` variable, a
`JSON.stringify` fallback no denial needs (every denial in every kept transcript carries
`tool_use_id`), extra fixture fields, a comment repeating the header, and a duplicated expected
literal. Reproduction and checks re-run after it.

Reference documents: no public contract changed. `docs/system-architecture.md:113` and its mirror
already say the band 1 reviewer is the one agent of `atk:review` that is not
`atk:read-only-reviewer`; the skill was the one that did not say so where it acted.

Review fixes: S1 (round 1), the count command named in the first version, `git diff --numstat`,
miscounted untracked and staged files and named no range; form: correct the false sentence, the
command removed and "without printing them" kept. S3 (round 1), a failure in an earlier `result`
event was masked by a later success; fixed as above, with its case red before the fix.

## 6. Verified

- `bash tests/verify.sh` (the profile's Test command): 88 lines, every one `OK`, after each round.
  It runs `check-guard.mjs` and `check-matcher.mjs`, so the two new cases ran there.
- The red cases: `denials: every result event of a call, each refusal once` failed with
  `got ["t2"]` before the fix; `failure: an earlier result event that failed is kept` failed with
  `got undefined`. Both pass after.
- The reproduction: `readStream` on `kit-1/transcript.jsonl` gave 0 denials before and 3 after,
  the three commands of #196; `bare-1` still gives its 1.
- `node tests/bench/check-chain.mjs` exits 0 (it runs the record and report code that reads
  `denials`). `check-matcher.mjs` exits 0.
- `CLAUDE.md` checks: the `ak:` grep prints nothing; no em-dash in the diff;
  `plugins/atk/skills/review/SKILL.md` is 299 lines.
- Gate: no CI job runs content checks in this repository (`CLAUDE.md`, "Review checklist"), so
  `tests/verify.sh` is the gate and was run.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-tests-bench-lib-session.mjs-tests-bench-check-guard.mjs-261108-0939.md`: 0 BLOCKING, 3 SHOULD FIX, 3 NIT. S1 fixed, S3 fixed, S2 carried forward to
  section 9 (needs a paid bench run), N1 to N3 left as `NIT`.
- Round 2, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-tests-bench-lib-session.mjs-tests-bench-check-guard.mjs-261108-0946.md`: 0 BLOCKING, 1 SHOULD FIX (S2, carried), 4 NIT (N1 to N3 carried, N4 new: the
  header of `check-guard.mjs` does not name the failed-event case). S1 and S3 closed.
- Closing read: nothing to read, since round 2 led to no fix.
- Both rounds ran in one general agent as the band 1 reviewer, read the change through the
  `--worktree` scan, and were given no conversation. `atk:verify` was not offered: this repository
  starts nothing (profile, Verify section).

## 7. Not verified

- `#195`: whether a headless `atk:review` now spawns a general agent and reads the diff through the
  scan. Only the paid bench scenario `review-planted-defects` shows it (S2).
- `#196`: `turn()` itself, which spawns `claude`, ran in no check; `readStream` did, on fixtures and
  on the kept transcripts.

## 8. Blast radius

- `tests/bench/run.mjs:166-176`, the one caller of `turn()`: reads `cost`, `turns`, `denials`,
  `toolUses`, `lastText`, `error`, all still returned. Exercised by no check (it starts paid
  sessions); read.
- `tests/bench/lib/checks.mjs:285-291`, `traceCheck`, reads `denials` through `traceDenied`: a guard
  refusal of a trace command now counts as `grant-error`, as a permission refusal did. Exercised by
  `check-chain.mjs` only for the record shape.
- `tests/bench/lib/report.mjs:111,195`, counts `denials`: the count now includes guard refusals.
  Exercised by `check-chain.mjs`.
- `plugins/atk/skills/review/SKILL.md:60-63` is read by every `atk:review` run, and by `atk:fix`,
  `atk:implement` and `atk:orchestrate` through their review loops. Read by both review rounds; not
  run.

## 9. Left for later

- #196: the same cause also drops `num_turns` of every `result` event but the last (17 of 20 in
  this run). Both events carried the same `total_cost_usd`, 0.427394, and nothing in the stream says
  whether that is the session's total or the first part's alone, so whether the bench under-counts a
  turn's cost is unsettled. Summing either changes what the report's rows mean, so neither is done
  here. Lam Ngoc Khuong decides, after a run that spawns a background agent is read for it.
- #195: no run has yet shown a headless `atk:review` spawning a general agent and reading the diff
  through the scan. The paid bench scenario `review-planted-defects` is the check; the maintainer
  runs it by hand (review finding S2).
- #196: whether guard refusals should be shown apart from permission denials in the report, as the
  issue proposed. Both now reach `denials`, and a guard refusal can be told apart only by its tool
  result's text. Lam Ngoc Khuong decides.
- #195: the description of `plugins/atk/agents/read-only-reviewer.md` says "Spawned by atk:review
  for its rounds and sweep", which is true but draws a session that has not read the band rule.
  Whether to name the band 1 exception there is a change to a trigger text and needs its own
  measurement.
- #195: whether Claude Code's own command check refuses the two-line scan in `-p`, left open by
  #195, is still unsettled until a run spawns the band 1 reviewer as a general agent.
