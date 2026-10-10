# Codebase Summary

File-by-file reference of every tracked file. This document goes stale the moment a file is added,
removed, or renamed; update it in the same commit.

## Root

| File | Purpose |
|------|---------|
| `README.md` | Public entry point: lifecycle diagram, the 24-skill table, invocation block, output convention, install instructions |
| `CLAUDE.md` | Maintainer guidance: the team premise, multi-manifest layout, skill anatomy, the `plugins/atk/shared/` DRY rule, cross-file sync list, em-dash policy, the `CONV-NNN` review checklist this repository is held to, release flow, verification commands |
| `LICENSE` | MIT |
| `package.json` | `private: true`, no scripts; exists to carry the version and repository metadata |
| `release-please-config.json` | Release automation: `simple` release type, pre-1.0 bump flags, and one package per plugin, `plugins/atk` tagged `atk-v*` and `plugins/atkx` tagged `atkx-v*`, each with its own release pull request; `atk`'s version `extra-files` include the root `/package.json` |
| `.release-please-manifest.json` | Release-please state file holding the current version per package path. Never hand-edit |
| `.gitignore` | macOS, Python, Node artifacts |

## Manifests

| File | Purpose |
|------|---------|
| `plugins/atk/.claude-plugin/plugin.json` | Claude Code plugin metadata. No `skills` key: Claude auto-discovers `plugins/atk/skills/` |
| `.claude-plugin/marketplace.json` | Claude Code marketplace listing `atk` at `./plugins/atk` and `atkx` at `./plugins/atkx`, with no version of their own |
| `.cursor-plugin/marketplace.json` | Cursor marketplace listing `atk` and `atkx` at `plugins/atk` and `plugins/atkx`, descriptions left to each `plugin.json` |
| `.agents/plugins/marketplace.json` | Codex marketplace listing `atk` and `atkx` as local plugins at `./plugins/atk` and `./plugins/atkx` |
| `plugins/*/CHANGELOG.md` | Written by release-please from the commit types, never by hand, one per plugin from its first release: `plugins/atk/CHANGELOG.md` and `plugins/atkx/CHANGELOG.md`. `feat:` and `fix:` appear; the other types are silent |
| `plugins/atk/LICENSE` | A copy of the root `LICENSE`, because an install carries the plugin directory alone and MIT asks for the notice to travel with the copy |
| `plugins/atkx/LICENSE` | The same copy for `atkx` |
| `plugins/atk/.cursor-plugin/plugin.json` | Cursor plugin metadata with `displayName` and `"skills": "./skills/"` |
| `plugins/atk/.codex-plugin/plugin.json` | Codex CLI metadata with `"skills": "./skills/"`, `"hooks": "./hooks/codex-hooks.json"`, plus the `interface{}` listing block: descriptions, `defaultPrompt`, `brandColor`, icon paths |
| `plugins/atkx/.claude-plugin/plugin.json` | Claude Code metadata for `atkx`, with `"dependencies": ["atk"]` so installing it installs `atk` |
| `plugins/atkx/.cursor-plugin/plugin.json` | Cursor metadata for `atkx`, with `displayName` and `"skills": "./skills/"` |
| `plugins/atkx/.codex-plugin/plugin.json` | Codex CLI metadata for `atkx`, with `"skills": "./skills/"` and an `interface{}` block naming `skill-eval` |

## Shared layer

