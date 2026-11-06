// Hidden from the session: passes only once the handler takes a gift card the way facts-chain.md says
// Bench Lead decided, after tax, with the card's balance sent by the checkout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/server.js';

const CODE = 'ABCD1234EFGH5678';
const order = (extra) => JSON.stringify({ items: [{ sku: 'A1', price: 1000, quantity: 1 }], ...extra });

test('a card smaller than the total pays all of its balance, after tax', () => {
  const out = handle(order({ giftCard: { code: CODE, balance: 500 } }));
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, { subtotal: 1000, discount: 0, tax: 80, total: 1080, giftCard: { code: CODE, paid: 500, balanceLeft: 0 }, due: 580 });
});

test('a card larger than the total pays the total and keeps the rest, with a discount code', () => {
  const out = handle(order({ discountCode: 'WELCOME10', giftCard: { code: CODE, balance: 2000 } }));
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, { subtotal: 1000, discount: 100, tax: 72, total: 972, giftCard: { code: CODE, paid: 972, balanceLeft: 1028 }, due: 0 });
});

test('a code that is not 16 uppercase letters and digits is refused', () => {
  assert.equal(handle(order({ giftCard: { code: 'abcd1234efgh5678', balance: 500 } })).status, 422);
  assert.equal(handle(order({ giftCard: { code: 'ABCD1234', balance: 500 } })).status, 422);
});

test('a balance that is not whole cents of 0 or more is refused', () => {
  assert.equal(handle(order({ giftCard: { code: CODE, balance: -1 } })).status, 422);
  assert.equal(handle(order({ giftCard: { code: CODE, balance: 10.5 } })).status, 422);
});

test('an order with no gift card answers as before', () => {
  assert.deepEqual(handle(order({})).body, { subtotal: 1000, discount: 0, tax: 80, total: 1080 });
});
