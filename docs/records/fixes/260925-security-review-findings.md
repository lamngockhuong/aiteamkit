---
title: "Fix: a symlinked override is read from outside the repository, workflows run actions by movable tag, and .env.* is not ignored"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, Tech Lead for the hooks layer)
created: 2026-09-25
updated: 2026-09-25
ticket: none
---

# Fix: the three findings of the 2026-09-25 security review

The findings are SF1, SF2 and SF3 of the `atk:security` review of 2026-09-25, whose record its
approver keeps outside the repository, read at commit `e4205cf` (`v0.0.14`). Requested as "fix all". SF1 carries the investigation; SF2 and SF3 are
configuration changes whose cause is the quoted line itself.

## 1. Symptom as captured

SF1, reproduced before any file changed. A fixture repository in the session scratchpad whose
`.atk/overrides/fix.md` is a symlink to `outside/cred.txt`, a file holding the text
`FAKE-SECRET-OUTSIDE-REPO`:

```text
$ echo '{"tool_name":"Skill","tool_input":{"skill":"atk:fix"}}' | CLAUDE_PROJECT_DIR=$S/repo node hooks/load-overrides.mjs
{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"Loaded from .atk/overrides/fix.md. This is the project's override file for atk:fix. Apply it per rule 7 of shared/team-roles.md and do not open the file again.\n\nFAKE-SECRET-OUTSIDE-REPO\n"}}
```

- Input: a `Skill` payload for `atk:fix` in a project whose override is a symlink leaving the project.
- Observed: the target file's content, labelled as the project's override.
- Expected: `{}`, as for any name the hook refuses, so the skill opens the path itself through the
  harness's file tool.
- Environment: Linux (WSL2), Node v24.18.0, branch `main`.

SF2, as read: `.github/workflows/release-please.yml:15` is `uses: googleapis/release-please-action@v5`
under `permissions: contents: write`; `.github/workflows/labeler.yml:15` is
`uses: actions/labeler@v7` under `pull-requests: write`.

SF3, as read: `.gitignore:5` is `.env`, and no line covers `.env.*`.

## 2. Root cause

SF1: the containment check compares lexical paths, and every call after it follows symlinks, so a
link inside `.atk/overrides/` passes the check and is read at its target.
`hooks/load-overrides.mjs:62-66` at `e4205cf` built the path with `resolve()`, which does not touch
the file system, then `:87` (`existsSync`, `statSync`) and `:94` (`readFileSync`) followed the link.

SF2: a tag is a movable reference, so the code a run executes is whatever the upstream maintainer's
tag points to on the day of the run.

SF3: the ignore rule names one file rather than the family of files it stands for.

Hypotheses: one, confirmed by the reproduction above. The count is 1 of 3.

## 3. Evidence

SF1, a red test: the new case added to "Common verification commands" in `CLAUDE.md`, run against the
hook as it was at `e4205cf` (`git show HEAD:hooks/load-overrides.mjs`):

```text
LEAK p: {"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"Loaded from .atk/overrides/fix.md. This
LEAK q: {"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"Loaded from .atk/overrides/fix.md. This
OK symlink inside loads
```

`p` is an override file that links out; `q` is an overrides directory that links out. Both leaked.

SF2 and SF3: the quoted lines in section 1.

## 4. Why it surfaced now

