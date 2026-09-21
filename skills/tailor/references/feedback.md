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

1. The skill, where its definition came from and at what version, the flags passed, and what was
   asked of it.
2. Which steps of `SKILL.md` ran, which did not, and in what order. A step that did not run is
   stated as a fact. Why it did not run is raised as a question, for the reason
   `references/audit.md` gives: the reader can answer it and the record cannot.
3. Every place the run had to guess because the skill is silent, citing the skill as `path:line`.
4. Every place a person corrected the output by hand, in that person's own words.
5. What the team expected instead, and what it cost them that the skill did something else.

Name the person reporting. A record with no name behind it is a complaint, and the author cannot
come back with a question.

## What it must never hold

**Replacement wording for `SKILL.md`.** The team reporting has the skill file in front of them and
not the `shared/` layer behind it, so a proposed line has a good chance of restating a rule that
already lives there or contradicting one. Two of the three shared rules a proposed line usually
collides with are invisible from the skill file alone. Report what happened; the author writes the
line with the whole kit in view. The exception is the section below, where the reporter is the
author and does have the whole kit in view.

**A score.** A percentage computed from the run by the agent that just made the run is self-grading,
and the kit's own premise is that the author and the approver are separate roles, whoever fills
them. Count what is
countable, such as how many steps ran, and leave the judgement to the person reading.

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

What does not change: the fork is asked per finding, the third row still goes nowhere wherever the
definition can be read, the record names the person reporting, and nothing leaves the project
without being asked.

## When the reporter is the kit author

A maintainer of `atk` running the skills on their own projects has nobody to send a record to. The
fork above still does its work, because sorting the findings is what it is for, and the second row
keeps its meaning: the finding belongs to the shipped file rather than to one project.

Three things change, and only at the end.

The record stays where it was written and is not offered to anyone. There is no issue to open, since
the person who would read it wrote it; skip the offer rather than making it and answering it.

The shipped file can be edited directly, which the second row normally cannot reach. Say so, and keep
the record as the account of why, because a commit message carries the change and not the run that
found it.

A proposal may go in the record, under a heading of its own, despite the rule above. The reason that
rule exists is that the reporter cannot see the `shared/` layer, and here they can. Keep it in its own
section rather than mixed into the findings, so a reader can still tell the account of the run from
the argument about what to do next.

What does not change: the fork is still asked per finding, the third row still goes nowhere, and a
record with no name behind it is still a complaint.

## Sending it

The record is written into the project and goes no further on its own. Passing it to the kit author
crosses the consent line in `shared/finalize-steps.md`, so it is asked for every time, including
when the same person agreed to send one an hour ago.

Show the record, say that the `Skill run report` issue form on the kit repository is what a record
about one of this kit's skills fits, and wait. A team that would rather send it by hand is doing
the same thing, and the file is already in the shape the form asks for.
