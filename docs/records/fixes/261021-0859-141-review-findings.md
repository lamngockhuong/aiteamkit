---
title: "Fix: the review of PR #141, where rule 5's default asked an owner who was not in the session and the reach machinery reached only one round"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: https://github.com/lamngockhuong/aiteamkit/pull/141 (findings S1 to S16 and N1 to N15 of the review of PR #141, 2026-10-21 08:16)
---

# Fix: the review of PR #141

## In short

Three cases from the review show what was wrong. A Developer runs `atk:plan` and meets a state the
skill does not cover whose answer is the PM's. The new rule 5 default said the run "asks them, then
goes on with the answer", but the PM is not in the session: an agent reading that literally either
takes the Developer's answer as the PM's, posts the question on the tracker unasked, or stops a run
that today finishes with a named open question (S1). A team reviews a pull request that edits its
own `CLAUDE.md`; the review dropped a gap there as "handled by the default", though the agent
following that file never reads the kit's rule 5 (S2). And above band 1, no round agent was told
what reach is, so only `boundary` returned one, and the merge had no rule for two rounds that
disagree on it (S6, S7).

Rule 5 now records an open question in the absent owner's name and sends nothing past the consent
line, stopping only when it can do neither. The default, the drop and the **Leave to the default**
form apply only to a rule an `atk` run follows, and `ordinary` is measured by the users of whatever
follows the rule. Every round agent is given rule 5's default, the two reach values and the five
consequences, returns a default-handled candidate marked rather than dropped, and the merge settles
reach before severity, `ordinary` winning a disagreement. The three fix forms gained the two cases
they missed: a false guessing clause is removed rather than rewritten (S4), and **Add a rule** covers
an `edge` finding kept for one of the five consequences (S3). The other findings are corrections
inside what was decided.

Lam Ngoc Khuong, design owner, chose on 2026-10-21: S4 as an exception to the form order rather than
a new order; S2 by limiting the default rather than taking project files out of scope; S1 and S3 as
the review proposed; all four recorded as Q5 to Q8 in the design's `Answered` table, the design and
ADR 0008 kept `APPROVED`; and every `SHOULD FIX` and `NIT` fixed. On the review of this fix he
chose one more, for S18: **Add a rule** also covers an agent file rule 5 does not govern, recorded
under Q7.

The fix was reviewed twice with `atk:review`. The first round raised no `BLOCKING` and two
`SHOULD FIX`, both from this fix's own wording, and both were fixed; the second round found none.
Six `NIT` remain for the author and the reviewer. Lam Ngoc Khuong approves this report and the pull
request.

## 1. Symptom as captured

The review report `docs/derived/reviews/141-261021-0816.md`, head `9dd6951`, 0 `BLOCKING`, 16
`SHOULD FIX`, 15 `NIT`. Its own summary, verbatim:

> The first is that the new rule 5 default has no route for its commonest case. A Developer runs
> `atk:plan` and meets a state the skill does not cover whose answer is the PM's. The rule says the
> run "asks them, then goes on with the answer". The PM is not in the session, and the rule gives
> neither the kit's usual move, an open question carrying the PM's name, nor the consent line before
> anything is posted (S1). The second is that the reach machinery reaches only the `boundary` round.
> No other round agent is told what reach is, and the merge steps never say how two rounds that
> disagree on reach are settled (S6, S7). The third is a set of gaps in the three forms: no form fits
> an `edge` finding with a protected consequence (S3), and a wrong guessing clause is rewritten
> rather than removed (S4).

Each finding's `File` and `Issue` lines are the symptom for that finding and are not repeated here.

## 2. Root cause

One cause per cluster, each a sentence that was written for the case the design had in view and
read by a case it did not:

- **S1, N1.** `plugins/atk/shared/team-roles.md:66-69` (at `9dd6951`) gave the default two moves,
  ask or stop, and no move for an owner who exists but is absent; its stop wrote "in its trace",
  which no event kind of `shared/run-trace.md` fits without a person.
- **S2.** `plugins/atk/skills/review/references/review-rounds.md:75-92` applied the default, which
  binds only `atk` runs, to every agent file the round's scope names, and defined `ordinary` by "the
  kit's users".
- **S3, S4.** `plugins/atk/skills/review/references/report-format.md:106-114` and
  `plugins/atk/shared/review-fix-loop.md:97-103` ordered the forms without the case where the false
  sentence is itself the guess, and limited **Add a rule** to "an ordinary case".
- **S6, S7, N15.** `review-rounds.md` passed reach to no round prompt (`:404-445`), had `boundary`
  drop candidates itself (`:83`), and settled severity in the merge without settling reach
  (`:461-474`).
