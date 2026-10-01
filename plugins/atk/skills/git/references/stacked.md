# Stacked pull requests

Loaded by `atk:git` for `--stack`. A chain of pull requests where each one builds on the one below
instead of on the base branch.

Worth the trouble when a change is too large to review in one sitting and splits into parts that each
stand up on their own. Not worth it for two commits, and not a way to start work before a design is
agreed.

## Before starting one

A stack is a promise to the reviewer that each layer is reviewable alone. Where the parts do not
divide that way, a stack gives the reviewer the same large change plus the overhead of following it
across several pull requests.

Check that the host and the team support them. Some hosts have no notion of a stack and every layer
after the first shows a diff that includes the ones below, which is the opposite of the intent.
Where that is the case, say so and offer one pull request per part, merged in order, instead.

## The shape

Each layer targets the layer below it, and only the bottom layer targets the base branch. The
description of every layer says which layer it sits on and what it adds, because a reviewer arriving
at layer three needs to know what they are allowed to assume.

Merge from the bottom. After each merge, the layer above needs its base changed to what its own base
just became, which most hosts do automatically and none do reliably enough to skip checking.

## Keeping it in line

When the base branch moves, or a layer below changes in review, everything above it has to be brought
along. That is a rewrite of history already on the remote, so the rule in `shared/finalize-steps.md`
applies in full: the user asks for it, the branches belong to this work, and `--force-with-lease`
rather than `--force`.

Do it from the bottom up, one layer at a time, and stop at the first conflict. A stack rebased in one
sweep leaves the user with several conflicted branches and no clear place to start.

## What to say after each step

Name the layers and where each one now points. A stack that has drifted looks fine from inside any
single pull request, and the reviewer finds out at merge time.

After a merge, say what merged, which layer is now the bottom, and what its base is. That is the
sentence that catches a base nobody retargeted.

## Where to stop

Never merge more than one layer for one yes. Each merge is its own consent and its own readiness
gate, per step 5 of `atk:git` and the consent line in `shared/finalize-steps.md`. Merging a stack
because the bottom was approved is how three unreviewed layers reach the base branch.

Abandoning a stack is an ordinary outcome. Where the parts turn out not to be separable, say so, and
close the upper layers in favour of one pull request rather than keeping a shape nobody can review.
