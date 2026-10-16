---
title: "Fix: a later atk:review pass ignores the author's replies on the pull request thread"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-16
ticket: docs/derived/feedback/review-261015-1040.md#1, docs/derived/feedback/review-261015-1040.md#2, docs/derived/feedback/review-261015-1040.md#3 (not committed)
---

# Fix: a later `atk:review` pass ignores the author's replies on the pull request thread

## In short

A second `atk:review --comment` on a pull request read the author's replies but answered none of
them where the author could see it. It also posted findings the author had deferred or declined as
fresh inline comments, one of them on a new line rather than in its existing thread. The author
concluded the reviewer had not read the reply. The cause is that the skill read the thread only to
carry identifiers forward and had no rule for an answered finding. The change adds that rule to
`atk:review`. A later pass now records each answer on the finding, answers it in a visible summary
line the cap never cuts, posts no new inline comment for it, and puts new evidence in the existing
thread. The third finding, who decides when the Tech Lead authored the change and disputes a
`BLOCKING` finding, stays out of the kit: the maintainer chose to leave it to each project's
`.atk/overrides/review.md`. Lam Ngoc Khuong approves.

The source is a feedback record written by `atk:tailor --feedback` against kit 0.1.8, at
`docs/derived/feedback/review-261015-1040.md`, which is derived and not committed. Its three
findings are `#1`, `#2` and `#3` here.

## 1. Symptom as captured

Quoted from the feedback record, unedited:

> The pull-request author reacted to the second-pass review comments. They asked whether the reviewer
> had understood their reply at all, since it "raised comments again on items that I already
> mentioned don't need to be changed".

> But the one visible line was `**B1 · BLOCKING** — OPEN-DISPUTED (unchanged at <sha>)`. Nothing
> visible said the reply had been read.

> On the observed PR the second pass posted a new inline comment for S7, which the author's reply had
> explicitly deferred to the implementation PR. It also posted S5, which the author had declined.
> That comment carried new evidence: the author's factual claim did not hold. But it opened a new
> thread on another line instead of replying in the existing S5 thread.

> The sibling run kept B1/B2 as `BLOCKING` with `REQUEST_CHANGES`, after the author (the Tech Lead)
> said the behaviour was the confirmed spec, re-verified with the BA. The thread reply then asked the
> reporter to "name the approver who decides".

Environment: `atk:review` 0.1.8, `--comment` on both passes, Claude Code 2.1.300, a client project
with `.atk/overrides/review.md`.

## 2. Root cause

**#1 and #2.** `atk:review` reads a pull request's thread only to carry finding identifiers
forward, and has no rule for a finding the author has answered. So a later pass decides closed or
still open on its own, and posts every finding within the cap as an inline comment, answered or not.

- `plugins/atk/skills/review/references/report-format.md:44-57` (before the fix): the thread is read
  as "an earlier report", for its identifiers.
- `plugins/atk/skills/review/references/report-format.md:272-273` (before): "Inline comments go only
  to the findings within the cap of step 6." Nothing separates an answered finding.
- `plugins/atk/skills/review/references/review-rounds.md:535-536` (before): the second pass says of
  each finding "whether it is closed or still open", nothing about the author's answer.
- `plugins/atk/shared/ticket-adapters.md:182-189`: reads inline comments, with no command for
  replying in a thread.

**#3.** `plugins/atk/skills/review/SKILL.md:32` and `plugins/atk/shared/review-fix-loop.md:97-105`
give the Tech Lead the call on a disputed `BLOCKING` finding, with no case for the Tech Lead as
author. `plugins/atk/shared/team-roles.md:30-33,43-44` supports one person holding both roles, with
the approval as a separate act. Not changed here, per section 4b.

Hypotheses: 1 tried, 1 proved.

## 3. Evidence

The responsible lines, as they stood at `e2bd7b4` (kit 0.1.10), with the check that shows them:

```text
report-format.md:272-273
The inline comment on a line opens with the finding's ID, so the thread on GitHub and the report say
the same name for the same thing. Inline comments go only to the findings within the cap of step 6.

review-rounds.md:535-536
fix set out to close is then checked by its identifier, and the report says of each whether it is
closed or still open.
```

Check: `grep -n -i "reply\|replied\|deferred\|declined" plugins/atk/skills/review/SKILL.md plugins/atk/skills/review/references/*.md`
returned nothing at `e2bd7b4`. No rule in the skill mentions an author's answer, so a run that read
one, as the observed run did, had no instruction to show it or to hold back an inline comment.

## 4. Why it surfaced now

