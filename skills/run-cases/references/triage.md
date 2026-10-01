# Triage and scope

Loaded by `atk:run-cases` at steps 3 to 5 of its workflow: recon, triage, and the scope question.
Every case in the cases file gets a verdict before any case runs, and the person who started the run
agrees the scope before the first one does. A case sent to automation that cannot be observed becomes
a verdict nobody saw, which is the one thing this skill must never write, so the bias throughout is
downward: where a criterion is genuinely uncertain, score it lower.

## The cases to triage

Every row of the cases table, except a row struck through as removed, whose `Expected result` opens
with `Removed`, per `skills/qa/references/test-case-template.md`. Removed rows are skipped and counted
in the triage report, never scored and never run.

The table is read by the columns that template names. A file that lacks `Page` or `Priority`, or
names them differently, is asked about once: which column holds the page, which the priority. With no
priority column at all, the cut at the scope question falls back to case ID order alone, and the
session says so.

## Ground the cases in the code

The deployed environment runs code in this repository, or in a member repository the profile names.
Read it before scoring, for the screens the cases' `Page` column names:

- the route or URL of each page, and which role reaches it;
- the labels, button text, validation messages, and empty states the page renders;
- the endpoints the page calls, and the status codes and error codes they return;
- for every control whose label sounds destructive, whether its handler writes anything or only
  changes what is on screen.

Where to look comes from the `Layers` section of `.atk/profile.md`: each layer's directory and
reference module. Without a profile, infer the layout from the repository and say in the triage
report that it was inferred, per the Required-soft group of `shared/project-profile.md`. The reference
documents under `docs/api/`, `docs/features/` and `docs/screens/`, resolved per
`shared/artifact-paths.md`, are read too, and where one disagrees with the code the disagreement goes
into the triage report rather than being settled by the run, told apart as drift or an open question
per `shared/spec-docs.md`.

The code read is the working tree's, which may not be what is deployed. The triage report records the
commit grounding read, and whether the tree had uncommitted changes. Where the environment shows its
build, a version on a page or an endpoint, the two are compared at recon, and a difference is put to
the person before scoring: carry on, or check out what is deployed first. A string read from the wrong
commit turns into a false `Failed`, or a false `BLOCKED`.

A `Page` that matches nothing in the code is a finding: the case targets work that is not built yet,
or names the page wrongly. Its verdict is `BLOCKED`, and the triage report says which.

Grounding tells the run what the application should do and where to look. It is never evidence that
the deployed build does it, and it never replaces the case's own `Expected result`: it only makes a
vague one precise. Where the case and the code disagree, `the list shows 20 rows` against a page size
of 50 in the code, the case's value stands, the disagreement goes into the triage report with the
BrSE/BA named as the person who decides whether the case or the code is wrong, and an assertion that
then fails says so in its defect.

## Recon the environment

The code says what should be there; only the environment says what is. Before scoring, once per run,
for the cases this run can reach, which under `--only` are the cases it names:

1. **Log in with every account those cases' `Pre-condition` cells need**, under the lock rule of
   `references/environment-safety.md`. Record each as usable unattended, gated behind a step a person
   has to do (a one-time code, a CAPTCHA), or unusable. A one-time code at recon is entered by the
   person who started the run, as in A step a person does in `references/execution.md`.
2. **Look at the data behind the pages under test**: how many records there are, in which states,
   which account owns what. Two or three page views a screen is enough.
3. **Note what the product sends outward**: a create or invite flow that mails, texts, or calls an
   outside system, so the scope question can name it.
4. **Check every `Pre-condition` against what was seen.** A case that needs a state no record is in,
   or an account that cannot log in unattended, is not `AUTO` as written.

The browser session recon opens is the one the run keeps using, so each gated account is challenged
once per run, not once at recon and again at execution. Where the harness refuses the browser tool
at recon, the person is asked once to allow it; still refused, the run carries on as a dry run.

Under `--dry-run` there is no recon and no request to the environment. Every verdict is scored
against the cases file and the code alone, and the triage report marks each one provisional.

