---
title: atk:review overrides
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-18
updated: 2026-09-21
ticket: none
---

This override belongs to the `aiteamkit` repository itself, not to your project. A plugin install
copies the repository whole, so it arrives with the kit; `atk:review` reads only the override at the
root of the project being worked on. Run `/atk:tailor review` there to write your own.

The rules about this repository's content are not here. They are the `CONV-NNN` rows in the "Review
checklist" section of `CLAUDE.md`, written by `/atk:convention`, and `atk:review` has already read
that section per `shared/review-checklist.md`. This file holds only what is true of the way the
skill works, which nobody can check without the kit installed.

## After

A diff that touches a verification command block in `CLAUDE.md` has to be checked by running that
block, not by reading it and calling it correct. A block with a syntax error still looks reasonable
on screen, and the person who trusts it is the next one. A command that does not run is reported at
BLOCKING, labelled `[atk-kit]`.

This holds for the commands a `CONV-NNN` row points at as well: the row states the rule, this says
to check it by running it rather than by reading it.
