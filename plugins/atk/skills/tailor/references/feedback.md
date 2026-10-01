# Feedback on a run

What `/atk:tailor --feedback <skill>` produces, and the one judgement the mode exists to make.

A run that went wrong is one of three things. Telling them apart before anything is written or sent
is the whole value here, because two of the three must never reach the author of the skill.

## The fork

| The finding | Where it goes | Why |
|-------------|---------------|-----|
| The skill is wrong for this team | `.atk/overrides/<skill>.md` | The kit is shared and this project is not. A rule that is right here and nowhere else is an override, which is what the rest of this skill writes |
| The skill is wrong for everybody | A feedback record for the skill's author | Nothing in the project can fix a step the skill never defined. Only the file that defines it can |
| The skill said it plainly and the run did it anyway | Nowhere | The definition is already correct, so there is nothing to change and nothing to send. Say so and run it again |

Ask the fork question per finding, not per run. One bad run usually produces findings of all three
kinds, and a record that carries the third kind teaches the author to stop reading records.

## Separating the first row from the second

One question does it: would a team that knows nothing about this project hit the same thing?

A finding that depends on this project's stack, client, house style, or working language is the
first row however strongly the team feels it. A finding about a step the skill never defined, an
instruction that can be read two ways, or an output the skill promises and does not produce is the
second row, because every team reading that file reads the same words.

Where the answer is genuinely unclear, take the first row. An override costs one file in one
project and is reversed by deleting it; a change to the shipped skill lands on every team that
installed the kit, and the ones it does not fit have to override it back.

## What the record holds

Somebody who was not in the run reads this to decide whether a definition changes. It answers four
things in order: how many findings there are, how bad each one is, where in the definition each one
lands, and what the run actually did. The sections below are fixed, so two records about two
different skills are read the same way.

### The shape

```markdown
---
title: "Feedback on <skill>: <slug>"
status: DRAFT | IN REVIEW
owner: <the person reporting>
approver: <who owns the skill definition, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL, or none>
---

# Feedback: <skill>

## The run

| | |
|---|---|
| Skill | `<skill as invoked>` |
| Definition | `<path>`, version `<version>`, or "not readable" and why |
| Flags | `<flags>`, or none |
| Harness | `<harness and version>` |
| Asked of it | <one line> |
| Reported by | <person> |

## Findings

<N> findings: <n> for the definition, <n> local to this project, <n> the definition already covers.
Steps of `SKILL.md`: <n> of <total> ran.

| # | Finding | Severity | Where it lands | Cites |
|---|---------|----------|----------------|-------|
| 1 | <one line: what the skill failed to make the run do> | `BLOCKING` | The definition | `<path>:<line>` |
| 2 | <one line> | `SHOULD FIX` | Local to this project | silent |

### 1. <title>

- **What the skill says**: `<path>:<line>`, quoted. Or: silent, nothing in it covers <X>.
- **What the run did**: <the behaviour as it happened>
- **What the team expected**: <the outcome owed, not the wording that would produce it>
- **What it cost**: <the rework, the wrong direction taken, the time>
- **Corrected by hand**: <what a person fixed afterwards, in that person's own words>, or none

### 2. <title, same five lines>

## Steps that ran

| Step of `SKILL.md` | Ran | Note |
|---|---|---|
| 1. <name> | yes | |
| 2. <name> | no | <a question for the reader, not a guess at why> |

## Open questions

At most three, each with the name of the person who must answer it.

## Not in here

<the exclusions below, named, so the reader can tell a rule from an omission>
```

A finding with no row in the table is invisible, and a row with no section under it cannot be acted
on. Both, for every finding.

The headings are written in the language of the run, per rule 6 of `shared/team-roles.md`. Nothing
reads this file by its headings, which is what makes it differ from the two in an override file, so
what matters is that its reader can read it.

### Severity

Per finding, and about what the run cost rather than about how good the skill is. The three values
are the ones `atk:review` ranks by, per `shared/review-checklist.md`, so one word means one thing
across the kit:

| Severity | A finding about a skill run |
|----------|-----------------------------|
| `BLOCKING` | The run reached a wrong conclusion, or produced an artifact its approver has to reject |
| `SHOULD FIX` | The artifact was usable and a person had to redo part of it by hand |
| `NIT` | The result was right and the route to it was wasteful, or a line reads two ways and the run picked one |

Severity is not the score the next section forbids. It grades one finding, which the reader checks
against the citation beside it; a score grades the run as a whole, and nothing in the record lets
anyone check it.

### What it counts

Two counts, both stated rather than left to be added up. How many findings there are and how they
split across the three rows of the fork, and how many steps of `SKILL.md` ran out of how many it
has. A reader who sees "5 of 7" knows what to ask about next; a reader who sees five paragraphs
cannot tell whether two steps were skipped or never existed.

