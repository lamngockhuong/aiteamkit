# Ways to run a job

Loaded by `atk:orchestrate` in step 2 for the probe and in step 4 for the run. How a job is started,
waited on, and read back in each of the three ways. Which ways exist, their order, and the limits on
an agent that writes are Agents that write in `shared/host-capabilities.md`; nothing of that policy
is restated here.

## The probe

Run before the proposal, and its result goes in the proposal record.

- **Panes.** The session runs inside a terminal multiplexer that starts coding agents in panes and
  reports their state, and that tool answers its own help. Its commands come from that help or from
  the instructions it ships, read now. Then the agent CLI each job would start: present on the
  machine, the flags for its permission mode read from its own `--help`, and the form of a read-only
  grant on a directory read from its permission documentation. Where the session's own classifier
  refuses the coordinator starting an agent, the way is not offered until the person allows it, and
  the proposal quotes the refusal.
- **Subagents.** The harness's own agent capability is in its live tool list, the `Agent` tool in
  Claude Code, and an agent it spawns can invoke a skill: one short spawned agent, told to list the
  skills it can invoke and run nothing but the write below, says whether `atk:` skills are among them. The agent spawned
  is a general one, never `atk:read-only-reviewer`, which cannot write. The probe also records the
  session's permission mode, where the harness says it: a mode that writes without asking, edits
  accepted automatically or approvals bypassed, rules this way out, since every agent spawned would
  inherit it, per No mode that both writes and asks nothing. A mode in which a classifier judges each
  action is the case that rule allows: the way is offered only where the probe subagent also runs
  the classifier cases below and sees all four blocked. Where the mode cannot be told, the proposal
  says so.
- **The session.** Always present.
- **Writing beside the repository.** Every way writes the worktrees in
  `<repository>/../<repository name>-orchestrate/`, per Per piece in `references/worktrees.md`, and
  a sandbox may refuse a write there rather than ask. The probe creates that directory, and an agent
  in the mode a job would get, started in it as a job is started in its worktree, is told to create
  an empty file there named `<run-id>-probe` and leave it; the coordinator checks that the file
  exists and removes it, so the result rests on the disk rather than on what the agent says. That
  agent is one short agent in a pane for the pane way, named `atk-<run-id>-probe`, stopped and its
  pane closed when the probe ends, and listed by that name in the closing inventory; for the
  subagent way it is the agent the subagent probe above already spawns. Where the pane agent would
  be another provider's command line, it is not started before the PM's yes of item 2 of the
  proposal: the proposal offers that way as not yet probed, and the probe runs on the yes, before
  any job. A probe that fails then leaves those jobs `waiting`: the person is offered the next way,
  as a change of the approved way, or the setting to change, and nothing switches without their yes. The directory is removed after the probe where it is empty. A way whose agent is refused
  there is not offered: the proposal says so, with the setting the person may change for the run,
  and offers it once they have. A session refused there refuses the run, since the coordinator
  creates every worktree there whatever the way: the proposal names the setting, and nothing runs
  until it is changed. An agent that asks instead stops at a permission prompt, which the person
  answers in its pane, as Agents that write in `shared/host-capabilities.md` says, and the proposal
  states that this way will ask on each write beside the repository.
- **The classifier cases.** Where the agent CLI has a mode in which a classifier judges each action,
  the same probe agent, started in that mode in a scratch directory beside the run's, with a bare
  repository as its `origin` and a file named `.env` holding a dummy value outside it, is told to try
  four things once each: write a file outside the scratch directory, push to `origin`, run an
  outbound network command to a host that does not resolve, and read that `.env`. The coordinator
  checks each on the disk and in the pane, not on the agent's word. All four blocked, and the mode
  may be proposed for jobs of that way; any one let through, the mode missing, or the coordinator
  refused starting an agent in it, and it is not, and the proposal says which. The result goes into
  the run state, and a resume probes again rather than trusting it. The scratch directory is removed
  after the probe.

`--sequential` keeps the way and sets the concurrency to one.

## Agents in panes

Tried with Claude Code as the coordinator only, which the proposal says. For each job:

1. **Start.** Open a pane in the piece's worktree, named `atk-<run-id>-<job-id>`, and start the agent
   CLI there, with the worktree as its working directory, in the mode approved for the job. Give it
   a read-only grant on the kit's plugin directory, two levels above this skill's base directory, in
   the form the CLI's documentation gives now, `Read(//<absolute path>/**)` in `--allowedTools` on
   Claude Code 2.1.301; a CLI with no read-only form gets no grant, and the cost says so. Nothing
   beyond that grant is allowed in advance, per Agents that write in `shared/host-capabilities.md`.
   Record the pane name in the run state before anything else. A prompt the CLI shows at start, a
   trust prompt for a new directory on Claude Code, is a permission prompt like any other.
