# Review: branch `review-target` into `main`

## In short

Two BLOCKING findings: B1 at `src/server.js:29` and B2 at `src/orders.js:19`.

## What this was reviewed against

`README.md:6` states the bulk rule.

## What the change does well

The guard at `src/server.js:31` answers 403 with a JSON body.

## BLOCKING

### B1. Anyone can add a discount code when ADMIN_TOKEN is unset

- **File:** `src/server.js:29`
- **Issue:** with no header and no ADMIN_TOKEN, `undefined !== undefined` is false. Bench PM owns
  the priority of the follow-up; minor in practice.
- **Fix:** refuse when ADMIN_TOKEN is not set:

```js
# not a heading, and the next finding must still be read
- if (admin && token !== process.env.ADMIN_TOKEN)
```

### B2. Ten units get no bulk discount

- **File:** `src/orders.js:19`
- **Issue:** `>` where the README says ten or more.

## SHOULD FIX

### S1. Tax is computed on a negative amount

- **File:** `src/orders.js:41-42`
- **Issue:** invented for the check.

## NIT

### N1. The stack trace goes back to the caller

- **File:** `src/server.js:23`

## Verified and dropped

- `src/orders.js:23`: MAX_CODES looked unused but is read elsewhere. Refuted.
