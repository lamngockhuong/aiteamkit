---
name: qa
description: >
  Plan and write the team's testing: a test plan with scope and exit criteria, test cases traced to
  acceptance criteria, a regression matrix, test data and environment needs, and the handoff a
  developer owes QA before a ticket moves to testing.
  Use when a feature reaches QA, when a release needs a regression pass, or when a team has no
  written test cases.
  Triggers on: "test plan", "test case", "QA", "kiểm thử", "viết test case", "regression",
  "テスト計画", "テストケース", "how do we test this", "QA handoff", "/atk:qa".
argument-hint: "[requirement-path|feature|release] [--plan|--cases|--regression] [--lang <code>] [--out <path>]"
---

# QA Planning and Test Cases (`atk:qa`)

Produces test artifacts a QA engineer can execute without asking the developer what the feature was
supposed to do. Every case traces back to an acceptance criterion, so untested criteria and untraced
cases both become visible.

## Scope

Handles: writing the test plan, deriving test cases from acceptance criteria, adding negative and
boundary cases, building the regression matrix from change impact, listing test data and environment
needs, and defining the QA entry and exit criteria.

Does NOT handle: writing automated test code, which belongs to `atk:implement`; running the
suite; or signing off a release (`atk:release`).

## Roles

QA owns the plan and the cases. BrSE/BA confirms cases match the requirement intent. Dev owns the
handoff and the test data. PM owns the exit criteria. See `shared/team-roles.md`.

## Invocation

```bash
/atk:qa <requirement-path>      # Test plan plus cases from a requirement artifact
/atk:qa --plan <feature>        # Test plan only
/atk:qa --cases <feature>       # Test cases only
/atk:qa --regression <release>  # Regression matrix for a release scope
/atk:qa --lang vi               # Write the artifacts in Vietnamese
/atk:qa --out <path>            # Override the default output path
```

## Workflow

```
[1. Read criteria] -> [2. Derive cases] -> [3. Negative and boundary] -> [4. Regression] -> [5. Entry and exit]
```

### 1. Read the acceptance criteria

Load the requirement and design. List every acceptance criterion with an ID. A criterion that
cannot be turned into a test is reported back as a requirement defect, not quietly skipped.

### 2. Derive the happy-path cases

One case per criterion at minimum. A case has: ID, title, precondition, steps, test data, expected
result, priority, and the criterion ID it covers. Expected results state an observable outcome, not
"works as expected".

### 3. Negative, boundary, and cross-cutting cases

Add, per criterion where they apply: invalid input, empty and maximum values, permission denied,
concurrent action, network failure and timeout, and duplicate submission. Then cover the concerns
that span the feature: permissions by role, i18n and locale, timezone, and accessibility where the
project requires it.

### 4. Regression matrix

Derive impact from the diff or the design, not from intuition. List the existing features that share
a module, a table, or an endpoint with the change, and mark each `MUST TEST`, `SPOT CHECK`, or
`NOT AFFECTED`, with the reason.

### 5. Entry and exit criteria

Entry: what the developer must deliver before QA starts, including build, environment, test account,
seed data, and the list of what is not implemented yet. Exit: the pass rate, the severity thresholds
that block a release, and who signs off.

## Output

Test plan at `docs/qa/test-plan-<slug>.md` and cases at `docs/qa/test-cases-<slug>.md` per
`shared/artifact-paths.md`. Cases are a Markdown table so they paste into a spreadsheet or a test
management tool without rewriting.

## Ticket

Follow `shared/ticket-adapters.md`. Bugs found during execution become issues linked to the case ID
and the criterion ID.

## Definition of done

- [ ] Every acceptance criterion maps to at least one test case.
- [ ] Every test case maps back to a criterion, or is labelled exploratory.
- [ ] Negative and boundary cases exist, not only happy paths.
- [ ] The regression matrix justifies each entry with a shared module, table, or endpoint.
- [ ] Entry and exit criteria name who provides what and who signs off.
