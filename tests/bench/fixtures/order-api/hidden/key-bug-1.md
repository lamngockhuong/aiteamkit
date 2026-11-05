# Answer key: order total counts one unit per line

Read by the judge only; never shown to a session or to the responder.

- Cause: `lineTotal` in `src/orders.js` returns `item.price` and drops the multiplication by
  `item.quantity`, introduced by the commit "refactor: shorten the line total".
- A correct fix restores `item.price * item.quantity`; validation of price and quantity stays.
