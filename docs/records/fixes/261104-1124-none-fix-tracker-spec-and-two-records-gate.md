---
title: "Fix: atk:fix never reads the spec a bug was logged against, and its conflict gate has no case for two records that disagree"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-04
updated: 2026-11-04
ticket: docs/derived/feedback/vi/fix-261104.md#1, docs/derived/feedback/vi/fix-261104.md#2, docs/derived/feedback/vi/fix-261104.md#Q2
---

# Fix: atk:fix never reads the spec a bug was logged against, and its conflict gate has no case for two records that disagree

The source is an `atk:tailor --feedback --runs` record of eleven `atk:fix` traces, 2026-10-23 to
2026-11-04, on a client project. That record is derived and uncommitted; it is cited here by its path
inside this repository's working tree and its date, 2026-11-04. Its finding 3, an override of the
client project that is still `IN REVIEW`, belongs to that project, and its finding 4, three traces
off the shape `shared/run-trace.md` already states, is runs not following the definition; neither is
changed here. Its open question 2 was answered by the maintainer in this run and is carried as F3.

## In short

Twice, an `atk:fix --investigate-only` run on a client project explained a bug, checked intent
against the documents and code in the repository, and wrote its report without ever opening the
issue holding the screen spec QA had tested against; the person had to ask for it both times (F1).
In the second run that spec said nothing of a constraint another spec imposed, so the case was two
specs disagreeing, owned by two people, yet the run handed the decision to the Tech Lead alone (F2).
The investigation now has a Step 1b that finds and quotes that spec, from the ticket, its parent and
the profile's `Spec lives in`, or asks where it is; the intent check reads it as a fifth source and
names one of four cases; and the conflict gate has a second form for two records that disagree,
naming both owners. Records silent on a choice stop the work until the requirement's owner answers;
a crash, an error, lost data, or a review finding under `--findings` needs no spec and asks nothing.
On the maintainer's answer, a trace's `gate` row now says a question left on the tracker and
unanswered at the close is `unanswered` (F3). Two review rounds and a closing read left no
`BLOCKING` finding; one `SHOULD FIX`, S5, is carried forward: `SKILL.md` step 2 still stops a
`--findings` fix on a silent record, which the reference now exempts. The rules are checked by
reading only. Lam Ngoc Khuong approves.

## After the last round

One fix after the second call: S4, `plugins/atk/skills/fix/references/investigate.md:143-144`, the
narrowest form, a clause added to an existing rule. It opens one state: a `--findings` fix on a
choice no record decides goes on without asking. The closing read,
`docs/derived/reviews/working-tree-fix-tracker-spec-and-two-records-gate-261104-1146.md`, 0
`BLOCKING`, 1 `SHOULD FIX`, 1 `NIT`, found S4 closed in the reference and raised S5 (the same
exemption missing from `SKILL.md:128-129`) and N9 (whose answer counts, the author's or someone's
for them). Neither was fixed, per The closing read in `shared/review-fix-loop.md`.

## F1. The investigation never reads the spec on the tracker

### 1. Symptom as captured

Feedback finding 1: runs `261102 #2` and `261104 #1` found the mechanism, checked intent in the
repository's documents and code, and wrote the report; neither read the issue holding the screen spec
QA tested against until the person asked. `corrected by hand` lines, as the record quotes them:
`261102 #2`: "user asked to check all <issue> comments; 4b context added". `261104 #1`: "the run did
not check the spec the bug was logged against (<issue>) until told to; the person says atk:fix
investigate should do it or prompt for it". Same correction in 2 of 11 runs.

### 2. Root cause

No step of the investigation names the tracker spec as a source. Step 1 takes the expected output
from the report's own words, and the intent check lists four in-repository sources only:
`plugins/atk/skills/fix/references/investigate.md:24-29` and `:109-118`, and the same four in
`plugins/atk/skills/fix/SKILL.md:120-124` (all as of `e334fc7`). The profile field that says where
the spec lives is read by other skills and not by this one:
`plugins/atk/shared/project-profile.md:189`.

### 3. Evidence

Quoted lines with the check, at `e334fc7`:

```
investigate.md:111  Before the behaviour is called wrong, look for the record that says it is right:
investigate.md:113  - a design document or an ADR under the docs root named in `.atk/profile.md`;
investigate.md:114  - an assertion in a test, especially one whose name states the rule;
investigate.md:115  - a commit message that explains the choice;
investigate.md:116  - a comment naming the constraint that forced it.
project-profile.md:189  | Tracker | ... where the incoming specification lives | intake, catchup, review, release; ...
```

