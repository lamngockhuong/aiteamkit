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
repository is refused the same way, before anything is proposed. So is a repository where
`git rev-parse --verify -q HEAD` names no commit, in step 1, unless the proposal runs `atk:init`,
whose commit would be the first: a profile that is ready but untracked makes no commit, and the
person would approve a run that has nothing to start a worktree from.

## Reading a piece

Step 1 of `SKILL.md` reads a piece's artifacts this way and no other.

- **The guard first.** A worktree a previous run left is read, its names, its front matter, and its
  uncommitted work for row 6, only once Before git runs in a worktree, below, has passed on it.
- **Names.** Listed once, separated by NUL: `git ls-tree -r -z --name-only <ref>`, with `HEAD` as the
  ref in a worktree, and every path and branch a command is given is quoted. A branch name, or an
  artifact path that becomes a job's argument, holding a character outside `[A-Za-z0-9._/-]` is never
  used: it is named to the person as found, and that piece waits. Any other name is only read, quoted.
- **Front matter alone**, per Masking a diff in `shared/secret-scan.md`, only for a path where
  `shared/artifact-paths.md` puts an artifact, never a file rule 9 names, through
  `F='{sub(/\r$/,"")} NR==1{if($0!="---")exit;next} $0=="---"{for(i=1;i<=n;i++)print b[i];exit} {b[++n]=$0} n>=40{exit}'`,
  which prints nothing for a file without a closed front matter and never its body. On a branch or a
  base, `git show "<ref>:<path>" | awk "$F"`. In a worktree, `awk "$F" "<worktree>/<path>"` on the
  working-tree file, so that an approver's edit counts before it is committed. A status edit found
  there that no commit holds yet, on a resume among other times, is first offered to its approver as
  the commit step 4 of `SKILL.md` makes, and nothing that builds on the artifact is proposed until it
  is committed.
- **Rows 1, 4 and 14.** Reads besides front matter, none printing content:
  `git diff --name-only "<base>...<branch>"` for row 4, and `git log -1 --format=%cI "<ref>" -- "<path>"`
  for the dates row 14 compares. Row 1 uses the same `git log` for a named document's last commit
  and `git log --reverse --format=%cI "<ref>" -- "<design path>"`, first line, for the design's first,
  and asks whether the document cites the design or its ticket with
  `git grep -c -F "<design path or ticket>" "<ref>" -- "<path>"`, which prints a count only; in a
  worktree the uncommitted file is counted with `grep -c -F` on it, so a rewrite not yet committed
  is not proposed again. Row 15 hashes a file's content, which this skill does not read, so
  it is left out for a piece and the proposal says so, naming `atk:help` as where it is read.

## Before the first worktree, once per run

- **The profile.** Where it is missing, or lacks a section a proposed job needs, `atk:init` has run
  in the session and its output is committed, per step 3 of `SKILL.md`. `atk:git` never commits onto
  the default branch, per `shared/finalize-steps.md`, so the profile a run reads may sit on another
  branch, from this run or an earlier one. So the base of every worktree of the run is the commit
  whose profile the coordinator read and judged ready: `HEAD` of its own tree, after `atk:init`
  committed or as it found it. The run state records that commit and its branch, `(detached)` where
  `HEAD` names none; where the branch is not the default one, or there is none, the proposal or the
  follow-up record and the close say that the pieces' branches sit on it, with whatever else it
  carries, and that it is pushed first; where it is `(detached)`, that it has no name to push and
  its commits travel with each piece's branch. The default branch is the one `origin/HEAD` names; where it
  names none, the person is asked once, never a name guessed. Where `HEAD` names no commit at this
  point, after `atk:init` or without it, the run is refused before any worktree, since a worktree has
  nothing to start from. A profile that is untracked there is copied per The profile below.
- **The exclude line the child skills need.** `atk:implement`, `atk:fix` and `atk:verify` add a line
  to the exclude file that `git rev-parse --git-path info/exclude` names, per Progress log in
  `shared/artifact-paths.md`. In a worktree that file sits in the common git directory, outside the
  worktree a job may write, so the coordinator adds those lines itself, once, from its own tree, and
  checks them with `git check-ignore -q`. A check that fails, a negation in the project's
  `.gitignore` among the causes, is said in the proposal, and the close names every line added.
- **The inputs that are paths.** A requirement, design, breakdown or plan path given as input has to
  be committed on the ref its piece's worktree starts from, its base or the branch it reuses, checked
  there with `git cat-file -e "<ref>:<path>"` rather than in the coordinator's tree. For a piece that
  starts from a branch that does not exist yet, a predecessor's, the proposal checks the run's base,
  and the check runs again on the actual ref just before its `git worktree add`. One missing there
  is named, in the proposal or to the person, and the piece waits: a worktree made from that ref
  would not hold it, and the job would find nothing. One changed but not committed in the
  coordinator's tree is named too, and the piece waits until it is committed, since the job would
  read the committed text.
