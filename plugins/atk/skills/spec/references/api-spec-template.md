# API spec template

Loaded by `atk:spec` in step 2, and only when `docs/api/` holds nothing to copy the shape from and
the profile names no template for the kind, and in step 4 whenever a run reaches the conventions
document below. One file per resource, named after
the resource.

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
| 401 | `UNAUTHENTICATED` | No session, or the token has expired |
| 403 | `FORBIDDEN` | The caller is signed in and lacks the permission named above |
| 404 | `NOT_FOUND` | No row, or the caller may not see it |

Codes are cited from `docs/api/conventions.md` where the project keeps one, and the error body is not
restated here.

**Example.** Optional, one per outcome worth showing, each labelled with its status:

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "Example name",
  "email": "user@example.com"
}
```

**Side effects.** What changes in the data, what is sent, what is logged. `N/A` with its reason is an
answer, and a useful one, per Rules that hold under any shape in `shared/spec-docs.md`.

Repeat this block per endpoint, in the order a caller would use them.

## Related tables

The tables this resource reads and writes, linked to their documents in `docs/database/`.

## Open questions

Each with the name of the person who must answer it.
````

## The conventions document

`docs/api/conventions.md` is the second shape this file holds: what every resource document would
otherwise repeat. It is an `api` document, approved by the Tech Lead, and it is not a resource.

````markdown
---
title: "API conventions"
status: IN REVIEW
owner: <person>
approver: <Tech Lead>
created: YYYY-MM-DD
updated: YYYY-MM-DD
implemented: no | partial | yes   # only where the profile says Contract: first; delete otherwise
---

# API conventions

One paragraph: which APIs this covers, and where the code that defines the error codes lives, named
as a module rather than a file.

## Status codes

| Status | Meaning here |
|--------|--------------|
| 401 | Not signed in, or the session has expired. The client signs in again |
| 403 | Signed in, and lacking the permission the endpoint names |
| 422 | The request parsed, and a field broke a rule; the body says which |

## Error body

The one shape every error response has, with an example per Rules that hold under any shape in
`shared/spec-docs.md`:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Example message",
  "fields": [{ "name": "email", "code": "REQUIRED" }]
}
```

## Error codes

| Code | Status | Condition |
|------|--------|-----------|
| `UNAUTHENTICATED` | 401 | No session, or the token has expired |
| `FORBIDDEN` | 403 | The caller lacks the permission the endpoint names |
| `NOT_FOUND` | 404 | No row, or the caller may not see it |
| `VALIDATION_FAILED` | 422 | A field broke a rule; `fields` lists each one |

## Open questions

Each with the name of the person who must answer it.
````

- **When it exists.** Created only where this file is the shape of the `api` directory, resource
  documents an earlier run wrote in it included, or where the project already keeps a conventions
  document; a project shape without one is not given one, per The project's own shape wins in
  `shared/spec-docs.md`. It is created complete, with every code the existing resource documents
  cite, or not at all, so the next `--check` does not report the rest as missing. The run summary
  says which happened.
- **A file already there.** A `conventions.md` this shape did not write is not adopted: the run asks
  the Tech Lead whether it is the conventions document, and writes neither it nor a new one until
  the answer comes. On yes, it keeps its own shape and is read as the conventions document; on no,
  it is left alone, `--check` lists it as neither a resource nor the conventions document, and no
  conventions document is created while it holds the path. The summary names the answer, and the
  answer is recorded in the Docs section of the profile, per `shared/project-profile.md`, so it is
  asked once.
- **Its item is the code row.** A code row carries the not-implemented mark under `Contract: first`,
  at the start of its `Condition` cell, the way an endpoint does below.
- **A code missing here is added here.** Resource documents cite codes from this one, per Rules that
  hold under any shape in `shared/spec-docs.md`. A code the code emits that this document lacks is
  added in the same run, from the code; under `Contract: first`, as the author's proposal, the way
  `--from` writes any detail the design left open. Under `--sync`, only the codes the diff
  introduces; any other gap goes into the summary. Adding a code changes what this document
  promises, so its `status` goes back to `IN REVIEW`. Resource documents written before it keep
  their error tables.

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
- The `401` and `403` rows, the example body, and every other value the document carries follow
  Rules that hold under any shape in `shared/spec-docs.md`. An endpoint open to anyone says so in its
  authentication paragraph, which is why it lists neither. An example is optional, a fenced `json` block, with placeholders such as
  `example.com` addresses, all-zero identifiers and `Example name`.
- Under `Contract: first` the unit that carries the not-implemented mark is the endpoint, per
  `shared/spec-docs.md`, and only at `implemented: partial`. Its `<METHOD> /<path>` section opens with one line: `Not implemented yet.`,
  or `Not implemented yet: <what the contract changes>.` for an endpoint that exists and is changing.
  Until the mark comes off, the section cites the design section it came from, or the ticket where
  the design cannot be reached, per Front matter in `shared/artifact-paths.md`, or the author who
  proposed a detail the design left open, instead of the code.
