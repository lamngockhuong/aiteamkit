# Measuring Trigger Evals

Every skill ships `evals/trigger_evals.json`, an array of `{query, should_trigger}` asserting which
phrasings must reach that skill and which must not. Writing those files is easy. Measuring them is
not, and the obvious way of doing it returns a number that looks like a result and is not one.

This document is for the maintainer who wants to check a `description` change against the cases,
and it is the method the runner in `atkx:skill-eval` implements.
What the files hold and why they exist is in [project-roadmap.md](project-roadmap.md) phase 4; this
one is only about how to get a true reading out of them.

## The reading that lies

A generic trigger-eval harness, including the one shipped with Anthropic's skill-creator plugin,
counts a trigger by generating a throwaway copy of the skill and watching for a `Skill` tool call
that names that copy. Against a skill installed as a plugin the copy is never the one selected, so
every query reads zero triggers.

Zero on a positive case is a failure. Zero on a negative case is a pass. A run where nothing worked
at all therefore reports roughly half the suite passing. Measured on `atk:review`, a completely
uninformative run printed `11/21 passed` with not one positive case among them.

Treat any suite score that comes with zero triggers on every case as a broken harness, never as a
description problem.

## What does work

`PreToolUse` with matcher `Skill` fires when the model selects a skill, and its payload carries
`tool_input.skill` naming the winner. That is the measurement: run the query in a child session with
that hook registered, and read which skill, if any, the model reached for.

The hook is worth more than a pass or fail, because the name of the winner is the diagnosis. A
negative case that hands the query to the sibling it belongs to is a boundary working. A positive
case lost to another skill tells you which description out-argued yours, and in which language.

## Three conditions, each one learned by getting it wrong

**The seed project must have real work in it.** In an empty directory the model calls no skill at
all, for any query, and the result is indistinguishable from a description nothing matches. Give the
child a repository with a commit, an uncommitted change, a branch, a requirement document and a
design document, so that every skill under test has something it could act on. The runner copies
the repository that holds the skill as it stands, so a measurement is as good as what that
repository holds; run it from a checkout with work in flight.

**Other kits must be out of the room.** With the maintainer's own configuration, every installed
plugin competes, and a loss to a skill from another kit says nothing about a team that installed
only this one. Run with a `CLAUDE_CONFIG_DIR` pointing at a directory that holds only the
credentials file, and load the kit with `--plugin-dir` pointing at the plugin, `plugins/atk/` in the repository.

**Claude Code's own skills stay in the room.** The built-in `code-review` skill cannot be removed
and should not be: a team using this kit on Claude Code meets exactly that competition. When a
positive case is lost to a built-in, the finding is real, and the answer is either a `description`
that names what the kit's skill does and the built-in does not, or an eval case whose expectation
was wrong.

## Running one

The runner ships in `atkx`, inside the skill that uses it: `atkx:skill-eval --trigger` runs it, and
its two scripts sit in `plugins/atkx/skills/skill-eval/scripts/`. `hook-log.mjs` is the hook every
child session runs, and `trigger-run.mjs` builds the seed copy and the isolated config, starts the
sessions, counts, and cleans up. Its reference, `plugins/atkx/skills/skill-eval/references/trigger-mode.md`,
holds the steps, the consent before any session starts, the credentials rule and the cleanup.

```bash
node plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs plugins/atk/skills/review --dry-run
node plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs plugins/atk/skills/review --yes --read <codeDigest> --runs 3 --model sonnet
```

`--dry-run` counts the sessions, copies nothing and starts none, and prints `codeFiles` and
`codeDigest` for a plugin that registers a process; `--yes` runs them, three at a time, and for such
a plugin only with `--read` naming that digest, after a person has read those files. The hook denies
the `Skill` call after logging it, so the selected skill never runs in the
seed, and the runner stops each session as soon as that first call is logged, since nothing after it
is counted. A session stopped there takes seconds rather than the minutes a skill's full run would.
The seed leaves out the repository's own `.claude/settings*.json`, and the runner refuses a skill
whose static check found a credential or a security gate failure. A plugin skill still loads with
the processes its plugin registers, hooks, monitors, LSP and MCP servers. The gate reads them and
every file they run, the consent before a run shows the plugin's code in full, and the sessions load
a copy checked against the digest that was shown, so what runs is what was read; the gate itself
finds known patterns, and reading the code is what judges the rest.

A trigger is a session whose *first* logged `Skill` payload has a `tool_input.skill` equal to the
full name of the skill under test, `atk:<name>` for one of this kit's. Compare exactly. Testing
whether the skill name appears inside the value counts the built-in `code-review` as a hit for
`review`, which is the same empty pass the broken harness produces, reached from the other
direction.

## Limits to state in any result

**Slash command cases cannot be observed.** A query like `/atk:review --strict` expands straight
into the prompt and touches no tool, so no hook and no stream event sees it. The skill does run: a
child given that query reads the skill's references and answers as the skill. There is simply no
signal to count. Record those cases as skipped, never as passed, and keep them in the file: they
document the invocation form even where nothing can measure it.

**One run per query is not a measurement.** Skill selection is not deterministic. A single pass
separates nothing from noise, and a case that failed once deserves three runs before anyone edits a
`description` over it.

**A result belongs to a model and a version.** Record which model ran it. A description that wins
under one model can lose under another, and a suite score with no model named cannot be compared
against the next one.

## What the first real measurement found

Run on 2026-09-18, `atk:review`, one run per query, model sonnet: sixteen of the nineteen observable
cases passed, and all eleven negative cases were correct. The negatives are the interesting half.
The test-case phrasing went to `atk:qa`, the runtime phrasing to `atk:verify`, the defect phrasing
to `atk:fix`, the team-rule phrasing to `atk:convention`, and the summarise-this-pull-request
phrasing to `atk:catchup`, which is the boundary between neighbouring skills holding in practice.

Of the three failures, one was lost to the built-in `code-review` on a bare Japanese phrasing
carrying no sign of a team, and two selected no skill at all, one of them because the seed project
had no pull request for a query that asked about one. That last one is a fault in the seed, not in
the description, which is the kind of distinction this document exists to keep straight.
