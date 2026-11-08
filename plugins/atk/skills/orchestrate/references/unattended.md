# An unattended run

Loaded by `atk:orchestrate` under `--unattended`: in step 2 for what the proposal adds, in step 4 at
every gate a job meets, in step 6 for the chains that went on past a gating artifact, and at the close
of step 7. Loaded too by any later run that finds an unfinished log whose state records the mode, per
The mode in the run state, before it offers that log or reads its pieces again. Without the flag and
without such a log nothing here is read: no lens agent is spawned, no `stop:` line carries a
recommendation, and no decision queue is written.

The mode builds while nobody is there to answer, and decides nothing a person owns. A gate of the
short list below is not waited for: the job's skill names the option it recommends, or for the wait
on an approval the fixed recommendation below stands in, read-only lens agents pick an option cold
without seeing it, and only when every one of them picks that option does the chain go on, on it,
provisionally. The question stays open in the artifact under its owner's name and becomes one entry
of a decision queue the person answers when they come back. Every other gate parks its chain exactly
as States in `references/proposal.md` says. Where this file says nothing, the attended rules of
`SKILL.md` and its references hold unchanged.

## The flag and the proposal

`/atk:orchestrate <inputs> --unattended`. It combines with `--concurrency` and `--sequential`. It is
refused with `--resume`, which takes no inputs: a resumed run keeps the mode its run state records,
per The mode in the run state below.

The proposal record is written and approved exactly as `references/proposal.md` says, and adds what
its section An unattended run lists. The approval of that record is the person handing the task
over. It is never provisional, and the run starts nothing before it.

A piece is carried unattended only where its chain rests on a requirement that is `APPROVED`: the
lens agents judge scope against it. A piece that starts at `atk:intake`, one whose requirement is not
`APPROVED`, and one with no requirement at all, a defect report or a plan written without one among
them, is refused for the mode and listed as waiting on that requirement's approver, or on the person
who gave the piece where no requirement exists.

### Which ways may run a job

- **Panes.** Offered. A pane job in a mode that asks before writing in its worktree waits on its
  first write until its timeout fails it, since nobody is there to answer the prompt: under the
  mode, a pane at a permission prompt is not paused, per Wait in `references/ways-to-run.md`. The
  proposal says so for each such job.
- **Host subagents.** Offered only where the approver confirms in the record, by name, the
  permission mode the subagent runs in, and that in it the subagent is asked for nothing the job's
  skill does inside the worktree, its commands included, apart from four things it is still asked
  before, which win over that: a write outside the worktree, an outbound network command, a read of
  a file rule 9 of `shared/team-roles.md` keeps unread, and a push or anything else past the consent
  line; or that it is the classifier mode whose probe on that machine saw those blocked, per No mode
  that both writes and asks nothing in `shared/host-capabilities.md`. A subagent job has no timeout,
  per Host subagents in `references/ways-to-run.md`, so one stopped at a prompt nobody sees would
  wait for good. So a job whose skill runs the profile's commands, which may reach the network or a
  path outside the worktree, a dependency install or a test against a real service among them, is
  offered as a pane job, where the timeout ends such a wait, and the proposal says why. Without the
  confirmation the job is offered as a pane job, or left out. Where the harness cannot continue a
  subagent and its job would go to the session, the job's chain parks instead.
- **The session.** Not offered. The coordinator would run the job's skill itself and so supply the
  skill's recommendation from its own reasoning, which the lens agents exist to check. A machine with
  neither panes nor subagents, or with subagents the approver does not confirm and no panes, cannot
  run the mode, and the proposal says so and offers the attended run instead.

The classifier mode of `shared/host-capabilities.md` stays available on the same terms as an
attended run. A commit the coordinator would ask about, because the repository runs a hook or a
filter on `git add`, per After a job ends in `references/worktrees.md`, is not passed: it parks its
chain, and the proposal says so beforehand.

## Eligibility

The coordinator looks a gate up in this table. One it cannot place is not eligible.

