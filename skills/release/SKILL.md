---
name: release
description: >
  Run a team release: assemble the change list from the diff, write release notes for the audience
  that reads them, produce the pre-flight and post-deploy checklist with an owner per step, state
  the rollback path, and record who approved the go decision.
  Use before deploying to staging or production, when cutting a version, or when writing notes for a
  client.
  Triggers on: "release", "deploy checklist", "release note", "phát hành", "ghi chú phát hành",
  "cut a version", "go live", "リリース", "リリースノート", "ship this", "/atk:release".
argument-hint: "[version|tag-range] [--notes|--checklist] [--audience internal|client] [--env <name>] [--out <path>]"
---

# Release Management (`atk:release`)

Turns a set of merged commits into a release a team can execute at a known hour with a known way
back. The rollback path is written before the deploy, not improvised during it.

## Scope

Handles: collecting the change list from git and the tracker, writing release notes per audience,
building the checklist with owners and timings, listing migrations and config changes, stating the
rollback path, and recording the go or no-go decision.

Does NOT handle: executing the deployment, which the pipeline and SRE own; testing (`atk:qa`); or
handling a failed release, which is `atk:incident`.

## Roles

PM owns the go decision and the client communication. SRE owns execution and the rollback. QA signs
off the test result. Tech Lead signs off the technical risk. See `shared/team-roles.md`.

## Invocation

```bash
/atk:release <version>                # Full release artifact for a version
/atk:release v1.3.0..HEAD             # Build from an explicit tag or commit range
/atk:release --notes --audience client  # Client-facing notes only, no internal detail
/atk:release --checklist --env prod   # Deployment checklist for a named environment
/atk:release --out <path>             # Override the default output path
```

## Workflow

```
[1. Collect changes] -> [2. Notes per audience] -> [3. Risk and migration] -> [4. Checklist] -> [5. Go decision]
```

Before step 1, read `.atk/overrides/release.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Collect the changes

Read the commit range and the linked tickets. Where the shape in `.atk/profile.md` names member
repositories, there is no single range: read one per repository in the Repositories table, say which
repository each change came from, and name any member whose range could not be read rather than
leaving it out of the notes. Group by user-visible feature, fix, and internal
change. A commit with no ticket and no clear user effect is listed under internal and flagged, not
dropped.

### 2. Notes per audience

Internal notes carry ticket IDs, migrations, config keys, and known issues. Client notes carry what
changed for the user, in the client's language, with no internal IDs and no blame for the bugs being
fixed. Never publish internal notes to a client by default.

### 3. Risk and migration

List every schema migration with its duration estimate, its reversibility, and whether it requires
downtime. List every new or changed config key and secret, and where it must be set per environment.
Flag anything that cannot be rolled back, because that changes the go decision.

Where a security record under `docs/records/security/` covers this range, link it, and carry each
open Critical or High finding into the checklist as a blocking item, with its `Accepted by` cell as
the record has it. An empty cell is an unchecked item, not an accepted risk.

### 4. Checklist

Three phases, each step with an owner and an expected duration: pre-flight (backup taken, migration
rehearsed on staging, config set, feature flags, maintenance notice, on-call confirmed), deploy
(order across services, health checks), and post-deploy (smoke tests, metrics and error rate to
watch, and for how long).

The rollback section states the trigger condition, the exact steps, the data implication, and who
may call it without waiting for a meeting.

### 5. Go decision

Record each sign-off with a name and a state. An unchecked blocking item means no-go; say so plainly
rather than presenting a release as ready.

## Output

Written to `docs/records/releases/<version>.md` per `shared/artifact-paths.md`. Sections: front matter,
scope and change list, internal notes, client notes, migrations and config, checklist with owners,
rollback plan, sign-offs, and known issues shipping with the release.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Map the release to the tracker's release, fix version, or
milestone, and link each included ticket.

## Definition of done

- [ ] Every included change traces to a commit and, where one exists, a ticket.
- [ ] Client notes contain no internal ticket IDs or internal terminology.
- [ ] Every migration states whether it is reversible and whether it needs downtime.
- [ ] Every checklist step has an owner.
- [ ] The rollback trigger, steps, and caller are written before the deploy.
