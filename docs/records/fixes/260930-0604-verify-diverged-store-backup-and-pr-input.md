---
title: "Fix: atk:verify offered a migrate over a diverged store, reset a shared store with no backup, and took no pull request as input"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-30
updated: 2026-09-30
ticket: docs/derived/feedback/verify-260930.md#1, #2, #4, and the step 5 note
---

# atk:verify: a diverged store, a backup before a destructive write, and a pull request as input

Four fixes from one feedback record written on 2026-09-30 after an `atk:verify` run against a client
project. The record sits at `docs/derived/feedback/verify-260930.md` in this repository's working
copy, which is gitignored. IDs `1`, `2` and `4` are the record's own finding numbers; `S5` is the
question the record raised under step 5 of its steps table. Finding 3 of the record is local to that
project and belongs to `/atk:init --audit` there.

The record's two open questions were answered by its approver, Lam Ngoc Khuong, on 2026-09-30:
for a diverged store the migrate option is dropped entirely (question 2), and a destructive
preparation of a store the run did not create gets a rule of its own rather than being counted as a
resource the run created (question 1).

## In short

A verify run on a client project found its local database holding migrations 1 to 76 plus one from
another branch, while the branch has 1 to 81. The skill still offered "run the migrations" first; the
migration failed halfway, the person then chose a reset, and the reset wiped another worktree's data
and the application's database permissions, so the first request returned a `500` that looked like a
bug in the change. The data survived only because a personal rule, not the skill, had taken a backup.

This change makes the skill tell a database that is merely behind from one holding another branch's
migrations, and never offer to migrate the second. It requires a backup, a restore command in the
report, and a check with the application's own connection before any case runs, whenever the run
writes to a database it did not create. It also lets a pull request be the input, with the report
offered on that pull request, and checks before writing any record whether git ignores its
directory, a check every record-writing skill now inherits.

None of it has been followed by a real run yet. Lam Ngoc Khuong, as the kit's owner, has to approve it.

## `1` A migrate was offered over a store whose history had diverged

### 1. Symptom as captured

> Found 77 applied against 81 on the branch. A set diff done beyond the profile's count check showed
> 5 missing and 1 foreign migration. The run reported both, then still offered `db:migrate` as the
> first option. The user chose it, and it failed at 0076 with a missing-relation error.

### 2. Root cause

The mismatch options treat every mismatch alike, so "run the rest of `Prepare`" is offered for a
store that holds another branch's migrations; the warning that fits that case is attached only to the
branch with no `Prepare` line. `skills/verify/references/runtime-checks.md:21-28`, and `:47-49` for
the warning.

### 3. Evidence

At `f768598`, `runtime-checks.md:24`: "run the rest of `Prepare` against this store, when the person
answering says no other session depends on its current state", with no condition on the store's
history. `:47-49`: "Nothing says the store's migration history comes from this branch, and a
migration run over another branch's history fails at best and half-applies at worst", reached only
from `:38`, "A mismatch can still show itself later without a `Prepare` line".

### 4. Why it surfaced now

