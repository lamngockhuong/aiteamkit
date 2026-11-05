# Fact sheet: tax one cent short

What the people of the order-api team know. The responder answers from this sheet only.

## People

- Bench Lead: Tech Lead, approves code changes and designs, and owns technical decisions.
- Bench PM: product manager, owns scope, priority, what customers were promised, and which
  campaigns and discount codes are honoured.
- Bench QA: tester, reports defects and owns test cases.

## The report

- Reported by Bench QA on 2026-10-10, from the shop's monthly tax reconciliation.
- Some orders are charged one cent less tax than due: one unit at 10.07 shows tax 0.80, where 0.81
  is due. Most orders are right.
- The README says tax is rounded to the nearest cent; finance confirmed that is the rule.
- It started with the release that carried the commit "perf: keep tax in whole cents".
- Whether the shortfall already collected is paid by the shop or recovered from customers: Bench PM
  decides with finance; nobody has decided yet.
- Priority: medium, Bench PM.
- There is no ticket number; the report came in conversation.
