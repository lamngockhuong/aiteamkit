---
title: "ADR 0016: An unattended run of atk:orchestrate passes eligible gates provisionally, never answers them"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-08
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-08, by instruction to the agent.

# ADR 0016: An unattended run of atk:orchestrate passes eligible gates provisionally, never answers them

Design: `docs/records/design/261108-1246-orchestrate-unattended-run.md`. Requirement:
`docs/records/requirements/261105-0310-auto-run-with-batched-decisions.md`.

## Context

A long run of `atk:orchestrate` stalls at every gate while nobody watches it: a gate for a person not
in the session parks its chain, and nothing is built meanwhile. The request as first put would have
had agents decide in the name of a Tech Lead or a PM, which breaks three rules the kit rests on: an
approval is the approver's act (rule 2 of `plugins/atk/shared/team-roles.md`), no skill records a
decision the team has not made (rule 3), and a coordinating skill relays a gate and never answers it
(`plugins/atk/shared/host-capabilities.md`, "A gate is relayed, never answered"). The maintainer chose
instead a form in which agents only recommend, the run goes on provisionally, and a person decides
every such gate afterwards, and answered the requirement's six questions on 2026-11-05.

## Decision

`atk:orchestrate` gains `--unattended`. Under it, a gate of a fixed eligibility table, an option
inside a draft that changes no scope, the medium plan-gate confirmation of a fix job, or the wait for
a gating artifact's approval, is passed provisionally when, and only when, every lens agent of the
roles that own it picks, cold and without seeing it, the option the job's skill recommends. The job
records the question as open under its owner's name, with a `Provisional:` line, and the gate becomes
an entry of a decision queue in the run state. Every other gate, and every disagreement, parks its
chain as today. A chain builds on at most one unapproved gating artifact, and a run passes at most
eight gates provisionally. A rejected entry is redone from its base commit under a new, approved
proposal record; the provisional branch is kept as evidence. A person who answers a gate in the
session makes the run attended from then on, and it goes back to unattended once that person says
they are no longer present.

The rule lives in one reference file of `atk:orchestrate`. The shared files gain only what a job, a
skill and a trace must know: a bullet in `host-capabilities.md`, a clause in rule 5, a field of the
job's `stop:` line, and a `provisional` outcome of the trace's `gate` line.

## Consequences

- A person away from a run comes back to built work and one queue, rather than to parked chains.
- Nothing a person owns is decided by an agent: no state is moved, nothing crosses the consent line,
  and every record names a lens agent as an agent and its answer as a recommendation.
- Work built on a provisional gate can be thrown away. The cost of a rejection is local rework, and
  the kit never re-runs it unasked.
- Up to 24 lens agents per run, stated in the proposal before the run.
- A permission prompt still needs the person. Under the mode, a job whose way can raise one either
  times out (panes) or is offered only on the approver's confirmation that it will not (subagents).
- The `gate` line of the trace has a fourth outcome; `atk:tailor` reads it without a new event kind.

## Alternatives rejected

- **Agents decide in the role's name.** The request as first put. It records decisions nobody made,
  rule 3, and an approval nobody gave, rule 2.
- **A `--provisional` flag on each gating skill.** A person could run the skill alone with it and
  carry the skill past its own gate unchecked, and a subagent job cannot spawn the lens agents.
- **Park everything and only gather the parked questions at the close.** Keeps every rule and builds
  nothing while the person is away, which is the need.
- **Continue on the lens agents' majority.** Agents on one model agreeing means little, and siding
  with one lens treats an agent as the role.
- **A pre-approved delegation file letting agents choose at some gates.** Considered in the
  requirement interview and not chosen now; a later request may add it.
