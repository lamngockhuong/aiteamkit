# Independent challenge

How a written draft is put in front of agents that read it cold before any person reviews it: what
each agent is given, what it returns, and what the calling agent does with what comes back.
Referenced from `skills/<name>/SKILL.md` and its references as `shared/independent-challenge.md`,
which is `../../shared/independent-challenge.md` relative to a skill file.

Cited by `design-doc` through `skills/design-doc/references/role-challenge.md`, where the lenses are
the roles that sign a design, and by `plan` through `skills/plan/references/plan-challenge.md`, where
the lenses are the ways a plan fails. One file rather than two, because the half below is the half
that makes a challenge worth running, and two copies of it would drift until one of the two passes
let its agents read the author's reasoning.

Each citer owns what is particular to its artifact: which lenses run and the questions each brings,
who settles an objection left open, and where in the artifact the result is written. Everything else
is here.

It is a pre-review, not a review. The agents are passes by the same model wearing a lens's
questions, not the colleagues who hold a role, and the artifact says so. Whoever the artifact names
as its approver still reviews it, and nothing here changes its approval state.

## What each agent gets

The draft artifact, the requirement it answers, the reference documents it names, its own row of
the citer's table of lenses, and read access to the repository, which is where the evidence below
comes from. Where the requirement has no document of its own, the artifact's section that states it
is the requirement. Nothing of the conversation that produced the artifact, and nothing another
agent returned. Each agent is told that it changes no file and starts nothing, per the rule that a
reviewer changes nothing in `shared/host-capabilities.md`, and on Claude Code is spawned as
`atk:read-only-reviewer`, whose tool list holds that rule. Its prompt also carries rule 9 of
`shared/team-roles.md`: the files it never opens or searches, quoted from Paths that are a finding
on their own in `shared/secret-scan.md` with the paragraph under that table on the two rows a search
pattern cannot express, and a secret it comes across cited by its path and key, its value
`<redacted: kind>`. An agent that has read the author's reasoning agrees with it, which
is the one result this pass exists to avoid.

The number of agents and the concurrency cap are stated before the first one is spawned, and the cap
is the machine's, under the policy for independent reviewers in `shared/host-capabilities.md`: read
the available memory and allow roughly 1.5 GB per agent running at once, the measure
`skills/review/references/review-rounds.md` uses. Where the memory cannot be read, run at most two
agents at once and say so in the statement. Where the harness cannot run agents in parallel,
the lens passes run one after another in this session, and the artifact says they shared the
author's context, which makes them weaker.

## What an agent returns

At most five objections, or none. Each one names the section of the artifact it is about, the
failure it predicts, and the evidence: a `path:line`, an acceptance criterion ID, or a line of the
artifact itself. An objection with no named failure is a feeling, and it is dropped.

An agent that dies or returns nothing at all is not a lens that found nothing, and the two read the
same unless they are told apart. Run it once more; if it dies again, the lens is named below the table
as not run, and it is not counted among the agents that ran.

## What the calling agent does with them

Check each objection against the artifact and the code before keeping it. Drop one that rests on
something the artifact does not say or the code does not do, and count the drops. Merge objections
two lenses raised about the same failure into one, carrying both lenses.

Then answer each kept objection in one of two ways:

- **Changed.** The author changed the artifact in response. Name the section and what changed.
- **Open.** The objection questions a decision a role owns, or the author disagrees. It stays in the
  table for the person the citer names to settle in the review.

A decision a role owns is never reversed by an answer here. An objection against one is answered by
strengthening the reasoning the artifact already gives, or left open for that role, never by
changing the decision quietly.

## In the artifact

A section named `Pre-review objections`, placed where the citer says, opening with one line:
"Raised by one agent per <role or lens> over the draft; simulated perspectives, not a review and not
an approval." Then a table with the columns `ID`, the citer's name for a lens, `Section`,
`Objection`, and `Answer`, one row per kept objection, numbered `O1`, `O2`.

Below the table: the agents that ran, any lens left out and why, and how many objections were
dropped as unfounded. Where nothing was kept, the section is still written, with `None kept.` in
place of the table and the same lines below it. A reviewer reading a table with no drops and no
open rows should be able to tell that from a pass that found nothing.
