---
title: "Fix: atk:estimate gives no points per discipline, hides --lang, and marks an item NEEDS INTAKE without looking for its design"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-04
updated: 2026-11-04
ticket: docs/derived/feedback/estimate-261104-0725.md#1, docs/derived/feedback/estimate-261104-0725.md#2, docs/derived/feedback/estimate-261104-0725.md#3, docs/derived/feedback/estimate-261104-0725.md#5
---

# Fix: atk:estimate gives no points per discipline, hides --lang, and marks an item NEEDS INTAKE without looking for its design

The source is an `atk:tailor --feedback` record of six `atk:estimate` traces, five runs, on a
client project between 2026-10-28 and 2026-11-04. That record is derived and uncommitted; it is
cited here by its path inside this repository's working tree and its date, 2026-11-04. Its findings
4 and 6 to 10 are local to that project or already covered by the definition, and are outside this
run.

## In short

Three gaps in `atk:estimate`, each seen on a real run. The PM asked how many points each team
carried, because the discipline table gave hours only (F1): it now has an SP column, giving a
task's whole points to the discipline of its `Dev` line and naming, unsplit, a task that spans two.
A person had to ask whether the skill takes `--lang`, because its Invocation never listed the flag
that rule 6 gives every run (F3): it is listed now. A run marked an epic `NEEDS INTAKE` and
estimated it on assumptions while its full design sat in an open pull request, and the re-estimate
moved it by about half (F5): step 1 now looks at what the ticket links, then searches pull
requests naming the items, before marking one. A fourth finding, that the version did not move when
the steps changed (F2), is the recorded release flow working as written, and the maintainer chose no
change. Two review rounds left no `BLOCKING` finding; the new rules are checked by reading only,
and a trial run is left for later. Lam Ngoc Khuong approves.

## After the last round

The second round, `docs/derived/reviews/estimate-feedback-fix-261104-0940.md`, fixed nothing: it
closed S1 and raised nothing new, so there was no fix after it for a closing read to cover.

## F1. The discipline table carries no points

### 1. Symptom as captured

