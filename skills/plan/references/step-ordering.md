# Step ordering

Loaded by `atk:plan` in step 3. Two questions decide the shape of a plan: where one step ends and
the next begins, and which order they go in. Getting either wrong produces a plan that is
technically complete and useless in practice.

## The rule for where a step ends

A step ends where a check becomes possible.

That is the whole boundary rule, and it settles both failure modes at once. A step too small to have
its own check belongs to the step next to it. A step whose check would only be "everything passes at
the end" is not a step either: it is a piece of the last one that got a number.

Applied backwards, it is a useful test on a finished plan. Read down the Check column. Every row
that repeats the same command, or that says "see step N", marks a boundary that was drawn by
instinct rather than by what can be verified.

## The rule for order

After each step, the tree works: it builds, the existing tests pass, and the application starts. Not
the new behaviour, which may still be absent or behind a flag, but everything that worked this
morning still works.

This is what makes a plan survive an interruption. Work stops at the end of a step, and what is on
disk at that moment is something a colleague can pull, a reviewer can read, and the author can
return to in two days without reconstructing where they were.

The usual order that satisfies it:

1. Anything that only adds: a new column that is nullable, a new function nobody calls yet, a new
   file, a feature flag that defaults to off.
2. The new behaviour, written behind whatever makes it inert: the flag, the unused branch, the
   endpoint not yet routed.
3. The switch that makes it live.
4. The removal of what the switch replaced, once nothing reaches it.

Steps 1 and 4 are the ones that get merged into the middle by a plan in a hurry, and merging them is
what makes a revert take the whole ticket instead of the last step.

## When two changes cannot be separated

Sometimes they genuinely cannot: a rename that the compiler will not accept halfway, a constraint
and the data migration that makes it satisfiable, a contract and its only consumer inside the same
repository.

Write those as one step and say in the step what forces them together. Do not split them for the
sake of a tidier list, because a plan whose step 3 does not compile teaches the implementer to stop
trusting the ordering, and after that the whole document is decoration.

Do not use the reverse excuse either. "These are related" is not the same as "these cannot compile
apart", and most steps claimed as inseparable are two steps with a shared file.

## Size

A step is one sitting of work. Below that, the plan is longer than the diff and stops being read.
Above it, the check at the end covers so much that a failure does not say what caused it.

When a step will not fit in a sitting and will not split, that is worth saying out loud in the plan.
It usually means the ticket is too big, which is `atk:breakdown`'s problem rather than this skill's,
and the plan is the right place to surface it.

## What this file does not decide

Which approach the steps implement. If the ordering exercise keeps producing two plausible sequences
because two designs are still open, the ticket is not ready to plan; it needs `atk:design-doc`.
Write what the fork is, name who owns it, and stop.
