# Review rounds

Loaded by `atk:review` when it decides what to put over the change. It holds the list of rounds, how
many copies of a round run, how the calling agent drives them, and how what comes back becomes one
list.

The policy this file may not overrule is in `shared/host-capabilities.md`: same scope for everyone
inside a round, synthesis in the calling agent, a lone finding checked before it is reported, and no
number of passes turning a review into an approval.

## Why rounds, and why copies

One pass over a diff finds what that pass happens to look at. Run it again and it finds something
else, so the union of several passes catches materially more than any one of them. That observation
is what this file is built on, and nothing below weakens it.

What copies of one instruction cannot do is cover ground the instruction never pointed at. Give five
agents the same "read the diff and find every kind of defect" and they read the same part of it and
miss the same part of it. Removed lines are the clearest case: deleted code is not in the file for
anyone to read past, so a general instruction misses it systematically rather than at random. The
second failure is drift: an agent told to hold eight concerns at once stops holding the first ones by
the twentieth file.

So the work is cut twice. A **round** is one review job, and the rounds together cover what one
general instruction leaves out. **Copies** are N identical runs of that one job inside a round, and
they are what the union of passes still buys. Merging and vote counting happen inside a round, never
across them.

## The nine rounds

They are not a second list living alongside step 4 of the skill. Step 4 names eight things to look
for. Six of them become one round each; item 2, correctness and regressions, becomes three, because
that is where defects hide and the three read different things; readability becomes none.

Each round says what it opens first, what makes it return nothing, and which of the eight baseline
items in `shared/review-checklist.md` it carries.

| Round | Step 4 item | Opens first | Returns empty when | Baseline item it holds |
|---|---|---|---|---|
| `criteria` | 1 | The requirement and design from step 1 | Step 1 found neither a requirement nor a design | |
| `lines` | 2 | Each hunk, then the function around it | Never | |
| `removed` | 2 | The deleted lines alone | The diff deletes nothing | |
| `callers` | 2 | Call sites and callees of what changed | No signature, return type, raised error, exported name, or documented meaning of an exported symbol changed | Every caller of a changed signature or contract is updated |
| `boundary` | 3 | Inputs and states, not lines | Never | Error paths and edge cases are handled |
| `exposure` | 4 | The surfaces in and out: logs, responses, URLs, storage, migrations | The diff touches no input, output, storage, log, or schema | Input crossing a trust boundary is validated; a migration is reversible or says it is not |
| `tests` | 5 | The test tree | The diff changes no behavior | New or changed behavior has a test that fails without the change |
| `contract` | 6 | The five triggers in `shared/spec-docs.md` | None of the five fired | Public behavior change is reflected in the docs that describe it |
| `rules` | 7 | The resolved conventions document, its checklist section | No rule and no baseline item is violated. There is no structural stop: see below | No secret, token, key, or credential in the diff; no debug statement, no commented-out code, no `TODO` without a ticket |

**Assigning a baseline item to a round.** An item goes to the round whose *method* is what finds it,
and stays in `rules` when no method beyond comparing the diff against a written rule is needed. Six
of the eight need a method of their own: knowing whether every caller was updated means going and
grepping for them, which reading the diff will never tell you. The other two, a debug statement left
behind and a credential literal in the diff, need nothing but the comparison, and the comparison is
what `rules` already does. Both are scans that read the same lines and answer yes or no, so neither
belongs to a round that has to go looking. Someone adding a ninth item applies the same test rather
than deriving it again. It is also why `rules` runs once: multiplying a mechanical scan buys
nothing.

**`rules` does not switch itself off.** A project that has recorded no conventions is exactly the
case `shared/review-checklist.md` covers: `atk:review` checks the baseline anyway and reports that
the project has recorded nothing. A `rules` round that fell silent there would go quiet at the one
moment it has something to say. Its empty condition is about findings, not about inputs.

**Why `removed` is not part of `lines`.** Deleted code leaves nothing in the file to read past, so a
single general instruction skips it every time rather than sometimes. The only way to look at it is
to be told to open it and nothing else.

**Why `criteria` cannot be folded into another round.** It is the only round that works downward from
the requirement to the code, so it is the only one that finds an acceptance criterion nobody
implemented. Every round that starts from the diff is blind to work that is absent.

**Why readability has no round.** An agent told to go and find hard-to-read code will find some,
whether or not any exists, and all of it will be `NIT`. One round like that eats the ten-finding cap
in step 6 and returns nothing in exchange. Readability stays something any round may raise when it
trips over it, and no round hunts for.

## How many copies a round runs

