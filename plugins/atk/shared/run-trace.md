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
mode, `--audit`, `--check`, `--report-only`, still writes its trace, and the first traced run in a
project also creates the ignore file of the trace directory, per Where it lives below. Wherever a
skill or a shared file says a run writes nothing, changes nothing, or changes no file but its run
trace, those two files are the exception it means, and nothing else is: neither is staged, offered
for a commit, or named as the run's output.

A trace is not a progress log either. `atk:fix`, `atk:verify`, `atk:implement` and
`atk:orchestrate` keep writing theirs, per Progress log in `shared/artifact-paths.md`, because a progress log holds what a resume
needs. The trace sits beside it and holds what an analysis needs: which steps ran, who waited for
whom, where a ceiling stopped the run.

## When it is off

`Run trace: off` in the Docs section of `.atk/profile.md` turns traces off for the project, and the
run writes none and says nothing about it. A missing line and a missing profile both mean on. There
is no flag on any skill that turns one run's trace off: a person who wants one run untraced deletes
that trace, which costs nothing, since it is derived.

A skill of the `Not needed` group of `shared/project-profile.md` reads that line when the profile is
there, and the Name column of its Team section for the names on `gate` lines, below, and still never
mentions the profile.

An override cannot turn the trace off, per the list of what an override may never remove in
`shared/project-overrides.md`.

## Where it lives

- **Path.** `<docs root>/derived/traces/<skill>/<run-id>.md`, with the docs root resolved per Root in
  `shared/artifact-paths.md`, and `<skill>` the folder name, `implement` rather than `atk:implement`.
  Where the project spans several repositories, the trace is one of the project-level kinds of
  A project that spans several repositories in `shared/artifact-paths.md`, whichever member the
  session started in, and every `git` command below runs where that section says.
- **`<run-id>`.** `<YYMMDD-HHMM>-<slug>`, the time the run started per Naming in
  `shared/artifact-paths.md`, or for the second half of a pair cut at midnight the time of its first
  event, per The event kinds below, and a slug of the subject. The slug is made after the subject
  went through the mask below, so a request holding a token or an internal host never names a file.
  A run whose invocation names no subject, `atk:help` in state mode or `atk:tailor` with no skill
  named, takes its mode as the slug, `state`, or `run` when it has none, and writes `subject: none`.
  Two runs in one minute take the next free suffix, `-2`, `-3`, before `.md`.
- **Inside the repository, before anything.** Before its first step, the run resolves the real path
  of `<docs root>/derived/traces/`, or of the nearest part of it that already exists, symbolic links
  included, and confirms it sits inside the
  directory `git rev-parse --show-toplevel` prints for the repository that holds the docs root.
  Where it does not, a `docs/derived` that is a link out of the repository and a docs root in no
  repository among the cases, the run creates nothing, writes no trace, and says so in the one line
  the check below describes.
- **The ignore file.** Then the run makes sure `<docs root>/derived/traces/.gitignore` exists,
  holding the single line `*`, where the file is missing. It is created with the harness's own file
  write, which makes the directories it needs, never with a shell `mkdir`: in an interactive session
  each kind of action is a permission the person grants, and a shell command and a file write are
  two. Where
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
- **What a run needs.** A file write for the trace and the ignore file, and `git` through the shell
  for the two checks and for `git config user.name` when a gate's name is taken from it, below. An
  interactive session may ask the person for each once. A run lacking the file write or `git` for
  the checks writes no trace and says which one it lacked; a headless run is given them by the flags
  it was started with. A run lacking `user.name` takes the name as given, and still writes the trace.
  No other command is run for the trace, the harness's version command included.

A trace is never staged, whatever the project does with `docs/derived/`: the ignore file holds that
for a teammate's `git add .` as well as for `atk:git`. It is written as the run goes, line by line,
so a run that dies halfway still leaves what it did.

Git is the only thing the ignore file keeps a trace from. A docs generator, an archive, or an image
build that reads the docs root reads `derived/traces/` too, and publishes the names and corrections
a trace holds unless the project leaves `derived/` out of it. Whether to do so is the project's call;
`Run trace: off` is the other answer.

## The shape

Two header lines, then one line per event, each opening with its time, `end` included:

```
skill: implement | kit: 0.1.8 | harness: claude-code 2.1.4 | way: subagent | flags: none
subject: #15 | branch: feat/15-export | start: 6dfab99 | profile: present | override: applied
15:32 step 1 plan gate: ran, plan path given
15:33 gate approval: asked Lam Ngoc Khuong, waited 1m 40s, answered
15:38 step 2 write the code: ran
15:41 step 3 verify by layer: lint ran, test skipped (no Test command in the profile)
15:43 step 4 tidy the change: ran
15:50 review: 1 BLOCKING, 2 SHOULD FIX, round 2 of 2
15:52 stop: review ceiling, escalated to Lam Ngoc Khuong
15:52 step 5 review and fix: failed, review ceiling reached
15:52 end: no artifact: escalated, BLOCKING finding open
```

