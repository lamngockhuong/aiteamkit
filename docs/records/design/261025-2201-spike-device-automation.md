---
title: "Spike: what a device automation exposes to the agent, for run-cases and verify on a native app"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-25
updated: 2026-10-25
ticket: none
---

# Spike: what a device automation exposes to the agent, for run-cases and verify on a native app

Design: `docs/records/design/261025-2110-run-cases-native-mobile.md`, which asked for this spike in
its answer to Q1.

## Question

Through a device automation reached as an MCP server from Claude Code, can an agent, on an Android
emulator, an iOS simulator and a real device:

1. read the app's accessibility hierarchy;
2. see and answer a system dialog;
3. read the installed build's version;
4. see the app's network traffic;
5. read the app's logs;
6. clear the app's data;
7. install and launch a build made on this machine?

The answer unblocks the design's Triage on a device table (criteria 2 and 6), its order of
assertions, and the clean-state rule of `shared/device-sessions.md`. It separates Option A from
Option C of Decision 1, and V1 from V3 of Decision 2: if the hierarchy cannot be read, nothing can be
asserted on a device and both decisions fall back to the manual option.

## Time box

One working day, about eight hours, set by Lam Ngoc Khuong on 2026-10-25 (Q4 of the design).
Used: about fifteen minutes, from 22:01 to 22:15, Android setup included. The iOS simulator and the
real devices were not measured: this machine has the Command Line Tools without Xcode, and Lam Ngoc
Khuong chose on 2026-10-25 to install the Android tools only and read the documentation for iOS and
real devices, since installing Xcode needs the App Store and an Apple ID and would pass the two-hour
setup limit of the time box.

## What would count as an answer

Written before looking. For each of the seven, on the Android emulator:

- **Yes**: a tool of the automation returns it, and a headless Claude Code run used it.
- **Partial**: only through the platform's own command line (`adb`), or only in part.
- **No**: no tool returns it.

For iOS and real devices, the automation's documentation for the version used, marked as stated by
the source and not measured.

## What was done

| Evidence | Detail |
|----------|--------|
| Machine | macOS 27.0.1 on arm64, Command Line Tools only, no Xcode, no Android SDK before the spike |
| Setup | Homebrew `android-commandlinetools` and `openjdk@17`; SDK packages `platform-tools`, `emulator`, `platforms;android-35`, `build-tools;35.0.0`, `system-images;android-35;google_apis;arm64-v8a`; an AVD `atk-spike`, booted headless in 26 seconds |
| Device automation | `@mobilenext/mobile-mcp@1.0.9`, released 2026-10-09, chosen as the newest release more than two weeks old; telemetry disabled with `MOBILEMCP_DISABLE_TELEMETRY=1`. It is one example of the capability; the kit names none |
| Prototype app | A one-screen Android app, package `dev.atk.spike`, version `0.0.7-spike` (code 7), built on this machine without Gradle (`aapt2`, `javac`, `d8`, `apksigner`): a counter kept in app storage and logged to the tag `ATKSPIKE`, a text field with the hint "Your name", a greeting, a notification-permission request, and the build shown on screen. Kept in the session's scratch directory, never in the repository, and discarded with it |
| Probe | `claude -p` from Claude Code with `--mcp-config` holding only that server, `--strict-mcp-config`, allowed tools the server's alone, Bash, Edit and Write refused; thirteen steps; ran 22:05:55 to 22:08:48 |
| Cross-check | `adb` from the same machine, after the probe: the AVD name, `logcat -d -s ATKSPIKE`, `dumpsys package`, `pm clear`, a screenshot after the clear |
| Outside sources | The package's `README.md` at 1.0.9, read 2026-10-25 from the npm tarball; Cursor's MCP documentation, https://cursor.com/docs/mcp, read 2026-10-25; Codex's MCP documentation, https://developers.openai.com/codex/mcp, read 2026-10-25 |
| Clean-up | The emulator this spike started was stopped with `adb emu kill`; the MCP server exited with the probe; the SDK, the AVD and JDK 17 remain installed on the machine |

## Findings

