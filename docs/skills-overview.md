# Skills Overview

Twelve skills, one per stage of a team's delivery lifecycle. Each entry says what the skill
produces, when to reach for it, and when not to.

Read this before adopting the kit: every skill works alone, and a team can start with one.

## Where they sit

```
intake -> estimate -> design-doc -> breakdown -> convention -> review -> qa -> release
                                                                                  |
                         onboard / handover (any time)          incident <--------+
                                                                    |
                                                                  retro
```

---

## `atk:intake`

**Produces.** A requirement artifact: the request quoted verbatim, the current behavior cited to
file paths, user stories, `Given / When / Then` acceptance criteria, an out-of-scope list,
assumptions labelled as assumptions, and open questions each naming the person who must answer.

**Use when.** A request arrives as a chat message, a meeting note, a mail, or a one-line ticket, and
the team cannot start from it. Also when two people read the same ticket differently.

**Do not use when.** The requirement is already agreed and written; you want effort numbers
(`atk:estimate`) or a technical approach (`atk:design-doc`).

**The habit that matters.** Criteria such as "works correctly" or "is fast" are rejected rather than
accepted quietly. They become a number, a state, a visible result, or an open question.

---

## `atk:estimate`

**Produces.** A per-item estimate with its basis and confidence, a visible risk buffer, a capacity
calculation showing leave and ceremonies as explicit subtractions, a sprint commitment, and the
overflow list.

**Use when.** Sprint planning, a client asks how long, or scope changed and the numbers need redoing.

**Do not use when.** The items have no acceptance criteria. The skill will mark them `NEEDS INTAKE`
rather than guess, which is the correct answer but not the one you wanted.

**The habit that matters.** Every number carries the basis it came from, usually a comparable past
item found in git history. A number without a basis cannot be argued with or learned from.

---

## `atk:design-doc`

**Produces.** A technical design document: current state cited to `path:line`, decision criteria,
two or more compared options, the chosen data model and API contracts, migration and rollback,
risks, required reviewers, and the matching ADR.

**Use when.** Before implementing anything touching a schema, a public contract, a shared module, or
more than one service.

**Do not use when.** The change is local and reversible. A design document for a two-file fix costs
more than it returns.

**The habit that matters.** One option is a plan, not a design. The document includes the option the
team would have picked by default, and says why it loses.

---

## `atk:breakdown`

**Produces.** Tasks with one deliverable each, an owner, a dependency graph with the critical path
marked, parallel lanes that declare the files they own, and a definition of done per task.

**Use when.** Before a sprint, or whenever work must be split across several people.

**Do not use when.** One person will do the whole thing in a day.

**The habit that matters.** Two parallel lanes may not own the same file, migration sequence, or
shared config. Where they must, the skill serializes them and says so, which is what prevents the
merge conflict nobody planned for.

---

## `atk:convention`

**Produces.** The team's conventions derived from its own code and git history, each rule classified
as `ENFORCED` by tooling, `REVIEWED` by a human, or `ASPIRATIONAL`, plus the tooling that could
enforce the ones currently checked by hand.

**Use when.** There is no written convention, the written one no longer matches the code, or reviews
keep repeating the same comment.

**Do not use when.** You want a style guide imported from elsewhere. This skill documents what the
team does, not what an external guide recommends.

**The habit that matters.** The `ASPIRATIONAL` bucket. A rule nobody enforces is named as such
rather than left to look like policy. The `REVIEWED` rules are written in the record format from
`shared/review-checklist.md`, which is what lets `atk:review` cite them by ID.

---

## `atk:review`

**Produces.** Review findings ranked `BLOCKING`, `SHOULD FIX`, and `NIT`, each citing a line, stating
the failure it causes, and suggesting a concrete change. Optionally posted as inline PR comments.

**Use when.** Before approving a pull request, or when a review needs a second opinion.

