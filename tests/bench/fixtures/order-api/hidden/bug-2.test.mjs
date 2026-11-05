// Hidden from the session: passes only once the handler reads the discount code the checkout sends.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/server.js';

const order = (extra) => JSON.stringify({ items: [{ sku: 'A1', price: 1000, quantity: 1 }], ...extra });

test('the handler applies the discount code sent as discountCode', () => {
  const out = handle(order({ discountCode: 'WELCOME10' }));
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, { subtotal: 1000, discount: 100, tax: 72, total: 972 });
});

test('the handler refuses an unknown discount code', () => {
  assert.equal(handle(order({ discountCode: 'NOPE' })).status, 422);
});

test('an order with no code is unchanged', () => {
  assert.deepEqual(handle(order({})).body, { subtotal: 1000, discount: 0, tax: 80, total: 1080 });
});
