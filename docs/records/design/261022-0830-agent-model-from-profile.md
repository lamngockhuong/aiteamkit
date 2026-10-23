---
title: The team chooses the model of the agents atk spawns, through the profile
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-23
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-23, by instruction to the agent.

# The team chooses the model of the agents atk spawns, through the profile

## In short

Today no `atk` skill and no `atk` agent names a model. Every skill runs on the model of the session,
and every agent a skill spawns runs on whatever the harness picks when nothing is named, which is
the session's model unless the person has set a default for subagents. The cost that grows fastest is
not the session but the agents: one `atk:review` spawns an agent per round, and `--parallel <N>`
multiplies that, `atk:design-doc --challenge` and `atk:plan --challenge` spawn one per lens, and
seven skills hand wide reading to an agent.

All three harnesses now let the caller name a model when it spawns an agent. This design adds two
optional lines to the Team section of `.atk/profile.md`, one for the agents that read wide and one
for the agents of a review or a challenge, each naming a model per harness. A skill passes the named
model when it spawns that kind of agent, and passes nothing when the line or the harness is missing,
which is exactly today's behaviour. The kit never picks a model itself, never changes the session's
model, and never changes the model of an agent that writes or of the band 1 reviewer.

## Requirement

No requirement artifact: the request came from the maintainer in conversation on 2026-10-22, asking
whether `atk` should assign or suggest models per task to reduce cost. The criteria below are
restated from that conversation and are what this design is checked against.

1. **The team decides, the kit does not.** Which model an agent runs on is a cost and quality
   trade-off a role owns, per `plugins/atk/shared/team-roles.md`. The kit ships no model name as a
   default and never lowers a model on its own.
2. **No line, no change.** A project that writes nothing gets today's behaviour on every harness.
3. **Reading and reviewing are chosen apart.** Wide reading returns conclusions the session checks;
   a review round returns findings a person acts on. A team must be able to lower the first without
   the second.
4. **Degrade, never stop.** A harness that cannot name a model per agent spawns the agent as today
   and the run says the line was not applied, per When the capability is missing in
   `plugins/atk/shared/host-capabilities.md`.
5. **The reader can see it.** A run that applied a line says which model it asked for, where it
   already states what it spawns.

## Current state

**No model is named anywhere in the kit.** `plugins/atk/agents/read-only-reviewer.md:1-6` carries
`name`, `description`, `tools: Read, Grep, Glob` and `readonly: true`, and no `model`. No `SKILL.md`
of either plugin has a `model` field in its frontmatter. The only mention of choosing a model is
`atkx:skill-eval --trigger --model <id>` (`plugins/atkx/skills/skill-eval/SKILL.md:14,64-65`), which
picks the model trigger measurement runs under, not the model of a skill's work.

**Where the kit spawns agents.**

| Who spawns | Agent | Where the rule is |
|------------|-------|-------------------|
| `atk:review` | one per round, copies under `--parallel`, the sweep | `plugins/atk/shared/host-capabilities.md:202-270`, `plugins/atk/skills/review/references/review-rounds.md` |
| `atk:review`, band 1 | one general agent that runs the whole review and writes the report | `plugins/atk/skills/review/references/review-rounds.md:172-187` |
| `atk:design-doc --challenge`, `atk:plan --challenge` | one per lens | `plugins/atk/shared/independent-challenge.md`, through `host-capabilities.md:202-208` |
| `init`, `catchup`, `spec`, `convention`, `security`, `fix`, `onboard` | one that reads wide and returns conclusions | `plugins/atk/shared/host-capabilities.md:272-296` |
| `atk:orchestrate` | agents that write, in panes, subagents or the session | `plugins/atk/shared/host-capabilities.md:297-385`, `plugins/atk/skills/orchestrate/references/ways-to-run.md` |

Every read-only agent is spawned as `atk:read-only-reviewer` on Claude Code
(`host-capabilities.md:235-243`), so a model named in that agent's frontmatter would reach all of
them at once: rounds, lenses and wide reading alike. That is why criterion 3 cannot be met by the
agent file.

**The run already states what it spawns.** `host-capabilities.md:219-225` makes a run state the
number of passes and agents before it spawns the first one, and
`review-rounds.md:276-288` gives the line `atk:review` prints. That line is the natural place to say
which model was asked for.

**What each harness offers, from its documentation as read on 2026-10-22.**

| Harness | Name a model when spawning | Model in the agent file | Default for every subagent |
|---------|----------------------------|-------------------------|----------------------------|
| Claude Code | yes, the `model` parameter of the `Agent` tool; first in precedence | `model:` in the agent's frontmatter, `inherit` allowed | `CLAUDE_CODE_SUBAGENT_MODEL`, used only when neither of the two before it is set; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` overrides both |
| Cursor | yes, "The parent agent can name a model when it launches a subagent" | `model: inherit` or a model ID, default `inherit` | none documented |
| Codex | yes, an explicit spawn value overrides the defaults | `model` in a custom agent's TOML, which wins over the spawn value | `agents.default_subagent_model` in `config.toml` |

