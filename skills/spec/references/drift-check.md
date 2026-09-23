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
| `not implemented yet` | A contract-first document counts it as not implemented: the document is at `implemented: no`, or the item carries the mark |
| `unanswered` | The document never settled it; see below |

`not implemented yet` is the one status that is never a finding: it is the state a contract-first
team planned for, per `shared/spec-docs.md`. It is listed so the reader sees how much of the contract
is still to be built. It holds even where code for the item already runs, since an item the contract
changes still runs its old behaviour until the change lands. The one finding such an item can raise
is a stale mark, `minor`: its code exists and already agrees with the contract, so the mark should
have come off. Under `Contract: code` the status does not occur.

The list exists because the failure mode of this mode is silence. A check that reports four findings
and says nothing about the other sixty items has not told the reader whether those sixty passed or
were never looked at, and the two are not the same.

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
