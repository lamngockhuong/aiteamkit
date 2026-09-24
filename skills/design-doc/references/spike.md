# Spike

Loaded by `atk:design-doc` under `--spike`. A spike is a time-boxed investigation that answers one
question a design cannot be written without: whether a library does what its page says, whether the
current schema can take a change, how long a migration of the real data would take. It ends in a
record and a recommendation, and the choice stays with the Tech Lead.

## Before starting

**One question.** Restate `--spike "<question>"` as a question with an answer the design can use:
"Can the payment provider's SDK refund part of an order?", not "look into payments". Name the
decision it unblocks and the options in step 3 of `SKILL.md` that the answer would separate. A
question that separates no options is not worth a spike, and the record says so and stops.

**The time box.** Ask who set it and how long it is, unless the ticket already says. The time box is
the PM's or the Tech Lead's call, because it spends the sprint, so it is recorded with their name
rather than chosen here. A spike with no time box is research with no end.

**What would count as an answer.** Write down, before looking, what evidence would settle the
question either way. Evidence chosen after the result is known finds what it was looking for.

## The investigation

Three kinds of evidence, in the order that costs least:

| Kind | How | What the record keeps |
|------|-----|-----------------------|
| The repository | Read the code, the schema, the reference documents, the history of the area | `path:line` for each claim, as step 2 of `SKILL.md` requires |
| Outside sources | Official documentation, the changelog, the issue tracker of the library, through the host's web search capability where the harness has one | The URL, the version the source describes, and the date it was read. Without a web capability, the record lists what should be read and by whom |
| A prototype | The smallest code that tries the thing for real, against a local environment | Where it lived, what it ran, what it showed, and that it was discarded |

A prototype is evidence, not a head start. It stays out of the change the design leads to: in a
scratch directory or a branch named for the spike, never merged, and the record says which. Code
written to answer a question skips the conventions, the tests, and the review that code written to
ship goes through, and a prototype that slips into the change carries all of that debt with nobody
having agreed to it.

A claim from an outside source that matters to the answer is checked against the version the project
uses. A page that describes the next major version is a common way for a spike to answer the wrong
question.

## When the time box runs out

Stop, and write what is known. An unfinished spike that says what it did not reach is useful; one
that quietly runs twice as long has spent time nobody approved. Extending the box is a question for
whoever set it.

## The spike record

Front matter per `shared/artifact-paths.md`, with `status: IN REVIEW` and the Tech Lead as approver,
then:

1. **Question.** As restated above, with the decision it unblocks and the options it separates.
2. **Time box.** How long, who set it, and how much of it was used.
3. **What would count as an answer.** As written before looking.
4. **What was done.** Each piece of evidence, of the three kinds above, with its citation.
5. **Findings.** What the evidence says, each finding tied to the evidence behind it, and how sure
   it is: confirmed by a prototype, stated by the source for this version, or inferred.
6. **Recommendation.** Which options the findings rule out, which they favour, and why. A
   recommendation, not a decision: the Tech Lead chooses when the design is written.
7. **Still unknown.** What the spike did not answer, each with the person who can answer it or the
   next spike it would need.

The design that follows links the spike record from its current-state or options section, and the
spike record links forward to the design once it exists.
