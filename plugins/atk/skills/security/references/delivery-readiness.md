# Delivery readiness

Loaded by `atk:security` under `--delivery`, the check of a repository before it is handed to a
client. The client receives the whole history, every commit of every ref handed over, with its
message and its identities, and not only the files at `HEAD`: a key deleted last year, an engineer's
company email in a commit or a `Co-authored-by` line, a host on the company network named in an old
configuration, all go with it. This file holds who answers for the repository, what the mode runs,
how the company's domains are confirmed, where its report goes, the triage of what it finds, the
rule that decides `READY` or `NOT READY`, and the options the owner chooses between.

The mode finds and reports. It rotates nothing, rewrites nothing, pushes nothing, and decides
nothing a person owns: whether an address may go to the client, whether a credential was rotated,
how the repository is handed over. Each of those is asked of the owner, and the report names who
answered.

## Who answers

The owner of the repository answers every question this file asks: the domains, each open line, the
refs. By default that is the Tech Lead, or the PM or the Stakeholder where the contract gives them
the handover. The run asks, in this order and before anything else: which repository is handed
over, where the profile names members; who holds that role for it, naming the default, never taking
the person running the skill as the owner because they ran it; then the domains, below. Where the
owner is not in the session, each question is an open line carrying their name, per rule 1 of
`shared/team-roles.md`, and the verdict stays `NOT READY` until it is answered. A line whose answer
belongs to someone else, the owner of a credential or of a file, is answered by the repository's
owner naming that person, and carries the repository's owner's name until they do.

## What it runs

- **Scope.** One repository, the whole of it: step 1 resolves the scope as the whole repository at
  `HEAD` without asking, and names its assets as it always does, since the triage below ranks against
  them. A scope argument beside `--delivery` is not taken, and the session says so. A project whose
  profile names members is handed over one repository at a time, the one the first question names,
  and the run runs from its root.
- **Step 2, three of its bullets.** The `tree` secret scan, `scripts/supply-chain-scan.mjs`, and
  `scripts/history-scan.mjs` with `--identities`, the confirmed domains as `--internal` or no
  `--internal` when the confirmed list is empty, and `--detail` naming a file in the report directory
  below. Each is run and read as step 2 says: exit `0` a finished scan, `3` a partial one, anything
  else not run. The dependency audit and the configuration check do not run: neither tells whether
  the repository may be handed over, and the audit sends the dependency list to a registry, which a
  delivery check has no reason to do. The report names both as not run under this mode. A path the
  `tree` or the supply-chain scan prints is shown, in the session and the report, in the form the
  history scan printed the same path in, with every host and local part redacted; a path the history
  scan did not print is shown with each segment that ends in a confirmed domain, is a private
  address, or holds an `@` replaced by `<redacted: host>` or `<redacted: email>`.
- **No threat walk.** Steps 3 to 5 do not run: the mode answers whether the repository may be
  handed over, not whether the code is secure, which is a run of its own. A supply-chain candidate is
  listed in the report for its owner and triaged per `references/supply-chain.md`; it does not
  decide the verdict, and neither does a supply-chain scan that ran in part, which the report names.

## The internal domains

The domains that make an address or a host the company's are not stored anywhere, in the profile or
in an override, and are confirmed on every run. Where the owner gave them with the request, they are
the list. Otherwise the run proposes one before the walk:

1. `node <this skill>/scripts/history-scan.mjs --domains` from the repository's root. It reads the
   identities and the remotes only, and prints each domain the author, committer and tagger
   addresses use, with how many addresses use it, and the domain of each fetch and push URL of each
   remote: each folded to the part a company registers, `ci.example.com` printed as `example.com`,
   and an address, a machine name, a private or internal host, a name with no dot or an address with
   no domain printed by its class alone. Refs and remote names are printed with any host in them
   redacted. It prints no address, no host and no URL. Its exit codes read as the walk's.
2. The proposal is every domain it printed except a class and the public ones: a domain anyone can
   sign up to, a mail provider (`gmail.com`, `googlemail.com`, `outlook.com`, `hotmail.com`,
   `live.com`, `yahoo.com`, `yahoo.co.jp`, `icloud.com`, `me.com`, `proton.me`, `protonmail.com`,
   `fastmail.com`, `qq.com`, `naver.com`, the Japanese carriers' `docomo.ne.jp`, `ezweb.ne.jp`,
   `softbank.ne.jp`, and any other the owner names), or a code host's own (`github.com`,
   `gitlab.com`, `bitbucket.org`, their no-reply addresses folding into them); and the client's,
   where the person names the client.
