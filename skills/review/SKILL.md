---
name: review
description: >
  Review a teammate's pull request the way a team reviewer should: against the requirement, the
  design, and the team conventions, with findings ranked by severity, each one citing a line and
  stating the failure it causes, and blocking issues separated from preferences.
  Use before approving a PR, when reviewing a colleague's branch, or when a review needs a second
  opinion.
  Triggers on: "review PR", "code review", "review this branch", "review giúp", "duyệt code",
  "check PR", "レビュー", "approve this", "is this ready to merge", "/atk:review".
argument-hint: "[pr-number|branch|commit|paths] [--against <design-path>] [--comment] [--strict] [--parallel <N>] [--out <path>]"
---

# Team Code Review (`atk:review`)

Reviews a change the way a responsible colleague does: it starts from what the change was supposed
to do, not from the diff. Findings that block a merge are separated from findings that are taste,
because mixing them is what makes reviews feel arbitrary.

## Scope

Handles: reading the diff in the context of the requirement, design, and conventions, deciding which
review rounds the change is worth and whether they run in agents of their own, finding correctness
and regression risks, checking test coverage of the changed behavior, and writing review comments
that a person can act on.

Does NOT handle: approving or merging, a human act; rewriting the code, which the author does with
`atk:implement` or `atk:fix`; judging the requirement itself (`atk:intake`); or reviewing a plan or a
cases file, which `atk:plan --review` and `atk:qa --review` do against what each one rests on.

## Roles

The reviewer is never the author. Tech Lead holds the final call on a disputed blocking finding. QA
reviews test adequacy. See `shared/team-roles.md`. In band 1 without `--parallel`, the session that
wrote a change hands the review to a fresh agent, per step 3; any other run where the author's
session is the calling agent says so in the report.

## Invocation

```bash
/atk:review <pr-number>                   # Review a pull request from the detected tracker
/atk:review <branch|commit>               # Review a branch diff or a single commit
/atk:review <paths>                       # Review given paths in the working tree
/atk:review --against <design-path>       # Review against a specific design document
/atk:review --comment                     # Post findings as inline PR comments
/atk:review --strict                      # Include low-severity and stylistic findings
/atk:review --parallel 3                  # Deeper pass: a round that searches runs 3 copies
/atk:review --out <path>                  # Write the report somewhere other than the default
```

## Workflow

```
[1. Establish intent] -> [2. Read diff in context] -> [3. Choose the rounds] -> [4. Find]
  -> [5. Verify] -> [6. Rank and write]
```

Before step 1, read `.atk/overrides/review.md` when it exists, per rule 7 of `shared/team-roles.md`,
and count the changed lines per step 3. In band 1 without `--parallel`, spawn the reviewer agent at
once with the target and the paths: it runs steps 1 to 6 and spawns no reviewer of its own.

### 1. Establish intent

Find the requirement and design behind the change. Without them, say so in the review and review
against the PR description alone; a review with no stated intent is a style check.

### 2. Read the diff in context

Open the surrounding files, not only the changed lines. Most real defects live in what the change
implies elsewhere: a caller not updated, an enum case not handled, a migration without a backfill,
a cache not invalidated.

### 3. Choose the rounds

The review runs as nine rounds, one job each, using the host's ability to run agents in parallel per
`shared/host-capabilities.md`. `references/review-rounds.md` holds the round list, how many copies
each round runs, which rounds may share an agent, the memory cap, what each agent is given, how the
calling agent drives them, and how the findings become one list. Three questions settle the shape of
a run:

**Which rounds run.** All nine, minus the ones whose subject the diff does not contain: no deleted
lines, no signature change, no behavior change. That is different from a round that ran and found
nothing, and the report keeps the two apart. The list comes from step 4 below and is not a second
list alongside it.

