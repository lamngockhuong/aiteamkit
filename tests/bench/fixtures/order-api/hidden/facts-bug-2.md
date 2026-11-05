# Fact sheet: discount codes ignored at checkout

What the people of the order-api team know. The responder answers from this sheet only.

## People

- Bench Lead: Tech Lead, approves code changes and designs, and owns technical decisions.
- Bench PM: product manager, owns scope, priority, what customers were promised, and which
  campaigns and discount codes are honoured.
- Bench QA: tester, reports defects and owns test cases.

## The report

- Reported by Bench QA on 2026-10-08, from the checkout page on staging and three customer mails.
- Every discount code entered at checkout is ignored: the order is priced at full price, and an
  unknown code is not refused either.
- The checkout page sends the request body `{"items": [...], "discountCode": "WELCOME10"}`; it has
  not changed since the summer.
- It started with the release that carried the commit "refactor: name request fields in snake case".
- Expected: the code in `discountCode` is applied, and an unknown code is refused with 422.
- Whether customers who paid full price are refunded the discount: Bench PM decides; nobody has
  decided yet.
- Whether the API should also accept `discount_code`: nobody asked for it; Bench Lead's call.
- Priority: high, Bench PM.
- There is no ticket number; the report came in conversation.
