---
name: fix
description: >
  Fix a defect the way a team reviewer will accept: capture the failure verbatim, prove the cause
  before changing a line, check that the current behaviour is not a decision somebody made on
  purpose, make the smallest change that removes the cause, verify it by layer, stop after three
  ruled-out hypotheses with a named person rather than guessing, call the team review on its own
  change and fix what it blocks on, and write the report that shows what was checked and what was
  not.
  Use for a bug report, a failing test, a broken endpoint or screen, or an investigation that has to
  end in an explanation rather than a guess.
  Triggers on: "fix bug", "debug", "bug", "sửa bug", "điều tra lỗi", "tìm nguyên nhân", "lỗi này",
  "バグ修正", "不具合調査", "原因調査", "/atk:fix".
argument-hint: "[issue-url|report-path|description] [--layer <name>] [--investigate-only] [--no-review] [--out <path>]"
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
fix touched, calling `atk:review` on its own change and fixing what it blocks on, and writing the
report a reviewer can check against the evidence.

Does NOT handle: a production incident in progress, which is `atk:incident` and owns the timeline,
the severity, and the client communication while users are down; reviewing somebody else's change
(`atk:review`); building a feature (`atk:implement`); or deciding whether the current behaviour
should change, which belongs to whoever owns that decision.

## Roles

Dev investigates and fixes. Tech Lead reviews, and is the one who answers when the intent check
stops the work and when the review loop hits its ceiling. The reviewer is never the author, so this
skill calling `atk:review` on its own change does not replace the Tech Lead reading it. QA confirms
the symptom is gone against the reproduction in the report, not against the developer's word. See
`shared/team-roles.md`.

## Invocation

```bash
/atk:fix <issue-url>           # Start from a bug report in the detected tracker
/atk:fix <report-path>         # Start from an existing investigation write-up
/atk:fix "<description>"       # Start from a description in the prompt
/atk:fix --layer api           # Skip surface mapping when the layer is already known
/atk:fix --investigate-only    # Stop after the cause is proven, change no file but the run trace
/atk:fix --no-review           # Skip the review call, and record that it was skipped
/atk:fix --out <path>          # Override the default output path
```

`.atk/profile.md` is required. This skill runs the project's own test, build, and lint commands and
reads its layer layout, so the Commands and Layers sections are its inputs rather than a
convenience, and the Team section names who the review loop escalates to. A Team section left at
`TBD` counts as missing, since an escalation with nobody's name on it reaches nobody. With no
profile, or no usable section, stop with the matching sentence in `shared/project-profile.md`. Never guess a test command: a guessed command that
passes is worse evidence than no command at all.

The same holds for an argument appended to a command that is correct. A package script whose own
definition ends in `--` swallows the filter that follows it: the whole suite runs, exits zero, and
prints the targeted test among the rest, so it reads exactly like the narrow run the report is about
to call it. Take the narrowing syntax from the profile as well, or run the command as the profile
gives it and say in the report which one was run.

## Workflow

```
[1. Capture and prove] -> [2. Intent check] -> [3. Minimal fix] -> [4. Verify by layer]
  -> [5. Tidy the fix] -> [6. Review and fix] -> [7. Report and finalize]
```

Before step 1, read `.atk/overrides/fix.md` when it exists, per rule 7 of `shared/team-roles.md`.
Then, before anything else, create this run's trace, `<docs root>/derived/traces/fix/<run-id>.md`:
read the kit's `shared/run-trace.md` and do what it says before the file, at each step, and at the close.
Then read the newest unfinished progress log of this skill for the same defect and offer to resume
it, asking first when it looks stale, per Progress log in `shared/artifact-paths.md`. Through the run,
add an entry to the log each time a hypothesis is proved or ruled out, and for each review round in
step 6.

### 1. Capture and prove

