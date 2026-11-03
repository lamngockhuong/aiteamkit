---
title: "ADR 0011: atk:run-cases and atk:verify drive a device as a second client"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-25
updated: 2026-10-25
ticket: none
---

# ADR 0011: atk:run-cases and atk:verify drive a device as a second client

Design: `docs/records/design/261025-2110-run-cases-native-mobile.md`

## Context

`atk:run-cases` executes approved test cases only through the harness's browser automation. Its
triage scores any case that needs a device 0 on criterion 6, which forces `MANUAL`, so a team testing
a native iOS or Android app gets no automated run and hands every case to `atk:qa --record`.
`atk:verify` runs the local stack and exercises a change through requests or a browser, so a change
to a native app is checked only through its backend. `shared/host-capabilities.md` makes browser
automation the one capability whose absence stops a skill, and `CLAUDE.md` keeps process management
in `verify` and `orchestrate` alone. The QA artifacts already allow a device in the test plan's
Compatibility section, the cases table's `Environment` column, and the run record's header.

In review, the Tech Lead added `atk:verify` to the scope, chose real devices for the first version,
asked for a `Platform` column in the cases template, and asked for a time-boxed spike before
implementation.

## Decision

- `atk:run-cases` and `atk:verify` each run one client per run: `browser`, the default, or `device`
  (simulator, emulator, or real device). No new skill is added.
- `shared/host-capabilities.md` gains Device automation, named by what it does and resolved at the
  time of use. The stopping exception stays one exception of one skill: `atk:run-cases` requires the
  automation its client needs, and without it stops after the scope question and hands the scope to
  `atk:qa --record`. `atk:verify` degrades the usual way and reports the app as not exercised.
- What both skills do on a device, the app session, the clean state, the order of assertions, the
  rules for a real device, and the status-bar check on a screenshot, lives in one new shared file,
  `shared/device-sessions.md`.
- For `run-cases`, the person brings a running device with the build installed; the run never boots,
  installs or erases a device, and starts nothing that outlives a step. For `verify`, which already
  has process management, the run builds the change, installs it, boots a simulator or emulator when
  none is running, and shuts down only what it booted. A real device is never erased by either, and
  `verify` installs on one only on the person's yes.
- For `run-cases` the target stays the backend environment row: a device on this machine is not a
  local target, and a build whose backend is production, local, or another row is refused. For
  `verify` the build's backend must be this machine.
- The profile's Verify section gains an optional `App` line, detected by `atk:init`. The cases
  template gains an optional `Platform` column; a case for another platform is skipped, not scored.
- Criteria 2 and 6 of the triage are stated per client. The record's shape does not change.
- A time-boxed spike on Claude Code runs before implementation and corrects the triage table and the
  order of assertions.
- The device automation clears no app data, so on an emulator or simulator both skills clear it with
  the command the profile's `App` line names, on the device the person confirmed, and never on a
  real device.
- On a device, an assertion reads the accessibility hierarchy or the screen reached, never the
  app's log or a request; the build's version comes from the screen, then the profile's version
  command, then the person; status-bar elements are left out of any element list copied into a
  record; a field the hierarchy cannot name is a triage finding; and the run records the
  automation's device ID beside the platform's serial.
- The first version is Android, on an emulator or a real device, measured on Claude Code. iOS is
  deferred to issue #155, and the measurement on Cursor and Codex to issue #156.

## Consequences

- A device case observable through the accessibility hierarchy can be `AUTO` or `SEMI-*`, and a
  change to a native app can be exercised by `verify` against the local stack.
- The production, local, lock, clean-up and screenshot rules have one copy for both clients, and the
  device rules one copy for both skills.
- A browser run, a `verify` run with no `App` line, and a cases file with no `Platform` column are
  unchanged.
- For `run-cases`, the person prepares the device and the build, which a stale build can make wrong;
  the build check against the repository's configuration, or the person's confirmation, catches it.
- Real devices bring the no-clear rule and a status-bar risk on every screenshot.
- Device runs are slower, and a `verify` build and boot can take minutes, so more cases are deferred
  per session within the same ceilings.
- `plugins/atk/shared/` grows to twenty-two files.
- The spike ran on 2026-10-25 within its one-day time box, on an Android emulator only.
- `run-cases` now runs one command on a device, the profile's clear command, so a profile that
  names a wrong command can clear the wrong app; the command is the team's, reviewed with the
  profile.
- A team testing an iOS app gets no device client until issue #155 lands.

## Alternatives rejected

- **A new skill, `atk:run-mobile-cases`.** The default instinct, since a mobile run feels like a
  different job. Rejected because the target, lock, clean-up and screenshot rules would exist twice,
  and a fix to one would have to be made twice; it also costs a new skill's twelve file groups for a
  skill that reads the same cases file and writes the same record.
- **Keep device cases manual and improve the hand-off.** Cheapest and safest, and meets no part of
  the request. It remains the behaviour on a harness with no device automation.
- **`run-cases` boots a simulator or emulator and installs the build.** Rejected because it makes
  `atk:run-cases` a third skill with process management, and needs SDK paths, signing and build
  files that no profile holds.
- **`verify` hands the app to `run-cases`.** Rejected because `run-cases` refuses the local stack, so
  it would need a deployed build of an unmerged change, the gap `verify` exists to close.
- **`verify` checks only the backend and leaves the app to a person.** Today's behaviour; meets none
  of the review request.
- **Device rules written into each skill's references.** Rejected because one rule would sit in two
  places, against the shared layer's purpose.