Sources: `https://code.claude.com/docs/en/sub-agents`, `https://cursor.com/docs/subagents`,
`https://learn.chatgpt.com/docs/agent-configuration/subagents.md`, each read on 2026-10-22. None of
this was measured here. Cursor's forum records two open reports of a subagent's model not being
respected; Codex plugins bundle no agents (`docs/system-architecture.md:122-124`), so on Codex the
kit's agents are general agents and only the spawn value or the global default can reach them.

**Where the profile keeps lines that change behaviour.** `plugins/atk/shared/project-profile.md:200-241`
lists the entries of the Docs section that change what a skill does, `Run trace: off` among them, a
line whose absence has a meaning and is never written `TBD`. The Team section
(`project-profile.md:190`) is read by every skill, the `Not needed` group included, for the names on
`gate` lines (`plugins/atk/shared/run-trace.md:33-35`).

## Options

Criteria, in the order they weigh: the team premise (criterion 1), separation of reading from
review (criterion 3), behaviour on the three harnesses, effort, reversibility, and the surprise a
person meets when the agent does not run on the model they expected.

### A. Two optional lines in the Team section, passed at spawn (chosen)

The profile names, per harness, the model of the agents that read wide and the model of the agents
of a review or a challenge. A skill passes it at spawn time.

- Premise: the line is the team's, written by a person and approved with the profile. Pass.
- Separation: two lines, two kinds. Pass.
- Harnesses: all three take a model at spawn per their documentation. On Codex a spawn value loses
  to a custom agent file that sets `model`, which the kit ships none of. Pass, unmeasured.
- Effort: two shared files, the init template and detection, the review rounds line, the system
  architecture docs and `CLAUDE.md`. No new file.
- Reversible: delete the lines.
- Surprise: a spawn value outranks a person's own default for subagents, on Claude Code and Codex.
  A person who set `CLAUDE_CODE_SUBAGENT_MODEL` sees it overridden for the kit's agents only where
  the team named a model for their harness; with no line, their default still applies. The stated
  total names the model, so the override is visible.

### B. Document the harness's own default for subagents, change no skill

The team commits `CLAUDE_CODE_SUBAGENT_MODEL` in the project's `.claude/settings.json`, or
`agents.default_subagent_model` in Codex's configuration, and the kit only documents it. This is the
option a team would reach for first, since it costs nothing.

- Premise: the team decides through a committed file. Pass.
- Separation: one value for every subagent of the harness, not only the kit's: the reviewer, the
  reader, and every agent `atk:orchestrate` runs as a subagent, which writes code. Lowering the model
  of an agent that writes to save on reading is the opposite of the intent. Fail.
- Harnesses: Cursor documents no global default. Partial.
- Effort: docs only.
- It loses on separation, and it is not taken away by A: a person can still use it, and it applies
  wherever the profile is silent.

### C. Ship a second read-only agent with a cheaper model in its frontmatter

`atk:read-only-reader` with `model: haiku`, used for wide reading, while the reviewer keeps
inheriting.

- Premise: the kit picks the model. Fail, which settles it.
- Harnesses: the name `haiku` means nothing on Cursor or Codex, and Codex plugins carry no agents.
- It also freezes a model name in a shipped file, which goes stale with every model release.

### D. A `model:` field in each `SKILL.md`

- Premise: the kit picks, and on Claude Code it switches the session's own model for the turn, so a
  person who chose a strong model for a hard fix gets a weaker one without asking. Fail.
- Harnesses: not a field Cursor or Codex document for skills.

## Chosen approach

Option A.

### The two lines

In the Team section of `.atk/profile.md`, after `Working language`:

```markdown
- Reading agent model: claude-code sonnet; codex <a model ID Codex accepts>
- Review agent model: inherit
```

- **Reading agent model** applies to an agent that reads wide, per Reading wide, through an agent in
  `plugins/atk/shared/host-capabilities.md`.
- **Review agent model** applies to every agent a review spawns other than the band 1 reviewer:
  rounds, copies under `--parallel`, the sweep, and every lens of `--challenge`.
- The value is a list of `<harness> <model>` pairs separated by `;`, or `inherit`. The harness names
  are the ones the run trace header writes, `claude-code`, `cursor`, `codex`. The model is whatever
  that harness accepts at spawn time, an alias such as `sonnet` or a full model ID, copied as the
  team writes it; the kit keeps no table of models and checks no name.
- A missing line, `inherit`, or a harness the line does not name means no model is passed, which is
  today's behaviour. Like `Run trace`, the line is never written `TBD`: its absence is an answer.

The Team section rather than Docs, because the choice is a team's cost decision like who approves
what, and because every skill already reads Team, the `Not needed` group included, so no skill
gains a read.

### What a skill does

1. Read the two lines with the rest of the profile, once per run, per How a skill cites it in
   `plugins/atk/shared/project-profile.md`. A skill that spawns no agent ignores them.