**Where they run, and how many copies.** Every round runs once. The size of the change decides only
where, measured in changed lines and never in files: 500 lines or fewer run all nine rounds and the
sweep in one reviewer agent, handed the target and the paths to the intent and nothing of the
conversation; above that the rounds get agents of their own, the comparing ones sharing one, seven
at most. A file the repository regenerates counts toward neither number, on the evidence
`references/review-rounds.md` requires, and is still read by the rounds that have a reason to open
it. Say which band the run is in and what put it there. Copies come only from `--parallel <N>`, at
any size: the rounds that have to go looking run N, and a round that only compares the diff against
a list runs once, because copies of a comparison return the same answer.

**Which rounds share an agent.** Comparing rounds may be combined; searching rounds never are,
because combining them rebuilds the agent that forgets its earlier concerns.

All three are settled before anything is spawned, so the run says what it will cost first: the round
runs, the agents, and the concurrency the machine's memory allows. The cap is measured, not assumed,
and it outranks the dispatch rule of step 4 rather than the copy count, per
`references/review-rounds.md`. Stating the cost is what leaves the choice to pay it with the person.

Every agent in a round reads the same diff: independence is the point, so splitting the files
between them would produce agreement that means nothing. Rounds divide the question, never the
files.

Steps 1, 5, and 6 keep their judgement in the calling agent, which in band 1 is the reviewer agent,
and it returns only the summary of `## Output` and the report path. Intent is what the rounds are
measured against, ranking one list out of many needs all of them in one context, and the calling
agent also drives the rounds. The one search inside them that is delegated is the closing sweep of
step 5, which above band 1 gets its own agent and hands its candidates back for the verdicts;
`references/review-rounds.md` says why.

Where the harness cannot spawn agents, the nine rounds run one after another in this session and the
report says so, including that the reviewer shared the author's context.

### 4. Find

Eight things to look for, ranked here in the order step 6 reports them: behavior that contradicts an
acceptance criterion, correctness bugs and regressions, missing error and edge-case handling,
security and data exposure, untested new behavior, a public contract changed without its reference
document, convention violations, then readability.

This list is what the nine rounds are made of, not a separate list running beside them. Six of the
eight become one round each; item 2 becomes three, `lines`, `removed`, and `callers`, because that
is where defects hide and the three open different things; readability becomes no round at all, for
the reason `references/review-rounds.md` gives. The order above is how step 6 ranks what comes back,
not the order the rounds run in: the calling agent dispatches one round ahead of the one it is
synthesizing, and never all nine at once, per the same file.

Convention checking is the `rules` round, and it runs off `shared/review-checklist.md`: resolve the
project's conventions document per Where the rules live in that file, read its review checklist
section, check each `REVIEWED` rule, and cite the rule ID with its text quoted verbatim so the
author can dispute the rule rather than the reviewer. When the project has no recorded conventions,
say so in the review and check this round's own baseline items anyway: the round never falls silent
there. The other baseline items stay with the rounds that hold them, per
`references/review-rounds.md`. Do not invent project-specific rules mid-review; report the gap so
`atk:convention` can record it.

The reference-document check is the `contract` round, and the sync obligation in
`shared/spec-docs.md`, which lists the six kinds of change that trigger it and so decides whether
the round runs at all. Raise a `BLOCKING` finding when a contract moved and neither the document nor
a stated skip came with it; `Contract: first`, and any `screen` document, add a rule in `references/review-rounds.md`. Where the
pull request says what is stale and who will fix it, the obligation was met and there is no finding.

Do not fix the document as the reviewer. That moves the work to the wrong person and teaches the next
author that the rule is optional. Something the document never settled is an open question, not
drift, per the same file.

### 5. Verify before reporting

Every candidate gets one verdict, decided against the code rather than against how confident it
sounds, and so does a round's checkable "checked and fine", per `references/review-rounds.md`.

| Verdict | The candidate | What happens to it |
|---------|---------------|--------------------|
| `CONFIRMED` | Names the input or state that triggers it, and the wrong result | Reported. Eligible for any severity |
| `PLAUSIBLE` | Names the mechanism, but the trigger depends on timing, environment, or configuration | Reported at `SHOULD FIX` or below, carrying the one check that would settle it |
| `REFUTED` | Rests on something the code does not do | Dropped, silently |

