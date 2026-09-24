# Threat checklist

Loaded by `atk:security` in steps 2, 3 and 5. What to run, what to ask at each trust boundary, and
the baseline checklist a review answers when nobody supplied one.

The questions here are stack-agnostic on purpose. How a control is written differs per framework;
whether it exists does not, and a question that names one framework's function reads as settled on
every project that does not use it.

## Finding the commands

Look for each command in this order and use the first that answers. Record which one it was.

1. The Commands section of `.atk/profile.md`.
2. A CI workflow that already runs it: `.github/workflows/`, `.gitlab-ci.yml`, or the project's
   equivalent. A job that fails the build on it is the project's gate, and what it passes is what
   the team has agreed to ship.
3. A script in the manifest whose name says it: `audit`, `security`, `scan`.
4. The package manager's own audit command, when its lockfile is in the repository. Say that it was
   this skill's choice, because the team never agreed that its threshold is theirs.

A scanner the project does not have is not installed quietly. Name it, say what it would add, and
ask. A run that installs a tool leaves the repository or the machine different from how the team
left it, and the next person cannot tell why.

## Automated checks

| Check | How | A finding when |
|-------|-----|----------------|
| Dependency audit | The command found above | It reports a known vulnerability in a package the scope ships, not only in a development tool |
| Secrets in tracked files | The patterns of `skills/git/references/secret-scan.md`, over `git ls-files` rather than `git diff --cached` | A line matches and is not a placeholder, an example file, or a read from the environment |
| Tracked environment file | `git ls-files` for the paths that file lists as findings on their own | Any of them is tracked, whatever it holds today |
| Secrets in history | Only with a history scanner the project already has | Never claimed as clean when no such scanner ran; the record says history was not scanned |
| Shipped configuration | Read the configuration the scope deploys | Debug mode on, a wildcard origin with credentials, a default password, a verbose error page in a production profile |

## STRIDE per boundary

Ask all six at every trust boundary step 1 named. The answer is a line of the record either way.

| Question | Ask | Where it usually fails |
|----------|-----|------------------------|
| Spoofing | Can a caller claim to be someone they are not? | Unverified tokens, a session that survives logout, a callback nobody signs |
| Tampering | Can a caller change what they should only read, or change it in transit? | Input used in a query or a command without binding, a client-side price, an unsigned webhook |
| Repudiation | Could an actor deny an action, and would the logs contradict them? | No record of who changed a permission, logs anyone can edit |
| Information disclosure | Can a caller see what is not theirs? | Another user's record by changing an ID, a stack trace in a response, personal data in a log line |
| Denial of service | Can one caller exhaust what everyone shares? | No limit on an expensive endpoint, an unbounded list, a pattern that backtracks |
| Elevation of privilege | Can a caller do what their role may not? | A check in the screen but not in the handler, an administrator route behind the ordinary guard |

## OWASP Top 10 map

After the STRIDE pass, map each candidate to the category a client checklist is most likely to use,
the 2021 edition of the OWASP Top 10. The map is for the reader, not a second pass: a category with
no candidate is not searched again for its own sake.

| ID | Category | Usually surfaced by |
|----|----------|---------------------|
| A01 | Broken access control | Elevation of privilege, information disclosure |
| A02 | Cryptographic failures | Information disclosure, the secrets check |
| A03 | Injection | Tampering |
| A04 | Insecure design | Any boundary where the control is missing rather than broken |
| A05 | Security misconfiguration | The shipped configuration check |
| A06 | Vulnerable and outdated components | The dependency audit |
| A07 | Identification and authentication failures | Spoofing |
| A08 | Software and data integrity failures | Tampering at a build, an update, or a deserialisation |
| A09 | Security logging and monitoring failures | Repudiation |
| A10 | Server-side request forgery | Tampering where the server fetches a URL a caller gave |

## Baseline checklist

Answered in step 5 when no `--checklist` was given. Keep the IDs, so a later record can say which
item changed.

| ID | Item |
|----|------|
| SEC-01 | Every entry point in scope requires authentication, or is recorded as public on purpose |
| SEC-02 | Authorisation is checked on the server for every action and every record, not only in the screen |
| SEC-03 | Input reaching a query, a command, a file path, or a template is bound or validated at that use |
| SEC-04 | Passwords are stored with a slow, salted hash; tokens expire and are checked on the server |
| SEC-05 | No credential is in a tracked file, and no environment file is tracked |
| SEC-06 | Personal data is limited to what the feature needs, and none of it reaches a log |
| SEC-07 | Errors shown to a caller carry no stack trace, query, or internal path |
| SEC-08 | Expensive or public endpoints are rate limited, and every list is bounded |
| SEC-09 | Security-relevant actions are logged with the actor and the time |
| SEC-10 | Dependencies carry no known vulnerability at the severity the project blocks on |
| SEC-11 | Shipped configuration has debug off, no default credential, and origins restricted |
| SEC-12 | Calls to and from third parties are authenticated, and callbacks are verified |

A client or company checklist replaces this list rather than being added to it. Where it leaves out
something this list has, say so in one line under the checklist rather than answering both.
