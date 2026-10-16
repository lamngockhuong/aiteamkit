# Reference documents

Shared contract for the documents that describe the system as it currently is, or, in a project that
writes its contract first, as it is agreed to be: the API contract per resource, the schema per table,
the behaviour per feature, and the components per screen as its design draws them. Referenced from `skills/<name>/SKILL.md` as `shared/spec-docs.md`, which is
`../../shared/spec-docs.md` relative to a skill file.

Cited by `spec`, which writes them, by `design-doc`, `implement`, `fix`, `verify` and `review`,
which have to leave them true, and by `qa`, `run-cases` and `help`, which read them.

## What makes a document a reference document

Not its subject. Its tense.

| | Design document | Reference document |
|---|---|---|
| Answers | what should we do, and why not the other thing | what does it do today, or under `Contract: first` what it is agreed to do |
| Cites the code | as it stood before the change | as it stands now |
| Named after | the date, and the ticket where there is one | the subject |
| The day it merges | becomes an account of a decision | becomes the thing that has to stay true |
| Is wrong when | it misrepresents what was decided | the code moved and it did not |
| Written by | `atk:design-doc` | `atk:spec` |

The same sentence can appear in both and be correct in one and stale in the other, which is why they
are two files rather than one document that gets edited. Where they live and how they are named is in
`shared/artifact-paths.md`, under Persistence and under the kinds table. Do not restate either here
or in a skill.

The table above is the reference document of a project that writes its code first. A project that
writes its contract first holds the same document to a different standard, and says which it does.

## When the contract comes before the code

The Docs section of `.atk/profile.md` carries one line, `Contract: first` or `Contract: code`, per
`shared/project-profile.md`. A missing line, or one still at `TBD`, means `code`: that is what every
profile written before the line existed describes, and a project must not change behaviour because
somebody has not answered a question yet. Changing the line is the Tech Lead's call, never a skill's.

| | `Contract: code` | `Contract: first` |
|---|---|---|
| Exists before the code | no | yes, written from a design once it is in review |
| Answers | what does it do today | what the code is held to |
| Cites | the code, as `path:line` | the design section a decision came from, or the ticket where the design cannot be reached, per Front matter in `shared/artifact-paths.md`, or the author who proposed a detail the design left open, until the code exists, then the code |
| When the two disagree | the document is stale | the code differs from an agreed contract |
| Written by | `atk:spec` | `atk:spec`, from the design first, then from the code as it lands |

What stays the same under both is what makes it a reference document rather than a design: it is
named after its subject, updated in place, carries no options, and is approved per kind. In the kit's
own shape it carries no history either, `git log` being the record; a project shape that keeps a
change-history table keeps it, per Change history and version under a project shape below. The design document still answers which approach, and why not the other; under `first` it
decides the contract in summary and names the reference documents that will carry it in full, and
the author of each reference document proposes the detail the summary leaves open, for that
document's approver to accept. The
two are separate documents, and the reference documents may be written from the design as soon as it
is `IN REVIEW`, so the contract is reviewed beside the decision rather than after it. A design still
at `DRAFT` is not a source: nobody has been asked to look at it yet. The order that holds is the
approval: a reference document reaches `APPROVED` no earlier than the design it came from, and a
design that changes in review is written into its reference documents again before either is
approved. Both may merge in the same pull request, so one review sees the decision and the contract
together.

### Whether the code exists yet

Under `Contract: first` a reference document carries one field beyond the shared front matter block
in `shared/artifact-paths.md`. A `screen` document carries it under either line, for the reason
given under The `screen` kind below, beside the four `design_*` fields of `shared/design-sources.md`:

```yaml
implemented: no | partial | yes
```

It is not an approval state, and `status` is not an implementation state. A document can be
`APPROVED` and `implemented: no`, which is the ordinary state of a contract a frontend is building
against while the backend catches up.

- `no`: nothing in the code corresponds to the document yet. Every item counts as not implemented
  and cites the design, or the ticket where the design cannot be reached, per Front matter in `shared/artifact-paths.md`, or the author who proposed it, and no item carries a mark of its own: the field already says it of all of
  them.
- `partial`: some of it exists. Each item not yet in code carries one line saying it is not
  implemented yet, placed where the kind's template in `skills/spec/references/` puts it: an
  endpoint in an `api` document, a column, index, or constraint in a `db` document, which is one
  table, a behaviour rule in a `feature` document, and a component row in a `screen` document. An item the contract changes counts as not
  in code until the change lands, and its line says what changes. An item without the line claims
  the code exists, and is cited to it.
