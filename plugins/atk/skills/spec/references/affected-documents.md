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
endpoint paths, and the named rules. Search the docs root for each, resolved per
`shared/artifact-paths.md`, over every reference document, and over every language mirror the Docs
section of `.atk/profile.md` declares. Records under `docs/records/` and anything under
`docs/derived/` are not searched: they describe a moment, and a change does not make them untrue.

A document counts when it describes one of those names as the system has it today, not when it
merely mentions it in passing. A mirror counts with its source document, as one entry.

## What is said

A `--from` run writes one subject, the one it was invoked on, as `## Invocation` of `SKILL.md` says,
and the design's documents are written one run each, per row 1 of `shared/state-signals.md`. So the
search names documents and writes none of them. Before step 2, say in the session, and again in the
step 5 summary:

- each document found that the design does not name, with the name it describes, the `path:line`
  where it does, why the design makes it untrue, its approver, and the line that writes it,
  `atk:spec <subject> --from <design path>`;
- that none was found, when none was.

The run does not decide whether such a document is written: it has an approver who may not expect
the change, and the person running the skill knows whether the design's silence was an omission or a
choice. Running the line is how the person chooses. When the run's own subject is one the design
does not name, the run writes it as it writes a named one, from the design and its author per step 3
of `SKILL.md`, and names the other documents found as above.

Every `--from` run on the same design repeats the search, which costs a search of the docs root and
asks nothing, so a run on the third document still names what the first run found, minus what has
since been written from the design.

## Definition of done

- [ ] Every name the design adds, alters, or removes was searched for across the reference documents
      and their mirrors.
- [ ] Each document found was named with its `path:line`, its approver and the line that writes it,
      before step 2 and in the summary, and none of them was written unless it was the run's subject.
