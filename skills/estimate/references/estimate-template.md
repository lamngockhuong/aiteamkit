# Estimate template

Loaded by `atk:estimate` when it writes the sheet. The reader is the PM who commits the sprint, then
whoever re-estimates the same work after a scope change, or sets the next sprint against what this
one became. Every run writes the same shape, so that two estimates for two tickets, or two runs on
the same ticket, can be compared section by section instead of read from the top.

## The file

One file, at `docs/records/planning/estimate-<sprint-or-date>.md` per `shared/artifact-paths.md`:
front matter, a title, at most one opening note, then nine numbered sections in the order below. A
section with nothing in it is kept and says why it is empty: a missing heading reads as a section
the run forgot.

## Front matter

The shared block from `shared/artifact-paths.md`, with the values this skill fills in:

```yaml
---
title: "Estimate: <sprint name, or the epic or tickets estimated>"
status: IN REVIEW
owner: <the person who ran the estimate>
approver: <the PM who commits the sprint, or "TBD (ask <person>)">
created: YYYY-MM-DD
updated: YYYY-MM-DD
ticket: <epic or ticket ids or URLs, comma separated, or none>
---
```

`status` is `IN REVIEW` once every section holds its numbers, and never `APPROVED` from this skill:
the team commits, not the run. It stays `DRAFT` while section 6 is still waiting on an input a
person owes, such as the leave plan, because a commitment built on a capacity with holes in it is
not ready to be approved.

## Title and opening note

`# Estimate: <same line as the front matter title>`.

The opening note is one short paragraph, and only when a reader would otherwise misread the sheet:
that it re-estimates an earlier one, with a link to it, or that the owner and the approver are the
same person.

## 1. Items

One row per item: ID, title, source (ticket, or the requirement or breakdown path and its `AC N.M`),
and priority as the tracker or the source document gives it. Items marked `NEEDS INTAKE` stay in the
table with the question that blocks them and the person who must answer it, so the reader sees what
was left out and why.

## 2. Unit, scale, and buffer policy

- **Unit**: points, person-days, or hours, and why: the flag that named it, or the tracker field
  that records actual time.
- **Scale**: the Fibonacci steps for points; the rounding used for days or hours.
- **Buffer rates**: the rate for each confidence level, and whether they are the kit's defaults or
  come from `.atk/overrides/estimate.md`.
- **Complexity rubric**: the generic drivers of `references/complexity-drivers.md`, or the project's
  own from `.atk/overrides/estimate.md`, and whether it replaced or extended them.
- **Rate**, when hours come from a rate per point: the rate, the comparables it was calibrated from
  by their IDs in section 3, and the period they cover. With no calibration to show, the rate is a
  comparison model and belongs in the next line.
- **Comparison model**: the estimate model the project already keeps, if it has one, named here as
  the source of the comparison column in section 4 and not of any basis. `none` otherwise.

## 3. Comparables

One row per past item used as a basis, given an ID `C1`, `C2` that section 4 cites:

| ID | Ticket or PR | What it was | Layer and technology | Built | Estimated | Actual | Source of the actual |
|----|--------------|-------------|----------------------|-------|-----------|--------|----------------------|

`Built` is `AI assisted`, `by hand`, or `unknown`. A row whose layer, technology, or way of building
differs from the item it supports cannot lift that item to `HIGH` confidence.

Below the table, one line with the result of the measurement check from step 2: how many samples
record an actual exactly equal to their estimate, and what that did to confidence. An estimate
already on the ticket is not a comparable and does not appear here; it is handled in section 4.

## 4. Estimate per item

One row per item and line, with a line being one of `Understanding`, `Dev`, `QA`, `Review`, or
`Bug fix`. `Understanding` appears only where the team has a person understand the spec before
coding, and is sized per screen and layer from the understanding drivers:

| Item | Line | Size | Basis | Confidence | Unknown that would move it | Comparison |
|------|------|------|-------|------------|----------------------------|------------|

- **Basis** cites a comparable by its ID from section 3, or names the decomposition in a few words,
  or says `carried over, unchecked` with a link to where the number came from. It also names the
  driver counts that decided the size, such as `3 tables written, 1 external call`.
- **Comparison** holds the figure of the model named in section 2. The column is dropped when that
  model is `none`, and it never feeds a total.
- A total per line and a grand total close the table, before the buffer.

## 5. Buffer

One visible line per confidence level present: the section 4 total at that confidence, its rate,
and what it adds. The buffer is their sum, and the total with buffer follows. An item's share of the
buffer is its own lines at their own rates, which is what section 7 carries with it.

## 6. Capacity

A table of every subtraction from headcount times sprint days: public holidays, leave, on-call,
ceremonies, support duty. Then the focus factor and why it is that value, then net capacity. Where
the sheet is in hours, a row gives the hours in one person-day and its source, and net capacity is
stated in hours. An input still missing is a row that names the person who owes it, not a question
mark, and the status stays `DRAFT` until it arrives.

## 7. Sprint commitment

The items that fit within net capacity, in priority order, each at its section 4 total plus its
share of the buffer, with the running total against capacity. An item already in progress enters at
its remainder, the time already spent shown beside it. While section 6 still owes an input, every
item is listed as proposed and none is cut.

## 8. Overflow

What did not fit, in priority order, with its size. Kept when empty, with the line `Nothing
overflowed.`, so the cut stays visible. While section 6 still owes an input, the section holds
`Not cut yet: capacity is owed by <person>.` instead, because "nothing overflowed" would be a claim
about a cut nobody made.

## 9. Risks and open questions

The unknowns that would move the total most, each with the item it moves and by roughly how much.
Every open question names the person who must answer it, per rule 1 of `shared/team-roles.md`.

## Before the status moves to `IN REVIEW`

Every total equals the sum of the rows above it, and a figure carried into a later section is the
same figure: the grand total of section 4 is the base of section 5; the running total of section 7
is the committed items with their buffer; and the committed items plus section 8, both taken at
their full section 4 totals before buffer and before time already spent is taken off, equal the
grand total of section 4. A sheet still waiting on capacity checks the same sum with every item
proposed. Check the
sums before setting the status; a sheet whose columns do not add up is not ready for review.
