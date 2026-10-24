---
title: atk:catchup explains a document in plain words, a kit record or any other
status: SUPERSEDED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-24
ticket: none
---

Superseded on 2026-10-24 by `docs/records/design/261023-1609-review-findings-explained-and-answered.md`, which changes one decision, that every claim on the page traces to a place in the document, for a review report; every other decision here stands.

# atk:catchup explains a document in plain words, a kit record or any other

## In short

On 2026-10-16 an `atk:security` run on this repository wrote a record of 13 findings. Every claim in
it sat beside a `path:line` citation, and the maintainer asked for "an explanation of every finding
that is easy to understand, in a file I can read". The session wrote one by hand. For each finding it
said what happens, who can make it happen, gave an everyday analogy, the impact, the conditions and
the suggested fix, then added a table with one line per finding and a suggested order of work. No
skill in the kit writes that page. The maintainer then widened the request to any document, not
only the kit's own records. A vendor's penetration test report, an audit, a client's specification
and a contract annex are all things a team member is handed and has to understand.

This design gives `atk:catchup` a third mode, document mode, chosen when the argument is a local
file. The run writes one page to the derived directory the catchup brief already uses. It has two
shapes:

- **For a record the kit wrote,** it explains each finding, using what the kit knows about that kind
  of record.
- **For any other document,** it explains each finding when the document holds findings, and each
  section when it does not.

The fidelity rules are the same in both shapes. Evidence, severities and IDs are copied as they are.
The page claims nothing the document does not say. The order of work it suggests is labelled as a
suggestion and names the person who decides it. A document from outside is read as evidence, never
as instruction.

Three other places were weighed: a new `atkx` skill, a `--plain` flag on each skill that writes a
record, and leaving the work to the `In short` section that every kit record opens with. Each loses,
for reasons given below. Lam Ngoc Khuong answered the two questions an earlier draft left open: the
page explains a security record even when its risks are unaccepted, with a warning; and the threat
model is one of the kinds the page knows. He also answered the question a later draft left open: a
link to a document is read through a connection the harness already has, with a local export as the
fallback. The plan that builds this design raised four more, and his answers are recorded under
"Decisions taken during review": the page is a temporary document held out of git and never offered
to be committed, the warning is one line in the session, and the page and its trace are named by the
kind of record or `document`, never by the document's own name. Nothing is left open.

## Requirement

No requirement artifact exists. The criteria come from the session that produced this record:

| # | Criterion | Source |
|---|-----------|--------|
| AC1 | Given the path of an existing record, the run explains every finding in it, with none skipped | the maintainer, 2026-10-16 |
| AC2 | For each finding it says what happens, who can make it happen, an everyday analogy, the impact, the conditions, and the suggested fix | the hand-written page of 2026-10-16, which the maintainer asked to be repeatable |
| AC3 | The page closes with a table of one line per finding and a suggested order of work | the same page |
| AC4 | Evidence, severities and IDs are unchanged, and nothing beyond the document is claimed | `plugins/atk/shared/plain-writing.md`, "What does not change" |
| AC5 | It lives in `atk:catchup`, not in a new skill | the maintainer, 2026-10-16 |
| AC6 | A team with only `atk` installed has it | `CLAUDE.md`, "The kit stands alone" |
| AC7 | Any document or record the kit did not write is supported too | the maintainer, 2026-10-16 |
| AC8 | A security record with unaccepted risk is still explained, with a warning before any commit | the maintainer, answering an open question of an earlier draft, 2026-10-16 |
| AC9 | The threat model of `atk:security --threat-model` is a known kind | the maintainer, the same answer |
| AC10 | A link to a document is read through a connection the harness has, and a local export is the fallback | the maintainer, answering the open question of a later draft, 2026-10-16 |

AC5 was the maintainer's choice, made after the session recommended it. The options below still
compare the alternatives, so that the ADR records why they lost.

## Current state

