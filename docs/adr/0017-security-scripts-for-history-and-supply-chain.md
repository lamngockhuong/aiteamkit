---
title: "ADR 0017: atk:security carries Node scripts for the history and supply-chain scans"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-09
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-09, by instruction to the agent.

# ADR 0017: atk:security carries Node scripts for the history and supply-chain scans

Design: `docs/records/design/261108-2243-security-scripts.md`

## Context

`atk:security` reads the code at one commit. A secret deleted from the tree stays in every clone's
history, and the record can only say history was not scanned unless the project happens to run a
history scanner. The CI supply chain, actions pinned to a moving tag, `pull_request_target`, event
text in a shell step, install scripts, a second package index, is named in the skill's checklist and
checked by nothing. Before a repository goes to a client, who receives its whole history with staff
emails and internal hosts in it, no skill looks at all.

The kit's deterministic checks so far are an `sh` block, `shared/secret-scan.md`, and the Node
scripts of `atkx`, on the terms of ADR 0002. No `atk` skill carries scripts yet; the maintainer
allowed it on 2026-10-14, the first to come with a design and an ADR.

## Decision

`atk:security` carries `scripts/`: `history-scan.mjs` walks every commit of every ref for secret
shapes and credential files, and under `--identities` staff emails and internal hosts;
`supply-chain-scan.mjs` reads the tracked workflows, manifests and lockfiles. Both import
`scripts/lib/secret-shapes.mjs`, use only Node's standard library and `git`, print one JSON object,
never a matched value and never a hash of one, make no network call, and exit `0` when finished,
`3` when partial, `2` when they could not run. What a hit means stays in references:
`references/supply-chain.md` and `references/delivery-readiness.md`.

The secret shapes are restated in the module and held to `shared/secret-scan.md` by a check in
`tests/verify.sh` that runs both over the same lines and compares the labels, and so is that scan's
handling of the files rule 9 names, which the history walk never reads. The walk asks git for one
diff form whatever the user configured, the options the `sh` scan already uses, and reads merge
commits against every parent.

A new flag, `--delivery`, runs both scripts over the whole repository with `--identities`, the
internal domains given or proposed from the history and confirmed by the user, and ends in `READY`
or `NOT READY` with the owner's options, running none. It stays `NOT READY` until the owner confirms
that the refs the scan walked are all that will be handed over, since a clone holds only what was
fetched. Its report goes to a directory held out of git by an ignore file of its own, never into the
repository being delivered, and stdout, which the session reads, carries no full host and no email
local part.

## Consequences

- `atk:security` is the first `atk` skill with scripts. `CLAUDE.md` and
  `docs/system-architecture.md` stop saying none has one.
- The shapes live in two places, held by a behavioural check, as `atkx:doc-audit`'s copies are held
  by a textual one.
- History is scanned on every run that has Node, so "history not scanned" becomes the exception, and
  a secret found only in history is Critical until its owner rotates it.
- `plugins/atk/shared/artifact-paths.md` gains a derived row for the delivery report.
- A list of popular package names, `references/popular-packages.tsv`, has to be refreshed by the
  maintainer; the scan prints the oldest date it used.
- A host without Node loses both scans, and the record says so.

## Alternatives rejected

- **`sh` blocks, like the secret scan.** They reuse the shapes with no copy, but cannot read YAML,
  JSON or TOML, measure an edit distance, or report a partial walk. Ruled out by the maintainer on
  2026-11-08.
- **Only the scanners a project already runs.** Nothing to build, but most projects run none, and
  two that do get different answers to the same question.
- **Reading the shapes from `shared/secret-scan.md` at run time.** One copy, but a prose edit to a
  Markdown file would break the scan in every project with no test in between.
- **The delivery report as part of the security record.** The record is committed to the repository
  being delivered, so the client would receive the list of what leaks with the leak.
