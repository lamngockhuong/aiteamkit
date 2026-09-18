# Parallel review

Loaded by `atk:review` when it decides how many reviewers to put over the change. It holds the width
rule, what each reviewer is given, and how their findings become one list.

The policy this file may not overrule is in `shared/host-capabilities.md`: same scope for everyone,
synthesis in the calling agent, a lone finding checked before it is reported, and no width turning a
review into an approval.

## Why several passes at all

One pass over a diff finds what that pass happens to look at. Independent passes over the same diff
disagree, and the disagreement is the signal: a defect four reviewers out of five report is worth
the author's attention before one that a single reviewer mentioned once.

That only works when the passes are independent. Reviewers given a file each are not reviewing the
same thing, so their agreement means nothing and their silence means less.

## Choosing the width

Start from the size of the change:

| Changed files | Reviewers |
|---------------|-----------|
| 5 or fewer | 1, which is the calling agent itself |
| 6 to 20 | 3 |
| more than 20 | 5 |

Then cap it by the machine, before spawning anything. Read the available memory (`free -m` on Linux,
`vm_stat` with `sysctl hw.memsize` on macOS, `systeminfo` on Windows) and allow roughly 1.5 GB per
reviewer. Take the lower of the table and the cap. Where the memory cannot be read, use 3 rather
than the table value: an unmeasured machine lowers the width instead of blocking the review.

`--parallel <N>` overrides the table, not the cap. An N above what the machine allows drops to the
measured value, and the review says so in one line. `--parallel 1` forces the single pass.

Never spawn a reviewer for a change of five files or fewer. The synthesis costs more than the second
opinion is worth at that size, and the calling agent has already read the whole diff.

## What the calling agent does first, once

Hoist everything whose result is the same for every reviewer. Work repeated by N reviewers costs N
times the wall clock to reach one answer, and the width comes out of that budget.

- Step 1 of the workflow: the requirement, the design, and the acceptance criteria. A reviewer with
  no stated intent performs a style check, and N of them perform N style checks.
- The changed-file list, and the diff, written somewhere every reviewer can read.
- The convention rules that apply, resolved from the project's conventions document per
  `shared/review-checklist.md`, with their IDs and text. Resolving them once is also what stops five
  reviewers quoting five different readings of one rule.
- Any compile or type check over the changed tree. It is a function of the tree, identical for every
  reviewer, and its pre-existing failures need separating from introduced ones exactly once.

## What each reviewer is given

The same prompt, differing in nothing:

- The intent from step 1, and the acceptance criteria it was built to.
- The full changed-file list and where to read the diff. The full list, for every reviewer.
- The convention rules with their IDs and text, and the instruction to cite the ID and quote the
  rule.
- The compile or type check result, with the note that it is not to be re-run.
- The severity scale from the skill, and the rule that a finding must name a concrete failing input
  or a broken contract to be reported at all.
- The instruction to read around the changed lines rather than whole unchanged files, which is what
  keeps a large diff inside one reviewer's context.

A reviewer returns its own findings, each with file, line, severity, the failure it causes, and a
concrete suggestion. It does not rank against other reviewers, because it cannot see them.

## Merging what comes back

1. **Collect** every finding from every reviewer, keeping which reviewer raised it.
2. **Deduplicate.** Two findings are the same when they cite the same file within about ten lines and
   describe the same cause, however differently they are worded.
3. **Count.** Each unique finding carries how many reviewers raised it, as `[k/N]`.
4. **Check the lone ones.** A `[1/N]` finding is read against the code before it is reported. It is
   either confirmed and reported like any other, or dropped silently. A finding nobody else saw is
   as likely to be the sharpest one as it is to be wrong, and the only way to tell is to look.
5. **Reconcile severity.** The majority severity wins. A tie takes the higher one and says in the
   finding why it was raised.
6. **Renumber** the surviving findings in the skill's own order, severity first.

## What the report adds

Two things, and no more: the width that ran and why it was that number, and a `[k/N]` tag on each
finding. A reader who knows three of five reviewers raised something reads the list differently from
one who does not.

The review is still one model's work, and the report never presents the count as agreement between
people. `shared/team-roles.md` rule 2 holds at any width: the reviewer is a person, and this is what
that person reads before they start.

## When the host cannot spawn agents

Run the single pass, and say in the report that the review was one pass because the harness offers
no parallel agents. That is the degradation rule in `shared/host-capabilities.md`, and the sentence
is what keeps a one-pass review from being read as a five-pass one.
