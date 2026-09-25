---
title: "Fix: atk:git has no rule for a Team section whose only person is the author"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, maintainer of skills/git)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# Fix: reviewers when the author is the only person named

This is finding 3 of the feedback record on `/atk:git` written 2026-09-25. That record sits in the
gitignored `docs/derived/feedback/git-260925.md`. The maintainer asked for this finding alone:
"Chỉ sửa 3".

## 1. Symptom as captured

From the feedback record, verbatim: "assigned nobody, and said why." The team expected "the same,
stated in the definition, since a solo project is in scope per `shared/team-roles.md`."

## 2. Root cause

`skills/git/SKILL.md:185-186` (before this change) says only "Reviewers come from the Team section
of `.atk/profile.md`". It does not say what to do when that section names nobody but the author.

## 3. Evidence

```text
$ git show HEAD:skills/git/SKILL.md | grep -n -i -E "only the author|names only"
$ echo $?
1
```

## 4. Why it surfaced now

It has been broken since it was written. PR #67 was the first pull request opened by `atk:git` on
a project whose Team section names only the author.

## 4b. Recorded intent

`shared/team-roles.md:30-33` and rule 2 at `:41-44` support a solo project: one person holds every
role, and approval stays a separate act done by hand. The change applies that rule and contradicts
nothing.

## 5. The change

One sentence was added after the reviewer rule in `skills/git/SKILL.md`. When the Team section
names only the author, no review is requested and the pull request says so. That person still
approves by hand, per rule 2 of `shared/team-roles.md`.

The tidy step ran `/simplify` with four reviewers:

- Applied: a shorter wording. The first version restated rule 2 of `shared/team-roles.md`. The new
  one points at it.
- Skipped: moving the sentence into `shared/finalize-steps.md` after its reviewer rule at
  `:104-105`, with `atk:git` pointing there. That move would change a shared contract outside the
  lines this fix touched, so it is listed in section 9.
- The efficiency reviewer found nothing.

## 6. Verified

- The em-dash check prints nothing.
- `wc -l skills/git/SKILL.md` gives 250, under 300.
- Re-running the section 3 reproduction against the working tree now matches the new line.

## 7. Not verified

No `/atk:git` run was made after the change.

## 8. Blast radius

- `shared/finalize-steps.md:104-105` holds the same reviewer rule, and `atk:fix`, `atk:implement`
  and `atk:verify` follow it. It was not changed, so the contract is still silent on this case.
- `skills/convention/references/collaboration-files.md:101` handles a Team section with one person
  for `CODEOWNERS`. It was read, and no change is owed.

## 9. Left for later

- The reviewer rule and its solo-author case could move into `shared/finalize-steps.md`, with
  `skills/git/SKILL.md` pointing there, so the contract and its implementation cannot drift. Pending
  the maintainer's decision.
- Feedback findings 1 and 2 describe run behaviour the definition already forbids, and no change was
  made. Finding 4 was left as it is: `shared/artifact-paths.md:266` and `:284` let only
  `docs/derived/` stay untracked.
