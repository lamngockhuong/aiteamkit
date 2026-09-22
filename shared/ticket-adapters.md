# Ticket adapters

Shared tracker mapping for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/ticket-adapters.md`, which is `../../shared/ticket-adapters.md` relative to a skill file.

`atk` is tool-agnostic. The Markdown artifact is the source of truth; a tracker holds a pointer to
it. Push to a tracker only when the user asks, and never create tickets in bulk without showing the
list first and getting a yes.

## Detect the tracker

Check in this order, stop at the first hit, and say which one you picked:

1. The user named one in the request.
2. Where the work is inside a member repository and the Tracker section of `.atk/profile.md` carries
   a line for that member, that line. A member tracking its own work is unusual, and the profile is
   the only place it is written down, so a run that skipped this step would post to the project's
   tracker instead of the member's.
3. The project `CLAUDE.md` / `AGENTS.md` / `CONTRIBUTING.md` names one.
4. Ticket IDs in recent git log: `ABC-123` suggests Jira, `#123` suggests GitHub Issues,
   `PROJ-123` also appears in Backlog.
5. A configured CLI or MCP server is available: `gh`, a Jira MCP, an Atlassian connector. Available
   is what makes this a hit; whether it answers is a separate question, and the next section is how
   to ask it.
6. Otherwise: stay in Markdown and tell the user no tracker was detected.

Detection and reachability are two steps on purpose. Folding "and it answers" into step 5 would send
a project whose only signal is an unauthenticated CLI down to step 6, which reports no tracker at
all, and that is the outcome the next section exists to prevent.

### Detected is not reachable

The tracker a project uses and the tracker this run can read are two different facts. A run that
treats them as one writes an artifact claiming the second while only the first is true.

Before the first read that matters, spend one cheap call proving access: `gh auth status` for
GitHub, the cheapest list or identity call the server offers for an MCP server, and for a REST
integration the endpoint that names the current user. Once per run, and once per distinct tracker
the run will read, which in a project where a member tracks its own work is two.

Three outcomes, and each has a sentence of its own:

| Outcome | What the artifact and the session say |
|---------|---------------------------------------|
| No tracker detected | No tracker was found, so the Markdown artifact is the only record |
| Detected and reachable | Which tracker, and what was read from it |
| Detected but unreachable | Which tracker, that it could not be read, what class of failure it was, and what is missing from the artifact as a result |

The third is not the first. A team whose tracker nobody could reach still has a tracker, and telling
them none was found sends them to set up what they already have.

A proof that succeeded does not make every later read succeed. A call that fails afterwards, a wrong
project key, a permission covering part of the board, a request that times out, puts that one item in
the third row rather than ending the run: the tracker is reachable and this reading of it was not.
Treat it as the third outcome for that item alone and carry on with the rest.

**Say what failed, not what the tool printed.** Name the class of failure, authentication expired,
host unreachable, forbidden, not found, and keep the tool's own error text out of the session and out
of the artifact. An MCP server or a REST client can put a key, a token, or a connection string into a
failure message, and the artifact this run writes is committed and travels in a pull request.
`skills/git/references/secret-scan.md` holds what a secret in a file costs; this is the same rule
arriving from the other direction.

Two things never happen on the third. Inventing the value the tracker would have given is the first:
an issue number, a sprint window, a status, a starter task. Dropping the item that needed it is the
second, because a document silently missing a section reads as a document that did not need one.
Write `TBD (ask <person>)` in its place, naming whoever can supply it, and say in the session which
part of the artifact stays unfinished until it arrives.

Who that person is comes from the run where the run knows it: the buddy in an onboarding document,
the assignee of the ticket in hand. Where it does not, the Tracker section of `.atk/profile.md` names
a repository owner and that is the default. Where there is no profile either, ask the user for the
name rather than writing a bare `TBD`, which is a hole nobody owns.

No run reads a credential out of the environment to get around this, and no run asks the user to
paste a token. Re-authenticating is the user's own command to run, and naming it is enough.

## Vocabulary map