3. One question to the owner: the proposal, the domains left out and why, and that a domain added
   later means running again. The run continues once it is answered, with the list as given. An
   empty list is an answer, run with no `--internal`: then only the hosts of the other classes below
   are reported. Where the owner is not in the session, the walk runs with no `--internal`, the
   proposal is never written down as confirmed, and the domains line stays open with the owner's
   name; a list confirmed later means running again.

The report names the confirmed list and who confirmed it. Neither the list nor the answer is written
anywhere else.

## Where the report goes

`<docs root>/derived/security/delivery/`, with the docs root resolved per `shared/artifact-paths.md`:
the report at `<run-id>-report.md` and the detail file at `<run-id>-detail.tsv`, one `<run-id>` per
Progress log in the same file for both, and a suffix, where one is needed, taken by both together.
Where the docs root is not inside the repository being handed over, the directory is
`docs/derived/security/delivery/` at that repository's root, since the history scan writes its
detail file only inside the repository it walks. `--out` moves neither: under `--delivery` it moves
only a security record the person asked for.

1. The ignore file. First the real path of the directory, or of the nearest part of it that exists,
   symbolic links followed, must sit inside the repository, as Where it lives in
   `shared/run-trace.md` asks of a trace directory; where it does not, the run writes nothing and
   says so. Then `<directory>/.gitignore` holding the single line `*`, created with the harness's own
   file write where it is missing, which makes the directories it needs. Where it is present,
   whatever it holds, it is never written to.
2. The check. `git check-ignore -q` on the path of the report and on the path of the detail file,
   from the repository that holds the directory. Both must pass before anything is written.
3. When either fails, a negation in the project's `.gitignore` the usual cause, the run says which
   check failed, that no report and no detail file were written, and, where it created the ignore
   file in step 1, that it is there for the owner to keep or delete; then it stops before the walk. There is no other place to write: not a temporary
   directory, which a reboot clears and which Windows does not keep private, and not the security
   record, which is committed to the repository being handed over.

The history scan checks the `--detail` path again and exits `2` where git would track it. The detail
file holds each email and host in full, with its commit, its full path and line, and a row for every
other hit whose path names a host, with that full path; the session never opens it, and takes from
the script's output only its path and how many rows it holds. It is for the owner, who has to find
each one.

Git is the only thing the ignore file keeps the report from. A docs generator, an archive or an
image build that reads the docs root reads `derived/security/delivery/` too, and would publish the
commit, path and line of every leak, unless the project leaves `derived/` out of it.

An ignored file still leaves in a copy or an archive of the working directory, this directory and
every other ignored file of the working tree with it. The report says that how the repository is
handed over is the owner's decision, and that a handover by copying or archiving the working
directory deletes this directory first, and is better made from the tracked files alone. A handover
by push or by a bundle of the refs carries no ignored file.

## Triage

Each hit becomes one line of the report's items table, cited by commit, path, line and kind, never by
its value; a path that names a host is cited as the script printed it, the host redacted. `Open` is
the state of every line until the owner, or the person the last column names, answers it.

| Hit | Judge it by | Open until | Who answers |
|-----|-------------|------------|-------------|
| `secret`, `at_head: present` | The Secrets in tracked files row of `references/threat-checklist.md`, cited once with the `tree` scan's hit | The credential is rotated and the line removed, or its owner confirms a placeholder | The credential's owner |
| `secret`, `removed`, `path-gone` or `null`, or at no path, in a message | The Secrets in history row of the same file: Critical, since the client receives the commit; `null` is a hit HEAD could not be compared with, ranked as `removed` | The credential is rotated, or its owner confirms a placeholder | The credential's owner |
| `credential-file`, any shape but the dump one | Never read: the owner says what it held | Every credential it held is rotated, or the owner confirms it held none; and the owner confirms it names no internal host or address, or a new run over a rewritten history no longer finds it | The file's owner |
| `credential-file`, shape `a .sql or .csv over a megabyte` | Never read: the owner says whether it holds real data | The owner answers | The file's owner |
| `email`, an identity or a message | The address's domain is a confirmed one, or an internal host: the client learns who worked on the project and how to reach them | The owner confirms it may go, or a new run over a rewritten history no longer finds it | The owner |
| `email`, in content or a path | The same, at its file and line | The owner confirms it may go, or a new run no longer finds it | The owner |
| `host`, `confirmed domain` | A host of the company named in a file, a path, a ref or a message: a server, a registry, a build machine | The owner confirms it may go, or a new run no longer finds it | The owner |
| `host`, `private address`, `loopback name` or `internal suffix` | Whose network it is. The client's own staging or internal host is something to confirm, not a leak: the owner says so and the line closes. A four-part version number read as an address is closed the same way | The owner confirms whose it is and that it may go, or a new run no longer finds it | The owner |

