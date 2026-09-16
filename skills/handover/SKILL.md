---
name: handover
description: >
  Hand work over to another person or team so nothing depends on the leaver's memory: the true state
  of each item, decisions and why they were made, the traps, the credentials and access to transfer,
  the contacts, and the questions only the leaver can answer, asked before they go.
  Use when a member leaves or rotates, when a phase ends, at a vendor-to-client handover, or before
  a long absence.
  Triggers on: "handover", "hand over", "bàn giao", "chuyển giao công việc", "takeover", "leaving",
  "引き継ぎ", "引継ぎ資料", "knowledge transfer", "offboarding", "/atk:handover".
argument-hint: "[--from <name>] [--to <name>] [--scope <area>] [--phase|--offboard] [--lang <code>] [--out <path>]"
---

# Work Handover (`atk:handover`)

Captures the part of a project that lives in one person's head. It is written while that person is
still available, and it is validated by the receiver reproducing something, not by the leaver
declaring it complete.

## Scope

Handles: inventorying the in-flight work with its true state, recording decisions and their reasons,
listing traps and workarounds, planning the access and credential transfer, naming contacts, and
extracting the knowledge that exists nowhere else.

Does NOT handle: transferring credentials itself, which is a human action through the team's secret
manager; onboarding the receiver onto the project (`atk:onboard`); or approving the handover.

## Roles

The leaver authors. The receiver validates and is the approver: a handover is accepted by the person
taking it, never by the person leaving. Tech Lead arbitrates gaps. PM owns access revocation. See
`shared/team-roles.md`.

## Invocation

```bash
/atk:handover --from An --to Binh   # Person to person handover
/atk:handover --scope payments      # Limit to one area or module
/atk:handover --phase               # End-of-phase handover between teams or vendors
/atk:handover --offboard            # Member leaving: adds access revocation and knowledge extraction
/atk:handover --lang vi             # Write in Vietnamese
/atk:handover --out <path>          # Override the default output path
```

## Workflow

```
[1. Inventory] -> [2. True state] -> [3. Decisions and traps] -> [4. Access] -> [5. Validate]
```

### 1. Inventory

Gather from the tracker, open branches and pull requests, uncommitted work, review queue, scheduled
jobs owned by the leaver, recurring duties, and any environment or service where they are the only
admin. Search git history for files only this person has touched: those are the risk.

### 2. True state, not ticket state

For each item: what is actually done, what looks done but is not, what is blocked and by whom, and
what the next concrete step is. Ticket status is evidence, not truth. Where they disagree, record
both and say which is real.

### 3. Decisions and traps

Record decisions whose reason is not in the code: why a library was chosen, why an obvious approach
failed, what a client agreed verbally. Then the traps: the fragile deploy step, the flaky test and
what actually causes it, the service that must be restarted in an order, the data that looks wrong
but is not.

Interview for what only this person knows. Ask, one at a time: what would break if you were
unreachable tomorrow, what do you check that nobody asked you to check, what would you warn your
replacement about in the first hour.

### 4. Access and duties

List every account, credential, key, and duty to transfer, with the path in the secret manager and
the person who approves the transfer. Never paste a secret into the document. Add the revocation
checklist with dates under `--offboard`, and name who takes each recurring duty.

### 5. Validate

The receiver runs the environment, opens one in-flight item, and follows one runbook, then signs.
Unanswered questions stay in the document as `OPEN` with the person who must now answer them.

## Output

Written to `docs/handover/<date>-<from>-to-<to>.md` per `shared/artifact-paths.md`. Sections: front
matter, scope, work inventory with true state, decisions, traps, access and duties, contacts, open
questions, and the receiver's validation checklist.

## Ticket

Follow `shared/ticket-adapters.md`. Reassign in-flight tickets only after the receiver accepts, and
link the handover from each.

## Definition of done

- [ ] Every in-flight item states its true state, not only its ticket status.
- [ ] Files touched by only the leaver are identified and covered.
- [ ] No secret value appears in the document, only its location and approver.
- [ ] Every recurring duty has a new named owner.
- [ ] The receiver validated by running something, and signed as approver.
