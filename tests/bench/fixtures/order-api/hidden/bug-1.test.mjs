// Hidden from the session: passes only once a line is priced at its quantity again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotal, lineTotal } from '../src/orders.js';

test('a line of three units costs three times the price', () => {
  assert.equal(lineTotal({ sku: 'A1', price: 1000, quantity: 3 }), 3000);
});

test('the order total counts every unit before discount and tax', () => {
  const t = computeTotal([{ sku: 'A1', price: 1000, quantity: 3 }, { sku: 'B2', price: 250, quantity: 2 }], { discountCode: 'WELCOME10' });
  assert.deepEqual(t, { subtotal: 3500, discount: 350, tax: 252, total: 3402 });
});

test('a single unit is unchanged', () => {
  assert.equal(lineTotal({ sku: 'A1', price: 1000, quantity: 1 }), 1000);
});