Name the person reporting. A record with no name behind it is a complaint, and the author cannot
come back with a question.

## What it must never hold

**Replacement wording for `SKILL.md`, unless the person who will read the record wrote it.** A team
reporting on a skill somebody else ships has that skill file in front of them and not the `shared/`
layer behind it, so a proposed line has a good chance of restating a rule that already lives there
or contradicting one. Two of the three shared rules a proposed line usually collides with are
invisible from the skill file alone. Report what happened; the author writes the line with the whole
kit in view. Where the reporter does hold the whole definition, the rule has nothing left to
protect, and the section "When the reporter owns the definition" below says what changes.

**A score.** A percentage computed from the run by the agent that just made the run is self-grading,
and the kit's own premise is that the author and the approver are separate roles, whoever fills
them. Count what is countable, per "What it counts" above, and leave the judgement to the person
reading. Severity is not that judgement: it is one claim per finding, checkable against the
citation next to it.

## When the skill is not one of this kit's

A team runs more than one kit, and a run that went wrong is worth recording whoever wrote the skill
that made it. The mode takes those runs. Three things hold differently.

The first row of the fork cannot be reached. `.atk/overrides/<skill>.md` is opened by the `atk`
skill named after it and by nothing else, so a file written there for another skill is read by
nobody while looking like a rule the team agreed on. Sort the finding anyway, because knowing that
it is local to this project is worth knowing, then carry it into the record under a section of its
own and say why no override was written.

A section of its own, and not the list the author reads, because a finding that depends on this
project's stack, client, or house style is one of the two the fork exists to keep away from them.
The reason it is in the file at all is that the team has nowhere else to put it, which is a reason
to record it and not a reason to ask a maintainer to read it. The proposal section below is kept
apart for the same cause: a reader can tell what is being asked of them from what is not.

The definition may not be readable. A skill kept in the project or in another kit has a file to
open; a skill the harness itself ships may have none. Where there is none, the record is still
written and says so, because two things go with the file: a finding cannot cite `path:line`, and
the third row of the fork cannot be told from the second, since deciding whether the skill already
said it plainly means reading what it says. Record what the run did and what was expected instead,
and leave that judgement to whoever holds the definition.

It goes to a different reader. Name who owns the skill, this project or another kit, and stop
there. The `Skill run report` form belongs to this kit's repository and fits a record about this
kit's skills, so offering it here would aim a report at a maintainer who cannot act on it.

Where that reader is the reporting team itself, which is the ordinary case for a skill kept in the
project's own skill directory, the section below applies and the record may propose what to change.
Check who owns the definition before deciding that: a skill from another kit has an owner elsewhere
however local its file looks once installed.

What does not change: the fork is asked per finding, the third row still goes nowhere wherever the
definition can be read, the record names the person reporting, and nothing leaves the project
without being asked.

## When the reporter owns the definition

Two runs land here. A maintainer of `atk` running the skills on their own projects, and a team
reporting on a skill it keeps in its own project, whose definition nobody outside the team ships.
Both have nobody to send a record to, and both hold every file the definition is made of, which is
the condition the rule against proposing wording rests on.

The fork above still does its work, because sorting the findings is what it is for, and the second
row keeps its meaning: the finding belongs to the definition rather than to one run.

Three things change, and only at the end.

The record stays where it was written and is not offered to anyone. There is no issue to open, since
the person who would read it wrote it; skip the offer rather than making it and answering it.

The definition can be edited directly, which the second row normally cannot reach. Say so, and keep
the record as the account of why, because a commit message carries the change and not the run that
found it. Editing it is a separate decision and a separate run: this mode writes the record and
stops, because the person who owns the definition is the person who approves a change to it, even
where that is the same person.

A proposal may go in the record, under a heading of its own, despite the rule above. The reason that
rule exists is that the reporter cannot see the layer behind the skill, and here they can. Keep it in
its own section rather than mixed into the findings, so a reader can still tell the account of the
run from the argument about what to do next, and write it as the change owed rather than as finished
wording: which line, what it fails to require, and what it has to require instead.

What does not change: the fork is still asked per finding, the third row still goes nowhere, and a
record with no name behind it is still a complaint.

## Sending it

The record is written into the project and goes no further on its own. Passing it to the kit author
crosses the consent line in `shared/finalize-steps.md`, so it is asked for every time, including
when the same person agreed to send one an hour ago.

Show the record, say that the `Skill run report` issue form on the kit repository is what a record
about one of this kit's skills fits, and wait. A team that would rather send it by hand is doing
the same thing, and the file is already in the shape the form asks for.
