# Reviewing a run

Loaded by `atkx:skill-eval` under `--review`. It compares a run of the evaluated skill, earlier in
this conversation, with what that skill's `SKILL.md` prescribes, so that the author can tell a gap
in the skill from a slip by the agent. It reads the conversation and the skill, and edits nothing.

## Find the run

Look back through this conversation for an invocation of the skill: its slash command, a `Skill`
tool call naming it, or its instructions loaded into the turn. Take the most recent one; name it
when there were several.

None found: print one line, `<fullName> was not run earlier in this conversation; nothing to review.`,
and review nothing. A run from another session is out of reach, since only this conversation is
there to read.

## Walk the steps

Number the workflow of the evaluated `SKILL.md` as it numbers itself, `### 1.` headings or a
numbered list under `## Workflow`. For each step record:

| Step | Status | Where in the conversation |
|------|--------|---------------------------|
| 1. Establish intent | executed | the agent's second message, which named the requirement |
| 2. Read the diff | partly done | read three of five changed files; the two tests were not opened |
| 3. Choose the rounds | skipped | no round was chosen; the review went straight to findings |

`Status` is `executed`, `skipped`, `partly done`, or `unclear` when nothing in the conversation can
be pointed at. `Where` points at something a reader can find: a message, a tool call, an output. An
`unclear` row carries the reason instead of a pointer, since a status with nothing to point at is a
guess.

## Classify each deviation

Every step not `executed`, and every point where the run did something the skill does not say, is
one of:

- **skill gap**: the skill does not say what to do here, or says it so loosely that the agent had
  to invent. The fix is in `SKILL.md`.
- **execution error**: the skill says it plainly and the agent did otherwise. The fix is in the
  run, not the skill.
- **ambiguous**: the skill's words support both what was done and what was expected.

Each skill gap and each ambiguous item carries the change to `SKILL.md` that would close it, shown
as a diff:

```diff
-2. Read the diff in context.
+2. Read the diff in context: every changed file, tests included, before writing any finding.
```

Shown, never applied. The evaluated `SKILL.md` is the same after the review as before it.

A review is not a score. It describes one run, so it is reported in its own section and is never
an input to `score.mjs`. A team that wants a recurring correction kept as its own rule, rather than
as a change to the skill, writes it as an override or a record; that is not this skill's work.
