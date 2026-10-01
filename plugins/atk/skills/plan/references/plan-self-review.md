# Reading a plan back

Loaded by `atk:plan` in step 6, and by `references/plan-review-mode.md` when the plan under review
is somebody else's. It answers one question: is what the plan says about this repository true.

The shape items in `## Definition of done` cannot catch what this pass catches, and shape was never
the problem. A plan satisfies every one of them while citing a file that moved last month, naming a
test command this project does not have, and building phase 3 on an interface phase 1 never defines.
Those are the errors of writing four phase files in one sitting, and none of them is visible from
inside the sentence that contains it. They are visible from the repository, which is why the items
that do check them are the ones this pass answers for.

So this pass re-opens things. It does not re-read the plan looking for whether it reads well.

## The six claims a plan makes

| The claim | Reopen | The failure it hides |
|-----------|--------|----------------------|
| About the code that exists | Every `path:line` the plan cites | A citation that was true of an older tree, so the implementer starts by looking for something that is not there |
| About the code that does not exist yet | Every library, module registration, table, column, environment variable, or helper the plan assumes it can use | A step that cannot start, discovered on the morning it was scheduled |
| About its phases | Every name a phase defines and a later phase consumes | Phase 3 written against an interface phase 1 shaped differently |
| About its own index | The four fields the index and the phase file both carry: title, dependencies, status, `Delivers` | An index that disagrees with the phase it links to, where the reader believes whichever they opened |
| About the request | Every acceptance criterion, against the steps | A criterion nobody planned for, found in review |
| About how this project is checked | Every command written into a `Check` cell | A check that fails on the implementer's machine in a way that looks like their fault |

## How to reopen each one

**The citations.** Open the file at the line. It is enough that the line is what the plan says it
is; a citation that has shifted by a few lines is corrected silently. Where the line no longer holds
its subject, look for that subject elsewhere before concluding anything: `grep` for the name, or
`git log --follow` the old path. A function that moved to another file is a citation to repoint, not
a question for a person, and rule 5 of `shared/team-roles.md` puts the search before the asking. Only
a subject that is genuinely gone is a result, because whatever the plan concluded from it was
concluded from nothing.

A citation into a generated file, or one `git check-ignore` matches, is a result about the citation
itself: it resolves on the author's machine and not on the reviewer's, so the same plan reads two
ways depending on who opened it.

**The assumptions.** Confirm each one from the repository rather than from memory, which is the
whole point of this row: a plan is written at the speed of prose, and prose does not stop to check
whether the library it just named is installed. Grep the package manifest for the dependency, the
module registration for the provider, the schema for the column, the configuration schema for the
variable. A plan that intends to add one of these is not making this claim at all; what is checked
here is only what the plan expects to find already there.

**The names across phases.** Read each phase for what it defines and what it uses. A type, a
function signature, a file path, an endpoint, a configuration key: where one phase produces it and
another consumes it, the two spellings have to be the same spelling. Then check the direction, which
the `Depends on` column already claims: nothing may consume what a later phase produces.

Two phases that both define the same name are the same error without the consuming half. Whichever
runs second lands on top of the first, and neither phase file shows it, so compare definitions
against definitions and not only against uses.

**The index against the phases.** `references/plan-template.md` deliberately writes four things
twice: the phase title, its dependencies, its status, and the one-line `Delivers`. The index carries
them in its phases table, and the phase file carries the dependencies in its `dependencies:` front
matter and the rest in its body. Compare both copies of each, and where they differ the phase file
wins, which that template already says.

This is the only verification step that changes a plan file after step 5 wrote it, so a correction
here that touches a dependency or a title in one place leaves the other saying something else.
Nothing downstream would catch it, because the reader opens one file and believes it. A rework the
caller asks for at step 7 also edits these files, and comes back through this pass for the same
reason.

**The criteria.** Take the acceptance criteria from section 1 of `plan.md` and find, for each one,
the step that satisfies it. A criterion with no step is either work that was dropped or work that
belongs in the out-of-scope section with a reason.

Where the request carried no acceptance criteria at all, this claim did not run. Say so, and name
who must supply them, per step 1 of `SKILL.md`. A claim that is vacuously true is the one way this
pass can report a clean result while having checked nothing, and it is the most expensive place for
that to happen.

**The commands.** Every check written as a command comes from the Commands section of
`.atk/profile.md`. One that does not appear there was invented, and an invented command fails on the
implementer's machine in a way that looks like their fault. Without a profile there is nothing to
compare against: this claim did not run, and the artifact says which commands are inferred, per the
Required-soft rule cited in `SKILL.md`.

