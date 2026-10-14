---
title: Who writes the run trace - the agent following shared/run-trace.md, or a Node script
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-14
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# Who writes the run trace: the agent following `shared/run-trace.md`, or a Node script

## In short

Today the agent writes every line of a run trace itself, following `plugins/atk/shared/run-trace.md`.
Measured on the branch, that works, but only after the file was tightened. The `way` field is still
wrong in every headless run, because the agent cannot tell a headless prompt from a person typing.

A Node script could write the trace instead. A prototype in a scratch copy of the kit did that
correctly in its first run, and it read `way` from the environment, where Claude Code records the
difference. Every call to the script, though, is a shell command, and in Claude Code's default
mode a shell command is a permission question. The agent writing by itself costs one question per
session; the script's count in an interactive session was not measured.

Recommendation: keep the agent as the writer for the release that carries run traces, and move to the
script only after one interactive measurement shows it asks no more than the agent does. The
decision is the approver's.

## Requirement

The question came from the maintainer on 2026-10-14, after the step that tightened the trace's shape
(commit `e402934`): should a script check or write traces, now that an `atk` skill may carry
`scripts/` (`CLAUDE.md`, commit `1a82ae5`)? There is no requirement artifact. The criteria come from
the approved designs the trace already rests on:

| # | Criterion | Source |
|---|-----------|--------|
| AC1 | A trace is data another run can count: the same fields in every trace | `docs/records/design/261011-1626-run-trace.md`, decision criterion 2 |
| AC2 | It is written by runs nobody watched | the same design, AC2 |
| AC5 | Nothing it holds breaks rule 9, and it never reaches a commit | the same design, AC5 |
| Q10 | No more than one permission question per session in Claude Code's default mode | `plans/261012-0052-run-trace/plan.md`, answered questions 8 and 10 |

## Current state

- **The agent writes the trace.** Every `SKILL.md` opens its workflow with two lines sending the run
  to the kit's `shared/run-trace.md` (for example `plugins/atk/skills/help/SKILL.md:65-66`), which
  holds the ignore file, the checks, the header template, the six event kinds, and retention.
- **It needed tightening to hold its shape.** Runs on 2026-10-14 wrote `profile:` for skills that
  must not, lines outside the six kinds (`note:`, `trace:`), and left out `flags`. After commit
  `e402934` gave the header as a template and forbade other lines, two runs out of two held the shape.
- **`way` is wrong in every headless run.** Five headless Claude Code runs wrote `way: session`,
  although `run-trace.md` says a headless run never is. The agent has nothing in its context that
  tells it.
- **Claude Code says so in the environment.** In this interactive session `CLAUDE_CODE_ENTRYPOINT` is
  `cli` and `CLAUDE_CODE_SESSION_ATTENDED` is `1`; in a `claude -p` run `CLAUDE_CODE_ENTRYPOINT` is
  `sdk-cli`. Measured 2026-10-14 on 2.1.296. A shell command can read it; the agent's context cannot.
- **Reading the shape costs tokens.** `plugins/atk/shared/run-trace.md` is 13,527 bytes on the
  branch, about 3,400 tokens at four bytes a token, read by every traced run.
- **The kit already runs Node.** Its two hooks are Node (`plugins/atk/hooks/check-profile.mjs`), and
  `atkx:skill-eval` keeps its repeatable checks in Node scripts under ADR 0002. No skill runs a script
  through the agent yet.
- **Scripts are allowed.** `CLAUDE.md`, "Skill folder layout", now lets an `atk` skill carry
  `scripts/`, Node only, for checks whose answer must repeat. It says nothing of `shared/`, where a
  script used by all 24 skills would sit.

## What was run

A prototype, `run-trace.mjs`, 58 lines, in two scratch copies of the plugin, never in the branch:
`start` checks the repository, writes the ignore file, reads the kit version and the profile's
`Run trace` line, masks the subject, names the file, writes the two header lines and applies
retention; `add` appends an event line and refuses one outside the six kinds; `end` closes. Run
directly, it masked a token and an internal host in the subject, refused a `note:` line, and exited
quietly with traces off.

Each copy changed only `atk:help`'s two workflow lines. Each variant ran headless in a fresh scratch
repository with `claude -p "/atk:help"`, model sonnet, once with the file tools, `git` and `node`
allowed and once in default mode with nothing allowed:

| # | Writer | Permissive run | Default mode, permissions refused |
|---|--------|----------------|-----------------------------------|
| A | the agent, as on the branch (run of commit `e402934`) | 8-line trace in shape; did read `run-trace.md`; $0.39 | one refusal belonging to the trace, the first file write |
| B | the script, `start`, `add`, `end` | 8-line trace in shape; did not read `run-trace.md`; $0.36 | one refusal belonging to the trace, the first `node` call |
| C | the script for `start`, the agent appends the rest | 8-line trace in shape; still read `run-trace.md`; $0.39 | one refusal belonging to the trace, the first `node` call |

A headless refusal stops the trace at its first question, so this column counts the first
question only. In an interactive session the agent's later writes are covered by "allow edits for
this session", which Claude Code offers at the first write; the script's later calls each differ in
their arguments, and whether one answer covers them depends on the person allowing the command's
prefix, which this run did not measure. One run per variant: a direction, not a rate.

## Decision criteria

1. **Shape and `way` correct** (AC1).
2. **Permission questions** in Claude Code's default mode (Q10).
3. **Works without Node, and on Codex and Cursor** (AC2).
4. **Tokens a run spends on the trace.**
5. **Fit with the kit**: one copy of a rule, the persistence groups, the hook boundary.

## Options

### A. The agent writes the trace (today, the default pick)

