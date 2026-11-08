# Record template

Loaded by `atk:security` in steps 4 and 5, and for the Output section. The verdicts, the
severities, the redaction rule, and the shape of the two artifacts the skill writes.

## Verdicts

| Verdict | The candidate | What happens to it |
|---------|---------------|--------------------|
| `CONFIRMED` | Names the entry point, the path to the sink with `path:line`, the control that is missing, and what an actor gains. For a finding in what the project installs, a malicious package or a vulnerable one, the `path:line` is the lockfile or manifest line that pulls it in, and a scanner the record names is the evidence | A finding, at any severity |
| `PLAUSIBLE` | Names the mechanism, but whether it is reachable depends on configuration, deployment, or a caller the code cannot show. Says which half was traced: the sink, with no entry shown reaching it; the entry, with no sink shown behind it; or the mechanism only, neither end traced | A finding at Medium or below, carrying the one check that would settle the rest and who can run it |
| `REFUTED` | Rests on something the code does not do | A non-issue: one line with the line of code or the control that rules it out |

Refute on evidence only: the value is bound, the handler checks the owner, the route is not
exposed. "Nobody would try that" refutes nothing. A refutation that rests on how a dependency, an
external action, or a service behaves cites that behaviour's source, its code or its documentation,
with the version read; without one the candidate is `PLAUSIBLE`, and reading that source is the check
that settles it.

Every verdict says what it was checked against: the control from the global controls of step 1, or
the control at that line, that was looked at. For `CONFIRMED` and `PLAUSIBLE`, why that control does
not cover the case, which is the narrow gap step 1 named or a route the control never sees. For
`REFUTED`, the control that does cover it. A verdict with nothing checked against it is a guess at
where the project's defences are.

Every finding also says what kind of evidence carries it:

| Evidence | The finding rests on |
|----------|----------------------|
| `tool` | A scanner the record names reproduces it |
| `spec` | It contradicts a reference document or a design of this project, an authorisation matrix among them, read from the locations step 1 reads; the clause is quoted with its path |
| `judgment` | A control flow traced by reading the code, with the `path:line` of each step |

Keeping the non-issues is the difference from a code review, where a refuted candidate is dropped: a
client asking whether a threat was considered wants to see that it was, and why it does not apply.

## Reachability

Every finding states the least access an actor needs to reach it, as one value from this list,
drawn from the actors of step 1:

| Reachable by | The actor needs |
|--------------|-----------------|
| Anonymous | Nothing: no account, no session, no action by anyone else |
| Anonymous, with a victim's action | Nothing of their own, but a signed-in victim has to open a link, a page, or a file the actor controls |
| Any signed-in user | An ordinary account, of the kind anyone can register or be given |
| One account's credential | The credential of one particular account, theirs or one they took |
| An administrator | A role that may already change what the finding exposes |
| A configuration or a second flaw | A setting the project does not ship, or another weakness first; the finding names which |
| Whoever controls a dependency | No access to the system at all: they publish or control a package, an action, or an image the project installs, and the install runs what they wrote |
| Anyone who can read the repository | Read access to the code or its history, and nothing else: a secret committed there is theirs to use, whoever they are |

The value is the least access, not the most likely attacker: a flaw an administrator can reach and an
anonymous caller can too is `Anonymous`. Where the path is not traced to an entry, a `PLAUSIBLE`
finding with only its sink traced, the value is the least access the mechanism would need, and the
settling check says so.

## Severities

Decided against the assets of step 1 and the Reachable by field of the finding, not against how
alarming the category sounds.

| Severity | Meaning |
|----------|---------|
| Critical | Reachable now by an actor with no special access, and exposes credentials, personal data, money, or control of the system |
| High | Reachable by a signed-in actor, or needs one further condition the code does not prevent, with the same impact |
| Medium | Limited impact, or a condition outside the actor's control, or a missing layer where another control still holds |
| Low | Defence in depth; nothing is reachable through it today |

An open Critical or High finding, or an open chain ranked Critical or High, is a blocking item for
`atk:release`. Whether the release goes
anyway is the go decision, which the PM owns; this record states the finding, not the verdict.

## Redaction

Print a secret as `<redacted: kind>`, per rule 9 of `shared/team-roles.md`, with the kind of
credential in the label when that helps the reader triage, such as `<redacted: aws access key>` or
`<redacted: github token>`. Never a prefix of the value: `ghp_<redacted: token>` leaves `ghp_` where
the commit scan reads a value, so a correctly redacted record could not be committed. Never its
length, never its last
characters, never the password segment of a connection string. An environment variable is named,
never its value. The same rule applies to the session, the record, and any ticket, because a secret
echoed into any of them is a secret in a second place.

## The security record

Front matter per `shared/artifact-paths.md`, then `In short` per The opening summary in
`shared/plain-writing.md`: what was reviewed, what was found with the counts by severity, the worst
finding told as what an actor does and gains, a chain when a chain is worse than any finding of
it, what was not checked, and who has to fix or accept what. Then these sections in order, their
prose following the same file:

1. **Scope.** What was reviewed: the branch, the range, the version, or the paths, and the commit it
   was read at. What was left out and why.
