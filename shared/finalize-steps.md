# Finalize steps

Shared closing sequence for every `atk` skill that finishes a piece of work. Referenced from
`skills/<name>/SKILL.md` as `shared/finalize-steps.md`, which is `../../shared/finalize-steps.md`
relative to a skill file.

Reaching this file means the work is finished and verified by whatever the calling skill counts as
verification. What is left is the document the work owes, then putting it where the team can see it,
in the order that keeps it reviewable.

`atk:git` is the skill that carries this sequence out, and it is where the commands, the repair
cases, and the stacked pull request lifecycle live. This file stays the contract: what is allowed,
what is asked for, and what never happens. A skill that has finished its work hands off to
`atk:git` rather than running git itself, so there is one road to a commit instead of one per
skill.

Two kinds of work reach here. A change to the code is the first, and everything below is written for
it. The second is a change that produces only an artifact, which every skill that writes a document
into the docs root produces; the section at the end says what is different about it.

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
| Merge a pull request | yes, for that merge, every time |
| Rewrite history already on the remote | yes, and only where the section below allows it |

A pull request nobody asked for is the failure this table exists to prevent. It notifies the team,
starts a review clock, and cannot be withdrawn quietly.

## 1. The reference documents the change owes

A change that alters a public contract carries its reference document in the same pull request, per
the sync obligation in `shared/spec-docs.md`, which also lists the five kinds of change that count.
`atk:spec --sync` does the update; doing it by hand is equally fine, and the obligation is on the
change either way.

This step comes before the branch because the document belongs in the same commit as the code. A
document updated afterwards is a second pull request that reviewers read apart from the change it
describes, which is how the two stop agreeing.

Where it cannot be done now, write the one line the obligation asks for into the pull request body:
what is stale, and who will fix it. Do not skip it silently, and do not skip it because the document
did not exist yet. A contract with no document is the same gap as a contract with a stale one, and
the first pull request to notice is the cheapest place to close it.

## 2. Branch

The naming rule comes from the project, never from this file. Look in this order and say which
source decided it: the conventions document, resolved per Where the rules live in
`shared/review-checklist.md`, then the shape of the recent branch names in `git branch -a`.

Never commit onto the default branch. When the work has already started there, create the branch now
and carry the changes across, which is cheaper than the conversation that follows a direct push.

## 3. Commit

Same source order as the branch rule decides the commit convention. Absent any convention, use
Conventional Commits, because it is the one most trackers and changelog tools already read.

One commit per logical change. The subject says what changed, the body says why and what evidence
stands behind it: the failure removed, or the requirement met. Never name the tool that produced the
change.

That rule stops at the commit. It covers the subject, the body, a trailer, and anything the host
would otherwise append to it, and it covers nothing further: the pull request body of step 4 and the
issue comment of step 5 are outside it. A team whose own policy puts an authorship marker on what it
posts to the host is following that policy, not overruling this one.

Read what is staged before committing. A fix that drags an unrelated formatting sweep into the same
commit cannot be reverted without reverting the sweep, which is how a one line fix becomes
unrevertable. Never stage a credential, a dotenv file, a token, a key, or a dump of real user data.

## 4. Push and pull request

Ask first, both of them, and show what will be pushed. On a yes: push the branch, then open the pull
request with the artifact this skill produced as the body, so the reviewer reads the evidence rather
than the diff alone.

Where the project keeps a pull request template, that template is the shape of the body and the
artifact fills it. A team that wrote a template wrote down what its reviewers need to see, and a
body that quietly replaces it has overruled a decision belonging to that team. Tick only what this
run verified, name what is left open, and keep the artifact linked by its path. Where a template is
found and how each section is filled are `atk:git`'s, in `skills/git/references/pr-body.md`.

Reviewers come from the Team section of `.atk/profile.md`. Never assign a person the team has not
named, and never request a review from someone because they touched the file last.

## 5. Issue comment and tracker

Follow `shared/ticket-adapters.md`. Show the comment text first, post it on a yes, and link it both
ways: the artifact front matter carries the ticket, the ticket carries the artifact path.

Move the ticket to the status the team's flow calls "in review" or its local equivalent. Do not move
it to done. Done is the approver's word, and this skill is the author.

Where there is no ticket, and where the project has no tracker at all, this step is `N/A`. Say that;
do not pass over it in silence. A step that did not run and a step that had nothing to run are
different facts, and only the second one is safe to read as nothing missing. The artifact's front
matter already carries `ticket: none` per `shared/ticket-adapters.md`, and this is the same fact
stated where the reader of the closing sequence will look for it.

## 6. Merge

A merge happens only when a person asks for that merge. The decision is theirs; what the skill
contributes is refusing to carry it out when the pull request is not ready.

Three conditions, and none of them is optional:

- **Consent for this merge.** Asked every time, never inherited from a yes given earlier in the run
  or on another pull request. A pull request opened moments ago is not merged in the same breath.
- **A readiness gate.** Refuse on a conflict, on a check that is failing, and on a review that
  requested changes. Say which of the three refused it, because "not ready" sends the user to look
  for the reason the skill already knows.
- **Never as a side effect.** No merge follows from a push, from a green build, or from the user
  saying yes to something else.

A merge with checks still running is a different thing from a merge with checks passed. Where the
host offers to merge once they pass, say that is what is being set up, and never describe it as
merged until it is.

## A change that spans more than one repository

A project whose shape in `.atk/profile.md` names member repositories can be changed in two of them
at once: the contract in the parent and the code in the member, or two members either side of an
interface. The sequence above then runs once per repository, in an order, and the order is the part
that is not obvious. `skills/git/references/multi-repo.md` holds how; this is what.

**The repository the other one points at goes first.** Branch, commit, push and open its pull
request before the repository that depends on it. A reviewer who opens the dependent half first is
reading it against code that is not there yet.

**A submodule pointer is the sharp case of that.** The superproject records a commit id of the
submodule, so a pointer pushed before the submodule commit reaches its own remote hands everyone a
reference they cannot fetch, and the clone that breaks is somebody else's. Push the submodule, then
commit the pointer. Never stage a pointer naming a commit that exists only locally.

**One branch name in every repository the change touches.** It is what lets a reviewer, or the
person bisecting this in six months, find the other half at all.

**One pull request per repository, cross-linked, each body saying which merges first.** One change
arriving as two pull requests is a fact to carry rather than to hide.

**Consent is per repository.** A yes to push the member is not a yes to push the parent: ask again,
naming the repository. Step 6 holds the same way, per pull request.

**The secret scan of step 3 runs per repository**, over what is staged in that one.

**Step 5 runs once per ticket, not once per repository.** One change usually has one ticket, and a
comment posted from each repository leaves the same ticket carrying two of them and a status moved
twice. Post once, naming every pull request the change opened, and say which repository each belongs
to. Where the repositories genuinely have separate tickets, which happens when a member tracks its
own work, each ticket gets the comment for its own half and a link to the other.

Where `shared/artifact-paths.md` put an artifact in a repository other than the one holding the
code, the pull request carrying the code names the artifact's path and its pull request, and the
artifact names the code's. Nothing else joins them, which is why that link is not optional.

Step 1 is the case that meets this most often. A reference document kept in the parent and the code
that changed its contract cannot be one commit, so the obligation becomes the pair above: the same
branch name, both pull requests open at once, each naming the other, and the document's one merging
no later than the code's. What the obligation never becomes is a promise to update the document
afterwards, which is the second pull request nobody opens.

That is the one place where the merge order above does not decide. The order exists because a commit
has to be fetchable before anything points at it, which is a fact about git and holds for a submodule
pointer. A document points at nothing git can fetch, so what governs it is the sync obligation: the
document does not arrive after the behaviour it describes. Where the two would disagree, say which
one you are following and why, in the pull request bodies, so the reviewer is not left to work it
out.

## What happens only where it is allowed

Rewriting history that is already on the remote is allowed on a branch that belongs to this work and
nowhere else, after the user has asked for that rewrite. The cases are a rebase onto the base branch,
a fixup of commits in the branch under review, and keeping a stacked pull request in line with the
layer below it.

Never on the default branch, on a release branch, or on a branch someone else is working on. Never
to tidy history for its own sake. Before rewriting anything that is on the remote, say what will stop
existing and confirm no one else has the branch checked out; a colleague who pulled it loses work
that no reflog of yours can return.

## What never happens here

- Force push to the default branch, a release branch, or any branch outside this work.
- Rewriting remote history that nobody asked for, including as a tidy-up before a review.
- Closing the issue. The person who reported it confirms it is fixed.
- Pushing to the default branch directly.
- Merging a pull request the user has not asked to merge, on this run, by its number.
- Any of the above done quietly because the user is expected to want it.

## When the work produced only an artifact

A skill that writes a document into the docs root and changes no code reaches here too. Steps 2, 3
and 5 hold as written: the branch, the commit, and the ticket link. Three things differ.

Step 1 does not apply, because a document owes no other document.

Step 4 is a judgement rather than a rule. A requirement document or a design belongs in a pull
request, because its whole purpose is to be reviewed by the role that approves it, and the approval
state in its front matter says as much. A catchup brief or a feedback record written for one reader
does not, and offering one is noise. Ask when it is genuinely unclear; the front matter is the tell,
since an artifact naming an approver is an artifact somebody has to see.

The commit carries the artifact and the approval state it opened with. Do not commit an artifact and
then move it to `APPROVED` in the same breath: the approval is a person's act, and a commit that
contains both leaves no record that anyone read it.