Choosing an option below closes no line: a line closes on the answer the table names, or on a run
over the history as it will be handed over, which no longer finds it.

Three more lines are open on every run until the owner answers them:

- **The refs.** `scanned.refs` lists the refs the clone holds and `remotes` when each remote was last
  fetched; a branch the clone never fetched, or a host's own refs such as `refs/pull/*`, was not
  walked. The owner confirms that the refs listed are every ref to be handed over, or fetches what is
  missing, and the run walks again. A hit whose commit no ref to be handed over reaches closes when
  the owner names that ref as not handed over.
- **The domains.** The confirmed list, and who confirmed it, an empty list included.
- **What was not read.** `binary_skipped` file versions, and any path the repository stores through
  Git LFS, whose content is not in the history the scan reads: a spreadsheet, a database file or an
  LFS object can hold what the scan would have found. LFS paths are found by searching the tracked
  `.gitattributes` files at `HEAD` for `filter=lfs`, with a search that returns the file and the line
  number and not the line, and by asking the owner whether an earlier history used LFS. Where
  `binary_skipped` is zero, the search found nothing and the owner said no, this line does not open;
  where the search did not run, it opens.

## The verdict

`READY` only when all of these hold:

- The history scan exited `0` and the `tree` scan ran. A partial history scan, or one not run, leaves
  the history unknown, and unknown is not ready.
- No line of the triage table is open.
- The refs, the domains, and what was not read have each been answered by the owner.

`NOT READY` otherwise, with every open line, the reason it is open, and the person who answers it.
The verdict is the rule's, never the run's opinion: the answers that closed lines are the owner's,
each named in the report, and an item nobody answered stays open. A run that finds nothing still
needs the refs and the domains confirmed.

## The owner's options

Listed in the report with what each costs, for the owner to choose; the run carries out none of
them, and none is its decision:

- **Rotate first.** Every credential the report names is revoked and replaced at its source, whatever
  is chosen for the history. Removing a value from the history does not take it from the clones and
  forks that already hold it.
- **Hand over a fresh history.** A new repository holding the tree at `HEAD`, cleaned, as its first
  commit. The client receives no past commit, identity, message or file; the team keeps its own
  history, and the two no longer share commits.
- **Rewrite the history.** A history rewrite tool removes the files and lines the report names from
  every commit. Every commit after the first change gets a new id, every clone must be replaced, and
  open pull requests and signed tags break. Rotating first still applies.
- **Map identities.** Each internal address is replaced by one the client may hold, as part of a
  rewrite. A `.mailmap` file changes only how git displays an address: the commit objects handed over
  still hold the original.

## The report

Written to the ignored directory above, for the owner; it is never committed, staged, or offered
for a commit. It holds, in order:

- **In short.** The verdict, the counts of open lines by kind, and the one thing the owner has to do
  first.
- **Scope.** The repository, the commit of `HEAD`, the refs walked, the remotes by name with their
  last fetch, whether each scan finished, `binary_skipped`, and the checks of step 2 this mode does
  not run.
- **Domains.** The confirmed list and who confirmed it.
- **Items.** The triage table's lines and the three lines after it: kind, class or shape, the redacted
  form the script printed, commit, path, line, `at_head`, `Open` or `Closed`, and who closed it with
  what they said, through the mask of The data a record must not carry in
  `skills/qa/references/test-run.md`, so an answer quoting an address or a host carries neither.
- **Supply chain.** Each candidate with its rule, path and line, triaged per
  `references/supply-chain.md`, and whether the scan finished.
- **Detail file.** Its path and how many rows it holds.
- **Options.** The four above.
- **Handing it over.** The warning on copies and archives above.

No value appears in it, no local part of an address and no host in full: those are in the detail
file alone. The session gets the verdict, the counts by kind, and the report's path.

A security record is not written under `--delivery` unless the person asks for one. One written
carries the verdict, the counts by kind, and the report's path, and no commit, path, domain or host,
since it is committed to the repository being handed over.