`references/investigate.md` holds the steps and the shape of the result. In short: copy the failure
verbatim before touching anything, restate the symptom as input, observed output, expected output,
and environment, map the surface to code, trace back to the line that produces the wrong behaviour,
answer why it broke now, prove it, and list everyone else who calls what is about to change. Tracing
a surface back through several modules, and listing every caller, go to an agent, per
Reading wide, through an agent in `shared/host-capabilities.md`; without one, read inline and say so in the
report.

Proof is one of exactly three things: a red test that reproduces it, a direct reproduction with its
output, or the responsible lines quoted together with a specific check that shows they do it. A
cause with no evidence block is not a cause, it is the first hypothesis.

The step has a ceiling of three hypotheses per defect, counted across the whole run, a resume
included, per Progress log in `shared/artifact-paths.md`. Past the third the
investigation stops and hands over the four things `references/investigate.md` lists under the
ceiling, the last of which is the name of the person who has to look. "Needs further investigation"
is not a handover: rule 1 in `shared/team-roles.md` applies here as everywhere, and an owner is a
person.

No file changes in this step other than the progress log, with one exception: the failing test may be
written, because the test is the evidence. Under `--investigate-only` even that exception is off, and the test goes into the
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

Where the defect is in a rule an agent follows, the smallest change is the narrowest form
`shared/review-fix-loop.md` names, and the report says which form it took.

When the cause cannot be fixed safely without a wider change, say so before making it, with what the
wider change touches. A refactor introduced quietly inside a fix is the change that makes a revert
impossible on the day it is needed.

### 4. Verify by layer

`shared/layer-verification.md` gives, per layer, what to run and what the run proves.
`references/layer-playbooks.md` adds what is this skill's own: where the cause hides, how to
reproduce it, and what belongs in the commit. Every command name comes from the Commands section of
`.atk/profile.md`, and a row's `Repository` column names where it runs from, per What the
Repositories table holds in `shared/project-profile.md`.

Re-run the reproduction captured in step 1 and show that it no longer reproduces. That comparison is
the point of having captured it verbatim.

Then walk the blast radius from the investigation: every other caller of the code that changed.
Run what covers them. State plainly what could not be verified and why. An unverified area named in
the report is a known gap; the same area left out is a claim that it was checked.

Last, the gate: which CI job judges the layers this fix touched, and what that job runs, per The
gate, not only the command in `shared/layer-verification.md`. A fix that passes here and fails the
job that gates the same layer is the failure this step exists to catch, and it is the likeliest of
the three skills to hit it, because a fix adds code to a surface the project already gates.

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

### 6. Review and fix

Every verification so far asked whether the change works. None of it read the diff for what it newly
claims or newly admits: a sentence written into a reference document that one branch of the code
does not honour, or a gate widened with no test that it stays closed for the rest. That is what a
review finds, and the pull request is the most expensive place for it to be found.

So the review has to see the document with the code. When the fix changes a public contract, move
its reference document now, rather than at step 7, per Calling the review in
`shared/review-fix-loop.md`; a document it cannot move now goes into section 9 with what is stale
and who will fix it, which is how a deliberate skip reaches the review. Moving it is not enough:
read each sentence the fix wrote against every branch of the code it describes and against the
left-for-later list that goes into section 9 below, per The sync obligation in
`shared/spec-docs.md`. A case the report leaves for later is a case the sentence must not deny.

Write sections 1 to 4b and 9 of the report now: the reviewer is an agent given paths rather than
this conversation, so the cause and what the fix leaves for later reach it only from a file. The
draft is the report itself at `DRAFT`, at its path under `## Output` and after the `git check-ignore`
that section asks for, and its path goes into the progress log as a labelled entry, per Progress log
in `shared/artifact-paths.md`, so a resume finds it. A draft moved later is re-checked and re-logged
at its new path; a resume that finds it gone rewrites it from the log and says so. Then say what the review will cost, per Calling the review
in `shared/review-fix-loop.md`, and run the loop that file holds: call `atk:review` on the change,
giving it the defect and the draft's path as intent, never as a path to review; fix every
`BLOCKING` finding and every `SHOULD FIX` finding that is not genuinely separate work; re-verify as
Re-verify after each round in that file says; at most twice, a resume included, then escalate by
name. A fix made here is held to step 3 like the first one: the smallest change that removes the
finding, in the form that file names, which may differ from the one the finding's `Fix` suggested.