### The header

- `skill`: the folder name.
- `kit`: the `version` of the plugin manifest beside the skill, read before anything is written:
  `../../.claude-plugin/plugin.json` relative to the skill's `SKILL.md`, or the `.cursor-plugin` or
  `.codex-plugin` one in the same directory. `unknown` only when none of them can be read.
- `harness`: the harness and its version. The version is the one the harness puts in the run's
  context, and is left out when the context names none. No command is run to find it: a version
  command is a shell call outside `git`, a second permission question in an interactive session
  where the trace's file write is meant to be the only one, and the rule a person stores to answer
  it can allow more of that binary than its version.
- `way`: how the run was started, one of five values.
  - `session`: a person invoked the skill in this conversation, by its slash command or a request
    they typed.
  - `subagent`: the run is an agent another agent spawned through the harness's own agent
    capability, and its task arrived as that agent's prompt.
  - `pane`: the run is a separate agent CLI another agent started, in a terminal pane or as a
    headless command, and its task arrived from that coordinator rather than from a person typing.
  - `skill`: another `atk` skill invoked this one in the same session as a step of its own, as
    `atk:fix` and `atk:implement` call `atk:review` in their review loops. The caller writes its own
    trace too, and its `review` line is the one that counts the findings.
  - `unknown`: none of the four can be told from what the run sees. A guess here would be counted
    later as a fact.

  `session` needs a positive sign of a person in the conversation, such as an earlier turn of
  theirs or an answer to a question this run asked. A request that arrives alone, which is what a
  headless command such as `claude -p` or `codex exec` delivers and what a person typing a first
  message looks like too, is `unknown` unless another of the values is known. The reader counts `way`
  as the run's own account, never as a fact about how it was started.

  An agent a skill spawns to do part of that skill's run, the band 1 reviewer of `atk:review`, a
  lens agent of a `--challenge`, an agent that reads wide, is not a run of its own: it writes no
  trace, and the session that spawned it writes the `step` lines from what the agent reports.
- `flags`: the flags passed, each value through the mask below, or `none`.
- `subject`: written as a progress log writes it, per Progress log in `shared/artifact-paths.md`: a
  ticket key, a pull request number in its host's form, a plan path, or the slug of a description,
  or `none` when the invocation names no subject, per `<run-id>` above. A run that takes up an
  artifact an earlier run wrote, a design given to `--answer` among them, writes that artifact's
  path, which is what the earlier run's `end` line names.
- `branch` and `start`: as a progress log writes them, `(detached)` and `(none)` included.
- `profile`: `present` or `absent`. The ten skills of the `Not needed` group write no `profile`
  field: `tailor`, `intake`, `catchup`, `estimate`, `design-doc`, `breakdown`, `incident`, `retro`,
  `onboard` and `handover`.
- `override`: `none`, `applied`, or `not applied` with the status that kept it from applying, per
  `shared/project-overrides.md`.

Every other field is always written, in that order, so the two lines are the same shape in every
trace:

```
skill: <skill> | kit: <version or unknown> | harness: <name and version> | way: <way> | flags: <flags or none>
subject: <subject> | branch: <branch> | start: <short sha> | profile: <present or absent> | override: <state>
```

with ` | profile: ...` left out for the ten skills above, and nothing added.

### The event kinds

Six kinds, and no others, so a pattern across runs can be counted:

| Kind | Line | Written when |
|------|------|--------------|
| `step <n> <name>` | `ran`, `skipped` with the reason, or `failed` with what failed, by kind | each numbered step of the skill's `## Workflow` reaches an outcome. A step that runs only when a flag asks for it, and this invocation's flags never did, is `skipped (not requested)`; a step that runs when the person asks for it, by flag or by request, and nobody did, is the same. Steps a mode takes the place of share one line, `step <first>-<last> <mode> mode:` with an outcome like any step's, as `step 1-5 answer mode: ran` under `atk:design-doc --answer`, or `skipped` or `failed` with the reason where the mode stopped before any edit. A run that stops writes its `stop` or `end` and no line for the steps after it |
| `gate <kind>` | who was asked, how long it waited, and `answered`, `unanswered`, or `refused`; for an answer the run did not ask for, `given in the prompt, no wait`, or `given in the prompt of <way>, no wait` where no person brought it, per the names below | the run asks a person for an approval, a confirmation, or an answer it cannot find on disk, an answer to an open question the run left included, or takes such an answer from the prompt that invoked it |
| `stop` | the ceiling or the escalation, and the person named | a ceiling ends a loop, or the run stops and hands a decision to a person |
| `review` | the counts by severity, and the round of the ceiling, or `closing read` for the read after the last round, per `shared/review-fix-loop.md` | a review returns, its own or one it called |
| `corrected by hand` | what a person changed afterwards, in that person's words, through the mask | that person says so in the session: a change they made to the output, or a thing they told the run it got wrong. Never inferred from a diff, and never an answer the run asked for, which is a `gate` |
| `end` | the artifact path, `no artifact:` and why, or `interrupted` | the run closes, or knows it is stopping before it closes |

