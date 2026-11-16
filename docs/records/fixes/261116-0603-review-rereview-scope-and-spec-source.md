---
title: "Fix: atk:review narrows a person's re-review to the delta unasked, and measures criteria against the PR author's own list"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-16
updated: 2026-11-16
ticket: docs/derived/feedback/review-261116-0558.md
---

# Fix: atk:review re-review scope and where criteria come from

## In short

A person ran `/atk:review <pr>` six times on one pull request of a client project. From the second
call on, each run found the earlier report and reviewed only what had changed since, without saying
so first; the fifth read 18 lines and posted `APPROVE`, and the sixth, asked for the whole change,
found five `BLOCKING` defects in code no run after the first had reopened. Separately, `criteria`
measured the ten acceptance criteria the author wrote into the pull request description, while the
decisions that bind the work sat in a comment on the epic, two of them unimplemented.

The cause is two silences in the definition of `atk:review`. Its rule for a second pass was written
for the review and fix loop of `atk:implement` and `atk:fix` and never told a person's call apart
from it; its step 1 never said where the requirement comes from when the profile names a tracker,
nor which wins between a decision on the ticket and the author's own list.

The fix makes any call that is not a fix loop ask the person which scope to read, the delta or the
whole change, before anything is counted or spawned, and makes the report name the scope and the
last review that read the whole change. Step 1 now reads the requirement where the profile says the
spec lives, ticket comments included, and ranks a decision above the author's list when its writer
is matched to the role that owns it; a reference document that contradicts a later decision is
drift, raised to the decision's owner and the document's approver. Two review rounds and a closing
read left no `BLOCKING` finding. Lam Ngoc Khuong approves; two questions the feedback left open,
and thirteen `NIT` findings, stay with him, below.

## After the last round

The closing read, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-plugins-atk-skills-review-references-review-rounds.md-plugins-atk-skills-review-references-report-format.md-docs-skills-overview.md-docs-vi-skills-overview.md-261116-0721.md`, read what round 2 fixed (`S6`): 0 `BLOCKING`, 0 `SHOULD FIX`,
two new `NIT` (`N12`, `N13`), and `S6` closed. Nothing was fixed after it.

## SF1. A re-review of a pull request narrows to the delta without saying so

### 1. Symptom as captured

From `docs/derived/feedback/review-261116-0558.md`, finding 1, verbatim in substance:

- Input: a person types `/atk:review <pr>` on a pull request that already has an `atk:review`
  report (trace `way: session`), passes 2 to 6.
- Observed: passes 2 to 5 each found the earlier report through `## Output` ("Read the newest
  earlier report on the same target first") and took the second-pass shape on their own. Scopes
  shrank 706, 703, 221, 18 lines; the fifth posted `APPROVE`. The scope appeared in each report's
  header only after the run.
- Expected: before spawning anything, the run states which scope it will review, the delta since
  the earlier report's head plus what it reaches, or the whole change, and lets the person choose;
  the answer is recorded.
- Environment: Claude Code, atk 0.1.23, band 2 then band 1.

### 2. Root cause

The second-pass rule names only a caller that fixed findings, and nothing tells a person's call from
it, so every run that finds an earlier report takes the delta shape unasked.

- `plugins/atk/skills/review/SKILL.md:86-87` (before the fix): "Called again after a fix, the
  subject is the fix and what it reaches, per `references/review-rounds.md`."
- `plugins/atk/skills/review/references/review-rounds.md`, Called again after a fix (before the
  fix): "A caller that fixed findings and calls the review again, `atk:implement` and `atk:fix` in
  their review and fix loop above all, gets a review of the fix. ... Not the whole change from the
  start either, because what did not change since the first review has already had its rounds."
- `plugins/atk/skills/review/SKILL.md`, `## Output`: "Read the newest earlier report on the same
  target first", on every run.

### 3. Evidence

Quoted lines, with the check that shows they produce the behaviour: the three lines above are the
whole of what the definition says about a target with an earlier report. Searched
`plugins/atk/skills/review/` and `plugins/atk/shared/review-fix-loop.md` for any condition on who
calls, a question about scope, or an offer of the other scope:

```
grep -n -i "second pass\|Called again after a fix\|first report" plugins/ -r
```

Every hit is either the fix loop's call (`review-fix-loop.md:33-35`, `:192`) or the rule itself; none
asks, and none distinguishes a person. A run that reads `## Output` finds the earlier report and the
only rule for it is the delta one.

### 4. Why it surfaced now

