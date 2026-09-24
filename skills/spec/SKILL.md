---
name: spec
description: >
  Write and keep current the reference documents a team reads long after the work that produced them
  merged: the API contract per resource, the schema per table, the behaviour of a feature, and the
  components of a screen as its Figma design draws them. Also compares what those documents claim
  against what the code does, and for a screen against its design as well, and reports drift.
  In a project that works contract-first, writes them from the design before the code exists, so
  frontend, backend and QA can work against one agreed contract.
  Use when a project has no written contract, when a merged change left one behind, when nobody
  trusts the documents any more, or when the contract has to exist before anyone writes the code.
  Triggers on: "spec", "api spec", "database spec", "feature spec", "đặc tả", "tài liệu API",
  "tài liệu database", "spec bị lệch", "cập nhật tài liệu", "仕様書", "API仕様", "spec drift",
  "document this endpoint", "is the doc still true", "api docs before the code", "contract first",
  "viết tài liệu API trước khi code", "API docs cho FE làm trước", "実装前にAPI仕様を書く",
  "screen spec", "screen spec from Figma", "spec màn hình", "viết spec màn hình từ Figma",
  "画面仕様書", "Figmaから画面仕様書", "/atk:spec".
argument-hint: "[subject] [--kind api|db|feature|screen] [--from <design-path>] [--design <figma-url|image-dir>] [--sync] [--check] [--lang <code>] [--out <path>]"
---

# Reference Specs (`atk:spec`)

Owns the document somebody opens to answer "what does this endpoint do today", or, in a project whose
profile says `Contract: first`, "what is this endpoint agreed to do". It carries no options and no
history: it describes the system as it currently is or is agreed to be, which is why a stale line in
it is wrong rather than merely old, and why it is updated in place forever instead of being
superseded. `shared/spec-docs.md` holds what separates it from a design document, what changes under
`Contract: first`, and the obligation that keeps it true.

## Scope

Handles: writing and updating reference documents for API contracts, database schema, feature
behaviour, and screens, the last from a Figma design or the images exported from it; taking their shape from the documents a project already keeps; under `Contract: first`,
writing them from a design before the code exists and moving them onto the code as it lands; folding
a merged change into them; and reporting where they and the code disagree.

Does NOT handle: choosing an approach or weighing options (`atk:design-doc`, which decides and then
stops); turning a request into requirements (`atk:intake`); reviewing one change (`atk:review`);
generating OpenAPI documents, DDL, or migrations. It writes prose a person reads and never executes
a schema change.

It also does not decide that the code is wrong. A drift finding says the two disagree and which side
moved. Which of them changes is a decision, and decisions belong to the approver below.

## Roles

Dev authors, and BrSE/BA authors a `screen` document as often as Dev does. Tech Lead approves the
`api` and `db` kinds, because both are contracts other people work against. BrSE/BA approves the
`feature` and `screen` kinds, because each states what the product does for a user or asks of one,
and that is a business claim rather than a technical one. See `shared/team-roles.md`.

The approver differs by kind, so a run covering two kinds produces two documents with two approvers.
Never one document with a shared one.

## Invocation

```bash
/atk:spec <subject>               # Write or update the document for one subject
/atk:spec <subject> --kind api    # Say which kind when the subject alone is ambiguous
/atk:spec <subject> --from <design-path>  # Contract-first: write the document from the design, before the code
/atk:spec <screen> --kind screen --design <figma-url>  # Write or update a screen spec from a Figma frame or section
/atk:spec <screen> --kind screen --design <image-dir>  # The same from exported images, where Figma is out of reach
/atk:spec <screen> --kind screen  # Update a screen spec from the design it already records
/atk:spec --sync                  # Fold the change on the current branch into the documents it touched
/atk:spec --check                 # Report drift between the documents and the code, change nothing
/atk:spec --check --kind db       # Limit the drift report to one kind
/atk:spec --lang vi               # Write the document in Vietnamese
/atk:spec --out <path>            # Override the resolved path
```

## Workflow

```
[1. Resolve kind and file] -> [2. Take the shape] -> [3. Read the source] -> [4. Write] -> [5. Report]
```

