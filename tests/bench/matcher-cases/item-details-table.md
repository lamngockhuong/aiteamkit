# Review of review-target

## Findings

| Item | Details |
|---|---|
| Anyone can add a code when ADMIN_TOKEN is unset (blocking) | src/server.js:29 compares the header with an unset token |
| Ten units are charged full price (blocking) | src/orders.js:19 applies the bulk rate from eleven units |
