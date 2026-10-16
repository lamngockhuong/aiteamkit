# Drift check

Loaded by `atk:spec` in step 5, for `--check`. Compares what a reference document claims against what
the code does, and reports the disagreements.

## The boundary

This mode changes nothing. Not the code, not the document, not the ticket. The moment it edits either
side it has decided which one was wrong, and that decision belongs to the document's approver.

The output is a report. `--out` writes it to a file, and a comment goes to the ticket when the user
asks for one.

## Coverage checklist

Before comparing anything, list every checkable claim in the document: each endpoint, each field with
a rule, each error code, each column, each behaviour rule, and the items of Rules that hold under any
shape, below. Every item on that list appears in the output with exactly one status:

| Status | Meaning |
|--------|---------|
| `checked` | Found in the code, and it agrees |
| `drift` | Found in the code, and it disagrees |
| `no implementation` | Nothing in the code corresponds to it, and the document claims something does |
| `not implemented yet` | A contract-first document, or a `screen` document under either `Contract` line, counts it as not implemented: the document is at `implemented: no`, or the item carries the mark |
| `unanswered` | The document never settled it; see below |
| `rule breach` | The document breaks one of the Rules that hold under any shape, below. Judged against the document alone, so it names the document's line and the rule rather than a code `path:line` |

`not implemented yet` is the one status that is never a finding: it is the state a contract-first
team planned for, per `shared/spec-docs.md`. It is listed so the reader sees how much of the contract
is still to be built. It holds even where code for the item already runs, since an item the contract
changes still runs its old behaviour until the change lands. The one finding such an item can raise
is a stale mark, `minor`: its code exists and already agrees with the contract, so the mark should
have come off. Under `Contract: code` the status occurs only in a `screen` document.

A document in a project's own shape is listed in that shape's own items and columns, its endpoint
blocks, its table rows, its numbered rules, with the kit's own items read where Where the kit's own
items go in `shared/spec-docs.md` puts them. A file at
a `Template` path in the profile is a template, not a document, and is never listed. A file only
named like a template, per the paragraphs under the kinds table in `shared/artifact-paths.md`, is
listed and checked like any document, and marked as possibly a template for the Tech Lead to
confirm.

Two files in the kind directories are not a subject, per those same paragraphs: `conventions.md` in the
`api` directory is listed as the conventions document, its items the code rows, and `index.md` in the
`db` directory as the schema index, its items the table rows and the diagram. Neither is
ever listed as a resource or a table named after the file.

The list exists because the failure mode of this mode is silence. A check that reports four findings
and says nothing about the other sixty items has not told the reader whether those sixty passed or
were never looked at, and the two are not the same.

## Rules that hold under any shape

The rules of that name in `shared/spec-docs.md` are checked on every document, whatever shape it
copied, since they say what a document must hold rather than where, with one check of this file's
own, the schema index. Per document:

- **Required outcomes.** Where the shape lists outcomes at all, each endpoint that needs
  authentication has a `401` outcome, and each that checks a permission a `403`. One missing is
  `major`: the document says nothing wrong, it says too
  little, and a caller handles only what it lists.
- **Examples.** Each example body is an item. One that does not parse as the format it claims is
  `minor`. A value shaped like a credential, a real person's data, or an internal host is reported
  by document, endpoint and field, and never quoted, so the report prints nothing that would need
  masking; it is `major`, and the report says the value is to be replaced, not judged. A value that
  may be a live credential is already in the repository's history and wherever it was pushed, so the
  report also says so, and leaves rotating it, the step What happens on a hit in
  `shared/secret-scan.md` asks of a value that reached a remote, as an open question for the
  credential's owner. The check itself does not stop: it changes nothing and unstages nothing, and
  reports every other item.
- **Error codes.** Where the conventions document exists, each code a resource document cites is
  compared with it, and one it lacks is `major`. Where the project keeps no conventions document,
  nothing is compared, and the report says so in one line rather than calling the codes checked.
- **References without a key.** A `*_id` column with no foreign key and no reason in its row is
  `minor`.
