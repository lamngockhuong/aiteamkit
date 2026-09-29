---
title: "Fix: an atk:init audit recorded a start command that runs the wrong job, and a persistence line that misstates the repository"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-09-29
updated: 2026-09-29
ticket: none
---

# atk:init and rule 2: six gaps found on one client run

Six fixes from one feedback record written on 2026-09-29 after an `atk:init --audit` run, followed by
an update in the same session, against a client project. The record sits at
`docs/derived/feedback/vi/init-260929.md` in this repository's working copy, which is gitignored.
IDs below are the record's own finding numbers. All six belong to the definition; none is local to
that project.

## 1. Symptom as captured

From the feedback record:

> `1` `--audit` does not compare the approver in the front matter with the role that Roles gives
> the approval of the profile to.

> `2` The "Not committed" persistence block gives one reason only (the repository will not take the
> file), with none for "the team chose not to commit yet".

> `3` Detecting the start command does not ask how the app takes its parameters (job, port, mode).

> `4` "No skill writes `APPROVED` itself" reads two ways when the approver asks the agent to change
> the state.

> `5` No rule for moving from `--audit` into an update in the same session.

> `6` The `Approves` column is only asked for, with no default proposed from the roles the kit
> already defines.

## 2. Root cause

All six are definition gaps; no run went around a stated rule.

- `1`: `skills/init/SKILL.md:37` says the Tech Lead approves the profile, but the `--audit`
  subsection (`:142` before this change) lists sections and persistence, not the front matter.
- `2`: `skills/init/references/profile-template.md:34` offers "this repository will not take the
  file" as the only form for an excluded profile in a repository, and `shared/project-profile.md`
  counted three forms. A team that owns its repository and chose to wait had to write a false line.
- `3`: `skills/init/references/detection.md` How to start the app names where to find the command,
  never the entry point it starts. The earlier run recorded the job name as an argument; the app
  reads it from an environment variable.
- `4`: `shared/team-roles.md:44` "the state still changes by their hand" does not say whether an
  explicit instruction from the approver is their hand.
- `5`: `skills/init/SKILL.md` `--audit` says it changes nothing, and Re-running against an existing
  profile is a separate flow; nothing joins them.
- `6`: `detection.md` What is never detectable lists "Who approves what" as asked only, and points
  at no default, although `docs/flow/project-flow.md` already collects one per role.

## 3. Evidence

Responsible lines quoted, each checked against `867dee2` before the change:

- `profile-template.md:34`: "Not committed: this repository will not take the file". The client
  profile carries that line and an HTML comment giving the real reason, a trial of the kit.
- `detection.md:273-277`: sources for the start command, and "Multiple candidates means a
  question". Nothing about the entry point. The client app reads the job name from an environment
  variable at its entry point, so the recorded command would start the wrong job or fail with
  `Unknown job`.
- `team-roles.md:44`: quoted above. The run wrote `status: APPROVED` on the approver's "approve đi".
- `SKILL.md:142-160`: no mention of front matter, and no transition from audit to update.

Hypotheses: one per finding, each confirmed by the quoted line.

## 4. Why it surfaced now

`2` is the remainder of an earlier fix that split the persistence line into blocks, which covered
the refusing repository and the workspace but not a team's own choice. The rest are broken since
written: the audit run was the first to meet each case.

## 4b. Recorded intent, and the conflict when there is one

`4` contradicted recorded intent: `shared/team-roles.md:44`, `CLAUDE.md` "The team premise", and
commit `94e98bd` ("the state still changes by a person's hand"). The intent check stopped the work
and presented the options. The owner, Lam Ngoc Khuong, decided on 2026-09-29 that users need not be
forced to edit the state by hand and may ask the agent to do it. The change keeps what the premise
protects: the approval is still the approver's act, and a skill never moves the state on its own.

`1` and `5` were questions the record left open and the owner answered on 2026-09-29: `1` is a note,
not drift; `5` is allowed. Whether step 5 runs after such an update was not answered; this change
makes it run, as after any re-run, which is the reading that adds no new rule.

## 5. The change

- `4`: `shared/team-roles.md` rule 2 and the paragraph above it: an instruction from the approver
  named in the front matter, saying to approve this artifact, is their approval, and the agent
  records it as theirs; never inferred from silence, a general "looks good", someone else, or as the
  last step of the drafting run. The same wording carried to `CLAUDE.md` (the premise and the solo
  paragraph), `README.md`, `docs/project-overview-pdr.md` and its mirror, `skills/git/SKILL.md`, and
  `shared/project-overrides.md`, each of which said "by hand".
- `1`, `5`: `skills/init/SKILL.md` `--audit` gains a front-matter note, given beside the
  persistence line, and a stated move into Re-running against an existing profile from its step 2,
  with step 5 after it. `docs/skills-overview.md` and its mirror say the audit may continue.
- `2`: a fourth block in `profile-template.md`, "Not committed yet", naming who chose and until what
  condition; "three" becomes "four" in the template, `skills/init/SKILL.md`, and
  `shared/project-profile.md`, which also says the choice is recorded as a choice, not a refusal.
- `3`: `detection.md` How to start the app: open the entry point and record the command in the form
  it reads its input, citing the file and line.
- `6`: `detection.md` question budget: the team question proposes the `Approves` column from the
  Accepts column of `docs/flow/project-flow.md`; an unconfirmed row is `TBD`, an unfilled role takes
  no default.

Tidy step: Markdown prose, run by hand per `shared/tidy-pass.md`; it changed nothing beyond
rewrapping one `CLAUDE.md` line the edit had left over 100 columns.

## 6. Verified

The em-dash, other-kit and dated-name `grep`s exit 1; the `docs/` mirror `diff` prints nothing;
`skills/init/SKILL.md` is 204 lines and `skills/git/SKILL.md` 248. No statement that approval is
given "by hand" remains in `shared/`, `skills/`, `README.md`, `CLAUDE.md`, or `docs/`, records aside.

## 7. Not verified

No skill was re-run against a project, so the new wording is untested as behaviour: an audit with a
mismatched approver, an audit continued into an update, an init on an app that reads its job from an
environment variable, and an approval given by instruction. No CI gates content in this repository.

## 8. Blast radius

Rule 2 is read by every skill. Skills that open artifacts at `DRAFT` or `IN REVIEW` are unchanged:
none may still set `APPROVED` as the last step of its own run. `atk:tailor` and
`shared/project-overrides.md` still apply an override only at `APPROVED`; the approver may now move
it by instruction.

## 9. Left for later

- A rule-2 check in `atk:help` or an audit that reports an `APPROVED` written without a recorded
  approver instruction; not added.
- The client profile still names an approver other than the Tech Lead; that is the project's to
  settle, not the kit's.