| Eligible | Gate | Recorded where the job's skill records it |
|----------|------|-------------------------------------------|
| (a) | An interview question or an option choice inside a draft, `atk:design-doc` or `atk:plan`, whose options change no user story, acceptance criterion or out-of-scope item of the requirement | The artifact's `## Open questions`, as open |
| (b) | The medium-level `atk:plan --inline` confirmation of `atk:implement`'s plan gate, in a fix job | The implementation record, as an open question |
| (c) | The wait for a gating artifact's approval, the chain building on it while it stays `DRAFT` or `IN REVIEW` | The artifact stays at its state; the queue entry carries it |

Never eligible, and the chain parks as in an attended run: moving any approval state; scope,
priority, pricing, deadline, compliance; a requirement not `APPROVED`; residual risk in
`atk:security`; the review-loop escalation and a disputed `BLOCKING` finding; the check of
`atk:fix` that a behaviour was intended; a large plan-gate score; a commit the coordinator asks
about; every action past the consent line of `shared/finalize-steps.md`. A permission prompt is never
eligible either, and is met as Which ways may run a job says: a pane's timeout ends it.

For (a), whether the options change a story, a criterion or an out-of-scope item is read by the lens
agents, never by the coordinator: each is asked it first, and any `yes` makes the gate ineligible.

For (c), the job's skill recommends nothing, so the recommendation compared against is the one the
approved proposal carries: "build on the draft as written". The lens agents are asked whether they
would build on it as written. The gate is met when a chain reaches `needs-approval` with its next job
marked `provisional`, rather than at a `stop:` line.

## A gate under `--unattended`

When a job stops, its gate is read from its result file on every way, per Blocked and Host subagents
in `references/ways-to-run.md`: the `stop:` lines written since its last continuation, those of kind
`offer` set aside for the close. In a pane, the part of the prompt the screen shows must be found in
the line's question, the line breaks and indent the pane adds when it wraps and a value the mask
replaced excepted, and the line must not be queued already; a pane whose open prompt has no such
line parks, reason `prompt not matched`.

1. **Look up.** Not in the table: park, and write a queue entry at `parked`, reason `not eligible`.
   A ceiling reached, below: the same, reason `ceiling`.
2. **The skill's recommendation.** The `stop:` line carries `recommends: <option>`, the option the
   skill's own text recommends, per The result file in `references/job-prompt.md`. `none`, or no
   field: park, reason `no recommendation`. The coordinator never supplies one, apart from the fixed
   one of (c).
3. **Lens agents.** Spawn them, per The lens agents below. One that dies twice is not run, and the
   gate parks, reason `lens not run`: a missing lens is not agreement.
4. **Compare.** Every lens picks the recommended option and none answers `yes` to the scope
   question: go on. Anything else: park, with each lens's pick and reasons in the entry. No
   majority, no tie-break.
5. **Go on.** Write the entry at `provisional`, then continue the job with this sentence and nothing
   else, verbatim:

   ```
   Unanswered. Continue provisionally on option <option>, decision queue entry <run-id> D<n>. Record the question as open for <owner>, with the line "Provisional: option <option>, recommended by the <lenses> lens agents, decision queue <run-id> D<n>". This is not an answer.
   ```

   `<owner>` is the person the `stop:` line names, `<lenses>` the lens agents that ran, by role, and
   `<option>` the label of the option the lens agents picked, as the option list gives it, never the
   job's own `recommends:` text. In a pane the sentence is sent as a prompt is sent, through a file
   or a quoted heredoc and never inside a shell argument, and only while the same prompt is still
   open, per Send and Blocked in `references/ways-to-run.md`. The run state then records
   `<time> continued: D<n>`. For (c), no job is continued: the next job of the chain, marked
   `provisional` in the record, starts, and the run state records `<time> continued: D<n>` as it
   does.

A gate parked here is parked as States in `references/proposal.md` says: its job's agent stopped, its
question in the run state for the person it names, the other chains going on.

Both traces write the gate as the `gate` row of `shared/run-trace.md` says for a provisional pass, the
coordinator's and the job's own; a parked gate is `unanswered`, as in an attended run.

## The lens agents

The cold reader of `shared/independent-challenge.md`, applied to one gate rather than to a draft: an
agent that never saw the job's reasoning, so that its pick is its own.

