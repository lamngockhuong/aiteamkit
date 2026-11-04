---
title: "Fix: the device client of PR #168 drives the wrong package, and 68 review findings of its rules"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-05
updated: 2026-11-05
ticket: https://github.com/lamngockhuong/aiteamkit/pull/168
---

# Fix: review findings of PR #168

## In short

The review of PR #168 (`docs/derived/reviews/168-261104-2314.md`, at `6005dae`) found that the
profile's `Id` names an Android app's base package, so `atk:verify` installed the debug variant
(`com.x.debug`) and then launched, cleared and versioned another package (`com.x`). That one,
`B1`, blocked. The other 68 findings answered "fix" are gaps in the rules both skills follow on a
device: two clients of one cases file were never told apart, verify read the shared device rules
only section by section, several device states (a repeated crash, a launch-time permission
dialog, a device lock, a lost device) pointed the wrong way, and a few lists of what may be read
or copied leaked more than they should. Each was proved by quoting its lines at `6005dae`, and
each change is a wording change in the skill or shared file that owns the rule. `N27` and `N39`
were deferred to phase 4 of the plan. Lam Ngoc Khuong answered every finding, ruled on the three
that reverse a recorded decision (`S8`, `S18`, `N21`), and approves this report.

## After the last round

The closing read (`docs/derived/reviews/feat-verify-device-client-worktree-261105-0652.md`) read the
round 2 fix of `B2` in `shared/device-sessions.md`, `init/references/detection.md` and
`init/references/profile-template.md`: 0 `BLOCKING`, 0 `SHOULD FIX`, 6 `NIT`. `B2` is closed.
Nothing was fixed after it.

## 1. Symptom as captured

The review report's own words, per finding, are the captured failure; each block below quotes its
`Issue` by reference to the report section of the same ID, and the lines that produced it.

## 2, 3, 4, 4b. Per defect

Every defect was introduced by the three commits of this pull request (`a2289d6`, `dd4d444`,
`6005dae`), so "why now" is the same for all: the text has been this way since it was written, on
this branch, and no run has yet exercised it (phase 4 measures the skills on a device). Recorded
intent was searched in plan `plans/261104-2014-run-cases-verify-android-device/plan.md` and its
phase files, design `docs/records/design/261025-2110-run-cases-native-mobile.md` (APPROVED) and
ADR 0011; a contradiction is named in the block, and its ruling with it. Evidence is the cited
lines at `6005dae`, quoted, with the check that shows they produce the behaviour.

### B1
- Cause: `plugins/atk/skills/init/references/detection.md:331-334` (at `6005dae`) records
  "its `applicationId`, or the `namespace` where none is set, is `Id`", the base package; and
  `plugins/atk/shared/device-sessions.md:75-77` reads the variant "from the version command's
  output", run against that same `Id`.
- Check: a variant with `applicationIdSuffix ".debug"` installs `com.x.debug`; every `Clear`,
  launch and `Version` command is filled with `com.x`.
- Intent: none found; design `:393-397` says only "the app identifier to launch".
- Round 1 of the review found the run-cases half: with `Id` the local variant's package,
  `environment-safety.md:76-78` looked for and launched it on a deployed build. Ruling, Lam Ngoc
  Khuong, 2026-11-05: on a deployed build the person picks the package among those installed that
  share the `Id`'s application ID, in the target's confirmation, and the run log records it.

### S1
- Cause: `plugins/atk/skills/run-cases/SKILL.md:114-116`: the device client is offered where "the
  harness lists device automation, the profile has an `App` line, or the Compatibility rows name a
  device". Check: any one of three, so automation installed on a web-only project asks a new
  question, against AC5 (`plan.md:34`).

### S2
- Cause: verify cites `shared/device-sessions.md` only at `runtime-checks.md:114,145,207` and
  `ui-checks.md:94-95` (loaded under `--ui`); `run-cases/references/execution.md:31` says every
  rule holds. Check: Real devices and A system dialog are never reached by verify.

### S3
- Cause: `device-sessions.md:28-30` "A command of the `App` line runs only from a profile whose
  `status` is `APPROVED`", applied by verify at `runtime-checks.md:145-149`. Check: init writes
  `DRAFT`, so verify installs nothing. Intent: plan `:198` (O12) set the gate for run-cases only;
  Lam Ngoc Khuong confirmed on 2026-11-04.

