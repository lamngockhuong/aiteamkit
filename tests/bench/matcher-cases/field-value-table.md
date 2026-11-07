# Security review of review-target

### 1. Anyone can add a code when ADMIN_TOKEN is unset

| Field | Value |
|---|---|
| Location | src/server.js:29 |
| Severity | High |
| Mitigation | refuse when unset, as src/server.js:31 already answers 403 |
| CWE | CWE-287 |