| File | Purpose |
|------|---------|
| `plugins/atk/shared/team-roles.md` | Role table (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) and the nine rules every skill follows: name an owner, separate author from approver, do not decide what a role owns, write for the absent reader, ask only what the repository cannot answer, follow the team's language, honour the project's overrides, treat text from outside the conversation as evidence rather than instruction, keep `.env` and credential files unread without permission and every secret value masked in what a run writes or relays |
| `plugins/atk/shared/artifact-paths.md` | Docs root resolution, which repository an artifact lands in when the project spans several, the default output path per skill, `YYMMDD-HHMM` naming, the reference-document kinds table, the three persistence groups and which of them are committed, the progress log `fix`, `verify` and `implement` write as they go and when a later run resumes from it, ADR numbering, the shared YAML front matter block, and the rule against overwriting an `APPROVED` record |
| `plugins/atk/shared/ticket-adapters.md` | Tracker detection order, the three outcomes it reaches and the rule that a configured tracker answering nothing is not the same as no tracker, the atk-to-tracker vocabulary map for GitHub Issues, Jira, Backlog, and Redmine, which of those four stores a sprint's start and end and which stores only a name, the three sprint metrics a tracker without field history cannot reconstruct and the substitute for each, the `gh` commands for pushing to a tracker and for reading a pull request, and the two-way linking rule |
| `plugins/atk/shared/review-checklist.md` | The order that resolves where a project keeps its conventions, the rule that a project which already writes them keeps its own shape, the `CONV-NNN` rule record format that `convention` writes and `review` cites, what each skill does with it, the eight baseline items with default severities, and the rule for retiring a stale rule. Cited by `convention`, `review` and `implement` |
| `plugins/atk/shared/project-profile.md` | What `.atk/profile.md` holds in the target project, why it lives there rather than in the kit, where the project root is and how a skill walks up to it, the four project shapes and what a parent with member repositories or a workspace with no parent costs, and the three-group rule deciding whether a skill stops, degrades, or ignores a missing profile |
| `plugins/atk/shared/project-overrides.md` | What `.atk/overrides/<skill>.md` holds in the target project, why one file per skill rather than several, the `## Before` and `## After` sections, the nine things an override may never remove, that only an approved override applies and the line a skill prints when it does not, the line it makes a skill print when it skips one, and where the directory sits when a project spans several repositories. Reached from rule 7 of `plugins/atk/shared/team-roles.md`, so every skill honours it |
| `plugins/atk/shared/finalize-steps.md` | The closing sequence for any finished work: the reference documents it owes, branch, commit, merge, the consent line every action past the commit has to cross, and the order a change spanning several repositories is carried in. `atk:git` carries it out; this file is the contract. Cited by every skill that finishes something |
| `plugins/atk/shared/layer-verification.md` | The five-layer table: what to run for a layer, what a pass proves, and what it does not. Cited by `fix`, `implement`, and `verify`, so all three say the same thing about the same result |
| `plugins/atk/shared/diagram-conventions.md` | When a diagram earns its place in an artifact, the four shapes the kit draws (approval flow, dependency graph, sequence, causal chain), and the rules that keep them readable: Mermaid only, `<br/>` not a literal newline, roles instead of names, both branches on every decision, a long chain drawn top-down, no hardcoded fill colours. Cited by `catchup`, `design-doc`, `plan`, `breakdown`, `security`, and `incident` |
| `plugins/atk/shared/host-capabilities.md` | Which capabilities of the host agent a skill may use and how to name one, the rule that a command from another kit still may not be named, what to do on a harness that has neither, the four rules of the tidy step, the policy bounding how many reviewers a round runs at once, the `atk:read-only-reviewer` agent every reviewer is spawned as and the masked `diff.patch` written for it, what one turn of an interview counts as on a harness that asks several questions at once, when a connection to an outside service may be named, browser automation, named by what it does and the one capability whose absence stops a skill, and reading wide through an agent that returns conclusions with `path:line` rather than file bodies. Cited by `fix`, `implement`, `verify`, `review`, `design-doc`, `plan`, `init`, `run-cases`, `help`, `catchup`, `spec`, `convention`, `security`, and `onboard`, and by `design-sources.md` and `independent-challenge.md` |
| `plugins/atk/shared/spec-docs.md` | What separates a reference document from a design document, the rule that the project's own document shape wins over a kit template, the six kinds of change that oblige a pull request to carry its reference document, a screen's components among them, what that obligation becomes when the document lives in another repository, and the line between drift and a question nobody has answered. Cited by `spec`, `design-doc`, `implement`, `fix`, `verify`, and `review`, and read by `qa`, `run-cases`, and `help` |
| `plugins/atk/shared/host-file-locations.md` | Host detection in its own order, the locations GitHub and GitLab read `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` from, both spellings, and the rule that a file present at any of them is present, including why a stub counts as absent. Cited by `convention` to decide what is missing, by `git` to find the template it fills, and by `init` to find the `CODEOWNERS` that already holds the team's host identifiers |
| `plugins/atk/shared/design-sources.md` | How a skill reads a Figma design: the connection found by what it can do, its three states (not installed, not signed in, ready) and the fallback to exported images, the three reading passes, hidden layers skipped, one link holding several screens, the node ID as the stable key, the values a design does not show, and the `design_source`, `design_node`, `design_read` and `design_fingerprint` fields a read records. Cited by `spec` for the `screen` kind, by `intake` for a design given as the request, and by `qa` for the `GUI` cases of a screen with no screen spec |
| `plugins/atk/shared/feature-types.md` | The one classification of features in the kit: nine types, each with the extra understanding-check questions and a QA risk, `Low` for a feature no row describes, and the rule that a row is added with both columns filled. Cited by `catchup` and `estimate` through their references |
| `plugins/atk/shared/tidy-pass.md` | The content of the tidy step: three lenses (reuse, clarity, efficiency), what may be changed, what is never touched, and what to read in the diff afterwards. Cited by `fix`, `implement`, and `verify` through `host-capabilities.md`, and the reason the kit ships no `simplify` skill |
| `plugins/atk/shared/plain-writing.md` | How the prose of a run's report is written for a reader who has opened nothing it cites: the `In short` section that opens the report, five rules for the prose around the evidence (example first, what happened before what it means, a citation points rather than explains, a term said in words before it is used, what went wrong kept apart from what changed and what is left to decide), and what never changes. Cited by the report templates of `fix`, `verify`, `review`, `security`, and `qa --record`, the last also reached by `run-cases` through the record shape it reuses, and by `## Output` of `incident` |
| `plugins/atk/shared/independent-challenge.md` | How a draft is put before agents that read it cold: what each agent gets and never gets, the at most five objections it returns and what each must name, how the calling agent checks, merges, and answers each `Changed` or `Open`, and the `Pre-review objections` section that says it is not a review. Its lens agents are `atk:read-only-reviewer`. Cited by `design-doc` through `role-challenge.md` and by `plan` through `plan-challenge.md` |

## Agents

| File | Purpose |
|------|---------|
| `plugins/atk/agents/read-only-reviewer.md` | The one agent the kit ships, `atk:read-only-reviewer` on Claude Code. Tools Read, Grep and Glob only, so it has no tool that edits, runs or starts anything; `readonly: true` for Cursor. Spawned for every agent of `atk:review` other than the band 1 reviewer, for the lenses of `atk:design-doc --challenge` and `atk:plan --challenge`, and for the wide reads of seven skills, with a general agent and the same prompt where the type is missing. Reads a diff the calling agent masked into the git directory, follows rule 9 by its instructions alone, and returns findings with `path:line`. Measured on Claude Code 2.1.296; Cursor and Codex not tested, and what they do with `agents/` comes from their documentation as read on 2026-10-10 |

