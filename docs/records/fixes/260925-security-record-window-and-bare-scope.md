---
title: "Fix: atk:security leaves a record's editing window undefined and has no scope for a bare invocation"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, maintainer of skills/security)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# Fix: two gaps in the `atk:security` definition

Findings 1 and 2 of the feedback record on `/atk:security` written 2026-09-25, which sits in the
gitignored `docs/derived/feedback/security-260925.md`. Requested as "Fix 1, 2". Findings 3 and 4 of
the same record are classified there as covered by the definition, and are not changed here.

## 1. Symptom as captured

From the feedback record, verbatim:

- Finding 1: "`atk:fix` fixed all three findings in the same session. The residual risk table still
  listed them as 'ships unfixed'. The run asked the approver rather than editing, and on a yes
  rewrote the table and corrected a line citation in an uncommitted record."
- Finding 2: "found `HEAD` equal to the last tag, so the release form had an empty range, and asked
  the user to choose among whole repository, the last release, or `hooks/` only."

Expected: a stated rule for the window between writing a record and committing it, and for how a
fix made in that window shows in the record; a stated behaviour for `/atk:security` with no
argument.

## 2. Root cause

The definition is silent on both, so each run had to invent the answer.

- `skills/security/SKILL.md:144-146` (before this change): "it is not edited afterwards", with no
  point at which "afterwards" starts, while `skills/security/references/record-template.md:67-73`
  defines the residual risk table only for findings that ship unfixed.
- `skills/security/SKILL.md:53-61` (before): every invocation form carries an argument, and step 1,
  `:76`, opens with "Resolve the argument".

## 3. Evidence

The responsible lines, quoted, and the check that shows they produce the gap:

```text
skills/security/SKILL.md:144  record of what was checked on one day against one version of the code, and it is not edited
skills/security/SKILL.md:145  afterwards: a later review of the same scope writes a new one, and the earlier record takes
```

```text
$ git show HEAD:skills/security/SKILL.md | grep -n -i -E "no argument|bare|until it is committed|before it is committed"
$ echo $?
1
```

No line of the definition names a bare invocation or the window before a commit.

## 4. Why it surfaced now

Broken since it was written. No earlier run fixed a finding before its record was committed, and no
earlier run was invoked with no argument on a `HEAD` equal to the last tag.

## 4b. Recorded intent

`shared/artifact-paths.md:328-329` already lets a skill update an existing artifact in place and
forbids only overwriting an `APPROVED` one, so allowing corrections before the commit narrows the
security skill's stricter wording back toward the shared rule rather than against it. The window
ends at the commit, as the feedback record's proposal asks, and the proposal comes from the
definition's maintainer, who is also the requester. No test, ADR, or commit message records the
opposite.

## 5. The change

- `skills/security/SKILL.md`, Output: the record may be corrected until it is committed, each
  correction named in the session, and is not edited from the commit on.
- `skills/security/references/record-template.md`, Residual risk: a finding fixed before the record
  is committed takes a line under the table naming the finding ID and the fix, not a row, and its
  Findings block stays as written. This answers the feedback's open question by putting the rule
  beside the table it governs, with `SKILL.md` pointing at it.
- `skills/security/SKILL.md`, Invocation and step 1: a bare invocation proposes the unreleased
  range, or the whole repository when that range is empty or there is no tag, asks in one question,
  and records the choice in the Scope section. It proposes rather than chooses, because what a
  review covers is the approver's call.
- `README.md:107`: the argument shown as optional, `[branch|range|paths]`, like `atk:spec`.
  `argument-hint` already had it in brackets.

Tidy: `/simplify`, run over this diff together with the `atk:fix` changes of
`260925-fix-several-defects-and-security-ticket.md`. It tightened the Output sentence in
`skills/security/SKILL.md` into one clause with a parenthetical pointer to the template, meaning
unchanged. An earlier draft of this line said the pass was done by hand because the change is prose,
which is the reasoning `shared/host-capabilities.md:80-83` rules out; corrected before commit.

## 6. Verified

The repository's checks from `CLAUDE.md`, section "Common verification commands", for the content
layer:

- Em-dash check: prints nothing (exit 1).
- Another kit's command check: prints nothing (exit 1).
- `name:` matches folder: no mismatch.
- `wc -l skills/security/SKILL.md`: 191, under 300; section order unchanged.

Reproduction re-run against the working tree: the grep of section 3 now matches the new lines in
`SKILL.md` and `record-template.md`.

## 7. Not verified

Whether a real `/atk:security` run follows the new wording: no run was made after the change.
`skills/security/evals/trigger_evals.json` is unaffected, since `description:` did not change.

## 8. Blast radius

- `docs/skills-overview.md:495` and `docs/vi/skills-overview.md:498`: describe what the record holds,
  not when it is fixed or the invocation forms; read, no change owed.
- `skills/release/SKILL.md`: reads the security record's open Critical and High findings; a fixed
  finding leaving the table does not change what it reads. Read, not exercised.
- `skills/help/references/state-signals.md`: not touched by either rule.

## 9. Left for later

- Finding 4 of the feedback record: the "refute on evidence only" examples in
  `record-template.md:14-15` are all about the repository's own code, and say nothing about a
  refutation that rests on how a third-party action or library behaves. Pending the maintainer's
  decision.
