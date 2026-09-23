# State signals

Loaded by `atk:help` in step 4. What on disk says which skill comes next, in the order to check it.

This file holds the one list `atk:help` keeps. What each skill does is read from the skills
themselves, so a skill added to the kit needs a row here only when something on disk says it is the
next one to run. A skill that answers an event a person reports, a defect, a joiner, an outage, has
no row: nothing on disk announces the event, and the question routes to it through the description.

## Which artifacts gate

Only some artifacts hold up the next skill while they wait for approval. An artifact **gates** when
it sits in the Reference or Record group of `shared/artifact-paths.md` and is not one of two kinds:

- The evidence for one change, the fix report and the verification record among them, which
  `shared/artifact-paths.md` sends into the pull request carrying that change. Its approval is the
  review of that pull request, so waiting on it before opening the pull request waits forever.
- A plan. `atk:plan` leaves a plan at `DRAFT` and lets the work start; the Tech Lead gates one only
  by moving it to `IN REVIEW`.

Nothing in the Derived group gates. A catchup brief or a review report may sit at `DRAFT` for good,
and that is not approval anybody owes.

"Approved" means `status: APPROVED` in the front matter, and nothing else. A file that exists is not
a file that was accepted, and building on a proposal means the first review comment is about the
proposal. Each artifact is looked for at the path `shared/artifact-paths.md` gives it, resolved
against this project's docs root.

## The signals

Check the rows top to bottom and stop at the first one that holds. The order is what blocks most:
work already written but not carried comes before new work, because new work started on top of it
is how a branch collects three unrelated changes.

"The work in hand" is the ticket the current branch names, in its name or its commits. On a branch
that names none, it is the gating artifact updated most recently.

| # | Holds when | Run | Rather than |
|---|------------|-----|-------------|
| 1 | The Docs section of `.atk/profile.md` says `Contract: first`, the design for the work in hand is `IN REVIEW` or `APPROVED`, and a reference document it names does not exist yet | `atk:spec <subject> --from <design path>`, once per document the design names | Waiting on the design alone, or `atk:plan`: the contract is reviewed beside the design under `Contract: first`, per `shared/spec-docs.md`, and a plan built before it exists has nothing agreed to build against |
| 2 | A gating artifact for the work in hand is `DRAFT` or `IN REVIEW` | No skill. Name the artifact and its approver under `Waiting on people` | The next skill, which would build on something nobody accepted |
| 3 | The current branch changes an API, a table, or a feature's behaviour, and the reference document for it is not in the diff | `atk:spec --sync` | `atk:git`, which would carry the change without the document it owes, per `shared/spec-docs.md` |
| 4 | The working tree has uncommitted changes, or the branch is ahead of its base with no pull request open | `atk:git` | `atk:review`, which reads a pull request that does not exist yet |
| 5 | A pull request is open for the branch, with no review on it and no review report for it | `atk:review <pr>` | `atk:qa`, which tests code a reviewer may still send back |
| 6 | The newest review report for the open pull request has `BLOCKING` findings and no commit on the branch is newer than the report | `atk:implement "address the BLOCKING findings in <report path>"` | A second `atk:review`, which would report the same findings |
| 7 | A plan's index is not `SUPERSEDED` and its phases table has a phase not at `done` | `atk:implement <plan path>` | `atk:plan`, which would plan it again |
| 8 | A design is approved and no breakdown or plan names its ticket | `atk:breakdown` where several people share the work, `atk:plan` where one person does. Name both: who does the work is the Tech Lead's or the PM's call, not something the disk says | `atk:implement`, which has no steps to follow |
| 9 | A requirement is approved, its change touches a schema, a public contract, a shared module, or two services, and no design names its ticket | `atk:design-doc` | `atk:plan`, which would stop and hand over to it |
| 10 | A requirement is approved and no estimate covers its ticket, where the team estimates | `atk:estimate` | `atk:breakdown`, which splits work nobody has sized |
| 11 | A requirement is approved with acceptance criteria and no test plan or cases under `docs/qa/` trace to it | `atk:qa` | `atk:verify`, which asserts against criteria nobody wrote cases for |
| 12 | A reference document's `updated` date is older than the last merged commit touching the subject it describes | `atk:spec --check`, then `atk:spec <subject>` for each subject that drifted | `atk:spec --sync`, which folds the current branch rather than work already merged |
| 13 | Commits exist since the newest version tag and no release record covers them, where the team cuts versions | `atk:release` | `atk:git`, which carries a change but writes no rollback path |
| 14 | No conventions are recorded, resolved per `shared/review-checklist.md` | `atk:convention` | `atk:review`, which falls back to the baseline items alone |
| 15 | An override file is `DRAFT`, or its approver is a bare `TBD` | `atk:tailor --audit` | Running the skill with an override nobody has accepted |
| 16 | None of the above | Ask what the asker is about to do, and route the answer as a question | Guessing a phase |

Rows 10 and 13 hold only where the team works that way, which the estimate records already on disk
or the version tags say. A team that never estimates is not behind on estimating.

## After a row matches

Where the row's `Run` names a skill in the Required group of `shared/project-profile.md`, and
`.atk/profile.md` is missing, or lacks the section that skill needs, or holds it as `TBD`, answer
`atk:init` instead and say which skill it unblocks. `atk:init --audit` is not the answer here: it
changes nothing, and the skill would stop again.

## Waiting on people

Collected in state mode whatever row matched: every gating artifact whose `status` is `DRAFT` or
`IN REVIEW`, and every plan at `IN REVIEW`, with its path, its status, and its `approver`.

At most ten lines, newest `updated` first. A list longer than that is a finding in itself: say how
many more there are rather than printing them.
