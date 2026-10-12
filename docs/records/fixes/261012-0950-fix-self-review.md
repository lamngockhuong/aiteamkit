---
title: "Fix: a contract-changing atk:fix reached its pull request with no review of its own diff, and a document sentence that the code did not yet honour"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-12
updated: 2026-10-12
ticket: docs/derived/feedback/fix-261012.md#1, docs/derived/feedback/fix-261012.md#2 (local feedback record, not committed)
---

# Fix: `atk:fix` reviews its own change, and a moved reference document has to be true

## In short

A run of `atk:fix` on a client project fixed a defect correctly. The cause was proven by a red
test, and the contract document was moved with the code. The pull request then drew a `BLOCKING`, a
`SHOULD FIX` and a `NIT` from `atk:review`, and all three sat in lines the fix itself had written:

- A new contract sentence stated a rule with no exception, while the same run's report listed a
  branch of the code that does not follow it yet.
- A widened condition had no test that it stays closed for the cases it must still reject.

Two more commits and a second CI run followed.

Two causes, both in the definition:

- `atk:fix` has no step that reads its own diff. `atk:implement` has one.
- The sync obligation asks for the document to move, never for it to be true.

What changed:

- `atk:fix` now has step 6, "Review and fix". It moves the reference document first, checks each
  sentence it wrote against every branch of the code and against what the report leaves for later,
  drafts the report so the reviewer can read the cause, and runs the review loop that
  `atk:implement` already ran. That loop now lives in `shared/review-fix-loop.md`, so both skills
  run one copy. `--no-review` opts out and leaves a line in the report.
- The sync obligation in `shared/spec-docs.md` now asks for the document to be true, and
  `atk:review` checks that it is.

Lam Ngoc Khuong decided the review always runs, with an opt-out. Approval is theirs.

## 1. Symptom as captured

From the feedback record, the part about the definition, quoted with every detail of the client's
project and business removed per `CONV-010`:

```
| 1 | A fix that changes a public contract reaches the pull request without any review of its own diff | BLOCKING | The definition | silent (skills/fix/SKILL.md:127-171) |
| 2 | The contract sentence the fix wrote was not checked against the gaps its own report listed | BLOCKING | The definition | silent (shared/finalize-steps.md:41-50, skills/fix/SKILL.md:163-171) |
| 3 | <a finding local to the client project> | NIT | Local to this project | silent; written to that project's .atk/overrides/fix.md |

What it cost: three findings raised against the open PR, B1 (doc contradicts code), S1 (the widened
condition had no test that it still rejects what it must: a mutation admitting every case passed
every test), N1 (local to the project); two follow-up commits, a second CI run, and the approver's
time on issues the run could have found.
```

Expected: a contract-changing fix arrives at the human reviewer with its own review already run and
its blocking findings fixed, the way an implementation does. A contract sentence the code does not
honour yet is either qualified in the document or the gap is fixed.

Finding 3 is local to that project and went into its own override. It needs no change here.

## 2. Root cause

There are two mechanisms, one for each finding:

1. **No step reads the diff.** The workflow of `atk:fix` went from the tidy step straight to the
   report. Every check before that asked whether the change works: the reproduction, the callers,
   the CI gate. None read the diff for what it newly claims or admits.
   - Location: `plugins/atk/skills/fix/SKILL.md:70-71` at `HEAD`, the pipeline, and `:163-173`,
     step 6.
2. **The sync obligation stops at "moved".** It requires the document to move with the change, and
   says nothing about whether what the document now states holds for every branch of the code.
   - Location: `plugins/atk/shared/spec-docs.md:198-227` at `HEAD`, "The sync obligation". It is
     reached through `plugins/atk/shared/finalize-steps.md:41-55`.

## 3. Evidence

Quoted lines, and the check that shows they produce the behaviour.

