---
title: "ADR 0006: the agent writes the run trace until a script is measured to ask no more"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-14
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# ADR 0006: the agent writes the run trace until a script is measured to ask no more

Design: `docs/records/design/261014-0335-run-trace-writer.md`

## Context

Under ADR 0005 the agent writes every line of a run trace, following `shared/run-trace.md`. Measured
on 2026-10-14, the shape held only after the file was tightened, and `way` was `session` in every
headless run, since the agent cannot tell a headless prompt from a person typing. An `atk` skill may
now carry Node scripts. A prototype script wrote the trace in shape, and could read `way` from
`CLAUDE_CODE_ENTRYPOINT`, but each of its calls is a shell command, which Claude Code's default mode
asks about.

## Decision

- **The agent stays the writer** for the release that carries run traces. It asked one permission
  question per session in default mode, and it is the only writer measured on Codex.
- **A script in `plugins/atk/shared/` replaces it later only if** an interactive Claude Code session in
  default mode, running `atk:help` and `atk:plan` with the script, asks no more than one permission
  question in the session. The agent then remains the fallback where `node` is not on `PATH`.

## Consequences

- `way` stays the run's own account in this release, as `shared/run-trace.md` already says.
- A trace off its shape is reported by `atk:tailor --feedback --runs`, not prevented.
- Every traced run keeps reading `shared/run-trace.md`, about 3,400 tokens.
- No skill runs a kit script through the agent in this release.

## Alternatives rejected for now

- **The script writes every line, now.** Its permission cost in an interactive session is unmeasured,
  and it would need the agent as a fallback anyway, two writers of one format.
- **The script starts the trace and the agent appends.** A shell command and a file write are two
  questions in default mode, over the limit the maintainer set, and the agent still reads the shape.
- **A script that only checks traces.** A check after writing finds a bad trace without preventing
  it; `atk:tailor --feedback --runs` already reports one.
