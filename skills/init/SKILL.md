---
name: init
description: >
  Set up atk in a project: read the repository to find the build, test, and lint commands, the layer
  layout, the tracker, and the docs root, confirm what was found, ask only for what no file can
  answer, and write the profile every other skill reads.
  Use once when a team first installs atk in a project, and again when the project has moved on from
  what the profile says.
  Triggers on: "init", "atk init", "setup atk", "khởi tạo", "cấu hình dự án", "thiết lập atk",
  "初期設定", "セットアップ", "プロジェクト設定", "get atk working here", "/atk:init".
argument-hint: "[--audit] [--lang <code>] [--out <path>]"
---

# Project Setup (`atk:init`)

Writes `.atk/profile.md`, the file that tells every other skill how this project builds, where its
documents live, and who approves what. It is the first thing to run after installing the kit, and
the reason the other skills can stop guessing.

Most of the profile is already on disk. This skill reads it rather than asking, because a setup
interview that asks what `package.json` already says teaches the team that the kit does not read
their repository.

## Scope

Handles: resolving the project root and whether the project is one repository or several; detecting
project facts from manifests, lock files, CI workflows, and the git remote;
confirming each detected value with the user; interviewing for the few facts no file holds; writing
`.atk/profile.md`; and re-checking an existing profile against the current repository.

Does NOT handle: onboarding a person, which is `atk:onboard` and runs once per joiner rather than
once per project; writing the team's coding conventions, which is `atk:convention`; or installing
anything.

## Roles

Tech Lead owns the layer and command sections and approves the profile. PM owns the tracker and
team sections. The profile opens as `DRAFT` and stays there until the approver named in its front
matter accepts it. See `shared/team-roles.md`.

## Invocation

```bash
/atk:init                    # Detect, confirm, interview, and write or update .atk/profile.md
/atk:init --audit            # Compare an existing profile against the repository, change nothing
/atk:init --lang vi          # Write the profile in Vietnamese
/atk:init --out <path>       # Override the default output path
```

## Workflow

```
[1. Detect] -> [2. Show what was found] -> [3. Ask what is left] -> [4. Write] -> [5. Hand off]
```