SF1: broken since it was written, in `73a33f4` (feat: a project override layer, and atk:tailor to
write it, #13). The existing payload loop only ever passed names, never a file system containing a
link, so no check exercised the path.

SF2: since each workflow was written. SF3: since `.gitignore` was written in `5558526`.

## 4b. Recorded intent, and the conflict when there is one

Nothing records that the hook should follow a link out of the directory. Searched: `docs/*.md`,
`docs/flow/`, `shared/`, `hooks/`, and `CLAUDE.md` for `symlink`, `realpath`, `lstat`. The only
mentions are in `hooks/check-profile.mjs:30,132`, which avoid symlinks for the reminder marker. The
comment above `overridePath` stated the opposite intent: "confirm the result stayed there".

Nothing records a decision to pin actions by tag or to leave `.env.*` tracked. Searched: `docs/*.md`,
`CLAUDE.md`, `.github/` for `pin`, `@v`, `dependabot`. The security record asked the owner to decide
SF2; the request "fix all" is that decision.

## 5. The change

- `hooks/load-overrides.mjs`: `overridePath` now resolves the project root with `realpathSync`,
  resolves the candidate file the same way, and returns it only when it lies under the real
  `.atk/overrides/` and is a regular file. Any failure, a missing file included, returns `null`.
  The caller loses its own `existsSync` and `statSync`, which the function now covers, and the
  imports lose `existsSync` and `resolve`. The root is resolved rather than the overrides directory
  so that an overrides directory that is itself a link out of the project is refused as well. A link
  that stays inside the directory still loads.
- `CLAUDE.md`, "Common verification commands": the three-case symlink check that is the red test
  above.
- `.github/workflows/release-please.yml:15` and `.github/workflows/labeler.yml:15`: pinned to the
  commit each tag named, with the release in a trailing comment. The SHAs were taken with
  `gh api repos/<owner>/<repo>/commits/<tag>`, and the moving major tag and the exact release tag
  agree for both: `v5` and `v5.0.0`, `v7` and `v7.0.0`.
- `.gitignore`: `.env.*`, with `!.env.example` and `!.env.sample`, the two exceptions
  `skills/git/references/secret-scan.md` already names.
- `docs/codebase-summary.md` and `docs/vi/codebase-summary.md`: the `hooks/load-overrides.mjs` row
  lists what makes the hook print an empty object, and now includes a file whose real path lies
  outside `.atk/overrides/`.

This is the smallest change for each cause: SF1 moves one comparison from lexical to real paths
inside the one function that owns it.

Tidy step: the host's clean-up capability, `/simplify` in Claude Code, reviewed the changed lines
from four angles. It changed nothing. One suggestion was skipped: resolving the overrides directory
rather than the root to save a failed system call. That form would readmit case `q`, and the root
list it assumed to be a walk is three entries at most.

## 6. Verified

| Layer | Command | What it proves |
|-------|---------|----------------|
| hooks | the captured reproduction, re-run | Prints `{}`: the symptom no longer reproduces |
| hooks | the new symlink block in `CLAUDE.md` | A link out of the file or the directory is refused, and a link inside still loads. Red on `e4205cf`, green now |
| hooks | `node --check` on both scripts, and the six-payload loop of `CLAUDE.md` | The syntax holds, and every name the hook refused before is still refused |
| hooks | a real `atk:review` payload against this repository, once with `CLAUDE_PROJECT_DIR` and once through the working directory only | The ordinary case still loads `.atk/overrides/review.md` from both roots |
| hooks | both registration files parse as JSON | Unchanged, still valid |
| CI | both workflow files parse as YAML | Syntax only; see section 7 |
| repo | the em-dash `grep` over the touched files | Prints nothing |

The fixture directories were deleted after each run.

## 7. Not verified

- Windows and macOS. `realpathSync` differs across platforms on drive-letter case and on `/private`
  prefixes, and the comparison relies on both sides coming from it. Only Linux ran.
- Codex and Cursor. The hook's output is the same on any harness, but no session of either ran.
- The two workflows on GitHub. The pinned SHAs resolve through the API, but no run has used them.
  The first push to `main` runs release-please, and the next pull request runs the labeler.
- The CI gate. This repository has no CI job that checks content, so the gate for the hooks layer
  is the `REVIEWED` rule `CONV-009` and the block in `CLAUDE.md`, run by a person.

## 8. Blast radius

- `hooks/load-overrides.mjs:95`, the only caller of `overridePath`: exercised by every check in
  section 6.
- `hooks/hooks.json:25` and `hooks/codex-hooks.json:20`, which register the script: unchanged and
  parsed; exercised on Claude Code only, through the same payloads.
- `shared/project-overrides.md:120-135`, which says that when nothing arrives the skill opens the
  file itself: still true, and it is what now happens for a refused link. No change needed.
- `docs/system-architecture.md:262` and its `docs/vi/` mirror, which describe the hook's role: still
  true. No change needed.

No reference document under `docs/api/`, `docs/features/` or `docs/screens/` describes the hook, so
no public contract moved.

## 9. Left for later

- A dependency bot for the two pinned actions (Dependabot's `github-actions` ecosystem), so that the
  SHAs are proposed for update rather than left to age. Not added: it is a new file and a new
  process, and neither was in the findings.
- History scan: the security record says git history was not scanned because no scanner is
  installed. Choosing one is the maintainer's call.