`PLAUSIBLE` is what a candidate gets when nothing refutes it. Do not refute one for being
speculative, or for depending on state at run time, when that state is one the system reaches:
two callers racing, `nil` on a rare but reachable path such as an error handler or a cold cache, an
absent optional field, a falsy zero read as missing, an off-by-one on a boundary the code does not
exclude, a retry storm, a partial failure, an anchor lost from a pattern.

Refute only on something the code shows: the real line says otherwise, a type or a constant or an
invariant makes it impossible, the same diff already guards it, or it is style with no observable
effect. A verdict resting on "unlikely" is none of these, and dropping a finding that way is how a
race condition ships.

This does not license the question dressed up as a finding. `PLAUSIBLE` still needs a named
mechanism and a named trigger; what is uncertain is only whether that trigger occurs. A candidate
naming neither is not plausible, it is unexamined, and it is dropped.

Then take one more pass, once, with the verified list in hand: in an agent of its own above band 1
where one can be spawned, and in band 1 inside the reviewer agent. Read the diff and the code around
it looking only for what is not on that list: the job is the gaps, not a second opinion on what has
already been found. Surface at most eight new candidates, or nothing at all when there is nothing
new: a padded sweep costs the author the attention that makes the rest of the list worth reading.

What a first pass misses is predictable, so start there: code moved or extracted that left a guard or
an anchor behind, setup and teardown that stopped matching each other in a test, a default flipped in
configuration, a predicate that turns out to have a side effect, a lock whose scope quietly shrank,
and a listed finding's claim or pattern repeated elsewhere, per `references/review-rounds.md`.

New candidates go through the verdicts above like any other, and are labelled apart from every
round's findings, per `references/review-rounds.md`. A sweep that died before it reported is re-run
once, per the same file, and a review that ships without one says so: the run that quietly lost it
reads exactly like the run that found nothing.

### 6. Rank and write

| Severity | Meaning |
|----------|---------|
| `BLOCKING` | Wrong behavior, data risk, security risk, or a broken contract |
| `SHOULD FIX` | Real problem, safe to fix in a follow-up if the author agrees |
| `NIT` | Preference. Never blocks. Say so in the comment |

Where a round ran several copies, each of its findings carries how many of them raised it, and a
finding only one copy raised was checked against the code before it reached this list. That count
means something only between copies of one round; a round that ran once carries its round name
instead, never `[1/1]`, which would suggest other agents looked and disagreed when none was asked.
The report says which rounds ran, which were skipped, which came back empty and which died, per
`references/review-rounds.md`, which names those three states. It never presents a count of agreeing
copies as agreement between people.

A convention violation takes the severity recorded against its rule. Raise it only when the concrete
failure is worse than the rule anticipated, and say why.

The report carries every finding step 5 kept, `BLOCKING` first, a `NIT` in the one-row form of
`references/report-format.md` if need be. The cap is on attention, not on the record: the summary
and the inline comments carry at most ten findings, or twenty under `--strict`, cutting `NIT` first,
then `SHOULD FIX`, and the summary says how many are in the report alone, at what severity.
`BLOCKING` is never cut; where it alone exceeds the cap, carry it all and say so: what to do with a
change in that state is the Tech Lead's call, not a trimming decision the reviewer makes quietly.

Each comment: the file and line, what goes wrong, and a concrete suggestion. Address the code, never
the author. State what the change does well in one line; a review with only negatives teaches
nothing about what to repeat.

Every finding carries an identifier prefixed by its severity, `B1`, `S1`, `N1`, numbered within that
severity rather than across the three. It is the only part of a review that survives being spoken in
a stand-up. `references/report-format.md` holds it, and the shape of everything around it.

## Output

Every run writes a report to `docs/derived/reviews/<pr>-<date>.md` per `shared/artifact-paths.md`,
asked for or not. A review costs more to produce than to keep, and the run that is only spoken into
a session is gone the moment the terminal scrolls. It is derived: safe to delete, and rebuilt by
running the review again. Where the target is not a pull request the name carries what was reviewed
instead of the number, the branch, the short commit, or a slug of the paths.

