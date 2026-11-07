## Review of review-target

| # | Finding |
|---|---------|
| 1 | Blocking: anyone can add a code when ADMIN_TOKEN is unset, src/server.js:29 |
| 2 | Blocking: ten units get no bulk discount, src/orders.js:19 |
| 3 | Minor: the loop at src/orders.js:41 could use reduce |

| Severity | Finding |
|---|---|
| Medium | The error answer at src/server.js:23 returns the stack trace |
