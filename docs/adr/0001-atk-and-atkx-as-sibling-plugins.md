---
title: "ADR 0001: atk and atkx ship as sibling plugins of one repository"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-30
updated: 2026-10-02
ticket: none
---

# ADR 0001: atk and atkx ship as sibling plugins of one repository

Design: `docs/records/design/260930-0933-atkx-utility-kit-placement.md`

## Context

Some useful skills fit no phase of team delivery and write no artifact a teammate reviews. Evaluating
another skill is the first example. Adding them to `atk` would weaken its premise, so they need a
second kit, `atkx`. An `atkx` skill may call an `atk` skill; `atk` never calls or names `atkx`.

This repository ships as one plugin install with `"source": "./"`, so every install carries the
whole tree, `docs/`, `plans/` and `.atk/` included. Claude Code, Cursor and Codex all document a
repository holding several plugins, each in its own directory, and all three refuse a path that
leaves a plugin's directory. Two kits in one repository therefore cannot share files, and the
maintainer decided on 2026-10-01 that they will not.

## Decision

`atk` moves to `plugins/atk/` and `atkx` is created at `plugins/atkx/`. Each is a complete plugin
with its own three manifests and reads no file of the other, symlinks included. The repository root
holds the three marketplace files, one per harness, and the repository's own docs.

`atkx` declares `atk` as a dependency in its Claude Code `plugin.json`. Its skills also check, at
run time, that the `atk` skill they call is installed, because Cursor and Codex document no
dependency field.

`atk` adds one review rule, `CONV-011`: nothing under `plugins/atk/` names an `atkx` command.

## Consequences

- An `atk` install carries `plugins/atk/` only, which is less than it carries today.
- The plugin id `atk@atk` stays, and its `source` moves from `./` to `./plugins/atk`. The maintainer
  accepted that existing users may have to reinstall.
- Around a thousand path references outside the plugins are rewritten, every verification command
  in `CLAUDE.md` among them. Committed records keep their old paths.
- Two release packages version the kits independently, and the tags change from `v0.0.21` to
  `atk-v0.0.22` and `atkx-v0.0.1`. The dependency carries no version range, because the tag form a
  Claude Code range resolves against, `atk--v0.0.22`, is one release-please cannot read back.
- An update from the old layout may not follow the new `source`. If it does not, users uninstall and
  install again.
- A rule both kits need is written in each, and the copy names the file it came from.

Note added 2026-10-01, before the move merged: two of the predictions above did not hold. `v0.1.0`
was released before the move, so the first tags after it are `atk-v0.1.1` and `atkx-v0.0.1`, and
`atk-v0.1.0` was tagged on the `v0.1.0` commit as the boundary. An update from an install made at
`v0.1.0` followed the new `source` on Claude Code once the version moved past `0.1.0`, so nobody has to reinstall there. The decision
itself is unchanged.

Amended 2026-10-02: `CONV-011` now has one exception. `atk:help` names an `atkx` skill where no
`atk` skill fits, with the install commands when it is not installed, from a list kept inside the
`help` skill. Every other part of `atk` still names nothing of `atkx`, and `atk` still invokes none
of it. `docs/records/design/261002-0525-help-names-atkx.md` holds the decision.

## Alternatives rejected

- **An `atkx/` subdirectory with `atk` left at the root.** `atk` would still ship the whole
  repository, `atkx/` included.
- **A repository of its own for `atkx`.** Cheapest, and the first draft's choice, but the maintainer
  wants both kits in this repository, and the costs it avoided were accepted on 2026-10-01.
- **The utilities as ordinary `atk` skills.** A skill with no artifact and no approver fails the bar
  this repository uses to accept a skill, the bar that kept `simplify` out while `spec` went in.
