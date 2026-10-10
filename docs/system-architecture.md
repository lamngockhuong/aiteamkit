# System Architecture

## Shape

`atk` is content plus manifests. There is no build step, no bundler, and no runtime: the harness
reads Markdown and JSON directly from the plugin directory.

The repository is a marketplace with two plugins in it. `atk` lives at `plugins/atk/`, `atkx` beside
it at `plugins/atkx/`, and each harness finds them through a marketplace file at the root.

```
aiteamkit/
  .claude-plugin/marketplace.json     lists atk and atkx for Claude Code
  .cursor-plugin/marketplace.json     lists atk and atkx for Cursor
  .agents/plugins/marketplace.json    lists atk and atkx for OpenAI Codex CLI
  plugins/atk/                        the plugin; an install copies this directory and nothing above it
    .claude-plugin/     plugin.json                        Claude Code
    .cursor-plugin/     plugin.json                        Cursor
    .codex-plugin/      plugin.json (+ interface block)    OpenAI Codex CLI
    skills/<name>/SKILL.md        24 skills, one folder each
    skills/<name>/references/*.md lazily loaded detail: templates, checklists, playbooks
    skills/<name>/references/*.tsv a list one reference file governs, one record per line
    skills/<name>/evals/*.json    trigger cases for the description
    shared/*.md                   DRY layer shared by the skills that cite it
    hooks/                        profile reminder and override loader, Claude Code and Codex
    agents/read-only-reviewer.md  the read-only agent of review, challenges and wide reads, Claude Code
    assets/*.svg                  icon and logo for marketplace listings
    CHANGELOG.md                  written by release-please for this plugin
    LICENSE                       a copy of the root licence, since the install carries nothing else
  plugins/atkx/                       a second plugin, three manifests, and skills/skill-eval/
    LICENSE                       the same copy
  docs/, docs/vi/               bilingual project documentation
  .atk/                         the kit's own profile and overrides, for running its skills on itself
```

Nothing in this tree describes the project the kit is installed into. That lives in one file in the
**target project**, `.atk/profile.md`, written by `atk:init` and, in the ordinary case, committed
with the project; `plugins/atk/shared/project-profile.md` holds the two shapes where nothing tracks it. The
plugin directory is read-only and shared by every project on the machine, so it is the wrong place
for a fact that is true of one of them.

Only the plugin directories ship, each on its own. A skill, a shared file or a hook that reads a
file outside its plugin reads
nothing on a user's machine, and no manifest path may leave it, which is why `atk:init` keeps the
default approvals per role in `plugins/atk/skills/init/references/role-defaults.md` and not in
`docs/`. The `.atk/` in the tree above is the kit's own, true of `aiteamkit` alone, and it is there
because the kit runs its own skills on itself; it sits above the plugin, so it never reaches a user.

## One content tree per plugin, three manifests each

The three manifest folders inside `plugins/atk/` describe the same `skills/` directory to three
harnesses, and each root marketplace file points its harness at `plugins/atk/`, and at `plugins/atkx/`,
whose three manifests do the same for its own `skills/` as the next section describes. Skill content is
never duplicated per harness. The manifests differ only in how they declare content, and every path
inside them is relative to the plugin:

| Manifest | How skills are declared | Harness-specific extra |
|----------|-------------------------|------------------------|
| `plugins/atk/.claude-plugin/plugin.json` | omitted; Claude Code auto-discovers `skills/` | listed by the root `.claude-plugin/marketplace.json` |
| `plugins/atk/.cursor-plugin/plugin.json` | `"skills": "./skills/"` | `displayName`; listed by the root `.cursor-plugin/marketplace.json` |
| `plugins/atk/.codex-plugin/plugin.json` | `"skills": "./skills/"` | `interface{}` with `defaultPrompt`, icons, `brandColor`; listed by `.agents/plugins/marketplace.json` |

```mermaid
flowchart TD
    MK["marketplace files at the root<br/><small>one per harness, each pointing at plugins/atk and plugins/atkx</small>"] --> CP
    MK --> UP
    MK --> XP
    CP["plugins/atk/.claude-plugin/plugin.json"] --> SK["plugins/atk/skills/<br/><small>24 folders, one SKILL.md each</small>"]
    UP["plugins/atk/.cursor-plugin/plugin.json"] --> SK
    XP["plugins/atk/.codex-plugin/plugin.json<br/><small>+ interface block</small>"] --> SK
    SK --> SH["plugins/atk/shared/<br/><small>cited by the skills that need it</small>"]
```

