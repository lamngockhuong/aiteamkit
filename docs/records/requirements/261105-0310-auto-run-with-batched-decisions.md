---
title: "Requirement: an unattended run carries a task past its gates on role-agent recommendations, provisionally, and hands every such gate to a person in one decision queue at the end"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-05
updated: 2026-11-05
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-05, by instruction to the agent.

# Requirement: an unattended run carries a task past its gates on role-agent recommendations, provisionally, and hands every such gate to a person in one decision queue at the end

The request was written in Vietnamese and this requirement in English, the repository's working
language. One maintainer holds every role in this repository, so the owner and the approver are the
same person, per `.atk/profile.md`. The request as first put would have had agents decide in the
name of a Team Lead, Tech Lead or PM; the maintainer chose, in the interview, the form below in
which those agents only recommend and a person still decides. Section 1 quotes the original;
sections 3 to 6 describe the chosen form.

## 1. Original request

From the session of 2026-11-05, as put to `atk:intake`:

> Tôi muốn bộ skill có mode chạy auto, giao một task và tự động hoàn thành thì có ổn không?
> Những gì cần người quyết thì sẽ tạo một agent nhân danh Team Lead, Tech Lead, PM,...để đánh giá
> độc lập từ đề xuất và chọn thay con người
> Sau khi chạy xong thì sẽ report đầy đủ những gì agent tự quyết khi dừng ở cổng nào đó. Bạn thấy sao?

Rendering: "I want the kit to have an auto mode: hand it a task and it finishes on its own. Is that
all right? Where a person has to decide, it would create an agent acting in the name of the Team
Lead, Tech Lead, PM and so on, to assess the proposal independently and choose in place of the
person. When the run ends, it reports in full everything the agents decided on their own at each
gate it stopped at. What do you think?"

The interview question and its answer, the same session:

> Mode auto sẽ xử lý cổng cần người quyết theo hướng nào?
> Answer: "A: duyệt gộp cuối" (role-agents only recommend; the run continues provisionally, with no
> push, merge or ticket; at the end a decision queue lets a person decide each gate).

## 2. Context and current behavior

The question asked whether the request as first put was sound. The answer given in the session was
that it is not, for the three rules below, and that the need behind it, a long run stalling at
every gate while nobody is watching, is real and can be met without breaking them.

What the request as first put conflicts with:

- An approval is the approver's act, and no skill moves the state on its own:
  `plugins/atk/shared/team-roles.md:41`, rule 2.
- A skill never records a decision the team has not made: `plugins/atk/shared/team-roles.md:58`,
  rule 3. A record saying a Tech Lead chose an option that no person chose is such a record.
- A gate is relayed, never answered, by a skill that coordinates agents:
  `plugins/atk/shared/host-capabilities.md:413`.
- `CLAUDE.md`, section "The team premise", names a change that makes a skill decide on the team's
  behalf a regression.

What exists today that the chosen form builds on:

- `atk:orchestrate` runs `atk` jobs in worktrees and relays each gate to the person it names; a gate
  for a person not in the session parks its chain: `plugins/atk/skills/orchestrate/SKILL.md:163`.
  It already pushes, merges and touches no ticket on its own: `plugins/atk/skills/orchestrate/SKILL.md:38`.
- Agents that read a draft cold and return objections, one per role as a lens:
  `plugins/atk/shared/independent-challenge.md`, applied per role in
  `plugins/atk/skills/design-doc/references/role-challenge.md`.
- The consent line every action past the commit has to cross: `plugins/atk/shared/finalize-steps.md:22`.
- The run trace's `gate` event, which records who was asked, the wait, and the answer:
  `plugins/atk/shared/run-trace.md`, section "The event kinds".

What is missing: no run can continue past a gate while its person is away. A parked chain waits;
nothing is built meanwhile on a provisional answer that the person could later accept or reject.

## 3. User stories and acceptance criteria

### Story 1: Hand over a task and walk away

As a developer or Tech Lead, I want to start one run on a task and leave it, so that the work that
does not depend on a person's decision gets done while I am away.

- **AC 1.1** Given an unattended run is started on a task, when a gate of an `atk` skill is reached
  that is eligible for provisional continuation (per question 2), then the run records the gate and
  continues without waiting for a person.
- **AC 1.2** Given an unattended run, when it reaches a gate that is not eligible, then the chain
  that hit it stops at that gate and the other chains continue.
