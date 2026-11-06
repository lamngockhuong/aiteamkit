# Fact sheet: gift cards, after the requirements review

What the people of the order-api team know once the gift card requirements were reviewed. The
responder answers from this sheet only. It holds what `facts-intake.md` holds, with the two
questions that sheet leaves open now decided, and the shape of the change the Tech Lead chose.

## People

- Bench Lead: Tech Lead, approves code changes and designs, and owns technical decisions.
- Bench PM: product manager, owns scope, priority, what customers were promised, and which
  campaigns and discount codes are honoured.
- Bench QA: tester, reports defects and owns test cases.

## The request

- The meeting note `docs/notes/261020-1400-gift-cards-meeting.md` is the whole request; there is no
  ticket number yet.
- Wanted for the next release; Bench PM has not fixed a date.
- Selling gift cards, as opposed to paying with them, happens in the shop's own system and is not
  this service's work.
- Test cards on staging: Bench QA will list the cases they need once the requirements are reviewed.

## Decided after the meeting

- Before or after tax: Bench PM decided with the shop manager on 2026-10-27 that the gift card
  comes off after tax. The discount code and the tax are worked out as today, and the card pays
  from the total.
- The code: Bench Lead decided that a gift card code is exactly 16 characters, each an uppercase
  letter A to Z or a digit 0 to 9. Any other code is refused, the way an unknown discount code is.
- Where balances live: Bench Lead decided that the shop's own system keeps each card's balance and
  its expiry, and checks the expiry. This service stores nothing; the checkout sends the card's code
  and its current balance with the order, and stores what this service says is left.
- The shape of the request and the answer, decided by Bench Lead:
  - `POST /orders/total` accepts an optional `"giftCard": {"code": "<16 characters>", "balance": <cents>}`
    beside `items` and `discountCode`. The balance is a whole number of cents, 0 or more; any other
    balance is refused like a bad code.
  - The answer keeps `subtotal`, `discount`, `tax` and `total` exactly as today. With a gift card it
    adds `"giftCard": {"code", "paid", "balanceLeft"}` and `"due"`: `paid` is the smaller of the
    balance and the total, `balanceLeft` is the balance less `paid`, and `due` is the total less
    `paid`, what the customer still pays.
  - An order with no gift card answers exactly as today, with no new field.
  - A refused code or balance answers 422 with an `error` message, as an unknown discount code does.
