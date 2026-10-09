---
title: "Fix: a plugin hook could still run code the trigger gate never read or showed"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-09
updated: 2026-10-09
ticket: "#111; docs/derived/reviews/111-261009-0946.md#B9, #B10, #B11, #B12, #S28, #S29, #S30, #S31, #S32, #S33, #S34, #S35, #S36, #S37, #S38"
---

# Fix: a plugin hook could still run code the trigger gate never read or showed

## In short

The review of PR #111 found four ways a plugin's hook could start code that the person was never
shown, while the dry run still passed:

- naming a repository file by its bare name;
- loading a Markdown file by a path built at run time;
- writing an absolute path with two leading slashes;
- gluing a path to an option, as in `perl -I/path`.

It also found eleven smaller gaps in the same gate and runner. All fifteen are fixed here; `S13`
stays open by the maintainer's earlier decision.

**The gate's command reader:**

- It now treats any word that names an existing file outside the plugin as a refusal.
- It reads `//x` and `-I/x` as paths.
- It refuses `npm run`, `make` and the like unless the line first moves into the plugin.
- It resolves relative paths against the plugin too.
- It refuses a manifest that does not parse.

**What the person is shown:** the consent now covers every text file of a plugin that starts
processes, except each skill's own `SKILL.md`.

**The runner:**

- It rewrites every seed link to its shortest form.
- It no longer passes the parent session's `CLAUDE_CODE_*` messaging variables to the plugin.
- It ends in one JSON summary when a copy fails.

Lam Ngoc Khuong approves. One trade-off is theirs to accept, and section 7 states it: B10 makes the
consent for an `atk` skill show 114 files, 13,354 lines, where it showed 39 files, 2,050 lines.

## 1. Symptom as captured

The review's cases were rebuilt as one probe that calls `evaluateHooks(plugin, '', repo)` on a
scratch repository. These are the results on head `17652e0`, before any change. `want` is what the
review says the gate should do.

```
B9 bare: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json] want unreadable
B9 npm: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json] want unreadable
B10 md: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/h.cjs, hooks/hooks.json] want lib/notes.md shown
B11 //: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json] want unreadable
B11 // (exists): gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json] want unreadable
B12 -I: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json] want unreadable
S28: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/a.mjs, hooks/h.mjs, hooks/hooks.json] want network
S29: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json, hooks/run.txt] want network
S30: gate=0 creds=0 fails=[] shown=[.claude-plugin/plugin.json, hooks/hooks.json, lib/x.mjs] want network
S31: gate=0 creds=2 fails=[password-assignment:hooks/h.mjs, password-assignment:hooks/h.mjs] shown=[...] want creds=1
S32: gate=0 creds=0 fails=[] shown=[] want unreadable
S35 uv tool run x: gate=0 ... want network
S35 npm x x: gate=0 ... want network
S35 npm init pkg: gate=0 ... want network
S35 pnpm create pkg: gate=0 ... want network
S35 foo --cmd=npx x: gate=0 ... want network
```

The probe could not show S33, S34 and S38, because they happen inside the runner. They were captured
by the runner assertions in section 3, which fail on the old `trigger-run.mjs`.

## 2. Root cause, per defect

All `static-check.mjs` lines below are in `evaluateHooks`, at head `17652e0`.

- **B9.** `static-check.mjs:891` (`if (!slash || (!exists && !explicit)) continue;`) treated a word
  with no slash as a word, even when it named an existing file outside the plugin. A
  working-directory script such as `npm run build` names no file at all, so no rule saw it.
- **B10.** `static-check.mjs:968-973` showed a Markdown file only when another shown file contained
  its exact path. Meanwhile `codeDigest` covered the file, so `--read` accepted consent to code that
  was never shown.
- **B11.** `static-check.mjs:880`: the `explicit` regex `[\\/](?![\\/])` rejected a leading `//`, and
  `:883` then skipped every absolute token that was not explicit.
- **B12.** A token such as `-I/tmp/out` was resolved whole against the session directory. It found
  nothing there and was dropped as a word.
- **S28.** Files under `hooks/` were selected only by their real place, so a link under `hooks/` to
  `lib/` was never scanned.
- **S29.** A file under `hooks/` entered the gate as non-runnable, and a command naming it could not
  upgrade it, because it was already in `gated`.
- **S30.** A relative token was resolved only against the session directory, never against the
  plugin root a line may `cd` into.
- **S31.** The walk counted credentials in every text file, and `gateItems` counted them again for
  files under `hooks/`.
- **S32.** `JSON.parse` of `.claude-plugin/plugin.json` failing was treated as "no manifest".
- **S33.** `trigger-run.mjs:246`: `ENV_KEEP` let every `CLAUDE_CODE_*` variable through.
- **S34.** `trigger-run.mjs:213` rewrote only absolute links. A relative link with surplus `..` still
  reached the original from the seed under `/tmp`.
- **S35.** `static-check.mjs:422`: `PACKAGE_RUNNER` lacked `uv tool run`, `npm x`, and `create` or
  `init <pkg>`, and did not accept `=` before a runner name.
