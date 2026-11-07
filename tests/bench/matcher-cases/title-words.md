# Review of review-target

## Findings

### B1. The token check is dropped when ADMIN_TOKEN is unset

- **File:** `src/server.js:29`

### S1. Open questions aside, a percent of 150 is accepted

- **File:** `src/orders.js:28`

### 3. Dropped stack: the error answer leaks the stack trace

- **File:** `src/server.js:23`
- **Severity:** should fix

## Verified and dropped

- `src/orders.js:41` looked like a leak; it is not.

## Open questions

- Whether `src/server.js:29` is reachable without ADMIN_TOKEN in production: Bench Lead.