## Hooks

| File | Purpose |
|------|---------|
| `plugins/atk/hooks/hooks.json` | Registers two Claude Code hooks, both in exec form so no shell is involved on any platform: `"command": "node"` plus `${CLAUDE_PLUGIN_ROOT}` in `args` |
| `plugins/atk/hooks/codex-hooks.json` | Registers the same two scripts for Codex, which substitutes a plugin root inside `command` and never inside `args`: one string `command` per hook, carrying `${PLUGIN_ROOT}`. Reached through the `hooks` key of `plugins/atk/.codex-plugin/plugin.json`, which is also what keeps Codex off the Claude Code file. Codex calls that key legacy and codex-cli 0.162.0 still reads it, and runs the hooks only after the user trusts them in `/hooks` |
| `plugins/atk/hooks/check-profile.mjs` | `SessionStart`. Node ESM, so it behaves the same on Linux, macOS, and Windows. Prints one reminder when a git repository has no `.atk/profile.md` at or above it, walking up and accepting a profile found above only when it names the directory the walk started in, so a member repository of a project whose profile sits in the parent stays silent while an unrelated repository under the same folder is still reminded, once per project, and exits 0 on every path. Never blocks, never writes into the user's repository. Registered on Claude Code and on Codex, where it runs once the user has trusted it; Cursor has no wrapper yet |
| `plugins/atk/hooks/load-overrides.mjs` | `PreToolUse` with matcher `Skill`. Puts `.atk/overrides/<skill>.md` in front of the skill that owns it, saving a read and nothing more. Answers only for skills under the `atk:` namespace, so another kit's same-named skill never receives this project's instructions. Prints an empty object for another tool, another namespace, a bare name, a missing file, a name with a path separator, a file whose real path, symlinks resolved, lies outside `.atk/overrides/`, or malformed input, and names rather than inlines a file past 4096 characters. Every skill opens the file itself where no hook ran |

## `.atk/` in this repository

The kit applied to itself. Written by `atk:init` and `atk:tailor` in this repository, read by the
skills at the top of their workflow, and committed so the next maintainer inherits both. A plugin
install copies `plugins/atk/` alone, so neither file reaches a user. Each says in its first line
that it belongs to this repository, and no skill reads either for another project.

| File | Purpose |
|------|---------|
| `.atk/profile.md` | This repository's own profile: no build and no test command, so the Commands section points at the "Common verification commands" section of `CLAUDE.md` instead, and at the four checks kept beside their rules, plus three layers, content, docs and hooks, `docs/` as the docs root, `CLAUDE.md` as both the conventions and the review checklist, and GitHub Issues as the tracker |
| `.atk/overrides/review.md` | The override `atk:tailor` wrote for `atk:review` here: a diff touching a verification command block in `CLAUDE.md` has to be checked by running the block, not by reading it, at `BLOCKING`. The repository's content rules stay out of it; those are the `CONV-NNN` rows in `CLAUDE.md` |

## Skills

Each skill is one `SKILL.md` with an `evals/trigger_evals.json` beside it. Nineteen also carry
`references/`; the other five do not yet.

| File | Stage | Produces |
|------|-------|----------|
| `plugins/atk/skills/help/SKILL.md` | Any point | No file: the skill to run next from the project's state, the evidence behind it, and what waits on whom |
| `plugins/atk/skills/init/SKILL.md` | Setup | `.atk/profile.md`: commands, layers, docs roots, tracker, team, and how to verify at runtime |
| `plugins/atk/skills/tailor/SKILL.md` | Setup | `.atk/overrides/<skill>.md`: what this team wants one skill to do differently, with the owning role as approver |
| `plugins/atk/skills/intake/SKILL.md` | Requirement | User stories, acceptance criteria, non-goals, open questions with owners |
| `plugins/atk/skills/catchup/SKILL.md` | Requirement | A brief for someone who was not in the conversation, plus the understanding check for an epic |
| `plugins/atk/skills/estimate/SKILL.md` | Planning | Sizes with basis and confidence, capacity, sprint commitment, overflow |
| `plugins/atk/skills/design-doc/SKILL.md` | Design | Technical design with compared options, plus the ADR; under `--spike`, a time-boxed investigation ending in a recommendation; under `--challenge`, objections raised per signing role before review |
| `plugins/atk/skills/spec/SKILL.md` | Design | Reference documents for API, schema, feature, and screen, updated in place, plus the drift check |
| `plugins/atk/skills/breakdown/SKILL.md` | Planning | Owned tasks, dependency graph, parallel lanes with file ownership |
| `plugins/atk/skills/convention/SKILL.md` | Development | Team conventions classified enforced / reviewed / aspirational |
| `plugins/atk/skills/plan/SKILL.md` | Development | Phases ending in something reviewable, steps that leave the tree working, scope boundary; under `--review`, findings about a plan somebody else wrote; under `--challenge`, one agent per lens over a written plan; under `--answer`, the answers to its open questions recorded |
| `plugins/atk/skills/implement/SKILL.md` | Development | The code, verified by layer, plus the record that becomes the pull request body |
| `plugins/atk/skills/fix/SKILL.md` | Development | A proven cause, the smallest change removing it, and a report of what was checked |
| `plugins/atk/skills/verify/SKILL.md` | Development | The running system exercised, side effects asserted in data, escalation after three rounds |
| `plugins/atk/skills/review/SKILL.md` | Development | Findings ranked blocking / should fix / nit, optionally posted to the PR |
| `plugins/atk/skills/qa/SKILL.md` | Verification | Test plan, traced test cases, regression matrix, entry and exit criteria |
| `plugins/atk/skills/run-cases/SKILL.md` | Verification | Approved cases executed by the agent on a deployed non-production environment: triage, an agreed scope, at most three rounds, and a run record of observed results only |
| `plugins/atk/skills/security/SKILL.md` | Any point | A security record: scope and trust boundaries, scanners run, threats per boundary, verified findings, a checklist answered item by item, residual risk left for a person to accept; and the threat model of a feature |
| `plugins/atk/skills/git/SKILL.md` | Version control | The diff read before staging, a scan that stops on a credential, commits that revert alone, and push, pull request and merge each behind their own yes |
| `plugins/atk/skills/release/SKILL.md` | Delivery | Notes per audience, checklist with owners, migrations, rollback, sign-offs |
| `plugins/atk/skills/incident/SKILL.md` | Operation | Timeline, proven root cause, blameless postmortem, actions, runbook |
| `plugins/atk/skills/retro/SKILL.md` | Improvement | Previous actions verified, sprint evidence, three actions, status report |
| `plugins/atk/skills/onboard/SKILL.md` | Team | Verified setup, access list, code map, first week ending in the contribution the role makes |
| `plugins/atk/skills/handover/SKILL.md` | Team | True state of in-flight work, decisions, traps, access transfer, receiver sign-off |