- **AC 1.3** Given an unattended run, when it ends for any reason, then no artifact it wrote has a
  `status` of `APPROVED` that it did not have at the start.
- **AC 1.4** Given an unattended run, when it ends, then nothing it did has crossed the consent line
  of `plugins/atk/shared/finalize-steps.md`: no push, no pull request, no merge, no ticket created
  or commented on, no release, no message to anyone.

### Story 2: Independent recommendations at a gate

As the person who will decide later, I want each gate to come with recommendations from agents
reading as the roles that own the decision, so that I decide from evidence rather than from the
author's reasoning alone.

- **AC 2.1** Given an eligible gate, when the run reaches it, then one agent per owning role reads
  the options cold, per What each agent gets in `plugins/atk/shared/independent-challenge.md`, and
  returns a recommended option with its reasons and the failure it guards against.
- **AC 2.2** Given the role-agents disagree, when the run continues, then it records the
  disagreement and continues on the option chosen by the rule question 3 settles, never on an option
  picked without a recorded rule.
- **AC 2.3** Given any record the run writes, when a reader reads it, then a role-agent is named as
  an agent with the role it read as a lens (for example "Tech Lead lens agent"), never as the person
  who holds the role, and its answer is labelled a recommendation, never a decision or an approval.

### Story 3: One decision queue at the end

As the person who returns, I want every gate the run passed provisionally in one place, so that I
can accept or reject each one and know what each rejection costs.

- **AC 3.1** Given an unattended run has ended, when the person opens its decision queue, then each
  provisionally passed gate has one entry: the skill and step, the question verbatim, the options,
  each role-agent's recommendation and reasons, the option the run continued on, the files and
  commits built on it, and what is redone if it is rejected.
- **AC 3.2** Given an entry in the queue, when the named person accepts it, then the gate is recorded
  as answered by that person, with the time, and the run trace's `gate` line names that person.
- **AC 3.3** Given an entry in the queue, when the named person rejects it, then the work built on
  it is identified by the entry's file and commit list and is not carried forward until redone on
  the person's option (per question 4).
- **AC 3.4** Given an entry nobody has answered, when anyone reads the run's output, then the entry
  reads as unanswered and the work built on it is marked provisional.

## 4. Out of scope

- An agent deciding in place of a person, or appearing in any record as the person who holds a
  role. This was the request as first put; the maintainer chose against it in the interview.
- A pre-approved delegation file that lets an agent choose at some kinds of gate (option B in the
  session). Considered and not chosen now; a later request may add it.
- Any action past the consent line during the run, at any gate, eligible or not.
- Moving any artifact to `APPROVED` during the run.
- Changing what any skill's gate asks. Only how a gate is waited for changes.
- A mode on `atk:implement` or a new skill, per question 1.

## 5. Assumptions

- **Assumption:** provisional work lives on worktree branches that are not pushed, so rejecting a
  decision costs local rework only.
- **Assumption:** the role-agents are read-only (`atk:read-only-reviewer`), like the lens agents of
  `--challenge`, and the model they run on is taken from the profile per
  `plugins/atk/shared/host-capabilities.md`.

## 6. Open questions

On 2026-11-05 the maintainer asked for a proposal on each question, and then accepted all six as
proposed, in the same session ("chấp nhận"). Every question below is answered; the table keeps them
so a reader can see what was asked and who answered it.

