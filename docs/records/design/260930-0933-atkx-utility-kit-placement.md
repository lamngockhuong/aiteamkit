---
title: Where a second kit of utility skills, atkx, lives and how it depends on atk
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-30
updated: 2026-10-01
ticket: none
---

# Where a second kit of utility skills, atkx, lives and how it depends on atk

## In short

The maintainer wants a second kit, `atkx`, for utility skills that write no team artifact and belong
to no phase of delivery. The first candidate is a skill that evaluates another skill. `atkx` may
call `atk` skills, and `atk` never calls `atkx` on its own.

This design moves `atk` into `plugins/atk/` and creates `atkx` beside it in `plugins/atkx/`, in
this repository. Each one is a complete plugin, and neither reads the other's files. Since the
installer copies a plugin's own directory and nothing above it, keeping the two apart is the only
layout that works anyway.

The first draft of this design, written 2026-09-30, recommended a repository of its own. On
2026-10-01 the maintainer decided four things that change the comparison: the two kits share no
files, existing users may change their install source, the path rewrite is accepted, and the tag
format may change. With sharing off the table, the same repository costs only what the maintainer
has accepted, and it meets a criterion the separate repository does not.

## Requirement

No requirement artifact exists. The request came in the sessions that produced this design, and the
criteria below restate it:

| # | Criterion | Source |
|---|-----------|--------|
| AC1 | `atkx` holds utility skills that depend on no artifact and on no delivery lifecycle | the maintainer, 2026-09-30 |
| AC2 | An `atkx` skill may invoke an `atk` skill | the maintainer, 2026-09-30 |
| AC3 | `atk` never invokes or names an `atkx` skill | the maintainer, 2026-09-30 |
| AC4 | `atkx` lives in this repository | the maintainer, 2026-09-30, confirmed 2026-10-01 |
| AC5 | Neither plugin reads the other's files | the maintainer, 2026-10-01 |

The maintainer also accepted three costs on 2026-10-01, which this design therefore does not argue
against: existing users change their install source, roughly a thousand path references outside the
plugins are rewritten, and the tag format changes.

## Current state

- **One repository ships as one plugin install.** `.claude-plugin/marketplace.json` lists one plugin
  with `"source": "./"`. `CLAUDE.md`, section "`.atk/` in the target project", records that the
  install copies the plugin directory as it stands, so `.atk/`, `docs/`, `plans/` and
  `CHANGELOG.md` reach every user today.
- **Skill discovery is anchored to the plugin root.** Claude Code discovers `skills/` at the plugin
  root (`.claude-plugin/plugin.json` has no `skills` key). `.cursor-plugin/plugin.json` and
  `.codex-plugin/plugin.json` both point at `"./skills/"`.
- **Paths inside the kit are relative to the kit.** Skills cite `../../shared/<file>.md`, and the
  hooks resolve through `${CLAUDE_PLUGIN_ROOT}` and `${PLUGIN_ROOT}`. Moving `skills/`, `shared/`,
  `hooks/` and `assets/` down together keeps every one of them valid.
- **Paths outside the kit are relative to the repository.** `grep -rn -F "skills/"` over
  `CLAUDE.md`, `README.md`, `docs/`, `.github/` and `.atk/` counts 1023 lines on 2026-10-01, before
  `shared/` and `hooks/` are counted.
- **One release package.** `release-please-config.json` defines one package, `"."`, with five
  `extra-files` sharing one version, `0.0.21` today. Tags are unprefixed: `v0.0.7`, `v0.0.8` and so
  on. `skills/help/references/state-signals.md:58`, signal 17, reads "the newest version tag".
- **Only Claude Code has a marketplace file.** `README.md:166-176` tells Cursor users to run
  `/add-plugin atk` and Codex users to search `/plugins`. The maintainer confirmed on 2026-10-01 that
  `atk` was never submitted to Cursor's curated marketplace, so the Cursor line names a listing that
  does not exist, and no re-index request is owed after the move.

