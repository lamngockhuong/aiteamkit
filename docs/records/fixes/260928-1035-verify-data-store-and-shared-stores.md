---
title: "Fix: atk:verify left data-store preparation, shared stores and fixtures to the run's judgement"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-28
updated: 2026-09-28
ticket: none
---

# atk:verify: data store, shared stores, fixtures, and the report's commit

Six findings from a feedback record on one `atk:verify` run against a client project, written on
2026-09-28 at `docs/derived/feedback/verify-260928.md` in this repository's working copy, which is
gitignored. The run passed; the findings are about what the skill left it to improvise. IDs below
are the feedback's own finding numbers, `F1` to `F6`. Its seventh finding is a fact of that
project's profile and is fixed there, through `/atk:init --audit`, not here.

## 1. Symptom as captured

From the feedback record:

> `F1` No step brings the data store to the state of the branch under verification.

> `F2` Cleanup rules cover processes and "data", not shared caches, buckets or databases other
> sessions read.

> `F3` The DoD demands every command come from the profile, which no run that must prepare data can
> meet.

> `F4` Resources the run creates that are not processes have no cleanup rule.

> `F5` Fixture setup for data the change only reads is neither allowed nor forbidden.

> `F6` Unclear whether the report itself goes through `atk:git` when no code changed.

What the run met: a shared local database one migration behind the branch, which another worktree
was also using; a cache database shared across worktrees, where one key shared across all users
would have served this run's rows to another session for 24 hours; a seed script that resets a
shared local login pool; and a table the change only reads, written by a batch outside its scope.

## 2. Root cause