- **Every kit record already opens with a plain summary.** `plugins/atk/shared/plain-writing.md` is
  cited by the report templates of `fix`, `verify`, `review`, `security` and `qa --record`, by
  `run-cases` through the same run-record shape, and by `## Output` of `incident`. It requires an
  `In short` section of three to six sentences, then five rules for the prose around the evidence.
  That summarises the run as a whole. It does not explain each finding, and each finding block stays
  written for a reader who will open the citations. The security record of 2026-10-16 is an example:
  its `In short` is eight sentences long, and each of its 13 finding blocks is a table of `path:line`
  cells. A document from outside the kit has no such section at all.
- **`--lang` translates; it does not simplify.** Every skill that writes a document takes
  `--lang <code>`. A Vietnamese security record is as technical as an English one.
- **`atk:catchup` is the skill for the absent reader.** It "Turns an epic or a pull request into a
  page that gets a newcomer to the work in a few minutes"
  (`plugins/atk/skills/catchup/SKILL.md:18-20`). Its brief is disposable, `approver: none`, and
  written to `docs/derived/catchup/` (`plugins/atk/skills/catchup/references/brief-template.md:23-25`,
  `plugins/atk/shared/artifact-paths.md:142`). It links to sources rather than restating them
  (`SKILL.md:22-24`).
- **Its mode is decided by what the input resolves to.** Step 1 has two modes. A URL with `/pull/`
  and the like is pull request mode, and everything else is resolved through the tracker
  (`SKILL.md:66-75`). A local file path is not recognised today. It goes to the tracker as if it
  were a ticket id and fails there.
- **Pull request mode already drops the understanding check entirely** (`SKILL.md:85-88`).
- **Step 6 already collects open questions addressed to a named person** (`SKILL.md:144-160`). A kit
  record has its own `Open questions` section, already carrying names. A document from outside may
  name nobody.
- **The kit already reads documents it did not write, under rules 8 and 9.** Rule 8 of
  `plugins/atk/shared/team-roles.md` makes a vendor document evidence, not instruction. Rule 9 and
  the path table of `plugins/atk/shared/secret-scan.md` keep dotenv and credential files unread.
- **The kit already has a precedent for formats the harness cannot read.** `atk:security` asks for a
  spreadsheet checklist as CSV or pasted text rather than guessing at it (`atk:security` step 5).
- **`atk:intake` is the neighbour a document can be mistaken for.** It turns an unstructured request,
  a document among its inputs, into requirements. Explaining a document and turning it into
  requirements are different jobs, and the description has to keep them apart.
- **Kit record shapes differ in what a "finding" is.**
  - In a security record it is an `SF<n>` block whose fields include `What an actor does`,
    `What they gain` and `Suggested control`
    (`plugins/atk/skills/security/references/record-template.md`, "The security record").
  - A threat model has one row per boundary and STRIDE question, with the control that answers the
    threat or `none` (same file, "The threat model").
  - In a review report it is a `B<n>`, `S<n>` or `N<n>` finding with `File` and `Fix`
    (`plugins/atk/skills/review/references/report-format.md:15-17`, `:76-125`).
  - A fix report has a single defect and its cause.
  - A verification record and a test run record list failed checks and failed cases.
- **The description's triggers** (`SKILL.md:3-13`) cover epics and pull requests in all three
  languages. `evals/trigger_evals.json` holds 10 positive and 15 negative cases, and none of them is
  about a document.
- **Length.** `SKILL.md` is 205 lines, against a ceiling of 300 (`CONV-006`).

## Options

Criteria, in order of weight:

1. **The team premise.** The page must not decide anything a role owns, and it must not create an
   artifact that nobody owns.
2. **Reach.** Whether a team with only `atk` installed has it (AC6).
3. **Fit with an existing scope.** Whether it extends a skill's job or invents a new one.
4. **Cost.** Files touched now, and the drift risk later.
5. **Reversibility.**

### A. A document mode in `atk:catchup` (chosen)

