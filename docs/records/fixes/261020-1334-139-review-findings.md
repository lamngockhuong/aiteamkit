---
title: "Fix: the review of PR #139, where atk:spec --from asked nothing and the new design and trace rules disagreed with older text"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong (Tech Lead)
created: 2026-10-20
updated: 2026-10-20
ticket: https://github.com/lamngockhuong/aiteamkit/pull/139 (findings B1, S2 to S22, S24 to S28 and N1 to N25 of the review of PR #139, 2026-10-20 11:55)
---

# Fix: the review of PR #139

## In short

The review of PR #139 found one thing that blocked the merge: the maintainer chose that
`atk:spec --from` searches for the documents a design makes untrue and asks about them, and the
change made it search and ask nothing. Run `atk:spec <api doc> --from <design>` on a design that
adds a status to an enum it never names, and the run printed the enum document and went on. It now
asks once which of the documents found to write too, and writes the ones the person says yes to in
the same run, as the maintainer chose on 2026-10-20.

The rest were places where the new rules of PR #139 met older text and the two disagreed: the
definition of done of `atk:design-doc` told `--answer` to supersede an approved design the mode
refuses to touch, the README said any record may be edited until approved, and `run-trace.md` left a
run that stops early, a mode that replaces steps, a run past midnight and an answer given in the
prompt without one line to write. Each now has one reading. Lam Ngoc Khuong chose three of them on
2026-10-20: a trace closes at midnight and goes on in a new one; an answer given in the prompt is a
`gate` line named for whoever brought it; an answer from someone other than the named person leaves
the question open until the approver settles it. All twenty-five `NIT` findings were fixed too, at
the maintainer's word.

Five corrections belong to the record PR #139 committed,
`docs/records/fixes/261020-1032-none-run-trace-and-design-doc-feedback.md`. It is committed, so per
Before writing in `plugins/atk/shared/artifact-paths.md` it is not edited; they are stated here and
go into the pull request body:

- **B1.** Its section 5 says `--from` "asks nothing" (`:295`). The rule chosen for SP1 (`:170`) is
  that it searches and asks, and this change makes it so.
- **S3.** Its DD2 bullet says the README "now says the same" as the lifecycle row. It did not; the
  README now says a record is never edited, apart from a design and its ADR while in review.
- **S27.** It cites its two review rounds by paths under `docs/derived/`, which a reader of the pull
  request cannot reach. They are the two `atk:review` runs of 2026-10-20 at 10:55 and 11:01.
- **N10.** Its old line numbers at `:96-97` and `:158` are off by one to eight.
- **N11.** "as plans already do" (`:111`) is not exact: a plan is edited in place even at
  `APPROVED`, until a phase starts.

The fix was reviewed twice with `atk:review`. The second round raised two more, S5 and S6 of that
review; Lam Ngoc Khuong chose for S6 that a decision recorded through `--answer` passes the same gate
as S20, and both were fixed after the last review call, so they have not been reviewed again.

Lam Ngoc Khuong, as Tech Lead, is the approver of this report and the change.

## 1. Symptom as captured

The findings as the review stated them, `docs/derived/reviews/139-261020-1155.md`, base `main` @
`71ff246`, head `7662946`, 19 files, 710 lines. The review's head is the commit this run started
from, so every line it cites is current.