There is no `commands/` layer. A skill is its own slash command, named from its folder, namespaced
`atk:` by the harness at load time from `plugin.json`.

## A second plugin: atkx

`plugins/atkx/` sits beside `plugins/atk/` in the same marketplace, with the same three manifest
folders and one skill, `skill-eval`. It is for utility skills that depend on no artifact and on
no delivery lifecycle. The dependency runs one way: an `atkx` skill may call an `atk` skill, and
`atk` never calls an `atkx` one, so `atk` installed alone stays whole. The one place `atk` names
`atkx` is `atk:help`, which suggests an `atkx` skill, with its install commands, for a question no
`atk` skill covers; it keeps that list in `plugins/atk/skills/help/references/atkx-skills.md`
because the `atkx` directory is not beside it on a user's machine. On Claude Code,
`"dependencies": ["atk"]` in the `atkx` manifest installs `atk` with it; Cursor and Codex have no
such field, so there the user installs both, and an `atkx` skill checks for the `atk` skill it calls
before calling it. Neither plugin reads a file of the other's, and no symlink joins them. Each
plugin is its own release package, tagged `atk-v*` and `atkx-v*`. `CLAUDE.md`, section "`atkx` sits
beside `atk`, and the dependency runs one way", holds the rules and the acceptance bar for a first
skill.

## Load model

A harness loads only the frontmatter of every `SKILL.md` at startup. That frontmatter, mainly the
`description` field with its trigger phrases, is what the router matches a user request against. The
body of a `SKILL.md` is read only after the skill is selected.

This produces the size discipline in the kit:

| Layer | When it loads | Budget |
|-------|---------------|--------|
| `description` frontmatter | Always, for every installed skill: the 24 of `atk`, and `atkx`'s when it is installed | A few lines; triggers belong here and nowhere else |
| `SKILL.md` body | On invocation | Under 300 lines |
| `references/*.md` | Only when a workflow step opens it | Unbounded, kept out of the default path |
| `references/*.tsv` | Only when the reference file that governs it is read | One record per line, so it grows by lines and never by prose |
| `plugins/atk/shared/*.md` | Only when a skill cites it | Small, since several skills may open it |
| `.atk/profile.md` | Once per run, in the skills that need project facts | A page of pointers and commands, never prose |

One agent ships beside the skills, `plugins/atk/agents/read-only-reviewer.md`. Claude Code loads its
frontmatter with the plugin and namespaces it `atk:read-only-reviewer`; its body is read only when a
skill spawns it: every agent of `atk:review` other than the band 1 reviewer, every lens of
`atk:design-doc --challenge` and `atk:plan --challenge`, and the agent each of the seven read-heavy
skills hands its wide reading to; where the type is missing, a general agent with the same prompt.
Its tool list is Read, Grep and Glob. On Claude Code 2.1.296 an agent with that list had no Bash,
Edit or Write tool to call, and a review and a plan challenge run there spawned it for every round
and lens. A tool-list pattern allowing only `git diff`, `git log` and `git blame` let every other
command through in a session running `bypassPermissions`, and a path deny for `.env` in its
frontmatter removed Read and Grep whole, so it has no shell and no deny: the calling agent writes
the diff it needs, masked by the scan of `atk:git`, into the repository's git directory. Cursor and Codex
were not tested: Cursor auto-discovers `agents/` and the file sets `readonly: true` for it, Codex
plugins bundle no agents, and both statements come from their documentation as read on 2026-10-10.
On both, the prompts in `references/` remain the route.

## The `shared/` layer

Seventeen files hold what skills would otherwise repeat. The first three are cited by all 24:

- `plugins/atk/shared/team-roles.md`: the role table and the nine rules every skill follows.
- `plugins/atk/shared/artifact-paths.md`: the default output path per skill, how a language-partitioned docs
  root moves it, which repository an artifact lands in where the project spans several, naming
  rules, and front matter.
- `plugins/atk/shared/ticket-adapters.md`: tracker detection and its three outcomes, including the one where a
  tracker is configured and answers nothing, the vocabulary map, which trackers store a sprint's
  dates, and what to report where field history is missing.

Twelve are contracts between a named handful of skills rather than kit-wide rules:

