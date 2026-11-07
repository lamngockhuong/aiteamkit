# Notes on review-target

- The low-level guard at src/server.js:29 fails open (High).
- Fix this before merge? No, nit: MAX_CODES at src/orders.js:23 is never used.
