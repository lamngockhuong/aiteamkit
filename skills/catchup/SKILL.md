---
name: catchup
description: >
  Summarise an epic or a pull request for someone who was not in the conversation that produced it:
  what the work is and for whom, why now, what is in and out of scope, who decides, the unfamiliar
  terms, and where it is easy to go wrong. For an epic it also produces the understanding check the
  developer answers before writing any code.
  Use when a person joins work already in flight, picks up an epic they did not help write, or has
  to review a pull request in an area they do not know.
  Triggers on: "catchup", "summarize issue", "summarize PR", "tóm tắt issue", "tóm tắt PR",
  "giải thích epic", "hiểu epic này", "キャッチアップ", "ブリーフ", "/atk:catchup".
argument-hint: "[epic-url|pr-url] [--no-check] [--lang <code>] [--out <path>]"
---

# Catch Up on an Epic or a Pull Request (`atk:catchup`)

Turns an epic or a pull request into a page that gets a newcomer to the work in a few minutes, and,
for an epic, into a set of questions the person who will write the code answers themselves before
they start.

The brief is disposable. It is written to be read once and to have its open questions pasted back to
whoever can answer them. It is not a second place of record, so it links to the requirement and the
design rather than restating either.

## Scope

Handles: reading an epic or a pull request through the detected tracker, tracing the code the work
touches, writing a brief a person who missed every meeting can follow, generating the understanding
check in epic mode, and collecting what the spec does not answer into a block addressed to a named
person.

Does NOT handle: turning a raw request into requirements, which is `atk:intake` and starts from
unstructured input while this skill starts from an epic that already exists; splitting an epic into
owned tasks (`atk:breakdown`); judging whether a pull request is correct (`atk:review`); recording
what merged work now does as a document that has to stay true, which is `atk:spec` and outlives the
brief; or answering the understanding check on the developer's behalf.

## Roles

The reader is a Dev or a QA joining work in flight. The questions the brief collects go back to the
BrSE/BA or the PM who wrote the spec, by name. The understanding check belongs to the person who
will write the code, and nobody answers it for them. See `shared/team-roles.md`.

## Invocation

```bash
/atk:catchup <epic-url>        # Brief plus understanding check
/atk:catchup <pr-url>          # Brief only, scoped to the diff
/atk:catchup <ticket-id>       # Resolve the id through the detected tracker
/atk:catchup --no-check        # Epic mode without the understanding check
/atk:catchup --lang ja         # Write the brief in Japanese
/atk:catchup --out <path>      # Override the default output path
```

## Workflow

```
[1. Pick the mode] -> [2. Read the source] -> [3. Trace the code] -> [4. Write the brief]
  -> [5. Understanding check] -> [6. Questions for the spec author]
```

