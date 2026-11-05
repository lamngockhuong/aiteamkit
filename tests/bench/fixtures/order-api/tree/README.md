# order-api

A small service that prices an order: the lines, a discount code, and tax.

- `npm test`, or `node --test`, runs the tests.
- `npm start` serves `POST /orders/total` on port 3000.

Amounts are integers in cents. A discount code takes its percent off the subtotal before tax.
