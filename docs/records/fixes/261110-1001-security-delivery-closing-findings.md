---
title: "Fix: atk:security --delivery misses, misreports or prints what the closing read of #210 named, and pyName leaves - beside . or _"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-10
updated: 2026-11-10
ticket: docs/derived/reviews/feat-security-delivery-readiness-closing-261110-0400.md#S19, #S20, #S21, #S25, #S29, #S31, #S32, #S33, #S34, #S35, #N28, #N29, #N30, #N31; https://github.com/lamngockhuong/aiteamkit/issues/209
---

# Fix: atk:security --delivery misses, misreports or prints what the closing read of #210 named, and pyName leaves - beside . or _

The ticket names the closing-read report of the review of #210, which is local and git ignores, and
issue #209, whose last paragraph is the `pyName` defect. This change refers to #209 and does not
close it: the edit-distance threshold of that issue waits on the Tech Lead.

## In short

The closing read of `atk:security --delivery` (#210) left ten SHOULD FIX and four NIT findings, and
issue #209 one more defect in the supply-chain scan. Each of them is a case where the history scan
missed a value a client would receive, said the wrong thing about one, or printed a full host:

- A lone carriage return in a commit message could start a line that passed for the walk's header,
  and dropped what followed it, in messages and in file content alike (S31).
- A secret at a path that names a host had no row in the detail file the owner works from (S25).
- A host or an email put in single quotes at `HEAD` was reported as removed (S33).
- A secret in a tag message was reported at the tagged commit with nothing saying it sits in the
  tag (S32).
- A password holding `/`, `?`, `#` or `@` left a fragment read as an email, a URL in minified JSON
  swallowed the address after it, and `sip:` or `email:` addresses were taken for logins (S20, S34,
  N31).
- A path segment starting with a dot printed a confirmed-domain host whole (S35).
- `--domains` printed `build01.lab` and similar machine names whole (S19), and a ref `fix/nas.home`
  too (N29).
- `if self.local:` and `x = obj.local` were reported as hosts (S21).
- `pyName` merged `.` and `_` but not `-` beside them, so `Flask.-_Login` was never compared with
  `flask-login` (#209).

Each is fixed at the line the review named, with a fixture in `tests/verify.sh` that fails on `main`
and passes now; the inputs S29 listed as untested have fixtures too. The JSON gains one field,
`from`, on a hit read from a message. Two new files in `scripts/lib/` keep `host-classes.mjs` under
200 lines: the login removal, and the list of public labels.

The two review rounds raised four more SHOULD FIX, all fixed here: a URL whose user name is an email
left its password read as an email (S38), two letters that are no country code passed as one (S36),
`.env.local` printed as a host (S37), and a per-machine env file printed its machine (S39). The
closing read found two more in the last of those fixes: a dot-led key or certificate named for a
machine still printed the machine (S40), and `.env.production.local` and its kin were shown as
`.env.<redacted: host>` (S41). Lam Ngoc Khuong asked for both to be fixed on this branch; they were,
with fixtures, after the loop's last review, so no review has read them.

`bash tests/verify.sh` passes whole on Linux, 99 of 99 lines. Lam Ngoc Khuong approves the change and
decides the items in section 9.

## After the last round

One fix was made after the second review call, and it had the closing read:

- **S39**, `plugins/atk/skills/security/scripts/lib/host-classes.mjs:186-191`, a code change in the
  replace callback of the suffix-name regex of `pathHosts()`: a dot-led segment rule 9 names keeps its
  stem, and what follows the stem is redacted when it holds a dot. The closing read confirmed S39
  closed for the shape it named and found two SHOULD FIX in the same lines:
  - **S40**: the stem was the first label of the matched name, so `.db01.lan.pem` and
    `certs/.build04.corp.key` printed the machine name on standard output, as `main` does.
  - **S41**: `.env.production.local`, `.env.development.local` and `.env.test.local` were shown as
    `.env.<redacted: host>`, which reopened part of S37.

Closing read: `docs/derived/reviews/fix-security-delivery-closing-findings-261110-closing.md`,
0 BLOCKING, 2 SHOULD FIX, 0 NIT.

After it, at Lam Ngoc Khuong's request, both were fixed in the same callback,
`lib/host-classes.mjs:184-192`, with a fixture each, red first: a stem is kept only when it is itself
a file rule 9 names (`.env`), so `.db01.lan.pem` prints `.<redacted: host>.pem`; and the dotenv mode
files `.env.{development,production,test,staging}.local` are shown whole, a fixed list of four, which
is the narrowest form that tells them from `.env.db01.lan`. The loop's two rounds and its closing read
were spent, so no review has read these two fixes; section 7 says so.

## 1. Symptom as captured

The findings were confirmed on `main` at `97020b2` (after #211, which changed one line of a fix
record) by re-reading each line the closing read cites; every one still holds there. The captured
failure is the new fixture block of `tests/verify.sh`, which collects every failed check by name, run
alone on `main` with the fixture in place:

```
AssertionError: failed: S31 a message line set a commit field
 S31 a private address after a carriage return in a message was missed
 S31 a host after a carriage return in a message was missed
 S31 what follows a carriage return in a file was dropped
 S25 no detail row for a secret at a path naming a host
 S33 a value in single quotes at HEAD read as removed
 S32 a secret in a commit message is not said to come from the message
 S32 a secret in a tag message is not said to come from the tag, redacted
 S32 a host in a tag message is not said to come from the tag
 S20 a password fragment read as an address, or a host missed
 S20 a password fragment reached the detail file
 S34 a pathless URL swallowed the address after it
 N31 a sip: or email: address taken for a login
 S35 a segment starting with a dot was not redacted
 S21 a property after a control word or a receiver taken for a host
 a local part, a full host or a value reached the --identities output
 S19 a two-label machine name under an unlisted suffix was not printed by class
 a local part, a machine name or a full host reached the --domains output
 a local part, a full host or a value reached the output with an unborn HEAD
 a local part, a full host or a value reached the output with HEAD unlisted
```

and the `pyName` check added to the supply-chain block:

```
AssertionError: pyName: []
```

expected `['reqe-sts', 'flask-login']`. Environment: Windows 11, Git Bash, git 2.55.0, Node,
Python 3.14, `PYTHONUTF8=1`, branch `fix/security-delivery-closing-findings`.

## 2. Root cause, per finding

Each cause is the one the closing read gave with its `file:line`, re-read on `main`; no hypothesis
was needed, so the count is 0 for every finding.

- **S31.** `stream()` read git's output with `readline`, which ends a line at a lone `\r` as well as
  at `\n`, while `%w` indents a message only after `\n` (`lib/git-history-stream.mjs:93`). A segment
  after a lone `\r` became a line of its own: `#commit <host>` passed for the header, the identity
  pass cut its first character with `l.slice(1)` (`lib/identity-hosts.mjs:87`), and the content pass
  dropped it for not starting with `+` (`history-scan.mjs:165`).
- **S25.** `writeDetail` kept only hits with a full value (`lib/identity-hosts.mjs:159`), so the
  secret and credential-file hits `finishHits` passed it for their redacted path (`:55`) were
  dropped, against what `:42-43` and `references/delivery-readiness.md:106-107` say.
- **S33.** `holds()` refused a match after any character of its before-class, `'` included, for an
  email and a host alike (`lib/head-at-hit-compare.mjs:14`).
- **S32.** A message hit's `shape` was replaced by the secret's labels, and a tag message's `commit`
  is `%(*objectname)` (`lib/identity-hosts.mjs:80`, `:96`), so nothing named the tag.
- **S20, S34, N31.** `USERINFO` stopped a login at the first `/`, `?` or `#` and ran across quotes
  (`lib/host-classes.mjs:32`); `DSN` stopped a password at the first `@` and took any `key:value@`
  form for a login (`:33`).
- **S35.** Both lookbehinds of `pathHosts` refused a name after `.` (`lib/host-classes.mjs:168`,
  `:180`), and the leading dot cannot start the name.
- **S19.** `proposable()` printed a two-label name whole unless its suffix was on a fixed list
  (`lib/host-classes.mjs:35`, `:96-98`).
- **N29.** The `--domains` fold sent only names of three labels or more through `proposable()`
  (`lib/identity-hosts.mjs:49`).
- **S21.** `KEYWORD` lacked the control words, and the spaced-`=` branch took any name
  (`lib/host-classes.mjs:108`, `:116`).
- **N28.** The header of `history-scan.mjs:17-20` left out the `null` a message secret's path and
  line, and an uncompared credential file's `at_head`, can hold.
- **N30.** The fallback for a path the history scan did not print redacted less than the scan does
  (`references/delivery-readiness.md:43-45`).
- **pyName (#209).** `/[._]+/` leaves `-` out of the run it collapses
  (`lib/package-candidates.mjs:70`), against "each run of `.`, `_` and `-` as one `-`" in
  `references/supply-chain.md:112`.
- **S29.** Not a defect of the code: the fixtures lacked a failed `HEAD` listing (B8), an unborn
  `HEAD` with refs (S27), a tag with no tagger (S23), a `pushurl` (S24), a secret at a redacted path
  (S25), and a host repeated in two cases and two hosts in one path (B6).

## 3. Evidence

The red runs of section 1, one named check per finding, each on `main`'s code with the fixture in
place. The checks for B6, S23, S24, S27 and B8 pass on `main`, since #210 fixed them; each was shown
to catch a regression by reverting its fix in a copy and running the block:

| Mutation | Check that failed |
|---|---|
| a `HEAD` that could not be listed compared as empty | B8 |
| no early return in `decideAtHead` | S27, B8 |
| an annotated tag told by its tagger rather than `%(objecttype)` | S23 |
| `url` read without `pushurl` | S24 |
| a path host kept in its case | B6 |

## 4. Why it surfaced now

Each was introduced by #210 or by the fixes between its review rounds: S33 by the fix of S22, S32 and
S31 with the message read of B4 and B5, the others with the code they sit in. `pyName` has been wrong
since the supply-chain scan was written (#208).

## 4b. Recorded intent

Spec: `docs/records/design/261108-2243-security-scripts.md` (APPROVED) and ADR 0017; the change keeps
to them and chooses nothing again. Where a finding offered a choice, Lam Ngoc Khuong, the design's
owner, named the direction in the request for this run: S19 printed by class unless the last label is
a known public one, with no suffix added to a list; S21 the control words and the common receivers on
the spaced-`=` branch; S32 the `from` field. Nothing recorded contradicts any of them.

## 5. The change

Each finding is fixed at its own line, and nothing beside it was rewritten:

- **S31.** `stream()` splits git's output on `\n` alone through a `StringDecoder`, searching only the
  new chunk, and drops the `\r` before a `\n`; a lone `\r` stays inside its line.
- **S25.** `writeDetail` keeps a hit with a full value or a path, the value cell empty for the latter.
- **S33.** `holds()` takes `'` as part of an email only after a letter, and a host's before-edge is
  `[a-z0-9.-]`.
- **S32.** Every message hit carries `from`: `message`, or `tag message <ref>`, the ref read with
  `%(refname)` and redacted by `red()`.
- **S20, S34, N31, S38.** The login regexes, moved to `lib/line-login-removal.mjs`: a password runs
  to the `@` that a host, then a port, a path or the end follows; a login stops at a quote, an angle
  bracket or a backtick; `<host>:<digits>/` is a port; a user may be an address; `sip:`, `email:`
  and other address keys are no login.
- **S35, S37, S39, S40, S41.** Both lookbehinds of `pathHosts()` accept a name after `.`; a dot-led
  name keeps its stem only when the stem is itself a file rule 9 names, and `.env.local` and the four
  dotenv mode files keep their whole name.
- **S19, S36.** `proposable()` prints a name by class unless its last label is a delegated country
  code or a common generic one, from `lib/public-tld-labels.mjs`; no private suffix was listed.
- **N29.** The `--domains` fold also folds a two-label name `namesMachine()` accepts: a class
  `hostClass()` reports, or the old machine suffixes.
- **S21.** `KEYWORD` holds the control words, and a common receiver is refused after a spaced `=`.
- **N28, N30, pyName.** The header's `null`s; the path fallback in `delivery-readiness.md` points at
  the scan's own rule; `pyName` uses `/[-_.]+/`.

Wider than one line in two places, both to stay under 200 lines per file: the two new libraries. No
logic moved with the login regexes beyond the function that applies them.

Tidy: `/simplify` ran four agents on the diff. Applied: comments folded so `host-classes.mjs` reached
200 lines, a ternary in `holds()` split, `from` built inside `read()` from the ref, the detail file
read once in the test. The rest was a behaviour change or outside the touched lines, and is in
section 9.

Reference documents: the JSON contract gained `from`, written into the header of
`lib/identity-hosts.mjs:6-12`, the triage row of `references/delivery-readiness.md`, and both
codebase summaries; the detail rows, the `--domains` line and the path fallback moved in the same
file. `SKILL.md` names no field this change touches.

Review fixes: S38, S36, S37 after round 1; S39 after round 2; S40 and S41 after the closing read, at
the owner's request; all code, each the form its finding
suggested, with S36 the full list of delegated country codes rather than any two letters.

## 6. Verified

- The new block of `tests/verify.sh` ("the inputs the closing review of #210 named"): red on `main`
  with the twenty labels of section 1, then the S36, S37, S38 and S39 checks each red before its own
  fix; green now. Its leak check runs on all four scans of the block.
- The `pyName` check in the supply-chain block: red on `main` (`pyName: []`), green now.
- Coverage-only checks, each red when its earlier fix is reverted in a copy: see section 3.
- The three older history-scan blocks: unchanged, 19 hits, 42 identity hits, the bundle case.
- `bash tests/verify.sh` on Windows with `PYTHONUTF8=1`: 80 OK lines against 79 on a clean tree
  (`git stash`), the new block the only difference; the other lines are the known Windows
  path-separator failures, shifted by line number only. That run predates the round fixes.
- `bash tests/verify.sh` on Linux, in Docker `node:22`, the working tree copied in and every file
  added to the copy's index: 99 of 99 lines OK, after the last fix. This is the job that gates the
  change, `.github/workflows/verify.yml`.
- `node --check` on every script; line counts: `history-scan.mjs` 200, `host-classes.mjs` 196,
  every other file below.

## 6b. Reviewed

- Round 1: `docs/derived/reviews/fix-security-delivery-closing-findings-261110-1044.md`, 0 BLOCKING,
  3 SHOULD FIX, 3 NIT. S36, S37, S38 fixed. N32 (`print` and `echo` in `KEYWORD`), N33 (`_`, `%`,
  `+` dropped from the host edge in `holds()`), N34 (a line in both a commit and a tag message keeps
  only the commit's `from`) left as NIT.
- Round 2: `docs/derived/reviews/fix-security-delivery-closing-findings-261110-1116.md`, 0 BLOCKING,
  1 SHOULD FIX, 1 NIT. S39 fixed. N35 (an email user with no password, `https://<local>@<domain>@git.<domain>/`,
  gives a wrong email hit and misses the host) left as NIT.
- Closing read: see After the last round. S40 and S41 then fixed at the owner's request, not
  reviewed again.
- `atk:verify` was not offered: the loop did not come out clean, and the kit has no running system.

## 7. Not verified

- The fixes of S40 and S41, made after the closing read: no review has read them. Their fixtures
  are red without them and green with them, and Linux runs 99 of 99 lines OK.
- The full `tests/verify.sh` on Windows after the round fixes; Linux, which gates the change, ran
  after them.
- The cost of the login regexes on a long line: the second reviewer measured about 19 seconds for
  one 424 KB line of URLs with no quote. No real repository was timed.
- A real repository with tag messages, per-machine env files or minified JSON in its history: only
  the fixtures were run.

## 8. Blast radius

- `stream()`: every walk of `history-scan.mjs:67` (names, renames, copies, content passes) and the
  identity walk at `lib/identity-hosts.mjs:89`. Exercised by all four history-scan blocks.
- `contentHits()`: the content pass at `history-scan.mjs:167` and the message read at
  `lib/identity-hosts.mjs:81`. Exercised.
- `pathHosts()`: `pathHitsFor` at `lib/identity-hosts.mjs:36`, `red()` at `:53`, the ref hits at
  `:55`. Exercised.
- `proposable()` and `namesMachine()`: the `--domains` count at `lib/identity-hosts.mjs:121`, the
  remotes at `:137`, the fold at `:52`. Exercised.
- `writeDetail()`: `finishHits` at `lib/identity-hosts.mjs:58`. Exercised.
- `holds()`: `decideAtHead` at `history-scan.mjs:188`. Exercised.
- `pyName`: `pythonCandidates` at `supply-chain-scan.mjs:107`. Exercised.

## 9. Left for later

Not done here, each a candidate issue:

- A dotenv mode outside the four, `.env.qa.local`, is shown as `.env.<redacted: host>`.
- N32, N33, N34, N35, as section 6b gives them.

- One edge rule for an email shared by `holds()` and `LOCAL` in `lib/host-classes.mjs`: `holds()`
  takes only `[a-z0-9._%+-]` before an address, so a non-ASCII letter before it at `HEAD` still
  counts the address as present.
- One test for a machine name: `proposable()` uses the public labels, the `--domains` fold of a ref
  uses `MACHINE` and `hostClass()`, so `fix/build01.lab` is printed whole under `--domains`. The fold
  keeps the narrower test because a path such as `package.json` would otherwise be folded.
- `standsAsHost` still lists words: its last branch takes a name after any word without checking
  what follows it, and `RECEIVER` applies only after a spaced `=`.
- The login regexes scan to the end of a token from each `scheme://`: one 424 KB line of URLs with no
  quote took about 19 seconds in the second review. A cap on the login's length, or a cheaper first
  check, would bound it.
- `EMAIL` takes a leading `'` into a local part, so `'bob@<domain>'` gives the detail value
  `'bob@<domain>`. Present before this change.
- Two login shapes stay ambiguous and can still leave a fragment in the detail file: a password
  that starts with digits and a slash, read as a port, and a password holding an `@` followed by a
  name and a slash, cut at that `@`.
- The generic labels of `lib/public-tld-labels.mjs` are few: a domain under a newer one (`.agency`, `.company`) is proposed as
  a machine name, so the owner adds it by hand.
- The `pathHosts` regex is built per domain per path, and the suffix list is written three times in
  `lib/host-classes.mjs`. Present before this change.
- #209's distance threshold, waiting on Lam Ngoc Khuong; the second review's open question on
  machine identities, `user@host.localdomain`, the same.
