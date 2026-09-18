# Team roles

Shared vocabulary for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/team-roles.md`, which is `../../shared/team-roles.md` relative to a skill file.

`atk` assumes a company project team, not a solo developer. Work has an author and a separate
reviewer, decisions have an owner who is not always the person typing, and an artifact is read by
someone who was not in the conversation that produced it.

## Roles

| Role | Short | Owns | Typically appears in |
|------|-------|------|----------------------|
| Project Manager | PM | Scope, schedule, budget, client communication | intake, estimate, breakdown, release, retro |
| Bridge SE / Business Analyst | BrSE / BA | Requirement meaning, client language, spec correctness | intake, design-doc, qa |
| Tech Lead / Architect | TL | Technical design, conventions, final review call | design-doc, convention, review, incident |
| Developer | Dev | Implementation, self-check, peer review | breakdown, convention, review, handover |
| QA / QC Engineer | QA | Test plan, test cases, regression, release sign-off | qa, release, incident |
| DevOps / SRE | SRE | Environments, pipeline, deployment, on-call | release, incident, onboard |
| Stakeholder / Client | - | Acceptance, priority, business trade-offs | intake, estimate, release, retro |

A small team maps several roles onto one person. Do not invent a role that the team does not have:
ask who plays it, or mark the artifact `OWNER: TBD` rather than assigning it to nobody.

## Rules every skill follows

1. **Name an owner, not a team.** "The backend team will confirm" is not an owner. A person is.
2. **Separate author from approver.** Any artifact that another role must accept carries an
   explicit approver line and an approval state: `DRAFT`, `IN REVIEW`, `APPROVED`, `SUPERSEDED`.
3. **Do not decide what a role owns.** A skill drafts, gathers evidence, and lists options. Scope,
   priority, pricing, deadline, and compliance calls belong to the role that owns them. Record the
   decision and who made it; never record a decision the team has not actually made.
4. **Write for the absent reader.** Assume the reader missed the meeting. Spell out the acronym
   once, link the ticket, cite the file path.
5. **Ask only what the repository cannot answer.** Scan code, docs, git history, and tickets first.
   Interview for judgment, context, and agreements, not for facts already on disk.
6. **Language.** Artifacts follow the team's working language. Default to the language the user
   writes in; keep code identifiers, commands, and file paths in their original form.
7. **Honour the project's overrides.** Read `.atk/overrides/<this skill>.md` when it exists: `## Before`
   applies to the first workflow step, `## After` to the result before the artifact is written. Skip
   any instruction that breaks rules 1 to 3, or one of the four safety limits a skill owes its team,
   and say in the artifact what was skipped and why. Format and the full list:
   `shared/project-overrides.md`.
