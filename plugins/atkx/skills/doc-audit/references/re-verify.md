# The second read

Loaded by `atkx:doc-audit` at its step 5. Every `WRONG` verdict, and a sample of the `CORRECT` ones,
is read again by an agent that did not reach the first verdict, before anything is reported.

## Why it runs

A `WRONG` verdict is what a reader acts on: a tester rewrites a case, a developer stops trusting a
page. The first agent can be wrong in the same way the document was, by reading a line that mentions
the word rather than the line that decides it. A second agent that sees the claim and the evidence,
and not the first agent's reasoning, does not inherit its path to the verdict.

The `CORRECT` sample is read for the opposite reason: a correct column nobody re-read cannot say how
far it can be trusted, and the report prints how many of the sample were overturned so a reader can
judge.

## What is read

- **Every `WRONG`.** All of them, in every document audited.
- **The `CORRECT` sample.** Per document, a tenth of its `CORRECT` verdicts, rounded up, and at least
  three, or all of them when the document has fewer than three. Chosen first among claims about a
  state transition, an error or status code, or a limit or a number, where the pilot's wrong claims
  sat, then in document order. The rate rests on one measurement: the second pilot read 16 of a
  document's 156 `CORRECT` verdicts again and overturned none, which is too few to lower it, and
  one of its 56 `WRONG` verdicts was overturned, which is why every `WRONG` is read. `scripts/tally.mjs --final` refuses a table whose sample is
  smaller, with the same rate as its constants `SAMPLE_RATE` and `SAMPLE_MIN`, and the two change
  together.
- **Never an `UNVERIFIABLE`.** Nothing settled it the first time, and a second agent with the same
  sources would find the same nothing.

## Who reads

One second agent per document, holding all of that document's claims to re-read, never one per
claim: a flow document with twenty wrong claims costs one more agent, not twenty. Spawned as
`references/safety.md` section 3 says, like the first.

## The prompt

```
<the rules under "What every prompt carries" in references/safety.md, then the table of its
section 1 with the two paragraphs under it, and the kinds table of its section 2, quoted whole>

You check verdicts another reader reached on one document. Document: <path>. Repository root:
<repo root>. Code root: <code root>. Requirement sources you may read: <as for the full audit>.
You fetch nothing and run no command to read a source.

For each claim below you get its number, the document line, the claim, and the evidence the other
reader cited. You do not get the other reader's reasoning. Read the document line and the cited
evidence, and anything else in the repository that decides the claim, then answer each claim with
exactly one of:

- holds: the verdict is right; give the path:line that decides it.
- overturned: the verdict is wrong; give the right verdict, CORRECT or WRONG, and the path:line or
  quoted line that decides it, and for WRONG what the source says.
- cannot tell: no source you may read decides it; say in Settled by what would.

The claims to check, one per row:

| # | Document | Line | Claim | Verdict reached | Cited evidence |
<one row per claim, # its row number in the verdict table, masked>

Return one table with one row per claim, in the order above, its # carried over, and nothing
else:

| # | Answer | Verdict | Evidence | Settled by |
```

The session matches each answer to its claim by `#`, never by line: one line often holds several
claims, a table row three of them. A `#` with no answer was cut off: the agent is asked once more
for the missing numbers, and a claim still unanswered keeps no second read, which
`tally.mjs --final` then refuses for a `WRONG`.

## What each answer does

| Answer | The row's `Verdict` | The row's `Evidence` | `Second read` cell |
|--------|---------------------|----------------------|--------------------|
| `holds` | Unchanged | Unchanged, or the second agent's when it is more exact | `<first verdict> holds` |
| `overturned` | The second agent's verdict | The second agent's | `<first verdict> overturned` |
| `cannot tell` | `UNVERIFIABLE`, with `Settled by` from the answer and the owner found by the session | Why it could not be told | `<first verdict> cannot tell` |

The session masks what comes back, reopens the decisive line of every `overturned` answer before
changing a verdict, and runs `scripts/tally.mjs --final` on the table, which refuses a `WRONG` left
unread or a sample too small.

An `overturned` answer is not trusted more than the first verdict because it came second. Where the
session's own reading of the decisive line agrees with neither, the claim is `UNVERIFIABLE`, its
reason that two reads disagreed, and both lines are named.
