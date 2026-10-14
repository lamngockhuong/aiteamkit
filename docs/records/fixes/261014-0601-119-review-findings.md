---
title: "Fix: the review of PR #119, where the run trace was started after a gate, a hand-sent feedback record kept every name, and retention asked a second question"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-14
updated: 2026-10-14
ticket: https://github.com/lamngockhuong/aiteamkit/pull/119 (findings B1 to B3 and S1 to S26 of `docs/derived/reviews/119-261014-0502.md`)
---

# Fix: the review of PR #119

## In short

The review of PR #119, on head `3196b11`, found three things that block the merge. `fix`, `review`
and `verify` asked a question or spawned an agent before their run trace existed, so the first gate
of the run was never traced, and the check in `CLAUDE.md` passed them anyway (B3, S21). A deleted
heading made the rules for another kit's skill read as rules for `--runs` (B1). And a team sending a
feedback record by hand was told the project's own copy was ready to paste into a public form,
though that copy is the one that keeps every name (B2).

This run fixes those three and every `SHOULD FIX`, S1 to S26. Lam Ngoc Khuong chose that scope on
2026-10-14 and settled the three open questions the review raised:

- **S17, S25.** A profile with no `Run trace` line has already answered on. `atk:init` does not ask
  for it again, and `--audit` does not report it as missing. This reverses what the PR stated, by the
  maintainer's decision. The rule now covers every profile line whose absence has a meaning, in
  `plugins/atk/shared/project-profile.md`.
- **S15.** No run removes a trace any more. `atk:tailor --feedback <skill> --runs` offers to remove
  the oldest beyond twenty once its record is written, and removes them only on a yes. So the second
  permission question a run would have paid is gone.
- **ADR numbering.** Left as it is for now. S19 still adds ADRs 0004 to 0006 to the ADR lists.

The twenty `NIT`s, N1 to N20, are left for later and listed in section 9. This change was itself
reviewed twice by `atk:review`. The first round raised seven `SHOULD FIX` findings, all of them
fixed. The second closed them and raised nothing above `NIT`.

## 1. Symptom as captured

The review as posted on PR #119, quoted from its summary:

```
atk:review: PR #119, head `3196b11`

**3 BLOCKING, 26 SHOULD FIX, 20 NIT.** Changes requested on the BLOCKING findings.

- **B1** A section heading in `tailor/references/feedback.md` was deleted, so the rules for another kit's skill now read as rules for `--runs` (`feedback.md:209`)
- **B2** A record sent by hand is the copy that keeps the names, and it goes to a public repository (`feedback.md:289`)
- **B3** `fix`, `review` and `verify` ask or act before their trace exists, against `CONV-006` (`fix/SKILL.md:86`)
```

S1 to S26 and N1 to N20 are in that review, and in `docs/derived/reviews/119-261014-0502.md`, with
their lines and failures.

## 2. Root cause

Most findings come from one thing. The PR changed three things late in its own history: where a
trace starts, after ADR 0005; who removes traces; and what `tailor` reads. It did not carry those
changes into every file that states them.

- **B3:** at `3196b11`, `plugins/atk/skills/fix/SKILL.md:81-88`, `review/SKILL.md:57-61` and
  `verify/SKILL.md:88-91` put the progress-log offer or the band 1 spawn between the override
  sentence and the trace lines. Design `261013` line 190 puts the trace lines directly under the
  override sentence.
- **S21:** the check in `CLAUDE.md:724-731` greps for one of the two lines anywhere in the file.
  Its `echo "OK trace lines"` runs whatever the loop found.
- **B1:** the hunk that added `## Reading many runs` to
  `plugins/atk/skills/tailor/references/feedback.md` replaced the heading
  `## When the skill is not one of this kit's` and did not restore it.
- **B2, S1, S3:** `feedback.md:283-290` neutralized the record only for display. Its rule removed
  "no person's name", against `feedback.md:136-137`. It said nothing about paths and flag values.
  Its last sentence pointed a person sending by hand at the project's copy.
- **S15:** retention, at `plugins/atk/shared/run-trace.md:176-185`, deleted traces on every run. A
  delete is a permission question of its own (`run-trace.md:208-211`).
- **S7, S8:** `run-trace.md:106-118` asked a run to tell a headless prompt from a person, which the
  same file's measurement says it cannot do. It had no value for a skill another skill called.
- **S9 to S11, S13, S14, S12:** `feedback.md:161-196` and `run-trace.md:39-50` left these cases
  without a rule:
  - `tailor`'s own unfinished trace;
  - zero traces;
  - traces from another kit version;
  - a run with no subject;
  - a failed confinement check;
  - a project spanning several repositories.
- **The rest, S2, S4 to S6, S16 to S20, S22 to S26:** prose the PR left stale or never wrote. The
  review names each one with its line.

## 3. Evidence

B3 and S21, reproduced on the PR head. The check as it stood was run over a `git archive` of
`3196b11`:

```
$ for f in plugins/atk/skills/*/SKILL.md; do ... grep -qF "create this run's trace, ..." "$f" || echo "NO TRACE LINE $f"; done; echo "OK trace lines"
OK trace lines
$ sed -n 81,88p plugins/atk/skills/fix/SKILL.md
Before step 1, read `.atk/overrides/fix.md` when it exists, per rule 7 of `shared/team-roles.md`.
Then read the newest unfinished progress log of this skill for the same defect and offer to resume
it, asking first when it looks stale, per Progress log in `shared/artifact-paths.md`. Through the run,
add an entry to the log each time a hypothesis is proved or ruled out, and for each review round in
step 6.
Then, before anything else, create this run's trace, `<docs root>/derived/traces/fix/<run-id>.md`:
read the kit's `shared/run-trace.md` and do what it says before the file, at each step, and at the close.
```

B1 on the same archive:

```
$ grep -c '^## When the skill is not one' plugins/atk/skills/tailor/references/feedback.md
0
```

B2, S1, S3, S15 and S7 are the quoted lines the review gives. Each was read at the PR head and holds
as quoted.

## 4. Why it surfaced now

Introduced by the PR's own commits: `0a8b9d7` moved the trace start into every workflow (B3, S21),
and `3196b11` added `--runs` (B1, B2, S9 to S11). None of it is on `main`.

## 4b. Recorded intent, and the conflict when there is one

Three findings contradicted a stated decision. All three were put to the decision's owner before
any change, and settled:

- **S17 and S25.** The PR says a missing `Run trace` line is "reported as missing, never as drift".
  Lam Ngoc Khuong chose "absent means on, never re-asked or reported".
- **S15.** Q10 of design `261011` allows one permission question per run. Lam Ngoc Khuong chose to
  move retention into `tailor --runs`.
- **The ADR numbering question.** Left for later, by the same person.

No other finding met a recorded decision. The search covered:
- the three design records;
- ADRs 0004 to 0006;
- the PR body;
- `CLAUDE.md`.

## 5. The change

Twenty-five files, 204 lines added and 108 removed, all prose except one check in `CLAUDE.md`.

- **B3, S5.** In `fix`, `review` and `verify`, the two trace lines now sit directly under the
  override sentence. The progress-log offer and the band 1 spawn follow them. `review` says that
  this session writes the trace for its reviewer.
- **S21.** The check in `CLAUDE.md` is now a Python block. It looks for both lines directly under the
  override sentence, after folding line breaks, and fails with exit 1 when they are missing.
- **B1.** The heading `## When the skill is not one of this kit's` is restored in `feedback.md`.
- **B2, S1, S3.** A record sent by hand is the neutralized text. It keeps the reporter's own name,
  writes paths relative to the plugin or the project root, and masks flag values.
- **S15.** Under Retention in `run-trace.md`, no run removes a trace. `feedback.md`, "Removing old
  traces", is where `tailor --runs` asks, and `artifact-paths.md`, the docs, `CLAUDE.md` and
  `codebase-summary.md` say so.
- **S7, S8.** `way` is the run's own account. A request that arrives alone is `unknown`. A fifth value,
  `skill`, covers a skill another skill invoked, and an agent a skill spawns writes no trace.
- **S9 to S14.** `feedback.md` covers:
  - `tailor`'s own unfinished trace;
  - zero traces;
  - another kit version;
  - `--since` without `--runs` or with a bad date.

  `run-trace.md` covers:
  - a run with no subject;
  - a failed confinement check, which now says so in one line;
  - a project spanning several repositories, where `artifact-paths.md` names the trace among the
    project-level kinds, with its `git -C`.
- **S16.** `run-trace.md` states once that wherever a skill "writes nothing", the trace and its
  ignore file are the exception it means.
- **S17, S25.** Owned by `project-profile.md`. `init` never asks again for a missing `Run trace`
  line, and `--audit` never reports one, for that line alone (S27 in the second review).
- **S4, S6.** Owned by `init`'s `detection.md`, which no longer says a trace is "never sent", and by
  the profile template, which keeps the line inside a comment. `run-trace.md` and ADR 0004 and its
  mirror changed with them.
- **S2, S18 to S20, S22 to S24, S26:**
  - a public-repository warning on the issue form, linking to the neutralization list;
  - `review`'s claim that its report is the one derived kind the kit reads;
  - the ADR rows and file counts;
  - a load-model row and a widened profile row;
  - `tailor` triggers in three languages, with evals;
  - the pointer "below" corrected to "above";
  - the reason `run-trace.md` is a file of its own;
  - a README paragraph on the default.

The tidy step ran through Claude Code's `/simplify`, as four read-only clean-up agents. They
removed what `run-trace.md`, read on every traced run, now said three times. They made Retention, the
neutralization list and the token cost each owned by one file and cited by the rest. And they moved
three rules into the shared files that own them, out of `review`, `init` and `run-trace.md`.

