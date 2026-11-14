---
title: "Fix: atk:security narrows a whole-repository scope on its own, carries placeholder answers by count, and traces have no place for events after the record"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-13
updated: 2026-11-14
ticket: none
---

# Fix: atk:security narrows a whole-repository scope on its own, carries placeholder answers by count, and traces have no place for events after the record

The source is a `atk:tailor --feedback --runs` record over 21 run traces of `atk:security`, kept
under `docs/derived/feedback/security-261113-1525.md` of the project it was written in, dated
2026-11-13, which git ignores. Its three findings on the definition are `D1`, `D2` and `D3` below;
its other three said the definition already covers them and need no change here.

## In short

Three gaps in what `atk:security` and the run trace tell a run, each one a silence the runs filled
on their own:

- **D1.** A person chose the whole repository as the scope, and six of six runs on version 0.1.23
  read again only what had changed since an earlier record and cited that record for the rest. A
  later full read found ten findings in code the earlier records had called clean. `SKILL.md` now
  says the whole repository means every boundary read at `HEAD` by this run, and that reading only
  what changed is a narrower scope the question may offer, taken only when the person picks it,
  and even then a boundary whose global control or shared code changed is read again.
- **D2.** An owner's word that a secret hit is a placeholder was carried to later runs because the
  counts per shape were equal. `references/threat-checklist.md` now carries it only for a hit that
  matches exactly: by path, line and shape in a file unchanged since the earlier record's commit
  for the tracked tree, and by commit, path, line and shape for the history.
- **D3.** A decision taken after the record was written, an approver filling the residual risk
  among them, had no place in the trace, so runs wrote lines after `end` or invented event kinds,
  and three finished runs read as interrupted. `shared/run-trace.md` now says a run closes when its
  `end` is written with the artifact, and an event of the same session after it goes above `end`,
  which moves below it with that event's time.

Two review rounds ran; the second came back with no `BLOCKING` or `SHOULD FIX` finding. Lam Ngoc
Khuong approves. The change is a rule agents follow, so no test proves it, and the first runs of
`atk:security` after it are the check.

## After the last round

The second round fixed nothing, so there was no closing read.

## D1. Whole-repository scope read only in part

### 1. Symptom as captured

From the feedback record, finding 1, as written there:

> Cả 6 trên 6 lần chạy 0.1.23 chọn toàn repo đều chỉ đọc lại một phần, và trích record trước cho
> phần không đổi. [...] Ở 261113 #4, phạm vi thực tế bằng dải <redacted: tag range> mà người dùng
> vừa từ chối. Scope của record vẫn ghi "toàn repo", và phần trích lại chỉ được nói trong mục Scope.
> [...] Lần đọc sâu đó tìm ra 10 finding (2 Medium, 8 Low) nằm trong code mà các record trước đã
> kết luận là sạch.

Expected: a whole-repository scope reads every boundary at `HEAD`. Actual: the run read the changed
code and carried an earlier record's conclusions for the rest, unasked.

### 2. Root cause

The scope question offers two scopes and says nothing about carrying an earlier record's
conclusions, so a run on a repository with earlier records narrowed on its own:
`plugins/atk/skills/security/SKILL.md:102-106` (the question), `:170-179` before this change (step 3,
each boundary gets a result).

### 3. Evidence

The responsible lines, `plugins/atk/skills/security/SKILL.md:102-106` at `5dae324`:

```
With no argument, propose a scope rather than choose one: the unreleased range, from the last tag to
`HEAD`, or the whole repository at `HEAD` when that range is empty or the repository has no tag. Put
the proposal and why in one question, offering the other of the two and a set of paths as the
alternatives, and continue once it is answered. The Scope section of the record says which was
chosen and by whom.
```

The check that nothing else in the skill speaks to it:

```
$ grep -rn -i "earlier record\|previous record\|record before\|last record\|newest record\|prior record\|earlier run\|unchanged" plugins/atk/skills/security/
plugins/atk/skills/security/SKILL.md:220:commit on it is not edited: a later review of the same scope writes a new one, and the earlier record
```

The one hit is about not editing a committed record, a different rule.

### 4. Why it surfaced now

