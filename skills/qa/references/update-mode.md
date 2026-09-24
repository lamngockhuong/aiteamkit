# Updating a cases file

Loaded by `atk:qa` under `--update <cases-path>`, in place of the five workflow steps. It brings an
existing cases file level with a requirement, a reference document, a screen spec, or a design that
has changed since the file was last written, without generating it again. The cases file is a
reference document, per `shared/artifact-paths.md`: it is updated in place, and a suite regenerated
from nothing loses every ID a bug report, a run record, and a regression matrix point at.

What a row looks like, the ID rule, the struck-through row, and the Sources table are in
`references/test-case-template.md`; how a new case is found is steps 2 and 3 of `SKILL.md`. This file
only says what changed and what the run may do about it.

## 1. What changed

The Sources table of the cases file is the baseline: it records what each source was when the last
run read it. A file with no Sources table was not written by this skill, or was written before the
table existed; the run says so, reads every source whole, and treats every case as resting on
something that may have changed, which section 3 then handles row by row.

For each row of the table, and for each source the requirement now names that the table does not:

- **A file.** Hash its content the way the table does, line endings turned into LF first. The same hash means no change. A different
  hash means read what changed: the old content is the version in the file's history whose hash is
  the recorded one, `git log -p --follow -- <path>` in whichever repository holds it, and the change
  is the difference between that version and the file as it stands now, uncommitted edits included.
  Where no version with that hash can be found, the source is read whole and every case resting on it
  is compared with it. A commit between the two reads, or a squash that folded several together,
  changes nothing here: the comparison is between two contents, not two commits.
- **A design read directly.** Read exactly the recorded `design_node` again and compute its
  `design_fingerprint`, per `shared/design-sources.md`. The same fingerprint means no change. A
  design that cannot be read is said in the run summary, and the cases resting on it are left as they
  are.
- **A source not in the table yet.** Read whole, as new.

Sort every change into one of three groups, from what the source says and nothing else:

| Group | The source |
|-------|------------|
| `NEW` | Gained a criterion, a rule, a field, a state, an error, or a component the cases do not cover |
| `MODIFIED` | Changed a value a case asserts or depends on: a limit, a message, a label, a status code, a role's permission, a step of a flow |
| `DELETED` | Lost something a case covers |

A change the source does not explain, a value that moved with no reason given, is still grouped by
what it does; why it changed is not the run's to guess, and the run summary never offers a reason.
Where a change contradicts the requirement, the case follows the source that wins per step 1 of
`SKILL.md`, and the contradiction becomes an open question for that source's approver.

A change that settles an assumption is `MODIFIED` too: a screen spec that reached `APPROVED`, a
`Proposed:` mark removed, or an open question a case points at answered, in the source or in this
file. The `[ASSUMPTION]` mark comes off every case resting on it, the value is rewritten where the
answer differs from what the case assumed, and the matching question in this file is closed.

## 2. What the approver has already answered

Before touching a row, read the Open questions table. A question this mode raised is answered in
one of two forms: `Keep the cases` or `Take the source`.

- `Take the source` is applied by this run: the row is rewritten from the source, its execution
  cells are cleared, and the question is closed.
- `Keep the cases` settles that difference for good. The same difference on a later run is not a
  change and is not asked again; a different difference on the same row is a new question.
- A row whose question is still open is left exactly as it is, whichever branch below applies. It is
  waiting on a person, and nothing a later read finds may decide for them.

## 3. What the run may do

### Whose row it is

A row is a person's when it differs from what the last run wrote for it. What the last run wrote is
the cases file as the commit that introduced its current Sources table left it. Walk the commits that
changed the cases file, `git log --format=%H --follow -- <cases-path>`, from the newest, and stop at
the first whose Sources table differs from the current one: the commit just after it is the one, and
the file at that commit is what the last run wrote. Compare the whole table, not one value in it,
because a source that did not change keeps its `Read as` across many runs. A row changed since then, in a later commit or in the working tree, is a person's; so
is a row added by hand, and a row nobody can place either way, since an overwritten edit is lost and
an extra question only costs a question.