Before step 1, read `.atk/overrides/init.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Detect

Resolve the repository boundary first, per Repository shape in `references/detection.md`: which
directory is the project root, which of the four shapes the project has, and which repositories it
holds. Everything below is written from that root, so a run that assumes it records paths that
resolve to nothing.

Then read the repository before asking anything. `references/detection.md` gives the command per
ecosystem; the short version is package manifests and lock files for the package manager and the
scripts, workspace files for the layer layout, the CI workflow for what the project actually runs,
the git remote for the tracker, and the existing docs tree for the docs root.

The CI workflow outranks the script block. A `test` script that nobody runs in CI is a worse answer
than the command CI runs on every pull request.

Detect nothing you cannot cite. Every value carries the file it came from, and that citation goes
into the profile so the next person can check it.

### 2. Show what was found

Present the detected values as a list, grouped by profile section, each with its source file. Ask
the user to correct anything wrong.

Never write a detected value straight to the profile. A script named `test` that opens a watch mode
will hang every later run of `atk:verify`, and the only moment that is cheap to catch is here.

### 3. Ask what is left

Eight turns is the ceiling and four is the usual count. `references/detection.md` holds the budget:
four fixed turns for what no file records, and up to four more for ambiguities detection raised.
The team table is one question covering every role, never one question per role.

A question the repository can answer is a defect in step 1, not a question. If an answer is not
available now, or the budget runs out, write `TBD` plus the name of the person who owes it and move
on; `--audit` picks those up later. Never leave a field blank, and never invent a plausible value.

### 4. Write

Say where the file is going before writing it. The file is committed, which is worth saying because
the team's instinct with a dot directory is to ignore it, and which repository commits it comes from
the shape step 1 resolved, per Projects that span several repositories in
`shared/project-profile.md`: the parent's root under `parent + members`, and no repository at all
under `workspace`, where the root belongs to none. A profile nothing tracks is still worth writing,
and a team told at the commit that nobody will inherit it has been told too late to decide anything
about it.

Then write `.atk/profile.md` from `references/profile-template.md`: seven sections, front matter with
an owner and an approver, `status: DRAFT`. Against a profile that already exists, the subsection after
step 5 says what changes instead. Keep every entry a pointer or a command. A section that grows past
five lines has usually started copying a document instead of linking to it.

Where the user says the repository will not take it, a client repository that accepts no tooling
files being the usual case, follow "When the repository will not take the file" in
`shared/project-profile.md`: the file stays on disk, the exclusion goes in `.git/info/exclude`
rather than in `.gitignore`, and what that costs the rest of the team is said out loud. Never
raise it unasked; a profile nobody inherits is the worse default.

### 5. Hand off

Print which skills are now unblocked, reading the three-group table in `shared/project-profile.md`
rather than composing a list from memory. Then the sections still marked `TBD` with who owes each
one, and who must approve the profile before it stops being a draft.

Under a shape that names members, say which repositories this profile covers, and that a team
cloning one member alone finds no profile and gets the hard stop the Required group gives. Whoever
owns the parent decides what those teams do about it; the two answers are in the same section of
`shared/project-profile.md`.

### Re-running against an existing profile

Detection runs the same way. Before step 2, compare each detected value against the one the profile
records, and present the two groups separately: what still matches, and what has drifted. A drifted
entry shows both values and both sources, the same shape `--audit` reports.

A value that matches what the profile already records is confirmed by that agreement. Ask only about
drift and about fields still marked `TBD`. That is what shrinks the interview: of the four fixed
turns in `references/detection.md`, only the ones the existing file leaves unanswered are still owed.

Update the file in place. Keep `created:`, move `updated:`, and keep the order of the sections so a
diff shows the change and nothing else. Where the rewrite changes what the profile promises, move
`status` back to `IN REVIEW`, per `shared/artifact-paths.md`; a run that only refreshes a source
comment leaves it alone.

### `--audit`

Re-run step 1 against an existing profile and report per section: matches, drifted, or missing. A
drifted entry shows both values and their sources. Change nothing, and do not reorder the file. The
output is a list the Tech Lead can act on, not a patch.

Re-check how the profile is stored alongside the sections, in the same shape and ahead of them. The
persistence line of the profile header names which of the three forms in
`references/profile-template.md` this file was written in; `git ls-files`, `git check-ignore` and
the project shape say which is true today. This one leads the report because a profile that claims
to be inherited and is not hides every other line: the sections under it can all match and still
reach nobody.

With no profile to audit, say so and stop. Do not fall through into the writing flow: a flag that
promises to change nothing must not create a file. Point at `/atk:init` and let the user choose.
Under `--out <path>`, audit the profile at that path rather than the default one.

## Output

Written to `.atk/profile.md` in the target project, not under `docs/`, and not into the kit. See
`shared/project-profile.md` for what each section holds and `shared/artifact-paths.md` for why this
skill is one of the three exceptions to the docs-root rule.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. A profile with `TBD` sections can become one issue listing them
with their owners, when the user asks. Never post the profile itself to a tracker; it is a file in
the repository and the tracker holds a pointer.

## Definition of done

- [ ] The project root and the shape were resolved before anything else was detected, and both were
      said to the user with what they were read from.
- [ ] Every detectable value was detected, not asked.
- [ ] Every detected value was shown with its source file and confirmed by the user before writing.
- [ ] No more than eight questions were asked.
- [ ] Front matter names an owner and an approver, and a newly created profile opens at `status: DRAFT`.
- [ ] Every unanswered field says `TBD` and names the person who owes the answer.
- [ ] No credential, token, or connection string appears in the profile.
- [ ] Before the file was written, the user was told which repository commits it, or that no
      repository will take it and what that costs. Both cases are said first, not after the write.
- [ ] On a re-run, `created:` survived, only drifted and `TBD` fields were asked about, and `status`
      moved only because what the profile promises changed.
- [ ] Exactly one of the template's three persistence blocks survived the write, and it is the one
      matching how the file is actually stored.
- [ ] Under `--audit`, no file was modified, and how the profile is stored was reported ahead of the
      sections.
