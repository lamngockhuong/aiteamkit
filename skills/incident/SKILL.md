---
name: incident
description: >
  Run a production incident and close it properly: a timeline built from evidence, impact and
  severity, the proven root cause, the mitigation actually applied, a blameless postmortem, follow-up
  actions with owners and dates, and the runbook that makes the next occurrence shorter.
  Use during an outage, after one, or when writing the runbook for a recurring failure.
  Triggers on: "incident", "outage", "sự cố", "postmortem", "RCA", "root cause", "production down",
  "障害", "障害報告", "hotfix", "runbook", "/atk:incident".
argument-hint: "[--live|--postmortem|--runbook] [severity] [--out <path>]"
---

# Incident Response and Postmortem (`atk:incident`)

Keeps an incident legible while it is happening and honest after it ends. During the incident the
priority is mitigation and a timestamped log; the analysis waits. Afterwards the cause must be
proven, not plausible, and the actions must have owners and dates or they will not happen.

## Scope

Handles: structuring the live response, recording the timeline, classifying severity and impact,
proving root cause, writing the blameless postmortem, generating follow-up actions, and writing or
updating the runbook.

Does NOT handle: fixing the code, which is `atk:fix` once the service is stable and the timeline no
longer needs a responder's attention; deploying the hotfix (`atk:release`); or assigning blame,
which is never an output of this skill.

## Roles

An Incident Commander is named first, before anything else, and is not the person typing commands.
SRE executes mitigation. Tech Lead owns the root cause analysis. PM owns stakeholder and client
communication. See `shared/team-roles.md`.

## Invocation

```bash
/atk:incident --live            # Structure an ongoing incident: roles, timeline, comms
/atk:incident --live P1         # Start at a known severity
/atk:incident --postmortem      # Write the postmortem after mitigation
/atk:incident --runbook <slug>  # Write or update the runbook for a failure mode
/atk:incident --out <path>      # Override the default output path
```

## Workflow

```
[1. Declare] -> [2. Mitigate and log] -> [3. Resolve] -> [4. Prove cause] -> [5. Postmortem and runbook]
```

### 1. Declare

Name the Incident Commander, set the severity, and state the impact in user terms: who cannot do
what, since when, and how many. Open the timeline with the detection time and how it was detected.

| Severity | Meaning |
|----------|---------|
| `P1` | Service down or data at risk. All hands, client notified now |
| `P2` | Major feature broken, no workaround. Fix during the working day |
| `P3` | Degraded or workaround exists. Scheduled fix |

### 2. Mitigate and log

Restore service first. Preserve evidence before restarting anything: logs, metrics snapshot, a copy
of the bad data, the failing request. Append every action to the timeline with a timestamp, who did
it, and what changed after. Do not analyze the cause while users are down.

### 3. Resolve

Record the mitigation that actually worked, the recovery time, and whether the underlying cause is
still present. A mitigated incident with an unfixed cause stays open.

### 4. Prove the cause

List the hypotheses considered and the evidence that eliminated each. The accepted cause must be
supported by a log line, a metric, a commit, or a reproduction. Also state why it was not caught
earlier: which test, alert, or review would have caught it and did not exist.

### 5. Postmortem and runbook

Blameless means the analysis targets the system, not the person. Write "the deploy had no staging
rehearsal", never "X forgot to rehearse". Every follow-up action gets an owner, a date, and a ticket.
Actions with no owner do not go in the document.

## Output

Incident at `docs/incidents/<date>-<slug>.md`, runbook at `docs/runbooks/<slug>.md`, per
`shared/artifact-paths.md`. Sections: front matter, summary, impact, timeline, root cause with
evidence, detection gap, mitigation, follow-up actions, and lessons.

The timeline stays a table, because a reader checks it against a log line by line. A causal chain
diagram goes under the root cause, per `shared/diagram-conventions.md`, showing what led to what and
where detection should have fired.

## Ticket

Follow `shared/ticket-adapters.md`. Each follow-up action becomes one issue linked to the incident.

## Definition of done

- [ ] The Incident Commander is named.
- [ ] The timeline has timestamps, actors, and outcomes, not a narrative.
- [ ] The root cause cites evidence; rejected hypotheses are listed with why they were rejected.
- [ ] The detection gap is answered: what should have caught this.
- [ ] Every follow-up action has an owner, a date, and a ticket.
- [ ] No sentence in the postmortem names a person as the cause.
