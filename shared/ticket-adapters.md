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
| Sprint | Project iteration field | Sprint | Milestone | Version / Sprint field |
| Estimate | Custom field or label | Story Points | Estimated hours | Estimated time |
| Owner | Assignee | Assignee | Assignee | Assigned to |
| Status | Project status field | Workflow status | Status | Status |
| Release | Release / tag | Fix Version | Milestone | Target version |

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
