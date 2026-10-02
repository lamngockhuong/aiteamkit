# Drafting trigger cases

Loaded by `atkx:skill-eval` under `--draft-cases`, and by the trigger mode when the evaluated skill
has no `evals/trigger_evals.json`. The draft is a proposal for the author to read. It is written
outside the repository and copied into the skill only when the user says yes, because cases nobody
has read measure nothing, and a file appearing in a teammate's skill unasked is a change they did
not make.

## Where the draft goes

`<dir>/<name>-<YYMMDD-HHMM>.json`, where `<dir>` is a directory made for this draft with
`mktemp -d` in the operating system's temporary directory (`$TMPDIR` or `/tmp`, `%TEMP%` on
Windows): fresh and private, never a fixed name another user on the machine could make first and
swap the draft in, and never a path inside the repository. The time is the current one, read from
the clock. Show the path and the whole draft in the session.

Then ask one question: write it to `<skill>/evals/trigger_evals.json`? On yes, copy it there and
confirm it parses as a non-empty array of `{query, should_trigger}`. On anything else, leave the
skill as it was; the temporary file stays for the user to edit. When the skill already has the file,
never overwrite it: the draft is shown beside it as cases the user may add.

## What the draft holds

The shape every skill's cases use:

```json
[
  { "query": "summarise the changelog for the release mail", "should_trigger": true },
  { "query": "write the release notes from the merged pull requests", "should_trigger": false, "belongs_to": "atk:release" }
]
```

- **Positives**, about ten: requests this skill should take, phrased the way a person types them,
  with and without the trigger phrases. Two or three may begin with the skill's own slash command;
  the trigger mode records those as skipped, so they cannot be the only positives.
- **Positives in every language of the description.** When the `description` lists triggers in
  several languages, the draft has positives in each of them, and not as translations of one
  sentence: each in the way a speaker of that language would ask.
- **Negatives**, about as many: requests that sound close and belong to another skill. Each carries
  `belongs_to`, the full name of the skill that should take it. Find the neighbours among the skills
  beside the evaluated one, in the same `skills/` directory or plugin, and in other installed kits the
  host lists; read their descriptions before writing a case that claims to be theirs. A negative
  with no named owner is a guess about where a request goes, and the trigger mode cannot tell it
  from a gap.

`belongs_to` is extra to the `{query, should_trigger}` shape and harmless to anything that reads
only those two fields.

## How to choose them

Start from the description: every trigger phrase gets a positive that uses it and one that does not.
Then the neighbours: for each sibling whose description overlaps, write the request that sits on
the line between the two, once for each side. Those pairs are where a description fails, and a
draft made only of easy cases scores well and proves nothing.
