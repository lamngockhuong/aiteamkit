---
name: good-skill
description: >
  Sample skill for atkx:skill-eval: summarises a changelog file into three lines for a release
  announcement. A fixture with a known verdict, not a skill to install. Triggers on: "summarise
  the changelog", "tóm tắt changelog", "変更履歴を要約".
argument-hint: "<changelog-path>"
---

# Good skill

A fixture. Its expected verdict is in `expected.json`, one directory up, read by the check beside it.

## Workflow

1. Read the changelog the user names.
2. Read `assets/style.md` for the three-line shape.
3. When the user asks for the project's docs page, `scripts/docs-link.sh` prints the link to
   docs.example.invalid, the one host this skill talks to.
4. Print the three lines. Write nothing to disk.