| # | Question | Blocks | Must answer |
|---|----------|--------|-------------|
| 1 | Where does the mode live: a flag on `atk:orchestrate`, a flag on `atk:implement`, or a new skill? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed):** a flag on `atk:orchestrate`, `--unattended`. A task carried to the end crosses several skills (`design-doc`, `plan`, `implement`, `review`), and the gates that matter most sit outside `implement`, whose large plan gate itself hands the work to `atk:design-doc` (`plugins/atk/skills/implement/SKILL.md:80`). `orchestrate` already owns what the mode needs: worktrees, so provisional work is a branch a rejection discards; the gate relay, the one rule that changes (`plugins/atk/shared/host-capabilities.md:413`); parked chains; the proposal record; and cleanup. On `implement` the provisional work would land in the person's own branch, and the role-agents would be built a second time. A flag keeps the count of 25. The proposal record's own approval at the start is never provisional: it is the person's act of handing the task over. | Story 1 | Lam Ngoc Khuong (maintainer) |
| 2 | Which gates are eligible for provisional continuation? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed):** eligible are (a) an interview question or an option choice inside a draft whose options change no story, criterion or out-of-scope item, such as a design option or a plan's phase split; (b) `implement`'s plan-gate level; (c) the wait for approval of a gating artifact, which the chain may build on while it stays `DRAFT` or `IN REVIEW`, within question 6. Never eligible: moving any approval state; scope, priority, pricing, deadline and compliance (rule 3); a requirement not yet `APPROVED`, so scope is settled by a person before the hand-over; residual risk in `atk:security`; the review-loop escalation and a disputed `BLOCKING` finding; `atk:fix`'s check that a behaviour was intended; a permission prompt of an agent's CLI; and every action past the consent line. A gate the run cannot place in either list is not eligible. | AC 1.1, AC 1.2 | Lam Ngoc Khuong (maintainer) |
| 3 | When role-agents disagree, which option does the run continue on? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed):** none. The run continues only when every role-agent recommends the option the skill itself recommends; any disagreement makes the gate not eligible and parks the chain, with the disagreement written in its queue entry. A majority means little among agents running on one model, and siding with the agent of the owning role would treat it as the role. | AC 2.2 | Lam Ngoc Khuong (maintainer) |
| 4 | On a rejected entry, does the kit re-run the affected jobs on the chosen option, or only mark them? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed):** it marks them and proposes, never re-runs by itself. The rejected entry's branch keeps its commits as evidence, its worktree is removed per the cleanup rule, and the coordinator writes a new proposal record with a `Follows:` line for the chain from the rejected gate onward, on the person's option, as step 6 of `atk:orchestrate` already does after a gating artifact is approved. It runs once that record is `APPROVED`. | AC 3.3 | Lam Ngoc Khuong (maintainer) |
| 5 | Where does the decision queue live? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed, following question 1):** the working queue is a file of the run state, `docs/derived/orchestrate/<run-id>/decisions.md`, since entries change as they are answered and an approved proposal record is not edited (`plugins/atk/skills/orchestrate/references/proposal.md:142`). The durable account is in two places that already exist: each answer is recorded where its skill records answers (a design's or plan's open questions, through `--answer`), and the next proposal record carries a section listing every queue entry with who accepted or rejected it. No new kind of artifact, so `docs/artifact-lifecycle.md` does not change. | Story 3 | Lam Ngoc Khuong (maintainer) |
| 6 | Is there a ceiling on how many gates a run may pass provisionally, or on how deep work may build on an unanswered gate? **Answered (Lam Ngoc Khuong, 2026-11-05, as proposed):** two ceilings, and a chain that reaches either parks. Depth: a chain builds on at most one gating artifact that is not `APPROVED`, which lets `implement` run on a draft design and a draft plan (a plan does not gate, per `plugins/atk/shared/state-signals.md:25`) but not on a draft design and a draft breakdown together. Count: at most 8 queue entries per run, so the queue stays readable in one sitting. The job timeout of `atk:orchestrate` holds unchanged. | AC 1.1, AC 3.3 | Lam Ngoc Khuong (maintainer) |

## 7. Impacted areas

| Area | Files |
|------|-------|
| Orchestration | `plugins/atk/skills/orchestrate/SKILL.md`, `plugins/atk/skills/orchestrate/references/proposal.md`, `plugins/atk/skills/orchestrate/references/ways-to-run.md` |
| Gate rule | `plugins/atk/shared/host-capabilities.md` (the gate-relay bullet), `plugins/atk/shared/team-roles.md` (rules 2 and 3 stay; a note on provisional answers may be needed) |
| Role-agents | `plugins/atk/shared/independent-challenge.md`, `plugins/atk/agents/read-only-reviewer.md` |
| Trace | `plugins/atk/shared/run-trace.md` (how a provisional gate and its later answer are written) |
| Docs | `docs/system-architecture.md`, `docs/flow/skill-chain.md`, each with its `docs/vi/` mirror; a new ADR under `docs/adr/`. `docs/artifact-lifecycle.md` does not change, per question 5 |
| Flag surface | `--unattended` on `atk:orchestrate`: its `## Invocation` and `argument-hint`, the `README.md` invocation block, both `skills-overview.md` files |