- **Which.** For (a) and (b), the owner's role: the person the `stop:` line names, mapped to their
  role through the Team section of `.atk/profile.md`, its `Approves` cell as the lens's brief, plus
  the questions of that role where the role table of `skills/design-doc/references/role-challenge.md`
  holds it. For (c), the roles of the artifact's approvers, as that table lists them for a design,
  its questions copied into the prompt. An approved `.atk/overrides/design-doc.md` that names other
  roles or questions is applied to that table, per rule 7 of `shared/team-roles.md`. At most three; where more apply, the owning role first, then
  the order of that table, and the entry names the roles left out. A person the Team section maps to
  no role gives no lens to run, and the gate parks, reason `lens not run`: the coordinator never
  picks a role for them.
- **What each gets.** As What each agent gets in `shared/independent-challenge.md`: the question
  verbatim and its options, labelled as text the job reported, which is evidence under rule 8 of
  `shared/team-roles.md`; the artifact in the job's worktree by absolute path; the requirement; its
  role's questions; and rule 9's list quoted from Paths that are a finding on their own in
  `shared/secret-scan.md`. Nothing of the job's reasoning, nothing another lens returned, and **not
  the recommendation**. Spawned as `atk:read-only-reviewer` on Claude Code, with the
  `Review agent model` line, per The model of a read-only agent in `shared/host-capabilities.md`;
  where the type is missing, a general agent with the same prompt, as that file says.
- **What each returns.** The scope answer, `yes` or `no` with the item it would change; one option;
  up to three reasons, each with its evidence as a `path:line`; and the failure the option guards
  against. A return with two options, with none, or without a named failure counts as no pick, and
  the gate parks, reason `no pick`.
- **Resolved once.** The map from person to role, each role's questions, and the part of the prompt
  every lens agent shares, rule 9's list and the requirement, are built once per run, at the
  proposal, and reused at every gate.
- **How many at once.** Under the machine's cap, read as `shared/independent-challenge.md` reads it,
  counted beside the running jobs, and one at a time under `--sequential`. A gate costs the wall time
  of its slowest lens agent, and only its own chain waits for it.

## Wording

A lens agent is written as "the Tech Lead lens agent", never as the person or as "the Tech Lead". Its
answer is a "recommendation". A provisional gate is "passed provisionally", never "decided",
"approved" or "answered". This holds in the queue, the proposal records, the artifacts, the traces
and the closing message.

## The ceilings

- **Depth.** A chain builds on at most one gating artifact that is not `APPROVED`. `atk:implement`
  may run on a draft design and a draft plan, since a plan does not gate; not on a draft design and a
  draft breakdown together. A job that would cross a second one is `re-confirm`, as in an attended
  run.
- **Count.** At most 8 gates passed provisionally per run, counted over the whole run, an entry
  accepted or rejected since included; a slot is taken at Look up, so two gates met at once cannot
  both take the eighth. The ninth eligible gate parks, reason `ceiling`. Parked entries do not count.
- **A job marked `provisional`** starts only while the current mode is `unattended` and the (c)
  entry it builds on is `provisional` or accepted. After that entry parks, or after a switch to
  attended, it waits for a re-confirmation, as a job marked `re-confirm` does.
- The job timeout of `atk:orchestrate` is unchanged.

## The decision queue

`<docs root>/derived/orchestrate/<run-id>/decisions.md`, beside `progress.md`, held out of git by the
run state's ignore file. One entry per gate met, provisional or parked, so the person reads every
stop of the run in one place. Every value goes through the mask of rule 9 of `shared/team-roles.md`,
the names left unmasked.

```
## D3 | provisional | r1-2 design-doc step 3 | for: <name> (Tech Lead)
question: <verbatim, masked per rule 9>
options: A <one line> | B <one line>
skill recommends: B
lens agents: Tech Lead lens agent: B, <reasons, path:line>, guards <failure> | QA lens agent: B, ...
continued on: B | base: <commit before the gate> | built on it: <commits>, <files>
depends on: D1 | rejected costs: r1-3, r1-4 redone from <base> on the chosen option
answer: unanswered
```

A parked entry writes `continued on: none` and its reason on a `parked:` line under `options:`.

- **State.** `provisional`, `parked`, `accepted`, `rejected`, `answered`, `closed`, `void`. `void` is
  an entry built on a rejected one: never asked, its work going with its parent's.