| # | Finding | Answer | How sure |
|---|---------|--------|----------|
| F1 | **The hierarchy is readable.** `mobile_list_elements_on_screen` returned each element's type, text, content description as `label`, resource ID as `id`, and its position: `TextView text="Count: 0" label="count-label"`, `Button text="Tap me"`. Taps by element reference worked, and `mobile_batch_commands` ran a tap, a typed value and a second tap in one call, then listed the elements: `Count: 2`, `Hello, Spike` | Yes | Confirmed by the prototype, Android emulator |
| F2 | **A field named only by its hint has no name.** The text field showed "Your name" on screen, but its element carried no text, label or ID; the probe found it by position | Partial | Confirmed by the prototype |
| F3 | **The status bar is in every element list and every screenshot.** 23 of the 34 elements listed belonged to the system status bar, and the saved screenshot shows the clock, network and battery | Yes, and a risk | Confirmed by the prototype and by looking at the image |
| F4 | **A system dialog is readable and answerable.** The notification-permission dialog appeared in the element list with its text and two buttons, each with a platform ID (`com.android.permissioncontroller:id/permission_allow_button`); tapping Allow returned to the app | Yes | Confirmed by the prototype |
| F5 | **The build's version is not returned by any tool.** `mobile_list_apps` gives name and package only. The screen showed `Build 0.0.7-spike (7)` because the app prints it. `adb shell dumpsys package` returned `versionName=0.0.7-spike` and `versionCode=7` | Partial: the screen, or the platform's command line | Confirmed |
| F6 | **No network traffic.** No tool shows a request or a response | No | Confirmed by the tool list |
| F7 | **Logs are not usable for assertions through the automation.** `mobile_get_device_logs` captures only lines written while it runs, and the probe's calls ran one after another, so no tap happened during a capture and no `ATKSPIKE` line came back. `adb logcat -d -s ATKSPIKE` afterwards held all four lines, `count=1` to `count=4` | Partial: the platform's command line | Confirmed |
| F8 | **The app's data cannot be cleared through the automation.** No tool clears it; terminating and relaunching kept `Count: 4`. `adb shell pm clear dev.atk.spike` returned `Success`, and the relaunched app showed `Count: 0` | Partial: the platform's command line | Confirmed |
| F9 | **A build made on this machine installs and launches.** `mobile_install_app` installed the `.apk` file by path; `mobile_launch_app` launched it by package; `mobile_uninstall_app` and `mobile_terminate_app` exist | Yes | Confirmed by the prototype |
| F10 | **The automation names a device by its own ID.** It listed the emulator as `atk-spike`, the AVD name, and refused `emulator-5554`, the serial `adb` uses for the same emulator (`adb emu avd name` returned `atk-spike`) | Yes, a naming difference | Confirmed |
| F11 | **Telemetry is on by default.** The package collects anonymous usage telemetry unless `MOBILEMCP_DISABLE_TELEMETRY` is set | A security point | Stated by the source for 1.0.9 |
| F12 | **Speed.** Thirteen steps, eleven of them device actions, took 2 minutes 53 seconds headless, model reasoning included | About 15 seconds per step | Measured once |
| F13 | **iOS simulator.** Supported; needs Xcode and a booted simulator, and drives the app through WebDriverAgent on the simulator; install, launch, terminate and uninstall go through `xcrun simctl` | Stated | Stated by the source for 1.0.9; not measured |
| F14 | **Real devices.** iOS: a device connected over USB and trusted, a tunnel, and WebDriverAgent running on it. Android: `adb` with USB debugging enabled and authorised | Stated | Stated by the source for 1.0.9; not measured |
| F15 | **Cursor and Codex.** Both document stdio MCP servers: Cursor in `.cursor/mcp.json` or `~/.cursor/mcp.json`, Codex in `[mcp_servers.<name>]` of `config.toml`, a project file only in a trusted project | Stated | Stated by the sources, read 2026-10-25; not measured |

## Recommendation

The design's Option A and V1 hold: F1, F4 and F9 show that an agent can drive a native app and assert
on what the hierarchy holds. Nothing found favours Option C or V3. The findings correct five parts of
the design:

1. **Criterion 2 on a device.** A request's status and body are out of reach (F6), and the app's log is
   not reliable through the automation (F7). Score them as 0 on a device unless the person states a
   way, and drop "the app's log where the automation offers it" from the order of assertions, which
   becomes the hierarchy, then the screen reached.
2. **The clean state.** Clearing app data (F8) and reading the build's version (F5) are done by the
   platform's own command line, not by the automation. Recommend that `shared/device-sessions.md`
   says so, and that the command comes from the profile's `App` line rather than from the skill's
   text, as `verify`'s other commands do. Whether `run-cases`, which today runs no command on the
   device, may clear an emulator's data this way is a choice for the Tech Lead (Still unknown, U1).
3. **The status-bar check covers the element list too** (F3). An element list copied into a run log
   or a defect carries a notification's text the same way a screenshot does.
4. **An unnamed field is a grounding finding** (F2). A field the hierarchy cannot name is reached by
   position, which is a criterion 3 risk; the triage report names it, and grounding in the code gives
   its name.
5. **Two IDs per device** (F10). The run log records the automation's device ID beside the platform's
   serial, so a teammate can find the device with either tool.

Two notes for `shared/host-capabilities.md`: a device automation may send telemetry by default (F11),
which the person configures, and Cursor and Codex can reach the same kind of server by their
documentation (F15).

## Still unknown

| ID | Unknown | Who can answer | Next step |
|----|---------|----------------|-----------|
| U1 | Whether `run-cases` may clear an emulator's or simulator's app data with the platform's command, or only relaunch | Lam Ngoc Khuong, as Tech Lead | A ruling recorded on the design through `--answer` |
| U2 | Whether the iOS simulator gives the same hierarchy, dialogs and install as F1, F4 and F9 | Lam Ngoc Khuong, or a teammate with Xcode | A second spike of about three hours on a machine with Xcode |
| U3 | Whether a real iOS or Android device behaves as the source states | Lam Ngoc Khuong, or a teammate with a test device | The same probe on a connected test device holding test accounts only |
| U4 | Whether Cursor and Codex run the probe as Claude Code did | Lam Ngoc Khuong | The same probe through each harness's own MCP configuration |
