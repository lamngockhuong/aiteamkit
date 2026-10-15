# The proposal

Loaded by `atk:orchestrate` in step 2, and again in step 6. What the proposal record holds, how far
its approval reaches, and how a chain moves from one approval to the next.

The proposal is the only account of which branch came from which request and why the jobs ran in
that order. It is a record, in the Record group of `shared/artifact-paths.md`, committed.

## Where it goes

`docs/records/orchestration/<date>-<ticket>-<slug>.md`, named per Naming in
`shared/artifact-paths.md`, with `<ticket>` the one ticket when the run carries exactly one and left
out otherwise, and `<slug>` from the pieces. Check the path first with `git check-ignore -v <file>`,
per Persistence in that file.

It opens with the shared front matter block: `status: DRAFT`, the person running the skill as
`owner`, the Tech Lead from the Team section of `.atk/profile.md` as `approver`, and `ticket` as that
file says. Where the profile is missing, the first line under the title is the Required-soft
sentence of `shared/project-profile.md`, followed by the jobs that will stop for want of one: every
`atk:implement`, `atk:fix` and `atk:verify` job, the Required group of that file, named by row.

## What it holds

1. **The pieces.** One row each: the input as given, masked per rule 9 of `shared/team-roles.md`,
   its piece ID, `r<n>` in input order, which starts every job ID and branch name of the piece,
   where it stands and the row of `shared/state-signals.md` that said so, and the branch and
   worktree it will have.
2. **The ways.** What the probe of `references/ways-to-run.md` found, the way offered, and any lower
   way the person may choose instead, and the result of the commit check per repository and way.
3. **The jobs.** One row each:

   | Column | Holds |
   |--------|-------|
   | Job | `<piece>-<n>`, the job ID, which names its result file |
   | Skill | the `atk` skill and its arguments, nothing a skill's `argument-hint` does not list |
   | Agent | the agent kind and its permission mode, chosen per job |
   | Way | pane, subagent, or session |
   | Answers | the person who answers its questions, from the Team section, or `TBD (ask <person>)` |
   | Waits for | nothing, a job ID, or an artifact `APPROVED` by a named person |
   | Approval | `this record`, or `re-confirm` |

4. **The cost.** The concurrency, the number of jobs, and for a job proposed in a read-only mode the
   approvals it will ask for: a read-only agent asks for every write, so the person answering becomes
   the pace of the job.
5. **Decisions.** Who approved, when, and what they changed, written by that person or on their word.

## Choosing the agent per job

The proposal suggests a default by kind of job, and the person changes any row:

- A job whose skill interviews, `atk:intake`, `atk:design-doc`, `atk:tailor`, gets an interactive
  agent in a pane, or runs in the session, since a subagent hands each question back as a stop.
- A job that writes code gets a mode that writes the worktree and asks before anything else.
- No mode that both writes and asks nothing is proposed, per Agents that write in
  `shared/host-capabilities.md`.

## A chain

Each piece gets a chain: the jobs it still needs, in order, from where it stands. For a raw request
whose change touches a schema:

| Job | Skill | Waits for | Approval |
|-----|-------|-----------|----------|
| r1-1 | `atk:intake` | nothing | this record |
| r1-2 | `atk:design-doc <requirement>` | the requirement `APPROVED` by the BrSE/BA | re-confirm |
| r1-3 | `atk:plan <design>` | the design `APPROVED` by the Tech Lead | re-confirm |
| r1-4 | `atk:implement <plan> --no-review` | r1-3 | re-confirm |

For a ready plan, the chain is the `atk:implement` job alone; the review that follows a code job is
the coordinator's, in step 5, and is not a row.

## How far an approval reaches

Approving a record covers each chain up to and including its first job that produces a gating
artifact, per Which artifacts gate in `shared/state-signals.md`. The jobs after it are shown, marked
`re-confirm`, because the artifact may change them: a design may call the work large, or split it
into a breakdown.

When that artifact is `APPROVED`, the coordinator reads the piece again and writes a **new** record
for the rest of the chain, with a `Follows: <path of the record before>` line under its title. It
never edits the earlier record once committed, per Before writing in `shared/artifact-paths.md`, and
until then corrects it only as that section allows. The rest of the chain runs only once the new
record is `APPROVED`.

## A breakdown's tasks

An approved breakdown turns its tasks into new pieces, each with its own worktree and branch, and
its lanes and serialization points carry over: pieces that would share a file run one after another,
never side by side. A breakdown with an owner still `PROPOSED` is not split: the PM confirms owners
first, and the chain waits under `needs-approval` naming the PM.

## States

A job is `proposed`, `waiting`, `running`, `needs-person`, `done`, or `failed`. A chain is `running`,
`needs-approval`, `escalated`, `done`, or `stopped`.

- `needs-person` carries the question word for word and the name of the person it is for.
- `needs-approval` names the artifact, its state, and its approver.
- `escalated` holds the escalation The ceiling in `shared/review-fix-loop.md` requires, naming the
  Tech Lead.
- `stopped` says why: a rejected artifact, a failed job, or the person's word.
