# Repair

Loaded by `atk:git` for `--rebase` and `--resolve`. Bringing a branch back into a state where it can
be reviewed, without destroying work.

`shared/finalize-steps.md` owns the boundary: rewriting history already on the remote is allowed on a
branch that belongs to this work, after the user asks for that rewrite, and nowhere else. This file
is how it is done inside that boundary.

## Before any rewrite

Three checks, in order, and any one of them stops it:

1. **Whose branch is it.** The default branch, a release branch, and a branch another person is
   working on are all refusals. `git log --format='%an' origin/<branch> | sort -u` says who has
   touched it; anyone but the current author is a conversation, not a flag.
2. **What stops existing.** Print the commits that will be rewritten, by hash and subject, before
   touching them. A user who has not seen that list has not agreed to lose it.
3. **Where the escape hatch is.** Note the current tip: `git rev-parse HEAD`. Say it out loud. The
   reflog holds it for ninety days by default, and the person who needs it will not know that.

A colleague who has pulled the branch loses work no reflog of yours can return. That is the reason
check 1 is first rather than last.

## Rebase onto the base

```bash
git fetch origin
git rebase origin/<base>
```

Stop on the first conflict rather than pressing on. `--continue` after each resolution, `--abort` to
put everything back, which is always available until the rebase finishes and is the right answer
whenever the situation stops being clear.

Prefer a rebase over a merge commit only where the project already does. Recent history says which:
merge commits on the branch mean the team merges, a linear log means it rebases. The project's shape
wins, as it does everywhere else in the kit.

Push a rebased branch with `--force-with-lease`, never plain `--force`. The lease is what refuses
when the remote moved under you, which is exactly the case where a plain force destroys somebody
else's commit.

## Resolving a conflict

A conflict is a question about intent, and a skill answering it alone is guessing at what two people
each meant.

Read both sides and say what each was doing before resolving anything. Where both sides changed the
same behaviour, that is not a merge, it is two people solving one problem twice, and it goes back to
them.

Resolve only what is mechanical: an import list, a lock file the tool can regenerate, two additions
to the same list that do not interact, a formatting collision. Everything else is shown to the user
with both sides and a question.

After resolving, run the check that covers the conflicted area before continuing. A resolution that
compiles is not a resolution that is right, and the moment to find that out is now rather than in
review.

Never resolve by taking one side wholesale because it is shorter, newer, or yours.

## Fixup inside a branch under review

Amending a commit that a reviewer has already read moves the ground under a review in progress. It is
allowed, per the boundary above, and it costs the reviewer their place.

Prefer a new commit while a review is open, and squash on merge if the project squashes. Where the
branch has not been reviewed yet, `git commit --fixup <hash>` then
`git rebase -i --autosquash origin/<base>` keeps the history readable without a manual reorder.

Say what the reviewer will see change, before doing it.

## What this file does not cover

Recovering from a rewrite that already went wrong, a repository with submodules, and anything
touching `filter-branch` or its successors. Those are a person's work with the repository in front of
them, and a skill improvising there is how a bad day becomes a worse one.
