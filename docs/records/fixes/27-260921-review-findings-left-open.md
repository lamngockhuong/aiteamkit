---
title: "Fix: ten findings from the PR 27 review were merged into main unresolved"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-21
updated: 2026-09-21
ticket: https://github.com/lamngockhuong/aiteamkit/pull/27
---

# Ten findings from the PR 27 review, closed

`docs/derived/reviews/27-260921.md` reviewed the branch behind PR 27 and reported ten findings, then
recorded that sixteen more had been cut by its own ten-finding cap. PR 27 merged as `6a754a5`.
Commit `c57efe5` on that branch closed the four `BLOCKING` findings and three smaller ones. The rest
merged unresolved.

## 1. Symptom as captured

Reported by the owner, verbatim:

> Mười sáu phát hiện từ review PR 27 vẫn chưa xử lý và đã theo vào main. Danh sách ở
> docs/derived/reviews/27-260921.md

The review document says, at its `## Cut by the ten-finding cap` section:

> Sixteen findings were cut: five at `SHOULD FIX`, eleven at `NIT`. No `BLOCKING` finding was cut. A
> second pass is owed.

It then lists the five at `SHOULD FIX` and none of the eleven at `NIT`.

Environment: branch `main` at `dd63c85`, working tree clean, `.atk/profile.md` present.

## 2. Root cause

Two mechanisms, not one.

**The sixteen.** `atk:review` caps a report at ten findings and, for the rest, writes a count and a
sentence rather than the findings. The five at `SHOULD FIX` were named; the eleven at `NIT` exist
only as the number eleven. The agents that raised them have ended, and `docs/derived/` is in
`.gitignore`, so no other copy was ever written. There is nothing to fix for those eleven, and this
report does not claim to have fixed them.

**The ten that are on record.** Each is a contradiction between two lines that are both still on
disk. Five are findings 5, 6, 8, 9 and 10 of the reported ten, which `c57efe5` did not reach; five
are the `SHOULD FIX` findings the cap cut. Locations:

| # | Mechanism | Location |
|---|-----------|----------|
| 5 | A Definition of done checkbox forbids what two template sections require | `skills/catchup/SKILL.md:190` against `references/brief-template.md:98-100` and `:104-105` |
| 6 | Three lists of unit kinds disagree once the grouping rule makes rows and groups correspond | `skills/catchup/SKILL.md:99`, `references/brief-template.md:73`, `references/understanding-check.md:31` and `:71-81` |
| 8 | `9a.` is not an ordered-list marker, so the numbered list ends at question 9 | `skills/catchup/references/understanding-check.md:66` and `:106` |
| 9 | Step 1 opens the skill file before the mode that resolves the skill name has run | `skills/tailor/SKILL.md:73-75` against `:160-174` |
| 10 | The `description:` was left behind by the boundary the other three surfaces carry | `skills/catchup/SKILL.md:3-11`, `evals/trigger_evals.json` |
| A | The role sub-table writes out the answer to question 2, unfolded, four sections early | `references/brief-template.md:77-81` against `references/understanding-check.md:49` |
| B | `## Roles` and `## Ticket` name only the developer, after step 5 created two more readers | `skills/catchup/SKILL.md:41-42` and `:176-178` against `:138-141` |
| C | The diagram is anchored to the scope section, after the role information moved to section 4 | `skills/catchup/SKILL.md:165`, `shared/diagram-conventions.md:86` |
| D | "All of them means one record each" against a single `--out <path>` and an eight-question cap | `skills/tailor/SKILL.md:166` against `:59` and `:213` |
| E | Rule 2 counts sessions without the `atk` filter; the Definition of done counts with it | `skills/tailor/SKILL.md:162` against `:224` |

Hypotheses tried: none. No hypothesis was needed. Every one of the ten is a pair of lines that can be
opened and read against each other, which is the third accepted evidence form and not a theory about
a cause.

## 3. Evidence

**Finding 8, direct reproduction.** The shape block at `understanding-check.md:93-111`, rendered
with `marked@12`:

