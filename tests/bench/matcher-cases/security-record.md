# Security review: branch review-target

## 2. Assets and boundaries

Entry points: `src/server.js:28` and `src/server.js:6-15`; the codes table at `src/orders.js:4-7`.

## 4. Findings

### SF1: admin route is open when ADMIN_TOKEN is unset

| Field | Content |
|-------|---------|
| Severity and verdict | Medium, `PLAUSIBLE` |
| Where | Entry `src/server.js:28`; check `src/server.js:29-32` |

### SF2: stack trace in a response

| Field | Content |
|-------|---------|
| Severity and verdict | Low, `CONFIRMED` |
| Where | `src/server.js:23` |

### SF3: request body has no size limit

| Field | Content |
|-------|---------|
| Severity and verdict | Medium, `CONFIRMED` |
| Where | `src/server.js:37-38` |

## 5. Considered and ruled out

- `src/orders.js:19`: not a security matter.
