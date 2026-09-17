# Plan templates

Loaded by `atk:plan` in step 5. Two templates: the index, and one phase file. The reader is the
person who will implement the work, then the person who will review it, so every section has to
survive being read a week later by somebody who has forgotten the conversation.

## The directory

```
docs/planning/<ticket-or-date>-<slug>/
  plan.md
  phase-01-<slug>.md
  phase-02-<slug>.md
```

Always a directory, even for one phase. One layout means the reader, the reviewer and
`atk:implement` find the same thing in the same place, and a plan that grows a second phase halfway
through does not have to be moved. A one-phase plan is a normal result; do not invent a second phase
to fill the shape.

The split between the two files: the index holds everything true of the whole piece of work, a phase
file holds only what is true of that phase. Nothing appears in both.

## `plan.md`

### Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Plan: <what the work delivers>"
status: DRAFT
owner: <the person who will implement it, or "TBD (ask <person>)">
approver: <the reviewer, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket id or URL, or none>
---
```

`owner` is `TBD` with a name attached when the plan came from a description rather than an assigned
ticket, per `shared/team-roles.md`. It is never blank.

`status` stays `DRAFT` and implementation may start anyway. A plan is a statement of intent by the
person doing the work, not a decision the team has to ratify; the reasoning is in `SKILL.md`.

### 1. Goal and acceptance criteria

Copied from the ticket, marked as copied. Anything added during planning is marked as added and
carries the name of whoever must confirm it.

Work that arrives with no acceptance criteria gets that stated here in one line, with the name of
who must supply them. Do not invent them: the plan is checked against this section later, and an
invented criterion passes a check nobody asked for.

### 2. Current state

What exists today across the whole piece of work, as `path:line`: the modules involved, the entities
or tables, the endpoints or screens, the tests that already cover the area, and anything nearby that
does something similar and should be followed.

This section is the reason the plan is worth reading rather than the ticket. When the scan genuinely
finds nothing, say that it found nothing and where it searched.

Detail that belongs to exactly one phase goes in that phase file instead. This section is the map,
not every street on it.

### 3. Phases

| # | Phase | Delivers | Depends on | Status |
|---|-------|----------|------------|--------|
| 1 | [Phase 1: <title>](./phase-01-<slug>.md) | <the reviewable piece it ends with> | - | Pending |
| 2 | [Phase 2: <title>](./phase-02-<slug>.md) | <the reviewable piece it ends with> | 1 | Pending |

`Delivers` is the whole point of the row: what exists at the end of the phase that a colleague could
read, merge and live with. A phase that cannot fill this cell is not a phase, it is a step in the
one next to it.

`Depends on` lists phase numbers only, and only real dependencies: phase 2 needs what phase 1 built,
not merely that somebody would naturally do them in that order. A dependency on a later phase is a
sequencing error, not a note.

No owner column. Phases are a sequence in time, not a split between people. A column here means this
document has started doing `atk:breakdown`'s job, and two documents assigning the same work is how a
person ends up with two sets of instructions.

### 4. Out of scope

What this work deliberately does not do, including anything the scan turned up that a reader would
otherwise expect to be included. Each line says who decided, when that is not obvious from the
ticket.

The nearby bug found while scanning belongs here, not in a phase.

### 5. Open questions

What is not resolved, each with the name of the person who must answer, per rule 1 in
`shared/team-roles.md`. A question that blocks one phase names that phase, so the implementer knows
how far they can get before it matters.

Questions the repository can answer are not open questions. They are scanning that stopped early.

### 6. Verification for the whole work

How the finished work is checked against section 1, beyond the per-phase checks: the commands from
the Commands section of `.atk/profile.md`, and what a person should look at by hand.

Without a profile this section says which commands are inferred, per the Required-soft rule in
`shared/project-profile.md`.

## `phase-NN-<slug>.md`

### Front matter

```yaml
---
phase: <N>
title: "<phase title>"
status: Pending
depends_on: [<phase numbers, or empty>]
---
```

No `owner` or `approver` here: both live in the index, and a phase is not separately approved.

### 1. What this phase delivers

Two or three sentences. What exists at the end that did not exist at the start, and why that is
something a reviewer could merge on its own. This is the same claim as the `Delivers` cell in the
index, argued rather than summarised.

Where the phase deliberately leaves the feature invisible to users, say so. A phase that adds a
column, a client, or a flag that nothing reads yet is a good phase, and a reviewer who was not told
that will read it as unfinished work.

### 2. Steps

A numbered list, in the order they will be done. Per step:

| Field | Content |
|-------|---------|
| What | One sentence, in terms of behaviour rather than of edits |
| Files | The paths it touches, new ones marked new |
| Check | The command, test, or observation that proves this step worked |
| Leaves the tree | What works after this step. Never broken: see `step-ordering.md` |

Two changes that cannot compile apart are one step carrying the reason, never two steps of which the
first is broken. `references/step-ordering.md` holds the rule and the reason it is absolute.

No owner column, for the same reason the index has none.

### 3. Verification for this phase

What proves the phase is done, beyond the individual step checks: the command from the Commands
section of `.atk/profile.md` that covers this area, and what a person should see.

### 4. Open questions for this phase

Only what blocks this phase. Anything that blocks the work as a whole belongs in the index instead,
where it will be seen before phase 1 starts rather than after it finishes.

An empty section is normal and is written as empty, not omitted: a missing section reads as an
oversight, and the next reader will go looking for it.
