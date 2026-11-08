---
title: "Fix: a run gave up its trace on git from the refusal of a git command the trace never runs"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-08
ticket: "#186"
---

## In short

In a headless benchmark run, `atk:review` saw an unrelated `git ls-files` refused, decided that all
of `git` was refused, and wrote no run trace without ever running the `git check-ignore` it was
allowed to run. The rule it followed, "What a run needs" in `plugins/atk/shared/run-trace.md`, says
a run lacking `git` for the checks writes no trace, but never says what shows that `git` is lacking.
The fix adds two sentences there: only the trace's own three commands being refused or unable to
run at all shows it, any other `git` command's refusal or error is no evidence, the run still runs
the three itself, and a check that runs and answers no is the check failing, not a lack of `git`. This is question 1 of #186, decided by Lam Ngoc Khuong on 2026-11-08; question 2, a
stronger placement of the two trace lines in the 25 `SKILL.md` files, is not done here and waits
for the paid run of #174. Lam Ngoc Khuong approves.

## 1. Symptom as captured

From #186, verbatim:

> 1. Read `shared/run-trace.md`, ran `git rev-parse --show-toplevel`, then went straight into the
>    review: no ignore file written, no `git check-ignore` run.
> 2. Near the end, `git ls-files` (not needed by the trace) was refused by the bench with "git is
>    not a command the bench allows".
> 3. The session concluded "The bench has started refusing `git`, so the run trace can't be
>    written", never ran `git check-ignore`, and closed saying the trace check could not pass.

Environment: bench run of 2026-11-05, `review-planted-defects`, kit arm, sonnet, headless, with
`git check-ignore`, `git rev-parse --show-toplevel`, `git config user.name` and the Write tool all
allowed.

## 2. Root cause