### References

Loaded only when a workflow step opens them, so they stay out of the default context.

| File | Purpose |
|------|---------|
| `plugins/atk/skills/help/references/atkx-skills.md` | The one file under `plugins/atk/` that lists `atkx` skills: what each is used for, its invocation and harnesses, the install commands per harness, which of an `atk` and an `atkx` skill wins a question, and what `Needs first` and `Approved by` say for one |
| `plugins/atk/skills/help/references/state-signals.md` | Which artifacts gate the next skill while they wait for approval, the evidence on disk that names that skill, in the order to check it, and how the artifacts waiting on a person are collected |
| `plugins/atk/skills/init/references/detection.md` | How the project root and the repository shape are resolved before anything else, where to look for each profile field, and what to do when the repository gives several answers or none |
| `plugins/atk/skills/init/references/profile-template.md` | The shape of `.atk/profile.md` that `init` fills in, the Repositories table a multi-repository project carries, and the rule that every path is written from the project root |
| `plugins/atk/skills/init/references/role-defaults.md` | What each role authors, accepts, and reviews across the 24 skills; `init` proposes the Accepts column as each role's default approvals, and `plugins/atk/shared/team-roles.md` cites it |
| `plugins/atk/skills/tailor/references/interview.md` | The five groups of question, the filter that sends an answer to `init` or `convention` instead, and a worked example per group |
| `plugins/atk/skills/tailor/references/audit.md` | The three `--audit` checks, why a conflict is a fact and a stale anchor is a question, and the rule that it changes nothing |
| `plugins/atk/skills/tailor/references/feedback.md` | The three-way fork a bad run splits into, what the `--feedback` record holds, the two things it may never hold, and how the mode changes for a skill that is not one of the kit's |
| `plugins/atk/skills/intake/references/requirement-template.md` | The fixed shape of a requirement: the seven numbered sections, the story sentence, the `AC N.M` IDs other skills cite and why they are never renumbered, the open-questions and impacted-areas columns, and what stays unchanged under `--lang` |
| `plugins/atk/skills/catchup/references/brief-template.md` | One skeleton for both modes, with the epic and pull-request differences marked per section |
| `plugins/atk/skills/catchup/references/understanding-check.md` | The fixed questions, how many feature type questions a group takes from `plugins/atk/shared/feature-types.md`, and the two rules deciding whether the check is worth anything |
| `plugins/atk/skills/estimate/references/estimate-template.md` | The fixed shape of an estimate sheet: the nine numbered sections, the comparables table with the layer, technology and way of building that per-item bases cite by ID, the calibration a rate per point must show, the comparison column an uncalibrated model is confined to, the totals that must reconcile, and the `DRAFT` status while a capacity input is still owed |
| `plugins/atk/skills/estimate/references/complexity-drivers.md` | What a size is judged from: countable drivers per layer, why technology and verification cost matter more once code is generated, QA risk by feature type, the drivers of understanding a spec, and where a project's own rubric goes |
| `plugins/atk/skills/design-doc/references/spike.md` | The `--spike` mode: one question that separates options, the time box and who set it, what would count as an answer written before looking, the three kinds of evidence, why a prototype stays out of the change, and the spike record |
| `plugins/atk/skills/design-doc/references/role-challenge.md` | The design half of the `--challenge` pass: which roles get an agent and the questions each brings, that an objection left open is for the role and one against the chosen option is the Tech Lead's, and where the `Pre-review objections` section sits in the design. The procedure itself is `plugins/atk/shared/independent-challenge.md` |
| `plugins/atk/skills/convention/references/collaboration-files.md` | What `CONTRIBUTING.md`, a pull request template and `CODEOWNERS` each carry, where each host keeps them, and why an owner never comes from git history |
| `plugins/atk/skills/convention/references/stack-standards.md` | How a language or technology is detected from what is on disk and in which order of trust, the threshold below which it is not the stack, how derived rules are grouped by technology and, where one technology spans several of the profile's layers, by layer, and the shape of the `docs/standards/` set |
| `plugins/atk/skills/convention/references/standard-sources.md` | What each of the seven fields of `standard-sources.tsv` means, what a `checked` date proves, what a run may draw from a line and what it may never copy, where a team adds its own sources, and the sparse fetch with its cache location and failure rule |
| `plugins/atk/skills/convention/references/standard-sources.tsv` | The sixteen published standards themselves, one per line in the seven fields `standard-sources.md` defines, under a header line; the field count and the `checked` dates are checked in `CLAUDE.md` |
| `plugins/atk/skills/plan/references/step-ordering.md` | The two cuts, phase and step, and the rule for each |
| `plugins/atk/skills/plan/references/plan-template.md` | The plan index and the phase file |
| `plugins/atk/skills/plan/references/plan-self-review.md` | The eight claims a plan makes, how to reopen each against the repository, what to do with each result, and the sweep that searches every plan file for the old form of a correction |
| `plugins/atk/skills/plan/references/plan-review-mode.md` | Reviewing a plan somebody else wrote: the inputs, how each result converts, the severities, and the report |
| `plugins/atk/skills/plan/references/report-format.md` | The shape of the plan review report: severity-prefixed result identifiers and how they carry into a later review of the same plan, the labels under each result and why none of them names a fix, the table that places the results per phase, the sections in order, and why neither a verdict nor a score appears in any of them |
| `plugins/atk/skills/plan/references/plan-challenge.md` | The plan half of `--challenge`: the four lenses and their questions, that a scope objection never removes a step and an objection showing two approaches is the design gate, the section 7 it writes, the order of read-back, challenge and sweep, and the table that decides whether a challenge is recommended at hand-off. The procedure itself is `plugins/atk/shared/independent-challenge.md` |
| `plugins/atk/skills/plan/references/answer-mode.md` | `--answer`: the checks every edit of a written plan runs first, including when an `APPROVED` plan goes back to `IN REVIEW` and when it is superseded, collecting answers to a plan's open questions in one turn, the record of who answered and when with secrets redacted, the `Answered` subsection, editing only the phases an answer changes, then the read-back, the sweep, and the challenge recommendation again |
| `plugins/atk/skills/implement/references/plan-gate.md` | The three settings deciding how much agreement the work needs before code is written, and what to do with the open questions and the design fork a plan hands back |
| `plugins/atk/skills/implement/references/verification.md` | The order to run checks in, how far to reach, and when to stop |
| `plugins/atk/skills/implement/references/review-fix-loop.md` | The team review run against the skill's own output, and the ceiling that stops the loop hiding a design problem |
| `plugins/atk/skills/fix/references/investigate.md` | Proving the cause, the intent check, and the gate that decides whether a fix may happen at all |
| `plugins/atk/skills/fix/references/layer-playbooks.md` | Per layer: where the cause usually hides, how to reproduce it, and how to confirm it is gone |
| `plugins/atk/skills/fix/references/report-template.md` | The fix report, written for a reviewer who has to check a claim rather than trust it |
| `plugins/atk/skills/spec/references/api-spec-template.md` | The API document shape for an empty directory: processing strategy first, then one block per endpoint |
| `plugins/atk/skills/spec/references/db-spec-template.md` | The table document shape: columns, keys, the lifecycle of a row, access rules |
| `plugins/atk/skills/spec/references/feature-spec-template.md` | The feature document shape: entry points including jobs, behaviour by condition, permissions by role |
| `plugins/atk/skills/spec/references/screen-spec-template.md` | The screen document shape: the component table keyed by Figma node ID, states, proposals marked and cited, and how a changed design is folded in row by row |
| `plugins/atk/skills/spec/references/drift-check.md` | The coverage checklist, the shape of a finding, the three severities, and the read-only boundary |
| `plugins/atk/skills/verify/references/runtime-checks.md` | Checking the data store against the branch, fixtures for one case, bringing the application up, exercising it, asserting a real side effect, and cleaning up, shared stores and created resources included, plus the progress log this skill writes and what a resume reuses from it |
| `plugins/atk/skills/verify/references/ui-checks.md` | The `--ui` pass: comparing a screen against the design |
| `plugins/atk/skills/verify/references/report-template.md` | The verification report, naming what was proven and what was not |
| `plugins/atk/skills/review/references/review-rounds.md` | The nine rounds and what each one opens first, the band of changed lines that decides whether they run in agents of their own, which of them take copies under `--parallel` and which never do, which changed lines count towards the band and why a generated file does not, what to do when an agent does not come back, how the calling agent drives them one round ahead without showing any of them what the others found, and how findings become one ranked list within a round and then across rounds, with the masked diff every agent reads, `<base>...HEAD` for a branch and `--worktree` for a change not yet committed |
| `plugins/atk/skills/review/references/report-format.md` | The shape of the review report: severity-prefixed finding identifiers and how they carry into a later review of the same target, the labels under each finding including the convention rule it cites, the round table, the sections in order, which language they are written in, and why no score appears in any of them |
| `plugins/atk/skills/qa/references/case-dimensions.md` | The ten dimensions each acceptance criterion is walked through for negative and boundary cases, the techniques that decide how many cases a dimension gives (equivalence partitioning, boundary values, decision tables, state transitions, pairwise, error guessing), the `[ASSUMPTION]` mark for an inferred value, the rule that a skipped dimension carries its assumption, and the priority a case takes from what breaks |
| `plugins/atk/skills/qa/references/test-case-template.md` | The cases file: the columns, the three sections `ACCESSING`, `GUI` and `FUNCTION` and what each never holds, the testcase types, the ID that is never given to a second case, the Sources table a run records, the `Source` column, the mapping onto a company spreadsheet form, the CSV export rules, and why the five execution columns stay empty in a reference document |
| `plugins/atk/skills/qa/references/checklists.md` | The component checklist: the seven fields of a viewpoint line, the eighteen component keys, what a run may do with a line, why a viewpoint never adds behaviour the sources do not state, and the rule that a team's own checklist replaces it for the components it covers |
| `plugins/atk/skills/qa/references/checklists.tsv` | The viewpoints themselves, one per line, each naming its component, its dimension, and the technique that decides how many cases it gives |
| `plugins/atk/skills/qa/references/update-mode.md` | The `--update` pass: the Sources table as the baseline, compared by content hash or design fingerprint so it holds across repositories and intervening commits, what changed sorted into new, modified, and deleted, how a person's row is told from the last run's, every ID ever used taken from the file's history, the two answers an approver gives to a question it raised, what a never-approved file lets the run merge and what an approved one turns into questions, and the run summary a reviewer checks the diff against |
| `plugins/atk/skills/qa/references/test-run.md` | The `--record`, `--bug` and `--retest` modes: the record's time-stamped name and the only three changes allowed after it is written, the data a record must never carry and how it is redacted, what a run needs from the tester, the run record's shape with its summary against the exit criteria and a defect section carrying what `atk:fix` needs, raising chosen defects on the tracker after the list is shown, a retest as a narrow new run whose verdict is offered as a comment, and what a record `atk:run-cases` wrote carries instead |
| `plugins/atk/skills/qa/references/review-mode.md` | The `--review` pass: who may run it and why never the owner, the sources it opens, the eleven passes each asking one question of every row, why a corrected copy, a score, and count tables are left out, the severity scale shared with `atk:review`, what a finding carries, and the derived report it writes without touching the cases file |
| `plugins/atk/skills/qa/references/test-plan-template.md` | The test plan: scope, test levels UT to UAT, test types from the stated non-functional requirements, environments with the kind of each, compatibility, the Regression section holding the matrix and the design's migration and rollback cases, entry and exit per level, defect severity with response targets left to the PM, and a link to the schedule rather than a copy of it |
| `plugins/atk/skills/run-cases/references/environment-safety.md` | Where the target comes from, the test plan row and its `Kind`, why production and the local stack are refused, the row with no named owner, a plan written before `Kind`, the cases never automated, the lock threshold and what happens without one, and where credentials may come from and where they never go |
| `plugins/atk/skills/run-cases/references/triage.md` | Grounding the cases in the code from the profile's layers, recon of accounts and data, the eight criteria, the six verdicts and the order they are applied in, who clears each `SEMI` obstacle, scoring a large file by group, the triage report, and the scope question with its budget and proposed cut |
| `plugins/atk/skills/run-cases/references/execution.md` | The browser session and what the run never closes, the order of cases, one case from pre-condition to assertion, a step a person does, a refused tool call, the five outcomes, the three rounds, the run log, how each field of the run record is filled, evidence beside the record, and clean-up by recorded identifier |
| `plugins/atk/skills/security/references/threat-checklist.md` | The order to find the project's audit commands in, the automated checks, the six STRIDE questions per trust boundary, the map to the OWASP Top 10, and the baseline checklist answered when nobody supplied one |
| `plugins/atk/skills/security/references/record-template.md` | The three verdicts and why a refuted candidate is kept, the four severities, the redaction rule, and the shapes of the security record and the threat model |
| `plugins/atk/skills/git/references/secret-scan.md` | The secret scan, one `sh` block with four modes: `staged` and `commit` for `atk:git`, `tree` for `atk:security` over every tracked file, and `mask` for a diff handed to a read-only agent, over a range or the working tree. It prints path, line and shape and never the line, exempts a value already `<redacted: kind>`, names a staged file rule 9 forbids reading without reading it, masks a hunk header's trailing text and every line of a private key, and fails rather than passing when git fails or the mode is unknown. Also the paths that are a finding on their own, and why a hit stops the whole run |
| `plugins/atk/skills/git/references/commit-craft.md` | Where one commit ends and the next begins, the formatting sweep trap, and what evidence the body carries |
| `plugins/atk/skills/git/references/repair.md` | Rebase, conflict resolution and fixup, with the three checks that come before any rewrite of remote history |
| `plugins/atk/skills/git/references/stacked.md` | The stacked pull request lifecycle, and where to stop: one consent and one readiness gate per layer |
| `plugins/atk/skills/git/references/pr-body.md` | Where a project's pull request template is found, how the artifact fills it, and why a ticked checkbox is a claim rather than decoration |
| `plugins/atk/skills/git/references/multi-repo.md` | Reading the state of every repository a project holds, the order a change across them is carried in, the submodule pointer rule, one branch name and one cross-linked pull request per repository, and consent asked per repository |
| `plugins/atk/skills/onboard/references/roles.md` | What `--role` changes, which is the blocking column of the access list and what the first week ends in, and the three steps it leaves alone so two runs stay comparable |

