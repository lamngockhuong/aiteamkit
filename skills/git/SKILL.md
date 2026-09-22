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
Read the diff before touching anything: a skill that stages what it has not read is how an unrelated
change reaches a commit nobody meant to make.

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

Split the work per `references/commit-craft.md`, which also holds what the body carries. The
subject says what changed; the body says why, and names the evidence: the failure that is gone, the
requirement met, the check that ran. Never name the tool that produced the change.

Never commit onto the default branch. Where the work has already started there, create the branch
now and carry the changes across, per step 2 of `shared/finalize-steps.md`.

### 4. Push and pull request

Both are asked for, every time, and the request shows what will be pushed. On a yes, push, then open
the pull request with the artifact the calling skill produced as the body, so the reviewer reads the
evidence and not the diff alone.

Where the project keeps a pull request template, it is the shape of that body and the artifact fills
it, per `references/pr-body.md`, which also holds where the template is found. Passing the artifact
straight to `--body-file` drops the template without saying so, which is the failure that reference
exists to stop. Tick only what this run verified, leave the rest and say which, and show the body
before the pull request is opened.

Reviewers come from the Team section of `.atk/profile.md`. Never assign a person the team has not
named, and never request a review from whoever touched the file last.

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
- [ ] The commit convention came from the project, and the source was named.
- [ ] Nothing was committed onto the default branch.
- [ ] Push, pull request, ticket comment, and merge were each asked for, every time, and once per
      repository where the change touched more than one.
- [ ] No submodule pointer was staged naming a commit that is not on the submodule's remote.
- [ ] The project's pull request template, where it has one, shaped the body, and no checklist item
      was ticked that this run did not verify.
- [ ] A step with nothing to run, the ticket step above all, was reported as `N/A` rather than
      passed over in silence.
- [ ] The readiness gate ran before any merge, and a refusal said which of the three caused it.
- [ ] No pull request opened in this run was merged in the same run without a separate yes.
- [ ] No history already on the remote was rewritten outside the cases in `shared/finalize-steps.md`.
- [ ] The issue was not closed and the ticket was not moved to done.