2. When spawning a read-only agent, find the line for its kind and the pair for the harness the run
   trace header names. If there is one, pass that model at spawn; otherwise pass none.
3. In the line that states what the run will spawn, `host-capabilities.md:219-225` and its form in
   `review-rounds.md:276-288`, add the model asked for, or nothing when none was passed. A wide
   reading states it where the artifact lists what it read, or in the closing message, the places
   `host-capabilities.md:293-296` already uses.
4. Where the harness offers no way to name a model at spawn, spawn as today and say in the same
   place: the line named `<model>` for this harness, which could not be passed, and the agent ran on
   the harness's own choice.
5. A spawn the harness refuses because of the model, an unknown name or one an organisation's
   allowlist blocks, is retried once with no model, and the run says so in the same place. Claude
   Code replaces a blocked model silently; the run cannot see that, and says what it asked for, not
   what ran.

### Never covered

- **The session.** The kit never changes the model the person runs it on.
- **The band 1 reviewer.** It takes the verdicts and writes the report
  (`review-rounds.md:172-187`), the work `host-capabilities.md:266-267` keeps with the calling
  agent, so it runs on the harness's default like the session that would otherwise do it.
- **Agents that write**, every job of `atk:orchestrate`. Its jobs carry code to a commit; a team that
  wants a cheaper model there chooses the agent CLI and its flags in the proposal, which the person
  already approves per Agents that write.

### Data model and migration

`N/A` for data. The profile gains two optional lines; a profile without them is valid and unchanged.

### API contract

`N/A`. The contract that changes is the profile's: two lines in the Team section, described above,
owned by `plugins/atk/shared/project-profile.md`.

### Error and edge cases

- A line with a pair for a harness the run is not on: ignored for this run.
- A malformed value, no harness name, or a pair with no model: treated as no line, and the run says
  in its closing message that the line could not be read, naming the line and not guessing.
- The same harness named twice: the first pair wins, and the run says the second was ignored.
- A person's harness default for subagents: unaffected wherever no model is passed.

### Backward compatibility

Fully compatible. No line means no model passed, which is every project today.

### Rollout

One pull request carrying the shared files, the init changes and the docs. `atk:init` never asks for
the lines and never writes them unasked, as it treats `Run trace` (`plugins/atk/skills/init/SKILL.md:94-100`):
the template carries a comment saying where they go and that absence means the session's choice.
`--audit` does not report them missing.

### Rollback

Revert the pull request. A profile that kept the lines is still valid: without the rule, nothing reads
them.

### Observability

The stated total of a run names the model asked for, and a review report's `## Rounds` section,
which carries that total, keeps it. The run trace gains nothing: its six event kinds are fixed
(`run-trace.md:171-185`), and a model is a fact of the spawn, not an event.

### Security and permission impact

None on what an agent may do. The tool list of `atk:read-only-reviewer` and the prompt rules of
`host-capabilities.md` hold whatever model runs them. A model name is not a secret and may sit in a
committed file.

### Performance expectation

The cost of a review falls in proportion to the price of the model the team names for its rounds,
since rounds are most of a review's tokens; the session's share does not change. Whether a cheaper
model misses findings a stronger one returns is the question this design cannot answer. The Tech
Lead allowed the review line without that measurement, per the answer to Q1, so the stated total and
the review report naming the model are what lets a reader weigh a review's findings.

### Files the implementation touches

- `plugins/atk/shared/project-profile.md`: the Team row of Sections, and the two lines beside the
  entries that change behaviour.
- `plugins/atk/shared/host-capabilities.md`: the stated-total bullet and Reading wide, steps 2 to 5
  above; the reviewer bullet, for which agents the review line covers.
- `plugins/atk/skills/review/references/review-rounds.md`: the cost line names the model.
- `plugins/atk/shared/independent-challenge.md`: one sentence, that lens agents take the review line.
- `plugins/atk/skills/init/references/profile-template.md` and `references/detection.md`: the
  comment, and that the lines are never asked for.
- `docs/system-architecture.md` and `docs/vi/system-architecture.md`: the profile row of the load
  table, and the route on each harness, the Cursor one stated as read from its documentation on
  2026-10-22 and not measured, per the answer to Q2.
- `CLAUDE.md`: the `project-profile.md` row of the shared table.

## Open questions

None open.

### Answered

| Question | Answer | Answered by | Date | Relayed by |
|---|---|---|---|---|
| Q1. May the review line name a cheaper model at all, or only the reading line? | "Cho cả hai dòng", choosing the option put to him in the session: keep the design as written, the team decides both the reading and the review line, and the review report names the model used | Lam Ngoc Khuong | 2026-10-22 | |
| Q2. Does Cursor honour a model named at spawn for a plugin's agent? | "Ghi theo tài liệu", choosing the option put to him in the session: no measurement now; `docs/system-architecture.md` states the Cursor route as read from its documentation on 2026-10-22, not measured | Lam Ngoc Khuong | 2026-10-22 | |

ADR: `docs/adr/0009-agent-model-chosen-by-the-team-in-the-profile.md`
