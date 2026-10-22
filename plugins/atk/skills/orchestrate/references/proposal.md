# The proposal

Loaded by `atk:orchestrate` in step 2, in step 5 for its fix jobs, and again in step 6. What the proposal record holds, how far
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

**At the close.** The `SUPERSEDED` question of How far an approval reaches, below, is asked first.
Then only the settled records are offered for a commit: a `SUPERSEDED` record, or an `APPROVED` one
whose every chain has ended, `done`, `stopped` or `escalated`, so that no job, resume or `Follows:` line
still reads it from the tree. They go through `atk:git --commit` in the coordinator's tree,
staging those paths and nothing else: no review report copied under `<docs root>/derived/reviews/`,
no run state. A record a chain still runs under or waits on is not committed. It stays untracked in
the coordinator's tree, where its approver, `atk:help` and a resume find it, and a later close
commits it once it is settled. `atk:git` never commits onto the default
branch, so the commit may leave the tree on a branch it created; the coordinator then switches the
tree back to the `branch:` of the run state, and the close names the branch that holds the records
and who must say yes to its push. Where git refuses the switch, the close says so with the command to
run, and the tree is left as it is. A stop between the commit and the switch is caught by the
`HEAD` check of Resume in `SKILL.md`.

## What it holds

1. **The pieces.** One row each: the input, by ticket key or path where it has one, and otherwise
   as given, masked by the list a progress log uses, per Progress log in `shared/artifact-paths.md`:
   a secret value, a real person's data, an internal host; its piece ID, `r<n>`, numbered across
   the whole run and never reused by a later record of it; where it stands, and the row of
   `shared/state-signals.md` that said so; its base, branch and worktree, per
   `references/worktrees.md`; and the files its plan names, where it has a plan.
2. **The ways.** What the probe of `references/ways-to-run.md` found, the classifier cases included,
   the way offered, and any lower way the person may choose instead. Where a way is panes, the
   permission mode each pane job starts in and the read-only grant on the kit, or that the CLI has
   none. Where a way is panes or subagents, the line that the person answers the CLI's permission
   prompts directly, in the job's pane or in the harness, and refuses there a write or a command
   outside the worktree, a standing grant such as "don't ask again", and approvals turned off, per
   Agents that write in `shared/host-capabilities.md`. Where a job's agent is the command line of another provider, the
   line that its request text, its worktree, and the profile and overrides copied into it go to that
   provider, and that the PM of the Team section, who owns client communication, says yes to it
   beside the record's approver, or `TBD (ask <the person running the skill>)` where none is named.
3. **The jobs.** One row each:

   | Column | Holds |
   |--------|-------|
   | Job | `<piece ID>-<n>`, the job ID, which names its result file and its pane |
   | Skill | the `atk` skill and its arguments, nothing a skill's `argument-hint` does not list; request text is never an argument, the job reads it masked from its prompt's evidence; a path argument is found on disk where `shared/artifact-paths.md` puts that kind, never copied from a result file's `artifact:` line |
   | Agent | the agent kind and its permission mode, chosen per job |
   | Way | pane, subagent, or session |
   | Answers | who answers its questions, by kind where the skill asks several people: the requester, the artifact's approver, the person running the skill; from the Team section, or `TBD (ask <person>)` |
   | Waits for | nothing, a job ID, or an artifact `APPROVED` by the approver its front matter names |
   | Approval | `this record`, or `re-confirm` |

4. **The cost.** The concurrency, the number of jobs and of the review runs that follow code jobs,
   with the fix jobs those reviews may add, up to two per code job, per Fix jobs below, the timeout
   per job, which a subagent job does not have, per Host subagents in `references/ways-to-run.md`,
   and the approvals the person will be asked for: every write of a job proposed
   in a read-only mode, and on a harness that asks before writing outside the session's directory,
   every write in a worktree beside the repository, unless the person adds that directory for the
   run. The person answering becomes the pace of such a job. Where
   `--concurrency` asked for more than the machine allows, the number the run will use, and why.
   That `atk:review`'s checks and `atk:verify` may run code the jobs wrote with the coordinator's
   rights. Where a commit would fire a hook or `git add` a filter, that they run files a job changed
   with those rights too, so each commit of a job's change is asked about, per step 3 of After a job
   ends in `references/worktrees.md`, and what the check for writes outside a worktree cannot see,
   per the same section. That the person also answers, in each pane, the trust prompt Claude Code
   shows for a new worktree, a yes to which trusts that worktree's path for good and is listed at
   the close as a widening. Where the classifier mode is proposed, its limit as Agents that write
   in `shared/host-capabilities.md` words it, so a test the job edited runs unseen.
5. **Decisions.** Who approved, when, and what they changed, written by that person or on their word.

## When the profile is not ready

