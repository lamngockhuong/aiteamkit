# The cheap pass and the ranking

Loaded by `atkx:doc-audit` at its steps 2 and 3. Given a directory, every document in scope gets a
pass that reads no code, so the full audit is spent on the documents a person picks. Given files, the
same pass runs on them before the full audit, for its contradictions and broken citations.

## What runs

1. **The citation check.** `node <this skill>/scripts/cite-check.mjs [--code <dir>] --exclude
   <mirror>... <files or directory>`, one `--exclude` per language mirror, per records directory, and for
   `<docs root>/derived/`, all left out at step 1. Its JSON is read as data; what each field means is below.
2. **One agent per batch of documents**, each document read alone, for the contradictions inside it
   and the two signals only reading finds. A batch is as many documents as fit the agent's context
   with room to spare; spawned as `references/safety.md` section 3 says.

### The prompt

```
<the rules under "What every prompt carries" in references/safety.md, then the table of its
section 1 with the two paragraphs under it, and the kinds table of its section 2, quoted whole>

You read each document below alone, without opening any code and without comparing it with any
other document. Documents: <paths>.

For each document return:
- Contradictions: every pair of its own lines that state one rule two ways, a value, a status, a
  limit, an example that breaks the rule it illustrates, each pair as path:line and path:line and
  one sentence saying what differs. "none" when there is none.
- Flow: yes when the document describes a sequence of states or steps that crosses more than one
  screen, service, batch or import; no otherwise.
- Behaviour: about how many sentences state what the system does, as opposed to how to work on it.

Return one block per document, and nothing else.
```

## What `cite-check.mjs` reports, and what it means

| Field | Meaning for the ranking |
|-------|------------------------|
| `counts.broken` | Citations that are missing, out of range, or stale: a line that no longer holds the identifier cited beside it. A document whose citations rotted has usually rotted in prose too |
| `counts.directories` | Distinct directories its citations land in. A document spanning many is a summary of many code paths, where the pilots' wrong claims clustered; it is also the sign of where in the cost range a full audit falls |
| `counts.withLine`, `counts.withoutLine` | Citations with and without a line. Few lines means the reader cannot check a claim quickly, and neither could the author |
| `counts.outside`, `counts.unread` | Citations that leave the repository or name an unread file; listed in the report, not ranked |
| `counts.lines` | Length, for the batch size; not a ranking signal, since cost does not follow length |

A citation is a Markdown link target, or a span in backticks or a bare token shaped like a path:

- A span or token with no slash is one only when it carries a line and a source-file extension,
  `app.js:3`, or names a file of the unread-path table; `README.md` alone is a name, not a citation.
- One with a slash but no line and no source-file extension counts only when it resolves, so a MIME
  type, a route or a date format is not one.
- A link's label is not one. A link target resolves from the document's directory, as a code host
  resolves it; a leading `/` resolves from the repository root.
- A partial path in a span, written relative to a module, is found by its ending when exactly one
  tracked file has it.
- An absolute path whose first segment is a directory at the repository root is a repository path,
  and `missing` when the rest is not there; any other absolute path is `outside`.

## The ranking

In this order, each signal breaking the ties of the one before:

1. **Describes a flow** (agent): yes first. The status-flow document of the first pilot was wrong in
   22 of 43 claims, against 3 and 4 in the two documents about one feature.
2. **Contradicts itself** (agent): more pairs first.
3. **Behaviour across many places** (agent and script): more behaviour sentences together with more
   `counts.directories` first. In the second pilot the person's first pick, feature descriptions,
   cited few files and ranked low on citations alone, while their full audit found 55 wrong claims in
   one document.
4. **Broken citations** (script): more first.
5. **Few line citations** (script): a lower share of `withLine` first.

Left out of the ranking and named in the report as left out: the language mirrors, and records,
`records/` of the docs root and any directory the profile names for records, since a record is an
account of a moment and its citations are expected to go stale. In the second pilot, records ranked
above everything on broken citations alone. A record named as a file is still audited.

## Checking citations by hand, without Node

The session does what the script does, and the report says the citation check was done by hand:

1. List every citation per the shape above, in each document, outside code fences.
2. Before opening anything, refuse a path that leaves the repository, by `..`, an absolute path
   outside it per the shape above, or a link, and a path the unread-path table of
   `references/safety.md` names, matched without case.
3. For each remaining citation, check that the file exists and that a cited line is within it; where
   an identifier in backticks sits on the citing line, check that it appears within three lines of
   the cited one.
4. Count per document as the table above names the fields, twice, and keep a count only when the
   two passes agree.