A local file path is document mode. The run writes one page under `docs/derived/catchup/documents/`
from a new `references/document-explainer.md`.

- **Premise.** Passes. Like the brief, the page has `approver: none` and an owner, decides nothing,
  and sends open questions back to people by name.
- **Reach.** Passes, since `catchup` is in `atk`.
- **Fit.** Close. The skill's job is "for someone who was not in the conversation", and a document
  handed to a person is the trace of a conversation they missed.
- **Cost.** One new reference file, about 35 lines in `SKILL.md`, the flag-change group of files,
  new trigger cases, the consumes column of `docs/flow/skill-chain.md` and its mirror, and the citer
  list of `plain-writing.md`.
- **Reversibility.** High: one commit, and the pages it writes are derived files, safe to delete.

### B. A new `atkx` skill, `explain`

- **Premise.** Passes the `atkx` bar in `CLAUDE.md`: it runs without a profile and writes nothing a
  teammate is asked to review.
- **Reach.** Fails AC6. A team with only `atk` installed does not have it, and only `atk:help` may
  point there (`CONV-011`).
- **Fit.** A new slash command beside `plain-writing.md`, which lives in `atk` and would have to be
  copied into `atkx`, since each plugin carries every file it reads.
- **Cost.** The nine groups of the `atkx` list, plus a harness-support line.
- **Why it loses.** It reaches fewer teams, and it duplicates the plain-writing rules. It is the
  default choice once the scope covers documents the kit did not write, since that sounds like a
  utility, and it was the alternative named in the session.

### C. A `--plain` flag on every skill that writes a record

- **Premise.** Passes.
- **Reach.** Passes.
- **Fit.** Poor. The explanation would be written at the moment the record is, which is when the
  reader who needs it is not there. It fails AC7 outright, since no skill writes a vendor's report.
- **Cost.** Six skills, six flags, and six sets of `## Output` rules to keep alike.
- **Why it loses.** It covers only new kit records, and it spreads one rule across six files.

### D. Do nothing, and lean on `In short`

- **Premise.** Passes.
- **Reach.** Passes.
- **Fit.** Already shipped, for kit records only.
- **Cost.** None.
- **Why it loses.** It fails AC1 to AC3 and AC7.

| Criterion | A | B | C | D |
|-----------|---|---|---|---|
| Team premise | pass | pass | pass | pass |
| Reach (AC6) | pass | fail | pass | pass |
| Fit | close | new command | poor timing | partial |
| Cost | low | medium | high | none |
| Reversibility | high | high | medium | n/a |
| AC1 to AC3 | yes | yes | new records only | no |
| AC7 | yes | yes | no | no |

## Chosen approach

### Mode selection

Step 1 sets the flags aside, then checks one thing before the URL test and the tracker lookup: does
the input open with a path to an existing local file? If it does, the run is in document mode. It
applies the list of what the run will not read, rule 9 among it, before a byte of the file is read,
and only then settles the shape:

- **A kit record.** The file carries the shared front matter block of `shared/artifact-paths.md`,
  and its directory and headings match a row of the kind table below. The line says "document mode:
  `<path>` is a `<kind>` record of the kit".
