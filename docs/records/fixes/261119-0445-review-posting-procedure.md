---
title: "Fix: atk:review posts a review with no procedure, records the posting question under a dozen names, and moves the person's working tree to read a pull request"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-19
updated: 2026-11-19
ticket: docs/derived/feedback/review-261119-0430.md#1, docs/derived/feedback/review-261119-0430.md#2, docs/derived/feedback/review-261119-0430.md#3, docs/derived/feedback/review-261119-0430.md#6
---

# Fix: how atk:review posts a review, records it, and reads a pull request's head

## In short

`atk:tailor --feedback review --runs` read 189 runs of `atk:review` and the session of the fifth
review of one pull request. Four of its findings land on the definition. Each `--comment` pass of
that session wrote its own payload builder and checked every inline line against the pull request's
diff by hand, since the kit says what a comment holds and nothing about creating the review (`F1`).
The posting question was written in the trace under twelve names, its outcome sometimes outside the
six event kinds, and a `--comment` given in a later turn was written back into the header (`F2`).
Twelve runs put the author's answers to the reviewer before posting, following a rule that lived in
one machine's assistant memory, and a band-1 reviewer agent, never told it, kept an answered finding
open (`F3`). And the kit reads a pull request's head with `gh pr checkout` "every time", which moves
the person's own branch (`F6`).

Each is an absence in the definition, there since it was written. The fix adds
`skills/review/scripts/post-review.mjs`, which checks every inline line against `<base>...<commit>`
and creates one review only after the person's yes, then reads each comment back; ADR 0018 records
why it is a script, the maintainer's choice. `references/report-format.md` now has the reviewer
decide on each answer before anything is posted, keeps a `fixed` answer the head does not bear out
open as a fact, names the `gate answers` and `gate post` lines, and `shared/run-trace.md` makes a
later flag the answer of its gate. `shared/ticket-adapters.md` reads the head from a detached
worktree under the git directory when the person's tree is in use. One part of `F3`, treating the
answer of a Tech Lead who is also the author as a ruling, was dropped by its owner, since it conflicts
with rule 2 of `shared/team-roles.md`. Two review rounds left no `BLOCKING` and no `SHOULD FIX` finding; six `NIT` findings stay open,
below. Lam Ngoc Khuong approves this fix; ADR 0018 was approved by its approver on 2026-11-19.

## After the last round

Round 2, `docs/derived/reviews/fix-review-posting-procedure-261119-0710.md`, closed `S1` to `S3`
and fixed nothing, so there was no fix after it for a closing read to cover, and none ran.

## F1. Posting a review has no procedure

### 1. Symptom as captured

From `docs/derived/feedback/review-261119-0430.md`, finding 1, verbatim:

> Posting under `--comment` has no procedure: nothing says how to create one review carrying the
> summary, the inline comments and the event, or that an inline line must sit inside the pull
> request's diff

> each `--comment` pass in the session wrote its own payload builder (`build_review.py` up to
> `build_review5.py`) and checked every inline anchor against the whole pull request's diff by hand
> before posting. One finding had to be moved to another line, because the line it cited was outside
> every hunk.

Expected: one procedure the run fills in. Actual: a builder written per pass. Environment: Claude
Code, atk 0.1.25.

### 2. Root cause

The kit never says how a review is created: `shared/ticket-adapters.md` gives commands to read
earlier reviews and to reply in a thread, and `skills/review/SKILL.md` `## Ticket` says what to post,
so the call, the payload and the anchor rule were left to each run. Location:
`plugins/atk/shared/ticket-adapters.md:153-199` (at `8ecba42`), `plugins/atk/skills/review/SKILL.md:254-260`.

### 3. Evidence

Quoted lines with a check. At `8ecba42`:

```
$ grep -rn -e '/reviews' -e 'commit_id' -e 'REQUEST_CHANGES' -e 'hunk' plugins/atk/shared/ticket-adapters.md plugins/atk/skills/review/
(no output)
```

The adapter's GitHub section holds `gh api repos/{o}/{r}/pulls/<n>/reviews` only as a read of earlier
reviews and `pulls/<n>/comments/<id>/replies` as a reply; nothing creates one.

