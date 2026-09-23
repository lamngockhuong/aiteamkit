# Requirement template

Loaded by `atk:intake` in step 4. The reader is the approver first, then whoever estimates, plans,
or tests from the artifact weeks later without having been in the conversation. Every run writes the
same shape, so that a reader who has seen one requirement can find anything in the next, and so that
a plan, an estimate, or a test case can cite a criterion by an ID that is still there next month.

## The file

One file, at `docs/records/requirements/<ticket-or-date>-<slug>.md` per `shared/artifact-paths.md`:
front matter, a title, at most one opening note, then seven numbered sections in the order below.
A section with nothing in it is kept and says why it is empty: a missing heading reads as a section
the run forgot.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Requirement: <the outcome asked for, in one line>"
status: IN REVIEW
owner: <the PM or BrSE/BA who ran the intake>
approver: <the person who accepts the requirement, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket id or URL, or none>
---
```

`status` is `IN REVIEW` once step 5 has run, and never `APPROVED` from this skill: only the approver
moves it there.

## Title and opening note

`# Requirement: <same line as the front matter title>`.

The opening note is one short paragraph, and only when a reader would otherwise misread the
artifact: the working language it was written in when that differs from the request, or why the
owner and the approver are the same person. Anything longer belongs in a section.

## `## 1. Original request`

The request verbatim, as a quote block, with where it came from: the ticket, the mail, the meeting,
the chat. Several messages are quoted in order, each as its own block.

When the request is in a language other than the artifact's, add a rendering in the artifact's
language beneath the quote, labelled as a rendering. The quote stays: interpretation drifts, the
quote does not.

## `## 2. Context and current behavior`

A list of what exists today that the request changes or builds on, one fact per item, each with
the file path, and `path:line` where a line is the point. A short label may split the list in two,
what works today and what is missing, when the request is about a gap, and one short paragraph may
open the section when the request was a question rather than a change and the reader needs to know
what the answer was. A request is usually a change to something; this section is
where that something is shown.

When the scan found nothing, say where it looked. That is the real answer on greenfield work, and it
reads differently from a scan that never ran.

## `## 3. User stories and acceptance criteria`

One subsection per user-visible outcome:

```markdown
### Story N: <the outcome, in a few words>

As a <role>, I want <outcome>, so that <reason>.

- **AC N.1** Given <state>, when <action>, then <visible result>.
- **AC N.2** Given ..., when ..., then ....
```

Stories are numbered from 1 in the order they appear. Criteria are numbered within their story, so
`AC 2.3` is the third criterion of story 2. Until approval the IDs may move. After it, an approved
requirement is not edited but superseded, per `shared/artifact-paths.md`, and the replacement keeps
the ID of every criterion it carries over and never gives a dropped criterion's ID to a new one,
because a plan or a test case may already cite it.

Every criterion is `Given / When / Then` and checkable by someone who did not write it. One the run
cannot make checkable goes to section 6 as a question instead.

## `## 4. Out of scope`

A list. Each item says what is not being done and, when it is not obvious, who decided or why. An
empty list is replaced by one sentence saying why nothing is excluded.

## `## 5. Assumptions`

A list. Each item starts with `**Assumption:**`, so that no assumption can be read as a fact once
the artifact is quoted elsewhere. An assumption the work depends on also appears in section 6,
asking the person who can confirm it.

## `## 6. Open questions`

A table:

```markdown
| # | Question | Blocks | Must answer |
|---|----------|--------|-------------|
| 1 | <the question, with its options> | <story or AC IDs, or none> | <person (role)> |
```

`Must answer` is a named person with the role in brackets, never "the team", per
`shared/team-roles.md`. `Blocks` names the stories or criteria that cannot be estimated or planned
until the answer comes, so a reader knows how far work can go without it.

Under `--no-interview`, each question the interview would have asked starts with `OPEN:`, and `Must
answer` holds the suggested owner, which is still a named person.

## `## 7. Impacted areas`

A table:

```markdown
| Area | Files |
|------|-------|
| <module, layer, or document group> | <paths, new ones marked new> |
```

These are the places the scan expects the work to reach, not a design. How they change is
`atk:design-doc` or `atk:plan`.

## Under `--lang`

The headings, the story sentence, and the prose follow the language asked for. What other skills
match on does not: the section numbers, the `AC N.M` and `Story N` IDs, the `**Assumption:**` and
`OPEN:` markers, the table column names and their order, the front matter keys, and the `status`
value. A requirement written in Japanese is cited by the same IDs, and its tables read by the same
column names, as one written in English.
