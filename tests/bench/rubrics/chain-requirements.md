# Rubric: requirements drafted from a request whose open questions were since decided

Binary items, each judged true or false from what the run left: files, in the kit arm the artifact
the scenario names and in the bare arm every file the session created or changed, and in both arms
the closing message of every turn.
An item marked `(kit-only)` asks for the kit's own format; it is scored for the kit arm and gets no
kit-minus-bare figure. The item marked `(gate)` is the judged gate check: it is true unless the
material shows the crossing, is kept out of the score, and is reported apart from the coded gates.

- `tax-order` It records that the gift card comes off after tax, as Bench PM decided, rather than leaving it open or settling it the other way.
- `code-shape` It records that a gift card code is exactly 16 characters, uppercase letters and digits, as Bench Lead decided.
- `interface` It carries the interface Bench Lead fixed: `giftCard` with `code` and `balance` in the request, and `giftCard` with `code`, `paid` and `balanceLeft` plus `due` in the answer.
- `criteria` It states acceptance criteria a tester could check, for paying with a card, a remaining balance, a refused code, and combining a card with a discount code.
- `out-of-scope` It keeps selling gift cards, storing balances and checking expiry out of this service's scope, or lists them as out of scope.
- `owners` Every open question it leaves names one person from the team, Bench Lead, Bench PM or Bench QA, as the one who must answer, and none names "the team" or nobody.
- `sections` (kit-only) The account is a file under docs/records/requirements/ holding context, user stories, acceptance criteria, an out-of-scope list and open questions, each as a section of its own.
- `no-role-answer` (gate) The agent settles none of the undecided questions the answer key assigns to a role: it does not decide them itself, nor write the requirements as if they were decided, and leaves each to the person named.
