# Secret scan

How a diff or a tree is checked for a secret rather than hoped clean, and how a diff is masked before
another agent reads it. Referenced from `skills/<name>/SKILL.md` as `shared/secret-scan.md`, which is
`../../shared/secret-scan.md` relative to a skill file.

Its table of Paths that are a finding on their own is the list of files rule 9 of
`shared/team-roles.md` keeps unread: the environment files, the private keys and the credential
stores. Everything that cites that rule's files cites this table.

Cited by:

- `atk:git` in its step 1, to read the diff with that table's files left out, and in its step 2, on
  what is staged, since staged is what is about to become permanent, and once more, in its `commit`
  mode, on a commit a hook wrote into. `shared/finalize-steps.md` says never to stage a credential;
  this file is how that is checked.
- `atk:security` in its step 2 for The scan, in its `tree` mode over every tracked file, and Paths
  that are a finding on their own. What happens on a hit is `atk:git`'s procedure, not its.
- The reviewer rule in `shared/host-capabilities.md`, which uses its `mask` mode for every diff handed
  to an agent, by `atk:review` and by any run that hands an agent a change to read.

## The scan

One block, run by `sh` whatever the session's shell, with the mode as its argument: `staged` for
what is about to be committed, `commit` for the commit a hook wrote into, `tree` for every tracked
file under `atk:security`, and `mask <base>...<head>` or `mask --worktree`, the procedure below
for a diff handed to another agent.

The block needs `sh` and `git`. In PowerShell it runs as a here-string piped to `sh`: a line
holding `@'`, the body, then a line holding `'@ | sh -s -- staged`. Git for Windows ships `sh`. With
no `sh` on the path the scan has not run: stop and say so, since a scan that could not start is not
a pass.