What each harness documents about a repository holding several plugins, read 2026-10-01:

| | Claude Code | Cursor | Codex |
|---|---|---|---|
| Several plugins in one repository | Yes: one `marketplace.json` entry per plugin, each with a relative `source` such as `"./plugins/atk"` | Yes: "A single Git repository can contain multiple plugins using a marketplace manifest" | Yes: each plugin under `$REPO_ROOT/plugins/<name>` |
| Marketplace file | `.claude-plugin/marketplace.json` | `.cursor-plugin/marketplace.json` | `.agents/plugins/marketplace.json` |
| A path out of the plugin (`..`) | Fails validation | Not allowed: "no `..`, no absolute paths" | Not allowed: paths "stay inside the plugin root" |
| Dependency between plugins | `dependencies` in `plugin.json`, installed from the same marketplace | Not documented | Not documented |

Sources: [Claude Code marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference),
[Claude Code plugin dependencies](https://code.claude.com/docs/en/plugins/dependencies),
[Claude Code hosting](https://code.claude.com/docs/en/plugins/host-marketplace),
[Cursor plugins reference](https://cursor.com/docs/reference/plugins),
[Codex plugin packaging](https://developers.openai.com/codex/plugins/build), all read 2026-10-01.

## Decision criteria

1. **Meets AC1 to AC5**, AC4 above all, since the maintainer confirmed it.
2. **Risk to `atk`**: what an `atk` user receives or loses because `atkx` exists.
3. **Harness certainty**: whether each harness documents the layout.
4. **Reversibility**: the cost of undoing the choice later.

Release cost and the path rewrite are no longer criteria: the maintainer accepted them on
2026-10-01.

## Options

### Option A: `atkx/` subdirectory, `atk` stays at the root (the default pick)

`atkx/` gets its own manifests, and the marketplace gains `"source": "./atkx"` while `atk` stays at
`"./"`. It is the smallest diff, which is why a team would reach for it first.

It loses on risk to `atk`: `atk` still ships the whole repository, so every `atk` install carries
`atkx/`, `docs/`, `plans/` and `.atk/`. The em-dash `grep`, which scans `.`, also covers `atkx/`
without anyone deciding it should.

### Option B: both kits under `plugins/` (chosen)

`plugins/atk/` and `plugins/atkx/`, each a complete plugin. The repository root holds the
marketplace files and what the repository authors about itself: `docs/`, `plans/`, `.atk/`,
`CLAUDE.md`, `README.md`.

- **AC1 to AC5**: all met; see Traceability.
- **Risk to `atk`**: an `atk` install receives `plugins/atk/` and nothing else, which is less than it
  receives today.
- **Harness certainty**: all three harnesses document this layout. Codex uses the exact
  `plugins/<name>` shape in its own guide.
- **Reversibility**: `plugins/atkx/` can later leave for a repository of its own, since nothing in it
  points outside itself.

### Option C: a repository of its own

The recommendation of the first draft. It still has the lowest cost, but it fails AC4, which the
maintainer confirmed, and the costs it avoided are the ones the maintainer accepted.

### Scores

| Criterion | A: `atkx/` here | B: `plugins/` here | C: own repository |
|-----------|-----------------|--------------------|-------------------|
| AC4 | met | met | not met |
| Risk to `atk` | ships `atkx/` and the repository's docs with every install | ships `plugins/atk/` only | none |
| Harness certainty | documented, but the root stays a plugin and a marketplace at once | documented on all three | proven by this repository |
| Reversibility | `atkx/` moves out with history | `plugins/atkx/` moves out with history | archive |

## Chosen approach: Option B

### Layout

```
.claude-plugin/marketplace.json      lists atk and atkx; the root plugin.json is deleted
.cursor-plugin/marketplace.json      new; the root plugin.json is deleted
.agents/plugins/marketplace.json     new, for Codex; .codex-plugin/ at the root is deleted
plugins/atk/
  .claude-plugin/plugin.json  .cursor-plugin/plugin.json  .codex-plugin/plugin.json
  skills/  shared/  hooks/  assets/
plugins/atkx/
  .claude-plugin/plugin.json  .cursor-plugin/plugin.json  .codex-plugin/plugin.json
  skills/
docs/  plans/  .atk/  .github/  CLAUDE.md  README.md  CHANGELOG.md  LICENSE  package.json
```

The plugin name `atk` and the marketplace name `atk` stay as they are, so the plugin id `atk@atk`
that existing users have enabled does not change. Only its `source` moves.

### No shared files (AC5)

Each plugin carries every file it reads. A rule both kits need is written in each kit, and the copy
in `atkx` names the `atk` file it came from, so a later reader can compare the two.

Claude Code would allow one more road: a symlink from `plugins/atkx/` to a file in `plugins/atk/`
is dereferenced into the cache at install. Cursor and Codex document no such behaviour, so the
kit does not use it, and a review rejects a symlink that crosses from one plugin to the other.

### The call contract from `atkx` to `atk` (AC2)

- **At install, on Claude Code.** `plugins/atkx/.claude-plugin/plugin.json` declares
  `"dependencies": ["atk"]`. Installing `atkx` then installs `atk` from the same marketplace, and
  disabling `atk` stops `atkx` loading with an error that names the dependency.
- **At run time, everywhere.** Cursor and Codex document no dependency field, so an `atkx` skill
  still checks that `atk:<skill>` is in the host's live skill list before invoking it. When it is
  not, it prints one line naming the kit and how to install it, then stops or continues without that
  step, as its own `SKILL.md` says.
- An `atkx` skill names an `atk` skill by its full name, passes only arguments listed in that skill's
  `argument-hint`, and leaves the called skill's gates to the user: its profile check, its interview,
  its approval states.

### The one-way rule (AC3)

`atk` gains `CONV-011` in the `CLAUDE.md` Review checklist: nothing under `plugins/atk/` names a
command or a skill of `atkx`. `BLOCKING`, `REVIEWED`. Its check sits beside the `CONV-004` one:

```bash
grep -rn "\batkx:" plugins/atk/
```

It should print nothing. The docs at the repository root describe the repository and may name both
kits, so the rule covers only what ships inside `atk`, which is what an `atk`-only user reads.

### Release and tags

Two release-please packages, `plugins/atk` and `plugins/atkx`, each with its own version and its own
`extra-files`. The marketplace entries carry no `version`, so each `plugin.json` is the only place a
version lives, as the Claude Code hosting guide asks.

Tags take release-please's default monorepo form, `<component>-v<version>`: `atk-v0.0.22`,
`atkx-v0.0.1`. The form Claude Code resolves a dependency range against, `atk--v0.0.22`, was
checked and rejected on 2026-10-01. release-please writes it with `"tag-separator": "--"`, but reads
a tag back through the pattern in `src/util/tag-name.ts`, whose separator is one character, so
`atk--v0.0.22` parses as component `atk-`. `src/manifest.ts` then finds no package with that
component and warns `Found release tag with component 'atk-', but not configured in manifest`,
which leaves release-please without a previous release to compare against.

The dependency therefore carries no range: `"dependencies": ["atk"]`. The Claude Code dependency
guide says a bare name follows whatever version the marketplace provides, which, with both plugins
in one marketplace, is the `atk` of the same commit.

Two things follow for this repository:

- **The first release after the move.** The existing tags, `v0.0.21` and before, carry no
  component, so the new `plugins/atk` package does not recognise them. `.release-please-manifest.json`
  is rekeyed to `"plugins/atk": "0.0.21"`, and `last-release-sha` names the commit of `v0.0.21` for
  that one release. A `release-please release-pr --dry-run` confirms it before the change merges.
- **`atk:help` signal 17** sees two tag streams here, and `.atk/profile.md` names `atk-v*` as the
  one that is `atk`'s.

### Migration

1. Move `skills/`, `shared/`, `hooks/` and `assets/` into `plugins/atk/` with `git mv`, in one
   commit, together with the three `plugin.json` files.
2. Point the Claude Code entry at `"./plugins/atk"`, add the Cursor and Codex marketplace files, and
   delete the root `plugin.json` files.
3. Rewrite the paths outside the plugins: `CLAUDE.md`, including every verification command,
   `README.md`, `docs/` and `docs/vi/`, `.github/labeler.yml`, the issue templates, `.atk/profile.md`
   and `release-please-config.json`. The Cursor and Codex install lines in `README.md` are rewritten
   to install from this repository, in the form step 4 proves works. `docs/records/` keeps its old
   paths, because a record is not edited after it is committed.
4. Install from a local clone on all three harnesses, check that the 23 skills and both hooks load,
   and update an install made from the old layout to see whether it follows the new `source`. Only
   then cut a release.
5. Add `plugins/atkx/` with no skill yet, then its acceptance bar, then its first skill, in that
   order.

### What `atkx` writes down before its first skill

In `plugins/atkx/` or in a section of the root `CLAUDE.md` of its own:

1. **Its acceptance bar**, the written form of AC1. A skill qualifies when it runs without
   `.atk/profile.md`, writes nothing into the team's repository that a teammate is asked to review,
   and states which harnesses it fully supports.
2. **Harness support per skill.** Trigger measurement needs the `PreToolUse` hook described in
   `docs/trigger-eval-measurement.md`, which Codex has not been seen to fire for a skill and Cursor
   does not have, so a skill that measures triggers says "Claude Code only" for that mode.
3. **No hooks of its own** to begin with, so a user with both kits sees the `atk` profile reminder
   once.

### Sections

| Section | Answer |
|---------|--------|
| Data model and migration | No data. The file migration is above |
| API contracts | The call contract above; no HTTP or library API |
| Error and edge cases | `atk` missing: the dependency on Claude Code, the install line elsewhere. A symlink between the plugins: rejected in review |
| Backward compatibility | The plugin id `atk@atk` stays. The source moves from `./` to `./plugins/atk`, accepted by the maintainer. Whether an update follows the new source is not documented; step 4 of Migration finds out, and if it does not, the release notes tell users to uninstall and install again, as the maintainer decided on 2026-10-01 |
| Feature flag or rollout | `N/A`: step 4 of Migration is the gate |
| Rollback | Before a release: revert the move commit. After one: move back and release again, since users follow the `source` in the marketplace file |
| Observability | `N/A` |
| Security and permission | An install no longer carries `.atk/`, `docs/` or `plans/`. An `atkx` skill runs with the user's host permissions like any skill |
| Performance | Each installed skill adds its `description` to every session's context. `atkx` is optional, so an `atk`-only user pays nothing |

## Traceability

| Criterion | Where it is met |
|-----------|-----------------|
| AC1 | The acceptance bar `atkx` writes first |
| AC2 | The call contract: `dependencies` on Claude Code, the run-time check everywhere |
| AC3 | `CONV-011` and its `grep` |
| AC4 | The layout |
| AC5 | No shared files, and no symlink between the plugins |

## Decision needed

| Question | Who answers |
|----------|-------------|
| Is `atk` listed in OpenAI's plugin directory, which `README.md` points Codex users at? If it is, does the listing follow the new `.agents/plugins/marketplace.json`. Unknown on 2026-10-01; step 4 of Migration installs from the repository with `codex plugin marketplace add`, which works either way | Lam Ngoc Khuong, PM |

## Reviewers

- Tech Lead: Lam Ngoc Khuong, approver. `.atk/profile.md` lists no BrSE or SRE for this repository,
  so no other signature is required.

ADR: `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`.
