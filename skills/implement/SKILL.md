---
name: implement
description: >
  Write the code for a piece of work the way a team will accept it: decide whether the work needs a
  plan before a line is written, follow the project's own conventions and reference modules, verify
  by layer with the project's own commands, then call the team review and fix what it blocks on
  before handing the change over.
  Use when a ticket, a plan, or a described requirement is ready to be built, and the question left
  is how to build it rather than what to build.
  Triggers on: "implement", "code this", "build this feature", "làm task này", "triển khai",
  "viết code cho", "code tính năng này", "実装", "コード書いて", "この機能を作って",
  "/atk:implement".
argument-hint: "[plan-path|ticket|description] [--layer <name>] [--tdd] [--no-review] [--out <path>]"
---

# Implement a Change (`atk:implement`)

Writes the code, between two gates. The first decides whether this work may be written at all
before somebody has agreed how: most work may, some work must not. The second is the team review,
called by this skill on its own output rather than left for the reviewer to discover.

What the skill never does is decide. It builds what was agreed, and when it finds it is about to
agree something on the team's behalf, it stops and says whose call it is.

## Scope

Handles: reading the plan, ticket, or description, scoring how much agreement the work needs before
code, writing the change against the project's conventions and reference modules, verifying by
layer with the project's own commands, tidying what was written before anyone reviews it, calling
`atk:review` and fixing what it blocks on, and closing through the shared finalize sequence.

Does NOT handle: the review checklist, the severity scale, and the breadth of a review, all of
which belong to `atk:review` and are not restated here; sequencing work into phases and steps
(`atk:plan`); choosing between approaches (`atk:design-doc`); splitting work across people
(`atk:breakdown`); or approving and merging, which is a person's act and never this skill's.

Nor a defect. `atk:fix` starts from a symptom and may not change a line until the cause is proven.
This skill starts from a requirement, where there is nothing to prove and the question is only how
to build it. A bug report handed to this skill gets handed on.

## Roles

Dev writes the change and owns it. Tech Lead approves the design when the large gate fires, and is
the person the review loop escalates to when it hits its ceiling. The reviewer is never the author,
so this skill calling `atk:review` on its own work does not replace a colleague reading it. QA
tests it afterwards against the criteria, not against this skill's word. See `shared/team-roles.md`.

## Invocation

```bash
/atk:implement <plan-path>        # Work through an existing plan, one phase at a time
/atk:implement <ticket>           # Start from a ticket in the detected tracker
/atk:implement "<description>"    # Start from a description in the prompt
/atk:implement --layer api        # Restrict the change to one layer when it is already known
/atk:implement --tdd              # Write the failing test before the code, per step
/atk:implement --no-review        # Skip the review call, and record that it was skipped
/atk:implement --out <path>       # Write the implementation record to a file as well
```

`.atk/profile.md` is required, specifically its Layers, Commands, and Team sections. This skill runs
the project's own test, build, and lint commands, follows its layer layout, and needs a name to
escalate to when the review loop hits its ceiling, so those three are its inputs rather than a
convenience. Check the sections, not only the file: a Team section left at `TBD` fails this
precondition too, because an escalation with nobody's name on it reaches nobody.

With no profile, stop and use the sentence in `shared/project-profile.md`. A guessed test command
that exits zero is the worst outcome available here, because it reads as proof.

## Workflow

```
[1. Plan gate] -> [2. Write the code] -> [3. Verify by layer] -> [4. Tidy the change]
  -> [5. Review and fix] -> [6. Finalize]
```

### 1. Plan gate

`references/plan-gate.md` holds the input table, the three levels with the signals that put work in
each, and why the middle level carries on while the top one stops.

In short: a path to an existing plan runs straight through. Anything else is scored, and work that
is neither small nor large is medium. Small work goes directly to code. Medium work calls
`atk:plan --inline`, which takes the one confirmation, and continues from there. Large work, meaning
work that touches a schema, a public contract, a shared module, more than one service, or an
architectural choice nobody has made yet, stops and goes to `atk:design-doc` with no file changed.

Work handed in as an approved design document is the one exception: the decision the large gate
would stop for has already been made and recorded, so that work is scored between small and medium
and never bounces back to the skill that produced it.

At none of the three levels does this skill sequence the work inside itself. A plan written in the
session and never written down leaves the reviewer nothing to read, and the reviewer is the point.

### 2. Write the code

Conventions come from the target project's `docs/conventions.md`, which is what `atk:convention`
writes. Where the project has none, use the baseline items in `shared/review-checklist.md` and say
in the record that the baseline was used. Never invent a project rule mid-change: an unrecorded rule
applied here will be applied differently by the next person.

Shape comes from the reference module named for that layer in the Layers section of
`.atk/profile.md`. Read it before writing, and follow it. A change that is correct but shaped unlike
everything around it costs the reviewer more than it saved the author.

Stay inside the agreed scope. Anything else noticed on the way gets listed in the record, not done:
a tidy-up carried in alongside the change is what makes the change unrevertable on the day it has to
be reverted.

