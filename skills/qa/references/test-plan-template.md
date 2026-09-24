# Test plan template

Loaded by `atk:qa` in step 5, and on any run that writes the plan: the default run and `--plan`. One
file per feature or release at `docs/qa/test-plan-<slug>.md`, per `shared/artifact-paths.md`. The
project's own template wins over this shape in the same order as `references/test-case-template.md`
gives: an override that names one, then an existing plan under `docs/qa/`.

The readers are the QA who executes it, the PM who owns the exit criteria, and the Tech Lead who
provides the environments. Each needs to find their part without reading the rest.

Two things this plan never does. It never places a value nobody gave: a date, a response target, an
environment URL left unknown stays empty with the name of who will fill it, because a provisional
value in a plan reads as an agreed one. And it never carries the test schedule itself: dates and
effort belong to `atk:estimate` and `atk:breakdown`, and the plan points at their artifacts.

## Shape

````markdown
---
title: "Test plan: <feature or release>"
status: IN REVIEW
owner: <QA>
approver: <PM for the exit criteria; QA lead or TL for the rest>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <ticket, or none>
---

# Test plan: <feature or release>

## 1. Scope

What is tested, as acceptance criterion IDs and the requirement they come from. What is not tested,
each with the reason and who decided.

## 2. Test levels

| Level | Purpose | Done here | Performed by | Notes |
|-------|---------|-----------|--------------|-------|
| UT | Each unit behaves as its code says | <yes, or no with the reason> | Dev | Written with the code, per `atk:implement` |
| IT | Units work together, API with database, screen with API | <yes, or no with the reason> | Dev and QA | |
| ST | The whole system against the requirement, non-functional included | <yes, or no with the reason> | QA | The cases in `docs/qa/test-cases-<slug>.md` |
| UAT | The client's business runs on it | <yes, or no with the reason and who decided> | Client | |

A level marked `no` says why. A level nobody decided about is an open question for the PM.

## 3. Test types

One row per non-functional requirement the project actually states, and none for one it does not.

| Type | Level | Requirement | How it is checked |
|------|-------|-------------|-------------------|
| Performance | ST | <the design's expectation, quoted> | <tool or procedure> |
| Compatibility | ST | Section 5 below | Cross-browser run |

## 4. Environments

| Environment | Used for | URL or location | Data | Provided by |
|-------------|----------|-----------------|------|-------------|
| <name> | <levels> | <URL, or empty with who will give it> | <how the data is prepared> | <TL> |

## 5. Compatibility

| Browser, OS, or device | Version | Responsive checked |
|------------------------|---------|--------------------|
| <from the requirement> | <from the requirement> | <yes or no> |

Copied from the requirement or the non-functional list, which is authoritative for the values. A
project that states none has this section say so, and the question of which to test goes to the PM.

## 6. Regression

The existing features that share a module, a table, or an endpoint with the change, each marked from
the diff or the design, never from intuition, and the migration, rollback, compatibility, rollout, and
performance cases the design calls for, one case each.

| Feature | Shares | Mark | Reason |
|---------|--------|------|--------|
| <feature> | <module, table, or endpoint> | <MUST TEST, SPOT CHECK, or NOT AFFECTED> | <why> |

| Design case | Case ID | Expected result |
|-------------|---------|-----------------|
| <migration, rollback, compatibility, rollout, or performance> | <ID in the cases file> | <the design's expectation, quoted> |

## 7. Entry and exit criteria

| Level | Entry | Exit |
|-------|-------|------|
| ST | <build, environment, accounts, seed data, the not-implemented list, and who delivers each> | <PM's threshold: cases executed, open defects allowed by severity, pass rate> |

Entry names who delivers each item. Exit names who signs off, and the figure in it is the PM's.

## 8. Defect severity

| Severity | Means | Response target |
|----------|-------|-----------------|
| Critical | The business cannot proceed and there is no workaround, or data is lost or exposed | |
| High | A main function fails and a workaround exists | |
| Medium | A secondary function is affected | |
| Low | Cosmetic, or wording | |

The response targets are the PM's to set with the client; they stay empty until one is given. A case's
priority, from `references/case-dimensions.md`, says how much a failure would matter before it
happens; severity says how much an actual defect matters, and a High case can fail with a Low defect.

## 9. Schedule

A link to the estimate or breakdown that holds the test effort and dates, or `none yet (ask <PM>)`.

## 10. Open questions

| # | Question | Who answers | Blocks | Answer |
|---|----------|-------------|--------|--------|
````

## Updating

The plan is a reference document like the cases beside it: updated in place as the feature changes,
with `status` back to `IN REVIEW` on any change the approver has not seen.
