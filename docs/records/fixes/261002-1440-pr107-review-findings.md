---
title: "Fix: the review of PR 107 found a ticket-cited item failing its own rules, a draft passing the merge gate, and a local start point inheriting main's upstream"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-02
updated: 2026-10-02
ticket: none
---

# Fix: the review of PR 107 found a ticket-cited item failing its own rules, a draft passing the merge gate, and a local start point inheriting main's upstream

## In short

The review of PR 107, written on 2026-10-02 at 14:23 in `docs/derived/reviews/`, which is not
committed, found one `BLOCKING`, six `SHOULD FIX` and five `NIT` findings in the change that
`docs/records/fixes/261002-1420-spec-and-git-feedback.md` records. The IDs below are the review's.

The blocking one: a contract-first run on a project that ignores its design directory was told by
step 3 of `atk:spec` to cite the ticket, but the three templates it writes from, the definition of
`implemented: no`, and two Definition-of-done items still said every item cites "the design". The
run either failed its own done items or put the ignored path back. All six places now name the
ticket as the stand-in (B1). The rest, each a clause or a sentence beside the rule it completes:

- A re-run counts a ticket-cited item as design-cited and matches it by the item itself (S1).
- "Reachable" is one test, in `shared/artifact-paths.md`, with exit 128 from `git check-ignore`
  meaning another repository (S2).
- No reference document carries `ticket`, whoever writes it (S3).
- A write removes the `ticket` line an existing document carries and names it in the summary (S4).
- The merge gate refuses a draft by name (S5).
- The conforming branch is always created with `--no-track` (S6).
- The NITs: the push form moved to step 4 (N1), `--draft` with a mode that opens no pull request is
  ignored and said so (N2), the reference document exception to "link both ways" (N3), "language
  branches" (N4), and a `grep` that fails if a template regains `ticket:` (N5).

Lam Ngoc Khuong approves the change. Nothing here touches the `owner` decision the earlier record
holds.

Every finding below is a gap in the text, proven by the lines quoted in the review and re-read here;
two were also reproduced. One hypothesis per finding, none ruled out. The intent check found no
recorded decision against any of them: the maintainer's decision in the earlier record (section 4b
of S1) is that reference documents drop `ticket`, which is what S3 makes true for every writer.

## B1: a ticket-cited item failed the rules that check it

1. **Symptom.** Review B1, verbatim in its source: step 3 says cite the ticket, while
   `api-spec-template.md:93`, `feature-spec-template.md:95`, `db-spec-template.md:84`,
   `spec-docs.md:76`, `spec/SKILL.md:245` and `:249` say the design only.
2. **Cause.** The earlier fix changed the rule in step 3 and in the `spec-docs.md` table cell, and
   left the six other places that restate what such an item cites.
3. **Evidence.** The quoted lines, re-read at head `4638958`: `api-spec-template.md:93-94` "the
   section cites the design section it came from, or the author who proposed a detail the design
   left open"; `spec-docs.md:75-76` "cites the design or the author who proposed it"; `SKILL.md:245`
   "every statement it wrote cites the design or names its author".
4. **Why now.** `ae15360`, `fix(spec): keep reference documents free of tickets, ignored paths and
   stale copies`.

## S1: a re-run could not find the items that cite a ticket

1. **Symptom.** Review S1: the re-run "rewrites every item that cites a design", and an item citing
   the ticket carries neither the design nor a section number.
2. **Cause.** `spec/SKILL.md:182-185` keys the re-run on the citation, which `ae15360` replaced.
3. **Evidence.** The quoted lines; `artifact-paths.md:381` drops "the section numbers and question
   IDs that only that file resolves".
4. **Why now.** `ae15360`.

## S2: the ignored-path check had no answer outside the repository

1. **Symptom.** Review S2: from a member repository, the check against the parent's design exits 128.
2. **Cause.** `artifact-paths.md:379-381` tested "ignored" only, and `spec-docs.md:43` stated a
   second test, "not committed".
3. **Evidence.** Reproduced in a scratch repository with git 2.53.0:

   ```text
   $ git check-ignore -v ../parent/docs/records/design/x.md; echo "exit $?"
   fatal: ../parent/docs/records/design/x.md: '../parent/docs/records/design/x.md' is outside repository at '<scratch>/r/w'
   exit 128
   $ git check-ignore -v untracked.md; echo "exit untracked $?"
   exit untracked 1
   ```

4. **Why now.** `ae15360`.

## S3: the `ticket` exemption was keyed on the writer

1. **Symptom.** Review S3: a reference document updated or created by hand, which
   `finalize-steps.md:45` allows, follows the shared block and regains `ticket`.
2. **Cause.** `artifact-paths.md:367` and `ticket-adapters.md:201` said "written by `atk:spec`".
3. **Evidence.** The quoted lines.
4. **Why now.** `ae15360`.

## S4: nothing said what happens to an existing `ticket` line

1. **Symptom.** Review S4: the next `--sync` meets "carries no `ticket`" and "touched only what the
   change touched" at once.
2. **Cause.** Step 4 said to write "no `ticket`" and never said to remove one.
3. **Evidence.** `spec/SKILL.md:173-174`, `:253-254` and `:266`, quoted in the review.
4. **Why now.** `ae15360`.

## S5: a draft passed the merge gate

1. **Symptom.** Review S5: `--merge` on a draft passes the gate and fails at the host.
2. **Cause.** The gate in `git/SKILL.md:208-210` and `finalize-steps.md:130-131` lists three refusals,
   none of them a draft.
3. **Evidence.** The quoted lines, plus `git/SKILL.md:183` where `c1ea8f5` made a draft something
   this skill opens. Not reproduced against GitHub, see section 7.
