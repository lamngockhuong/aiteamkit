# Answering a design's open questions

Loaded by `atk:design-doc` under `--answer`. Step 4 ends every design with its open questions and the
person who must answer each, and a design in review collects those answers over days: in a meeting,
in a pull request comment, in a chat. Without this mode each answer is a separate "update the design"
in a separate session, and nothing says where it goes, who gave it, or what else it changed.

This mode records what a person answered. It never answers a question itself: a question the
repository could have settled is not open, and one a role owns is that role's, per rule 3 of
`shared/team-roles.md`.

Each session that records answers is a run of its own with a trace of its own, the design's path as
its subject, which is the path the trace of the run that wrote it ends on, per `shared/run-trace.md`.
Steps 1 to 5 share the line `step 1-5 answer mode`. An answer it asks for, or takes from the prompt,
is a `gate` line, never `corrected by hand`.

The other flags: `--challenge` is refused in one line, since the challenge belongs to step 5 of the
run that writes a design, before its review, and this mode runs during review. `--out`, `--options`
and `--adr` are refused in one line, since the mode edits a design that exists, compares no new set
of options, and writes no ADR alone. `--no-adr` is ignored, saying why: the mode edits the ADR the
design links, and writes none where there is none. `--lang` is ignored, saying why: answers go in
the design's own language.

A run with nobody to ask, a headless one, records the answers its prompt holds and asks nothing.
Where the prompt holds none, or does not name who answered, it records nothing and says what it
lacked.

## What it reads

A design under `docs/records/design/`, resolved per `shared/artifact-paths.md` with its language
branch, and the ADR it links when one was written. Without a path, list the designs at `DRAFT` or
`IN REVIEW` and ask which one. Where there is none, say so and stop.

## Before any edit

Each check stops or changes the run before a file is touched.

- **Not a design of this kit.** A path outside the resolved design directory, a requirement or a
  plan index among them, is refused in one line, and so is a file there with no front matter
  `status` and no `## Open questions` section: there is nowhere to record an answer. A design
  written before that heading was named, with its questions under a heading of its own, is asked
  about in the turn below: the person names the section, and the run records under it.
- **About another repository.** A design is a project-level record, and the code it cites may sit in
  a member. Before any citation is checked, each cited path is resolved in the repository the
  design names for it, per A project that spans several repositories in `shared/artifact-paths.md`;
  where the design is about another repository altogether, the test of
  `## Is this plan about this repository` in `skills/plan/references/plan-review-mode.md` applies,
  and on positive evidence the run stops there.
- **A spike record.** Refused in one line: it recommends, and its question is answered by the design
  that follows it.
- **Retired.** A design at `SUPERSEDED` is refused in one line, naming the design that replaced it.
- **Approved.** The approver signed the version on disk, and from `APPROVED` a design and its ADR
  are not edited, per `## Output` of `SKILL.md`. Say so and stop. A changed decision is a new design
  and a new ADR that supersede these, per Before writing in `shared/artifact-paths.md`, written by a
  plain run, `atk:design-doc <requirement-path>`, with the answers given to it as input.
- **Draft or in review.** Edit in place. At `IN REVIEW`, say in the session that the reviewers and
  the approver named in the design are reading an older version, and who they are.
- **Any other status**, a project template's own such as `Accepted` or `On hold`, or none: say it
  and stop, naming the approver, who says which of the four it is.

A design with no open question left, no objection still `Open for <role>`, and no review request in
the prompt is said, and the run stops.

## Collecting the answers

List every open question, numbered, each with the person it names and the option or section it
blocks, and after them every objection of `Pre-review objections` still `Open for <role>`, with its
ID and the person who holds that role, per `references/role-challenge.md`. Then ask in one turn,
per `shared/host-capabilities.md`, which are answered and what each answer is. Answers already in
the prompt are taken from there, and only what they leave unclear is asked about.