- **S5, S8 to S16, N2 to N14.** Sentences left stale or narrow by the same change: the template
  example, the consequence list, the baseline items, the definition of done, the one-row form, the
  record of `atk:implement`, the fix job of `atk:orchestrate`, the check in `tests/verify.sh`, and
  three descriptions of `review-fix-loop.md`.

## 3. Evidence

Quoted lines, read at `9dd6951`, which was HEAD and the pull request head when the run began.

```
plugins/atk/shared/team-roles.md:68-69
   give, and otherwise names the person rule 3 gives it to and asks them, then goes on with the
   answer; a run with nobody to ask stops and names the case in its closing message and its trace.
```

Check: a run whose owner is named but absent matches neither "asks them" (nobody to ask in the
session) nor "nobody to ask" (the owner exists); `shared/run-trace.md` requires a person on a `stop`
line.

```
plugins/atk/skills/review/references/review-rounds.md:80-83
- **The default first.** A state no rule covers is a candidate only where the default of rule 5 in
  `shared/team-roles.md` goes wrong for it: [...] Where asking is safe and the person the default
  asks owns the answer, the candidate is dropped, listed under `## Verified and dropped`, [...]
```

Check: `:76` names "a project's agent instructions file" in the round's scope; the dropping agent
is a spawned round, while `:416-419` tells every round agent to return every candidate.

```
plugins/atk/skills/review/references/report-format.md:113-114
  **Add a rule**, where that default would give a wrong answer in an ordinary case, and the line then
```

Check: the design's own example S7 (design `:129`) is `edge` and kept at `SHOULD FIX`; no form fits.

The other findings were each read at the line the review cites, and each line says what the review
says it says. One hypothesis per finding, none ruled out.

## 4. Why it surfaced now

Introduced by `9dd6951` (feat: have atk:review weigh how often an agent rule's gap is met, and give
an uncovered state one default), the commit under review; nothing before it carried reach or the
default.

## 4b. Recorded intent, and the conflict when there is one

The design `docs/records/design/261021-0450-review-severity-by-reach.md` records Q4 (`:334`), the
scope line (`:184-187`) and the form order (`### The narrowest fix`). S1 and S3 extend them; S2
narrows the scope line's effect and the `ordinary` definition; S4 reverses the form order for one
case. Lam Ngoc Khuong, who made those decisions, was asked in the session at 09:10 and chose the
options in the summary above; the answers are recorded as Q5 to Q8 in the design.

## 5. The change

Prose edits in 20 files, each the narrowest sentence or clause that removes one finding. Rule 5 of
`shared/team-roles.md` gains the route for an absent owner and names the `end` line (S1, N1). The
`boundary` paragraph of `review-rounds.md` limits the default to `atk` rules, has the round return a
default-handled candidate marked for step 5 to drop, and defines `ordinary` by the users of whatever
follows the rule (S2, S6, S8, S10, N6); what each round agent is given and returns now carries reach
(S6), and merge steps 5 and 9 settle reach before severity (S7). `report-format.md` and
`review-fix-loop.md` carry the form exception and the wider **Add a rule** (S3, S4, S18), the record
of every form taken (S13), and the narrowest-form pointer in the `SHOULD FIX` row (N12); the
template example is a code finding with no reach (S5) and the one-row form keeps `(was S3)` (S12).
`review/SKILL.md` step 5 limits the drop to `atk` rules and counts it from any round (N15); step 6
cites the person's-data mask (S8), keeps an unplaceable consequence at its severity (S9, S17),
separates reach from step 4's edge cases (N11), excludes baseline items from "never lowers" (S10),
and points at the one-row form (N5); the definition of done names the default drop (S11). To stay at
299 lines, step 6's paragraph on `[k/N]` counts was removed: each of its clauses is stated in
`review-rounds.md` (merge steps 3, 4 and 8, and the closing paragraph of What the report adds).
`review-checklist.md` says a baseline default gives way to reach (S10). `atk:implement` names the
narrowest form in its loop and the form in its record (S13); the `atk:orchestrate` fix job names it
(S14); the fix template says where its per-finding lines go (N2). The check in `tests/verify.sh`
asserts rule 5's default and its four citers, the `edge`-to-`NIT` phrase, the reach values in the
`boundary` paragraph and the three form names (S15, N4 in part). Descriptions follow: `CLAUDE.md`,
both architecture documents (S16), both overviews (S2, S3, S4, S11, S17, N10, N14), both codebase
summaries (N3, the check row), ADR 0008 en and vi (S1 to S4, S18, N3, N13), and the design (Q5 to
Q8). Cross-references to the cap now name Cap in `report-format.md` (N9); the rounds owe the report
six things, the reach and drop counts the sixth (N8); the count line covers dropped candidates from
any round (N7).

