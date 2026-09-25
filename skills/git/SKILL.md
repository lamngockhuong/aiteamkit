---
name: git
description: >
  Carry a finished piece of work into version control: read what changed, stage it after scanning for
  anything that must never be committed, split it into commits that can be reverted one at a time,
  branch and push on consent, open the pull request with the artifact as its body, and merge only
  when a person asks for that merge and the pull request is ready. Also repairs a branch, through
  rebase, conflict resolution and fixup, and drives stacked pull requests.
  Use after a skill or a person has finished and verified work, when a branch has fallen behind or
  a conflict is in the way, or when a stack of dependent pull requests needs moving.
  Triggers on: "commit", "commit this", "push", "open a PR", "pull request", "merge the PR",
  "rebase", "resolve the conflict", "stacked PRs", "branch", "tạo commit", "commit giúp", "đẩy code",
  "mở pull request", "merge PR", "gỡ conflict", "rebase nhánh", "chia commit", "コミット",
  "プルリクエスト", "マージ", "リベース", "コンフリクト解消", "/atk:git".
argument-hint: "[--commit|--pr|--merge <pr>|--rebase|--resolve|--stack] [--lang <code>] [--out <path>]"
---

# Version Control (`atk:git`)

Carries finished work into the repository and no further. This skill is the one road to a commit in
`atk`: the skills that change code and the skills that write a document both hand off here, so a
team gets the same branch rule, the same secret scan, and the same consent line whichever one they
ran.

`shared/finalize-steps.md` is the contract and this skill is its implementation. Where the two
disagree, the contract wins and the disagreement is a defect here.

## Scope

Handles: reading the working tree and the branch it sits on, in every repository the project holds;
staging with a scan for credentials and
private data; splitting a change into commits that revert independently; branching and committing to
the project's own convention; pushing, opening a pull request, and linking the ticket, each on
consent; merging a pull request a person has asked to merge and that passes the readiness gate; and
repairing a branch through rebase, conflict resolution, fixup, and the stacked pull request
lifecycle.

Does NOT handle: deciding whether the work is finished, which belongs to the skill or the person that
did it; writing the artifact that becomes the pull request body, which the calling skill already
wrote; reviewing the change, which is `atk:review`; cutting a release, which is `atk:release`; and
ad-hoc inspection a person can run faster themselves.

## Roles

The author is whoever finished the work. The approver is the reviewer named in the Team section of
`.atk/profile.md`, and the pull request is what they approve. A merge is carried out only for the
person who asks for it, and closing the issue stays with whoever reported it. See
`shared/team-roles.md`.

## Invocation

```bash
/atk:git                      # Read the state, then run the closing sequence as far as consent allows
/atk:git --commit             # Stop after the commit, push nothing
/atk:git --pr                 # Through to the pull request, then stop
/atk:git --merge <pr>         # Merge one pull request that is ready, asked for by number
/atk:git --rebase             # Bring this branch onto its base branch
/atk:git --resolve            # Work through a conflict already in the working tree
/atk:git --stack              # Drive a stack of dependent pull requests
/atk:git --lang vi            # Write the commit body and pull request in Vietnamese
/atk:git --out <path>         # Where to copy the shipping record, when one is kept
```

## Workflow

```
[1. Read the state] -> [2. Stage and scan] -> [3. Commit] -> [4. Push and PR] -> [5. Merge]
```

Before step 1, read `.atk/overrides/git.md` when it exists, per rule 7 of `shared/team-roles.md`.

`--rebase`, `--resolve` and `--stack` leave this line for `references/repair.md` and
`references/stacked.md`, and rejoin it at the step their work lands in.

A change touching more than one repository runs this same line once per repository, in the order
`references/multi-repo.md` sets, under the contract in `shared/finalize-steps.md`.

`--commit` ends the run after step 3, and `--pr` after step 4. A step the flag stopped short of did
not fail and is not missing, so name the flag that ended the run. A reader checking this line
against what ran otherwise goes looking for a step that was never going to happen.

### 1. Read the state

