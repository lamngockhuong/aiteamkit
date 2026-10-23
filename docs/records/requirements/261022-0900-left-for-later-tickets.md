---
title: "Requirement: what a review loop leaves behind gets a ticket on a yes, and a fix made after its last round is read once more and pointed out to the reviewer"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-23
ticket: none
---

# Requirement: what a review loop leaves behind gets a ticket on a yes, and a fix made after its last round is read once more and pointed out to the reviewer

The request was written in Vietnamese and this requirement in English, the repository's working
language. One maintainer holds every role in this repository, so the owner and the approver are the
same person, per `.atk/profile.md`.

## 1. Original request

From the session of 2026-10-22 that ran `atk:fix` on PR #144, after the fix was committed and
pushed. The question first:

> Tôi thấy hiện tại sau 2 vòng review mà xuất hiện finding thì các issue sẽ bị bỏ ngõ nhỉ?

Rendering: "It looks like, as things stand, findings that appear after two review rounds are left
hanging, aren't they?"

Then the change, as put to `atk:intake`:

> Thay đổi kit, từ lần chạy atk:fix trên PR #144 (2026-10-22). Vấn đề: sau trần hai vòng của
> review-fix-loop (plugins/atk/shared/review-fix-loop.md), (1) mục "Left for later" của fix report /
> implementation record và SHOULD FIX "carried forward" cùng NIT chỉ nằm trong record và comment PR,
> không có ticket trên tracker, nên mất dấu khi PR merge (ví dụ: N9 của PR #144, verify.sh không đếm
> dòng SKILL.md trong khi orchestrate/SKILL.md ở 299 dòng); (2) bản sửa SHOULD FIX làm sau lần gọi
> review cuối chỉ người review đọc, và bản sửa dạng "add a rule" là loại dễ sinh finding mới nhất
> (S15 vòng 1 sinh S17-S19 vòng 2), nhưng PR không chỉ ra đoạn cần đọc riêng. Đề xuất: ở bước
> finalize của atk:fix và atk:implement, mỗi mục left-for-later / carried-forward được đề nghị tạo
> issue trên tracker, chỉ tạo khi được đồng ý theo consent line của shared/finalize-steps.md; và bản
> sửa sau vòng cuối dạng "add a rule" được nêu riêng trong PR để người review đọc đoạn đó, không mở
> vòng review thứ ba. Requester: Lam Ngoc Khuong.

Rendering: a change to the kit, from the `atk:fix` run on PR #144. After the two-round ceiling of the
review loop, (1) the "Left for later" items of a fix report or implementation record, `SHOULD FIX`
findings carried forward, and `NIT`s live only in the record and the pull request comment, with no
ticket on the tracker, so they are lost once the pull request merges (example: N9 of PR #144,
`tests/verify.sh` counts no `SKILL.md` lines while `orchestrate/SKILL.md` sits at 299); (2) a
`SHOULD FIX` fix made after the last review call is read only by the human reviewer, and a fix of
the form "add a rule" is the kind most likely to raise a new finding (S15 in round 1 raised S17 to
S19 in round 2), yet the pull request does not point at the passage to read. Proposed: at the
finalize step of `atk:fix` and `atk:implement`, offer an issue for each left-for-later or
carried-forward item, created only on a yes per the consent line of `shared/finalize-steps.md`; and
name an "add a rule" fix made after the last round separately in the pull request, without opening a
third review round.

Interview answers, 2026-10-22, Lam Ngoc Khuong:

- Which items are offered: Left for later and carried forward; `NIT`s are not offered.
- How the offer is answered: one list, answered item by item.
- Which post-last-call fixes are pointed out: every fix made after the last call, not only the
  "add a rule" form.

Later in the same session:

> Thêm 1 vấn đề nữa, khi agent tự fix xong vấn đề thì vượt quá số lần nào đó thì những phần được
> sửa sẽ không được review, tôi thấy hơi bất tiện

Rendering: "One more issue: once the agent has fixed things past a certain number of rounds, the
parts it fixed are not reviewed, which I find inconvenient."

Asked how a fix made after the last call should be handled, Lam Ngoc Khuong chose one read with no
fix after it: a review of those fixes alone whose findings the agent does not fix. This replaces
"without opening a third review round" in the request above: the review runs a third time, the
fixing does not.

## 2. Context and current behavior

What exists today:

- The review loop fixes `BLOCKING` and `SHOULD FIX`, and records a `SHOULD FIX` that is "genuinely
  separate work" as carried forward with the reason; a `NIT` is never fixed in the loop.
  `plugins/atk/shared/review-fix-loop.md:85-89`.
- "Fixes made after the last call are reviewed only by the person. The record marks each as fixed and
  not reviewed again, and lists it among what was not verified."
  `plugins/atk/shared/review-fix-loop.md:146-147`.
