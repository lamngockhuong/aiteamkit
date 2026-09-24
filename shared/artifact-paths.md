# Artifact paths

Shared output convention for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/artifact-paths.md`, which is `../../shared/artifact-paths.md` relative to a skill file.

Every skill that writes a file writes Markdown into the **target project**, never into the atk kit
itself; `atk:help` writes none. The one exception is `atk:convention`, which may also write the
project's own collaboration files, one of which is not Markdown; the paragraph after the table says
what they are.

## Root

The docs root is `docs/` unless the project says otherwise. Before writing, check in this order and
use the first that exists: the project `CLAUDE.md` or `AGENTS.md`, an existing docs folder with the
same shape, then `docs/`. Never create a second parallel tree beside one that already exists.

The root that path hangs off is the project root, defined per Where the project root is in
`shared/project-profile.md`. In a project of one repository the project root and the repository root
are the same directory, and the next subsection changes nothing.

### A project that spans several repositories

Where the shape in `.atk/profile.md` names member repositories, the docs root hangs off the project
root, and that is where an artifact about the project goes: the requirements, the design and its ADR,
the breakdown, the estimate, the retro, the release record, the incident record, the runbook, the
onboarding documents, the conventions, and the reference document of any contract two members share.
One tree, read by every team.

Under `parent + members` that tree is in the parent repository, which is what the parent repository
is for, and it is committed like any other document. Under `workspace` the project root belongs to no
repository, so the tree there is tracked by nothing: the same price the profile pays under that
shape, per Projects that span several repositories in `shared/project-profile.md`. Name it before
writing rather than after, and say the same thing the profile's own paragraph says, that a workspace
root made into a repository ends it for good. Do not quietly promote one member's docs tree into the
project's: a document about the whole project sitting in one team's repository is a document the
other teams will not think to look in.

An artifact that is the evidence for one change is the exception, because it travels in the pull
request carrying that change and a pull request cannot reach outside its own repository. The
implementation record, the fix report, the verification record, the review report and the shipping
record are written into the docs root of the repository the change is in, resolved there by the same
order as above.

A member with a docs root of its own, recorded in the `Docs` section of the profile, uses it. A
member with none falls back to the project docs root rather than creating a tree the team never asked
for, which replaces the last step of the order above for that member. Say what the fallback costs
before writing rather than after: the artifact lands in a second repository, so it cannot be in the
pull request the reviewer is reading, and only a link joins them. `shared/finalize-steps.md` owns
that link.

`atk:plan` writes under `plans/` at the project root and not at the member's, because one plan may
cover several members. Each step names the repository it touches, which is the same information a
per-member directory would carry and in the place the step is read.

### A root partitioned by language

Some projects split the docs root by language: `docs/` beside `docs/ja/` and `docs/vi/`, holding
the same documents in the same subdirectories. Recognise it by both halves of that, a directory
whose name is a language code, and at least one `.md` filename it shares with the branch beside it.
A directory named after a subject is not this, which is why `docs/api/` never qualifies.

Overlap rather than equality, because the two sides are never equal. The authored branch also holds
the language directories themselves, and it holds whatever the mirrors leave out, which for this
kit is `docs/derived/` and `docs/records/`. A translation that has covered four documents out of
thirty is the ordinary state of a bilingual tree, not a tree that has stopped being one.

Which language the tree is authored in has three sources. Check in this order and use the first
that answers, the same order the docs root itself resolves in: the project `CLAUDE.md` or
`AGENTS.md`, then the `Authored language` line in the `Docs` section of `.atk/profile.md`, then the
tree, where the authored branch is the one the mirrors copy from, which is the root itself.

Where every branch carries a language code and the root holds no documents of its own, which is
what Docusaurus and Astro Starlight lay out by default, there is no unmarked branch to read the
answer off. Ask which language the tree is authored in. Guessing there writes a third sibling
outside every branch, which is the shape this rule exists to prevent.

That question is about the directory layout, not about the profile, and it is asked whenever no
source above answers it. A skill in the `Not needed` group of `shared/project-profile.md` may
therefore ask it without leaving its group: the group forbids requiring the profile, degrading
without it, or mentioning it, and asking where a document goes does none of the three. Ask about
the tree, never about the file.

In a partitioned tree the language a run writes in chooses the branch, rather than changing the language
of the file at one fixed path. A run writing Vietnamese puts it at `docs/vi/onboarding.md`; it does
not write Vietnamese to `docs/onboarding.md`, which is the path that tree reserves for the authored
language. Doing the latter leaves one document that matches no other document in the tree, and the
next person to run the skill cannot tell whether that was a decision or an accident.

The language of a run is not always a flag, and this is where the rule is easiest to lose. `--lang`
sets it when it is passed. When it is not, rule 6 of `shared/team-roles.md` sets it: artifacts
follow the team's working language, which defaults to the language the user writes in. A team
working in Vietnamese therefore reaches `docs/vi/` on a bare invocation, with no flag anywhere to
point at afterwards. Read the language off the run, not off the argument list.

The authored-language file is the one the tree expects to exist. A mirror written without it is
half a pair, and the run still writes the mirror: it then names the authored-language path that is
now missing and lets the team decide whether to write it. Do not write a language nobody asked for
in order to fill the gap.

An explicit `--lang` overrides the working language for this run and does not have to agree with
it. What neither of them may do is move a language onto another language's path.

A project that wrote its artifact before any of this already has a file at the unpartitioned path,
and the run that now lands in a branch leaves it behind. Say so rather than walking past it: name
the older file, say that the tree expects the document at the branch path from now on, and let the
team move it or mark it `SUPERSEDED`. Silence there leaves two documents that both read as current,
and the stale one sits at the path people still look in.

Only Reference-group artifacts that sit under the docs root are mirrored this way. `.atk/profile.md`
and `.atk/overrides/<skill>.md` are Reference and live outside it, so the language of the run
decides what they are written in and never moves them. A record and a derived artifact describe a
moment, in the language of the run that produced it, and translating one would be translating
history; they are never mirrored.

Not mirrored is not the same as having no branch. `docs/records/` and `docs/derived/` sit in the
authored branch, once, whatever language each file inside them happens to be in, and where every
branch carries a language code they sit in the branch the answer above named. Leaving them at the
bare root there would create the third sibling this section exists to prevent, and it would do it
to `docs/adr/` as well.

`--out` still wins over all of this.

## Default paths

| Skill | Default output |
|-------|----------------|
| `help` | No file: the answer is given in the session, because everyone it is for is present |
| `init` | `.atk/profile.md` (see the exception below) |
| `tailor` | `.atk/overrides/<skill>.md` (see the exception below); a `--feedback` record at `docs/derived/feedback/<skill>-<date>.md`, with everything in the skill name that is not a letter, a digit, or a hyphen flattened to a hyphen, so a namespace becomes `<namespace>-<skill>` and no name a person typed can write outside the directory |
| `intake` | `docs/records/requirements/<ticket-or-date>-<slug>.md` |
| `catchup` | `docs/derived/catchup/<ticket-or-date>-<slug>.md` |
| `estimate` | `docs/records/planning/estimate-<sprint-or-date>.md` |
| `design-doc` | `docs/records/design/<ticket-or-date>-<slug>.md`, ADR at `docs/adr/NNNN-<slug>.md`; under `--spike`, `docs/records/design/<ticket-or-date>-spike-<slug>.md` and no ADR |
| `spec` | `docs/api/<resource>.md`, `docs/database/<table>.md`, `docs/features/<slug>.md`, `docs/screens/<screen>.md` (see below) |
| `breakdown` | `docs/records/planning/breakdown-<epic>.md` |
| `convention` | `docs/standards/`, an `index.md` plus one `<tech>.md` per technology and a `<layer>/<tech>.md` where its rules differ by layer, for a project with nothing written; `docs/conventions.md` where the kit wrote one before; on request, the collaboration files the project lacks (see below) |
| `plan` | `plans/<YYMMDD-HHMM>-<slug>/` holding `plan.md` and one file per phase (see below); under `--review` no plan file at all, and a report at `docs/derived/reviews/plan-<slug>-<date>.md` |
| `implement` | The code; the implementation record becomes the pull request body, and an optional copy goes to `docs/derived/implementation/<ticket-or-date>-<slug>.md` |
| `fix` | `docs/records/fixes/<ticket-or-date>-<slug>.md` |
| `review` | `docs/derived/reviews/<pr>-<date>.md`, written on every run; under `--comment` the findings also go to the pull request |
| `qa` | `docs/qa/test-plan-<slug>.md`, `docs/qa/test-cases-<slug>.md` |
| `verify` | `docs/records/verification/<ticket-or-date>-<slug>.md`, with any screenshots in `docs/records/verification/<ticket-or-date>-<slug>/` beside it |
| `git` | No document of its own: the commits and the pull request. An optional shipping record goes to `docs/derived/shipping/<date>-<slug>.md` |
| `release` | `docs/records/releases/<version>.md` |
| `incident` | `docs/records/incidents/<date>-<slug>.md`, runbook at `docs/runbooks/<slug>.md` |
| `retro` | `docs/records/retros/<sprint-or-date>.md` |
| `onboard` | `docs/onboarding-<role>.md` under `--role`, `docs/onboarding.md` without it; a defect found while verifying a setup step at `docs/derived/onboarding/setup-defects.md` |
| `handover` | `docs/records/handover/<date>-<from>-to-<to>.md` |

`--out <path>` overrides the default on every skill that writes a file, which is every skill but
`help`.

`atk:convention` may also write `CONTRIBUTING.md`, the pull request template, and `CODEOWNERS`, each
at the location its host reads, per `shared/host-file-locations.md`, and never into the docs tree
this file governs. They are the project's own collaboration files rather than artifacts of this kit:
none carries the front matter block, `CODEOWNERS` is not Markdown at all, and the persistence groups
below do not classify them. What they do share with every group is that they are **committed**: the
team owns them afterwards the way it owns its linter config, and updates them the way it updates
one. `--out` does not move them, because a host reads them where it reads them and nowhere else.
`skills/convention/references/collaboration-files.md` holds the rest, including that they are
offered and picked rather than created.

### The exceptions: `init`, `tailor`, and `plan`

Three skills write **artifacts** outside the docs root, for two different reasons. The collaboration
files above are a separate case and not counted here: they are the project's files rather than this
kit's, and where they go is the host's decision rather than ours.

`atk:init` writes to `.atk/profile.md` and `atk:tailor` writes to `.atk/overrides/<skill>.md`. Every
other artifact here is prose a person reads and reviews; these two are read by a skill, and mixing
the two kinds makes the docs tree noisy. Both are committed, except under the `workspace` shape, where the project root belongs to no
repository and nothing tracks either of them, and except where the repository refuses the file.
`shared/project-profile.md` and `shared/project-overrides.md` explain the rest, including what
separates the two files and, under "When the repository will not take the file", what a refusal
costs.

The override file is named after the skill it belongs to, with no date and no ticket, for the reason
the next section gives: the next person looks for the skill, not for the sprint in which somebody
decided to change it.

`atk:plan` writes a directory under `plans/` at the project root, not under the docs root, and
names it `<YYMMDD-HHMM>-<slug>` rather than by ticket. Both choices exist so the output sits where
other planning tools in the ecosystem already look, and so a project that has a `plans/` tree does
not end up with two of them. The ticket is not lost: it stays in the `ticket:` field of the index
front matter, which is where every other artifact carries it anyway.

A project whose `.gitignore` already covers that directory is saying it does not keep plans. That is
the general case under Persistence below, and a plan is the sharpest instance of it, because a plan
the rest of the kit believes exists is one every later skill reads from and nobody will ever find.

A project that keeps its plans somewhere else says so in its `CLAUDE.md` or `AGENTS.md`, and that
wins, exactly as the docs root rule works above.

### Named after the subject: `plan` is dated, `spec` is not

`atk:spec`, `atk:qa`, `atk:tailor` and `atk:onboard` are the skills whose file names carry neither
a ticket nor a date. A reference document is named after the thing it describes, one file per resource, per
table, per feature, per screen, or per skill, because the next person looks for the subject rather than for the
sprint it was built in. The `spec` kinds:

| Kind | Directory | One file per |
|------|-----------|--------------|
| `api` | `docs/api/` | resource |
| `db` | `docs/database/` | table |
| `feature` | `docs/features/` | feature |
| `screen` | `docs/screens/` | screen |

A project overrides a row, or adds a row of its own, in the `Docs` section of `.atk/profile.md`. The
kind name is also the value of `--kind`, so a kind the project declared is invocable without touching
the kit.

A `Docs` row names where a kind of document lives, and that is all it does. It cannot move an
artifact out of the persistence group Persistence below puts it in, and it cannot send one into a
directory the project ignores, whatever the row says. A row that reads like a home for reports,
`plans/reports/` being the usual one, is usually the second of those: it is the project's own
working tree, ignored as often as not, and a Record-group artifact written there is a record the
rest of the kit believes exists and nobody can read.

## Persistence

Three groups, and the group decides both what happens to a file after the work that produced it is
merged and which directory it goes in.

| Group | Which | Directory | After the merge |
|-------|-------|-----------|-----------------|
| Reference | the `spec` kinds, `docs/qa/`, `docs/standards/` and `docs/conventions.md`, the onboarding documents, `docs/runbooks/<slug>.md`, `.atk/profile.md`, `.atk/overrides/<skill>.md` | the top level of the docs root, and `.atk/` for the profile and the overrides | Updated in place. It claims to describe what the project does today, or for a `spec` kind under `Contract: first` what it is agreed to do, so a stale line in it is wrong rather than old |
| Record | requirements, planning, design, fixes, verification, releases, incidents, retros, handover, and the ADR | `docs/records/<kind>/`, the ADR excepted | Left alone. It describes a moment, and rewriting it destroys the only account of what was true then |
| Derived | the implementation record, the review report, the catchup brief, the skill feedback record, the shipping record, the onboarding setup-defect report | `docs/derived/<kind>/` | Safe to delete. Everything here is either a copy of something else or rebuilt by running the skill again |

Three questions place a kind, in this order. Does something else already hold the original, or does
re-running the skill reproduce it? Then it is derived. Otherwise, does it describe a moment, which
its name says by carrying a ticket, a date, a sprint, or a version? Then it is a record. What is
left describes the system as it currently is, or as it is agreed to be, and that is reference.

The question about the name is the one that settles the cases people argue about. `docs/qa/` is
named after the feature rather than the sprint, and a regression suite is updated when the feature
changes rather than written again, so test cases are reference and sit at the top level.

One exception, and it is deliberate. ADRs stay at `docs/adr/` although they are records and are
never edited, because people browse that directory the way they browse reference: numbered, one
line per decision, the short permanent form of a design document that has grown long. Burying it
one level down hides the thing most likely to be looked up.

A project that already keeps these kinds at the top level of its docs root keeps them there. The
grouping is the kit's default for an empty tree, not a move to perform on a project that has been
writing to `docs/design/` for a year, and splitting a directory in half is worse than either shape.

Every file in the first two groups is committed, the same as `.atk/profile.md` and under the same
two exceptions.

A project whose `.gitignore` covers the directory an artifact is bound for overrules that. The group
is this kit's default for where a file should end up; whether this repository keeps it is the
project's decision, and it wins here the same way it wins over the docs root above. What may not
happen is the team learning it afterwards. Name the directory before writing the file, say that the
artifact will not be staged and will not travel in the pull request, and let the team decide whether
to track it, to put it elsewhere, or to write it there anyway. A run that discovers it at the commit
has already made that choice on the team's behalf, and the artifact it wrote is a record the rest of
the kit believes exists and nobody will ever read.

Only the first two groups raise the question. A project that has ignored `docs/derived/` is doing
what the next paragraph already allows, so there is nothing to say and nothing to ask.

`docs/derived/` is the only part of the tree a project may leave untracked, and nothing in the
chain breaks if it does: the implementation record and the shipping record are copies of what lives
on the pull request, a catchup brief is rebuilt by running `atk:catchup` again, a review report by
running `atk:review` again, or `atk:plan --review` where what was reviewed was a plan, a feedback
record is a copy of what was filed with whoever owns the skill it is about, and a setup-defect
report is rebuilt by running `atk:onboard` again against the repository as it stands then.
A record nobody has filed yet is the only copy there is, and a review run without `--comment` posts
nothing, so its report is the only written copy until it is rebuilt; both are a reason to keep the
directory rather than a break in the chain. Two skills read one of the six, and both read the review
report: a second `atk:review` over the same target reads the one already at that path, to carry its
finding identifiers forward, and starts numbering at 1 and says so when there is none; and
`atk:convention` reads the `Convention gaps` section of the reports written for the project, per
Keeping them in step in `shared/review-checklist.md`. Nothing else reads any of the six, and losing a
report costs a set of identifiers and a list of gaps the next review raises again, rather than a step
in the chain. A team that
wants a smaller repository adds one line to `.gitignore`; a team that
wants the copies keeps them. The kit writes no other artifact meant to stay untracked.

The split is why `docs/records/design/<ticket>-<slug>.md` and `docs/api/<resource>.md` are two
documents rather than one. A design argues for a change and cites the code as it stood before it;
the day the change merges, that citation stops being true and the document becomes an account of a
decision. The reference document begins where the design ends, and from then on it is the code that
has to keep up with it, or it with the code.

## Naming

- Dates are `YYMMDD`, taken from `date +%y%m%d` on macOS and Linux or
  `Get-Date -UFormat "%y%m%d"` on Windows PowerShell. Do not guess today's date.
- Plan directories carry the time too, `YYMMDD-HHMM`, from `date +%y%m%d-%H%M`. Two plans started on
  one day are common; two started in one minute are not.
- Slugs are lowercase kebab-case, derived from the title, at most six words.
- A reference document takes its name from its subject, not from a title: the resource, the table,
  or the feature. Lowercase kebab-case, and it does not change when the subject is extended.
- ADR numbers are zero-padded to four digits and never reused. Read the existing `docs/adr/`
  directory to find the next one.

## Front matter

Every artifact opens with the same block so a reader knows its state without reading the body. A
`TBD` always carries the name of whoever can resolve it; a bare `TBD` is a hole nobody owns:

```yaml
---
title: <one line>
status: DRAFT | IN REVIEW | APPROVED | SUPERSEDED
owner: <person>
approver: <person, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <id or URL, or none>
---
```

In this block `status` is the approval state and nothing else. Two kinds add fields. A reference
document in a project whose profile says `Contract: first` also carries `implemented`, defined under
When the contract comes before the code in `shared/spec-docs.md`. A `screen` document carries
`implemented` under either `Contract` line, per The `screen` kind in that file, and the four
`design_*` fields of What a read records in `shared/design-sources.md`.

## Before writing

Read the file if it already exists and update it in place. Do not overwrite an `APPROVED` artifact:
supersede it, link the replacement, and say which decision changed.

The no-overwrite rule is about records. A reference document is updated in place by design, and
superseding one would leave the project holding two files that both claim to describe the same live
endpoint. Its front matter goes back to `IN REVIEW` when an update changes what it promises.

A plan directory never collides, because its name carries the time, so updating in place cannot
happen by accident there. Planning the same work again therefore has to supersede by hand: set the
old index `status` to `SUPERSEDED`, link the new directory from it, and link back. Otherwise the
project accumulates plans that all look current.

Every record works this way, not only plans. A design that replaces an earlier design, a
requirement document rewritten after the scope was renegotiated: the old file keeps its content,
takes `SUPERSEDED`, and carries the link to what replaced it. Two files that both read as current
is the failure this prevents, and it costs two links.
