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
still holds, and `--parallel` is how a review buys it. What the runs of this kit showed is its price,
which is why the default does not pay it; the section on copies below gives the numbers.

What copies of one instruction cannot do is cover ground the instruction never pointed at. Give five
agents the same "read the diff and find every kind of defect" and they read the same part of it and
miss the same part of it. Removed lines are the clearest case: deleted code is not in the file for
anyone to read past, so a general instruction misses it systematically rather than at random. The
second failure is drift: an agent told to hold eight concerns at once stops holding the first ones by
the twentieth file.

So the work is cut twice. A **round** is one review job, and the rounds together cover what one
general instruction leaves out, and they run on every review. **Copies** are N identical runs of
that one job inside a round, run only when a person asks for them, and they are what the union of
passes still buys. Merging and vote counting happen inside a round, never across them.

## The nine rounds

They are not a second list living alongside step 4 of the skill. Step 4 names eight things to look
for. Six of them become one round each; item 2, correctness and regressions, becomes three, because
that is where defects hide and the three read different things; readability becomes none.

Each round says what it opens first, what makes it return nothing, and which of the eight baseline
items in `shared/review-checklist.md` it carries.

| Round | Step 4 item | Opens first | Skipped when | Baseline item it holds |
|---|---|---|---|---|
| `criteria` | 1 | The requirement and design from step 1 | Step 1 found neither a requirement nor a design | |
| `lines` | 2 | Each hunk, then the function around it | Never | |
| `removed` | 2 | The deleted lines alone | The diff deletes nothing | |
| `callers` | 2 | Call sites and callees of what changed | No signature, return type, raised error, exported name, or documented meaning of an exported symbol changed | Every caller of a changed signature or contract is updated |
| `boundary` | 3 | Inputs and states, not lines | Never | Error paths and edge cases are handled |
| `exposure` | 4 | The surfaces in and out: logs, responses, URLs, storage, migrations | The diff touches no input, output, storage, log, or schema | Input crossing a trust boundary is validated; a migration is reversible or says it is not |
| `tests` | 5 | The test tree | The diff changes no behavior | New or changed behavior has a test that fails without the change |
| `contract` | 6 | The six triggers in `shared/spec-docs.md` | None of the six fired | Public behavior change is reflected in the docs that describe it; under `Contract: first`, see below |
| `rules` | 7 | The resolved conventions document, its checklist section | Never. There is no structural stop: see below | No secret, token, key, or credential in the diff; no debug statement, no commented-out code, no `TODO` without a ticket |

**Assigning a baseline item to a round.** An item goes to the round whose *method* is what finds it,
and stays in `rules` when no method beyond comparing the diff against a written rule is needed. Six
of the eight need a method of their own: knowing whether every caller was updated means going and
grepping for them, which reading the diff will never tell you. The other two, a debug statement left
behind and a credential literal in the diff, need nothing but the comparison, and the comparison is
what `rules` already does. Both are scans that read the same lines and answer yes or no, so neither
belongs to a round that has to go looking. Someone adding a ninth item applies the same test rather
than deriving it again. It is also why `rules` runs once: multiplying a mechanical scan buys
nothing.

**A repository with no running code.** `atk` is one, and so is any documentation, content, or
prompt project: what ships is Markdown that an agent reads. Four rounds name a code surface, and
each has one substitution, so the analogy stops being invented once per run:

| Round | What it opens where nothing runs |
|---|---|
| `exposure` | What the changed instructions cause to be written, sent, posted or published, and where that lands |
| `tests` | Whatever the repository can check without a person: its evals, its schemas, its verification commands. New behaviour none of them can catch is the finding |
| `contract` | The repository's own synchronisation rules, the ones naming which files must change together |
| `callers` | Every other file citing what changed: by section number, heading, flag, rule id, or count |

A round whose substitution finds nothing to open is skipped and names the substitution it looked
for, the same as any other skipped round.