- Shape: held in two of two runs after `e402934`; held by wording, so a later model may drift.
- `way`: wrong in every headless run, and it cannot be fixed by wording.
- Questions: one per session, measured.
- Node, Codex, Cursor: needs none; measured on Codex 0.162.1.
- Tokens: about 3,400 for reading `run-trace.md` per run.

### B. A Node script writes every line (`start`, `add`, `end`)

- Shape: enforced by code; a wrong line is refused, not written.
- `way`: read from `CLAUDE_CODE_ENTRYPOINT` on Claude Code; on Codex and Cursor still the agent's
  argument, since no variable was looked for there.
- Questions: one at the first call, measured; the rest of an interactive session unmeasured, and
  plausibly one per call unless the person allows the command once for the project.
- Node, Codex, Cursor: needs Node on `PATH`, and the agent has to find the script's path; tested on
  Claude Code only. A run without Node needs a fallback, which is option A again, so the kit would
  carry two writers of one format.
- Tokens: `run-trace.md` is not read; the prototype run spent $0.03 less, within one run's noise.

### C. The script starts the trace, the agent appends the events

- Shape: the header enforced, the events by wording.
- `way`: as B.
- Questions: the `node` call, measured, and the agent's first write after it, which a headless
  refusal never reaches: two kinds of action, so two questions in an interactive session, over Q10.
- Tokens: as A, since the agent still reads the event kinds.

It keeps the weakest half of each and is not compared further.

| Criterion | A: agent | B: script | C: split |
|-----------|----------|-----------|----------|
| 1. Shape and `way` | shape by wording, `way` wrong headless | both by code on Claude Code | header by code |
| 2. Questions | 1 per session, measured | 1 at first, rest unmeasured | 2 by the actions it takes, over Q10 |
| 3. Without Node, other harnesses | everywhere, Codex measured | needs Node and a fallback; Claude Code only | as B |
| 4. Tokens | about 3,400 a run | about 0 for the shape | about 3,400 |
| 5. Fit | one writer | two writers, a script in `shared/` | two writers |

## Chosen approach: A for this release, B behind one measurement

Keep the agent as the writer in the release that carries run traces. It meets Q10 on evidence, runs
everywhere, and is the only option measured on Codex. Its defects are known and bounded: `way` is
the run's own account, which `shared/run-trace.md` already says, and a trace off its shape is
reported by `atk:tailor --feedback --runs` (answered question 11 of the plan).

Move to B in a later release when one measurement holds: an interactive Claude Code session in
default mode, running `atk:help` and `atk:plan` with the script, asks no more than one permission
question in the session. If it does, B replaces A as below; if it does not, B is dropped and this
record says why.

### What B is, if the measurement passes

- **Where:** `plugins/atk/shared/run-trace.mjs`, beside the file whose shape it writes, because every
  skill uses it and a copy under each skill would be twenty-four copies. `CLAUDE.md`, "Skill folder
  layout", names `shared/` as the one other place a script may sit, on the same terms.
- **Interface:** `start <skill> --subject --flags --way --harness --override` prints the trace's path,
  or `no trace: <why>` with exit 2, and exits 3 when traces are off; `add <path> <line>` refuses a
  line outside the six kinds; `end <path> <line>` closes. `way` from `CLAUDE_CODE_ENTRYPOINT` when
  present, the argument otherwise.
- **Fallback:** where `node` is not on `PATH`, the agent writes the trace by `run-trace.md`, which
  stays the one description of the shape; the script writes that shape and is checked against it by
  a test in "Common verification commands".
- **Masking:** the script masks the shapes it can recognise as a floor; the agent still masks free
  text before passing it, since a script cannot tell a person's data from other words.

### Specified sections

| Section | Answer |
|---------|--------|
| Data model and migration | N/A. Traces keep the shape `run-trace.md` gives; a trace written by A and one written by B are read alike |
| API contracts | Under B, the script's three commands above. Under A, none |
| Errors and edge cases | Under B: no Node, the agent writes; a refused `node` call, no trace and one line, as a refused write today |
| Backward compatibility | A changes nothing. B changes how a trace is written, not what it holds |
| Rollout | A ships with the run-trace release. B is its own `feat:` release after the measurement |
| Rollback | B is reverted by its own commit, and A remains as the fallback it already is |
| Observability | The trace |
| Security and permission | B runs a kit file with `node` in the person's project, the first time a skill does that; it writes only under `<docs root>/derived/traces/` and reads `git` and the profile. A runs nothing new |
| Performance | B saves reading `run-trace.md`, about 3,400 tokens a run; measured cost difference within noise |

## Traceability

| Criterion | Met by |
|-----------|--------|
| AC1 | A: the tightened `run-trace.md` and `tailor --runs` reporting shape; B: the script |
| AC2 | A, measured on Claude Code headless and Codex |
| AC5 | Unchanged: the ignore file and the check, in either writer |
| Q10 | A, measured; B, the condition for adopting it |

## Decisions recorded

- The agent stays the writer of the run trace for the release that carries it. Lam Ngoc Khuong,
  2026-10-14.
- A Node script in `shared/` replaces it later only if an interactive measurement shows no more than
  one permission question per session. Lam Ngoc Khuong, 2026-10-14.

## Open questions

None.

### Answered

| Question | Answer | Answered by | Date |
|----------|--------|-------------|------|
| 1. Accept A now with B behind the measurement, or choose B now and measure before the release instead? | "Chấp nhận A ngay" | Lam Ngoc Khuong | 2026-10-14, the date of the answer |

## Reviewers

- Tech Lead: Lam Ngoc Khuong, approver. `.atk/profile.md` lists no BrSE or SRE for this repository.

ADR: `docs/adr/0006-run-trace-written-by-the-agent-until-measured.md`.
