## Issues found

1. Auth bypass at src/server.js:29 when ADMIN_TOKEN is unset.
2. Off by one at src/orders.js:19 for exactly ten units.

## Minor issues

- MAX_CODES at src/orders.js:23 is never used.
