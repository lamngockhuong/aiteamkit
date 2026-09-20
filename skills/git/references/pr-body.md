# Pull request body

Loaded by `atk:git` at step 4, before the pull request is shown to the user. It answers one
question: what the body of that pull request is made of when the project already has a template of
its own.

The rule is the one `shared/review-checklist.md` and `shared/spec-docs.md` state for conventions and
for documents, applied here: **the project's own shape wins**. A team that wrote a pull request
template wrote down what its reviewers need to see, and a kit that replaces it with its own artifact
has overruled the team on a decision that belongs to them.

So: the template decides the shape, the artifact provides the content, and the template is never
dropped because the artifact reads well on its own.

## Why this has to be said out loud

`gh pr create --body-file <artifact.md>` opens a pull request with no trace of the template. GitHub
fills the template only when neither `--body` nor `--body-file` is given, so the bypass is silent:
nothing fails, nothing warns, and the missing checklist is noticed by a reviewer, after the fact.
The same holds for the API and for every other host that fills a template client side.

## Where the template lives

Look in this order and stop at the first hit:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/pull_request_template.md`
3. `PULL_REQUEST_TEMPLATE.md` at the repository root
4. `docs/PULL_REQUEST_TEMPLATE.md`
5. A `PULL_REQUEST_TEMPLATE/` directory beside any of the three locations above, holding several

Both cases and both spellings, because GitHub accepts either and a case-sensitive check finds
nothing on a repository that chose the other one. A host that is not GitHub keeps its templates
somewhere else, `.gitlab/merge_request_templates/` on GitLab among them; resolve it the same way,
and where the location cannot be established, say so rather than assuming there is none.

Several templates in a directory is a choice the team made deliberately, so ask which one applies
and never pick by name order. No template anywhere is the normal case, and then the artifact is the
body, which is what this skill did before templates were read at all.

## Filling it

Every section of the template is answered, in the template's own order, from the artifact the
calling skill produced and from what this run actually did.

- **A section the artifact cannot answer** keeps its heading and gets one line saying what is
  missing and who can answer it, named per rule 1 of `shared/team-roles.md`. Never invent the
  content, never delete the section, and never leave the placeholder text standing as though it were
  the answer.
- **The artifact stays linked**, by its path in the repository, under whichever section carries the
  detail. The template is the shape the reviewer reads; the artifact is the evidence behind it, and
  a body that drops the link has lost it.
- **Instruction comments** in the template are addressed to whoever opens the pull request. Remove
  the ones whose section is now filled, and leave the ones whose section is still open, so the
  person who finishes it still has the instruction.

## Checkboxes are claims, not decoration

A checklist item in a template is somebody stating that something was done. Tick only the ones this
run verified itself, and say in the body which ones were left unticked and why. Never tick an item
that belongs to a role: a review carried out, an approval given, a release decision taken. This is
rule 3 of `shared/team-roles.md` in the one place where a single keystroke would break it.

A template whose every box arrives ticked tells the reviewer nothing, which is worse than the same
template with three boxes ticked and a line naming what is still open.

## Handing it to the host

The merged body is written to a temporary file outside the repository, and that file is what
`--body-file` receives. It is not committed: the artifact is already in the repository, and the
merged body is a copy of it in the host's shape.

Show the body before opening the pull request. The consent line in `shared/finalize-steps.md`
already requires the yes; what the user is saying yes to is this text.

## When the team wants something else

A team that wants a different body, an extra section, or a template this file would not have found
writes that into `.atk/overrides/git.md`, per rule 7 of `shared/team-roles.md`. That is the
supported road, and it keeps the customisation in the project, committed, next to the template it
talks about.