```
B1. `--from` asks nothing, but the rule chosen for SP1 is that it searches and asks
  plugins/atk/skills/spec/references/affected-documents.md:25-31, plugins/atk/skills/spec/SKILL.md:106-107
  Run `atk:spec <api doc> --from <design>` on a design that changes a status enum it never names.
  The search finds the enum document, prints it with the line that writes it, and goes on writing
  the api document without a question.
S2.  The definition of done tells `--answer` to supersede an approved design; the mode stops instead
S3.  The README now says every record may be edited until it is approved
S4.  The design exception does not name the rules it overrides, and a paragraph after it now points the wrong way
S5.  A design path given without `--answer`, or a plain rerun on a design in review, has no procedure
S6.  Open questions have no fixed heading, so `--answer` stops on every design written before this change
S7.  `skipped (not requested)` is also what a run that stopped early would write for its later steps
S8.  No line is defined for steps a mode replaces
S9.  The trace example breaks the new step rule
S10. A headless run refused the version command gets two answers
S11. The skills that read one profile line must now read the Team table
S12. The `--answer` trace never shares a subject with the run that wrote the design
S13. Answers given in the prompt are a `gate` line in one file and no line in the other
S14. "One trace is one session" leaves midnight and a resumed conversation open
S15. The search prints an `atk:spec` line for documents `atk:spec` cannot write
S16. The search misses a member repository's docs tree
S17. A requirement document passes the "not a design" check
S18. A design with no status, or a status the kit does not define, matches no branch
S19. `--answer` with the other flags is not defined
S20. An answer from the wrong person reads as settled before the approver rules
S21. `--answer` re-checks citations against the code without asking which repository holds it
S22. The version command can run an unexpected binary and widen a stored permission
S24. `--answer` writes the answerer's name while its definition of done forbids a real person's data
S25. A trace now holds a command's output, which the same file forbids
S26. `git config user.name` is undeclared, and can credit the wrong person
S27. The fix report cites review files a reader of the pull request cannot reach
S28. Eval coverage of `--answer` is one-sided across languages
N1 to N25: the NIT table of the same report.
```

## 2. Root cause

One cause under all of them: PR #139 added rules in the files it was fixing and did not read the
text around them that each rule now contradicts or leaves without an answer. For B1 the cause is
narrower: `plugins/atk/skills/spec/references/affected-documents.md:36-38` was written to the reading
in section 5 of the record (`:295`), "asks nothing", rather than the rule chosen in 4b (`:170`),
"searches and asks", so the reference and `## Invocation` of `plugins/atk/skills/spec/SKILL.md`
(`:58`) both held one subject per run.

## 3. Evidence

Quoted lines at `7662946`, each checked against the finding that cites it:

```
plugins/atk/skills/spec/references/affected-documents.md:36-38
  The run does not decide whether such a document is written ... Running the line is how the person chooses.
plugins/atk/skills/spec/references/affected-documents.md:42-43
  Every `--from` run on the same design repeats the search, which costs a search of the docs root and
  asks nothing
plugins/atk/skills/design-doc/SKILL.md:183-184
  Under `--answer`, each answer is recorded verbatim with who gave it, no question was answered
  by the skill, and an `APPROVED` design was superseded rather than edited.
plugins/atk/skills/design-doc/references/answer-mode.md:32-35
  Approved. ... Say so and stop.
plugins/atk/skills/design-doc/SKILL.md:119
  End the design with its open questions:            (no heading named)
plugins/atk/skills/design-doc/references/answer-mode.md:26-28
  A path outside the project root, or a file with no front matter `status` and no open questions
  section, is refused                                (refuses only when both are missing)
plugins/atk/shared/run-trace.md:98-103
  15:32 step 1 ... 15:41 step 3 ...                 (example of a six-step skill, steps 2 and 4 missing)
plugins/atk/shared/run-trace.md:77-80
  A refused version command leaves the version out of `harness` and never the trace. ... a headless
  run is given them by the flags it was started with, or writes no trace
README.md:130-131
  a record is not edited once approved and rarely deleted
```

The rest are cited with their lines in the review itself; each was read at the same commit before
it was changed. One hypothesis per finding, none ruled out.

## 4. Why it surfaced now

Introduced by `7662946` ("feat: close eight definition gaps found by the 2026-10-20 run feedback"),
the commit under review. Its own two review rounds read the files it changed, not the older text
those changes now contradicted, and the rule for B1 was confirmed by the maintainer after the review
ran.

## 4b. Recorded intent