**The plan's own open questions.** Not a claim of its own, and checked with the criteria: read the
Open questions sections and try to answer each one from the repository. `plan-template.md` already
says a question the repository can answer is not an open question. One that this pass can settle is
settled here, and removed.

## What to do with what comes back

| What it is | What happens |
|------------|--------------|
| Wrong, and the repository says what is right | Fix the plan in place. A stale line number is not worth a person's attention |
| Wrong, and fixing it changes the sequence | Fix it, then re-run this pass over the phases the fix touched |
| Unconfirmable, and the plan depends on it | An open question in the phase that depends on it, naming who must answer |
| Unconfirmable, and nothing depends on it | Out of the plan. An assumption nobody needs is noise in a document a person has to read |
| A claim that could not run at all | Say so in the artifact, and name who would make it runnable |
| Two approaches, not one sequence | Stop, and retire what was written: see below |

"Nothing depends on it" is not a judgement. Delete the sentence and read the phases: if no step, no
check, and no `Delivers` cell changes meaning, nothing depended on it. Where one does, the row above
applies instead. Drawing that line generously is how an assumption quietly disappears, which is what
the third row exists to prevent.

The third row is also the one that decides whether this pass is worth having. A verification step
that quietly deletes what it could not confirm hands over a plan that reads as though everything was
checked, and the reviewer's attention goes to the wrong places. Name the person, per rule 1 of
`shared/team-roles.md`: "somebody" and "the team" are not answers, and an open question without an
owner is a note to nobody.

The order of the middle rows is rule 5 of the same file, applied to a plan: reopen the repository
first, and put to a person only what it could not settle. A pass that asked about everything it was
unsure of would cost more attention than the plan it was checking.

## When the design gate fires here

Step 3 sends a comparison of approaches to `atk:design-doc`, and this pass can reach the same fork
later, with the directory already on disk at `status: DRAFT`. Stopping is not enough then: step 5
refuses to write an empty directory precisely so that nothing in `plans/` looks live when it is not,
and a directory abandoned at this point looks exactly like one somebody should build from.

So retire it, index and phases together. Set the index `status` to `SUPERSEDED`, put the fork and
the name of whoever owns it in the index where the phases were, and link `atk:design-doc` as what
comes next, per the rule at the end of `shared/artifact-paths.md`. Set every phase file's `status`
to `SUPERSEDED` as well: left at `pending` beside a retired index they are the live-looking files
this paragraph exists to prevent, and a later `--review` would read them as phases the index no
longer lists. Then hand back the fork and stop.

## How many times this runs

At most twice. The first pass fixes what it finds; a fix that changes the sequence earns one more
pass over the phases it touched, and that is the end of it. A third round means the plan is being
rewritten rather than corrected, and what to do about that belongs to a person: write it as an open
question naming the `approver:` from the index, or the person a `TBD` there points at, and hand over
the plan as it stands.

The ceiling counts verification passes, not corrections. What the second pass finds is still fixed;
what does not happen is a third reading to confirm those fixes, and the plan says that the cap was
reached so the reader knows which corrections went out unverified.

`atk:fix` and `atk:verify` each carry a ceiling of three, for the reason this one exists: a pass with
no ceiling ends when the agent decides it has had enough, which is a stopping rule nobody wrote down
and nobody can check. Two is enough here because a plan is shorter than a defect hunt and the second
reading covers only the phases the first one changed.

A rewrite the person asked for is a new plan, not a third round: it starts the count again.

## What this pass is not

It is not the Tech Lead's review. The author is reading their own work, which catches the errors
above and catches no judgement error at all: whether these are the right phases, whether the
approach is sound, whether the risk was understood. `## Roles` in `SKILL.md` says who looks at that
and when, and this pass does not shorten it or stand in for it.

Its subject is what is true of the repository, not how well the work was cut. That is why the
backward test in `references/step-ordering.md`, reading down the `Check` column for boundaries drawn
by instinct, is not here: it is a judgement about the cut, made by the person who just made the cut.
`references/plan-review-mode.md` runs it, because there the reader is somebody else.

It also decides nothing. It reports what it found and fixes facts. Whether a plan with three open
questions is ready to start is the approver's call, and a pass that ended in a verdict would be
taking it.

## A word this file does not use

Nothing here is a "finding". A finding belongs to a review, which has a list and a reader; this pass
has a plan file and the table above, and every result lands in one of its rows. Under
`references/plan-review-mode.md` the same results do become findings, because there they go to a
person instead of into the file, and that file says how each row converts.
