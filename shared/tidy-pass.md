# The tidy pass

What tidying a change actually looks for, so the step produces the same thing whether the harness ran
its own clean-up capability or a skill worked through the list by hand. Referenced from
`skills/<name>/SKILL.md` as `shared/tidy-pass.md`, which is `../../shared/tidy-pass.md` relative to a
skill file.

Cited by `fix`, `implement`, and `verify` through `shared/host-capabilities.md`, which owns when the
pass runs, what bounds it, and what the record says afterwards. Read that file first. This one is
only the content of the pass.

## What this file does not decide

- **The scope.** The calling skill fixed it already: the code this change touched, and in `atk:fix`
  only the lines the fix itself touched. Nothing here widens it.
- **The verification.** `shared/layer-verification.md` says what to run and what a pass proves, with
  command names from the Commands section of `.atk/profile.md`.
- **The project's rules.** They come from `docs/conventions.md` through `shared/review-checklist.md`.
  A rule this pass wishes existed but the project never recorded is a convention gap for
  `atk:convention` to record, not a preference to apply while nobody is looking.

## Three lenses

Work through all three, then act once. A finding from one lens often disappears under another: code
worth extracting under clarity is code that should have reused an existing helper under reuse.

### 1. Reuse

- New code that an existing utility, helper, or shared module already does.
- Hand-rolled string, path, date, environment, or type-guard logic where the project has an
  established API for it.
- A second conversion, mapper, or formatter beside one that already exists.
- Look in the neighbouring files, the shared modules, and the tests before concluding there is
  nothing to reuse. A helper is usually found in the tests of the module that owns it.

### 2. Clarity

- State that can be derived from state already present, kept as a second copy instead.
- An effect, watcher, or subscription layer that exists only to keep those two copies equal.
- Copy-paste blocks with small variations, where a local helper would say it once.
- Nested ternaries and conditionals three levels deep, which guard clauses or a lookup table flatten.
- Stringly typed values where the project has a constant, an enum, a union, or a route helper.
- A parameter added to an interface that was already hard to read, where the call shape is the real
  problem.
- Comments that restate the code, narrate the change, or name a ticket. A comment survives only when
  it carries a constraint or an invariant the code cannot show.

### 3. Efficiency

- Work repeated inside the change: the same file read twice, the same call made per item, a query
  inside a loop over what one query would have returned.
- Newly blocking work on a path that runs often: startup, a request, a render, an event handler.
- Updates that fire when nothing changed, in a poll, an interval, a listener, or a reducer.
- Growth with no bound and cleanup with no owner: a cache that only fills, a listener never removed,
  a read that widened from one row to the whole table.
- An existence check before an operation that will report the same failure anyway, which only adds a
  race between the two.

## What may be changed

Only what is high confidence and behaviour preserving. Behaviour includes the outputs, the error
handling, the permissions, the transaction boundaries, and the performance characteristics the change
was built to have.

A finding the pass is unsure about is not applied. Say it in one line in the record and leave it: an
uncertain clean-up applied silently is the one the reviewer has to reverse engineer.

## What is never changed here

- A domain abstraction, a type that protects an invariant, or a layer boundary, on the grounds of
  being verbose. Verbose and wrong are different findings.
- Anything shared, meaning an exported function, a type, a route, or a public string, unless every
  reference was searched first: direct references, type references, string literals, dynamic imports,
  re-exports, tests, and mocks. Where that search is too wide for this pass, the rename is separate
  work and goes in the record as such.
- Code this change never touched, however obviously it could be improved.
- Anything done to make the diff shorter for its own sake: clever one-liners, merged functions, an
  abstraction invented for two call sites.

## After the pass

Read the resulting diff before running anything, and look for the accident: a condition inverted
while being flattened, a default lost while being extracted, an early return that now skips a line it
used to run.

Then re-verify per `shared/host-capabilities.md`, narrowest check first. A clean-up that breaks a
check is reverted rather than debugged, and the record says it was.
