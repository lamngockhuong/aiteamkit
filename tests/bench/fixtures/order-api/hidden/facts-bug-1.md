# Fact sheet: order total counts one unit per line

What the people of the order-api team know. The responder answers from this sheet only.

## People

- Bench Lead: Tech Lead, approves code changes and owns technical decisions.
- Bench PM: product manager, owns scope, priority and what customers were promised.
- Bench QA: tester, reported the defect.

## The report

- Reported by Bench QA on 2026-10-03, from two customer complaints.
- An order of 3 units of A1 at 10.00 was charged 10.80 instead of 32.40.
- Single-unit orders are priced correctly.
- It started after the release that carried commit "refactor: shorten the line total".
- Expected: every line is priced at price times quantity, before discount and tax.
- Customers already overcharged or undercharged: Bench PM decides about refunds; nobody has decided yet.
- Priority: high, Bench PM.
- There is no ticket number; the report came in conversation.