A loop that comes out clean offers `atk:verify`, per the same file, to run the captured
reproduction and the blast radius against the running system rather than the suite; the report says
whether it ran.

`--no-review` skips the call and its draft, not the document check above and not the fact: the
report says the fix went out unreviewed and names who must review it before merge. Nothing runs here
under `--investigate-only`, when the intent check stopped the work, or when the hypothesis ceiling did.

### 7. Report and finalize

Complete the report step 6 drafted, from `references/report-template.md`, in the same file, and set
it to `IN REVIEW`; under `--no-review` or a stop before step 6, write it here. Then hand off to `atk:git` for the branch, the
commit, and anything that leaves the local repository. `shared/finalize-steps.md` is the contract it
carries out, and it opens with the reference documents the change owes. The report is the pull
request body.

A fix reaches that first step less often than an implementation does, and the case that matters is
the one where the document was right all along and the code was wrong. Fixing the code closes the
gap, so the document needs nothing; say that in the report rather than leaving a reader to wonder
whether it was checked. A document the fix did move went with the code into step 6, so this step
finds it done.

While a `BLOCKING` finding from step 6 is disputed or escalated, `atk:git` goes as far as the commit
and stops, per `shared/review-fix-loop.md`.

### `--investigate-only`

Stop after the intent check and write the report with the cause, the evidence, the blast radius,
and, when the intent check found a contradiction, its four parts and the options. Where the ceiling
stopped the investigation before a cause was proven, the report carries what ruled the three
hypotheses out and who has to look, in place of the cause. No change section, no verification
section.

The working tree must be exactly as it was found, including no new test file: show `git status` to
prove it. A red test still counts as evidence here, written into the report as a code block that a
reader can paste. A flag that promises to change nothing must not leave a file behind. The report and
the progress log are the run's own output rather than a change to the code, and are the only files
`git status` may show.

## Output

Written to `docs/records/fixes/<date>-<ticket>-<slug>.md` per `shared/artifact-paths.md`. The sections, and
which of them `--investigate-only` drops, are in `references/report-template.md`.

Check whether the project ignores that directory before writing the file, with
`git check-ignore -v <file>` on the report's own path, per Persistence in `shared/artifact-paths.md`, and say so there and
then where it does. Tracked is the wrong question: a project writing its first fix report has an
untracked `docs/records/fixes/` that nothing ignores, and a project that excluded a path through its
own clone rather than through `.gitignore` passes a check of that file and still loses the report.
This report becomes the pull request body at step 7, so one written into an ignored directory is a
body that never reaches the pull request, and the team hears about it while it can still choose
where the file goes.

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
      and the report says what the host's capability changed, or that the harness ships none and
      the pass was run by hand per `shared/tidy-pass.md`.
- [ ] Every caller in the blast radius was either exercised or named as unverified.
- [ ] Where step 6 ran, `atk:review` was called on the change after its cost was stated, or
      `--no-review` was passed and the report names who must review.
- [ ] Where step 6 ran, every `BLOCKING` finding is fixed or escalated by name, the loop ran at most twice, a resume
      included, no `NIT` was fixed, and the report says whether `atk:verify` was offered and ran.
- [ ] The CI gate for each layer touched is named, and a local command weaker than it left the
      difference recorded as unverified.
- [ ] The report says whether the fix changed a public contract, and if it did, which reference
      document moved with it, and that each sentence written there holds for every branch of the
      code or says where it does not, per `shared/spec-docs.md`.
- [ ] The report's path was checked with `git check-ignore` before the file was written, and
      one the project ignores was named to the team then rather than at the commit.
- [ ] The report says what could not be verified.
- [ ] Under `--investigate-only`, `git status` shows nothing changed but the report and the progress log.