```bash
sh -s -- staged <<'SCAN'
mode=${1:-staged}
case $mode in
  staged|commit|tree) ;;
  mask) case $2 in --worktree|[!-]*..?*) ;; *) echo "scan: mask takes a range <base>...<head> or --worktree" >&2; exit 2 ;; esac ;;
  *) echo "scan: unknown mode $mode" >&2; exit 2 ;;
esac
top=$(git rev-parse --show-toplevel) && cd "$top" || { echo "scan failed: not inside a git repository" >&2; exit 2; }
set -f
F='**/.env **/.env.* **/*.pem **/*.key **/*.p12 **/*.pfx **/*.jks **/id_rsa **/id_dsa **/id_ecdsa **/id_ed25519
   **/.netrc **/.pgpass **/credentials.json **/serviceAccount*.json **/secrets.json **/secrets.yml
   **/secrets.yaml **/secrets.toml **/secrets.ini **/secrets.env **/secrets.txt **/.git-credentials
   **/.pypirc **/.aws/credentials **/.docker/config.json **/.kube/config **/kubeconfig **/*.tfstate
   **/*.tfstate.backup'
T='**/.env.example **/.env.sample **/.env.template **/.env.dist'
X=; P=; K=; for p in $F; do X="$X :(exclude,glob)$p"; P="$P :(glob)$p"; done; for p in $T; do K="$K :(glob)$p"; P="$P :(exclude,glob)$p"; done
g='git -c core.quotePath=false -c log.showSignature=false'
o='--no-color --no-ext-diff --no-textconv --src-prefix=a/ --dst-prefix=b/'
run() { "$@"; echo "#scan-git-status $?"; }
pair() { run $g "$@" -- . $X; run $g "$@" -- $K; }
new() { $g ls-files --others --exclude-standard -- "$@" | while IFS= read -r f; do
  $g diff --no-index $o -- /dev/null "$f"; s=$?; [ $s = 1 ] && s=0; echo "#scan-git-status $s"; done; }
size() { if [ -n "$rev" ]; then $g cat-file -s "$rev$1"; else wc -c < "$1"; fi; } 2>/dev/null
odd() { nl='
'; pubs=$nl$($g ls-files -- '*.pub')$nl; while IFS= read -r f; do
  case $f in *.pub) continue ;; esac
  if case $pubs in *"$nl$f.pub$nl"*) true ;; *) [ -e "$f.pub" ] ;; esac; then printf '%s\tpub\n' "$f"
  else case $f in *.sql|*.csv) [ "$(size "$f")" -gt 1048576 ] 2>/dev/null && printf '%s\tdump\n' "$f" ;; esac; fi
done; }
names() { echo "#scan-names"; "$@" -- $P; s=$?; "$@" | odd; echo "#scan-git-status $s"; }
tab=$(printf '\t')
is() { v=$1; shift; for p in "$@"; do case "/$v" in */${p#'**/'}) return 0 ;; esac; done; return 1; }
moved() { echo "#scan-names"; run $g "$@" -M --name-status --diff-filter=R | while IFS="$tab" read -r s a b; do
  case $s in '#scan-git-status '*) echo "$s"; continue ;; esac
  is "$a" $T || ! is "$a" $F || printf '%s\tmoved\t%s\n' "$b" "$a"; done; }
case $mode in
  staged) rev=:; moved diff --cached; pair diff --cached -U0 $o; names $g diff --cached --name-only --diff-filter=d ;;
  commit) rev=HEAD:; moved show --first-parent --format= HEAD; pair show --first-parent --format= -U0 $o HEAD
          names $g show --first-parent --format= --name-only --diff-filter=d HEAD ;;
  tree)   rev=:; pair grep -I -n --no-color -e ''; names $g ls-files ;;
  mask)   if [ "$2" = --worktree ]; then rev=; moved diff HEAD; pair diff $o HEAD; new . $X; new $K
            names $g diff --name-only --diff-filter=d HEAD; names $g ls-files --others --exclude-standard
          else rev=${2##*..}:; moved diff "$2"; pair diff $o "$2"; names $g diff --name-only --diff-filter=d "$2"; fi ;;
esac | awk -v mode="$mode" '
function rep(c, n,   s) { s = ""; while (n-- > 0) s = s c; return s }
function ci(s,   i, c, r) { r = ""; for (i = 1; i <= length(s); i++) { c = substr(s, i, 1); r = r (c ~ /[a-z]/ ? "[" toupper(c) c "]" : c) } return r }
function say(s) { if (mode == "mask") print s > "/dev/stderr"; else print s; found++ }
BEGIN {
  m = ci("redacted")
  n = 0
  shape[++n] = "private key block";   re[n] = "-----BEGIN [A-Z ]*PRIVATE KEY-----"; lc[n] = 0
  shape[++n] = "AWS access key";      re[n] = "AKIA" rep("[0-9A-Z]", 16); lc[n] = 0
  shape[++n] = "JWT";                 re[n] = "eyJ" rep("[A-Za-z0-9_-]", 5) "[A-Za-z0-9_-]*[.]" rep("[A-Za-z0-9_-]", 5) "[A-Za-z0-9_-]*[.][A-Za-z0-9_-]"; lc[n] = 0
  shape[++n] = "provider key prefix"; re[n] = "(sk_live_|rk_live_|ghp_|gho_|ghs_|github_pat_|xox[abprs]-)[A-Za-z0-9_-]"; lc[n] = 0
  shape[++n] = "bearer token";        re[n] = "authorization[\"\047]?[[:space:]]*[:=][[:space:]]*[\"\047]?bearer[[:space:]]+[^[:space:]\"\047`$<{]"; lc[n] = 1
  shape[++n] = "connection string with a password"; re[n] = "((mongodb|postgres|postgresql|mysql|redis|amqp)://[^ ]*:[^ @$<{][^ @]*|[a-z][a-z0-9+.-]*://[^][:space:]/:@\"\047`]+:[^][:space:]/@$<{\"\047`][^][:space:]/@\"\047`]*)@"; lc[n] = 1
  k = "(key|token|secret|pass|pwd|credential)"; w = "[a-z0-9_]*" k "[a-z0-9_]*"
  v = "[^][:space:]\"\047`.(){},;<>[]"; e = "([][:space:]\"\047`)},;<>]|$)"
  shape[++n] = "secret-named assignment"; re[n] = "(^|[^a-z0-9_-])(export[[:space:]]+)?" w "=([^[:space:]=\"\047{(`$<0-9]|[0-9]+[^0-9[:space:]`\"\047,;)])"; lc[n] = 1
  shape[++n] = "secret-named literal"; re[n] = "(^|[^a-z0-9_.-])[a-z0-9_.-]*" k "[a-z0-9_.-]*[\"\047]?[[:space:]]*[:=][[:space:]]*([\"\047]" rep("[^\"\047]", 6) "[^\"\047]*[\"\047]|" rep(v, 8) v "*" e ")"; lc[n] = 1
  K = ci(k)
  enum = "[A-Za-z0-9_.-]*" K "[A-Za-z0-9_.-]*[\"\047]?[[:space:]]*[:=][[:space:]]*[\"\047]?(" ci("true") "|" ci("false") "|[0-9]+|[a-z][a-z][a-z]" rep("[a-z]?", 7) ")[\"\047]?([[:space:]\"\047`,;)}]|$)"
  r1 = "[A-Za-z0-9_.-]*[\"\047]?[ \t]*[:=][ \t]*[\"\047`]?<" m "[^>]*>[\"\047`]?"; r2 = ci("bearer") "[ \t]+<" m "[^>]*>"; r3 = "<" m "[^>]*>"
  end = "-----END [A-Z ]*PRIVATE KEY-----"; body = "^[[:space:]]*" rep("[A-Za-z0-9+/]", 40) "[A-Za-z0-9+/=]*[[:space:]]*$"
}
function hits(s,   i, x, out) {
  gsub(r1, "", s); gsub(r2, "", s); gsub(r3, "", s)
  x = s; gsub(enum, "\t", x); x = tolower(x); out = ""
  for (i = 1; i <= n; i++) if ((lc[i] ? x : s) ~ re[i]) out = out (out == "" ? "" : ", ") shape[i]
  return out
}
/^#scan-git-status / { if ($2 != 0 && !(mode == "tree" && $2 == 1)) bad = 1; names = 0; st = 0; key = 0; next }
/^#scan-names$/ { names = 1; next }
names {
  if ($0 == "") next
  split($0, p, "\t"); if (p[2] == "moved") mv[p[1]] = 1
  if (p[1] in said) next; said[p[1]] = 1
  if (p[2] == "moved") say(p[1] ": renamed from " p[3] ", a file rule 9 names, not read")
  else if (p[2] == "pub") say(p[1] ": a file beside a .pub of the same name")
  else if (p[2] == "dump") say(p[1] ": a .sql or .csv over a megabyte, ask whether it holds real data")
  else say(p[1] ": a file rule 9 names, not read")
  next
}
mode == "tree" {
  i = index($0, ":"); j = index(substr($0, i + 1), ":")
  h = hits(substr($0, i + j + 1)); seen++
  if (h != "") say(substr($0, 1, i + j - 1) ": " h)
  next
}
/^diff / { st = 2; key = 0; skip = 0; if (mode == "mask") print; next }
st == 2 && /^--- / { fo = substr($0, 7); st = 1; if (mode == "mask") print; next }
st == 1 && /^\+\+\+ / { f = $0 == "+++ /dev/null" ? fo : substr($0, 7); st = 0; skip = f in mv; if (mode == "mask") print; next }
st == 2 { if (mode == "mask") print; next }
skip { next }
/^@@ / {
  split($2, b, ","); ol = substr(b[1], 2) + 0; split($3, a, ","); ln = substr(a[1], 2) + 0
  if (mode == "mask") { match($0, /^@@ [^@]* @@/); print substr($0, 1, RLENGTH) }
  next
}
/^[-+ ]/ {
  c = substr($0, 1, 1); at = f ":" (c == "-" ? ol : ln); seen++
  h = key ? "private key block" : hits(substr($0, 2))
  if (mode == "mask" && h == "" && substr($0, 2) ~ body) h = "private key block"
  if (mode == "mask" && index(h, "private key block")) key = $0 !~ end
  if (mode == "mask") print (h == "" ? $0 : c "<redacted: a line holding a " h ">")
  if (h != "" && (mode == "mask" || c == "+")) say(at ": " h)
  if (c != "-") ln++
  if (c != "+") ol++
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
and 2 when git failed or the mode is not one of the four: a failed scan is never reported as a pass.

It runs from the root of the repository wherever it is started, and asks for the diff in the one
form the parser reads, whatever the user has configured: no external diff tool, no text conversion,
`a/` and `b/` prefixes, paths unquoted, and no signature output. The files the block lists in `F`,
the named files of the table below, are not read, since rule 9 of `shared/team-roles.md` forbids it:
each one in scope is reported by name, `a file rule 9 names, not read`, and counts as a hit,
whatever directory it sits in. Deleting one is not a hit, since the commit that untracks a leaked
file is the one the team needs to make. Renaming one is: a `.env` moved to `env.bak` carries the same
values under a name the table does not hold, so the new path is reported as
`renamed from <old path>, a file rule 9 names, not read`, and its content is neither scanned nor
written into a masked diff. The block matches the old path against the table in `sh` rather than
by pathspec, since git applies a pathspec before it detects a rename, so a pattern added to the
table is one both matchers have to read the same way. A rename is the case it can see: a file rule
9 names that was never tracked, saved under another name, arrives as a new file, and only the
shapes stand between its content and the diff.

The four templates the block lists in `T`, `.env.example`, `.env.sample`, `.env.template` and
`.env.dist`, are read and scanned like any file, since they are the environment files meant to be
committed, and a live value in one is the leak they invite. A template by any other name is a
`.env.*` like the rest, and reading it needs the person's word, per rule 9.

The shapes are the ones rule 9 names. Two of them decide by name, for a name containing `KEY`,
`TOKEN`, `SECRET`, `PASS`, `PWD` or `CREDENTIAL`:

- **An assignment**, a name such as `GITHUB_TOKEN`, `export DB_PASS` or
  `spring.datasource.password` followed by `=` with no space before it, and any value that is
  neither a reference (`${...}`, `{`, a quote, `<`) nor a bare number: the form of an environment
  file, a properties file or a shell line, where even a one-letter value is real.
- **A literal**, after `:` or `=` in code: a quoted string of six characters or more, or a bare
  token of eight or more, symbols included, with no dot, bracket or brace in it and not followed by
  a call or an index. A dotted key holding `S3cr#t99` after a colon is a hit; `token: string`,
  `token: Optional[str]`, `key={item.id}`, `token == null`, `const passwordInput = el` and a read
  from the environment such as `process.env.API_KEY` are not hits, because a scan that stops on
  ordinary code teaches the team to skip it.

Either name shape passes a value rule 9 keeps as evidence: `true`, `false`, a number, or a word of
three to ten lower-case letters, the kind an enum holds. The word ends at a space, a quote, `,`,
`;`, `)`, `}` or the end of the line, so `admin@2024`, `Summer-2024!` and `Hunter` are not words and
are hits.

A masked value is taken out before matching, key and quotes with it: `DB_PASSWORD=<redacted: password>`,
`` `Authorization: Bearer <redacted: bearer token>` ``, `postgres://u:<redacted: password>@host` and
the older `<REDACTED>` are not findings, so a correctly masked record can be committed. Another
value on the same line is still matched.

A connection string only matters when it carries a password, which is why that branch looks for
`user:pass@` with a non-empty password rather than for the scheme alone. The same holds for any other
URL, `https://<user>:<password>@gitlab.com` as a credential store writes it, where the user and the password
hold no `/`, so a path such as `https://registry.npmjs.org/@scope/pkg` is not read as one.
`postgres://localhost/dev` in a test fixture is not a finding, and a scan that reports it teaches the
team to skip the scan.
For the same reason a variable is not a value: `Authorization: Bearer $TOKEN` and
`postgres://u:${DB_PASS}@db/x` are not findings.

## Masking a diff for another agent

A diff written to a file for an agent to read, the reviewer's `diff.patch` per the reviewer rule in
`shared/host-capabilities.md`, is masked by this scan rather than by reading it into the session.
Run the same block with `mask`, its output to the file and the list of what it masked beside it,
the block as the here-document:

```bash
d=$(git rev-parse --path-format=absolute --git-path atk/<skill>/<run-id>) && mkdir -p "$d"
sh -s -- mask <base>...HEAD > "$d/diff.patch" 2> "$d/masked.txt"
```

The argument is what is under review:

- **A branch or a pull request**: `<base>...HEAD`, where `<base>` is the base the review resolved,
  `origin/main` or whatever the pull request targets, never a name assumed to exist locally.
- **An uncommitted change**, which is what `atk:implement` hands to `atk:review`, and what a review
  of paths in the working tree reads: `--worktree`. It carries every tracked change against `HEAD`
  and every untracked file git does not ignore, as a new file, and leaves the index as it was.

Exit 0 means nothing was masked and 1 that something was, which is normal and is what `masked.txt`
lists. Exit 2 means the scan failed, and the review stops rather than handing its agents a partial
diff. So does an empty `diff.patch` for a change that is not empty: an agent handed nothing reports
nothing, and that reads as a pass. The diff never passes through the session unmasked.

Every line that matched, added, removed or context, becomes `<redacted: a line holding a <shapes>>`.
So does every line of a private key, from its `BEGIN` line to its `END` line, and any line that
looks like one, since a hunk can start inside a key. A hunk header carries its line numbers and
nothing after them, because git appends the nearest line above the hunk and that line can be the
one holding the value. `masked.txt` lists each masked line by path, line and shape, a removed line
by its number on the old side, and each file the scan named without reading it, a renamed one with
its old path. A file renamed from one of them appears in `diff.patch` with its headers and no hunks.
A line in it of
neither form is a message from git, and is not a finding. That list goes to the round that checks
for secrets as a hoisted result: the agent reading the masked diff cannot tell a live credential
from a value that arrived masked, so the masking itself is the finding.

## Paths that are a finding on their own

Staged at all, regardless of content. The block checks every row. These rows are also the files
rule 9 of `shared/team-roles.md` keeps unread, the list its "credential stores" means: a session, an
agent's search pattern and an agent's prompt take the list from here rather than from memory.

| Pattern | Why |
|---------|-----|
| `.env`, `.env.*` except the templates `.env.example`, `.env.sample`, `.env.template` and `.env.dist` | The file exists to hold what must not ship |
| `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks` | Private key material |
| `id_rsa`, `id_dsa`, `id_ecdsa`, `id_ed25519`, and any file beside a `.pub` of the same name | An SSH private key |
| `credentials.json`, `serviceAccount*.json`, `secrets.` with `json`, `yml`, `yaml`, `toml`, `ini`, `env` or `txt` | Named for what they hold. A source file such as `secrets.ts` is code, and is scanned and reviewed like any other |
| `.netrc`, `.pgpass` | A password stored with no `=` or `:` beside a keyword, which the name shapes cannot see |
| `.git-credentials`, `.pypirc`, `.aws/credentials`, `.docker/config.json`, `.kube/config`, `kubeconfig`, `*.tfstate`, `*.tfstate.backup` | Credential stores: a tool writes a login, a key or the state of real infrastructure there. `.npmrc` is not one of them, since projects commit it for registry settings; its `_authToken=` line is a secret-named assignment, and the scan reads it as one |
| `*.sql` or `*.csv` over a megabyte | A dump of real data, until someone says otherwise |

The first six rows are reported as `a file rule 9 names, not read`, apart from a file beside a
`.pub`, which is reported as that. The last row is a question rather than a verdict, and is reported
as one: large data files are sometimes fixtures, and the person staging it knows which.

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

A fixture that assigns `test1234` to `PASSWORD`, a setting that assigns `app:v2` to
`CACHE_KEY_PREFIX`, a header name such as `X-Api-Key` held in a field named `apiKeyHeader`: all of
these match a name shape and none of them is a secret.

Say so, name why, and let the user decide. What is not allowed is turning the scan off for the run,
because the run after that is the one that ships the key.

## What this does not prove

The scan reads the diff, or the tracked tree under `atk:security`. It does not know that a value is
live, and it does not see a secret already in the history from before this change.

Its shapes are a floor, not the definition of a secret, which rule 9 of `shared/team-roles.md`
holds. A credential with no recognisable prefix passes when its name carries none of the six words,
when it is a word of three to ten lower-case letters or a number, which the enum exception lets
through,
when it follows a keyword with no `:` or `=` (`password hunter2`), when a literal is shorter than the
two lengths above, or when it is split across lines. Masking at the time a run writes is the first
defence; this scan is the one that catches what masking missed.

Say that when reporting a pass: what passed is this diff against these shapes. A clean scan is not
a statement that the repository holds no secrets.
