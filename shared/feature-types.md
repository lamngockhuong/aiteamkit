# Feature types

The one classification of features in the kit. Referenced from `skills/<name>/SKILL.md` and its
references as `shared/feature-types.md`, which is `../../shared/feature-types.md` relative to a skill
file.

Cited by `catchup`, which draws the extra understanding-check questions from a group's row, and by
`estimate`, which reads the QA risk of an item from its row. One table rather than two, because a
project cannot have its features classified one way for questions and another way for effort: the
same feature would be a payment flow when a developer is asked about it and a plain form when its
testing is sized.

## The table

| Feature type | Extra questions | QA risk |
|--------------|-----------------|---------|
| CRUD screen | What is validated on the client, on the server, and in the database? What happens to related records on delete? What does the user see after a successful write? | Medium |
| List, search, filter | What is the default sort and where does it come from? Which filters combine, and with what logic? What happens past the page size the data actually reaches? | Medium |
| Report or aggregation | What period does a number cover, and in which timezone? Is it recomputed or cached, and by what? Which rows does the total exclude? | High |
| Batch or scheduled job | What happens when a run overlaps the previous one? Is a rerun safe on the same input? Where does a partial failure leave the data? | Medium |
| External integration | What happens when the other side is slow, down, or answers differently? Who owns the credential and where does it live? Is the call retried, and is retrying safe? | High |
| Authentication or permission | Where is the check enforced, server side or in the UI only? What happens to an open session when a role changes? Which routes are deliberately public? | High |
| File import or export | What is the accepted size and format, and what is rejected? What happens on a row that fails halfway through? Where does the produced file go and who can read it? | Medium |
| Notification | What triggers it, and can that trigger fire twice? Who receives it and can they turn it off? What does it contain that must not leak? | Medium |
| Money or payment | Which currency and rounding rule applies, and where is it enforced? What happens when the charge succeeds and the record does not save? What is the refund or reversal path? | High |

A feature no row describes, a display-only change being the usual case, adds no questions and
carries `Low` QA risk. Pushing it into the nearest row asks it questions about behaviour it does not
have and sizes testing it does not need.

A feature that fits several rows takes the questions of the row closest to its main behaviour, and
the highest QA risk among the rows it fits, since one untested payment path costs more than a
second question saved.

## What each column is for

`Extra questions` is read by `atk:catchup`, per `skills/catchup/references/understanding-check.md`,
which also holds how many of them a group takes and where they go.

`QA risk` is read by `atk:estimate`, per `skills/estimate/references/complexity-drivers.md`. It ranks
QA effort, and `High` caps the confidence of the QA line at `MEDIUM`. It is not a coefficient: the
hours still come from a comparable or a decomposition, as step 3 of that skill requires.

## Changing the table

A row added, renamed, or removed here changes both skills at once, which is the point. Add a row
only with both columns filled: a type with questions and no risk, or the reverse, is the second
classification this file exists to prevent, hidden inside the first. A project that classifies its
features differently writes that in its override for each skill it affects, per
`shared/project-overrides.md`, rather than here.
