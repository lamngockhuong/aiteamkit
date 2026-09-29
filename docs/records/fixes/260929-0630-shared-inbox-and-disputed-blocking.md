---
title: "Fix: a verify run emptied a shared mail catcher, and an implement run carried a disputed BLOCKING to a pull request"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-29
updated: 2026-09-29
ticket: none
---

# atk:verify, atk:implement, atk:review, atk:git: gaps found on one client run

Seven fixes from four feedback records written on 2026-09-29 after one run of `atk:implement`, the
`atk:review` it called, `atk:verify`, and `atk:git` against a client project. The records sit at
`docs/derived/feedback/vi/{git,implement,review,verify}-260929.md` in this repository's working
copy, which is gitignored. IDs below combine the skill and the record's own finding number: `V1` is
finding 1 of the verify record. Findings the records mark as done correctly, or as facts of that
project's profile or its own override, are not fixed here and are listed under section 9.

## 1. Symptom as captured

From the feedback records:

> `V1` The run deleted the whole local mail catcher inbox with a command not in the profile.

> `V2` No guidance for a login that needs a code sent out of band (email OTP).

> `V3` The start command failed on a missing environment variable: no branch handles it.

> `V4` No `Prepare`, but the database was found out of date mid-run: the option list does not apply.

> `I1` A `BLOCKING` was lowered to `SHOULD FIX` and the work went on to a pull request instead of
> stopping for the Tech Lead. (With `I3`: severity changed across rounds, against "take the
> highest". With `R2`: the finding would reverse a decision recorded in the plan, and no rule covers
> that.)

> `R3` The second review after a fix is undefined: all rounds again, or only the relevant one. (With
> `I2`: the loop says only "call again".)

> `G1` A pre-commit hook (`lint-staged`) backs up with `git stash`, and the stash is shared between
> worktrees.

## 2. Root cause

Each is a definition gap, except `I1`, where the definition was clear and the gap was on the road
around it.

- `V1`, `V2`: `skills/verify/SKILL.md:224` (before this change) names "a cache or bucket" as the
  shared stores, and `skills/verify/references/runtime-checks.md` Cleaning up handles caches,
  buckets and databases. A mail catcher is none of those, so nothing marked it as shared, and the
  run improvised a way to read a code by emptying it.
- `V3`: `runtime-checks.md` Knowing it is ready covers a timeout only. A start that exits early for
  configuration had no rule, so the run chose its own values from the project's example file.
- `V4`: `runtime-checks.md:24` offers "run the rest of `Prepare`", which does not exist when the
  profile has none, and line 33 covers only the check before start.
- `I1`: `skills/implement/SKILL.md:170` and `references/review-fix-loop.md:57,72` say a disputed
  `BLOCKING` stops the work and a severity is never lowered to pass. Two things let the run go
  around it: `atk:review` had no rule for a finding that contradicts a recorded decision, which made
  lowering it look like respecting the decision, and step 6 of `atk:implement` had no gate of its
  own, so the handoff to `atk:git` happened on the user's yes to a push they were not told the skill
  forbade.
- `R3`, `I2`: `review-fix-loop.md:15` says `[call again]`, and `atk:review` never says what a
  second call covers.
- `G1`: `skills/git/references/commit-craft.md` "A hook that writes" covers re-staging and the secret
  re-scan, not the stash.

## 3. Evidence

Quoted lines, with the check that shows the gap. Each was read at commit `106b7c9`.

- `skills/verify/SKILL.md:224`: "A cache or bucket another session reads gets an inventory before the
  first request". `grep -n -i "mail\|otp\|inbox" skills/verify/SKILL.md skills/verify/references/*.md`
  printed nothing.
- `runtime-checks.md` Knowing it is ready: "A timeout that expires is a failure of this run", and no
  line about an early exit or a missing variable.
- `runtime-checks.md:24`: "- run the rest of `Prepare` against this store"; line 33: "Where the
  profile has no `Prepare` line, the check does not run and is not improvised".
- `review-fix-loop.md:72`: "it does not lower a finding's severity to get past it";
  `grep -rn -i decision skills/review/SKILL.md skills/review/references/*.md` found no rule for a
  finding against a recorded decision. `implement/SKILL.md` step 6 opened straight on "Hand off to
  `atk:git`".
- `review-fix-loop.md:15`: `[re-verify] -> [call again]`, and nothing in `skills/review/` for a
  second call.
- `grep -rn stash skills/git` printed nothing.

## 4. Why it surfaced now

Broken since each rule was written. The client run was the first to meet a login code sent by mail,
a start command that needed variables the local environment lacked, and a review finding that
collided with a decision the plan had recorded the day before.

## 4b. Recorded intent

Searched `CLAUDE.md`, the four `SKILL.md` files and their references, and `shared/team-roles.md` for
a record saying the current behaviour is intended. None found. Rule 3 of `shared/team-roles.md` and
the "Do not decide what a role owns" premise in `CLAUDE.md` point the same way as every fix here:
each one replaces a choice the run made on its own with a question to a person.

