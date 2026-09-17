# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`atk` (AI Team Kit) is a multi-harness AI plugin distributable across Claude Code, Cursor, and
OpenAI Codex CLI. It packages 12 skills covering the delivery lifecycle of a company project team
(`intake`, `estimate`, `design-doc`, `breakdown`, `convention`, `review`, `qa`, `release`,
`incident`, `retro`, `onboard`, `handover`), each invocable as a slash command by its own name
(`/atk:intake`, `/atk:estimate`, and so on).

This is content plus manifests, not a runtime application: there is no build step, no bundler, no
test suite, and `package.json` is `private: true` with no `scripts` block. "Validation" means JSON
parses, YAML frontmatter parses, `docs/` and `docs/vi/` stay mirrored, and the cross-file lists stay
in sync. See "Common verification commands" at the bottom.

## The team premise (why this kit exists)

Every skill assumes a team, not a solo developer. This is the one thing to preserve when editing:

- Author and approver are different people, and artifacts carry an approval state.
- A skill drafts and gathers evidence; it never makes a decision that a role owns (scope, priority,
  deadline, pricing, compliance, go or no-go).
- Artifacts are written for a reader who was not in the conversation.
- Open questions carry the name of the person who must answer them, never "the team".

A change that makes a skill act like a solo assistant, deciding on the team's behalf or leaving an
artifact with no owner, is a regression even if it reads more helpfully.

## Multi-manifest layout (non-obvious)

Three sibling manifest folders point to the SAME content at repo root:

```
.claude-plugin/     plugin.json + marketplace.json
.cursor-plugin/     plugin.json
.codex-plugin/      plugin.json (with `interface{}` block for marketplace listing)
skills/, shared/, assets/    shared content, NOT duplicated per harness
```

Edit `skills/<name>/SKILL.md` ONCE; all three manifests pick it up. Do not create per-harness copies.

| Manifest | `skills` key | Extra |
|----------|--------------|-------|
| `.claude-plugin/plugin.json` | absent (Claude auto-discovers `skills/`) | paired with `marketplace.json` |
| `.cursor-plugin/plugin.json` | `"./skills/"` | `displayName` |
| `.codex-plugin/plugin.json` | `"./skills/"` | `interface{}` block with `defaultPrompt`, icons, `brandColor` |

There is no `commands/` directory and no `commands` key in any manifest. A skill is its own slash
command: `skills/qa/SKILL.md` is what `/atk:qa` invokes, on all three harnesses. Do not add a
`commands/<name>.md` wrapper beside a same-named skill. Claude Code counts `commands/` entries and
`SKILL.md` skills in one inventory, so a wrapper registers the name a second time and every entry
shows up duplicated in the `/` menu, at a real always-on token cost for no behavior.

## Skill folder layout

```
skills/<name>/
  SKILL.md                    required; frontmatter + workflow, kept under 300 lines
  references/*.md             optional, lazily loaded detail (templates, checklists, schemas)
  evals/trigger_evals.json    optional; array of {query, should_trigger} for description testing
```

The twelve original skills are still skeletons: `SKILL.md` only, around 95 to 105 lines each, with no
`references/` or `evals/`. The six added since (`init`, `catchup`, `plan`, `implement`, `fix`,
`verify`) carry both. Deepening a skill means adding `references/` files and pointing at them from
the relevant workflow step, not growing `SKILL.md` past 300 lines.

Every `SKILL.md` follows the same section order, and a new skill must match it:
frontmatter, title, intro paragraph, `## Scope` (handles / does NOT handle), `## Roles`,
`## Invocation`, `## Workflow` (ASCII pipeline then numbered steps), `## Output`, `## Ticket`,
`## Definition of done`.

One skill carries an extra section: `verify` adds `## Process management` between `## Workflow` and
`## Output`. It is the only skill that starts long-running processes, and the rules for not leaving
them behind are binding policy that two separate workflow steps defer to, so burying them inside one
step would hide a rule the other step also has to obey. That is the bar for an extra section: a rule
the workflow points at from more than one place, in a skill that does something no other skill does.
Anything narrower goes inside the step it belongs to.

## `shared/` is the DRY layer (repo-root, outside `skills/`)