### Trigger evals

One per skill, each an array of `{query, should_trigger}` testing that skill's `description`, in
all three trigger languages. `atk` ships no runner; `atkx:skill-eval --trigger` measures them, per `docs/trigger-eval-measurement.md`.

| File | Purpose |
|------|---------|
| `plugins/atk/skills/help/evals/trigger_evals.json` | Asking which skill fits, against `onboard`, `init`, `catchup`, `tailor`, and requests for work that merely say help |
| `plugins/atk/skills/init/evals/trigger_evals.json` | Setup phrasing against project configuration requests that are not `init` |
| `plugins/atk/skills/tailor/evals/trigger_evals.json` | Tailoring a skill, against the `convention` and `init` pairs it must not steal |
| `plugins/atk/skills/intake/evals/trigger_evals.json` | A raw request becoming stories, against `design-doc`, `estimate`, and `breakdown` |
| `plugins/atk/skills/catchup/evals/trigger_evals.json` | Catching up on existing work against `intake` and `onboard` |
| `plugins/atk/skills/estimate/evals/trigger_evals.json` | Sizing and capacity, against `breakdown` and `retro` |
| `plugins/atk/skills/design-doc/evals/trigger_evals.json` | Choosing an approach, against `intake`, `spec`, and `plan` |
| `plugins/atk/skills/spec/evals/trigger_evals.json` | Reference documents against `design-doc`, `intake`, and code generation |
| `plugins/atk/skills/breakdown/evals/trigger_evals.json` | Dividing work between people, against `plan` and `estimate` |
| `plugins/atk/skills/convention/evals/trigger_evals.json` | Recording the team's rules and the standards per technology, against `review`, `init`, `tailor`, and `design-doc` |
| `plugins/atk/skills/plan/evals/trigger_evals.json` | Planning one person's work against `breakdown` and `design-doc` |
| `plugins/atk/skills/implement/evals/trigger_evals.json` | Building against planning and reviewing |
| `plugins/atk/skills/fix/evals/trigger_evals.json` | A defect against `incident`, ordinary implementation, and logging or retesting a bug, which is `qa` |
| `plugins/atk/skills/verify/evals/trigger_evals.json` | Runtime confirmation against `qa`, `review`, and `run-cases` on a deployed environment |
| `plugins/atk/skills/review/evals/trigger_evals.json` | Reading a diff, against `qa`, `verify`, `fix`, and `catchup` |
| `plugins/atk/skills/qa/evals/trigger_evals.json` | Written cases and plans, updating them after a spec change, recording a run, its bugs and a retest, and reviewing a cases file, against `verify`, `run-cases` executing the cases, automated test code, a drift check of reference documents, and fixing a bug |
| `plugins/atk/skills/run-cases/evals/trigger_evals.json` | Executing cases on DEV or staging, a triage-only run, and resuming deferred cases, against `verify` on the local stack, `qa --record` for a run a tester did, writing cases, raising bugs, a retest, and unit or end-to-end test code |
| `plugins/atk/skills/security/evals/trigger_evals.json` | Security review, a client checklist and a threat model, against `review`, `git`, `qa`, `fix`, `incident`, and `release` |
| `plugins/atk/skills/git/evals/trigger_evals.json` | Commits, pull requests and rebases, against `review`, `release` and `implement` |
| `plugins/atk/skills/release/evals/trigger_evals.json` | Notes and the deploy checklist, against `incident` and `qa` |
| `plugins/atk/skills/incident/evals/trigger_evals.json` | An outage and its postmortem, against `fix` and `release` |
| `plugins/atk/skills/retro/evals/trigger_evals.json` | Sprint evidence and the status report, against `estimate` and `handover` |
| `plugins/atk/skills/onboard/evals/trigger_evals.json` | A person joining, against `handover`, `init`, and `catchup` |
| `plugins/atk/skills/handover/evals/trigger_evals.json` | A person leaving, against `onboard` and `catchup` |

