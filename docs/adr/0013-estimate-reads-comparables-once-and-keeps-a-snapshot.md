---
title: "ADR 0013: atk:estimate reads its comparables once per run, bounded, and keeps a dated snapshot"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-03
updated: 2026-11-03
ticket: none
---

# ADR 0013: atk:estimate reads its comparables once per run, bounded, and keeps a dated snapshot

Design: `docs/records/design/261103-0629-estimate-comparables-read-once.md`

## Context

Step 2 of `atk:estimate` reads the tracker for closed items like the one being sized, with no bound
on how much, how often, or what to do when the tracker does not answer. On GitHub the actual time is
a Project number field that issue search cannot filter, so a run pages the whole Project, once per
item it sizes. The maintainer reported on 2026-11-03 that this costs queries and waiting time, and
breaks down when GitHub has an incident or many tasks are estimated at once.

## Decision

- **Once per run.** Step 2 reads the pool of closed items once, before matching, and matches every
  item against it.
- **Bounded.** The read covers closed items that record an actual, with only the fields matching
  needs, filtered by the tracker where the tracker can filter. It is not cut at a date: the
  way-of-working date the override records keeps its role of capping a sample's confidence when it
  is matched (changed in review, R1 of the design).
- **A dated snapshot.** The pool is kept at
  `<docs root>/derived/estimate/comparables-<tracker>-<project>.tsv`, one file per tracker and
  project, held out of git by an ignore file holding `*` after the three containment checks the run
  trace uses, its titles and labels masked under rule 9 and stripped of control characters, and
  replaced whole through a temporary file named by the run. A later run reads what changed since its
  date, less one day, and the keys of the current filter set, and drops what left it; on a tracker
  with no update filter it reads in full. A read counts only when every page arrived.
- **A fallback for an outage only.** When the tracker is unreachable or times out, the run uses the
  snapshot, and the sheet names its date in Appendix B and C. On forbidden, not found or an expired
  login it uses none, since that may be access withdrawn.

## Consequences

- Tracker calls for comparables no longer grow with the number of items sized.
- A new derived kind, never staged, which `shared/artifact-paths.md` and `docs/artifact-lifecycle.md`
  list and count.
- An estimate made from the snapshot is visibly older than one made from the tracker, and the person
  who accepts it decides whether to re-run.
- On GitHub, `ProjectV2.items(query:)` filters on the closed state, a number field by its slug and
  the Project item's update time, measured on 2026-11-03. It returns zero items rather than an error
  for a qualifier it does not know, so a zero where `is:closed` alone returns items is a failed
  filter, and drops nothing from the snapshot.
- Runs in separate working trees keep separate snapshots, so each pays its own first full read.

## Alternatives rejected

- **Per-item reads, as today.** The reported problem.
- **The person names the comparables.** Trades queries for a person's time and drops the search the
  step exists to do.
- **Reading only items closed since the way-of-working date.** The date caps what a sample can
  support, it does not remove it, so cutting at the read drops comparables the sheet could still
  use below `HIGH`; most projects record no date; and the snapshot already pays the full read once.
  Chosen first, replaced in review.
- **A fixed recent window chosen by the kit.** A period nobody on the team chose, and samples outside
  it vanish without the sheet saying why.
- **No snapshot.** Leaves the incident case unanswered and every run paying a full read.
- **A committed snapshot shared by the team.** Every estimate run leaves a diff to review, and a stale
  copy on `main` reads as current to everyone who pulls.
