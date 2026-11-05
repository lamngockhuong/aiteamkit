**Should fix before merge**

1. **Admin check fails open** (`src/server.js`:29). Anyone can add codes.
2. Off by one at src/orders.js L19.

## Non-blocking suggestions

- The stack trace at /tmp/atk-bench-x/seed/src/server.js:23 leaks paths.
- `src/orders.js` (lines 26 to 28): percent is never checked.
- The whole handler, src/server.js:1-40, could be split.

| # | Location | Severity | Note |
|---|---|---|---|
| 5 | src/orders.js:23 | Low | a high number of codes is never capped |