Where `.atk/profile.md` is missing, or lacks a section a proposed job needs, or holds it as `TBD`, as
After a row matches in `shared/state-signals.md` puts it, the record opens with the Required-soft
sentence of `shared/project-profile.md` and proposes `atk:init` first. It is not a job: the
coordinator runs it in the session, in its own tree, before step 3 makes any worktree, and commits
what it writes through `atk:git --commit` on the person's yes. The run state records that commit,
and every worktree of the run starts from it, per Before the first worktree in
`references/worktrees.md`. A job that needs the profile is proposed only once that commit exists: as
soon as it does, the coordinator reads the pieces again and writes a follow-up record for those jobs,
with a `Follows:` line, as How far an approval reaches below does after an approval.

## Choosing the agent per job

The proposal suggests a default by kind of job, and the person changes any row:

- A job whose skill interviews, `atk:intake`, `atk:design-doc`, `atk:tailor`, gets an interactive
  agent in a pane, or runs in the session, since a subagent hands each question back as a stop.
- A job that writes code gets a mode that writes the worktree and asks before anything else.
- No mode that both writes and asks nothing is proposed, per Agents that write in
  `shared/host-capabilities.md`, except a classifier mode whose four cases the probe saw blocked on
  this machine.

## A chain

Each piece gets a chain: the jobs it still needs, in order, from where it stands. For a raw request
whose change touches a schema:

| Job | Skill | Waits for | Approval |
|-----|-------|-----------|----------|
| r1-1 | `atk:intake` | nothing | this record |
| r1-2 | `atk:design-doc <requirement>` | the requirement `APPROVED` by its approver | re-confirm |
| r1-3 | `atk:plan <design>` | the design `APPROVED` by its approver | re-confirm |
| r1-4 | `atk:implement <plan> --no-review --out <run directory>/r1-4-record.md` | r1-3 | re-confirm |

For a ready plan, the chain is the `atk:implement` job alone. A defect report is an
`atk:fix <report> --no-review` job, whose fix report is committed with the fix at its default path. The review that follows
a code job is the coordinator's, in step 5, and is not a row.

## Fix jobs

The findings What gets fixed in `shared/review-fix-loop.md` selects become one fix job per review
round in the piece's worktree, so at most two per code job, covered by the approval of the code job
they follow. The job is `atk:implement "address the findings in <review report path> that What gets
fixed selects, each in the form that section names"` with `--no-review` and
`--out <run directory>/<job-id>-record.md`: the description is the coordinator's text naming a
report, not request text. Its own verification is the re-verify step, with what item 3 of
`references/job-prompt.md` adds where the chain's code job was `atk:fix`.

A description goes through `atk:implement`'s plan gate. A medium score sends its `atk:plan --inline`
confirmation to the person as a gate, relayed like any other. A large score stops the job with no
file changed, and the chain is `escalated` to the Tech Lead as The ceiling in
`shared/review-fix-loop.md` escalates: findings that need a design are not a fix job's.

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
`argument-hint` of its skill, against the rule that no mode both writes and asks nothing as the
defaults above state it, and against the machine's cap. A first record the approver rejects ends the run before any job, and the closing
message says so; a later record rejected stops only the chain it was for, and the others go on. A
record that ends unapproved, the run stopped or started fresh, is moved to `SUPERSEDED` only on its
approver's yes, asked once, and is otherwise listed in the close as still waiting on them.

## Pieces that share files

The plans of the pieces are compared before the record is written. Pieces whose plans name a common
file run one after another, never side by side: the later one gets its worktree only once the
earlier one's code is committed and reviewed, from the branch the run state recorded for it, so its
base already holds what it would otherwise conflict with. Its branch is then stacked on the earlier
one: its review is given `<earlier branch>...<its branch>` as its target, so the earlier piece's
commits are not reviewed twice, and the record and the close name each branch's base and that the
earlier one is pushed first. A plan that names no file is not taken as sharing none: unless the
approver orders it otherwise in the record, its piece gets its worktree from the run's base once
the wait on every piece whose plan names files has ended, as the last paragraph of this section
says; it is not stacked on any of them, and the record says its branch may conflict with each of
theirs, which is a person's call at merge. Pieces of that kind run one after another, in record
order. A plan that names no file arriving at a re-confirmation, for a piece whose worktree exists,
makes that piece's remaining jobs wait the same way. A piece without a plan yet
is compared again when it gets one, at its re-confirmation; where its worktree already exists by
then, or where After a job ends in `references/worktrees.md` finds two pieces running side by side
have changed a common path, the later piece's remaining jobs wait for the earlier one, and the record
or the person is told the two branches will conflict until one is merged, which is a person's call.

Every wait of this section ends the same way: when the piece waited on is committed and reviewed, or
its chain is at `needs-approval` with no code job run yet, `parked`, `escalated` or `stopped`. A
piece whose wait ended any way but the first is not started from that piece's branch silently: the
person is asked whether it starts from that branch as it stands, from the run's base, or keeps
waiting. A wait that would close a cycle, two pieces each waiting on the other, goes to the person,
who orders them; the coordinator never breaks one.

