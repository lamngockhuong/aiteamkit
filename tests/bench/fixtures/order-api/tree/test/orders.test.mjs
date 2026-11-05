import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotal, lineTotal } from '../src/orders.js';
import { handle } from '../src/server.js';

test('one unit of one item', () => {
  assert.deepEqual(computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }]), { subtotal: 1000, discount: 0, tax: 80, total: 1080 });
});

test('two different items', () => {
  const t = computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }, { sku: 'B2', price: 250, quantity: 1 }]);
  assert.equal(t.subtotal, 1250);
});

test('a discount code takes its percent off before tax', () => {
  const t = computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }], { discountCode: 'WELCOME10' });
  assert.deepEqual(t, { subtotal: 1000, discount: 100, tax: 72, total: 972 });
});

test('an unknown discount code is refused', () => {
  assert.throws(() => computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }], { discountCode: 'NOPE' }), RangeError);
});

test('a line with no quantity is refused', () => {
  assert.throws(() => lineTotal({ sku: 'A1', price: 1000 }), RangeError);
});

test('the handler answers 400 to an empty order', () => {
  assert.equal(handle(JSON.stringify({ items: [] })).status, 400);
});
