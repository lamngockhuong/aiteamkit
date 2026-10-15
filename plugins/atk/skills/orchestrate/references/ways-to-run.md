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
  machine, and the flags for its permission mode read from its own `--help`.
- **Subagents.** The harness's own agent capability is in its live tool list, the `Agent` tool in
  Claude Code. The agent spawned is a general one, never `atk:read-only-reviewer`, which cannot
  write.
- **The session.** Always present.

`--sequential` keeps the way and sets the concurrency to one.

## Agents in panes

Tried with Claude Code as the coordinator only, which the proposal says. For each job:

1. **Start.** Open a pane in the piece's worktree, named `atk-<run-id>-<job-id>`, and start the agent
   CLI there with the approved mode. Record the pane name in the run state before anything else.
2. **Send.** Read the agent's state first. Send the prompt of `references/job-prompt.md`. Then wait
   for the state to leave idle before waiting for anything else: a wait called at once can return
   `idle` before the agent has started.
3. **Wait.** One wait across every running pane, not one per job: each pass reads the state of all
   of them, so a pane already `blocked` never waits behind another's timeout. The timeout stated in
   the proposal is counted per job, and a timeout fails that job.
4. **Blocked.** Read each blocked pane for its question or prompt, and relay all of them in one turn
   per step 4 of `SKILL.md`, each answer sent to its pane verbatim. Then wait again from step 3.
5. **Done.** Read the result file, never the screen: a pane folds and draws its output, and what it
   shows is not what the job wrote.

## Host subagents

Spawn one general agent per job with the prompt of `references/job-prompt.md`, working in the
piece's worktree. A subagent cannot ask the person, so a stop comes back as its result file at
`needs-person`. Relay it, then continue that same agent with the answer verbatim where the harness
can continue one, `SendMessage` in Claude Code; where it cannot, spawn a new one with the answer and
the child skill's progress log, which that skill offers to resume.

## In the session

The coordinator runs each job's skill itself, one at a time, in the piece's worktree, and asks the
person directly where the skill asks. It still writes the result file, so a resume reads the same
state whichever way ran. The proposal says that the jobs ran in the session, and that nothing ran in
parallel.

## What changes with the way

| | Panes | Subagents | Session |
|-|-------|-----------|---------|
| Concurrency | the stated cap | the stated cap | one |
| A question reaches the person | from the pane, through the coordinator or typed in the pane | as a returned stop | directly |
| Written into the run state | pane name | agent ID where the harness gives one | nothing extra |
