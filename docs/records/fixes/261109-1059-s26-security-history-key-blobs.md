---
title: "Fix: atk:security history scan always exits 3 on a large file that names the private key marker in many versions"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-09
updated: 2026-11-09
ticket: docs/derived/reviews/working-tree-security-history-scan-261109-closing.md#S26
---

# Fix: atk:security history scan always exits 3 on a large file that names the private key marker in many versions

The ticket names the closing-read report of the review that raised S26. That report is local and git ignores it.

## In short

The history scan read every version of every file that had ever held a `-----BEGIN ... PRIVATE KEY-----` line, all through a single `git cat-file --batch` call. A bundle of about 1.2 MB with the marker in its code, in 1100 versions, came to more than the 1 GiB buffer that call allows. The scan stopped with exit 3 and the reason "git could not read the files that held a private key". That read also ignored `--max-seconds`.

The scan now reads only the versions that can hold a complete key block, one at a time, through a `cat-file --batch` process that stays open for the whole pass. It stops at `--max-seconds`. The comparison with `HEAD` reads the same way, one file at a time.

The JSON output is unchanged. The two existing private-key cases still give the same hits: a key replaced in place counts as a second hit, and a line that only names the marker hides nothing after it.

The whole `bash tests/verify.sh` passes on Linux, every line OK. At Lam Ngoc Khuong's request the same pull request adds a CI job, `.github/workflows/verify.yml`, that runs the script on every pull request and every push to `main`.

## 1. Symptom as captured

The reproduction is a repository built with `git fast-import`. It holds one file, `dist/bundle.js`, in 1100 versions, about 1.2 MB each (12,600 lines). Line 1 assigns the RSA BEGIN marker (`-----BEGIN ... PRIVATE KEY-----`) to a string, and the file has no END line. Each version changes one other line. Then:

```
$ node plugins/atk/skills/security/scripts/history-scan.mjs     (in that repository)
exit 3 in 9.6s
{'complete': False, 'incomplete_reason': 'git could not read the files that held a private key', 'scanned': {'refs': ['refs/heads/main'], 'commits': 1100, 'binary_skipped': 0}} [('dist/bundle.js', 1, 'private key block', 'present')]
```

- Expected: exit 0, `complete: true`, one hit for the marker line.
- Environment: Windows 11, Git Bash, Node, Python 3, on branch `fix/security-history-key-blobs` at `a765694`.
- A control run at about 0.95 MB per version (1.04 GB in all, under 1 GiB) exits 0.

## 2. Root cause

`readBlobs` read every collected blob in one `execFileSync('git', ['cat-file', '--batch'])` call, whose output may not exceed `maxBuffer: 1 << 30`. It was called on every version of every path that had ever held a BEGIN line. A file with many large versions therefore went over the buffer: git was killed, the call threw, and the scan recorded the failure as incomplete.

Where it happened:

- `plugins/atk/skills/security/scripts/history-scan.mjs:165` at `a765694`: the call.
- `plugins/atk/skills/security/scripts/lib/git-history-stream.mjs:33-47` at `a765694`: `readBlobs`.
- `plugins/atk/skills/security/scripts/lib/git-history-stream.mjs:25` at `a765694`: `maxBuffer`.

The same call ran with no deadline, so it ignored `--max-seconds`. One hypothesis was tried, and it was proved.

## 3. Evidence

The red test is the new block in `tests/verify.sh`, which follows the line `OK security history scan, ... exit 3`. Its output on the tree before the fix:

```
Traceback (most recent call last):
  File "<string>", line 23, in <module>
    assert s.returncode == 0 and out.get('complete'), 'a large file naming the key marker in many versions stopped the scan: exit %s, %s' % (s.returncode, out.get('incomplete_reason'))
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: a large file naming the key marker in many versions stopped the scan: exit 3, git could not read the files that held a private key
```

The direct reproduction in section 1 gave the same reason, and it passed once the total fell under 1 GiB.

## 4. Why it surfaced now

The read was added in `a765694`, "feat: give atk:security a git history scan that reports commit, path, line and shape, never the value (#204)". It replaced a diff-only read to close B2 and B5, and it has been broken since then. No fixture ever had a file whose versions together came to more than 1 GiB.

## 4b. Recorded intent

**Spec.** The approved design `docs/records/design/261108-2243-security-scripts.md`, section Performance, says:

> The history walk is one `git log -p -m --all` stream ..., read line by line with no whole-history buffer. ... `--max-seconds <n>` stops the walk with exit `3` rather than running unbounded.