Feedback finding 1: in 1 of 5 runs (261104 #1) the sheet gave hours by team only. The person
running it asked, in the session: "File report không có tổng point của từng team à?" ("Doesn't the
report have a point total per team?"). Cost: one more question and a hand edit of the sheet.

### 2. Root cause

The template's discipline table has no SP column, and nothing says how a task's points, which size
the task as a whole, reach a discipline when its lines span several. Location:
`plugins/atk/skills/estimate/references/estimate-template.md:74-75` as of `600ed31`; the rule it
has to respect is `:213`, and the line split is `plugins/atk/skills/estimate/SKILL.md:126`.

### 3. Evidence

`estimate-template.md:74-75` at `600ed31`:

```
| Discipline | Hours | Left | With buffer | Man-days |
|------------|-------|------|-------------|----------|
```

`:213`: "Points size the task as a whole". `SKILL.md:126`: "Each line belongs to one discipline: a
line spanning two is split". The check: a run that follows these lines has no column to put points
in by discipline and no rule to fill one, which is the sheet the trace's run produced.

### 4. Why it surfaced now

Broken since written, `cb16052` (#158), which added the discipline table with hours only; this was
the first run whose reader planned the sprint by team in points.

### 4b. Recorded intent

`estimate-template.md:213`, "Points size the task as a whole", is touched by the request: splitting
points by discipline would contradict it. Presented to the maintainer with four options (points to
the `Dev` line's discipline; points only when no task is mixed; no points, with the reason; points
split by the share of hours). The maintainer chose the first on 2026-11-04, which keeps `:213`.

## F2. The version did not move when the steps changed

### 1. Symptom as captured

Feedback finding 2: traces written before and after `cb16052` and `55481d2` both carry
`kit: 0.1.18`, so `atk:tailor --feedback` had to tell the old step names from the new by reading
them.

### 2. Root cause

None in the code. The version in `plugin.json` moves when release-please's release pull request
merges; `atk-v0.1.18` is the last `atk` tag, and #159, "release atk 0.1.19", open since 2026-10-29,
carries both commits. Location: `CLAUDE.md:662-666`.

### 3. Evidence

`git tag --sort=-creatordate` prints `atk-v0.1.18` as the newest `atk` tag;
`.release-please-manifest.json` holds `"plugins/atk": "0.1.18"`; `gh pr list --state open` lists
#159 `chore(main): release atk 0.1.19`.

### 4. Why it surfaced now

The first feedback read whose traces span an unreleased change of steps.

### 4b. Recorded intent

`CLAUDE.md:662-666`, "Versions are bumped automatically by release-please". The request contradicts
it. Options put to the maintainer: keep the release flow and teach `atk:tailor` to tell traces of one
version apart by step name, or change nothing. The maintainer chose no change on 2026-11-04; when
#159 merges is the maintainer's call, outside this fix. No file changed for F2.

## F3. `--lang` is not in the Invocation

### 1. Symptom as captured

Feedback finding 3: asked whether to write a language override, the person replied "atk:estimate
đã có flag lang chưa?" ("Does atk:estimate have a lang flag yet?"). 2 of 5 runs had used
`--lang vi`, and it worked.

### 2. Root cause

`--lang` reaches every run through rule 6, but `estimate`'s `argument-hint` and Invocation never
list it. Location: `plugins/atk/skills/estimate/SKILL.md:10`, `:38-44` as of `600ed31`; README
invocation block `README.md:103`.

### 3. Evidence

`grep -- --lang plugins/atk/skills/estimate/SKILL.md` printed nothing at `600ed31`.
`plugins/atk/shared/team-roles.md:74-78` makes `--lang` win over the profile for any run, and
`docs/records/design/261016-0755-catchup-document-mode.md:81` records "Every skill that writes a
document takes `--lang <code>`". Thirteen `SKILL.md` list it; twelve do not.

### 4. Why it surfaced now

Broken since the skill was written; nobody had looked for the flag in its Invocation before.

### 4b. Recorded intent

Nothing records `estimate` as a skill without `--lang`; the design record above says the opposite.
Searched: `docs/records/`, `docs/adr/`, `git log -S--lang` on the skill.

## F5. `NEEDS INTAKE` without looking for the design

### 1. Symptom as captured

Feedback finding 5: in 1 of 5 runs (261104 #1) the run read the epic, its comments and `main`,
marked it `NEEDS INTAKE`, and estimated on 8 assumptions; the full API, database and business design
sat in an open pull request. The next run, from that design, moved the estimate from 31 SP / 71.5 h
to 47 SP / 104 h. The person asked: "Epic đã có api design, database design chưa?" ("Does the epic
have an API design and a database design yet?").

### 2. Root cause

Step 1 says when to mark `NEEDS INTAKE` and nothing about where to look first. Location:
`plugins/atk/skills/estimate/SKILL.md:72-73` as of `600ed31`.

### 3. Evidence

`SKILL.md:72-73`: "An item with no acceptance criteria, or with an open question that changes its
size, is marked `NEEDS INTAKE` and excluded rather than guessed." No other line of the skill or its
references names a linked design, a reference document or a pull request as a source of criteria
(checked by `grep -n -i "pull request\|design" plugins/atk/skills/estimate/`: the hits are about
comparables and the approver).

### 4. Why it surfaced now

Broken since written; this project keeps its design in a pull request before the code, and was the
first to estimate an epic in that state.

### 4b. Recorded intent

None found. `estimate` is in the `Not needed` group of `shared/project-profile.md`
(`shared/run-trace.md:153-154`), so the new rule reads no profile field, `Contract` included. The
record calls this change optional, since the project already carries an override for it; the
maintainer chose to add it on 2026-11-04.

## 5. The change

F1: the discipline table in section 1 of `plugins/atk/skills/estimate/references/estimate-template.md`
gains an SP column with its rule, a task's points whole to the discipline of its `Dev` line, or for
a task with none to the one discipline all its lines belong to, a task left with two named under the
table and counted only in the total row; the reconciliation paragraph checks that the two tables end
on the same SP total. F3: `--lang <code>` in `argument-hint` and one Invocation line of
`plugins/atk/skills/estimate/SKILL.md`, and in the README invocation block. F5: one paragraph in
step 1 of the same `SKILL.md`, looking at the ticket's linked designs, reference documents and pull
requests, then one code-host search for pull requests, open or merged, naming the items' keys,
before an item is marked `NEEDS INTAKE`. Both `skills-overview.md` and both `codebase-summary.md`
follow. Each is the narrowest form: a column and its rule in the table it belongs to, a listed flag,
and a paragraph beside the rule it refines. No wider change was needed.

Tidy: `/simplify` with four cleanup agents. Reuse and altitude found nothing; the step 1 paragraph
was bounded to the ticket's links first and one search for all keys, and the SP rule and the
reconciliation clause were reworded with the same meaning. One efficiency finding was skipped: step 2
searches past comparables, not the item's own design, so it does not read the same pull requests.

Reference documents: no public contract changed; the kit's own documents moved with the skill in
this change.

Review fix S1, `SKILL.md:78`, `:80`: a narrowed clause in the existing sentence, "open or merged",
and one sentence, "A pull request closed without merging settles nothing."

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command: every line `OK`, after the fix, after the tidy
  step, and after S1. It proves the mirrors, names, citations, counts and parse checks hold; it does
  not read what a rule tells a run to do.
- The CLAUDE.md checks for `ak:`, `atkx`, symlinks: nothing printed. The em-dash check prints one
  line outside this change, listed in section 9.
- The captured reproduction re-run: `estimate-template.md:74-75` now carries SP;
  `grep -- --lang plugins/atk/skills/estimate/SKILL.md` prints lines 10 and 43; step 1 now says where
  to look before `NEEDS INTAKE`.
- Gate: no CI job judges content in this repository; `.github/workflows/` carries release-please and
  the labeler.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/estimate-feedback-fix-261104-0925.md`: 0 `BLOCKING`, 2
  `SHOULD FIX`, 3 `NIT`, all nine rounds, sweep ran. S1 (`SKILL.md:76-79`, a pull request closed
  without merging could size an item): fixed. S2 (the new rules checked by reading only): carried
  forward, section 7 and 9. N1 to N3: left as `NIT`, section 9.
- Round 2, `docs/derived/reviews/estimate-feedback-fix-261104-0940.md`: S1 closed, nothing new; S2
  and N1 to N3 unchanged.
- Closing read: nothing to read, since round 2 fixed nothing.
- `atk:verify`: not offered, since the profile's Verify section says nothing in this repository
  runs; S2's trial run is the runtime check, and it needs a project with a tracker.

## 7. Not verified

- S2: no `atk:estimate` run has followed the new rules. A sheet whose SP by discipline fails to add
  up, or a run that still misses a design pull request, would pass every check here.
- The code-host search of step 1 on trackers other than GitHub was not tried.

## 8. Blast radius

- `estimate-template.md` Appendix D, a discipline's buffer share: unchanged, it reads hours, not SP.
- `estimate-template.md` Before the status moves to `IN REVIEW`: updated with the SP check.
- `plugins/atk/shared/state-signals.md:67`: reads only that an estimate covers a ticket; unaffected.
- `docs/flow/skill-chain.md:92` and its mirror: the `estimate` consumes cell, not updated, N2.
- No other skill reads the sheet's columns or step 1.

## 9. Left for later

- F3: eleven more `SKILL.md` do not list `--lang` in `argument-hint` or Invocation, though rule 6
  applies to them: `breakdown`, `fix`, `implement`, `incident`, `orchestrate`, `plan`, `release`,
  `review`, `run-cases`, `tailor`, `verify`. The maintainer chose `estimate` alone for this fix.
- F2: whether `atk:tailor --feedback` should tell apart traces of one version by step name; the
  maintainer chose no change now.
- The em-dash check prints one line outside this change,
  `docs/records/fixes/261016-0613-review-author-replies.md:38`, which quotes a run's output and is a
  record left alone once written.
- S2: one `/atk:estimate` trial run on an epic with a task whose `Dev` lines are in two disciplines
  and a design in an open pull request, recorded against this report.
- N1: `estimate-template.md:230` opens with "every total equals the sum of the rows above it", which
  the discipline table's SP total no longer is on its own.
- N2: `docs/flow/skill-chain.md:92` and `docs/vi/flow/skill-chain.md:90` do not name the linked
  designs and pull requests `estimate` now reads.
- N3: the Definition of done of `estimate/SKILL.md` has no item for the design search or for SP by
  discipline.
