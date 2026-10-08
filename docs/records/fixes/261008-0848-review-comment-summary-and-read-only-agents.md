---
title: "Fix: review's --comment summary pointed at a report no reader could open, a review posted only on the pull request restarted its identifiers, and round agents could start services"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-08
updated: 2026-10-08
ticket: none
---

# Fix: review's --comment summary pointed at a report no reader could open, a review posted only on the pull request restarted its identifiers, and round agents could start services

## In short

On a client project, `/atk:review` reviewed a pull request that added a database table, then posted
its findings under `--comment`. Three things went wrong. The summary comment pointed at the report
for the findings the cap kept off the thread, but the project leaves `docs/derived/` untracked, so
no reader of the pull request could open it. An earlier review by someone else on another machine
existed only as comments on the pull request; the definition would have numbered the new findings
from `N1` again, clashing with the `N1` already on the thread, and the run avoided that only because
it happened to read the comments. And one round agent started a disposable Postgres container on its
own to apply the migration, on a machine whose shared database other sessions use.

Each cause is a gap in the definition, not a run going astray. Now the summary comment lists every
finding the review kept in a collapsed `<details>` block and never points at the report; on a pull
request, the newest `atk:review` summary on the thread counts as an earlier report for identifier
continuity; and an agent spawned by a review or a challenge changes nothing and starts nothing.

Lam Ngoc Khuong approves the change and decides when it ships.

The feedback is `docs/derived/feedback/review-261008-0248.md`, written on 2026-10-08 and not
committed. Its findings 1 to 3 are `R1` to `R3` below. Its finding 4, inline comments too long to
scan, was a team preference and was written as that project's own override; nothing here changes
for it.

## R1: the `--comment` summary points at a report that may not be committed

### 1. Symptom as captured

```text
In this project `docs/derived` is untracked (`.git/info/exclude`). An earlier run of the same skill
on the same PR posted "Full report at `docs/derived/reviews/<pr>-<date>.md` (not committed -
reviewer's working copy)", which no PR reader can open.
```

### 2. Root cause

The definition told the run to point there: `plugins/atk/skills/review/SKILL.md:259`, "the summary as
one review comment that names the rest by identifier and points at the report", and
`plugins/atk/skills/review/references/report-format.md:251`, "and points at the report for the
argument". Meanwhile `plugins/atk/shared/artifact-paths.md:278` says `docs/derived/` "is the only part
of the tree a project may leave untracked". The kit allowed the one state in which its own pointer
leads nowhere. Even tracked, the report sits in the reviewer's working tree, not on the author's
branch.

### 3. Evidence

The quoted lines above, read together: the instruction to point at the report and the permission to
leave its directory untracked are both in the definition as it stood at `0f6f23f`.

### 4. Why it surfaced now

Broken since `--comment` was written; it surfaced on the first project that both posts reviews and
excludes `docs/derived/`.

### 4b. Recorded intent

The cap of step 6 is a recorded decision: "The cap is on attention, not on the record"
(`SKILL.md:213`). Listing every finding visibly in the summary would contradict it. Listing them in a
collapsed `<details>` block does not, because a collapsed block takes no attention until opened, so
the fix takes that form and the cap stands.

### 8. Blast radius

`SKILL.md` `## Ticket` and its done item on identifiers; `report-format.md` *Under `--comment`*. The
band-1 reviewer agent posts nothing (`review-rounds.md:152`), so it is unaffected. `atk:plan --review
--comment` keeps its own format in `plugins/atk/skills/plan/references/` and was not changed.

## R2: a review posted only on the pull request is not found as the earlier report

### 1. Symptom as captured

```text
The earlier review was by another person on another machine, so its report file was absent here. Its
identifiers N1-N3 existed only in the PR comment. Read literally, the definition would have issued a
fresh `N1` on the same PR thread, meaning something different from the posted `N1`.
```

### 2. Root cause