Nothing else is written, a note about the trace itself included: that its ignore file was created,
that a check passed, that a log could not be written. What such a line would say goes in the run's
closing message instead. The directory holds the ignore file and the traces, and the run writes no
other file there.

`end` is always the last line, and opens with its time like every other event. A correction
reported after the run closed is written above it. A trace whose last line is not an `end` line is a
run that stopped without closing, and `atk:tailor` counts it as interrupted, the same as an `end`
line that says `interrupted`. Both are read with or without the time before `end`, since traces
written before the time was asked for carry none.

One trace holds one session, or the part of it that falls on one day, so every time in it but a
late `end` line, below, falls on the day its `<run-id>` names. A session is
one conversation with the harness, from the invocation to the close; a conversation resumed after it
closed, or after the harness restarted, is a new one. A session still running at midnight cuts at
its first event after midnight. Before writing that event, it writes
`23:59 end: no artifact: past midnight, continued in <run-id>` as the old trace's last line, and
opens a new trace whose `<run-id>` carries the new day and that event's time, the header repeated
with the same subject and with `start` the commit checked out at the cut, and that first event's
line ending `, continued from <run-id>` with the old trace's name, so a second half whose first was
deleted never reads as a complete short run. A session whose first event after midnight is its
close does not cut: its `end` line goes into the old trace with its own time, the one line of a
trace whose time falls on the next day, since a marker after an artifact path would break the
path. A gate asked before
midnight and answered after it is written in the new trace, with its whole wait. The two traces are
a pair, read as one run and kept or removed together, per Retention below.

A session that takes up a progress log an earlier session left, after a restart or a closed
conversation, writes each step that session finished as
`step <n> <name>: skipped (done in <run-id>)`, naming the earlier trace, so the new trace neither
claims those steps ran again nor reads as having skipped them. Where the earlier session left a
pair, it names the first half; where it left no trace, `skipped (done in an earlier session)`. A run
that takes up a draft an earlier run left with no progress log, as `atk:design-doc` does with a
design at `DRAFT`, writes each step the draft already covers as
`step <n> <name>: skipped (in the draft)`. A later session that takes up the same artifact, to
record the answers to its open questions or to revise it, is a run of its own with a trace of its
own, its subject the artifact's path, per the header above. Answers that arrive in a later session
are that run's `gate` lines, and its waiting time starts when it asks, since what passed between the
sessions is no run's wait.

The names of the people who answered a gate stay, because who waited for whom is the point of the
line. Each is written as the Name column of the Team section of `.atk/profile.md` writes it, so one
person is counted once across skills. Names are compared as whole words in any order, without case,
punctuation or diacritics, `Đ` and `đ` folded to `d` like any marked letter. A given name first loses
an honorific, only where a word is left after it: a leading `anh`, `chị`, `em`, `ông`, `bà`, `Mr`,
`Mrs`, `Ms` or `Dr` standing as a word of its own, or a trailing `san` or `sama` standing as a word
or after a hyphen, or `さん`, `様`, `氏` or `先生` glued to the name or not, so `Hassan` and `Drew`
keep every letter. A Team row's Name never loses one, since `Anh` and `Em` are given names too. A Name with no
words, or one that starts with `TBD`, `N/A`, `-` or `?`, names nobody yet and is left out of the
match. A handle or an email address is compared with the Host identifier column of the same table,
where it has one, without a leading `@` and without case, and never with a Name.

