# Findings on review-target

## B1. Anyone can add a code when ADMIN_TOKEN is unset

- **File:** `src/server.js:29`

### 4. Open questions

- Whether src/orders.js:19 should count ten units: Bench PM.

## Verified and dropped

- src/orders.js:41 is not a leak.