### S4
- Cause: `release/SKILL.md:115-116` "a later record passed its case, whatever that record's scope";
  `shared/state-signals.md:72` "of any scope". Check: neither compares the client. Ruling: Lam
  Ngoc Khuong, 2026-11-04, per client from the `Environment` suffix.

### S5
- Cause: `release/SKILL.md:95-98` "every other run record of the same build"; a device record's
  `Build` is the app version (`execution.md:242`). Ruling: as `S4`.

### S6
- Cause: `run-cases/SKILL.md:107-109` reads the newest run log before step 2 settles the client;
  `execution.md:154` writes client fields only on a device.

### S7
- Cause: `triage.md:15-17` counts `Platform` skips "in the triage report" only;
  `execution.md:250-258` In short omits them.

### S8
- Cause: `device-sessions.md:45-46` "the case it happened in is unresolved for that round";
  `execution.md:99-101,143` reaches `Failed` only on contradiction. Check: a crash repeated three
  rounds ends `Pending`, and `atk:qa --bug` reads `Failed` only.
- Intent: design `:479-480` "the case is unresolved for the round". Concern: the worst defect is
  never raised. Ruling: Lam Ngoc Khuong, 2026-11-05: a crash in the case's own steps repeated on
  its re-run is `Failed`; the design stays as the record of the earlier choice.

### S9
- Cause: "unresolved" at `device-sessions.md:45,61,100`, defined only at `execution.md:100`;
  verify has no such state.

### S10
- Cause: `environment-safety.md:70-71` checks "before the run launches the app", in the order of
  `device-sessions.md:81-82`, whose first source is the app's own screen.

### S11
- Cause: `triage.md:104,130`: criterion 6 scores 0 for a device control, verdict step 1 makes it
  `MANUAL` before step 2's `BLOCKED` at `:18-20,135` is reached.

### S12
- Cause: `detection.md:332-333` makes `Directory` the `android/` module; `runtime-checks.md:108-110`
  runs the device path only for a change under it.

### S13
- Cause: `runtime-checks.md:149-151` rebuilds only after "a round of step 4"; the tidy re-run at
  `verify/SKILL.md:192-195` uses the earlier build.

### S14
- Cause: `verify/SKILL.md:115-116,216-220` inventory by port only; `report-template.md:143-145`
  records the shutdown command alone.

### S15
- Cause: `runtime-checks.md:7-10` "every command in this file is a blank" filled from the profile,
  while the `App` line (`profile-template.md:154-159`) holds no boot, reverse, shutdown or list
  command.

### S16
- Cause: `runtime-checks.md:211-215` "Nothing is booted, built or installed for a client the run
  cannot drive" sits after Starting step 4 at `:141-152`; `environment-safety.md:74-76` has no
  dry-run exemption.

### S17
- Cause: `device-sessions.md:53-58` clears data, `:99-101` leaves a case unresolved on any dialog
  it does not name; a clear revokes runtime permissions, so the launch-time request returns.

### S18
- Cause: `runtime-checks.md:119-122` allows the port reverse "on a real device", `:127` stops
  anything else. Intent: plan `:159` (Q5) chose the reverse for real devices. Ruling: Lam Ngoc
  Khuong, 2026-11-05, widens Q5: a recorded reverse is accepted on an emulator too.

### S19
- Cause: `environment-safety.md:28,81-87`: the build "must point at the confirmed row", with no rule
  for how a backend host matches a row holding the web host.

### S20
- Cause: `environment-safety.md:62` counts "an error other than a gate's" as down; an API root may
  answer 404 or 401.

### S21
- Cause: `environment-safety.md:61-65` refuses loopback, `localhost` or the machine's own address,
  `:64` calls a private address not local; `:84-86` names no rule for an unknown host.

### S22
- Cause: `device-sessions.md:44` "a lock screen the run cannot pass" is a relaunch reason.

### S23
- Cause: `device-sessions.md:44-46` records a crash with no check that the device still answers.

### S24
- Cause: `device-sessions.md:16-20` takes the kind as named; `:28-31` asks only the first `Clear`.

### S25
- Cause: `device-sessions.md:120-121` "Its status-bar elements are left out of the copy", nothing
  else.

### S26
- Cause: `detection.md:334-337` bars only "a file rule 9 names"; `shared/secret-scan.md:322-330`
  lists neither `local.properties` nor `gradle.properties`, which only `device-sessions.md:68-70`
  bans. Answer: cite Reading a build from `detection.md`; the scan table is left as it is, since a
  row there makes every committed `gradle.properties` a finding.

