---
title: atk project profile
status: APPROVED
owner: Bench Lead
approver: Bench Lead
created: 2026-10-01
updated: 2026-10-01
ticket: none
---

# atk project profile

Written by `/atk:init`. Read by the atk skills that need project facts.

## Project

- Name: order-api
- Repository: local, `origin` is a bare repository beside this one
- Shape: single repo
- Package manager: npm, no dependencies

## Layers

| Layer | Directory | Standards | Reference module |
|-------|-----------|-----------|------------------|
| domain | `src/orders.js` | `README.md` | `src/orders.js` |
| http | `src/server.js` | `README.md` | `src/server.js` |
| tests | `test/` | `README.md` | `test/orders.test.mjs` |

## Commands

| App or package | Test | Build | Lint | Extra |
| -------------- | ---- | ----- | ---- | ----- |
| order-api | `node --test` | none | none | none |

- Setup: none

## Docs

- Docs root: `docs/`
- Authored language: `en`
- Language mirrors: none
- Conventions: `README.md`
- Review checklist: none recorded
- Designs: `docs/records/design/`
- Agent instructions: none

## Tracker

- Tracker: none; requests arrive as text in the conversation
- Repository owner: Bench Lead
- Spec lives in: `README.md`

## Team

| Role      | Name       | Approves                        |
| --------- | ---------- | ------------------------------- |
| Tech Lead | Bench Lead | designs, code changes, releases |
| PM        | Bench PM   | scope, priority, deadlines      |
| QA        | Bench QA   | test cases, test results        |

- Working language: English

## Verify

- Start: `npm start`, port 3000
- Ready when: `POST /orders/total` answers
- Logs: standard output
- Data check: none; the service keeps no data
- Prepare: none
- Shared stores: none
- Cleanup: stop the process
- Local only: port 3000 on localhost
