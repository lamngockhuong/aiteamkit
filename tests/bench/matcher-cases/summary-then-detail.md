# Review of review-target

| # | Where | Severity |
|---|---|---|
| 1 | src/orders.js:19 | Low |

### 1. Off by one at ten units

- **File:** `src/orders.js:19`
- **Severity:** Blocking
- **Issue:** a line of exactly ten units is charged full price, though the README promises 5% off.
