---
title: atk:help names atkx skills, the one exception to the one-way rule
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-02
updated: 2026-10-02
ticket: none
---

# atk:help names atkx skills, the one exception to the one-way rule

## In short

Until now `atk:help` could not answer about `atkx` skills. Ask it "evaluate the skill I just wrote"
and it said the request was outside the kit, without naming `atkx:skill-eval`. `CONV-011` made it
answer that way: `atk` never names `atkx`, so that a team with only `atk` never meets a pointer it
cannot follow.

The maintainer decided on 2026-10-02 to break that rule for `atk:help` alone. The two plugins come
from one marketplace, and a person asking which skill to run is better served by the skill and the
line that installs it than by "outside this kit". `atk:help` now names an `atkx` skill when no `atk`
skill fits, and adds the install commands when that skill is not installed. Every other skill,
shared file, and hook still names nothing of `atkx`.

## Requirement

No requirement artifact exists. The request came in the session that produced this record:

| # | Criterion | Source |
|---|-----------|--------|
| AC1 | `atk:help` names the `atkx` skill for a question only `atkx` covers | the maintainer, 2026-10-02 |
| AC2 | It names it whether or not `atkx` is installed, with the install commands when it is not | the maintainer, 2026-10-02 |
| AC3 | The exception covers `atk:help` only; `CONV-011` holds for the other 23 skills, `shared/` and `hooks/` | the maintainer, 2026-10-02 |
| AC4 | A plugin reads nothing outside its own directory (`CONV-012`) | `CLAUDE.md`, "Multi-manifest layout" |

## Current state

- **`help` finds skills by reading its neighbours.** Step 2 of `plugins/atk/skills/help/SKILL.md`
  reads `../*/SKILL.md`, which holds the 24 `atk` skills and nothing else. `plugins/atkx/` is not
  beside it on a user's machine, so `help` cannot read the `atkx` skills from disk.
- **`CONV-011` forbade the word.** `grep -rn "\batkx\b" plugins/atk/ --exclude=CHANGELOG.md` printed
  nothing on 2026-10-02, before this change.
- **`docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`** recorded the rule as part of the decision to
  make the two kits sibling plugins.

## Options

### Option A: keep the rule, and give `atkx` a guide of its own later

`atk:help` unchanged; an `atkx` skill under another name lists `atkx` skills and sends lifecycle
questions to `/atk:help`. This was the first recommendation in the session. It keeps a team with
only `atk` free of any pointer to `atkx`, but a person who asks `atk:help` still hears "outside this
kit" for something the same marketplace ships. The maintainer rejected it for that reason.

### Option B: name `atkx` skills only when `atkx` is installed

Keeps a team with only `atk` unaware of `atkx`. Rejected by the maintainer in favour of AC2: the
person who does not know `atkx` exists is the one the answer helps most.

### Option C: `atk:help` always names the fitting `atkx` skill, with install commands (chosen)

- Meets AC1 and AC2.
- The cost, accepted by the maintainer: a team with only `atk` sees a suggestion to install `atkx`.
  It is a pointer they can follow, since the install line is in the answer, which is the reason the
  old rule gave for forbidding pointers.

### Option D: let every `atk` skill name `atkx`

Rejected for AC3. A skill that stops mid-workflow and points at another plugin is the dead end the
rule exists to prevent; routing stays the job of `atk:help`.

## Chosen approach: Option C

### Where the list lives

`plugins/atk/skills/help/references/atkx-skills.md` holds one row per `atkx` skill, what it is used
for, its harness support, and the install commands per harness. It is a copy, because the `atkx`
directory is outside the `atk` plugin (AC4). When the skill is in the host's live skill list, `help`
answers from the live `description` instead, which is newer than the copy.

### How `help` uses it

- **Question mode.** The `atkx` rows are candidates beside the `atk` skills, ranked by the test
  step 4 already uses between two `atk` skills: an `atk` skill whose `## Scope` handles the request
  wins; an `atkx` row whose `Use when` names the request outright wins over an `atk` skill that only
  sounds close; where both still fit, the `atk` skill is named and the `atkx` one goes under
  `Also considered`. The first draft read the `atkx` list only after no `atk` skill fit, which the
  review showed could send "evaluate the skill I wrote" to `atk:review` and never reach
  `atkx:skill-eval`.
- **Fields with no `SKILL.md` to read.** The list carries each skill's invocation, `Needs first` is
  `nothing; it needs no profile`, and `Approved by` is `none; it writes nothing a teammate approves`.
- **Skill mode.** For an argument with the `atkx:` prefix or a name in the list.
- **State mode.** Never. Nothing on disk says an `atkx` skill is the next one to run.
- **Output.** `Run: /atkx:<skill>`, plus an `Install` line for the asker's harness when the skill is
  not installed.

### Keeping the copy true

Adding, renaming, or removing an `atkx` skill gains a ninth group in the `atkx` list in `CLAUDE.md`:
the Skills table of `atkx-skills.md`. A check in "Common verification commands" fails when the table
and `plugins/atkx/skills/` disagree.

### `CONV-011` after the change

`atk` never invokes `atkx`, and only `atk:help` names it. The check becomes:

```bash
grep -rn "\batkx\b" plugins/atk/ --exclude=CHANGELOG.md | grep -v '^plugins/atk/skills/help/'
```

### What changes

- `plugins/atk/skills/help/SKILL.md`: Scope, the skill-mode row, step 2, step 4, Output, Definition
  of done.
- `plugins/atk/skills/help/references/atkx-skills.md`: new.
- `plugins/atk/shared/host-capabilities.md`: a row allowing `atk:help` alone to name the companion
  plugin's skills, written without the word so `CONV-011` still covers `shared/`.
- `plugins/atk/skills/help/evals/trigger_evals.json`: two cases that reach `atkx`.
- `CLAUDE.md`: the `atkx` section, the `atkx` skill list, `CONV-011`, `CONV-013`, and the new check.
- `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md` and its mirror: an amendment pointing here.
- `docs/system-architecture.md`, `docs/codebase-summary.md`, their mirrors, and `.atk/profile.md`.

## Traceability

| Criterion | Met by |
|-----------|--------|
| AC1 | step 4 of `help`, question mode, and Which one wins in `atkx-skills.md` |
| AC2 | the `Install` line in Output |
| AC3 | the `grep -v` exclusion is the `help` folder alone |
| AC4 | the copied list; `help` reads no path outside `plugins/atk/` |

## Reviewers

- Tech Lead: Lam Ngoc Khuong, approver. `.atk/profile.md` lists no BrSE or SRE for this repository,
  so no other signature is required.

Amends: `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`.