- `plugins/atk/shared/review-checklist.md`: where a project keeps its conventions and the order that resolves
  it, the rule record format that `atk:convention` writes and `atk:review` cites by ID, the rule
  that a project which already writes conventions keeps its own shape, the route that carries a
  convention gap out of a review report and back to `atk:convention`, and the baseline items that
  hold in any project. It exists so a convention is written once and checked in the same words,
  instead of being restated in both skills and drifting. The resolution is here for the same reason:
  `docs/standards/index.md` and `docs/conventions.md` are defaults and not addresses, so a reader
  that went straight to one would report a team with a directory of standards documents as having
  recorded nothing. `atk:implement` reads the file for that resolution and for the baseline items,
  which it falls back to when a project really has recorded no conventions of its own.
- `plugins/atk/shared/finalize-steps.md`: the closing sequence for a finished piece of work, the consent
  line that every action past the commit has to cross, and the order a change spanning several
  repositories is carried in. `atk:git` is what carries it out; this file
  stays the contract, which is what lets the code-changing skills and the artifact-writing ones
  close the same way. Cited by `atk:fix`, `atk:implement` and `atk:verify`, which hand off to
  `atk:git`, by `atk:plan`, `atk:tailor` and `atk:qa` for the consent line alone, and by every skill that
  writes an artifact for the section about a change that produced only a document. Nothing leaves
  the local repository without being asked for.
- `plugins/atk/shared/layer-verification.md`: the five-layer table saying what to run for a layer, what a pass
  proves, and what it does not, and the gate rule: which CI job judges a layer, and what a local
  command weaker than that job leaves unverified. Cited by the same three. Each of them runs a check
  and then has to say what the result means, and the second half of that answer has to be identical
  in all three.
- `plugins/atk/shared/diagram-conventions.md`: when a diagram earns its place in an artifact, the four shapes
  the kit draws, and the rules that keep them readable in a pull request on either theme. Cited by
  `atk:catchup`, `atk:design-doc`, `atk:plan`, `atk:breakdown`, `atk:security`, and `atk:incident`,
  the six skills whose artifacts carry a diagram. Diagrams are Mermaid, so they render where the
  artifact is read and nothing has to be committed as an image.
- `plugins/atk/shared/host-capabilities.md`: which capabilities of the host agent a skill may use, and what it
  does on a harness that has none. Cited by `atk:fix`, `atk:implement`, and `atk:verify` for the
  tidy step that follows a green verification, by `atk:review` for independent passes run in
  parallel, by `atk:design-doc` and `atk:plan` for their challenges, and by `atk:init` for what one turn of an interview counts as where the harness carries
  several questions in a single prompt. It draws the line the kit had drawn only one way before: a
  capability the harness itself ships may be named and used, a command belonging to another kit may
  not, because the first is there for everyone who installed atk on that harness and the second is
  not. Cited by `atk:run-cases` for browser automation, which is neither: it is named by what it does
  and never by the plugin or server supplying it, and it is the one capability whose absence stops a
  skill, since for that skill the browser is the work and doing it by hand is `atk:qa --record`.
  Its section on reading wide through an agent is cited by the seven skills that read most of a
  tree, `atk:init`, `atk:catchup`, `atk:spec`, `atk:convention`, `atk:security`, `atk:fix` and
  `atk:onboard`: the agent returns conclusions with `path:line`, never file bodies, so the session
  keeps its context for the artifact, and a harness without agents reads inline and says so.
- `plugins/atk/shared/tidy-pass.md`: what tidying a change looks for, in three lenses, with what may be changed
  and what is never touched. Cited by the same three code skills through `host-capabilities.md`. It
  exists so the step lands the same way on a harness that ships a clean-up capability and on one
  where the skill works through the list itself, and it is why the kit ships no `simplify` skill of
  its own: the content belongs to the skills that already run it, not to a slash command that would
  produce no artifact and answer to no approver.

- `plugins/atk/shared/spec-docs.md`: what separates a reference document from a design document, what one is
  in a project whose profile says `Contract: first` and the `implemented` field that tracks whether
  its code exists yet, whose shape wins when a project already keeps documents of its own, the six
  kinds of change that oblige a pull request to carry its reference document, what that obligation
  becomes when the document lives in a repository other than the code's, and the line between drift
  and a question nobody has answered. Cited by `atk:spec`, which writes those documents, by
  `atk:design-doc`, `atk:fix`, `atk:implement`, `atk:review` and `atk:verify`, which have to leave
  them true, and by `atk:qa`, `atk:run-cases` and `atk:help`, which read them. It is the widest of these contracts,
  because `plugins/atk/shared/finalize-steps.md` now opens with its obligation, which makes every code-changing
  skill a party to it.
