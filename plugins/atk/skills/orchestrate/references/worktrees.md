# Worktrees, branches and commits

Loaded by `atk:orchestrate` in step 3, and again in step 4 after a job ends. Where a piece's worktree
goes, what it starts from, which branch it carries, and how its changes reach a commit. Commits are
the coordinator's, per Agents that write in `shared/host-capabilities.md`.

## One repository

The run needs the project to be one repository: a profile whose Shape names member repositories, or
a workspace holding none of its own, per `shared/project-profile.md`, is refused in the proposal,
which says that `atk:orchestrate` does not carry work across several repositories yet and runs
nothing. A piece there writes its requirement to the parent's docs root and its code to a member,
and one worktree per piece cannot hold both.

## Before the first worktree, once per run

- **The exclude line the child skills need.** `atk:implement`, `atk:fix` and `atk:verify` add a line
  to the exclude file that `git rev-parse --git-path info/exclude` names, per Progress log in
  `shared/artifact-paths.md`. In a worktree that file sits in the common git directory, outside the
  worktree a job may write, so the coordinator adds those lines itself, once, from its own tree, and
  checks them with `git check-ignore -q`.
- **The inputs that are paths.** A requirement, design, breakdown or plan path given as input has to
  be committed on the base the worktrees start from. One that is untracked or changed in the
  coordinator's tree is named in the proposal and the piece waits: a worktree made from a commit
  would not hold it, and the job would find nothing.

## Per piece

- **Where.** Beside the repository, never inside it: `<repository>/../<repository name>-orchestrate/<piece ID>`.
  A worktree inside the tree is resolved by the profile walk to the main tree's root, so its jobs
  would write outside it, and a teammate's `git add .` would stage it as an embedded repository.
- **From what.** The base the proposal names for the piece: the default branch, or the branch of the
  piece it follows where the proposal serialises it, per `references/proposal.md`.
- **Which branch.** Named by the project's own branch rule, resolved per `shared/finalize-steps.md`,
  never by the piece ID, which names jobs and panes only. A piece whose branch already exists reuses
  it with `git worktree add <path> <branch>`. A branch checked out in another tree is not taken: the
  piece waits, and the proposal says where it is checked out.
- **The profile.** Where `.atk/profile.md` or `.atk/overrides/` is untracked, kept out by the clone's
  exclude file, the coordinator copies them into the worktree before its first job, and checks
  there with `git check-ignore -q` that the copies stay out of git. A job that cannot find the profile
  stops, and a profile found above the worktree would send its writes outside it.
- **The run state.** `<docs root>/derived/orchestrate/.gitignore` holding `*`, written into the
  worktree and checked, per Progress log in `shared/artifact-paths.md`. A worktree whose check fails
  runs no job, and the proposal says why: the coordinator could read nothing the job reported.

## After a job ends

1. **Read what changed**, with `git -C <worktree> status --porcelain`, never a command that prints
   content.
2. **Commit it.** Where the job left a change, run `atk:git --commit` in the worktree: an artifact
   job's artifact as much as a code job's code, since an uncommitted artifact makes the next reading
   of the piece stop at the row for uncommitted work. The job's result file, its trace and any
   untracked profile copy stay unstaged, which their ignore files hold.
3. **Re-read the branch.** `git -C <worktree> symbolic-ref --short HEAD`, since `atk:git` may have
   created the conforming branch before committing. The run state records the branch the commit is
   on, and step 5 reviews that one.
4. **Check the coordinator's own tree.** `git status --porcelain` there, against what it was before
   the job: a change that appeared in the coordinator's tree is a job that wrote outside its
   worktree. It is reported to the person, not committed, and the job is `failed`.

## Removing a worktree

Before a worktree is removed, its job result files and run traces are copied into the coordinator's
`<docs root>/derived/orchestrate/<run-id>/` and `<docs root>/derived/traces/<skill>/`, each after
`git check-ignore -q` passes on the destination, taking the next free suffix where the name is
already there. The progress log keeps pointing at what it recorded, and the copies are what it now
points at.