4. **Why now.** `c1ea8f5`, `feat(git): open the pull request as a draft with --draft`.

## S6: a local start point inherited the default branch's upstream

1. **Symptom.** Review S6: `--no-track` was applied only to a remote start point.
2. **Cause.** `git/SKILL.md:156-157` conditioned it on "Started from a remote ref".
3. **Evidence.** Reproduced in the same scratch repository, `main` tracking `origin/main`:

   ```text
   $ git -c branch.autoSetupMerge=inherit switch -q -c feat main; git rev-parse --abbrev-ref feat@{u}
   origin/main
   ```

4. **Why now.** `5d118ad`, `fix(git): create a conforming branch without tracking the default branch`.

## N1 to N5

Each is the review's row, verbatim in its source, with the lines it quotes as the evidence: N1
`git/SKILL.md:158-159` and `:172`; N2 `:183-185`; N3 `finalize-steps.md:109-110` and
`git/SKILL.md:198-199`; N4 `spec/SKILL.md:177`; N5 the templates with no check behind them. N5 was
shown red against the template before `ae15360`:

```text
$ git show 1ab292f:plugins/atk/skills/spec/references/api-spec-template.md | grep -n '^ticket:'
19:ticket: <the ticket that last changed this, or none>
```

## 5. The change

- B1: `shared/spec-docs.md` (the definition of `no`), the `api`, `feature` and `db` templates, and
  both done items of `atk:spec` name "the ticket where the design cannot be reached, per Front matter
  in `shared/artifact-paths.md`"; step 3 adds that the ticket stands in for the citation while the
  design stays the source.
- S1: step 4 of `atk:spec` counts a ticket-cited item as design-cited and matches it by the item.
- S2: Front matter in `shared/artifact-paths.md` states the test once, inside this repository, not
  ignored, and committed, with the meaning of exits 0, 1 and 128; `spec-docs.md:43` and step 3 point
  at it.
- S3: `shared/artifact-paths.md` and `shared/ticket-adapters.md` key the exemption on the kind.
- S4: step 4 removes an existing `ticket` line and names the document; the `--sync` done item allows
  it.
- S5: the gate in `atk:git` step 5 and in `shared/finalize-steps.md` refuses a draft, with `--auto`
  included and `gh pr ready` offered on a separate yes; the done item and both `skills-overview.md`
  paragraphs say four.
- S6, N1: `--no-track` whatever the start point; the push form moves to step 4 as
  `git push -u <remote> HEAD`.
- N2, N3, N4: one sentence or clause each where the review placed them.
- N5: a `grep` in "Common verification commands" of `CLAUDE.md`.

Every edit is the clause or sentence the finding asked for, at the line it named, plus the one
place the walk below found beside S5: `shared/finalize-steps.md`, which states the same gate.

Tidy step: this change is prose, and Claude Code's `/simplify` reviews code, so the pass was run by
hand per `shared/tidy-pass.md`, on the touched lines only: four lines of `git/SKILL.md` and three
template bullets that the edits had pushed past the file's width were rewrapped. No wording changed.

## 6. Verified

Layer `content` and `docs`, the profile's Test command: the "Common verification commands" block of
`CLAUDE.md`, extracted with the new `grep` in it (415 lines) and run whole with `bash`: exit 0, 65
lines, every one `OK`, among them "plugins read nothing outside themselves, 942 citations resolved",
so every `shared/` path the new text cites resolves inside the plugin. The new `grep` prints nothing.

Also run: the em-dash `grep` (`CONV-003`), the `ak:` `grep` (`CONV-004`) and the `atkx` `grep`
(`CONV-011`), each printing nothing; `spec/SKILL.md` at 275 lines and `git/SKILL.md` at 263, under
the 300 of `CONV-006`. The mirror diff of `CONV-002` passes inside the block, and the one changed
paragraph of `docs/vi/skills-overview.md` says what the English one says.

The reproduction of S6 re-run with the instruction as now written:

```text
$ git -c branch.autoSetupMerge=inherit switch -q --no-track -c feat2 main; git rev-parse --abbrev-ref feat2@{u}
fatal: no upstream configured for branch 'feat2'
```

The gate: this repository has no CI that checks content, per "Review checklist" in `CLAUDE.md`, so
the block above is the whole of it.

## 7. Not verified

- No `atk:spec --from` run on a scratch project with an ignored design, which is what would show B1
  and S1 holding in a run rather than in the text. The review names it under N5.
- No `atk:git --merge` against a draft on GitHub; that GitHub refuses to merge a draft is taken from
  the host's behaviour, not observed here.
- No `--sync` on a document carrying an old `ticket` line (S4), and no reference document written by
  hand through `atk:implement` (S3).
- The S2 case on a real parent-and-members profile; only the exit codes were reproduced.

## 8. Blast radius

Searched for "cites the design", "design section it came from", "written by `atk:spec`", "link
both ways", "which of the three" and "of three" across `plugins/`, `README.md` and `docs/`, outside
`docs/records/` and `docs/derived/`.

- `plugins/atk/shared/finalize-steps.md:130-131`, the second statement of the merge gate: changed
  with S5.
- `plugins/atk/skills/design-doc/SKILL.md:125`, "written by `atk:spec`": names who writes the
  documents, not the `ticket` exemption; read, unchanged.
- `plugins/atk/skills/spec/references/screen-spec-template.md`: cites node IDs, not a design
  document, so B1 does not reach it; read, unchanged.
- The citers of Front matter and Linking rule the review walked (`help`, `run-cases`, `qa` review
  mode): read by the review and refuted there; nothing in this change alters what they read.

## 9. Left for later

- The scratch-project `--from` run named in section 7, as a repeatable check, if one can be written
  without an agent in the loop.
