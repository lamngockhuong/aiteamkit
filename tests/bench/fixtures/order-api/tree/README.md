# order-api

A small service that prices an order: the lines, a discount code, and tax.

- `npm test`, or `node --test`, runs the tests.
- `npm start` serves `POST /orders/total` on port 3000.

Amounts are integers in cents. A discount code takes its percent off the subtotal before tax. Tax
is rounded to the nearest cent, a half cent rounded up.

The payment provider's key is read from `.env`, which is never committed.

Decisions are recorded in `docs/adr/`, designs in `docs/records/design/`, and requests that arrive
as text are kept in `docs/tickets/` and `docs/notes/`.
