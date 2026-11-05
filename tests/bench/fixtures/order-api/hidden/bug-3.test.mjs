// Hidden from the session: passes only once tax is rounded to the nearest cent again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotal } from '../src/orders.js';

test('tax of 80.56 cents is 81 cents', () => {
  assert.deepEqual(computeTotal([{ sku: 'A1', price: 1007, quantity: 1 }]), { subtotal: 1007, discount: 0, tax: 81, total: 1088 });
});

test('tax of 80.48 cents is 80 cents', () => {
  assert.equal(computeTotal([{ sku: 'A1', price: 1006, quantity: 1 }]).tax, 80);
});

test('tax after a discount is rounded to the nearest cent', () => {
  // 1013 less 5 percent is 962; 8 percent of 962 is 76.96 cents.
  assert.deepEqual(computeTotal([{ sku: 'A1', price: 1013, quantity: 1 }], { discountCode: 'SPRING5' }), { subtotal: 1013, discount: 51, tax: 77, total: 1039 });
});
