# Review of review-target

## 4. Findings

### B1. Anyone can add a code when ADMIN_TOKEN is unset

src/server.js:29 compares the header with an unset token, so an empty header passes.

### 4.1 Open questions for Bench PM

- Should ten units get the bulk rate at src/orders.js:19?
