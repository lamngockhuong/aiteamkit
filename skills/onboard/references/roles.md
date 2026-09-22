# Roles

Loaded by `atk:onboard` in steps 3 and 5, for `--role`. It says what the flag changes, and it says
what the flag leaves alone, because the second half is what keeps two runs comparable.

## Three steps do not move

Steps 1, 2 and 4 describe the repository. The command that installs the dependencies, the signal
that says the build worked, the areas of the codebase and the owner of each one: none of these is
different for a QA engineer than for a developer. A kit that let them differ would hand the team
four descriptions of one repository with nothing to say which was right, and the verification in
step 2 would stop meaning anything, because a command either runs or it does not regardless of who
typed it.

So a `--role qa` document and a `--role dev` document of the same repository, written a month
apart, differ in those two places and agree everywhere else. They also differ in the front matter
`title` and in the filename, but neither of those is a third difference: both are how a reader and
a later run tell which of the two they are holding. That is the property `--refresh` and `--audit`
rely on when they read an existing document back.

## Two steps do move

| Role | Blocks day one | The first week ends in |
|------|----------------|------------------------|
| `dev` | Repository, CI, and the database the application needs to run locally | A small change merged through the team's normal review |
| `qa` | The tracker, the environments, and the database behind them | A test run executed against a real build, with the cases written down where the team keeps them |
| `sre` | Cloud, VPN, monitoring and the on-call rota | One operational change applied through the normal path: an alert threshold, a dashboard, a runbook correction |
| `ba` | The tracker, the shared drives holding the requirement and design documents, and the client's chat channel | One requirement written and taken through review |

The table is the kit's default, not the team's answer. Put both columns for the role in front of
the Tech Lead and let them correct the row before the document is written; the correction is
usually one item and it takes a sentence to ask for. A role outside the table is the same
conversation started from nothing rather than from a draft, which is the only difference between
the two cases.

That is not a formality. Whether a place on the on-call rota blocks an SRE's first Tuesday is an
operational decision with an owner, and a kit that settles it silently has decided something a role
owns, against the premise the whole kit is built on.

Every item in the blocking column is one of the rows step 3 already lists. It has to be: the column
says which of those rows blocks a Tuesday, so a role that blocks on something with no row would
force the run either to add a row, which step 3 forbids, or to drop the thing that actually blocks
that person. A role whose real blocker has no row is a gap in step 3, and belongs in a kit issue.

Step 3 keeps every row it would have had. The role decides which items block day one, not which
items exist: a QA engineer still needs repository access and still waits for it, and leaving the row
out because it does not block Tuesday is how somebody discovers in week three that nobody requested
it. The `--role` column is the blocking column and nothing else.

Step 5 keeps the shape of the week. Day one is still environment plus a read-only tour, the starter
task is still real, still small, still picked from the tracker rather than invented, and still
reviewed the way the team reviews anything. The role decides what the week ends in, and that is the
line the Definition of done checks.

A tracker that cannot be read changes none of that. It moves who names the task, not what the task
has to be, and `SKILL.md` step 5 holds the route.

## A run that names no role

`--role` is optional, and the most common invocation is the bare one. It has no row here, and it
must not quietly borrow `dev`: the four endings are different work, and picking one unasked is the
same silent invention the next section refuses. Ask which role the document is for before step 3.

The question is cheap and it is asked once. It is also the Tech Lead's answer rather than the
skill's, per `shared/team-roles.md`, and the request often carries it already, in which case take it
from there and do not ask again.

## The four rows are a floor

They are the roles the kit has written down, not the roles a team is allowed to onboard. A designer,
a project manager, a data engineer: describe the role in the invocation and answer the same two
questions for it, which are the two columns above. Ask the Tech Lead what blocks that person on day
one and ask what their first week should end in, then write the document against those answers.

What is not acceptable is inventing both answers silently. They are the Tech Lead's to give, per
`shared/team-roles.md`, and a first week that ends in something nobody asked for is a week the buddy
has to re-plan on the Monday.

## The document says which role it was written for

Put it in the `title` of the front matter block from `shared/artifact-paths.md`: `Onboarding: QA
engineer`, not `Onboarding`. No new field, and `--refresh` and `--audit` can then read back which of
the two moving steps they are re-verifying instead of guessing from the contents.

A project onboarding several roles is holding several documents, one per role, and the default path
carries the role so they do not collide: `docs/onboarding-qa.md` under `--role qa`, and plain
`docs/onboarding.md` only when no role was named. `shared/artifact-paths.md` holds the row.

The role is therefore in the path as well as in the `title`, and that is what lets a later run find
the right document. `--refresh` and `--audit` take the same `--role` the document was written under
and re-verify that file; without a role they look at `docs/onboarding.md` and say so, rather than
auditing one document and leaving the others to rot unseen.

This also keeps the no-overwrite rule of `shared/artifact-paths.md` out of a case it does not fit. A
QA document does not supersede a developer document: both describe the project as it is today, for
two different readers. Two paths means the question never arises, where one path would have forced
a run to mark a perfectly current document `SUPERSEDED`.