## The `atkx` skill

`skill-eval` is the one skill with `scripts/`: Node, for the checks whose answer must repeat.

| File | Purpose |
|------|---------|
| `plugins/atkx/skills/skill-eval/SKILL.md` | Evaluates a skill directory: static check, project conventions, trigger measurement on Claude Code, drafted cases, review of a run, composite score |
| `plugins/atkx/skills/skill-eval/scripts/static-check.mjs` | Structure, metadata, size, credentials and the security gate of one skill, and the same gate over every process a plugin registers, hooks, monitors, LSP and MCP servers, with the plugin's code to read and its digest, printed as JSON; reads only, starts no process, follows no link out of the skill |
| `plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs` | The trigger runner: seed copy, isolated config, child sessions three at a time, the count, and cleanup on exit, `SIGINT`, `SIGTERM` and `SIGHUP`, plus the sweep of what a killed run left; refuses a skill whose static check fails the gate or whose plugins' processes do, starts a plugin that registers a process only with `--read` naming the digest of its code, loads every plugin from a copy checked against that digest, gives each session only the environment variables it needs, and passes the login as an environment token rather than a file |
| `plugins/atkx/skills/skill-eval/scripts/hook-log.mjs` | The child sessions' `PreToolUse` hook: logs each payload and denies the `Skill` call, so the selected skill is recorded and never runs |
| `plugins/atkx/skills/skill-eval/scripts/score.mjs` | The composite, its weights, the grade or none, and a note per rule applied |
| `plugins/atkx/skills/skill-eval/references/static-checks.md` | What each static check looks for, why, and how to do it by hand without Node |
| `plugins/atkx/skills/skill-eval/references/frontmatter-keys.tsv` | Which of Claude Code, Codex and Cursor reads which frontmatter key, each line with its source and `checked` date |
| `plugins/atkx/skills/skill-eval/references/project-conventions.md` | Where the project's rules about skills are found, which apply, and how each is checked and cited |
| `plugins/atkx/skills/skill-eval/references/trigger-mode.md` | The trigger method, the consent before any session starts, credentials, containment and cleanup, and the limits a result states |
| `plugins/atkx/skills/skill-eval/references/draft-cases.md` | Drafting trigger cases outside the repository, negatives named by the skill they belong to, written only on a yes |
| `plugins/atkx/skills/skill-eval/references/review-mode.md` | Walking a run in the conversation against the skill's steps, and classifying each deviation |
| `plugins/atkx/skills/skill-eval/references/report-format.md` | The scoring rules and the report's shape, score line first |
| `plugins/atkx/skills/skill-eval/evals/trigger_evals.json` | Evaluating a skill, against `tailor`, `review`, `convention`, `security`, `help` and `qa` |
| `tests/skill-eval-fixtures/` | A good, a weak and a malicious sample skill for `atkx:skill-eval`, and `expected.json` with the verdict each must get; the check is in `CLAUDE.md`. Outside the plugin, because Codex lists a `SKILL.md` found at any depth under `skills/` as a skill of its own |

