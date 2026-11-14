# Review of review-target

## Findings

### B1. Anyone can add a code when ADMIN_TOKEN is unset

src/server.js:29 compares the header with an unset token, so an empty header passes.

### 3. Open questions aside, ten units are charged full price

src/orders.js:19 applies the bulk rate from eleven units.
