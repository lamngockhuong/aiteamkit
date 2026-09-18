---
name: fix
description: >
  Fix a defect the way a team reviewer will accept: capture the failure verbatim, prove the cause
  before changing a line, check that the current behaviour is not a decision somebody made on
  purpose, make the smallest change that removes the cause, verify it by layer, stop after three
  ruled-out hypotheses with a named person rather than guessing, and write the report that shows
  what was checked and what was not.
  Use for a bug report, a failing test, a broken endpoint or screen, or an investigation that has to
  end in an explanation rather than a guess.
  Triggers on: "fix bug", "debug", "bug", "sửa bug", "điều tra lỗi", "tìm nguyên nhân", "lỗi này",
  "バグ修正", "不具合調査", "原因調査", "/atk:fix".
argument-hint: "[issue-url|report-path|description] [--layer <name>] [--investigate-only] [--out <path>]"
---

# Fix a Defect (`atk:fix`)

Proves the cause, then fixes it. In that order, because a change made before the cause is proven is
a guess with a diff attached, and the review that catches it costs more than the investigation would
have.

The other half of the skill is where it stops, and it stops for two different reasons. When the
behaviour being called a bug turns out to be a decision somebody recorded, this skill does not fix
it; it brings the decision back to the person who owns it. And when three hypotheses have been ruled
out and none of them proved the cause, it hands the investigation over by name rather than carrying
on, because what is left at that point is usually somebody's knowledge rather than another search.

## Scope

Handles: capturing the failure, tracing it to the line that produces it, proving the cause, checking
the fix against recorded intent, making the minimal change, verifying by layer, tidying the lines the
fix touched, and writing the report a reviewer can check against the evidence.

Does NOT handle: a production incident in progress, which is `atk:incident` and owns the timeline,
the severity, and the client communication while users are down; reviewing somebody else's change
(`atk:review`); building a feature (`atk:implement`); or deciding whether the current behaviour
should change, which belongs to whoever owns that decision.

## Roles

Dev investigates and fixes. Tech Lead reviews, and is the one who answers when the intent check
stops the work. QA confirms the symptom is gone against the reproduction in the report, not against
the developer's word. See `shared/team-roles.md`.

## Invocation

```bash
/atk:fix <issue-url>           # Start from a bug report in the detected tracker
/atk:fix <report-path>         # Start from an existing investigation write-up
/atk:fix "<description>"       # Start from a description in the prompt
/atk:fix --layer api           # Skip surface mapping when the layer is already known
/atk:fix --investigate-only    # Stop after the cause is proven, change no file
/atk:fix --out <path>          # Override the default output path
```

`.atk/profile.md` is required. This skill runs the project's own test, build, and lint commands and
reads its layer layout, so the Commands and Layers sections are its inputs rather than a
convenience. With no profile, stop and use the sentence in `shared/project-profile.md`. Never guess
a test command: a guessed command that passes is worse evidence than no command at all.

## Workflow

```
[1. Capture and prove] -> [2. Intent check] -> [3. Minimal fix] -> [4. Verify by layer]
  -> [5. Tidy the fix] -> [6. Report and finalize]
```

### 1. Capture and prove

`references/investigate.md` holds the steps and the shape of the result. In short: copy the failure
verbatim before touching anything, restate the symptom as input, observed output, expected output,
and environment, map the surface to code, trace back to the line that produces the wrong behaviour,
answer why it broke now, prove it, and list everyone else who calls what is about to change.

Proof is one of exactly three things: a red test that reproduces it, a direct reproduction with its
output, or the responsible lines quoted together with a specific check that shows they do it. A
cause with no evidence block is not a cause, it is the first hypothesis.

The step has a ceiling of three hypotheses, counted across the whole run. Past the third the
investigation stops and hands over the four things `references/investigate.md` lists under the
ceiling, the last of which is the name of the person who has to look. "Needs further investigation"
is not a handover: rule 1 in `shared/team-roles.md` applies here as everywhere, and an owner is a
person.

No file changes in this step, with one exception: the failing test may be written, because the test
is the evidence. Under `--investigate-only` even that exception is off, and the test goes into the
report as a code block instead.

### 2. Intent check

