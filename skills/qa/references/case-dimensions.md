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

## Skipping a dimension

Skip a dimension only with the assumption that makes it irrelevant, written beside the criterion:
"Timing: skipped, the record is only ever edited by its owner." An assumption that could stop being
true while the feature is in service is not a reason to skip, it is a case. The one above becomes a
case the day sharing is added, so either it is written now or the regression matrix names the
dimension to revisit.

## From dimension to case

Each case a dimension produces is an ordinary row of the cases table in `SKILL.md` step 2: an ID,
the criterion it covers, and an expected result a tester can observe. Record the dimension number in
the title or a column, so a reader can see which dimensions a criterion was walked through.

Priority follows what breaks, not which dimension found it:

| What goes wrong | Priority |
|-----------------|----------|
| Data lost or corrupted silently, one user sees another's data, an action runs without permission | High |
| The feature fails for a group of users, or data ends up inconsistent but visible | High |
| A recoverable error the user is not told about, or a degraded but working flow | Medium |
| A cosmetic fault or a message worded badly | Low |

A case whose failure would be a security finding, rather than a defect, stays a test case here; the
threat behind it, and whether the control exists at all, is `atk:security`.