- **What the checks after a job compare against.** Once the exclude lines are in, the run state
  records a baseline in its `progress.md`. After each of its own writes there the coordinator keeps
  that file's hash in the session and compares it before reading the baseline back, so a job that
  rewrote the baseline is caught; a resume, whose session holds no such hash, first runs the guard
  of Before git runs in a worktree against the recorded baseline and only then takes it afresh, and
  the proposal says a change made while no session watched is seen only where the guard looks.
  Files the guard reads are hashed as it hashes them, `sha256sum` outside any repository; a
  listing's files with `git hash-object --no-filters`, as step 1 does. A write of the
  coordinator's own to a file, a copied report among them, records anew only the entries of the
  paths it wrote. A command that runs code or writes past the paths it names, a worktree's
  creation, a commit with whatever hooks and filters it fires, an `atk:review` run, whose checks may
  load code the jobs wrote, and an `atk:verify` run, has step 1 of After a job ends run before it and
  after it. The entries that command itself changes, that worktree's listing and its branch tip,
  are taken in without comparison; a difference anywhere else is reported as step 1 says before the
  baseline takes it in. A change left uncommitted in a worktree is recorded as it was left. The
  baseline holds:
  - for the coordinator's tree and each worktree, the listing After a job ends step 1 reads, with
    the hashes of the regular files it lists, ignored ones included and files rule 9 names left out,
    and in the coordinator's tree the hashes of the files under this run's own
    `<docs root>/derived/orchestrate/<run-id>/`, which sit in an ignored directory the listing shows
    as one line, `progress.md` left to the hash above;
  - for the common git directory, the files git loads as configuration, `config`, `config.worktree`
    and every file an `include.path` or `includeIf` in them names, the hashes of `info/exclude` and
    `info/attributes`, the files and hashes of the hooks directory `git rev-parse --git-path hooks`
    resolves, the default one included, and the tips of the run's branches and of its base; a file
    or directory that does not exist is recorded as `absent`, and its appearing is a difference;
  - for each worktree, the `gitdir:` line of its `.git` file, and in the directory that line names,
    the common directory its `commondir` line resolves to, as an absolute path, since git writes
    that line relative to the directory, and the hash of its `config.worktree`, or `absent`.

## Per piece

- **Where.** Beside the repository, never inside it:
  `<repository>/../<repository name>-orchestrate/<run-id>/<piece ID>`, so a worktree an earlier run
  kept is never in the way. Where that directory cannot be created or already exists, the piece waits
  and the proposal names the path; the run never falls back to a place inside the tree, where the
  profile walk would resolve the main tree's root and a teammate's `git add .` would stage the
  worktree as an embedded repository. The proposal also says that writing beside the repository may
  ask the person for each write, per The cost in `references/proposal.md`.
- **From what.** The base the proposal names for the piece: the run's base, the commit whose
  profile was read, above, or, for a piece stacked on another, that piece's recorded branch; a piece
  that waits without being stacked, per Pieces that share files in `references/proposal.md`, starts
  from the run's base. The run
  state records that base in the piece's entry: the commit's sha for the run's base, never the
  `(detached)` label, or the predecessor's recorded branch. It is the `<base>` of every review of
  the piece.
- **Which branch.** Named by the project's own branch rule, resolved per `shared/finalize-steps.md`,
  never by the piece ID, which names jobs and panes only. A piece without a ticket takes the rule's
  form for work with none, and where the rule has none, the slug of its masked request. A piece whose
  branch already exists reuses it with `git worktree add <path> <branch>`. A branch checked out in
  another tree is not taken: the piece waits, and the proposal says where it is checked out. Two
  pieces of one run whose rule gives the same name are never given it twice: the later one takes the
  next free suffix, `-2`, `-3`, and the proposal says so.
- **The profile.** Where `.atk/profile.md` or `.atk/overrides/` is untracked, the coordinator copies
  them into the worktree before its first job and checks there with `git check-ignore -q` that the
  copies stay out of git. Where the check fails, because nothing excludes `.atk/`, the piece runs no
  job, and the run says why: a job that cannot find the profile stops, and a copy git can see would
  be committed onto the piece's branch.
- **The run state.** `<docs root>/derived/orchestrate/.gitignore` holding `*`, written into the
  worktree and checked, per Progress log in `shared/artifact-paths.md`. A worktree whose check fails
  runs no job, and the run says why: the coordinator could read nothing the job reported.

## Before git runs in a worktree