- `plugins/atk/shared/host-file-locations.md`: how the code host is detected, every location each host reads
  `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, and when one of them counts as
  present. Cited by `atk:convention`, which decides from it whether a file is missing and therefore
  worth offering to draft, by `atk:git`, which finds the template it has to fill, and by `atk:init`,
  which reads the team's host identifiers out of `CODEOWNERS` instead of spending an interview turn
  on them. The first two ask the same question from opposite ends, and a narrower answer in either
  one is how a repository ends up with a second template that outranks the team's own.
- `plugins/atk/shared/design-sources.md`: how a skill reads a Figma design, through whatever connection to
  Figma the harness has, found by what it can do rather than by a tool name, told apart in three
  states because a connector can be listed and still not signed in, and replaced by exported images
  when none is ready, so no skill stops for want of it. It also holds the node ID as the stable key
  of a component and the fingerprint a read records, which is what lets a second run touch only the
  rows that changed. Cited by `atk:spec` for the `screen` kind, the one kind whose source is a
  design, by `atk:intake`, which takes a design as the request, and by `atk:qa`, which reads the design
  for `GUI` cases only when the screen has no screen spec yet. It is the reason `plugins/atk/shared/host-capabilities.md` now has a row for a connection to an
  outside service: the service may be named, a command of the plugin carrying it may not.
- `plugins/atk/shared/feature-types.md`: the one classification of features in the kit, each type carrying the
  extra questions `atk:catchup` adds to an understanding check and the QA risk `atk:estimate` sizes
  testing from. One table, because a feature classified one way for questions and another way for
  effort is a payment flow to the developer and a plain form to whoever sizes its testing.
- `plugins/atk/shared/plain-writing.md`: how the prose of a run's report is written for a reader who has opened
  none of the files it cites: the `In short` section that opens it, five rules for the prose around
  the evidence, and what never changes, the evidence itself above all. Cited by the report templates
  of `atk:fix`, `atk:verify`, `atk:review`, `atk:security` and `atk:qa --record`, the last also
  reached by `atk:run-cases` through the run record shape it reuses, and by `## Output` of
  `atk:incident`, the
  reports that record one run and ask a person to act on it. A report correct in every line is still
  unreadable when each claim is a citation, and a rule written into six templates would drift into six.
- `plugins/atk/shared/independent-challenge.md`: how a draft is put before agents that read it cold, what
  each is given and never given, what an objection must name, and how the calling agent answers each
  one `Changed` or `Open`. Cited by `atk:design-doc --challenge`, whose lenses are the roles that
  sign a design, and by `atk:plan --challenge`, whose lenses are the ways a plan fails. Each keeps its
  lenses in a reference of its own; the shared half is the one that would drift into a challenge
  whose agents had read the author's reasoning.

The last two describe files that do not ship with the kit at all:

- `plugins/atk/shared/project-profile.md`: what `.atk/profile.md` holds in the **target project**, where the
  project root is and how a skill walks up to it, the four shapes a project can have with what a
  parent holding member repositories and a workspace holding none of its own each cost, and what each
  skill does when that file is missing. Skills that run commands stop; skills that only read a diff
  continue and say the profile was absent; skills that work from a chat message ignore it entirely.
  One Docs entry, `Contract`, changes what a skill does rather than where it writes, and its meaning
  lives in `plugins/atk/shared/spec-docs.md`.
  `atk:init` writes the profile, so it belongs to no group.

- `plugins/atk/shared/project-overrides.md`: what `.atk/overrides/<skill>.md` holds in the **target project**,
  where the directory sits when a project spans several repositories, the two sections it may carry,
  and the nine things an override may never remove. The nine
  exclusions are what keeps the mechanism from turning a team kit into a personal assistant, and a
  skill that skips part of an override says so in its artifact rather than silently. An override
  applies only once its approver has moved it to `APPROVED`; before that the skill runs as shipped
  and says so, because a draft that changed every run would be a skill entering an approval state
  on the team's behalf.

The override mechanism is the one that reaches every skill in two halves, and the split is
deliberate. Rule 7 of `plugins/atk/shared/team-roles.md` holds the behaviour, stated once. Each `## Workflow`
carries one line naming its own override file and pointing at that rule, because a shared file is
only read when something makes a skill open it, and a citation under `## Roles` does not. The line
costs a few tokens per invocation and buys the guarantee that the mechanism runs at all; putting the
behaviour itself in 20 files instead would be 20 copies of one rule, drifting.