### 4. Why it surfaced now

Broken since it was written: `--comment` was specified by what each comment holds, and the posting
call was never part of the definition.

### 4b. Recorded intent

Spec: the feedback record's Proposal for finding 1, written by the definition's owner, which leaves
"a script under `skills/review/scripts/`" or "a shell block" to the maintainer. Asked at the design
gate; Lam Ngoc Khuong chose the Node script on 2026-11-19. Nothing recorded says posting must stay
by hand. `CLAUDE.md`, Skill folder layout, allows `scripts/` in an `atk` skill "for the checks whose
answer must be the same on every run"; the anchor check is one, and ADR 0018 records the decision.
No conflict.

## F2. The posting gate has no fixed shape in the trace

### 1. Symptom as captured

> 122 runs wrote a posting gate under 12 names: `post consent` 56, `post comments` 45, `posting
> consent` 5, `post` 5, `post review` 3, `post review comments` 3, `post to tracker` 3, `consent` 2,
> and four used once. 13 runs wrote what was posted on a line outside the six kinds (`step ticket:`,
> `ticket:`, `post:`) ... 5 runs rewrote the `flags` field after the run to show a `--comment` given
> in a later turn

### 2. Root cause

Posting sits under `## Ticket`, outside the numbered steps, and neither the skill nor
`shared/run-trace.md` names the gate kind or what its answer carries; the `flags` bullet does not say
what happens to a flag given after the invocation. Location: `plugins/atk/skills/review/SKILL.md:254`,
`plugins/atk/shared/run-trace.md:181` (at `8ecba42`).

### 3. Evidence

```
$ grep -rn 'gate post' plugins/atk/
(no output)
```

`shared/run-trace.md:181` reads `gate <kind>` with the kind free, and the `flags` bullet names only
"the flags passed in the invocation".

### 4. Why it surfaced now

Broken since it was written.

### 4b. Recorded intent

Spec: the feedback's Proposal for finding 2. `shared/run-trace.md` keeps the six event kinds; `gate
post` is a kind of `gate`, not a new event, so no rule is crossed. Nothing found.

## F3. Answers on the thread are put to the reviewer before posting

### 1. Symptom as captured

> 12 runs asked the reviewer, before posting, what to do with each finding the author had answered
> ... The rule they followed is the reporter's: list every answered finding with the author's reason,
> ask accept, ask for evidence, or keep, and post only what the reviewer picks. ... It lives in the
> assistant's memory on one machine. ... a band-1 reviewer agent was never told it and kept an
> answered finding open

### 2. Root cause

`references/report-format.md` reads each answer and classifies it, but never has the run put an
answered finding to the reviewer before posting, and `references/review-rounds.md` gives the band-1
agent no thread, which its tools, Read, Grep and Glob, cannot reach. Location:
`plugins/atk/skills/review/references/report-format.md:59-72`, `:333-353`;
`plugins/atk/skills/review/references/review-rounds.md:177-182` (at `8ecba42`).

### 3. Evidence

`report-format.md:59-72` classifies an answer as fixed, deferred, declined or disputed and says the
summary carries one line per answered finding; no line asks the reviewer. `review-rounds.md:177-182`
lists what the band-1 agent is given: the masked diff, the intent and the conventions, with no
answers. `plugins/atk/agents/read-only-reviewer.md` names `tools: Read, Grep, Glob`.

### 4. Why it surfaced now

Broken since it was written.

### 4b. Recorded intent, and the conflict

Spec: the feedback's Proposal for finding 3, four bullets. The second bullet, "an answer from the
person who holds the call per `## Roles` is a ruling even when that person is also the author",
conflicts with rule 2 of `shared/team-roles.md:43`, under which the author never approves their own
work. The intent check stopped on it and put it to the owner, Lam Ngoc Khuong, who answered on
2026-11-19 to drop that bullet and leave the kit unchanged there. The other three bullets are fixed.

## F6. `gh pr checkout` takes over the person's working tree

### 1. Symptom as captured