The rule that decides whether a trace is written leaves "lacking `git`" undefined, so a run filled
the gap from the nearest `git` refusal it met. Location: `plugins/atk/shared/run-trace.md:81-83`
before this change ("A run lacking the file write or `git` for the checks writes no trace and says
which one it lacked"). No other file restates the rule.

## 3. Evidence

The responsible lines, as they stood at `3efd19e`:

```
- **What a run needs.** A file write for the trace and the ignore file, and `git` through the shell
  for the two checks and for `git config user.name` when a gate's name is taken from it, below. An
  interactive session may ask the person for each once. A run lacking the file write or `git` for
  the checks writes no trace and says which one it lacked; a headless run is given them by the flags
  it was started with. A run lacking `user.name` takes the name as given, and still writes the trace.
```

The check that shows a run reading them this way, from the investigation of #175,
`docs/records/fixes/261106-1126-175-review-no-run-trace.md:60-88`: the guard answered
`"git ls-files" => git is not a command the bench allows` and
`"git check-ignore -q docs/derived/traces/review/261105-1254-review-target.md" => ALLOWED`; the
session wrote "The bench has started refusing `git`, so the run trace can't be written", and "No
`git check-ignore` call and no write under `docs/derived/traces/` appear anywhere in that"
transcript. Nothing in the quoted lines says the refusal of `git ls-files` does not count, and the
run took it as counting.

## 4. Why it surfaced now

Broken since the paragraph was written: it never defined "lacking". It surfaced in the first
headless runs whose command guard refused some `git` commands and allowed others, the bench of
2026-11-05.

## 4b. Recorded intent, and the conflict when there is one

Spec: the rule itself is the spec, and #186 put the question to its owner, Lam Ngoc Khuong, who
answered in the invocation of this run on 2026-11-08: a run concludes `git` is lacking for the trace
checks only when the check command itself, `git check-ignore`, `git rev-parse --show-toplevel` or
`git config user.name`, is refused or errors; another `git` command's refusal is no evidence, and
the run still runs the check. No record says otherwise: `run-trace.md`, rule 5 of
`plugins/atk/shared/team-roles.md` and `plugins/atk/shared/host-capabilities.md` were searched and
none says when a run counts as lacking `git`. No conflict.

Review round 1 (S1) found that "ended in an error" also caught a check that ran and answered no.
Narrowing it changed the owner's wording, so the run asked: Lam Ngoc Khuong chose on 2026-11-08 to
correct it to "could not be run at all", with an answer of no left as the check failing and an
empty `user.name` as a run lacking `user.name`.

## 5. The change

One sentence, now two, added to the "What a run needs" bullet of `plugins/atk/shared/run-trace.md`:
a run lacks `git` only when `git rev-parse --show-toplevel`, `git check-ignore` or
`git config user.name` itself was refused or could not be run at all; a refusal or an error of any
other `git` command is no evidence, and the run still runs the three itself; one of the first two
answering no is the check failing, per The check, and an empty `user.name` is a run lacking
`user.name`. Nothing else in the file or the kit changed. It is the smallest change because the
paragraph that decides "no trace" is the only place "lacking" is used.

- Form: add a rule. The old sentence was true, so Correct did not apply, and leaving the case to
  the default of rule 5 in `plugins/atk/shared/team-roles.md` gave a wrong answer in an ordinary
  case: a headless run with nobody to ask filled the gap from an unrelated refusal.
- Tidy step: `/simplify`, four agents. It folded the command list into one, dropped "for the
  checks" and "for the name", and replaced an unclear "these" with "the three". Skipped: shortening
  "the run still runs the three itself" (the owner's requirement), "could not be run" for "ended in
  an error" (then the owner's wording; later decided under S1), and the byte figure in Cost (stale
  before this change).
- S1, review round 1: form Correct. "ended in an error" became "could not be run at all", and the
  sentence about an answer of no and an empty `user.name` was added. The finding's `Fix` line
  suggested the same form; Lam Ngoc Khuong chose it on 2026-11-08, since it narrowed his wording.
- Reference documents: `run-trace.md` is itself the rule every skill reads; no public contract of
  code changed, and no other document restates the paragraph.

## 6. Verified

- content layer, `bash tests/verify.sh` (the profile's Test command): every line `OK`, 87 of them,
  after the fix, after the tidy step, and after S1. It proves the manifests, mirrors, trace-line
  checks and citations still hold; it does not check what the sentence means. Two `grep: binary
  file matches` lines on stderr come from saved bench seeds under `docs/derived/bench/` and predate
  this change.
- The `ak:` check of `CLAUDE.md`: printed nothing.
- The em-dash check of `CLAUDE.md`: prints one line,
  `docs/records/fixes/261016-0613-review-author-replies.md:38`, a record that predates this change;
  the diff and this report hold no em-dash.
- The captured reproduction is a paid headless bench run and was not re-run; see section 7.
- Gate: no CI job checks content in this repository; `tests/verify.sh` is the whole gate.

## 6b. Reviewed

- Round 1: `docs/derived/reviews/plugins-atk-shared-run-trace.md-261108-0738.md`, band 1, 0
  BLOCKING, 1 SHOULD FIX, 1 NIT. S1 fixed (see section 5). N1 left as a `NIT`.
- Round 2: `docs/derived/reviews/plugins-atk-shared-run-trace.md-261108-0745.md`, 0 BLOCKING, 0
  SHOULD FIX, 2 NIT. S1 closed. N1 and N2 (a refused `git config user.name` is not said to be a run
  lacking `user.name`, Reach: edge) left as `NIT`.
- Closing read: nothing to read, since round 2 fixed nothing.
- `atk:verify`: not offered. The change is a rule an agent reads; there is no running system to
  start, and the only reproduction is the paid bench run in section 7.

## 7. Not verified

- That a headless run now runs `git check-ignore` after an unrelated `git` refusal and writes its
  trace. Only a paid re-run of the bench `review-planted-defects` scenario shows it; not run.
- How a run reads the new sentences in a `workspace`-shape project (round 1's settling check for
  S1). Not run.

## 8. Blast radius

Every `atk` skill reads `run-trace.md` through the two trace lines of its `## Workflow`, so all 25
read the new sentences; none restates the paragraph, searched for "What a run needs", "lacking"
and "lacked" under `plugins/` and `docs/`. `plugins/atk/skills/design-doc/references/answer-mode.md:31`
says "what it lacked" about a different need and is unaffected. Exercised: none by a run;
`tests/verify.sh` only.

## 9. Left for later

- Question 2 of #186, a stronger placement of the two trace lines in all 25 `SKILL.md` files, for
  headless runs that defer the trace setup past their first step. Waits for the paid run of #174.
  Owner: Lam Ngoc Khuong.
- That a paid headless run now runs `git check-ignore` after an unrelated `git` refusal. Only a
  re-run of the bench can show it; this change is not measured. Owner: Lam Ngoc Khuong.
- The Cost section of `run-trace.md` gives the file as 24,867 bytes; it was 25,559 before this
  change and is longer after it. The figure is a dated measurement, stale before this change, and is
  left as it is. Owner: Lam Ngoc Khuong.