Reference documents: the fix changes no public contract of code. The documents it moves are the
kit's own rules, and they moved with it, in the diff both review rounds read.

## 6. Verified

- **The whole "Common verification commands" block of `CLAUDE.md`.** This is the profile's Test
  command, and there is no CI gate for content. It printed 68 `OK` lines and nothing else, exit 0,
  after the fix, after the tidy step, and after the round 1 fixes.
- **The em-dash, other-kit, `atkx` and diagram-fill checks.** They printed nothing.
- **The B3 and S21 reproduction re-run.**
  - The new check passes the fixed tree.
  - It fails with exit 1 on `fix/SKILL.md` as it stood at `3196b11`.
  - It fails on a `help/SKILL.md` with its trace line broken.

  The first review agent repeated the second case and added a wrong folder name. All of these were
  run in scratch copies.
- **B1.** `feedback.md` holds the heading once.
- **Line counts.** `review`, `verify` and `tailor` are at 299 lines and `fix` at 287.

## 6b. Reviewed

- **Round 1**, `docs/derived/reviews/119-fix-261014-0750.md`: band 1, 293 lines, one agent, nine
  rounds and the sweep. It found 0 `BLOCKING`, 7 `SHOULD FIX` and 2 `NIT`.
  - S10, S12, S19, S20, S24 and S28 were partly open findings, and were fixed.
  - S27 was new. It was fixed by narrowing the rule to `Run trace` alone, which is the decision as
    the maintainer made it.
  - N21 and N22 are left as `NIT`s.
- **Round 2**, `docs/derived/reviews/119-fix-261014-0812.md`, reviewing the fixes: all seven closed,
  0 `BLOCKING`, 0 `SHOULD FIX`, 3 `NIT` (N21 to N23).
- `atk:verify` was not offered: the profile's Verify section says the repository starts nothing.

The review rounds ran in agents given no conversation, but they were spawned by the session that
wrote the change. They are one model's work, not a second person's review: Lam Ngoc Khuong reviews
before merge.

## 7. Not verified

- Every statement here was read and checked by a check or an agent, not run as a skill. No
  headless or interactive run of any skill was made against the new text, so none of it has a
  measured run behind it, and in particular:
  - `way: unknown` for a request that arrives alone;
  - the removal question of `tailor --runs`;
  - `tailor --runs` from a member repository;
  - the `--since` refusals;
  - `init` not re-asking `Run trace`.
- The new trigger phrases of `tailor` have evals, but were not measured per
  `docs/trigger-eval-measurement.md`.
- Cursor and Codex were not run.

## 8. Blast radius

Every reader of the rules this change moved:

- **The 24 `SKILL.md` workflows that send a run to `run-trace.md`.** Checked by the trace-line
  check, which covers all of them.
- **`atk:tailor`'s `--feedback` and `--runs`.** Read by both review rounds.
- **`atk:init`'s re-run and `--audit`, and `detection.md`.** N23: its re-run paragraph lacks the
  `Run trace` exception that `SKILL.md` states.
- **`shared/project-profile.md`, `shared/artifact-paths.md`, `shared/run-trace.md`.** Read by both
  rounds.
- **The docs that summarise retention, and their `docs/vi/` mirrors.** Read by both rounds.
- **The issue form.** Read, not filed.

None was exercised by running a skill, per section 7.

## 9. Left for later

- **N21 to N23**, from the reviews of this change:
  - N21: the template comment holds the literal `- Run trace: off`.
  - N22: no negative evals for the new triggers.
  - N23: `init/references/detection.md` lacks the `Run trace` exception.
- **N1 to N20.** The twenty `NIT`s of the review, each with its line in
  `docs/derived/reviews/119-261014-0502.md`. They are not done here, by the scope chosen.
  - N14 includes the 3,400-token figure in ADR 0006 line 38 and its mirror. `run-trace.md` now
    states 15,497 bytes, about 3,900 tokens.
  - N17: `git/SKILL.md`'s "leave this line" now sits under the trace line.
- **ADR numbering.** It goes 0002 to 0004. Lam Ngoc Khuong decides whether 0003 is reserved or the
  ADRs are renumbered.
- **The PR body.** Several of its statements are now out of date:
  - Its "21 old traces" row: no run removes a trace any more.
  - Its "3,400 tokens" figure.
  - Its "reported as missing" behaviour of `init`.
  - Its `way` note: the rule now writes `unknown` for a request that arrives alone.

  Lam Ngoc Khuong updates the body when this change is pushed.
- **Not measured.**
  - The new `way` rule, the `unknown` value for a request arriving alone, has not been measured on a
    headless run.
  - Neither has the new `tailor --runs` removal question.

  Both need a headless or interactive run before the PR's measurement table is called current.
- **Reference documents.** The fix changes no public contract of code. The documents it moves are
  the kit's own rules: the shared files, `docs/` and `docs/vi/`. They moved with the change and are
  in the diff the review reads.
