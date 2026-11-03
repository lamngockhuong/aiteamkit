---
title: "ADR 0012: atkx:doc-audit checks each claim of a document against its source"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-03
updated: 2026-11-03
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-03, by instruction to the agent.

Renumbered from ADR 0011 to ADR 0012 on 2026-11-03, before merge, with the approver's agreement, since ADR 0011 was taken on `main` meanwhile; the decision is unchanged.

# ADR 0012: atkx:doc-audit checks each claim of a document against its source

Design: `docs/records/design/261103-1035-atkx-doc-audit.md`

## Context

Teams keep documents an agent wrote that nobody has checked. Asking another agent to review one
returns an opinion on whether it reads well, not whether it is true, because nothing is compared.
A pilot on three documents of a client project, each claim checked against the code, found 29 of
132 claims wrong, 22 of them in one document that called itself the source of truth, while only two
to four claims per document had no source in the repository.

No skill covers this today. `atk:spec --check` compares four kinds of reference document with the
code; `atk:catchup` explains a document without judging it; the `--challenge` modes of
`atk:design-doc` and `atk:plan` test the kit's own drafts before review.

## Decision

A new skill in the `atkx` plugin, `doc-audit`. It lists every checkable claim of a document and gives
each one verdict: `CORRECT` or `WRONG`, each with a `path:line` or a quoted source, or
`UNVERIFIABLE`, with the source that would settle it and the person who must answer. It lists
contradictions inside and between documents. Every `WRONG` verdict, and a sample of a tenth of the
`CORRECT` ones, is read again by an agent that does not see the first one's reasoning; the sample
was settled in the design's open question 1.

Given a directory, it first runs a cheap pass with no code read, a Node script checking every
citation and an agent reading each document for self-contradictions, ranks the documents, and a
person picks which get the full audit.

`--red-team` adds objections to what no source can settle, from agents reading the document cold, one
per way of failing, kept in a section apart from the verdicts.

It changes no document and reads inside the repository of the documents only, fetching no address
but that repository's own issues. Every quoted line is masked for secret values. Its report goes to
`<docs root>/derived/doc-audit/`, written only where the real path is inside the repository and
`git check-ignore` confirms it is ignored, and otherwise to a directory under the temporary
directory readable by the user alone; `--out` is held to the same checks. A document in a
kind `atk:spec` keeps is audited like any other, and the report names `atk:spec --check` without
calling it.

## Consequences

- `atkx` gains a second skill with scripts, `cite-check.mjs` and `tally.mjs`, on the terms of ADR 0002.
- `atkx` carries copies of four parts of `atk` it needs at run time: the unread-path table of
  `plugins/atk/shared/secret-scan.md`, the value mask of rule 9 in
  `plugins/atk/shared/team-roles.md`, the agent prompt rules of
  `plugins/atk/shared/host-capabilities.md`, and the challenge rules of
  `plugins/atk/shared/independent-challenge.md`. Each copy names its origin by GitHub link, since
  `tests/verify.sh` refuses a plugin file naming another plugin's path, and a new check there fails
  when a copy differs from its origin.
- `atk` changes in one place: a row in `plugins/atk/skills/help/references/atkx-skills.md`. It ships
  in the `atk` package, so the `atkx` release is merged first, and a rollback reverses the order.
- `--red-team` and `atk:design-doc --challenge` both put cold agents against a document. They differ
  in subject and in lens, any document already written by way of failing against an `atk` draft by
  signing role, and a reader may still confuse them; `atk:help` says which is which.
- The report quotes document lines and names people, so it is kept out of git and out of this
  repository.
- An audit of hundreds of documents is not affordable at full cost; the cheap pass decides where the
  money goes, and its ranking signals rest on one pilot until a second run tests them.

## Alternatives rejected

- **Widen `atk:spec --check` to any document.** Its drift rule assumes the shape and the `implemented`
  field of a reference document; a requirement note has no code to drift from and a design is meant
  to go out of date. Six skills cite that contract.
- **A new `atk` skill with a committed record.** An audit is a reading before a decision, not a
  decision; a record needing approval would put one more artifact before the team on every run, in no
  phase of delivery.
- **Guidance only, a page in `docs/`.** The pilot needed the same prompt three times, a recount and a
  second read of every wrong verdict; a page leaves each of those to memory.
- **Only re-verification, no `--red-team`.** Considered; the maintainer chose to add the flag on
  2026-11-03, for documents whose reasoning no source can check.
