# Run trace

What every run of every `atk` skill leaves behind, so that a run nobody watched can still be read
afterwards. Referenced from `skills/<name>/SKILL.md` as `shared/run-trace.md`, which is
`../../shared/run-trace.md` relative to a skill file.

Rule 10 of `shared/team-roles.md` is the obligation, and two lines at the top of every skill's
`## Workflow`, under the override line, are where a run takes it up: they name the trace's path and
send the run here. This file is the shape. The rule alone was tried and was not enough: a run reads
the skill it runs, and opens a shared file only when the skill sends it there. `atk:tailor --feedback`
reads one trace or many, and is the only skill that judges what a trace means. A trace records facts
another reader could check, never an opinion of the run.

A trace is not an artifact of the run. A skill or a mode that writes nothing, `atk:help` in state
mode, `--audit`, `--check`, `--report-only`, still writes its trace, and the line that says it wrote
nothing stays true: the trace is not staged, not offered for a commit, and not named as the run's
output.

A trace is not a progress log either. `atk:fix`, `atk:verify` and `atk:implement` keep writing
theirs, per Progress log in `shared/artifact-paths.md`, because a progress log holds what a resume
needs. The trace sits beside it and holds what an analysis needs: which steps ran, who waited for
whom, where a ceiling stopped the run.

## When it is off

`Run trace: off` in the Docs section of `.atk/profile.md` turns traces off for the project, and the
run writes none and says nothing about it. A missing line and a missing profile both mean on. There
is no flag on any skill that turns one run's trace off: a person who wants one run untraced deletes
that trace, which costs nothing, since it is derived.

A skill of the `Not needed` group of `shared/project-profile.md` reads that one line when the profile
is there, and still never mentions the profile.

An override cannot turn the trace off, per the list of what an override may never remove in
`shared/project-overrides.md`.

## Where it lives

- **Path.** `<docs root>/derived/traces/<skill>/<run-id>.md`, with the docs root resolved per Root in
  `shared/artifact-paths.md`, and `<skill>` the folder name, `implement` rather than `atk:implement`.
- **`<run-id>`.** `<YYMMDD-HHMM>-<slug>`, the time the run started per Naming in
  `shared/artifact-paths.md` and a slug of the subject. The slug is made after the subject went
  through the mask below, so a request holding a token or an internal host never names a file. Two
  runs in one minute take the next free suffix, `-2`, `-3`, before `.md`.
- **Inside the repository, before anything.** Before its first step, the run resolves the real path
  of `<docs root>/derived/traces/`, symbolic links included, and confirms it sits inside the
  directory `git rev-parse --show-toplevel` prints for the repository that holds the docs root.
  Where it does not, a `docs/derived` that is a link out of the repository among the cases, the run
  creates nothing and writes no trace.
- **The ignore file.** Then the run makes sure `<docs root>/derived/traces/.gitignore` exists,
  creating the directory and the file, holding the single line `*`, where the file is missing. Where
  it is present, whatever it holds, the run never writes to it: a project that keeps its own there
  keeps it, and the check below decides. Being inside the directory, `*` outranks a negation in the
  project's own `.gitignore`, `!docs/derived/**` among them, and it ignores itself, so it is never
  staged either. It is a file of the working tree, not of the git directory, which a headless run of
  Claude Code is refused the right to edit.
- **The check, mandatory.** Then `git check-ignore -q <trace path>` on the path of the trace about to
  be written. Only when it passes is the trace created. When it fails, because the docs root is in no
  git repository, as under the `workspace` shape, the project is not a git repository at all, an
  ignore file the project keeps there does not cover the trace, or the harness refused the write, the
  run writes no trace and says so before its first step, in one line: what failed, and that no trace
  will be written. A skill of the `Not needed` group says it without naming the profile.
- **The closing message.** When the run created the ignore file, its closing message names it, since
  it is a new file in the person's working tree.
- **What a run needs.** A file write for the trace and the ignore file, `git` through the shell for
  the two checks, and a delete for retention. An interactive session may ask the person for each
  once; a headless run is given them by the flags it was started with, or writes no trace and says
  which one it lacked.

A trace is never staged, whatever the project does with `docs/derived/`: the ignore file holds that
for a teammate's `git add .` as well as for `atk:git`. It is written as the run goes, line by line,
so a run that dies halfway still leaves what it did.

Git is the only thing the ignore file keeps a trace from. A docs generator, an archive, or an image
build that reads the docs root reads `derived/traces/` too, and publishes the names and corrections
a trace holds unless the project leaves `derived/` out of it. Whether to do so is the project's call;
`Run trace: off` is the other answer.

## The shape

Two header lines, then one line per event, each opening with its time:

```
skill: implement | kit: 0.1.8 | harness: claude-code 2.1.4 | way: subagent | flags: --no-review
subject: #15 | branch: feat/15-export | start: 6dfab99 | profile: present | override: applied
15:32 step 1 plan gate: ran, plan path given
15:33 gate approval: asked Lam Ngoc Khuong, waited 1m 40s, answered
15:41 step 3 verify by layer: lint ran, test skipped (no Test command in the profile)
15:50 review: 1 BLOCKING, 2 SHOULD FIX, round 2 of 2
15:52 stop: review ceiling, escalated to Lam Ngoc Khuong
end: no artifact: escalated, BLOCKING finding open
```

### The header

