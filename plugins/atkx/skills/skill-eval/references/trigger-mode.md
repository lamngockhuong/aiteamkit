# Trigger measurement

Loaded by `atkx:skill-eval` under `--trigger`. It measures, on Claude Code, which skill each of the
evaluated skill's trigger cases actually reaches. `scripts/trigger-run.mjs` does the work and
`scripts/hook-log.mjs` is the hook its child sessions run; this file is the method, the consent, and
the limits a result has to state.

Claude Code only. Codex has not been seen to fire a `PreToolUse` hook for a skill, and Cursor has no
such hook, so on either of them print one line, `Trigger measurement is Claude Code only; skipped.`,
and carry on with the other modes. Verified on Linux; macOS and Windows have not been run yet, and a
report from either says so.

## Why it is measured this way

The obvious way reads zero and looks like a result. A generic harness watches for a call naming a
throwaway copy of the skill; against an installed skill the copy is never chosen, so every case
reads zero, every negative passes, and about half the suite "passes" with nothing measured. A run in
which no session selected any skill is therefore reported as not working, never as a score.

What does work: a `PreToolUse` hook on the `Skill` tool fires when the model selects a skill, and
its payload names the winner in `tool_input.skill`. The name is the diagnosis. A negative that went
to the sibling it belongs to is a boundary holding; a positive lost to another skill says which
description out-argued this one.

Three conditions, each learned by getting it wrong:

- **A seed with real work in it.** In an empty directory the model calls no skill at all. The runner
  runs every session in a temporary copy of the repository that holds the skill: the files git lists,
  tracked and untracked but not ignored, and the repository's own directory, so the branch, the
  commits and any uncommitted change are there. Two files are left out, `.claude/settings.json` and
  `.claude/settings.local.json`, because their hooks and pre-approved permissions would run in every
  session. A link is copied as a link when its target is inside the repository and left out when it
  is not, so no file from outside lands in the seed. The original is only read; its `git status` and
  `git stash list` are the same after the run as before it. A git worktree or submodule, whose
  repository directory another checkout shares, is refused: a copy of it would write into the
  original.
- **Other kits out of the room.** Each session gets a temporary `CLAUDE_CONFIG_DIR` holding only
  credentials, and the skill is loaded explicitly: a plugin skill with `--plugin-dir` from the seed
  copy, together with the plugins it declares as dependencies; a skill under `.claude/skills/` is
  already in the seed; any other skill is copied into the temporary config. MCP servers are switched
  off for the session. Skills an organisation provisions for the account, and Claude Code's built-in
  skills, stay; a team on Claude Code meets them too, so a case lost to one is a real finding.
- **Exact names.** A run counts as a trigger only when the first `tool_input.skill` its session
  logged equals the skill's full name exactly, `<plugin>:<name>` for a plugin skill. A test for the
  name appearing inside the value would count a built-in `code-review` as a hit for `review`.

## Steps

1. **No cases.** When the skill has no `evals/trigger_evals.json`, draft them per `draft-cases.md`
   and stop at the draft. Nothing is measured against cases nobody has read.
2. **Count.** Run `node <this skill>/scripts/trigger-run.mjs <skill-path> --dry-run`, with `--runs`
   and `--model` when the user passed them. It prints the cases, the skipped ones, the sessions it
   would start, `worstCaseSeconds`, the model, how the skill would load, whether a login would be
   copied and how long it has left, and how many leftover directories of a killed earlier run it
   removed. It copies nothing and starts no session. It refuses, as `gate-failed`, a skill whose
   static check found a credential or a security gate failure: such a skill is not run, hooks and
   all, in sessions that hold the user's login.
3. **Ask.** Show the number of sessions, the model, and the worst case from `worstCaseSeconds`. For
   a plugin skill, say that the plugin loads with its own hooks, which run in every session exactly
   as they would after an install, so the mode is for a plugin the user would install anyway. Ask
   once whether to start. Start nothing without a yes.