Where the current Sources table exists only in the working tree, the last run's output was never
committed, and nothing can tell its rows from edits made on top of them. Ask before changing any row
whether the differences since the last commit are the run's or a person's, rather than guessing.

### Every ID ever used

The next number in a section is one past the highest ID that appears anywhere in the file's history,
`git log -p --follow -- <cases-path>`, not only in its current rows. A row that is in that history and
missing from the file was deleted by hand: put it back struck through, with
`Removed by hand on YYYY-MM-DD.` at the start of its `Expected result`, and open a question asking
whether the removal stands, so its ID stays taken and no later run adds the same case again.

### Approved or not

What the run may do next depends on whether the cases file has ever been `APPROVED`. Its git history answers it:
`git log --follow -S'status: APPROVED' -- <cases-path>`, spelled the way the project's front matter
spells that state; a file at `APPROVED` now has been. A shallow clone holds too little history to
answer this or the two questions above, and is deepened, or the question asked, before any row
changes.

### Never approved: the changes are merged

Nobody has accepted the cases yet, so the run applies the changes, except to a person's row: that row
is kept, and an open question carries both versions.

1. `NEW`: write the cases steps 2 and 3 of `SKILL.md` would write for it, the dimensions, the
   techniques, and the checklist viewpoints included, each with the next number as above. A
   validation rule that is new gets one accepted case and one rejected or boundary case, per
   `references/case-dimensions.md`.
2. `MODIFIED`: rewrite `Steps`, `Test data`, and `Expected result` of each case that asserts or
   depends on the changed value, and clear its execution cells, since the case has not been run in its
   new form. A changed validation rule keeps, or gains, both its accepted and its rejected or
   boundary case. A change that adds a rule, rather than altering one, adds cases as `NEW` does. A
   change the row already reflects is no change.
3. `DELETED`: strike the row through with `Removed YYYY-MM-DD: <what the source dropped>` at the
   start of its `Expected result`, per `references/test-case-template.md`. Its ID stays taken. A
   deletion that only changes what the single layout case of a screen asserts rewrites that case
   instead of striking it.
4. A row no change touches is not rewritten, whatever this run would write for it today. An update
   that rewrites unchanged rows is a diff nobody can review.

### Approved: the changes become questions

The approver accepted this set of cases. The run adds, and asks about everything else:

- `NEW` cases are added as above. Adding a case removes nothing anybody accepted.
- A `MODIFIED` or `DELETED` change to an existing row leaves the row as it is and opens a question
  with both versions: what the row says, and what the source now says. `Take the source` applies it
  on the next run, per section 2.

Either branch sets `status` back to `IN REVIEW` when any row changed or any question was opened, and
the approver is who moves it on. The run never sets `APPROVED`.

## 4. The rest of the file

- The Sources table is rewritten with what each source is now, so the next run starts from this read.
  A source a still-open question rests on keeps its old `Read as`, so the change behind that question
  is found again until the question is answered rather than lost after one run.
- The Summary and Coverage tables are recounted from the rows, struck-through rows excluded.
- A criterion the requirement dropped keeps its row in Coverage, struck through, so a reader can see
  which cases went with it.
- The regression matrix is updated in the same run when a change touches a module, a table, or an
  endpoint another feature shares, per step 4 of `SKILL.md`: a feature that now shares it gains a
  row, and one whose reason changed has it rewritten.
- An existing CSV is regenerated in the same run, per the export rules in
  `references/test-case-template.md`.

## 5. The run summary

In the session, and nowhere in the file: each source read, what its `Read as` was and is, and what
changed in it; the rows added, rewritten, struck through, restored, and left for a question, each by
ID; and any source that could not be read. A reviewer reads the diff against that list; a summary that
lists less than the diff holds means a row changed that the run did not account for.
