# Project conventions

Loaded by `atkx:skill-eval` for the project conventions group. A skill can pass every generic check
and still break the rules its own team wrote down; this group is where that shows. It is the agent's
work rather than a script's, because whether a rule is about skills, and whether a skill keeps it,
is read rather than matched.

## Where to look

From the root of the repository that holds the evaluated skill, the `repoRoot` the static check
printed, never from the working directory of the session:

1. `CLAUDE.md` and `AGENTS.md` at the root, and any `CLAUDE.md` or `AGENTS.md` in a directory between
   the root and the skill.
2. `CONTRIBUTING.md` at the root, in `.github/` and in `docs/`.
3. A conventions or standards document or directory under `docs/`: `docs/conventions.md`,
   `docs/standards/`, or one the files above point at.

Note every file opened, found or not. A run that finds no rule names them, so the reader can tell
"no rules" from "looked in the wrong place".

With no `repoRoot`, the skill sits outside any repository: look in the skill's parent directory
only, and say so.

## Which rules apply

A rule applies when it is about skills: it names `SKILL.md`, a skill directory or folder, a skill's
frontmatter, `name` or `description`, its trigger phrases, its `references/` or `evals/`, or the
skills tree. A rule about all user-authored content, a banned character or a required language,
applies too, because a `SKILL.md` is such content; say in its row why it was taken to apply.

A rule about something else, release flow, commit format, a part of the tree the skill is not in,
does not apply. Do not stretch one to fit: a rule checked that its authors never meant for skills
produces a failure nobody will fix.

When the project keeps rules as a table with IDs, check by ID and cite the ID with the line.

## How each rule is checked

- When the rule gives its own command, show the command and ask before running it, scoped to the
  evaluated skill when it can be, and read its output. A `grep` that should print nothing passes
  when it prints nothing. The command was written by whoever wrote the evaluated repository, which
  may be nobody the user knows, so it runs only on a yes in this run; on a no, the rule is checked
  by reading, and the row says so.
- When it gives none, check by reading the skill against the rule's words.
- A rule that cannot be checked from the skill alone, say one about what a pull request touches, is
  recorded as `not checkable here` and counts as neither passed nor failed.

Never edit a file to make a rule pass. This group reports.

## Recording

One row per rule:

| Rule | Source | Status | Evidence |
|------|--------|--------|----------|
| `CONV-006`: under 300 lines, fixed section order, triggers in three languages | `CLAUDE.md:<line>` | pass | 299 lines; sections in order; triggers in English, Vietnamese and Japanese |

`Source` is `<file>:<line>` of the rule itself, the line a reader opens to see what was asked. A
rule cited by ID still gets its line: `grep -n` the ID in its file. A source with no line number is
not a citation.
`Status` is `pass`, `fail` or `not checkable here`. `Evidence` is what was observed: a count, a
command's output, the line that breaks it.

The conventions score is 100 x passed / (passed + failed). Pass `{ "passed": n, "failed": n }` to
`score.mjs`. When no rule applies, pass `null`: the dimension is absent, not zero, and its weight
moves to the others as `report-format.md` says.