**What the check found.** The current behaviour contradicts the design. No record says to keep it, and no test asserts it. Lam Ngoc Khuong accepted the direction of the fix in the request that started this run: read a version only when needed, read through a stream, and stop at `--max-seconds`.

## 5. The change

The scan now reads key versions one at a time, and only the versions that can hold a complete key block.

- **Reader.** `blobReader` in `lib/git-history-stream.mjs` keeps one `git cat-file --batch` process open for a whole pass. It asks for one object at a time and copies the bytes into a buffer sized to that object, so memory holds one file at a time. The read is rejected with `time limit` at the deadline. An object too large for a JavaScript string fails as a read failure instead of throwing.
- **Selection.** `lib/private-key-versions.mjs` reads a version only when one of these holds:
  - its diff adds a BEGIN or END line,
  - its diff removes a BEGIN line, or
  - its old blob, the parent version, held a complete block.

  These conditions are enough. A version that meets none of them keeps every BEGIN and END line of its parent, and every BEGIN line between them, so it holds a block only if the parent did. The request named only an added BEGIN line. Without the END and removed-BEGIN conditions, a block completed later by its END line would be missed, and a test now covers that case.
- **The scan.** `history-scan.mjs` records the old blob and the `touched` flag for each diff. It hands those versions to `readKeyVersions` with the scan's deadline. When the read stops, the reason is recorded as before: `time limit` or "git could not read the files that held a private key".
- **The `HEAD` comparison.** It reads through `blobReader` too, one file at a time and with no deadline. Under a deadline, a hit left unread would be reported as `removed`, which would be untrue.
- **Removed.** `readBlobs` and the `raw` argument of `runner` had no callers left, so they are gone.
- **Size.** `history-scan.mjs` is at exactly 200 lines.

Tidy: `/simplify` ran four cleanup agents over the touched lines. They led to these changes:

- `readBlobs` was removed, and the `HEAD` comparison was moved onto `blobReader`.
- `want` is assigned in one place.
- A `PRIVATE KEY-----` check now runs before `keyBlocks`.
- The lines of a recorded block are copied, so a hit does not keep a whole file alive.
- The marker string in the test is built once.

Some suggestions were skipped:

- moving the `half.js` and `mid.js` cases into the older fixture,
- one shared helper for spawning git with a timer,
- a comment about the walk order in `history-scan.mjs`, because the file is at its line ceiling.

Reference documents: the fix changed no public contract, because the JSON output is the same. `docs/codebase-summary.md` and `docs/vi/codebase-summary.md` were updated for both scripts, and a row was added for `private-key-versions.mjs`. The approved design already called for this behaviour; the code had not followed it until now.

## 6. Verified

Every check below was run from `tests/verify.sh` on Windows with `PYTHONUTF8=1`, unless it says Docker.

**The new block.** It starts at the comment "atk:security's history scan on a bundle".

- **Before the fix:** red at its assertion, exit 3 (section 3).
- **After the fix:** green, about 13 to 20 seconds. The 1100-version bundle exits 0 with one hit.
- **`half.js`:** the block finished by a later END line is found, at the second commit.
- **`mid.js`:** the block made by removing a line that held both markers is found, at the second commit.
- **Reader:** with a deadline already passed, it rejects with `time limit`. It reads a 1.2 MB file whole, and returns null for a name git does not find.
- **Read count:** the check of `readKeyVersions` reads `a,x,y` from six synthetic versions.
- **`--max-seconds`:** a git shim whose `cat-file --batch` sleeps for 4 seconds makes `--max-seconds 2` end with exit 3 and the reason "time limit of 2 seconds reached". It needs a POSIX shell, so it was run in Docker `node:22`, where it was green. On Windows the check is skipped and its OK line says so.

**Mutants.** Each of these turns a check red:

| Mutant | Fails |
|---|---|
| Reading every version | the read-count check |
| Giving the reader no deadline | the `--max-seconds` check, in Docker |
| Dropping the END condition | the new block |
| Dropping the removed-BEGIN condition | the new block |
| Dropping the parent-held-a-block condition | the older block, where a key replaced in place lost its second hit |

**The older history-scan block** ("on a history built here"): green, with the same 19 hits. B2 and B5 stay closed.

**The reproduction from section 1**, rerun as the new block: exit 0, `complete: true`.

**`bash tests/verify.sh`, whole, on Windows:** 71 OK lines on the fixed tree against 70 on the clean tree (`git stash`). The only extra line is the new block. Every non-OK line is the same in both trees; these are failures Windows already had.

**The standalone checks of CLAUDE.md:** clean. These are the em-dash, `ak:`, `atkx`, `fill:#` and symlink checks.