- `yes`: every item is in the code, cited as `path:line`, and no mark is left. The value is set in
  the change that implements the last item, by the same sync that takes the last mark off, so it
  becomes true in the repository when that change merges: a merge is the event the repository
  records, and the document travels in the same pull request as the code.

An item counted as not implemented, whether by `no` or by its mark, is never drift, even where code
for it already runs: old behaviour still running under a changing item is what the mark describes.
Whether the new code matches the contract is checked where the mark comes off, by `atk:spec --sync`
and `atk:review` on the change that implements it, and a mark that stays on after its code agrees is
a stale mark, not a disagreement.

Under `Contract: code` the field is absent from every kind but `screen`: a document written from the
code is `yes` by construction, and so is every document a project had before it switched to `first`.

Switching back from `first` to `code` is the Tech Lead's call, like the switch the other way, and it
has one step to take before the line changes: run `atk:spec --check`, and for each item of any kind
but `screen` still counted as not implemented, by its mark or by a document at `implemented: no`, either remove it or turn it into
an open question. Which of the two is the document's approver's call. Then delete the `implemented`
field, from every kind but `screen`. Under `code` a document of those kinds may only say what the
code does, so an item left behind reads as drift
on the day the line changes, and nobody will remember it was once a plan.

## The `screen` kind

A screen spec describes one screen as its design draws it: the components a user sees, what each
accepts, and where each leads. It is the one kind whose source is a design rather than the code or
a design document, and a design is the source of no other kind: an `api`, `db`, or `feature`
document still never takes a behaviour from a Figma file. How the design is read, the three states
of the connection, the fallback to exported images, and what the read records, is in
`shared/design-sources.md`.

Its items cite the design, by the node ID of each component, in place of `path:line`. That is what
keeps the kind a reference document rather than a draft: it states what the agreed design shows
today, named after the screen, updated in place when the design changes, and approved by the
BrSE/BA, because what a screen asks of its user is a business claim.

**It always carries `implemented`.** A screen is drawn before it is built, so its document exists
before the code whether the project writes its contract first or not. The field is set by the kind,
not by the `Contract` line, which is why a missing line or one at `TBD` changes nothing here: nobody
has to answer a question for the field to be true. The values are defined under Whether the code
exists yet above, with the component row as the unit that carries the mark, and with one difference
in how an implemented row is cited: it keeps its node ID and cites its code beside it, as
`path:line`, never in its place, because the node ID is what every later read of the design matches
the row on. So `yes` on a screen means every row carries a code citation beside its node ID and no
mark is left. A row struck through as removed carries neither and does not count once the code no
longer shows its component: it records a number that is taken, not a component the code has to
have. Until then its removal is pending, and it counts as not in code.

**Its drift has two sides.** The design can move away from the document, and the code can move away
from the document, and the two are reported apart:

- Against the design: the `design_fingerprint` recorded in the front matter differs from the one the
  design gives today. The document is stale against its source, and the report names the screen,
  not a component, since the digest says that something moved rather than what.
- Against the code: a component the document counts as implemented disagrees with the screen's code,
  in a label, a required field, a limit, or a transition. That is drift as defined below, and which
  side moves is the approver's call as for any other kind.

**When the code moves on its own.** A diff that changes what an implemented row promises, its
label, required mark, limit, or where it leads, or that adds or removes a component the document
lists, is a disagreement between the code and the row, and
the sync never settles it by copying the code into a design-sourced row. It reads the row, not the
design, and opens a question for the BrSE/BA carrying both versions, the row and what the code now
does, answered `Keep the document`, which sends the code back, or `Take the code`, which the next
sync or rerun applies by rewriting, adding, or striking the row from the code and closing the
question. The design then differs from the row, and the question names the designer who has to
bring it in line; until they do, a design rerun asks about that difference like any other. The document
goes back to `IN REVIEW`, so the pull request carries it as the sync obligation asks. Such a
question is about the code, not the design, and never holds the design fingerprint.

**When the design is retired.** A project can stop maintaining its design, and then nobody will
change it again and the code is the only place the screen still moves. The BrSE/BA says so by
setting `design_source` to `retired (was <the link>)`, a decision a skill never takes. From then on
the document follows the code whatever the `Contract` line says, as a document under
`Contract: code` does. A sync rewrites an implemented row from the code, citing `path:line` beside
the node ID, which stays as the row's key; a component the code adds gets a row with no node ID,
keyed by its `No`, and a component the code removes is struck through as `Removed from the code on YYYY-MM-DD.`
Nothing reads the design: `--check` has only a code side, the `design_*` fields stay as the last
read left them and are not checked, and a run given `--design` says the design is retired and
changes nothing.

