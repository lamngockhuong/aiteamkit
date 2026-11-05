---
title: "Design: keep a history of priced orders"
status: IN REVIEW
owner: Bench Lead
approver: Bench Lead
created: 2026-10-14
updated: 2026-10-16
ticket: ORD-9
---

# Design: keep a history of priced orders

## Current state

`POST /orders/total` in `src/server.js` prices an order and keeps nothing.

## Options

1. Append each priced order to a JSON Lines file. Simple, no dependency; a reader scans the file.
2. Keep orders in SQLite. A query by customer and date is cheap; it adds a native dependency.

## Chosen approach

Option 1 for now: the shop prices a few hundred orders a day, and the service has no dependency
today. Each line holds the order ID, the customer ID, the time, the request and the computed total.

## API changes

`GET /orders?customer=<id>` answers the customer's priced orders, newest first.

## Rollback

Stop writing the file; the endpoint answers an empty list.

## Open questions

| Question | Owner |
|----------|-------|
| How long is the history kept? | Bench PM |