- After two rounds, only a `BLOCKING` finding escalates to a named person.
  `plugins/atk/shared/review-fix-loop.md:154-155`.
- A fix report's section 9, Left for later, holds each item "with enough detail to become a ticket".
  `plugins/atk/skills/fix/references/report-template.md:160-163`.
- An implementation record lists "anything noticed but deliberately not done".
  `plugins/atk/skills/implement/SKILL.md:124-126`, `:224`.
- The consent line lists push, pull request, issue comment, moving a ticket and merge. It has no row
  for creating an issue. `plugins/atk/shared/finalize-steps.md:22-37`.
- Step 5 of the closing sequence comments on the change's own ticket and moves it to "in review"; it
  creates no ticket. `plugins/atk/shared/finalize-steps.md:109-122`.
- "Push to a tracker only when the user asks, and never create tickets in bulk without showing the
  list first and getting a yes." `plugins/atk/shared/ticket-adapters.md:6-8`; the GitHub form of
  creating an issue is at `:150`.
- Precedents for a skill that creates issues: `atk:incident` makes each follow-up action an issue with
  an owner and a date (`plugins/atk/skills/incident/SKILL.md:86`, `:109`); `atk:qa --bug` raises a
  run's failures and raises no second issue for a bug already open
  (`plugins/atk/skills/qa/references/test-run.md:273`, `:309`).
- `atk:orchestrate` writes a `SHOULD FIX` carried forward by a job into its run state with the reason.
  `plugins/atk/skills/orchestrate/SKILL.md:191`.

What is missing:

- Nothing turns a Left for later item or a carried-forward finding into a ticket. In PR #144, N9 and
  N11 sit only in section 9 of `docs/records/fixes/261022-0812-144-review-findings.md` and in the
  pull request comment.
- Nothing points the reviewer at the passages written after the last review call. In PR #144 the
  paragraph for a piece whose worktree exists, in
  `plugins/atk/skills/orchestrate/references/proposal.md`, is marked only inside section 6b and
  section 7 of the report.

## 3. User stories and acceptance criteria

### Story 1: work the review loop leaves behind is offered as tickets

As the author closing a change with `atk:fix` or `atk:implement`, I want each item the change
deliberately left undone offered as an issue on the tracker, so that it is still tracked after the
pull request merges.

- **AC 1.1** Given a fix report whose section 9 lists items, or an implementation record listing
  work noticed but not done, or a `SHOULD FIX` finding carried forward, and a detected tracker, when
  the closing sequence reaches its tracker step, then the run shows one list holding every such item
  with a draft title and body each, and asks once which to create: all, some named by number, or
  none.
- **AC 1.2** Given the person names items from the list, when the run creates them, then only those
  issues are created, each body cites the record's path and the pull request, and the record's line
  for each item gains the issue's key.
- **AC 1.3** Given the person declines an item, when the record is completed, then that item's line
  says no ticket was created and who declined it.
- **AC 1.4** Given a `NIT` left by the review, when the list is built, then the `NIT` is not in it.
- **AC 1.5** Given no item to offer, or a project with no tracker, when the closing sequence reaches
  the step, then the run reports it as `N/A` with which of the two it was.
- **AC 1.6** Given the consent line in `shared/finalize-steps.md`, when it is read, then it holds a
  row for creating an issue that is asked first.
- **AC 1.7** Given the run was not given a yes, when it ends, then no issue was created.
- **AC 1.8** Given an item, when the list is built, then the run first searches the tracker's open
  issues for one that already covers it, and an item with a match shows that issue's key in place of
  a draft and is never created a second time.
- **AC 1.9** Given the offer, when a reader looks for where it is made, then it is step 5 of
  `shared/finalize-steps.md`, carried out by `atk:git`, and `atk:fix` and `atk:implement` hand their
  items to it rather than making the offer themselves.
- **AC 1.10** Given a fix or implement job of `atk:orchestrate`, when the job ends at its local
  commit, then no issue is offered inside the job; its items stay in its record for the person's
  later `atk:git` run to offer.

### Story 2: a fix no review read is pointed out to the reviewer

As the reviewer of a pull request that `atk:fix` or `atk:implement` opened, I want every fix made
after the last review call listed where I start reading, with the lines it changed, so that I read
those passages first and closely.

- **AC 2.1** Given a fix made after the last call of the review loop, when the record becomes the
  pull request body, then a section near its top lists each such fix with its finding ID, its
  `path:line` range, its form, and what the closing read of Story 3 found in it, or that it was not
  read and why.
- **AC 2.2** Given such a fix of the form "add a rule", when the section lists it, then it comes
  first and names the states the rule opens.
