# Feedback on a run

What `/atk:tailor --feedback <skill>` produces, and the one judgement the mode exists to make.

A run that went wrong is one of three things. Telling them apart before anything is written or sent
is the whole value here, because two of the three must never reach the kit author.

## The fork

| The finding | Where it goes | Why |
|-------------|---------------|-----|
| The skill is wrong for this team | `.atk/overrides/<skill>.md` | The kit is shared and this project is not. A rule that is right here and nowhere else is an override, which is what the rest of this skill writes |
| The skill is wrong for everybody | A feedback record for the kit author | Nothing in the project can fix a step the skill never defined. Only the shipped file can |
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

1. The skill, the version of the kit it came from, the flags passed, and what was asked of it.
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
line with the whole kit in view.

**A score.** A percentage computed from the run by the agent that just made the run is self-grading,
and the kit's own premise is that the author and the approver are different people. Count what is
countable, such as how many steps ran, and leave the judgement to the person reading.

## Sending it

The record is written into the project and goes no further on its own. Passing it to the kit author
crosses the consent line in `shared/finalize-steps.md`, so it is asked for every time, including
when the same person agreed to send one an hour ago.

Show the record, say that the `Skill run report` issue form on the kit repository is what it fits,
and wait. A team that would rather send it by hand is doing the same thing, and the file is already
in the shape the form asks for.
