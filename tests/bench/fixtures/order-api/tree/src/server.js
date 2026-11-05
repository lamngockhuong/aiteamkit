// POST /orders/total with {"items": [...], "discountCode": "..."} answers with the computed total.
import { createServer } from 'node:http';
import { computeTotal } from './orders.js';

export function handle(body) {
  let order;
  try { order = JSON.parse(body); } catch { return { status: 400, body: { error: 'body is not JSON' } }; }
  if (!Array.isArray(order.items) || !order.items.length) return { status: 400, body: { error: 'items must be a non-empty array' } };
  try {
    return { status: 200, body: computeTotal(order.items, { discountCode: order.discountCode }) };
  } catch (e) {
    return { status: 422, body: { error: e.message } };
  }
}

export const server = createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/orders/total') {
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  }
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    const out = handle(body);
    res.writeHead(out.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(out.body));
  });
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  server.listen(Number(process.env.PORT) || 3000);
}
