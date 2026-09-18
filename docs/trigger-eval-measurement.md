# Measuring Trigger Evals

Every skill ships `evals/trigger_evals.json`, an array of `{query, should_trigger}` asserting which
phrasings must reach that skill and which must not. Writing those files is easy. Measuring them is
not, and the obvious way of doing it returns a number that looks like a result and is not one.

This document is for the maintainer who wants to check a `description` change against the cases.
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
design document, so that every skill under test has something it could act on.

**Other kits must be out of the room.** With the maintainer's own configuration, every installed
plugin competes, and a loss to a skill from another kit says nothing about a team that installed
only this one. Run with a `CLAUDE_CONFIG_DIR` pointing at a directory that holds only the
credentials file, and load the kit with `--plugin-dir` pointing at the repository.

**Claude Code's own skills stay in the room.** The built-in `code-review` skill cannot be removed
and should not be: a team using this kit on Claude Code meets exactly that competition. When a
positive case is lost to a built-in, the finding is real, and the answer is either a `description`
that names what the kit's skill does and the built-in does not, or an eval case whose expectation
was wrong.

## Running one

The hook script, the settings file and the seed live outside the repository, because the kit ships
no runner and adding one would make every team carry a maintainer's tool. Everything needed to
rebuild it is here.

A hook that logs every tool call to a file named by `HOOK_LOG`:

```javascript
import { readFileSync, appendFileSync } from "node:fs";
let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let payload;
try { payload = JSON.parse(raw); } catch { payload = { unparsed: raw.slice(0, 400) }; }
appendFileSync(process.env.HOOK_LOG, JSON.stringify(payload) + "\n");
process.stdout.write("{}");
```

The settings file that registers it, passed with `--settings`:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node /path/to/hooklog.mjs" }] }
    ]
  }
}
```

One query, in a freshly seeded project directory:

```bash
HOOK_LOG=$log CLAUDE_CONFIG_DIR=$isolated_config \
  claude -p "$query" --settings "$settings" --plugin-dir "$kit_repo" --model sonnet
```

A trigger is a logged payload whose `tool_name` is `Skill` and whose `tool_input.skill` equals
`atk:<name>`. Compare exactly. Testing whether the skill name appears inside the value counts the
built-in `code-review` as a hit for `review`, which is the same empty pass the broken harness
produces, reached from the other direction.

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
