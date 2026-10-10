# Secret scan

Loaded by `atk:git` in step 2, before anything is committed. `shared/finalize-steps.md` says never to
stage a credential; this file is how that is checked rather than hoped for.

`atk:security` loads it in its step 2 for The scan, in its `tree` mode over every tracked file, and
Paths that are a finding on their own only. What happens on a hit is `atk:git`'s procedure, not its.
The reviewer rule in `shared/host-capabilities.md` uses its `mask` mode for a diff handed to an agent.

For `atk:git` the scan runs on what is staged, not on the working tree, because staged is what is
about to become permanent, and once more, in its `commit` mode, on a commit a hook wrote into.

## The scan

One block, run by `sh` whatever the session's shell, with the mode as its argument: `staged` for
what is about to be committed, `commit` for the commit a hook wrote into, `tree` for every tracked
file under `atk:security`, and `mask <range>`, the procedure below for a diff handed to another
agent.

```bash
sh -s -- staged <<'SCAN'
mode=${1:-staged}
top=$(git rev-parse --show-toplevel) && cd "$top" || { echo "scan failed: not inside a git repository" >&2; exit 2; }
set -f
F='**/.env **/.env.* **/*.pem **/*.key **/*.p12 **/*.pfx **/*.jks **/id_rsa **/id_ed25519 **/.netrc
   **/.pgpass **/credentials.json **/secrets.* **/serviceAccount*.json'
X=; P=; for p in $F; do X="$X :(exclude,glob)$p"; P="$P :(glob)$p"; done
K=':(glob)**/.env.example :(glob)**/.env.sample'
g='git -c core.quotePath=false'
o='--no-color --no-ext-diff --no-textconv --src-prefix=a/ --dst-prefix=b/'
run() { "$@"; echo "#scan-git-status $?"; }
case $mode in
  staged) { run $g diff --cached -U0 $o -- . $X; run $g diff --cached -U0 $o -- $K
            $g diff --cached --name-only -- $P; } ;;
  commit) { run $g show --first-parent --format= -U0 $o HEAD -- . $X; run $g show --first-parent --format= -U0 $o HEAD -- $K
            $g show --first-parent --format= --name-only HEAD -- $P; } ;;
  tree)   { run $g grep -I -n --no-color -e '' -- . $X; run $g grep -I -n --no-color -e '' -- $K
            $g ls-files -- $P; } ;;
  mask)   { run $g diff $o "$2" -- . $X; run $g diff $o "$2" -- $K; $g diff --name-only "$2" -- $P; } ;;
  *) echo "scan: unknown mode $mode" >&2; exit 2 ;;
esac | awk -v mode="$mode" '
function rep(c, n,   s) { s = ""; while (n-- > 0) s = s c; return s }
BEGIN {
  m = "[Rr][Ee][Dd][Aa][Cc][Tt][Ee][Dd]"
  n = 0
  shape[++n] = "private key block";   re[n] = "-----BEGIN [A-Z ]*PRIVATE KEY-----"; lc[n] = 0
  shape[++n] = "AWS access key";      re[n] = "AKIA" rep("[0-9A-Z]", 16); lc[n] = 0
  shape[++n] = "JWT";                 re[n] = "eyJ" rep("[A-Za-z0-9_-]", 5) "[A-Za-z0-9_-]*[.]" rep("[A-Za-z0-9_-]", 5) "[A-Za-z0-9_-]*[.][A-Za-z0-9_-]"; lc[n] = 0
  shape[++n] = "provider key prefix"; re[n] = "(sk_live_|rk_live_|ghp_|gho_|ghs_|github_pat_|xox[abprs]-)[A-Za-z0-9_-]"; lc[n] = 0
  shape[++n] = "bearer token";        re[n] = "authorization[\"\047]?[[:space:]]*[:=][[:space:]]*[\"\047]?bearer[[:space:]]+[^[:space:]\"\047`]"; lc[n] = 1
  shape[++n] = "connection string with a password"; re[n] = "(mongodb|postgres|postgresql|mysql|redis|amqp)://[^ ]*:[^ @]+@"; lc[n] = 1
  w = "[a-z0-9_]*(key|token|secret|pass|pwd|credential)[a-z0-9_]*"
  shape[++n] = "secret-named assignment"; re[n] = "(^|[^a-z0-9_.-])(export[[:space:]]+)?" w "=([^[:space:]=\"\047{(`$<0-9]|[0-9]+[^0-9[:space:]`\"\047,;)])"; lc[n] = 1
  shape[++n] = "secret-named literal"; re[n] = "(^|[^a-z0-9_.-])[a-z0-9_.-]*(key|token|secret|pass|pwd|credential)[a-z0-9_.-]*[\"\047]?[[:space:]]*[:=][[:space:]]*([\"\047]" rep("[^\"\047]", 6) "[^\"\047]*[\"\047]|" rep("[a-z0-9_/+-]", 8) "[a-z0-9_/+-]*([^a-z0-9_./+(\\[-]|$))"; lc[n] = 1
  enum = "[a-z0-9_.-]*(key|token|secret|pass|pwd|credential)[a-z0-9_.-]*[\"\047]?[[:space:]]*[:=][[:space:]]*[\"\047]?(true|false|[a-z][a-z][a-z]" rep("[a-z]?", 7) ")[\"\047]?([^a-z0-9_]|$)"
}
function hits(v,   i, x, out) {
  gsub("[A-Za-z0-9_.-]*[\"\047]?[ \t]*[:=][ \t]*[\"\047`]?<" m "[^>]*>[\"\047`]?", "", v)
  gsub("[Bb][Ee][Aa][Rr][Ee][Rr][ \t]+<" m "[^>]*>", "", v)
  gsub("<" m "[^>]*>", "", v)
  x = tolower(v); gsub(enum, "\t", x); out = ""
  for (i = 1; i <= n; i++) if ((lc[i] ? x : v) ~ re[i]) out = out (out == "" ? "" : ", ") shape[i]
  return out
}
/^#scan-git-status / { if ($2 != 0 && !(mode == "tree" && $2 == 1)) bad = 1; indiff = 0; st = 0; next }
!/^(diff |--- |\+\+\+ |@@ |[-+ ]|index |new file|deleted file|similarity|rename|old mode|new mode|Binary)/ && mode != "tree" && st == 0 && !indiff {
  if ($0 ~ /(^|\/)\.env\.(example|sample)$/) next
  if (mode == "mask") print $0 ": a file rule 9 names, not read" > "/dev/stderr"; else print $0 ": a file rule 9 names, not read"
  found++; next
}
mode == "tree" && !index($0, ":") { if ($0 ~ /(^|\/)\.env\.(example|sample)$/) next; print $0 ": a file rule 9 names, not read"; found++; next }
mode == "tree" {
  i = index($0, ":"); j = index(substr($0, i + 1), ":")
  h = hits(substr($0, i + j + 1)); seen++
  if (h != "") { print substr($0, 1, i + j - 1) ": " h; found++ }
  next
}
/^diff / { st = 2; heads++; indiff = 1; if (mode == "mask") print; next }
st == 2 && /^--- / { st = 1; if (mode == "mask") print; next }
st == 1 && /^\+\+\+ / { f = substr($0, 7); st = 0; if (mode == "mask") print; next }
st == 2 { if (mode == "mask") print; next }
/^@@ / { split($3, a, ","); ln = substr(a[1], 2) + 0; if (mode == "mask") print; next }
/^[-+ ]/ {
  c = substr($0, 1, 1); h = hits(substr($0, 2)); seen++
  if (mode == "mask") {
    if (h != "") { print c "<redacted: a line holding a " h ">"; print f ":" ln ": " h > "/dev/stderr"; found++ }
    else print
  } else if (c == "+" && h != "") { print f ":" ln ": " h; found++ }
  if (c != "-") ln++
  next
}
{ if (mode == "mask") print }
END {
  if (bad) { print "scan failed: git did not complete" > "/dev/stderr"; exit 2 }
  if (mode != "mask") print (found ? found " lines matched" : "clean") ", " seen + 0 " lines read" > "/dev/stderr"
  exit found ? 1 : 0
}'
SCAN
```

It prints, per line that matched, the path, the line number and the shapes, never the line: the
output lands in the session, and a value printed there is a secret in a second place. It ends with a
count of the lines it read, so a scan that read nothing says so, and exits 1 on a hit, 0 when clean,
and 2 when git failed or what it read was not a diff: a failed scan is never reported as a pass.

It runs from the root of the repository wherever it is started, and asks for the diff in the one
form the parser reads, whatever the user has configured: no external diff tool, no text conversion,
`a/` and `b/` prefixes, and paths unquoted. The paths in the table below are not read, since rule 9
of `shared/team-roles.md` forbids it: each one in scope is reported by name, `a file rule 9 names,
not read`, and counts as a hit. `.env.example` and `.env.sample` are read and scanned like any
file, since they are the environment files meant to be committed, and a live value in one is the
leak they invite.

The shapes are the ones rule 9 names. Two of them decide by name, for a name containing `KEY`,
`TOKEN`, `SECRET`, `PASS`, `PWD` or `CREDENTIAL`:

- **An assignment**, a name such as `GITHUB_TOKEN` or `export DB_PASS` followed by `=` with no space
  before it, and any value that is neither a reference (`${...}`, `{`, a quote, `<`) nor a bare
  number: the form of an environment file or a shell line, where even a one-letter value is real.
- **A literal**, after `:` or `=` in code: a quoted string of six characters or more, or a bare
  token of eight or more with no dot that is not a call or an index. `token: string`,
  `key={item.id}`, `token == null`, `const passwordInput = el` and a read from the environment such
  as `process.env.API_KEY` are not hits, because a scan that stops on ordinary code teaches the team
  to skip it.

Either name shape passes a value rule 9 keeps as evidence: `true`, `false`, or a lower-case word of
three to ten letters, the kind an enum holds.

A masked value is taken out before matching, key and quotes with it: `DB_PASSWORD=<redacted: password>`,
`` `Authorization: Bearer <redacted: bearer token>` ``, `postgres://u:<redacted: password>@host` and
the older `<REDACTED>` are not findings, so a correctly masked record can be committed. Another
value on the same line is still matched.

A connection string only matters when it carries a password, which is why that branch looks for
`user:pass@` with a non-empty password rather than for the scheme alone. `postgres://localhost/dev`
in a test fixture is not a finding, and a scan that reports it teaches the team to skip the scan.

## Masking a diff for another agent

A diff written to a file for an agent to read, the reviewer's `diff.patch` per the reviewer rule in
`shared/host-capabilities.md`, is masked by this scan rather than by reading it into the session.
Run the same block with `mask` and the range, its output to the file and the list of what it masked
beside it: `sh -s -- mask main...HEAD > <run directory>/diff.patch 2> <run directory>/masked.txt`,
the block as the here-document. The diff never passes through the session unmasked.

Every line that matched, added, removed or context, becomes `<redacted: a line holding a <shapes>>`,
and `masked.txt` lists each one by path, line and shape. That list goes to the round that checks for
secrets as a hoisted result: the agent reading the masked diff cannot tell a live credential from a
value that arrived masked, so the masking itself is the finding.

## Paths that are a finding on their own

Staged at all, regardless of content:

| Pattern | Why |
|---------|-----|
| `.env`, `.env.*` except `.env.example` and `.env.sample` | The file exists to hold what must not ship |
| `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks` | Private key material |
| `id_rsa`, `id_ed25519`, and any file beside a `.pub` of the same name | An SSH private key |
| `credentials.json`, `secrets.*`, `serviceAccount*.json` | Named for what they hold |
| `.netrc`, `.pgpass` | A password stored with no `=` or `:` beside a keyword, which the name shapes cannot see |
| `*.sql` or `*.csv` over a megabyte | A dump of real data, until someone says otherwise |

The last row is a question rather than a verdict. Large data files are sometimes fixtures, and the
person staging it knows which.

## What happens on a hit

Stop. Not "warn and continue", and not "commit the rest".

1. Name the file, the line number and the shape the scan reported. Do not print the line: the user
   opens it in their editor to see whether it is real. Where the line has to be described in the
   session, describe it with the value masked as rule 9 of `shared/team-roles.md` masks it, its key
   kept and the value `<redacted: kind>`.
2. Say what it looks like and why it matched.
3. Offer to unstage that path, and say what else the change would need: the value out of the file,
   the path into `.gitignore`, and the credential rotated if it ever reached a remote.
4. Wait. Do not commit any part of the change, including the parts that are clean.

Committing the clean part first is the trap worth naming. It splits the user's attention at the exact
moment they need it whole, and it puts the tree in a state where the next run sees a smaller diff and
the finding scrolls away.

## A false positive is not an argument for skipping the scan

A fixture that assigns `test` to `PASSWORD`, a setting that assigns `none` to a name ending in
`_TOKEN_MODE`, a header name such as `X-Api-Key` held in a field named `apiKeyHeader`: all of these
match a name shape and none of them is a secret.

Say so, name why, and let the user decide. What is not allowed is turning the scan off for the run,
because the run after that is the one that ships the key.

## What this does not prove

The scan reads the diff, or the tracked tree under `atk:security`. It does not know that a value is
live, and it does not see a secret already in the history from before this change.

Its shapes are a floor, not the definition of a secret, which rule 9 of `shared/team-roles.md`
holds. A credential with no recognisable prefix passes when its name carries none of the six words,
when it is a lower-case word of three to ten letters, which the enum exception lets through,
when it follows a keyword with no `:` or `=` (`password hunter2`), when a literal is shorter than the
two lengths above, or when it is split across lines. Masking at the time a run writes is the first
defence; this scan is the one that catches what masking missed.

Say that when reporting a pass: what passed is this diff against these shapes. A clean scan is not
a statement that the repository holds no secrets.
