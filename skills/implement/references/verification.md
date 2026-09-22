# Verification

Loaded by `atk:implement` after the code is written, and again after each round of review fixes.
It answers the questions that are this skill's own: in what order to run things, how far to reach,
and what to do about a check that was already failing.

What to run per layer, and what each run may be said to prove, is in `shared/layer-verification.md`.
Read it alongside this file. It is shared because `atk:fix` and `atk:verify` answer that same
question for their own reasons, and a correction to what a run proves has to reach all three.

Commands and layer names are blanks in both files, filled from the Commands and Layers sections of
`.atk/profile.md`, with the one exception that file names: the gate's own command, which comes from
the project's CI configuration and is recorded as coming from there. A tool named here would be right for one repository and wrong for every other,
and would be copied anyway because a written command looks authoritative.

## Order

Narrowest first, widest last, because a failure found by the narrowest check is the cheapest to
read. Stop at the first failure, fix it, and start the order again rather than collecting a list of
failures that may all be the same cause wearing five faces.

1. The check that covers only what changed: the unit or component test for the changed unit.
2. The check that covers the layer it sits in.
3. The blast radius: everything that calls what changed, in whatever layer it lives.
4. Lint, then type check, then build, from the Commands section.
5. The gate: what the project's CI runs over the layers this change touched, per The gate, not only
   the command in `shared/layer-verification.md`.

Everything after the first is later because it is slower and because it finds a different class of
problem. Running the build first is how twenty minutes get spent proving that a typo is still a typo.

Step 5 is last and is not optional. The first four ask which command the profile names; it asks
which command the change will be judged by, and the two are the same only until a project adds a
coverage threshold or a wider scope to one job. Where they differ, run the gate's command if it can
be run here, and where it cannot, the gap is an unverified area and is written down as one. The
cheapest place to find out that a new file has no spec is before the reviewer is assigned.

## Per layer

`shared/layer-verification.md` holds the table: the command for each layer, what a pass proves, and
what it does not. Its `Run` column is step 2 of the order above. Step 1 is narrower than any row
there, being the single unit or component that changed, and the table has no column for it. The
record is written from the last two columns.

## The blast radius

Take the list from the plan or, when the work is small enough to have had no plan, build it now:
every caller of every function, endpoint, component, or query whose behaviour changed. Search for
each by name rather than recalling who uses it.

Run whatever covers those callers. Where nothing covers them, that is the finding: say which callers
have no coverage and that they were not exercised. This is usually the most valuable line in the
whole record, because it is the one the reviewer would otherwise have to work out alone.

## Pre-existing failures

A check that was already failing before this change is not this change's to fix, and not this
change's to hide either.

Confirm it is pre-existing rather than assuming it: run the same check on the branch point. Then
record which checks were already red, and carry on. Fixing it quietly inside this change makes both
the failure and the fix invisible in the diff, and the next person to see it red will look at this
commit.

A pre-existing failure in a check that covers a file this change touches is different. There is no
way to show the change did not cause it, so resolve it or explain it before calling the review.
Handing a reviewer a red check inside the change's own surface spends their time on a question the
author could have answered.

## Under `--tdd`

The flag is not the only thing that asks for this. A plan whose own steps prescribe writing the test
first binds the run the same way, per step 2 of `SKILL.md`, and those steps are verified the same
way here.

The test written before the code has already been seen failing, so the first run of step 1 is
confirming it now passes. Say so in the record with both halves: the test failed before the change
and passes after. That pair is the strongest evidence this skill can produce, and it exists only
because the order was kept.

## What to write down

For each run: the command as it came from the profile, the result, and what it covers. Then the gate
for each layer touched, named by its CI job, and whether the local run matched it, was weaker, or had
no gate to match. Then, for anything that could not be checked, the last column of the table in
`shared/layer-verification.md`, and the pre-existing failures.

The record never says "verified" without naming what was run. It is the word most likely to be
believed and least likely to be checked.
