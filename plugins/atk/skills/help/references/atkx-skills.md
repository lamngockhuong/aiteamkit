# atkx skills (`atk:help`)

`atkx` is the second plugin in the marketplace `atk` comes from: utility skills that need no project
profile and belong to no phase of delivery. Its directory is not beside `atk` on a user's machine,
so `atk:help` reads this copy, and no other `atk` file names it.

## When to read it

- **Question mode**, always, beside the `atk` descriptions from step 2: the table is one row per
  skill and costs less to read than the wrong answer.
- **Skill mode**, when the argument carries the `atkx:` prefix or is a bare name from the table.
- **Never in state mode.** Nothing on disk says an `atkx` skill is the next one to run, so the state
  answer stays on the delivery lifecycle.

## Which one wins

The same test step 4 uses between two `atk` skills, applied across the two plugins:

- An `atk` skill whose `## Scope` handles the request wins. `atkx` covers what `atk` does not.
- An `atkx` row whose `Use when` names the request outright wins over an `atk` skill whose
  description only sounds close. "Evaluate the skill I wrote" is `atkx:skill-eval`, not
  `atk:review`, whose scope is a teammate's change rather than a skill's quality.
- Where both still fit, name the `atk` skill and put the `atkx` one under `Also considered`.

## Installed or not

Look for the skill by its full name, `atkx:<name>`, in the host's live skill list.

- **Listed.** The skill is installed. Answer from its `description` in the live list, which is
  newer than the row below, and add no install line.
- **Not listed, or the host shows no list.** Answer from the row below, and add the `Install` line
  under Output in `SKILL.md`, with the commands for the asker's harness from the install table.

## The answer for an atkx skill

Its `SKILL.md` is not on disk beside `help`, installed or not, so the fields that step 2 and Output
read from a `SKILL.md` come from here instead:

| Field | For an `atkx` skill |
|-------|---------------------|
| `Run`, and the invocation in skill mode | the `Invocation` column below |
| `Needs first` | `nothing; it needs no profile`, plus `atkx installed` when it is not |
| `Approved by` | `none; it writes nothing a teammate approves` |

## Skills

| Skill | Use when | Invocation | Harnesses |
|-------|----------|------------|-----------|
| `atkx:skill-eval` | Evaluating an agent skill a project has written: its structure, metadata and safety, the project's own conventions for skills, which requests it triggers on, and one score with a grade. Reads the skill and changes nothing in it | `/atkx:skill-eval <skill-path>`; `--trigger` adds trigger measurement | Claude Code, Codex, Cursor; trigger measurement on Claude Code only |

## Install

| Harness | Commands |
|---------|----------|
| Claude Code | `/plugin install atkx@atk`, which installs `atk` with it |
| Codex | `codex plugin add atkx@atk`; Codex installs no dependency, so `atk` stays installed separately |
| Cursor | `cursor-agent plugin marketplace add https://github.com/lamngockhuong/aiteamkit`, then install `atkx` from the `/plugin` menu; or copy `plugins/atkx/` from a clone to `~/.cursor/plugins/local/atkx` beside `atk` and reload the window. Neither route is tried yet, so say so in the answer |

## Keeping it true

A skill added to, renamed in, or removed from `atkx` changes the Skills table in the same change.
Nothing generates it, and an entry for a skill that is gone sends the asker to a command that does
not exist.