`grep -rn "Spec lives in" plugins/` printed one line, the template in
`skills/init/references/profile-template.md:118`; nothing under `skills/fix/` or `shared/`.

### 4. Why it surfaced now

Broken since it was written: the intent check was always about records in the repository. It
surfaced on a project whose requirements live in tracker issues and their comments.

### 4b. Recorded intent

Spec: the feedback record itself, `docs/derived/feedback/vi/fix-261104.md`, Proposals 1, 2, 4, 5 and
6, and the maintainer's answers in this run: a separate Step 1b, and for proposal 6 `atk:fix` only.
Nothing in `docs/adr/` or `docs/records/design/` keeps the tracker spec out of the intent check;
searched with `grep -rn -i "intent check"` in both. Case: the code contradicts the spec; a defect.

## F2. The conflict gate knows one shape only

### 1. Symptom as captured

Feedback finding 2, run `261104 #1`: the run classed a contradiction between two specs as "bug report
against a recorded decision", listed technical options, and handed it to the Tech Lead alone; the
owner of the screen spec, a BrSE, was asked only after the person intervened. One run.

### 2. Root cause

`investigate.md:122` at `e334fc7` opens the gate on one condition, "the expected behaviour in the bug
report contradicts a decision found in step 6", and `:132-133` names one owner. `SKILL.md:44-45`
says the Tech Lead "is the one who answers when the intent check stops the work".

### 3. Evidence

```
investigate.md:122  When the expected behaviour in the bug report contradicts a decision found in step 6, stop.
SKILL.md:44  Dev investigates and fixes. Tech Lead reviews, and is the one who answers when the intent check
SKILL.md:45  stops the work and when the review loop hits its ceiling.
```

No line of either file mentions two records contradicting each other.

### 4. Why it surfaced now

Broken since it was written; F1 made it likelier, since a run that reads one spec is the run that
finds the second.

### 4b. Recorded intent

Spec: feedback Proposal 3. Nothing recorded against it. Case: the code contradicts the spec.

## F3. A gate left on the tracker has no stated outcome

### 1. Symptom as captured

Feedback finding 4 and open question 2: run `261104 #1` wrote a gate as `waiting`, a question posted
as an issue comment and unanswered at the close. The record found the shape already allowed
`unanswered` and asked whether `shared/run-trace.md` should say so.

### 2. Root cause

Not a defect: `shared/run-trace.md`, the `gate` row, allows `unanswered` but names no case of a
question put outside the session. The maintainer answered yes, add the clause.

### 3. Evidence

The `gate` row at `e334fc7`: "who was asked, how long it waited, and `answered`, `unanswered`, or
`refused`", with no mention of an answer that arrives after the close.

### 4. Why it surfaced now

The first run that asked its question on the tracker instead of in the session.

### 4b. Recorded intent

The maintainer's answer to open question 2 in this run. Nothing recorded against it.

## 5. The change

Shared by F1 to F3.

- `plugins/atk/skills/fix/references/investigate.md`: new Step 1b, find and quote the spec the bug
  was logged against, from the ticket, its parent and `Spec lives in`, or ask; ask only where a spec
  decides the behaviour, and write `none needed` for a crash, an error, lost data or a `--findings`
  finding. Step 6: the spec as a fifth source, and one of four cases named; silent records on a
  choice stop for the requirement's owner. The gate: a second form for two records that disagree,
  both quoted, both owners named and asked. The result block: a `Spec` line. (F1, F2)
- `plugins/atk/skills/fix/references/report-template.md`: 4b opens with the `Spec` line and the
  case, carries both decisions in the second form and the question when the work stopped on a
  silent record; section 5's skip names that stop. (F1, F2)
- `plugins/atk/skills/fix/SKILL.md`: Roles names the decision's owner, the spec's owner for a spec;
  step 1 finds and quotes the spec; step 2 reads it, opens the second form and the silent stop;
  `--investigate-only` names the spec; one DoD line. Still 299 lines, by rewrapping. (F1, F2)
- `plugins/atk/shared/project-profile.md`: the Tracker row is read by `fix` too. (F1)
- `plugins/atk/shared/run-trace.md`: the `gate` row, a question put outside the session and
  unanswered at the close is `unanswered`, its wait counted to the close. (F3)
- `docs/skills-overview.md` and `docs/vi/skills-overview.md`: the `atk:fix` entry names the spec and
  two disagreeing records. (F1, F2)