Retiring takes the same step as switching `Contract` back to `code`, over everything that was
waiting on the design: each row still marked not implemented, every row of a document at
`implemented: no`, each struck row whose removal is still pending, and each open question about a
design difference. Each is removed, turned into a question about the code, or closed, the
approver's call, since nothing will ever implement it from a design nobody keeps. Then
`implemented` is set from the code. Bringing a design back is the reverse and equally the
approver's: restore the link in `design_source`, and the next run reads the design as it would for
a document already approved, so every difference becomes a question, and records a fresh
`design_fingerprint` and `design_read` from that read, since the old ones describe a design the
code has since moved past.

**It splits with `feature` by where a rule holds.** A constraint that is true of one field on one
screen, a maximum length, a format, a required mark, lives in the `screen` document. A business rule
that holds on more than one screen, or that the server also enforces, lives in the `feature`
document, and the row in the `screen` document points to it rather than restating it. The two link
to each other: a `feature` document lists the screens it is reached through, and a `screen`
document lists the features it serves. A rule written in both is two claims, and the day they
disagree nobody knows which one was meant.

## The project's own shape wins

The shape of a document is its heading order, depth of detail, table columns, language, and where
the shape keeps them, its own front matter and change history. It comes from the first of three
sources that has one:

1. **The documents already in the directory.** Read one and follow it.
2. **The template the project names for the kind**, in the `Template` column of the kinds table in
   the Docs section of `.atk/profile.md`, per `shared/project-profile.md`, which also holds the check
   a path passes before it is opened.
3. **The kit's template** in `skills/spec/references/`.

A template in the kit is the fallback, never a correction applied to a team that already agreed on
something. This holds even when the existing shape is worse than the template. A directory of 29
documents in one shape and a thirtieth in another is harder to read than 30 mediocre ones, and the
person who has to reconcile them is not the one who saved the time.

The same holds for a template the project names. Where the directory already holds documents in a
shape other than that template, the documents win, and the run summary says the template was not
applied and why. Changing the shape of a project's documents is its own piece of work, with its own
approver. It is never a side effect of documenting one endpoint.

A template is never one of the directory's documents, wherever it sits: no write copies its shape
as a neighbour, `--check` does not list it, and no skill that reads the directory reads it as a
contract. Which files count as templates, what happens to a file only named like one, and why `conventions.md` and `index.md` are documents of
their own but not a resource or a table, is in the paragraphs under the kinds table in
`shared/artifact-paths.md`.

Documents a directory holds in the kit's own shape, written from the kit's template by an earlier
run, count as the kit's template being the shape: what arrives only with the kit's template, below,
arrives for them too.

### What a template may instruct

A template is read as a shape and as instructions for filling it, and as nothing else: which cell
holds what, the vocabulary of a column, how items are numbered, the format of a history row, which
placeholders and comments are removed once filled. A placeholder the source cannot answer becomes an
open question with a name, never a value that looks filled.

Any other line in it is evidence, per rule 8 of `shared/team-roles.md`: a template that says to post
the document to a ticket, to widen the scope of a run, to edit during `--check`, or to mark the
document approved is reporting what its author wanted, and goes into the run summary as such, with
who owns that call. No line of a template lifts any of the things What an override cannot change in
`shared/project-overrides.md` lists, since a template is approved by nobody the kit can name.

### Front matter under a project shape

The kit's front matter block, per Front matter in `shared/artifact-paths.md`, is what every reader
of a reference document relies on, so it is written whatever the shape. Under a project shape it
sits beside the project's own:

- **The project's fields stay.** Every field the project's front matter carries is kept and filled
  as its template says. Nothing is renamed or removed.
