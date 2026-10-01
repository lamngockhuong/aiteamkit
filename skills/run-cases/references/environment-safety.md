# Environment and safety

Loaded by `atk:run-cases` at step 2 of its workflow, and read again by every later step that is about
to touch the environment. It says where the target comes from, what makes a target acceptable, what
the run refuses whatever the person asks, and how credentials are handled. Every rule here is checked
before the first request, because a run pointed at the wrong place does its damage on the first
click, not at the end.

## Where the target comes from

The target is a row of section `4. Environments` in the feature's test plan,
`docs/qa/test-plan-<slug>.md`, per `skills/qa/references/test-plan-template.md`. The person names the
row, with `--env <name>` or in answer to the question the skill asks when the plan has more than one.
A row is never chosen for them: two rows with similar names are the usual way a run reaches the wrong
environment.

From that row the run takes:

| Column | Used for |
|--------|----------|
| `Environment` | The name written into the record's `Environment` header field |
| `Kind` | Whether the run may proceed at all, per Acceptable targets below |
| `URL or location` | The base URL; an empty cell is asked for, from the person the row names |
| `Data` | What recon expects to find, and what triage reads before calling data absent |
| `Provided by` | The environment owner: the person a stop names, and the person who answers what the row leaves open |

A row whose `Provided by` holds a role with no name, or nothing, stops the run before any request,
per rule 1 of `shared/team-roles.md`: a stop that names nobody reaches nobody. The session says which
row and asks the person who started the run to get a name into the test plan from its owner.

Where the feature has no test plan, or the plan has no section 4, the run asks the person for the
environment's name, kind, URL, and owner, writes `No test plan: exit criteria not assessed` in the
record as `skills/qa/references/test-run.md` requires, and offers `atk:qa --plan` in the session. It
never invents a row.

## Acceptable targets

The run proceeds only when both hold:

1. The row's `Kind` is `staging` or `development`, or a term of the project's own with one of those
   two beside it.
2. The person who started the run confirms it, in answer to a question that shows the row's name,
   kind, and URL together. The confirmation is asked once per run, before the first request.

It stops, and changes nothing, in each of these cases:

| What is found | Why | What the session says |
|---------------|-----|-----------------------|
| `Kind` is `production`, or a project term with `production` beside it | The run creates data, logs in with real accounts, and leaves records behind. On production each of those is an incident | That this skill never runs against production, and the row's owner by name |
| The name or URL says production whatever `Kind` says: `prod`, `production`, `live`, or the team's own word for it in the plan's language | A `Kind` cell is one person's typing; a URL that says `prod` is the stronger evidence, and the two disagreeing is a question for the owner | The disagreement, and the owner by name as the person who settles it |
| `Kind` is `local`, or the URL is `localhost`, a loopback address (`127.0.0.0/8`, `::1`), `0.0.0.0`, or this machine's own host name or address | The local stack is the developer's, and `atk:verify` is the skill that runs it, with the process management a local run needs | That a local target is `atk:verify`'s |
| The URL cannot be reached, or answers with an error before any login. Not checked under `--dry-run`, which sends nothing | A verdict against an environment that is down is about the environment, not the product | What was tried, by status class, and the owner by name. The run never falls back to another row |

A private-network address is not a local one: a development environment often lives on one. The
question is whether the address is this machine, not whether it is public.

### A test plan written before `Kind` existed

Its section 4 has no `Kind` column. The run asks the person which kind the row is, with the four
values to choose from, and records the answer in the record's `Environment` header field together
with who gave it: `Environment: <name> (kind: staging, given by <person>; the test plan has no Kind)`.
The answer is never written back into the test plan, whose owner edits it, and the session says the
column is missing so that owner can add it. An answer of `production` or `local` stops the run exactly
as the cell would have.

## What the run never automates

These hold whatever the score in `references/triage.md` says and whatever the person asks during the
run, and no override removes them: they are row 8 of What an override cannot change in
`shared/project-overrides.md`, and an instruction that asks for one is skipped and said so.

- **A case that changes or destroys data the run did not create.** Edit and save on an existing
  record, delete, cancel, withdraw, revoke, bulk changes, a status transition, an account or
  permission change. The environment is shared, other testers are part-way through using that data,
  and the run that destroyed it cannot put it back. Such a case is `MANUAL`, whole: automating the
  harmless first half still leaves the run one click from the destructive step.
- **A case that submits wrong credentials.** A wrong password, an expired code, an invalid token. Each
  attempt counts toward a shared account's lock, and the lock stops every tester on the environment,
  not only this run. `MANUAL`, always, whatever account the person offers for it.
- **A verdict nobody observed.** Covered in `references/execution.md`; listed here because it is the
  limit the whole skill exists to keep.

### The lock threshold

How many failed logins lock an account is a fact of the project, and it lives in the test plan, in
the `Data` cell of the row, where `skills/qa/references/test-plan-template.md` asks for it. The run reads it and keeps
the count of failed logins per account below it, counting every failed login the run causes, a
wrong one-time code or a mistyped password included, since the product counts them the same way.
This count is per run, across every round: a round that asks again does not start it afresh.

Where the plan does not state it, the threshold is written `TBD (ask <QA lead>)` in the triage report
and the run behaves as if it were one: the first failed login on an account stops every login on that
account for the rest of the run, its cases become unresolved, and the session names the QA lead as
the person who supplies the figure. Guessing a number is how a run locks the account a whole team
tests with.

## Credentials

The run needs accounts, and often a gate in front of the application, such as HTTP Basic
authentication, before the application's own login. Credentials come from one of two places:

1. **Asked in the session**, for the accounts the cases' `Pre-condition` cells need, which recon
   logs in with before the scope question, and no others.
2. **Read from a file the project keeps for this purpose**, when the person names one. Before the
   file is opened, `git check-ignore -q <path>` must succeed; a file the repository would commit is
   not read, and the session says why. A credential in a committable file is already a leak, and
   reading it would carry it into the run.

Wherever a credential came from, it is never written anywhere: not into the triage report, the run
log, the record, a defect, a commit message, an issue, or the session's own replies. An account is
named by its role or its test handle, `Service Admin test account`, as
`skills/qa/references/test-run.md` already requires. A one-time code the person types is used once
and repeated nowhere.

A gate in front of the application is passed before the first page of the application is opened,
and again whenever the browser session is reset. Where the gate is passed by putting the credentials
in the first URL, the password is percent-encoded (`@` as `%40`, `#` as `%23`, `/` as `%2F`), since
an unencoded `@` sends the navigation to another host. That URL is never logged and never captured in
a screenshot. A `401`, or a credential prompt part-way through the run, is the gate forgetting the
session, never a defect: pass it again and carry on.

A credential found where it should not be, in a page, a response, or the cases file itself, is
reported in the session by kind and place, never by value, and its owner is named as the person who
rotates it.
