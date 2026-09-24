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
a rule, each error code, each column, each behaviour rule. Every item on that list appears in the
output with exactly one status:

| Status | Meaning |
|--------|---------|
| `checked` | Found in the code, and it agrees |
| `drift` | Found in the code, and it disagrees |
| `no implementation` | Nothing in the code corresponds to it, and the document claims something does |
| `not implemented yet` | A contract-first document, or a `screen` document under either `Contract` line, counts it as not implemented: the document is at `implemented: no`, or the item carries the mark |
| `unanswered` | The document never settled it; see below |

`not implemented yet` is the one status that is never a finding: it is the state a contract-first
team planned for, per `shared/spec-docs.md`. It is listed so the reader sees how much of the contract
is still to be built. It holds even where code for the item already runs, since an item the contract
changes still runs its old behaviour until the change lands. The one finding such an item can raise
is a stale mark, `minor`: its code exists and already agrees with the contract, so the mark should
have come off. Under `Contract: code` the status occurs only in a `screen` document.

The list exists because the failure mode of this mode is silence. A check that reports four findings
and says nothing about the other sixty items has not told the reader whether those sixty passed or
were never looked at, and the two are not the same.

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
  does not guess. Where the connection is not ready, or the images are no longer in that directory,
  the report says in one line that the design side of that screen was not checked, and why. Silence
  here would read as a match.
- **The code side.** Every row is an item on the coverage list above. A row the document counts as
  implemented is compared with the screen's code for its label, required mark, limits, and
  transition. A marked row is `not implemented yet`, and so is a row struck through as removed from
  the design whose component the code still shows: the removal is the same planned state as an
  addition, per `shared/spec-docs.md`. It becomes `checked` once the code drops the component.

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
