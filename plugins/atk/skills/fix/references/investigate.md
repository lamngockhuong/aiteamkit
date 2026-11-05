# Investigation

Loaded by `atk:fix` while it proves the cause and checks intent. The steps below, then the gate that
decides whether a fix is allowed to happen at all, then the shape the result takes.

Steps 1b and 5b carry a letter rather than a number so that the intent check stays at six, where
every other file refers to it.

The order is the content. Each step exists because skipping it produces a specific wrong answer, and
the note under each one says which.

## Step 0: capture before touching anything

Copy, do not paraphrase: the error message or the failing assertion, the minimal steps that
reproduce it, what was expected, and what happened instead. Include the environment: which app,
which branch, which data.

This is the baseline the final verification compares against. Paraphrasing loses the detail that
turns out to matter, usually a number, an identifier, or the exact wording of a message that is
searchable in the code.

Skipping it produces a fix that cannot be shown to have fixed anything.

## Step 1: restate the symptom

Input, observed output, expected output, environment. Four lines, no interpretation yet.

A symptom that cannot be stated this way is not yet a bug report. Go back to the reporter rather
than investigating a guess about what they meant.

## Step 1b: find the spec the bug was logged against

The expected output in step 1 is the reporter's words, and the reporter tested against a
specification. Find it before the code is traced: a link in the ticket, its parent issue or epic,
and the place the Tracker section of `.atk/profile.md` names under `Spec lives in`. Read it through
`shared/ticket-adapters.md`, comments included, since a spec on a tracker is often updated or settled
in a comment; a spec kept in a wiki or a drive is read only through a ready connection, per Read
through a connection in `shared/host-capabilities.md`. Quote the clause on the reported behaviour,
with the issue or page and the comment it is in.

When none is found, ask the person running the skill where it is, and write down the answer,
"there is none" included. Ask only where the expected output is a behaviour a spec decides. A crash,
an error or lost data with no ticket needs no spec, and a review finding under `--findings` has its
review as its record: write why none applies, and ask nothing. Two comments that disagree, with nothing saying which one settled it, are
two records, for step 6. This step only reads, so it runs under `--investigate-only` too.

Skipping it produces an investigation that checks the code against what the reporter expected
rather than against what was agreed, and a decision handed to someone who does not own the spec.

## Step 2: locate the surface

Map the screen, the endpoint, the job, or the command to the code that serves it. Use the Layers
section of `.atk/profile.md` to know where that layer lives. Cite the entry point as `path:line`.

Skipping it produces an investigation in the wrong layer, which can run a long way before the
evidence starts contradicting itself.

## Step 3: trace to the source

Walk the data backwards from where it is wrong to where it became wrong, crossing layers as needed:
view to state, state to call, call to handler, handler to query, query to data. Stop at the line
that produces the wrong value, not at the first one that looks suspicious.

The distinction that matters: the place the symptom appears is rarely the place the cause lives. A
fix applied at the appearance point hides the cause and leaves every other caller broken.

## Step 4: why now

Run `git log` on the files in the trace, in the session: an agent handed the wide trace, on Claude Code, has no
shell and returns the question rather than the answer. Find the change that made this reachable, and name it. When
there is none, "broken since it was written, never exercised on this path" is a complete answer, and
a more useful one than silence.

Skipping it produces a fix for a symptom whose real cause is a recent change somewhere else, which
comes back the next time that change is touched.

## Step 5: prove it

Exactly one of these three, and it goes in the report verbatim:

| Form | What it must contain |
|------|----------------------|
| A red test | The test, its name, and its failure output before the fix |
| A direct reproduction | The command or request, and the output showing the wrong behaviour |
| The responsible lines | The quoted lines as `path:line`, plus a specific check showing they produce it |

"It looks like the cache is stale" is a hypothesis. "Line 44 reads the cache before line 51
invalidates it, and the log at 09:14 shows the read at the old value" is evidence.

### The ceiling: three hypotheses

A hypothesis is stated before it is checked, and the check either turns it into evidence or rules it
out. Three of them per defect, counted across the whole run, and the count goes in the report whether
or not it was reached. Past the third the investigation of that defect stops and hands over what it
has, and the other defects carry on. A defect is the failure as captured, not its description:
restating it or splitting it into parts continues its count.