| atk term | GitHub Issues | Jira | Backlog | Redmine |
|----------|---------------|------|---------|---------|
| Epic | Issue with `epic` label, or a Project item | Epic | Parent issue | Parent issue |
| Story | Issue | Story | Issue (type: Task) | Issue (tracker: Feature) |
| Task | Issue, or a checklist item on the story | Sub-task | Child issue | Sub-task |
| Bug | Issue with `bug` label | Bug | Issue (type: Bug) | Issue (tracker: Bug) |
| Sprint | Project iteration field, or a single-select field (see below) | Sprint | Milestone | Version / Sprint field |
| Estimate | Custom field or label | Story Points | Estimated hours | Estimated time |
| Owner | Assignee | Assignee | Assignee | Assigned to |
| Status | Project status field | Workflow status | Status | Status |
| Release | Release / tag | Fix Version | Milestone | Target version |

### The Sprint row is not a date range

A sprint name resolves to a start and an end only where the tracker stores one, and the row above
maps a concept rather than promising a window. What each tracker actually holds:

| Tracker | Where a sprint lives | Carries a start and an end |
|---------|----------------------|----------------------------|
| GitHub Issues | A Project iteration field, or a single-select field the team named `Sprint` | Only the iteration field, which has `startDate` and `duration`. A single-select holds the name and nothing else |
| Jira | Sprint | Both, once the sprint has started. A sprint still in the future carries neither |
| Backlog | Milestone | Each is a field somebody may leave empty, so read them rather than assuming a window |
| Redmine | Version, or a custom sprint field | The due date where it is set. A version has no start field at all |

Read the field type before trusting the mapping. A board whose options run `Sprint1` to `Sprint40`
looks identical to one built on an iteration field until the type is checked, and only one of them
can answer the question.

A field the tracker defines is not a field somebody filled in. Half a window, an end with no start,
is the ordinary case rather than a broken one, and it is still an unresolved window.

Where the tracker does not hold the window, neither does the repository. A cadence document, a merge
date, or a pair of QA markers gives an inference, not a record, and a sprint that slipped or was
extended breaks it silently. Ask the person running the sprint instead, for whichever half is
missing, and ask before spending queries on a window that may be wrong.

### What a tracker cannot reconstruct

A tracker shows what an item is now, not what it was. Where the API exposes no history of field
changes, which is the GitHub Project case, three sprint metrics have no source in it:

| Metric | What it would need | The substitute |
|--------|--------------------|----------------|
| Committed versus completed | The board as it stood when the sprint opened | Status as of today, carrying the date it was read and how long after the sprint closed that is |
| Items added mid-sprint | The moment each item entered the sprint | Items in the sprint created inside the window. Every one of them was added after the sprint opened, so this is a lower bound; an older item pulled in late is invisible to it |
| Items carried over | The previous sprint's closing state | The previous retro record, where the team wrote one |

Take the substitute, label it as a substitute in the artifact, and say what it measures instead. A
substitute printed under the name of the number it stands in for is worse than the gap: the reader
plans the next sprint on it.

Jira answers all three natively through its sprint report. This section is about the trackers that
do not.

## Push commands

**GitHub** (`gh`, the only adapter with a CLI assumed present):

```bash
gh issue create --title "<title>" --body-file <artifact.md> --label <label> --assignee <user>
gh issue comment <number> --body-file <artifact.md>
gh pr create --title "<title>" --body-file <body.md>
```

A skill that has to read a pull request rather than write to one, which `atk:review` and
`atk:plan --review` both do, reads it this way:

```bash
gh pr view <number> --json files,headRefName,headRepository   # which files, and which ref
gh pr diff <number>                                           # the hunks
gh pr checkout <number>                                       # the files themselves, at the head
```

The first two give paths, counts, and hunks, never whole files. A skill that has to open a file the
change touches, rather than read what changed in it, needs the third: on a pull request that edits an
existing document, the hunks alone show a fraction of it, and everything outside them looks absent.

Where the pull request belongs to a repository other than this checkout, say so and stop rather than
reading the local tree as though it were the one the change was written against.

`--body-file` on `gh pr create` takes the body built per `skills/git/references/pr-body.md`, not the
artifact as it stands: a project with a pull request template has that template as the shape, and
handing the artifact straight to the flag drops it silently.

**Jira, Backlog, Redmine**: use a configured MCP server or REST call if one exists. If none does,
do not shell out to `curl` with a token found in the environment. Print the field-by-field mapping
and let the user paste it, or ask for the credential path explicitly.

## Linking rule

Both directions, every time:

- The artifact front matter carries `ticket: <id or URL>`.
- The ticket body carries a link to the artifact path in the repository.

An artifact with no ticket sets `ticket: none`. Do not invent an ID.