2. **Assets and boundaries.** The assets, actors, entry points, and trust boundaries of step 1, each
   cited, and the global controls step 1 found, each with its `path:line` and the narrow gap it
   leaves.
3. **Checks run.** One row per automated check: the command, whose it was (the project's gate, a
   project script, or this skill's choice), the result, and any check not run with the reason.
4. **Findings.** One block per finding, ranked Critical first, with an ID `SF1`, `SF2` in that order.
   Each block opens with a title that names the weakness and the feature it sits in, such as
   `SF1: Order history readable by another customer`. The title never holds a path, a line, a
   backtick, or a name copied from the code, because it is what travels into a ticket and the
   session summary, where the code is not shown and the next reader may be outside the team. The
   fields below carry the code.

   | Field | Content |
   |-------|---------|
   | Severity and verdict | `High`, `CONFIRMED` |
   | Reachable by | One value of Reachability above |
   | Category | The STRIDE question and the OWASP ID with its edition, such as `A01:2025` |
   | Evidence | `tool`, `spec`, or `judgment`, per Verdicts |
   | Checked against | The control checked, with `path:line`, per Verdicts |
   | Where | `path:line` of the entry point and of the sink |
   | What an actor does | The input or the request, in one or two sentences |
   | What they gain | The impact, against a named asset |
   | Suggested control | What would close it, as a suggestion for whoever fixes it |
   | Settled by | For `PLAUSIBLE` only: which half was traced, the sink, the entry, or the mechanism only, per Verdicts; the check that settles the rest; and who can run it |

   **Chains.** After the findings, one block per chain: findings that together reach an impact
   none of them reaches alone, such as a disclosed identifier that makes a guessable reset link
   usable. Drawn only from findings already ranked above, never from a candidate that was refuted.
   A chain with a `PLAUSIBLE` link is no stronger than that link, per its Severity field.

   | Field | Content |
   |-------|---------|
   | ID | `CH1`, `CH2`, ranked by their own severity |
   | Title | As for a finding: the weakness and the feature, nothing copied from the code |
   | Findings | The finding IDs it needs, in the order an actor uses them |
   | How they combine | Each enables the next, or all of them together. Where several findings could each serve at one step, they are alternatives at that step, written `SF2 \| SF5`, never a chain of their own |
   | Reachable by | One value of Reachability above: at a step with alternatives, the least access among them; across the steps, the most access any step needs that an earlier step does not already give |
   | What they gain | The impact, against a named asset |
   | Severity | Ranked on its own against its Reachable by and the assets of step 1, as a finding is. A chain with a `PLAUSIBLE` link is ranked Medium or below, like that link, and the check that settles that link is the chain's too |

   A chain's severity never changes the severities of its findings: each stays as ranked, so a fix
   that closes the chain, per Residual risk below, is visible without the finding's own rank moving.
   A record with no chain says so in one line.

5. **Considered and ruled out.** The `REFUTED` candidates, one line each with the evidence.
6. **Boundaries with nothing found.** Each boundary that was walked and produced no candidate.
7. **Checklist.** One row per item: ID, item as written, status, evidence. A supplied checklist
   keeps its own IDs and wording, and its own order.
8. **Residual risk.** Every finding that ships unfixed:

   | Finding | Severity | Why it ships | Accepted by | Date |
   |---------|----------|--------------|-------------|------|

   `Accepted by` and `Date` are left empty for the person who accepts it. The skill writes the first
   three columns only. Every open chain takes a row of its own, `CH1` with the chain's severity,
   because accepting it is accepting what the chain reaches, which no finding's row shows. A finding
   that belongs to a chain names the chain ID in its `Finding` cell, `SF3 (CH1)`. A chain closes
   only when some step of it is left with no route: every alternative at that step fixed. Until
   then it keeps its row, and a fixed alternative is named beside the chain ID as no longer one.

   A finding fixed before the record is committed takes no row. It takes a line under the table
   instead, naming the finding ID and the fix, a commit or a pull request, while its block under
   Findings stays as written: the record still shows what was found at the commit it was read at,
   and the reader sees why it does not ship.

9. **Open questions.** Each with the name of the person who must answer it.

## The threat model

Front matter per `shared/artifact-paths.md`, named after the feature, then:

1. **Covers.** The paths the model describes, one per line. `atk:help` compares the `updated` date
   with the last merged commit touching them.
2. **Assets, actors, entry points.** As in the record.
3. **Data flow.** Where a request crosses more than two boundaries, one sequence diagram of it, the
   sequence shape of `shared/diagram-conventions.md`, and nothing the table below does not also
   say.
4. **Threats.** One row per boundary and STRIDE question that applies: the threat, the control that
   answers it with `path:line`, or `none` with the finding ID of the record that reported it.
5. **Assumptions.** What the model takes as given, a gateway that authenticates, a network that is
   private, each with the person who can confirm it.

When the model is updated, change the rows that moved and nothing else, and set the front matter
back to `IN REVIEW` when a control was removed or a threat added. A model rewritten whole on every
run cannot show its reviewer what changed.