`shared/` sits at the plugin root, `plugins/atk/shared/`, beside `skills/` rather than under it, because a folder inside `skills/`
without a `SKILL.md` is ambiguous to skill discovery. Skills cite the files as `shared/<file>.md`,
which resolves to `../../shared/<file>.md` from a skill file; both spellings appear in each shared
file's header. `.atk/profile.md` is the exception: it is cited from the root of the target project,
because it is not part of the kit.

## The session-start hook

`plugins/atk/hooks/hooks.json` registers one `SessionStart` hook that runs `plugins/atk/hooks/check-profile.mjs`, and
`plugins/atk/hooks/codex-hooks.json` registers the same script on Codex, where it runs once the user has
trusted it in `/hooks`. It answers a single question, "does
this project have a profile yet", reading the project the way `plugins/atk/shared/project-profile.md` does,
which is the nearest profile at or above the directory the session opened in, and it reminds without
blocking.

The boundary is the point. A hook that blocked would put the rule in two places, and the rule is not
uniform anyway: ten skills need no profile, and a hook that stopped everything would stop
`atk:intake` from turning a chat message into requirements, which needs nothing from the repository.
Which skill needs what, and what it does without it, stays in `plugins/atk/shared/project-profile.md`.

The boundary also holds by construction on this harness. Claude Code's hook contract says
`SessionStart` cannot block: exit code 2 takes no blocking action there, and any exit code sends
stdout to the model as context. The script exits 0 on every path regardless, and prints nothing when
there is nothing to say: no git entry in the directory, a profile already present, or a reminder
already given for this project. The "already reminded" marker is written to `${CLAUDE_PLUGIN_DATA}`
when the harness provides it and to the user's state directory otherwise, never into the user's
repository and never into a world-writable directory.

### Why the hook is Node and not a shell script

This section is the reason of record. `CLAUDE.md` and the comment at the top of the script point
here rather than restating it.

In `plugins/atk/hooks/hooks.json`, which is the registration Claude Code reads, the hook is registered in
**exec form**: `"command": "node"` plus an `args` array. Claude Code documents exec form as resolving
the executable on `PATH` and spawning it directly, substituting `${CLAUDE_PLUGIN_ROOT}` itself, with
no shell involved on any platform. Codex needs the opposite shape, for the reason the next section
gives under "Why Codex has a registration file of its own"; the script is the same either way.

That matters because shell form does not behave the same everywhere. Claude Code runs a shell-form
hook under bash, except on Windows without Git Bash, where it falls back to PowerShell. A POSIX
shell script would therefore fail to spawn there, and a hook that fails to spawn is not silent: the
session shows `Failed with non-blocking status code` with the interpreter's message. Hooks have no
operating-system condition, so a second PowerShell copy could not be registered without firing on
Linux and macOS too. One portable interpreter is what lets the three platforms behave alike.

### Why Codex has a registration file of its own

Codex reads `hooks/hooks.json` from a plugin root by default, so the exec-form entry above was not
ignored there: it was run with its path unresolved, and every Codex session opened on a failed
startup hook. The two harnesses resolve the plugin root at different moments. Claude Code substitutes
`${CLAUDE_PLUGIN_ROOT}` in `args` itself; Codex substitutes `${PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_ROOT}`
in the `command` string and substitutes nothing in `args`, so Node received the literal
`${CLAUDE_PLUGIN_ROOT}/hooks/check-profile.mjs`, resolved it against the workspace, and exited with
`MODULE_NOT_FOUND`.

`plugins/atk/hooks/codex-hooks.json` carries the same two hooks with the path inside `command`, and the `hooks`
key in `plugins/atk/.codex-plugin/plugin.json` points Codex at it, which is also what stops Codex reading the
Claude Code file. Nothing about the scripts changes: they are the same two Node files, they read the
same environment, and neither registration file holds a rule.

Measured first against codex-cli 0.155.1: a repository with no profile gets the reminder and the
hook completes, a repository with one stays silent, and the marker lands in the plugin data
directory Codex provides as `CLAUDE_PLUGIN_DATA`.

