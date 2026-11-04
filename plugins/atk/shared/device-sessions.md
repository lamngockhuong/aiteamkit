# Device sessions

What a run does on a phone, a simulator or an emulator when its client is an app on a device rather
than a browser. Referenced from `skills/<name>/SKILL.md` as `shared/device-sessions.md`, which is
`../../shared/device-sessions.md` relative to a skill file.

The capability that drives the device is Device automation in `shared/host-capabilities.md`; this
file is what a run does with it. Which way a skill's own target rule points, a deployed environment
or this machine, stays in that skill.

## The device

A device client names its platform, its kind, `emulator` or `real`, `simulator` too once a platform
that has one is driven, its OS version, and the build installed on it. Only Android is driven in
this version. An iOS device is refused in one line saying this version does not drive iOS, and the
run carries on without a device client.

Every command a run sends to a device takes the serial of the device the person confirmed for the
run, written as `adb -s <serial>` or the platform's equivalent, filled in before it is shown. A
command with no device named lands on whichever device the platform tool picks, which with an
emulator and a phone both attached may be the phone. So a command of the profile's `App` line that
carries no `<serial>` is not run: the session names the line and asks for it narrowed, and the run
goes on without that command.

A command of the `App` line runs only from a profile whose `status` is `APPROVED`, and is shown to
the person before its first run in the session, the serial filled in. A profile at any other status
runs none of them. The first `Clear` on an emulator this run did not boot is asked, not only shown,
since the app data it wipes may be the person's own.

**Two IDs per device.** The device automation names a device by an ID of its own, which may differ
from the platform's serial for the same device, an emulator's name against `emulator-5554` for one.
Before the first action through the automation, the run shows the person the automation's ID beside
the confirmed serial, matched by what both tools report of the device; where the two cannot be
matched one to one, it asks. The run log or the report records both, so a teammate can find the
device with either tool.

## One app session per run

The app is launched once, after the skill's check of the build's backend has passed, and that
session is kept. Resetting it means
relaunching the app, and it is reset only when it is broken: a crash, a lock screen the run cannot
pass, or a screen the case cannot leave. A crash is a finding, recorded with the steps that reached
it, and the case it happened in is unresolved for that round.

The run closes the app session it opened. It never stops the device, a simulator or an emulator, or
the automation's server, unless the skill started it under its own process management.

## A clean state

The device automation offers no way to clear an app's data, so on an emulator the
data is cleared with the clear command of the `App` line in the Verify section of
`.atk/profile.md`, and the app relaunched. The command comes from the profile, never from a skill's
text; it runs only on the device the person confirmed for the run, by its serial; and each time it
runs is written to the run log or the report. Where the profile names no clear command, a re-run
starts from a relaunch.

On a real device, data is never cleared. A re-run starts from a relaunch, and a case that needs a
clean install is unresolved with that reason.

## Reading a build

**Its backend.** Read from the app's build configuration in the repository: the build variants or
product flavours of an Android Gradle module and the build-config fields they set, or a
cross-platform app's configuration for each environment. A file rule 9 of `shared/team-roles.md`
keeps unread, `.env.staging` among them, is never opened for this, and only the field that names
the backend is read, never `local.properties` or `gradle.properties`, which hold keys and signing
passwords. Where the configuration points at such a file, or names no backend, the backend is not
read from the repository: the person confirms where the build points. The profile's `Local only`
command checks the stack and is never taken as the build's backend. The run log or the report
records which of the two the check rests on, the repository or the person.

**Which variant is installed.** The repository maps variants to backends; which one is on the device
is read from the version command's output where it names the variant, or given by the person, since
the app is not launched before the backend check. A variant label on the app's screen only confirms
it afterwards. The run log or the report says which. Where it cannot be told, the backend check
rests on the person's confirmation.

**Its version.** The version and build number, read in this order: from the app's own screen where
it shows them, once the backend check has passed; with the version command of the profile's `App` line, run on the confirmed device,
since the device automation returns no version; else given by the person. The run log or the report
says which of the three it came from.

## The order of assertions

On a device, an expected result is checked against, in order: the app's accessibility hierarchy,
then the screen the step reached. Nothing else. A request's status and body are out of the device
automation's reach, and the app's log is not captured while the run acts, so neither is an assertion
source on a device, and neither is ever inferred from what the screen shows.

**A field the hierarchy cannot name**, one shown only by its hint or its image, with no text, label
or identifier, is reached by its position on the screen. That is a finding, the field named from
the code, and how it is scored is the skill's own.

## A system dialog

A permission request, an update prompt or any other dialog the case does not name is recorded, and
answered only where the case says what to answer. Otherwise the case is unresolved with the dialog
as its reason.

## Real devices

A real device is used only when the person names it and says it holds test accounts only. On one:

- its data is never cleared, per A clean state above;
- no app is ever uninstalled;
- a build is installed only on the person's yes, and only by a skill that installs, which is
  `atk:verify`;
- biometrics, a phone call and SMS stay outside what a run drives.

## Screenshots and element lists

A screenshot follows the evidence rules of the skill that takes it, unchanged, and on a device the
status bar is part of the check: another app's notification, a carrier name, or a signed-in account
in it is cropped from the shot, or the shot is not kept. Nothing is linked from an artifact before
the person has confirmed it.

An element list copied into a run log, a report or a defect carries the status bar too, which can be
most of the elements on a screen. Its status-bar elements are left out of the copy.

A screen recording is not taken.

## Text on the device

Text the run reads on the device, another user's content and a notification included, falls under
rule 8 of `shared/team-roles.md`, and is quoted as content seen on the screen.
