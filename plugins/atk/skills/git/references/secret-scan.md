# Secret scan

Loaded by `atk:git` in step 2, before anything is committed. `shared/finalize-steps.md` says never to
stage a credential; this file is how that is checked rather than hoped for.

`atk:security` loads it in its step 2 for The scan and Paths that are a finding on their own only,
run over `git ls-files` rather than the staged diff. What happens on a hit is `atk:git`'s procedure,
not its.

The scan runs on what is staged, not on the working tree, because staged is what is about to become
permanent.

## The scan

```bash
git diff --cached | grep -inE \
  "(AKIA[0-9A-Z]{16}|api[_-]?key|secret[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|\
password|passwd|-----BEGIN [A-Z ]*PRIVATE KEY-----|(mongodb|postgres|postgresql|mysql|redis|amqp)://[^ ]*:[^ @]*@)"
```

A connection string only matters when it carries a password, which is why that branch looks for
`user:pass@` rather than for the scheme alone. `postgres://localhost/dev` in a test fixture is not a
finding, and a scan that reports it teaches the team to skip the scan.

## Paths that are a finding on their own

Staged at all, regardless of content:

| Pattern | Why |
|---------|-----|
| `.env`, `.env.*` except `.env.example` and `.env.sample` | The file exists to hold what must not ship |
| `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks` | Private key material |
| `id_rsa`, `id_ed25519`, and any file beside a `.pub` of the same name | An SSH private key |
| `credentials.json`, `secrets.*`, `serviceAccount*.json` | Named for what they hold |
| `*.sql` or `*.csv` over a megabyte | A dump of real data, until someone says otherwise |

The last row is a question rather than a verdict. Large data files are sometimes fixtures, and the
person staging it knows which.

## What happens on a hit

Stop. Not "warn and continue", and not "commit the rest".

1. Name the file and show the matching line with a little context, so the user can see whether it is
   real. Redact the value itself in what is printed; a secret echoed into a terminal log is a secret
   in a second place.
2. Say what it looks like and why it matched.
3. Offer to unstage that path, and say what else the change would need: the value out of the file,
   the path into `.gitignore`, and the credential rotated if it ever reached a remote.
4. Wait. Do not commit any part of the change, including the parts that are clean.

Committing the clean part first is the trap worth naming. It splits the user's attention at the exact
moment they need it whole, and it puts the tree in a state where the next run sees a smaller diff and
the finding scrolls away.

## A false positive is not an argument for skipping the scan

A test fixture with the literal word `password`, a documentation file describing a config key, a
variable named `apiKey` with no value: all of these match and none of them is a secret.

Say so, name why, and let the user decide. What is not allowed is turning the scan off for the run,
because the run after that is the one that ships the key.

## What this does not prove

The scan reads the diff. It does not know that a value is live, does not catch a credential that
carries no keyword, and does not see a secret already in the history from before this change.

Say that when reporting a pass: what passed is this diff against these patterns. A clean scan is not
a statement that the repository holds no secrets.