The session gets the summary, not the report: how many findings at each severity, the `BLOCKING`
ones in one line each, how many the cap left to the report alone, and the path to the file. Whoever
has just watched the review run needs to know whether they are blocked and where to read the rest;
the argument behind each finding is what the file is for.

`references/report-format.md` holds what that file looks like: the finding identifiers, the labels
under each finding, the round table, and the sections in order. This section decides where the
report goes and what reaches the session; that file decides its shape, so a report does not get
rebuilt from nothing once per run.

Read the newest earlier report on the same target first. A second review of the same target reuses
the identifiers of the first, so an author asked to fix `B1` finds `B1` again;
`references/report-format.md` holds what happens when a finding changes severity, and what to do
when no earlier report exists. This report is the one derived artifact the kit reads rather than
only writes, here, in `atk:plan --review` and `atk:qa --review` for their own reports, and in step 1
of `atk:convention`, which takes its `Convention gaps` section; `shared/artifact-paths.md` records
them.

`--out <path>` moves the file. It no longer decides whether one is written.

## Ticket

Follow `shared/ticket-adapters.md`. Under `--comment`, post the findings the cap in step 6 allows as
inline comments on the lines they cite, and the summary as one review comment that names the rest by
identifier and points at the report. Post nothing before showing the list. In band 1 the reviewer
agent only writes the report; the session shows the list from it and posts on consent. A `BLOCKING`
finding requests changes; `NIT` findings never do.

## Definition of done

- [ ] The requirement or design the change was reviewed against is named, or its absence is stated.
- [ ] Every `BLOCKING` finding names a concrete failing input or broken contract.
- [ ] Every reported finding and every checkable "checked and fine" was verified, and a `PLAUSIBLE`
      finding names the check that would settle it.
- [ ] Nothing was refuted for being unlikely: every drop rests on a line, a type, a guard, or the
      absence of any observable effect.
- [ ] Preferences are labelled `NIT` and do not block.
- [ ] The report carries every verified finding; the summary and any inline comments are within the
      cap, and a cut says how many are in the report alone and at what severity.
- [ ] A sweep for gaps ran once against the verified list, in its own agent above band 1 where one
      could be spawned or inside the band-1 reviewer agent, and returned nothing rather than padding.
- [ ] New behavior without a test is reported as a finding.
- [ ] Every convention finding cites a rule ID and quotes the rule, or is marked as a baseline item.
- [ ] A rule the review wanted but the project has not recorded is reported as a convention gap, not applied as if agreed.
- [ ] A band-1 review without `--parallel` ran in a reviewer agent given no conversation; any other
      run whose calling agent was the author's session says so in the report.
- [ ] The cost was stated before the first agent was spawned, or the run said it spawned nothing, and
      a run the cap held to one round at a time instead of one round ahead says so.
- [ ] The band and the line count that put the change in it are stated, net of any generated file
      the count excluded and naming it, along with the agent count the band and any `--parallel`
      ask for, the rounds that ran, any skipped and why, any that came back empty, any that died,
      and a copy count the machine forced down.
- [ ] A round or a sweep that died was re-run once or reported as not run, and neither was left to
      read as a round that looked and found nothing.
- [ ] Every finding carries a severity-prefixed identifier, carried over from the earlier report on
      the same target where there is one, and the report follows `references/report-format.md`.
- [ ] Every agent within a round received the same scope, and a finding only one copy of a round
      raised was checked against the code before it was reported.
- [ ] No spawned round was shown what an earlier round found, the closing sweep excepted. Where
      every round ran in the calling agent, only the deduplicated list was carried between them.
- [ ] A change touching a public contract either carried its reference document or stated the skip,
      and neither was silently fixed by the reviewer.
- [ ] The report was written, to the default path or to `--out`, and the session carried the
      summary and that path rather than the whole list.
- [ ] No comment addresses the author rather than the code.
