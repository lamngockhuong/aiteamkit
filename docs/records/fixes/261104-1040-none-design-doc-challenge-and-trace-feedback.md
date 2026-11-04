---
title: "Fix: a --challenge closes without its objections, an author's instruction to return a design to DRAFT is unread, and a trace has no place for a late correction or a challenge's counts"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-04
updated: 2026-11-04
ticket: docs/derived/feedback/design-doc-261104.md#1, docs/derived/feedback/design-doc-261104.md#2, docs/derived/feedback/design-doc-261104.md#3, docs/derived/feedback/design-doc-261104.md#4
---

# Fix: a --challenge closes without its objections, an author's instruction to return a design to DRAFT is unread, and a trace has no place for a late correction or a challenge's counts

The source is an `atk:tailor --feedback` record of two `atk:design-doc` traces, both of 2026-11-03,
on a client project. That record is derived and uncommitted; it is cited here by its path inside
this repository's working tree and its date, 2026-11-04. Its finding 5, four steps folded into one
`step 1-4 resume:` line, is a run not following `shared/run-trace.md:216`, which already says one
line per step, and is outside this run.

## In short

Four gaps, each seen on one real run. A `--challenge` kept 17 objections, wrote them into the
design, and closed with a summary of a few; the person had to ask for the full list (F1). The
closing message now lists every kept objection with its answer, then the counts, for
`atk:design-doc` and `atk:plan` alike, since both use `shared/independent-challenge.md`. The owner of
a design `IN REVIEW` told the agent to run the challenge after being told the design must go back to
`DRAFT`, and the skill did not say whether that instruction counts (F2): the maintainer ruled that
it does, as an approver's instruction does under rule 2, and it is now a `gate return to DRAFT`
line of its own. A correction reported the day after a run closed had no valid place in its trace
(F3): the maintainer ruled it goes into the old trace with its own time, as a late `end` does. A
challenge wrote a `review` line counted by outcome, because its objections have no severity, and
the trace shape did not say whether that was right (F4): the maintainer ruled it is, and the `review`
row now names those counts. Two review rounds left no `BLOCKING` finding; the rules are checked by
reading only, and a trial run is left for later. Lam Ngoc Khuong approves.

## After the last round

The second round, `docs/derived/reviews/working-tree-design-doc-challenge-and-trace-feedback-261104-1053.md`,
closed S1 and S2 and raised one new `NIT`; nothing was fixed after it, so there was no fix for a
closing read to cover.

## F1. The closing message of a challenge does not list the objections

### 1. Symptom as captured

Feedback finding 1, run `261103 #2`: 17 objections kept, the table written into the design, and the
run closed with a paragraph on the "most important" few and the open items. The person corrected it
in the session: "the closing message should list every objection with its status after the
challenge" (the `corrected by hand` line of `#2`).

### 2. Root cause

Nothing says what a challenge's closing message must show; every rule is about the artifact.
`plugins/atk/shared/independent-challenge.md:72-84` (as of `2a95250`) puts the table in the
artifact, `plugins/atk/skills/design-doc/references/role-challenge.md:40-54` places it in the design,
and `plugins/atk/skills/design-doc/SKILL.md:174-177` asks the close to name only `partial` and
`answered by ..., not ...` answer rows.

### 3. Evidence

Quoted lines with the check: `grep -n -i "clos" plugins/atk/shared/independent-challenge.md
plugins/atk/skills/design-doc/references/role-challenge.md` at `2a95250` prints no line about a
closing message, and the only close rule in `design-doc/SKILL.md` is `:174-177`:

```
The run never sets `APPROVED`. At its close it names every answer row that reads
`answered by <name>, not <named person>` or `partial`, ...
```

### 4. Why it surfaced now

Broken since `shared/independent-challenge.md` was written; no run with more kept objections than a
summary could carry had been read against its close until this one.

### 4b. Recorded intent

None found. Searched `independent-challenge.md`, `role-challenge.md`, `plan-challenge.md`, and both
`SKILL.md` files; nothing says the close may summarise instead of listing.