```
$ printf '1. a\n\n9a. b\n\n10. c\n' | npx marked@12
<ol>
<li>a</li>
</ol>
<p>9a. b</p>
<ol start="10">
<li>c</li>
</ol>
```

The list carrying questions 1 to 9 closes, `9a.` becomes a paragraph, and question 10 opens a second
list. The file teaches this form in the block a run copies.

**The other nine, quoted lines with the check.** Each is a pair, and reading them together is the
check:

- Finding 5: `SKILL.md:190` says "Everything step 3 traced is in section 4, not spread across the
  prose sections". `brief-template.md:104-105` says every risk "names the trap and the file or the
  rule that governs it", and `:98-100` says a term names "where that meaning is defined". A brief
  that obeys the template fails the checkbox.
- Finding 6: `SKILL.md:99` traces "the modules, the entities, the endpoints, the screens".
  `brief-template.md:73` offers `screen / endpoint / job / entity`. A module has no Kind; a job is
  never traced; `:73` asks "Who reaches it" of a scheduled job that nobody reaches; and the feature
  type table at `understanding-check.md:71-81` has no row an entity fits.
- Finding 9: `tailor/SKILL.md:73-75` opens `skills/<skill>/SKILL.md`, "Both, always". Under
  `--feedback` with no name the name exists only after the rules at `:160-174`, which sit after step
  5. No line sends the run back to step 1.
- Finding 10: `README.md:47` and `docs/skills-overview.md:107-109` both carry the section 4 table and
  the `atk:spec` boundary. `SKILL.md:3-11` carries neither, and `evals/trigger_evals.json` had no
  `should_trigger: false` line for the boundary, so it could not be measured.
- Finding A: `understanding-check.md:49` asks "Which roles can reach this". `brief-template.md:77-81`
  builds a table of exactly that, four sections earlier and unfolded.
- Finding B: `SKILL.md:138-141` names two readers for the merged-code case. `:41-42` and `:176-178`
  know only "the developer".
- Finding C: `SKILL.md:165` and `shared/diagram-conventions.md:86` both put the diagram under the
  scope section. Role information moved to section 4 in `7421614`.
- Finding D: `:166` can produce N records; `:59` gives `--out` one path; `:213` caps the run at eight
  questions while `:155` asks one question per finding.
- Finding E: `:162` reads "Where more than one ran". `:224` reads "more than one `atk` skill".

## 4. Why it surfaced now

Findings 5, 6, 8, 9 and 10 have been reachable since `6a754a5` merged on 2026-09-21. Findings A to E
have been reachable since the same merge: all five are consequences of section 4, which `7421614`
created on that branch. None predates PR 27.

The review that found them ran before the merge and reported them. They surfaced now because nothing
carried them forward: `atk:review` does not rewrite what it reviews, `--comment` was not passed, and
the review document lives under `docs/derived/`, which is gitignored.

## 4b. Recorded intent, and the conflict when there is one

Searched: `git log -S` on each changed line, the four commit bodies on the PR 27 branch, the plans
under `plans/`, and the `## Refuted` section of the review document.

One decision was found, and it does not conflict. `f28928f` records the `9a` to `9c` lettering as
deliberate: the labels exist so that `question 10` names the same question in every group. The fix
for finding 8 keeps the labels and changes only the Markdown form they are written in, from a list
marker that no renderer accepts to a bold paragraph. The recorded intent is preserved.

Three things the review had already refuted were left alone on purpose: the `references/` citation
spelling, the `--no-check` reader objection, and rule 1 counting the in-flight `atk:tailor` run.

No other decision contradicts any of the ten. `7421614` states that a section 4 row carries "where
the unit lives", which is what makes a module the path rather than a unit, so finding 6 is fixed in
the direction that commit already chose.

## 5. The change

Ten fixes, each the smallest that removes its contradiction, in seven files.

