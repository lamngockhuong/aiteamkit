# Role challenge

Loaded by `atk:design-doc` under `--challenge`, in step 5, before the design is set to `IN REVIEW`.
One agent per role that must sign the design reads the draft cold and raises what that role would
raise, so the objections a reviewer brings to the meeting reach the author first.

The procedure the pass shares with `atk:plan --challenge` is `shared/independent-challenge.md`. This
file holds what is particular to a design: which roles run, the questions each brings, who an open
objection is for, and where the result sits in the design. The approvers named in the front matter
still review the design.

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

## Answering an objection

Per `shared/independent-challenge.md`, with the role as the lens. An objection left open reads
`Open for <role>`, naming the role, as `Open for the Tech Lead` below: it stays in the table for
the person who holds that role to settle in the review.

The chosen option is the Tech Lead's decision. An objection against it is answered by strengthening
the comparison in step 3 or left open for the Tech Lead, never by switching the option quietly.

## In the design

The `Pre-review objections` section of `shared/independent-challenge.md`, after the risks and before
the ADR link, opening with one line: "Raised by one agent per role over the draft; simulated
perspectives, not a review and not an approval." Then:

| ID | Role | Section | Objection | Answer |
|----|------|---------|-----------|--------|
| O1 | QA | Error handling | The retry path has no observable outcome to assert | Changed: the retry now records an attempt count in the audit table |
| O2 | TL, SRE | Migration | The backfill locks the orders table for the length of the run on real data | Open for the Tech Lead |

Below the table, what `shared/independent-challenge.md` asks for: the agents that ran, any role
left out and why, and how many objections were dropped as unfounded.