## 5. The change

- `V1`, `V2`: a mail catcher, or any channel a login code arrives through, is a shared store whether
  the profile names it or not: listed before the request that sends the code, read from the message
  that arrived after it, and never emptied. The commands that read it come from `Shared stores` or
  from a person. `runtime-checks.md` Cleaning up holds the rule; `SKILL.md` Process management
  points at it; the report template, the definition of done, and `atk:init`'s profile template and
  detection name the mail catcher.
- `V3`: `runtime-checks.md` Knowing it is ready: a start that exits for missing configuration stops
  with three options, the run fills in no value itself, and supplied values pass the local-only
  check again. `SKILL.md` step 2 points at it.
- `V4`: `runtime-checks.md`: a mismatch found without `Prepare` stops that case with three options,
  and the run puts forward no migrate or seed of its own.
- `I1`: `atk:review` step 1 and a new `Decision` label in `references/report-format.md`: a finding
  whose fix reverses a recorded decision keeps its severity and names the decision and its owner.
  `atk:implement`: a dispute never changes a severity, step 6 does not start while a `BLOCKING` is
  disputed or escalated, and the user is told so in plain words. One new definition-of-done line.
- `R3`, `I2`: `review-rounds.md` Called again after a fix: the subject is the diff since the first
  review plus what it reaches, the rounds are chosen for that subject, and every finding the fix set
  out to close is checked by its identifier. `review-fix-loop.md` points at it.
- `G1`: `commit-craft.md`: where a hook uses the stash and the repository has several worktrees,
  compare `git stash list` before and after the commit, and report a difference rather than popping
  or dropping.
- `docs/skills-overview.md` and `docs/vi/skills-overview.md`: the `implement`, `review` and `verify`
  sections say what changed for a reader.

`skills/review/SKILL.md` stood at 299 lines. The two new sentences fit by folding the description
in the frontmatter onto fewer lines, with every word and trigger kept, and by dropping "and is not a
second list alongside it" from step 3, which repeated the sentence before it.

Tidy: this change is prose, so the host's code clean-up capability has nothing to read. The pass was
run by hand per `shared/tidy-pass.md`: two paragraphs reflowed to the 100-column width, and one
sentence in the new review section rewritten because it contradicted Finding identifiers in
`report-format.md` about how an open finding keeps its number.

## 6. Verified

The verification block in `CLAUDE.md`, run after the change:

- em-dash `grep`: no output. `ak:` `grep`: no output. Six-digit date `grep`: no output. Hardcoded
  fill `grep`: no output.
- `docs/` and `docs/vi/` mirror `diff`: no difference.
- `name:` matches the folder for every skill; the frontmatter of `review`, `verify` and `implement`
  parses as YAML.
- `wc -l skills/*/SKILL.md`: none at 300 or above; `review` 299, `verify` 292, `implement` 256.
- `check_translation.py docs/vi --source docs --repo .`: no finding on a line this change added. The
  one it raised at first, `round` in the new `implement` paragraph, was rewritten.

## 7. Not verified

- No skill was run against a project after the change. The rules are read by an agent, and nothing
  short of a run shows that the next `atk:verify` reads a code without emptying an inbox, or that
  the next `atk:implement` stops at step 6. The check is to re-run the same three skills against a
  project with a mail catcher and a plan that records a decision.
- The trigger evals were not re-measured. The `atk:review` description changed line breaks only,
  and no other description changed.

## 8. Blast radius

- `skills/implement/references/review-fix-loop.md` calls `atk:review`: updated on both sides.
- `skills/qa/references/review-mode.md:89,109` and `skills/plan/references/plan-review-mode.md` follow
  `skills/review/references/report-format.md`: the new `Decision` label is optional and appears only
  where a recorded decision is reversed, so a report without it reads as before. Not exercised.
- `skills/init/references/profile-template.md`: a profile written before this change has no mail
  catcher on its `Shared stores` line, and `atk:verify` now treats one as shared anyway. Not
  exercised.
- `atk:fix` and `atk:verify` also run a review-like pass, but neither calls `atk:review`, so the
  second-pass rule does not reach them.

## 9. Left for later

- `R1`: all nine review rounds came back empty on a diff of about 3,300 lines. Not changed: step 5
  already verifies every "checked and fine", and that step is what found the misses. Whether a
  search-only agent type is deep enough for a round needs a comparison run on the same diff first.
- `G3`: a `--draft` flag for `atk:git --pr`. Low value, and adding a flag touches five files.
- `G2`, `R4`: a report written to a directory the project excludes from git. Posting it to the pull
  request is that project's choice, for its own `atk:git` override. Only `atk:fix` checks
  `git check-ignore` before writing; moving that check into Persistence in `shared/artifact-paths.md`
  would cover `atk:review` and `atk:verify` too.
- `V5`, `V6`: facts of the client project's profile, fixed there through `/atk:init --audit`.
- `G4`: the run did what the definition says.