- **S36.** Four docs said the gate reads "every file they run" and that "what runs is what was read".
  Both were false while B9 to B12 stood.
- **S37.** Ten gate behaviours had no assertion, so removing any one of them left the block green.
- **S38.** `copyFileSync` and `cpSync` in `trigger-run.mjs` were not guarded, and `main()` had no
  `catch`, so an `EACCES` printed a stack trace instead of the JSON summary.

## 3. Evidence

**Reproduction.** Section 1 is the reproduction. The same probe on the fixed scripts gives `gate=1`
for every B and S case, `creds=1` for S31, and `lib/notes.md` in `shown` for B10. That is 15 of 15
failing cases plus the B10 listing:

```
B9 bare: gate=1 creds=0 fails=[unreadable:evil.mjs]
B9 npm: gate=1 creds=0 fails=[unreadable:hooks/hooks.json]
B10 md: gate=0 shown=[.claude-plugin/plugin.json, hooks/h.cjs, hooks/hooks.json, lib/notes.md]
B11 //: gate=1 fails=[unreadable://tmp/probe-hdV0BT/out.mjs]
B12 -I: gate=1 fails=[unreadable:-I/tmp/probe-hdV0BT]
S28: gate=1 fails=[network:hooks/a.mjs]
S29: gate=1 fails=[network:hooks/run.txt]
S30: gate=1 fails=[network:lib/x.mjs]
S31: gate=0 creds=1
S32: gate=1 fails=[unreadable:.claude-plugin/plugin.json]
S35 (all five): gate=1 fails=[network:hook commands]
```

**Red tests.** These are the new assertions in the `CLAUDE.md` verification block, run against the
old scripts:

- With the old `static-check.mjs`:
  `AssertionError: a Markdown file a process could load was not listed, or a SKILL.md was`
- With the old `trigger-run.mjs`:
  `AssertionError: a session saw an environment variable it does not need`
- With only the seed-link rewrite reverted:
  `AssertionError: a link with surplus .. in the seed still reaches the original: /tmp/tmpev2q4geo/repo/real.txt`
- With only the copy guard and `main().catch` reverted:
  `json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)`, which is the stack trace
  with empty stdout that S38 describes.

## 4. Why it surfaced now

- **B10, S28 and S31 came with `3481c00`**, *fix(skill-eval): start no plugin process whose code the
  person has not read*. That commit added consent by digest over Markdown it did not show, switched
  `hooks/` selection to real paths, and added the walk's credential scan beside `gateItems`.
- **B11 also came with `3481c00`.** That commit added the `(?![\\/])` lookahead to a check that had
  tested `isAbsolute` alone.
