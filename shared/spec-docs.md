# Reference documents

Shared contract for the documents that describe the system as it currently is, or, in a project that
writes its contract first, as it is agreed to be: the API contract per resource, the schema per table,
the behaviour per feature, and the components per screen as its design draws them. Referenced from `skills/<name>/SKILL.md` as `shared/spec-docs.md`, which is
`../../shared/spec-docs.md` relative to a skill file.

Cited by `spec`, which writes them, by `design-doc`, `implement`, `fix`, `verify` and `review`,
which have to leave them true, and by `qa` and `help`, which read them.

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
| Cites | the code, as `path:line` | the design section a decision came from, or the author who proposed a detail the design left open, until the code exists, then the code |
| When the two disagree | the document is stale | the code differs from an agreed contract |
| Written by | `atk:spec` | `atk:spec`, from the design first, then from the code as it lands |

What stays the same under both is what makes it a reference document rather than a design: it is
named after its subject, updated in place, carries no options and no history, and is approved per
kind. The design document still answers which approach, and why not the other; under `first` it
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
  and cites the design or the author who proposed it, and no item carries a mark of its own: the field already says it of all of
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

When the directory already holds documents of this kind, the shape comes from them: heading order,
depth of detail, table columns, language. A template in the kit is the fallback for an empty
directory, never a correction applied to a team that already agreed on something.

This holds even when the existing shape is worse than the template. A directory of 29 documents in
one shape and a thirtieth in another is harder to read than 30 mediocre ones, and the person who has
to reconcile them is not the one who saved the time.

Changing the shape of a project's documents is its own piece of work, with its own approver. It is
never a side effect of documenting one endpoint.

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
