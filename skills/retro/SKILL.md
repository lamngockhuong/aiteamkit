---
name: retro
description: >
  Run a sprint retrospective on evidence rather than memory, and write the status report that goes
  up: what the data says about the sprint, what the team says, the few actions worth taking with an
  owner each, and whether last retro's actions actually happened.
  Use at the end of a sprint, a milestone, or a phase, and when a status report is due to a PM or a
  client.
  Triggers on: "retro", "retrospective", "họp retro", "tổng kết sprint", "sprint review",
  "status report", "振り返り", "レトロスペクティブ", "weekly report", "/atk:retro".
argument-hint: "[sprint|date-range] [--data-only|--report] [--audience internal|client] [--lang <code>] [--out <path>]"
---

# Retrospective and Status Report (`atk:retro`)

Brings facts to a retrospective so the discussion is not a memory contest, and produces the report
a PM or client reads. Its strongest habit is checking the previous retro first: a team that never
closes its actions does not need another list of actions.

## Scope

Handles: gathering sprint evidence from git, the tracker, and CI, checking the previous retro's
actions, structuring the discussion, capturing what the team says, and writing both the retro record
and the status report.

Does NOT handle: running the meeting for the team, deciding priority for the next sprint
(`atk:estimate`), or performance evaluation of individuals, which this skill never produces.

## Roles

PM or a rotating facilitator runs the session. The whole team contributes. Each action gets one
named owner. See `shared/team-roles.md`.

## Invocation

```bash
/atk:retro <sprint>                 # Evidence, discussion structure, and record for a sprint
/atk:retro 2026-09-01..2026-09-15   # Use an explicit date range
/atk:retro --data-only              # Gather the evidence pack before the meeting
/atk:retro --report --audience client  # Status report for a client, no internal detail
/atk:retro --lang vi                # Write in Vietnamese
/atk:retro --out <path>             # Override the default output path
```

## Workflow

```
[1. Check last actions] -> [2. Gather evidence] -> [3. Structure] -> [4. Capture] -> [5. Actions and report]
```

Before step 1, read `.atk/overrides/retro.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Check the previous retro

Read the last retro record and report each action as `DONE`, `IN PROGRESS`, or `NOT STARTED`, with
evidence. Open this retro with that result. A repeated `NOT STARTED` is itself the topic.

### 2. Gather evidence

From the tracker: committed versus completed, items added mid-sprint, items carried over, bug count
by origin. From git: PR count, review turnaround, PR size, revert count. From CI: failure rate and
pipeline duration. Present numbers as observations, never as a verdict on a person.

### 3. Structure the discussion

Offer a format and keep it: Went well, Did not go well, and Try next, or Start, Stop, Continue for a
team that prefers it. Attach the relevant evidence to each prompt so discussion starts from a fact.

### 4. Capture what the team says

Record team statements as the team's, distinct from evidence. Do not merge a strong opinion into the
data section, and do not soften a complaint into agreement.

### 5. Actions and report

At most three actions. Each has one owner, a due date, and a way to tell it is done. Anything beyond
three is a wish list. Then write the status report: internal reports carry the numbers and the
risks; client reports carry progress, decisions needed, and risks in the client's language, with no
internal metrics and no individual names.

## Output

Retro at `docs/records/retros/<sprint-or-date>.md` per `shared/artifact-paths.md`, with the status report as
a section or as its own file under `--report`.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Each action becomes one issue so the next retro can verify it.

## Definition of done

- [ ] The previous retro's actions are reported with evidence before anything new is discussed.
- [ ] Every metric states its source.
- [ ] Evidence and team opinion are in separate sections.
- [ ] At most three actions, each with one owner, a date, and a completion signal.
- [ ] No individual is named in a way that reads as a performance judgement.
