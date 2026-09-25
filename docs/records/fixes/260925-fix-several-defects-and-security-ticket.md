---
title: "Fix: atk:fix has no layout for several defects in one run and no ticket form for a security finding"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, maintainer of skills/fix)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# Fix: two gaps in the `atk:fix` definition

These are findings 1 and 2 of the feedback record on `/atk:fix` written 2026-09-25. That record sits in
the gitignored `docs/derived/feedback/fix-260925.md`. The maintainer asked for the recommended options,
which were option A for finding 1 and the named form for finding 2. The same recommendation applied
to finding 3 left the definition unchanged, as section 9 records. The IDs used below are F1 and F2.

## F1: several defects in one run

### 1. Symptom as captured

From the feedback record, verbatim: "one report, with SF1 carrying the investigation and SF2 and SF3
described inside the same sections, and one hypothesis count for the three."

### 2. Root cause

`skills/fix/references/report-template.md:29-44` (before this change) has one symptom and one root
cause, and `skills/fix/references/investigate.md:73` counts the ceiling "across the whole run". With
several defects, the run had no layout to follow, and three causes had to share three hypotheses.

### 3. Evidence

```text
$ git show HEAD:skills/fix/references/report-template.md | grep -n -i -E "several|more than one|each defect"
$ echo $?
1
```

### 4. Why it surfaced now

It has been broken since it was written. The run of 2026-09-25 was the first to take three defects
from one argument.

### 4b. Recorded intent

`investigate.md:73` says "counted across the whole run", which stops a run from resetting the count
by restating a failure. The change keeps that purpose: the count stays across the whole run, is
now kept per defect, and restating or splitting a failure continues its count. The maintainer of the
definition asked for this option.

### 8. Blast radius

- `skills/fix/SKILL.md:87` restates the ceiling. It was updated with the rule.
- `skills/fix/references/report-template.md:43-56` holds the ceiling-stop wording for sections 2 and 3.
  It is read per defect block and was not changed.
- `docs/skills-overview.md` and `docs/vi/skills-overview.md` do not state the count. They were read,
  and no change is owed.

## F2: no ticket form for a security finding

### 1. Symptom as captured

From the feedback record, verbatim: "wrote `docs/records/security/260925-whole-repository.md#SF1,
#SF2, #SF3` by analogy with the QA form, then changed it to `none` when the approver kept the
security record uncommitted, which left a dangling link."

### 2. Root cause

`skills/fix/references/report-template.md:19` (before this change) names forms for a tracker issue
and for an `atk:qa` run record, and has none for an `atk:security` finding.

### 3. Evidence

```text
$ git show HEAD:skills/fix/references/report-template.md | grep -n "SF<n>"
$ echo $?
1
```

### 4. Why it surfaced now

It has been broken since it was written. The session of 2026-09-25 was the first to fix findings
from a security record.

### 4b. Recorded intent

Nothing contradicts the change. `skills/security/SKILL.md:167-170` keeps findings off a public
tracker, which is why the record path, not an issue, is the reference.

### 8. Blast radius

`shared/artifact-paths.md:317` defines `ticket` as `<id or URL, or none>`. The new form fits inside
that definition, and the file was not changed.

## 5. The change

- F1: `skills/fix/references/investigate.md`, the ceiling paragraph, now keeps three hypotheses per
  defect, counted across the whole run. A restated or split failure continues its count. The
  `skills/fix/SKILL.md:87` restatement matches.
- F1: `skills/fix/references/report-template.md` gains "Several defects in one run". It keeps one
  report and gives each defect an ID. Sections 1 to 4b and 8 are written once per defect. Sections 5
  to 7 and 9 are shared, with each line naming its defect, and `ticket` lists every reference,
  separated by commas. `status` is `DRAFT` only when every defect was stopped.
- F2: the `ticket` line adds `<security record path>#SF<n>`. A paragraph under it says to write
  `none` when the record is not committed and to name the finding ID and the record's date in the
  body.

The tidy step ran `/simplify` with four reviewers over this diff and the diff of
`260925-security-record-window-and-bare-scope.md`. Applied: four rewordings that shortened the new
text without changing its meaning, in `investigate.md`, in `report-template.md` twice, and in
`skills/security/SKILL.md`. Skipped: two suggestions to move rules into `shared/artifact-paths.md`.
One was the record editing window and the other was the general `ticket` reference form. Both would
change behaviour for every record-producing skill, not only the lines this fix touched, so each is
listed in section 9. The other two reviewers found nothing.

## 6. Verified

The repository's checks come from `CLAUDE.md`, section "Common verification commands", content layer:

- The em-dash check prints nothing (exit 1).
- The check for another kit's command prints nothing (exit 1).
- Every `name:` matches its folder.
- `wc -l skills/fix/SKILL.md` gives 222, under 300.

When the reproductions in both section 3 blocks are re-run against the working tree, each now
matches the new lines.

## 7. Not verified

No `/atk:fix` run was made after the change, so a real multi-defect run following the layout is not
verified. `description:` did not change, so the trigger evals are unaffected.

## 9. Left for later

- Feedback finding 3: the tidy step was out of proportion to the change. The definition was left
  as it is on purpose: `shared/host-capabilities.md:80-83` forbids replacing the host capability
  because it looks heavier than the diff. The harmful suggestion in that run was stopped by rules
  that already exist: only behaviour-preserving edits are applied, then the change is re-verified,
  and reverted if a check breaks.
- Feedback finding 4 on `atk:security`: a refutation that rests on how a third-party action or library
  behaves had no stated evidence rule. Done on the maintainer's answer, see below.

## Follow-up in the same session

On the maintainer's answer "Nên chuyển", the two rules the tidy step had flagged moved to
`shared/artifact-paths.md`:

- Front matter now holds the `<record path>#<ID>` reference for a finding or defect with no issue. It
  also covers several references and the `none` rule for an uncommitted record. The `ticket` line
  in `skills/fix/references/report-template.md` points there instead of listing each source.
- Before writing now says that a record may be corrected until it is committed, with each correction
  named in the session. A correction never rewrites what the record found, and a later run of the
  same skill over the same subject writes a new file. `skills/security/SKILL.md`, Output, points at
  it.
- This changes `atk:qa`: a run record's content is now fixed once committed rather than once written.
  That wording changed in `skills/qa/references/test-run.md:28` and `:323`, in `skills/qa/SKILL.md:168`
  and in the `qa` row of `shared/artifact-paths.md`.
- `docs/artifact-lifecycle.md:53` and its `docs/vi/` mirror now say "never edited once committed".
  The `shared/artifact-paths.md` row in `CLAUDE.md` names the two new rules.
- Checks were re-run: no em-dash, no command from another kit, the docs mirror holds, and every
  `SKILL.md` stays under 300 lines. No `/atk:qa` run was made after the change.
- `skills/security/references/record-template.md`, Verdicts: a refutation that rests on how a
  dependency, an external action, or a service behaves cites that behaviour's source with the
  version read, or the candidate is `PLAUSIBLE`, with reading that source as its settling check.