**`contract` under `Contract: first`, and on any `screen` document.** Where the profile says
`first`, and for a `screen` document under either line, the reference document is the agreed
contract, per `shared/spec-docs.md`, and the round reads it the other way round: it checks
the diff against the document as well as the document against the diff. A change that implements an
item differently from the document is `BLOCKING`, unless the same change carries the document back
to `IN REVIEW` for its approver, which moves the disagreement to the person who owns it. An item the
document still counts as not implemented is no finding while the diff leaves its code alone, and
neither is its old behaviour still running. Once the diff implements the item, the mark no longer
shields it: code that departs from the item is `BLOCKING` as above, whether or not the mark is still
on, and a mark the change should have taken off, because the code now agrees, is `SHOULD FIX`.

**`rules` does not switch itself off.** A project that has recorded no conventions is exactly the
case `shared/review-checklist.md` covers: `atk:review` checks the baseline anyway and reports that
the project has recorded nothing. A `rules` round that fell silent there would go quiet at the one
moment it has something to say. It is never skipped; it can only come back empty.

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

By default, one. Every round runs exactly once, and copies are what `--parallel <N>` asks for.

Copies still buy what they always did: a second pass over the same question finds some of what the
first missed. What the runs of this kit showed is how little of that they buy on the rounds that
start from the diff, and what it costs. On one 1,864-line change a single finding came back from 11
of 13 agents, and the five most-reported findings from 6 or more. On a 568-line change spread over
22 files, the earlier table spent 15 agents. The copies were mostly paying for the same finding
twice, and the bill landed on every review, including changes that only moved prose between files.
So the default takes its coverage from the round list, which is where coverage lives, and leaves the
copies to a person who asks for a deeper pass.

When copies are asked for, the rule on which rounds get them still holds: **a round that has to go
looking runs several copies; a round that only has to compare against a list runs once.** Copies buy
independence, and independence is only worth paying for where the agent does not know in advance
how many things there are to find. Three copies of a comparison return the same answer three times.

| Group | Rounds | What the agent is doing |
|---|---|---|
| Searching | `lines`, `boundary` | Reading for defects with no list of what to expect |
| Half and half | `removed`, `callers`, `exposure` | A bounded surface to open, then reading it for defects |
| Comparing | `criteria`, `contract`, `rules`, `tests` | Checking the diff against a list that already exists |

### The band: how the rounds are spread over agents

The size of the change decides one thing: whether all nine rounds run in one reviewer agent or each
in an agent of its own. It picks neither the rounds nor the copies. What measures that size is
**changed lines**, both sides of the diff counted:

| Band | Changed lines | Where the rounds run | Agents |
|---|---|---|---|
| 1 | 500 or fewer | All nine rounds and the sweep, in one reviewer agent spawned for the whole review | 1 |
| 2 | more than 500 | One agent per searching and half-and-half round, one agent holding the four comparing rounds, one for the sweep | 7 at most |

**Band 1 hands the whole review to one agent.** The session that asked for the review is usually
the one that wrote the change, and it carries every reason the author had. A reviewer holding those
reasons reads the diff the way the author meant it, which is the one reading `shared/team-roles.md`
rule 2 exists to prevent. It is also the most expensive context in the run: every tool call re-sends
the whole session, and a review makes dozens of them. A fresh agent starts with neither.

It is given the target, the paths to the requirement, plan or design, the conventions document, and
the report already at the output path when there is one, and nothing from the conversation. It runs
the skill from step 1 to step 6 as the calling agent of this file: it finds the intent from those
paths, runs the rounds in order, takes the sweep and the verdicts itself, and writes the report. It
returns the session summary of the skill's `## Output` and the report path, and the session that
spawned it relays that and nothing more. Under `--comment` the reviewer agent posts nothing: the
session shows the list from the report and posts on consent, per `## Ticket` of the skill. A harness
whose spawned agents cannot spawn agents of their own is the reason this stops at band 1: above it
the session has to dispatch the rounds itself.

Lines rather than files, because lines are what an agent has to read and files are only where they
sit. The number of files changes nothing. In this repository a change runs anywhere from 6 to 71
lines per file, so a file count punishes the change that edits one paragraph in each of twenty
documents and their mirrors, which is the cheapest kind of change to read. An earlier rule raised
the band past twenty files; on forty measured changes it sent eight of them to the most expensive
band that their line count alone would not have put there, and it is gone.