It stops there because the fourth hypothesis is where the cost changes shape. The cheap places have
been looked at, and what is usually left is a question about how the thing was meant to work, which
is somebody's knowledge rather than another search. Carrying on past that point is how an
investigation turns into changing things to see what happens, which is exactly the order this
skill exists to prevent.

Three hypotheses ruled out is a real result, and losing it is what makes the next person repeat it.
The handover carries four things and is not complete without the fourth:

1. Each hypothesis in the order it was tried, with what was checked and what ruled it out.
2. The captured failure and its reproduction, unchanged.
3. Where the search went: the files, the symbols, and the logs already read.
4. The name of the person who has to look, from the `Team` section of `.atk/profile.md`.

The working tree is untouched, because no change was allowed before the cause was proven and it
never was. `--investigate-only` does not alter any of this: that flag ends the run after the intent
check, Step 6 of this file and step 2 of `SKILL.md`, in every case, and the ceiling decides only whether the report carries a cause or a list of what is not
the cause.

## Step 5b: blast radius

The proven cause names the code that is about to change. Find everyone else who depends on it before
deciding what to change: search for the symbol and for the route, the event name, or the query it
serves; follow the imports upward; check the tests that currently exercise it. Say which searches
were run, because an incomplete search and an empty result look identical in the report.

List each caller as `path:line`. This list is what the verification step walks at the end, and it is
the first thing a reviewer compares against the diff, so a caller left off it is a caller nobody
checked.

## Step 6: intent check

Before the behaviour is called wrong, look for the record that says it is right:

- the spec step 1b quoted;
- a design document or an ADR under the docs root named in `.atk/profile.md`;
- an assertion in a test, especially one whose name states the rule;
- a commit message that explains the choice;
- a comment naming the constraint that forced it.

Then say which of four cases the records make, and write it into the result:

- **The code contradicts them**: a defect. Go on.
- **They say nothing**: where the expected output is a choice a spec could have made, ask the
  owner of the requirement, by name, and stop until they answer, since a fix would settle what
  nobody decided. A crash, an error or lost data needs no spec to be wrong, and a review finding
  under `--findings` has the review and its author's answer as its record; go on.
- **Two of them contradict each other**: the decision conflict gate, in its second form.
- **They confirm the current behaviour**: the report was logged against something they do not say.
  The decision conflict gate, in its first form.

Found nothing is a real result, and it is written down with where the search went, each issue read
included.

## The decision conflict gate

It has two forms. In the first, the expected behaviour in the bug report contradicts a decision
found in step 6. In the second, two records found there contradict each other, a screen spec and a
technical constraint, or two specs. Either way, stop. Change no code, and present these four:

1. **The decision**, with its source: `path:line`, a test name, a commit hash, or an issue and its
   comment. Quote it. In the second form, both, each with its source, and the sentence that they
   contradict each other.
2. **The concern raised now**: what the reporter expected and why.
3. **The trade-off**: what each side gains and loses, in the team's terms rather than in code terms.
4. **Two to four concrete options**, each with what it costs. The usual four: keep the behaviour and
   correct the report; change the behaviour and update the decision record; add the exception for
   this case only; treat it as a new requirement.

Then wait for the person who owns the decision. Naming who that is comes from the Team section of
`.atk/profile.md`, its Approves column, or is asked. In the second form each record has an owner,
and they are often two people, a BrSE for the screen spec and a Tech Lead for the constraint: name
both, and put the question to both.

A skill that reverses a recorded decision because the newest report disagrees with it has made the
team's call for them, quietly, in a commit. That is rule 3 in `shared/team-roles.md` broken in the
one place where it costs the most.

## The result block

The steps above produce this, and it goes into the report unchanged:

```markdown
**Cause**: <one sentence, the mechanism, not the symptom>
**Location**: <path:line>, and every other file in the trace
**Evidence**: <one of the three forms, verbatim>
**Why now**: <commit hash and subject, or "broken since written">
**Layer**: <the layer name from .atk/profile.md>
**Blast radius**: <every other caller of the code that will change, as path:line>
**Spec**: <the issue or page, the comment, and the clause quoted; "asked <name>: <answer>"; or "none needed: <why>">
**Recorded intent**: <what step 6 found and which of its four cases, or "nothing found; searched <where>">
```

An empty blast radius asserts that nothing else calls this, so it carries the search that
established it.
