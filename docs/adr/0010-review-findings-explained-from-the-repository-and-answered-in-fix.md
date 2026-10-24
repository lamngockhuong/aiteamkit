---
title: "ADR 0010: a review's findings are explained from the repository, and answered one by one in atk:fix"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-23
updated: 2026-10-24
ticket: none
---

# ADR 0010: a review's findings are explained from the repository, and answered one by one in atk:fix

Design: `docs/records/design/261023-1609-review-findings-explained-and-answered.md`

Supersedes `docs/adr/0007-plain-explanation-of-a-document-is-a-catchup-mode.md`.
One decision of ADR 0007 changes: "Every claim traces to a place in the document" no longer holds
for a review report. Every other decision of ADR 0007 stands.

## Context

On 2026-10-22 `atk:review` posted 35 findings on a client project's pull request. The author did
not understand them. In an `atk:fix` session, every finding needed explaining before it could be
decided, in four ways:

- a scenario with named actors;
- whether it happens in practice;
- why the code is the way it is;
- what the suggested fix really costs.

Each of the four needed the repository: the cited code, a decision in the plan, the business spec,
the deploy pipeline.

Document mode of `atk:catchup` would have answered none of the four, because ADR 0007 confines the
page to the document's own words. It could not read a review that existed only on the pull request.
`atk:fix` had no path for many findings at once, so the session invented a triage and a decision
file outside every kit path.

## Decision

- **The explanation.** For a `review-report`, document mode adds a labelled layer to each finding,
  What the repository says: a scenario, whether it happens in practice, why the code is this way,
  and what the fix costs, flagged where that differs from the report.
  - It reads only a fixed list of places: the cited lines, a record the finding's `Decision` line
    names, the plan or design the change names, the reference documents the cited code serves, a
    configuration file the finding names, and the definition of what the cited lines use, one step
    away and no further.
  - The plan or design path, taken from the pull request body, is opened only inside the
    repository's plan or design directory.
  - The layer is read at the reviewed commit, or says which commit it read instead.
  - Each line cites `path:line`, or says "the repository does not say". Everything it prints is
    masked, and a credential finding gets no layer.
  - The page still adds no finding, severity or verdict.
  - Every other kind of record keeps the rule of ADR 0007, a `security-record` included: it already
    verifies each finding against the code, and a scenario written for an unfixed vulnerability can
    go into more detail than the record does.
- **A posted review.** `/atk:catchup <pr-url> --findings` explains the newest `atk:review` posted on
  the pull request. It reads the review as `atk:review` itself reads an earlier review, and counts a
  summary only from a writer matched in the Team section or confirmed by the person running it. A
  bare `<pr-url>` stays the diff brief.
- **The triage.** `/atk:fix <pr-url | review report> --findings` calls the explanation itself, then
  walks the findings with their author, one at a time, answering follow-up questions from the same
  sources.
  - The person answers each finding in one of the four kinds `atk:review` reads back: fixed,
    deferred, declined or disputed. A finding nobody can answer yet is posted as deferred, its place
    the person and the question it waits on. A "skip" is recorded as declined. A word outside the
    four would be read by the next review as no answer.
  - Each answer is a `gate` line.
  - Replies are drafted per thread, masked, hold only the answer, its reason and paths, and are
    posted on a yes. A `fixed` reply waits for the push. A credential finding gets none. The consent
    table gains the row.
  - The findings to fix enter steps 1 to 7 as the run's defects, each `Fix` line a claim to check,
    with the hypothesis ceiling counted per finding. The fixes are committed on the pull request's
    own branch: no second pull request, and the author's body is never replaced.
  - The answers live in the progress log, in a Findings answered section of the fix report, which
    is always written under the flag, and on the thread. No new kind of artifact is added.

## Consequences

- No new skill, so the count stays 25. `atk:catchup` and `atk:fix` each gain one flag. `atk:fix`
  gains a reference file, and its report gains one section.
- A page about a review costs more to write, since it reads the repository. The reading goes to the
  reading-wide agent, and the list bounds it.
- The page holds claims the reviewer never made. They are labelled, cited, and under their own
  heading, so a reader can tell the reviewer's words from the run's reading.
- The answers come back to the next `atk:review` with no change to `atk:review`'s reading, because
  they are in its four kinds.
- `/atk:catchup <review-report-path>` changes at the release with no flag, and the release notes say
  so.
- Replies already posted outlive a rollback of the kit: later reviews keep reading them as answers.
- A finding waiting on somebody reads as `deferred` in the next review, not as waiting; the person
  and the question are in its `Author` line, which is what keeps `atk:review` unchanged.
- ADR 0007 and its design are marked `SUPERSEDED`, with links both ways, in the pull request that
  lands this decision.

## Alternatives rejected

- **Keep the page to the report.** This is what failed. The reader's questions came back as "the
  document does not say".
- **Read the repository only in the triage.** The explanation would be split between two skills, and
  the page a Tech Lead reads to settle a dispute would be the weaker one.
- **Recognise a review's URL anchor as document mode.** It needs an exception in classification, and
  the anchor exists on GitHub only. A flag works on every host the tracker adapters read.
- **The triage as a mode of `atk:review`.** `atk:review` is the reviewer's skill, and the reviewer is
  never the author. It writes no code either, so the findings to fix would still have to be handed to
  `atk:fix`.
- **A skill of its own.** Every group of `CONV-001`, a 26th skill, and a skill that re-cites the
  thread read, the intent check, the ceiling and the report that `atk:fix` already has.
- **A decisions file of its own, under `docs/records/` or `docs/derived/`.** It would be a fourth copy
  of answers the thread, the progress log and the fix report already hold, and a new kind in the
  lifecycle docs.
