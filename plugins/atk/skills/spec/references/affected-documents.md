# The documents a design makes untrue

Loaded by `atk:spec` under `--from`, in step 1, before the document is written. A design names the
reference documents it expects `atk:spec --from` to write, and under `Contract: first` step 4 of
`atk:design-doc` asks it to name every other one the change makes untrue as well. A design written
before that rule, or one whose author did not know the docs tree, still leaves some out: the enum
document that lists the status the design adds, the feature document whose flow now has a new step,
the backend standard that describes the authentication the design replaces. A run that writes only
what the design names leaves those wrong until the next `--check`, and a person who does not know the
tree never learns they were.

## What is searched

From the design's sections on the data model, the API contract, and the behaviour rules, collect
what the change adds, alters, or removes: table and column names, enum names and their values,
endpoint paths, and the named rules. Search for each in the docs root resolved per
`shared/artifact-paths.md`, and in the docs tree of every member repository the profile records,
since a contract one member owns is documented there, per step 1 of `SKILL.md`. Every language
branch is searched, resolved per A root partitioned by language in `shared/artifact-paths.md`, the
mirrors the profile declares and those the tree shows alike. Records under `docs/records/`, the ADR
directory resolved per `shared/artifact-paths.md`, and anything under `docs/derived/` are not
searched: they describe a moment, an ADR included although it sits outside `docs/records/`, and a
change does not make them untrue. Nor are the files rule 9 of `shared/team-roles.md` keeps unread,
the table of `shared/secret-scan.md`, whatever directory they sit in.

A document counts when it describes one of those names as the system has it today, not when it
merely mentions it in passing, and the result is grouped by document, each with the names it
describes and how many, so a generic name such as `status` that matches most of the tree reads as one
weak match rather than a list of them. A mirror counts with its source document, as one entry. A
document whose items already cite this design, or its ticket where the design cannot be reached,
was written from it and is not counted. A document the design names as made untrue that has not
been rewritten from it, by the test of row 1 in `shared/state-signals.md`, is listed with the found
ones, marked as named by the design, since the design naming it writes nothing in it. One changed since is not marked: under `Contract: first`
its items cite code once built, per `shared/spec-docs.md`, so the design no longer shows in a
document written from it, and the search counts it like any other.

A template is not a subject: a file the kinds table of the profile names as a kind's template, and
the kit's own template files in `skills/spec/references/`, are left out. Any other file whose name
says it may be one, `docs/api/templates.md` among them, is listed and asked about, since a product
with a `/templates` endpoint keeps a real document under that name. The side files a kind keeps,
`docs/api/conventions.md` and `docs/database/index.md`, are named as kept by the write of their
subject rather than offered as subjects of their own. A side file the design makes untrue, of a
kind the run's own subject is not, is offered in the same turn under its kind, to be written when
no document of that kind gets a yes, so nothing the design changed goes unnamed.

Only the kinds `--from` writes are offered to be written: `api`, `db`, `feature`, and a kind the
project declares in its profile. A document of any other kind the search finds is named with the
skill that owns it, and never offered: a coding standard is `atk:convention`'s, and a screen
document is updated from its own design with `atk:spec <screen> --kind screen`.

## What is asked

Before step 2, list each document found, apart from the run's own subject, with the names it
describes, the `path:line` where it does, why the design makes it untrue, its kind, its approver,
and, where it sits in a member, the repository and the branch checked out there, marked when that
branch is the member's default branch, and marked in any repository when the document holds
uncommitted changes, or say that none was found. Then ask the person, in one turn per
`shared/host-capabilities.md`, which of them this run writes as well. The turn happens when nothing
was found too, since it carries first the gaps step 3 of `SKILL.md` asks the author about for the
run's own subject, then those of every document the person may say yes to, rather than once per
document after it: the turn lists them under each document, and a yes carries its answers.

The run does not decide: each document has an approver who may not expect the change, and the
person running the skill knows whether the design's silence was an omission or a choice. A yes means
this run writes that document after its own subject, from the design and its author per step 3 of
`SKILL.md`, each document its own file with the approver of its kind. A no leaves it as it is, and
the run summary names it with the line that writes it later, `atk:spec <subject> --from <design
path>`. A run with nobody to ask, a headless one, writes its own subject alone and names the others
the same way.

A document with uncommitted changes is not written, whatever the answer, since the run's edit would
be mixed into somebody's work in progress: it is named with the line that writes it once those
changes are committed. A document in a member checked out at its default branch is written only
after the person names a branch to create there for it; a run with nobody to ask writes neither.

A document written in a member repository changes that repository, on the branch checked out there,
not the one this run started in. The run summary names each such repository and branch, per A
project that spans several repositories in `shared/artifact-paths.md`, so the change is carried
there by its own `atk:git` run rather than lost beside the run's own.

When the run's own subject is one the design does not name, the run writes it as it writes a named
one, and asks about the others as above.

Every `--from` run on the same design repeats the search, so a run on the third document still names
what the first run found, minus what has since been written from the design. A document a person
declined is named again, since nothing outside that session records the no.

## Definition of done

- [ ] Every name the design adds, alters, or removes was searched for across the reference documents
      of the docs root, of every member's docs tree, and of every language branch.
- [ ] Each document found, and each existing one the design names that cites neither it nor its
      ticket and has no commit since its first one, was named with its `path:line`, its kind, its
      approver, and its repository where that is a member, before step 2, and the person was asked
      once which of those `--from` writes the run should write as well, with the author's gaps for
      each in the same turn.
- [ ] No record, ADR, derived file, template the profile or the kit names, or file rule 9 keeps
      unread was offered as a subject; a side file the design changes was offered when no subject of
      its kind was written.
- [ ] Only the documents the person said yes to were written beside the run's subject, each with the
      approver of its kind, and the run summary names the rest with the line that writes each.
