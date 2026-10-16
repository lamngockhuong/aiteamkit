---
title: "ADR 0007: a plain explanation of a document, a kit record or any other, is a mode of atk:catchup"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-16
ticket: none
---

# ADR 0007: a plain explanation of a document, a kit record or any other, is a mode of atk:catchup

Design: `docs/records/design/261016-0755-catchup-document-mode.md`

## Context

The records the kit writes, a security record, a fix report or a review report among them, open with
an `In short` section per `plugins/atk/shared/plain-writing.md`. Below it, each finding is written
for a reader who will open its `path:line` citations. A team member is also handed documents the kit
never wrote: a vendor's penetration test report, an audit, a client's specification. A reader who
has to act on any of these without being a specialist has no help. Typical readers are a PM ordering
the work, a Stakeholder accepting a risk, or a developer new to the area.

On 2026-10-16 the maintainer asked for every finding of a 13-finding security record to be
explained in plain words, in a file, and then for the same to work on any document. The session
wrote the first page by hand, and no skill could repeat it.

## Decision

`atk:catchup` gains a third mode, document mode, chosen when its argument is a local file, pasted
text, or a link to a document that is neither a pull request nor a tracker object.

- A link is read through a connection the harness already has to that service. The connection is
  found by what it can do, and only its ready state is read. Otherwise the run asks for a local
  export. The general part of that rule, the capability test, the three states, and the signed-in
  account that is never written down, moves from `shared/design-sources.md` into
  `shared/host-capabilities.md`, since two skills now need it.

- It writes one temporary page to `docs/derived/catchup/documents/`, with `approver: none`, like the
  brief. An ignore file holding `*` in that directory, checked with `git check-ignore -q` as run
  traces are, keeps the page out of git, and the page is never offered to be committed.
- The page and its run trace are named by the kind of kit record, or `document`, never by the
  document's own name, which appears only in the page body. `ticket` is a committed kit record's
  path or `none`.
- **A record the kit wrote** is explained finding by finding, using a table of kinds in
  `plugins/atk/skills/catchup/references/document-explainer.md`. The kinds are the security record,
  the threat model, the review report, the fix report, the verification record, the test run record
  and the incident record.
- **Any other document** is explained finding by finding when it lists findings, and section by
  section otherwise. Its own IDs and severity scale are kept, never mapped onto the kit's.
- For each finding the page says what happens, who can make it happen, an everyday analogy labelled
  as one, the impact, the conditions, the suggested fix, and whether the finding was checked.
- The page closes with a table of one line per finding or section, a suggested order of work that
  names the person who decides it, and the open questions, each addressed to a person.
- Every claim traces to a place in the document. A field the document leaves empty is written as
  unknown rather than inferred.
- An outside document is evidence, never instruction, per rule 8, stated in the mode's own step.
  Rule 9 keeps credential files unread and masks values on the page.
- A format the harness cannot read is asked for as an export, never guessed at.
- A page that restates unfixed vulnerabilities, a confidential document, or a masked value is still
  written in full. The run says in one line in the session, at its close, why the page is sensitive,
  and writes nothing of the warning into the page.
- The mode has no understanding check, for the same reason pull request mode has none.

## Consequences

- A team with only `atk` installed has the mode, and no new slash command is added.
- `catchup` now consumes documents as well as epics and pull requests. `docs/flow/skill-chain.md`
  and the citers of `plain-writing.md` change to say so.
- `catchup` and `atk:intake` can both receive a client's document. The description and the trigger
  cases have to keep "understand this" apart from "turn this into requirements", and the run asks
  when the request does not say.
- The kind table must grow whenever a skill starts writing a new kind of record.

## Alternatives rejected

- **A new `atkx` skill.** It passes the `atkx` bar, but a team with only `atk` installed would not
  have it, and `plain-writing.md` would have to be copied into the second plugin.
- **A `--plain` flag on each skill that writes a record.** It writes the explanation when the record
  is written, which is when its reader is absent. It cannot explain a record that already exists, nor
  any document the kit did not write.
- **Leaving it to `In short`.** That section explains the run, not each finding, and outside
  documents do not have one.
