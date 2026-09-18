# Project overrides

Shared contract for the instructions a team adds to a skill without touching the kit. Referenced
from `skills/<name>/SKILL.md` as `shared/project-overrides.md`, which is
`../../shared/project-overrides.md` relative to a skill file.

The behaviour is rule 7 of `shared/team-roles.md`, written once. Every `SKILL.md` carries one line at
the top of its `## Workflow` naming its own override file and pointing at that rule, because a shared
file is only read when something makes a skill open it. The rule lives in one place; 19 files hold a
pointer to it, not a copy of it.

## Two different files

This file lives in the kit and describes the shape of a second file that does not:

| File | Lives in | Written by | Read by |
|------|----------|------------|---------|
| `shared/project-overrides.md` | the `atk` kit | the kit maintainer | whoever writes a skill |
| `.atk/overrides/<skill>.md` | the **target project** | the team, by hand or through `atk:tailor` | the skill it is named after |

The kit ships no overrides. A freshly installed `atk` behaves the same in every project, and that is
the gap these files close: a team that needs one more step, one more section in an artifact, or one
more constraint writes it down once and every run picks it up.

## Why `.atk/` and not somewhere else

The reasons are the ones `shared/project-profile.md` gives for the profile, and they hold here for
the same cause: the kit directory is read-only and shared across every project on the machine,
`.claude/` ties a file to one harness out of three, and `docs/` holds prose a person reads rather
than instructions a skill reads.

Two files now live under `.atk/`, and they answer different questions. The profile says what the
project **is**: its build commands, its layers, its tracker, who plays which role. An override says
what a skill should **do** differently here. A build command belongs in the profile even when only
one skill reads it; an instruction belongs in an override even when it names a command.

Overrides are committed. A file that is not committed is a team where each machine runs a different
rule, and nobody can tell why two people got two different reviews.

## One file per skill

```
.atk/
├── profile.md              written by atk:init
└── overrides/
    ├── review.md           read by atk:review
    ├── estimate.md         read by atk:estimate
    └── implement.md        read by atk:implement
```

The file is named after the skill, with no namespace prefix and no slug: `atk:review` reads
`.atk/overrides/review.md` and nothing else. A skill with no file behaves exactly as shipped.

One file rather than several, because the path is then derivable. A reviewer opening a pull request
knows which file to read from the skill name alone, and `atk:tailor --audit` checks one file per
skill rather than discovering how many exist.

## Format

The standard front matter block from `shared/artifact-paths.md`, then at most two sections:

```markdown
---
title: atk:review overrides
status: APPROVED
owner: Tran Van B
approver: Nguyen Thi A
created: 2026-09-18
updated: 2026-09-18
ticket: none
---

## Before

Instructions that apply before the skill's first workflow step.

## After

Instructions that apply after the skill's last workflow step.
```

Both sections are optional; a file with only one of them is normal. Any other heading is ignored,
and so is prose outside the two sections, so a team may keep notes in the file without changing
behaviour.

The two heading names stay in English because the skill matches on them. Everything inside them
follows the team's working language, per rule 6 of `shared/team-roles.md`.

Sections rather than a front matter field, because a team usually wants both halves for one skill
and splitting them across two files would put the same approver line in two places.

There is no way to replace a numbered step. Anchoring an override to a step name means a kit update
that renames the step leaves the override silently dead, and a rule that stops working without
telling anybody is worse than one that was never written. Something that can only be expressed by
replacing a step is a gap in the skill: file it against the kit.

## How a skill loads it

Read the file once at the start of a run. Do not re-read it per step, and do not carry it across
runs. Every skill reads its own override file; only the skills that need project facts also read
`.atk/profile.md`, per the three groups in `shared/project-profile.md`.

Apply `## Before` as context for the first workflow step: it narrows scope, adds constraints, and
names things to establish before starting. Apply `## After` once the last step has produced its
result, before the artifact is written, so anything it adds lands in the artifact rather than in a
follow-up message.

A harness may load the file ahead of the skill instead. When the instructions are already in front
of the skill, use those and do not open the file again.

## What an override cannot change

Two groups. Both exist because a kit that lets a project switch them off is a kit that quietly stops
being about a team.

| # | Cannot be removed | Held by |
|---|-------------------|---------|
| 1 | The approver line and the approval state on an artifact | `shared/team-roles.md` rule 2 |
| 2 | The rule that a skill does not decide what a role owns: scope, priority, pricing, deadline, compliance | `shared/team-roles.md` rule 3 |
| 3 | The rule that an open question names a person, never a team | `shared/team-roles.md` rule 1 |
| 4 | The consent line before anything leaves the local repository | `shared/finalize-steps.md` |
| 5 | The stop after three ruled-out hypotheses | `skills/fix/SKILL.md` |
| 6 | The stop after three verification rounds | `skills/verify/SKILL.md` |
| 7 | The read-only boundary of drift checking | `skills/spec/SKILL.md` |

An override that conflicts with one of these is skipped in the part that conflicts. The rest of the
file still applies, because a single bad paragraph rarely means the whole file is wrong.

Say so in the artifact, in the section where the skipped instruction would have taken effect. The
line below is the shape, not the wording: it goes into an artifact, so it follows the team's working
language per rule 6 of `shared/team-roles.md`, and the instruction it quotes stays in the words the
file used.

> Skipped one instruction from `.atk/overrides/<skill>.md`: `<what it asked for>`. It would have
> `<which of the seven it breaks>`. Raise it with `<the approver named in that file>`.

Never silently. The person who wrote the instruction is the only one who can fix it, and they will
not learn it had no effect from a run that looks normal.

Sharpening a skill is what these files are for. Turning one into a different skill is not: an
override that replaces what a skill does, rather than adding to it, belongs in a kit issue.

## Examples

Adding a check, the most common shape. `.atk/overrides/review.md`:

```markdown
## After

Đọc lại phần findings trước khi kết luận. Mọi chuỗi hiển thị cho người dùng phải đi qua helper i18n,
không hardcode. Vi phạm ghi ở mức SHOULD FIX, gắn nhãn `[i18n]`.
```

Narrowing scope up front. `.atk/overrides/estimate.md`:

```markdown
## Before

Khách chốt phạm vi theo tháng, không theo sprint. Ước lượng theo man-day và quy về tháng làm việc 20
ngày. Buffer rủi ro tối thiểu 15% vì lịch review của khách kéo dài.
```

And one that does not work. `.atk/overrides/release.md`:

```markdown
## After

Nếu mọi hạng mục trong checklist đã xong thì chốt luôn ngày phát hành và ghi vào release note.
```

Choosing the release date is the Project Manager's call, so instruction 2 in the table above applies
and `atk:release` skips this paragraph. The release notes it writes carry the line:

> Skipped one instruction from `.atk/overrides/release.md`: chốt ngày phát hành khi checklist đã
> xong. It would have had the skill decide something the Project Manager owns. Raise it with Nguyen
> Thi A.

The instruction underneath it is worth keeping, though, and it is the reason the skip is reported
rather than the file rejected: whoever wrote it wanted the release date to stop being the thing
everybody waits for. That is a conversation with the PM, which the line above starts.
