---
name: design-doc
description: >
  Write the technical design document a team reviews before coding, plus the ADR that records the
  decision behind it: current state, options with trade-offs, chosen approach, data and API changes,
  migration and rollback, risks, and the reviewers who must sign off.
  Use before implementing anything that touches a schema, a public contract, a shared module, or
  more than one service.
  Triggers on: "design doc", "technical design", "tech design", "thiết kế kỹ thuật", "tài liệu thiết kế",
  "ADR", "architecture decision", "設計書", "detail design", "how should we build this", "/atk:design-doc".
argument-hint: "[requirement-path|topic] [--adr|--no-adr] [--options <n>] [--lang <code>] [--out <path>]"
---

# Technical Design Document (`atk:design-doc`)

Produces the document a Tech Lead and peers can review without a meeting, and the ADR that survives
the people who wrote it. The point is the comparison: a design with only one option is a plan, not a
design, and gets reviewed as such.

## Scope

Handles: describing the current implementation with citations, framing the problem, comparing viable
options against stated criteria, specifying the chosen data model, API contracts, and the migration
and rollout sequence the change requires, and writing the ADR entry.

Does NOT handle: writing the requirement (`atk:intake`), sizing (`atk:estimate`), or the
implementation itself. It chooses the approach and stops there: sequencing the chosen approach into
phases and steps is `atk:plan`, which never reopens the choice. It also does not approve its own
design: review is a separate role.

It does not keep anything current either. This document argues for a change and cites the code as it
stood before it, so the day the change merges the citation stops being true and what is left is an
account of a decision. What the system does from then on is `atk:spec`, per `shared/spec-docs.md`.

## Roles

Tech Lead owns the decision and is the approver. Dev authors and implements. BrSE/BA confirms the
design still satisfies the requirement. SRE reviews anything touching deployment, data, or capacity.
See `shared/team-roles.md`.

## Invocation

```bash
/atk:design-doc <requirement-path>   # Design from an existing requirement artifact
/atk:design-doc "<topic>"            # Design from a described problem
/atk:design-doc --options 3          # Compare exactly N options (default 2 to 3)
/atk:design-doc --no-adr             # Skip the ADR entry
/atk:design-doc --adr                # ADR only, for a decision with no document behind it
/atk:design-doc --lang vi            # Write the document in Vietnamese
/atk:design-doc --out <path>         # Override the default output path
```

## Workflow

```
[1. Read requirement] -> [2. Map current state] -> [3. Options] -> [4. Specify] -> [5. ADR + review]
```

### 1. Read the requirement

Restate the acceptance criteria the design must satisfy. A design that cannot be traced back to a
criterion is either scope creep or a missing criterion; say which.

### 2. Map the current state

Read the code that will change. Describe how it works today with `path:line` citations, including
the parts that make the obvious approach impossible. Do not describe an imagined codebase.

### 3. Compare options

Name the decision criteria first (effort, risk, reversibility, operational cost, team familiarity),
then score each option against them. Include the option the team would pick by default, even when
you would not, and say why it loses. One option means no comparison happened.

### 4. Specify the chosen approach

Cover, and mark `N/A` explicitly where a section does not apply: data model and migration, API
contracts with request and response shapes, error and edge-case behavior, backward compatibility,
feature flag or rollout plan, rollback path, observability, security and permission impact, and
performance expectation.

### 5. ADR and review

Write the ADR as context, decision, consequences, and alternatives rejected, numbered sequentially
from the existing `docs/adr/` directory. Set `status: IN REVIEW` and list the required reviewers.

## Output

Design at `docs/design/<ticket-or-date>-<slug>.md`, ADR at `docs/adr/NNNN-<slug>.md`, per
`shared/artifact-paths.md`. Both are records of a moment and neither is edited afterwards; the data
model and the API contract specified in step 4 reach their lasting form in `docs/api/` and
`docs/database/`, written by `atk:spec` once the change is real. Diagrams are inline Mermaid so they stay readable in a pull request,
drawn per `shared/diagram-conventions.md`: a sequence or component diagram beside the option it
belongs to, and nothing the prose does not also say.

## Ticket

Follow `shared/ticket-adapters.md`. Link the design from the epic, and link the epic from the design
front matter.

## Definition of done

- [ ] Current state is cited to real file paths, not described from memory.
- [ ] At least two options are compared against named criteria.
- [ ] Rollback and backward compatibility are answered, including as an explicit `N/A`.
- [ ] Every acceptance criterion maps to something in the design.
- [ ] The ADR states what was rejected and why, not only what was chosen.
