---
name: plan
description: >
  Turn a piece of work into the phases and steps that implement it: what the code does today with
  file paths, phases that each end in something reviewable, steps inside each phase that leave the
  tree working, what each step touches and how it is checked, what is deliberately out of scope, and
  what is still unclear with the name of whoever must answer.
  Use before starting work, when picking up something somebody else designed, or when work is large
  enough that it needs stages but does not need splitting across people.
  Triggers on: "plan this ticket", "implementation plan", "plan this in phases", "lập kế hoạch",
  "kế hoạch thực thi", "vạch bước", "chia giai đoạn", "làm ticket này thế nào", "実装計画",
  "作業計画", "段階に分けて", "/atk:plan".
argument-hint: "[ticket|design-path|description] [--inline] [--layer <name>] [--out <path>]"
---

# Implementation Plan (`atk:plan`)

Answers one question: for this work, which files, in which order, checked how. It is the layer
between the design and the code, written by the person who will do the work, for that person and
their reviewer.

Work that needs several days and several reviewable pieces gets several phases, in one plan
directory. Nobody has to chop a piece of work into small tickets before they are allowed to plan it:
finding where the seams are is what this skill is for.

The plan is a draft and acting on it needs nobody's approval. Writing down the steps you intend to
take is drafting, not deciding, so rule 3 in `shared/team-roles.md` does not bite here. What needs
approval is an architectural choice, and choosing between architectures is `atk:design-doc`. When
this skill finds it is comparing approaches rather than sequencing one, it has crossed into that
skill's work and says so.

## Scope

Handles: reading the ticket or description and any design it points at, scanning the repository for
what exists today, cutting the work into phases that each end in something mergeable, sequencing
each phase into steps that leave the tree working, naming what each step touches and how it is
checked, and listing what is out of scope and what is still open.

Does NOT handle: choosing between approaches or weighing trade-offs, which is `atk:design-doc` and
ends in a decision somebody approves; splitting work across people, which is `atk:breakdown` and
produces owners and parallel lanes; or writing the code, which is `atk:implement`. This skill plans
one person's stream of work, however many phases it takes. Phases are a sequence in time, not a
split between people: every phase in a plan belongs to whoever owns the plan.

| Skill | The question it answers | Read by | Approved by |
|-------|-------------------------|---------|-------------|
| `atk:design-doc` | How should this be built, and at what cost | TL, BrSE/BA | TL |
| `atk:breakdown` | Who does what, in what order, in which lane | PM, TL, the team | PM or TL |
| `atk:plan` | For this work: which phases, which files, which steps, checked how | Implementer, reviewer | TL |

An epic passes through all three in that order. A self-contained piece of work needs only the third,
whether it takes an afternoon or three weeks. Work that turns out to touch a schema or a public
contract goes back to the first.

## Roles

The Dev who will implement the work writes it and owns it. The Tech Lead reviews it when the plan
turns out to touch a schema, a public contract, or more than one service, which is the same boundary
that sends a ticket back to `atk:design-doc`. Below that boundary the approver line names who would
look if asked; it does not gate the work. Nobody else appears: a plan with an owner column, on a
step or on a phase, has started doing `atk:breakdown`'s work. See `shared/team-roles.md`.

## Invocation

```bash
/atk:plan <ticket>             # Plan from a ticket in the detected tracker
/atk:plan <design-path>        # Plan from an approved design document
/atk:plan "<description>"      # Plan from a description in the prompt
/atk:plan --layer api          # Restrict the scan to one layer when the ticket is confined to it
/atk:plan --inline             # Called by another skill: summarise and hand back, do not stop
/atk:plan --out <path>         # Override the default output path
```

`.atk/profile.md` is useful but not required. Without it the steps can still be sequenced, but the
per-step checks are guesses about commands this project may not have. Follow the Required-soft rule
in `shared/project-profile.md`: continue, and open the artifact with the sentence it gives, so a
reader knows which parts were inferred.

## Workflow

```
[1. Read the request] -> [2. Scan what exists] -> [3. Phases, then steps] -> [4. Check per step]
  -> [5. Hand off]
```

### 1. Read the request

Take the goal and the acceptance criteria from the ticket and the design it links to. Copy them; do
not improve them. A criterion invented here is one nobody agreed to, and it will be implemented and
reviewed as though somebody had.