`plugins/atk/skills/review/references/report-format.md:24-32` looked for the earlier report only as
a file in `docs/derived/`, and said "Where there is no earlier report ... numbering starts at 1".
Nothing pointed the run at the thread, where the identifiers of every posted review already were.

### 3. Evidence

The quoted lines: the only source the rule names is a file named after the target, and the fallback
when that file is absent is to start at 1.

### 4. Why it surfaced now

Broken since identifiers were carried across runs; it needs two reviewers on two machines, which a
team produces and a solo trial does not.

### 4b. Recorded intent

None found against the change. The rule's stated purpose, "an author who was asked to fix `B1` has to
find `B1` in the new report too", is what the fix extends to the thread.

### 8. Blast radius

`report-format.md` *Finding identifiers*, `SKILL.md` `## Output` and its done item, and the two docs
that describe what reads a review report. The fix depends on R1: the collapsed list is what makes the
summary hold every identifier. A summary posted before this change has no list, so the rule falls
back to the inline comments of that review, which already opened with their IDs.

## R3: round agents are not bounded on environment side effects

### 1. Symptom as captured

```text
The `lines` round started a disposable Postgres 17.4 container on its own initiative to apply the
migration. It removed the container afterwards. The calling session then added "do not start docker
containers or databases" to every later round's prompt.
```

### 2. Root cause

Silence. `plugins/atk/skills/review/references/review-rounds.md:365`, *What each agent in a round is
given*, listed scope, intent, rules, the type check and the output shape, and nothing about staying
read-only. *Independent reviewers, in parallel* in `plugins/atk/shared/host-capabilities.md`, the
policy the procedure may not overrule, said nothing either. Challenge agents were told only that they
change no file (`plugins/atk/shared/independent-challenge.md:28`).

### 3. Evidence

`grep -n -i "read-only\|container\|docker\|side effect"` over the review skill and
`host-capabilities.md` returned no rule bounding an agent's effect on the environment; the hits were
unrelated (a predicate with a side effect, a diff that changes no behaviour).

### 4. Why it surfaced now

Broken since parallel rounds were written; it took a diff with a migration and a machine with Docker
for an agent to find starting a database the shortest way to check it.

### 4b. Recorded intent

None found. The nearest record is `plugins/atk/skills/verify/SKILL.md:71`, "Change nothing, start
nothing", which is the same boundary for the skill whose job is running the change.

### 8. Blast radius

Every agent spawned under that policy: the rounds and sweep of `atk:review`, the band-1 reviewer
agent, and the agents of `atk:design-doc --challenge` and `atk:plan --challenge` through
`independent-challenge.md`. The band-1 reviewer agent still writes its report, which the rule names
as allowed. The calling agent's single type check is a command that reads the tree and exits, which
the rule names as reading.

## 5. The change

- `plugins/atk/skills/review/references/report-format.md`, *Under `--comment`*: the summary opens
  with `atk:review` and the target, carries the counts and the blocking titles, and lists every
  finding kept in a `<details>` block, one line each, with the failure in one sentence for those the
  cap kept off the thread; it never points at the report. *Finding identifiers*: on a pull request,
  the newest such summary is an earlier report too, and numbering continues above the highest number
  either source used. (R1, R2)
- `plugins/atk/skills/review/SKILL.md`: `## Output` and `## Ticket` say the same in one line each, and
  the done item on identifiers names the pull request summary. Still 299 lines. (R1, R2)
- `plugins/atk/shared/host-capabilities.md`: one policy bullet, a reviewer reads and changes nothing,
  naming what counts as reading and where running the change belongs. (R3)
- `plugins/atk/skills/review/references/review-rounds.md`: one item in what each round agent is given,
  carrying that rule into the prompt. (R3)
- `plugins/atk/shared/independent-challenge.md`: challenge agents are told they start nothing, by the
  same rule. (R3)
- `docs/skills-overview.md`, `docs/artifact-lifecycle.md` and their `docs/vi/` mirrors: what
  `--comment` posts, and that a posted summary carries identifiers forward. (R1, R2)

