# Review of review-target

## What the branch does well

- The 403 answer at src/server.js:31 is clear.

## Checked and ruled out

- src/orders.js:41 looked like a leak.

## Issues

- Blocking: ten units get no bulk discount, src/orders.js:19.
