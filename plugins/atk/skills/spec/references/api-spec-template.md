# API spec template

Loaded by `atk:spec` in step 2, and only when `docs/api/` holds nothing to copy the shape from. One
file per resource, named after the resource.

The reader is a developer on another team who has the endpoint and nothing else. Everything below
exists because they cannot ask the author.

## Shape

````markdown
---
title: "<Resource> API"
status: IN REVIEW
owner: <person>
approver: <Tech Lead>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <the ticket that last changed this, or none>
implemented: no | partial | yes   # only where the profile says Contract: first; delete otherwise
---

# <Resource> API

One paragraph: what this resource is in the product's own words, who is allowed to call it, and
which service owns it.

## Processing strategy

| Operation | Kind | Why |
|-----------|------|-----|
| Create <resource> | sync | Completes inside the request |
| Export <resource> | async | Runs past the request; the caller polls the status endpoint |
| Reconcile <resource> | scheduled | No caller; runs nightly |

This table comes first because it decides how many endpoints exist. A synchronous operation is one
endpoint. An asynchronous one is a pair, the trigger and the place the caller asks whether it
finished. A scheduled one is a job with no endpoint at all, and belongs here so a reader stops
looking for the endpoint that was never meant to exist.

## `<METHOD> /<path>`

What it does, in one sentence.

**Authentication and permission.** Who may call it, and what happens to someone who may not.

**Request.**

| Field | In | Type | Required | Rule |
|-------|-----|------|----------|------|
| `id` | path | uuid | yes | Must exist and not be deleted |
| `page` | query | int | no | Default 1, maximum 100 |

**Response.** The success status and the shape returned. Every field that comes from a column says
which column, because the next person changing that column needs to find this document.

**Errors.**

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | No row, or the caller may not see it |

**Side effects.** What changes in the data, what is sent, what is logged. `None` is an answer, and a
useful one.

Repeat this block per endpoint, in the order a caller would use them.

## Related tables

The tables this resource reads and writes, linked to their documents in `docs/database/`.

## Open questions

Each with the name of the person who must answer it.
````

## Rules

- Field constraints come from the code that enforces them, not from the ticket that requested them.
  A maximum that only the ticket mentions is not a rule, it is a wish, and belongs in open questions.
  Under `Contract: first`, a constraint on an item not yet in code comes from the design instead,
  and only from the design.
- Error codes are listed by their code value. Do not transcribe the message text: messages get
  translated and reworded, and a document that copies them goes stale on a change nobody thinks of
  as a change.
- Name public things only: paths, query parameter names, status codes, error codes, table and column
  names, enum values. Not handler names, service classes, DTO types, or file paths. Those are how it
  is implemented today, and this document has to survive the day that changes.
- An endpoint nobody may call yet is still documented, marked with the flag or the role that gates
  it.
- Under `Contract: first` the unit that carries the not-implemented mark is the endpoint, per
  `shared/spec-docs.md`, and only at `implemented: partial`. Its `<METHOD> /<path>` section opens with one line: `Not implemented yet.`,
  or `Not implemented yet: <what the contract changes>.` for an endpoint that exists and is changing.
  Until the mark comes off, the section cites the design section it came from, or the author who
  proposed a detail the design left open, instead of the code.