## Score each case

Eight criteria, each scored 0, 1, or 2, against what recon observed rather than what the case
implies.

| # | Criterion | 2 | 1 | 0 |
|---|-----------|---|---|---|
| 1 | The expected result is unambiguous | One exact value: a string, a URL, a count, a state | Directional: "an error appears", "the list updates" | Subjective: "displays correctly", "matches the design" |
| 2 | The result can be observed from the browser | In the page's accessibility tree, the URL, a status code, or a response body | Reachable indirectly: a second page, a reload, the network log | Out of reach: pixels, a file's contents, a mail, a storage object, a server log |
| 3 | The flow is stable | Deterministic, no timing, nothing external in the path | Mild timing: an asynchronous refresh, a toast that disappears | A batch, a queue, a live update, a redirect through a third party |
| 4 | The case can run twice on a shared environment | Read-only, or creates its own uniquely marked data | Changes only what this run created | Changes data the run did not create, or submits wrong credentials |
| 5 | Its data can be prepared through the product | Nothing to prepare, or prepared with an account recon confirmed | Needs a second role or several screens, still through the product | Needs a direct database write, a batch, a file placed by hand, or data recon found absent |
| 6 | It can be driven in a browser | Navigate, click, type, select, submit | Upload, drag and drop, hover-only state | Outside the browser: an operating system dialog, a mail client, a device, a downloaded file |
| 7 | It depends on nothing outside the application (higher is fewer) | The application and its database only | Touches an outside system without asserting on it | Asserts on the outside system: mail, SMS, a storage object, an outside API |
| 8 | It is worth automating | A path re-tested every release: login, a guard, the main list, the main create | Run each release but narrow | Run once |

Criterion 1 at 1 often rises to 2 through grounding, where the code states the exact message the
case only describes and does not contradict it. Say so in the triage report and cite the file.

`Priority` and `Section` in the cases file are evidence for criterion 8: `High`, and the `ACCESSING`
and `FUNCTION` sections, usually score 2.

## The verdict

Apply in this order. The first two steps are absolute, and no later step or score reverses them.

1. **`MANUAL`, unconditionally,** when criterion 4 is 0, or criterion 1, 2, 3, or 6 is 0. A case that
   changes data the run did not create, or submits wrong credentials, is never automated in part, per
   `references/environment-safety.md`. A case whose result is subjective or cannot be observed has
   nothing to automate, and one that leaves the browser or depends on a flow that will not repeat
   cannot be run to a result the run saw.
2. **`BLOCKED`** when grounding found no page for it. It is never attempted.
3. **`SEMI-1`, `SEMI-2`, or `SEMI-3`** when one obstacle stands between the case and a run, per the
   table below. A blocker that no person's single step can clear makes the case `MANUAL` instead.
4. **By total** for what is left: 13 to 16 `AUTO`; 9 to 12 a `SEMI` subtype by its obstacle, or
   `MANUAL` where no single obstacle can be named; 0 to 8 `MANUAL`.

Two caps apply on top of the total. An account recon found unusable caps every case that needs it at
`MANUAL`. Data recon found absent makes a case `SEMI-1` or `SEMI-2` by who can create it, never `AUTO`.

| Verdict | The obstacle | Who clears it | How |
|---------|--------------|---------------|-----|
| `SEMI-1` | Data the case needs is missing, and the product can create it correctly | The run itself; no person is named | Creates it through the product, following the rules the reference documents and the code state, then runs the case as `AUTO` |
| `SEMI-2` | A state the product cannot produce: a status only a batch sets, a row only a database write makes | A named person | Prepares it and gives its identifier; the run then executes and verifies. Only for a case that reads that state: one that changes it changes data the run did not create, and is `MANUAL` by step 1 |
| `SEMI-3` | One step a person has to do: a one-time code, a CAPTCHA, a confirmation | A named person | Does that step only, when the run reaches it; the run carries on |

