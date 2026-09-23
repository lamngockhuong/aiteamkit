---
name: intake
description: >
  Turn a raw stakeholder or client request into reviewable requirements: context, user stories,
  acceptance criteria, out-of-scope list, open questions, and the person who must answer each one.
  Use when a request arrives as a chat message, a meeting note, a mail, or a one-line ticket and
  the team cannot start work from it yet.
  Triggers on: "intake", "requirement", "làm rõ yêu cầu", "phân tích yêu cầu", "user story",
  "acceptance criteria", "要件定義", "要求整理", "clarify this request", "turn this into stories",
  "/atk:intake".
argument-hint: "[request-file|ticket-id|text] [--interview|--no-interview] [--lang <code>] [--out <path>]"
---

# Requirement Intake (`atk:intake`)

Converts an unstructured request into a requirement artifact that a Dev can estimate, a QA can
test, and a stakeholder can approve. The output records what was asked, what was assumed, and what
is still unanswered, with a name against every open question.

## Scope

Handles: reading the raw request, scanning the codebase for what already exists, splitting the
request into user stories, writing testable acceptance criteria, listing non-goals, and collecting
open questions with an owner each.

Does NOT handle: estimating effort (`atk:estimate`), technical design (`atk:design-doc`), task
assignment (`atk:breakdown`), or deciding priority and scope. Those belong to the PM and the
stakeholder; this skill records their decision, it does not make it.

## Roles

PM and BrSE/BA lead. Tech Lead reviews feasibility. QA reviews whether each acceptance criterion is
testable. See `shared/team-roles.md`.

## Invocation

```bash
/atk:intake <request-file>        # Read a meeting note, mail export, or spec fragment
/atk:intake "<pasted request>"    # Read the request straight from the prompt
/atk:intake <ticket-id>           # Pull the request from the detected tracker
/atk:intake --no-interview        # Draft from the request alone, mark every gap OPEN
/atk:intake --lang ja             # Write the artifact in Japanese
/atk:intake --out <path>          # Override the default output path
```

## Workflow

```
[1. Read request] -> [2. Scan repo] -> [3. Interview gaps] -> [4. Draft stories] -> [5. Review gate]
```

Before step 1, read `.atk/overrides/intake.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Read the request

Quote the request verbatim into the artifact before interpreting it. Interpretation drifts; the
quote does not.

### 2. Scan the repository

Find what already exists: matching features, similar endpoints, existing entities, prior
requirement docs. A request is often a change to something, not a new thing. Cite file paths.

### 3. Interview the gaps

Ask only what neither the request nor the repository answers, one question at a time, with two to
four concrete options and a recommendation. Stop at the first material answer per topic. Skip this
step under `--no-interview` and mark each gap `OPEN` with a suggested owner.

### 4. Draft stories and criteria

One story per user-visible outcome. Acceptance criteria are `Given / When / Then` and each one must
be checkable by a person who did not write it. Vague criteria such as "works correctly" or "is fast"
are rejected: replace them with a number, a state, or a visible result, or move them to open
questions.

Write the artifact in the shape `references/requirement-template.md` fixes: the story sentence, the
`AC N.M` IDs that later skills cite, and the columns of the open-questions table.

### 5. Review gate

Set `status: IN REVIEW` and name the approver. Do not mark anything `APPROVED` on the team's behalf.

## Output

Written to `docs/records/requirements/<ticket-or-date>-<slug>.md` per `shared/artifact-paths.md`. Sections:
front matter, original request, context and current behavior, user stories with acceptance criteria,
out of scope, assumptions, open questions with owners, and impacted areas with file paths. The
headings, their order, and the shape of each section are in `references/requirement-template.md`.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Offer to open one epic plus one issue per story. Show the list
first; create nothing without a yes.

## Definition of done

- [ ] Every story has at least one testable acceptance criterion.
- [ ] Every assumption is labelled as an assumption, not stated as a fact.
- [ ] Every open question names the person who must answer it.
- [ ] The out-of-scope list is non-empty, or its emptiness is explained.
- [ ] Nothing is marked `APPROVED` without the approver actually saying so.
