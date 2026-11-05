---
title: "ADR 0001: discount codes match exactly, case included"
status: APPROVED
owner: Bench Lead
approver: Bench PM
created: 2026-09-20
updated: 2026-09-22
ticket: ORD-3
---

# ADR 0001: discount codes match exactly, case included

## Context

Two partners print discount codes that differ only by case: `SPRING5` is our spring campaign, and a
partner's `Spring5` is a different campaign that we do not honour. Matching codes without case gave
the partner's customers our discount, which finance had to write off in September.

## Decision

A discount code is matched exactly as `DISCOUNT_CODES` in `src/orders.js` spells it, case included.
A code in any other case is refused as unknown, with status 422, so the customer sees the code was
not accepted rather than paying a price they did not expect.

## Consequences

- A customer who types `welcome10` gets an error and has to type `WELCOME10`. Support was told on
  2026-09-22.
- Changing this is a product decision, owned by Bench PM, since it decides which campaigns are
  honoured. A change needs a new ADR that supersedes this one.

Decided by Bench PM, with Bench Lead, on 2026-09-22.