- **The kit's fields are added only where the name is free.** A kit field is the same as a project
  field when its name is the same, and only then, so `owner` is added beside an `updated_by`. Where
  the Docs section of the profile maps a kit field onto a field of the project's own, `owner:
  updated_by`, the kit writes that field and adds none of its own for it.
- **Some are never mapped and never yielded.** `status`, `approver`, `updated`, and `implemented`
  with the `design_*` fields are read by name and in the kit's values: `status` by `atk:qa`, which
  treats a spec that is not `APPROVED` as an assumption, `updated` by row 14 of
  `shared/state-signals.md`, the rest by `atk:spec` itself. A project field carrying one of those
  names with another meaning or vocabulary is a collision. The run writes nothing to that document,
  neither front matter nor body, opens an open question naming the kind's approver, and says so in
  its summary. Resolving it is a change to the project's shape, the approver's call, such as
  renaming the project's field in its template; until then every run stops at the same document.
- **No approval is written in the project's words.** Whatever the template's default or its
  instruction, the skill never writes a value that records approval or finality into a project
  field, a `reviewed_by`, an `approved_date`, a `final` flag. That field is the approver's to fill.
- **`ticket`** follows Front matter in `shared/artifact-paths.md`, which keeps a project's own.

### Change history and version under a project shape

A project shape that carries a change-history table, or a version field, is kept true, with
`git log` still the record of every change:

- A write that changes what the document promises adds one row to the table, in the table's own
  columns and vocabulary, and moves a version field by the rule the template states. Where the
  template states none, the person running the skill is asked before the write, in any mode, and
  the rule they give is named in the summary for the approver to add to the template; never
  guessed.
- A correction of wording follows the template's rule for one, and adds nothing where it has none.
- A place the template says must agree with the last row, a version in the front matter or under the
  title, is set in the same write, except a value that records approval or finality, which is left
  for the approver as above. A cell of the row that records an approval is left empty, per
  `shared/team-roles.md`.
- A run that changes nothing adds no row.

### Where the kit's own items go

What the kit needs and a project shape has no place for goes where the shape keeps notes for that
item, or, where it keeps none, into one section appended at the end of the document. The run summary
names each addition.

- **Open questions**, each with the name of who answers it, go into the shape's own open-question
  place where it has one.
- **The not-implemented mark** goes at the start of the item's note cell or line, per Whether the
  code exists yet above.
- **A screen's node IDs.** A shape with a column or a cell already holding node IDs keeps them
  there. Only a shape with none gets an appended `Design nodes` table, one row per item, keyed by the
  item ID the shape uses. A document that already holds node IDs anywhere, a `Node` column, or beside
  `path:line` in a note, is read from there on its first write after this rule, so no row loses its
  key.

The rules below hold under a project shape as under any other. What does not arrive with it is
shape: the Events table, the `api` column, the schema index and the conventions document come only
with the kit's template, or where the project already keeps them.

## Rules that hold under any shape

The shape decides where a thing is written. These decide what has to be written, so they hold
whichever shape a document copied, its neighbours', a template's, or the kit's, on every write and on
every `--check`:

- **A part that does not apply says so.** A section or a table that has nothing to hold keeps its
  heading and says `N/A` with the reason: `N/A: the endpoint changes no data.` A heading deleted, or
  left empty, reads as nobody having thought of it, and the reader cannot tell that from "considered,
  none". A part the shape itself marks optional, an example body in the kit's API template, may be
  left out, and is not a part left out.
- **Authentication has an outcome.** An endpoint that needs authentication lists a `401` outcome, and
  one that checks a permission lists a `403`, where the shape lists outcomes at all. A caller handles
  the outcomes the document lists, and an unlisted one is handled by nobody.
- **An example parses.** Where the shape carries an example body, it parses as the format it claims.
- **No value in the document is real.** Every value a reference document carries, an example body, a
  table cell, a sample request, a row of its change history, a note, is a placeholder made up for the
  document: no real token, key or password, an expired one included, and no real person's data or
  internal host, by the list in The data a record must not carry in
  `skills/qa/references/test-run.md`. A cell a template asks to fill from the code, its
  configuration or a log, a `Base URL`, a sample request with an `Authorization` header, a contact
  address, is where a real value is most often copied. A write fills such a cell with a placeholder,
  `https://api.example.com`, `Bearer <token>`, `contact@example.com`, or, where no placeholder can
  say what the reader needs, opens a question naming the kind's approver, per `## Roles` of
  `atk:spec`, and never copies the real value. The names of the team's own people in the
  document's own fields, `owner`, `approver`, the author of a history row, are not a real person's
  data here, as that list says of a run record's `Run by`. A document is copied into tickets, tests
  and chat, and a real value travels with it.
- **A reference without a key says why.** A column named `*_id` with no foreign key carries the reason
  in its row: another service owns the row, a key would block an archive, the value is a reference
  kept after its row is gone. Without the reason, the next person adds the key or removes the
  column.
- **An error code comes from one place.** Where the project keeps an API conventions document, every
  error code a document cites is in it, and the document cites the code rather than restating the
  error body. A code the code emits and the conventions document lacks is added there, per
  `skills/spec/references/api-spec-template.md`, never invented in a resource document of its own.

