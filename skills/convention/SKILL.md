---
name: convention
description: >
  Extract, record, and enforce the coding conventions a team actually follows: branch and commit
  rules, naming, layering, error handling, test layout, review etiquette, and the tooling that
  enforces each rule automatically.
  Use when a team has no written convention, when the written one no longer matches the code, or
  when reviews keep repeating the same comment.
  Triggers on: "convention", "coding standard", "quy ước code", "coding rule", "style guide",
  "branch strategy", "commit convention", "コーディング規約", "our team rules", "/atk:convention".
argument-hint: "[--audit|--init|--sync] [--scope <paths>] [--lang <code>] [--out <path>]"
---

# Team Conventions (`atk:convention`)

Writes down the rules a team already follows and enforces, rather than importing a style guide from
elsewhere. A rule that no tool enforces and no reviewer checks is a wish; this skill labels it as
one.

## Scope

Handles: deriving conventions from the existing codebase and git history, recording them, mapping
each rule to the tool that enforces it, and auditing whether the code still matches the document.

Does NOT handle: reviewing a specific change (`atk:review`), configuring CI pipelines beyond the
lint and format layer, or choosing the tech stack.

## Roles

Tech Lead owns the document and is the approver. Every Dev is bound by it. A rule added without the
team agreeing is a proposal, marked as such. See `shared/team-roles.md`.

## Invocation

```bash
/atk:convention                   # Derive from the codebase and write or update the document
/atk:convention --audit           # Report where the code and the document disagree, change nothing
/atk:convention --init            # Bootstrap a document for a project with no conventions yet
/atk:convention --sync            # Update the document to match what the code now does
/atk:convention --scope src/api   # Limit derivation to given paths
/atk:convention --lang vi         # Write the document in Vietnamese
/atk:convention --out <path>      # Override the default output path
```

## Workflow

```
[1. Read existing] -> [2. Derive from code] -> [3. Classify] -> [4. Map to tooling] -> [5. Write]
```

### 1. Read what exists

Read `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`, `.editorconfig`, linter and formatter configs,
`CODEOWNERS`, PR templates, and any existing convention document. Do not duplicate what a config
file already states: link to it.

### 2. Derive from the code

Sample the code and recent git history to find the real patterns: directory layout, naming, error
handling, logging, test file placement, import order, commit message shape, branch names, PR size
and review turnaround. Record the dominant pattern and how dominant it is, for example "23 of 26
handlers".

### 3. Classify each rule

Three buckets, and each rule must land in one:

| Bucket | Meaning |
|--------|---------|
| `ENFORCED` | A tool fails the build or the hook blocks it |
| `REVIEWED` | A human checks it during review, and it is on the review checklist |
| `ASPIRATIONAL` | Nobody checks it; either automate it, move it to the checklist, or drop it |

Write each rule in the record format from `shared/review-checklist.md`: an `id`, the rule sentence,
the bucket, the enforcing tool, a default review severity, and the source it was derived from.
`atk:review` reads those rows and cites the ID, so the format is a contract, not a preference.

### 4. Map to tooling

For each `REVIEWED` or `ASPIRATIONAL` rule worth keeping, name the tool that could enforce it and
the config change needed. Propose; do not silently install tooling or rewrite CI.

### 5. Write

Update `docs/conventions.md` in place. Its review checklist section holds the `REVIEWED` rules only,
per `shared/review-checklist.md`; an `ENFORCED` rule is already checked by a tool and repeating it
wastes a reviewer's attention, and `ASPIRATIONAL` rules are listed apart and marked unchecked.

Where the project has a `CONTRIBUTING.md`, keep the human contribution flow there and link to the
conventions rather than copying them.

## Output

Written to `docs/conventions.md` per `shared/artifact-paths.md`. Sections: front matter, branch and
commit rules, code layout and naming, error handling and logging, testing rules, the review
checklist in the `shared/review-checklist.md` record format, and the enforcement table mapping every
rule to its bucket and tool.

## Ticket

Follow `shared/ticket-adapters.md`. Automation gaps found in step 4 become issues, one per rule,
only when the user asks.

## Definition of done

- [ ] Every rule is derived from the code or explicitly agreed, never imported unexamined.
- [ ] Every rule is classified `ENFORCED`, `REVIEWED`, or `ASPIRATIONAL`.
- [ ] The document links to config files instead of restating their contents.
- [ ] `--audit` reports disagreements without changing any file.
- [ ] Rules the team has not agreed to are marked as proposals.
- [ ] The review checklist section carries only `REVIEWED` rules, each with an ID and a default severity.
