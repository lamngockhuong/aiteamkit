---
title: "ADR 0018: atk:review posts a review on a pull request through a script"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-19
updated: 2026-11-19
ticket: none
---

# ADR 0018: atk:review posts a review on a pull request through a script

## Context

Under `--comment`, `atk:review` posts its findings as inline comments with one summary. The kit said
what each comment holds and how to read earlier reviews and reply in a thread, and said nothing about
creating the review itself. Every posting run of one session wrote its own payload builder and
checked every inline line against the pull request's diff by hand: a summary holds backticks, quotes
and `<details>` blocks that shell quoting breaks, and GitHub refuses the whole review when one inline
line sits outside every hunk of the pull request against its base. One finding had to be moved for
that reason. `atk:tailor --feedback review --runs` recorded it on 2026-11-19, finding 1.

Whether a line is inside the diff has one answer for a given base and head. That is the kind of
check ADR 0002 and ADR 0017 give to a script rather than to an agent.

## Decision

`atk:review` carries `scripts/post-review.mjs`, Node with its standard library, starting `git` through
the runner of `atk:security`'s `scripts/lib/git-history-stream.mjs` rather than a second copy of it. The session
writes a spec as a file, with the harness's file write: the repository, the pull request, the base
the mask diffed against, the commit reviewed, the event, the summary and the inline comments. The
script checks every inline line against `<base>...<commit>` for that file alone, three lines of
context as GitHub shows them, and sends nothing while one is outside, naming the nearest added line.
Under `--post`, given after the person's yes, it creates one review through
`POST /repos/{owner}/{repo}/pulls/<n>/reviews` with the payload passed as a file, then reads the
review's comments back and says whether each landed on its line. It refuses `APPROVE`, since
approving is a person's act. It prints one JSON object, never a line of a file, and exits `0`, `3`
when a line is outside the diff, GitHub refused the review or a comment did not land, and `2` when
it could not run.

Which line a finding moves to, whether it stays in the summary, and whether to post at all stay with
the session and the person, in `shared/ticket-adapters.md` and `references/report-format.md`.

## Consequences

- `atk:review` is the second `atk` skill with scripts; `CLAUDE.md` and `docs/system-architecture.md`
  say so.
- `tests/verify.sh` runs the script on a repository it builds, with a stand-in for `gh` on the
  `PATH`, so the check sends nothing.
- A host without Node, or without `gh`, cannot post; the review is still written as a report.
- A file renamed in the pull request is diffed as added, since each file is diffed alone. A line
  GitHub would not show there passes the check and is refused by GitHub, which posts nothing and
  exits `3`.

## Alternatives rejected

- **A shell block in `shared/ticket-adapters.md`, as the masking scan is.** Smaller and no ADR, but
  the session would still build the JSON and check the anchors by hand, which is the work the
  finding was about. Ruled out by the maintainer on 2026-11-19.
- **One inline comment per call.** Each lands or fails alone, but the summary and the event arrive
  separately, and a pull request reads several half-posted reviews when one call fails midway.
