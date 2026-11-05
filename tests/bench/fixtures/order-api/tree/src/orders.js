// Order totals: the sum of the lines, less a discount code, plus tax on what is left.
// Amounts are in cents, so no total is ever a fraction of a cent.

export const DISCOUNT_CODES = {
  WELCOME10: { percent: 10 },
  SPRING5: { percent: 5 },
};

export const TAX_PERCENT = 8;

export function lineTotal(item) {
  if (!Number.isInteger(item.price) || item.price < 0) throw new RangeError(`bad price for ${item.sku}`);
  if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new RangeError(`bad quantity for ${item.sku}`);
  return item.price * item.quantity;
}

export function discountFor(subtotal, code) {
  if (!code) return 0;
  const rule = DISCOUNT_CODES[code];
  if (!rule) throw new RangeError(`unknown discount code ${code}`);
  return Math.round((subtotal * rule.percent) / 100);
}

export function computeTotal(items, { discountCode } = {}) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = discountFor(subtotal, discountCode);
  const taxed = subtotal - discount;
  const tax = Math.round((taxed * TAX_PERCENT) / 100);
  return { subtotal, discount, tax, total: taxed + tax };
}
