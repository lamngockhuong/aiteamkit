---
name: plan
description: >
  Turn a piece of work into the phases and steps that implement it: what the code does today with
  file paths, phases that each end in something reviewable, steps inside each phase that leave the
  tree working, what each step touches and how it is checked, what is deliberately out of scope, and
  what is still unclear with the name of whoever must answer.
  Also reviews a plan somebody has already written, against the repository it assumes and the
  request behind it.
  Use before starting work, when picking up something somebody else designed, when work is large
  enough that it needs stages but does not need splitting across people, or when a written plan
  needs checking before anyone builds from it.
  Triggers on: "plan this ticket", "implementation plan", "plan this in phases", "lập kế hoạch",
  "kế hoạch thực thi", "vạch bước", "chia giai đoạn", "làm ticket này thế nào", "実装計画",
  "作業計画", "段階に分けて", "review this plan", "check this plan", "soát lại plan",
  "review kế hoạch", "計画をレビュー", "/atk:plan".
argument-hint: "[ticket|design-path|description|plan-path] [--inline] [--review] [--comment] [--layer <name>] [--out <path>]"
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
checked, listing what is out of scope and what is still open, reading the written plan back against
the repository it claims things about, and under `--review`, doing that reading for a plan somebody
else wrote.

Does NOT handle: choosing between approaches or weighing trade-offs, which is `atk:design-doc` and
ends in a decision somebody approves; splitting work across people, which is `atk:breakdown` and
produces owners and parallel lanes; writing the code, which is `atk:implement`; or reviewing that
code once it exists, which is `atk:review`. This skill plans
one person's stream of work, however many phases it takes. Phases are a sequence in time, not a
split between people: every phase in a plan belongs to whoever owns the plan.

| Skill | The question it answers | Read by | Approved by |
|-------|-------------------------|---------|-------------|
| `atk:design-doc` | How should this be built, and at what cost | TL, BrSE/BA | TL |
| `atk:breakdown` | Who does what, in what order, in which lane | PM, TL, the team | PM or TL |
| `atk:plan` | For this work: which phases, which files, which steps, checked how | Implementer, reviewer | TL, lightly |

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

/atk:plan <plan-path> --review # Review a written plan: a directory, one phase file, or a PR
/atk:plan <pr> --review --comment   # Post the findings on the pull request carrying the plan
```

`--review` replaces the workflow below rather than extending it: nothing is planned and no plan file
is edited. `references/plan-review-mode.md` holds it. It needs something to read: with no path,
branch, or pull request, list what is in the plan directory resolved per `shared/artifact-paths.md`,
which is `plans/` unless the project says otherwise, and ask which one rather than guessing at the
most recent. Where that directory is absent or empty, say so and stop; there is no question to ask.

`--out` takes a directory on a planning run and a file under `--review`, because that is what each
one writes.

`--comment` means something only under `--review`. On a planning run it changes nothing, and it is
never consent: the index is still shown before it is offered, per `## Ticket`. `--inline` and
`--layer` are ignored under `--review`, said rather than silently, because a layer filter would skip
citations outside that layer and then report them as gone.

`.atk/profile.md` is useful but not required. Without it the steps can still be sequenced, but the
per-step checks are guesses about commands this project may not have. Follow the Required-soft rule
in `shared/project-profile.md`: continue, and open the artifact with the sentence it gives.

## Workflow

```
[1. Read the request] -> [2. Scan what exists] -> [3. Phases, then steps] -> [4. Check per step]
  -> [5. Write it] -> [6. Read it back] -> [7. Hand off]
```

Before step 1, read `.atk/overrides/plan.md` when it exists, per rule 7 of `shared/team-roles.md`.

Under `--review` the seven steps do not run and `references/plan-review-mode.md` takes their place.
The override is read either way: a team that wrote down what it wants from a plan is describing the
same document whether this skill is writing one or reading one. Under `--review` its `## Before`
applies to the pass and its `## After` to the report, since there are no numbered steps to anchor to.

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
reads differently from a scan that never ran.

### 3. Sequence into phases, then into steps

`references/step-ordering.md` holds both rules, because the work is cut twice.

First into phases. A phase ends where the work could stop for two weeks and nothing would be wrong:
not merely something mergeable, which every step is, but something that costs nobody anything if the
next phase never arrives. Work with one such point is one phase, and a one-phase plan is a normal
result rather than a small one.

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

### 5. Write it

Write the plan directory from `references/plan-template.md`: `plan.md` as the index, one
`phase-NN-<slug>.md` per phase, at `status: DRAFT` with a named approver.

When the design gate fires and there is nothing to sequence, no directory is written. Hand back the
fork, the name of whoever owns it, and a stop: there is no path for the caller to take, and an empty
plan directory would look like one.

### 6. Read it back

`references/plan-self-review.md` holds this pass. It runs on every plan this skill writes, `--inline`
included, and again after any rewrite of the files. It runs at most twice per plan, and a rewrite the
person asked for is a new plan that starts the count again, per the cap in that file.

