# Case dimensions

Loaded by `atk:qa` in step 3. The dimensions to walk for each acceptance criterion once its
happy-path case exists, so negative and boundary coverage comes from a list rather than from
whatever the author happened to think of that day.

Walking a dimension is a question, not a quota. Some criteria get one case from a dimension, some
get five, most dimensions give nothing for a given criterion. What matters is that each one was
asked.

## The dimensions

| # | Dimension | Ask | Typical cases |
|---|-----------|-----|---------------|
| 1 | Actor | Who else can reach this, and what should they see? | Each role in the permission table, a signed-out visitor, a suspended account, another tenant |
| 2 | Input | What is the smallest, largest, and strangest value this accepts? | Empty, one character, the maximum and one past it, whitespace only, multibyte and emoji, a leading zero, a negative number |
| 3 | Quantity | What happens at none, one, and many? | An empty list, a single row, the page size and one past it, the last page |
| 4 | State | What if the thing is not where the happy path assumes? | First use, already done, deleted, expired, halfway through a flow the user abandoned and came back to |
| 5 | Timing | What if two things happen at once, or slowly? | Two users saving the same record, a double click on submit, a session that expires mid-form, a slow response |
| 6 | Failure | What if something this depends on does not answer? | The database or a third party unavailable, a timeout, a partial save, a retry after the first attempt succeeded |
| 7 | Environment | Where does this run that the author did not? | Another browser or device width, another locale, another timezone, a screen reader where the project requires it |
| 8 | Data | What if the data already there is not clean? | A duplicate, a record pointing at one that is gone, text saved in another encoding, a value written by an older version |
| 9 | Integration | What if the other side changes or repeats itself? | A webhook delivered twice, an older client version, a field the other side stopped sending |
| 10 | Rules | Where do the business rules meet at their edges? | Zero and negative amounts, two discounts together, a limit reached exactly, a refund after a partial delivery |

## Techniques

A dimension says where to look; a technique says how many cases that look produces, so two authors
walking the same criterion write the same set rather than one writing three cases and the other
thirty.

| Technique | Use when | Produces | Dimensions |
|-----------|----------|----------|------------|
| Equivalence partitioning | An input splits into classes the system treats alike | One case per valid class and one per invalid class. A second case from a class already covered is a duplicate and is dropped | 2, 8 |
| Boundary value analysis | A field, a count, or an amount has a limit | `min-1`, `min`, `max`, `max+1` for every limit the source states, and `0` or empty where the lower limit allows it | 2, 3, 10 |
| Decision table | Two or more conditions decide the outcome together, role and status, or several filters | One case per combination whose outcome differs; combinations that end the same way share one | 1, 4, 10 |
| State transition | The thing has a status and rules about moving between them | Each allowed transition, and each blocked transition a user can actually attempt | 4, 5 |
| Pairwise | The combinations are too many to list, many filters or many options | Every pair of values covered at least once, instead of the full product | 2, 7 |
| Error guessing | Always, last | The defects this kind of field usually has: trimmed spaces, full-width and multibyte text, a pasted value, a double submit, a leading zero, a timezone edge | 2, 5, 7 |

Every validation rule the source states gets at least two cases: one value the rule accepts, and one
value it rejects or one at its boundary. Never one case asserting both, because a case that passes
cannot then say which half passed.

## Assumptions

A case states only what a source states. Where the expected result, a limit, a message, or a
permission has to be inferred, write `[ASSUMPTION]` at the start of the cell holding it, and add an
open question for it to the cases file with the name of whoever must answer, per rule 1 of
`shared/team-roles.md`: the BrSE/BA for behaviour, the Tech Lead for an API or a table. A marked
assumption is a case waiting on an answer; an unmarked one is a guess that gets executed as though
somebody agreed to it.

## Skipping a dimension

Skip a dimension only with the assumption that makes it irrelevant, written beside the criterion:
"Timing: skipped, the record is only ever edited by its owner." An assumption that could stop being
true while the feature is in service is not a reason to skip, it is a case. The one above becomes a
case the day sharing is added, so either it is written now or the regression matrix names the
dimension to revisit.

## From dimension to case

Each case a dimension produces is an ordinary row of the cases table in `references/test-case-template.md`:
an ID, the criterion it covers, and an expected result a tester can observe. Record the dimension
number and the technique in its `Source` column, `dimension 2, BVA`, so a reader can see which
dimensions a criterion was walked through.

Priority follows what breaks, not which dimension found it:

| What goes wrong | Priority |
|-----------------|----------|
| Data lost or corrupted silently, one user sees another's data, an action runs without permission | High |
| The feature fails for a group of users, or data ends up inconsistent but visible | High |
| A recoverable error the user is not told about, or a degraded but working flow | Medium |
| A cosmetic fault or a message worded badly | Low |

A case whose failure would be a security finding, rather than a defect, stays a test case here; the
threat behind it, and whether the control exists at all, is `atk:security`.
