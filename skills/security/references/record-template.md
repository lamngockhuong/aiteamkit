# Record template

Loaded by `atk:security` in steps 4 and 5, and for the Output section. The verdicts, the
severities, the redaction rule, and the shape of the two artifacts the skill writes.

## Verdicts

| Verdict | The candidate | What happens to it |
|---------|---------------|--------------------|
| `CONFIRMED` | Names the entry point, the path to the sink with `path:line`, the control that is missing, and what an actor gains | A finding, at any severity |
| `PLAUSIBLE` | Names the mechanism, but whether it is reachable depends on configuration, deployment, or a caller the code cannot show | A finding at Medium or below, carrying the one check that would settle it and who can run it |
| `REFUTED` | Rests on something the code does not do | A non-issue: one line with the line of code or the control that rules it out |

Refute on evidence only: the value is bound, the handler checks the owner, the route is not
exposed. "Nobody would try that" refutes nothing. Keeping the non-issues is the difference from a
code review, where a refuted candidate is dropped: a client asking whether a threat was considered
wants to see that it was, and why it does not apply.

## Severities

Decided against the assets of step 1, not against how alarming the category sounds.

| Severity | Meaning |
|----------|---------|
| Critical | Reachable now by an actor with no special access, and exposes credentials, personal data, money, or control of the system |
| High | Reachable by a signed-in actor, or needs one further condition the code does not prevent, with the same impact |
| Medium | Limited impact, or a condition outside the actor's control, or a missing layer where another control still holds |
| Low | Defence in depth; nothing is reachable through it today |

An open Critical or High finding is a blocking item for `atk:release`. Whether the release goes
anyway is the go decision, which the PM owns; this record states the finding, not the verdict.

## Redaction

Print a secret as `<REDACTED>`, keeping only a public prefix that says what kind of credential it is
when that helps the reader triage, such as `AKIA` or `ghp_`. Never its length, never its last
characters, never the password segment of a connection string. An environment variable is named,
never its value. The same rule applies to the session, the record, and any ticket, because a secret
echoed into any of them is a secret in a second place.

## The security record

Front matter per `shared/artifact-paths.md`, then these sections in order:

1. **Scope.** What was reviewed: the branch, the range, the version, or the paths, and the commit it
   was read at. What was left out and why.
2. **Assets and boundaries.** The assets, actors, entry points, and trust boundaries of step 1, each
   cited.
3. **Checks run.** One row per automated check: the command, whose it was (the project's gate, a
   project script, or this skill's choice), the result, and any check not run with the reason.
4. **Findings.** One block per finding, ranked Critical first, with an ID `SF1`, `SF2` in that order:

   | Field | Content |
   |-------|---------|
   | Severity and verdict | `High`, `CONFIRMED` |
   | Category | The STRIDE question and the OWASP ID |
   | Where | `path:line` of the entry point and of the sink |
   | What an actor does | The input or the request, in one or two sentences |
   | What they gain | The impact, against a named asset |
   | Suggested control | What would close it, as a suggestion for whoever fixes it |
   | Settled by | For `PLAUSIBLE` only: the check and who can run it |

5. **Considered and ruled out.** The `REFUTED` candidates, one line each with the evidence.
6. **Boundaries with nothing found.** Each boundary that was walked and produced no candidate.
7. **Checklist.** One row per item: ID, item as written, status, evidence. A supplied checklist
   keeps its own IDs and wording, and its own order.
8. **Residual risk.** Every finding that ships unfixed:

   | Finding | Severity | Why it ships | Accepted by | Date |
   |---------|----------|--------------|-------------|------|

   `Accepted by` and `Date` are left empty for the person who accepts it. The skill writes the first
   three columns only.

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
