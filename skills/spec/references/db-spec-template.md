# Database spec template

Loaded by `atk:spec` in step 2, and only when `docs/database/` holds nothing to copy the shape from.
One file per table, named after the table.

The reader is someone about to write a query, add a column, or delete a row, who needs to know what
they will break.

## Shape

````markdown
---
title: "<table_name>"
status: IN REVIEW
owner: <person>
approver: <Tech Lead>
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <the ticket that last changed this, or none>
---

# `<table_name>`

One paragraph: what one row represents in the product's own words, and which module owns writes to
it. A table several modules write to says so here, because that is the fact that makes a change
dangerous.

## Columns

| Column | Type | Null | Default | Meaning |
|--------|------|------|---------|---------|
| `id` | uuid | no | generated | |
| `status` | enum | no | `pending` | See the state section below |
| `deleted_at` | timestamptz | yes | | Set instead of deleting the row |

`Meaning` is for what the type cannot say. Leave it empty rather than restating the column name in
words.

## Keys, indexes, and constraints

Primary key, unique constraints, foreign keys with their delete behaviour, and each index with the
query it exists for. An index whose query nobody can name is a finding, not a row.

## Relationships

What points here and what this points at, with the cardinality, linked to the other tables'
documents.

## Lifecycle of a row

How a row is created, what moves it between states, and how it ends. Where the states form a machine
with more than three transitions, draw it as a Mermaid state diagram per
`shared/diagram-conventions.md`; below that, prose is shorter than a picture.

Say plainly whether deletion is a delete or a flag, because every query in the project depends on the
answer.

## Access rules

Row-level security, tenant scoping, or the application-side filter that stands in for them. Name the
column the scope is on. Where both a database rule and an application filter exist, say so: a reader
who finds only one will assume it is the only one.

## Open questions

Each with the name of the person who must answer it.
````

## Rules

- Read the schema definition and the migrations, not the entity class. The class is one client of
  the table; the schema is the table.
- A default that the application sets rather than the database is written as such, in the `Meaning`
  column. The two behave differently on a direct insert, and that difference is where data goes bad.
- Enum values are listed with what each one means in the product. An enum documented as "one of
  five values" documents nothing.
- Do not name functions, sequences, or policies as the explanation of a rule. Describe the rule: a
  ten-digit number padded from a counter starting at 1, not the name of the sequence that produces
  it.