Before calling the current behaviour wrong, look for a record that says it is right: a line in a
design document or an ADR, an assertion in a test, a commit message that explains the choice, a
comment that names the constraint.

When one exists and the requested behaviour contradicts it, stop. Change nothing and present four
things: the decision with its source as a path and line, a test name, or a commit; the concern
raised now; the trade-off between them; and two to four concrete options. Then wait for the person
who owns that decision.

This is rule 3 in `shared/team-roles.md` at its sharpest point.

### 3. Minimal fix

The smallest change that removes the proven cause. Not the tidy-up next to it, not the rename that
would make the file nicer, not a second bug noticed on the way. Those are separate work, and listing
them in the report is the right way to carry them forward.

When the cause cannot be fixed safely without a wider change, say so before making it, with what the
wider change touches. A refactor introduced quietly inside a fix is the change that makes a revert
impossible on the day it is needed.

### 4. Verify by layer

`shared/layer-verification.md` gives, per layer, what to run and what the run proves.
`references/layer-playbooks.md` adds what is this skill's own: where the cause hides, how to
reproduce it, and what belongs in the commit. Every command name comes from the Commands section of
`.atk/profile.md`.

Re-run the reproduction captured in step 1 and show that it no longer reproduces. That comparison is
the point of having captured it verbatim.

Then walk the blast radius from the investigation: every other caller of the code that changed.
Run what covers them. State plainly what could not be verified and why. An unverified area named in
the report is a known gap; the same area left out is a claim that it was checked.

### 5. Tidy the fix

With the verification green, hand the change to the host's code clean-up capability, `/simplify` in
Claude Code, per `shared/host-capabilities.md`.

Here it is narrower than anywhere else in the kit, because step 3 already said the change is the
smallest one that removes the cause. The clean-up covers the lines this fix touched and nothing
beside them: a fix that arrives carrying a tidy-up of the surrounding file is the fix that cannot be
reverted on the day it has to be.

Afterwards, re-run the narrowest check that covers what it touched, and the captured reproduction
again. A clean-up that breaks either is reverted rather than debugged, and the report says it was.

Nothing runs here under `--investigate-only` or when the intent check stopped the work, since no
file changed.

### 6. Report and finalize

Write the report from `references/report-template.md`, then follow `shared/finalize-steps.md` for
the branch, the commit, and anything that leaves the local repository.

### `--investigate-only`

Stop after the intent check and write the report with the cause, the evidence, the blast radius,
and, when the intent check found a contradiction, its four parts and the options. Where the ceiling
stopped the investigation before a cause was proven, the report carries what ruled the three
hypotheses out and who has to look, in place of the cause. No change section, no verification
section.

The working tree must be exactly as it was found, including no new test file: show `git status` to
prove it. A red test still counts as evidence here, written into the report as a code block that a
reader can paste. A flag that promises to change nothing must not leave a file behind.

## Output

Written to `docs/fixes/<ticket-or-date>-<slug>.md` per `shared/artifact-paths.md`. The sections, and
which of them `--investigate-only` drops, are in `references/report-template.md`.

## Ticket

Follow `shared/ticket-adapters.md`. The report is the body of the comment on the bug, posted after a
yes per `shared/finalize-steps.md`, which also holds what this skill must not do to the ticket.

## Definition of done

- [ ] The failure was captured verbatim before any file changed.
- [ ] The evidence block is one of the three accepted forms and is not empty.
- [ ] The hypothesis count is recorded, and a run that reached three stopped and named the person
      who has to look.
- [ ] No code changed before the cause was proven, apart from a test that reproduces it.
- [ ] "Why now" is answered with a commit, or explicitly with "broken since it was written".
- [ ] The intent check ran, and a contradiction stopped the work rather than being noted afterwards.
- [ ] The change is the smallest one that removes the cause, and anything else found is listed, not
      done.
- [ ] The captured reproduction was re-run and no longer reproduces.
- [ ] The tidy step stayed inside the lines the fix touched, the reproduction was re-run after it,
      and the report says what it changed or that the harness has no such capability.
- [ ] Every caller in the blast radius was either exercised or named as unverified.
- [ ] The report says what could not be verified.
- [ ] Under `--investigate-only`, `git status` shows the working tree untouched.
