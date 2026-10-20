# Answering a design's open questions

Loaded by `atk:design-doc` under `--answer`. Step 4 ends every design with its open questions and the
person who must answer each, and a design in review collects those answers over days: in a meeting,
in a pull request comment, in a chat. Without this mode each answer is a separate "update the design"
in a separate session, and nothing says where it goes, who gave it, or what else it changed.

This mode records what a person answered. It never answers a question itself: a question the
repository could have settled is not open, and one a role owns is that role's, per rule 3 of
`shared/team-roles.md`.

Each session that records answers is a run of its own with a trace of its own, under the design's
path as its subject, per `shared/run-trace.md`. An answer it asks for is a `gate` line, never
`corrected by hand`.

## What it reads

A design under `docs/records/design/`, resolved per `shared/artifact-paths.md`, and the ADR it links
when one was written. Without a path, list the designs at `DRAFT` or `IN REVIEW` and ask which one.
Where there is none, say so and stop.

## Before any edit

Each check stops or changes the run before a file is touched.

- **Not a design of this kit.** A path outside the project root, or a file with no front matter
  `status` and no open questions section, is refused in one line: there is nowhere to record an
  answer.
- **A spike record.** Refused in one line: it recommends, and its question is answered by the design
  that follows it.
- **Retired.** A design at `SUPERSEDED` is refused in one line, naming the design that replaced it.
- **Approved.** The approver signed the version on disk, and from `APPROVED` a design and its ADR
  are not edited, per `## Output` of `SKILL.md`. Say so and stop. A changed decision is a new design
  and a new ADR that supersede these, per Before writing in `shared/artifact-paths.md`, written by a
  plain run, `atk:design-doc <requirement-path>`, with the answers given to it as input.
- **Draft or in review.** Edit in place. At `IN REVIEW`, say in the session that the reviewers and
  the approver named in the design are reading an older version, and who they are.

A design with no open question left and no objection still `Open for <role>` is said, and the run
stops.

## Collecting the answers

List every open question, numbered, each with the person it names and the option or section it
blocks, and after them every objection of `Pre-review objections` still `Open for <role>`, with its
ID and the person who holds that role, per `references/role-challenge.md`. Then ask in one turn, per `shared/host-capabilities.md`, which are answered and what each
answer is. Answers already in the prompt are taken from there, and only what they leave unclear is
asked about.

What is recorded per answer:

| Field | Holds |
|-------|-------|
| Question | As written in the design, unchanged |
| Answer | Verbatim, as the person gave it. A summary is a second author |
| Answered by | The person who answered |
| Date | The date of the answer, or the date it was recorded, saying which |
| Relayed by | The person who brought the answer here, when that is not the person who answered |

"Verbatim" never means keeping a secret or a real person's data. A password, a token, an internal
host, a client's email address is replaced with `<redacted: kind>`, as
`skills/qa/references/test-run.md` does for a run record under The data a record must not carry, and
the session says what was redacted by kind, never by repeating it.

An answer from somebody other than the person the question names is recorded, and the record says
so; whether it settles the question is the approver's call. A question answered only in part stays
open, with the part that was answered recorded beside it. When the person does not say who answered,
ask: a record with no answerer is the chat thread again.

## Where it goes

The question leaves the open questions section, and the record goes into an `Answered` subsection at
its end, in the table above, so every answer to the design sits in one place. An answer to an
objection also replaces its `Open for <role>` with `Settled by <name>, <date>`, and its row goes into
the same table with the objection's ID as the question, so nothing reads open in one place and
answered in the other.

Each section the answer changes is then edited to match it, and the edit names the question it came
from, so a reader can tell what the author designed from what an answer put there. A section the
answer does not change is not touched.

- **An answer that chooses among the options**, or asks for one the design did not compare, changes
  step 3 and the chosen approach of step 4. A new option is scored against the same criteria as the
  others, since an option added without a score is a preference.
- **An answer that changes the decision** changes the ADR with it, while the design is not
  `APPROVED`: its decision, its consequences, and its rejected alternatives.
- **An answer that opens a question the design cannot settle** is a new open question, with the
  person who must answer it.
- **Under `Contract: first`**, an answer that changes a table, an enum, an endpoint, or a rule
  changes the list of reference documents step 4 names, and the session says which reference
  documents `atk:spec --from` now has to revisit.

## After the edits

Read the design back as a whole. Every term an answer renamed is searched for in the rest of the
design and the ADR, and every `path:line` a changed section cites is checked against the code again.
What the read-back corrects outside the sections the answers changed is named as a correction,
apart from the answers.

The status stays where it was, `DRAFT` or `IN REVIEW`. Under `IN REVIEW` the session names who has to
read it again and what changed. Where the answers changed the chosen approach and the design carries
`Pre-review objections`, the session says those were raised against the approach it replaced, so a
reviewer reads them as history rather than as cover for the new one.

The session gets the questions answered, the sections edited, and the questions still open with
their names.

## Definition of done

- [ ] `## Before any edit` ran first, and an `APPROVED` design was not edited.
- [ ] No question was answered by the skill; every answer came from a person and is verbatim.
- [ ] No secret and no real person's data was written; each is `<redacted: kind>`.
- [ ] Every record carries the question, the answer, who answered, the date, and who relayed it when
      that is someone else.
- [ ] Each answered question left the open list, a settled objection reads `Settled by`, and each
      record is in the `Answered` subsection.
- [ ] Every section the answer changed was edited and names the question; a new option was scored;
      the ADR moved with a changed decision.
- [ ] The read-back ran, and any correction outside the answered sections is named as one.
