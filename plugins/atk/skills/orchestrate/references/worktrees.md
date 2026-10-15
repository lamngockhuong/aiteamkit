# Worktrees, branches and commits

Loaded by `atk:orchestrate` in step 3, and again in step 4 after a job ends. Where a piece's worktree
goes, what it starts from, which branch it carries, and how its changes reach a commit. Commits are
the coordinator's, per Agents that write in `shared/host-capabilities.md`.

## One repository

The run needs the project to be one repository: a profile whose Shape names member repositories, or
a workspace holding none of its own, per `shared/project-profile.md`, is refused in the proposal,
which says that `atk:orchestrate` does not carry work across several repositories yet and runs
nothing. A piece there writes its requirement to the parent's docs root and its code to a member,
and one worktree per piece cannot hold both. With no profile, a directory that is not a git
repository is refused the same way, before anything is proposed.

## Before the first worktree, once per run

- **The profile.** Where it is missing, or lacks a section a proposed job needs, `atk:init` has run
  in the session and its output is committed, per step 3 of `SKILL.md`, so every worktree starts from
  a commit that holds it.
- **The exclude line the child skills need.** `atk:implement`, `atk:fix` and `atk:verify` add a line
  to the exclude file that `git rev-parse --git-path info/exclude` names, per Progress log in
  `shared/artifact-paths.md`. In a worktree that file sits in the common git directory, outside the
  worktree a job may write, so the coordinator adds those lines itself, once, from its own tree, and
  checks them with `git check-ignore -q`. A check that fails, a negation in the project's
  `.gitignore` among the causes, is said in the proposal, and the close names every line added.
- **The inputs that are paths.** A requirement, design, breakdown or plan path given as input has to
  be committed on the base the worktrees start from. One that is untracked or changed in the
  coordinator's tree is named in the proposal and the piece waits: a worktree made from a commit
  would not hold it, and the job would find nothing.

## Per piece

- **Where.** Beside the repository, never inside it:
  `<repository>/../<repository name>-orchestrate/<run-id>/<piece ID>`, so a worktree an earlier run
  kept is never in the way. Where that directory cannot be created or already exists, the piece waits
  and the proposal names the path; the run never falls back to a place inside the tree, where the
  profile walk would resolve the main tree's root and a teammate's `git add .` would stage the
  worktree as an embedded repository. The proposal also says that writing beside the repository may
  ask the person for each write, per The cost in `references/proposal.md`.
- **From what.** The base the proposal names for the piece: the default branch, or the branch the
  run state recorded for the piece it follows where the proposal serialises it.
- **Which branch.** Named by the project's own branch rule, resolved per `shared/finalize-steps.md`,
  never by the piece ID, which names jobs and panes only. A piece without a ticket takes the rule's
  form for work with none, and where the rule has none, the slug of its masked request. A piece whose
  branch already exists reuses it with `git worktree add <path> <branch>`. A branch checked out in
  another tree is not taken: the piece waits, and the proposal says where it is checked out.
- **The profile.** Where `.atk/profile.md` or `.atk/overrides/` is untracked, the coordinator copies
  them into the worktree before its first job and checks there with `git check-ignore -q` that the
  copies stay out of git. Where the check fails, because nothing excludes `.atk/`, the piece runs no
  job, and the run says why: a job that cannot find the profile stops, and a copy git can see would
  be committed onto the piece's branch.
- **The run state.** `<docs root>/derived/orchestrate/.gitignore` holding `*`, written into the
  worktree and checked, per Progress log in `shared/artifact-paths.md`. A worktree whose check fails
  runs no job, and the run says why: the coordinator could read nothing the job reported.

## After a job ends

In this order, every step before the commit:

1. **Check the coordinator's own tree.** `git status --porcelain` there, against what it was after
   the coordinator's own last write: a change that appeared since is a job that wrote outside its
   worktree. It is reported to the person, not committed, and every job that ended since the last
   check is held, since at concurrency above one the change cannot be tied to one of them.
2. **Read what changed in the worktree**, with `git -C <worktree> status --porcelain`, never a
   command that prints content, and compare it with the job's `changed:` line.
3. **Check what would run with the coordinator's rights.** A change to a file git or a hook manager
   runs, the hooks directory the repository's configuration names, a hook manager's configuration,
   or the worktree's own `.git` file, is not committed as it stands. The person is shown the masked
   diff of those files, per Masking a diff in `shared/secret-scan.md`, and the commit goes ahead only
   on their word; without it the job is `failed`. A sandboxed job's write must not become the
   coordinator's execution.
4. **Check the artifact's state.** The status in its front matter is one the job's skill gives, never
   past it: a requirement a job wrote at `APPROVED` is reported to the person as found, not committed,
   and the job is `failed`.
5. **Commit it.** Confirm that `git -C <worktree> rev-parse --show-toplevel` is the worktree, then run
   `atk:git --commit` there: an artifact job's artifact as much as a code job's code. The result file,
   the trace, the implementation record and review report under the run state's directory, and any
   copied profile stay unstaged, which their ignore files hold. A commit that fails or is refused, by
   the staged secret scan, the branch-name check or the person, leaves the change in place and puts
   the chain under `needs-person` with the reason.
6. **Re-read the branch.** `git -C <worktree> symbolic-ref --short HEAD`, since `atk:git` may have
   created the conforming branch before committing. The run state records the branch the commit is
   on, and step 5 reviews that one. A branch the run created and left behind, holding no commit of
   its own, is recorded as superseded and offered for deletion at the close.

## Removing a worktree

Before a worktree is removed, everything under its `<docs root>/derived/orchestrate/<run-id>/`, result
files, implementation records and review reports, and its run traces are copied into the
coordinator's same directory and `<docs root>/derived/traces/<skill>/`, each after `git check-ignore -q`
passes on the destination, taking the next free suffix where the name is already there. The progress
log keeps pointing at what it recorded, and the copies are what it now points at.