`git status --short`, the current branch, its base, and whether the branch exists on the remote.
Where it does, note `git rev-parse origin/<branch>` before anything refreshes it, then `git fetch`,
then how far the two have moved apart:
`git rev-list --left-right --count HEAD...origin/<branch>`. Existence is not agreement, the pair of
counts is what decides whether step 4 is a push, a rewrite, or neither, and without the fetch both
are as old as whenever this clone last heard from the remote. Keep the noted hash: it is what step 4
leases against, for the reason `references/repair.md` gives.
Read the diff before touching anything: a skill that stages what it has not read is how an unrelated
change reaches a commit nobody meant to make.

Both counts above zero is a diverged branch, and it does not reach step 4 as a plain push. Two
different things produce that state and only one of them may ever be forced: an earlier session that
rebased and never pushed, leaving the remote holding pre-rebase twins of commits that are also here,
or the remote moving on while this work sat locally. `references/repair.md` separates the two and
says what each is owed; take the branch through it whether or not a repair flag was passed. A run
that reads only whether the branch exists arrives at a push the remote refuses, where the obvious
next move is a force nobody has checked is safe.

Behind with nothing ahead is a branch that is merely out of date, with nothing to push yet. Say so
with both counts and stop rather than fast-forwarding it: the user asked for a closing sequence, and
pulling moves the tree under the change they are about to commit. `/atk:git --rebase` is where that
goes. Read the counts again after step 3, because the commit it makes turns this state into the
second kind of divergence above, which is a rebase and never a force.

Say what was found before acting on it, in one block: the repository, the branch, how many files,
and whether the work is code, artifacts, or both. That last one decides which half of
`shared/finalize-steps.md` applies.

Name the repository because it is not always the only one. Where the shape in `.atk/profile.md`
names member repositories, read the state of each of them and of the parent, per
`references/multi-repo.md`, and say which ones this change touches. A member left dirty is the half
of a change nobody notices until the other half is already merged.

A clean exit needs both halves: nothing to commit and nothing committed that has not been carried
where it was going. A clean tree on a branch holding an unpushed commit is work in the middle, not
work finished, and `--pr` reaching that state has a pull request still to open. Measure what is left
to carry, not what is left to stage. Where both halves are empty, say so and stop; that is a clean
exit, not an error.

### 2. Stage and scan

Stage only paths that belong to the work in hand. A repository with unrelated edits already in the
tree keeps them: `git add -A` is never the answer, because the person who left them there did not
ask for them to ship.

Scan what is staged before going further, using the patterns in `references/secret-scan.md`. A hit
stops the run. Show the file and the matching line, say what to do about it, and do not commit any
part of the change until the user has dealt with it; a secret in one commit is in the history
whether or not a later commit removes it.

### 3. Commit

Resolve the convention from the project, never from this file: the conventions document, per Where
the rules live in `shared/review-checklist.md`, then the shape of recent commits in `git log`.
Absent any convention, Conventional Commits. Say which source decided it.

Where the document and the history disagree, the document wins and the disagreement is reported:
name what the document asks for, how many of the recent commits carry it, and leave it there. The
order is not a tie-break, because a written rule the whole history contradicts means one of the two
is stale and neither this skill nor this run knows which. Following the document keeps the new
commits consistent with the rule a reviewer can be pointed at; reporting the conflict is what gets
the stale side fixed by whoever owns it. Watch for the shapes that only look like the rule: a
`(#1234)` that a squash merge appended is the host's, not the team's.

Split the work per `references/commit-craft.md`, which also holds what the body carries. The
subject says what changed; the body says why, and names the evidence: the failure that is gone, the
requirement met, the check that ran. Never name the tool that produced the change.

Never commit onto the default branch, and check the current branch name against the rule just
resolved before committing onto it either. Both cases are step 2 of `shared/finalize-steps.md`:
create the conforming branch now and carry the changes across, rather than finding out at the push
question that four commits sit on a name the project will not take.

A write-mode pre-commit hook changes what the commit holds after step 2 read it.
`references/commit-craft.md` holds which hooks do this and how to find out: the secret scan is re-run
over what was committed either way, and for the rest of the diff the run either re-reads it or names
the check that no longer covers what shipped.

### 4. Push and pull request

Both are asked for, every time, and the request shows what will be pushed. Where the branch
diverged and `references/repair.md` found the remote holding nothing that is not also here, the
request shows which commits stop existing and the evidence that each has a twin in what replaces
them, and the push carries the pinned lease that file specifies rather than a plain `--force`. Where
it found anything else, there is no force to ask for. On a yes, push.