- **The schema index.** Where the schema index exists, every table document has a row and
  every row a document, and every table and column name its `erDiagram` draws matches the table
  documents character for character. A mismatch is `major`, since the index is what someone reads
  before writing a join.
- **A part left out.** A section or table the shape carries that is deleted or left empty, with no
  `N/A` and reason, is `minor`. A part the shape marks optional is not one.

These levels hold for these rules over the general table under Severity below: a missing `401` is a
`major` breach of a rule here, even though a status code the document gets wrong is `blocking`
there.

## A screen has two sides

A `screen` document is checked against its design as well as its code, per The `screen` kind in
`shared/spec-docs.md`, and the two results are reported apart.

- **The design side.** Compute the fingerprint again, per `shared/design-sources.md`, over what the
  document's `design_node` names: the nodes, read through the Figma connection from the file in
  `design_source`, or the images, hashed again from the directory in `design_source`. Compare it with
  the recorded one. A difference lists the screen as `design changed`, with both digests and the
  `design_read` date, and the next step is `atk:spec <screen> --kind screen`, which reads the
  document's own `design_node`. It is a status of the document rather than of an
  item, and the rows keep their own statuses from the code side. It is `major`: every row may still
  be right, but nobody can say which, and the digest cannot say which component moved, so the report
  does not guess. Where `design_source` starts with `retired` there is no design side, and the
  report says so rather than calling it checked. Where the connection is not ready, or the images
  are no longer in that directory, the report says in one line that the design side of that screen
  was not checked, and why. Silence here would read as a match.
- **The code side.** Every row is an item on the coverage list above. A row the document counts as
  implemented is compared with the screen's code for its label, required mark, limits, and
  transition. A marked row is `not implemented yet`, and so is a row struck through as removed from
  the design whose component the code still shows: the removal is the same planned state as an
  addition, per `shared/spec-docs.md`. It becomes `checked` once the code drops the component.
  Each row of the Events table is an item too, compared with what the screen's code does for its
  `Then`, and it takes the status of the component it names, or of the screen for `-`, while that
  is not implemented. Each `api` cell is an item: its link resolves to a section of an `api`
  document, and the method and path match the call the code makes. A link that resolves nowhere is
  `minor`; a call to another endpoint is drift.

## Drift is not the same as an unanswered question

The rule is in `shared/spec-docs.md`, because `atk:review` has to answer it identically. Here it
decides two things: a point the document never settled is reported as `unanswered`, carrying the name
the document already has against it, and a point counted as not implemented as `not implemented yet`.
Neither is ever `drift`.

## Each finding says which side moved

A finding carries four things:

- what the document claims, quoted, with its line;
- what the code does, with `path:line`;
- which side moved, when the git history answers it: a document written in March against code changed
  in September has an obvious direction;
- what it costs to leave as it is.

It does not say which side should change. Where the direction is genuinely unclear, say so; a guess
dressed as a conclusion is worse than the question.

A `rule breach` is the exception to the shape: it has no code side, so it carries the document's
line, the rule it breaks, and the cost. A value shaped like a credential is never quoted, per
Examples above, only placed by document, endpoint and field.

## What is not drift

- Wording. The document says "rejected", the enum value is `denied`, and both mean the same thing.
- Order. Fields listed in a different sequence than the response builds them.
- Internal naming. The document must not contain class or handler names in the first place, so a
  renamed class cannot be drift.
- Something the code does that the document does not mention, when the document never claimed to be
  exhaustive about it. Undocumented is a gap in coverage, and belongs in the report as
  `no implementation` only when the document does claim to list all of them, as an error table does.

## Severity

Three levels, and the level is about the consequence rather than the size of the difference:

| Level | When |
|-------|------|
| `blocking` | Somebody integrating against the document today would be wrong: a contract, a permission, a status code |
| `major` | Correct at the boundary, wrong inside: a validation rule, a default, a state transition |
| `minor` | Neither behaviour nor contract: a stale example, a dead link, a missing column comment |

Report blocking findings first, and never pad the list. Ten minor findings ahead of one blocking
finding is how the blocking one is missed.