B1's rule is recorded: `docs/records/fixes/261020-1032-none-run-trace-and-design-doc-feedback.md:170`,
and the review's open questions, where Lam Ngoc Khuong answered on 2026-10-20 "Chọn cách A" and
"Lần chạy này viết luôn cả tài liệu enum": `--from` searches and asks, and a yes is written in the
same run. That second answer moves the one-subject rule in `## Invocation` of `atk:spec` and in row 1
of `plugins/atk/shared/state-signals.md`, which this change does.

S13, S14 and S20 needed a choice no record held. Lam Ngoc Khuong answered on 2026-10-20:

| Finding | Chosen |
|---|---|
| S14 | A session still running at midnight closes its trace and goes on in a new one, same subject |
| S13 | An answer given in the prompt is a `gate` line, `given in the prompt, no wait`, named for whoever brought it into the session |
| S20 | An answer from someone other than the named person is recorded, the question stays open, and nothing is edited from it until the approver settles it, in `atk:design-doc` and `atk:plan` alike |

Nothing else contradicts a recorded decision: the other fixes take the rule the review proposed, or
the reading the surrounding text already implies, as S12 does by using the path the earlier run's
`end` line names.

## 5. The change

Each finding was fixed where it was raised, by the fix the review proposed or the choice in 4b,
across 25 files: `plugins/atk/shared/run-trace.md` (S7 to S14, S22, S25, S26, N18, and its own Cost
line, now 19,443 bytes), `plugins/atk/skills/tailor/references/feedback.md` (S7, S8, N17, and the
midnight continuation read as one run), `atk:design-doc`'s `SKILL.md`, `references/answer-mode.md`
and `references/role-challenge.md` (S2, S5, S6, S8, S12, S13, S17 to S21, S24, N3, N14, N16, N19,
N20, N22, N24), `atk:plan`'s `references/answer-mode.md` (S20), `atk:spec`'s `SKILL.md` and
`references/affected-documents.md` (B1, S15, S16, N2, N12, N21, N23; `SKILL.md` stays at 299 lines),
`plugins/atk/shared/state-signals.md` (B1, N15), `plugins/atk/shared/artifact-paths.md` (S4, N3),
`plugins/atk/shared/project-profile.md` and the docs that say what a `Not needed` skill reads (S11),
`plugins/atk/shared/host-capabilities.md` (N5), `README.md` (S3, N1), the docs pages and their
`docs/vi/` mirrors (S2, B1, S20 rows of `codebase-summary.md`, N4, N6, N7, N8), and the trigger
evals of `design-doc` and `plan` (S28, N13, N25). No change is wider than its finding.

Tidy: run by hand per `plugins/atk/shared/tidy-pass.md`, the diff being prose; two paragraphs
rewrapped and one README line's spacing restored after the realign of N1. Nothing reverted.

Reference documents: the change alters no public contract of a project; the kit's own skills and
shared files are not reference documents.

## 6. Verified

- `bash tests/verify.sh`, the Test command of `.atk/profile.md`: 70 lines, all `OK`, after the fixes,
  after the tidy, and after each review round's fixes. It proves the manifests and evals parse, the
  names, trace lines, mirrors, hooks, citations and versions hold; it proves nothing about what the
  prose says.
- The checks kept beside their rules in `CLAUDE.md`: `ak:`, `atkx`, `fill:#` and symlinks print
  nothing; the em-dash check prints one line, in `docs/records/fixes/261016-0613-review-author-replies.md`,
  outside this change.
- The reproduction is the review's own lines: each quoted in section 3 was read again after the fix
  and no longer says what the finding quoted. The mention count of N4 was taken with a script
  counting `atk:<name>` in the 25 `SKILL.md` files, minus the file's own skill and
  `atk:read-only-reviewer`: 220 mentions, 125 ordered pairs, the same before and after this change.
