# Plain writing

How the prose of a run's report is written, so a person who was not in the run and has not opened
the files it cites can read it once and know what happened and what they have to do. Referenced from
`skills/<name>/SKILL.md` and its references as `shared/plain-writing.md`, which is
`../../shared/plain-writing.md` relative to a skill file.

Cited by the report templates of `fix`, `verify`, `review`, `security`, and `qa --record`, the last
also reached by `run-cases` through the run record shape it reuses, and by
`## Output` of `incident`, which has no template file: the reports that record one run and ask a person to act on it. It is what rule 4 of
`shared/team-roles.md`, write for the absent reader, means for their prose.

A report can be correct in every line and still be unreadable, when each claim is a citation the
reader has to open to understand. The evidence those reports carry is what makes them checkable; the
rules below are what makes them readable, and neither replaces the other.

## The opening summary

Every report that cites this file opens, after its title and whatever metadata line or table its
template puts under the title, with a section headed `In short`, in the team's working language per
rule 6 of `shared/team-roles.md`. Three to six sentences, in this order:

1. **What happened**, told as the concrete case: the input, the numbers, what came back. "The
   database held migrations 1 to 76 and one from another branch", not "the store diverged".
2. **What was found or done** about it.
3. **What it means** for the reader: what works now, what does not, what was not checked.
4. **What is left to decide, and by whom**: the person's name, the question, and the run's
   recommendation where it has one. Where nothing is left, say that.

It is written last, from the sections below it, and it claims nothing they do not show. A failure,
a gap, or an unverified area appears in it as plainly as in the evidence: a summary that reads better
than its evidence is the one misleading line in an otherwise honest report.

Where a template already opens with a summary of its own, that section follows these rules rather
than a second one being added beside it.

## The prose

Five rules, for every sentence around the evidence, the summary included.

1. **The example comes before the rule.** Give the case first, with the run's own values, then the
   general statement. A reader holds on to "77 applied against 81, one of them foreign" and loses "a
   mismatch in migration identity".
2. **What happened comes before what it means.** What was run, what it returned, then the
   conclusion. A conclusion stated first asks the reader to trust it before they have seen why.
3. **A citation points, it does not explain.** Read the sentence with its `path:line`, commit, or
   test name taken out. If it no longer says anything, it was relying on a file the reader has not
   opened: say in words what that line does, and keep the citation beside it.
4. **A term is said in words before it is used.** A name that belongs to the kit or to the project,
   such as the profile's `Prepare` line or a finding code, is explained once where it first appears:
   "the profile's `Prepare` line, the command that checks whether the database matches the branch".
   After that the name alone is fine.
5. **What went wrong, what changed, and what is left to decide are kept apart.** Each has its own
   paragraph or its own section, never one sentence carrying all three. A decision carries the person
   who owns it, the question as that person would answer it, the options, and the recommendation.

One idea to a paragraph, and short sentences over long ones where both say the same thing.

## What does not change

- **Evidence stays verbatim.** An error, a failing assertion, a command's output, a quoted line is
  copied as it was, never rewritten into plain words. The prose around it explains it; it does not
  replace it. A secret value inside it is masked per rule 9 of `shared/team-roles.md`, which is
  not a rewrite of the evidence and not softening.
- **What other skills match on stays as the template spells it**: severity names, identifiers,
  status values, and the headings a template marks as fixed.
- **A citation is still owed** wherever the template asks for one. Plain writing moves it beside the
  explanation; it does not drop it.
- **Nothing is softened.** A `BLOCKING` stays blocking and a missing check stays missing, in the
  summary as below it.

## Before and after

From a feedback record on a verification run. Before, every claim leans on a file:

> `runtime-checks.md:24` offers "run the rest of `Prepare`" with no condition on the store's history;
> the warning at `:47-49` is reached only on the no-`Prepare` path.

After, the same finding for a reader who has opened nothing:

> The database the run found held migrations 1 to 76 and one migration from another branch; the
> branch has 1 to 81. The skill still offered "run the migrations" as its first option, and the
> migration failed halfway, on a database another worktree was using. The skill has a warning for
> exactly this case (`runtime-checks.md:47-49`), but shows it only when the profile has no command
> for preparing the database (`:24`).

Both carry the same citations. Only the second can be acted on without opening them.
