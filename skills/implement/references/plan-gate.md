# Plan gate

Loaded by `atk:implement` at the start of every run. It answers one question: how much agreement
does this work need before a line of it is written.

Two failure modes sit on either side, and both are common. Writing a plan for a one line change
wastes an afternoon and teaches the team that plans are ceremony. Going straight into a change that
crosses three layers and alters a published response produces a pull request nobody can review,
because the decision inside it was never visible as a decision.

## What the input decides

| Input | Handling |
|-------|----------|
| An existing plan directory or phase file | Run it. No scoring: somebody already did this |
| An approved design document | Score it, but a large signal the design already covers does not fire the gate |
| A ticket URL or a free description | Score it, then take one of the three levels below |

An existing plan is run one phase at a time, in the order its index gives, and each phase's `status`
is set as it completes. `atk:plan` writes every phase as `pending` and does not come back, so a plan
left full of `pending` after the work is done is this skill's omission rather than that one's.

## The three levels

| Level | Signals | What the skill does |
|-------|---------|---------------------|
| Large | Any one of the large signals below | Stop. Go to `atk:design-doc`. Change no file |
| Small | No large signal, and: at most three files, one layer, no new entity | Write the code |
| Medium | Everything else | Call `atk:plan --inline` and continue from its confirmation |

Read the rows in that order. Large is checked first because one signal there ends the scoring
whatever else is true, and medium is last because it is the default: work that is not large and not
small is medium, so nothing falls through to being levelled by feel.

The levels are ordered by what is at risk, not by how long the work takes. A change that takes a
week inside one layer and touches nothing anyone else reads is medium. A change that takes an hour
and alters a published response shape is large.

## The large signals, checked by path

A large signal is checked against the paths the work will touch, never against how hard it feels.
Difficulty is a judgement that moves with whoever is judging; a path is a fact. One signal is
enough, and finding one ends the scoring.

| Signal | Where it shows up |
|--------|-------------------|
| A schema changes | Migration directory, schema or entity definition, index definition |
| A public contract changes | API specification, generated client, published types, event or message schema, anything read outside this repository |
| A shared module changes | The directories the Layers section of the profile names shared, common, or core |
| More than one service is touched | Two or more of the apps the Commands section lists a command set for |
| An architectural choice is still open | No path at all: two viable approaches in the description, or an unanswered question in the ticket |

The last one has no path to check, which is exactly why the other four are written as paths. When
the first four are clean and the work still comes down to picking between two ways of building it,
that is the large gate too, and the reason to stop is unchanged: the choice belongs to a role.

A medium plan that comes back from `atk:plan` naming a migration file, a schema definition, or a
contract file was scored wrong. Re-score it, and go large.

That re-score does not apply to work handed in as an approved design document. There the schema or
contract change is the thing that was approved, so a large signal is expected, and sending it back
to `atk:design-doc` would return it to the skill that produced it. Check instead that the design
actually covers the signal found: a migration the design never mentions is new, and it goes large
like any other.

## Medium: how the call works

Call `atk:plan --inline` with the ticket or description, and the layer when `--layer` was passed.
The flag exists for exactly this: it tells that skill it was called by another skill, so it writes
the plan directory, summarises the phases, and hands back instead of stopping as a deliverable.

That skill shows the directory path and the ordered phase list and takes the one confirmation
itself, so do not ask again: a second prompt about the same plan, one line after the first, is how a
consent prompt stops being read. Start writing code on the yes.

A no is an instruction to revise, not to abandon. Send the plan back for rework, and let that skill
ask again. Only the person ends the run.

Then work through the phases in order, setting each phase's `status` as it completes.

## Why medium carries on and large stops

Rule 3 in `shared/team-roles.md` forbids a skill from deciding what a role owns. It does not forbid
drafting, and a plan is a draft: "these are the steps I intend to take" is a statement about the
author's own next hour, and any of it can be changed by the reviewer at no cost.

The large signals are different in kind. A schema, a published contract, a shared module, a second
service, an open architectural question: each of these is a commitment other people will build on,
and each is expensive to reverse once code exists against it. That is a decision, it belongs to the
Tech Lead, and `atk:design-doc` is where it gets made and recorded.

So the plan written at the medium level still carries `status: DRAFT` and still names an approver.
The difference is that it does not gate the work, because nothing in it binds anyone else.

## What this file is not

It is not a place to sequence work. Levels and signals live here; phases, steps, and the order of
files live in `atk:plan` and in the plan directory it writes. A template for phases appearing in
this directory means the gate has started doing the planning it exists to delegate.