The guard, run before the first `git` command in any worktree of the run: after a job ends, before
step 1 of `SKILL.md` or a Resume reads a worktree a previous run left, and again just before each
skill the coordinator runs there, `atk:git`, `atk:review` and `atk:verify`, whose own `git` commands
nothing pins. It reads with the harness's file read and hashes with `sha256sum` or the platform's
equivalent, run outside any repository, never with `git`:

- the worktree's `.git` is a regular file, not a link, whose `gitdir:` line is the one recorded; a
  worktree the run state holds no line for is not read with `git` at all, and is named to the
  person as found;
- the `commondir` file in the directory that line names resolves to the recorded common directory;
- that directory's `config.worktree`, and the common directory's configuration, `info/` files and
  hooks the baseline holds, hash as recorded.

A difference stops `git` in the repository until the person has answered, since the next command
would load it. A changed `.git` or `commondir` is never accepted on a person's word: it fails the
job that last ran in that worktree, and nothing runs there until the person has put the file back,
which the guard confirms, or stopped the run. A changed configuration file or hook is shown before
it is asked about, so a yes is never given on a hash: a configuration file as its keys, each value
`<redacted: value>` except where the key names a command or a file git runs or loads,
`core.fsmonitor`, `core.hooksPath`, `core.sshCommand`, `filter.*`, `include.*` and `includeIf.*`,
whose value is shown; a hook by its path, for the person to read before answering. Their yes, a
tracking branch or a hook manager they installed, records the file anew; a no fails the jobs held
for it, as step 1 of After a job ends says.

Every `git` command of the coordinator's own in a worktree then runs as
`GIT_COMMON_DIR=<recorded common directory> git --git-dir=<recorded line> --work-tree=<worktree>`,
written `git -C <worktree>` below for short, so a `.git` or `commondir` changed after the guard is
not followed. A skill run in the worktree is not pinned, which is why the guard runs again just
before it; at concurrency above one, a job still running can write in the moment between the two,
which the proposal names among what the check cannot see.

## After a job ends

In this order, every step before the commit, the guard of Before git runs in a worktree first.

The run state marks the job `done` before step 1 and records the commit once step 5 makes it, so a
job found `done` with no commit recorded, after a crash or on a resume, goes through these steps
again from step 1. A piece's last recorded commit is its base until a commit is made, and every
commit the coordinator makes in its worktree, a job's, an approver's edit, an `atk:verify` commit, is
recorded as the piece's last. For a job found `done` with no commit recorded, where `HEAD` has moved
past that commit and `git merge-base --is-ancestor <recorded> HEAD` confirms it descends from it,
steps 1 to 4 read the paths of `<recorded>..HEAD` in place of the working tree, and only then is the
commit shown to the person and, on their word, recorded as the job's, from step 6; a `HEAD` that does
not descend from it, after a reset or an amend, is shown to the person and the job is held. An
`index.lock` in the worktree's git directory, `git -C <worktree> rev-parse --git-path index.lock`,
with no git command running there, is named to the person and removed only on their yes. A job whose
listing in step 2 is empty and whose `changed:` line says none records `no change` as its commit:
steps 3 to 6 do not run, no review follows, and the chain goes on.

1. **Check what lies outside the worktree**, once for every job that ended since the last check,
   against the baseline of Before the first worktree. First, the guard of Before git runs in a
   worktree, for every worktree whose job is not running and for the common directory, before any
   `git` command runs anywhere.
   Then the branch tips and the base, with `git for-each-ref`; then in the coordinator's tree,
   `git status --porcelain -z --untracked-files=all --ignored=matching`, with one
   `git hash-object --no-filters --stdin-paths` over the regular files it lists and the run
   directory's files the baseline holds, so a second write to a file already changed counts too, and
   a deletion by its status entry alone; the same in the worktree of every piece whose job is not
   running, each against its own baseline, which holds a change left uncommitted there, by a job at
   `needs-person` or one that `failed`, from when it was left; and the worktrees of the jobs that
   ended since the last check, listed for step 2 and left out of the comparison. A listed name
   holding a newline, which `--stdin-paths` would split, is named to the person as found and not
   hashed. A difference, or a check that fails, is reported to the person, not committed, and every
   job that ended since the last check is held, since at concurrency above one the change cannot be
   tied to one of them. Where the person says the change was theirs, the baseline records it and
   every held job goes on from step 2; where they say it was not, every held job is `failed` for it,
   unless they name the one responsible, which alone fails while the others go on from step 2. Two
   changes are asked about rather than reported, since a person makes them there: an edit to a
   proposal record of this run, and an edit to the gating artifact a chain at `needs-approval` waits
   on, at the path that state names. Their approver's yes makes it theirs and records that path's
   entry anew, so the same edit is not asked about again; a no makes it a write outside a worktree.
   None of this sees a write outside the repository and its worktrees, inside an ignored directory
   other than this run's own, to the run state's `progress.md` while no session held its hash, in a
   file rule 9 names, inside a nested repository a job created, in a worktree whose job is running,
   or in the moment between the guard and a skill run in a worktree; the proposal says so.