Before step 1, read `.atk/overrides/spec.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Resolve the kind and the file

The kind comes from `--kind`, or from the subject when it is unambiguous: a route or a resource name
means `api`, a table name means `db`, a named capability means `feature`, and a Figma frame or a
screen name or `screen_id` means `screen`. `--design` implies `screen`. Ask when two kinds fit and
the answer changes which directory is written.

Where the subject belongs to one member repository and that member keeps a docs tree of its own,
resolve the directory there: the document then travels in the same pull request as the code, which is
what the sync obligation asks for. A contract two members share belongs to the project docs root.
`shared/artifact-paths.md` owns the split.

Resolve the directory from the `Docs` section of `.atk/profile.md`, falling back to the four default
kinds in `shared/artifact-paths.md`. A kind the project declared there is as valid as the four that
ship with the kit.

The file is named after the subject, never after a ticket or a date. A screen is named by its
`screen_id` where the design carries one, under the file-name rule in One link, several screens in
`shared/design-sources.md`, and a link to a section holding several screens resolves to one file
per screen. Read it first when it exists;
this skill updates in place, and the reason is in the Persistence section of
`shared/artifact-paths.md`.

`--from` has two preconditions, checked here before anything is written. The `Contract` line in the
Docs section of `.atk/profile.md` says `first`: a missing line or `TBD` means `code`, per
`shared/spec-docs.md`, and changing it is the Tech Lead's call, so name that person and stop rather
than write a document the project's own rules call stale. And the design is at `IN REVIEW` or
`APPROVED`: a `DRAFT` is not a source, because nobody has been asked to look at it. Where either
fails, say which and change nothing.

`--design` belongs to the `screen` kind alone. Given with another kind, say that a design is the
source of no other kind, per `shared/spec-docs.md`, and change nothing. `--from` is never a `screen`
source, since a screen spec is written from its design, not from a design document: given with
`--kind screen` or with `--design`, say so and change nothing. On a screen document that exists,
the design is the one its `design_source` and `design_node` record, unless `design_source` starts
with `retired`, so a rerun needs no `--design`,
and `--check` and `--sync` take none: given one, say it is ignored and why. Under `--out`, a link
holding several screens is refused, since one path cannot hold several documents.

### 2. Take the shape from the neighbours

When the directory already holds documents of this kind, read one and follow it, per the shape rule
in `shared/spec-docs.md`. Use `references/api-spec-template.md`, `references/db-spec-template.md`, or
`references/feature-spec-template.md`, or `references/screen-spec-template.md`, only when there is
nothing to copy from. Say in the run summary
which of the two happened, so a reviewer knows whether the shape was inherited or invented.

### 3. Read the source

A `screen` document takes its source differently from the next two paragraphs: the design, unless
its `design_source` starts with `retired`, in which case the code, and otherwise read
per `shared/design-sources.md`, which holds the three states of the Figma connection, the fallback
to exported images, and what the read records. Each row cites its node ID. Where the screen's code
already exists, compare each row with the screen's code for its label, required mark, limits, and
transition, to set `implemented` in step 4. The paragraphs on `--sync` below apply to it as well.

Describe what the code does, citing `path:line`. Do not describe intended behaviour taken from a
ticket, a design document, or a Figma file: those say what was going to happen, and the gap between
them and the code is exactly what this document exists to expose. Where they disagree, that is a
finding for step 5, not something to smooth over while writing.

`--from` is the one exception, and it has two sources, each cited. What the design decided is taken
from the design named, citing its section in place of `path:line`. What the design leaves to the
reference document, which under `Contract: first` is the full shape (fields, types, limits, status
and error codes), is asked of the person running the skill, who is this document's author: list
every gap in one prompt, and write each answer as the author's proposal, citing the author by name,
for the approver to accept or change. A gap the author cannot answer becomes an open question for
the document's approver rather than a plausible value filled in. A ticket or a Figma file is still
not a source, even here; the design and its author are, because the approver reviews both.

For `--sync`, read the diff of the change on the current branch rather than the whole module, and
touch only what the diff touched. A sync that rewrites sections the change never reached is an
unreviewable edit wearing a small ticket. On a contract-first document, the sync moves each item the
diff implements from its design citation to `path:line` and takes off its not-implemented line, per
`shared/spec-docs.md`; on a document at `no`, it first marks every item the diff does not reach, since
the field stops speaking for all of them. Where the code does something other than what the item
says, the item keeps its mark and the sync reports the difference in its summary as a disagreement
for the document's approver. Outside a `screen` document, which compares its rows with the code on every
write, this is the one place a marked item is compared with its code, which is why `--check` never
reports one as drift, and the sync never rewrites a contract to match the code.

A `screen` document is synced the same way under either `Contract` line, with one difference: an
implemented row keeps its node ID and gains its `path:line` beside it, per The `screen` kind in
`shared/spec-docs.md`, and the sync sets `yes` when the last mark comes off. Where the diff changes
what an implemented row promises, the sync reads the row, opens a question for the BrSE/BA with both
versions, and sets `IN REVIEW`; where `design_source` starts with `retired`, it rewrites the row from
the code instead. When the code moves on its own and When the design is retired, in that file, say
why the two differ.

### 4. Write

Front matter per `shared/artifact-paths.md`, with `approver` set per kind from the Roles section
above. A `screen` document adds the four `design_*` fields from the read. An update that changes what the document promises sets `status` back to `IN REVIEW`; a
correction of wording does not.

On every kind but `screen`, under `Contract: first` the front matter also carries `implemented`,
set per `shared/spec-docs.md`. `--from` sets `no` on a document it creates. Run again on a document that exists, which is also how a
design that changed in review is carried over, it rewrites every item that cites a design from the
design named, adds the items the design adds, marked unless the document is at `no`, marks the items it changes that are cited to the code,
and leaves the rest as they were. The value is then `no` if no item cites the code, and `partial`
otherwise. `--sync` moves it on as the items land, and sets `yes` in the change that takes the last
mark off, so the value becomes true when that change merges. A document written from a design still `IN REVIEW` says so
under its title, and stays `IN REVIEW` itself until that design is `APPROVED`. Under `Contract: code`
the field is left out, on every kind but `screen`.

A `screen` document always carries `implemented`, under either `Contract` line, per The `screen`
kind in `shared/spec-docs.md`: `no` where the screen has no code, otherwise `partial` or `yes` from
the comparison in step 3. Run again on a screen document that exists, it follows Updating from a changed
design in `references/screen-spec-template.md`, which is read on every such run and not only when
the directory is empty: rows keyed by node ID and only changed rows touched while the document has
never been approved, and every difference turned into an open question for the approver once it
has.

Two rules keep an update honest:

- Never delete a statement you did not verify. A section about behaviour outside this change stays
  exactly as it is, even when it looks wrong, and goes into the drift report instead.
- Everything the document cannot answer becomes an open question carrying the name of whoever can
  answer it, per rule 1 in `shared/team-roles.md`. A blank is worse than a question, because it reads
  as settled.

### 5. Report

`--check` compares the documents against the code, and a `screen` document against its design as
well, and changes no file, following
`references/drift-check.md`. That file holds the coverage checklist that keeps items from being
quietly skipped, the shape of a finding, and the read-only boundary. What counts as drift in the
first place is in `shared/spec-docs.md`, because `atk:review` has to answer it the same way.

Report in the session. Post to the ticket only when asked, and write a file only with `--out`: a
drift report is a record of one moment, and the reference document it is about is the thing meant to
last.

## Output

`docs/api/<resource>.md`, `docs/database/<table>.md`, `docs/features/<slug>.md`, or
`docs/screens/<screen>.md` per `shared/artifact-paths.md`, one file per subject, updated in place.

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
      a design document; under `--from`, every statement it wrote cites the design or names its author.
- [ ] `--from` ran only where the profile says `Contract: first` and the design was `IN REVIEW` or
      `APPROVED`, and `implemented` is `no` exactly when no item cites the code.
- [ ] Under `Contract: first`, `implemented` matches the items: at `no` every item cites the design or its
      author and none carries a mark; at `partial` every item without the mark is cited to the code; at `yes` no
      mark is left.
- [ ] The document's shape matches its neighbours when the directory was not empty, and the summary
      says whether the shape was inherited or came from a template.
- [ ] The file is named after its subject, with no ticket and no date in the name.
- [ ] `approver` matches the kind: Tech Lead for `api` and `db`, BrSE/BA for `feature` and `screen`.
- [ ] A `screen` document records `design_source`, `design_node`, `design_read`, and
      `design_fingerprint`, carries
      the Ready for dev line and `implemented`, and holds no value the design did not show unless it
      is marked as a proposal with its source; a missing Figma connection was reported by its state
      and did not stop the run.
- [ ] Nothing unverified was deleted; what looked wrong went into the drift report instead.
- [ ] Every open question carries the name of the person who must answer it.
- [ ] `--check` changed no file.
- [ ] `--sync` touched only what the change on the branch touched.
- [ ] A finding that the document never settled was reported as an open question, not as drift.