- **`depends on`.** Every earlier `provisional` entry of the same chain, since what the chain did
  after a gate was built on it. A parked entry depends on nothing and nothing depends on it.
- **`built on it`** grows as later jobs of the chain are committed, so it is complete at the close.
- **Order.** Entries are numbered as met, `D1` upward, never reused within the run. An entry is asked
  only once every entry it depends on is answered, so no accepted entry is later made `void`, and
  within one artifact its (a) entries come before its (c) entry, so an answer reaches the artifact
  while it can still take it.

## The mode in the run state

- **The mode.** Under the progress log's first line, the run writes `mode: unattended`. It records
  that nobody is in the session: the question of who is, in States of `references/proposal.md`, is
  not asked while it is the current mode. A run state without that line is an attended run, a state
  written before this mode existed included.
- **What the run records.** Once the record is approved, the snapshot of remote-tracking refs The
  close compares against, each worktree branch's upstream added as its worktree is made; and for each
  job, the `status` of the artifact it starts from, beside the job's entry.
- **Reading a piece again.** A later run that reads a piece of this run again, on Resume above all,
  keeps the jobs the approved record marks `provisional` while the current mode is `unattended` and
  the ceilings hold, rather than holding them at the gating artifact as step 1 of `SKILL.md` would.
- **Switches.** The person comes back mid-run and answers a gate in the session, a `--resume` that
  asks the queue included: the gate is answered as in an attended run, and from then on every later
  gate is asked of its owner in the session. When that person says they are no longer present, the
  gates after that go back to the procedure above. Each switch is an entry,
  `<time> mode: attended by <name>` or `<time> mode: unattended by <name>`, and the newest `mode`
  entry is the current mode, which a later run reads.
- **The log kept open.** Each provisional or parked entry adds one `<time> waiting:` entry naming the
  entry and its person, as a parked chain does. While any entry is `provisional` or `parked` and
  unanswered, the close writes one `<time> waiting:` entry per such entry and never ends the log on
  the proposal record's path, so `atk:help` keeps sending the person back to `--resume`, per Progress
  log in `shared/artifact-paths.md`.

## Answering the queue

`/atk:orchestrate --resume` on a run with unanswered entries asks them first, before it resumes
anything: every entry whose dependencies are answered, in one turn, each verbatim with its options,
the skill's recommendation and every lens recommendation, in the order above. The person may answer
some and leave the rest. Who is answering is established as rule 2 of `shared/team-roles.md`
establishes an approver; an entry for someone else is relayed to them as A gate is relayed in
`shared/host-capabilities.md` says, and never answered by the person present.

- **Accept.** The entry gets `answer: accepted by <name>, <YYYY-MM-DD HH:MM>`, and the coordinator's
  trace a `gate` line naming that person, as `shared/run-trace.md` says of answers that arrive in a
  later session.
  - For (a), where the artifact is not `APPROVED`, the answer is recorded where its skill records
    answers, `atk:design-doc <path> --answer` or `atk:plan <path> --answer`, as a job or in the
    session, in the job's worktree, made again from its branch where it was removed, with the
    `Provisional:` line kept above the answer, per Where it goes in
    `skills/design-doc/references/answer-mode.md` and in `skills/plan/references/answer-mode.md`;
    the coordinator commits it through `atk:git --commit` there, as step 4 of `SKILL.md` commits an
    approver's edit. Where the artifact is `APPROVED`, `--answer` is not run, since it would refuse
    a design and send a plan back to `IN REVIEW`: the answer is recorded in `decisions.md` and in
    the Decision queue section of the next proposal record, and the session says that the
    `Provisional:` line stays in the approved artifact as history.
  - For (b), the next proposal record carries it.
  - For (c), the entry is accepted only once the artifact is `APPROVED` by its approver, and only
    where the approved file's body, below its front matter, equals the one the chain built on. An
    approval with changes to the body is put to the person as a choice, accept or reject.
