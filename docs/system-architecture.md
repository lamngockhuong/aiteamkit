# System Architecture

## Shape

`atk` is content plus manifests. There is no build step, no bundler, and no runtime: the harness
reads Markdown and JSON directly from the repository tree.

```
aiteamkit/
  .claude-plugin/     plugin.json + marketplace.json     Claude Code
  .cursor-plugin/     plugin.json                        Cursor
  .codex-plugin/      plugin.json (+ interface block)    OpenAI Codex CLI
  skills/<name>/SKILL.md        12 skills, one folder each
  shared/*.md                   DRY layer shared by all 12 skills
  assets/*.svg                  icon and logo for marketplace listings
  docs/, docs/vi/               bilingual project documentation
```

## One content tree, three manifests

The three manifest folders describe the same `skills/` directory to three harnesses. Skill content
is never duplicated per harness. The manifests differ only in how they declare content:

| Manifest | How skills are declared | Harness-specific extra |
|----------|-------------------------|------------------------|
| `.claude-plugin/plugin.json` | omitted; Claude Code auto-discovers `skills/` | `marketplace.json` beside it |
| `.cursor-plugin/plugin.json` | `"skills": "./skills/"` | `displayName` |
| `.codex-plugin/plugin.json` | `"skills": "./skills/"` | `interface{}` with `defaultPrompt`, icons, `brandColor` |

There is no `commands/` layer. A skill is its own slash command, named from its folder, namespaced
`atk:` by the harness at load time from `plugin.json`.

## Load model

A harness loads only the frontmatter of every `SKILL.md` at startup. That frontmatter, mainly the
`description` field with its trigger phrases, is what the router matches a user request against. The
body of a `SKILL.md` is read only after the skill is selected.

This produces the size discipline in the kit:

| Layer | When it loads | Budget |
|-------|---------------|--------|
| `description` frontmatter | Always, for all 12 skills | A few lines; triggers belong here and nowhere else |
| `SKILL.md` body | On invocation | Under 300 lines |
| `references/*.md` | Only when a workflow step opens it | Unbounded, kept out of the default path |
| `shared/*.md` | Only when a skill cites it | Small, since several skills may open it |

## The `shared/` layer

Four files hold what skills would otherwise repeat. The first three are cited by all 12:

- `shared/team-roles.md`: the role table and the six rules every skill follows.
- `shared/artifact-paths.md`: the default output path per skill, naming rules, and front matter.
- `shared/ticket-adapters.md`: tracker detection and the vocabulary map.

The fourth is a contract between two skills rather than a kit-wide rule:

- `shared/review-checklist.md`: the rule record format that `atk:convention` writes and `atk:review`
  cites by ID, plus the baseline items that hold in any project. It exists so a convention is
  written once and checked in the same words, instead of being restated in both skills and drifting.

`shared/` sits at the repository root rather than under `skills/`, because a folder inside `skills/`
without a `SKILL.md` is ambiguous to skill discovery. Skills cite the files as `shared/<file>.md`,
which resolves to `../../shared/<file>.md` from a skill file; both spellings appear in each shared
file's header.

## Skill anatomy

Every `SKILL.md` follows the same section order, which is also the reading order an agent needs:

```
frontmatter        name, description with triggers, argument-hint
title + intro      what this produces and the one habit that makes it work
## Scope           handles / does NOT handle, naming the skill that takes over
## Roles           who authors, who approves, who is consulted
## Invocation      the flags, one line of comment each
## Workflow        ASCII pipeline, then one numbered section per stage
## Output          artifact path and section list
## Ticket          how it reaches the team's tracker
## Definition of done   a checklist the skill must satisfy before reporting success
```

## Data flow at runtime

```
user request
   -> harness matches description triggers
   -> SKILL.md body loads
   -> skill reads project evidence (code, git, CI, tracker) and shared/ references
   -> skill interviews only for what evidence cannot answer
   -> Markdown artifact written into the target project under docs/
   -> optional pointer pushed to the tracker, after the user approves the list
```

Artifacts are written into the **target project**, never into the atk kit itself.

## Versioning

One version spans six files, five of them driven by `release-please-config.json` `extra-files`, with
`.release-please-manifest.json` owned natively by release-please. The release workflow runs on push
to `main`. Details in `CLAUDE.md`.