- `F1`: `skills/verify/references/runtime-checks.md:16` ordered what to start ("Data and
  infrastructure first") and nothing checked that the store matched the branch.
- `F2`: `runtime-checks.md:91`, "Data written during the run is left where it is", treated every
  write as evidence. The process rules in `SKILL.md` `## Process management` were the only shared
  hazard named.
- `F3`: `SKILL.md:240` required every command from the profile, and the profile's `Verify` section
  (`skills/init/references/profile-template.md:120-128`) had no field for migrate, seed, grants or
  test logins. The `Setup:` line under Commands installs dependencies and is not that.
- `F4`: `SKILL.md:207` recorded processes only.
- `F5`: `SKILL.md:128` forbade writing data "to make an assertion pass", while
  `references/report-template.md:96` named "a case whose data could not be set up" as a reason for
  not verifying, implying setup without defining it.
- `F6`: `SKILL.md:184`, "A run that changed nothing skips this", read as skipping `atk:git`
  altogether, while `shared/artifact-paths.md:230` puts verification in the Record group, which is
  committed. `SKILL.md:180` also skipped "the paragraph below" with the tidy step.

## 3. Evidence

The responsible lines, quoted from `main` at `bd175b4`:

```
skills/verify/references/runtime-checks.md:91  Data written during the run is left where it is unless the profile says how to remove it.
skills/verify/SKILL.md:128                     skill never writes to data by hand to make an assertion pass.
skills/verify/SKILL.md:184                     something else. A run that changed nothing skips this and says so.
skills/verify/SKILL.md:240                     - [ ] Every command that started, queried, or stopped anything came from the profile.
skills/init/references/profile-template.md:75  - Setup: `<command that installs dependencies>` or none
```

The check: the profile template's `Verify` block has seven fields (`Runs from`, `Start`, `Ready
when`, `Logs`, `Data check`, `Cleanup`, `Local only`), none of which can carry a migration or a
seed, so a run that has to prepare data either breaks `SKILL.md:240` or does not prepare it. The
feedback's run did the first and recorded it.

## 4. Why it surfaced now

Broken since it was written. `atk:verify` had only run against applications whose local store
matched the branch and was used by one session; the first run against a project with parallel
worktrees sharing one database and one cache exercised every path above.

## 4b. Recorded intent

Two decisions were open in the feedback record and were answered by Lam Ngoc Khuong on 2026-09-28,
before any file changed:

- Setup commands live in the profile, as fields `atk:init` fills, not in the skill as a generic
  step.
- A mismatch against a shared local store stops the run and asks, every time; a scratch database is
  not a default.
- A case that writes to a shared database waits for the user's answer before it runs, rather than
  the run removing its rows afterwards; answered the same day, after the first draft of this change
  applied the list-and-remove rule to databases as well as caches and buckets.

No existing record contradicted either. `SKILL.md:62-66` ("never guess a start command") is the
intent the first answer keeps.

## 5. The change

- **Profile contract** (`F1`, `F3`): the `Verify` block gains `Prepare` (the read-only check that
  the store matches the branch, then the commands that bring it there) and `Shared stores` (each
  store another session reads, with its list and remove commands).
  `skills/init/references/profile-template.md`, `skills/init/references/detection.md` (where each is
  detected, at no extra interview turn), `shared/project-profile.md` (the section table), and this
  repository's own `.atk/profile.md` (`none` for both).
- **Preflight** (`F1`): `SKILL.md` step 1 and a new section of `runtime-checks.md` run the `Prepare`
  check before anything starts; a mismatch stops and asks with three options, and the skill never
  migrates or seeds on its own judgement. A profile without the line does not stop the run: the
  check is reported as not done, with `/atk:init --audit` named.
- **Shared stores and created resources** (`F2`, `F4`): `## Process management` and `runtime-checks.md`
  Cleaning up. A shared cache or bucket is listed before and after, exactly the entries the run added
  are removed by name, and listed again. A shared database cannot be listed that way, so a case that
  writes to one, a fixture included, waits for the user's answer: run and leave the rows named, use a
  separate store, or skip the cases. A resource the run created is recorded with its removal
  command, then removed or left with that command. The evidence rule now covers only a store the
  run alone uses.
- **Fixtures** (`F5`): step 3 and a new section of `runtime-checks.md` define setup as written before
  the first request, into a store the run may write, listed in the report. A write after a request
  is never setup.
- **DoD** (`F3`): commands come from the profile apart from fixtures and a resource a person asked
  for, each listed with its reason; two new lines for the data-store check and for shared-store and
  resource cleanup.
- **Report handover** (`F6`): a run that changed no code still hands the report to `atk:git`, since
  it is a record; the tidy-step sentence no longer skips that paragraph.
- **Report template**: section 2 carries the `Prepare` check, created resources and fixtures;
  section 7 the three shared-store listings.
- **Docs**: the `atk:verify` entry of `docs/skills-overview.md` and the `runtime-checks.md` row of
  `docs/codebase-summary.md`, each with its `docs/vi/` mirror.

The fixture exception is the one place commands may come from outside the profile, because no
profile can list the rows each case needs. It still takes them from the project's own shape.

Tidy: this repository has no code, so the host's clean-up capability had nothing to act on. The pass
was run by hand per `shared/tidy-pass.md` over the changed lines, and changed one sentence: the
tidy-step line in step 5 that would have skipped the `atk:git` handover.

## 6. Verified

From `CLAUDE.md`, "Common verification commands":

- No em-dash, no `ak:` reference, every `name:` matches its folder, `docs/` and `docs/vi/` mirror
  each other, no dated name without its time: all silent.
- `skills/verify/SKILL.md` is 283 lines, under 300, and its section order is unchanged.
- The translation checker `check_translation.py` over the two touched `docs/vi/` files: 110 findings on
  `main`, three more after the change, `fixture`, `worktree` and `bucket`, each a technical term kept
  as such.

## 7. Not verified

- No `atk:verify` run has yet exercised the new steps. The next run against the client project,
  after its profile gains the two lines, is the test.
- `atk:init` detecting `Prepare` and `Shared stores` has not been run against any project.
- Profiles written before this change have neither line. They keep working and report the check as
  not done; nothing was run to confirm how an older profile reads under `/atk:init --audit`.

## 8. Blast radius

- `skills/init/`: the template and detection, so every new profile.
- `shared/project-profile.md`: read by every Required and Required-soft skill; only the Verify row
  changed, and only `verify` reads that section.
- `skills/verify/`: its three files. `ui-checks.md` is untouched.

## 9. Left for later

- The client project's profile needs `Prepare` and `Shared stores`, through `/atk:init --audit`
  there (the feedback's seventh finding).
- The two defects in the client application noted by the feedback are in its verification report,
  not here.
