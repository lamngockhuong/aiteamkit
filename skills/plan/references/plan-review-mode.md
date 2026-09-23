# Reviewing somebody else's plan

Loaded by `atk:plan` under `--review`. It replaces the workflow in `SKILL.md` rather than extending
it: nothing is planned, and no plan file is edited.

`## Roles` in `SKILL.md` names the Tech Lead as the person who reads a plan that touches a schema, a
public contract, or more than one service. This mode does the factual half of that reading: it
settles what the plan claims about the repository, which is the half a person should not have to do
by hand. The other half stays with them. Whether these are the right phases, whether the approach is
sound, whether the risk was understood: a clean report here says none of that.

## What can be reviewed

| Input | What is read |
|-------|--------------|
| A plan directory | `plan.md` and every `phase-NN-*.md` beside it |
| A single phase file | That file, plus its index when one sits beside it |
| A pull request | The plan files at its head ref, per `shared/ticket-adapters.md` |
| A plan in some other shape | Whatever the file is, read as a plan: see below |

**A plan this kit did not write** is still a plan. A hand-written `IMPLEMENTATION_PLAN.md`, or another
tool's directory, is read for the same six claims, which do not depend on the template. Say which
checks had nothing to run against. Refusing a real plan over its filename would miss the case this
mode exists for.

**A pull request is read at its head ref**, both halves of it. The plan files come from the head, so
the citations have to be settled against the head as well: a pull request that adds a plan usually
adds or moves the files that plan cites, and reading those from the base branch reports as gone
every file the change itself creates. Check out the head ref, or say which ref was read and stop.

**An index linking a phase file that is not there** is a `BLOCKING` result of its own, reported as
the missing file rather than as its consequences. The remaining checks run over what is present.
Without this, a criterion covered by the absent phase is reported as uncovered, and the author goes
looking in the wrong place.

**A plan already in flight or retired** is read only after saying so. Read the index's phases table
first: a phase at `done` or `in progress`, or an index at `status: SUPERSEDED`, means results will
land on work already done or already abandoned. Say what state the plan is in and ask before
continuing.

**A plan this session wrote** is not somebody else's. Say so in the report, and say that a self
reading does not stand in for the one `## Roles` names, the same caveat `references/plan-self-review.md`
carries for step 6.

Where the input holds nothing that can be read as a plan, stop and say so.

## Is this plan about this repository

Every claim is settled against the working tree, so a plan about another project would turn every
citation into a result and produce a report that is entirely false.

Stop only on positive evidence of a different repository: a `ticket:` or a link naming another
project, a `git remote` the plan names and this checkout does not have, or a directory layout the
plan describes and this tree does not contain at all. Say which repository the plan appears to
describe.

Absence of evidence for this repository is not evidence of another one, and this is where a binary
test goes wrong. A greenfield plan cites files it is about to create, and `SKILL.md` calls that a
legitimate result rather than a failed scan. A plan written against an app root in a monorepo, or
against an uninitialised submodule, resolves no path either. A plan three of whose eight citations
have aged is an ordinary plan. All of those go to the citation check, where `grep` and
`git log --follow` already live, and none of them is a reason to stop.

## The pass

Run the six claims in `references/plan-self-review.md`, by the method that file gives: its
`## How to reopen each one` is the procedure here too, and only its dispositions read differently.

Read the phases against `references/step-ordering.md` as well, which step 6 does not: the author had
it open while cutting, and a reviewer has to check the result of that cut. Read down the `Check`
column, which that file offers as a test on a finished plan; a row repeating the command above it, or
saying "see step N", marks a boundary drawn by instinct.

Three things differ from step 6, and all three follow from the author being somebody else:

**Nothing is fixed, deleted, or retired.** Every disposition in that file that edits a plan, whether
it repoints a citation, drops an unused assumption, answers an open question, or sets a `status`,
becomes a result here instead. Correcting another person's document is how a reviewer ends up owning
it, and the author loses the chance to see how their plan aged.

**An open question is read, not added.** An assumption the repository cannot settle is a result that
says so and names nobody: who answers it is the author's to decide, and a reviewer who assigns it has
decided something a role owns.

**Nothing ends the run early once a plan has been read.** The stops above all happen before the pass
starts. After it starts, every result goes into the report, including the one where two approaches are
still open: that is a `BLOCKING` result, not a reason to stop writing.

## Severity

One table, and it is the only thing that assigns a severity. The three levels are the ones in
`shared/review-checklist.md`, so a person reading a plan review and a code review does not hold two
vocabularies.