`skills/catchup/SKILL.md`: the `description:` gained the section 4 clause and the `atk:spec`
boundary (10); step 3 names the four kinds section 4 has a row for and says a module is the path
(6); `## Roles` points at step 5 for who inherits the check (B); `## Ticket` says "whoever wrote
them" (B); `## Output` moves the diagram to section 4 (C); the checkbox is about units rather than
every traced path (5).

`references/brief-template.md`: a unit no person reaches names its trigger in the last column (6);
the role sub-table states that it is question 2's reference answer and that nothing is hidden here
(A).

`references/understanding-check.md`: question 2 gets the paragraph that says the folded block points
at the sub-table rather than restating it (A); a group no feature type row describes adds none (6);
the label rule says bold paragraph and not list marker, with the reason, and the shape block teaches
`**9a.**` (8).

`skills/tailor/SKILL.md`: step 1 says the `--feedback` rules run before it (9); the four rules say
the same and that the run returns to step 1 (9); rule 2 gained the `atk` filter (E); rule 2 says
what `--out` means for more than one record (D); the Definition of done scopes the eight-question cap
to the step 2 interview (D).

`shared/diagram-conventions.md`: the `catchup` row points at section 4 (C).

`skills/catchup/evals/trigger_evals.json`: two `should_trigger: false` lines for the `atk:spec`
boundary, English and Vietnamese (10).

`docs/skills-overview.md` and `docs/vi/skills-overview.md`: one sentence each, because the fix to
rule 2 obliged them. This is the `shared/spec-docs.md` sync obligation and the only reference
document the change moved.

Two files changed for a reason outside the ten, and both were approved by the owner during the run.
`CLAUDE.md` and `.atk/profile.md` now put `docs/records/` outside the bilingual docs layer, beside
`docs/derived/`, and the mirror check excludes both. Without it, this report would have been the
first file under `docs/records/` and would have broken `CONV-002` on a fresh clone. The check had
also been failing locally on `docs/derived/`, which the profile already excluded in prose but the
command did not.

**Tidy step.** Ran the host's code clean-up capability, `/simplify` in Claude Code, bounded to the
lines this fix touched, per `shared/host-capabilities.md`. It returned eleven findings. Eight were
applied: three over-long lines rewrapped, the ordering rule in `tailor/SKILL.md` stated once instead
of twice, the reasoning clause pulled back out of `shared/diagram-conventions.md` so the shared table
carries a location like its other rows, the pair of readers in `## Roles` reduced to the pointer at
step 5, two paragraphs moved next to the rule they qualify, and one doubled contrast removed. Three
were skipped: the four unit kinds stay listed in step 3 because removing the list is what created
finding 6; the `atk:spec` sentence in the `description:` is the source of a documented mirror, not a
duplicate; and the two added paragraphs about the role sub-table carry different obligations on
either side. Nothing outside the fix's own lines was touched. The reproduction was re-run after the
pass and still does not reproduce.

## 6. Verified

Content layer, per `shared/layer-verification.md`, with the commands from the Commands section of
`.atk/profile.md`, which is `CLAUDE.md` section "Common verification commands". The whole block was
run rather than read, which `.atk/overrides/review.md` requires of a diff that touches it, and this
diff does.

| Check | Result | What it proves |
|-------|--------|----------------|
| Five manifests parse | pass | No JSON was broken by the eval edit |
| 21 `SKILL.md` names match their folders | pass | `CONV-005` holds |
| `docs/` mirrors `docs/vi/` | pass | `CONV-002` holds under the exclusion the same commit records |
| `hooks.json` parses, both hooks `node --check`, exec form | pass | `CONV-009` holds; the hooks were not touched |
| `check-profile.mjs` silent with a profile present | pass | The profile edit did not change what the hook decides |
| Every `evals/trigger_evals.json` parses and is a non-empty array | pass | The two added lines are well formed |
| No `\bak:` in `skills/`, `shared/`, `README.md`, `docs/` | pass | `CONV-004` holds |
| No em-dash outside the two documenting files | pass | `CONV-003` holds |
| No hardcoded diagram fill | pass | `CONV-007` holds |
| `wc -l` on both changed `SKILL.md` | 201 and 234 | `CONV-006` line ceiling holds |
| Six version-bearing files agree | all `0.0.3` | `CONV-008` holds; no version was touched |

