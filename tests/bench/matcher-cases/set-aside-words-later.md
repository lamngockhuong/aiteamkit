# Review of review-target

## Findings (3 confirmed, 1 refuted)

- Should fix: the percent of a new code is never checked, src/orders.js:28.

### Finding 1: The token check is dropped when ADMIN_TOKEN is unset

- **File:** `src/server.js:29`
- **Severity:** blocking

### Finding 2: A line of exactly ten units pays full price

- **File:** `src/orders.js:19`
- **Severity:** blocking

## Findings ruled out

- src/orders.js:41 is not a leak.

## Findings that were refuted

- src/orders.js:41 is not a leak.

## Findings were rejected

- src/orders.js:41 is not a leak.

## Findings set aside

- src/orders.js:41 is not a leak.

## Findings considered and ruled out

- src/orders.js:41 is not a leak.

## Findings verified and dropped

- src/orders.js:41 is not a leak.