A given name with the same words as a row's Name, or a handle equal to its Host identifier, is an
exact match. A given name whose words all appear among the words of a row's Name, or the other way
round, without the two being the same, is a partial match: `Khuong` against `Lam Ngoc Khuong`,
`Minh` against `Tran Minh`. In a script written without spaces, a given name that is the start of
the Name is a partial match too, `田中` against `田中太郎`. An exact match sets aside every partial
one. Rows that match exactly and hold the same Name are one match, as one person holding two roles
is; two Names that differ only by diacritics, `Trần Thị Hà` and `Trần Thị Hạ`, are two people, and a
given name matching both is a partial match of each. The row's Name is written unasked for an exact
match on one Name. Anything else, a partial match or a choice between Names, is confirmed with the
person, in the turn that collects the answer, or in one more question where the name came from
`user.name` after that turn; the row's Name is written on a yes, and the name as given otherwise. A
run with nobody to ask writes the name as given, since a word two people share is common enough in
the teams this kit serves to settle a question for the wrong one. These questions belong to the gate
they serve and write no line of their own. A profile with no Team section, or one whose table has
no Name column, counts as no table.

When the person running the skill in this conversation answers without giving a name, as one who
types `approve` does, the run takes `git config user.name` and matches it like a given name. A
person the table does not hold, or a run with no table or no profile, is written as that
`user.name` when they are the one running the skill, and otherwise as the name they gave. An email
address or a handle is never written, a `user.name` that is one included: the name as the person
gave it is written instead, or the role the gate asked when nobody gave one. A `user.name` of one
word in a script written with spaces is asked about once per session in an interactive one, and
counted as a handle by a run with nobody to ask; a name in a script written without spaces is never
counted as a handle for being one word.

An answer given in the prompt, or relayed, carries on its `gate` line the name of the person who
brought it into this session. The person who answered is a second name, which a record of the
answer, an `Answered by` cell among them, takes by the same matching. Whether a person brought it is
decided by what the session shows when the line is written, never by the header's `way`: a person
who typed the invocation and answers any later turn, or who answers any turn this run asked, is the
one who relayed it. Where no turn from a person appears, the line names the way the run was started
in that person's place, `given in the prompt of a pane, no wait`, and the name the answer itself is
attributed to, when it is attributed to one. Git never
carries a trace, but anything that reads the docs root does, per the paragraph on what the ignore
file does not keep it from; what `atk:tailor` does before anything of it is sent is that skill's to
say.

## What a trace never holds

- Conversation text, a file's content, a command's output, or a secret value. A step that failed
  says what failed, by kind, `lint failed`, never the failure text. One thing a command prints is
  kept, and nothing else of its output: a person's name on a `gate` line, from `git config
  user.name`.
- A secret value, by rule 9 of `shared/team-roles.md`, and a real person's data or an internal host,
  masked as `<redacted: kind>` by the list in The data a record must not carry in
  `skills/qa/references/test-run.md`, the same list a progress log uses. The mask applies to every
  line: the subject before its slug is made, each flag value, and each `corrected by hand` line.
- A judgement of the run: "went well", "the user seemed unhappy". Only what another reader could
  check against the run.

## Retention

Twenty traces per skill, a fixed number. No run removes a trace on its own, since a delete would be
a second permission question on every run; only `atk:tailor --feedback <skill> --runs` removes the
oldest beyond twenty, by `<run-id>` order, on a yes, and within these limits:

- A pair cut at midnight, per The event kinds above, counts as one trace and is removed with its
  other half or not at all. It takes its place in the order by its first half, and is kept whole
  when either half is within the twenty.
- Only files whose names have the `<run-id>.md` shape, and only in that one directory. Anything else
  there is left alone.
- Only a trace that `git check-ignore -q` confirms as ignored is counted or removed. A tracked one,
  force-added by somebody, is left on disk, and the run says in one line that it left it and why.
- Never the trace of a run still in progress, the one `atk:tailor` is writing among them.

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

- Reading this file, 24,867 bytes, about 6,200 tokens by the same estimate. Most of a run's cost is
  here, not in the trace.
- A skill of the `Not needed` group reads the `Run trace` line and the Team section of the profile
  when there is one, which costs the profile's size once; a run that already reads the profile pays
  nothing more.
- `git` through the shell: `rev-parse --show-toplevel` and one `check-ignore` before the trace, and
  `config user.name` when the person running the skill answers a gate without giving a name, or is
  not in the Team section.
- A question to the person for a partial name match, folded into the gate's own turn where it can
  be, and one per session for a one-word `user.name`.
- Permission. In Claude Code's default mode the first file write of the run, the ignore file in a
  project that has none, is one question to the person, and a person who allows edits for the session
  is asked nothing more; `git` reads are not asked about. Measured headless, where the refusal stops the trace:
  one refusal for the trace, where the shell `mkdir` the file has since dropped cost two.
- `way`. A headless `claude -p` run wrote `session` in every run measured, before a request arriving
  alone was made `unknown`; that rule has not been measured yet.