- The `design-doc` description is 1011 characters of the 1024 allowed.
- No CI job judges content; `.github/workflows/` runs release-please and the labeler only.

## 6b. Reviewed

| Round | Report | Result |
|---|---|---|
| 1 | `docs/derived/reviews/139-fix-findings-261020-1358.md` | 0 `BLOCKING`, 4 `SHOULD FIX`, 10 `NIT`. S1 to S4 fixed: `--challenge` with `--answer` refused without "run it after"; a review request never listed is recorded as a stated question; `atk:plan` keeps a wrong-person answer open in `## Where it goes` and its definition of done too; the approver's ruling is an answer recorded as `settled by <approver>`, in both skills. N1 to N10 left as `NIT` for the author |
| 2 | `docs/derived/reviews/139-fix-findings-261020-1406.md` | S1 to S4 closed; 0 `BLOCKING`, 2 `SHOULD FIX`, 3 `NIT`. S5 (the approver's ruling on an objection left `Open for <role>` standing) and S6 (a decided review request named no owner, so the S20 gate never applied) fixed after the last call, S6 as Lam Ngoc Khuong chose: **not reviewed again**. N11 to N13 left as `NIT` |

Afterwards, at Lam Ngoc Khuong's request, the author read the fixes again: the `Question` field of
`answer-mode.md` now also holds a review request as the person stated it, and two paragraphs were
rewrapped. No other change.

The loop reached its ceiling of two rounds, so `atk:verify` was not offered; there is nothing here
to run against a live system either. Both rounds ran in a fresh band 1 reviewer agent.

## 7. Not verified

- S5 and S6, fixed after the last review call, in
  `plugins/atk/skills/design-doc/references/answer-mode.md`: read by nobody but the author.
- No skill was run against the new text. Whether an agent following `atk:spec --from`,
  `atk:design-doc --answer` or `shared/run-trace.md` now writes what the rules say is untested: no
  headless run was made, as none was for the record this one corrects.
- The trigger evals were checked for parsing only; the four new mirrored cases and the three new
  positives of `design-doc` were not measured on a harness.
- The thirteen `NIT` findings of the two rounds are open.

## 8. Blast radius

Who reads what changed, each read by the review and by the author, none exercised by a run:

- `shared/run-trace.md`: every skill's trace, through the two lines in every `## Workflow`; read
  back by `atk:tailor --feedback`, whose `references/feedback.md` moved with it.
- `atk:design-doc --answer` and `atk:plan --answer`: their `SKILL.md`, `role-challenge.md` and
  `plan-challenge.md`, and the codebase-summary rows.
- `atk:spec --from`: `shared/state-signals.md` row 1, read by `atk:help` and `atk:orchestrate`.
- `shared/artifact-paths.md` Before writing: every skill that writes a record.
- `shared/project-profile.md`: the ten skills of the `Not needed` group.

## 9. Left for later

- The four convention gaps the review named, each a check for `tests/verify.sh`: line length, the
  shape of eval entries and a query `true` in two skills, a `description` under 1024 characters
  (`atk:design-doc` is now at 1011), and the `references/` files in both `codebase-summary.md` and
  the mention count of `docs/flow/skill-lifecycle.md` held against the tree. They belong to whoever
  owns the repository's tooling, Lam Ngoc Khuong.
- The two `PLAUSIBLE` halves the review left unmeasured: one interactive default-mode run counting
  the permission questions the version command adds (S22), and one `atk:orchestrate` job in a pane
  with a different `user.name` (S26). The rules now avoid both; neither run was made.
- The `NIT` findings of the two review rounds, N1 to N13 of `139-fix-findings`, for the author:
  among them the codebase-summary line and `CLAUDE.md:171` that still say a `Not needed` skill reads
  only `Run trace` (N2), `--out` with a yes under `--from` (N9), and lines over 100 characters (N7,
  N13).
- No reference document moved: the change is to the kit's own skills and shared files, which are not
  reference documents of any project.