Five hundred is where that history splits. Fixes and documentation changes sat at 450 lines or
fewer, and what lay above 500 was almost all new skills and cross-cutting features, the changes
worth a clean context per round. On those forty changes the band spawns 124 agents, 26 of them
single reviewers, where the earlier table spawned 264. The number is a judgement, not a measurement
of where one agent starts to drop concerns, which is why the report carries the band and the count
behind it: the threshold moves on evidence, not on a feeling that a review was thin.

**A generated file counts toward neither number.** A file the repository regenerates is not read line
by line by anybody; it is an artifact of its source, checked by reading that source and the command
that writes it. Counting it measures work nobody does, and it takes very little of it to move a
change up a band: in one run 515 of 1,864 changed lines were an `openapi.yaml` and an
`api-types.generated.ts`, 28% of the number that chose the band.

Exclude a file only on evidence that the repository regenerates it: a header line saying so, a
codegen configuration or command that writes it, or a build step that emits it. The usual shapes, a
`.generated.` infix, a `generated/` or `__generated__` directory, a client or schema emitted from a
specification, are where to look and never the proof, because a project that hand-writes its
`openapi.yaml` is holding source there. Where the evidence is absent, count the file.

**For a file the diff touches, the evidence has to come from outside that file.** A header line is
text the change under review can add, so taking it at face value lets an author decide how closely
their own work is read: one line at the top of six hundred hand-written ones, and those lines leave
the count, possibly drop a band, and are never read closely. Require a codegen configuration, a
command, or a build step that names the path, and read it at the base of the diff. A header line on
its own is enough only for a file the diff does not touch.

The report carries both numbers and the files that came out between them, per
`references/report-format.md`, so a reader who disagrees with an exclusion can see it rather than
re-derive it.

**Out of the count is not out of the review.** The exclusion takes a file out of two numbers and
out of nothing else. Every round still opens it when its own job needs it, and three do: `contract`
and `exposure`, because a diff in a generated file is evidence that its source moved; and `callers`,
because a generated client or type is exactly where an exported signature changes while the code
calling it is written by hand. A `callers` round that treated the exclusion as a smaller diff would
find no signature change, close as skipped, and leave nobody checking that the callers were updated.
The mechanical scans of `rules`, for a credential or a debug statement, read the whole diff for the
same reason: a secret committed inside a generated file is committed.

What the exclusion says is that reading a generated file line by line is not work. It never says a
contract may move unwatched.

A run says which band it was in and what put it there, so a reader who thinks the review was too
thin, or too expensive, can see the number that decided it.

### `--parallel <N>`: the deeper pass

The flag works at any size. A person who types it on a 150-line change has asked for depth, and the
band does not overrule them. Under the flag every round runs in an agent of its own, the four
comparing rounds still share one, and the copies are:

| Group | Copies |
|---|---|
| Searching | N |
| Half and half | N - 1, never fewer than 1 |
| Comparing | 1 |

| `--parallel` | Round runs | Agents, sweep included |
|---|---|---|
| 1 | 9 | 7 |
| 2 | 11 | 9 |
| 3 | 16 | 14 |

These are the most a run asks for; a skipped round takes its agents with it. `--parallel 1` is not a
no-op: it spawns the rounds with no copies, for a person who wants a clean context per round on a
change the band would have kept in one agent. The flag overrides the band, never the cap below: an N
above what the machine allows drops to the measured value, and the review says so in one line.

### The machine's cap, and the cost

Cap the run by the machine before spawning anything. Read the available memory (`free -m` on Linux,
`vm_stat` with `sysctl hw.memsize` on macOS, `systeminfo` on Windows) and allow roughly 1.5 GB per
concurrent agent. The cap counts every agent in flight at once, which is not one round's worth: the
dispatch rule below keeps a second round running while the first is synthesized. Without copies that
is two agents, about 3 GB, and the cap rarely bites. Under `--parallel 3` it is two rounds of up to
three copies, about 9 GB, and it bites on an ordinary laptop, as it is meant to: it is the number
that decides what the run may do, and the tables above are only what the run would ask for. Where
the memory cannot be read under the flag, hold the searching rounds at 2 and the half-and-half
rounds at 1.

