# Step ordering

Loaded by `atk:plan` in step 3. The work is cut twice, at two sizes, and each cut has its own rule.
Getting either wrong produces a plan that is technically complete and useless in practice.

| Cut | A unit ends where | Failure when it is wrong |
|-----|-------------------|--------------------------|
| Phase | Stopping here for two weeks would be fine | A phase that rots if the next one slips |
| Step | A check becomes possible | A plan longer than the diff, or a step whose failure says nothing |

## Where a phase ends

A phase ends where the work could stop for two weeks and nothing would be wrong.

That is the test, and it is deliberately not "something mergeable". Every step is mergeable; a step
leaves the tree building and the tests passing, which is a lower bar than this one. The question a
phase has to answer is what happens if the next phase never arrives: a column that nothing writes
to, a client that nothing calls, a flag defaulting to off, all sit there indefinitely and cost
nobody anything. A half-migrated schema or a half-switched call path is also mergeable, and it is
somebody's incident three sprints later.

So: a step is safe to stop at until tomorrow, a phase is safe to stop at until somebody decides
otherwise.

This is why a phase is not simply a group of steps that felt related. Read the `Delivers` cell in
the index: a phase that cannot fill it in concrete terms is a step in its neighbour, and two phases
whose cells describe the same thing are one phase.

One phase is a normal answer. Work with a single reviewable outcome does not gain anything from
being cut into three, and a plan that invents phases to look thorough gets skimmed like any other
padded document.

Dependencies between phases are real or absent. Phase 2 depends on phase 1 when it needs what phase
1 built, not when a person would naturally do them in that order. Ordering is already carried by the
numbers; a dependency claims something stronger, and claiming it falsely is how a plan loses the
freedom to reorder when something gets blocked.

## Where a step ends

A step ends where a check becomes possible.

That is the whole boundary rule, and it settles both failure modes at once. A step too small to have
its own check belongs to the step next to it. A step whose check would only be "everything passes at
the end" is not a step either: it is a piece of the last one that got a number.

Applied backwards, it is a useful test on a finished plan. Read down the Check column. Every row
that repeats the same command, or that says "see step N", marks a boundary that was drawn by
instinct rather than by what can be verified.

## The order of steps inside a phase

After each step, the tree works: it builds, the existing tests pass, and the application starts. Not
the new behaviour, which may still be absent or behind a flag, but everything that worked this
morning still works.

This is what makes a plan survive being put down. The author can come back on Monday, run the suite,
and know exactly where they were, instead of reconstructing which half-finished edit belonged to
which idea.

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

When a step will not fit in a sitting and will not split, say so in the plan rather than hiding it
in an estimate. It is a risk the reviewer should see.

It is not a reason to reach for `atk:breakdown`. Size is not what separates the two skills: work
that stays with one person is planned here however long it runs. Breakdown enters when the work has
to be shared, and a step nobody can finish alone is one way to discover that, but only when adding a
second person is actually on the table.

## What this file does not decide

Which approach the steps implement. If the ordering exercise keeps producing two plausible sequences
because two designs are still open, the ticket is not ready to plan; it needs `atk:design-doc`.
Write what the fork is, name who owns it, and stop.