> `shared/ticket-adapters.md:160-166`: `gh pr checkout <number>` first, "every time", because the
> mask reads `HEAD`. Silent on a working tree the person is using ... every `--comment` pass of the
> session ... created a detached worktree of the PR head in the session's scratch directory, ran the
> mask there, pointed the round agents at it, and removed it at the close.

### 2. Root cause

The adapter gives one route to the head, the checkout, and no second for a tree in use. Location:
`plugins/atk/shared/ticket-adapters.md:160-172` (at `8ecba42`).

### 3. Evidence

```
$ grep -rn 'worktree' plugins/atk/shared/ticket-adapters.md plugins/atk/skills/review/
(no output)
```

### 4. Why it surfaced now

Broken since it was written.

### 4b. Recorded intent

Spec: the feedback's Proposal for finding 6. `shared/secret-scan.md` puts a run's files under `git
rev-parse --git-path atk/<skill>/<run-id>`; the worktree goes there too, and a test on this machine
showed `git worktree add` works inside the git directory. Nothing found against it.

## 5. The change

All four defects, one change. `F1`: `plugins/atk/skills/review/scripts/post-review.mjs`, Node with
its standard library, starting `git` through the runner of `atk:security`'s
`scripts/lib/git-history-stream.mjs`. It checks every inline line against `<base>...<commit>` for
that file, three lines of context, sends nothing while one is outside and names the nearest added
line; under `--post`, given after the person's yes, it creates one review from a payload written to
a file, reads each comment back, refuses `APPROVE`, and carries GitHub's reasons when a review is
refused. `shared/ticket-adapters.md` gains the posting paragraph, `skills/review/SKILL.md`
`## Ticket` names the script, ADR 0018 (en, vi) records the decision. `F2`:
`references/report-format.md` names the `gate answers` and `gate post` lines, and the `flags`
bullet of `shared/run-trace.md` makes a flag given in a later turn the answer on its gate, never a
rewrite of the header. `F3`: `references/report-format.md` has the reviewer accept, ask for
evidence, or keep each answered finding before anything is posted, keeps a `fixed` answer the head
does not bear out open as a fact, and `references/review-rounds.md` gives the band-1 agent the
answers as a file. `F6`: `shared/ticket-adapters.md` reads the head from a detached worktree under
the run directory when the person's tree is in use, with the run directory computed once in the
person's tree and the base recorded as a sha.

It is the smallest change that removes the four causes: each was an absence, and each addition sits
in the file that already owned the neighbouring rule. The script is wider than a shell block, by the
maintainer's choice at the design gate.

Tidy: `/simplify` replaced the script's own copy of the environment scrub with the `runner` import,
removed a one-item loop in the test, and trimmed two sentences of `report-format.md` to point at
`shared/ticket-adapters.md` and `shared/run-trace.md` instead of restating them; nine suggestions
were skipped, among them merging the per-file diffs and moving the posting prose.

Reference documents: the posting procedure and the trace's `flags` rule are public contracts of the
kit; `shared/ticket-adapters.md`, `shared/run-trace.md`, `skills/review/references/report-format.md`
and `review-rounds.md` moved with them, with `CLAUDE.md`, `docs/system-architecture.md`,
`docs/codebase-summary.md` and their `docs/vi/` mirrors, and ADR 0018.

Rule an agent follows: every change to Markdown here is a sentence of the rule itself, the narrowest
form, in the file that owns the rule. Review fixes: `S1` and `S2`, the same form in
`shared/ticket-adapters.md`; `S3`, code, in `post-review.mjs` with its stand-in in `tests/verify.sh`.

## 6. Verified