Broken since it was written: the rule arrived in 867dee2 (#78, 2026-09-29) for the fix loop, and the
earlier-report read in 0b31930 (#71). A person re-reviewing one pull request repeatedly is the path
that never exercised it until this client run.

### 4b. Recorded intent

Spec: the definition of `atk:review` is its own spec; its owner is Lam Ngoc Khuong, the Tech Lead,
who wrote the feedback and its Proposal ("the reporter owns the definition").

#78 records the delta-only second pass for the fix loop and is silent on a person's call. The silent
case went to its owner, who answered in the feedback's Proposal: distinguish the two callers, ask the
person, record the answer, qualify the coverage claim, handle a force-push. Two questions the
feedback leaves open are not decided by this fix: Q1, whether a delta-only pass may post `APPROVE`
under `--comment`; Q2, whether the fix loop keeps its delta default unasked. The fix leaves both
behaviours as they were.

## SF2. `criteria` measured the PR's own acceptance criteria, not the ticket's decisions

### 1. Symptom as captured

From the same feedback, finding 2:

- Input: a pull request whose description carries ten acceptance criteria written by its author; an
  epic whose Acceptance Criteria section is `TBD` and whose decisions sit in a comment table dated a
  day after the reference documents; a profile recording that the spec lives in issue comments.
- Observed: pass 1's `criteria` row says "all 10 ACs implemented", the author's list. Two decisions
  in the comment were not implemented and the reference documents say the opposite; no pass before
  the sixth raised them.
- Expected: `criteria` reads the decision record the profile points to, ranks it above the author's
  list, and raises a reference document that contradicts a later decision as a question to its
  owner.

### 2. Root cause

Step 1 says to find the requirement but never where, when the profile names a tracker, nor which
wins between a recorded decision and the author's list, so a run takes the nearest list.

- `plugins/atk/skills/review/SKILL.md:67-69` (before the fix): "Find the requirement and design
  behind the change. Without them, say so in the review and review against the PR description
  alone".
- `plugins/atk/skills/review/references/review-rounds.md:392` (before the fix): "Step 1 of the
  workflow, the requirement and design and acceptance criteria, feeds `criteria`."

### 3. Evidence

Quoted lines, as above: neither file names `Spec lives in`, ticket comments, or a ranking. The
counterpart that does exist shows the gap: `plugins/atk/skills/fix/references/investigate.md:33-37`
reads "the place the Tracker section of `.atk/profile.md` names under `Spec lives in`. Read it
through `shared/ticket-adapters.md`, comments included, since a spec on a tracker is often updated
or settled in a comment". `atk:review` has no such line.

### 4. Why it surfaced now

Broken since step 1 was written; an epic whose criteria live only in a later comment, beside a pull
request with its own list, is the first input that separated the two.

### 4b. Recorded intent

Spec: as SF1. No record says the author's list outranks a decision on the ticket; the owner's
Proposal asks for the opposite ranking and for a contradicting reference document to become a
question to the decision's owner. The review (`S5`) showed that `shared/spec-docs.md`, Drift is not
an unanswered question, already calls that case drift and gives it to the document's approver; Lam
Ngoc Khuong chose to keep it drift and ask both people.

## 5. The change

- `plugins/atk/skills/review/references/review-rounds.md`, Called again after a fix: two callers.
  A fix loop names its first report and is asked nothing. Any other call that finds an earlier
  report or `atk:review` summary asks, before counting or spawning, for the delta or the whole
  change, each with its counted lines and the newest review that read the whole change; a review
  with no recorded scope is named so, unless it is a first review. The answer is a trace `gate`
  line and goes into the report; with nobody to ask, the whole change. A force-push and a working
  tree are handled. The delta paragraphs now open "Where the scope is the delta".
- The same file, step-1 bullet: the requirement is read where the profile says the spec lives, the
  ticket and its comments, the parent epic where the ticket points to it or leaves criteria open. A
  decision outranks the author's list only where its writer is matched to the owning role; otherwise
  it is an open question to that owner. A contradicting reference document is drift, asked of the
  decision's owner and the document's approver.
- `references/report-format.md`: every report writes the scope fields, a first review `whole`; the
  posted summary's opening line carries the scope; the Rounds line names it on a second pass.
- `SKILL.md`: the workflow opening asks the scope, or takes a fix loop's files, before counting;
  step 1 points at the ranking; the Output paragraph keeps its readers. 299 lines.
- `docs/skills-overview.md` and `docs/vi/skills-overview.md`: one paragraph each on both behaviours.

Form: these are rules an agent follows, and each change is a **Correct** of an existing rule or an
**Add** where the definition was silent, per `shared/review-fix-loop.md`. Tidy step: `/simplify`
with four agents; applied six findings (fields listed once, drift cited not restated, epic read only
when needed, one-hop lookup, a duplicate and a filler clause removed), skipped four, listed in the
progress log; `tests/verify.sh` re-run after it. Reference documents: no public contract of a
project changed; the user-facing summary moved with the rules.

## 6. Verified

| Layer | Command | What it proves |
|---|---|---|
| content, docs | `bash tests/verify.sh` (profile Test), after the fix, after the tidy, after each review round | 100 `OK` lines, no failure: manifests and frontmatter parse, `SKILL.md` names, em-dash, `ak:`, mirror file lists, citations inside the plugin, skill-lifecycle counts (230 mentions, 127 pairs), trace lines |

The first run failed one check, the skill-lifecycle count (230 to 227), after the Output paragraph
lost three skill mentions; they were restored and the check passes. The captured reproduction is a
reading: the rule a person's re-review reaches now asks the scope before anything is counted, and
step 1 now names where the requirement is read and how it is ranked. The gate is the required
`verify` job, which runs the same script.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-plugins-atk-skills-review-references-review-rounds.md-plugins-atk-skills-review-references-report-format.md-docs-skills-overview.md-docs-vi-skills-overview.md-261116-0639.md`: 0 `BLOCKING`, 5 `SHOULD FIX`, 8 `NIT`. Fixed `S1` (scope recorded in
  the summary line, unrecorded scope named so), `S2` (delta paragraphs conditioned, whole change
  still checks findings), `S3` (fix loop's files in the opening), `S4` (writer matched to the owning
  role), `S5` (drift, option (a), chosen by Lam Ngoc Khuong).
- Round 2, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-plugins-atk-skills-review-references-review-rounds.md-plugins-atk-skills-review-references-report-format.md-docs-skills-overview.md-docs-vi-skills-overview.md-261116-0715.md`: 0 `BLOCKING`, 1 `SHOULD FIX`, 11 `NIT`; `S1` to `S5` closed. Fixed
  `S6` (every report writes the scope fields, a first review `whole`; an older first review counts
  as a full read).
- Closing read, `docs/derived/reviews/plugins-atk-skills-review-SKILL.md-plugins-atk-skills-review-references-review-rounds.md-plugins-atk-skills-review-references-report-format.md-docs-skills-overview.md-docs-vi-skills-overview.md-261116-0721.md`: 0 `BLOCKING`, 0 `SHOULD FIX`, 13 `NIT` (`N12`, `N13` new);
  `S6` closed. No `NIT` was fixed.
- `atk:verify` was not offered: the profile's Verify section says nothing runs in this repository.

## 7. Not verified

- No trial run of `atk:review` against a target with an earlier report: whether a run asks the scope
  in practice is unmeasured (`N8`). `tests/verify.sh` checks structure, not behaviour.
- The S5 change makes `criteria` raise drift; whether `contract` under `Contract: first` raises it
  the same way in a band-2 agent is not stated in that paragraph (`N9`).
- Cursor and Codex runs were not tried.

## 8. Blast radius

- `plugins/atk/shared/review-fix-loop.md:31-36`, `:190-196`: the fix loop names its first report and
  files, so it still gets the delta; read, consistent, not exercised by a run.
- `plugins/atk/shared/artifact-paths.md:335-337`: a second review reads the newest earlier report;
  still true; read.
- `plugins/atk/shared/spec-docs.md`, Drift is not an unanswered question: now cited, not changed.
- `plugins/atk/skills/fix/references/findings-mode.md` and `atk:orchestrate`, which call the review:
  unchanged; their calls name the first report.
- `docs/skills-overview.md`, `docs/vi/skills-overview.md`: changed, one sentence stale (`N11`).

## 9. Left for later

- The requirement ranking and the "read the ticket and its comments" rule live in
  `review-rounds.md` for now. `atk:qa`, `atk:verify` and `atk:run-cases` also measure against
  acceptance criteria; a shared home, `shared/spec-docs.md` for the ranking and
  `shared/ticket-adapters.md` for the read, would keep them agreeing. A wider change than this fix.
- `SKILL.md` of `atk:review` sits at 299 lines, so its Definition of done gained no line for the
  scope question or the requirement ranking; the references hold both.
- Feedback Q1 (a delta-only pass posting `APPROVE`) and Q2 (the fix loop's delta default), open for
  Lam Ngoc Khuong.
- Feedback findings 3 and 4 are runs not following plain rules; nothing in the definition changes.
- No reference document moved: the change is to the kit's own skill rules, and the user-facing
  summary in `docs/skills-overview.md` and `docs/vi/skills-overview.md` moved with it.
- Thirteen `NIT` findings from the review loop, `N1` to `N13`, in the closing read's report, left
  unfixed by the loop's rule. Two matter most: `N11`, the overviews still say a ticket decision
  outranks the author's list unconditionally, stale since `S4`, Lam Ngoc Khuong to correct; and
  `N12`, the oldest summary taken as a first review when an older report file exists.
- A trial run of `atk:review` on a target with an earlier report, to see the scope question asked
  (`N8`), Lam Ngoc Khuong.
- Who counts as a decision's owner on a profile whose Team section names no PM or BrSE, raised by
  round 2 as an open question for Lam Ngoc Khuong.