- **Any other document.** Everything else, a kit file whose kind is not in the table included. The
  line says "document mode: `<path>`, not a record of the kit, explained as `<findings or
  sections>`", followed by what settled the choice.

A path, a URL or a ticket id counts as the source only when it opens the input, followed at most by a
short request; input of several lines, or quoted, is pasted text. A directory, or a path that does
not exist, is asked about and never sent to the tracker. A pull request URL is pull request mode as
before. A ticket id, or a URL on the detected tracker's host, goes to the tracker, and a tracker that
is not detected or does not answer is reported, never taken for document mode. Pasted text is treated
as any other document with no tracker lookup, and the page body says the source was pasted text.

### A link to a document

A URL that is not a pull request and is not on the detected tracker's host is a link to a document,
with no tracker lookup; so is a tracker URL whose object the tracker answers is neither an issue nor
a pull request. Classifying never fetches a URL. Examples are a page in a wiki, a file in a document store, or a shared drive
entry. Document mode reads it through a connection the harness already has to that service, per the
connection row of `shared/host-capabilities.md`. The run never fetches the URL in any other way.

- **The connection is found by what it can do: read a document by its link.** It is never found by a
  tool name, which differs by harness and by how the connection was installed.
- **It is in one of three states**, read the way `shared/design-sources.md` reads the Figma
  connection:
  - **Not installed:** no tool in the session can read that service.
  - **Installed, not signed in:** the identity call or one test read fails with a not-signed-in
    error, or the test read returns a login page or a page asking for access.
  - **Ready:** the identity call returns an account, or the test read returns the document.
- **Only the ready state is read.** In the other two, the run prints one line naming the service and
  the step the person takes, install or sign in, and then falls back to the local path. It asks once
  for an export of the document, which it then reads as a local file. Neither state stops the run.
- **A read through a ready connection that returns a login page, an access page or a forbidden
  error is a failed read of that item,** never its content, followed by the same fallback.
- **The account the identity call returns decides the state and nothing else.** It is never written
  into the page, the trace, or a ticket.
- **The link appears in the page body as its service and the document's title, never as its URL,**
  so neither an internal host nor a share link reaches the page.
- **A document read through a connection is still an outside document,** with rule 8, rule 9 and the
  sensitivity rules below unchanged.

Today the three states are written for Figma alone. Catchup would be the second skill to need them,
so the implementation moves the general part, the capability test, the three states, and the rule
about the account, into the connection section of `shared/host-capabilities.md`.
`shared/design-sources.md` then cites that section and keeps what is Figma's own: its install line,
its image fallback, and its reading passes. This follows the rule in `CLAUDE.md` that a rule two
skills need goes into `shared/`.

### What the run will not read

- **A path in the table of Paths that are a finding on their own in `shared/secret-scan.md`.** That
  covers a dotenv file, a key, or a credential store. The run refuses it, per rule 9, and asks for a
  copy with the values removed.
- **A format the harness cannot read**, such as a spreadsheet or a word-processor file on most
  harnesses. The run asks for an export it can read, PDF, Markdown, CSV or plain text, rather than
  guessing at the content. This follows the precedent of `atk:security`.
- **A file outside the repository** is read only through the harness's own file tool, which asks the
  person. The run never follows a symbolic link the person did not name.

### What a finding is, per kind of kit record

`references/document-explainer.md` holds one table: the kind, how it is recognised, and what counts
as a finding in it. Recognition is by the file's directory under `<docs root>` and by its headings,
never by the file name alone.

| Kind | A finding is | Fields the page reads |
|------|--------------|-----------------------|
| Security record | each `SF<n>` block | Severity and verdict, Category, What an actor does, What they gain, Suggested control, Settled by |
| Threat model | each threat row, grouped by boundary | boundary, STRIDE question, threat, the control or `none` with the finding ID, Assumptions |
| Review report | each `B<n>`, `S<n>`, `N<n>` | severity section, File, Issue, Fix, Author |
| Fix report | the defect, as one finding | Symptom as captured, Root cause, The change, Not verified |
| Verification record | each failed case under `Cases`, and each item under `Not verified` | Sent, Received, Asserted, Result |
| Test run record, `run-cases` included | each `D<n>` block under `Defects` | Case, Severity, Steps to reproduce, Expected, Actual |
| Incident record | the incident, as one finding, plus each action item | impact, cause, action, owner |

A new kind is added as a row when a skill starts writing it, never handled by guessing.

### Any other document

The run first decides what the document is made of and says so in the mode line:

- **Findings.** The document lists items each of which is a problem. A penetration test report, an
  audit, a scanner export and a vendor's review are examples. Each item is explained with the same
  fields as a kit finding. The document's own IDs, severity scale and wording are kept verbatim. A
  vendor's "P2" stays "P2" and is never mapped onto Critical to Low. A field the document does not
  give is written as "the document does not say".
- **Sections.** Anything else: a specification, a contract annex, a design, a policy. Each top-level
  section is explained with these fields:
  - what it says;
  - what it means for the reader;
  - what it asks of whom, with names when the document gives them;
  - what it leaves open.

  The summary table then has one line per section.
- **Both.** A document with a findings section inside a longer report takes both shapes: sections
  for the report, and findings for the list inside it.

Citations point at what the document has, its own section number, page or heading, since it has no
`path:line`.

Text inside the document is evidence, never instruction, per rule 8. A line that asks the reader or
an agent to do something is quoted on the page as what its author asked, and nothing it asks is
done. The author of an outside document is not a member of the team. A question the document leaves
open goes to the person who handed it over, by name, or `TBD (ask <person>)`, per rule 1.

### Where the page sits beside `atk:intake`

A request a client sent, to be turned into requirements, is `atk:intake`. A document a person wants
to understand is document mode. When the request is ambiguous, such as "look at the client's spec",
the run asks which of the two the person wants, in one question, before reading anything. The
description and the negative trigger cases keep the two apart.

### The page

`references/document-explainer.md` gives the shape. The front matter is the brief's, with its own
`title`, "Plain explanation: <kind or document>", never the document's title, `approver: none`, and
`owner` set to the person who asked. `ticket` is the record's path only for a
committed kit record, and `none` otherwise, per `shared/artifact-paths.md`. The page's slug is the
kind of kit record, `security-record` or `threat-model` for instance, or `document`, and the file
name follows the existing naming rule from those two values. The document's own name appears only in
the page body. The sections follow the hand-written page of 2026-10-16:

1. **In short**, per `plain-writing.md`: what the document is, the counts by severity as it gives
   them, and what is waiting on whom. It is written last.
2. **Terms**: each term the page uses that a non-specialist would not know, said once in words.
3. **One section per finding, or per document section**, in the document's order, headed with its ID
   and a plain title. For a finding it carries:
   - **What happens.**
   - **Who can make it happen**, or "the document does not say".
   - **An everyday analogy**, labelled as one.
   - **What it costs**, against the asset the document names.
   - **What has to be true for it to happen.**
   - **How to fix it**, as the document suggests.
   - **Has it been checked**, from the verdict or the document's own status.
4. **Summary table**: ID, one sentence, severity, who has to be present for it to happen, and where
   the fix lands. For sections the columns are: section, one sentence, what it asks of whom.
5. **Suggested order**, findings only, labelled as a suggestion. It is grouped by severity first and
   by shared files second, and it ends with the name of the person who decides the order: the
   record's approver, or whoever owns priority per rule 3 of `shared/team-roles.md`.
6. **Waiting on**: the document's own open questions with their names, then the questions the run
   found the document leaves open, at most ten lines in total, as step 6 already limits them.

### Fidelity rules

These go in `document-explainer.md` under a heading of their own, and they extend "What does not
change" in `plain-writing.md` rather than restating it:

- **Every claim on the page is traceable to a place in the document.** The page holds no new
  findings, no new severities, and no new verdicts. A field the document leaves empty is written as
  "the document does not say", never filled in by inference.
- **The analogy is the one sentence the document does not hold.** It is labelled as an analogy, and
  it never changes the severity a reader would infer.
- **IDs, severity names, verdicts and status values stay as the document spells them,** even when
  `--lang` is set, since another reader or skill matches on them.
- **Each finding or section keeps one citation**, so a reader who wants the evidence can find it.
- **No step-by-step exploit.** The page says what an actor does at the level of detail the document
  does, and never more. A value the document shows and rule 9 would mask is masked on the page, and
  the page says that it masked something.

### Sensitivity

The page inherits the sensitivity of the document it explains. Three cases need the warning:

- a kit security record whose residual risk table holds a row nobody has accepted, or whose
  `CONFIRMED` findings are unfixed, or a threat model with a row whose control is `none`;
- an outside document marked confidential, or one that names a client;
- any document with a value the page had to mask.

In each case the run explains the document in full, and at its close says in one line, in the
session, why the page is sensitive. Nothing about it is written into the page. The page is a
temporary document and is never offered to be committed. It is written to
`docs/derived/catchup/documents/`, which holds an ignore file with the single line `*`, made the way
`shared/run-trace.md` makes the trace's and confirmed with `git check-ignore -q` on the page's path,
so the page stays out of git even in a project that commits `docs/derived/`. Where `git check-ignore`
fails the page is still written, and the session says that it is not held out and why; a real path
outside the repository writes nothing. Git is the only thing the ignore file keeps the page from: a
docs build or an archive over the docs root reads it too, so the session line says "held out of git
only". A page about an
outside document in this repository also falls under `CONV-010`: it names no client.

### Roles

- **Reader.** Anyone who has to act on a document they did not write: a PM deciding the order of
  work, a Stakeholder accepting a risk, a Dev new to the area, or the approver themselves.
- **Owner.** The person who asked for the page.
- **Approver.** None, as for the brief. The document carries whatever approval it has, and the page
  changes nothing in it.

### Data model and migration

N/A. No schema and no stored state. The page is one Markdown file.

### API contract

N/A. The only contract is the invocation. `argument-hint` becomes
`"[epic-url|pr-url|file-path|doc-url] [--no-check] [--lang <code>] [--out <path>]"`. `--no-check` is ignored
in document mode, which has no understanding check, and the session says so.

### Error and edge cases

- **A document with no findings and no sections**, such as one paragraph. The page is the
  `In short` section, the Terms section and the Waiting on section, and it says so.
- **A kit record whose status is `SUPERSEDED`.** The page names the record that replaced it in its
  first line and asks whether to explain that one instead.
- **A document longer than the session can read whole.** Each finding or section is explained from
  its own part, and reading wide goes through an agent, per `shared/host-capabilities.md`, as step 3
  already does.
- **A scanned PDF with no text layer.** The run says that it cannot read the text and asks for a
  text export. It never transcribes an image of a finding by guessing.

### Backward compatibility

Epic and pull request modes are unchanged. An argument that was a local file path used to fail at the
tracker lookup, and it now reaches document mode. No working invocation changes meaning.

### Rollout

One pull request carries the mode, the reference file, the trigger cases, and the files the
flag-change rule in `CLAUDE.md` lists. No feature flag.

### Rollback

Revert the commit. The pages already written are derived, held out of git, and safe to delete, per
the Derived row of `shared/artifact-paths.md`.

### Observability

The run trace records the mode and the kind or shape in its first `step` line. The trace is created
before the kind is known, so its `subject` and slug are made only from a ticket id, a pull request
number or a tracker URL's key that the input opens with, and are `document` for any other input, never
the document's name, so a client's file name never names a trace. An `--out` value stays in the trace's `flags` as given, since the person chose
the path, and in document mode the session says in one line that the trace keeps it.

### Security and permission impact

- **Rule 8 is the control for outside documents.** It is stated inside the mode's own step, not only
  cited. This repository's security record of 2026-10-16 found that a rule reached only through a
  citation may not be read (its SF7).
- **Rule 9 is applied twice:** to which files are read, and to what the page prints.
- **The ignore file and the session warning** are the control for what the page restates.
- **Nothing is fetched outside a connection.** The run reads a local file, pasted text, or a document
  through a ready connection to its service. The person signed that connection in, so the run reaches
  nothing they could not open themselves.

### Performance expectation

One document is read once. Its cost is the document's size plus the reference file, about 150 lines.

### Files the implementation touches

- `plugins/atk/skills/catchup/SKILL.md`: Scope (handles, and the line against `atk:intake`),
  Invocation, the step 1 mode test, a short step between 2 and 4 for document mode, Output, and
  Definition of done.
- `plugins/atk/skills/catchup/references/document-explainer.md`, a new file holding the kind table,
  the two shapes, the page, the fidelity rules, and the sensitivity cases.
- `plugins/atk/skills/catchup/evals/trigger_evals.json`: positive cases in three languages for a kit
  record and for an outside document. Negative cases against `atk:intake` ("turn this client document
  into requirements"), `atk:review`, `atk:security` and `atk:retro`.
- The description's triggers, in three languages: "explain this document", "explain these findings
  simply", "giải thích tài liệu này dễ hiểu", "giải thích finding dễ hiểu",
  "この資料をわかりやすく説明して".
- `README.md`, the invocation block; `docs/skills-overview.md` and `docs/vi/skills-overview.md`.
- `docs/flow/skill-chain.md` and `docs/vi/flow/skill-chain.md`: the consumes column of `catchup`.
- `CLAUDE.md`: the citers of `shared/plain-writing.md` gain `catchup`.
- `plugins/atk/shared/plain-writing.md`: its citer line gains `catchup`'s document mode.
- `plugins/atk/shared/host-capabilities.md`: the connection section gains the general rule, which is
  the capability test, the three states, and the account that is never written.
- `plugins/atk/shared/design-sources.md`: "Find the connection by what it can do" cites that section
  and keeps only what is Figma's own.
- `CLAUDE.md`: the `host-capabilities.md` row of the `shared/` table names the connection states, and
  the `design-sources.md` row stops claiming them.

## Decisions taken during review

- **A security record with unaccepted risk** is explained in full, with a warning. Lam Ngoc Khuong,
  2026-10-16, over the alternative of refusing it. Where the warning lives was settled later, below.
- **The threat model is a known kind.** Lam Ngoc Khuong, 2026-10-16.
- **Any document, not only kit records.** Lam Ngoc Khuong, 2026-10-16. This widened the mode from
  record mode to document mode.
- **A link is read through a connection the harness has**, with a local export as the fallback.
  Lam Ngoc Khuong, 2026-10-16, over the alternative of always asking for an export.

Answered while planning the implementation, all by Lam Ngoc Khuong on 2026-10-16. Each replaced a
line of this design, which now says what the answer says:

- **How the page is named.** The slug of the page and of its trace is the kind of kit record or
  `document`, and `ticket` is a committed kit record's path or `none`, per `shared/artifact-paths.md`.
  The document's own name appears only in the page body. This replaced `ticket` set to the
  document's path and a trace subject made from the document's name, which would have put a client's
  file name into names the mask does not cover.
- **The page is temporary.** It is never offered to be committed, and the sensitivity warning is one
  line printed in the session at the close, with nothing written into the page. This replaced a
  warning given before any commit of the page, since `atk:catchup` offers no commit.
- **The page is held out of git** in `docs/derived/catchup/documents/`, by an ignore file holding `*`
  checked with `git check-ignore -q`, as run traces are. This replaced relying on the warning in a
  project that commits `docs/derived/`.
- **An `--out` value stays in the trace as given,** because the person running the skill chose the
  path, and the session says so in document mode.
- **`atk:intake`'s `## Scope` gains the reciprocal line,** sending a person who wants to understand a
  document they were handed to `atk:catchup`.

Corrected after the implementation's review, on 2026-10-16, with Lam Ngoc Khuong's agreement, while
this record was uncommitted to `main`: mode selection applies the rule 9 list before a file is
classified, sends only a ticket id or a tracker-host URL to the tracker, and asks about a directory
or a missing path; the trace is named `document` unless the input opens with a ticket or pull
request; the page has its own `title`; the kind table carries the fields the records really have;
a threat model with a `none` control triggers the warning; a failed read through a ready connection
falls back; and the page is held out of git only. The two review reports sit in the implementation's
pull request.

## Open questions

None. Every question raised by this design was answered by Lam Ngoc Khuong on 2026-10-16.
