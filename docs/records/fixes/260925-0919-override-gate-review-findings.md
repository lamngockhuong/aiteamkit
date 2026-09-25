---
title: "Fix: the kit still restated a draft override as applied after the approval gate landed"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong)
created: 2026-09-25
updated: 2026-09-25
ticket: docs/derived/reviews/74-260925-0904.md#B1, #S1, #S2, #S3, #S4, #S7, #S8, #N1, #N2
---

# Fix: the review findings on PR #74 that restate the override rule

The findings are those of the `atk:review` report on PR #74 at head `e20751f`, kept at
`docs/derived/reviews/74-260925-0904.md`, which is gitignored skill output. Requested as: fix `B1`,
`S1` to `S3`, `S7`, `S8`, `N1`, `N2`, and `S4` with the key the author chose. The commit stays
`fix:` with no breaking-change marker, by the author's decision.

Every finding but `S4` has one cause, so they share the blocks below. PR #74 moved the rule "only an
approved override applies" into `shared/project-overrides.md` and rule 7 of `shared/team-roles.md`,
and the other files that restate how an override behaves were not searched for the old rule.

## 1. Symptom as captured

Quoted from the head commit, before any file changed:

```text
skills/tailor/references/audit.md:63  - `status: DRAFT` on a file that has been in the repository for a while. A draft override still
skills/tailor/references/audit.md:64    applies at run time, which surprises people; the audit is where they find out.
skills/help/SKILL.md:158              Override: <.atk/overrides/<skill>.md exists and changes <what>, or omitted>
skills/help/references/state-signals.md:60  | 19 | An override file is `DRAFT`, or its approver is a bare `TBD` | `atk:tailor --audit` | Running the skill with an override nobody has accepted |
shared/team-roles.md:70               only once its `status` is `APPROVED`; one still `DRAFT` or `IN REVIEW` is not applied, and the
skills/tailor/SKILL.md:156            `shared/project-overrides.md`, and for an update, that the earlier approved version stops applying
shared/artifact-paths.md:133          | `estimate` | `docs/records/planning/estimate-<sprint-or-date>-<ticket>.md`, with `-<ticket>` left out where the backlog has no ticket, ...
```

- Expected: every file that describes an override's effect agrees with `shared/project-overrides.md`,
  Only an approved override applies.
- Observed: `atk:tailor --audit` reports a draft as applied (`B1`), `atk:help` reports any existing
  override as in effect (`S3`), the three examples carry no front matter and so would not apply
  (`S1`), the notice has no wording for `SUPERSEDED`, no front matter or a `TBD` approver (`S2`),
  tailor step 5 contradicts step 4 (`S8`), the setup flow has no approval step for an override
  (`S7`), and three ownership rows omit the gate (`N1`, `N2`). `S4`: the estimate name had no rule
  for a run over several tickets.

## 2. Root cause

Restatements of a rule changed in `shared/` were left unchanged: `skills/tailor/references/audit.md:63`,
`skills/help/SKILL.md:158`, `skills/help/references/state-signals.md:60`, `skills/tailor/SKILL.md:156`,
`docs/flow/project-flow.md:42` and its mirror, plus the owning file's own examples and notice,
`shared/project-overrides.md:119-125` and `:196-227`. `S4` is a gap rather than a restatement:
`shared/artifact-paths.md:133` defined one ticket where the skill accepts several.

## 3. Evidence

The quoted lines in section 1, checked against the rule they contradict,
`shared/project-overrides.md` at `e20751f`: "A file that is `DRAFT`, `IN REVIEW`, or `SUPERSEDED`, or
that carries no front matter at all, is read and not applied." `S4` against
`skills/estimate/SKILL.md:39-40`, which accepts `<epic-or-ticket-ids>` and `<backlog-path>`.

## 4. Why it surfaced now

`e20751f` "fix: apply an override only once approved, and prove tracker access per project"
reversed the rule these lines restate; before it they were true.

## 4b. Recorded intent