**Captured reproduction, re-run.** The shape block as it now stands, through `marked@12`:

```
<p>... questions 2 to 9 in the same shape ...</p>
<p><strong>9a.</strong> &lt;question from the feature type row, up to three, same folded shape&gt;</p>
<ol start="10">
<li><p>Which of the questions above could you not answer from the spec?</p>
<p>&lt;no reference answer, ever&gt;</p>
</li>
</ol>
```

The label renders as what the file now says it is, and question 10 renders as a list item with its
continuation paragraph inside it. The failure captured in section 3 no longer reproduces.

## 7. Not verified

- **Trigger behaviour of the changed `description:`.** The two new `should_trigger: false` lines
  parse, and the file is well formed. Whether the harness actually declines to fire `atk:catchup` on
  them was not measured. `docs/trigger-eval-measurement.md` says why a generic eval harness returns a
  number that is not one, and the procedure it describes was not run here.
- **The eleven `NIT` findings.** Not fixed and not recoverable. They were never written down.
- **Rendering in the trackers a brief is actually pasted into.** The `9a` fix was proven against
  CommonMark through `marked`. GitHub, Jira, Backlog and Redmine each render Markdown slightly
  differently and none of them was tested.
- **The `docs/records/` exclusion on a fresh clone.** Checked against this working tree only.

## 8. Blast radius

| Caller | Marked |
|--------|--------|
| `skills/catchup/references/brief-template.md`, reads the section 4 contract | exercised: read against the changed step 3 and checkbox |
| `skills/catchup/references/understanding-check.md`, reads the section 4 rows | exercised: the grouping rule and the feature type table read against the changed Kind list |
| `shared/diagram-conventions.md`, cited by `catchup`, `design-doc`, `plan`, `breakdown`, `incident` | exercised: only the `catchup` row changed; the other four rows and every citing skill were grepped for "the scope section" and none points at it |
| `skills/tailor/references/feedback.md`, loaded by the `--feedback` step | exercised: read; it holds the three-way fork and restates none of the four rules, so rule 2 and the cap are stated once |
| `docs/skills-overview.md` and its `docs/vi/` mirror | exercised: the `atk:tailor` paragraph moved with rule 2; the `atk:catchup` paragraph was read against the changed behaviour and needs nothing, because it describes the table without enumerating kinds and names the habit rather than the role |
| `README.md:47`, `docs/flow/skill-chain.md:72`, `docs/flow/project-flow.md:119` | exercised: read; each states the artifact and its approver, neither of which changed |
| `.github/ISSUE_TEMPLATE/skill-run-report.yml` | exercised: read; it already carries the current `--feedback <skill>` invocation |
| Every other `SKILL.md` citing `shared/diagram-conventions.md` | not exercised individually beyond the grep above |

## 9. Left for later

- **The eleven `NIT` findings from the PR 27 review are gone.** Recovering them means running
  `atk:review` again over the PR 27 diff at the current state of `main`, which will produce a
  different list. This is the second pass the review said was owed, and it is still owed.
- **`atk:review` loses a finding it cuts.** The cap keeps the report readable and the count honest,
  but a cut finding leaves no text behind. Writing the cut findings to a second file, or to an
  appendix under a fold, would cost nothing a reader pays for and would have made this fix
  unnecessary. This is a change to `skills/review/`, not to the report format.
- **Two pieces of drift the review recorded and this fix did not touch**, because neither is one of
  the ten: `skills/tailor/SKILL.md:141` says `references/audit.md` holds two checks while
  `docs/codebase-summary.md:102` says three; and the count in `docs/flow/skill-lifecycle.md:72` does
  not reproduce under any obvious way of counting.
- **The PR 27 body claims its commits revert one at a time.** The review showed `f28928f` does not,
  because `7421614` rewrote the same paragraph. The claim is in a merged pull request body and was
  left as it is.