## F2. "The author editing the status" when the author tells the agent

### 1. Symptom as captured

Feedback finding 2, run `261103 #2`: the design was `IN REVIEW`; an earlier turn said it must go back
to `DRAFT` before a challenge; its owner typed "run the challenge"; the run set the design and its ADR
to `DRAFT` and reminded the person to tell the approver, tracing it inside a general
`gate confirmation: given in the prompt`.

### 2. Root cause

`plugins/atk/skills/design-doc/SKILL.md:110-113` (as of `2a95250`) says the design goes back "by its
author editing the status and telling the approver", which reads either as the author's own hand only
or as also the author's instruction to the agent. Rule 2 of `shared/team-roles.md:46-53` settles the
same question for an approver and says nothing of an author.

### 3. Evidence

`design-doc/SKILL.md:110-113` at `2a95250`:

```
- **`IN REVIEW`.** Refused in one line that points at `--answer`: in review, an answer, an option a
  reviewer asked for, and a decision settled are all recorded through it. With `--adr` or
  `--challenge`, the line says instead that the design goes back to `DRAFT` first, by its author
  editing the status and telling the approver, since both are draft steps it skipped.
```

The same wording is in `references/answer-mode.md:21-23`.

### 4. Why it surfaced now

Ambiguous since the line was written; this was the first traced run in which the owner answered the
line by instructing the agent.

### 4b. Recorded intent, and the decision

The line records that the author returns the design, and not who may type the edit. The maintainer,
Lam Ngoc Khuong, who owns the definition, ruled on 2026-11-04 at this run's intent check: the
owner's instruction counts, as rule 2 lets an approver's, and is traced as a `gate` line of its own.

## F3. A correction reported on a later day has no valid place

### 1. Symptom as captured

Feedback finding 3: a correction to run `261103 #2` arrived on 2026-11-04. The line
`10:24 corrected by hand: ...` was put above `11:35 end: ...`, so the trace's times run backwards
and a line other than `end` carries the next day's time.

### 2. Root cause

Two rules of `plugins/atk/shared/run-trace.md` (as of `2a95250`) can only both hold when the
correction arrives the same day: `:187-188` puts a late correction above `end`, and `:193-194` lets
only a late `end` line fall on a day other than the `<run-id>`'s.

### 3. Evidence

`run-trace.md` at `2a95250`:

```
187 `end` is always the last line, and opens with its time like every other event. A correction
188 reported after the run closed is written above it. ...
193 One trace holds one session, or the part of it that falls on one day, so every time in it but a
194 late `end` line, below, falls on the day its `<run-id>` names.
```

A correction reported on day two above an `end` of day one satisfies `:187-188` and breaks
`:193-194`.

### 4. Why it surfaced now

Broken since the day rule was added beside the correction rule; no correction had arrived on a later
day before.

### 4b. Recorded intent, and the decision

None says which rule yields. The maintainer ruled on 2026-11-04: the correction goes into the old
trace with the time it was reported, and the day rule names it as the second exception.

## F4. A challenge's `review` line has no counts to follow

### 1. Symptom as captured

Feedback finding 4, run `261103 #2`: `review: 18 objections from 4 lenses, 0 dropped, 17 kept, 15
changed ..., 2 open, closing read`, counted by outcome because a challenge's objections have no
severity.

### 2. Root cause

`plugins/atk/shared/run-trace.md:178` (as of `2a95250`) asks a `review` line for "the counts by
severity" when "a review returns", and nothing says whether a challenge, which `independent-challenge.md:18`
calls "a pre-review, not a review", writes one.

### 3. Evidence

`run-trace.md:178` at `2a95250`:

```
| `review` | the counts by severity, and the round of the ceiling, or `closing read` for the read after the last round, per `shared/review-fix-loop.md` | a review returns, its own or one it called |
```

### 4. Why it surfaced now

Unstated since `--challenge` was added to `design-doc` and `plan`.

### 4b. Recorded intent, and the decision

`independent-challenge.md:18` says a challenge is not a review, in the sense that it approves
nothing; the trace row did not take a side. The maintainer ruled on 2026-11-04: a challenge writes a
`review` line, counted by outcome, with no round.