A plan states six things it cannot check from inside itself: that the code it cites is there, that
the code it assumes exists does exist, that a name one phase defines is the name a later phase uses,
that the index and the phase files still agree, that every acceptance criterion reaches a step, and
that every command in a check is one this project has. Reopen each against the repository. Fix what
the repository settles, and turn what it cannot settle, and the plan depends on, into an open
question naming the person who must answer.

A claim with nothing to run against, because the request carried no acceptance criteria or the
project has no profile, is said in the artifact: left unsaid it reads as a claim that passed.

The errors this skill actually makes come from writing four phase files at a stretch and reading none
of them back: invisible in the sentence carrying them, obvious in the file it points at. Revising
after a no at step 7 comes back through here before it goes out again.

### 7. Hand off

The directory already exists; step 5 wrote it and step 6 corrected it. What differs here is the
ending, and only the caller knows which applies:

| Called as | Ending |
|-----------|--------|
| `/atk:plan` by a person | Print the directory path and the phase list, stop |
| `--inline`, from a skill | Summarise the phases, ask one confirmation, hand back |

Never assume the inline ending. Without the flag, a person asked for a plan and the plan is the
deliverable.

What `--inline` hands back is the directory path, the ordered phase list with each phase's file, and
every open question step 6 raised, each with the person who must answer it and the phase it blocks.
A question the whole plan rests on blocks every phase, and is handed back saying so: it stops the
work rather than holding one part of it.
The caller can work through the phases without re-reading the index, and must not start a blocked
phase before its question is answered. `atk:implement` goes straight from the confirmation into the
work, so a caller told only about the phases would start writing code against a blocked one.

A no at the confirmation is an instruction to revise, not to abandon: rework the plan, run step 6
over what changed, and ask again. This loop has no count, and does not need one: a person drives each
no, so somebody is deciding each time round, which is what the cap inside step 6 has to substitute
for. Only the caller ends the run, and only when the person says to stop rather than to change
something.

Under `--inline` the Ticket section below does not run. The caller reaches
`shared/finalize-steps.md` with its own consent prompts later, and asking twice for a comment on the
same ticket, the first time before any code exists, is how a consent prompt stops being read.

After the handback, the plan is the caller's to keep current. Whoever works through the phases sets
each phase file's `status` as it goes; this skill writes them all as `pending` and does not come
back. A phase left at `pending` after its work is done is a plan nobody will trust twice.

## Output

Written to `plans/<YYMMDD-HHMM>-<slug>/` at the repository root per `shared/artifact-paths.md`:
`plan.md` plus one file per phase. Both templates are in `references/plan-template.md`.

Phases that are not a straight line get a Mermaid diagram in the index, per
`shared/diagram-conventions.md`. A line of phases does not: the numbered list already says it.

This is one of the three skills that write outside the docs root; that file says why, and what a
project does when it keeps plans somewhere else.

The directory is the shape even for a single phase, so a plan that grows a second phase halfway
through does not have to be moved.

Planning the same work again makes a new directory, because the name carries the time. Do not leave
the old one looking current: set its index `status` to `SUPERSEDED` and link the replacement, per
the rule at the end of `shared/artifact-paths.md`. Two live plans for one piece of work is worse
than none, because each reader picks a different one.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Under `--inline` this skill does not run that sequence
itself: the directory exists and is committed by the caller, which reaches `shared/finalize-steps.md`
with the code the plan produced.

Under `--review` no plan file is written at all. The findings go to
`docs/derived/reviews/plan-<slug>-<date>.md`, which is derived: safe to delete, and rebuilt by
running the review again. `--out <path>` moves that file as it moves a plan directory.

## Ticket

Under `--review` this section does not run; the `## Ticket` section of
`references/plan-review-mode.md` applies instead, and what it posts goes to the pull request carrying
the plan rather than to a ticket.

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
- [ ] The written files were read back per step 6, and a fix that changed the sequence earned the one
      further pass the cap allows. Where the cap was reached, the plan says which fixes went out
      unverified.
- [ ] Every cited `path:line` was opened, and a subject that moved was searched for before it was
      called gone.
- [ ] Every library, table, column, and variable the plan expects to find already there was
      confirmed from the repository rather than from memory.
- [ ] Every name one phase defines and another consumes was compared across both.
- [ ] The index and the phase files agree on title, dependencies, status, and `Delivers`.
- [ ] Every command in a check appears in the profile, or the artifact says the commands are inferred.
- [ ] Every acceptance criterion reaches a step, or sits in the out-of-scope section with a reason.
- [ ] A claim that had nothing to run against says so in the artifact and names who would change that.
- [ ] Nothing the repository could not settle was dropped silently: it is an open question with a
      name, or the plan no longer depends on it.
- [ ] Under `--inline`, the open questions went back with the phase list, each naming the phase it
      blocks.

Under `--review` these do not apply. `references/plan-review-mode.md` carries its own list, because
the pass fixes nothing and ends in findings rather than in a plan.
