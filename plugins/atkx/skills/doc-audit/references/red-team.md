# The red team (`--red-team`)

Loaded by `atkx:doc-audit` at its step 7, only under `--red-team`. For what no source can settle, a
design's reasoning, an `INTENT` claim whose source was not given, a whole document with no code
behind it, agents read the document cold and object. Objections are never verdicts: the report keeps
them in a section of their own, and no verdict changes because of one.

It is not `atk:design-doc --challenge` or `atk:plan --challenge`: those test an `atk` draft before
its reviewers, by signing role or by the way a plan fails. This one tests any document already
written, by the way a document fails its reader.

## The four lenses

One agent per lens, per document. Each returns up to five objections.

| Lens | The question it brings |
|------|------------------------|
| A rule that cannot hold | Does the document state a rule that fails for a case it names itself, an example, a boundary, a combination it lists? |
| A failure not mentioned | What happens when a step fails, a call times out, a value is missing, a second user acts at once, and does the document say? |
| A reader it misleads | Which sentence would a tester, a developer or an operator new to the work act on and be wrong, because it is ambiguous, out of order or silently scoped? |
| A dependency it assumes | Which other system, setting, schedule, role or document must be true for the document to hold, and is never named? |

## The rules, copied from `atk`

The three blocks below are `atk`'s independent challenge, the half that makes a challenge worth
running, copied because an install of `atkx` cannot read `atk`'s files. Do not edit inside a block:
edit the origin, then copy it again; the repository's check fails on any difference.

Read them in this skill's terms: "the draft artifact" is the document audited; "the requirement it
answers" is the requirement sources given with `--source`, or none; "the citer's table of lenses" is
the table above; and an agent's model is not asked for, since `atkx` reads no profile for one.

### What each agent gets

<!-- copied from https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/independent-challenge.md#what-each-agent-gets -->
The draft artifact, the requirement it answers, the reference documents it names, its own row of
the citer's table of lenses, and read access to the repository, which is where the evidence below
comes from. Where the requirement has no document of its own, the artifact's section that states it
is the requirement. Nothing of the conversation that produced the artifact, and nothing another
agent returned. Each agent is told that it changes no file and starts nothing, per the rule that a
reviewer changes nothing in https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/host-capabilities.md, and on Claude Code is spawned as
`atk:read-only-reviewer`, whose tool list holds that rule. Its prompt also carries rule 9 of
https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/team-roles.md: the files it never opens or searches, quoted from Paths that are a finding
on their own in https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/secret-scan.md with the paragraph under that table on the two rows a search
pattern cannot express, and a secret it comes across cited by its path and key, its value
`<redacted: kind>`. An agent that has read the author's reasoning agrees with it, which
is the one result this pass exists to avoid. Every lens agent takes the `Review agent model` line,
per The model of a read-only agent in https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/host-capabilities.md.

The number of agents, the concurrency cap and any model asked for are stated before the first one
is spawned, and the cap is the machine's, under the policy for independent reviewers in
https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/host-capabilities.md: read the available memory and allow roughly 1.5 GB per agent running
at once, the measure https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/skills/review/references/review-rounds.md uses. Where the memory cannot be
read, run at most two agents at once and say so in the statement. Where the harness cannot run
agents in parallel, the lens passes run one after another in this session, and the artifact says
they shared the author's context, which makes them weaker.
<!-- end of copy -->

### What an agent returns

<!-- copied from https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/independent-challenge.md#what-an-agent-returns -->
At most five objections, or none. Each one names the section of the artifact it is about, the
failure it predicts, and the evidence: a `path:line`, an acceptance criterion ID, or a line of the
artifact itself. An objection with no named failure is a feeling, and it is dropped.

An agent that dies or returns nothing at all is not a lens that found nothing, and the two read the
same unless they are told apart. Run it once more; if it dies again, the lens is named below the table
as not run, and it is not counted among the agents that ran.
<!-- end of copy -->

### What the calling agent does with them

<!-- copied from https://github.com/lamngockhuong/aiteamkit/blob/main/plugins/atk/shared/independent-challenge.md#what-the-calling-agent-does-with-them, up to "Then answer each kept objection" -->
Check each objection against the artifact and the code before keeping it. Drop one that rests on
something the artifact does not say or the code does not do, and count the drops. Merge objections
two lenses raised about the same failure into one, carrying both lenses.
<!-- end of copy -->

## What this skill does after that

The copy stops before `atk`'s `Changed` and `Open` answers on purpose: this skill changes no
document, so there is nothing to change in response. Every objection the session keeps after checking
it goes into the report's `Objections` section, per `references/report-format.md`, as one row:

| Column | Holds |
|--------|-------|
| `ID` | `O1`, `O2`, per document |
| `Lens` | The lens, or two lenses when merged |
| `Line` | The document line it is about |
| `Objection` | The failure it predicts, in one sentence |
| `Evidence` | A `path:line`, a document line, or a requirement source, masked |
| `For` | The person who must answer, found as `references/claims.md` finds an owner |

Below the table, the agents that ran, any lens not run and why, and how many objections were dropped
as unfounded. Where nothing was kept, `None kept.` stands in place of the table, with the same lines
below it.

## The prompt

```
<the rules under "What every prompt carries" in references/safety.md, then the table of its
section 1 with the two paragraphs under it, and the kinds table of its section 2, quoted whole>

You read one document cold, through one lens, and object to it. Document: <path>. Repository root:
<repo root>. Requirement sources: <the sources file of
references/report-format.md and the --source paths that passed step 1, or "none">. Lens: <the lens and its question
from the table above>.

You have not seen any verdict on this document, and you never will. Return at most five
objections, or none. Each names the document line it is about, the failure it predicts, and the
evidence: a path:line, a line of the document itself, or a requirement source. An objection with no
named failure is dropped, so do not send one.

Return one table, and nothing else:

| Line | Objection | Evidence |
```
