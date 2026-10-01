# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`atk` (AI Team Kit) is a multi-harness AI plugin distributable across Claude Code, Cursor, and
OpenAI Codex CLI. It packages 24 skills covering the delivery lifecycle of a company project team
(`help`, `init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `breakdown`,
`convention`, `plan`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `security`, `git`,
`release`, `incident`, `retro`, `onboard`, `handover`), each invocable as a slash command by its own name
(`/atk:intake`, `/atk:estimate`, and so on). That is the lifecycle order; use it for every list of skills in the repository.
A second plugin, `atkx`, sits beside it in the same marketplace with no skill yet; see "`atkx` sits
beside `atk`, and the dependency runs one way".

This is content plus manifests, not a runtime application: there is no build step, no bundler, no
test suite, and `package.json` is `private: true` with no `scripts` block. "Validation" means JSON
parses, YAML frontmatter parses, `docs/` and `docs/vi/` stay mirrored, and the cross-file lists stay
in sync. See "Common verification commands" at the bottom.

## The team premise (why this kit exists)

Every skill assumes work done the way a team does it. This is the one thing to preserve when editing:

- Author and approver are different roles, and artifacts carry an approval state. One person may hold
  both, and on a solo project all of them; what never happens is a skill entering the state on its
  own, without the approver saying so.
- A skill drafts and gathers evidence; it never makes a decision that a role owns (scope, priority,
  deadline, pricing, compliance, go or no-go).
- Artifacts are written for a reader who was not in the conversation.
- Open questions carry the name of the person who must answer them, never "the team".

A change that makes a skill act like a solo assistant, deciding on the team's behalf or leaving an
artifact with no owner, is a regression even if it reads more helpfully. Supporting a solo developer
is a different thing and is in scope: one person holding every role still gets the gates, and the
approval is still their own act, whether they edit the state or tell the agent to.
`plugins/atk/shared/team-roles.md` owns that distinction.

## Multi-manifest layout (non-obvious)

The repository is a marketplace holding two plugins: `atk` at `plugins/atk/`, and `atkx` beside it
at `plugins/atkx/`. One marketplace file per harness lists both, and inside each plugin three sibling
manifest folders point to the SAME content:

```
.claude-plugin/marketplace.json     Claude Code: lists atk and atkx at ./plugins/<name>
.cursor-plugin/marketplace.json     Cursor: lists atk and atkx at plugins/<name>
.agents/plugins/marketplace.json    Codex: lists atk and atkx at ./plugins/<name>
plugins/atk/
  .claude-plugin/     plugin.json
  .cursor-plugin/     plugin.json
  .codex-plugin/      plugin.json (with `interface{}` block for marketplace listing)
  skills/, shared/, hooks/, assets/    shared content, NOT duplicated per harness
plugins/atkx/
  .claude-plugin/, .cursor-plugin/, .codex-plugin/    the same three manifests
  skills/             empty until a first skill passes the bar in its section below
```

Edit `plugins/atk/skills/<name>/SKILL.md` ONCE; all three manifests pick it up. Do not create
per-harness copies.

An install copies one plugin directory, `plugins/atk/` or `plugins/atkx/`, and nothing above it. A skill, a shared file
or a hook that reads a file outside that directory reads nothing on a user's machine, and no manifest
path may leave it: no `..`, no absolute path. That is why `atk:init` keeps its default approvals in
`plugins/atk/skills/init/references/role-defaults.md` rather than in `docs/`.

| Manifest | `skills` key | Extra |
|----------|--------------|-------|
| `plugins/atk/.claude-plugin/plugin.json` | absent (Claude auto-discovers `skills/`) | listed by the root `.claude-plugin/marketplace.json` |
| `plugins/atk/.cursor-plugin/plugin.json` | `"./skills/"` | `displayName` |
| `plugins/atk/.codex-plugin/plugin.json` | `"./skills/"` | `interface{}` block with `defaultPrompt`, icons, `brandColor`; `hooks` pointing at `./hooks/codex-hooks.json` |
| `plugins/atkx/.claude-plugin/plugin.json` | absent | `"dependencies": ["atk"]` |
| `plugins/atkx/.cursor-plugin/plugin.json` | `"./skills/"` | `displayName` |
| `plugins/atkx/.codex-plugin/plugin.json` | `"./skills/"` | `interface{}` block with no icon and no `hooks` |

Paths inside a manifest are relative to its plugin, so they did not change when the kit moved under
`plugins/atk/`; paths in this file are relative to the repository root.

There is no `commands/` directory and no `commands` key in any manifest. A skill is its own slash
command: `plugins/atk/skills/qa/SKILL.md` is what `/atk:qa` invokes, on all three harnesses. Do not add a
`commands/<name>.md` wrapper beside a same-named skill. Claude Code counts `commands/` entries and
`SKILL.md` skills in one inventory, so a wrapper registers the name a second time and every entry
shows up duplicated in the `/` menu, at a real always-on token cost for no behavior.

## Skill folder layout

```
plugins/atk/skills/<name>/
  SKILL.md                    required; frontmatter + workflow, kept under 300 lines
  references/*.md             optional, lazily loaded detail (templates, checklists, schemas)
  references/*.tsv            optional, a list a reference file governs, one record per line
  evals/trigger_evals.json    one per skill; array of {query, should_trigger} for description testing
```

Every skill carries `evals/trigger_evals.json`, so a description edit can be tested against the
neighbours it must not steal. `references/` is where they still differ: nineteen of them carry
one (`help`, `init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `convention`,
`plan`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `security`, `git`, `onboard`), and the other five are
still `SKILL.md` alone. `qa` holds the most, eight: its modes for updating cases, recording a run,
and reviewing cases each keep their procedure in a file of their own, and its checklist is a list
beside the file that governs it. Deepening a skill means adding `references/` files and pointing at
them from the relevant workflow step, not growing `SKILL.md` past 300 lines.

A reference is Markdown, with one exception: a list that grows one record at a time, whose fields a
check can count. `convention` keeps its standard sources in `references/standard-sources.tsv` for
that reason, and `references/standard-sources.md` beside it says what each field means and what a
run may do with a line. `qa` does the same with its component checklist, `references/checklists.tsv`
beside `references/checklists.md`. The rules stay in Markdown; only the records move. Tabs rather than commas,
because a free-text field routinely holds a comma and a quote forgotten by hand shifts every field
after it.

Every `SKILL.md` follows the same section order, and a new skill must match it:
frontmatter, title, intro paragraph, `## Scope` (handles / does NOT handle), `## Roles`,
`## Invocation`, `## Workflow` (ASCII pipeline then numbered steps), `## Output`, `## Ticket`,
`## Definition of done`.

One skill carries an extra section: `verify` adds `## Process management` between `## Workflow` and
`## Output`. It is the only skill that starts long-running processes (`atk:run-cases` holds a browser
session, but through the harness's browser automation rather than a process it starts and must stop), and the rules for not leaving
them behind are binding policy that two separate workflow steps defer to, so burying them inside one
step would hide a rule the other step also has to obey. That is the bar for an extra section: a rule
the workflow points at from more than one place, in a skill that does something no other skill does.
Anything narrower goes inside the step it belongs to.

## `shared/` is the DRY layer (beside `skills/`, not under it)

Sixteen files in `plugins/atk/shared/` hold what skills would otherwise repeat. They sit at the
plugin root beside `skills/`, NOT under it, because a folder under `skills/` without a `SKILL.md` is
ambiguous to the harnesses' skill discovery. The table names them as skills cite them, relative to
`plugins/atk/`.

| File | Owns | Cited by |
|------|------|----------|
| `shared/team-roles.md` | The role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the eight rules every skill follows | all |
| `shared/artifact-paths.md` | Default output path per skill, how a docs root partitioned by language moves that path, which repository an artifact lands in when the project spans several, `YYMMDD-HHMM` naming, the shared YAML front matter block with the `<record path>#<ID>` ticket form, the window in which a record may still be corrected, and the three persistence groups that decide whether an artifact is updated in place, left alone, or safe to delete | all |
| `shared/ticket-adapters.md` | Tracker detection order, the three outcomes it can reach including a tracker that is configured and answers nothing, the GitHub / Jira / Backlog / Redmine vocabulary map, which of those trackers stores a sprint's start and end, and the sprint metrics no tracker without field history can produce, each with the substitute to use instead | all |
| `shared/review-checklist.md` | Where a project keeps its conventions and the order that resolves it, the rule record format shared by `convention` (writes) and `review` (enforces), the route that carries a convention gap from the review report back to `convention`, the rule that a project's own shape wins, plus the baseline items that hold in any project | `convention`, `review`, `implement`, `git`, `plan` |
| `shared/project-profile.md` | What `.atk/profile.md` in the target project contains, where the project root is and how a skill finds it, the four shapes a project can have and what each costs, which skills stop, degrade, or ignore the file when it is missing, and that the `Contract` line in Docs changes behaviour rather than a path | the skills that need project facts |
| `shared/project-overrides.md` | What `.atk/overrides/<skill>.md` in the target project contains, where it sits relative to the project root and why the hook can miss it in a member repository, the two sections it may hold, that only an approved override applies and the line a skill prints when it does not, and the eight things an override may never remove | all, through rule 7 of `shared/team-roles.md` |
| `shared/finalize-steps.md` | The closing sequence for a code change: the reference documents it owes, branch, commit, the project's own pull request template as the shape of the body, the consent line every action past the commit has to cross, and the order a change spanning several repositories is carried in | `fix`, `implement`, `verify`, `plan`, `tailor`, `qa` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not, plus the gate rule: which CI job judges a layer, and what a local command weaker than it leaves unverified | `fix`, `implement`, `verify` |
| `shared/diagram-conventions.md` | When a diagram earns its place, the four shapes the kit draws, and the rules that keep them readable | `catchup`, `design-doc`, `plan`, `breakdown`, `security`, `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use, how to name one, what to do when the harness lacks it, and the rules for the tidy step and for parallel reviewers, what counts as one turn of an interview, when a connection to an outside service may be named, and browser automation, the one capability whose absence stops a skill | `fix`, `implement`, `verify`, `review`, `design-doc`, `init`, `run-cases`, `design-sources.md` |
| `shared/spec-docs.md` | What separates a reference document from a design document, what one is when the profile says `Contract: first` and the `implemented` field that says whether its code exists yet, the rule that a project's own shape wins, the obligation to carry a reference document with a contract change including when the document lives in another repository, the `screen` kind with its always-present `implemented`, two-sided drift and split with `feature`, and the line between drift and an unanswered question | `spec`, `design-doc`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `help` |
| `shared/tidy-pass.md` | What tidying a change looks for: the three lenses, what may be changed, and what is never touched, so the step lands the same way on a harness that ships a clean-up capability and one that does not | `fix`, `implement`, `verify`, through `host-capabilities.md` |
| `shared/host-file-locations.md` | How the code host is detected, every location each host reads `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, and when one counts as present | `convention` (is it missing), `git` (where is the template), `init` (where is `CODEOWNERS`) |
| `shared/design-sources.md` | How a skill reads a Figma design: finding the connection by what it can do, its three states and the fallback to exported images, the three reading passes, hidden layers, one link holding several screens, the node ID as the stable key, and the `design_*` fields a read records | `spec` (the `screen` kind), `intake` (a design as the request), `qa` (`GUI` cases where no screen spec exists) |
| `shared/feature-types.md` | The one classification of features: each type with the extra questions an understanding check adds and the QA risk an estimate reads, and the rule that a row is added with both filled | `catchup` (through `understanding-check.md`), `estimate` (through `complexity-drivers.md`) |
| `shared/plain-writing.md` | How the prose of a run's report is written for a reader who has opened none of the files it cites: the `In short` section that opens it, five rules for the prose around the evidence, and what never changes, the evidence itself above all | the report templates of `fix`, `verify`, `review`, `security`, `qa --record`, and `run-cases` through that same record shape; `## Output` of `incident` |

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
`plan`, `tailor` and `qa` are the citers that change no code, and cite the consent line alone: `plan`
because it offers its index as a ticket comment, `tailor` because a `--feedback` record is sent to a
repository the team does not own, `qa` because `--bug` creates issues and `--retest` and `--review`
comment on them.

`layer-verification.md` is a contract between the same three: each runs a check and then has to say
what the result means, and the answer to that second half has to be the same in all three. Each keeps
its own half beside its own workflow, which is why `plugins/atk/skills/fix/references/layer-playbooks.md` still
holds where a cause hides, `plugins/atk/skills/implement/references/verification.md` still holds the order to run
things in, and `plugins/atk/skills/verify/references/runtime-checks.md` still holds how to assert against a
running system.

`host-capabilities.md` decides a boundary rather than a format: a capability the harness itself ships
may be used and named, a command from another kit may not. It also carries the degradation rule,
since a skill that leans on a host capability must still work on the harness that has none. Browser
automation is the one exception it records: for `atk:run-cases` the browser is the work rather than an
improvement to it, so without one that skill stops after the scope question and hands its scope to
`atk:qa --record`, where a tester executes it.
`tidy-pass.md` is what that rule degrades into, and the reason the kit does not ship a `simplify`
skill of its own: the content belongs to three skills that already run it, not to one more slash
command with no artifact and no approver. `spec` clears that bar and `simplify` does not, which is
the test, not the count.

`spec-docs.md` is a contract of the same kind and the widest of them: `atk:spec` writes the
reference documents, and five other skills have to leave them true. It holds the tense distinction
because both `spec` and `design-doc` need it stated identically, and it holds the sync obligation
because `plugins/atk/shared/finalize-steps.md` now opens with it, which makes every code-changing skill a party
to the rule. The drift-versus-open-question line lives there for the same reason as the rule record
format in `review-checklist.md`: two skills have to answer it the same way, so neither of them owns
it.

`design-sources.md` has three citers, `spec`, `intake` and `qa`, and sits in `plugins/atk/shared/` because how a
design is read is none of theirs to own: the rule that the connection is found by what it can do, told apart in three
states, and replaced by exported images when it is not ready is what every skill that ever reads a
design has to answer the same way. It leans on the connection row of `host-capabilities.md`, which
lets a skill name the Figma connection and still forbids naming a command of the plugin carrying it.

`feature-types.md` has two citers, `catchup` and `estimate`, each through a reference of its own. It
exists because the two classify the same features, one to ask questions and one to size testing, and
two tables would drift into a feature that is a payment flow in one and a plain form in the other.
A new column for a third skill goes into the same table rather than into a table of its own.

`project-profile.md` is the odd one: it describes `.atk/profile.md`, a file that lives in the target
project rather than in the kit. Cite it from any skill that needs build commands, layer layout, or
where the incoming specification lives, and follow its three-group rule for what to do when that file
is missing.

When adding a rule that two or more skills need, put it in `plugins/atk/shared/` and reference it. Do not paste
it into each `SKILL.md`.

## The kit stands alone, but it may use the harness it runs on

A skill may say that something is outside the kit's scope. It must NOT name a command from another
kit as the thing that handles it. A team that installed only `atk` would hit a dead end, and the
dead end would be invisible until they followed the pointer.

Say "which the author does" or "outside this kit", or name an `atk:` skill. Never `ak:cook` or any
other kit's command.

A capability the host agent itself ships is different, and is allowed: it arrived with the harness,
so every team on that harness has it. `atk:implement`, `atk:fix` and `atk:verify` use the host's
code clean-up capability, `/simplify` in Claude Code, and `atk:review` and
`atk:design-doc --challenge` use the host's parallel agents. `plugins/atk/shared/host-capabilities.md` owns the rules: name the capability before its local name,
resolve that name from the harness at the time of use, and degrade into doing the work by hand,
recorded as such, on a harness that has none. No skill stops because a host capability is missing,
apart from `atk:run-cases` without browser automation, which that file states as its one exception
and which never names the plugin or server that supplies a browser.

After edits, verify. The two excluded subtrees are the ones CONV-002 also excludes, and for the same
reason: they hold what a skill wrote, not what this repository authors. A fix report that lists the
`ak:` check among the checks that run is quoting this rule rather than breaking it, and a record is
left alone once written.

The exclusion is anchored to those two paths, not to the directory names. `--exclude-dir=records`
would drop any directory called `records` at any depth, including one under `plugins/atk/skills/`, and quietly
take it out of a `BLOCKING` check.

```bash
grep -rn "\bak:" plugins/ README.md docs/ --exclude=CHANGELOG.md | grep -v -E '^docs/(records|derived)/'
```

Should print nothing (the second `grep` exits 1).

Every `CHANGELOG.md` is excluded here, in the checks of `CONV-007` and `CONV-011`, and in the
dated-name check: release-please writes one per plugin from commit messages, it is never edited by hand, and a commit that
quotes a command or a fill would otherwise fail a `BLOCKING` check with no legitimate fix.

## `atkx` sits beside `atk`, and the dependency runs one way

`plugins/atkx/` is a second plugin in the same marketplace: utility skills that depend on no
artifact and on no delivery lifecycle. It has no skill yet. `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`
records why it is a sibling plugin rather than a folder inside `atk`, and
`docs/records/design/260930-0933-atkx-utility-kit-placement.md` holds the design this section
writes down.

An `atkx` skill may call an `atk` skill. `atk` never calls, names, or points at an `atkx` skill:
the kit stands alone, and a team that installed only `atk` must never meet a pointer it cannot
follow. That is `CONV-011`:

```bash
grep -rn "\batkx:" plugins/atk/ --exclude=CHANGELOG.md
```

Should print nothing (`grep` exits 1).

A skill qualifies for `atkx` when it passes all three of these, and a skill that fails one belongs
in `atk` or nowhere:

- It runs without `.atk/profile.md`.
- It writes nothing into the team's repository that a teammate is asked to review.
- Its `SKILL.md` states which harnesses it fully supports. Trigger measurement, for one, needs the
  `PreToolUse` hook in `docs/trigger-eval-measurement.md`, which Codex has not been seen to fire for
  a skill and Cursor does not have, so a skill that measures triggers says "Claude Code only" for
  that mode.

How an `atkx` skill calls `atk`:

- **At install, on Claude Code.** `plugins/atkx/.claude-plugin/plugin.json` declares
  `"dependencies": ["atk"]`, so installing `atkx@atk` installs `atk@atk` with it, and Claude Code
  refuses to disable `atk` while `atkx` is enabled, naming `atkx` as what still needs it.
- **At run time, everywhere.** Cursor and Codex document no dependency field, and Codex installs
  `atkx` alone. So an `atkx` skill checks that `atk:<skill>` is in the host's live skill list before
  invoking it. When it is not, it prints one line naming the kit and how to install it, then stops or
  continues without that step, as its own `SKILL.md` says.
- It names the `atk` skill by its full name, passes only arguments listed in that skill's
  `argument-hint`, and leaves the called skill's gates to the user: its profile check, its
  interview, its approval states.

Each plugin carries every file it reads, because an install copies one plugin directory and nothing
beside it. A rule both kits need is written in each, and the copy in `atkx` names the `atk` file it
came from, so a later reader can compare the two. No symlink crosses from one plugin to the other:
Claude Code would copy its target into the cache, but Cursor and Codex document no such behaviour.
`atkx` has no hooks of its own to begin with, so a user with both kits sees the `atk` profile
reminder once.

```bash
find plugins -type l
```

Should print nothing.

## `.atk/` in the target project

Skills that need project facts (build commands, layer layout, where the spec lives) read
`.atk/profile.md` from the root of the **target project**, never from the kit. `atk:init` creates
it; `plugins/atk/shared/project-profile.md` defines what it holds and what each skill does when it is missing.

No skill writes another project's facts into the kit. The kit's own `.atk/` at the repository root
is not that: it describes `aiteamkit`, because the kit runs its own skills on itself. It does not
ship: the marketplace entry's `source` is `./plugins/atk`, and the install copies that directory
alone, so `.atk/`, `docs/`, `plans/` and the root files stay in the repository. Nothing reads `.atk/`
for the user's project either way, because every citation resolves it from the root of the target
project, and both files say as much in their first line.

## `hooks/` never holds a rule, and is never the only road to a behavior

Two hooks, and both boundaries have to hold or the kit stops being the same kit on three harnesses.

`SessionStart` runs `plugins/atk/hooks/check-profile.mjs`, which prints one line when a project has no
`.atk/profile.md` at or above it, walking up the way `plugins/atk/shared/project-profile.md` says a skill does
and accepting a profile found above only when it names the directory the walk started in. A member
repository of a project whose profile sits in the parent is left alone; an unrelated repository that
happens to sit under the same folder is not. It must stay
answerable in one sentence: "does this project have a profile yet".
The moment it answers a second question, the precondition rule exists in two places, and the copy in
`plugins/atk/shared/project-profile.md` is the one that is correct. That rule is not uniform anyway: ten skills
need no profile at all, so a hook that blocked would stop `atk:intake` from turning a chat message
into requirements.

`PreToolUse` with matcher `Skill` runs `plugins/atk/hooks/load-overrides.mjs`, which puts
`.atk/overrides/<skill>.md` in front of the skill that owns it. It decides nothing and skips nothing;
what it saves is one file read. Every skill names its own override file at the top of its
`## Workflow` and opens it when no hook put it there, which is what happens on any harness the hook
does not reach: Cursor, which has no matching event; Codex, where the entry is registered through
`plugins/atk/hooks/codex-hooks.json` but has never been observed matching a skill invocation; and Claude Code
with the hook turned off. The test that keeps this honest: run a skill against a project that has an
override for it twice, once with the `PreToolUse` entry in `plugins/atk/hooks/hooks.json` and once with it
removed, and compare the two results. A difference means a behavior has moved into the hook, and
every harness the hook does not reach has silently lost it.

That is the bar for a third hook: it saves work a skill could do itself, the kit behaves the same
when it is missing, and it is registered in both files rather than one, which the registration check
below is what enforces.

Claude Code's contract makes the boundary hold by construction: `SessionStart` cannot block, exit
code 2 included. The script exits 0 on every path regardless, prints nothing when it has nothing to
say, and writes its "already reminded" marker to `${CLAUDE_PLUGIN_DATA}` or the user's state
directory, never into the user's repository.

**Keep both hooks in `plugins/atk/hooks/hooks.json` in exec form, and keep them Node.** The entry is
`"command": "node"` with `${CLAUDE_PLUGIN_ROOT}` inside `args`. Rewriting it as a shell script, or
moving it to shell form, breaks Windows. `docs/system-architecture.md` holds the reasoning under
"Why the hook is Node and not a shell script"; read it before changing the shape, and keep the
exec-form check in the verification block below passing.

`plugins/atk/hooks/codex-hooks.json` is the same two hooks for Codex, and it is the one place a string `command`
is correct. Codex replaces `${PLUGIN_ROOT}` inside `command` before anything runs, and replaces
nothing inside `args`, so the exec-form entry Claude Code needs reaches Node as a literal
`${CLAUDE_PLUGIN_ROOT}/hooks/check-profile.mjs` and the session shows a failed startup hook.
`plugins/atk/.codex-plugin/plugin.json` points its `hooks` key at that file, which is what keeps Codex off the
default `hooks/hooks.json` at the plugin root. Two files, one pair of scripts: the Node is shared, only the registration
differs, and neither file may grow a rule. There is still no Cursor wrapper, because that event
contract could not be tested here. That costs a reminder, not a safeguard.

## Adding or changing a skill touches several files

Nothing generates these, so they drift silently. When adding, renaming, or removing a **skill**:

1. `plugins/atk/skills/<name>/SKILL.md`
2. `README.md` (the skills table AND the invocation block)
3. `docs/skills-overview.md` and `docs/vi/skills-overview.md`
4. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`
5. `plugins/atk/shared/artifact-paths.md` (the default output path row)
6. `docs/artifact-lifecycle.md` and `docs/vi/artifact-lifecycle.md`, if the skill produces a kind of
   artifact the tree did not hold before. The per-group paragraphs name the kinds and count them, so
   a new one leaves two files disagreeing about what is safe to delete
7. `.github/ISSUE_TEMPLATE/bug-report.yml` (the component dropdown)
8. All three manifest descriptions plus `marketplace.json` and `package.json`, if the count of 24
   changes. The Codex manifest carries a second copy inside `interface.longDescription`
9. `docs/system-architecture.md` and `docs/vi/system-architecture.md`, if the skill changes what the
   `plugins/atk/shared/` layer or the profile is for
10. `docs/flow/project-flow.md`, `docs/flow/skill-chain.md` and `docs/flow/skill-lifecycle.md`, plus
    all three `docs/vi/flow/` mirrors, and `plugins/atk/skills/init/references/role-defaults.md`.
    Each names all 24 skills: the phase table, the consumes/produces table, and the role table
    respectively, the last read by `atk:init` and shipped inside the kit for that reason
11. `plugins/atk/skills/help/references/state-signals.md`, if something on disk says the skill is the next one
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

Each `plugins/atk/skills/<folder>/SKILL.md` frontmatter `name:` MUST be:

- Lowercase letters, numbers, hyphens only (NO colons)
- Match the folder name exactly

Example: `plugins/atk/skills/design-doc/SKILL.md` -> `name: design-doc` (NOT `atk:design-doc`).

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
fenced `mermaid` block. The drawing rules are in `plugins/atk/shared/diagram-conventions.md`, which is also what
the six diagram-producing skills cite; do not restate them here or in a `SKILL.md`.

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
grep -rn "style .* fill:#" plugins/ docs/ README.md --exclude=CHANGELOG.md \
  | grep -v plugins/atk/shared/diagram-conventions.md
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
| `system-architecture.md` | Multi-harness layout, the `plugins/atk/shared/` layer, and the load model |
| `codebase-summary.md` | File-by-file reference of every tracked file (goes stale on any file add or remove) |
| `project-roadmap.md` | Phase plan and status |
| `adr/*.md` | Architecture decision records, one decision each; `0001` records `atk` and `atkx` as sibling plugins |
| `trigger-eval-measurement.md` | How to get a true reading out of `evals/trigger_evals.json`, and why a generic eval harness returns a number that is not one |
| `flow/project-flow.md` | The 24 skills placed in delivery phases, with the author and approver of each artifact |
| `flow/skill-chain.md` | What each skill consumes and produces, and where a chain breaks |
| `flow/skill-lifecycle.md` | The anatomy of a skill, the shape of a run, and the five kinds of edge between one skill and another |

## A record here names no client

This repository is public, and the kit is tried on client projects before a change lands here. A
fix report, a design record, or any file under `docs/records/` written from such a run, and the
commit message and pull request body that carry it, describe the client work in neutral terms:
"a client project", "the epic under review", "a custom actual-effort field on the tracker", "the
project's own estimate skill". What they never carry is the client project or repository name,
its tracker ticket numbers or URLs, the names of its custom fields, internal tools or skills, the
names of people on its team, or figures and quoted text that together point at one project.

Hours, counts, and the shape of a defect stay, because they are the evidence and identify nothing
once the name is gone. The source record stays in the client project, and the record here cites it
by its path inside that project and its date, which is enough for the person who has access to find
it and tells nobody else where to look.

A file already on `main` that breaks this is corrected in a new commit rather than by rewriting
history, and the correction says so. There is no `grep` for this rule: a check would have to list the
names it protects, which is the leak itself. It is read, by the author before the commit and by the
reviewer after.

## Release flow (release-please, pre-1.0 mode)

Versions are bumped automatically by release-please on push to `main`. `plugins/atk` is its own
release package in `release-please-config.json`, tagged `atk-v<version>`, and it counts only the
commits that touch `plugins/atk/`. Four files share its version, all driven by that package's
`extra-files`:

| File | jsonpath |
|------|----------|
| `package.json` | `$.version`, written `/package.json` because a leading `/` resolves from the repository root rather than from the package |
| `plugins/atk/.claude-plugin/plugin.json` | `$.version` |
| `plugins/atk/.cursor-plugin/plugin.json` | `$.version` |
| `plugins/atk/.codex-plugin/plugin.json` | `$.version` |

The config sets three things the single-package layout did not need: `include-component-in-tag`,
so each plugin's tags stay apart; `separate-pull-requests`, so each plugin gets a release pull
request of its own; and `last-release-sha`, the `v0.1.0` commit, so the first release after the
split does not walk the whole history looking for an `atk-v*` tag that was never made.

`plugins/atkx` is a second package, tagged `atkx-v<version>`, whose three `plugin.json` files share
its version. Its state starts at `0.0.0` with `"initial-version": "0.0.1"`: release-please treats a
`0.0.0` package as never released and would open its first release at `1.0.0` without that line.

The marketplace files carry no version: each harness reads it from the plugin's own `plugin.json`,
so a copy in the marketplace entry would be one more place for it to disagree.

A fifth file, `.release-please-manifest.json`, also holds the version, keyed by the package path, but
is NOT an `extra-file`: release-please owns it natively as its state file. Never hand-edit it. The
changelog is `plugins/atk/CHANGELOG.md`, inside the package, which is where release-please writes it.

Pre-1.0 config keeps experimental versioning:

- `bump-patch-for-minor-pre-major: true` means `feat:` commits bump patch (0.0.x).
- `bump-minor-pre-major: true` means `feat!:` and breaking-change commits bump minor (0.x.0).

To force a specific version, append a `Release-As: X.Y.Z` footer to a commit that touches the
package it is for, `plugins/atk/` or `plugins/atkx/`: release-please files a commit under the package
paths it touches, so the footer on a commit touching only root files reaches no package, and on one
touching both it forces both. The two `bump-*-pre-major` flags sit at the top of
`release-please-config.json` and hold for both packages; to graduate one plugin to 1.0 and above,
move the flags into the other package's block and drop them from the top.

## Commits

- Conventional Commits required (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, `refactor:`, `style:`,
  `test:`). Type drives release-please's CHANGELOG grouping and version logic.
- `feat:` and `fix:` appear in CHANGELOG; the others are silent by default.

## Review checklist

This is the section `atk:review` reads and cites by ID, in the record format from
`plugins/atk/shared/review-checklist.md`. It holds `REVIEWED` rules only: rules a person checks, because this
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
| `CONV-008` | Every manifest, every marketplace file, and every `evals/*.json` parse, every `references/*.tsv` line carries its header's field count and a valid `checked` date or none, a checklist's IDs are unique and its dimensions and techniques valid, the version-bearing files of each release package agree, and every plugin is listed by all three marketplaces and released as a package of its own, with no manifest path leaving it | `REVIEWED` | the loops below | `BLOCKING` | "Release flow", "Common verification commands" |
| `CONV-009` | `plugins/atk/hooks/hooks.json` keeps both hooks in exec form with `"command": "node"`, `plugins/atk/hooks/codex-hooks.json` keeps the same two in string form with `${PLUGIN_ROOT}` and no `args`, both stay Node, the two files register the same events and matchers, and every script they name exists | `REVIEWED` | the registration check below | `BLOCKING` | "`hooks/` never holds a rule" |
| `CONV-010` | No record, commit message, or pull request body names a client project, its tickets, its custom fields or internal tools, or its people | `REVIEWED` | none; read, since a check would have to list the names | `BLOCKING` | "A record here names no client" |
| `CONV-011` | `atk` never invokes or names an `atkx` skill, and no symlink crosses from one plugin to the other | `REVIEWED` | the `grep` and the `find` in that section | `BLOCKING` | "`atkx` sits beside `atk`, and the dependency runs one way" |

Numbers are sequential and never reused. A rule that stops applying is struck through rather than
deleted, so a review that cited it stays readable.

Three things worth automating, proposed and not installed. A CI job running the block below would
move most of this table to `ENFORCED` and stop a reviewer spending attention on it. `CONV-001` is the
one that would need writing rather than wiring: a check that a diff touching `plugins/atk/skills/` also touches
the twelve groups. The third is a profile check, and it belongs to a project rather than to this
repository: that a `.atk/profile.md` whose `Shape` names members carries a Repositories table, that
one whose shape does not carries none, and that every path and every `Repository` cell elsewhere in
the file resolves to a row of it. None is done here, and all three belong to whoever owns the
repository's tooling.

## Common verification commands

```bash
# Every manifest and marketplace file parses
for f in package.json .claude-plugin/marketplace.json .cursor-plugin/marketplace.json \
         .agents/plugins/marketplace.json plugins/*/.*-plugin/plugin.json; do
  python3 -c "import json,sys; json.load(open('$f'))" && echo "OK $f"
done

# Every skill folder has a SKILL.md, and the name matches the folder
for d in plugins/*/skills/*/; do
  n=$(basename "$d")
  grep -q "^name: $n$" "$d/SKILL.md" && echo "OK $n" || echo "MISMATCH $n"
done

# docs/ and docs/vi/ are mirrored
diff <(cd docs && find . -name '*.md' -not -path './vi/*' \
              -not -path './derived/*' -not -path './records/*' | sort) \
     <(cd docs/vi && find . -name '*.md' | sort)

# Both registration files parse, the scripts are valid Node, and check-profile stays silent where a
# profile exists
for f in plugins/atk/hooks/hooks.json plugins/atk/hooks/codex-hooks.json; do
  python3 -c "import json,sys; json.load(open('$f'))" && echo "OK $f"
done
node --check plugins/atk/hooks/check-profile.mjs && node --check plugins/atk/hooks/load-overrides.mjs && echo "OK node"
out=$(CLAUDE_PROJECT_DIR="$PWD" CLAUDE_PLUGIN_DATA=$(mktemp -d) node plugins/atk/hooks/check-profile.mjs)
test -z "$out" && echo "OK silent with profile"   # fresh marker dir, so silence means the profile

# The walk, which the line above never reaches: this repository's own profile answers on the first
# check. Four cases, and the third is the one a proximity-only walk gets wrong.
t=$(mktemp -d); g=$(printf '.%s' git)
mkdir -p "$t/parent/$g" "$t/parent/.atk" "$t/parent/backend/$g" "$t/parent/stray/$g" "$t/ws/a/$g"
printf 'Shape: parent + members\n| backend | `backend/` | origin o/r | Team | clone |\n' \
  > "$t/parent/.atk/profile.md"
for c in "parent/backend:silent" "parent/stray:reminds" "ws:reminds"; do
  dir=${c%%:*}; want=${c##*:}
  out=$(CLAUDE_PROJECT_DIR="$t/$dir" CLAUDE_PLUGIN_DATA=$(mktemp -d) node plugins/atk/hooks/check-profile.mjs)
  got=silent; test -n "$out" && got=reminds
  test "$got" = "$want" && echo "OK $dir $want" || echo "FAIL $dir: wanted $want, got $got"
done
out=$(CLAUDE_PROJECT_DIR=$(mktemp -d) CLAUDE_PLUGIN_DATA=$(mktemp -d) node plugins/atk/hooks/check-profile.mjs)
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
  out=$(echo "$payload" | CLAUDE_PROJECT_DIR="$PWD" node plugins/atk/hooks/load-overrides.mjs)
  test "$out" = "{}" || echo "LEAK on: $payload"
done; echo "OK load-overrides quiet"

# An override that is a symlink out of .atk/overrides/, or an overrides directory that is one, is
# not read: the hook reads with Node, so nothing in the harness would ask before the target reached
# the agent. A symlink that stays inside the directory still loads.
t=$(mktemp -d); mkdir -p "$t/out" "$t/p/.atk/overrides" "$t/q/.atk"
echo outside > "$t/out/fix.md"; echo inside > "$t/p/.atk/overrides/real.md"
ln -s "$t/out/fix.md" "$t/p/.atk/overrides/fix.md"; ln -s real.md "$t/p/.atk/overrides/plan.md"
ln -s "$t/out" "$t/q/.atk/overrides"
for c in "p:fix:{}" "q:fix:{}"; do
  IFS=: read -r dir skill want <<< "$c"
  out=$(echo "{\"tool_name\":\"Skill\",\"tool_input\":{\"skill\":\"atk:$skill\"}}" \
    | CLAUDE_PROJECT_DIR="$t/$dir" node plugins/atk/hooks/load-overrides.mjs)
  test "$out" = "$want" && echo "OK $dir symlink out refused" || echo "LEAK $dir: $out"
done
echo '{"tool_name":"Skill","tool_input":{"skill":"atk:plan"}}' \
  | CLAUDE_PROJECT_DIR="$t/p" node plugins/atk/hooks/load-overrides.mjs | grep -q inside \
  && echo "OK symlink inside loads" || echo "FAIL symlink inside"; rm -rf "$t"

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

a = registered('plugins/atk/hooks/hooks.json', claude)
b = registered('plugins/atk/hooks/codex-hooks.json', codex)
assert a == b, 'the two registrations have drifted apart: %s' % sorted(a ^ b)
for event, matcher, script in sorted(a):
    assert os.path.exists('plugins/atk/hooks/' + script), 'no such hook script: plugins/atk/hooks/' + script
assert json.load(open('plugins/atk/.codex-plugin/plugin.json')).get('hooks') == './hooks/codex-hooks.json', \
    'the Codex manifest must point its hooks key at ./hooks/codex-hooks.json'
print('OK registration, %d hooks in both files' % len(a))"

# The marketplaces and the plugins agree: every plugins/<name>/ is listed in all three marketplace
# files and is a release package, every listed source is a plugin of that name, no marketplace entry
# carries a version, no manifest path leaves its plugin, and atkx still declares atk. Each of these is
# true by construction today and silent when it stops being true, which is why it is asserted here
python3 -c "
import glob, json, os
plugins = sorted(os.path.basename(d.rstrip('/')) for d in glob.glob('plugins/*/'))
packages = json.load(open('release-please-config.json'))['packages']
assert sorted(p.split('/', 1)[1] for p in packages) == plugins, 'release packages: %s' % sorted(packages)
for f in ('.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json',
          '.agents/plugins/marketplace.json'):
    entries = json.load(open(f))['plugins']
    assert sorted(e['name'] for e in entries) == plugins, '%s lists %s' % (f, [e['name'] for e in entries])
    for e in entries:
        assert 'version' not in e, '%s: %s carries a version' % (f, e['name'])
        src = e['source']['path'] if isinstance(e['source'], dict) else e['source']
        assert os.path.normpath(src) == 'plugins/' + e['name'], '%s: %s source %r' % (f, e['name'], src)
for m in glob.glob('plugins/*/.*-plugin/plugin.json'):
    root = m.split('/.', 1)[0]
    assert json.load(open(m))['name'] == os.path.basename(root), m + ': name differs from its folder'
    def paths(o):
        if isinstance(o, dict): return [x for v in o.values() for x in paths(v)]
        if isinstance(o, list): return [x for v in o for x in paths(v)]
        return [o] if isinstance(o, str) and o.startswith(('./', '../', '/')) else []
    for v in paths(json.load(open(m))):
        assert not v.startswith('/') and '..' not in v.split('/') and os.path.exists(os.path.join(root, v)), '%s: %s' % (m, v)
assert json.load(open('plugins/atkx/.claude-plugin/plugin.json')).get('dependencies') == ['atk'], \
    'atkx must declare atk as its dependency'
print('OK marketplaces and plugins agree, %d plugins' % len(plugins))"

# Trigger evals parse. This checks the files, not the triggering: a generic eval harness reports a
# vacuous score against an installed plugin. To actually measure one, follow
# docs/trigger-eval-measurement.md
for f in plugins/*/skills/*/evals/trigger_evals.json; do
  python3 -c "import json,sys; d=json.load(open('$f')); assert isinstance(d,list) and d" || echo "FAIL $f"
done; echo "OK evals"

# Every line of a references/*.tsv list carries the header's field count, and a `checked` column
# holds a date or nothing. A checklist, the list whose header has `technique`, also keeps its IDs
# unique and shaped `<component>-NN`, its dimension a number from 1 to 10, and its technique a code
# that plugins/atk/skills/qa/references/checklists.md defines
python3 -c "
import csv, glob, re
for f in glob.glob('plugins/*/skills/*/references/*.tsv'):
    rows = list(csv.reader(open(f, newline=''), delimiter='\t', quoting=csv.QUOTE_NONE))
    head, body = rows[0], rows[1:]
    assert body, f + ': no records'
    seen = set()
    for n, r in enumerate(body, 2):
        assert len(r) == len(head), '%s:%d: %d fields, header has %d' % (f, n, len(r), len(head))
        if 'checked' in head:
            v = r[head.index('checked')]
            assert v == '' or re.fullmatch(r'\d{4}-\d{2}-\d{2}', v), '%s:%d: checked is %r' % (f, n, v)
        if 'technique' in head:
            i, c = r[head.index('id')], r[head.index('component')]
            assert re.fullmatch(re.escape(c) + r'-\d{2}', i), '%s:%d: id %r does not match %r' % (f, n, i, c)
            assert i not in seen, '%s:%d: id %r used twice' % (f, n, i)
            seen.add(i)
            assert r[head.index('dimension')] in [str(d) for d in range(1, 11)], '%s:%d: dimension' % (f, n)
            assert r[head.index('technique')] in ('', 'EP', 'BVA', 'DT', 'ST', 'PW', 'EG'), '%s:%d: technique' % (f, n)
    print('OK %s, %d records' % (f, len(body)))"

# No example of a dated artifact name has lost its time: plugins/atk/shared/artifact-paths.md dates every name
# YYMMDD-HHMM, and a six-digit date followed by a slug, an extension, `/` or `)` is the shape it
# replaced.
# Should print nothing (grep exits 1)
grep -rnE '(^|[^0-9])[0-9]{6}(-[A-Za-z]|\.[a-z]+|/|\))' plugins/ README.md docs/ \
  --exclude=CHANGELOG.md \
  | grep -v -E '^docs/(records|derived)/'

# Version agreement: per release package, its extra-files and its entry in the release-please
# manifest name one version. Read from the config itself, so a package added there is checked too
python3 -c "
import json, os
cfg = json.load(open('release-please-config.json'))
state = json.load(open('.release-please-manifest.json'))
for pkg, conf in cfg['packages'].items():
    seen = {'.release-please-manifest.json': state[pkg]}
    for e in conf['extra-files']:
        f = e['path'][1:] if e['path'].startswith('/') else os.path.join(pkg, e['path'])
        seen[f] = json.load(open(f))['version']
    assert len(set(seen.values())) == 1, '%s disagrees: %s' % (pkg, seen)
    print('OK %s at %s, %d files' % (pkg, state[pkg], len(seen)))"
```
