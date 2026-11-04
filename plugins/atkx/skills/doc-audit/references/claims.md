# Claims, verdicts and evidence

Loaded by `atkx:doc-audit` before the full audit, and quoted into its agent prompt. It says what a
checkable claim is, the two types a claim can have, the three verdicts and what counts as evidence
for each, who answers a claim nobody can settle, and how the verdict table is checked and counted
when Node is missing.

## A checkable claim

A sentence, a table row, a list item or a diagram edge that states something a source could prove
false: what the system does, what a field holds, which status follows which, which error a call
returns, what limit applies, what was required and why. One claim per fact: a table row giving an
endpoint's method, path and status codes is three claims when each can be wrong on its own.

Not a claim: a heading, a sentence about the document itself ("this page describes"), an opinion
with nothing to compare it with ("the flow is simple"), an instruction to the reader ("run the
tests first"), and a sentence that only repeats a claim already listed, which is listed once with
the first line it appears on.

A claim keeps the line it starts on. A claim spread over a table row or a list item takes the line
of the row or the item.

## The two types

| Type | What it states | Where its source usually is |
|------|----------------|------------------------------|
| `BEHAVIOUR` | What the system does: a field, a value, a status, a transition, an error, a limit, a call | The code, inside the repository, under the code root |
| `INTENT` | What was wanted and why: a requirement, a reason, a decision, a rule the business asked for | A requirement source: a path `--source` names, an issue of the repository's own tracker, a plan, a record, a commit message |

A sentence can carry both, "the status becomes `CLOSED` because finance asked for it": list the
two halves as two claims.

## The three verdicts

Every claim gets exactly one. There is no fourth, and no "probably correct" or "partly wrong": a
claim that is right in one half and wrong in the other is two claims.

| Verdict | When | Evidence column | Settled by column | Owner column |
|---------|------|-----------------|-------------------|--------------|
| `CORRECT` | The source says what the claim says | A `path:line` of the source, or a quoted line of it in double quotes, masked per `references/safety.md` | `-` | `-` |
| `WRONG` | The source says something else | The same, plus what the source actually says | `-` | `-` |
| `UNVERIFIABLE` | No source the run may read settles it | Why not: the source is outside the repository, is a file that is not read, is a tracker that answered nothing, or does not exist | The source that would settle it, as specifically as the run can name it | The person who must answer, filled by the session |

A claim that something is absent, no column, no call, no button, is settled by a search rather than
a line: its evidence opens `searched <what> in <where>: none`, naming what was looked for and
where, so a reader can run the same search; a `WRONG` verdict adds what the source says after it.

Evidence is the line that settles the claim, not the line that mentions the same word. A claim
about what an endpoint returns is settled by the code that builds the response, not by a test
fixture or a comment above it; a comment is a claim too, and can be wrong in the same way.

A `BEHAVIOUR` claim whose code root is missing is `UNVERIFIABLE`, its reason that the code was not
there, and the report says so once rather than per claim. An `INTENT` claim with no requirement
source given is `UNVERIFIABLE` with the source named, unless a plan, a record or a commit message in
the repository settles it.

## The owner of an `UNVERIFIABLE` claim

Found by the session, never by an agent, and written by name only:

1. The Team section of `.atk/profile.md`, when the project has one: the role that owns the kind of
   source named, the BrSE or BA for a requirement, the Tech Lead for a design reason.
2. Otherwise the git author of the document lines the claim rests on, by
   `git blame --incremental -L <line>,<line> -- <document>`, its `author` line. The incremental
   form prints commit headers and no line of the file, on every git version, and it blames the
   file as it is on disk, so the line numbers are the agent's. The header also carries the
   author's and committer's email addresses and the commit's subject: the session sees them, as it
   would in any `git log` of the team's own repository, and never writes them anywhere, the email
   by rule 3 below. A line whose author is `Not Committed Yet`, or a document git does not track,
   where the command fails, has no author yet: rule 3 applies, and the report's Notes say why.
3. Never an email address, never a handle, and never "the team". A name that cannot be found is
   written as the role that must answer, `Requirement owner`, and the report says the name was not
   found.

## Checking the table by hand

`scripts/tally.mjs` validates the verdict table and counts it. Where Node is missing, the session
does the same by hand, and the report says the tally was done by hand:

1. Every row has the nine cells of the table in `references/full-audit.md`.
2. Every `Type` is `BEHAVIOUR` or `INTENT`, every `Verdict` one of the three above.
3. Every `CORRECT` and `WRONG` has evidence holding a `path:line`, a quoted line, or a search that
   found none.
4. Every `UNVERIFIABLE` has a `Settled by` and an `Owner`, and the owner is a name or a role, with
   no `@` in it and not "the team".
5. Every `Second read` cell agrees with its verdict, per `references/full-audit.md`.
6. Before reporting, the two checks `tally.mjs --final` makes: every row whose first verdict was
   `WRONG` carries a second read, and per document the `CORRECT` verdicts read a second time number
   at least what `references/re-verify.md` asks, a tenth rounded up and at least three, or all of
   them when there are fewer.
7. Count per document: claims, each verdict, each type, and the second reads, then add the documents
   together. Count twice, in two passes, and keep the count only when the two agree: the pilot's
   agent miscounted its own table, which is why the count belongs to a script where there is one.
