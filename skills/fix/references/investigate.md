# Investigation

Loaded by `atk:fix` while it proves the cause and checks intent. The steps below, then the gate that
decides whether a fix is allowed to happen at all, then the shape the result takes.

Step 5b carries a letter rather than a number because it is bookkeeping on what step 5 proved, not
another thing to find out. The intent check stays at six, where every other file refers to it.

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

Run `git log` on the files in the trace. Find the change that made this reachable, and name it. When
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

- a design document or an ADR under the docs root named in `.atk/profile.md`;
- an assertion in a test, especially one whose name states the rule;
- a commit message that explains the choice;
- a comment naming the constraint that forced it.

Found nothing is a real result, and it is written down as such.

## The decision conflict gate

When the expected behaviour in the bug report contradicts a decision found in step 6, stop. Change
no code, and present these four:

1. **The decision**, with its source: `path:line`, a test name, or a commit hash. Quote it.
2. **The concern raised now**: what the reporter expected and why.
3. **The trade-off**: what each side gains and loses, in the team's terms rather than in code terms.
4. **Two to four concrete options**, each with what it costs. The usual four: keep the behaviour and
   correct the report; change the behaviour and update the decision record; add the exception for
   this case only; treat it as a new requirement.

Then wait for the person who owns the decision. Naming who that is comes from the Team section of
`.atk/profile.md`, or is asked.

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
**Recorded intent**: <what step 6 found, or "nothing found; searched <where>">
```

An empty blast radius asserts that nothing else calls this, so it carries the search that
established it.