Tidy step: the change is prose, and the host's clean-up capability reviews code, so the pass was run
by hand per `plugins/atk/shared/tidy-pass.md` over the changed lines. It caught one conflict and fixed
it: the first wording of the R3 rule forbade editing the working tree, which would have forbidden the
band-1 reviewer agent from writing its own report.

## 6. Verified

From `CLAUDE.md`, "Common verification commands" and the checks beside their rules, the ones this
content change can affect:

- No em-dash: the `grep` prints nothing, and no added line carries one.
- No command of another kit (`ak:`): prints nothing.
- `atk` names `atkx` only in `atk:help`: prints nothing.
- `docs/` and `docs/vi/` mirrored: the `diff` prints nothing.
- No dated name without its time: prints nothing.
- Citations resolve inside the plugin: `OK plugins read nothing outside themselves, 946 citations
  resolved`, which covers the new citations of `shared/host-capabilities.md` and
  `references/report-format.md`.
- `wc -l`: `plugins/atk/skills/review/SKILL.md` is 299 lines, under 300.

## 7. Not verified

No `atk:review --comment` run was made against a pull request with the new wording, so neither the
collapsed list nor the reading of an earlier summary from the thread has been seen working. The run
that would settle it is one on a scratch pull request already carrying a summary posted by 0.1.5. No round
agent has been run with the new instruction to observe that it no longer starts a container. Each
needs a real review on a pull request, which is the reporter's next run on that project.

## 5b. After the first review of this change

`atk:review` on the pull request, report `docs/derived/reviews/109-261008-0936.md` (not committed),
kept eight `SHOULD FIX` findings and one `NIT`. Lam Ngoc Khuong chose which to land here.

- S3, confirmed: at `0f6f23f` the summary had no fixed opening (`report-format.md:250-252`), so the
  `atk:review` opening line alone would not find a summary posted before this change, which is the R2
  case. `report-format.md` now finds one of those by its content, counts per severity beside `B1`,
  `S1` or `N1` IDs, with that review's inline comments filling in.
- S7: the summary is posted as a review body, which `gh pr view --json comments` does not return.
  `shared/ticket-adapters.md` now names the read, `--json comments,reviews` plus the inline comments
  through `gh api`. Both lines were run on this pull request and returned.
- S6: where the report file and the thread gave one ID to different findings, the thread's stands
  and the file's finding takes the next free number with `(was S1)`.
- S2: `shared/artifact-paths.md` now says a second review also reads the posted summary, numbers
  from 1 only when there is neither, and keeps the identifiers when a `--comment` run posted them.
- S1: step 6, the done item, and `## Cap` in `report-format.md` now put the cap on the visible part of
  a posted summary, so the collapsed list is outside it. `SKILL.md` is still 299 lines.
- S4: the collapsed block also lists each open question with the person who must answer it, and the
  number of convention gaps; the overview sentence in both languages says "reaches every finding
  without the report" instead of "never needs the report".
- S5: `review-rounds.md` no longer pre-labels a finding `PLAUSIBLE`; step 5 gives the verdict, as
  `shared/host-capabilities.md` already said.

After these edits the same checks as in section 6 pass: no em-dash, no `ak:`, no `atkx` outside
`atk:help`, the mirror `diff` empty, no dated name without its time, and
`OK plugins read nothing outside themselves, 947 citations resolved`.

S8, a real `--comment` run, stays in section 7. N1, the allowance for type checks that write build
caches, is left for later below.

## 9. Left for later

- N1 of the review: "a command that reads the tree and exits" in `shared/host-capabilities.md` is
  narrower than type checks that write ignored build caches, such as `tsc --incremental`; naming the
  allowance by its effect is a follow-up.

- `atk:plan --review --comment` and `atk:qa --review` post to a tracker too and carry identifiers
  across runs; whether their summaries have the same dead pointer was not checked here.