Broken since the scope question was written. It surfaced once the same repository had several
records, so an earlier one was there to cite.

### 4b. Recorded intent

No spec applies beyond the skill itself. Rule 2 of `shared/team-roles.md` keeps scope with a role,
which the fix follows. No ADR, design or test records the carry as intended. No contradiction.

## D2. Placeholder answers carried by count

### 1. Symptom as captured

From the feedback record, finding 2:

> Gate xác nhận secret được hỏi trong 2 trên 9 lần chạy [...]. Bảy lần còn lại mang xác nhận cũ
> sang bằng câu "bằng record trước" kèm số đếm theo loại [...].

Expected: an earlier answer reused only for the hits it was given about. Actual: reused whenever
the counts per shape matched.

### 2. Root cause

The checklist says the owner confirms a placeholder and says nothing of a later run, so runs matched
on the cheapest key they had: `plugins/atk/skills/security/references/threat-checklist.md:104` and
`:106`.

### 3. Evidence

`threat-checklist.md:106`, the clause at `5dae324`: "the person who owns the file says whether the
value was live, and a placeholder they confirm is not a finding". The check: `grep -n -i "owner\|confirm"
plugins/atk/shared/secret-scan.md` finds no owner confirmation at all, and the security skill's grep
above finds no rule on reusing one.

### 4. Why it surfaced now

Broken since the history scan row was written (a765694); it surfaced with repeated runs on one
repository.

### 4b. Recorded intent

No record says counts may stand for identity. No contradiction. The feedback proposed changing
`shared/secret-scan.md` too; it holds no owner-confirmation text, so the rule went into the
checklist, where the confirmation is.

## D3. No place in the trace for events after the record

### 1. Symptom as captured

From the feedback record, finding 3:

> 5 trong 9 lần chạy 0.1.23 [...]: viết `end` rồi tiếp tục ghi gate [...]; tự đặt kind mới [...];
> hoặc ghi `end` cuối file nhưng với giờ sớm hơn các gate phía trên [...]. Ba lần chạy 0.1.23 bị
> đọc là interrupted dù đều có record.

### 2. Root cause

`shared/run-trace.md` writes `end` when "the run closes" and keeps it last, and admits only a
correction after it; nothing says where an event of the same session after the record goes, so runs
wrote it after `end` or under a kind of their own: `plugins/atk/shared/run-trace.md:185` (the `end` row) and `:192-196`.

### 3. Evidence

`run-trace.md:192-194` at `5dae324`:

```
`end` is always the last line, and opens with its time like every other event. A correction
reported after the run closed is written above it, with the time it was reported, even on a later
day. A trace whose last line is not an `end` line is a run that stopped without closing, [...]
```

`plugins/atk/skills/tailor/references/feedback.md:197` reads a trace whose last line is not `end` as
interrupted, which is how three finished runs were counted as interrupted.

### 4. Why it surfaced now

Broken since the `end` rule was written. `atk:security` leaves `Accepted by` for a person
(`SKILL.md:209-211`), so its decision gate routinely comes after the record.

### 4b. Recorded intent

ADR 0004 to 0006 and `atk:tailor`'s reading say nothing of when a run closes. The fix keeps the
interrupted reading unchanged. No contradiction.

## 5. The change

Each defect got one paragraph of rule at the place that owns it, in the form "add a rule, at the
step that owns it":

- D1, `plugins/atk/skills/security/SKILL.md:108-114`: the whole repository means every boundary read
  at `HEAD` by this run; reading only what changed since an earlier record is a narrower scope the
  same question may offer, naming the record, taken only when the person picks it, re-reading a
  boundary whose global control or shared code changed, and named in `In short`.
- D2, `plugins/atk/skills/security/references/threat-checklist.md:109-114`: a placeholder answer
  carries only to the exact hits it was given about, the `tree` scan's only in a file
  `git diff --quiet <commit> -- <path>` finds unchanged; any other hit is asked again, and the
  record cites where each carried answer came from.
- D3, `plugins/atk/shared/run-trace.md:194-197`: `end` is written when the workflow closes, with
  its artifact; an event of the same session after it takes its kind from the event table and goes
  above `end`, which moves below it with that event's time and the same text.

Tidy: `/simplify` with four agents reworded the three paragraphs, dropped a sentence in step 3 of the
security skill that only pointed back at step 1, and made the trace sentence take its kinds from the
event table rather than restate them. Three suggestions were not taken: writing `end` only at the
session's close (a session that ends after the record would then read as interrupted, the cost D3
removes), matching a `tree` hit without its line (the feedback asks for the line, and one extra
question costs less than a wrong record), and one general rule for every carried conclusion
(section 9).

Reference documents: no document under `docs/` describes the scope question, the placeholder answer
or the `end` rule, so none moved. The fix changes the rule files themselves, which are what
`atk:security` and every traced run read.

Review fixes, round 1: S1 (form: correct the false sentence) made `end` written with the artifact,
which the first wording left unwritten until the session ended; S2 (form: add a rule) re-reads a
boundary whose global control or shared code changed; S3 (form: correct) adds the unchanged-file
condition to a `tree` match, since a live value written on the same line matched before.

## 6. Verified

- `bash tests/verify.sh`, the profile's Test command and the gate of the required `verify` job:
  every line `OK`, before the tidy, after it, and after each review round. It holds the shape of the
  repository (manifests, names, mirrors, the em-dash and citation checks, the run-trace example), not
  what an agent does with a sentence.
- `wc -l plugins/atk/skills/security/SKILL.md`: 292, under the ceiling of 300.
- No em-dash in the three changed files.
- The captured failures are the behaviour of runs of `atk:security`; they cannot be re-run here
  without a run of that skill, so the reproduction was not re-run (section 7).

## 6b. Reviewed

- Round 1: `docs/derived/reviews/worktree-security-feedback-scope-placeholder-trace-close-261113-1557.md`,
  band 1, one agent, 0 BLOCKING, 3 SHOULD FIX, 2 NIT. S1, S2, S3 fixed. N1 (`In short` names only
  the immediate earlier record, not the one where each carried conclusion was read) and N2 (no rule
  for an event after midnight in a trace that already holds `end`) left as `NIT`.
- Round 2: `docs/derived/reviews/worktree-security-feedback-scope-placeholder-trace-close-261113-1608.md`,
  0 BLOCKING, 0 SHOULD FIX, 2 NIT (N1, N2 again). S1 to S3 closed.
- Closing read: none, since round 2 fixed nothing.
- `atk:verify` was not offered: the Verify section of `.atk/profile.md` says this repository starts
  nothing, and the checks of the Commands section stand in for it.

## 7. Not verified

- Whether a run of `atk:security` now asks before narrowing a whole-repository scope, asks again
  about a changed placeholder hit, and keeps its `end` last after a late gate. Only runs of that
  skill on a project with earlier records show it; section 9 names who reads them.
- Whether `atk:tailor --feedback` reads the moved `end` line as intended; its reading rule is
  unchanged and was read, not run.

## 8. Blast radius

- `shared/run-trace.md` is read by every `atk` skill through the two trace lines of its workflow;
  the change only adds where a late event goes, and the `end`, interrupted and midnight rules beside
  it are unchanged. Read, not run.
- `plugins/atk/skills/tailor/references/feedback.md:197`, the reader of `end`: unchanged, read.
- `plugins/atk/skills/security/references/delivery-readiness.md:136-137` cites the two secret rows
  of the checklist, so the placeholder rule reaches `--delivery` too. Read, not run.
- The narrower scope does not reach `--delivery`, which takes the whole repository without asking
  (`SKILL.md:86`), per round 1's refuted candidate.

## 9. Left for later

- D1, D2: one general rule for every conclusion carried from an earlier security record (an
  accepted risk, a dismissed STRIDE answer), suggested by the tidy pass; not done, since it changes
  behaviour beyond the three findings.
- D2: a `tree` hit whose line moved after an unrelated edit is asked about again; the feedback asked
  for the line in the identity, and one extra question costs less than a wrong record.
- All: the first `atk:security` runs on version 0.1.24 or later are the check that D1 to D3 hold; to
  be read with `atk:tailor --feedback --runs`. Lam Ngoc Khuong.
- N1, N2: the two `NIT` findings of the review, above, if the Tech Lead wants them.