`ef99cf5` (`fix: make atk:verify check the data store and clean shared stores`, #76) introduced the
options; it wrote the warning for the no-`Prepare` path only. The client run was the first with a
`Prepare` line and a store another worktree had migrated.

### 4b. Recorded intent

`docs/records/fixes/260928-1035-verify-data-store-and-shared-stores.md`, the record of #76, states no
decision to offer a migrate over a diverged history; its concern was not migrating without asking.
The approver's answer to question 2 settles the rest.

## `2` A shared store was reset with no backup, and its grants went with it

### 1. Symptom as captured

> The backup (`pg_dump`) was taken only because of the user's global rule, not because of the
> skill. Dropping the schemas removed the app role's grants. The first request then failed with
> `500 permission denied for schema <schema>`.

### 2. Root cause

Nothing in the skill covers a store the run changes destructively on a person's answer: Cleaning up
covers a store the run created (`runtime-checks.md:211-214`), and the mismatch options cover asking,
not what has to exist before and after the write.

### 3. Evidence

`grep -n -i "backup\|restore\|dump" skills/verify/SKILL.md skills/verify/references/*.md` at
`f768598`: no match.

### 4. Why it surfaced now

Broken since the options were written in `ef99cf5`: no earlier recorded run chose a reset.

### 4b. Recorded intent

Nothing found in the #76 record or the git log of `runtime-checks.md`.

## `4` A pull request was not an input, and the report went to the ticket

### 1. Symptom as captured

> `SKILL.md:53-60` lists `<module>`, `<paths>` and `<ticket>` as inputs, with no pull request form.
> `SKILL.md:255`: "The report is offered as the comment on the ticket". The user asked for the PR
> instead. Cost: one extra round with the user.

### 2. Root cause

The input list and `## Ticket` were written for a ticket only. `skills/verify/SKILL.md:12`
(`argument-hint`), `:54-56`, `:92-94` (criteria sources), `:255`.

### 3. Evidence

At `f768598`, `grep -n -i "pull request\|<pr" skills/verify/SKILL.md` matched nothing in Invocation,
step 1, or `## Ticket`, and `grep -rn "gh pr comment" skills shared` matched nothing anywhere.

### 4. Why it surfaced now

Broken since it was written: earlier recorded runs started from a module or a ticket.

### 4b. Recorded intent

Nothing found in `docs/records/fixes/`, the git log of `skills/verify/SKILL.md`, or
`shared/ticket-adapters.md`.

## `S5` The report's directory was not checked for being ignored

### 1. Symptom as captured

> The `atk:git` hand-off did not happen: `docs/records/` is in `.git/info/exclude` here.

### 2. Root cause

Persistence in `shared/artifact-paths.md` requires the team to hear about an ignored directory
before the file is written, but names no way to check, and a reading of `.gitignore` misses
`.git/info/exclude`. `atk:fix` states the check itself (`skills/fix/SKILL.md:185-190`); `atk:verify`
and ten other skills writing under `docs/records/` do not.

### 3. Evidence

`grep -c check-ignore` over every `SKILL.md` that writes to `docs/records/`: `fix` 2, and 0 for
`breakdown`, `design-doc`, `estimate`, `handover`, `incident`, `intake`, `qa`, `release`, `retro`,
`security`, `verify`.

### 4. Why it surfaced now

The client project excludes `docs/records/` through its clone rather than `.gitignore`; no earlier
run met that shape.

### 4b. Recorded intent

The rule exists and is not contradicted: Persistence says the team is told before the file is
written. The fix supplies the missing check.

## 5. The change

- `skills/verify/references/runtime-checks.md` (`1`): a mismatch is first classed as lagging or
  diverged, by migration identity; a check that returns counts alone is treated as diverged and
  `/atk:init --audit` is named. For a diverged store, running the rest of `Prepare` is not offered;
  the no-`Prepare` warning and its three options apply, with the foreign migrations listed.
- `skills/verify/references/runtime-checks.md` (`2`): a new subsection, Before anything writes to a
  store the run did not create. A backup first, with backup and restore commands from the profile or
  a person; a path that outlives the session; both in the report; and, before the first case, the
  read-only data command run as the application's own connection, a failure there being environment
  work rather than a round.
- `skills/verify/references/report-template.md` (`1`, `2`): section 2 carries the kind of mismatch,
  the backup's path and restore command, and the application-connection check; section 7 always
  lists the backup.
- `skills/verify/SKILL.md` (`1`, `2`, `4`, `S5`): step 1 names the diverged-history and backup
  rules; `<pr>` in `argument-hint` and Invocation; step 1 takes criteria from a pull request and asks
  rather than checks out when the tree is not at its head; `## Ticket` offers the report on the pull
  request first; Output runs `git check-ignore -v`; two Definition of done lines extended.
- `shared/artifact-paths.md` (`S5`): Persistence names `git check-ignore -v <dir>` as the check,
  which covers every skill that cites it rather than ten separate edits.
- `shared/ticket-adapters.md` (`4`): `gh pr comment` added to the push commands.
- `README.md` (`4`): the invocation block reads `<module|paths|ticket|pr>`.

Two additions go beyond the record's wording. The working-tree sentence for `4`: without it a run
from a pull request verifies whatever the tree holds. Treating a count-only check as diverged for
`1`: without it the rule depends on a check that, in the client run, could not tell.

Tidy: the harness's clean-up capability was not used, because the change is prose; the pass was run
by hand per `shared/tidy-pass.md`. It merged and rewrapped the new sentences in `SKILL.md` to keep it
under 300 lines (298), and rewrapped one line of an existing paragraph that ran past 120 characters.

## 6. Verified

- `wc -l skills/verify/SKILL.md`: 298 (CONV-006).
- `grep -q "^name: verify$"` and a YAML parse of the frontmatter: OK (CONV-005).
- The em-dash `grep` (CONV-003), the `ak:` `grep` (CONV-004), and the dated-name `grep`: no output,
  exit 1 each.
- The captured reproductions, re-run as greps: `runtime-checks.md` now holds "has diverged" and the
  backup subsection; `SKILL.md` matches `<pr>` and `check-ignore`; `artifact-paths.md` matches
  `check-ignore`; `ticket-adapters.md` matches `gh pr comment`.

## 7. Not verified

- No verify run was made after the change, so none of the new rules has been followed by an agent
  end to end: a diverged store, a backup and restore, a run from a pull request.
- The ten other record-writing skills now inherit the check through Persistence only; none was run.
- The trigger evals were not re-measured; no `description:` changed.

## 8. Blast radius

- `README.md:107`, the only other list of verify's inputs: updated.
- `docs/skills-overview.md` and `docs/vi/skills-overview.md`: no invocation or data-store rule for
  verify in either; checked by reading `## atk:verify` in each. Nothing to move.
- `shared/artifact-paths.md` Persistence: cited by every skill; the added sentence names a check for
  a rule they already follow.
- `shared/ticket-adapters.md` push commands: an added command changes nothing for a skill that does
  not use it.
- No public contract changed; no reference document owes an update.

## 9. Left for later

- Finding 3 of the record: the client project's `Prepare` check compares counts, and its app-role
  grants are not in its profile. `/atk:init --audit` in that project.
- `atk:init` could propose a `Prepare` check that compares migration identities, and ask for backup
  and restore commands, so projects do not meet the new fallbacks on their first verify run.
