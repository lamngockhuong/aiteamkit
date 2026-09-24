# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`atk` (AI Team Kit) is a multi-harness AI plugin distributable across Claude Code, Cursor, and
OpenAI Codex CLI. It packages 22 skills covering the delivery lifecycle of a company project team
(`help`, `init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `breakdown`,
`convention`, `plan`, `implement`, `fix`, `review`, `qa`, `verify`, `git`, `release`, `incident`,
`retro`, `onboard`, `handover`), each invocable as a slash command by its own name
(`/atk:intake`, `/atk:estimate`, and so on). That is the lifecycle order; use it for every list of skills in the repository.

This is content plus manifests, not a runtime application: there is no build step, no bundler, no
test suite, and `package.json` is `private: true` with no `scripts` block. "Validation" means JSON
parses, YAML frontmatter parses, `docs/` and `docs/vi/` stay mirrored, and the cross-file lists stay
in sync. See "Common verification commands" at the bottom.

## The team premise (why this kit exists)

Every skill assumes work done the way a team does it. This is the one thing to preserve when editing:

- Author and approver are different roles, and artifacts carry an approval state. One person may hold
  both, and on a solo project all of them; what never happens is a skill entering the state itself.
- A skill drafts and gathers evidence; it never makes a decision that a role owns (scope, priority,
  deadline, pricing, compliance, go or no-go).
- Artifacts are written for a reader who was not in the conversation.
- Open questions carry the name of the person who must answer them, never "the team".

A change that makes a skill act like a solo assistant, deciding on the team's behalf or leaving an
artifact with no owner, is a regression even if it reads more helpfully. Supporting a solo developer
is a different thing and is in scope: one person holding every role still gets the gates, and still
approves by hand. `shared/team-roles.md` owns that distinction.

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
| `.codex-plugin/plugin.json` | `"./skills/"` | `interface{}` block with `defaultPrompt`, icons, `brandColor`; `hooks` pointing at `./hooks/codex-hooks.json` |

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
  references/*.tsv            optional, a list a reference file governs, one record per line
  evals/trigger_evals.json    one per skill; array of {query, should_trigger} for description testing
```

Every skill carries `evals/trigger_evals.json`, so a description edit can be tested against the
neighbours it must not steal. `references/` is where they still differ: fourteen of them carry
one (`help`, `init`, `tailor`, `intake`, `catchup`, `plan`, `implement`, `fix`, `verify`, `spec`,
`review`, `git`, `convention`, `onboard`), and the other eight are still `SKILL.md` alone. `git` holds the
most, six, because the closing sequence has more cases than its workflow line names. Deepening a
skill means adding `references/` files and pointing at them from the relevant workflow step, not
growing `SKILL.md` past 300 lines.

A reference is Markdown, with one exception: a list that grows one record at a time, whose fields a
check can count. `convention` keeps its standard sources in `references/standard-sources.tsv` for
that reason, and `references/standard-sources.md` beside it says what each field means and what a
run may do with a line. The rules stay in Markdown; only the records move. Tabs rather than commas,
because a free-text field routinely holds a comma and a quote forgotten by hand shifts every field
after it.

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

Fourteen files hold what skills would otherwise repeat. They sit at the repo root, NOT under
`skills/`, because a folder under `skills/` without a `SKILL.md` is ambiguous to the harnesses'
skill discovery.

| File | Owns | Cited by |
|------|------|----------|
| `shared/team-roles.md` | The role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the eight rules every skill follows | all |
| `shared/artifact-paths.md` | Default output path per skill, how a docs root partitioned by language moves that path, which repository an artifact lands in when the project spans several, `YYMMDD` naming, the shared YAML front matter block, and the three persistence groups that decide whether an artifact is updated in place, left alone, or safe to delete | all |
| `shared/ticket-adapters.md` | Tracker detection order, the three outcomes it can reach including a tracker that is configured and answers nothing, the GitHub / Jira / Backlog / Redmine vocabulary map, which of those trackers stores a sprint's start and end, and the sprint metrics no tracker without field history can produce, each with the substitute to use instead | all |
| `shared/review-checklist.md` | Where a project keeps its conventions and the order that resolves it, the rule record format shared by `convention` (writes) and `review` (enforces), the route that carries a convention gap from the review report back to `convention`, the rule that a project's own shape wins, plus the baseline items that hold in any project | `convention`, `review`, `implement`, `git`, `plan` |
| `shared/project-profile.md` | What `.atk/profile.md` in the target project contains, where the project root is and how a skill finds it, the four shapes a project can have and what each costs, which skills stop, degrade, or ignore the file when it is missing, and that the `Contract` line in Docs changes behaviour rather than a path | the skills that need project facts |
| `shared/project-overrides.md` | What `.atk/overrides/<skill>.md` in the target project contains, where it sits relative to the project root and why the hook can miss it in a member repository, the two sections it may hold, and the seven things an override may never remove | all, through rule 7 of `shared/team-roles.md` |
| `shared/finalize-steps.md` | The closing sequence for a code change: the reference documents it owes, branch, commit, the project's own pull request template as the shape of the body, the consent line every action past the commit has to cross, and the order a change spanning several repositories is carried in | `fix`, `implement`, `verify`, `tailor` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not, plus the gate rule: which CI job judges a layer, and what a local command weaker than it leaves unverified | `fix`, `implement`, `verify` |
| `shared/diagram-conventions.md` | When a diagram earns its place, the four shapes the kit draws, and the rules that keep them readable | `catchup`, `design-doc`, `plan`, `breakdown`, `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use, how to name one, what to do when the harness lacks it, and the rules for the tidy step and for parallel reviewers, what counts as one turn of an interview, and when a connection to an outside service may be named | `fix`, `implement`, `verify`, `review`, `init`, `design-sources.md` |
| `shared/spec-docs.md` | What separates a reference document from a design document, what one is when the profile says `Contract: first` and the `implemented` field that says whether its code exists yet, the rule that a project's own shape wins, the obligation to carry a reference document with a contract change including when the document lives in another repository, the `screen` kind with its always-present `implemented`, two-sided drift and split with `feature`, and the line between drift and an unanswered question | `spec`, `design-doc`, `implement`, `fix`, `verify`, `review`, `qa`, `help` |
| `shared/tidy-pass.md` | What tidying a change looks for: the three lenses, what may be changed, and what is never touched, so the step lands the same way on a harness that ships a clean-up capability and one that does not | `fix`, `implement`, `verify`, through `host-capabilities.md` |
| `shared/host-file-locations.md` | How the code host is detected, every location each host reads `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, and when one counts as present | `convention` (is it missing), `git` (where is the template), `init` (where is `CODEOWNERS`) |
| `shared/design-sources.md` | How a skill reads a Figma design: finding the connection by what it can do, its three states and the fallback to exported images, the three reading passes, hidden layers, one link holding several screens, the node ID as the stable key, and the `design_*` fields a read records | `spec` (the `screen` kind), `intake` (a design as the request) |

Skills cite them as `shared/<file>.md`, which is `../../shared/<file>.md` relative to a `SKILL.md`.
Both spellings appear in each shared file's header so an agent can resolve the path either way.

The first three are cited by every skill. The rule record format in `review-checklist.md` is a
contract between exactly two: `convention` writes the rule rows and `review` cites their IDs. All
three readers need the resolution that opens the same file, because `docs/standards/index.md` and
`docs/conventions.md` are defaults and not addresses: a team that already keeps a standards directory keeps its rules there,
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

`design-sources.md` has two citers, `spec` and `intake`, and sits in `shared/` because how a design
is read is neither one's to own: the rule that the connection is found by what it can do, told apart in three
states, and replaced by exported images when it is not ready is what every skill that ever reads a
design has to answer the same way. It leans on the connection row of `host-capabilities.md`, which
lets a skill name the Figma connection and still forbids naming a command of the plugin carrying it.

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

After edits, verify. The two excluded subtrees are the ones CONV-002 also excludes, and for the same
reason: they hold what a skill wrote, not what this repository authors. A fix report that lists the
`ak:` check among the checks that run is quoting this rule rather than breaking it, and a record is
left alone once written.

The exclusion is anchored to those two paths, not to the directory names. `--exclude-dir=records`
would drop any directory called `records` at any depth, including one under `skills/`, and quietly
take it out of a `BLOCKING` check.

```bash
grep -rn "\bak:" skills/ shared/ README.md docs/ | grep -v -E '^docs/(records|derived)/'
```

Should print nothing (the second `grep` exits 1).

## `.atk/` in the target project

Skills that need project facts (build commands, layer layout, where the spec lives) read
`.atk/profile.md` from the root of the **target project**, never from the kit. `atk:init` creates
it; `shared/project-profile.md` defines what it holds and what each skill does when it is missing.

No skill writes another project's facts into the kit. The kit's own `.atk/` at the repository root
is not that: it describes `aiteamkit`, because the kit runs its own skills on itself. End users
receive it, and that is accepted rather than worked around. No field of `plugin.json` or of a
marketplace entry excludes files, and the install copies the plugin directory as it stands, so
`"source": "./"` ships the whole repository. Only the source shape changes what ships, and every
option costs more than it saves here: `git-subdir` or a subdirectory path means moving `skills/`,
`shared/`, `hooks/` and `assets/` down one level and rewriting every path in the docs, while `npm`
and `archive` mean a publish step this repository does not have. Nothing reads `.atk/` for the
user's project, because every citation resolves it from the root of the target project, and both
files say as much in their first line.

## `hooks/` never holds a rule, and is never the only road to a behavior

Two hooks, and both boundaries have to hold or the kit stops being the same kit on three harnesses.

`SessionStart` runs `hooks/check-profile.mjs`, which prints one line when a project has no
`.atk/profile.md` at or above it, walking up the way `shared/project-profile.md` says a skill does
and accepting a profile found above only when it names the directory the walk started in. A member
repository of a project whose profile sits in the parent is left alone; an unrelated repository that
happens to sit under the same folder is not. It must stay
answerable in one sentence: "does this project have a profile yet".
The moment it answers a second question, the precondition rule exists in two places, and the copy in
`shared/project-profile.md` is the one that is correct. That rule is not uniform anyway: ten skills
need no profile at all, so a hook that blocked would stop `atk:intake` from turning a chat message
into requirements.

`PreToolUse` with matcher `Skill` runs `hooks/load-overrides.mjs`, which puts
`.atk/overrides/<skill>.md` in front of the skill that owns it. It decides nothing and skips nothing;
what it saves is one file read. Every skill names its own override file at the top of its
`## Workflow` and opens it when no hook put it there, which is what happens on any harness the hook
does not reach: Cursor, which has no matching event; Codex, where the entry is registered through
`hooks/codex-hooks.json` but has never been observed matching a skill invocation; and Claude Code
with the hook turned off. The test that keeps this honest: run a skill against a project that has an
override for it twice, once with the `PreToolUse` entry in `hooks/hooks.json` and once with it
removed, and compare the two results. A difference means a behavior has moved into the hook, and
every harness the hook does not reach has silently lost it.

That is the bar for a third hook: it saves work a skill could do itself, the kit behaves the same
when it is missing, and it is registered in both files rather than one, which the registration check
below is what enforces.

Claude Code's contract makes the boundary hold by construction: `SessionStart` cannot block, exit
code 2 included. The script exits 0 on every path regardless, prints nothing when it has nothing to
say, and writes its "already reminded" marker to `${CLAUDE_PLUGIN_DATA}` or the user's state
directory, never into the user's repository.

**Keep both hooks in `hooks/hooks.json` in exec form, and keep them Node.** The entry is
`"command": "node"` with `${CLAUDE_PLUGIN_ROOT}` inside `args`. Rewriting it as a shell script, or
moving it to shell form, breaks Windows. `docs/system-architecture.md` holds the reasoning under
"Why the hook is Node and not a shell script"; read it before changing the shape, and keep the
exec-form check in the verification block below passing.

`hooks/codex-hooks.json` is the same two hooks for Codex, and it is the one place a string `command`
is correct. Codex replaces `${PLUGIN_ROOT}` inside `command` before anything runs, and replaces
nothing inside `args`, so the exec-form entry Claude Code needs reaches Node as a literal
`${CLAUDE_PLUGIN_ROOT}/hooks/check-profile.mjs` and the session shows a failed startup hook.
`.codex-plugin/plugin.json` points its `hooks` key at that file, which is what keeps Codex off the
default `hooks/hooks.json`. Two files, one pair of scripts: the Node is shared, only the registration
differs, and neither file may grow a rule. There is still no Cursor wrapper, because that event
contract could not be tested here. That costs a reminder, not a safeguard.

## Adding or changing a skill touches several files

Nothing generates these, so they drift silently. When adding, renaming, or removing a **skill**:

1. `skills/<name>/SKILL.md`
2. `README.md` (the skills table AND the invocation block)
3. `docs/skills-overview.md` and `docs/vi/skills-overview.md`
4. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`
5. `shared/artifact-paths.md` (the default output path row)
6. `docs/artifact-lifecycle.md` and `docs/vi/artifact-lifecycle.md`, if the skill produces a kind of
   artifact the tree did not hold before. The per-group paragraphs name the kinds and count them, so
   a new one leaves two files disagreeing about what is safe to delete
7. `.github/ISSUE_TEMPLATE/bug-report.yml` (the component dropdown)
8. All three manifest descriptions plus `marketplace.json` and `package.json`, if the count of 22
   changes. The Codex manifest carries a second copy inside `interface.longDescription`
9. `docs/system-architecture.md` and `docs/vi/system-architecture.md`, if the skill changes what the
   `shared/` layer or the profile is for
10. `docs/flow/project-flow.md`, `docs/flow/skill-chain.md` and `docs/flow/skill-lifecycle.md`, plus
    all three `docs/vi/flow/` mirrors.
    Each names all 22 skills: the phase table and the consumes/produces table respectively
11. `skills/help/references/state-signals.md`, if something on disk says the skill is the next one
    to run. A skill that answers an event a person reports has no row there, because nothing on
    disk announces the event
12. The `skill: <name>` label on the GitHub repository and its entry in `.github/labeler.yml`,
    which labels a pull request by the skill folders it changes. A label that exists on the
    repository but not in the file is never applied; one in the file but not on the repository is
    created grey with no description

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

Two subtrees are outside this rule, because they are artifacts a skill wrote rather than docs this
repository authors. `docs/derived/` is skill output and is gitignored. `docs/records/` is skill
output that is committed: a fix report, a design record, a release record, each one an account of a
moment, in the language of the run that produced it. Translating one would be translating history,
and the person who needs it reads the pull request it belongs to. `.atk/profile.md` says the same in
its Layers table, and the mirror check below excludes both paths.

| File | Purpose |
|------|---------|
| `skills-overview.md` | Reader-facing explanation of every skill: what it produces, when to use, when not to |
| `artifact-lifecycle.md` | Which artifacts to commit, which may be deleted, and what each deletion costs |
| `project-overview-pdr.md` | What atk is, goals, non-goals |
| `system-architecture.md` | Multi-harness layout, the `shared/` layer, and the load model |
| `codebase-summary.md` | File-by-file reference of every tracked file (goes stale on any file add or remove) |
| `project-roadmap.md` | Phase plan and status |
| `trigger-eval-measurement.md` | How to get a true reading out of `evals/trigger_evals.json`, and why a generic eval harness returns a number that is not one |
| `flow/project-flow.md` | The 22 skills placed in delivery phases, with the author and approver of each artifact |
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
repository has no CI that runs anything. `.github/workflows/` carries release-please and the
labeler, and neither checks content, so no rule here is `ENFORCED` and none is enforced by a tool failing a build.

Every rule below is already stated in prose somewhere above; this table is the checkable form of it,
not a second set of rules. The `source` column says where the prose lives.

| id | rule | bucket | tool | severity | source |
|----|------|--------|------|----------|--------|
| `CONV-001` | Adding, renaming, or removing a skill touches all twelve groups of file listed for it | `REVIEWED` | none | `BLOCKING` | "Adding or changing a skill touches several files" |
| `CONV-002` | Every `docs/**/*.md` has a `docs/vi/**/*.md` counterpart at the same relative path, with the same content, `docs/derived/` and `docs/records/` excepted | `REVIEWED` | the `diff` of the two `find` listings below | `BLOCKING` | "Docs are bilingual" |
| `CONV-003` | No em-dash in user-authored content | `REVIEWED` | the `grep` below | `SHOULD FIX` | "Em-dash policy" |
| `CONV-004` | No skill, shared file, README, or doc names a command belonging to another kit, `docs/derived/` and `docs/records/` excepted | `REVIEWED` | the `grep` below | `BLOCKING` | "The kit stands alone" |
| `CONV-005` | Each `SKILL.md` frontmatter `name:` is lowercase, hyphen-only, and matches its folder | `REVIEWED` | the `for` loop below | `BLOCKING` | "SKILL.md `name` field convention" |
| `CONV-006` | A `SKILL.md` stays under 300 lines, keeps the fixed section order, and lists triggers in English, Vietnamese, and Japanese | `REVIEWED` | `wc -l` for the length; the rest by reading | `BLOCKING` | "Skill folder layout", "Trigger phrases are multilingual on purpose" |
| `CONV-007` | A diagram is Mermaid, except the `## Workflow` pipeline and directory trees, and carries no hardcoded fill colour | `REVIEWED` | the `grep` below | `SHOULD FIX` | "Diagrams are Mermaid, except where they are not" |
| `CONV-008` | The five manifests and every `evals/*.json` parse, every `references/*.tsv` line carries its header's field count and a valid `checked` date or none, and the six version-bearing files agree | `REVIEWED` | the loops below | `BLOCKING` | "Release flow", "Common verification commands" |
| `CONV-009` | `hooks/hooks.json` keeps both hooks in exec form with `"command": "node"`, `hooks/codex-hooks.json` keeps the same two in string form with `${PLUGIN_ROOT}` and no `args`, both stay Node, the two files register the same events and matchers, and every script they name exists | `REVIEWED` | the registration check below | `BLOCKING` | "`hooks/` never holds a rule" |

Numbers are sequential and never reused. A rule that stops applying is struck through rather than
deleted, so a review that cited it stays readable.

Three things worth automating, proposed and not installed. A CI job running the block below would
move most of this table to `ENFORCED` and stop a reviewer spending attention on it. `CONV-001` is the
one that would need writing rather than wiring: a check that a diff touching `skills/` also touches
the twelve groups. The third is a profile check, and it belongs to a project rather than to this
repository: that a `.atk/profile.md` whose `Shape` names members carries a Repositories table, that
one whose shape does not carries none, and that every path and every `Repository` cell elsewhere in
the file resolves to a row of it. None is done here, and all three belong to whoever owns the
repository's tooling.

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
diff <(cd docs && find . -name '*.md' -not -path './vi/*' \
              -not -path './derived/*' -not -path './records/*' | sort) \
     <(cd docs/vi && find . -name '*.md' | sort)

# Both registration files parse, the scripts are valid Node, and check-profile stays silent where a
# profile exists
for f in hooks/hooks.json hooks/codex-hooks.json; do
  python3 -c "import json,sys; json.load(open('$f'))" && echo "OK $f"
done
node --check hooks/check-profile.mjs && node --check hooks/load-overrides.mjs && echo "OK node"
out=$(CLAUDE_PROJECT_DIR="$PWD" CLAUDE_PLUGIN_DATA=$(mktemp -d) node hooks/check-profile.mjs)
test -z "$out" && echo "OK silent with profile"   # fresh marker dir, so silence means the profile

# The walk, which the line above never reaches: this repository's own profile answers on the first
# check. Four cases, and the third is the one a proximity-only walk gets wrong.
t=$(mktemp -d); g=$(printf '.%s' git)
mkdir -p "$t/parent/$g" "$t/parent/.atk" "$t/parent/backend/$g" "$t/parent/stray/$g" "$t/ws/a/$g"
printf 'Shape: parent + members\n| backend | `backend/` | origin o/r | Team | clone |\n' \
  > "$t/parent/.atk/profile.md"
for c in "parent/backend:silent" "parent/stray:reminds" "ws:reminds"; do
  dir=${c%%:*}; want=${c##*:}
  out=$(CLAUDE_PROJECT_DIR="$t/$dir" CLAUDE_PLUGIN_DATA=$(mktemp -d) node hooks/check-profile.mjs)
  got=silent; test -n "$out" && got=reminds
  test "$got" = "$want" && echo "OK $dir $want" || echo "FAIL $dir: wanted $want, got $got"
done
out=$(CLAUDE_PROJECT_DIR=$(mktemp -d) CLAUDE_PLUGIN_DATA=$(mktemp -d) node hooks/check-profile.mjs)
test -z "$out" && echo "OK plain directory silent"; rm -rf "$t"

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

# Each harness gets the registration it can read. Claude Code: exec form, since shell form would
# break bare Windows. Codex: a string command, since Codex substitutes ${PLUGIN_ROOT} there and
# nowhere else, and an args array would reach Node as a literal path that does not exist. Every
# assertion is inside the one program on purpose: a shell test that ends in `&& echo OK` prints
# nothing when it fails, and nothing is what a block of twenty OK lines hides best.
python3 -c "
import json, os, re

def claude(h):
    assert h['command']=='node' and 'args' in h, 'hook must stay in exec form'
    return h['args'][0].rsplit('/', 1)[-1]

def codex(h):
    assert 'args' not in h, 'codex hook must carry its path in command'
    assert h['command'].startswith('node '), 'codex hook must stay Node'
    assert '\${PLUGIN_ROOT}' in h['command'], 'codex hook must use \${PLUGIN_ROOT}'
    return re.search('[^/]+[.]mjs', h['command']).group(0)

def registered(path, script_of):
    return {(event, group.get('matcher'), script_of(h))
            for event, groups in json.load(open(path))['hooks'].items()
            for group in groups for h in group['hooks']}

a = registered('hooks/hooks.json', claude)
b = registered('hooks/codex-hooks.json', codex)
assert a == b, 'the two registrations have drifted apart: %s' % sorted(a ^ b)
for event, matcher, script in sorted(a):
    assert os.path.exists('hooks/' + script), 'no such hook script: hooks/' + script
assert json.load(open('.codex-plugin/plugin.json')).get('hooks') == './hooks/codex-hooks.json', \
    'the Codex manifest must point its hooks key at ./hooks/codex-hooks.json'
print('OK registration, %d hooks in both files' % len(a))"

# Trigger evals parse. This checks the files, not the triggering: a generic eval harness reports a
# vacuous score against an installed plugin. To actually measure one, follow
# docs/trigger-eval-measurement.md
for f in skills/*/evals/trigger_evals.json; do
  python3 -c "import json,sys; d=json.load(open('$f')); assert isinstance(d,list) and d" || echo "FAIL $f"
done; echo "OK evals"

# Every line of a references/*.tsv list carries the header's field count, and a `checked` column
# holds a date or nothing
python3 -c "
import csv, glob, re
for f in glob.glob('skills/*/references/*.tsv'):
    rows = list(csv.reader(open(f, newline=''), delimiter='\t', quoting=csv.QUOTE_NONE))
    head, body = rows[0], rows[1:]
    assert body, f + ': no records'
    for n, r in enumerate(body, 2):
        assert len(r) == len(head), '%s:%d: %d fields, header has %d' % (f, n, len(r), len(head))
        if 'checked' in head:
            v = r[head.index('checked')]
            assert v == '' or re.fullmatch(r'\d{4}-\d{2}-\d{2}', v), '%s:%d: checked is %r' % (f, n, v)
    print('OK %s, %d records' % (f, len(body)))"

# Version agreement across the 6 version-bearing files
grep -h '"version"' package.json .claude-plugin/plugin.json .cursor-plugin/plugin.json \
     .codex-plugin/plugin.json; grep -h '"version"' .claude-plugin/marketplace.json; \
     cat .release-please-manifest.json
```