- **B9, B12, S30, S32, S33, S34, S35 and S38 have been broken since the hook gate was written, in
  `1e28a61` (#105).** Before PR #111, nothing promised that every file a process runs is read or
  shown, so these did not break a stated contract until that PR made the promise.

## 4b. Recorded intent

The plan `plans/261009-0438-skill-eval-plugin-code-consent/plan.md` and its acceptance criterion A3
call for refusing a command that names a file outside the plugin. All fifteen fixes move the code
toward that recorded intent. Nothing contradicts them.

One recorded decision was respected: `S13`, a plugin outside the repository that registers no
process and still loads from where it lies. The maintainer kept that behaviour on the PR thread, so
this run leaves it untouched.

## 5. The change

**`static-check.mjs`, the command reader in `evaluateHooks`:**

- A path glued to a one-letter option is stripped to the path.
- Every absolute token, `//x` included, is explicit.
- A relative token is resolved against the session directory and the plugin root. When the line
  first enters the plugin through `cd`, `--prefix`, `-C`, `--cwd`, `--dir` or a server `cwd`, it is
  resolved against the plugin root only.
- Any token that names an existing file outside the plugin, bare or not, is `unreadable`.
- A new `WORKDIR_RUNNER` list refuses `npm|pnpm|yarn|bun run|test|start|...`, `make`, `just`, `rake`,
  `deno task` and `python -m`, unless the line enters the plugin.
- `PACKAGE_RUNNER` gains the S35 forms.
- A manifest that is present and unparsable is `unreadable`.
- Files under `hooks/` are selected by any path that reaches them.
- A file a command names is gated as runnable whatever its name.
- `gateItems` skips its credential scan for plugins, since the walk already covers every text file.
- `codeFiles` is every text file except each `skills/<name>/SKILL.md`.
- Link entries in the digest record where a link leads, not how it is written. This keeps the digest
  stable when the seed rewrites links (S34), and a re-pointed link still changes it.

**`trigger-run.mjs`:**

- Every seed link becomes `relative(dirname(to), join(dest, r))`.
- `ENV_KEEP` keeps only the named `CLAUDE_CODE_*` variables a session reads.
- Copy failures go through `copyOrStop` to `fail('no-seed', ...)`.
- `main().catch` sends any other throw to `fail('error', ...)`.

**Docs:** the four docs now say what the gate reads and what is shown (S36). `CLAUDE.md` gains one
assertion per fix and per S37 behaviour.

This is wider than one line per finding, because the approver chose to land every `BLOCKING` and
`SHOULD FIX` finding except S13 in this PR. Each finding's change still stays inside the function
that held its cause.

**Tidy step.** Claude Code's `/simplify` ran four reviewers over the touched lines of the two
scripts. It made these changes:

- extracted a shared `COMMAND_START` and `PACKAGE_MANAGERS` for the two runner regexes, and merged
  the second `RegExp` into one;
- hoisted the `cd`-into-plugin pattern out of the per-command loop;
- added an `inside(p)` helper for the repeated containment test;
- folded the `isFile` temporary into one line;
- removed a `creds += found.creds` line that could only add 0;
- extracted `copyOrStop` for the three copy guards.

It skipped five suggestions:

- a memo for `lstat`, since a plugin has a handful of command lines;
- the manifest-read shortcut, which would change behaviour on `EACCES`;
- moving credentials out of `gateItems`, which touches code beyond the fix;
- the narrower glued-option regex, which would drop `-Ilib/x`;
- a `Set` for `ENV_KEEP`.

After the tidy step, the probe and the whole verification block were re-run and are unchanged.

## 6. Verified

- **The `CLAUDE.md` "Common verification commands" block**, which is the Test command in
  `.atk/profile.md`, ran in full. It produced 65 `OK` lines and no other output, both before and
  after the tidy step. This covers the new tuples for B9, B11, B12, S29, S30, S32, S35 (five forms)
  and S37 items 2, 4, 7, 8, 9 and 10. It covers dedicated assertions for B10, S28, S31, the
  `cd`-into-plugin pass case, and S37 items 1, 3 and 5. In the runner block it covers S33, S34, S37
  item 6 (copy failure as `gate-failed`) and S38 (an unreadable seed file ends in `no-seed`, skipped
  when run as root). The rest of the block covers every behaviour that existed before.
- **The em-dash check and the `ak:` check**, from the sections of `CLAUDE.md` that hold them, print
  nothing.
- **A real plugin with a hook:** `trigger-run.mjs plugins/atk/skills/review --dry-run` returns
  `dry-run`, so `atk`'s own hooks pass the new rules.
- **The captured reproduction**, re-run after the fix and again after the tidy step, no longer
  reproduces. Section 3 has the output.

## 7. Not verified

- **No live `claude -p` session was run.** The runner's sessions were exercised against the
  stand-in `claude` of the verification block. So the review's two open questions remain unanswered:
  - whether Claude Code loads a manifest that starts with a byte order mark (S32);
  - whether a child session holding the messaging token can post into its parent (S33).

  Both fixes fail closed whatever the answers are, so the answers decide only how serious the
  original findings were.
- **The variables kept under `CLAUDE_CODE_` are a list written from documentation**, not taken from
  Claude Code's source. A session that needs one more variable would miss it. Bedrock or Vertex users
  are the likeliest to notice.
- **B10's cost to the person reading.** For an `atk` skill, `codeFiles` grew from 39 files, 2,050
  lines, to 114 files, 13,354 lines, all of which the agent must show before the yes. This was the
  review's minimum form, and the approver has to accept the trade-off.
- **The runner lists are name-based.** A working-directory script runner or a package runner not on
  the lists still passes the pattern gate. Only being shown its files guards against it, and a
  working-directory script outside the plugin is not shown. `references/static-checks.md` already
  says that a list misses what nobody wrote into it.
- **Windows was not exercised**, including UNC paths for B11, which `isAbsolute` now treats as
  explicit.

## 8. Blast radius

- `evaluateHooks` is called from `trigger-run.mjs:425` (the first check) and `:508` (the re-check of
  each copy). Both were exercised by the runner block.
- `gateItems` is also called by `evaluate()` (`static-check.mjs:634`) with the credential scan still
  on. The fixtures in `tests/skill-eval-fixtures/` exercised that path and still give their expected
  verdicts.
- `PACKAGE_RUNNER` is read only by `gateItems` when `packageRunners` is set, that is from
  `evaluateHooks`. Exercised.
- `seedCopy`, `childEnv` and `loading` are each called once, from `main()`. Exercised by the runner
  block.
- No public contract changed outside `atkx:skill-eval`. Its reference documents
  `references/static-checks.md` and `references/trigger-mode.md` moved with the code, and so did
  `docs/trigger-eval-measurement.md` with its mirror. `docs/skills-overview.md:722` was re-read and
  is now accurate, so it was left unchanged.

## 9. Left for later

- **The NIT findings `N12` to `N25`** of `docs/derived/reviews/111-261009-0946.md` are not done. N25,
  the stray `CLAUDE_CONFIG_DIR` temporary directory, now applies to the `yes` helper as well.
- **`references/static-checks.md` is at 306 lines.** No rule caps a reference, but the review's
  convention gap about it still stands.
- **A closed rule for working-directory runners** would need an allowlist of system interpreters
  instead of a list of runners. That is a separate change.
- **The review's convention gap is still open:** no recorded rule yet says that a new gate behaviour
  needs a case in the verification block.