### S27
- Cause: `device-sessions.md:68` "only the field that names the backend is read", with no rule on
  how; a file read loads a `signingConfigs` block.

### S28
- Cause: `device-sessions.md:115-117` checks the status bar only; `ui-checks.md:94-95` names only
  "the status-bar check".

### S29
- Cause: `host-capabilities.md:158-160` records the telemetry setting as reported, and nothing tells
  the person before a credential is typed. Ruling: Lam Ngoc Khuong, 2026-11-04.

### S30
- Cause: "emulator" in `run-cases/evals/trigger_evals.json:12` and `verify/evals/trigger_evals.json:4,6`,
  with no device negative for the neighbour in either file.

### S31
- Cause: `detection.md:340` `ANDROID_SERIAL=<serial> ./gradlew ...` runs in a POSIX shell only.
  Ruling: Windows is in scope, Lam Ngoc Khuong, 2026-11-04.

### N1 to N40, without N11, N27 and N39
- Each `NIT` is a wording or list fix; its cause is the line the review cites, read at `6005dae`
  and found to say what the review says, with these corrections: `N19`'s summary row is
  `docs/codebase-summary.md:49`, not `:132`; `N21` departs from design `:350-351` ("an HTTP basic
  gate does not apply to a native client"), ruled by Lam Ngoc Khuong at the walk; `N40` adds the
  design's promise to `shared/project-overrides.md`, since an `APPROVED` design is not edited.

## 5. The change

Each defect's change is a wording change in the file that owns its rule, in 32 files (324 lines
added, 183 removed against `6005dae`), most of it in `shared/device-sessions.md`, the verify
references, the run-cases references, `init/references/detection.md`, and the docs and `CLAUDE.md`
lines that describe them. Every defect is in a rule an agent follows; the form each took is the
narrowest of `shared/review-fix-loop.md`: a sentence corrected where it said the wrong thing
(`B1`, `S1`, `S3`, `S8`, `S10`, `S11`, `S18`, `S20`, `S21`, most `NIT`), a rule added where a state
had none (`S12` to `S17`, `S19`, `S22` to `S25`, `S27`, `S29`), a citation in place of a restated
rule (`S2`, `S26`, `S28`, `N36`), and eval entries (`S30`, `N38`). No refactor rode along.

Tidy: `/simplify` ran four lenses over the changed lines and its applied changes stayed inside them:
the `APPROVED` gate stated once, in run-cases' `execution.md`, rather than in three files; the crash
scoring left to each skill, with `shared/device-sessions.md` recording only whether a crash repeats;
the version order, the build-reading limits and the record's client each cited from their owner
instead of restated; two long sentences of `device-sessions.md` split; and a rewrap with no change of
words restored. Skipped, and listed in section 9: the client definition in `qa/references/test-run.md`,
folding questions into confirmations already asked, and moving a run-cases step 1 paragraph to step 2.

Review fixes: round 1's `B1` (the run-cases half: on a deployed build the person picks the package,
in the target's confirmation), `S1` (verify waits for the first request only where the stack logs
requests), `S2` (the package name names the variant only where variants install different
packages) and `S3` (`In short` counts crashes the re-run did not repeat), each a corrected or added
sentence; round 2's `B2`, a placeholder `<id>` in `Clear` and `Version`, filled like `<serial>`.

Reference documents: the change is to the kit's own rules, whose reference documents are the docs
this repository keeps about them; `docs/skills-overview.md`, `docs/codebase-summary.md`,
`docs/flow/skill-chain.md`, `docs/project-roadmap.md`, `docs/system-architecture.md` and their
`docs/vi/` mirrors moved with it, and `CLAUDE.md`'s row and paragraph for `device-sessions.md`.
The `APPROVED` design and ADR 0011 are records and were not edited.

## 6. Verified

