# Role defaults

Loaded by `atk:init` when it proposes the `Approves` column of the team table, per The question
budget in `references/detection.md`. The Accepts column below is the default it proposes for each
role; `shared/team-roles.md` points here for the same table.

It sits inside the kit rather than in its docs because the install carries the kit alone, and a
default read from a file that did not ship would leave the column empty without anything failing.

## By role

What a person in each role writes, what waits on their acceptance, and where a skill asks them to
read or answer without owning the artifact. All three columns are collected from each skill's own
`## Roles` section. Anyone can run `atk:help`, and it is in no row.

| Role | Authors | Accepts | Reviews or answers in |
|------|---------|---------|------------------------|
| PM | `breakdown`, or TL; `release`, with SRE; `retro`, or the team | `estimate`, with the Stakeholder; the go in `release`, or the Stakeholder; the follow-up actions in `incident`, with TL; an unfixed finding in `security`, or the Stakeholder; the exit criteria, the defect severity scale, and a test level nobody decided in the `qa` master test plan, and the exit criteria and a severity scale a feature test plan carries itself; a `tailor` override of `intake`, `estimate`, `breakdown`, `release`, or `retro` | `orchestrate`, confirming a breakdown's owners before its tasks become pieces; `init` tracker and team sections, which PM writes; `intake`, which PM leads with BrSE/BA; `catchup`, answering what a newcomer asks; `qa` exit criteria; `incident` client communication; access in `onboard` and `handover` |
| BrSE/BA | `intake`; `spec` of kind `screen` | `spec` of kinds `feature` and `screen`; a `tailor` override of `design-doc` or `spec` | `orchestrate`, answering the questions a requirement job relays; `catchup`, answering what a newcomer asks; `design-doc`, that it still meets the requirement; `qa`, that the cases match the intent |
| TL | `orchestrate`, or Dev; `init`, or Dev; `tailor`; `estimate` sizes, with Dev; `design-doc`, or Dev; `breakdown`, or PM; `convention`; `security`, or Dev | `orchestrate` proposal records; `init`; `design-doc`; `spec` of kinds `api` and `db`; the environments and the rest of the `qa` master test plan, and the environments a feature test plan carries or adds; `plan`, when it touches a schema, a public contract, or two services; `qa` and `run-cases` records, or the QA lead; `security`, unless the team has a security officer; the follow-up actions in `incident`, with PM; a `tailor` override of any skill not listed for PM, BrSE/BA, or QA, and any override touching how code is written or reviewed | `intake` feasibility; `implement`, at the large gate and the review ceiling; `fix`, when the intent check stops; `verify`, at the ceiling; `review`, on a disputed blocking finding; `release` technical risk; `incident` root cause; a buddy for `onboard`; gaps in `handover` |
| Dev | `orchestrate`, or TL; `init`, or TL; `estimate` sizes; `design-doc`, or TL; `spec`; `plan`; `implement`; `fix`; `verify`; `review` of someone else's change; `security`, or TL; `git` | Their own tasks in `breakdown`; their own `plan`, below the TL boundary; the `verify` report of a change they review | `catchup`, as the reader who takes the understanding check; `convention`, agreeing rule by rule; `qa` handoff and test data |
| QA | `qa`, the plan, the cases, and the run records of the cases they ran, and, as QA lead, the master test plan; `run-cases`, the record of a run they started; its own test effort in `estimate` | `qa` feature plans, cases and run records, those `run-cases` wrote among them, as QA lead, never the master test plan, which the PM and the Tech Lead approve; a `tailor` override of `qa` | `intake`, that each criterion is testable; `catchup`, as a reader joining work in flight; its own test tasks in `breakdown`; `fix`, that the symptom is gone against the reproduction; `review` test adequacy; `security`, read at sign-off; `release` test result |
| SRE | `release`, with PM | Nothing in the cycle | `design-doc` deployment, data, and capacity; `verify` environment; `run-cases`, when the test plan names them as the owner of its environment; `security` configuration, infrastructure, and secrets; `release` execution and rollback; `incident` mitigation |
| Stakeholder | Nothing in the cycle | `intake` scope and criteria; `estimate`, with PM; the go in `release`, or PM; an unfixed finding in `security`, or PM | Open questions `intake` names them against |

Some skills name a person by what they are doing, whatever their role: whoever joins reads
`catchup` and walks through `onboard`, the leaver writes `handover` and the receiver accepts it, the
Incident Commander writes `incident`, and the whole team accepts the actions in `retro`.