Under `--tdd`, each step writes its test first and the test is seen failing before the code is
written. A test written after the code and never seen red proves that it passes, not that it checks.

### 3. Verify by layer

`shared/layer-verification.md` gives what to run per layer and what each run actually proves.
`references/verification.md` adds the order to run things in, how far to reach, and what to do with a
check that was already red. Every command name comes from the Commands section of `.atk/profile.md`.

Then walk the blast radius: everything that calls what changed. Run what covers it, and state
plainly what could not be verified and why. An unverified area named in the record is a known gap;
the same area left unmentioned is a claim that it was checked.

### 4. Tidy the change

Once the verification is green, hand the change to the host's code clean-up capability, `/simplify`
in Claude Code, per `shared/host-capabilities.md`. That file holds the four rules: after
verification and not before, only the code this change touched, re-verify what the clean-up touched,
and revert rather than debug a clean-up that breaks a check.

It runs here rather than after the review because the reviewer should not spend a round on
duplication the author could have removed, and rather than before the verification because a clean-up
applied to code that does not work yet rewrites lines that are about to be rewritten.

The record says what it changed, or that it changed nothing, or that the harness has no such
capability. A clean-up nobody can see in the record is indistinguishable from one that never ran.

### 5. Review and fix

`references/review-fix-loop.md` holds the loop: call `atk:review` on the change, fix every
`BLOCKING` finding and every `SHOULD FIX` finding that is not genuinely separate work, re-run the
verification from step 3, and repeat at most twice.

`NIT` findings are never fixed here and never block, exactly as `atk:review` defines them. Disputing
a finding is not fixing it: a finding the author believes is wrong goes to the Tech Lead with the
reason. A disputed `BLOCKING` finding stops the work until the answer comes; a disputed `SHOULD FIX`
does not, and the dispute goes into the record.

Still `BLOCKING` after the second round means stop. Escalate with the remaining findings, each with
its file and line, and the name of the person who has to look. A third round is where a design
problem starts being covered by patches.

A loop that comes out clean hands over to `atk:verify`, which runs the application and asserts the
side effect in real data rather than in the suite. That handoff is offered, not taken, and the record
says whether it ran.

`--no-review` skips the call. It does not skip the fact: the record says the change went out
unreviewed and names who must review it before merge. A skipped review that nobody can see in the
record is the same as a review that never happened and was never missed.

### 6. Finalize

Follow `shared/finalize-steps.md` for the branch, the commit, and every action past it. The consent
line in that file is what keeps this skill from pushing, opening a pull request, or touching the
ticket because it assumed a yes.

## Output

The deliverable is the code. Alongside it, the skill produces an implementation record, in the
session by default, which becomes the body of the pull request per `shared/finalize-steps.md`.
`--out` writes it to a file as well, per `shared/artifact-paths.md`.

The record holds: what was built and against which acceptance criteria; which plan gate level fired
and why; the files changed by layer; which conventions source was used, naming it as the project's
own or as the baseline; what was verified with which command and what each run proved; what could
not be verified and why; what the tidy step changed, or that it did not run and why; the review
findings, which were fixed and which were deliberately kept;
whether `atk:verify` ran on the change, and if not, that nobody has yet seen it run; and anything
noticed but deliberately not done.

Under `--out` the file opens with the front matter block in `shared/artifact-paths.md`, like every
other artifact the kit writes, with the author as `owner` and the reviewer as `approver`. In the
session and in the pull request body that block is dropped: the same facts are already carried by
the branch and the pull request itself.

## Ticket

Follow `shared/ticket-adapters.md`. The record is offered as the comment on the ticket, shown first
and posted on a yes, per the consent line in `shared/finalize-steps.md`. Do not move the ticket to
done: this skill is the author, and done is the approver's word.

## Definition of done

- [ ] The plan gate ran, its level is recorded, and the signals that decided it are named.
- [ ] Large-gate work changed no file and went to `atk:design-doc`.
- [ ] Medium-gate work has a plan directory written by `atk:plan`, and code began only after the
      confirmation.
- [ ] No plan was written inside this skill instead of by `atk:plan`.
- [ ] The conventions source is named, and a project with none says the baseline was used.
- [ ] Every command run came from the Commands section of `.atk/profile.md`.
- [ ] The blast radius was walked, and anything unverified is named as unverified.
- [ ] The tidy step ran after a green verification, touched only this change, and was re-verified;
      the record says what it changed, or that the harness has no such capability.
- [ ] `atk:review` was called, or `--no-review` was passed and the record says who must review.
- [ ] Every `BLOCKING` finding is fixed or escalated by name, and no `NIT` was fixed silently.
- [ ] The review loop ran at most twice before escalating.
- [ ] The record says whether `atk:verify` ran, and a change nobody has run is named as one.
- [ ] Anything noticed outside the scope is listed rather than done.
- [ ] Nothing was pushed, opened, or merged without the yes that `shared/finalize-steps.md` requires.