The intent is the gate itself, recorded in
`docs/records/fixes/260925-0857-override-approval-and-estimate-naming.md` and in the two `shared/`
files. Nothing records the opposite. For `S4` nothing recorded which key applies; the author chose
it in this session.

## 5. The change

- `B1`: check 3 of the audit flags any status other than `APPROVED`, or no front matter, as not
  applied, and reports the file, its status and its approver.
- `S2`: the notice in `shared/project-overrides.md` became a table with one line per case, named
  approver, `TBD` approver, `SUPERSEDED`, no front matter. Rule 7 says "any other status, or no front
  matter" and points at that table.
- `S1`: one sentence above the examples says they show the body only and need an `APPROVED` front
  matter. `N2`: "picks it up once it is approved".
- `S3`: help's `Override:` line tells an applied override from one at another status, and says the
  notice goes in that line because help writes no file. Row 19 fires on any override that is not
  `APPROVED`, with the real consequence as its reason.
- `S8`: step 5 of `atk:tailor` scopes the suspension to an update that moved `status` back in step 4.
- `S7`: an approval node after `I3` in `docs/flow/project-flow.md` and `docs/vi/flow/project-flow.md`.
- `N1`: the ownership rows in `CLAUDE.md` and both `codebase-summary.md` name the gate.
- `S4`: the `artifact-paths.md` row names the key: the epic when given, the ticket when exactly one,
  none otherwise, with the suffix rule for a collision. The skill and template cite the row, so
  neither changed.

Tidy step: the change is prose and Mermaid, which the host's code clean-up capability does not
address; the pass was run by hand per `shared/tidy-pass.md` over the changed lines and changed
nothing.

## 6. Verified

- The approval gate at run time, which `S5` of the review asked for: `atk:intake` run by an agent
  against a scratch project whose `.atk/overrides/intake.md` is `IN REVIEW` with a `## After`
  adding a `## OVERRIDE-MARKER` section. The artifact has no such section (`grep -c` printed `0`)
  and carries, in the working language:

  ```text
  Không áp dụng `.atk/overrides/intake.md`: trạng thái của nó là `IN REVIEW`. Nó có hiệu lực khi Nguyen Thi A phê duyệt.
  ```

- The checks in "Common verification commands" of `CLAUDE.md`: the five manifests parse, every
  `name:` matches its folder, the `docs/` and `docs/vi/` listing `diff` prints nothing, and the
  em-dash, other-kit, Mermaid fill and dated-name `grep`s all exit 1. `skills/help/SKILL.md` is 196
  lines and `skills/tailor/SKILL.md` 284, both under 300.

## 7. Not verified

- The run was of the rule as it stood after `e20751f`, which this change does not alter; it did not
  exercise the three new notice cases (`TBD`, `SUPERSEDED`, no front matter), nor `atk:help` or
  `atk:tailor --audit` reading the edited lines.
- No CI job gates this repository's content, so no gate stands above the local checks.
- `S4` naming was not exercised by an `atk:estimate` run.

## 8. Blast radius

- `shared/project-overrides.md` and rule 7 are read by every skill: exercised by the `atk:intake` run
  for the named-approver case only.
- `skills/tailor/references/audit.md`, `skills/help/SKILL.md`, `skills/help/references/state-signals.md`,
  `skills/tailor/SKILL.md`: read, not run.
- `shared/artifact-paths.md:133`: cited by `skills/estimate/SKILL.md:141` and
  `skills/estimate/references/estimate-template.md:10`; read, not run.
- No public contract of a reference document changed; `docs/` edits carry their `docs/vi/` mirror.

## 9. Left for later

- `S5`, second half: a `CONV-NNN` row whose check fails when a kit `.atk/overrides/*.md` is not
  `APPROVED`. For `atk:convention`, with the two convention gaps the review names.
- `S6`: the fix record `260925-0857` cites three pre-change lines at the wrong numbers (43, 93, 162
  at `bd61f5f`, not 44, 88, 165). The record is committed, so per `shared/artifact-paths.md` it is
  not corrected in place; a note beside it is the author's call.
