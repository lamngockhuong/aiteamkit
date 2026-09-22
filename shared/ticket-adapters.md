# Ticket adapters

Shared tracker mapping for every `atk` skill. Referenced from `skills/<name>/SKILL.md` as
`shared/ticket-adapters.md`, which is `../../shared/ticket-adapters.md` relative to a skill file.

`atk` is tool-agnostic. The Markdown artifact is the source of truth; a tracker holds a pointer to
it. Push to a tracker only when the user asks, and never create tickets in bulk without showing the
list first and getting a yes.

## Detect the tracker

Check in this order, stop at the first hit, and say which one you picked:

1. The user named one in the request.
2. The project `CLAUDE.md` / `AGENTS.md` / `CONTRIBUTING.md` names one.
3. Ticket IDs in recent git log: `ABC-123` suggests Jira, `#123` suggests GitHub Issues,
   `PROJ-123` also appears in Backlog.
4. A configured CLI or MCP server is available: `gh`, a Jira MCP, an Atlassian connector.
5. Otherwise: stay in Markdown and tell the user no tracker was detected.

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
