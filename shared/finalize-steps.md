# Finalize steps

Shared closing sequence for every `atk` skill that changes code. Referenced from
`skills/<name>/SKILL.md` as `shared/finalize-steps.md`, which is `../../shared/finalize-steps.md`
relative to a skill file.

Cited by `fix`, `implement`, and `verify`. Reaching this file means the change is finished and
verified by whatever the calling skill counts as verification. What is left is putting it where the
team can see it, in the order that keeps it reviewable.

## The consent line

Everything up to and including the commit stays inside the local repository. Everything past it is
visible to other people, and is asked for every time, including when the same user said yes an hour
ago on a different change.

| Action | Ask first |
|--------|-----------|
| Create a branch | no |
| Stage and commit | no |
| Push the branch | yes |
| Open a pull request | yes |
| Comment on the issue | yes |
| Move the ticket or assign a reviewer | yes |

A pull request nobody asked for is the failure this table exists to prevent. It notifies the team,
starts a review clock, and cannot be withdrawn quietly.

## 1. Branch

The naming rule comes from the project, never from this file. Look in this order and say which
source decided it: the conventions document named in the Docs section of `.atk/profile.md`, then
`docs/conventions.md`, then the shape of the recent branch names in `git branch -a`.

Never commit onto the default branch. When the work has already started there, create the branch now
and carry the changes across, which is cheaper than the conversation that follows a direct push.

## 2. Commit

Same source order as the branch rule decides the commit convention. Absent any convention, use
Conventional Commits, because it is the one most trackers and changelog tools already read.

One commit per logical change. The subject says what changed, the body says why and what evidence
stands behind it: the failure removed, or the requirement met. Never name the tool that produced the
change.

Read what is staged before committing. A fix that drags an unrelated formatting sweep into the same
commit cannot be reverted without reverting the sweep, which is how a one line fix becomes
unrevertable. Never stage a credential, a dotenv file, a token, a key, or a dump of real user data.

## 3. Push and pull request

Ask first, both of them, and show what will be pushed. On a yes: push the branch, then open the pull
request with the artifact this skill produced as the body, so the reviewer reads the evidence rather
than the diff alone.

Reviewers come from the Team section of `.atk/profile.md`. Never assign a person the team has not
named, and never request a review from someone because they touched the file last.

## 4. Issue comment and tracker

Follow `shared/ticket-adapters.md`. Show the comment text first, post it on a yes, and link it both
ways: the artifact front matter carries the ticket, the ticket carries the artifact path.

Move the ticket to the status the team's flow calls "in review" or its local equivalent. Do not move
it to done. Done is the approver's word, and this skill is the author.

## What never happens here

- Force push, or any rewrite of history that is already on the remote.
- Merging the pull request, including when the author has the permission to.
- Closing the issue. The person who reported it confirms it is fixed.
- Pushing to the default branch directly.
- Any of the above done quietly because the user is expected to want it.
