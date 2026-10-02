# Reviewing a run

Loaded by `atkx:skill-eval` under `--review`. It compares a run of the evaluated skill, earlier in
this conversation, with what that skill's `SKILL.md` prescribes, so that the author can tell a gap
in the skill from a slip by the agent. It reads the conversation and the skill, and edits nothing.

## Find the run

Look back through this conversation for an invocation of the skill: its slash command, a `Skill`
tool call naming it, or its instructions loaded into the turn. When the skill ran more than once,
list the runs and ask which one, rather than taking the most recent; the earlier run may be the
one that went wrong. When no `<skill-path>` was given, SKILL.md's Invocation section says what to
do first.

None found: print one line, `<fullName> was not run earlier in this conversation; nothing to review.`,
and review nothing. A run from another session is out of reach, since only this conversation is
there to read.

## Walk the steps

Number the workflow of the evaluated `SKILL.md` as it numbers itself, `### 1.` headings or a
numbered list under `## Workflow`. For each step record:

| Step | Status | Method | Where in the conversation |
|------|--------|--------|---------------------------|
| 1. Establish intent | executed | n/a | the agent's second message, which named the requirement |
| 2. Read the diff in context | partly done | n/a | read three of five changed files; the two tests were not opened |
| 3. Choose the rounds | executed | improvised: ran the rounds itself instead of in one reviewer agent | the third tool call onward; no agent was started |

Extra work: `gh pr diff` run a second time after its first output was not read, 1 tool call.

`Status` is `executed`, `skipped`, `partly done`, or `unclear` when nothing in the conversation can
be pointed at. `Where` points at something a reader can find: a message, a tool call, an output. An
`unclear` row carries the reason instead of a pointer, since a status with nothing to point at is a
guess.

`Method` says how the step was done against what the step itself names: `as prescribed` when the
run used the command, script, tool or agent the step names; `improvised`, with what was used
instead, when it did something else; `n/a` when the step names no means or did not run. Never
supply a means the step does not name: a step that says "read the diff" and names no command is
`n/a` however the reading was done. A step that ran before a step the skill puts ahead of it says
so in `Where`: `ran before step 2`.

Below the table, list the extra work: each action that served no step of the skill, with the tool
calls it took. A command run twice because its first output was not read, or a file opened that no
step needed, is extra work; a step done by other means is not, since its row already says so.

## Classify each deviation

Each shortfall of a step, each step `improvised` or out of order, and each item of extra work is a
deviation of its own, so one step can give more than one. Each deviation is one of:

- **skill gap**: the skill does not say what to do here, or says it so loosely that the agent had
  to invent. The fix is in `SKILL.md`.
- **execution error**: the skill says it plainly and the agent did otherwise. The fix is in the
  run, not the skill.
- **ambiguous**: the skill's words support both what was done and what was expected.

Each skill gap and each ambiguous item carries the change to `SKILL.md` that would close it, shown
as a diff after the ranked table and numbered by its row. Shown, never applied. The evaluated
`SKILL.md` is the same after the review as before it.

## Rank each deviation

Each deviation also carries a severity, so the author knows which to fix first. Severity is decided
by what the deviation cost, never by its class: an execution error can be low and a skill gap high.

- **high**: it changed what the run produced, skipped a gate, an approval or a consent the skill
  requires, or cost more than two tool calls that served nothing.
- **medium**: the result was usable but weaker, or the agent had to guess at a decision that
  mattered.
- **low**: a small inefficiency or a cosmetic difference that a reader of the output would not
  notice.

The deviations are reported as one table, highest severity first, with the diffs below it:

| # | Step | Deviation | Severity | Class | Fix |
|---|------|-----------|----------|-------|-----|
| 1 | 3. Choose the rounds | rounds run by the calling agent, which had read the whole conversation, not by a reviewer agent given only the target | high | execution error | none in the skill; the run should have started the agent |
| 2 | 2. Read the diff in context | the two changed test files were not opened | medium | ambiguous | diff 2 |
| 3 | 2. Read the diff in context | a file the diff deletes was skipped; the step says nothing about deleted files | medium | skill gap | diff 3 |
| 4 | extra work | `gh pr diff` run twice | low | execution error | none in the skill |

Diff 2:

```diff
-Open the surrounding files, not only the changed lines.
+Open every changed file, tests included, and the files around them, not only the changed lines.
```

Diff 3:

```diff
+A file the diff deletes is read at the base revision, to find what still refers to it.
```

Severity orders the findings of this one run. It is not a score and is never summed into one.

A review is not a score. It describes one run, so it is reported in its own section and is never
an input to `score.mjs`. A team that wants a recurring correction kept as its own rule, rather than
as a change to the skill, writes it as an override or a record; that is not this skill's work.