Tidy: run by hand per `shared/tidy-pass.md`, on prose only; it rejoined two code spans a rewrap had
split and rewrapped one paragraph.

Reference documents: this kit's reference documents are `docs/`, and each one that describes the
changed rules moved with the fix, listed above.

Form per review finding fixed in section 6b, per `shared/review-fix-loop.md`:

- S17: **Correct**, the sentence that read as covering every consequence outside the five.
- S18: **Add a rule**, the wider condition; the state it opens is a rule added to a project's own
  agent file, which S2 already kept in scope. Chosen by Lam Ngoc Khuong at 10:42.

`shared/team-roles.md`, read by every run: 11,121 bytes before, 11,429 after.

## 6. Verified

- `bash tests/verify.sh`: 76 lines, every one `OK`, including
  `OK review reach in three files, five consequences, rule 5 default cited`. The new assertions were
  checked to fail: rewording rule 5's opening phrase made the check exit with "rule 5 of
  team-roles.md lost its default for an uncovered state".
- The `ak:`, `atkx`, em-dash, `fill:#` and symlink checks of `CLAUDE.md`: nothing printed for this
  change; the em-dash check prints one line from an older record,
  `docs/records/fixes/261016-0613-review-author-replies.md`.
- `wc -l plugins/atk/skills/review/SKILL.md`: 299.
- The reproduction: the earlier review's findings are prose defects, so the re-run is a review.
  Round 1 found 30 of the 31 closed and N4 open in the part section 9 leaves; round 2 found its own
  two `SHOULD FIX` closed, as section 6b says.

No CI job checks content; `.github/workflows/` carries release-please and the labeler only.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/141-fix-findings-261021-1012.md`: 0 `BLOCKING`, 2 `SHOULD FIX`, 4
  `NIT`. S17 fixed (**Correct**). S18 fixed (**Add a rule**, by the design owner's choice). N4 (in
  part), N16, N17, N18 left as `NIT`. N9 of the first review confirmed closed on the reason in
  section 9.
- Round 2, `docs/derived/reviews/141-fix-findings-261021-1051.md`: 0 `BLOCKING`, 0 `SHOULD FIX`, 6
  `NIT`, two of them new (N19, a 124-character line in `docs/vi/skills-overview.md`; N20, the
  design's opening note names Q5 to Q8 but not the later widening of Q7). Left as `NIT`.
- `atk:verify` not offered: the profile's Verify section says nothing in this repository runs.

Both rounds ran in one reviewer agent each, band 1, given paths and no conversation.

## 7. Not verified

- How an agent applies the new wording in a real review or fix loop, S4's form exception and S18's
  wider **Add a rule** above all: two PLAUSIBLE findings of the first review named one run each as
  the check, and neither was run.
- `tests/verify.sh` checks the presence of phrases, not that the five consequences keep their
  wording (N4).

## 8. Blast radius

Every file that cites what changed, from the earlier review's `callers` round and a search for
"default of rule 5", "Reach", and the three form names:

- `plugins/atk/skills/review/SKILL.md`, `references/review-rounds.md`, `references/report-format.md`:
  changed; read by both review rounds.
- `plugins/atk/shared/review-fix-loop.md`: changed; cited by `atk:implement`, `atk:fix` and
  `atk:orchestrate`, each read for the loop wording (`implement` and `orchestrate` changed, `fix`
  SKILL.md defers to the file and was read, unchanged).
- `plugins/atk/shared/team-roles.md` rule 5: read by every skill; no skill restates the default,
  checked by a search for its phrases.
- Docs describing these: changed in both languages, as section 5 lists.

## 9. Left for later

- `plugins/atk/skills/review/references/review-rounds.md`, `## Merging what comes back`: the steps
  run 1 to 5 then 7 to 10, with no step 6. Present on `main` before this change; not touched here.
- N9 at `plugins/atk/skills/review/SKILL.md:255` is left: "the cap in step 6" names that file's own
  step 6, which states the cap and points at Cap in `references/report-format.md`.
- N4 in part: the check now asserts the `edge`-to-`NIT` phrase, the reach values inside the
  `boundary` paragraph, the three bold form names and rule 5's default with its four citers; it
  still does not check the wording of each of the five consequences.
- The open question of the review on the name "Đức Anh" in the design's examples is Lam Ngoc
  Khuong's to answer; this run did not change it.
- The six `NIT` of the review of this fix, N4 in part and N16 to N20, are left for the author and the
  reviewer, per `shared/review-fix-loop.md`.