## Assets

| File | Purpose |
|------|---------|
| `plugins/atk/assets/atk-icon.svg` | Square icon, two figures on a blue rounded square. Referenced by `.codex-plugin` as `composerIcon` |
| `plugins/atk/assets/atk-logo.svg` | Horizontal logo, icon plus wordmark. Referenced by `.codex-plugin` as `logo` |

## Documentation

English is the source of truth; `docs/vi/` mirrors it file-for-file.

| File | Purpose |
|------|---------|
| `docs/project-overview-pdr.md` | What atk is, the process failures it addresses, goals, non-goals, audience, success criteria |
| `docs/system-architecture.md` | Two plugins with three manifests each, listed by three marketplace files, the load model and its size budget, the `plugins/atk/shared/` layer, skill anatomy, runtime data flow |
| `docs/skills-overview.md` | Per skill: what it produces, when to use, when not to, and the one habit that makes it work |
| `docs/artifact-lifecycle.md` | Which artifacts to commit, which may be deleted, what each deletion costs, and the three policies a team can choose between |
| `docs/codebase-summary.md` | This file |
| `docs/project-roadmap.md` | Phase plan and status |
| `docs/trigger-eval-measurement.md` | How to get a true reading out of `evals/trigger_evals.json`: why a generic harness reports a vacuous score, the `PreToolUse` hook that does measure selection, the three conditions a run needs, the cases nothing can observe, and where the runner that implements it lives |
| `docs/flow/project-flow.md` | The 24 skills placed in delivery phases, with the author and the approver of each artifact, the loop back when one is rejected, and a pointer to the role table that `init` now carries |
| `docs/flow/skill-chain.md` | The artifact chain: what each skill reads, what it leaves behind, which skill picks that up, and the three ways a chain breaks |
| `docs/flow/skill-lifecycle.md` | Inside one skill: the nine sections every `SKILL.md` carries, the five stages of a run, and the five kinds of edge between skills, of which only four happen at run time |
| `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md` | The first architecture decision record: `atk` moves to `plugins/atk/` and `atkx`, a kit of utility skills that may call `atk` and is never called by it, is created at `plugins/atkx/`, the two sharing no file, and `atk` gains `CONV-011` to keep the dependency one-way, amended on 2026-10-02 so that `atk:help` alone may name `atkx` |
| `docs/adr/0002-skill-eval-scripts-for-repeatable-checks.md` | The second: `atkx:skill-eval` keeps the checks that must repeat in Node scripts and leaves judgment to the agent |
| `docs/vi/**/*.md` | Vietnamese mirror of the twelve files above, at the same relative paths |

## GitHub

| File | Purpose |
|------|---------|
| `.github/workflows/release-please.yml` | Runs release-please on push to `main` |
| `.github/workflows/labeler.yml` | Labels each pull request from the paths it changes, using `.github/labeler.yml` |
| `.github/labeler.yml` | Path rules for the labeler: one `area:` label per part of the kit and one `skill:` label per skill of either plugin: the 24 of `atk` and each `atkx` skill |
| `.github/PULL_REQUEST_TEMPLATE.md` | Conventional Commit guidance, affected harnesses, and the verification checklist including the cross-file sync items |
| `.github/ISSUE_TEMPLATE/*.yml` forms | Each adds its type label plus `status: triage` |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank issues, links to Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Bug form with harness and component dropdowns. The component list must include all 24 `atk` skills, plus the profile, the overrides, the shared layer, the hooks, `atkx`, and one `Skill - atkx:<name>` entry per `atkx` skill |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Feature form asking for the team situation before the proposed capability |
| `.github/ISSUE_TEMPLATE/skill-run-report.yml` | Skill run form taking a `--feedback` record: what was asked, which steps ran, where the skill was silent, and what the team expected |
