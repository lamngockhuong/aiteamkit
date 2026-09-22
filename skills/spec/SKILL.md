---
name: spec
description: >
  Write and keep current the reference documents a team reads long after the work that produced them
  merged: the API contract per resource, the schema per table, and the behaviour of a feature. Also
  compares what those documents claim against what the code does, and reports where the two drifted.
  Use when a project has no written contract, when a merged change left one behind, or when nobody
  trusts the documents any more.
  Triggers on: "spec", "api spec", "database spec", "feature spec", "đặc tả", "tài liệu API",
  "tài liệu database", "spec bị lệch", "cập nhật tài liệu", "仕様書", "API仕様", "spec drift",
  "document this endpoint", "is the doc still true", "/atk:spec".
argument-hint: "[subject] [--kind api|db|feature] [--sync] [--check] [--lang <code>] [--out <path>]"
---

# Reference Specs (`atk:spec`)

Owns the document somebody opens to answer "what does this endpoint do today". It carries no options
and no history: it describes the system as it currently is, which is why a stale line in it is wrong
rather than merely old, and why it is updated in place forever instead of being superseded.
`shared/spec-docs.md` holds what separates it from a design document, and the obligation that keeps
it true.

## Scope

Handles: writing and updating reference documents for API contracts, database schema, and feature
behaviour; taking their shape from the documents a project already keeps; folding a merged change
into them; and reporting where they and the code disagree.

Does NOT handle: choosing an approach or weighing options (`atk:design-doc`, which decides and then
stops); turning a request into requirements (`atk:intake`); reviewing one change (`atk:review`);
generating OpenAPI documents, DDL, or migrations. It writes prose a person reads and never executes
a schema change.

It also does not decide that the code is wrong. A drift finding says the two disagree and which side
moved. Which of them changes is a decision, and decisions belong to the approver below.

## Roles

Dev authors. Tech Lead approves the `api` and `db` kinds, because both are contracts other people
work against. BrSE/BA approves the `feature` kind, because it states what the product does for a
user and that is a business claim rather than a technical one. See `shared/team-roles.md`.

The approver differs by kind, so a run covering two kinds produces two documents with two approvers.
Never one document with a shared one.

## Invocation

```bash
/atk:spec <subject>               # Write or update the document for one subject
/atk:spec <subject> --kind api    # Say which kind when the subject alone is ambiguous
/atk:spec --sync                  # Fold the change on the current branch into the documents it touched
/atk:spec --check                 # Report drift between the documents and the code, change nothing
/atk:spec --check --kind db       # Limit the drift report to one kind
/atk:spec --lang vi               # Write the document in Vietnamese
/atk:spec --out <path>            # Override the resolved path
```

## Workflow

```
[1. Resolve kind and file] -> [2. Take the shape] -> [3. Read the code] -> [4. Write] -> [5. Report]
```

Before step 1, read `.atk/overrides/spec.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Resolve the kind and the file

The kind comes from `--kind`, or from the subject when it is unambiguous: a route or a resource name
means `api`, a table name means `db`, a named capability means `feature`. Ask when two kinds fit and
the answer changes which directory is written.

Where the subject belongs to one member repository and that member keeps a docs tree of its own,
resolve the directory there: the document then travels in the same pull request as the code, which is
what the sync obligation asks for. A contract two members share belongs to the project docs root.
`shared/artifact-paths.md` owns the split.

Resolve the directory from the `Docs` section of `.atk/profile.md`, falling back to the three default
kinds in `shared/artifact-paths.md`. A kind the project declared there is as valid as the three that
ship with the kit.

The file is named after the subject, never after a ticket or a date. Read it first when it exists;
this skill updates in place, and the reason is in the Persistence section of
`shared/artifact-paths.md`.

### 2. Take the shape from the neighbours

When the directory already holds documents of this kind, read one and follow it, per the shape rule
in `shared/spec-docs.md`. Use `references/api-spec-template.md`, `references/db-spec-template.md`, or
`references/feature-spec-template.md` only when there is nothing to copy from. Say in the run summary
which of the two happened, so a reviewer knows whether the shape was inherited or invented.

### 3. Read the code

Describe what the code does, citing `path:line`. Do not describe intended behaviour taken from a
ticket, a design document, or a Figma file: those say what was going to happen, and the gap between
them and the code is exactly what this document exists to expose. Where they disagree, that is a
finding for step 5, not something to smooth over while writing.

For `--sync`, read the diff of the change on the current branch rather than the whole module, and
touch only what the diff touched. A sync that rewrites sections the change never reached is an
unreviewable edit wearing a small ticket.

### 4. Write

Front matter per `shared/artifact-paths.md`, with `approver` set per kind from the Roles section
above. An update that changes what the document promises sets `status` back to `IN REVIEW`; a
correction of wording does not.

Two rules keep an update honest:

- Never delete a statement you did not verify. A section about behaviour outside this change stays
  exactly as it is, even when it looks wrong, and goes into the drift report instead.
- Everything the document cannot answer becomes an open question carrying the name of whoever can
  answer it, per rule 1 in `shared/team-roles.md`. A blank is worse than a question, because it reads
  as settled.

### 5. Report

`--check` compares the documents against the code and changes no file, following
`references/drift-check.md`. That file holds the coverage checklist that keeps items from being
quietly skipped, the shape of a finding, and the read-only boundary. What counts as drift in the
first place is in `shared/spec-docs.md`, because `atk:review` has to answer it the same way.

Report in the session. Post to the ticket only when asked, and write a file only with `--out`: a
drift report is a record of one moment, and the reference document it is about is the thing meant to
last.

## Output

`docs/api/<resource>.md`, `docs/database/<table>.md`, or `docs/features/<slug>.md` per
`shared/artifact-paths.md`, one file per subject, updated in place.

Sections come from the neighbouring document when there is one, and otherwise from the template for
the kind. Diagrams are inline Mermaid per `shared/diagram-conventions.md`, and only where a sequence
or a state machine is genuinely hard to read as prose.

`--check` writes nothing unless `--out` is given.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Link the document from the ticket that changed it, and record the
ticket in the `ticket:` field. A drift report becomes a comment or an issue only when the user asks,
one issue per finding, never one issue listing everything.

## Definition of done

- [ ] Every statement about behaviour is read from the code and cited, never copied from a ticket or
      a design document.
- [ ] The document's shape matches its neighbours when the directory was not empty, and the summary
      says whether the shape was inherited or came from a template.
- [ ] The file is named after its subject, with no ticket and no date in the name.
- [ ] `approver` matches the kind: Tech Lead for `api` and `db`, BrSE/BA for `feature`.
- [ ] Nothing unverified was deleted; what looked wrong went into the drift report instead.
- [ ] Every open question carries the name of the person who must answer it.
- [ ] `--check` changed no file.
- [ ] `--sync` touched only what the change on the branch touched.
- [ ] A finding that the document never settled was reported as an open question, not as drift.
