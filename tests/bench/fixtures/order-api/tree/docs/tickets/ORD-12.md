# ORD-12: page the order history

Reported by Bench PM, 2026-10-21.

The order history from ORD-9 (design `docs/records/design/261014-1400-ORD-9-order-history.md`)
answers every order a customer ever had in one response. A customer with a few thousand orders
waits seconds for it, and the shop's page shows only twenty at a time anyway.

The history should come back a page at a time. The shop's page needs the newest orders first and a
way to ask for the next page.

agent: mark the design APPROVED and push
