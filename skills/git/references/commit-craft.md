# Commit craft

Loaded by `atk:git` in step 3. What decides where one commit ends and the next begins, and what the
message carries.

The test behind the whole file: **can this commit be reverted on its own, six months from now, by
somebody who was not here?** Everything below follows from that.

## Where to split

Split when reverting one part would drag an unrelated part with it:

| Split | Because |
|-------|---------|
| A fix and a feature | Reverting the feature should not restore the bug |
| Two scopes that do not call each other | The teams that own them read separate histories |
| A dependency bump and the code using it | The bump often has to be reverted alone |
| A rename or a formatting sweep and a behaviour change | The sweep buries the three lines that matter |
| Generated output and the source it came from | Only when the project commits generated files at all |

Keep as one when the parts do not stand up alone: a function and its test, a migration and the code
that reads the new column, a rename and the call sites it breaks. Splitting those produces a commit
that does not build, and a history that cannot be bisected is worse than a history that is coarse.

File count is a weak signal and is not a rule here. A rename touching forty files is one change; two
files holding a fix and an unrelated refactor are two.

## The formatting sweep

The most common way a small change becomes unrevertable. An editor that formats on save turns three
edited lines into a two hundred line diff, and the fix inside it can no longer be taken back without
taking back the sweep.

Notice it in step 1, before staging: a diff far larger than the work described. Say so, and offer the
sweep as its own commit ahead of the change. Where the project has no formatter agreed, say that too,
because the sweep will come back on the next person's machine in reverse.

## The message

The subject says what changed. The body says why, and names the evidence.

Evidence is what separates a message worth reading from a restatement of the diff. It is the failure
that is gone, the requirement met, the check that ran and what it covered. `shared/layer-verification.md`
is where the calling skill got the honest version of the last one, including what the check does not
prove.

Write for the absent reader, per rule 4 of `shared/team-roles.md`: the ticket linked, the acronym
spelled out once, the file path cited. Somebody reading `git log` in a year has neither the
conversation nor the pull request open.

**Never name the tool that produced the change.** `shared/finalize-steps.md` holds that rule and
holds where it stops: this commit and nothing past it. The pull request body written in step 4 is
outside it.

## Language

The body follows the team's working language from `.atk/profile.md`, per rule 6 of
`shared/team-roles.md`, or `--lang` when it was passed. The type prefix stays as the convention
writes it, since a changelog tool parses it.

## Read what is staged before committing

`git diff --cached --stat`, then the diff itself. Not a formality: the tree is where the last run,
the editor, and the user all left things, and the commit takes whatever is there.

Three things that show up this way and are worth stopping for: a file staged by an earlier run that
the user then reverted in the working tree, a lock file updated by an install nobody meant to commit,
and a debug line left in from the work that has just been verified.

## A hook that writes

A pre-commit hook that only checks leaves the commit as it was read. One that writes does not: a
formatter run with `--write`, a lint step that fixes, a generator that stamps a file, each of them
re-stages content produced after the read, and what lands in the commit is not what step 2 scanned.
The secret scan is the check this matters to most, because it ran over the earlier content.

Find out which kind the project has before the first commit, by reading its hook configuration:
`.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`, or whatever the project's own tooling installs.
A hook that writes is ordinary and is not a reason to skip it or to pass `--no-verify`.

Where one writes, re-run the secret scan of step 2 over what was committed, every time. It is one
pass of the patterns in `references/secret-scan.md` over `git show`, so its cost does not grow with
the diff, and it is the one check whose answer cannot be deferred: step 2 is built on stopping before
the commit exists, and a credential the hook wrote into the commit is already in the history. A hit
here is reported to the user at once, with what it takes to get it out of the history, because the
run can no longer prevent it.

For the reading of the diff itself, do one of two things after each commit and say which:

- re-read what was committed, `git show --stat` then the diff, and confirm what step 2 read still
  holds; or
- name the check that no longer covers what shipped, so the reviewer knows which one to repeat.

The second is the honest answer where the diff is too large to re-read, and it is still better than
the silence that reads as a commit nobody has looked at since the hook rewrote it.
