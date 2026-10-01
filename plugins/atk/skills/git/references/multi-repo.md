# A change across several repositories

Loaded by `atk:git` when the project shape in `.atk/profile.md` names member repositories, or when
step 1 finds changes in more than one repository. The contract is the section of the same name in
`shared/finalize-steps.md`; this file is how it is carried out.

Nothing here is new policy. The branch rule, the secret scan, the consent line and the readiness
gate hold exactly as they do for one repository. What changes is that they hold once per repository,
and that the repositories have an order.

## Read the state across all of them

`git status --short` answers for one repository and says nothing about the others, so ask each one.
The Repositories table of the profile gives the paths:

```bash
git -C <path> status --short          # per repository in the table
git -C <path> rev-parse --abbrev-ref HEAD
git submodule status                  # in the parent: a leading + means the pointer has moved
```

Three readings of `git submodule status` worth telling apart. A leading `-` is a submodule nobody
initialised, so nothing in it is part of this change. A leading `+` is a submodule whose checked-out
commit differs from the pointer the parent records, which is what an unfinished change in a
submodule looks like from outside. A clean entry with a dirty working tree inside it does not show
here at all, which is why each path is asked directly as well.

The table is what the profile recorded, not what is on disk now. A member added since the last
`/atk:init` is in neither, so repeat detection's member scan, `git -C <dir> rev-parse --show-toplevel`
one and two levels below the project root, and name any repository found on disk that the table does
not list. A whole repository missing from a multi-repository change is worse than a stale command,
because nothing later in the sequence will look for it.

Say what was found before acting on it: which repositories are dirty, which branch each is on, and
which of them this change is meant to touch. A repository dirty for an unrelated reason is left
alone, the same way an unrelated edit in one repository is left alone.

## The order

Sort the repositories by what depends on what, and run the sequence in that order:

1. The member holding the code, or the side of an interface the other side calls.
2. The repository that points at it: the parent recording a submodule pointer, or the repository
   holding the contract document that describes what the first one now does.

Where nothing depends on anything, which is two members either side of an interface with no pointer
between them, the order is still worth stating in the pull request bodies, because the deploy order
usually follows it.

More than two repositories changes the shape of the list, not the rule. Sort them so that every
repository comes after the ones it depends on, run the sequence in that order, and where one
repository is depended on by several, it goes first and its pull request names all of them. "The
other half" below is two repositories because that is the common case; with three, every body names
every other.

## A submodule pointer

The superproject stores a commit id, not the files. Everything about the order follows from that.

```bash
git -C <submodule path> push <remote> <branch>   # first, and on its own consent
git add <submodule path>                         # stages the pointer, nothing else
git commit                                       # in the parent
```

`<remote>` is the one the Repositories table records for that member, not `origin` by assumption. A
member cloned from a different organisation, or a team that calls its remote `upstream`, breaks a
hardcoded name, and git fails loudly rather than pushing somewhere unintended.

`git add <submodule path>` stages one entry whose content is that commit id. It does not stage the
files inside, and `git add -A` in the parent does not reach into the submodule either. So a run that
committed only in the parent has recorded a pointer and shipped no code.

Before staging a pointer, prove the commit it names is on the submodule's remote:

```bash
git -C <submodule path> fetch <remote>                  # without this the next line answers from a cache
git -C <submodule path> branch -r --contains HEAD
```

The fetch is not optional. `branch -r` reads the remote-tracking refs in the local clone, so without
it the answer is as old as the last fetch: a branch rewritten on the remote since then still shows as
containing the commit, and the check passes on a commit that is no longer there. The proof is only
ever as fresh as the fetch above it.

Nothing returned means the commit is not on any branch of that remote. Stop there: a pointer to a
commit nobody can fetch breaks every fresh clone and every CI run, and it breaks them for other
people rather than for the person who pushed it. The reverse can happen too, a commit reachable on
the remote only through a tag, and it fails safe: the check stops a push it did not need to stop,
which costs a question rather than a broken clone.

A submodule checked out on a detached HEAD, which is how git leaves them by default, needs a branch
before any of this. Create it in the submodule and say so; committing on a detached HEAD leaves work
reachable by nothing once the pointer moves.

## One branch name, one pull request each

Use the same branch name in every repository the change touches. It is the only handle a reviewer
has for finding the other half, and it costs nothing to keep.

Open one pull request per repository, and put three things in each body: what this half does, the
URL of the other half, and which one merges first. The artifact the calling skill produced fills the
body per `references/pr-body.md` as usual; the cross-link is added to it rather than replacing it.

Consent is asked once per repository, for each action past the commit. Naming the repository in the
question is what keeps a yes from spreading: "push `backend`" and "push the parent" are two
questions, and a person may well answer them differently. The name comes from the Repositories table,
where it is unique, per What the Repositories table holds in `shared/project-profile.md`.

The ticket step is the one that does not repeat. One change usually has one ticket, so post one
comment naming every pull request the change opened rather than one comment per repository, per step
5 of `shared/finalize-steps.md`.

## Merging

The readiness gate runs per pull request, and the order holds: the dependent half is not merged
before the one it points at. That rule is about a reference git has to be able to resolve, so it
binds a submodule pointer and nothing else. Where the dependent half is a reference document, the
sync obligation in `shared/spec-docs.md` governs instead and points the other way: the document does
not merge after the behaviour it describes. Where the host can merge the first as soon as its checks pass, say that
the second is still waiting on a person, and do not set both to merge automatically. Two automatic
merges racing is how a pointer lands in the default branch ahead of the commit it names.

After a merge in a submodule, the parent's pointer has to move again where it was not part of the
same pull request. Say so rather than leaving it: a merged submodule change the parent does not
point at is invisible to everyone working from the parent.

**A user who asks to reverse the order.** For a submodule pointer, refuse and say why: git decides
this one, and merging the pointer first publishes a reference nobody can fetch. Everywhere else the
order is the default rather than a law, so say what it costs, a reviewer or a deploy meeting a
contract whose other half has not landed, and carry it out on a yes. The difference is whether the
constraint belongs to git or to the team, and only the first kind survives being asked twice.

**A step that fails partway.** The sequence stops rather than continuing into the half it cannot
reach, and what it says is which repositories are finished, which is not, and what is left owed. A
cross-link that could not be written when the second pull request failed to open is added as soon as
that pull request exists; the link is not optional, so an unfinished sequence is unfinished work
rather than a run that quietly ended.

## What never happens here

- Staging a submodule pointer whose commit is not on the remote.
- Committing inside a submodule that is on a detached HEAD, without creating a branch first.
- Running `git submodule update --remote`, or initialising a submodule, to tidy the tree. Both
  change what the project builds from, and neither is part of carrying a finished change.
- Taking a yes given for one repository as a yes for another.
- Pushing the parent because the member was pushed, or the other way round.
