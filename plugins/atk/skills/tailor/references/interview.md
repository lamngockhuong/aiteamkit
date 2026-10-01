# Interview

The question set for step 2 of `atk:tailor`. Five groups, in the order teams usually reach them.
Ask about one group, stop when the user has nothing more, and move on.

Open with what the skill already does in the area the user named. Half of what a team asks for is
already in the shipped skill, and saying so first saves the interview from proposing it.

## The filter question

Every answer gets the same follow-up: does this hold for every project your team runs, or only this
one.

Both answers write the file. The kit is installed once per machine and the project is one of many,
so a rule that holds everywhere still cannot live in the kit. What changes is the note that goes in
the file, and what the next team copying the file is taking on.

A second filter catches the answers that belong elsewhere:

| The answer is about | Goes to | Because |
|---------------------|---------|---------|
| The code: naming, layering, tests, error handling | `atk:convention` | A person checks it without the kit installed |
| The project: build commands, docs root, who plays which role | `atk:init` | It is a fact about the repository, not an instruction |
| The skill: what it checks, what it produces, what it asks | here | Nothing else reads it |

When a rule fits two rows, the rule about the code wins.

## 1. An extra step

"Is there something the team always does around this that the skill does not?"

The common shapes: a person who must be told before the work starts, a document that must be read
first, a check that runs before anything else, a place the result must also be posted.

Example, a team whose client reviews every API change: `atk:design-doc` must list the affected
endpoints in a separate section at the top, because the client reads that section and nothing else.

## 2. An extra section in the artifact

"When you read what this skill produces, what do you find yourself adding by hand?"

The answer is almost always a section with a fixed heading, and it is the cheapest kind of override
to write. Ask for the heading and one example of what goes under it.

Example, a team working to an internal security standard: every `atk:design-doc` carries a
`## Security review` section naming which of the standard's controls the change touches, so the
security reviewer can start from that list instead of reading the whole document.

## 3. A tighter constraint

"Is there a number, a threshold, or a limit your team works to that the skill does not know?"

Example, a team whose client signs off by month rather than by sprint: `atk:estimate` works in
man-days and converts to a 20 day working month, with a risk buffer floor of 15% because the
client's review cycle is long.

Watch for the constraint that is really a decision. "Always estimate 20% higher" is a constraint the
team owns. "Decide the deadline once the estimate is done" is the PM's call and step 3 refuses it.

## 4. A person who must be consulted

"Is there someone this skill should always surface a question to?"

This one is easy to write badly. An override may not make a skill wait for a person, and it may not
invent an approval gate the kit does not have. What it can do is require that the artifact name that
person against the questions they own.

Example: every open question in `atk:intake` output that touches the client's business rules carries
the BrSE's name rather than the PM's, because the BrSE is the one who can ask the client.

## 5. Language and tone

"Who reads this artifact, and in what language?"

The kit already follows the team's working language per rule 6 of `shared/team-roles.md`, so this
group is only worth asking when the answer is not uniform: a team that writes internally in
Vietnamese and sends `atk:release` notes to a Japanese client needs that difference written down.

Ask which artifacts go outside the team, and what the outside reader knows. A release note for a
client who has never seen the ticket system is a different document from one for the team.

## Closing

Read back what was captured, grouped into `## Before` and `## After`, before writing anything. A
team hearing its own rules read back finds the missing one about a third of the time, and that is
cheaper than a second run of the skill.