4. **Run.** On yes, start the same command with `--yes` in place of `--dry-run`, through the host's
   background run, so the run can be watched and is stopped with the session. Do not end the turn
   before its summary has arrived: in a non-interactive session, `claude -p` for one, a turn that
   ends stops the run with it, and a foreground command is cut off long before a worst case of an
   hour. Each child gets the query on standard input, so case text never reaches a command line or a
   shell. Three sessions run at a time.
5. **Read the summary** it prints, and pass the trigger result to `score.mjs`: `{ "status":
   "measured", "score": n }`, `{ "status": "broken" }`, or `{ "status": "not-run" }` for any other
   status, with the reason in the report.

Defaults: 3 runs per case on `sonnet`; `--runs <n>` and `--model <id>` change them and the report
names what was used. There is no ceiling on runs or sessions; the question in step 3 is the limit.
The timeout is at most an hour and at most 16 sessions run at a time.

## What the summary holds

| status | Means | Report |
|--------|-------|--------|
| `measured` | at least one session selected a skill | the figures below |
| `broken` | no session selected any skill | "the measurement did not work", no precision, recall or score |
| `error` | every session failed before measuring, a login or a model name | the error line, and that nothing was measured |
| `gate-failed` | the static check found a credential or a gate failure | that triggers were not measured, and why |
| `no-cases`, `no-observable-cases`, `no-seed`, `no-credentials`, `no-skill` | it stopped before starting anything | its `detail`, as given |

A `measured` summary carries `score`, the share of correct runs among the runs that measured;
`precision` and `recall` over runs, with `recallIsLowerBound` true, since a run that selected nothing
may be a seed that offered nothing to act on; `skipped`; `timedOut`, sessions stopped at the timeout,
which count as having selected nothing; `errors`, sessions that failed, counted in no figure; and
`perCase`, each case with the skill every run selected or `none`.

Report the model, the runs per case, the date, the skipped count, precision, and recall labelled as
a lower bound, then one row per case with what each run selected. A failed case names the skill
that took it.

## Credentials

The runner uses `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY` from the environment when either is
set. Otherwise it copies the user's `.credentials.json` into the temporary config, mode 0600 inside
a 0700 directory, and only when its access token outlives the run's worst case: a session holding an
expired copy would try to refresh it, failing, or spending a refresh token the user's own session
still needs. When it refuses, it says how many minutes are left; any `claude` command refreshes the
login, or `claude setup-token` gives a token to set. On macOS the login sits in the keychain and no
file exists, so the environment token is the route there.

## Containment and cleanup

- The hook denies every `Skill` call, so the selected skill's body never runs, and the runner stops
  a session as soon as its first call is logged. Sessions run with headless defaults and no
  permission flag, and the seed carries none of the repository's own settings, so a tool call that
  would need approval is refused.
- What still runs is the evaluated plugin's own hooks, and those of the plugins it depends on,
  loaded as an install loads them. The static gate reads the skill's own directory, not the plugin's
  `hooks/`, so the refusal does not cover them: the question in step 3 does, and the mode is for a
  plugin the user would install anyway. How the child sessions are isolated from such code is an
  open design question, recorded with this skill's plan.
- A session is stopped at 180 seconds, and each one carries a spending cap of one US dollar, which
  also bounds a session nobody is left to stop.
- On exit, on `SIGINT`, `SIGTERM` and `SIGHUP`, the runner stops every session it started and removes
  its one temporary directory: config, seed and logs.
- A runner killed outright cannot clean up. Its directory stays in the temporary directory, the
  copied credentials with it, until the next run of the runner, `--dry-run` included, which stops
  that run's sessions, removes every such directory of this user whose runner is gone, and reports
  how many.

## Limits a result states

- **Slash cases are skipped.** A query beginning with `/` expands into the prompt and calls no tool,
  so nothing can see it. It is reported as skipped with that reason and counted in no figure.
- **One run is not a measurement.** Selection is not deterministic; a case that failed once deserves
  more runs before anyone edits a description over it.
- **A result belongs to a model and a version.** Name both; a description that wins under one model
  can lose under another.
- **A loss to a provisioned or built-in skill is real** for teams on that account and that harness,
  and says nothing about a harness without them.
