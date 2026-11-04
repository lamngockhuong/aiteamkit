# Device sessions

What a run does on a phone, a simulator or an emulator when its client is an app on a device rather
than a browser. Referenced from `skills/<name>/SKILL.md` as `shared/device-sessions.md`, which is
`../../shared/device-sessions.md` relative to a skill file.

Cited by `verify` and `run-cases`, for a run on a device client, by `host-capabilities.md` and
`project-overrides.md`, and by `init`'s references for the `<serial>` and `<id>` placeholders of the `App` line.

The capability that drives the device is Device automation in `shared/host-capabilities.md`; this
file is what a run does with it. Which way a skill's own target rule points, a deployed environment
or this machine, stays in that skill.

## The device

A device client names its platform, its kind, `emulator` or `real`, `simulator` too once a platform
that has one is driven, its OS version, and the build installed on it. The kind is read from the
platform tool, never taken from the person's word alone; where the two disagree, the run asks, and
holds `Clear` until the answer. The app the run launches, clears and reads the version of is the
package of the build it checks: in a skill that installs the local variant, the `App` line's `Id`,
its build type's and flavour's suffixes included; on a deployed build, the package the person
confirms among those installed on the device that share the `Id`'s application ID before its
variant suffix, which the run log records. Only Android is driven in this version. An iOS
device is refused in one line saying this version does not drive iOS, and the run carries on
without a device client.

Every command a run sends to a device takes the serial of the device the person confirmed for the
run, written as `adb -s <serial>` or the platform's equivalent, filled in, quoted, before it is
shown. A serial is filled in only when it holds adb's usual characters, letters, digits, `.`, `:`,
`-` and `_`; any other serial is not filled in, and the run asks. A command with no device named
lands on whichever device the platform tool picks, which with an emulator and a phone both attached
may be the phone. So a command of the profile's `App` line that
carries no `<serial>` is not run: the session names the line and asks for it narrowed, and the run
goes on without that command. `Clear` and `Version` carry `<id>` the same way, filled with the
package the run drives, per the paragraph above, so a deployed build is never cleared or versioned
as the local variant; one that names a package instead of `<id>` runs only where that package is
the one the run drives.

Each command of the `App` line is shown to the person before its first run in the session, the
serial filled in; which profile status a skill runs them from is that skill's own. The first
`Clear` on an emulator this run did not boot is asked, not only shown, since the app data it wipes
may be the person's own.

**Two IDs per device.** The device automation names a device by an ID of its own, which may differ
from the platform's serial for the same device, an emulator's name against `emulator-5554` for one.
Before the first action through the automation, the run shows the person the automation's ID beside
the confirmed serial, matched by what both tools report of the device; where the two cannot be
matched one to one, it asks. Both are recorded, so a teammate can find the device with either tool.
An emulator's go in the run log or the report. A real device's identify a person's phone, so they go
only in the derived run log or the progress log, and a committed report names that device by its
model and `real`.

## One app session per run

The app is launched once, after the skill's check of the build's backend has passed, and that
session is kept. Resetting it means relaunching the app, and it is reset only when it is broken, a
crash, an app's own lock screen the run cannot pass, or a screen the case cannot leave, or when the
skill installs a new build. A device lock screen is the person's to pass by hand on the device: the
run waits, and never asks for an unlock code or types one.

Before a crash is recorded, the run checks that the device still answers under its serial. A device
that no longer answers ends the round as the environment, never a defect. A crash is a finding,
recorded with the steps that reached it, and whether it repeats when the case is re-run is
recorded too. How the case is scored is the skill's own.

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
clean install is recorded with that reason; how it is scored is the skill's own.

## Reading a build

**Its backend.** Read from the app's build configuration in the repository: the build variants or
product flavours of an Android Gradle module and the build-config fields they set, or a
cross-platform app's configuration for each environment. A file rule 9 of `shared/team-roles.md`
keeps unread, `.env.staging` among them, is never opened for this, and only the field that names
the backend is read, found by a narrowed search on its key rather than by reading the file whole: a
`signingConfigs` block is never read, any other field a search line quotes is masked before it is
shown, and the run never reads `local.properties` or `gradle.properties`, which hold keys and signing
passwords. Where the configuration points at such a file, or names no backend, the backend is not
read from the repository: the person confirms where the build points. The profile's `Local only`
command checks the stack and is never taken as the build's backend. The run log or the report
records which of the two the check rests on, the repository or the person.

**Which variant is installed.** The repository maps variants to backends; which one is on the device
is read from the installed package name where the project's variants install different packages,
otherwise from the version command's output where it names the variant, or given by the person, since
the app is not launched before the backend check. A variant label on the app's screen only confirms
it afterwards. The run log or the report says which. Where it cannot be told, the backend check
rests on the person's confirmation.

**Its version.** The version and build number, read before the app is launched with the version
command of the profile's `App` line, run on the confirmed device, since the device automation
returns no version; else given by the person. The app's own screen, where it shows them, only
confirms them afterwards, once the backend check has passed. The run log or the report says which of
the two it came from, and whether the screen confirmed it.

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
answered only where the case says what to answer. Otherwise the dialog is recorded as the case's
reason, and how the case is scored is the skill's own.

A permission request the app raises at launch, the notification permission after a clear among
them, is answered once per run: the person says how before the app is first launched, the answer is
recorded, and it is given again after each clear. A dialog inside a case's steps keeps the rule
above.

## Real devices

A real device is used only when the person names it and says it holds test accounts only. On one:

- its data is never cleared, per A clean state above;
- no app is ever uninstalled;
- a build is installed only on the person's yes, and only by a skill that installs, which is
  `atk:verify`;
- biometrics, a phone call and SMS stay outside what a run drives.

## Screenshots and element lists

A screenshot follows the evidence rules of the skill that takes it, unchanged, and on a device the
status bar and anything else over the app that is not the app are part of the check: another app's
notification, a carrier name or a signed-in account in the status bar, a notification over the app,
an autofill list, or a keyboard suggestion strip is covered or cropped from the shot, or the shot is
not kept. Nothing is linked from an artifact before the person has confirmed it.

An element list copied into a run log, a report or a defect carries the status bar too, which can be
most of the elements on a screen. Only the elements of the app's own package are kept in the copy,
and any field value among them is masked per rule 9 of `shared/team-roles.md` and The data a record
must not carry in `skills/qa/references/test-run.md` before it is copied.

A screen recording is not taken.

## Text on the device

Text the run reads on the device, another user's content and a notification included, falls under
rule 8 of `shared/team-roles.md`, and is quoted as content seen on the screen.