How `--check` reports a breach of each, and at which severity, is in
`skills/spec/references/drift-check.md`. A document written before these rules is judged by them
from its next `--check`, and brought in line on the next write of its whole subject once its code has
moved, per A run on unchanged code below, never by `--sync`, which touches only what the branch touched and names the gaps it saw in its summary.
Bringing a document in line, a `401` added or an `N/A` written, is a change to what it promises,
so its `status` goes back to `IN REVIEW`.

## A run on unchanged code

A document written from the code changes when the code changes, and not because a later run read the
same code more closely. Run again on a subject whose code has not moved since the document was last
written, a run reads more and finds more: a value the handler never checks, an input the database
rejects first. Written in, each of those adds a history row and a version under a project shape, and
sets `status` back to `IN REVIEW`, so a reviewer sees a contract that moved twice where nothing
moved at all.

So before writing from the code, the run asks git whether the code moved: the paths the document
cites, compared between the commit that last changed the document and the working tree,
`git diff --quiet <that commit> -- <paths>`. Where nothing moved, the run changes no line of the
document, front matter included. What it found that the document does not say, a new open question,
a rule of Rules that hold under any shape the document breaks, goes into the run summary, naming
who would answer each, for the author to carry in when the code next changes or by asking for it.
The summary says the code had not moved since which commit.

Where the code moved, the run writes as usual, and what it found on the way is written with it.
A person who wants the findings written anyway says so, and the run writes them as a change like any
other. A document never committed has no last commit and is written as usual. This holds for a write
from the code only: a run from a design, `--from` or a `screen` document's design, follows its own
rules for what changed, and `--check` writes nothing in any case.

## The sync obligation

A change that alters a public contract carries its reference document in the same pull request. Six
things count, the last because a screen spec is what QA and the BrSE read a screen from:

- the path or the method of an endpoint;
- the shape of a request or a response, a field becoming optional included;
- an error code, or the condition that produces one;
- a table or a column, a default or a constraint included;
- an enum value, or what an existing value means;
- a component of a screen that has a `screen` document: its label, its required mark, a limit it
  enforces, or where it leads.

Nothing else triggers the obligation. A refactor behind an unchanged contract does not, and neither
does a change to a comment, a test, or a name the document was never allowed to mention.

Carrying the document means leaving it true, not only touched. Each sentence the change writes holds
for every branch of the code it describes. Where one branch does not honour it yet, a case the author
lists as left for later included, the sentence says so beside it and names who decides, by
default the document's approver, or the gap is closed in the same change. Under
`Contract: first` that line is the not-implemented mark of Whether the code exists yet above, so a
document at `implemented: yes` goes back to `partial` with it. A sentence the code does not honour,
with neither that line nor the mark beside it, is drift the change wrote itself, and under
`Contract: first` it reads as an agreed contract the code already breaks.

A document living in another repository, which is the ordinary case where a parent holds the
specification for member repositories, is not an exception to this. It is a pair of pull requests
opened together and cross-linked, per A change that spans more than one repository in
`shared/finalize-steps.md`, and the obligation is met when both are open and the document's one
merges no later than the code's. Both open is not the end of it: a document pull request left behind
after the code merged is the stale document this rule exists to prevent, arriving by a longer road.

Where the document cannot be updated in the same pull request, the pull request body says so in one
line: what is now stale, and who will fix it. The line is the whole point. A team learns to distrust
its documents from skips nobody announced, not from ones they can see and schedule.

The obligation is the author's. `atk:review` checks that it was met, that what the document now says
holds for the code beside it, or that the skip was stated, and a reviewer who silently fixes the
document instead has moved the work to the wrong person and left the next author believing the rule
is optional.

## Drift is not an unanswered question

Two sides that both made a claim and disagree is drift: the document says the maximum is 100, the
code allows 500.

A document that never settled the point, or that carries it as an open question with a name against
it, is not drift. Nobody has decided yet, and reporting it as a gap sends someone to fix code that is
doing nothing wrong.

An item a contract-first document, or a `screen` document under either `Contract` line, counts as
not implemented yet, per Whether the code exists yet
above, is neither. The document says the code is still to come, and code that is not there yet is the
state the team planned for. It is reported as not implemented, never as a finding. Once the mark comes off, a
disagreement is drift like any other, and which side changes is still the approver's call: an agreed
contract makes the code the likelier side to move, not the certain one.

Both `atk:spec --check` and `atk:review` have to answer this the same way, which is why the rule
lives here rather than beside either of them. Mixing the two is also how a drift report stops being
read: the first time somebody chases a finding and discovers there was never a rule, they discount
every line above it.
