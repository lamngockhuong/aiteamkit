---
title: "Fix: every Codex session opened on a failed atk startup hook"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, Tech Lead for the hooks layer)
created: 2026-09-22
updated: 2026-09-22
ticket: none
---

# Fix: every Codex session opened on a failed atk startup hook

Reported in `docs/derived/feedback/atk-plugin-hooks-260922.md` of another project, against atk 0.0.6
installed in Codex.

## 1. Symptom as captured

From the report, verbatim:

```text
Hook failed
hook exited with code 1
```

```text
Error: Cannot find module '<workspace>/${CLAUDE_PLUGIN_ROOT}/hooks/check-profile.mjs'
code: 'MODULE_NOT_FOUND'
Node.js v24.18.0
exit=1
```

Steps: install and enable the atk plugin in Codex, start a session with hooks enabled, and the
plugin's `SessionStart` hook runs with `${CLAUDE_PLUGIN_ROOT}` still literal.

Expected: the hook resolves its own path and completes. Observed: Node resolves the literal token
against the workspace and exits 1, and the session opens on a failed startup hook. The reminder never
runs, and the reporter notes the `PreToolUse` entry carries the same shape.

Environment: atk 0.0.6, Codex CLI, Node v24.18.0. Reproduced here against codex-cli 0.155.1 on
Linux, in an isolated `CODEX_HOME`.

The report's own diagnosis, that Codex wants `${PLUGIN_ROOT}` where Claude Code wants
`${CLAUDE_PLUGIN_ROOT}`, is recorded here as it was given. It is not what the measurement found; see
section 3.

## 2. Root cause

Codex resolves a plugin root only inside a hook's `command` string and never inside its `args` array,
so the exec-form entry Claude Code requires reaches Node as a literal path.

- `hooks/hooks.json:11` and `hooks/hooks.json:28` are the two entries, each `"command": "node"` with
  the script path in `args`.
- `.codex-plugin/plugin.json` named no `hooks` file, so Codex fell back to its default,
  `hooks/hooks.json` in the plugin root, which is the same file Claude Code reads.

The variable name is not the mechanism. Codex sets `PLUGIN_ROOT`, `PLUGIN_DATA`, `CLAUDE_PLUGIN_ROOT`
and `CLAUDE_PLUGIN_DATA` in the hook's environment, and substitutes `${PLUGIN_ROOT}` and
`${CLAUDE_PLUGIN_ROOT}` in `command`. Both names fail in `args`, and both work in `command`.

## 3. Evidence

A probe plugin installed in an isolated `CODEX_HOME` against codex-cli 0.155.1, registering the same
`SessionStart` hook four ways at once. The script appends its label and environment to a file when it
runs, so a missing label is a hook that never started.

Round 1, exec form against string form:

| registration | result |
|---|---|
| `"command": "node"`, `args: ["${CLAUDE_PLUGIN_ROOT}/hooks/probe.mjs"]` | `hook: SessionStart Failed`, script never ran |
| `"command": "node"`, `args: ["${PLUGIN_ROOT}/hooks/probe.mjs"]` | `hook: SessionStart Failed`, script never ran |
| `"command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/probe.mjs\" string-claude"` | ran |
| `"command": "node \"${PLUGIN_ROOT}/hooks/probe.mjs\" string-plugin"` | ran |

The two that ran recorded all four variables as set, and `cwd` as the workspace root, not the plugin
root. `CLAUDE_PROJECT_DIR` was absent.

Round 2, single quotes, which stop a shell from expanding anything, so only a substitution Codex
performs itself can survive:

| registration | result |
|---|---|
| `node '${PLUGIN_ROOT}/hooks/probe.mjs' sq-brace-plugin` | ran |
| `node '${CLAUDE_PLUGIN_ROOT}/hooks/probe.mjs' sq-brace-claude` | ran |
| `node '$PLUGIN_ROOT/hooks/probe.mjs' sq-bare-plugin` | `Failed` |
| `node "${PLUGIN_ROOT}/hooks/probe.mjs" dq-brace-plugin` | ran |

So the substitution is Codex's own, textual, `${NAME}` only, and scoped to `command`. The bare
`$PLUGIN_ROOT` form fails, which also rules out the alternative explanation that a login shell
expands the variable.

## 4. Why it surfaced now

Broken since the hooks were written. `hooks/hooks.json` has only ever held exec form, and
`.codex-plugin/plugin.json` has never named a hooks file, so every Codex install since the hooks
shipped has read the Claude Code file. Nothing in this repository exercised Codex, which is why it
took an install in another project to surface it.

## 4b. Recorded intent, and the conflict when there is one

`docs/system-architecture.md`, under "Why the hook is Node and not a shell script", recorded the
limit: "Claude Code only. Codex and Cursor can package hooks too, but each uses its own event names
and output contract, and neither could be tested here [...] The other two wrappers wait until someone
can verify them against a running harness." `docs/project-roadmap.md` left the matching open question,
whether the reminder is worth maintaining three times.

The record assumed Codex would simply not run these hooks. It does, because the default location is
the same filename, so the accepted limit was costing a visible failure rather than a missing
reminder. The record's own precondition, verification against a running harness, is now met for
Codex: codex-cli 0.155.1, measured above. Cursor remains untested and unchanged.

The choice between silencing Codex and giving it a working registration is the maintainer's, and was
put to Lam Ngoc Khuong during the run. Decision: give Codex its own registration file.

## 5. The change