A request a reviewer made that the design never listed, an option to compare, a decision settled in
the review meeting, is taken the same way: its question is the request as the person states it,
with who asked it and the person who owns that decision, the Tech Lead for the chosen approach and
the ADR per `references/role-challenge.md` and rule 3 of `shared/team-roles.md`, and its answer is
what was decided and by whom. A decision from anyone but that owner or the approver is held as the
next paragraph holds an answer from the wrong person. One that is not decided yet goes into
`## Open questions` with the person who must answer it, and nothing is edited from it.

What is recorded per answer:

| Field | Holds |
|-------|-------|
| Question | As written in the design, unchanged, or a review request as the person stated it |
| Answer | Verbatim, as the person gave it. A summary is a second author |
| Answered by | The person who answered, as the Name column of the Team section of `.atk/profile.md` writes them; a person the table does not hold, by name and role only |
| Date | The date of the answer, or the date it was recorded, saying which |
| Relayed by | The person who brought the answer here, when that is not the person who answered, written the same way |

"Verbatim" never means keeping a secret or a real person's data. A password, a token, an internal
host, a client's email address is replaced with `<redacted: kind>`, as
`skills/qa/references/test-run.md` does for a run record under The data a record must not carry, and
the session says what was redacted by kind, never by repeating it. The names in `Answered by` and
`Relayed by` are the exception that list makes for the team's own names, and never an email address
or a handle. The mask holds for every section edited from an answer, not only for the record; a
host the decision itself rests on is named by its role, `the payment gateway`, rather than masked
away.

An answer from somebody other than the person the question names is recorded, and the record says
so; whether it settles the question is the approver's call. Until the approver says so, the question
stays open, its row reads `answered by <name>, not <named person>`, and nothing is edited from it.
The approver's ruling is itself an answer, given to a later `--answer` like any other and recorded
as `settled by <approver>` on that row; from it the question leaves the open list and its sections
are edited. A question answered only in part stays open too, its row in `Answered` marked
`partial`. When the person does not say who answered, ask: a record with no answerer is the chat
thread again.

## Where it goes

A settled question leaves the open questions section, and every record goes into an `Answered`
subsection at its end, in the table above, so every answer to the design sits in one place. An
answer to an objection from the person who holds its role, or the approver's ruling on it, also
replaces its `Open for <role>` with `Settled by <name>, <date>`, and its row goes into the same
table with the objection's ID as the question, so nothing reads open in one place and answered in
the other.

Each section the answer changes is then edited to match it, and the edit names the question it came
from, so a reader can tell what the author designed from what an answer put there. A section the
answer does not change is not touched.

- **An answer that chooses among the options**, or asks for one the design did not compare, changes
  step 3 and the chosen approach of step 4. A new option is scored against the same criteria as the
  others, since an option added without a score is a preference.
- **An answer that changes the decision** changes the ADR with it, while the design is not
  `APPROVED`: its decision, its consequences, and its rejected alternatives. Where the design has
  no ADR, under `--no-adr` or a draft that never reached step 5, the session says the decision
  changed with no ADR to carry it.
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
- [ ] At `IN REVIEW`, the session named the reviewers and the approver reading an older version.
- [ ] No question was answered by the skill; every answer came from a person and is verbatim.
- [ ] No secret and no real person's data was written; each is `<redacted: kind>`.
- [ ] Every record carries the question, the answer, who answered, the date, and who relayed it when
      that is someone else.
- [ ] Each settled question left the open list, a settled objection reads `Settled by`, and each
      record is in the `Answered` subsection; an answer from someone other than the named person, or
      a partial one, left its question open and edited nothing until the approver settled it.
- [ ] Every section the answer changed was edited and names the question; a new option was scored;
      the ADR moved with a changed decision; under `Contract: first`, the session named the
      reference documents `atk:spec --from` has to revisit.
- [ ] The read-back ran, and any correction outside the answered sections is named as one.