- `skill`: the folder name.
- `kit`: the `version` of the plugin manifest beside the skill, read before anything is written:
  `../../.claude-plugin/plugin.json` relative to the skill's `SKILL.md`, or the `.cursor-plugin` or
  `.codex-plugin` one in the same directory. `unknown` only when none of them can be read.
- `harness`: the harness and its version, where the harness says it. The version is left out when
  it does not.
- `way`: how the run was started, one of four values.
  - `session`: a person invoked the skill in this conversation, by its slash command or a request
    they typed.
  - `subagent`: the run is an agent another agent spawned through the harness's own agent
    capability, and its task arrived as that agent's prompt.
  - `pane`: the run is a separate agent CLI another agent started, in a terminal pane or as a
    headless command, and its task arrived from that coordinator rather than from a person typing.
  - `unknown`: none of the three can be told from what the run sees. A guess here would be counted
    later as a fact.

  A run whose task arrived with no person in the conversation, a headless command such as
  `claude -p` or `codex exec` among them, is never `session`: it is `pane` when another agent started
  it, and `unknown` when the run cannot tell who did.
- `flags`: the flags passed, each value through the mask below.
- `subject`: written as a progress log writes it, per Progress log in `shared/artifact-paths.md`: a
  ticket key, a pull request number in its host's form, a plan path, or the slug of a description.
- `branch` and `start`: as a progress log writes them, `(detached)` and `(none)` included.
- `profile`: `present` or `absent`. A skill of the `Not needed` group writes no `profile` field.
- `override`: `none`, `applied`, or `not applied` with the status that kept it from applying, per
  `shared/project-overrides.md`.

### The event kinds

Six kinds, and no others, so a pattern across runs can be counted:

| Kind | Line | Written when |
|------|------|--------------|
| `step <n> <name>` | `ran`, `skipped` with the reason, or `failed` with what failed, by kind | each numbered step of the skill's `## Workflow` reaches an outcome |
| `gate <kind>` | who was asked, how long it waited, and `answered`, `unanswered`, or `refused` | the run asks a person for an approval, a confirmation, or an answer it cannot find on disk |
| `stop` | the ceiling or the escalation, and the person named | a ceiling ends a loop, or the run stops and hands a decision to a person |
| `review` | the counts by severity, and the round of the ceiling | a review returns, its own or one it called |
| `corrected by hand` | what a person changed afterwards, in that person's words, through the mask | that person says so in the session. Never inferred from a diff |
| `end` | the artifact path, `no artifact:` and why, or `interrupted` | the run closes, or knows it is stopping before it closes |

`end:` is always the last line. A correction reported after the run closed is written above it. A
trace whose last line is not `end:` is a run that stopped without closing, and `atk:tailor` counts it
as interrupted, the same as `end: interrupted`.

The names of the people who answered a gate stay, because who waited for whom is the point of the
line. The trace stays in the project; what `atk:tailor` does before anything of it leaves the project
is that skill's to say.

## What a trace never holds

- Conversation text, a file's content, a command's output, or a secret value. A step that failed
  says what failed, by kind, `lint failed`, never the failure text.
- A secret value, by rule 9 of `shared/team-roles.md`, and a real person's data or an internal host,
  masked as `<redacted: kind>` by the list in The data a record must not carry in
  `skills/qa/references/test-run.md`, the same list a progress log uses. The mask applies to every
  line: the subject before its slug is made, each flag value, and each `corrected by hand` line.
- A judgement of the run: "went well", "the user seemed unhappy". Only what another reader could
  check against the run.

## Retention

Twenty traces per skill. When a run creates its trace, it lists that skill's directory and removes
the oldest beyond twenty, by `<run-id>` order. The number is fixed, not set in the profile.

- Only files whose names have the `<run-id>.md` shape, and only in that one directory. Anything else
  there is left alone.
- Only a trace that `git check-ignore -q` confirms as ignored is counted or removed. A tracked one,
  force-added by somebody, is left on disk, and the run says in one line that it left it and why.
- `atk:tailor --feedback --runs` never deletes what it read.

## Cost

Measured on 2026-10-14 with Claude Code 2.1.296, model sonnet, each skill run headless in a scratch
git repository with the file tools and `git` through the shell allowed, and once on Codex. Tokens are an estimate, the
bytes divided by four, not a count any harness reported.

| Skill | Run | Trace lines | Trace bytes | Tokens, estimated |
|-------|-----|-------------|-------------|-------------------|
| `atk:help` | state mode, no profile | 8 | 546 | about 140 |
| `atk:plan` | a one-step plan from a description | 10 | 770 | about 190 |
| `atk:implement` | the same change, small gate, `--no-review` | 10 | 960 | about 240 |
| `atk:help` on Codex | state mode, codex-cli 0.162.1, `--sandbox workspace-write` | 8 | 346 | about 90 |

What every traced run pays besides the file it writes:

- Reading this file, 12,397 bytes, about 3,100 tokens by the same estimate. Most of a run's cost is
  here, not in the trace.
- A skill of the `Not needed` group reads the `Run trace` line of the profile when there is one,
  which costs the profile's size once; a run that already reads the profile pays nothing more.
- `git` through the shell: `rev-parse --show-toplevel` and one `check-ignore` before the trace, and
  at retention one listing and a `check-ignore` per trace beyond twenty.
- Permission. In Claude Code's default mode a headless run was refused the first two things a trace
  needs, creating its directory through the shell and writing the ignore file, and wrote no trace,
  saying so. A person in that mode is asked at least twice in a session before the first trace
  exists; `git` reads were not asked about.