One sentence: **a round that has to go looking runs several copies; a round that only has to compare
against a list runs once.** Copies buy independence, and independence is only worth paying for where
the agent does not know in advance how many things there are to find. Three copies of a comparison
return the same answer three times.

| Group | Rounds | What the agent is doing |
|---|---|---|
| Searching | `lines`, `boundary` | Reading for defects with no list of what to expect |
| Half and half | `removed`, `callers`, `exposure` | A bounded surface to open, then reading it for defects |
| Comparing | `criteria`, `contract`, `rules`, `tests` | Checking the diff against a list that already exists |

The size of the change no longer picks the rounds. It only turns N up and down:

| Changed files | Searching | Half and half | Comparing | Round runs |
|---|---|---|---|---|
| 5 or fewer | 1 | 1 | 1 | 9, all in the calling agent, nothing spawned |
| 6 to 20 | 2 | 1 | 1 | 11 |
| more than 20 | 3 | 2 | 1 | 16 |

The first row is the existing rule from the skill's step 3 carried over, not a new one: below six
files the synthesis costs more than the second opinion is worth, and the calling agent has read the
whole diff already. The last row costs 16 runs where a flat N of 3 would cost 27, and gives up
nothing, because everything cut was a copy of a job that produces the same answer each time.

Then cap it by the machine, before spawning anything. Read the available memory (`free -m` on Linux,
`vm_stat` with `sysctl hw.memsize` on macOS, `systeminfo` on Windows) and allow roughly 1.5 GB per
concurrent agent. The cap applies to the agents running at once inside one round, which is at most
three unless `--parallel` raises it, so on any machine that can run the review at all it will rarely
bite. Where the memory cannot be read, hold the searching rounds at 2 and the half-and-half rounds
at 1.

`--parallel <N>` overrides the searching column, and the other two columns follow it downward but
never upward. It overrides the table, never the cap: an N above what the machine allows drops to the
measured value, and the review says so in one line. It no longer forces a total, because under this
model the total is a consequence of the round list rather than a number anyone picks. `--parallel 1`
still forces one run per round, which is what it always did.

## Which rounds may share an agent

Only comparing rounds, and only when every round being combined is a comparison. Never combine two
searching rounds: doing that recreates the agent that forgets its earlier concerns, which is the
whole reason the rounds exist.

The threshold is the one the copy table already uses, so the file carries one set of bands and not
two. From six to twenty changed files, one agent holds all four comparing rounds. Above twenty,
split them in two. Below six nothing is spawned at all, so there is nothing to combine.

Combining changes the number of agents, never the number of rounds: from 6 to 20 files, 11 round
runs land in 8 agents, and above 20, 16 round runs land in 14. The closing sweep adds one more agent
of its own, so a run comes to 9 and 15. Those two numbers are what a report can be checked against,
which is the reason the band is fixed rather than left to judgement. Each
round still reports under its own name, and a combined agent returns its rounds separately rather
than as one pile. For the dispatch rule below, a combined agent counts as one round, because it is
issued once and returns once.

## How the calling agent drives them

**Dispatch one round ahead.** Issue the next round while synthesizing the current one, so the
synthesis hides behind the next round's run time instead of adding up nine times. Never dispatch all
nine at once: sixteen runs landing in one place puts the calling agent into exactly the forgetting
that this model spares the subagents. One round ahead, no more.

**A round does not see what earlier rounds found.** Shown the list, an agent works toward it, and the
union of independent passes, which is what the whole design rests on, shrinks to a re-reading. The
rounds do different jobs, so duplicate reports are rare, and the ones that happen are deduplicated at
synthesis. The one pass that must see the list is the sweep at the end, whose job is finding what
the list is missing; it is not a round, and the section below says why.

The rule binds what is handed to a spawned round. Where nothing is spawned, at five files or fewer
and on a harness with no parallel agents, one context necessarily holds everything: run the rounds
in order and keep only the deduplicated list between them, which is the next rule and is as close
to the blindfold as one agent can get.

**What the calling agent keeps between rounds** is the deduplicated findings that have been through
the verdicts in step 5 of the skill, and nothing else. Raw output is dropped as each round closes.
Kept, it grows across nine rounds into the same overloaded context the rounds were cut to avoid.

## What the calling agent does first, once

Hoist everything whose result is the same for every agent. Work repeated N times costs N times the
wall clock to reach one answer. Under this model each hoisted thing also has a named consumer, which
makes the step worth more than it was, not less:

- Step 1 of the workflow, the requirement and design and acceptance criteria, feeds `criteria`. An
  agent with no stated intent performs a style check.
