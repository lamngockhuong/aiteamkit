# Project Flow

How the 18 skills fall into a team's delivery cycle: which phase each one belongs to, who authors
its artifact, and who has to accept it before the next phase starts.

Companion documents: [skill-chain.md](./skill-chain.md) for what each skill consumes and produces,
[../skills-overview.md](../skills-overview.md) for when to use a skill and when not to.

Roles are the ones in `shared/team-roles.md`: PM, BrSE/BA, TL, Dev, QA, SRE, and Stakeholder. A
small team maps several of them onto one person; the point of naming them separately is that the
author of an artifact and its approver are two entries, even when they resolve to the same face.

## Phase overview

```mermaid
flowchart LR
    P0["0. Setup<br/>once per project"] --> P1["1. Requirement"]
    P1 --> P2["2. Estimate"]
    P2 --> P3["3. Design"]
    P3 --> P4["4. Split and sequence"]
    P4 --> P5["5. Build"]
    P5 --> P6["6. Verify"]
    P6 --> P7["7. Release"]
    P7 --> P8["8. Operate and learn"]
    P8 -.->|Next cycle| P1
```

## The cycle in detail

Every diamond is a person accepting or rejecting an artifact, never a skill deciding. A rejected
artifact goes back to its author, which is the loop each phase is drawn with.

```mermaid
flowchart TD
    subgraph S0["0. Setup"]
        I0["atk:init<br/><small>Dev or TL</small>"] --> I1[".atk/profile.md committed"]
    end

    subgraph S1["1. Requirement"]
        R0["atk:intake<br/><small>BrSE/BA drafts</small>"] --> R1{"Stakeholder<br/>accepts scope"}
        R1 -->|Open questions unanswered| R0
        R1 -->|Accepted| R2["atk:catchup<br/><small>for whoever joins later</small>"]
    end

    subgraph S2["2. Estimate"]
        E0["atk:estimate<br/><small>Dev sizes, PM checks capacity</small>"] --> E1{"PM and Stakeholder<br/>commit the sprint"}
        E1 -->|Scope does not fit| R0
        E1 -->|Committed| E2["Sprint backlog"]
    end

    subgraph S3["3. Design"]
        D0{"Touches schema, public contract,<br/>shared module, or two services?"}
        D0 -->|No| N0["Skip to phase 4"]
        D0 -->|Yes| D1["atk:design-doc<br/><small>TL or Dev drafts, ADR recorded</small>"]
        D1 --> D2{"TL approves"}
        D2 -->|Change requested| D1
    end

    subgraph S4["4. Split and sequence"]
        B0{"Work shared across<br/>several people?"}
        B0 -->|Yes| B1["atk:breakdown<br/><small>owners, lanes, dependencies</small>"]
        B0 -->|No| B2["atk:plan<br/><small>phases and steps for one person</small>"]
        B1 --> B2
        C0["atk:convention<br/><small>once, then re-synced when the code moves on</small>"]
    end

    subgraph S5["5. Build"]
        M0["atk:implement<br/><small>Dev</small>"] --> M1["atk:review<br/><small>reviewer is never the author</small>"]
        M1 -->|Blocking findings| M0
        M1 -->|Approved| M2["Merged"]
    end

    subgraph S6["6. Verify"]
        V0["atk:qa<br/><small>QA writes the plan and cases</small>"] --> V1["atk:verify<br/><small>the running system exercised</small>"]
        V1 --> V2{"QA signs off"}
        V2 -->|Defect found| F0["atk:fix"]
        F0 --> V1
    end

    subgraph S7["7. Release"]
        L0["atk:release<br/><small>notes, checklist, rollback path</small>"] --> L1{"Stakeholder or PM<br/>gives the go"}
        L1 -->|Not yet| L0
        L1 -->|Go| L2["SRE deploys"]
    end

    subgraph S8["8. Operate and learn"]
        O0["atk:incident<br/><small>when production breaks</small>"]
        O1["atk:retro<br/><small>end of sprint or phase</small>"]
    end

    I1 --> R0
    R2 --> E0
    E2 --> D0
    N0 --> B0
    D2 -->|Approved| B0
    C0 --> M0
    B2 --> M0
    M2 --> V0
    V2 -->|Passed| L0
    L2 --> O0
    L2 --> O1
    O1 -.->|Actions feed the next cycle| R0
```

## Phase reference

| Phase | Skill | Author | Accepted by | Artifact state at the gate |
|-------|-------|--------|-------------|-----------------------------|
| 0. Setup | `atk:init` | Dev or TL | Committed with the repository, no separate approval | n/a |
| 1. Requirement | `atk:intake` | BrSE/BA | Stakeholder, on scope and criteria | `IN REVIEW` to `APPROVED` |
| 1. Requirement | `atk:catchup` | Whoever joins | Nobody; the understanding check is self-marked | `DRAFT` |
| 2. Estimate | `atk:estimate` | Dev, with PM on capacity | PM and Stakeholder together | `IN REVIEW` to `APPROVED` |
| 3. Design | `atk:design-doc` | TL or Dev | TL, who owns the final technical call | `IN REVIEW` to `APPROVED` |
| 4. Split | `atk:breakdown` | TL or PM | Dev owners accept their own tasks | `IN REVIEW` to `APPROVED` |
| 4. Sequence | `atk:plan` | Dev | The author, unless the plan gate raised it to TL | `DRAFT` |
| 4. Rules | `atk:convention` | TL | Team agreement, recorded per rule | `IN REVIEW` to `APPROVED` |
| 5. Build | `atk:implement` | Dev | The reviewer, in the next row | n/a |
| 5. Build | `atk:review` | Reviewer, never the author | TL when the loop hits its ceiling | n/a |
| 6. Verify | `atk:qa` | QA | QA lead or TL | `IN REVIEW` to `APPROVED` |
| 6. Verify | `atk:verify` | Dev or QA | QA sign-off before the ticket moves | `DRAFT` |
| 7. Release | `atk:release` | PM with SRE | Stakeholder or PM gives the go decision | `IN REVIEW` to `APPROVED` |
| 8. Operate | `atk:incident` | Incident Commander | TL and PM on the follow-up actions | `IN REVIEW` to `APPROVED` |
| 8. Learn | `atk:retro` | PM or the team | The team, on the three actions | `IN REVIEW` to `APPROVED` |

## Outside the cycle

Three skills answer an event rather than a phase, and can fire at any point above.

```mermaid
flowchart LR
    X1["Defect reported"] --> X2["atk:fix<br/><small>prove the cause before changing a line</small>"]
    X3["Someone joins"] --> X4["atk:onboard<br/><small>first week ends in a merged change</small>"]
    X5["Someone leaves,<br/>or a phase ends"] --> X6["atk:handover<br/><small>receiver validates before signing</small>"]
```

`atk:fix` is the one that reaches back into the cycle: a defect found in phase 6 returns to phase 6
after the fix, and one found after release opens phase 8 instead.

## What this flow does not say

It does not set your sprint length, your branch strategy, or who your approvers are by name. Those
are team decisions, and the kit records them rather than choosing them: approvers per artifact type
go in `.atk/profile.md` (see `shared/project-profile.md`), and branch and commit rules are whatever
`atk:convention` finds in the repository.
