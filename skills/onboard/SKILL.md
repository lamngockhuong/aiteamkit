---
name: onboard
description: >
  Onboard a new member onto a project team: the access list, the environment setup verified by a
  command that actually runs, a map of the codebase by ownership, the team's working agreements, and
  a first-week plan ending in a real merged change.
  Use when someone joins the project, moves between teams, or returns after a long absence.
  Triggers on: "onboarding", "onboard", "người mới", "hướng dẫn thành viên mới", "new joiner",
  "getting started for the team", "オンボーディング", "新メンバー", "ramp up", "/atk:onboard".
argument-hint: "[--role dev|qa|sre|ba] [--refresh|--audit] [--lang <code>] [--out <path>]"
---

# Team Onboarding (`atk:onboard`)

Produces the document that gets a new member to a merged pull request in their first week. Every
setup step is verified against the repository, so the guide does not send a new joiner to a script
that no longer exists.

## Scope

Handles: deriving setup from the actual repository, listing access and accounts with who grants
them, mapping the codebase by area and owner, recording team working agreements, and building a
first-week plan with a real starter task.

Does NOT handle: granting access, writing the conventions themselves (`atk:convention`), setting the
project up for the kit (`atk:init`, which runs once per project rather than once per joiner), or
teaching the business domain in depth, which belongs to the project's domain documentation.

## Roles

Tech Lead assigns a buddy. PM owns access requests. The buddy owns the first week and is named in
the document. The new member owns reporting what the document got wrong. See `shared/team-roles.md`.

## Invocation

```bash
/atk:onboard                 # Build or update the onboarding document from the repository
/atk:onboard --role qa       # Tailor the path to a role
/atk:onboard --refresh       # Re-verify an existing document against the current repository
/atk:onboard --audit         # Report what is stale or missing, change nothing
/atk:onboard --lang vi       # Write in Vietnamese
/atk:onboard --out <path>    # Override the default output path
```

## Workflow

```
[1. Derive setup] -> [2. Verify] -> [3. Access list] -> [4. Code map] -> [5. First week]
```

Before step 1, read `.atk/overrides/onboard.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Derive the setup from the repository

Read the package manifests, runtime version files, `Dockerfile` and compose files, `.env.example`,
migration and seed commands, and the scripts the CI actually runs. The CI workflow is the most
honest description of how the project builds.

### 2. Verify every step

Each setup step states the command and the expected output or success signal. Mark a step
`UNVERIFIED` when it could not be checked rather than presenting it as working. A step referencing a
file that does not exist is a defect to report, not to copy.

### 3. Access list

Repository, tracker, CI, cloud, VPN, database, monitoring, chat channels, shared drives, and design
tools. For each: who grants it, how long it usually takes, and whether it blocks day one. Never
include a credential, a token, or a connection string; name where they are stored instead.

### 4. Code map

The areas of the codebase, what each does, its owner, and one entry-point file per area. Add the
parts that surprise newcomers: the non-obvious build step, the service that must run first, the
naming that means something other than it appears to.

### 5. First week plan

Day by day, ending in a merged change. Day one is environment plus a read-only tour. The starter
task is real, small, reviewed normally, and picked from the tracker rather than invented. State the
team's working agreements too: ceremony times, core hours, review turnaround, how to ask for help
and after how long, and the definition of done.

## Output

Written to `docs/onboarding.md` per `shared/artifact-paths.md`. Where a project README already
covers setup, link to it rather than duplicating it.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Access requests and the starter task can become issues when the
user asks.

## Definition of done

- [ ] Every setup step was verified against the repository, or is marked `UNVERIFIED`.
- [ ] No credential or token appears in the document.
- [ ] Every access item names who grants it and whether it blocks day one.
- [ ] Each code area names an owner and an entry-point file.
- [ ] The first-week plan ends in a real, merged change, and a buddy is named.
