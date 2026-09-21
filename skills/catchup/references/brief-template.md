# Brief template

Loaded by `atk:catchup` in step 4. Two modes share one skeleton; the differences are marked per
section. Front matter is the shared block from `shared/artifact-paths.md`.

A section with nothing real in it is written as `Nothing found` plus where it was looked for. It is
never filled with a restatement of the section above it.

## Front matter

```yaml
---
title: "Catch up: <epic or PR title>"
status: DRAFT
owner: <the person who will do the work, or TBD (ask <person>)>
approver: none
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <epic or PR URL>
---
```

`approver: none` is correct here. A brief is a reading aid, not an artifact anyone signs off. The
requirement and the design are what carry approval.

`owner:` is not optional in the same way. When the epic has no assignee yet, write `TBD` with the
name of whoever will assign it, per `shared/team-roles.md`. A brief with nobody's name on it is a
page that was read by no one in particular.

## 1. What this is, and for whom

Two or three sentences. The user, the thing they can do afterwards, and the surface it appears on.
Write it so a person who has never opened the tracker understands it without following a link.

Where any linked pull request has already merged, close this section with one line saying what is
already delivered and what is still open, naming the pull requests and when they merged. A reader
taking over the open half has to know which half that is before anything else in the brief means
what it appears to.

**Pull request mode:** what the change does, stated as the behaviour difference a user or a caller
would notice, not as a list of files.

## 2. Why now

The reason this is being built in this sprint: the client commitment, the incident it follows, the
dependency it unblocks, the deadline behind it. Quote the source and link it.

When nothing on record says why, write that, and put the question in section 9. A guessed motive is
how a team ends up building the wrong thing confidently.

## 3. Scope and out of scope

Two lists. What the work covers, and what has been explicitly excluded, with who excluded it.

An empty out-of-scope list is a warning sign, not an achievement. If nothing was excluded, say that
the epic excludes nothing and move it to the questions.

**Pull request mode:** replace both lists with what the diff changes, by area, and what it
deliberately leaves alone.

## 4. What it touches

One row per unit of the work: a screen, an endpoint, a job, an entity. This is where step 3 of the
skill puts what it traced; nothing it found is left to be scattered through the prose sections.

A unit the work has still to build gets a row like any other. Its third column says where it will
sit, the module or the file it will join, marked as not built yet. `Nothing found` belongs to work
that touches nothing at all, which on an epic means the trace failed rather than that there is
nothing there.

| Unit | Kind | Where it is in the code | Who reaches it |
|------|------|-------------------------|----------------|
| <name the reader will recognise> | screen / endpoint / job / entity | <the path, and the route or the endpoint> | <the roles, or "everyone who reaches the feature"> |

**Pull request mode:** the rows are what the diff changes, plus the callers step 3 found.

The last column is one cell while the work treats every role the same. Where it branches by role in
more than one way, such as which fields are visible, which options a list offers, and how a value is
generated, that cell stops being able to hold it: give the roles a table of their own underneath,
one row per role and one column per thing that differs. A brief that hides three-way branching in a
comma-separated cell is a brief the reader has to rebuild.

**Epic mode:** the groups of the understanding check in section 8 are drawn from these rows, per
the grouping rule in `references/understanding-check.md`. No group is anything but a row here, and
which rows fold into which is that rule's business rather than this table's.

## 5. Who is involved and who decides

| Question that will come up | Who answers it |
|----------------------------|----------------|
| <a decision this work will need> | <a person, by name> |

Names, per rule 1 in `shared/team-roles.md`. "The backend team" is not an entry. When the role is
unknown, write `TBD (ask <person>)` rather than leaving the cell empty.

## 6. Unfamiliar terms

Every domain word the epic uses as if it were obvious. One line each: the word, what it means here,
and where that meaning is defined. Include the words that mean something different in this project
than in general use, because those are the ones that cause silent mistakes rather than questions.

## 7. Risks and easy mistakes

What a competent person unfamiliar with this area would get wrong. Each entry names the trap and the
file or the rule that governs it. Sources worth reading before writing this: the conventions
document, past incidents in the same area, and the review comments on similar past pull requests.

Two to five entries. A list of fifteen risks is a list nobody reads, and the three that mattered are
buried in it.

## 8. Understanding check

**Epic mode only.** Generated per `references/understanding-check.md`: the groups drawn from the
rows of section 4 and folded per the rule there, answers folded, question 10 last and unanswered.

**Pull request mode:** the section does not appear. Do not replace it with a shortened version.

## 9. Questions for the spec author

Built per the last section of `references/understanding-check.md`. It closes the artifact in both
modes, because it is the part that leaves it.