| Severity | In a plan |
|----------|-----------|
| `BLOCKING` | Following the plan produces the wrong thing, or stops: an acceptance criterion no step covers, a dependency pointing forward, a name two phases spell differently or define twice, an assumption the repository refutes, a phase file the index promises and does not have, two approaches still open where the plan sequences one |
| `SHOULD FIX` | The plan works and costs more than it should: a step with no check of its own, a phase that is a pause, an index disagreeing with its phase file, an assumption the repository can neither confirm nor refute that a phase depends on, an assumption nothing confirms and nothing asks about, a citation into a generated or ignored file that resolves only on the author's machine |
| `NIT` | Preference and decay: a citation whose subject only moved, an open question the repository answers, a slug, a wording. Never blocks |

Rank `BLOCKING` first, and separate it from the rest, per the same rule that governs `atk:review`:
mixing what stops the work with what improves it is what makes a review feel arbitrary.

## What cannot be checked, and when

Say it in the report rather than leaving a claim looking satisfied.

| Missing | Claims that cannot run |
|---------|------------------------|
| The index, for a lone phase file | The criteria, the dependency direction, and the index comparison |
| Sibling phase files, for a lone phase file | The names across phases |
| A second phase, in a one-phase plan | The names across phases, and the dependency direction |
| `.atk/profile.md` | The commands: there is no Commands section to compare a `Check` cell against |
| Acceptance criteria in the request | The criteria, which is vacuously true without them |

## The report

Written to `docs/derived/reviews/plan-<slug>-<date>.md` per `shared/artifact-paths.md`, on every run
that reached the pass. A run that stopped before it writes no report, and says in the session why.
The report is derived: safe to delete, and rebuilt by running the review again.

The `<slug>` comes from the plan directory's name, or the phase file's slug, or the pull request
number, in that order. Two reviews of one plan on one day write the same name, and the second
replaces the first; that is acceptable in a derived directory and worth knowing before someone goes
looking for the earlier one.

**A review already written for this plan is read before this one is written.** Look it up by
`<slug>`, since a review from an earlier day carries a different date and is about the same plan.
A result it already raised is one the author has seen and not acted on, which is a different thing
from a result a week of commits has just created, and a report that cannot tell them apart sends the
approver to the wrong question. Reading it is all that happens: it is never rewritten, and a result
it raised that the author declined is still a result here.

`references/report-format.md` holds the shape of the file: the identifiers and how they carry from
that earlier report into this one, the labels under each result, the sections in order, and the
table that lets a reader find one phase without reading all three severity sections. Each result
cites the file and the section it is in, states what goes wrong downstream, and stops there.

The session gets the count at each severity, the `BLOCKING` ones in one line each, and the path.

No verdict. Not `PASS`, not `FAIL`, not a score: whether a plan with two blocking results is worth
starting from is the approver's call, per rule 3 of `shared/team-roles.md`, and a review that
answered it would have made a decision on their behalf while looking like a summary.

## Ticket

Under `--comment`, post the results on the pull request that carries the plan, per
`shared/ticket-adapters.md`. Show the list first and post on a yes, as the `## Ticket` section of
`SKILL.md` does with the index.

Post a comment, and only a comment. Never a review state, an approval, or a request for changes:
`atk:review` may request changes on a diff because a diff is a change, and this mode gives no verdict
at all, so entering a review state here would be the skill taking the approver's decision.

A pull request that is merged or closed is said and confirmed before anything is posted. Commenting
on shipped work reads as a request nobody is going to act on. Without a pull request there is nowhere
to post, and the flag says so rather than falling back to a comment on the ticket: a plan review
belongs beside the plan.

## Definition of done

- [ ] The run stopped only on positive evidence of a different repository, never on a plan whose
      citations are files it intends to create.
- [ ] The state of the plan, in flight or retired or freshly written in this session, is in the report.
- [ ] No plan file was edited, no `status` was set, and no plan file was written.
- [ ] Every `BLOCKING` result names what following the plan would produce or where it would stop.
- [ ] Every result cites the phase file and the section inside it, and took its severity from the one
      table that assigns severities.
- [ ] Every citation and every assumption in the plan was reopened against the repository, not read.
- [ ] An assumption the repository could not settle is a result, and names nobody.
- [ ] Preferences are labelled `NIT` and are separated from what blocks.
- [ ] Every claim that could not run is named in the report, with what would make it runnable.
- [ ] A pull request was read at its head ref, or the report says which ref was read.
- [ ] A review already written for this plan was read, its identifiers carried forward, and what it
      raised and this run did not went into `## Closed since the last review`. Where there was none,
      the report says so.
- [ ] The report follows `references/report-format.md`: results grouped by severity, identifiers
      prefixed by severity, and one table placing them per phase.
- [ ] Where the run reached the pass, the report was written and the session carried the counts, the
      `BLOCKING` lines, and the path. Where it stopped earlier, the session carries the reason.
- [ ] No verdict, score, or approval appears anywhere in the report, and nothing was posted as a
      review state.