- `bash tests/verify.sh` (the repository's only suite, the required `verify` job): 101 `OK` after
  the review fixes. The new check builds a repository, puts a stand-in `gh` on the `PATH`, and shows
  that an unanchored line stops the post with the nearest added line, that check mode sends nothing,
  that a summary with backticks, quotes and `<details>` arrives intact, that a shifted comment and a
  refused review exit `3` with GitHub's reason, and that seven malformed specs exit `2`. Two
  mutations made it fail: anchors forced to `true`, and the old first-line error read.
- `claude plugin validate .` passed.
- The reproduction: the greps of section 3 now find the posting call, `gate post`, the reviewer's
  decision on answers and the worktree route.
- The worktree route, run in a scratch clone with uncommitted work: the masked diff survived the
  close, the base was a sha, the person's branch and files did not move. The round-2 reviewer ran
  it again, with `post-review.mjs` against the result.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/fix-review-posting-procedure-261119-0658.md`, band 1, 437 changed
  lines: 0 `BLOCKING`, 3 `SHOULD FIX`, 4 `NIT`. `S1` (the checkout still said "every time") and
  `S2` (`--git-path` and `FETCH_HEAD` resolve per worktree) fixed in `shared/ticket-adapters.md`;
  `S3` (a refusal kept only `gh`'s first error line) fixed in `post-review.mjs` and its stand-in.
- Round 2, `docs/derived/reviews/fix-review-posting-procedure-261119-0710.md`, the fix's delta:
  0 `BLOCKING`, 0 `SHOULD FIX`; `S1` to `S3` closed; `N5`, `N6` new.
- Left as `NIT`: `N1` the payload's temp directory stays after a refused post, since `process.exit`
  skips the `finally`; `N2` a short `commit` is sent as `commit_id` unresolved; `N3` the lib header
  and its summary rows name only `atk:security` as its user; `N4` the `ticket-adapters.md` summary
  rows omit posting and the worktree; `N5` an `errors[]` object with no `message` is dropped; `N6`
  the block's `gh pr view` does not ask for `headRefOid`, so "already at the head" is judged by name.
- Closing read: none owed, round 2 fixed nothing.
- `atk:verify`: offered after the clean loop; the kit has no running system beyond the suite, so it
  did not run.

## 7. Not verified

- No review was posted to GitHub: every post ran against a stand-in `gh`. Where `S3`'s fix reads
  GitHub's body was checked with a read that fails, not with a refused review: on `gh` 2.104.0,
  `gh api` on a 404 printed the JSON body on standard output and `gh: Not Found (HTTP 404)` on
  standard error, the shape the stand-in now uses.
- A file renamed in the pull request is diffed as added, as ADR 0018 states; a line GitHub would not
  show there is refused by GitHub and the script exits `3`.
- The read-back reads one page of 100 comments.
- No run of `atk:review --comment` has yet followed the new text end to end, the reviewer's decision
  on answers and the `gate post` line included.

## 8. Blast radius

- `atk:review` `## Ticket` and its two references: changed, read by the two review rounds.
- `shared/ticket-adapters.md`, the pull-request reading block, is also followed by
  `atk:plan --review` (`plugins/atk/skills/plan/`), which now gets the worktree route too; not
  exercised. `atk:verify`'s own line, further down, is unchanged.
- `shared/run-trace.md`, the `flags` bullet, is read by every skill and by `atk:tailor --feedback`;
  checked by the run-trace example check of `tests/verify.sh`, otherwise not exercised.
- `atk:security`'s `scripts/lib/git-history-stream.mjs`: unchanged, now imported by a second
  script; its own checks in `tests/verify.sh` pass.

## 9. Left for later

- `CLAUDE.md`, Skill folder layout, says `scripts/` is for "the checks whose answer must be the same
  on every run, and only those". `post-review.mjs` checks and then posts. ADR 0018 rests on the
  check; whether that sentence is widened is Lam Ngoc Khuong's call.
- The masking scan of `shared/secret-scan.md` is still copied out of Markdown by every run; the
  feedback suggests a shipped script for it too. Separate work.
- `tests/bench/check-chain.mjs` fails about one run in four on this machine, `ENOENT` copying
  `steps/1/seed/.git-kept-by-bench/objects` (2 of 8 runs alone, 1 of 3 in another set); it passed in
  both later full runs. This branch touches nothing under `tests/bench/`. Separate work.
- The six `NIT` findings of section 6b, `N1` to `N6`.
- The read-back of `post-review.mjs` asks for one page of 100 comments; a review with more inline
  comments than that would read the rest as not landed. The cap of step 6 keeps a review far below it.
