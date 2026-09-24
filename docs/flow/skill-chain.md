# Skill Chain

What each skill reads, what it leaves behind, and which skill picks that up next. The phases and the
approval gates between them are in [project-flow.md](./project-flow.md), and how one skill runs and
calls another is in [skill-lifecycle.md](./skill-lifecycle.md); this document is about the
artifacts.

Exact output paths are not repeated here. They live in one place, `shared/artifact-paths.md`, and
that file is the authority when the two disagree.

## The chain

Nodes are artifacts. Edge labels are the skill that turns one into the next.

```mermaid
flowchart LR
    A0["Raw request<br/><small>chat, mail, ticket</small>"]
    A1["Requirements<br/><small>stories, criteria, open questions</small>"]
    A2["Estimate<br/><small>sizes, capacity, commitment</small>"]
    A3["Design + ADR"]
    A3b["Reference documents<br/><small>API, schema, feature</small>"]
    A4["Task list<br/><small>owners, lanes, dependencies</small>"]
    A5["Plan<br/><small>phases and steps</small>"]
    A6["Code + implementation record"]
    A6b["Pull request<br/><small>the record as its body</small>"]
    A7["Review findings"]
    A8["Test plan and cases"]
    A9["Verification report"]
    A10["Release notes + checklist"]
    A11["Postmortem + runbook"]
    A12["Retro + status report"]

    A0 -->|intake| A1
    A1 -->|estimate| A2
    A1 -->|design-doc| A3
    A2 -->|breakdown| A4
    A3 -->|breakdown| A4
    A3b -->|design-doc| A3
    A4 -->|plan| A5
    A5 -->|implement| A6
    A6 -->|git| A6b
    A6b -->|review| A7
    A7 -->|implement| A6
    A6 -->|spec --sync| A3b
    A3 -.->|spec --from, Contract: first| A3b
    A3b -->|qa| A8
    A6 -->|qa| A8
    A8 -->|verify| A9
    A9 -->|release| A10
    A10 -->|incident| A11
    A10 -->|retro| A12
```

Four skills sit beside the chain rather than in it, because they read the whole of it instead of
one link: `help` reads the state of every link to say which one comes next, `catchup` summarises any of these for a newcomer, `onboard` walks a new member through the
repository, and `handover` records the true state of everything still in flight.

Three more feed the chain without being produced by it: `init` writes the profile every
code-touching skill reads, `convention` writes the rules `implement` follows and `review` enforces,
and `tailor` writes the override file each skill reads before its first step.

`spec` is the one node the chain returns to rather than passes through. Its documents are an input to
the next design and the next test plan, and an output of every change that alters a contract, which
is why the arrow into them comes from the code rather than from the design that proposed it. A
project whose profile says `Contract: first` adds a second arrow, from the design into `spec`: the
contract is written from the design while it is in review, so frontend, backend and QA build against
it before the code exists, and the arrow from the code then moves each item onto the code as it
lands, per `shared/spec-docs.md`.

## What each skill consumes

| Skill | Reads | Produces | Next skill that uses it |
|-------|-------|----------|-------------------------|
| `help` | The kit's own skills, and the project's profile, artifact front matter, plans, and branch | An answer in the session, no file | The skill it names, run by the asker |
| `init` | The repository | Project profile | Every skill that runs a command |
| `tailor` | A shipped `SKILL.md`, and what the team says it wants different | Project override for that skill | The skill it is named after |
| `intake` | A raw request | Requirements with open questions | `estimate`, `design-doc`, `qa` |
| `catchup` | An epic or a pull request | A brief plus an understanding check | The person, not a skill |
| `estimate` | Requirements or an epic | Sizes, capacity, sprint commitment | `breakdown` |
| `design-doc` | Requirements, and the reference documents for the area | Design plus ADR; under `Contract: first` the contract in summary, naming the reference documents | `breakdown`, `plan`, `implement`, and `spec` under `Contract: first` |
| `spec` | The code, and the documents already in `docs/api/`, `docs/database/`, `docs/features/`; under `Contract: first`, the design too | Reference documents kept current, or a drift report | `design-doc`, `qa`, `plan`, `implement`, `review` |
| `breakdown` | A design or an epic | Owned tasks, lanes, dependency graph | `plan`, `implement` |
| `convention` | The code and its history, and the convention gaps in the review reports already written | Conventions classified by how they are enforced | `implement`, `review` |
| `plan` | A ticket, design, or description; under `--review`, a plan already written | Phases and steps, or findings about a plan | `implement`; under `--review`, the plan's author |
| `implement` | A plan, ticket, or description | Code plus the record that becomes the PR body | `review`, `qa` |
| `fix` | A defect report | A proven cause and the smallest change | `verify`, `review` |
| `review` | A pull request or branch | Findings ranked blocking, should fix, nit, and the convention gaps behind them | `implement`, `fix`, `convention` |
| `qa` | Acceptance criteria, the change, the reference documents for expected values, and the design for migration, rollback and rollout | Test plan, cases, regression matrix | `verify` |
| `verify` | The running system | What was proven, and what was not | `release` |
| `git` | A finished change or artifact, and the record the calling skill wrote | Commits, a branch, and the pull request that carries the record | `review`, then the approver |
| `release` | The diff since the last version | Notes, checklist, rollback path | `incident`, `retro` |
| `incident` | Logs, metrics, the timeline | Postmortem plus runbook | `retro`, `fix` |
| `retro` | Git, the tracker, the team | Verified actions, evidence, status report | The next cycle |
| `onboard` | The repository and the access list | Setup, code map, first week, and a report of any setup defect found | The new member, and whoever owns a reported defect |
| `handover` | Everything in flight | State, decisions, traps, access transfer | The receiver |

## Where a chain breaks

A link is only as good as the artifact behind it, and four breaks are common enough to name.

**No profile.** Skills that run the project's own commands stop and ask for `atk:init` rather than
guessing a test command. Skills that only read a diff carry on and record that the profile was
absent. `shared/project-profile.md` says which skill does which.

**An artifact that was never approved.** A design at `DRAFT` is a proposal, and building from it
means the first review comment is about the design. Check the `status` field in the front matter
before consuming an artifact, not the file's existence.

**A reference document nobody carried.** A contract changed and its document did not, so the next
person designing against it designs against something that stopped being true. `atk:review` raises
this as a blocking finding, and `atk:spec --check` finds the ones that got through. The obligation
and the five changes that trigger it are in `shared/spec-docs.md`.

**A superseded artifact still looking current.** Planning the same work twice makes a second
directory, and nothing marks the first one dead automatically. The rule for retiring it is at the
end of `shared/artifact-paths.md`.
