---
title: "Fix: atk:review left no run trace in the kit arm of review-planted-defects"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-06
updated: 2026-11-06
ticket: "#175"
---

# atk:review left no run trace in the kit arm of review-planted-defects

## In short

In the paid bench run of 2026-11-05, the `atk:review` session wrote no run trace, and the gate check
`trace (review)` failed. The grant was not the cause: it allows every command the trace needs. The
bench's command guard refused an unrelated `git ls-files` with a message saying all of `git` is
refused, and the session believed it and never ran `git check-ignore`. It met that message at all
because it had put off the trace setup its skill tells it to do before anything else.

The bench half is fixed here: the guard now names the form it refuses, `git ls-files is not a form
of git the bench allows`, and a new no-model check, `tests/bench/check-guard.mjs`, holds that
wording and which commands pass. The skill half is issue #186, not fixed here, by the maintainer's
choice. Lam Ngoc Khuong approves this report and decides #186.

## After the last round

Round 2 fixed nothing, so there was nothing for a closing read to read.

## 1. Symptom as captured

From `docs/derived/bench/261105-1254-review-planted-defects/results.json`, kit run 1:

```
{"type":"trace","gate":true,"kitOnly":true,"skill":"review","status":"fail","detail":"no trace under docs/derived/traces/review/"}
```

Expected: a trace under `docs/derived/traces/review/` in the seed, as the `atk:security` kit arm of
`261105-1256-security-planted-defects` left (`docs/derived/traces/security/261105-0000-review-target.md`).
Environment: `claude -p`, model sonnet, both scenarios with the same `allowedTools` and the same
PreToolUse guard, `tests/bench/lib/bash-guard.mjs`. The run ended `success` in 15 turns, not at a
turn limit.

## 2. Root cause

The guard's refusal reason for a command matching no shape named only the program, so the refusal
of `git ls-files` read as a refusal of every `git` command, and the session skipped the
`git check-ignore` it was granted: `tests/bench/lib/bash-guard.mjs:93` before this change. The
session met that refusal before its trace setup only because it deferred the setup past its first
step, against `plugins/atk/skills/review/SKILL.md:58` ("before anything else") and
`plugins/atk/shared/run-trace.md` ("before its first step"); that half is #186.

Hypotheses: 2. Ruled out first: the grant lacks a command the trace needs.

## 3. Evidence

The guard's own `verdict()`, before the change, against a scratch directory:

```
"git ls-files" => git is not a command the bench allows
"git check-ignore -q docs/derived/traces/review/261105-1254-review-target.md" => ALLOWED
"git rev-parse --show-toplevel" => ALLOWED
"git config user.name" => ALLOWED
"git frobnicate" => git is not a command the bench allows
```

Write is in `allowedTools`. The security session under the same grant ran `git check-ignore` twice
and wrote both the ignore file and its trace, which rules out the grant.

The review session's tool calls, in order, from `kit-1/transcript.jsonl`: a compound command
(refused as not plain), Read `shared/run-trace.md`, `git diff --stat`, `git rev-parse --show-toplevel`,
Glob, `git diff`, six Reads of the change and its context, then `git ls-files`, refused:

```
The bench refused this command: git is not a command the bench allows. Run one plain command, with paths relative to the working directory.
```

Its next text, then the report write and the close:

```
I've finished reading the diff and its context, and I'm writing the report now. The bench has started refusing `git`, so the run trace can't be written.
```

```
- **No run trace:** the bench refused `git`, so the trace's `git check-ignore` check couldn't pass and no trace was written.
```

No `git check-ignore` call and no write under `docs/derived/traces/` appear anywhere in that
transcript. The security session met the same message four times and still ran the check, so the
message alone does not decide the outcome; the deferred setup is what put it in the way.

## 4. Why it surfaced now

The message has read this way since the guard was added in 5f6fbe8 (#172). This is the review
scenario's first paid kit run.

## 4b. Recorded intent, and the conflict when there is one

Spec: `SKILL.md:58` and `run-trace.md`, quoted in section 2. No record says the guard should name the
program rather than the refused form (searched `docs/records/design/261105-0300-atk-benchmark.md`,
`docs/adr/0014-benchmark-runner-under-tests.md`, the guard's own header). No conflict.

## 5. The change

`tests/bench/lib/bash-guard.mjs`, in `verdict()`: when no shape matches and the program has
two-word shapes (`git`, `node`, `npm`), the reason is `<program> <word> is not a form of <program>
the bench allows`; any other program keeps `<program> is not a command the bench allows`. Only the
reason text changes; which commands pass and which are refused is the same. It is the smallest
change that stops the reason from stating that every `git` command is refused.

From review finding S1: `tests/bench/check-guard.mjs`, a no-model check on 18 fixed commands,
asserting both the verdict and the reason, run by hand like `check-chain.mjs` and
`check-matcher.mjs`; the `tests/bench/` row of `docs/codebase-summary.md` and its mirror name it.

Tidy: run by hand per `shared/tidy-pass.md`; nothing changed. Reference documents: no public
contract changed; the guard's reason text is read by no file.

## 6. Verified

- `node tests/bench/check-guard.mjs`: 18 `OK`, exit 0. Against the guard as it was at `6f94dcb`,
  4 cases fail, so the check catches the old wording.
- Run as the hook, `git ls-files` exits 2 with `The bench refused this command: git ls-files is not
  a form of git the bench allows. ...`; round 1 also ran `git check-ignore -q a`, exit 0.
- Round 1 compared old and new `verdict()` on 24 commands: none changed between pass and refuse.
- `node --check` on both files passes; `bash tests/verify.sh` prints only `OK` lines.

The gate: no CI job runs anything under `tests/bench/`, so these local runs are the whole check.

## 6b. Reviewed

- Round 1: `docs/derived/reviews/tests-bench-lib-bash-guard.mjs-261106-1136.md`, 0 BLOCKING,
  1 SHOULD FIX, 1 NIT. S1 (the guard has no test): fixed, section 5. N1 (a bare `git`, `node` or
  `npm` still gets "is not a command"): left as a `NIT`.
- Round 2: `docs/derived/reviews/tests-bench-lib-bash-guard.mjs-261106-1141.md`, 0 BLOCKING,
  0 SHOULD FIX, 2 NIT. S1 confirmed closed. N1 carried. N2 (no case reaches the guard's quoting
  rules, so deleting the double-quote substitution guard passes all 18): left as a `NIT`.
- Closing read: nothing to read, round 2 fixed nothing.
- `atk:verify`: not offered; the running system is a paid bench session, which only a re-run of the
  scenario exercises, listed in section 7.

## 7. Not verified

- That a paid session now runs `git check-ignore` after such a refusal. That needs a paid re-run of
  `review-planted-defects`, and while #186 is open a run can still defer its trace.
- Earlier kit runs with no trace, `fix-planted-bug-*` among them, some of which ran
  `git check-ignore` and still left none. Their cause was not investigated and may differ.

## 8. Blast radius

- `tests/bench/lib/isolate.mjs:35`, which registers the guard as the hook for every session: it
  does not read the reason text. Exercised through the hook run in section 6.
- Every scenario's sessions see the new reason. Not exercised by a paid run.

## 9. Left for later

- #186 (`skill: review`, `bug`): the run deferred its trace setup and took an unrelated refusal as
  `git` lacking. Owner: Lam Ngoc Khuong.
- N1 and N2 of the round 2 report, both `NIT`, for Lam Ngoc Khuong to take or drop.
