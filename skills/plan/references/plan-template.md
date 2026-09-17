# Plan template

Loaded by `atk:plan` in step 5. Six sections. The reader is the person who will implement the
ticket, and then the person who will review what they implemented, so every section has to survive
being read a week later by somebody who has forgotten the conversation.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Plan: <ticket title>"
status: DRAFT
owner: <the person who will implement it, or "TBD (ask <person>)">
approver: <the reviewer, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket id or URL>
---
```

`owner` is `TBD` with a name attached when the plan was written from a description rather than from
an assigned ticket, per `shared/team-roles.md`. It is never blank.

`status` stays `DRAFT` and implementation may start anyway. A plan is a statement of intent by the
person doing the work, not a decision the team has to ratify; see the reasoning in `SKILL.md`. The
approver line exists so a plan that does warrant a look has somebody to send it to.

## 1. Goal and acceptance criteria

Copied from the ticket, marked as copied. Anything added during planning is marked as added and
carries the name of whoever must confirm it.

A ticket that arrives with no acceptance criteria gets that stated here in one line, with the name
of who must supply them. Do not invent them: the plan is checked against this section later, and an
invented criterion passes a check nobody asked for.

## 2. Current state

What exists today, as `path:line`. The modules involved, the entity or table, the endpoint or
screen, the tests that already cover the area, and anything nearby that does something similar and
should be followed.

This section is the reason the plan is worth reading rather than the ticket. Empty means one of two
things, and they read very differently: nothing was searched, or the feature is new. Say which, and
for the second, say where the search ran.

## 3. Steps

A numbered list, in the order they will be done. Per step:

| Field | Content |
|-------|---------|
| What | One sentence, in terms of behaviour rather than of edits |
| Files | The paths it touches, new ones marked new |
| Check | The command, test, or observation that proves this step worked |
| Leaves the tree | What works after this step. Never broken: see `step-ordering.md` |

Two changes that cannot compile apart are one step carrying the reason, never two steps of which
the first is broken. `references/step-ordering.md` holds the rule and the reason it is absolute.

No owner column. One ticket, one implementer, already assigned. A column here means this document
has started doing `atk:breakdown`'s job, and two documents assigning the same work is how a person
ends up with two different instructions.

## 4. Out of scope

What this ticket deliberately does not do, including anything the scan turned up that a reader would
otherwise expect to be included. Each line says who decided, when the decision is not obvious from
the ticket itself.

The nearby bug found while scanning belongs here, not in the steps.

## 5. Open questions

What is not resolved, each with the name of the person who must answer, per rule 1 in
`shared/team-roles.md`. A question that blocks a specific step names that step, so the implementer
knows how far they can get before it matters.

Questions the repository can answer are not open questions. They are scanning that stopped early.

## 6. Verification for the whole ticket

How the finished ticket is checked against section 1, beyond the per-step checks: the commands from
the Commands section of `.atk/profile.md`, and what a person should look at by hand.

Without a profile this section says which commands are inferred, per the Required-soft rule in
`shared/project-profile.md`.
