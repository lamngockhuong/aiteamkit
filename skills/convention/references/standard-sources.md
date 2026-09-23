# Standard sources

Loaded by `atk:convention` at the suggest step, and by `--audit` for the sources section of its
report. The published standards the kit knows are listed in `references/standard-sources.tsv`; this
file holds what each field means, what a run may do with each line, and how a source is fetched
without pulling a whole repository.

Everything this file leads to is a **proposal**, in the sense the record format in
`shared/review-checklist.md` gives the word, and it never replaces a rule the code shows. That keeps
the premise of the skill intact: the team's conventions are still what the team does, and a
published guide is something the Tech Lead may adopt, one rule at a time.

## The list

The list is `references/standard-sources.tsv`: a header line, then one source per line, seven fields
separated by a tab, in this order:

```
tech  name  repo  path  license  checked  note
```

- `tech` is the key from `references/stack-standards.md`, so a detected technology matches its
  sources without translating names.
- `repo` is `owner/name` on GitHub, and `path` is the file or directory inside it that holds the
  rules. `path` is required, because the fetch below reads that path and nothing else.
- `license` is what GitHub reports as the SPDX identifier. `NOASSERTION` means GitHub found a
  licence file it could not match, and says nothing about what the file allows.
- `checked` is the date, `YYYY-MM-DD`, on which a person opened the repository and confirmed four
  things: the repository is alive, `path` still holds the rules, the licence terms were read, and
  the `license` field says what was read. It is evidence, not an estimate. Missing one of the four,
  the field stays empty and `note` says which one is missing.
- `note` comes last because it is the only free prose.

Tabs rather than commas because a note routinely holds a comma, and a comma-separated line would
have to quote it; a quote forgotten by hand shifts `license` and `checked` one column over, and
those two fields decide whether a line may be used at all. A new source is one more line, with no
tab inside any field. `CLAUDE.md`, under "Common verification commands", checks the field count and
the date of every line.

Seven lines carry an empty `checked`, and all seven miss the same condition: their licence terms
were read by an agent on 2026-09-23 and no person has confirmed them. The repository and `path`
were checked on 2026-09-21 and again on 2026-09-23.

C++ has no line. `isocpp/CppCoreGuidelines` was removed on 2026-09-23 by Lam Ngoc Khuong's decision:
its `LICENSE` grants use "for your personal or internal business use only", and a client project's
conventions document is not reliably internal use of whoever installed the kit. A C++ repository
run with `--suggest` says that no source exists for it, rather than returning nothing in silence.

Four more were considered and left out, recorded so nobody proposes them again without reading why:
`rubocop/ruby-style-guide`, `alexeymezenin/laravel-best-practices`, `thoughtbot/guides`, and
`bbatsov/clojure-style-guide`. None has a licence file, which means all rights reserved. They may be
named as a link for a reader to follow, never used to draw a proposal.

## What a run may do with a line

- **A line with `checked` filled and a licence that permits it** may be read and turned into
  proposals. Each proposal is one rule sentence in the team's words, with the link to the source.
- **A line with `checked` empty** may be named as a link and nothing more. Nobody has confirmed what
  its licence allows, so nothing is drawn from it until somebody does. The run says which lines it
  skipped for that reason.
- **No block of a source's text is copied** into a project document, whatever the licence. Every
  standard here carries a different licence, and a client's documentation is not the place to test
  what each one allows. The rule sentence is the team's; the link is the source's.
- **A source in HTML or PDF** is harder to draw rules from, and `note` says so, so the run knows
  before it starts rather than finding out halfway.

What a proposal records as its `source`, where it sits, and how it becomes a rule are in the record
format of `shared/review-checklist.md`.

## A team's own sources

A team that follows a standard this list does not carry adds it in `.atk/overrides/convention.md`,
inside its `## Before` section, as lines in the same seven fields in a code block, with no header
line. The kit's list is
the default and the override is laid over it, per `shared/project-overrides.md`; no new kind of file
under `.atk/` is created for it. A team line obeys the same rules as a kit line, `checked` included.

Its `repo` and `path` reach a shell command, so check both before either is used: `repo` is
`owner/name` made of letters, digits, `.`, `_` and `-`, and `path` is relative, with no `..` segment
and no leading `-`. A line failing either check, or not carrying seven fields, is named in the
report and skipped, never repaired by guessing.

## Under `--audit` and `--sync`