2. **Read what changed in the worktree**, from step 1's listing of it without its ignored entries,
   never a command that prints content. Compare it with the job's `changed:` line: a path one of them
   names and the other does not is shown to the person, and the commit waits for their word; what is
   committed is what `git status` shows. A listed entry that ends in `/` is a directory holding a git
   directory of its own, a nested repository: it is named to the person and the commit waits for
   their word, since nothing under it was compared and `atk:git` would stage it as a gitlink. Compare
   the listing too with the paths each piece running beside it has changed,
   `git diff --name-only "<its base>...<its branch>"` together with its worktree's listing at the
   last check, and handle an overlap as Pieces that share files in `references/proposal.md` says.
   Every name the job created is quoted in any command given it, and a branch it created is held to
   the character rule of Reading a piece.
3. **Check what would run with the coordinator's rights.** A change to a file git or a hook manager
   runs, the hooks directory the repository's configuration names, or a hook manager's
   configuration, is not committed as it stands; the worktree's `.git` file and `config.worktree` are
   the guard's, in Before git runs in a worktree. The person is shown the
   masked diff of those files, per Masking a diff in `shared/secret-scan.md`, and the commit goes
   ahead only on their word; without it the job is `failed`. A sandboxed job's write must not become
   the coordinator's execution. Where a commit would fire a hook or a filter, as Agents that write
   in `shared/host-capabilities.md` names them, found as an executable in the hooks directory
   `git -C <worktree> rev-parse --git-path hooks` resolves, or as a `clean` or `process` driver that
   `git -C <worktree> config --get-regexp '^filter[.].*[.](clean|process)$'` lists from any scope,
   every commit of a job's change is also asked about first, per that section, naming the job and
   that the hook or filter will run files it changed with the coordinator's rights; without a yes
   the change stays uncommitted and the chain is `needs-person` with that reason.
   The same hold covers, by kind rather than by one path, every file an agent CLI reads as its
   settings, hooks, MCP servers, instructions, agents or commands: on Claude Code `.claude/`,
   `.mcp.json` and `CLAUDE.md`, on Cursor and Codex what their documentation names; and a change to
   `.atk/profile.md` or `.atk/overrides/` unless the job's skill is the one that writes that file,
   as `atk:init` and `atk:tailor` do. Such a change is shown masked and never committed without the
   person's yes, since the next agent started there runs with what it says; one that grants a
   permission, an allow rule written by a "don't ask again" answer or by the job itself, is reported
   as a widening and listed at the close.
4. **Check the artifact's state.** The status in its front matter is one the job's skill gives, never
   past it: a requirement a job wrote at `APPROVED` is reported to the person as found, not committed,
   and the job is `failed`. A change to a gating artifact of a kind the job's skill does not write,
   an approved requirement rewritten by a later job among them, is held for the person and not
   committed; a kind it does write, the reference document a contract change owes, an ADR beside a
   design, cases beside a test plan, is checked like its own artifact. The status check reads only a
   status the job changed, compared with `HEAD`: a document already `APPROVED` that the job updated
   without touching its status is not a status the job gave.
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

- **What is copied.** Regular files only. Each path, from the result file's `artifact:`,
  `progress log:` and `trace:` lines or from the directory, is resolved first and must sit under the
  worktree and be no file rule 9 names; a link, or a path that resolves elsewhere, is reported to the
  person and never followed.
- **Review reports.** Each is also copied to `<docs root>/derived/reviews/`, under the name
  `atk:review` gives a report for that range target, so a later review of the same target carries
  its finding identifiers forward, per `skills/review/references/report-format.md`, and
  `atk:convention` finds it. Where `git check-ignore -q` passes on the copy's path, the report is
  copied as it is. Where it fails, because the project tracks that directory, the report is copied
  only when it holds no credential finding, as `skills/review/references/report-format.md` defines
  one, since a tracked copy would put the finding's location in the branch's history before the
  value is rotated. Where the name is already
  taken, no suffix is added, since a suffixed name is not one a later review reads. A report not
  copied stays in the coordinator's run directory, named at the close with the reason, and the
  worktree is not kept for it. The close names each copy, and says beside each review report it
  lists that a review of the branch or its pull request is another target. The records commit at
  the close never stages a copy.
- **A copy that fails** keeps the worktree, listed at the close with what was not copied.
- **The removal.** `git worktree remove "<path>"`, with `--force` only on the person's yes, then
  `git worktree prune`. A removal git refuses, an untracked file left behind among the causes, keeps
  the worktree, listed with what is in it. Once the run's last worktree is gone, its directory
  `<repository>/../<repository name>-orchestrate/<run-id>/` is removed where it is empty.