- `bash tests/verify.sh` (the profile's check, standing in for runtime verification): 84 lines, all
  `OK`, after the fix, after the tidy, and after each review round. It proves manifests and
  frontmatter parse, `docs/` and `docs/vi/` mirror, citations resolve inside the plugin, trigger
  evals parse with no positive claimed twice, and the line counts it holds.
- The checks beside their rules in `CLAUDE.md`: `ak:`, `atkx`, `fill:#` and symlinks print nothing;
  the em-dash check prints only `docs/records/fixes/261016-0613-review-author-replies.md:38`, a
  record this change does not touch. `verify/SKILL.md` is 299 lines, `run-cases/SKILL.md` 234.
- Reproduction: each defect's cited lines were read again after the change and no longer say what
  the defect quotes; for `B1`, `S3` and `S8` the new lines were read in the session.

## 6b. Reviewed

- Round 1, `docs/derived/reviews/feat-verify-device-client-worktree-261105-0019.md`: `B1` fixed
  (ruling above), `S1`, `S2`, `S3` fixed, `N1` to `N3` left as `NIT`.
- Round 2, `docs/derived/reviews/feat-verify-device-client-worktree-261105-0640.md`: `B2` fixed, form
  chosen by Lam Ngoc Khuong; `N4`, `N5` left as `NIT`.
- Closing read, `docs/derived/reviews/feat-verify-device-client-worktree-261105-0652.md`: 0
  `BLOCKING`, 0 `SHOULD FIX`, 6 `NIT` (`N6` new), none fixed.
- `atk:verify` was not offered: this repository starts nothing (`Start: none` in the profile), and
  `tests/verify.sh` is its runtime check.
- The reviewer of these rounds was an agent, not the author; Lam Ngoc Khuong still reviews the pull
  request.

## 7. Not verified

- No skill was run on a device: every rule here is text, and whether an agent follows it on an
  emulator or a real phone is phase 4 of the plan.
- The PowerShell `Install` form, the device-side `grep` and the quoted serial were not run on Windows,
  `cmd` or a device (`N3` of round 1 says the single quotes fail in `cmd`).
- Trigger evals were parsed, not measured: the new negatives (`S30`, `N38`) have no measured run.

## 8. Blast radius

Callers of the changed shared files, checked by the citation check of `tests/verify.sh` and read by
the review rounds: `shared/device-sessions.md` is cited by verify, run-cases, `host-capabilities.md`,
`project-overrides.md` and init's references; `shared/host-capabilities.md` Device automation by
the same two skills; `shared/state-signals.md` row 17 by `atk:help` and `atk:orchestrate`, which
were not exercised; `release/SKILL.md` by nothing else. None was run, since no skill is run here.

## 9. Left for later

- `N27`, deferred: whether the device automation installs a helper app on a real device; phase 4
  of `plans/261104-2014-run-cases-verify-android-device` reads it on a device.
- `N39`, deferred: checks in `tests/verify.sh` for the `<serial>` placeholder, the `Platform`
  values and the shared-file counts; phase 4, once the wording has settled.
- A run record a tester writes through `atk:qa --record` carries no client suffix rule in
  `plugins/atk/skills/qa/references/test-run.md`, so a device run recorded that way reads as the
  browser's under `S4` and `S5`; the client of a record is defined in run-cases' `execution.md`
  only. Defining it under `Environment` in `test-run.md` also touches the copy `atkx:doc-audit`
  holds of that file.
- Questions the tidy step found could be folded into confirmations already asked (the launch-time
  permission answer, the backend host of a row, which shells the team uses, which init could detect
  from `gradlew.bat`), and the run-log paragraph of run-cases step 1 that waits on step 2.
- The PowerShell `Install` form and the device-side `grep` were written from shell behaviour and
  have not been run on Windows or a device; phase 4.
- `NIT` of the review rounds, recorded and not fixed: `N1` `CLAUDE.md:192`, both codebase summaries
  and both system-architecture files still place the approved-profile rule in `device-sessions.md`;
  `N2` the profile template holds one `Install` slot where detection records one per shell; `N3`
  single quotes fail in `cmd`; `N4` where the application ID before the suffix comes from; `N5` the
  first-request wait has no limit; `N6` a `Clear` or `Version` naming neither `<id>` nor a package.

## 10. Findings answered

| ID | Answer | Reason or place | Reply |
|----|--------|-----------------|-------|
| `B1` | `fixed` | defect block above | not posted |
| `S1` to `S31` | `fixed` | defect blocks above; `S3`, `S4`, `S5`, `S29`, `S31` per the recorded answers, `S8`, `S18` ruled at the walk | not posted |
| `N1` to `N10`, `N12` to `N26`, `N28` to `N38`, `N40` | `fixed` | as listed above | not posted |
| `N27` | `deferred` | phase 4 of plans/261104-2014-run-cases-verify-android-device | not posted |
| `N39` | `deferred` | phase 4 of plans/261104-2014-run-cases-verify-android-device | not posted |