A project can carry dozens of proposals, each tied to a repository, a path, and a date, and nothing
else checks whether those repositories are alive, whether the source changed, or whether a proposal
has sat unapproved for months. These two flags do, for the sources a proposal in the project cites
and those matching the technologies step 2 named; the rest of the list is not the project's concern.

**Changed.** Compare the repository's last push, from `gh api repos/<repo> --jq .pushed_at`, with the
line's `checked` date. A push newer than `checked` means the repository moved since a person last
confirmed it, and the line is due for a re-check. **Gone** is a repository that answers 404.

Without `gh`, or for a source not on GitHub, `git ls-remote <url> HEAD`, prompt disabled as in
Fetching a source below, still says whether the
repository is alive; the report then says that dates could not be compared on this run. A call
that fails for one source, a rate limit or an expired login, puts that source alone in the
detected-but-unreachable row of When a fetch fails below, and the others carry on. `gh` is not
a command of the target project, so this is the kit's call, not one from the Commands section of
`.atk/profile.md`.

**Empty `checked`.** Report it as the condition its note names, in the note's words. A line whose
repository and path were checked and whose licence terms still await a person is not "never
checked", and calling it that sends somebody to redo work that was done.

**Unapproved.** Every proposal still in the proposals section, with its fetch date, so its age is
visible.

`--audit` reports these and writes nothing, and never fills a `checked` date: that date is evidence
that a person looked, so only that person writes it. For a line the team added in its override,
`--sync` is where that happens: it shows the line, and the person who confirmed the four conditions
enters the date. A line in the kit's own list is not the project's to edit; report it, and the fix
belongs to whoever maintains the kit.

Under `--sync`, a source pushed since its proposals were fetched is fetched again, and what it
yields is shown against the proposals recorded, as the change it would make, the same way step 6
shows a moved template. Only what is picked is written, and a proposal already approved into the
checklist is a rule of the team now, which a moved source never rewrites. A source that is gone is
not removed; it becomes an open question naming the Tech Lead.

## Fetching a source

Clone sparsely, never whole. The repositories above range from 282 KB for `uber-go/guide` to 2.5 GB
for `OWASP/CheatSheetSeries`, four orders of magnitude, and a bare `git clone` fails at the top of
that range:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/<repo>.git <cache>/<repo>
git -C <cache>/<repo> sparse-checkout set <path>
```

Run every `git` command here with `GIT_TERMINAL_PROMPT=0` in its environment. A repository that
moved or went private answers a clone with a password prompt, and a run waiting on a prompt nobody
sees never reaches the failure rule below.

Where `<cache>/<repo>` already holds a clone, update it with `git -C <cache>/<repo> pull --depth 1`
rather than cloning again, and record the date of that fetch as the `fetched` date. A clone already
fetched today is used as it is.

### Where the cache lives

Outside the target project, always, so the team's `.gitignore` is never touched. Take the first of
these that has a value, and keep each source under `<cache>/<owner>/<name>/`:

| Platform | Variable | Cache |
|----------|----------|-------|
| any | `ATK_CACHE_DIR` | `$ATK_CACHE_DIR/standards/` |
| Windows | `LOCALAPPDATA` | `%LOCALAPPDATA%\atk\standards\` |
| Windows | `USERPROFILE` | `%USERPROFILE%\AppData\Local\atk\standards\` |
| macOS | `HOME` | `$HOME/Library/Caches/atk/standards/` |
| Linux | `XDG_CACHE_HOME` | `$XDG_CACHE_HOME/atk/standards/` |
| Linux | `HOME` | `$HOME/.cache/atk/standards/` |

Write the path through the variable, never as `~/...`: a tilde does not expand the same way in every
shell, and Windows is where it breaks, for the same reason the hooks stay in exec form and in Node.
Where none of these has a value, skip the suggestions and say why.

### When a fetch fails

No network, `git` missing or failing, a repository that moved or went private: follow the shape of
Detected is not reachable in `shared/ticket-adapters.md` rather than inventing a second one. A
source that is on the list and could not be fetched is detected but unreachable, never "no source":
the run names the source, the class of failure, and which proposals are missing as a result. One
failed source puts that source alone in that row, and the others carry on. Do not look for a
substitute source.

The part of the run derived from the code does not depend on any of this, and comes out the same
with the network down. The general degradation rule in `shared/host-capabilities.md` still holds.

No host web capability is needed. The kit already reaches the network through shell commands, `gh`
in `atk:git` and in `shared/ticket-adapters.md`, and `git clone` travels the same road, so
`shared/host-capabilities.md` gains nothing for this.