Tidy: run by hand per `shared/tidy-pass.md`, since the change is prose; it narrowed two sentences of
`investigate.md` and rewrapped two lines. Reference documents: none owed; the change is to the kit's
own definitions, and the user-facing overview moved in both languages. Form of each review fix: S1
a word corrected in an existing sentence; S2 a stop added to the three lists of stops; S3 and S4 a
clause narrowing an existing rule.

## 6. Verified

- `bash tests/verify.sh`: every line `OK`, after the fix, after the tidy, after each review round.
  It proves the mirror, the trace lines, the counts, the names and the manifests hold; it checks no
  sentence of these rules.
- `CLAUDE.md` checks: the em-dash and `ak:` greps print nothing for the changed files;
  `wc -l plugins/atk/skills/fix/SKILL.md` is 299.
- The reproduction, re-run: `grep -rn "Spec lives in" plugins/atk/skills/fix plugins/atk/shared`
  now prints `investigate.md:35`, where it printed nothing at `e334fc7`; the intent check lists the
  spec, and the gate names two forms.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/working-tree-fix-tracker-spec-and-two-records-gate-261104-1135.md`:
  0 `BLOCKING`, 3 `SHOULD FIX`, 4 `NIT`. S1, S2, S3 fixed; N1 to N4 left as `NIT`.
- Round 2, `docs/derived/reviews/working-tree-fix-tracker-spec-and-two-records-gate-261104-1142.md`:
  0 `BLOCKING`, 1 `SHOULD FIX`, 8 `NIT`. S1 to S3 closed; S4 fixed; N5 to N8 left as `NIT`.
- Closing read, `docs/derived/reviews/working-tree-fix-tracker-spec-and-two-records-gate-261104-1146.md`:
  0 `BLOCKING`, 1 `SHOULD FIX`, 1 `NIT`. S4 closed; S5 carried forward with the closing read as the
  reason; N9 recorded.
- `atk:verify` was not offered: the loop did not come out clean, S5 stands, and the profile's Verify
  section says nothing here runs.

## 7. Not verified

- No run of `atk:fix` follows these rules yet: whether a run finds the spec unprompted, names the
  right case, and asks both owners is unknown until one is traced and read with `--runs`.
- S5: `SKILL.md` step 2 and `investigate.md` Step 6 disagree on a `--findings` fix whose choice no
  record decides; which one a run follows is untested.
- The `gate` clause of F3 has no trace written under it yet.

## 8. Blast radius

- `plugins/atk/skills/fix/references/findings-mode.md:91-95`, `:121-132`: reaches Step 1b and Step 6
  for each finding; read by both review rounds and the closing read, S3, S4 and S5 came from it.
- `plugins/atk/shared/host-capabilities.md:385`: relays an intent-check gate under `atk:orchestrate`;
  read, unchanged, holds for the new stops.
- `plugins/atk/skills/init/references/role-defaults.md:20`: lists `fix` under the Tech Lead alone;
  read, not changed (N2).
- `plugins/atk/shared/ticket-adapters.md:208`: the only issue read named returns no comments; read,
  not changed (N1).
- `docs/flow/skill-chain.md:99` and its mirror: `fix` consumes "A defect report"; not changed (N4).

## 9. Left for later

- `atk:qa` reads no `Spec lives in` either, and `atk:review` is named in the Tracker row without its
  workflow saying it reads that field; feedback proposal 6 named both, the maintainer kept this fix
  to `atk:fix`.
- The rules are checked by reading only; a run of `atk:fix` on a bug whose spec lives in an issue
  would show whether Step 1b is followed unprompted.
- No reference document is owed: the change is to the kit's own skill definitions.
- S5 (`SHOULD FIX`, carried by the closing read): `plugins/atk/skills/fix/SKILL.md:128-129`, add the
  `--findings` exemption to the silent-record sentence, as `investigate.md:143-144` has it. Owner:
  Lam Ngoc Khuong.
- `NIT`s left by the loop: N1 name the issue-with-comments read in Step 1b or `ticket-adapters.md`;
  N2 the `role-defaults.md:14`, `:19-20` cells, collected from `## Roles` and now stale; N3 the
  overview wording, "and that no two recorded decisions disagree", and the Vietnamese "được log
  theo"; N4 the `fix` row of `docs/flow/skill-chain.md` and its mirror; N5 "each record's owner"
  in `SKILL.md:46`; N6 a ticket written by the requirement's owner already answers the silent case;
  N7 the DoD names the silent stop; N8 rewrap `investigate.md:44`, `report-template.md:110`, `:127`;
  N9 whose answer settles a `--findings` choice.
