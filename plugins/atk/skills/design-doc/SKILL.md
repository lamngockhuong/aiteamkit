---
name: design-doc
description: >
  Write the technical design document a team reviews before coding, plus its ADR: current state,
  options with trade-offs, chosen approach, data and API changes, migration, rollback, risks, open
  questions, and who signs off. Use before code that touches a schema, a public contract, a shared
  module, or several services. `--spike` first investigates, time-boxed, a question the design
  cannot choose without; `--challenge` puts one agent per signing role on the draft; `--answer`
  records answers to its open questions.
  Triggers on: "design doc", "technical design", "tech design", "thiết kế kỹ thuật", "tài liệu thiết kế",
  "ADR", "architecture decision", "設計書", "detail design", "how should we build this",
  "technical spike", "spike this", "nghiên cứu kỹ thuật", "spike kỹ thuật", "技術調査", "スパイク",
  "pressure-test this design", "phản biện thiết kế", "設計の懸念を洗い出して",
  "finish the draft design", "viết tiếp thiết kế nháp", "設計書の下書きの続き",
  "record the design answers", "ghi câu trả lời vào thiết kế", "設計の回答を反映",
  "/atk:design-doc".
argument-hint: "[requirement-path|topic|design-path] [--adr|--no-adr] [--options <n>] [--spike <question>] [--challenge] [--answer] [--lang <code>] [--out <path>]"
---

# Technical Design Document (`atk:design-doc`)

Produces the document a Tech Lead and peers can review without a meeting, and the ADR that survives
the people who wrote it. The point is the comparison: a design with only one option is a plan, not a
design, and gets reviewed as such.

## Scope

Handles: describing the current implementation with citations, framing the problem, comparing viable
options against stated criteria, specifying the chosen data model, API contracts, and the migration
and rollout sequence the change requires, and writing the ADR entry. Under `--spike`, it also
investigates a question the comparison cannot be scored without, inside a time box somebody set,
and writes what was found instead of a design. Given a design at `DRAFT`, it finishes or revises it.
Under `--answer`, it records a person's answers to a design's open questions, and the edits review
settles, until the design is `APPROVED`; it never answers one itself.

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
/atk:design-doc --spike "<question>" # Investigate one question first; a spike record, no design, no ADR
/atk:design-doc --challenge          # One agent per signing role raises objections before review
/atk:design-doc <design-path>        # Finish or revise a design still at DRAFT
/atk:design-doc <design-path> --answer # Record answers to its open questions, then read it back
/atk:design-doc --lang vi            # Write the document in Vietnamese
/atk:design-doc --out <path>         # Override the default output path
```

## Workflow

```
[1. Read requirement] -> [2. Map current state] -> [3. Options] -> [4. Specify] -> [5. ADR + review]
```

Before step 1, read `.atk/overrides/design-doc.md` when it exists, per rule 7 of `shared/team-roles.md`.
Then, before anything else, create this run's trace, `<docs root>/derived/traces/design-doc/<run-id>.md`:
read the kit's `shared/run-trace.md` and do what it says before the file, at each step, and at the close.

Under `--spike`, steps 1 to 3 run as below with the investigation of `references/spike.md` inside
step 3, and steps 4 and 5 are replaced by the spike record that file describes. A spike answers a
question and recommends; the design that chooses comes after it, in a run of its own. `--challenge`
applies to a design, not to a spike record, so with `--spike` it is not run, and the session says
so.

Under `--answer`, `references/answer-mode.md` takes the place of steps 1 to 5 on a design already
written: on a design at `DRAFT` or `IN REVIEW` it edits the ADR that exists rather than numbering a
new one, and leaves the status as it found it; an `APPROVED` design it does not edit at all. It
records what a person answered and never answers a question itself. With `--spike` it is refused in
one line, since a spike record carries no open question to answer; the other flags are as that file
says.

A design path given without `--answer` takes up that design by its status, which governs its ADR
too: where the design links an ADR, only the pairs The ADR disagrees in `references/answer-mode.md`
lists go on, and any other stops naming the approver. An ADR written alone by `--adr`, given as the
path, is taken up the same way by its own, the first check below reading the ADR directory, resolved
per `shared/artifact-paths.md`, in place of the design directory. Before the status is read, the
first five checks of `## Before any edit` in that file run, from not a design of this kit to not the
version under review.

- **`DRAFT`.** The draft is still its author's. The run reads it, says which of steps 1 to 5 its
  sections already cover, each traced as `skipped (in the draft)` per `shared/run-trace.md`, and
  resumes at the first one missing, editing the file in place and keeping its ADR number. A run that
  died partway is finished this way, an author's revision is made this way, `--challenge` runs at
  step 5 as on a new draft, and `--adr` writes, at `DRAFT`, the ADR a draft that links none lacks.
  Step 5 is covered once the ADR exists, or the design says it was written under `--no-adr`: a
  resume writes no ADR then, and never sets `IN REVIEW`, since a draft with every section is either
  a run that died at its last line or one its author sent back. Such a draft is said to be complete,
  and the run asks whether to revise it, challenge it, or leave it for its author, who sets the
  design and its ADR to `IN REVIEW` together; a run with nobody to ask says so and stops. A second
  `--challenge` keeps the earlier `Pre-review objections` and adds a dated section after it, per
  `references/role-challenge.md`.
- **`IN REVIEW`.** Refused in one line that points at `--answer`: in review, an answer, an option a
  reviewer asked for, and a decision settled are all recorded through it. With `--adr` or
  `--challenge`, the line says instead that the design goes back to `DRAFT` first, by its author
  editing the status and telling the approver, since both are draft steps it skipped.