Seven files hold what skills would otherwise repeat. They sit at the repo root, NOT under
`skills/`, because a folder under `skills/` without a `SKILL.md` is ambiguous to the harnesses'
skill discovery.

| File | Owns | Cited by |
|------|------|----------|
| `shared/team-roles.md` | The role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the six rules every skill follows | all |
| `shared/artifact-paths.md` | Default output path per skill, `YYMMDD` naming, and the shared YAML front matter block | all |
| `shared/ticket-adapters.md` | Tracker detection order and the GitHub / Jira / Backlog / Redmine vocabulary map | all |
| `shared/review-checklist.md` | The rule record format shared by `convention` (writes) and `review` (enforces), plus the baseline items that hold in any project | `convention`, `review`, `implement` |
| `shared/project-profile.md` | What `.atk/profile.md` in the target project contains, and which skills stop, degrade, or ignore it when that file is missing | the skills that need project facts |
| `shared/finalize-steps.md` | The closing sequence for a code change: branch, commit, and the consent line every action past the commit has to cross | `fix`, `implement`, `verify` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not | `fix`, `implement`, `verify` |

Skills cite them as `shared/<file>.md`, which is `../../shared/<file>.md` relative to a `SKILL.md`.
Both spellings appear in each shared file's header so an agent can resolve the path either way.

The first three are cited by every skill. The rule record format in `review-checklist.md` is a
contract between exactly two: `convention` writes the rule rows and `review` cites their IDs.
`implement` reads the same file for one thing only, the baseline items, which it falls back to when
the project has recorded no conventions of its own. `finalize-steps.md` is cited by the three skills
that change code, and holds the rule that nothing leaves the local repository without being asked
for. `verify` is one of them because the fixes it makes between retry rounds are code like any other.

`layer-verification.md` is a contract between the same three: each runs a check and then has to say
what the result means, and the answer to that second half has to be the same in all three. Each keeps
its own half beside its own workflow, which is why `skills/fix/references/layer-playbooks.md` still
holds where a cause hides, `skills/implement/references/verification.md` still holds the order to run
things in, and `skills/verify/references/runtime-checks.md` still holds how to assert against a
running system.

`project-profile.md` is the odd one: it describes `.atk/profile.md`, a file that lives in the target
project rather than in the kit. Cite it from any skill that needs build commands, layer layout, or
where the spec lives, and follow its three-group rule for what to do when that file is missing.

When adding a rule that two or more skills need, put it in `shared/` and reference it. Do not paste
it into each `SKILL.md`.

## The kit stands alone

A skill may say that something is outside the kit's scope. It must NOT name a command from another
kit as the thing that handles it. A team that installed only `atk` would hit a dead end, and the
dead end would be invisible until they followed the pointer.

Say "which the author does" or "outside this kit", or name an `atk:` skill. Never `ak:cook`,
`/simplify`, or any other foreign command.

After edits, verify:

```bash
grep -rn "\bak:" skills/ shared/ README.md docs/
```

Should print nothing (`grep` exits 1).

## `.atk/` in the target project

Skills that need project facts (build commands, layer layout, where the spec lives) read
`.atk/profile.md` from the root of the **target project**, never from the kit. `atk:init` creates
it; `shared/project-profile.md` defines what it holds and what each skill does when it is missing.

The kit ships no profile, and no skill writes project facts into the kit itself.

## Adding or changing a skill touches several files

Nothing generates these, so they drift silently. When adding, renaming, or removing a **skill**:

1. `skills/<name>/SKILL.md`
2. `README.md` (the skills table AND the invocation block)
3. `docs/skills-overview.md` and `docs/vi/skills-overview.md`
4. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`
5. `shared/artifact-paths.md` (the default output path row)
6. `.github/ISSUE_TEMPLATE/bug-report.yml` (the component dropdown)
7. All three manifest descriptions, if the count of 12 changes

When changing only a **flag**, update: the `## Invocation` block in `SKILL.md`, the `argument-hint`
frontmatter, the `README.md` invocation block, and both `skills-overview.md` files.

`SKILL.md` is the single implementation. Its `description:` is what the harness matches on and what
the `/` menu shows, so a trigger phrase belongs there and nowhere else.

## SKILL.md `name` field convention (catches lint)

Each `skills/<folder>/SKILL.md` frontmatter `name:` MUST be:

