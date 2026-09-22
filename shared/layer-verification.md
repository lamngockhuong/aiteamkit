# Layer verification

Shared contract for every `atk` skill that runs a check and then says what the result means.
Referenced from `skills/<name>/SKILL.md` as `shared/layer-verification.md`, which is
`../../shared/layer-verification.md` relative to a skill file.

Three skills read this file, for three different reasons. `atk:fix` verifies that a proven cause is
gone. `atk:implement` verifies that new code does what it was built to do. `atk:verify` re-runs the
narrowest covering check between rounds of fix and retry. What they share is not the reason. It is
the answer to one question: for this layer, what is run, and what is that run allowed to be said to
prove.

That answer lives here once, because a correction to it has to reach all three. Each skill keeps its
own part beside its own workflow: where a cause hides and how to reproduce it belongs to `atk:fix`,
the order to run things in belongs to `atk:implement`, and asserting on a running system belongs to
`atk:verify`.

## The commands are blanks

Every command below is a blank, filled from the `Commands` section of `.atk/profile.md`. Layer names
come from its `Layers` section. A tool name written into this file would be right for one repository
and wrong for every other, and would be copied anyway because a written command looks authoritative.

One command does not come from there, and it is named as the exception it is: the gate's own, below.
It comes from the project's CI configuration, because that is the only place it exists until somebody
records it, and a run that names where it read it has not guessed. Everything else stays a blank
filled from the profile.

The five layers are the common shape. A project with other layers uses its own names and the same
four columns.

## The gate, not only the command

The profile names a command. The project names a gate: a job in its own CI that runs on the pull
request and can fail it. The two are not always the same command, and where they differ the gate is
what the change will be judged by.

So for every layer this change touched, establish which CI job gates that layer and what that job
runs, by reading the project's CI configuration rather than assuming the profile's command is what
runs there. A gate that adds a coverage threshold, a wider scope, or a second command is stricter
than the local run, and the difference is the part nobody has checked yet.

| What was found | What the run does |
|---|---|
| The gate runs what the profile names | Say so once. The local pass is the gate's answer |
| The gate is stricter | Run the gate's own command where it can be run locally. Where it cannot, the difference belongs in the fourth column as an unverified area, named by the job that will find it |
| No CI gate covers that layer | Say so. The local run is then the only check there is, which is worth knowing before the change ships |

A local pass reported without this reads to a reviewer as a claim that CI will be green, and that is
the claim most likely to be contradicted an hour after the pull request is open, by the one job the
run never looked at.

## Per layer

| Layer | Run | A pass proves | It does not prove |
|-------|-----|---------------|-------------------|
| Presentation | The component test command | The component renders right for the values under test | Anything about the values not under test, or about the live screen |
| Interface | The request or integration test command | The contract holds for the covered cases, status code included | That every consumer of a changed response shape was updated |
| Domain | The unit test command | The rule behaves for the covered inputs | That callers pass the inputs the rule now expects |
| Data | The migration command forward and back, then the integration test command | The migration reverses, and the queries return what is asserted | That existing rows survive it, unless the run had some |
| Infrastructure | The tool's own validate or parse command | The file is well formed and its references resolve | That the deployment works. Nothing here proves that |

## The fourth column

It is the column that gets dropped, and it is the column that makes a record honest.

A verification section listing only passes reads as a claim that the change is correct. It is a claim
that some checks passed. The gap between those two sentences is where the defect that reached
production was sitting the whole time, in the area nobody said was unchecked.

So every skill that reports a pass reports it as what it covers, never as "tests pass", and carries
the fourth column into its own report as the list of what remains unknown.

The infrastructure row is the sharpest case, because its commands exit zero while proving the least.
An infrastructure change reported as verified is the most common false claim any of these three
skills can make.
