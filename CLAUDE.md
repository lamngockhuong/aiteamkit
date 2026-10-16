# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`atk` (AI Team Kit) is a multi-harness AI plugin distributable across Claude Code, Cursor, and
OpenAI Codex CLI. It packages 25 skills covering the delivery lifecycle of a company project team
(`help`, `orchestrate`, `init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `breakdown`,
`convention`, `plan`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `security`, `git`,
`release`, `incident`, `retro`, `onboard`, `handover`), each invocable as a slash command by its own name
(`/atk:intake`, `/atk:estimate`, and so on). That is the lifecycle order; use it for every list of skills in the repository.
A second plugin, `atkx`, sits beside it in the same marketplace with one skill, `skill-eval`, which
evaluates a skill a project has written; see "`atkx` sits beside `atk`, and the dependency runs one
way".

This is content plus manifests, not a runtime application: there is no build step, no bundler, no
test suite, and `package.json` is `private: true` with no `scripts` block. "Validation" means JSON
parses, YAML frontmatter parses, `docs/` and `docs/vi/` stay mirrored, and the cross-file lists stay
in sync, which `bash tests/verify.sh` checks. See "Common verification commands" at the bottom.

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
  agents/             read-only-reviewer.md, one agent, routed to on Claude Code only
  CHANGELOG.md        written by release-please
  LICENSE             a copy of the root licence, since an install carries nothing above the plugin
plugins/atkx/
  .claude-plugin/, .cursor-plugin/, .codex-plugin/    the same three manifests
  skills/             skill-eval/, with SKILL.md, references/, scripts/ and evals/
  CHANGELOG.md        written by release-please
  LICENSE             the same copy
```

Edit `plugins/atk/skills/<name>/SKILL.md` ONCE; all three manifests pick it up. Do not create
per-harness copies.

An install copies one plugin directory, `plugins/atk/` or `plugins/atkx/`, and nothing above it. A skill, a shared file
or a hook that reads a file outside that directory reads nothing on a user's machine, and no manifest
path may leave it: no `..`, no absolute path. That is why `atk:init` keeps its default approvals in
`plugins/atk/skills/init/references/role-defaults.md` rather than in `docs/`. `CONV-012` holds the
rule, and its check under "Common verification commands" fails on a citation that resolves outside
the plugin or nowhere.

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

`plugins/atk/agents/` holds one agent, `read-only-reviewer`, which Claude Code namespaces
`atk:read-only-reviewer`. Its only tools are Read, Grep and Glob, so every agent `atk:review` spawns
other than the band 1 reviewer, the lens agents of `atk:design-doc --challenge` and
`atk:plan --challenge`, and the agents the seven read-heavy skills hand wide reading to have no tool
that edits or runs anything.
`plugins/atk/shared/host-capabilities.md` holds the rule, under its reviewer bullet;
`docs/system-architecture.md` holds the measurement, on Claude Code only, and what Cursor and Codex
do with `agents/` by their documentation. On both, the prompts in `references/` remain the route.

## Skill folder layout

```
plugins/atk/skills/<name>/
  SKILL.md                    required; frontmatter + workflow, kept under 300 lines
  references/*.md             optional, lazily loaded detail (templates, checklists, schemas)
  references/*.tsv            optional, a list a reference file governs, one record per line
  evals/trigger_evals.json    one per skill; array of {query, should_trigger} for description testing
```

Every skill carries `evals/trigger_evals.json`, so a description edit can be tested against the
neighbours it must not steal. `references/` is where they still differ: twenty-one of them carry
one (`help`, `orchestrate`, `init`, `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `spec`, `convention`,
`plan`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `security`, `git`, `release`, `onboard`), and the other
four are still `SKILL.md` alone. `qa` holds the most, eight: its modes for updating cases, recording a run,
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

A skill of either plugin may also carry `scripts/`, Node only, for the checks whose answer must be
the same on every run, and only those; judgment stays in `references/`. `atkx:skill-eval` is the one
that does, for the reason `docs/adr/0002-skill-eval-scripts-for-repeatable-checks.md` records: its
sample skills in `tests/skill-eval-fixtures/` must get the same verdict every time. No `atk` skill
carries one yet. That was a description of the kit when ADR 0002 was written, never a decision, and
the maintainer said on 2026-10-14 that an `atk` skill may carry `scripts/` on the same terms. The
first one comes with a design and an ADR of its own, as `skill-eval`'s did.

No file named `SKILL.md` sits deeper than `skills/<name>/SKILL.md` in either plugin. Codex lists a
`SKILL.md` found at any depth under `skills/` as a skill of its own, so a sample skill kept inside a
skill would reach every Codex user's prompt as a live one, the malicious sample included. Sample
skills live in `tests/` at the repository root, which no install copies.

Every `SKILL.md` follows the same section order, and a new skill must match it:
frontmatter, title, intro paragraph, `## Scope` (handles / does NOT handle), `## Roles`,
`## Invocation`, `## Workflow` (ASCII pipeline, then the override line and the two lines that start
the run trace, then numbered steps), `## Output`, `## Ticket`, `## Definition of done`. The trace
lines name the skill's own folder in the path and are worded alike in every skill, which the check
under "Common verification commands" holds.

Two skills carry an extra section: `verify` and `orchestrate` add `## Process management` between
`## Workflow` and `## Output`. They are the only skills that start things that outlive a step,
`verify` long-running processes and `orchestrate` agents, panes and worktrees (`atk:run-cases` holds a browser
session, but through the harness's browser automation rather than a process it starts and must stop), and the rules for not leaving
them behind are binding policy that several workflow steps defer to, so burying them inside one
step would hide a rule the other steps also have to obey. That is the bar for an extra section: a rule
the workflow points at from more than one place, in a skill that does something no other skill does.
Anything narrower goes inside the step it belongs to.

## `shared/` is the DRY layer (beside `skills/`, not under it)

Twenty-one files in `plugins/atk/shared/` hold what skills would otherwise repeat. They sit at the
plugin root beside `skills/`, NOT under it, because a folder under `skills/` without a `SKILL.md` is
ambiguous to the harnesses' skill discovery. The table names them as skills cite them, relative to
`plugins/atk/`.

| File | Owns | Cited by |
|------|------|----------|
| `shared/team-roles.md` | The role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the ten rules every skill follows | all |
| `shared/artifact-paths.md` | Default output path per skill, how a docs root partitioned by language moves that path, which repository an artifact lands in when the project spans several, `YYMMDD-HHMM` naming, the shared YAML front matter block with the `<record path>#<ID>` ticket form, the window in which a record may still be corrected, and the three persistence groups that decide whether an artifact is updated in place, left alone, or safe to delete, the progress log `fix`, `verify`, `implement` and `orchestrate` write as they go and resume from, and the run trace beside it, which is not a progress log | all |
| `shared/ticket-adapters.md` | Tracker detection order, the three outcomes it can reach including a tracker that is configured and answers nothing, the GitHub / Jira / Backlog / Redmine vocabulary map, which of those trackers stores a sprint's start and end, and the sprint metrics no tracker without field history can produce, each with the substitute to use instead | all |
| `shared/review-checklist.md` | Where a project keeps its conventions and the order that resolves it, the rule record format shared by `convention` (writes) and `review` (enforces), the route that carries a convention gap from the review report back to `convention`, the rule that a project's own shape wins, plus the baseline items that hold in any project | `convention`, `review`, `implement`, `git`, `plan` |
| `shared/project-profile.md` | What `.atk/profile.md` in the target project contains, where the project root is and how a skill finds it, the four shapes a project can have and what each costs, which skills stop, degrade, or ignore the file when it is missing, and that three entries in Docs, `Contract`, the `Template` column of the kinds table with the front-matter map beside it, and `Run trace`, change behaviour rather than a path, the last read even by the skills that ignore a missing profile | the skills that need project facts; every skill, for the `Run trace` line |
| `shared/project-overrides.md` | What `.atk/overrides/<skill>.md` in the target project contains, where it sits relative to the project root and why the hook can miss it in a member repository, the two sections it may hold, that only an approved override applies and the line a skill prints when it does not, and the ten things an override may never remove, the run trace among them | all, through rule 7 of `shared/team-roles.md` |
| `shared/finalize-steps.md` | The closing sequence for a code change: the reference documents it owes, branch, commit, the project's own pull request template as the shape of the body, the consent line every action past the commit has to cross, and the order a change spanning several repositories is carried in | `fix`, `implement`, `verify`, `plan`, `tailor`, `qa`, `orchestrate` |
| `shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not, plus the gate rule: which CI job judges a layer, and what a local command weaker than it leaves unverified | `fix`, `implement`, `verify` |
| `shared/diagram-conventions.md` | When a diagram earns its place, the four shapes the kit draws, and the rules that keep them readable, plus the state diagram and `erDiagram` of `spec` | `catchup`, `design-doc`, `plan`, `breakdown`, `spec`, `security`, `incident` |
| `shared/host-capabilities.md` | Which capabilities of the host agent a skill may use, how to name one, what to do when the harness lacks it, and the rules for the tidy step and for parallel reviewers, spawned as `atk:read-only-reviewer` over a masked `diff.patch`, what counts as one turn of an interview, when a connection to an outside service may be named and how any such connection is found and read, in three states, with the signed-in account never written down, browser automation, the one capability whose absence stops a skill, reading wide through an agent that returns conclusions rather than file bodies, and agents that write: the job's worktree as their boundary, the multiplexer named by what it does, the three ways a job runs, a gate relayed and never answered, a CLI's own permission prompt answered by the person where the agent shows it, never by the calling skill, commits kept by the calling skill, what such an agent is told, and its output read as evidence | `fix`, `implement`, `verify`, `review`, `design-doc`, `plan`, `init`, `run-cases`, `help`, `catchup`, `spec`, `convention`, `security`, `onboard`, `orchestrate`, `design-sources.md`, `independent-challenge.md`, `review-fix-loop.md` |
| `shared/spec-docs.md` | What separates a reference document from a design document, what one is when the profile says `Contract: first` and the `implemented` field that says whether its code exists yet, the rule that a project's own shape wins, and under a project's own template what it may instruct, how its front matter and change history are kept and where the kit's own items go, the rules that hold under any shape, the obligation to carry a reference document with a contract change and leave it true, including when the document lives in another repository, the `screen` kind with its always-present `implemented`, two-sided drift and split with `feature`, and the line between drift and an unanswered question | `spec`, `design-doc`, `implement`, `fix`, `verify`, `review`, `qa`, `run-cases`, `help`, `init` |
| `shared/tidy-pass.md` | What tidying a change looks for: the three lenses, what may be changed, and what is never touched, so the step lands the same way on a harness that ships a clean-up capability and one that does not | `fix`, `implement`, `verify`, through `host-capabilities.md` |
| `shared/host-file-locations.md` | How the code host is detected, every location each host reads `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, and when one counts as present | `convention` (is it missing), `git` (where is the template), `init` (where is `CODEOWNERS`) |
| `shared/design-sources.md` | How a skill reads a Figma design: the connection rule of `host-capabilities.md` applied to Figma, with the Figma signs of each state, the install and sign-in lines and the fallback to exported images, the three reading passes, hidden layers, one link holding several screens, the node ID as the stable key, and the `design_*` fields a read records | `spec` (the `screen` kind), `intake` (a design as the request), `qa` (`GUI` cases where no screen spec exists) |
| `shared/feature-types.md` | The one classification of features: each type with the extra questions an understanding check adds and the QA risk an estimate reads, and the rule that a row is added with both filled | `catchup` (through `understanding-check.md`), `estimate` (through `complexity-drivers.md`) |
| `shared/plain-writing.md` | How the prose of a run's report is written for a reader who has opened none of the files it cites: the `In short` section that opens it, five rules for the prose around the evidence, and what never changes, the evidence itself above all | the report templates of `fix`, `verify`, `review`, `security`, `qa --record`, and `run-cases` through that same record shape; `## Output` of `incident`; document mode of `catchup`, through `references/document-explainer.md` |
| `shared/independent-challenge.md` | How a draft is put before agents that read it cold: what each agent gets and never gets, up to five objections it may return and what each must name, how the calling agent checks, merges, and answers them `Changed` or `Open`, and the `Pre-review objections` section that says it is not a review | `design-doc` (through `role-challenge.md`), `plan` (through `plan-challenge.md`) |
| `shared/secret-scan.md` | The secret scan, one `sh` block in four modes, `staged` and `commit` for what is committed, `tree` for every tracked file, and `mask` for a diff read in the session or handed to an agent, and its table of paths that are a finding on their own, which is the list of files rule 9 of `shared/team-roles.md` keeps unread | `git`, `security`, `spec`, `help`, `host-capabilities.md`, `team-roles.md`, `ticket-adapters.md`, `tidy-pass.md`, `review-rounds.md`, `independent-challenge.md`, `review-fix-loop.md`, `project-profile.md`, `job-prompt.md` of `orchestrate`, `document-explainer.md` of `catchup`, `read-only-reviewer` (restated) |
| `shared/review-fix-loop.md` | The loop that runs `atk:review` on a skill's own change before it reaches a person: what the call is given, which severities are fixed, a disputed finding, re-verifying each round, the two-round ceiling and the five-part escalation, and the line `--no-review` leaves | `implement`, `fix`, `orchestrate`, `artifact-paths.md`, `finalize-steps.md` |
| `shared/state-signals.md` | Which artifacts gate the next skill while they wait for approval, the evidence on disk that names that skill, in the order to check it, and how the artifacts waiting on a person are collected | `help`, `orchestrate` |
| `shared/run-trace.md` | The run trace every run leaves under `docs/derived/traces/<skill>/`: its path and `<run-id>`, the ignore file inside its directory and the check that must pass before it is written, the header with the `way` a run was started, the six event kinds and no others, what it never holds, the twenty kept per skill, which only `tailor --runs` removes and only on a yes, and that `Run trace: off` in the profile is the only switch | all, through the two lines at the top of every `## Workflow` that carry out rule 10 of `shared/team-roles.md`; `tailor` reads what it holds |

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
comment on them. `orchestrate` cites three parts of it: the consent line, since the branches its jobs
leave wait for a person's yes to the push; the branch rule, which names its worktrees' branches; and
the artifact section, for its proposal records.

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
design is read is none of theirs to own: the reading passes, and the exported images that replace a
connection that is not ready, are what every skill that ever reads a design has to answer the same
way. The connection rule itself, found by what it can do and told apart in three states, lives in
Read through a connection in `host-capabilities.md`, since a document is read through a connection
too, and `design-sources.md` applies it to Figma. It leans on the connection row of the same file,
which lets a skill name the Figma connection and still forbids naming a command of the plugin
carrying it.

`feature-types.md` has two citers, `catchup` and `estimate`, each through a reference of its own. It
exists because the two classify the same features, one to ask questions and one to size testing, and
two tables would drift into a feature that is a payment flow in one and a plain form in the other.
A new column for a third skill goes into the same table rather than into a table of its own.

`independent-challenge.md` has two citers, `design-doc --challenge` and `plan --challenge`, each
through a reference that keeps its own lenses, who settles an open objection, and where the result
sits in its artifact. What the two share is the half that makes a challenge worth running: an agent
that never sees the author's reasoning, and an objection that names its failure or is dropped. Two
copies of that half would drift until one challenge let its agents read the conversation.

`secret-scan.md` began in `atk:git`'s references and moved here once `security`, the masked diff of
`host-capabilities.md`, and rule 9 itself all read it. Its table of paths is the one list of files
rule 9 keeps unread, so a prompt that names those files quotes the table rather than its own memory
of it. The read-only agent is the one place it is restated, since an agent run in a target project
cannot open a file of the kit.

`review-fix-loop.md` began in `atk:implement`'s references and moved here once `atk:fix` called the
review on its own change too. A fix that alters a public contract carries the risk an implementation
does, and two copies of the loop would drift until one of them lowered a disputed finding to get
past it.

`run-trace.md` is reached from every skill's workflow. Rule 10 of `team-roles.md` is the obligation,
but a rule a skill only cites with "See" is not read: two runs of `atk:help` never opened the file and
wrote no trace. So every `SKILL.md` carries two lines under its override line that name the trace's
path and send the run to `run-trace.md`, and with them the run followed it. It is a file of its own rather than a section of `artifact-paths.md` because a trace is an obligation of
every run, a run that writes no artifact included, reached from all 25 workflows and owned by rule
10, while `artifact-paths.md` says where a run's artifacts go, and a trace is not one. `atk:tailor --feedback` is its one reader, and the only skill that says what a
trace means.

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

One exception, and only one: `atk:help` may name a skill of `atkx`, the companion kit from this
marketplace, always with the line that installs it, so the pointer is never a dead end. See
"`atkx` sits beside `atk`, and the dependency runs one way" and `CONV-011`.

A capability the host agent itself ships is different, and is allowed: it arrived with the harness,
so every team on that harness has it. `atk:implement`, `atk:fix` and `atk:verify` use the host's
code clean-up capability, `/simplify` in Claude Code, and `atk:review` and
`atk:design-doc --challenge` and `atk:plan --challenge` use the host's parallel agents, as `atk:orchestrate` does
for its jobs. `plugins/atk/shared/host-capabilities.md` owns the rules: name the capability before its local name,
resolve that name from the harness at the time of use, and degrade into doing the work by hand,
recorded as such, on a harness that has none. No skill stops because a host capability is missing,
apart from `atk:run-cases` without browser automation, which that file states as its one exception
and which never names the plugin or server that supplies a browser.

A terminal multiplexer that starts coding agents in panes sits beside browser automation: a tool of
the machine rather than of the harness, named by what it does, starting an agent in a pane, sending
it a task, reporting whether it is idle, working, blocked or done, and reading a pane, and never by
the tool that supplies it. Its commands come from that tool's own help at the time of use. Unlike the
browser, no skill stops without it: an agent that writes runs in a pane, then in the host's
subagents, then in the session, per Agents that write in `plugins/atk/shared/host-capabilities.md`.

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
artifact and on no delivery lifecycle. It has one skill, `skill-eval`, whose design is
`docs/records/design/261001-1510-atkx-skill-eval.md`. `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`
records why it is a sibling plugin rather than a folder inside `atk`, and
`docs/records/design/260930-0933-atkx-utility-kit-placement.md` holds the design this section
writes down.

An `atkx` skill may call an `atk` skill. `atk` never invokes `atkx`, and names it in one place
only: `atk:help`, the skill a person asks which skill to run. The maintainer chose this on
2026-10-02, accepting that a team with only `atk` installed will then see a suggestion to install
`atkx`; `docs/records/design/261002-0525-help-names-atkx.md` holds the reasons.

The exception is narrow on purpose. `atk:help` names an `atkx` skill only where no `atk` skill
handles the request by its `## Scope`, never in its state mode, and adds the install commands when the skill is not in the host's
live skill list. It reads them from a copy, `plugins/atk/skills/help/references/atkx-skills.md`,
per `CONV-012`, and `plugins/atk/shared/host-capabilities.md` carries the matching row without the
word. Every other skill, every shared file, and every hook still names nothing
of `atkx`: a skill that stops hands back to `atk:help` or to a person. That is `CONV-011`:

```bash
grep -rn "\batkx\b" plugins/atk/ --exclude=CHANGELOG.md | grep -v '^plugins/atk/skills/help/'
```

Should print nothing (the second `grep` exits 1).

A skill qualifies for `atkx` when it passes all three of these, and a skill that fails one belongs
in `atk` or nowhere:

- It runs without `.atk/profile.md`.
- It writes nothing into the team's repository that a teammate is asked to review.
- Its `SKILL.md` states which harnesses it fully supports. Trigger measurement, for one, needs the
  `PreToolUse` hook that `docs/trigger-eval-measurement.md` describes and
  `plugins/atkx/skills/skill-eval/scripts/hook-log.mjs` implements, which Codex has not been seen to fire for
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
in `tests/verify.sh` is what enforces.

Claude Code's contract makes the boundary hold by construction: `SessionStart` cannot block, exit
code 2 included. The script exits 0 on every path regardless, prints nothing when it has nothing to
say, and writes its "already reminded" marker to `${CLAUDE_PLUGIN_DATA}` or the user's state
directory, never into the user's repository.

**Keep both hooks in `plugins/atk/hooks/hooks.json` in exec form, and keep them Node.** The entry is
`"command": "node"` with `${CLAUDE_PLUGIN_ROOT}` inside `args`. Rewriting it as a shell script, or
moving it to shell form, breaks Windows. `docs/system-architecture.md` holds the reasoning under
"Why the hook is Node and not a shell script"; read it before changing the shape, and keep the
exec-form check in `tests/verify.sh` passing.

`plugins/atk/hooks/codex-hooks.json` is the same two hooks for Codex, and it is the one place a string `command`
is correct. Codex replaces `${PLUGIN_ROOT}` inside `command` before anything runs, and replaces
nothing inside `args`, so the exec-form entry Claude Code needs reaches Node as a literal
`${CLAUDE_PLUGIN_ROOT}/hooks/check-profile.mjs` and the session shows a failed startup hook.
`plugins/atk/.codex-plugin/plugin.json` points its `hooks` key at that file, which is what keeps Codex off the
default `hooks/hooks.json` at the plugin root. Two files, one pair of scripts: the Node is shared, only the registration
differs, and neither file may grow a rule. On codex-cli 0.162.0 Codex skips both hooks until the
user trusts them in `/hooks`, so on Codex the reminder starts after that review rather than at
install; the `hooks` key is the form Codex now calls legacy, and 0.162.0 still reads it.
`docs/system-architecture.md` holds the measurement. There is still no Cursor wrapper, because that
event contract could not be tested here. That costs a reminder, not a safeguard.

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
8. All three manifest descriptions plus `.claude-plugin/marketplace.json` and `package.json`, if the count of 25
   changes. The Codex manifest carries a second copy inside `interface.longDescription`
9. `docs/system-architecture.md` and `docs/vi/system-architecture.md`, if the skill changes what the
   `plugins/atk/shared/` layer or the profile is for
10. The tables that name all 25 skills: the phase table in `docs/flow/project-flow.md`, the
    consumes/produces table in `docs/flow/skill-chain.md`, and the role table in
    `plugins/atk/skills/init/references/role-defaults.md`, the last read by `atk:init` and shipped
    inside the kit for that reason. Both `docs/flow/` files have `docs/vi/flow/` mirrors; the role
    table has none. `docs/flow/skill-lifecycle.md` and its mirror carry no table of all 25: they name
    skills as examples of each kind of edge, and count the `SKILL.md` files and the mentions between
    them, so a new skill changes those counts and, if it adds a kind of edge, the examples
11. `plugins/atk/shared/state-signals.md`, if something on disk says the skill is the next one
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

When adding, renaming, or removing an **`atkx` skill**, the list is shorter, because an `atkx` skill
writes no team artifact and sits in no delivery phase. Eight of the twelve groups apply, read for
`atkx`, plus one of its own:

1. `plugins/atkx/skills/<name>/SKILL.md`
2. `README.md`, the `atkx` section rather than the `atk` skills table and invocation block
3. `docs/skills-overview.md` and `docs/vi/skills-overview.md`
4. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`
5. `.github/ISSUE_TEMPLATE/bug-report.yml`, a `Skill - atkx:<name>` entry beside the `atkx` line
6. The three `plugins/atkx/.*-plugin/plugin.json` descriptions, the Codex copy inside
   `interface.longDescription` included, and the `atkx` entry of `.claude-plugin/marketplace.json`
7. `docs/system-architecture.md` and `docs/vi/system-architecture.md`, if the skill changes what the
   layout or the `atkx` plugin is for
8. The `skill: <name>` label on the GitHub repository and its entry in `.github/labeler.yml`, with the
   glob `plugins/atkx/skills/<name>/**`
9. The Skills table in `plugins/atk/skills/help/references/atkx-skills.md`, which is how `atk:help`
   knows the skill exists; the check under "Common verification commands" fails on a folder missing
   from it or a row for a skill that is gone

The other groups do not apply. The count of 25 is `atk`'s, and `package.json` carries it.
`plugins/atk/shared/artifact-paths.md` and `docs/artifact-lifecycle.md` list team artifacts, which an
`atkx` skill does not write. `plugins/atk/skills/init/references/role-defaults.md`, the tables in
`docs/flow/`, and `plugins/atk/shared/state-signals.md` place skills in delivery
phases. And no file under `plugins/atk/` other than those of `atk:help` may name `atkx`, per
`CONV-011`.

`atkx` adds three things of its own: the harness-support line its acceptance bar asks for, in
"`atkx` sits beside `atk`"; the run-time check for any `atk:<skill>` the skill calls; and a name no
`atk` skill already uses, since the two kits share the `skill:` label namespace and the labeler check
in `tests/verify.sh` fails on a folder name found in both.

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

After edits, verify. `CLAUDE.md` is excluded because this section quotes the character in order to
document this very check, and every `CHANGELOG.md` for the reason given under "The kit stands alone".
The `plans/` and `docs/` filter is anchored to the path at the start of the line, so a line that
only mentions one of those directories is still checked.

```bash
grep -rn "—" . --exclude-dir=.git --exclude=CLAUDE.md --exclude=CHANGELOG.md | grep -v -E '^\./(plans|docs)/'
```

Should print nothing (`grep` exits 1).

## Diagrams are Mermaid, except where they are not

Every flow, graph, and diagram in a doc, in the README, or in an artifact a skill produces is a
fenced `mermaid` block. The drawing rules are in `plugins/atk/shared/diagram-conventions.md`, which is also what
the seven diagram-producing skills cite; do not restate them here or in a `SKILL.md`.

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
its Layers table, and the mirror check in `tests/verify.sh` excludes both paths.

| File | Purpose |
|------|---------|
| `skills-overview.md` | Reader-facing explanation of every skill: what it produces, when to use, when not to |
| `artifact-lifecycle.md` | Which artifacts to commit, which may be deleted, and what each deletion costs |
| `project-overview-pdr.md` | What atk is, goals, non-goals |
| `system-architecture.md` | Multi-harness layout, the `plugins/atk/shared/` layer, and the load model |
| `codebase-summary.md` | File-by-file reference of every tracked file (goes stale on any file add or remove) |
| `project-roadmap.md` | Phase plan and status |
| `adr/*.md` | Architecture decision records, one decision each; `0001` records `atk` and `atkx` as sibling plugins, `0002` the scripts of `atkx:skill-eval`, `0003` `atk:orchestrate` and the ways it runs jobs, `0004` to `0006` the run trace, `0007` the document mode of `atk:catchup` |
| `trigger-eval-measurement.md` | How to get a true reading out of `evals/trigger_evals.json`, and why a generic eval harness returns a number that is not one |
| `flow/project-flow.md` | The 25 skills placed in delivery phases, with the author and approver of each artifact |
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
request of its own; and `last-release-sha`, the `v0.1.0` commit, also tagged `atk-v0.1.0`, so the first
release after the split has a boundary even though no GitHub release named `atk-v*` exists yet.

`plugins/atkx` is a second package, tagged `atkx-v<version>`, whose three `plugin.json` files share
its version. Its state started at `0.0.0` with `"initial-version": "0.0.1"`: release-please treats a
`0.0.0` package as never released and would have opened its first release at `1.0.0` without that
line. That first release was `atkx-v0.0.1`, and `plugins/atkx/CHANGELOG.md` dates from it.

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
| `CONV-001` | Adding, renaming, or removing an `atk` skill touches all twelve groups of file listed for it | `REVIEWED` | none for eleven groups; the labeler check in `tests/verify.sh` for group 12 | `BLOCKING` | "Adding or changing a skill touches several files" |
| `CONV-002` | Every `docs/**/*.md` has a `docs/vi/**/*.md` counterpart at the same relative path, with the same content, `docs/derived/` and `docs/records/` excepted | `REVIEWED` | the mirror `diff` in `tests/verify.sh` | `BLOCKING` | "Docs are bilingual" |
| `CONV-003` | No em-dash in user-authored content | `REVIEWED` | the `grep` in that section | `SHOULD FIX` | "Em-dash policy" |
| `CONV-004` | No skill, shared file, README, or doc names a command belonging to another kit, `docs/derived/` and `docs/records/` excepted | `REVIEWED` | the `grep` in that section | `BLOCKING` | "The kit stands alone" |
| `CONV-005` | Each `SKILL.md` frontmatter `name:` is lowercase, hyphen-only, and matches its folder | `REVIEWED` | the name check in `tests/verify.sh` | `BLOCKING` | "SKILL.md `name` field convention" |
| `CONV-006` | A `SKILL.md` stays under 300 lines, keeps the fixed section order, opens its workflow with the override line and the two lines that start the run trace, and lists triggers in English, Vietnamese, and Japanese | `REVIEWED` | `wc -l` for the length; the trace-line check in `tests/verify.sh` for the workflow lines; the rest by reading | `BLOCKING` | "Skill folder layout", "Trigger phrases are multilingual on purpose" |
| `CONV-007` | A diagram is Mermaid, except the `## Workflow` pipeline and directory trees, and carries no hardcoded fill colour | `REVIEWED` | the `grep` in that section | `SHOULD FIX` | "Diagrams are Mermaid, except where they are not" |
| `CONV-008` | Every manifest, every marketplace file, and every `evals/*.json` parse, every `references/*.tsv` line carries its header's field count and a valid `checked` date or none, a checklist's IDs are unique and its dimensions and techniques valid, the version-bearing files of each release package agree, and every plugin is listed by all three marketplaces and released as a package of its own, with no manifest path leaving it | `REVIEWED` | the parse, `.tsv`, version and marketplace checks in `tests/verify.sh` | `BLOCKING` | "Release flow", "Common verification commands" |
| `CONV-009` | `plugins/atk/hooks/hooks.json` keeps both hooks in exec form with `"command": "node"`, `plugins/atk/hooks/codex-hooks.json` keeps the same two in string form with `${PLUGIN_ROOT}` and no `args`, both stay Node, the two files register the same events and matchers, and every script they name exists | `REVIEWED` | the registration check in `tests/verify.sh` | `BLOCKING` | "`hooks/` never holds a rule" |
| `CONV-010` | No record, commit message, or pull request body names a client project, its tickets, its custom fields or internal tools, or its people | `REVIEWED` | none; read, since a check would have to list the names | `BLOCKING` | "A record here names no client" |
| `CONV-011` | `atk` never invokes `atkx`, and only `atk:help` names it, where no `atk` skill handles the request and with the install commands when it is not installed; no symlink crosses from one plugin to the other | `REVIEWED` | the `grep` and the `find` in that section | `BLOCKING` | "`atkx` sits beside `atk`, and the dependency runs one way" |
| `CONV-012` | A plugin reads nothing outside its own directory: every `shared/` or `references/` file a plugin file cites exists inside that plugin, and no plugin file names one of this repository's documents except as a GitHub link | `REVIEWED` | the citation check in `tests/verify.sh` | `BLOCKING` | "Multi-manifest layout (non-obvious)" |
| `CONV-013` | Adding, renaming, or removing an `atkx` skill touches every group of the `atkx` list | `REVIEWED` | none for seven groups; the labeler check in `tests/verify.sh` for the label group; its `atkx-skills.md` check for group 9 | `BLOCKING` | "Adding or changing a skill touches several files" |

Numbers are sequential and never reused. A rule that stops applying is struck through rather than
deleted, so a review that cited it stays readable.

Three things worth automating, proposed and not installed. A CI job running `bash tests/verify.sh` would
move most of this table to `ENFORCED` and stop a reviewer spending attention on it. `CONV-001` is the
one that would need writing rather than wiring: a check that a diff touching `plugins/atk/skills/` also touches
the twelve groups. The third is a profile check, and it belongs to a project rather than to this
repository: that a `.atk/profile.md` whose `Shape` names members carries a Repositories table, that
one whose shape does not carries none, and that every path and every `Repository` cell elsewhere in
the file resolves to a row of it. None is done here, and all three belong to whoever owns the
repository's tooling.

## Common verification commands

The checks live in `tests/verify.sh`, outside the plugins, so no install copies them:

```bash
bash tests/verify.sh   # every line should start with OK; any other line is a failure
```

In order: every manifest, marketplace file and registration parses; `SKILL.md` names match their
folders; every `atk` skill carries the two run-trace lines under its override sentence; no nested
`SKILL.md`; `docs/` and `docs/vi/` are mirrored; the hook scripts are valid Node, `check-profile`
walks to the right profile, and `load-overrides` answers only for `atk:` skills and refuses a
symlink out of `.atk/overrides/`; the two hook registrations agree; the marketplaces and the
plugins agree; a plugin reads nothing outside itself; `.github/labeler.yml` matches the tree;
`atkx-skills.md` lists every `atkx` skill; every agent holds Read, Grep and Glob only; the secret
scan finds every shape in all four modes and leaks no value; the git premises of `atk:orchestrate`
hold; trigger evals parse; every `references/*.tsv` line is well formed; no dated name lost its
time; no reference template carries a ticket line; each release package agrees on its version;
`atkx:skill-eval` judges its fixtures as `expected.json` says, holds its behaviours outside them,
and its trigger runner counts correctly.

The five checks kept beside their own rules, `ak:`, `atkx`, the em-dash, `fill:#`, and symlinks
under `plugins/`, are run from their sections above. A change to `tests/verify.sh` is checked by
running it, not by reading it.