`hooks/codex-hooks.json` registers the same two scripts for Codex with each path inside a string
`command`, carrying `${PLUGIN_ROOT}` because that is Codex's own name for it, and
`.codex-plugin/plugin.json` gains `"hooks": "./hooks/codex-hooks.json"`, which both points Codex at
the new file and stops it reading the Claude Code one. `hooks/hooks.json` is untouched, so Claude
Code keeps the exec form that CONV-009 requires and Windows needs.

Neither script changed behaviour. The comment blocks in `hooks/check-profile.mjs` and
`hooks/load-overrides.mjs` were corrected where they said Codex has no wrapper, and the same
correction was carried into `CLAUDE.md`, `shared/project-overrides.md`, both `system-architecture.md`,
both `codebase-summary.md`, and both `project-roadmap.md`. CONV-009 and the verification block in
`CLAUDE.md` now check both registration files: exec form with `args` for Claude Code, a string
`command` carrying `${PLUGIN_ROOT}` and no `args` for Codex, plus the manifest key that reaches it.

Tidy step: done by hand over the lines the fix touched, since the change is two registration files
and three comment blocks. One comment paragraph in `hooks/load-overrides.mjs` was rewrapped; nothing
else changed. The host's clean-up capability was not invoked, because its pass over a diff this size
is four parallel agents over one JSON file.

## 6. Verified

`.atk/profile.md` names `CLAUDE.md`, section "Common verification commands", as this repository's
test command. All of it was run.

| Layer | Command | What the pass proves |
|---|---|---|
| hooks | the registration check, extended in this change | `hooks/hooks.json` is still exec form; `hooks/codex-hooks.json` carries its path in `command`, uses `${PLUGIN_ROOT}`, and stays Node; the Codex manifest points at it |
| hooks | `node --check` on both scripts | the comment edits left valid Node |
| hooks | the four-case profile walk, the plain-directory case, and the six `load-overrides` payloads | behaviour unchanged by the comment edits: still silent where a profile exists, still `{}` for another tool, another namespace, a bare name, a path separator, and malformed input |
| content, docs | the five manifests parse, the skill-name loop, the evals loop, the version agreement, the `docs/vi/` mirror diff, the em-dash grep, the foreign-kit grep, the diagram-fill grep | the change left every convention check passing |

Captured reproduction, re-run against codex-cli 0.155.1 with the fixed kit installed from this
worktree into an isolated `CODEX_HOME`:

- git repository with no `.atk/profile.md`: `hook: SessionStart Completed`, no failure, and the
  session transcript carries `atk: this project has no .atk/profile.md, so the atk skills that change
  code will stop rather than guess this project's commands. Run /atk:init to create it.`
- git repository with a profile: `hook: SessionStart Completed` and nothing printed; no marker
  written, which is how the script records that it stayed silent.
- The marker landed in `plugins/data/atk-atk/profile-reminder/`, the directory Codex supplies as
  `CLAUDE_PLUGIN_DATA`, never in the repository.
- Re-run once more after the tidy step: same result, fresh marker for the fresh repository.

The gate: this repository has no CI that runs anything. `.github/workflows/` carries release-please
only, so no job judges the hooks layer and the local block above is the whole of it. Every rule it
covers is `REVIEWED`, which means a person has to read the diff; nothing here was judged by a tool
that also gates the branch.

## 7. Not verified

- **Codex on Windows and macOS.** Measured on Linux only. The substitution is Codex's own rather than
  a shell's, which is what makes the string form safe to use, but no Windows Codex was available to
  confirm that the resulting `node "<path>"` spawns the same way there.
- **The Codex `PreToolUse` entry.** Registered and syntactically accepted, never observed firing.
  Codex's tool name for a skill invocation was not confirmed against a running session, so matcher
  `Skill` may never match there. Harmless by design: the loader only saves a read, and every skill
  opens its own override file when nothing put it in front of it. `shared/project-overrides.md` and
  the script's own comment now say so.
- **Cursor.** Unchanged and untested. It reads neither file.
- **Codex hook trust.** The runs above used `--dangerously-bypass-hook-trust` in a throwaway
  `CODEX_HOME`, because the trust prompt cannot be answered non-interactively. A real install shows
  the trust prompt first; that path was not exercised.
- **atk 0.0.6 as installed in the reporter's Codex.** Not re-run. The failure was reproduced from the
  same file shape in the probe, not from their installed copy.

## 8. Blast radius

The changed files are read by harnesses, not by other code in this repository.

- `hooks/hooks.json` - unchanged. Claude Code's path is what the `node --check` and behaviour cases
  above exercise, and this session itself runs under it.
- `hooks/codex-hooks.json` - new, read by Codex only. Exercised end to end above.
- `.codex-plugin/plugin.json` - read by Codex when listing and installing the plugin. Exercised: the
  install in the isolated home parsed it and followed the new key. The `interface{}` block and the
  version field were not touched.
- `hooks/check-profile.mjs`, `hooks/load-overrides.mjs` - comments only. Both exercised above.
- `CLAUDE.md`, `shared/project-overrides.md`, `docs/**` - prose. `shared/project-overrides.md` is
  cited by every skill through rule 7 of `shared/team-roles.md`; the edit corrects which harnesses
  preload the file and leaves the marker sentence, which the hook and the skills must agree on, word
  for word unchanged.

No public contract moved, so no reference document owed anything per `shared/spec-docs.md`. The
convention rule CONV-009 did move, and `CLAUDE.md` carries both halves of it.

## 9. Left for later

- The Cursor registration. Same shape of question, still unanswerable here: no Cursor install to
  measure against. `docs/project-roadmap.md` keeps it as the open question.
- Codex hook trust on a real install. Worth one manual run to confirm the prompt names the atk hooks
  and that accepting it persists, since a user who declines gets no reminder and no error, which
  looks identical to the kit not shipping one.