**The gate:** the Linux run of the whole script, in Docker `node:22` (Python 3.11.2, Node 22.23.4, git 2.39.5), on a copy of the working tree with file modes taken from the git index: 90 lines, every one OK, the new check's line among them with its `--max-seconds` part. From this pull request on, the `verify` job of `.github/workflows/verify.yml` runs the same script on `ubuntu-latest` and fails on any line that does not start with OK. Since 2026-11-09 it is a required check of `main`, with a repository admin able to bypass it for release-please pull requests, which no workflow runs on.

## 6b. Reviewed

**Round 1:** `docs/derived/reviews/working-tree-security-history-key-blobs-261109.md`, with 0 BLOCKING, 2 SHOULD FIX and 1 NIT.

- **`S1`, fixed.** No test pinned the version selection, or the deadline the scan passes to the reader. Both are now tested: the read-count check and the `--max-seconds` shim check.
- **`S2`, fixed.** A blob too large for a JavaScript string crashed the process with no JSON. There is now a size check against `buffer.constants.MAX_STRING_LENGTH` before the read.
- **`N1`, left.** The `HEAD`-comparison lines are dense.
- **An open question, answered.** Section 1 of this report quoted the marker line whole. It no longer does.

**Round 2:** `docs/derived/reviews/working-tree-security-history-key-blobs-261109-r2.md`, with 0 BLOCKING, 0 SHOULD FIX and 4 NIT. `S1` and `S2` are confirmed closed. Nothing was fixed after round 2.

- **`N1`, left.** As in round 1.
- **`N2`, left.** The size check has no test.
- **`N3`, fixed after the loop, at Lam Ngoc Khuong's word.** The generated JavaScript in the new block named a variable `key`, which the secret scan reads as a secret-named literal, so the staged scan of `atk:git` would have flagged two lines of `tests/verify.sh`. The variable is now `blk`. The loop leaves a `NIT` after round 2 alone; this one was fixed because the owner of the change asked for it, and the Linux run above came after it.
- **`N4`, left.** `body =Buffer` is missing a space.

There was no closing read: round 2 fixed nothing, and the `N3` rename is a test-only variable name. `atk:verify` was not offered, because this repository ships content and has nothing to run (the Verify section of `.atk/profile.md`).

## 7. Not verified

- **The `S2` size check.** No fixture exercises it, because that would need a text blob over about 512 MB with `core.bigFileThreshold` raised.
- **Merge histories.** The new selection has not been run against a history with merges. Its correctness there rests on the walk going parents first; see section 9.

## 8. Blast radius

| Caller | Exercised |
|---|---|
| `history-scan.mjs:166-172`, the key read through `readKeyVersions` and `blobReader` | Yes: both history blocks, the mutants, and the shim check in Docker. |
| `history-scan.mjs:180-186`, the `HEAD` comparison now through `blobReader` | Yes: every `at_head` value in both history blocks, including `present`, `removed` and `path-gone`. |
| `history-scan.mjs:106`, `run` with input for sizing the dumps (`runner` lost its `raw` argument) | Yes: the `data/d.sql` and `data2/d.sql` hits in the older block. |
| `readBlobs` | Removed. A grep of `plugins/` and `tests/` finds no caller. |
| `keyBlocks` in `secret-shapes.mjs` | Unchanged. It is now called from `private-key-versions.mjs`. |

## 9. Left for later

- A merge fixture for the private-key pass. The question raised in round 1, that `keyBlocks` (unchanged here) treats code between a BEGIN line and a later END line as a key block, so a bundle naming both markers is read in every version and each edit between them is a new hit, was set aside by Lam Ngoc Khuong on 2026-11-09. Whether a version is read depends on whether its parent version, the old blob in the diff, held a block. That only works because `walk` passes `--reverse --topo-order`, so parents come first. The new fixtures are linear histories, so a merge case would pin that order down. A comment in `history-scan.mjs` naming the dependence was skipped because the file is at its 200-line ceiling; `lib/private-key-versions.mjs` states it.
- Moving the `CONV` rows that a check of `tests/verify.sh` holds from `REVIEWED` to `ENFORCED`, now that the `verify` job is required. That reclassification is `atk:convention`'s, and Lam Ngoc Khuong approves it.
- The new fixture takes about 13 to 20 seconds on Windows, because it builds 1100 versions of 1.2 MB. It reproduces S26 itself. Which versions are read is now pinned separately by a fast check of `readKeyVersions`, so the large fixture could be dropped later if its cost matters more than the reproduction.