- Lowercase letters, numbers, hyphens only (NO colons)
- Match the folder name exactly

Example: `skills/design-doc/SKILL.md` -> `name: design-doc` (NOT `atk:design-doc`).

The `atk:` namespace is added automatically by the harness from `plugin.json`. The fully-qualified
invocation identifier is `atk:design-doc`, but it is constructed at load time, not stored in the
skill file.

## Trigger phrases are multilingual on purpose

Every `description:` lists triggers in English, Vietnamese, and Japanese, because the target teams
work across those languages. When editing a description, keep all three; dropping the Vietnamese or
Japanese triggers silently breaks invocation for part of the audience.

## Em-dash policy

Do NOT use em-dashes (`—`, U+2014) anywhere in user-authored content (READMEs, manifests, skill
prose, shared references, docs). Use hyphen `-`, comma, semicolon, or colon based on context.

After edits, verify. The two exclusions are both files that quote the character in order to document
this very check: this section, and the verification list inside `.atk/profile.md`.

```bash
grep -rn "—" . --exclude-dir=.git --exclude-dir=.atk --exclude=CLAUDE.md | grep -v -E '(plans|docs)/'
```

Should print nothing (`grep` exits 1).

## Docs are bilingual

`docs/` is the English source of truth; `docs/vi/` mirrors it file-for-file with the same filenames.
Every `docs/*.md` must have a `docs/vi/*.md` counterpart; adding or renaming one means doing the
same on the other side.

| File | Purpose |
|------|---------|
| `skills-overview.md` | Reader-facing explanation of every skill: what it produces, when to use, when not to |
| `project-overview-pdr.md` | What atk is, goals, non-goals |
| `system-architecture.md` | Multi-harness layout, the `shared/` layer, and the load model |
| `codebase-summary.md` | File-by-file reference of every tracked file (goes stale on any file add or remove) |
| `project-roadmap.md` | Phase plan and status |

## Release flow (release-please, pre-1.0 mode)

Versions are bumped automatically by release-please on push to `main`. Five files share the version,
all driven by `release-please-config.json` `extra-files`:

| File | jsonpath |
|------|----------|
| `package.json` | `$.version` |
| `.claude-plugin/plugin.json` | `$.version` |
| `.claude-plugin/marketplace.json` | `$.plugins[0].version` |
| `.cursor-plugin/plugin.json` | `$.version` |
| `.codex-plugin/plugin.json` | `$.version` |

A sixth file, `.release-please-manifest.json`, also holds the version but is NOT an `extra-file`:
release-please owns it natively as its state file. Never hand-edit it.

Pre-1.0 config keeps experimental versioning:

- `bump-patch-for-minor-pre-major: true` means `feat:` commits bump patch (0.0.x).
- `bump-minor-pre-major: true` means `feat!:` and breaking-change commits bump minor (0.x.0).

To force a specific version, append a `Release-As: X.Y.Z` footer to a commit. To graduate to 1.0 and
above, drop the two `bump-*-pre-major` flags.

## Commits

- Conventional Commits required (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, `refactor:`, `style:`,
  `test:`). Type drives release-please's CHANGELOG grouping and version logic.
- `feat:` and `fix:` appear in CHANGELOG; the others are silent by default.

## Common verification commands

```bash
# All 5 manifests parse
for f in package.json .claude-plugin/plugin.json .claude-plugin/marketplace.json \
         .cursor-plugin/plugin.json .codex-plugin/plugin.json; do
  python3 -c "import json,sys; json.load(open('$f'))" && echo "OK $f"
done

# Every skill folder has a SKILL.md, and the name matches the folder
for d in skills/*/; do
  n=$(basename "$d")
  grep -q "^name: $n$" "$d/SKILL.md" && echo "OK $n" || echo "MISMATCH $n"
done

# docs/ and docs/vi/ are mirrored
diff <(ls docs/*.md | xargs -n1 basename) <(ls docs/vi/*.md | xargs -n1 basename)

# Version agreement across the 6 version-bearing files
grep -h '"version"' package.json .claude-plugin/plugin.json .cursor-plugin/plugin.json \
     .codex-plugin/plugin.json; grep -h '"version"' .claude-plugin/marketplace.json; \
     cat .release-please-manifest.json
```