Broken since the thread read was written. `6346212` (#109) taught the review to read the thread for
identifiers, and nothing since gave it a rule for what the author wrote there. It surfaced the first
time a team ran a second pass on a pull request whose author had replied.

## 4b. Recorded intent

Nothing records the current behaviour as intended for #1 or #2. Searched `docs/records/`,
`docs/adr/`, `docs/*.md` and `plugins/` for inline comments, replies and threads. The closest
records, `docs/records/fixes/261008-0848-review-comment-summary-and-read-only-agents.md` and
`docs/records/fixes/261010-1010-113-deferred-review-findings.md`, cover the summary's collapsed list
and credential findings, and neither speaks to an author's answer.

#3 is a question the feedback put to the maintainer. Lam Ngoc Khuong answered on 2026-10-16 that it
belongs to each project's `.atk/overrides/review.md`, not to the kit. The kit's default already
stands: the Tech Lead holds the call (`SKILL.md:32`), and one person may hold both roles with the
approval as a separate act (`shared/team-roles.md:30-33,43-44`). Inventing another path, as the
sibling run did, was the run's error and is not a gap in the definition.

## 5. The change

`atk:review` now treats an answer on the thread as part of a finding. The changes:

- `report-format.md` reads the author's replies with the earlier summary, and the ruling of the
  person who holds the call when it can be matched to them. It records each answer in a new
  `Author` line on the finding, and widens `## Closed since the first review` to findings an answer
  closed.
- Under `--comment`, an answered finding gets no new inline comment. Instead it gets a visible
  summary line that the cap never cuts, and new evidence goes as a reply in its existing thread.
- `SKILL.md` step 6 names the exception to the cap, and its Ticket paragraph names the answered
  finding. Both edits were rewrapped so the file stays at 299 lines.
- `review-rounds.md` points its second pass at the read.
- `ticket-adapters.md` reads inline comments with `--paginate`, says how a reply is found, and gives
  the reply command.
- `docs/skills-overview.md` and `docs/vi/skills-overview.md` say the same in one sentence each.

This is the smallest change that gives the skill a rule it lacked: three files of the skill that own
the read, the shape and the posting, plus the adapter that owns the commands.

Tidy step: `/simplify` ran four cleanup agents over the touched lines. It removed text that restated
the `Author` line, cut the review policy out of `ticket-adapters.md`, shortened the severity clause,
moved the cap exception into `SKILL.md` step 6, and widened the Closed section. Two suggestions were
skipped: moving the reply command out of the adapter, and merging the read paragraph into the
thread paragraph.

Reference documents: no public contract changed, so none moved.

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command, ran after the fix, after the tidy step, after
  review round 1 and after the S3 fix. All lines were `OK` every time. That covers the manifests,
  the name check, the `docs/` and `docs/vi/` mirror, the run-trace lines and the citation check.
  One run during the tidy step failed the `skill-eval` temporary-directory check while four agents
  ran at once. It passed on re-run, and no `skill-eval` file is touched.
- The em-dash and `ak:` checks from `CLAUDE.md` print nothing.
- `SKILL.md` is 299 lines.
- Reproduction: the check of section 3 now finds the rule at `report-format.md` (*What the author
  answered is read with it*, the `Author` label, *A finding the author answered*) and at
  `review-rounds.md:535-537`.

## 6b. Reviewed

Two rounds of `atk:review`, band 1, each in a fresh agent:

- Round 1, `docs/derived/reviews/review-author-replies-261016-0650.md`: 1 `BLOCKING`,
  2 `SHOULD FIX`, 5 `NIT`.
  - `B1` fixed: the inline-comment read stopped at the first page of 30, so it now uses
    `--paginate`.
  - `S1` fixed: a ruling by the person who holds the call, when that is not the author, is now read.
  - `S2` carried to section 7.
  - `N1` to `N5` left as `NIT`.
- Round 2, `docs/derived/reviews/review-author-replies-261016-0701.md`: 0 `BLOCKING`,
  2 `SHOULD FIX`, 5 `NIT`.
  - `B1` and `S1` closed.
  - `S2` still carried.
  - `S3`, new: the ruling was counted from whoever wrote it. Fixed after the last call: a ruling now
    counts only when its writer is matched to the role holder, as rule 2 of
    `shared/team-roles.md` matches an approver. Lam Ngoc Khuong decided on 2026-10-16 that only
    the person the profile names counts, not anyone with approve rights on the pull request. **This fix was not reviewed.** It was re-verified
    with `tests/verify.sh` only.

`atk:verify` was not offered: the profile's Verify section says nothing starts in this repository.

## 7. Not verified

- The behaviour itself. Nothing in `tests/verify.sh` or any eval runs a second `--comment` pass, so
  the new rules are checked as text, not as a run (`S2`). The trial that closes this is a second pass
  on a test pull request with one deferred, one declined and one disputed finding. It checks that no
  new inline comment appears, that the summary carries three visible lines, and that new evidence
  lands as a thread reply. Owner: Lam Ngoc Khuong.
- The `S3` fix, made after the review's last round.
- Other trackers than GitHub, which have no reply command here.

## 8. Blast radius

Callers of the changed text:

- `atk:review`, every run. Exercised by both review rounds reading it, not by a run on a pull
  request.
- `atk:qa --review`: it follows three rules of `report-format.md`, the empty-section `None.`, the
  severity names and no score, and the identifier carry. None of them changed. Not exercised.
- `atk:implement`, `atk:fix` and `atk:orchestrate` call the review in a working tree, where there is
  no thread, so the new read finds nothing. Not exercised.
- Every skill that cites `shared/ticket-adapters.md`: only the `atk:review` paragraph changed.
  Searched with `grep -rn "pulls/<number>/comments" plugins/`, which found that line alone.

## 9. Left for later

- #3, the per-project rule for a Tech Lead who authored the change and disputes a `BLOCKING`
  finding: a candidate for the reporting project's `.atk/overrides/review.md`, through
  `atk:tailor review` and that project's Tech Lead. Owner: the reporting project's Tech Lead.
- The reply command is documented for GitHub only, as the thread read already is. Other trackers'
  equivalents are not added. Owner: Lam Ngoc Khuong, if a team asks.
- `N1` to `N5` of the review rounds, left as `NIT`. The one worth a ticket is `N5`: the cap sentence
  in `SKILL.md` step 6 was shortened to fit 299 lines and reads less clearly. Owner: Lam Ngoc Khuong.
- No public contract changed, so no reference document is owed.