- **Reject.** The entry gets `answer: rejected by <name>, option <their option>, <YYYY-MM-DD HH:MM>`.
  Every entry depending on it becomes `void`. The branch keeps its commits as evidence and is never
  deleted by the run; the worktree is removed per Removing a worktree in `references/worktrees.md`
  once its files are copied out; and the coordinator writes a new proposal record with a `Follows:`
  line, for the chain from the rejected gate onward, on the person's option, on a new branch from the
  entry's `base` commit, or for (c) from the commit that holds the approval. The redone job is given
  the person's option, and the answer of every accepted entry of the same job, word for word as
  answers in its prompt, so neither is asked or passed provisionally again. That chain runs once the
  record is `APPROVED`, as step 6 of `SKILL.md` runs a re-confirmation. Nothing built on the
  rejected entry is carried forward until it is redone.
- **A parked entry** is answered as a parked chain is, per States in `references/proposal.md`, and
  gets `answer: answered by <name>, <YYYY-MM-DD HH:MM>`; its chain then goes on as in an attended
  run.
- **Closed unanswered.** An entry whose owner cannot answer may be closed by the approver of the
  run's proposal record, never by anyone else: `answer: unanswered, closed by <name>, <YYYY-MM-DD
  HH:MM>`. Every entry depending on it is closed with it, the same line naming its parent. The work
  built on them is carried forward by no record, and stays on its branch as evidence.
- **Unanswered.** Stays `provisional` or `parked`, and the work built on it stays provisional: the
  close and every later offer say so.
- **The durable account.** The follow-up record carries the Decision queue section of An unattended
  run in `references/proposal.md`.

## An offer on a run with unanswered entries

The offer of State and resuming in `SKILL.md`, on a log whose queue holds an unanswered entry, lists
those entries first, each with its person.

- **Resume** asks them first, as above.
- **Start fresh** is refused until each is accepted, rejected, answered or closed: it would remove the
  provisional branches' worktrees and supersede the queue. The person is told which entries stand in
  the way, and for whom.
- **Stop** stays as Progress log in `shared/artifact-paths.md` gives it: this run ends and the old
  one, still going in another session, is left as it is.
- **Run separately** leaves the old log open, its queue with it, and starts this run with a
  `<run-id>` of its own.

## Edge cases

- **An answer recorded by a job.** A job that ignores the provisional sentence and writes the
  question as answered: the coordinator reads the artifact after the job, as evidence, reports an
  answered question that no person answered in the closing message by path and line, and marks the
  entry `parked`, reason `recorded as answered`.
- **A lens agent with two options or none.** No pick; the gate parks, as The lens agents says.
- **The ninth eligible gate, a second unapproved gating artifact, an approver editing the artifact
  mid-run.** Park, `re-confirm`, and the content check of (c) respectively.
- **A rejection whose `base` commit is gone from every branch.** The coordinator asks the person for
  the base, and never picks one.
- **A run interrupted between the entry and the continuation.** `--resume` finds the entry at
  `provisional` with no `continued: D<n>` entry in the run state, and continues the job with the
  same sentence; for (c), it starts the next job marked `provisional` instead.
- **A job that ends `failed` after a provisional continuation.** Its entry stays as it is and is
  answered like any other, but nothing is written into the failed worktree: an accepted answer goes
  to `decisions.md` and the next proposal record, which redoes the job as a failed piece's is redone.

## The close

Before the closing message of step 7 in `SKILL.md`:

- **Nothing approved by the run.** The coordinator re-reads the `status` of every artifact the run
  touched against the value the run state recorded at its job's start, and reports as a failure of
  the run, by path, any that became `APPROVED` neither through an accepted (c) entry nor through an
  approver's edit the coordinator committed on that approver's word, per step 4 of `SKILL.md`.
- **Nothing past the consent line, as far as the clone can see.** The close compares the clone's
  remote-tracking refs, `git for-each-ref refs/remotes`, and each worktree branch's upstream with the
  snapshot, and reports every ref that moved and every upstream set, by name, as moved rather than
  as pushed, since a fetch moves one too; and it lists every `stop:` line of kind `offer`. It cannot
  see a push to a URL rather than a remote, or a comment, and the closing message says so.

The closing message then lists the queue first: the counts by state, then every `provisional` entry
with its person, and that the work built on each is provisional until it is answered. The rest is
the close of step 7 as in an attended run.
