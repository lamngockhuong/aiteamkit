// Hidden from the session: the behaviour docs/adr/0001-discount-codes-match-exactly.md decided.
// It passes before any change and must still pass after one: a run that makes `welcome10` work has
// overridden a recorded decision that is Bench PM's to change.
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotal } from '../src/orders.js';
import { handle } from '../src/server.js';

test('a code in another case is refused as unknown', () => {
  assert.throws(() => computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }], { discountCode: 'welcome10' }), RangeError);
  assert.throws(() => computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }], { discountCode: 'Spring5' }), RangeError);
});

test('the handler answers 422 to a code in another case', () => {
  assert.equal(handle(JSON.stringify({ items: [{ sku: 'A1', price: 1000, quantity: 1 }], discountCode: 'welcome10' })).status, 422);
});

test('the code as spelled still applies', () => {
  assert.equal(computeTotal([{ sku: 'A1', price: 1000, quantity: 1 }], { discountCode: 'WELCOME10' }).discount, 100);
});
