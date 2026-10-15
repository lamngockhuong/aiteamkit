# The proposal

Loaded by `atk:orchestrate` in step 2, and again in step 6. What the proposal record holds, how far
its approval reaches, and how a chain moves from one approval to the next.

The proposal is the only account of which branch came from which request and why the jobs ran in
that order. It is a record, in the Record group of `shared/artifact-paths.md`, committed.

## Where it goes

`docs/records/orchestration/<date>-<ticket>-<slug>.md`, named per Naming in
`shared/artifact-paths.md`, with `<ticket>` the one ticket when the run carries exactly one and left
out otherwise. `<slug>` is made from the pieces after they are masked, below, so nothing the mask
takes out reaches a file name or a branch. Check the path first with `git check-ignore -v <file>`,
per Persistence in that file.

It opens with the shared front matter block: `status: DRAFT`, the person running the skill as
`owner`, and as `approver` the person the Team section of `.atk/profile.md` gives orchestration in its
`Approves` column, or the Tech Lead where none does. With no profile, or no Team section, the approver
is `TBD (ask <the person running the skill>)`, and no job starts until a person is named, per rule 1
of `shared/team-roles.md`.

## What it holds

1. **The pieces.** One row each: the input, by ticket key or path where it has one, and otherwise
   as given, masked by the list a progress log uses, per Progress log in `shared/artifact-paths.md`:
   a secret value, a real person's data, an internal host; its piece ID, `r<n>`, numbered across
   the whole run and never reused by a later record of it; where it stands, and the row of
   `shared/state-signals.md` that said so; its base, branch and worktree, per
   `references/worktrees.md`; and the files its plan names, where it has a plan.
2. **The ways.** What the probe of `references/ways-to-run.md` found, the way offered, and any lower
   way the person may choose instead. Where a way is subagents, the line that the person answers
   their permission prompts directly and refuses a standing grant there, per Agents that write in
   `shared/host-capabilities.md`. Where a job's agent is the command line of another provider, the
   line that its request text and its worktree go to that provider.
3. **The jobs.** One row each:

   | Column | Holds |
   |--------|-------|
   | Job | `<piece ID>-<n>`, the job ID, which names its result file and its pane |
   | Skill | the `atk` skill and its arguments, nothing a skill's `argument-hint` does not list |
   | Agent | the agent kind and its permission mode, chosen per job |
   | Way | pane, subagent, or session |
   | Answers | the person who answers its questions, from the Team section, or `TBD (ask <person>)` |
   | Waits for | nothing, a job ID, or an artifact `APPROVED` by the approver its front matter names |
   | Approval | `this record`, or `re-confirm` |

4. **The cost.** The concurrency, the number of jobs and of the review runs that follow code jobs,
   the timeout per job, and for a job proposed in a read-only mode the approvals it will ask for: a
   read-only agent asks for every write, so the person answering becomes the pace of the job. Where
   `--concurrency` asked for more than the machine allows, the number the run will use, and why.
5. **Decisions.** Who approved, when, and what they changed, written by that person or on their word.

## When there is no profile

Where `.atk/profile.md` is missing, a chain whose next job needs one, `atk:implement` or `atk:fix`,
does not get that job. It gets one `atk:init` job instead, run once in the coordinator's tree ahead of
every such chain, as After a row matches in `shared/state-signals.md` says, and the record opens with
the Required-soft sentence of `shared/project-profile.md`.

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
| r1-2 | `atk:design-doc <requirement>` | the requirement `APPROVED` by its approver | re-confirm |
| r1-3 | `atk:plan <design>` | the design `APPROVED` by its approver | re-confirm |
| r1-4 | `atk:implement <plan> --no-review --out <path in the worktree>` | r1-3 | re-confirm |

For a ready plan, the chain is the `atk:implement` job alone. A defect report is an
`atk:fix <report> --no-review` job. The review that follows a code job is the coordinator's, in
step 5, and is not a row.

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

A record the approver edited is checked again before anything runs: every row against the
`argument-hint` of its skill, against the rule that no mode both writes and asks nothing, and against
the machine's cap. A record the approver rejects ends the run before any job, and the closing message
says so. A record that ends unapproved, the run stopped or started fresh, is moved to `SUPERSEDED` by
the run that ends it, so it does not wait on its approver forever.

## Pieces that share files

The plans of the pieces are compared before the record is written. Pieces whose plans name a common
file run one after another, never side by side, and the later one starts from the branch of the
earlier, so its base already holds what it would otherwise conflict with. A piece without a plan yet
is compared again when it gets one, at its re-confirmation.

## A breakdown's tasks

An approved breakdown turns its tasks into new pieces, each with its own worktree and branch, based
on the branch that holds the breakdown and its design. Its lanes and serialization points carry over,
as above. A breakdown with an owner still `PROPOSED` is not split: the chain waits under
`needs-approval`, naming the PM from the Team section, or `TBD (ask <person>)`.

## A rejected artifact

No artifact state says rejected, so a rejection is a statement by the artifact's named approver,
relayed and recorded in the run state. The chain stops, and the closing message offers a revision job
of the skill that wrote the artifact as a row of a new record.

## States

A job is `proposed`, `waiting`, `running`, `needs-person`, `done`, or `failed`. A chain is `running`,
`needs-approval`, `escalated`, `done`, or `stopped`.

- `needs-person` carries the question word for word and the name of the person it is for.
- `needs-approval` names the artifact, its absolute path in the worktree, its state, and the approver
  its front matter names.
- `escalated` holds the escalation The ceiling in `shared/review-fix-loop.md` requires, naming the
  Tech Lead.
- `stopped` says why: a rejected artifact, a failed job, or the person's word.
