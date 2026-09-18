# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`atk` (AI Team Kit) is a multi-harness AI plugin distributable across Claude Code, Cursor, and
OpenAI Codex CLI. It packages 20 skills covering the delivery lifecycle of a company project team
(`init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `breakdown`, `convention`, `plan`,
`implement`, `fix`, `review`, `qa`, `verify`, `release`, `incident`, `retro`, `onboard`,
`handover`), each invocable as a slash command by its own name (`/atk:intake`, `/atk:estimate`, and
so on). That is the lifecycle order; use it for every list of skills in the repository.

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
  evals/trigger_evals.json    one per skill; array of {query, should_trigger} for description testing
```

Every skill carries `evals/trigger_evals.json`, so a description edit can be tested against the
neighbours it must not steal. `references/` is where they still differ: the eight added after the
first twelve (`init`, `tailor`, `catchup`, `plan`, `implement`, `fix`, `verify`, `spec`) carry one,
`review` grew one for parallel review, and the other eleven are still `SKILL.md` alone. Deepening a
skill means adding `references/` files and pointing at them from the relevant workflow step, not
growing `SKILL.md` past 300 lines.

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

Twelve files hold what skills would otherwise repeat. They sit at the repo root, NOT under
`skills/`, because a folder under `skills/` without a `SKILL.md` is ambiguous to the harnesses'
skill discovery.

| File | Owns | Cited by |
|------|------|----------|
| `shared/team-roles.md` | The role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the seven rules every skill follows | all |
| `shared/artifact-paths.md` | Default output path per skill, `YYMMDD` naming, the shared YAML front matter block, and the three persistence groups that decide whether an artifact is updated in place, left alone, or safe to delete | all |
| `shared/ticket-adapters.md` | Tracker detection order and the GitHub / Jira / Backlog / Redmine vocabulary map | all |
| `shared/review-checklist.md` | Where a project keeps its conventions and the order that resolves it, the rule record format shared by `convention` (writes) and `review` (enforces), the rule that a project's own shape wins, plus the baseline items that hold in any project | `convention`, `review`, `implement` |
| `shared/project-profile.md` | What `.atk/profile.md` in the target project contains, and which skills stop, degrade, or ignore it when that file is missing | the skills that need project facts |
| `shared/project-overrides.md` | What `.atk/overrides/<skill>.md` in the target project contains, the two sections it may hold, and the seven things an override may never remove | all, through rule 7 of `shared/team-roles.md` |
| `shared/finalize-steps.md` | The closing sequence for a code change: the reference documents it owes, branch, commit, and the consent line every action past the commit has to cross | `fix`, `implement`, `verify`, `tailor` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not | `fix`, `implement`, `verify` |
| `shared/diagram-conventions.md` | When a diagram earns its place, the four shapes the kit draws, and the rules that keep them readable | `catchup`, `design-doc`, `plan`, `breakdown`, `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use, how to name one, what to do when the harness lacks it, and the rules for the tidy step and for parallel reviewers | `fix`, `implement`, `verify`, `review` |
| `shared/spec-docs.md` | What separates a reference document from a design document, the rule that a project's own shape wins, the obligation to carry a reference document with a contract change, and the line between drift and an unanswered question | `spec`, `design-doc`, `implement`, `fix`, `verify`, `review` |
| `shared/tidy-pass.md` | What tidying a change looks for: the three lenses, what may be changed, and what is never touched, so the step lands the same way on a harness that ships a clean-up capability and one that does not | `fix`, `implement`, `verify`, through `host-capabilities.md` |

Skills cite them as `shared/<file>.md`, which is `../../shared/<file>.md` relative to a `SKILL.md`.
Both spellings appear in each shared file's header so an agent can resolve the path either way.

The first three are cited by every skill. The rule record format in `review-checklist.md` is a
contract between exactly two: `convention` writes the rule rows and `review` cites their IDs. All
three readers need the resolution that opens the same file, because `docs/conventions.md` is a
default and not an address: a team that already keeps a standards directory keeps its rules there,
and a skill that reads the default instead would report a project with thirty standards documents as
having recorded no conventions. `implement` reads the file for that and for the baseline items,
which it falls back to when the project really has recorded none. `finalize-steps.md` is cited by the three skills
that change code, and holds the rule that nothing leaves the local repository without being asked
for. `verify` is one of them because the fixes it makes between retry rounds are code like any other.
`tailor` is the one citer that changes no code: it cites the consent line alone, because a
`--feedback` record is sent to a repository the team does not own.

`layer-verification.md` is a contract between the same three: each runs a check and then has to say
what the result means, and the answer to that second half has to be the same in all three. Each keeps
its own half beside its own workflow, which is why `skills/fix/references/layer-playbooks.md` still
holds where a cause hides, `skills/implement/references/verification.md` still holds the order to run
things in, and `skills/verify/references/runtime-checks.md` still holds how to assert against a
running system.

`host-capabilities.md` decides a boundary rather than a format: a capability the harness itself ships
may be used and named, a command from another kit may not. It also carries the degradation rule,
since a skill that leans on a host capability must still work on the harness that has none.
`tidy-pass.md` is what that rule degrades into, and the reason the kit does not ship a `simplify`
skill of its own: the content belongs to three skills that already run it, not to one more slash
command with no artifact and no approver. `spec` clears that bar and `simplify` does not, which is
the test, not the count.

`spec-docs.md` is a contract of the same kind and the widest of them: `atk:spec` writes the
reference documents, and five other skills have to leave them true. It holds the tense distinction
because both `spec` and `design-doc` need it stated identically, and it holds the sync obligation
because `shared/finalize-steps.md` now opens with it, which makes every code-changing skill a party
to the rule. The drift-versus-open-question line lives there for the same reason as the rule record
format in `review-checklist.md`: two skills have to answer it the same way, so neither of them owns
it.

`project-profile.md` is the odd one: it describes `.atk/profile.md`, a file that lives in the target
project rather than in the kit. Cite it from any skill that needs build commands, layer layout, or
where the incoming specification lives, and follow its three-group rule for what to do when that file
is missing.

When adding a rule that two or more skills need, put it in `shared/` and reference it. Do not paste
it into each `SKILL.md`.

## The kit stands alone, but it may use the harness it runs on

A skill may say that something is outside the kit's scope. It must NOT name a command from another
kit as the thing that handles it. A team that installed only `atk` would hit a dead end, and the
dead end would be invisible until they followed the pointer.

Say "which the author does" or "outside this kit", or name an `atk:` skill. Never `ak:cook` or any
other kit's command.

A capability the host agent itself ships is different, and is allowed: it arrived with the harness,
so every team on that harness has it. `atk:implement`, `atk:fix` and `atk:verify` use the host's
code clean-up capability, `/simplify` in Claude Code, and `atk:review` uses the host's parallel
agents. `shared/host-capabilities.md` owns the rules: name the capability before its local name,
resolve that name from the harness at the time of use, and degrade into doing the work by hand,
recorded as such, on a harness that has none. No skill stops because a host capability is missing.

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

## `hooks/` never holds a rule, and is never the only road to a behavior

Two hooks, and both boundaries have to hold or the kit stops being the same kit on three harnesses.

`SessionStart` runs `hooks/check-profile.mjs`, which prints one line when a git repository has no
`.atk/profile.md`. It must stay answerable in one sentence: "does this project have a profile yet".
The moment it answers a second question, the precondition rule exists in two places, and the copy in
`shared/project-profile.md` is the one that is correct. That rule is not uniform anyway: ten skills
need no profile at all, so a hook that blocked would stop `atk:intake` from turning a chat message
into requirements.

`PreToolUse` with matcher `Skill` runs `hooks/load-overrides.mjs`, which puts
`.atk/overrides/<skill>.md` in front of the skill that owns it. It decides nothing and skips nothing;
what it saves is one file read. Every skill names its own override file at the top of its
`## Workflow` and opens it when no hook put it there, which is what happens on Cursor and Codex and
on Claude Code with the hook turned off. The test that keeps this honest: run a skill against a
project that has an override for it twice, once with the `PreToolUse` entry in `hooks/hooks.json`
and once with it removed, and compare the two results. A difference means a behavior has moved into
the hook and two harnesses have silently lost it.

That is the bar for a third hook: it saves work a skill could do itself, and the kit behaves the
same when it is missing.

Claude Code's contract makes the boundary hold by construction: `SessionStart` cannot block, exit
code 2 included. The script exits 0 on every path regardless, prints nothing when it has nothing to
say, and writes its "already reminded" marker to `${CLAUDE_PLUGIN_DATA}` or the user's state
directory, never into the user's repository.

**Keep both hooks in exec form, and keep them Node.** The entry is `"command": "node"` with
`${CLAUDE_PLUGIN_ROOT}` inside `args`. Rewriting it as a shell script, or moving it to shell form,
breaks Windows. `docs/system-architecture.md` holds the reasoning under "Why the hook is Node and
not a shell script"; read it before changing the shape, and keep the exec-form check in the
verification block below passing.

One accepted limit, recorded in the same section: there is no Codex or Cursor wrapper yet, because
neither event contract could be tested here. That costs a reminder, not a safeguard.

## Adding or changing a skill touches several files

Nothing generates these, so they drift silently. When adding, renaming, or removing a **skill**:

1. `skills/<name>/SKILL.md`
2. `README.md` (the skills table AND the invocation block)
3. `docs/skills-overview.md` and `docs/vi/skills-overview.md`
4. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`
5. `shared/artifact-paths.md` (the default output path row)
6. `.github/ISSUE_TEMPLATE/bug-report.yml` (the component dropdown)
7. All three manifest descriptions plus `marketplace.json` and `package.json`, if the count of 20
   changes. The Codex manifest carries a second copy inside `interface.longDescription`
8. `docs/system-architecture.md` and `docs/vi/system-architecture.md`, if the skill changes what the
   `shared/` layer or the profile is for
9. `docs/flow/project-flow.md`, `docs/flow/skill-chain.md` and `docs/flow/skill-lifecycle.md`, plus
   all three `docs/vi/flow/` mirrors.
   Each names all 20 skills: the phase table and the consumes/produces table respectively

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

## Diagrams are Mermaid, except where they are not

Every flow, graph, and diagram in a doc, in the README, or in an artifact a skill produces is a
fenced `mermaid` block. The drawing rules are in `shared/diagram-conventions.md`, which is also what
the five diagram-producing skills cite; do not restate them here or in a `SKILL.md`.

Two places keep plain ASCII on purpose:

- **The `## Workflow` pipeline in every `SKILL.md`.** An agent reads a skill body in a terminal,
  where Mermaid does not render, so a diagram there costs tokens on every invocation and shows the
  reader nothing. The one-line ASCII pipeline is the contract; `docs/system-architecture.md` records
  it under "Skill anatomy".
- **Directory trees.** Mermaid has no tree shape worth the trouble, and an indented listing is
  already the form every reader knows.

After edits, verify. The one exclusion is the file that quotes the banned pattern in order to
document it:

```bash
grep -rn "style .* fill:#" skills/ shared/ docs/ README.md \
  | grep -v shared/diagram-conventions.md
```

Should print nothing: a hardcoded fill is black text on a pale background for every reader in a dark
theme, which is most of them on a tracker.

## Docs are bilingual

`docs/` is the English source of truth; `docs/vi/` mirrors it file-for-file with the same filenames,
subdirectories included. Every `docs/**/*.md` must have a `docs/vi/**/*.md` counterpart at the same
relative path; adding or renaming one means doing the same on the other side.

| File | Purpose |
|------|---------|
| `skills-overview.md` | Reader-facing explanation of every skill: what it produces, when to use, when not to |
| `artifact-lifecycle.md` | Which artifacts to commit, which may be deleted, and what each deletion costs |
| `project-overview-pdr.md` | What atk is, goals, non-goals |
| `system-architecture.md` | Multi-harness layout, the `shared/` layer, and the load model |
| `codebase-summary.md` | File-by-file reference of every tracked file (goes stale on any file add or remove) |
| `project-roadmap.md` | Phase plan and status |
| `flow/project-flow.md` | The 20 skills placed in delivery phases, with the author and approver of each artifact |
| `flow/skill-chain.md` | What each skill consumes and produces, and where a chain breaks |
| `flow/skill-lifecycle.md` | The anatomy of a skill, the shape of a run, and the five kinds of edge between one skill and another |

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

## Review checklist

This is the section `atk:review` reads and cites by ID, in the record format from
`shared/review-checklist.md`. It holds `REVIEWED` rules only: rules a person checks, because this
repository has no CI that runs anything. `.github/workflows/` carries release-please and nothing
else, so no rule here is `ENFORCED` and none is enforced by a tool failing a build.

Every rule below is already stated in prose somewhere above; this table is the checkable form of it,
not a second set of rules. The `source` column says where the prose lives.

| id | rule | bucket | tool | severity | source |
|----|------|--------|------|----------|--------|
| `CONV-001` | Adding, renaming, or removing a skill touches all nine groups of file listed for it | `REVIEWED` | none | `BLOCKING` | "Adding or changing a skill touches several files" |
| `CONV-002` | Every `docs/**/*.md` has a `docs/vi/**/*.md` counterpart at the same relative path, with the same content | `REVIEWED` | the `diff` of the two `find` listings below | `BLOCKING` | "Docs are bilingual" |
| `CONV-003` | No em-dash in user-authored content | `REVIEWED` | the `grep` below | `SHOULD FIX` | "Em-dash policy" |
| `CONV-004` | No skill, shared file, README, or doc names a command belonging to another kit | `REVIEWED` | the `grep` below | `BLOCKING` | "The kit stands alone" |
| `CONV-005` | Each `SKILL.md` frontmatter `name:` is lowercase, hyphen-only, and matches its folder | `REVIEWED` | the `for` loop below | `BLOCKING` | "SKILL.md `name` field convention" |
| `CONV-006` | A `SKILL.md` stays under 300 lines, keeps the fixed section order, and lists triggers in English, Vietnamese, and Japanese | `REVIEWED` | `wc -l` for the length; the rest by reading | `BLOCKING` | "Skill folder layout", "Trigger phrases are multilingual on purpose" |
| `CONV-007` | A diagram is Mermaid, except the `## Workflow` pipeline and directory trees, and carries no hardcoded fill colour | `REVIEWED` | the `grep` below | `SHOULD FIX` | "Diagrams are Mermaid, except where they are not" |
| `CONV-008` | The five manifests and every `evals/*.json` parse, and the six version-bearing files agree | `REVIEWED` | the loops below | `BLOCKING` | "Release flow", "Common verification commands" |
| `CONV-009` | Both hooks stay in exec form with `"command": "node"`, and stay Node | `REVIEWED` | the exec-form check below | `BLOCKING` | "`hooks/` never holds a rule" |

Numbers are sequential and never reused. A rule that stops applying is struck through rather than
deleted, so a review that cited it stays readable.

Two things worth automating, proposed and not installed. A CI job running the block below would move
most of this table to `ENFORCED` and stop a reviewer spending attention on it. `CONV-001` is the one
that would need writing rather than wiring: a check that a diff touching `skills/` also touches the
nine groups. Neither is done here, and both belong to whoever owns the repository's tooling.

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
diff <(cd docs && find . -name '*.md' -not -path './vi/*' | sort) \
     <(cd docs/vi && find . -name '*.md' | sort)

# Both hooks parse and are valid Node; check-profile stays silent where a profile exists
python3 -c "import json; json.load(open('hooks/hooks.json'))" && echo "OK hooks.json"
node --check hooks/check-profile.mjs && node --check hooks/load-overrides.mjs && echo "OK node"
out=$(CLAUDE_PROJECT_DIR="$PWD" CLAUDE_PLUGIN_DATA=$(mktemp -d) node hooks/check-profile.mjs)
test -z "$out" && echo "OK silent with profile"   # fresh marker dir, so silence means the profile

# load-overrides answers only for atk: skills, and cannot read outside .atk/overrides/.
# The ak:review and bare-review cases matter: atk's skill names are ordinary words, so a
# hook that ignored the namespace would hand this project's overrides to another kit.
for payload in '{"tool_name":"Bash","tool_input":{}}' \
               '{"tool_name":"Skill","tool_input":{"skill":"atk:no-such-skill"}}' \
               '{"tool_name":"Skill","tool_input":{"skill":"atk:../../../etc/passwd"}}' \
               '{"tool_name":"Skill","tool_input":{"skill":"ak:review"}}' \
               '{"tool_name":"Skill","tool_input":{"skill":"review"}}' \
               'not json'; do
  out=$(echo "$payload" | CLAUDE_PROJECT_DIR="$PWD" node hooks/load-overrides.mjs)
  test "$out" = "{}" || echo "LEAK on: $payload"
done; echo "OK load-overrides quiet"

# Every hook is registered in exec form; shell form would break bare Windows
python3 -c "
import json
for event in json.load(open('hooks/hooks.json'))['hooks'].values():
    for group in event:
        for h in group['hooks']:
            assert h['command']=='node' and 'args' in h, 'hook must stay in exec form'
print('OK exec form')"

# Trigger evals parse. This checks the files, not the triggering: a generic eval harness reports a
# vacuous score against an installed plugin. To actually measure one, follow
# docs/trigger-eval-measurement.md
for f in skills/*/evals/trigger_evals.json; do
  python3 -c "import json,sys; d=json.load(open('$f')); assert isinstance(d,list) and d" || echo "FAIL $f"
done; echo "OK evals"

# Version agreement across the 6 version-bearing files
grep -h '"version"' package.json .claude-plugin/plugin.json .cursor-plugin/plugin.json \
     .codex-plugin/plugin.json; grep -h '"version"' .claude-plugin/marketplace.json; \
     cat .release-please-manifest.json
```