Measured again on 2026-10-10 against codex-cli 0.162.0, which adds a precondition: Codex skips a
plugin's hooks until the user trusts them. After a fresh install `/hooks` lists both, the
`SessionStart` and the `PreToolUse` entry, as needing review, and the TUI opens on a "Hooks need
review" prompt. Until they are trusted nothing runs, `codex exec` included: a repository with no
profile gets no reminder and no marker is written. Trusting them, from that prompt or from `/hooks`,
writes one `hooks.state` entry with a `trusted_hash` per hook into the user's `config.toml`, and a
hook that changes needs review again. From then on a repository with no profile gets the reminder in
the session's context on its first turn, with the marker in the plugin data directory, and a
repository with one stays silent, as in the earlier measurement on 0.155.1. The `hooks` key in the
manifest is the form Codex's documentation now calls legacy; 0.162.0 still reads it, since the hooks
it lists are keyed `atk@atk:hooks/codex-hooks.json`, so the manifest keeps it. Codex sets no
`CLAUDE_PROJECT_DIR`, which costs nothing, because both scripts already fall back to the working
directory and Codex runs a hook from the workspace root.

Two limits, accepted:

- **No Cursor wrapper.** Cursor can package hooks too, but its event contract could not be tested
  here, and Cursor does not read either file. The reminder is a convenience; the gate that matters is
  in the skills, and it runs identically on all three harnesses. That wrapper waits until someone can
  verify it against a running harness.
- **The Codex `PreToolUse` entry is registered, not observed.** Codex's own tool name for a skill
  invocation was not confirmed against a running session, so the override loader may never match
  there. That is the degradation `load-overrides.mjs` is built for: every skill opens its own
  override file when nothing put it in front of it.

### Why a hook may only save work, never do it

The kit runs two hooks and will accept a third on one condition: the kit behaves the same when it is
missing.

`plugins/atk/hooks/load-overrides.mjs` is the case that makes the rule concrete. It fires on `PreToolUse` with
matcher `Skill` and puts `.atk/overrides/<skill>.md` in front of the skill that owns it. Every skill
also names that file at the top of its own `## Workflow` and opens it when nothing put it there, so
a harness the hook does not reach produces the same result one file read slower. Cursor has no
matching event; Codex carries the entry in `plugins/atk/hooks/codex-hooks.json` and has never been seen matching
a skill invocation, which the accepted limits above record.

The alternative was available and was rejected. Putting the override mechanism in the hook alone
would have cost no edits to any `SKILL.md`, and it would have given two of the three harnesses
nothing at all. `plugins/atk/shared/project-profile.md` already refused the same move for the precondition rule,
for a reason that holds here and is worth repeating: three hook dialects mean three implementations
of one rule, and three implementations of one rule drift apart.

So the boundary is not "hooks are for reminders". It is that a hook may make something cheaper and
may never be the only road to it. The test is mechanical: run a skill against a project that has an
override for it, once with the `PreToolUse` entry registered and once with it removed, and compare.
The two results have to match.

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

An `atk` skill is that file, its `references/` and its `evals/`, and nothing that runs.
`atkx:skill-eval` is the one skill with a `scripts/` directory beside them, Node like the hooks and
for the same reason. Its sample skills must get the same verdict on every run, and a credential
masked, a host matched against the `SKILL.md`, or a weighted score added up by an agent comes out
slightly different each time. So the checks whose answer must repeat are scripts, and what needs
reading stays in `references/`. ADR 0002 records the choice.

## Data flow at runtime

```mermaid
flowchart TD
    U["User request"] --> T["Harness matches<br/>description triggers"]
    T --> S["SKILL.md body loads"]
    S --> P{"Needs project facts?"}
    P -->|Yes| PR[".atk/profile.md read<br/><small>target project</small>"]
    P -->|No| EV
    PR --> EV["Project evidence read<br/><small>code, git, CI, tracker</small>"]
    EV --> SR["shared/ references opened<br/><small>only the ones cited</small>"]
    SR --> Q{"Evidence answers<br/>everything?"}
    Q -->|No| IV["Interview the user<br/><small>judgment and agreements only</small>"]
    Q -->|Yes| W
    IV --> W["Markdown artifact written<br/><small>into the target project</small>"]
    W --> TK["Pointer pushed to the tracker<br/><small>only after the user approves the list</small>"]
```

Artifacts are written into the **target project**, never into the atk kit itself.

## Versioning

Each plugin is its own release package in `release-please-config.json`, tagged `atk-v*` and
`atkx-v*`. A package's version lives in its three `plugin.json` files, plus the root `package.json`
for `atk`, all driven by that package's `extra-files`, with `.release-please-manifest.json` owned
natively by release-please. The marketplace files carry no version. The release workflow runs on push
to `main`. Details in `CLAUDE.md`.
