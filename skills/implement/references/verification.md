# Verification

Loaded by `atk:implement` after the code is written, and again after each round of review fixes.
It answers the questions that are this skill's own: in what order to run things, how far to reach,
and what to do about a check that was already failing.

What to run per layer, and what each run may be said to prove, is in `shared/layer-verification.md`.
Read it alongside this file. It is shared because `atk:fix` and `atk:verify` answer that same
question for their own reasons, and a correction to what a run proves has to reach all three.

Commands and layer names are blanks in both files, filled from the Commands and Layers sections of
`.atk/profile.md`. A tool named here would be right for one repository and wrong for every other,
and would be copied anyway because a written command looks authoritative.

## Order

Narrowest first, widest last, because a failure found by the narrowest check is the cheapest to
read. Stop at the first failure, fix it, and start the order again rather than collecting a list of
failures that may all be the same cause wearing five faces.

1. The check that covers only what changed: the unit or component test for the changed unit.
2. The check that covers the layer it sits in.
3. The blast radius: everything that calls what changed, in whatever layer it lives.
4. Lint, then type check, then build, from the Commands section.

The last three are last because they are slow and because they find a different class of problem.
Running the build first is how twenty minutes get spent proving that a typo is still a typo.

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

The test written before the code has already been seen failing, so the first run of step 1 is
confirming it now passes. Say so in the record with both halves: the test failed before the change
and passes after. That pair is the strongest evidence this skill can produce, and it exists only
because the order was kept.

## What to write down

For each run: the command as it came from the profile, the result, and what it covers. Then, for
anything that could not be checked, the last column of the table in `shared/layer-verification.md`,
and the pre-existing failures.

The record never says "verified" without naming what was run. It is the word most likely to be
believed and least likely to be checked.