Then the pull request, and `gh pr list --state open --head <branch>` says which case this is before
anything is written. `gh pr view` is the wrong question: it answers with the branch's most relevant
pull request whatever state that one is in, so a merged or closed one reads as open and this run's
evidence lands on a thread nobody will reopen. With none open for the branch, open it with the
artifact the calling skill produced as the body, so the reviewer reads the evidence and not the diff
alone. With one already open, leave the body alone and offer the artifact as a comment instead: the
body is what the reviewer has already read, and replacing it takes back the version they are holding
without telling them. Never open a second pull request for a branch that has one.

Where the project keeps a pull request template, it is the shape of that body and the artifact fills
it, per `references/pr-body.md`, which also holds where the template is found. Passing the artifact
straight to `--body-file` drops the template without saying so, which is the failure that reference
exists to stop. Tick only what this run verified, leave the rest and say which, and show the body
before the pull request is opened.

Reviewers come from the Team section of `.atk/profile.md`. Never assign a person the team has not
named, and never request a review from whoever touched the file last. If the Team section names only
the author, request no review and say so in the pull request; that person still approves by hand,
per rule 2 of `shared/team-roles.md`.

Then the ticket, per `shared/ticket-adapters.md`: show the comment, post it on a yes, link both
ways, and move the ticket to the team's "in review" state. Never to done. With no ticket behind the
change, report the step as `N/A` rather than skipping it quietly, per step 5 of
`shared/finalize-steps.md`.

### 5. Merge

Only for a pull request the user has named, on this run, by number. Consent is asked for that merge
and never inherited from a yes given earlier, including a yes given to the push that created it.

Before merging, run the readiness gate and refuse on any of three: a conflict with the base branch, a
check that is failing, or a review that requested changes. Name which one refused it. A user who is
told only "not ready" goes looking for a reason the skill already has.

Checks still running are not checks passed. Where the host can merge once they pass, say that is
what is being set up and do not call it merged until it is.

After a merge, say what merged and what is now on the base branch. Do not close the issue, do not
delete a branch someone else may hold, and do not start the next piece of work.

## Output

No document of its own. The commits and the pull request are what this skill leaves behind, the same
way `atk:review` leaves its findings on the pull request. Where the team wants a copy of what
shipped, `--out <path>` writes one; it is derived under `shared/artifact-paths.md`, because the pull
request holds the original.

## Ticket

Follow `shared/ticket-adapters.md`. The pull request carries the ticket reference, the ticket carries
the pull request link, and the comment is shown before it is posted. A merge does not close the
ticket, per `shared/finalize-steps.md`.

## Definition of done

- [ ] The diff was read before anything was staged, and unrelated edits were left alone.
- [ ] What is staged was scanned, and a hit stopped the run rather than being reported and committed.
- [ ] The commit convention came from the project, and the source was named. Where the document and
      the history disagreed, the document decided and the conflict was reported.
- [ ] Nothing was committed onto the default branch, and a branch name that does not match the
      project's rule was corrected before the first commit rather than at the push question.
- [ ] Where a pre-commit hook writes, the secret scan was re-run over what was committed, and the
      rest of the diff was re-read or the check that no longer covers it was named.
- [ ] Push, pull request, ticket comment, and merge were each asked for, every time, and once per
      repository where the change touched more than one.
- [ ] No submodule pointer was staged naming a commit that is not on the submodule's remote.
- [ ] The project's pull request template, where it has one, shaped the body, and no checklist item
      was ticked that this run did not verify.
- [ ] No second pull request was opened for a branch that already had one, and an open body was left
      as its reviewer last read it.
- [ ] A step with nothing to run, the ticket step above all, was reported as `N/A` rather than
      passed over in silence.
- [ ] The readiness gate ran before any merge, and a refusal said which of the three caused it.
- [ ] No pull request opened in this run was merged in the same run without a separate yes.
- [ ] How far the branch and its remote had moved apart was read in step 1, after noting what the
      remote held before the fetch, and a diverged branch was separated into the kind that may be
      forced and the kind that may not before any push was offered.
- [ ] No history already on the remote was rewritten outside the cases in `shared/finalize-steps.md`.
- [ ] The issue was not closed and the ticket was not moved to done.