```
$ git grep -n "review" HEAD -- plugins/atk/skills/fix/SKILL.md
HEAD:plugins/atk/skills/fix/SKILL.md:4:  Fix a defect the way a team reviewer will accept: capture the failure verbatim, prove the cause
HEAD:plugins/atk/skills/fix/SKILL.md:19:a guess with a diff attached, and the review that catches it costs more than the investigation would
HEAD:plugins/atk/skills/fix/SKILL.md:32:fix touched, and writing the report a reviewer can check against the evidence.
HEAD:plugins/atk/skills/fix/SKILL.md:35:the severity, and the client communication while users are down; reviewing somebody else's change
HEAD:plugins/atk/skills/fix/SKILL.md:36:(`atk:review`); building a feature (`atk:implement`); or deciding whether the current behaviour
HEAD:plugins/atk/skills/fix/SKILL.md:41:Dev investigates and fixes. Tech Lead reviews, and is the one who answers when the intent check
```

`atk:review` is named once, at `:36`, and there it is on the list of what the skill does NOT do. No
step calls it. Compare `plugins/atk/skills/implement/SKILL.md:72-73` at `HEAD`, whose pipeline has
`[5. Review and fix]`.

```
plugins/atk/shared/spec-docs.md:200 (HEAD)
A change that alters a public contract carries its reference document in the same pull request.
plugins/atk/shared/spec-docs.md:225 (HEAD)
The obligation is the author's. `atk:review` checks that it was met or that the skip was stated
```

"Carries" and "met" are satisfied by a document that moved and states something the code does not
do. Neither the author's rule nor the reviewer's check asks for more.

Hypotheses: 2, one per finding, both proven, none ruled out.

## 4. Why it surfaced now