Before step 1, read `.atk/overrides/catchup.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Pick the mode

Classify by what the input resolves to, not by how it was typed. A URL whose path contains `/pull/`,
`/pulls/`, `/merge_requests/`, or `/pullRequests/` is a pull request and needs no lookup. Everything
else is resolved through `shared/ticket-adapters.md` first, and the object the tracker returns
decides the mode: a pull request or merge request is pull request mode, an issue or an epic is epic
mode.

A bare ticket id says nothing about which kind of object it points at, so guessing from the string
is how a pull request ends up carrying an understanding check for code that is already merged. State
the mode and what settled it, in one line, before writing anything.

An epic whose code is already merged is still epic mode. State that too, in the same line: which
linked pull requests merged and when, so the reader learns it from the brief rather than from the
tracker. It is not a third mode, because delivery is rarely all or nothing, and an epic with its
front end merged and its back end open would have to be sorted into one by a skill that knows less
about it than the person reading.

Pull request mode has no understanding check. Not shorter, not optional: absent. Questions about how
a feature should behave are asked before the code is written, and a pull request is past that point.
`--no-check` drops the section in epic mode too, for a reader who only needs the summary.

### 2. Read the source

Resolve the tracker through `shared/ticket-adapters.md`. Read the epic body, its comments, its
linked issues, and any design document it points at. In pull request mode read the description, the
diff, and the issue it closes.

Quote a decision verbatim with a link to where it was made. A paraphrased decision loses who made
it, and who made it is the part a newcomer needs.

### 3. Trace the code

Find what the work touches: the modules, the entities, the endpoints, the screens. Cite file paths
so the reader can open them. In pull request mode this is the diff plus every caller of what the
diff changed.

All of it lands in one place, section 4 of the brief, one row per unit. Spreading a traced path
across whichever prose section it seemed to fit leaves the reader assembling the map that step 4 was
supposed to hand them. Where the work behaves differently for different roles, that belongs in the
same section, which `references/brief-template.md` says how to shape.

### 4. Write the brief

Use `references/brief-template.md`. The sections differ by mode:

| Section | Epic | Pull request |
|---------|------|--------------|
| What this is, and for whom | yes | yes |
| Why now | yes | yes |
| Scope and out of scope | yes | reduced to what the diff changes |
| What it touches | yes | yes, the diff and its callers |
| Who is involved and who decides | yes | yes |
| Unfamiliar terms | yes | yes |
| Risks and easy mistakes | yes | yes |
| Understanding check | yes | no |

Anything the epic leaves open is written as open. A brief that reads as settled when the spec is not
is worse than no brief, because the reader stops asking.

### 5. Understanding check (epic mode)

Load `references/understanding-check.md`. One group per row of section 4, never one set for the
whole epic. Ten fixed questions per group, plus at most three drawn from the feature type, which sit
between question 9 and question 10 and are lettered rather than counted on.

Every reference answer is folded inside a `<details>` block, so answering first and comparing after
is the default path rather than a matter of willpower. Question 10 closes every group and never has
a reference answer. An answer written under it leaves the section looking complete while removing
the only thing in it that was worth anything.

Where the code is already merged, the section still belongs in the brief and the questions do not
change. Say who it is for now: whoever takes over the work that is still open, and whoever writes
the test scenarios. Dropping it is a call for the person reading, and `--no-check` is how they
make it.

### 6. Questions for the spec author

Collect what the spec does not answer into one block the reader pastes as a comment. Each line
carries three things: the question, the sources already searched, and the name of the person who
must answer it. A line missing any of the three does not go in.

The last column of the ten questions gives a role, and a role is not a name. Take
the name from the epic's assignee, its comments, or the requirement document; when none of them
says, write `TBD (ask <person>)` naming whoever can point at the right person. A role left standing
alone is rule 1 in `shared/team-roles.md` broken one step later than usual.

The block fills at two different moments: what this skill found missing while writing the brief, and
what the developer finds while answering the last question. Keep it to at most ten lines. A block
padded with questions the spec does answer is a block the spec author stops reading.

## Output

Written to `docs/derived/catchup/<ticket-or-date>-<slug>.md` per `shared/artifact-paths.md`. Under
the shared front matter block: the sections from the mode table in step 4, then the questions for
the spec author from step 6, which closes the artifact in both modes because it is the part that
leaves it.

Where the feature crosses roles or services, one diagram in the scope section earns its place, drawn
per `shared/diagram-conventions.md`. A feature that lives in one module does not get one.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Offer the questions for the spec author as a comment on the epic
or the pull request; show it first and post nothing without a yes. Never post the understanding
check to the tracker: the answers belong to the developer who wrote them, and publishing them turns
the exercise back into reading.

## Definition of done

- [ ] The mode was stated, with its evidence, before the brief was written, and so was the delivery
      state when the epic's code had already merged.
- [ ] Pull request mode produced no understanding check.
- [ ] Epic mode: every reference answer sits inside a folded `<details>` block.
- [ ] Epic mode: question 10 closes every group and has no reference answer.
- [ ] Epic mode: one group per row of section 4, not one set for the epic.
- [ ] Everything step 3 traced is in section 4, not spread across the prose sections.
- [ ] The questions for the spec author fit in at most ten lines.
- [ ] Every one of those lines carries its question, the sources already searched, and a person.
- [ ] The brief links to the requirement and the design instead of restating them.
- [ ] Nothing the epic leaves open is written as decided.
