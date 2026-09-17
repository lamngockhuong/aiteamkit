# Project Overview (PDR)

## What atk is

`atk` (AI Team Kit) is a plugin of 18 skills that cover the software delivery lifecycle of a
**company project team**. It is distributed to Claude Code, Cursor, and OpenAI Codex CLI from one
content tree.

Most skills produce a Markdown artifact that a team can review, approve, and hand to someone who was
not in the conversation: a requirement document, a catch-up brief, an estimate sheet, a technical
design, a task breakdown, a conventions document, an implementation plan, a review, a test plan, a
verification report, a release, an incident postmortem, a retrospective, an onboarding guide, or a
handover.

One writes no prose at all. `atk:init` records what this project is, so the rest of the kit reads
the project's own test command and layer layout instead of guessing at them.

The rest change the code. Implementing a ticket, fixing a bug, and verifying the result are part of
the lifecycle a team runs, so they are part of the kit. What separates them from a solo coding
assistant is where they stop: at the point a role owns the decision, and never before a reviewer has
something to read.

## The problem it addresses

Most AI coding assistance is built for one developer working alone. A company project team has
different failure modes, and they are process failures, not coding failures:

- A request arrives as three sentences in a chat and reaches a developer without acceptance criteria.
- An estimate is a number with no basis, so it cannot be argued with and is never learned from.
- A design decision is made in a thread and is unrecoverable six months later.
- A review mixes a data-loss bug and a naming preference in the same list of comments.
- A release goes out without anyone writing down how to undo it.
- An incident is analysed into a story about a person rather than a gap in the system.
- A person leaves and takes the only knowledge of a fragile deploy step with them.

`atk` writes these steps down in a repeatable form, with the evidence attached and the owner named.

## Goals

1. **Team-shaped by default.** Author and approver are separate. Artifacts carry an approval state.
   Open questions name the person who must answer them.
2. **Evidence over assertion.** Skills read the repository, git history, CI, and the tracker before
   asking, and cite what they find.
3. **Decisions stay with the people who own them.** A skill drafts and compares; scope, priority,
   deadline, pricing, compliance, and go or no-go belong to a role.
4. **Tool-agnostic.** Markdown is the source of truth. A tracker holds a pointer to it.
5. **Readable by the absent reader.** Every artifact assumes its reader missed the meeting.
6. **Multilingual triggers.** English, Vietnamese, and Japanese phrases invoke the same skill.

## Non-goals

- **Operating the team's infrastructure.** `atk` writes the release checklist and the runbook;
  running the deploy, the pipeline, and the cloud account stays with the team's own tooling.
- **Depending on another kit.** Every skill runs on what `atk` ships plus the project itself. No
  skill hands work to a command from a different kit, because a team that installed only this one
  would hit a dead end.
- **Replacing a tracker or a test management tool.** `atk` produces the content; the tool stores it.
- **Deciding for the team.** No skill approves its own output, commits the team, or declares a
  release ready.
- **Performance evaluation.** No skill produces a judgement about an individual, and the
  retrospective explicitly forbids it.
- **Enforcing one methodology.** The vocabulary leans Scrum-like (sprint, story, points) but every
  skill accepts person-days, milestones, and phases instead.

## Audience

Project teams at a software company, typically five to fifteen people, often working with an
external client, frequently across Vietnamese, Japanese, and English. Roles are listed in
`shared/team-roles.md`.

## Success criteria

- A new joiner can execute any skill's output without asking its author what it meant.
- Every artifact answers who owns the open questions.
- A team can adopt one skill at a time without adopting the other seventeen.