It has been broken since `atk:fix` was written, in `cf90c7f` "feat: add atk:catchup, atk:fix and
atk:plan (#3)". `atk:implement` gained its review loop afterwards, and `fix` was never brought level
with it. The gap shows only on a fix that changes a public contract, and the run in the feedback
record was the first such fix reported.

## 4b. Recorded intent, and the conflict when there is one

No conflict. I searched:

- `docs/records/design/`, `docs/adr/`;
- the commit messages that touched `skills/fix/SKILL.md` before and after the move under `plugins/atk/`.

No record says `atk:fix` skips the review on purpose. `docs/flow/skill-chain.md:92` lists `review`
and `verify` among what follows `fix`.

The feedback left one question open: should the review be conditional on a contract change, or run
on every fix with an opt-out? It was put to Lam Ngoc Khuong, who chose every fix with `--no-review`,
like `atk:implement`.

## 5. The change

The change has three parts.

**1. `atk:fix` gains a review step.** In `plugins/atk/skills/fix/SKILL.md`, step 6 "Review and fix"
sits between the tidy step and the report, which becomes step 7. In order, step 6:

- moves the reference document;
- checks each sentence it wrote against every branch of the function and against section 9 of the
  report;
- writes the report as a draft at its final path, because the reviewer is an agent given paths
  rather than the conversation;
- states the cost;
- runs the loop.

The rest of the skill moves with it:

- `--no-review` is in the frontmatter, the invocation and the profile precondition, which now
  includes the Team section the escalation needs.
- The progress log records each review round.
- A clean loop offers `atk:verify`.
- The Definition of done gains three items.
- `references/report-template.md` gains section 6b, "Reviewed".

**2. The loop becomes shared.** `plugins/atk/skills/implement/references/review-fix-loop.md` moved to
`plugins/atk/shared/review-fix-loop.md`, now that it has two citers:

- the cost paragraph moved into it from `atk:implement` step 5;
- "step 6" and `references/verification.md` became the calling skill's steps;
- the `atk:verify` offer names what a fix verifies;
- `atk:implement` cites the new path.

**3. The sync obligation asks for truth.** `plugins/atk/shared/spec-docs.md` now says carrying the
document means leaving it true. A branch that does not honour a sentence yet, a case left for later
included, is stated beside the sentence with who decides, or else the gap is closed. `atk:review`
checks this. `plugins/atk/shared/artifact-paths.md` carries the review-round count over on resume
for `atk:fix`.

These docs moved with the change, in both languages where a mirror exists:

- `CLAUDE.md`: the shared table and count, now nineteen.
- `docs/system-architecture.md`: nineteen files, fourteen contracts, and a new bullet.
- `docs/codebase-summary.md`: the moved row and the `fix` row.
- `docs/flow/skill-lifecycle.md`:
  - `fix` calls `review` and offers `verify`;
  - two new diagram edges;
  - 181 mentions in 109 pairs.
- `docs/skills-overview.md`: the `fix` entry.
- `README.md`: the invocation line and the `fix` row.
- `plugins/atk/skills/review/references/review-rounds.md`: the two lines that named `implement` as
  the only caller.

Wider than a one-file fix, and why: the loop had to become shared rather than be copied. CLAUDE.md
puts a rule two skills need in `shared/`, and two copies of the ceiling would drift.

Tidy step: done by hand, since the change is prose. It found one real defect: the document was moved
at step 7, after the review, so the review could never see it. The document move and the sentence
check went into step 6, before the call. The tidy step also re-wrapped the lines it touched.

## 6. Verified

- **Layer content and docs:** `CLAUDE.md`, section "Common verification commands", run whole after
  each round. 67 OK lines and nothing else. That proves:
  - every citation resolves inside its plugin, the new `shared/review-fix-loop.md` included;
  - `docs/` and `docs/vi/` mirror;
  - names match their folders;
  - no `ak:` command, no misplaced `atkx`;
  - manifests, hooks, labeler, secret scan and skill-eval are unchanged.
- **Em-dash check:** prints nothing, and no added line carries U+2014.
- **Mention count:** recounted with a script that gives 174 in 108 pairs on `HEAD`. It gives 181 in
  109 on the working tree; the new pair is `fix` to `verify`.
- **Length:** `plugins/atk/skills/fix/SKILL.md` is 281 lines and `plugins/atk/skills/review/SKILL.md`
  299, both under 300.
- **Reproduction re-run:** the quoted-lines check of section 3, run on the working tree, finds step 6
  calling `atk:review`, and the sync obligation requires the document to be true.

## 6b. Reviewed

Two rounds of `atk:review`, band 1, one read-only reviewer agent each, over a masked `--worktree`
diff. Nothing was masked.

- **Round 1** (`docs/derived/reviews/fix-skill-self-review-261012-1050.md`): 0 `BLOCKING`, 4
  `SHOULD FIX`, 5 `NIT`.
  - `S1`: the cost rule was cited but still lived in `implement`. Fixed: moved into the shared loop.
  - `S2`: the `atk:verify` offer had no place in `fix`. Lam Ngoc Khuong decided `fix` offers it;
    added to step 6, section 6b, the Definition of done, and both diagrams.
  - `S3`: review rounds were not logged, so a resume could pass the ceiling. Fixed in the log rule
    and in `artifact-paths.md`.
  - `S4`: the cause and the left-for-later list could not reach a reviewer given only paths. Fixed:
    the draft report is written first and passed as intent.
- **Round 2** (`docs/derived/reviews/fix-skill-self-review-261012-1130.md`): S1 to S4 closed, 0
  `BLOCKING`, 1 new `SHOULD FIX`, 3 new `NIT`.
  - `S5`: the draft had no named path, and step 7 would write a second report. Fixed: the draft is
    the report at its `## Output` path, logged, and completed at step 7.

The ceiling was reached and no third round ran, so the S5 fix is checked by the verification block
only.

- **Pull request review** (`docs/derived/reviews/117-261013-0412.md`, band 2, run on the pull
  request after the loop): 0 `BLOCKING`, 15 `SHOULD FIX`, 16 `NIT`. Lam Ngoc Khuong asked for
  three of them to be fixed in this pull request:
  - `S14`: this record and the pull request body kept wording from the client's business. Fixed:
    every such detail removed, section 1 included; Lam Ngoc Khuong ruled that nothing of a client's
    business may appear, which `CONV-010` covers.
  - `S10`: `atk:implement` still moved the reference document after its review. Fixed in Calling the
    review of `shared/review-fix-loop.md`, which now moves it before the first call for both
    callers, and in `implement` steps 5 and 6.
  - `S20`: a deliberate skip of the document could not reach the review, since no pull request
    exists yet. Fixed: the stale-document line goes to the review with the intent, `fix` writes it
    in section 9 of the draft, the template gains a reference-documents line in section 5, and
    `atk:review` step 4 accepts the line from the intent.
  The other findings of that review are open and listed there; none of these three fixes has been
  reviewed again.
- **`NIT`s:** `N1` to `N8` are left for the author, as the loop requires. They are listed in section 9.
- **`atk:verify`:** not offered. This repository has nothing that runs; its profile's Verify section
  says the checks in section 6 stand in.

## 7. Not verified

- **No real fix run against the new step 6.** Nothing has yet shown that a contract-changing fix
  writes its draft, passes it to the reviewer, and ends with one report. That is round 2's
  `PLAUSIBLE` for S5 and round 1's for S4. The check is to run `atk:fix` on such a defect through
  step 7 and list `docs/records/fixes/`.
- **The S5 fix itself.** It was never reviewed, because the ceiling stopped at two rounds.
- **Triggering.** The description of `fix` gained a clause, but no trigger eval was run, per
  `docs/trigger-eval-measurement.md`. The trigger phrases themselves did not change.
- **Other harnesses.** Cursor and Codex were not run. The change is prose that all three read
  alike.

## 8. Blast radius

Every other reader of what changed:

- `plugins/atk/skills/implement/SKILL.md:166-198`: cites the moved loop and the moved cost paragraph.
  Exercised: the citation check resolves both, and the text was read.
- `plugins/atk/shared/finalize-steps.md:41-55`: reaches the sync obligation. Not edited, and it
  inherits the new paragraph. Read.
- `plugins/atk/skills/review/SKILL.md:142-147`: the `contract` round's `BLOCKING` condition. It does
  not yet name an untrue document; see `N5` in section 9. Not exercised.
- `plugins/atk/skills/spec/`: writes documents under the same obligation. Not edited and not
  exercised.
- `plugins/atk/skills/verify/SKILL.md:94-96`: receives the new offer from `fix`. Round 2 checked
  that its preflight accepts criteria given in the prompt.

## 9. Left for later

The `NIT`s of the two reviews, which the loop does not fix:

- `N1`: `shared/review-fix-loop.md`, "Not the full order every time" still speaks of `implement`'s
  run order.
- `N2`: `shared/secret-scan.md:281` names `implement` alone as handing over an uncommitted change.
- `N3`: `docs/project-roadmap.md` and its mirror list shared contracts without `review-fix-loop.md`,
  and without `secret-scan.md`, which was already missing.
- `N4`: long lines left by mid-line edits in `review-fix-loop.md`, `artifact-paths.md:364`,
  `review-rounds.md:368` and `:515`, and `skill-lifecycle.md`.
- `N5`: `spec-docs.md`, the `atk:review` sentence can read as three alternatives, and
  `review/SKILL.md` step 4 does not yet name an untrue document as `BLOCKING`.
- `N6`: the header of `fix/references/report-template.md` says "step 7" only, though step 6 now
  drafts from it.
- `N7`: the `fix` entry of `docs/skills-overview.md` and its mirror says the progress log records
  hypotheses only.
- `N8`: the descriptions of `review-fix-loop.md` in `CLAUDE.md` and in both
  `system-architecture.md` files leave out the cost statement and the `atk:verify` offer.