**Say what it will cost before the first agent is spawned.** The round list, the band, the copies
and the cap are all known by this point, so the run states the three numbers it has derived: how
many round runs, how many agents, and the concurrency the machine allows.
`shared/host-capabilities.md` holds why, and the rule is not local to this file: the total of a run
is stated rather than bounded, because a person who can see it can stop it or pay it. The run does
not wait for an answer; the line is there so that stopping it is possible. A review that announces
its cost after a rate limit has stopped it has told the person nothing they could use.

Band 1 without `--parallel` states it in one line: one reviewer agent, nine rounds, nothing in
parallel. A harness with no parallel agents says instead that it spawned nothing and ran the nine
rounds in the session. Neither sentence is skipped, because a reader who finds no cost stated cannot
tell a run that owed none from a run that owed one and kept quiet.

## When an agent does not come back

An agent that dies halfway returns what it had, or nothing at all, and neither is distinguishable
from a pass that looked and found nothing. `shared/host-capabilities.md` names that as the reason to
bound concurrency; this is what to do once it has happened anyway.

Three states, named once and used everywhere after this, because a report has to keep them apart and
two of them used to share a word:

| State | What happened |
|---|---|
| `skipped` | The round's subject is not in the diff, so it never ran. The `Skipped when` column above says what that condition is for each round |
| `empty` | It ran, opened its subject, and reported nothing. That is a result |
| `dead` | It did not come back: the harness reported it killed, it ended mid-sentence, or it returned neither findings nor any statement of what it opened |

The three are never merged, and the report carries them as three different rows.

| What died | What to do | What the report says |
|---|---|---|
| Some, not all, copies of a replicated round | Close the round on the copies that returned, and count `[k/N]` over those, never over the number dispatched. Where only one copy comes back, its findings carry the round name rather than `[1/1]`, exactly as a round that only ever ran once does | How many copies returned, of how many were dispatched, and why the rest are missing |
| A whole round: no copy of it returned, or it had only one | Re-run it once | That it was re-run, or, if the second run died too, that the round could not be run |
| The closing sweep | Re-run it once. It has no copies, and what it looks for is what nothing else in the run is looking at | That it died and was re-run, or that the review shipped without a sweep |

Re-run once, not until it works. A second death is usually the first cause again, and a review that
keeps paying for it is spending the author's time on the harness rather than on the diff.

A review missing a round or a sweep is still a review, and it says so: name the question nobody
asked, so the author reads the list for what it is. What is not allowed is the silence, a review
carrying nine rounds' worth of confidence on eight.

## Which rounds may share an agent

Only comparing rounds, and only when every round being combined is a comparison. Never combine two
searching rounds: doing that recreates the agent that forgets its earlier concerns, which is the
whole reason the rounds exist.

Wherever the rounds are spawned, one agent holds all four comparing rounds; where nothing is
spawned there is nothing to combine. They are not split further under `--parallel`, because they
take no copies and four comparisons fit in one context.

Combining changes the number of agents, never the number of rounds: by default above the band 9
round runs land in 6 agents, under `--parallel 2` 11 land in 8, and under `--parallel 3` 16 land in
13. The closing sweep adds one more agent of its own, so a run comes to 7, 9 and 14. Those numbers
are what a report can be checked against, which is the reason they are fixed rather than left to
judgement. Each round still reports under its own name, and a combined agent returns its rounds
separately rather than as one pile. For the dispatch rule below, a combined agent counts as one
round, because it is issued once and returns once.

## How the calling agent drives them

**Dispatch one round ahead.** Issue the next round while synthesizing the current one, so the
synthesis hides behind the next round's run time instead of adding up nine times. Never dispatch all
nine at once: sixteen runs landing in one place puts the calling agent into exactly the forgetting
that this model spares the subagents. One round ahead, no more.

**The cap wins over the dispatch rule**, which is the order `shared/host-capabilities.md` sets. Both
rounds in flight are counted against the memory the machine reported, and where the two together
exceed it, the round ahead is what yields: run one round at a time and say so in the report's
run-shape section. Dropping copies to keep the second
round in flight is the wrong trade, because copies are what a searching round finds with and the
dispatch rule only buys back wall clock. A run that yields here is slower and is still the review
the band asked for.