**Do not use when.** You want the code fixed rather than reviewed, or you want the requirement itself
questioned (`atk:intake`).

**The habit that matters.** It starts from what the change was supposed to do, not from the diff,
and it separates blocking defects from preferences, which is what makes a review feel fair. A
convention finding quotes the rule and cites its ID, so the author can dispute the rule rather than
the reviewer.

---

## `atk:qa`

**Produces.** A test plan with entry and exit criteria, test cases traced to acceptance criteria,
negative and boundary coverage, and a regression matrix that justifies each entry with a shared
module, table, or endpoint.

**Use when.** A feature reaches QA, a release needs a regression pass, or there are no written cases.

**Do not use when.** You want automated test code written. This produces the plan a person executes
and a developer can automate from.

**The habit that matters.** Traceability runs both ways, so an untested criterion and an untraced
case are both visible.

---

## `atk:release`

**Produces.** A change list from the commit range, internal and client-facing notes kept separate,
migrations with reversibility and downtime stated, a three-phase checklist with an owner per step,
a rollback plan, and recorded sign-offs.

**Use when.** Cutting a version, deploying to staging or production, or writing notes for a client.

**Do not use when.** You want the deployment executed. The pipeline and SRE do that.

**The habit that matters.** The rollback trigger, steps, and the person who may call it are written
before the deploy, not improvised during it.

---

## `atk:incident`

**Produces.** During an incident: a named commander, a severity, and a timestamped timeline.
Afterwards: a root cause supported by evidence with rejected hypotheses listed, the detection gap,
a blameless postmortem, follow-up actions with owners and dates, and the runbook.

**Use when.** An outage is happening, has just ended, or a failure mode keeps recurring.

**Do not use when.** You want the bug found and fixed. That is debugging work; this skill structures
the response around it.

**The habit that matters.** Blameless is enforced mechanically: no sentence may name a person as the
cause, and every follow-up action needs an owner and a date or it does not go in the document.

---

## `atk:retro`

**Produces.** Last retro's actions verified with evidence, sprint data from the tracker, git, and CI,
team statements kept separate from that data, at most three new actions with owners and dates, and
the status report for an internal or client audience.

**Use when.** End of a sprint, milestone, or phase, and when a status report is due.

**Do not use when.** You want an individual assessed. The skill will not produce it.

**The habit that matters.** It opens with whether the last retro's actions happened. A team that
never closes its actions does not need another list of them.

---

## `atk:onboard`

**Produces.** Setup steps derived from the repository and marked `UNVERIFIED` where they could not be
checked, an access list naming who grants what and whether it blocks day one, a code map by owner,
the team's working agreements, and a first week ending in a real merged change.

**Use when.** Someone joins, moves between teams, or returns after a long absence.

**Do not use when.** You want business domain training. That belongs in the project's domain docs.

**The habit that matters.** No credential ever enters the document, only its location and who grants
it; and a setup step that cannot be verified says so instead of pretending.

---

## `atk:handover`

**Produces.** An inventory of in-flight work with its true state rather than its ticket state, the
decisions whose reasons are not in the code, the traps, an access and duty transfer plan, contacts,
open questions, and a validation checklist the receiver signs.

**Use when.** A member leaves or rotates, a phase ends, a vendor hands to a client, or someone is
about to be away for a long time.

**Do not use when.** The receiver is new to the project entirely; run `atk:onboard` first, then this.

**The habit that matters.** The receiver is the approver. A handover is accepted by the person taking
it, never declared complete by the person leaving.

---

## Adopting the kit

Start with the stage that hurts. Three common entry points:

- Requests arrive unclear: `atk:intake`, then `atk:qa` once criteria exist.
- Reviews are inconsistent: `atk:convention`, then `atk:review` against it.
- Knowledge keeps walking out the door: `atk:handover` and `atk:onboard`.

The artifacts compose, because each skill reads the previous artifact when one exists, but none of
them requires it.
