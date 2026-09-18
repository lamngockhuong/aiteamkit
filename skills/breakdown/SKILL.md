---
name: breakdown
description: >
  Break an epic or a design document into owned, sequenced tasks: one deliverable each, an owner,
  a dependency order, the parallel lanes that avoid two people editing the same file, and a
  definition of done per task.
  Use before a sprint starts, when work has to be shared across several developers, or when a piece
  of work needs owners and parallel lanes. Work that stays with one person is planned with
  `atk:plan` instead, however many days it takes.
  Triggers on: "break down", "breakdown", "chia task", "phân chia công việc", "split this epic",
  "task list", "WBS", "タスク分解", "who does what", "assign tasks", "/atk:breakdown".
argument-hint: "[design-path|requirement-path|epic] [--members <names>] [--parallel] [--tdd] [--out <path>]"
---

# Task Breakdown (`atk:breakdown`)

Turns one large piece of work into tasks a team can run at the same time without colliding. The
value is in the dependency order and the file ownership, not in the list itself.

## Scope

Handles: decomposing an epic or design into tasks, assigning an owner to each, ordering by
dependency, grouping into parallel lanes with explicit file ownership, and writing a per-task
definition of done.

Does NOT handle: sizing (`atk:estimate`), designing the solution (`atk:design-doc`), or
implementation. It divides work between people; how one person's share is then carried out, in
phases and steps, is `atk:plan`, which the assignee writes for themselves afterwards. Work that
belongs to one person needs no breakdown first, however many days it takes. It also does not decide
who works on what: it proposes, the PM and Tech Lead assign.

## Roles

Tech Lead proposes the split. PM confirms owners and order. Each Dev owns their tasks. QA gets its
own test tasks in the same list, not a single "testing" task at the end. See `shared/team-roles.md`.

## Invocation

```bash
/atk:breakdown <design-path>            # Break down from a technical design document
/atk:breakdown <requirement-path>       # Break down from a requirement artifact
/atk:breakdown <epic-id>                # Pull the epic from the detected tracker
/atk:breakdown --members "An,Binh,Chi"  # Propose owners from a named team
/atk:breakdown --parallel               # Optimize for concurrent lanes and flag file conflicts
/atk:breakdown --tdd                    # Emit a test task before each implementation task
/atk:breakdown --out <path>             # Override the default output path
```

## Workflow

```
[1. Load scope] -> [2. Slice] -> [3. Order] -> [4. Lanes and owners] -> [5. DoD per task]
```

### 1. Load the scope

Read the design or requirement and list every deliverable it implies, including the ones nobody
writes down: migration, seed data, config, feature flag, docs update, and test data.

### 2. Slice

One task equals one reviewable change, ideally under a day. Slice vertically by user-visible outcome
where possible; slice by layer only when the layers are genuinely independent. A task whose title
needs the word "and" is two tasks.

### 3. Order

Build the dependency graph and mark the critical path. Name what blocks what, and identify the tasks
that unblock the most others so they get started first.

### 4. Lanes and owners

Group tasks into lanes that can run in parallel. Each lane declares the files and modules it owns.
Two lanes must not own the same file, the same migration sequence, or the same shared config; when
they must, serialize them and say so. Propose an owner per lane based on the codebase history and
the named members, and mark it `PROPOSED` until the PM confirms.

### 5. Definition of done per task

Each task states what must be true to close it: the behavior, the test, the review, and anything to
update elsewhere. "Code merged" alone is not a definition of done.

## Output

Written to `docs/records/planning/breakdown-<epic>.md` per `shared/artifact-paths.md`. Sections: front
matter, deliverable inventory, task table with ID, title, owner, depends-on, and DoD, a Mermaid
dependency graph, parallel lanes with file ownership, and the serialization points.

The graph follows `shared/diagram-conventions.md` and reuses the task IDs from the table, so the two
can be checked against each other. It never carries an owner or a date the table does not.

## Ticket

Follow `shared/ticket-adapters.md`. Map epic to epic and task to issue or sub-task. Show the full
list for approval before creating anything.

## Definition of done

- [ ] No task title contains "and" joining two deliverables.
- [ ] Every task has an owner or an explicit `TBD` with a reason.
- [ ] The dependency graph has no cycle, and the critical path is marked.
- [ ] No two parallel lanes own the same file, migration sequence, or shared config.
- [ ] The non-code deliverables (migration, config, docs, test data) appear as tasks.
