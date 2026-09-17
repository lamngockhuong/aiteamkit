# UI checks

Loaded by `atk:verify` under `--ui`, after the application is up and while the runtime assertions in
`references/runtime-checks.md` are being made. It adds one question to the run: does the screen match
what was designed, and does it stay matched when the window is not the size the developer had open.

The loop does not change. Same start, same ceiling of three rounds, same escalation by name, same
cleanup. Only the assertion changes.

## What to compare against

In this order, first one that exists:

1. The design, wherever the `Docs` section of `.atk/profile.md` says designs live.
2. The acceptance criteria, when they describe the screen in words.
3. The screen as it was before the change, captured from the branch point.

Nothing in the list is "how it looks to me". A UI verification with no reference is a person saying
the screen looked fine, which the report should then say in exactly those words rather than dressing
it as a comparison.

Where no design exists, say so and verify what can be verified: the states below, the console, and
the behaviour. A missing design is a finding for the person who owns the screen, not a reason to
report a pass.

## Widths

Check at the widths the project actually supports, which the design or the conventions document
names. Where nothing names them, check three and say that the choice was the skill's: a narrow phone
width, a tablet width, and a wide desktop width.

The widths are checked for the same screen in the same state. Changing the data between widths turns
a layout comparison into two unrelated screenshots.

## States, not just the screen

A screen has states, and the one that gets checked is almost always the one with comfortable data in
it. Capture each state the case involves:

- Loading, for anything that fetches.
- Empty, with no rows. This is the state most often missing from the design and most often broken.
- Populated, with realistic data, including a long string in the field that is always short in the
  mock.
- Error, the state the screen shows when the request fails.

A state that the design does not cover is reported as uncovered, with the screenshot, and goes to
whoever owns the design.

## What counts as a difference

| Counts | Does not count |
|--------|----------------|
| An element missing, or present that should not be | A rendering difference between the design tool and the browser, in antialiasing or in font hinting |
| Wrong text, wrong label, wrong number, wrong currency or date format | A sub-pixel offset that no measurement in the design specifies |
| Wrong order of elements, or wrong grouping | A colour that matches the token but not the exported image |
| Spacing or size that contradicts a value the design states | Spacing the design never specified, where the result is consistent with the rest of the screen |
| Content clipped, overlapping, or pushed off screen at any checked width | A scrollbar appearing at a width where the content is genuinely longer |
| An interactive element unreachable by keyboard, or with no visible focus state | The exact shape of the focus ring, where the design does not state it |
| A state that renders nothing at all | An animation timing difference |

The right-hand column exists because a UI report full of one-pixel findings gets skimmed, and the
element that is actually missing gets skimmed along with it. When a difference is judged not to count,
that judgement is the skill's and the report says so, so a person can disagree with it.

## The console

Capture console output for the whole session, and read it as an assertion rather than as background
noise.

Report every error. Report warnings that name the change's own components or requests. A framework
deprecation warning that predates the change is noted once as pre-existing, confirmed by loading the
screen from the branch point rather than assumed, and then left alone.

A failed network request in the console is a finding even when the screen looks correct. It usually
means a fallback rendered, and the fallback is what was verified.

## Interaction

Where the case is a flow rather than a screen, walk it: the real clicks, the real typing, the real
submission. Then assert the side effect through `references/runtime-checks.md` like any other case. A
flow that ends with the screen saying it worked has verified the message, not the outcome.

## Evidence

Screenshots go in the directory `shared/artifact-paths.md` names for them, which sits beside the
report and carries the same slug. One file per screen per width per state, named so that a reader can
tell which is which without opening it.

A UI finding is a screenshot plus a sentence. The sentence says what the difference is and which
reference it is measured against. A screenshot with no sentence makes the reader do the comparison
again; a sentence with no screenshot makes them take it on trust.