**The master test plan.** The `atk:qa --master` job that row 13 of `shared/state-signals.md` names
is proposed once per run, however many pieces reach the row, in a worktree and on a branch of its
own cut from the run's base, never on a piece's branch, so the branch that carries the master plan
carries nothing else. Before proposing it, the run looks for a master plan on the run's base, in
each worktree and on each branch the run states of earlier runs record, read as Reading a piece in
`references/worktrees.md` reads a piece, and on the `Master test plan:` line of an approved
`.atk/overrides/qa.md`. One the base holds, or one kept outside the repository, counts as present:
no job is proposed, and no piece waits on it, apart from a piece whose tree lacks one the base
holds, or lacks the approved `Master test plan:` line the base's `.atk/overrides/qa.md` holds, read
in the piece's tree as on the base, below. One on an earlier run's branch is not proposed again,
since a second would put
the same questions to the PM and the Tech Lead twice and conflict at merge; the record names that
branch and that it waits for a push and merge, and it stands in for the job's branch below.

Every piece at row 13 waits on the master plan's branch as on a piece it shares a file with, so the
test plan its own job writes reads the master plan rather than asking its questions again. The wait
ends when the master plan is `APPROVED` on that branch, not when it is committed, since a feature
plan that says `As in the master plan` cites figures the PM has to have accepted. The master plan
chain's `needs-approval` is therefore the wait itself here, not an end of it: only `parked`,
`escalated` or `stopped` ends it otherwise, and goes to the person as the paragraph on how every
wait of this section ends says.

- **A piece with no worktree yet** gets one from the master plan's branch, stacked on it as above:
  its review is given `<master plan branch>...<its branch>`, and the master plan's branch is pushed
  first.
- **A piece whose worktree already exists**, the usual case, since its requirement is approved
  between runs, or whose tree lacks a master plan, or the override line, the run's base holds, is
  not given a new one, and
  the coordinator never merges into it. Its `atk:qa` job waits; the chain is then `needs-person`, or
  `parked` where that person is not in the session, naming the QA lead from the Team section, or
  `TBD (ask <the person running the skill>)`, with the question of bringing the master plan's branch,
  or the base, into the piece's branch, by a merge or a rebase that person makes. The question says
  whether the piece's worktree holds uncommitted edits, from the read of step 1 of `SKILL.md`. A
  later run reads the piece's tree again and, once the master plan or the line is in it, records
  the piece's `HEAD` after that merge or rebase as its last commit, and where the base was brought
  in and the piece's recorded base was the run's base, the base commit it merged or rebased onto
  as the piece's base, per After a job ends in `references/worktrees.md`; a piece stacked on another
  piece's branch keeps that branch as its base, with its push order, and the merge is noted beside
  it. A merge of anything else is shown to the person. It then proposes its `atk:qa` job; where the
  master plan's branch was brought in, the piece is stacked on it from then on, with the review
  target and push order of the bullet above.

## A breakdown's tasks

An approved breakdown turns its tasks into new pieces, each with its own worktree and branch, based
on the branch that holds the breakdown and its design. Its lanes and serialization points carry over,
as above. A breakdown with an owner still `PROPOSED` is not split: the chain waits under
`needs-approval`, naming the PM from the Team section, or `TBD (ask <person>)`.

## A rejected artifact

No artifact state says rejected, so a rejection is a statement by the artifact's named approver,
relayed and recorded in the run state and in the Decisions of the next proposal record, so it outlives
the run. The chain stops, its worktree is kept and listed, and the closing message offers a revision
job of the skill that wrote the artifact as a row of a new record.

## States

A job is `proposed`, `waiting`, `running`, `needs-person`, `done`, or `failed`. A chain is `running`,
`needs-person`, `parked`, `needs-approval`, `escalated`, `done`, or `stopped`.

- `needs-person`, of a job or of its chain, carries the question and the name of the person it is
  for, or the reason a commit waits. The question is relayed word for word in the session, as the
  way it ran reports it, per `references/ways-to-run.md`, and written to the run state masked per Progress log in
  `shared/artifact-paths.md`, the name left unmasked. Who is in the session is asked once, at
  the first stop that names a person, and recorded in the run state, never assumed.
- `parked` is a chain whose question is for a person not in the session: the question stays in the
  run state and is listed at the close with their name, and the other chains go on. Its
  job's agent is stopped once the question is recorded, so it holds no slot of the concurrency, and
  the close says how the question returns: a job whose skill keeps a progress log resumes from it,
  and one that interviews asks again from the start. An answer the person in the session passes on
  later is relayed as A gate is relayed in `shared/host-capabilities.md` says, with who passed it on
  recorded beside who gave it.
- `needs-approval` names the artifact, its absolute path in the worktree, its state, and the approver
  its front matter names.
- `escalated` holds the escalation The ceiling in `shared/review-fix-loop.md` requires, naming the
  Tech Lead.
- `stopped` says why: a rejected artifact, a failed job, or the person's word.
