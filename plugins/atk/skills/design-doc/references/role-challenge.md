# Role challenge

Loaded by `atk:design-doc` under `--challenge`, in step 5, before the design is set to `IN REVIEW`.
One agent per role that must sign the design reads the draft cold and raises what that role would
raise, so the objections a reviewer brings to the meeting reach the author first.

It is a pre-review, not a review. The agents are passes by the same model wearing a role's
questions, not the colleagues who hold the role, and the artifact says so. The approvers named in
the front matter still review the design, and nothing here changes its approval state.

## Which roles

The roles in the design's list of required reviewers from step 5, one agent each, plus a security
lens when the design adds a trust boundary, stores personal data or credentials, touches money, or
changes a permission. At most five agents. Where the list would give more, keep the roles that own a
sign-off and say which were left out.

| Role | The questions it brings |
|------|-------------------------|
| TL | Does the chosen option survive its worst case, not only its best? Where is the coupling the comparison did not score? How far back does the rollback really go? |
| BrSE/BA | Is every acceptance criterion served by something in the design? Does the design build behaviour nobody asked for, or change what the client sees without saying so? |
| QA | Can each behaviour be observed from outside? What test data and environment does it need that do not exist yet? |
| SRE | In what order does it deploy, how long does the migration take on real data, what is watched afterwards, and what happens to capacity? |
| Security lens | Which trust boundary does it cross or add, what does it store that it did not before, and who can now do what they could not? |

A team whose override for `design-doc` names other roles or other questions uses those instead, per
rule 7 of `shared/team-roles.md`.

## What each agent gets

The draft design, the requirement it answers, the reference documents it names, and its own row of
the table above. Nothing of the conversation that produced the design, and nothing another agent
returned. An agent that has read the author's reasoning agrees with it, which is the one result this
pass exists to avoid.

The number of agents and the concurrency cap are stated before the first one is spawned, and the
cap is the machine's, under the policy for independent reviewers in `shared/host-capabilities.md`.
Where the harness cannot run agents in parallel, the role passes run one after another in this
session, and the design says they shared the author's context, which makes them weaker.

## What an agent returns

At most five objections, or none. Each one names the section of the design it is about, the failure
it predicts, and the evidence: a `path:line`, an acceptance criterion ID, or a line of the design
itself. An objection with no named failure is a feeling, and it is dropped.

## What the calling agent does with them

Check each objection against the design and the code before keeping it. Drop one that rests on
something the design does not say or the code does not do, and count the drops. Merge objections two
roles raised about the same failure into one, carrying both roles.

Then answer each kept objection in one of two ways:

- **Changed.** The author changed the design in response. Name the section and what changed.
- **Open for the role.** The objection questions a decision a role owns, or the author disagrees.
  It stays in the table for the person who holds that role to settle in the review.

The chosen option is the Tech Lead's decision. An objection against it is answered by strengthening
the comparison in step 3 or left open for the Tech Lead, never by switching the option quietly.

## In the design

A section named `Pre-review objections`, after the risks and before the ADR link, opening with one
line: "Raised by one agent per role over the draft; simulated perspectives, not a review and not an
approval." Then:

| ID | Role | Section | Objection | Answer |
|----|------|---------|-----------|--------|
| O1 | QA | Error handling | The retry path has no observable outcome to assert | Changed: the retry now records an attempt count in the audit table |
| O2 | TL, SRE | Migration | The backfill locks the orders table for the length of the run on real data | Open for the Tech Lead |

Below the table: the agents that ran, any role left out and why, and how many objections were
dropped as unfounded. A reviewer reading a table with no drops and no open rows should be able to
tell that from a pass that found nothing.