Where the request has no acceptance criteria at all, say so and name who must supply them. That gap
belongs to `atk:intake`, and planning around it produces a plan that cannot be checked.

### 2. Scan what exists

Find the code this work will touch and cite it as `path:line`: the modules, the entities, the
endpoints, the screens, the tests that already cover the area. Use the Layers section of
`.atk/profile.md` to know where to look when it is available.

This section is what makes the plan worth reading twice. When the scan genuinely finds nothing, say
that it found nothing and where it searched: on a greenfield feature that is the real answer, and it
reads very differently from a scan that never ran.

### 3. Sequence into phases, then into steps

`references/step-ordering.md` holds both rules, because the work is cut twice.

First into phases. A phase ends where something reviewable exists: a piece a colleague could read,
merge, and live with, even if the feature is not finished. Work with one such piece is one phase,
and a one-phase plan is a normal result rather than a small one.

Then into steps inside each phase. Order them so the tree works after each one, keep each small
enough to have its own check and large enough to be worth naming, and when two changes genuinely
cannot be separated, keep them in one step and say what forces it.

If two approaches are worth comparing at any point here, stop sequencing. Write what the choice is
and what hangs on it, and point at `atk:design-doc`. A comparison of options inside a plan is a
design decision made by whoever happened to be planning.

### 4. Check per step

Every step carries the check that proves it: a command from the Commands section of
`.atk/profile.md`, a test to write or run, or an observation a person can make. A step whose only
check is "the final tests pass" is not a step, it is part of the last one. Merge it and go back to
sequencing: the check is what draws the boundary, so a step without one is a boundary in the wrong
place rather than a step missing a field.

Without a profile, write the check as an intention rather than a command, and mark the artifact as
holding inferred commands, per the Required-soft rule cited under Invocation.

### 5. Hand off

Write the plan directory from `references/plan-template.md`: `plan.md` as the index, one
`phase-NN-<slug>.md` per phase, at `status: DRAFT` with a named approver.

Then the two endings differ, and only the caller knows which applies:

| Called as | Ending |
|-----------|--------|
| `/atk:plan` by a person | Write the directory, print its path and phase list, stop |
| `--inline`, from a skill | Write it, summarise the phases, ask one confirmation, hand back |

Never assume the inline ending. Without the flag, a person asked for a plan and the plan is the
deliverable.

What `--inline` hands back is the directory path and the ordered phase list with each phase's file,
so the caller can work through them without re-reading the index. A no at the confirmation is an
instruction to revise, not to abandon: rework the plan and ask again. Only the caller ends the run,
and only when the person says to stop rather than to change something.

Under `--inline` the Ticket section below does not run. The caller reaches
`shared/finalize-steps.md` with its own consent prompts later, and asking twice for a comment on the
same ticket, the first time before any code exists, is how a consent prompt stops being read.

## Output

Written to `docs/planning/<ticket-or-date>-<slug>/` per `shared/artifact-paths.md`: `plan.md` plus
one file per phase. Both templates are in `references/plan-template.md`.

The directory is the shape even for a single phase. One layout means the reader, the reviewer, and
`atk:implement` find the same thing in the same place every time, and a plan that grows a second
phase halfway through does not have to be moved.

## Ticket

Follow `shared/ticket-adapters.md`. The index is offered as a comment on the ticket, shown first and
posted on a yes. Do not create sub-tasks from the phases or the steps: they are one person's
sequence, and turning work into tickets for other people is `atk:breakdown`'s call.

## Definition of done

- [ ] The goal and acceptance criteria came from the request, and anything added is marked added.
- [ ] The current-state section cites at least one real `path:line`, or says what the scan searched
      and why it found nothing.
- [ ] Every step names the files it touches and carries a check of its own.
- [ ] Every step declares what it leaves working, and no step declares it leaves the tree broken.
- [ ] Every phase names the reviewable piece it ends with, and a one-phase plan says so plainly
      rather than inventing a second phase.
- [ ] Phase dependencies are stated, and no phase depends on one that comes after it.
- [ ] No owner column on a step or on a phase: the whole plan belongs to one person.
- [ ] No comparison of approaches appears; any that arose was handed to `atk:design-doc`.
- [ ] `status: DRAFT` with a named approver.
- [ ] Every open question names the person who must answer it.
- [ ] Without a profile, the artifact says which commands are inferred.
