---
name: onboard
description: >
  Onboard a new member onto a project team: the access list, the environment setup verified by a
  command that actually runs, a map of the codebase by ownership, the team's working agreements, and
  a first-week plan ending in a real contribution the team reviews.
  Use when someone joins the project, moves between teams, or returns after a long absence.
  Triggers on: "onboarding", "onboard", "người mới", "hướng dẫn thành viên mới", "new joiner",
  "getting started for the team", "オンボーディング", "新メンバー", "ramp up", "/atk:onboard".
argument-hint: "[--role dev|qa|sre|ba|<role>] [--refresh|--audit] [--lang <code>] [--out <path>]"
---

# Team Onboarding (`atk:onboard`)

Produces the document that gets a new member to a real, reviewed contribution in their first week.
Every setup step is verified against the repository, so the guide does not send a new joiner to a
script that no longer exists.

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
/atk:onboard --role qa       # Vary the access list and the first week for a role
/atk:onboard --role designer # Any role, not only the four the kit wrote rows for
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
`UNVERIFIED` when it could not be checked rather than presenting it as working. A step the
repository gets wrong about itself is a defect to report, not to copy: a command in no manifest, a
file the instructions name and the tree does not have, an order of operations nothing records.

The line between the two is who is at fault. `UNVERIFIED` is about this run: the step needs a
credential, a network, or a machine the run does not have, and it may well be correct. A defect is
about the repository: the run could check it and the project's own claim did not hold. A step that
runs and fails for a reason the documentation should have warned about is a defect, not an
`UNVERIFIED`, because the next person hits it too.

Report it to `docs/derived/onboarding/setup-defects.md`, per `shared/artifact-paths.md`, and not
into the onboarding document. The two have different readers: the defect is fixed by whoever owns
the script or the document that is wrong, and the onboarding document is read on a first morning by
the one person on the team who can do nothing about it. One file, carrying no date, rewritten whole
on every run: a defect somebody has fixed is then gone from it, instead of going stale in a document
that is updated in place. A run that finds nothing writes nothing. Under `--audit` nothing is
written either, because that flag promises to change nothing; the defects are named in the session
instead. Either way the session is told where the file is, or that none was written, and whether
the project tracks that path at all.

Each entry says what the project claims, what actually happens, and where the claim lives. Describe
the failure rather than pasting the output. A setup step that fails is exactly where a connection
string, a token, or a password reaches the terminal, and the rule against putting one in the
onboarding document holds for this file too. Name the person who owns each defect where the
repository answers it. Turning any of them into a tracker issue is the `## Ticket` section below, on
request.

### 3. Access list

Repository, tracker, CI, cloud, VPN, database, the environments the team tests and releases
against, monitoring and the on-call rota, chat channels, shared drives, and design tools. For each:
who grants it, how long it usually takes, and whether it blocks day one. Never include a
credential, a token, or a connection string; name where they are stored instead.

`--role` decides which items block day one. It does not decide which items appear: every row above
is listed for every role. See `references/roles.md`.

### 4. Code map

The areas of the codebase, what each does, its owner, and one entry-point file per area. Add the
parts that surprise newcomers: the non-obvious build step, the service that must run first, the
naming that means something other than it appears to.

### 5. First week plan

Day by day, ending in the contribution `references/roles.md` names for the role, which is a merged
change for a developer and something of that role's own for everyone else. Where neither `--role` nor the
request names a role, ask which one before step 3 rather than picking one quietly. Day one is
environment plus a
read-only tour. The starter task is real, small, reviewed normally, and picked from the tracker
rather than invented. `--role` moves the ending and nothing else about the week.

Where the tracker cannot be read, per Detected is not reachable in `shared/ticket-adapters.md`, the
starter task is the one thing in this document the repository cannot supply. Do not invent one, and
do not let the day disappear: a week that quietly ends a day early reads as a week that was meant
to. Write the task as `TBD (ask <buddy>)`, keep the rest of the plan as it stands, say in the
session that the document promises a contribution it cannot yet name, and leave the front matter at
`DRAFT` until the buddy fills it in. The same route holds where the tracker answers and holds
nothing small enough to start on: either way a person picks the task, not this skill. State the
team's working agreements too: ceremony times, core hours, review turnaround, how to ask for help
and after how long, and the definition of done.

## Output

Written to `docs/onboarding-<role>.md` under `--role`, and to `docs/onboarding.md` when no role was
named, per `shared/artifact-paths.md`. One document per role, so onboarding a QA engineer never
overwrites the developer's, and `--refresh` and `--audit` reach the right one by taking the same
`--role`. Where a project README already covers setup, link to it rather than duplicating it.

A run that found a defect in step 2 leaves a second file, the report at
`docs/derived/onboarding/setup-defects.md`. It is derived rather than reference: a project may keep
`docs/derived/` out of git, and where it does, the report reaches nobody unless the run says so. Name
its path in the session, say whether the project tracks it, and offer the tracker below when it does
not.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Access requests, the starter task, and each defect from step 2
can become issues when the user asks. A defect is the one of the three that often has nowhere else
to go, because the report holding it may sit in an untracked directory.

## Definition of done

- [ ] Every setup step was verified against the repository, or is marked `UNVERIFIED`.
- [ ] No credential or token appears in the onboarding document or in the defect report.
- [ ] Every access item names who grants it and whether it blocks day one.
- [ ] Each code area names an owner and an entry-point file.
- [ ] The first-week plan ends in the contribution `references/roles.md` names for the role, and a
      buddy is named. Where no starter task could be read from the tracker, the day names who owes
      it, no task was invented, and the session said the document is unfinished until it lands.
- [ ] Every defect found in step 2 is in the report, and none of them is in the onboarding document.
- [ ] The session was told where the defect report is and whether the project tracks that path.
- [ ] Under `--audit`, no file was modified.