The line between `SEMI-1` and `SEMI-2` is not whether the run could create the data but whether it can
create it correctly. Where the right values cannot be established from the reference documents and
the code, it is `SEMI-2`. When it prepares data for a case, the run never prepares the invalid input
that case exists to prove the product rejects: the case types that input itself, as its steps say.

Every contact field the run fills, an email address, a phone number, uses a value the test plan's
`Data` cell gives for testing, or a domain reserved for it, `example.com`, never an address that
could belong to someone. A flow recon found sends to outside parties is named at the scope question.

A gated account whose code is itself what the case tests, its expiry or its resend, depends on mail
timing, and is `MANUAL`.

### Large cases files

On a file of hundreds of cases, score one representative per group of cases that share the page,
the section, the account, and the shape of their data, and give the group its verdict. The triage
report names the representative and the size of each group. A case that differs from its group in
account, data, or in whether it changes existing data is scored on its own.

## The triage report

Written to `docs/derived/run-cases/<run-id>/triage.md` before the scope question, per
`shared/artifact-paths.md`. It is derived output: nobody approves it, and the record cites it. It
holds, with every section present and `None` where a section is empty:

- the cases file, its `status`, whether it had uncommitted changes, and the removed rows skipped;
- the target row by name, its kind and who confirmed it, and the lock threshold or
  `TBD (ask <QA lead>)`;
- the commit grounding read, and the build the environment shows where it shows one;
- the count per verdict, overall and per `Page`;
- recon: each account by role, usable or gated or unusable; the data observed and what it ruled out,
  records named by identifier; the flows that send outward;
- grounding: per page, its route, the role that reaches it, its endpoints, every expected value
  lifted from the code with its `path:line`, and every case whose expected result the code
  contradicts;
- one table per verdict: the case, its score, and for every `SEMI-2` and `SEMI-3` case the obstacle
  and the person who clears it;
- every case `MANUAL` or `BLOCKED`, with the reason a tester needs to pick it up;
- the scope, once the question below is answered.

It follows The data a record must not carry in `skills/qa/references/test-run.md`, like the record:
the environment by its row's name rather than its URL, a page by its route without host or query
string, a record by its identifier, and no credential anywhere.

## The scope question

Asked once, after the triage report is written and before any case runs. It is asked under
`--dry-run` too, so the person sees what a real run would ask, and the dry run ends with the answer.

The cases on offer are the `AUTO` and `SEMI` cases, narrowed to the IDs `--only` names when it is
given. An ID `--only` names that the file does not have is asked about; one whose case is `MANUAL` or
`BLOCKED` is reported as one this run cannot run, with its reason. `--only` proposes the scope; it
does not answer the question.

The session shows the count per verdict and per `Priority`, the accounts that will need a person, what
the run would create on the shared environment, and what it would send outward, and then asks the
person who started the run for the budget: how many of the cases on offer this session takes, `AUTO`
and `SEMI` together. One case costs several browser actions, a login, a page, a read of the page, an
assertion, and evidence, so a budget well past forty rarely fits one session; the skill says that and
leaves the number to the person. A budget of zero ends the run as a dry run does.

When the cases on offer outnumber the budget, the skill proposes a cut and lists it: the highest
`Priority` kept first, then case ID order, with every case left out named by its ID. The person
chooses: the proposal, a different set by ID or by page, or the whole set over several sessions. The
skill never drops a case on its own, and no case runs before the answer.

A `SEMI-2` or `SEMI-3` case enters the scope only when the person clearing its obstacle is named, in
the answer or in a question asked right after it. Cases sharing an obstacle are asked about together:
one prepared record often unblocks several cases. A `SEMI-1` case needs no name; the run clears it.

**Deferred**, the one definition every file of this skill uses: a case on offer that this run did not
attempt, because the scope question left it out, or because it was in scope and the session ended
before it was reached. A case outside `--only` was never on offer and is not deferred; the record says
only how many there were. The agreed scope, the cut, and the deferred cases go at once into the
triage report and the run log, per The run log in `references/execution.md`, so a later run can pick
them up.