- **`APPROVED`, `SUPERSEDED`, or any other.** Refused as `references/answer-mode.md` refuses it, with
  the line it names.

A plain run whose subject already has a design at `DRAFT` or `IN REVIEW` says so and asks whether
this is that design, taken up by the line above, or a second one under the same subject, as a
backend and a frontend design of one epic are. The subject has a design when a design's front
matter `ticket` names the same ticket, never `none`, `TBD` or an empty one, or its body links the
same requirement path; a topic with neither matches nothing, and a spike record, named `-spike-`,
is never a match. Where several match, the run lists them in the same question; a run with nobody
to ask lists every match, one or several, and stops.

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

Where the Docs section of `.atk/profile.md` says `Contract: first`, the data model and the API
contract are specified in summary here: which endpoints, tables, columns, and behaviour rules the
change adds or alters, and why. The full shapes, request and response fields, column types,
constraints, error codes, go into the reference documents `atk:spec --from` writes from this design,
whose author proposes them there for each document's approver, and this section names each of them
by path. It also names every other reference document that describes a table, an enum, an
endpoint, or a rule the change alters, found by searching for those names across the scope that What is
searched in `skills/spec/references/affected-documents.md` sets, member repositories and language
branches included, since a document
the design leaves out is one `atk:spec --from` has no reason to open. Writing the shapes in both
places would leave two copies to disagree the first time review changes one, per
`shared/spec-docs.md`. A missing line or `TBD` means `code`, and then this section carries the full
shapes as above.

End the design with an `## Open questions` section: what the design could not settle and the
repository cannot answer, each with the person who must answer it, per rule 1 of
`shared/team-roles.md`, and the option or section it blocks. A design with none says so. `--answer`
is how an answer gets back into it. The end of the design runs in this order: `## Open questions`,
then `Pre-review objections` under `--challenge`, then the link to the ADR.

### 5. ADR and review

Write the ADR as context, decision, consequences, and alternatives rejected, numbered sequentially
from the existing `docs/adr/` directory. Set `status: IN REVIEW` and list the required reviewers.
Under `--no-adr`, the line where the link would go says the design has no ADR and was written
without one, so a later run that takes the draft up writes none.
The run never sets `APPROVED`. At its close it names every answer row that reads
`answered by <name>, not <named person>` or `partial`, which the approver settles through `--answer`
before approving, per `references/answer-mode.md`, since from `APPROVED` the ruling has nowhere to
go.

Under `--challenge`, before setting that status, run the role challenge in
`references/role-challenge.md`: one agent per required reviewer's role reads the draft with nothing
of this conversation, the objections that survive a check against the design and the code are
answered as changed or left open for the role, and the design carries them in a
`Pre-review objections` section. It is a pre-review by the host's parallel agents, per
`shared/host-capabilities.md`, never a substitute for the reviewers it imitates.

## Output

Design at `docs/records/design/<date>-<ticket>-<slug>.md`, ADR at `docs/adr/NNNN-<slug>.md`, per
`shared/artifact-paths.md`. Both are records of a decision: while the design is `DRAFT` or
`IN REVIEW`, review changes both in place, an answer recorded, an option a reviewer asked for, a
decision settled in review, and from `APPROVED` neither is edited, so a changed decision supersedes
them, per Before writing in that file. The data
model and the API contract specified in step 4 reach their lasting form in `docs/api/` and
`docs/database/`, written by `atk:spec`: once the change is real under `Contract: code`, and from this
design while it is in review under `Contract: first`, so the contract is reviewed beside the decision.

When this design replaces an earlier one for the same area, retire the earlier one and its ADR in
the same pull request: `status: SUPERSEDED`, a link to this design from each, and a link back.
Nothing marks it automatically, and a directory where two designs both read as current sends the
next reader to the wrong one. The rule is at the end of `shared/artifact-paths.md`.

Under `--spike`, the spike record at `docs/records/design/<date>-<ticket>-spike-<slug>.md`, a record
like the design and linked from the design that follows it.

Diagrams are inline Mermaid so they stay readable in a pull request, drawn per
`shared/diagram-conventions.md`: a sequence or component diagram beside the option it belongs to,
and nothing the prose does not also say.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Link the design from the epic, and link the epic from the design
front matter.

## Definition of done

- [ ] Current state is cited to real file paths, not described from memory.
- [ ] At least two options are compared against named criteria.
- [ ] Rollback and backward compatibility are answered, including as an explicit `N/A`.
- [ ] Every acceptance criterion maps to something in the design.
- [ ] The ADR states what was rejected and why, not only what was chosen.
- [ ] Any earlier design this one replaces, and its ADR, is marked `SUPERSEDED` and linked in both
      directions.
- [ ] Under `--challenge`, every kept objection is answered as changed or left open for its role,
      the dropped ones are counted, and the section says it is not a review or an approval.
- [ ] Under `--spike`, the record names who set the time box, cites every source with the date it
      was read, keeps prototype code out of the change, and recommends without deciding.
- [ ] `## Open questions` names, per question, the person who must answer it and the option or
      section it blocks, or says the design has none.
- [ ] The close named every answer row still `answered by ..., not ...` or `partial`, for the
      approver to settle before `APPROVED`.
- [ ] Under `Contract: first`, step 4 names every reference document the change makes untrue, not
      only the ones `atk:spec --from` will write.
- [ ] Under `--answer`, each answer is recorded verbatim with who gave it, no question was answered
      by the skill, and an `APPROVED` design was not edited: the run stopped naming the plain run
      that supersedes it.
