# Report format

Loaded by `atkx:skill-eval` at the end of every run. It fixes the report the agent prints, and the
scoring rules `scripts/score.mjs` applies. The two must agree; when they do not, the script is what
the sample skills are checked against, and this file is the one to correct.

## The score

`node scripts/score.mjs` reads one JSON object on standard input:

```json
{
  "static": { "passed": 12, "failed": 0, "credentials": 0, "gate": 0 },
  "conventions": { "passed": 5, "failed": 1 },
  "trigger": { "status": "measured", "score": 85 }
}
```

`static` is the `summary` of the static check. `conventions` is the count of the project
conventions group, or `null` when none were found. `trigger` is `{ "status": "not-run" }` when the
trigger mode did not run and `{ "status": "broken" }` when it ran and no session selected any skill.
A dimension may be given as `{ "score": n }` instead of counts, a number from 0 to 100; for
`static`, `credentials` and `gate` still have to be passed beside it, since they decide the F.
Anything else, a count given as a string or a score past 100, is refused rather than guessed at.

The rules it applies:

| Case | Weights | Grade |
|------|---------|-------|
| All three measured | trigger 0.60, static 0.25, conventions 0.15 | A at 90 and above, B at 80, C at 70, D at 60, F below |
| No project conventions | trigger 0.60 / 0.85, static 0.25 / 0.85 | as above |
| Triggers not run, or broken | the remaining weights, in the same proportion | none: the score is labelled "without triggers" |
| Any credential or gate failure | unchanged | F whatever the figures, each finding named as the reason, with or without triggers: the F overrides the missing grade |

Example: trigger 85, static 90, conventions 80 gives 85.5, grade B.

It prints `composite`, `label`, `grade` (a letter or `null`), `scores`, `weights` and `notes`, one
note per rule it applied. It also prints `band`, the letter the composite alone would get, which the
sample-skill check compares. The report never prints `band`: a score without triggers carries no
grade, and printing a letter beside it would be one.

The review of a run is never an input. It describes one run, not the skill, and it is reported in a
section of its own.

## The report

Printed in the session. Written to a file when `--out <path>` was passed, to that path and no
other, with the same content, asking first when a file is already there. Without `--out`, one
question follows the printed report: save it or not. A yes writes it to
`<temp dir>/skill-eval-<slug>-<YYMMDD-HHMM>.md`, or to a path the user types instead, with the same
check for a file already there. `<slug>` is the evaluated skill's folder name, never its frontmatter
`name`, reduced to lowercase letters, digits and hyphens, and `skill` when nothing is left. The
question shows that path resolved in full, so the yes is to the real file. A no, or no answer,
writes nothing.

The operating system's temporary directory holds what a mode needs while it runs: a drafted case
set before the yes, SkillEvaluator's output, and the trigger runner's own directory, which it
removes when it ends. The one thing left there on purpose is the report, when the user said yes to
saving it there.

```markdown
# Skill evaluation: <fullName>

**Score: <composite>, grade <letter>**
or **Score: <composite> (without triggers), no grade**
or **Score: <composite>, grade F: <reason>**

<one line per note from score.mjs>

Not measured in this run: <dimensions>, or "all three dimensions were measured".

Path: <skill path> · Date: <YYYY-MM-DD> · Harness: <harness> · Checks run by: script | hand

## Static check: <score> (<passed> passed, <failed> failed)

| Check | Result | Value | Where |
|-------|--------|-------|-------|

### Security gate
<one row per gate failure: kind, file:line, detail; or "No gate failure.">

### Credentials
<one row per finding, value masked; or "None found.">

### Information
<frontmatter keys some harnesses do not read, declared network hosts>

## Project conventions: <score> | not found

<per project-conventions.md: rule, source file:line, status, evidence;
or "No project conventions found. Looked in: <files>">

## Trigger measurement: <score> | not run | did not work

<per trigger-mode.md when it ran; otherwise one line saying why not>

## Review of the run (not scored)

<per review-mode.md, only when --review was passed>

## External validator: SkillEvaluator <version> (not scored)

<overall status, scanners it could not run, counts by severity, then one row per finding:
severity, check, message, file:line; or the one line saying it is not installed and how to
install it; or that the user declined it in this run>
```

Rules for writing it:

- The score line comes first. A reader deciding whether a skill is ready reads that line and stops;
  everything below is for the reader who asks why.
- Every failed check names its file and line. A finding with no place to look is not actionable.
- A dimension that was not measured is named as not measured, never shown as 0 or as full marks.
- When the checks were done by hand because Node was missing, `Checks run by: hand` says so, and
  the static score is labelled as counted by hand.
- The proposed changes of a review are shown as diffs and never applied. The report itself changes
  nothing in the evaluated skill.