- **AC 2.3** Given no fix was made after the last call, when the record is written, then the section
  says so in one line.
- **AC 2.4** Given fixes made after the last call, when the run closes, then no fix was made after
  the closing read of Story 3.

### Story 3: a fix made after the last round is read once, and not fixed again

As the reviewer of the pull request, I want the fixes made after the second review round read by one
more review before the change reaches me, without the agent fixing anything that read finds, so that
every committed line has been read by a review and the loop still stops.

- **AC 3.1** Given fixes made after the second call of the review loop, when they are verified, then
  `atk:review` is called once more, with only those fixes and what they reach as its subject, after
  its cost is stated.
- **AC 3.2** Given that closing read returns findings, when the run goes on, then the agent fixes
  none of them: a `BLOCKING` finding escalates as The ceiling in `shared/review-fix-loop.md` says,
  naming the person; a `SHOULD FIX` finding joins the list of Story 1; a `NIT` is recorded.
- **AC 3.3** Given no fix was made after the second call, when the loop ends, then no closing read
  runs and the record says there was nothing to read.
- **AC 3.4** Given the closing read ran, when the record is written, then it names the read's report
  path and its counts by severity, apart from the two rounds.
- **AC 3.5** Given `--no-review`, when the run closes, then no closing read runs, as no round did.

## 4. Out of scope

- A third round of fixing, or any change to the two-round ceiling on fixes; the ceiling's reason is
  in `plugins/atk/shared/review-fix-loop.md:26-27`. The closing read of Story 3 is a review with no
  fix after it, not a third round.
- Offering `NIT`s as tickets, decided by Lam Ngoc Khuong in the interview.
- Creating an issue without a yes, or closing one.
- Changing how `atk:review` grades severity or reach.
- Records of other skills: `atk:verify`, `atk:review`, `atk:qa`, `atk:incident`.
- Issues for PR #144's own N9 and N11; that is a separate act, after this requirement or without it.

## 5. Assumptions

- **Assumption:** the tracker is the one `shared/ticket-adapters.md` detects, and the issue body
  follows its vocabulary map; no new tracker is supported.
- **Assumption:** the issue is written in the language of the record it comes from.
- **Assumption:** under `--no-review`, Story 2 has nothing to list, since no review call was made, and
  the existing unreviewed line of `shared/review-fix-loop.md` stands.

## 6. Open questions

| # | Question | Blocks | Must answer |
|---|----------|--------|-------------|
| 1 | Where does the offer of Story 1 live: in step 5 of `shared/finalize-steps.md`, so `atk:git` makes it for every skill that hands off there (recommended, one place), or in step 7 of `atk:fix` and the Output of `atk:implement` | AC 1.1, AC 1.6 | Lam Ngoc Khuong (Tech Lead) |
| 2 | A fix or implement job of `atk:orchestrate` ends at a local commit: is the offer made at the coordinator's close, listing every job's items, or left to the person's later `atk:git` run (recommended, nothing past the commit happens inside a job) | AC 1.1 | Lam Ngoc Khuong (Tech Lead) |
| 3 | Before offering an item, does the run search the tracker's open issues for one that already covers it and show the match instead, as `atk:qa --bug` raises no second issue for an open bug | AC 1.1, AC 1.2 | Lam Ngoc Khuong (PM) |

Answers, 2026-10-22, Lam Ngoc Khuong, given in the session:

1. In step 5 of `shared/finalize-steps.md`, made by `atk:git`, as recommended. Now AC 1.9.
2. Left to the person's later `atk:git` run, as recommended. Now AC 1.10.
3. Yes, search the open issues first. Now AC 1.8.

## 7. Impacted areas

| Area | Files |
|------|-------|
| Review loop and its closing read | `plugins/atk/shared/review-fix-loop.md`, `plugins/atk/skills/review/references/review-rounds.md` (Called again after a fix) |
| Closing sequence and consent line | `plugins/atk/shared/finalize-steps.md`, `plugins/atk/shared/ticket-adapters.md` |
| `atk:fix` | `plugins/atk/skills/fix/SKILL.md`, `plugins/atk/skills/fix/references/report-template.md` (sections 6b and 7) |
| `atk:implement` | `plugins/atk/skills/implement/SKILL.md` |
| `atk:git` | `plugins/atk/skills/git/SKILL.md`, `plugins/atk/skills/git/references/pr-body.md` |
| `atk:orchestrate`, to say a job offers no issue, and for the closing read of its jobs' review loop | `plugins/atk/skills/orchestrate/SKILL.md`, `plugins/atk/skills/orchestrate/references/job-prompt.md` |
| Reader docs | `docs/skills-overview.md`, `docs/vi/skills-overview.md`, `docs/flow/skill-chain.md`, `docs/vi/flow/skill-chain.md` |
