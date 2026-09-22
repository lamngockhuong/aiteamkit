# Reference documents

Shared contract for the documents that describe the system as it currently is: the API contract per
resource, the schema per table, the behaviour per feature. Referenced from `skills/<name>/SKILL.md`
as `shared/spec-docs.md`, which is `../../shared/spec-docs.md` relative to a skill file.

Cited by `spec`, which writes them, and by `design-doc`, `implement`, `fix`, `verify` and `review`,
which have to leave them true.

## What makes a document a reference document

Not its subject. Its tense.

| | Design document | Reference document |
|---|---|---|
| Answers | what should we do, and why not the other thing | what does it do today |
| Cites the code | as it stood before the change | as it stands now |
| Named after | the ticket or the date | the subject |
| The day it merges | becomes an account of a decision | becomes the thing that has to stay true |
| Is wrong when | it misrepresents what was decided | the code moved and it did not |
| Written by | `atk:design-doc` | `atk:spec` |

The same sentence can appear in both and be correct in one and stale in the other, which is why they
are two files rather than one document that gets edited. Where they live and how they are named is in
`shared/artifact-paths.md`, under Persistence and under the kinds table. Do not restate either here
or in a skill.

## The project's own shape wins

When the directory already holds documents of this kind, the shape comes from them: heading order,
depth of detail, table columns, language. A template in the kit is the fallback for an empty
directory, never a correction applied to a team that already agreed on something.

This holds even when the existing shape is worse than the template. A directory of 29 documents in
one shape and a thirtieth in another is harder to read than 30 mediocre ones, and the person who has
to reconcile them is not the one who saved the time.

Changing the shape of a project's documents is its own piece of work, with its own approver. It is
never a side effect of documenting one endpoint.

## The sync obligation

A change that alters a public contract carries its reference document in the same pull request. Five
things count as altering a public contract:

- the path or the method of an endpoint;
- the shape of a request or a response, a field becoming optional included;
- an error code, or the condition that produces one;
- a table or a column, a default or a constraint included;
- an enum value, or what an existing value means.

Nothing else triggers the obligation. A refactor behind an unchanged contract does not, and neither
does a change to a comment, a test, or a name the document was never allowed to mention.

A document living in another repository, which is the ordinary case where a parent holds the
specification for member repositories, is not an exception to this. It is a pair of pull requests
opened together and cross-linked, per A change that spans more than one repository in
`shared/finalize-steps.md`, and the obligation is met when both are open and the document's one
merges no later than the code's. Both open is not the end of it: a document pull request left behind
after the code merged is the stale document this rule exists to prevent, arriving by a longer road.

Where the document cannot be updated in the same pull request, the pull request body says so in one
line: what is now stale, and who will fix it. The line is the whole point. A team learns to distrust
its documents from skips nobody announced, not from ones they can see and schedule.

The obligation is the author's. `atk:review` checks that it was met or that the skip was stated, and
a reviewer who silently fixes the document instead has moved the work to the wrong person and left
the next author believing the rule is optional.

## Drift is not an unanswered question

Two sides that both made a claim and disagree is drift: the document says the maximum is 100, the
code allows 500.

A document that never settled the point, or that carries it as an open question with a name against
it, is not drift. Nobody has decided yet, and reporting it as a gap sends someone to fix code that is
doing nothing wrong.

Both `atk:spec --check` and `atk:review` have to answer this the same way, which is why the rule
lives here rather than beside either of them. Mixing the two is also how a drift report stops being
read: the first time somebody chases a finding and discovers there was never a rule, they discount
every line above it.