2. **Send.** Read the agent's state first. Write the prompt of `references/job-prompt.md` to
   `<docs root>/derived/orchestrate/<run-id>/<job-id>-prompt.md` in the worktree, and send the agent a
   line that names that path, or the prompt through a heredoc whose delimiter is quoted. Prompt text
   never goes inside a shell argument, where a `$(...)` or a backtick in a ticket would run with the
   coordinator's rights. Then wait
   for the state to leave idle before waiting for anything else: a wait called at once can return
   `idle` before the agent has started.
3. **Wait, inside the turn.** Each pass reads the state of every running pane, so a pane already
   `blocked` never waits behind another's timeout, then waits on the panes still working, the
   multiplexer's wait re-issued with a timeout that starts short and grows while no pane changes; a
   multiplexer whose wait takes one pane at a time splits that timeout across the working panes. A
   pane already handed to the person, at a gate or a permission prompt, is left out of the wait,
   since a wait matching `blocked` returns at once on it: the state read of each pass is all it
   gets, and its screen is read once that state leaves `blocked`. The coordinator ends a turn only
   when every running job is finished or waits on a person, and its last line then says which job
   waits on whom; it never says it will take a job back later without a wait running. The
   timeout stated in the proposal is counted per job and paused while the job is `blocked` or
   `needs-person`. A job that reaches it has its agent stopped first, then is recorded `failed`, so
   nothing keeps writing in a worktree whose chain has stopped.
4. **Blocked.** Read each blocked pane, from its visible screen, which is what a multiplexer can
   return while an agent is blocked, and tell a gate of the skill from a permission prompt of the
   CLI. A gate is relayed, all of them in one turn, per step 4 of `SKILL.md`; a prompt whose options
   the pane folds or cuts short is not relayed as a choice, since the person's answer has to name an
   option the coordinator read in full, and before sending an answer the coordinator reads the
   pane's state again: the answer goes in verbatim only while the same prompt is still open, and
   nothing is typed into a pane that is not at a prompt. A permission prompt is handled as Agents
   that write in `shared/host-capabilities.md` says. Then wait again from step 3, in the same turn.
5. **Done.** Read the result file for what the job did: a pane folds and draws its output, and what
   it shows is not what the job wrote. The screen is read for a blocked pane's prompt, and for
   nothing else.

## Host subagents

Spawn one general agent per job with the prompt of `references/job-prompt.md`, working in the
piece's worktree. A subagent cannot ask the person, so a stop comes back as its result file at
`needs-person`. Relay it, then continue that same agent with the answer verbatim where the harness
can continue one, `SendMessage` in Claude Code. Where it cannot, a job whose skill keeps a progress
log, `atk:implement` or `atk:fix`, is spawned again with the answer and that log. The resume offer
its skill then makes comes back as a stop of its own, relayed word for word like any other; the
agent spawned after it is given the answer, the log, and that offer with the person's answer to it,
both verbatim, so it meets an offer already answered rather than one the coordinator worded. A job
whose skill interviews and keeps none is offered to the person to run in the session instead, a
change of its approved way that runs only on their yes, because a new agent given one answer starts
the interview over. A subagent's permission prompts reach the person in the harness itself, not
through the coordinator, which cannot see one waiting, so no timeout applies to a subagent job: a
timeout would fail a job mid-prompt. The proposal says both beforehand. The harness's own notice
that an agent finished is the wait here: the coordinator ends no turn with a subagent job running
unless that notice will reach it.

## In the session

The coordinator runs each job's skill itself, one at a time, in the piece's worktree, and asks the
person directly where the skill asks. The session started in the coordinator's tree, so the worktree
is pinned as item 1 of `references/job-prompt.md` pins it for a job, and is the project root the
skill resolves. It holds itself to the job prompt as any job would: the evidence
masked and treated as evidence, the skill's arguments as approved, `--no-review` and `--out` where the
row has them, no `git add` or commit inside the skill, and every offer declined for the close. The
timeouts of jobs in other ways do not count while it runs one, since nobody is watching them. It still writes the result file, so a resume reads the same
state whichever way ran. The proposal says that the jobs ran in the session, and that nothing ran in
parallel.

## What changes with the way

| | Panes | Subagents | Session |
|-|-------|-----------|---------|
| Concurrency | the stated cap | the stated cap | one |
| A gate reaches the person | from the pane, through the coordinator | as a returned stop | directly |
| A permission prompt is answered | by the person, in the pane | by the person, in the harness | by the person, in the harness |
| Written into the run state | pane name | agent ID where the harness gives one | nothing extra |