- The resolved convention rules, with their IDs and text, per `shared/review-checklist.md`, feed
  `rules`. Resolving them once is also what stops several agents quoting several readings of one rule.
- Any compile or type check over the changed tree feeds `callers`. It is a function of the tree,
  identical for everyone, and its pre-existing failures need separating from introduced ones once.
- The changed-file list and the diff, written somewhere every agent can read, feed all of them.

## What each agent in a round is given

The same prompt, differing in nothing. That holds inside a round and is false between rounds, where
the difference in scope is the point:

- The round's own job: what to open first, what to look for, and what makes it return nothing.
- The intent from step 1, and the acceptance criteria it was built to.
- The full changed-file list and where to read the diff. The full list, for every agent: rounds
  divide the question, never the files.
- The convention rules with their IDs and text, and the instruction to cite the ID and quote the rule.
- The compile or type check result, with the note that it is not to be re-run.
- The severity scale from the skill, and the instruction to return every candidate whose mechanism it
  can name, together with the trigger that mechanism depends on. An agent that quietly drops what it
  half believes has decided the verdict alone and skipped step 5, which is where most missed defects
  go.
- The instruction to read around the changed lines rather than whole unchanged files, which is what
  keeps a large diff inside one context.

An agent returns its own findings, each with file, line, severity, the failure it causes, and a
concrete suggestion. It does not rank against anyone else, because it cannot see them.

## Merging what comes back

Per round, as the round closes, not once for the whole review:

1. **Collect** every finding from every copy, keeping which copy raised it.
2. **Deduplicate.** Two findings are the same when they cite the same file within about ten lines and
   describe the same cause, however differently they are worded.
3. **Count.** Each unique finding carries how many copies raised it, as `[k/N]`.
4. **Check the lone ones.** A `[1/N]` finding goes through the verdicts in step 5 like any other
   candidate, and is reported when it comes back confirmed or plausible. Being raised once is not a
   reason to refute it: a finding nobody else saw is as likely to be the sharpest one as it is to be
   wrong, and the only way to tell is to look.
5. **Reconcile severity.** The majority severity wins. A tie takes the higher one and says in the
   finding why it was raised. A verdict of `PLAUSIBLE` holds the result at `SHOULD FIX` or below,
   whatever the majority said.
6. **Renumber** once every round has closed, in the skill's own order, severity first. The cap in the
   skill's step 6 applies to that final merged list, never to one round's and never to one copy's.

`[k/N]` means something only between copies of one round. A round that ran once carries its round
name instead: `[1/1]` would invite the reader to think eight other agents looked and disagreed, when
no other agent was ever asked the question.

## The sweep

Step 5 of the skill closes with one pass over the gaps, run once the verified list exists, after
the last round has closed and before the renumbering.

Give it its own agent, and hand it the list. The calling agent has driven every round, holds every
finding and has read the diff many times over; it is the most loaded context in the run, and the
sweep is the one job that asks for a fresh reading of that diff against that list. The two compete,
and on a large change the sweep is what loses. An agent that starts with the list and nothing else
does the same job with none of that behind it.

Below six changed files nothing is spawned at all, so the sweep runs in the calling agent like
everything else.

It is not a round. It ran last, with every round's findings in front of it, so its candidates carry
neither `[k/N]` nor a round name and are labelled as coming from the sweep. Tagging one `[1/N]` would
tell the author that other agents looked at it and stayed silent, when in truth none of them saw it.

Its candidates come back as candidates. The verdicts in step 5 and the cap in step 6 stay with the
calling agent, because what is delegated is the search and never the judgement.

Its own agent is not the same as one more round. A round runs alongside its copies and is handed no
list; the sweep runs alone, after every round has closed, and the list is the whole of what it is
given. Dispatch it with the others and it becomes one more opinion, because a pass that cannot see
the list cannot look for what the list is missing.

## What the report adds

Two things, and no more: which rounds ran, which returned empty and why, and a `[k/N]` tag on each
finding a replicated round raised, with a round name on the rest and the sweep's own findings
labelled as coming from the sweep. A reader who knows three of three copies raised something reads
the list differently from one who does not.

The review is still one model's work, and the report never presents a count as agreement between
people. `shared/team-roles.md` rule 2 holds at any number of rounds: the reviewer is a person, and
this is what that person reads before they start.

## When the host cannot spawn agents

The nine rounds run one after another in the calling agent, and the report says the review had no
copies because the harness offers no parallel agents. That is the degradation rule in
`shared/host-capabilities.md`.

This is where the round model costs less than the one it replaced. Losing the ability to spawn loses
the copies and nothing else: the coverage lives in the round list, and the round list runs in full on
any harness.
