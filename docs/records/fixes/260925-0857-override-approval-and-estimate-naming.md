---
title: "Fix: an unapproved override changed skill behaviour, and three smaller gaps from the estimate re-run"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# Override approval, tracker access, estimate naming and threshold

Four defects left for later by `docs/records/fixes/260925-0628-estimate-basis-and-sheet-shape.md`,
section 9, each reported by the re-run of `atk:estimate` on a client project recorded there. IDs
below are this record's own.

## 1. Symptom as captured

From that re-run's report:

> The override is `IN REVIEW`, not `APPROVED`. The kit has no rule on whether an unapproved
> override applies. I applied it.

> `gh auth status` passed but the repo was not visible. The check proves you are logged in, not
> that this repository is readable.

> Default path collides: `estimate-<sprint>` carries no ticket, so two epics estimated for one
> sprint get the same name.

And, noted in the earlier record: step 3 splits at `13` points while the Definition of done splits
above `8`.

## 2. Root cause

- `O1`: rule 7 of `shared/team-roles.md` said "read the override when it exists" and nothing about
  its `status`, so a draft took effect on the next run. `atk:tailor` writes every override at
  `IN REVIEW` (`skills/tailor/SKILL.md:154`), so every override was live before its approver saw it.
- `O2`: `shared/ticket-adapters.md`, "Detected is not reachable", named `gh auth status` as the
  proof of access. It proves a login, and on a machine with several accounts the signed-in one may
  not see the repository.
- `O3`: the `estimate` row of `shared/artifact-paths.md` named the file by sprint alone.
- `O4`: `skills/estimate/SKILL.md` step 3 and its Definition of done stated two thresholds.

## 3. Evidence

The lines as they stood at `bd61f5f`:

```
shared/team-roles.md:69   7. **Honour the project's overrides.** Read `.atk/overrides/<this skill>.md` when it exists: `## Before`
shared/ticket-adapters.md:44  Before the first read that matters, spend one cheap call proving access: `gh auth status` for
shared/artifact-paths.md:133  | `estimate` | `docs/records/planning/estimate-<sprint-or-date>.md` |
skills/estimate/SKILL.md:88   Default scale is Fibonacci `1, 2, 3, 5, 8, 13`. Anything at `13` or above must be split before it is
skills/estimate/SKILL.md:165  - [ ] No committed item is larger than 8 points, 3 person-days, or 24 hours without a split,
```

The re-run is the reproduction for `O1` to `O3`: it applied an `IN REVIEW` override, passed
`gh auth status` on an account that could not resolve the repository, and could not use the default
name because a sheet for the same sprint already held it.

## 4. Why it surfaced now

Broken since each rule was written. It surfaced on the first run against a project that had an
unapproved override, several signed-in accounts, and more than one epic per sprint.

## 4b. Recorded intent, and the conflict when there is one

`O1` changes behaviour that was a gap rather than a decision: no record says an unapproved override
applies, and `CLAUDE.md`, "The team premise", says a skill never enters an approval state itself.
The owner chose, in this session, that only an approved override applies. `O2` to `O4` contradict no
record.

## 5. The change

- `O1`: rule 7 applies an override only at `status: APPROVED`. `shared/project-overrides.md` gains
  "Only an approved override applies": any other status, or no front matter, is read and not
  applied, and the artifact says so in one line naming the approver. `atk:tailor` step 5 says the
  skill runs as shipped until approval, and that updating an approved file suspends it until it is
  approved again. Both `system-architecture.md` and both `skills-overview.md` say it.
- `O2`: the reachability proof is a read of this project, `gh repo view <owner>/<repo>` on GitHub,
  with the reason a login is not enough.
- `O3`: the default name is `estimate-<sprint-or-date>-<ticket>.md`, the ticket left out where the
  backlog has none, in `shared/artifact-paths.md`, the skill's Output, and the template.
- `O4`: step 3 states the one threshold the Definition of done checks.

Tidy step: Markdown prose, run by hand per `shared/tidy-pass.md`; it reflowed rule 7 and changed
nothing else.

## 6. Verified

From `CLAUDE.md`, "Common verification commands": the five manifests parse, the mirror `diff` prints
nothing, and the em-dash, other-kit and dated-name `grep`s exit 1. `grep -l "^status: APPROVED"
.atk/overrides/*.md` lists `review.md`, the kit's only override, so `atk:review` on this repository
keeps applying it.

## 7. Not verified

- No skill was run against an `IN REVIEW` override to see the one-line notice appear.
- `hooks/load-overrides.mjs` still loads any override; it decides nothing, and the gate is the
  skill's, per "`hooks/` never holds a rule". Not exercised with a draft file.

## 8. Blast radius

- Every skill, through rule 7: a project whose overrides carry no front matter, or sit at
  `IN REVIEW`, loses their effect until someone approves them. This is the intended change and the
  largest behaviour change here; release notes should say so.
- `shared/ticket-adapters.md` is cited by every skill; the proof is one call either way.
- No skill reads an estimate sheet by name.

## 9. Left for later

- `atk:tailor --audit` could report every override not yet `APPROVED`; not added here.
