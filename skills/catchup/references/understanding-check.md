# Understanding check

Loaded by `atk:catchup` in step 5, epic mode only. Holds the fixed questions, the feature type
table, and the two rules that decide whether the section is worth anything.

## The rule the whole file exists for

The value is in the developer writing the answer. It is not in the file existing, and it is not in
the answer being correct on the page. Reading a supplied answer feels exactly like understanding and
is not understanding, which is why it is the failure this section is built to prevent.

So, two hard constraints:

1. **Every reference answer is folded.** It goes inside `<details>`, collapsed, under the question
   it belongs to. Never beside it, never in a table column, never in a list below the group.
2. **Question 10 is never answered.** Not in any group, not in a folded block, not as a hint. It
   belongs to the developer alone. It also closes the group: nothing goes after it, whatever else
   the group gained. The rule names the question rather than its position, because a group that
   picks up extra questions still has to leave this one unanswered and last.

## Grouping

The units are already written down by the time this file is loaded: they are the rows of section 4
of the brief, from `references/brief-template.md`. Take the groups from that table rather than
listing the units again, so the two sections are checkable against each other. No group is anything
but a row there.

Not every row is a group, though, and this file owns which ones are. A row folds into another when
its ten questions would be answered twice:

- an endpoint, a job or an entity that one screen reaches folds into that screen, because the
  screen is where a person meets it. One that several screens reach, or none, stays its own group;
- a unit the spec mentions only in passing, with no fields, no actions and no states described,
  folds into the nearest row that has them, rather than producing ten questions about a sentence.

What is left after the folding is the groups. Never one group for the whole epic: an epic-wide set
of questions gets epic-wide answers, which are the answers that sound right and mean nothing. An
epic that reaches one unit has one group, and that group is the unit rather than the epic.

## The ten fixed questions

Ask all ten per group. The last column says which role owns the answer when the spec does not have
it, so a gap found here arrives at step 6 knowing where it is headed. It gives a role, not a name;
step 6 is where it becomes a person.

| # | Question | Role that owns the answer when the spec is silent |
|---|----------|-------------------------------|
| 1 | What can a user do here that they could not do before, and which user is that? | PM |
| 2 | Which roles can reach this, and what does a user without that role see? | BrSE/BA |
| 3 | Where does each field come from: which table, which endpoint, which call? | TL |
| 4 | Which values are computed at read time and which are stored, and what happens to a stored one when its input changes later? | TL |
| 5 | What does each action write, in what order, and what state is left behind when the second write fails? | TL |
| 6 | Which rows does a given user see: their own, their team's, all of them? Where is that filter enforced? | BrSE/BA |
| 7 | What states can this record be in, which transitions exist, and which of them are one way? | BrSE/BA |
| 8 | What is shown for each boundary: nothing, one, many, too many, permission denied, concurrent edit, partial failure? | QA |
| 9 | Which words in the spec are domain terms with a precise meaning, and what is each one? | BrSE/BA |
| 10 | Which of the questions above could you not answer from the spec? | the developer, alone |

Question 10 is the one that matters. The other nine exist to make it answerable.

## Feature type questions

Classify each group, then add at most three questions from its row. Adding all of them everywhere
returns the section to a checklist nobody reads.

They go between question 9 and question 10, numbered `9a`, `9b`, `9c`. Lettered rather than counted
on, so that `question 10` names the same question in every group whether that group gained three of
these or none. That is the question constraint 2 above is stated against, and a group where it has
drifted to number 13 is a group where the constraint is easy to lose.

| Feature type | Extra questions |
|--------------|-----------------|
| CRUD screen | What is validated on the client, on the server, and in the database? What happens to related records on delete? What does the user see after a successful write? |
| List, search, filter | What is the default sort and where does it come from? Which filters combine, and with what logic? What happens past the page size the data actually reaches? |
| Report or aggregation | What period does a number cover, and in which timezone? Is it recomputed or cached, and by what? Which rows does the total exclude? |
| Batch or scheduled job | What happens when a run overlaps the previous one? Is a rerun safe on the same input? Where does a partial failure leave the data? |
| External integration | What happens when the other side is slow, down, or answers differently? Who owns the credential and where does it live? Is the call retried, and is retrying safe? |
| Authentication or permission | Where is the check enforced, server side or in the UI only? What happens to an open session when a role changes? Which routes are deliberately public? |
| File import or export | What is the accepted size and format, and what is rejected? What happens on a row that fails halfway through? Where does the produced file go and who can read it? |
| Notification | What triggers it, and can that trigger fire twice? Who receives it and can they turn it off? What does it contain that must not leak? |
| Money or payment | Which currency and rounding rule applies, and where is it enforced? What happens when the charge succeeds and the record does not save? What is the refund or reversal path? |

### On this table moving

This is the kit's first feature type classification. When `atk:estimate` grows one for sizing, the
two must be one table, not two: a project cannot have features classified one way for questions and
another way for effort. The destination is `shared/feature-types.md`, because `shared/` is where a
rule that two or more skills need belongs. Until that move happens, do not build a second
classification anywhere in the kit.

## Shape of one group

```markdown
### <Screen or unit name>

1. <question>

   <details><summary>Reference answer</summary>

   <answer, with the file path or the spec line it came from>

   </details>

... questions 2 to 9 in the same shape ...

9a. <question from the feature type row, up to three, same folded shape>

10. Which of the questions above could you not answer from the spec?

    <no reference answer, ever>
```

## Questions for the spec author

Everything question 10 turns up, plus everything this skill could not resolve while writing the
brief, goes into one block at the end of the artifact, ready to paste as a tracker comment.

One line per question, and each line carries all three of:

- the question, in the words the spec author will recognise;
- where it was already looked for, so the answer is not "it is in the spec", naming the documents,
  the tracker comments, and the files searched;
- the person who must answer, by name. Never a team, per rule 1 in `shared/team-roles.md`.

At most ten lines. A question the spec does answer is not a gap, it is a search that stopped early,
and every one of those in the block costs the whole block its reader.