## 5. The change

- F1: `plugins/atk/shared/independent-challenge.md` gains `## In the closing message`: every kept
  objection on one line, ID, lenses, the objection, its answer, then raised, merged and dropped
  counts and any lens not run; emphasis may follow the list, never replace it. Pointers from
  `design-doc/SKILL.md` step 5 and its definition of done, `design-doc/references/role-challenge.md`,
  and `plan/references/plan-challenge.md`, added after review finding S2.
- F2: `design-doc/SKILL.md`, the `IN REVIEW` bullet: an instruction from the design's `owner`,
  established as rule 2 establishes an approver's and given after the refusal line, sets the design
  and its ADR to `DRAFT` together, traced as `gate return to DRAFT`, followed by the reminder to
  tell the approver. `references/answer-mode.md` names the same route.
- F3: `shared/run-trace.md`, the `end` paragraph and the day rule: a correction reported after the
  close keeps its own time, even on a later day, and is the one line written out of time order; the
  midnight paragraph now names it beside the late `end`, after review finding S1.
- F4: `shared/run-trace.md`, the `review` row: a challenge writes one, counting objections raised,
  merged, dropped, changed and open and the lenses that ran, with no round.

The form, per `shared/review-fix-loop.md`: each is a rule added at the place an agent reads it,
the narrowest form, with no new section of a `SKILL.md`. No public contract changed; the kit has no
reference documents of the `atk:spec` kinds.

## 6. Verified

`bash tests/verify.sh` after each round: every line `OK`, 84 lines. The em-dash and `ak:` checks of
`CLAUDE.md` print nothing over the changed files. `design-doc/SKILL.md` is 247 lines, under 300.
`atk:verify` was not offered: there is no running system, the change is prose an agent reads.

## 6b. Reviewed

Two rounds of `atk:review`, band 1, one reviewer agent each.
Round 1, `docs/derived/reviews/working-tree-design-doc-challenge-and-trace-feedback-261104-1047.md`:
0 `BLOCKING`, 2 `SHOULD FIX`, 4 `NIT`. S1, the midnight paragraph still calling the late `end` the
one line of a later day, and S2, nothing pointing the closing rules at the new section, were both
fixed. Round 2, `...-261104-1053.md`: 0 `BLOCKING`, 0 `SHOULD FIX`, 2 `NIT`. No `NIT` was fixed.
The reviewer was an agent given paths only; the Tech Lead's reading is still owed.

## 7. Not verified

- No run of `atk:design-doc --challenge` or `atk:plan --challenge` under the new closing rule.
- No run of `atk:tailor --feedback` over a trace holding a later-day correction or a challenge's
  `review` line; `plugins/atk/skills/tailor/references/feedback.md` was read and depends on neither
  time order nor severity counts.
- No CI job gates content here; `tests/verify.sh` is run by hand.

## 8. Blast radius

The readers of the four rules: `atk:design-doc` and `atk:plan` under `--challenge`, every skill that
writes a trace, and `atk:tailor --feedback`, which reads traces. Covered by reading, per section 7.

## 9. Left for later

- Feedback finding 5 needs no change: `run-trace.md:216` already gives one line per step.
- The feedback's guess that `atk:plan --challenge` closes the same way is not checked against a run;
  the F1 rule is in the shared file, so it now holds for both, unverified by a run of either.
- No trial run of `atk:design-doc --challenge` with the new rules; they are checked by reading only.
- Review `NIT`s left unfixed: N1 `--answer --challenge` on an `IN REVIEW` design against the keep
  status rule; N2 a later-day correction carries `HH:MM` only, not its date; N3 descriptions of
  `independent-challenge.md` in `CLAUDE.md`, `docs/codebase-summary.md` and
  `docs/system-architecture.md`, both languages, do not mention the closing message; N4 three
  unwrapped long lines; N5 `plan/SKILL.md` definition of done lacks the closing-message item that
  `design-doc` now has. Owner: Lam Ngoc Khuong.