**A round does not see what earlier rounds found.** Shown the list, an agent works toward it, and the
union of independent passes, which is what the whole design rests on, shrinks to a re-reading.
Duplicates between rounds are ordinary rather than rare, and synthesis deduplicates them. The one
pass that must see the list is the sweep at the end, whose job is finding what the list is missing;
it is not a round, and the section below says why.

**Which rounds overlap, and which earn their place.** The five that start from the diff, `lines`,
`removed`, `boundary`, `callers` and `exposure`, converge hard: on one 1,864-line change a single
finding came back from 11 of 13 agents, and the five most-reported findings from 6 or more. The four
comparing rounds behaved the way the split intends, at one run each: `criteria`, `contract`, `rules`
and `tests` each brought back something no other round saw.

So a high count says a finding is easy to see from the diff. It does not say the finding matters,
and ranking by it would put the obvious ahead of the absent, which is the one thing `criteria`
exists to catch. Severity comes from the failure a finding causes, never from how many agents
noticed it.

The rule binds what is handed to a spawned round. Where one context runs every round, the band-1
reviewer agent without the flag and a harness with no parallel agents, it necessarily holds
everything: run the rounds in order and keep only the deduplicated list between them, which is the
next rule and is as close to the blindfold as one agent can get.

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
Then once, after the last round has closed, across rounds:

7. **Deduplicate again**, by the same test as step 2. Duplicates between rounds are ordinary, so this
   pass is not a formality.
8. **Keep every tag.** A finding two rounds raised carries both, in the order the rounds ran:
   `[3/3 lines] [2/2 boundary]`. Dropping one would hide that two different questions reached the
   same line.
9. **Take the highest severity, not the majority.** Across rounds the majority rule of step 5 does
   not apply: the number of rounds that noticed something is not evidence about it, and a round
   that saw the worse consequence is not outvoted by two that saw a milder one. Say in the finding
   which round set the severity.
10. **Renumber** in the skill's own order, severity first, into the severity-prefixed identifiers of
    `references/report-format.md`: `B`, `S`, `N`, from 1 within each severity, never one sequence
    across the three. The cap in the skill's step 6 applies to that final merged list, never to one
    round's and never to one copy's.

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

In band 1 without `--parallel` the reviewer agent runs the sweep itself, like everything else. It
started fresh, so the competition above is smaller there, and a spawned agent cannot always spawn
another.

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

Five things, and no more: the band the change fell in and the counts that put it there, gross,
net of what the repository regenerates, and naming the files that came out between them; the cost
stated before anything was spawned, and any deviation the cap forced on it; whether the calling
agent, which takes the verdicts and the ranking, was a fresh reviewer agent or the session that
wrote the change, as it is above band 1, under `--parallel`, and on a harness that cannot spawn;
which rounds ran, which were skipped and why, which came back empty, and which died; and a `[k/N]`
tag on each finding a replicated round raised, every tag kept where more than one round raised it,
with a round name on the rest and the sweep's own findings labelled as coming from the sweep. A
reader who knows three of three copies raised something reads the list differently from one who
does not, and a reader who thinks the review was thin can see the number that decided how wide it
went.

Five things is what the rounds owe the report. The report holds more than three sections, and
`references/report-format.md` is where the rest of them and their order live.

The review is still one model's work, and the report never presents a count as agreement between
people. `shared/team-roles.md` rule 2 holds at any number of rounds: the reviewer is a person, and
this is what that person reads before they start.

## When the host cannot spawn agents

The nine rounds run one after another in the session that asked for the review, and the report says
so: that the reviewer shared the author's context, above the band that the rounds shared one context
too, and under `--parallel` that the copies asked for were not run. That is the degradation rule in
`shared/host-capabilities.md`.

This is where the round model costs less than the one it replaced. Losing the ability to spawn loses
the reviewer's distance from the author, the separate context each round gets above the band, and
any copies asked for, and nothing else: the coverage lives in the round list, and the round list
runs in full on any harness.
