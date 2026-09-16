<!--
Thanks for contributing to atk (AI Team Kit)! Please fill in every section below.
Conventional Commits are required for the PR title (release-please uses them):
  feat: ...     -> patch bump (pre-1.0)   appears in CHANGELOG
  fix: ...      -> patch bump             appears in CHANGELOG
  feat!: / BREAKING CHANGE: -> minor bump (pre-1.0)
  docs: / chore: / refactor: / ci: / style: / test: -> no bump, silent in CHANGELOG
-->

## Summary

<!-- One or two sentences describing what this PR changes and why. -->

## Type of change

- [ ] Bug fix (`fix:`)
- [ ] New skill / new slash command (`feat:`)
- [ ] Skill content edit (`feat:` if new behavior, `fix:` if correction)
- [ ] Shared reference change (`shared/`)
- [ ] Manifest / metadata change (`feat:` / `fix:` / `chore:`)
- [ ] Release automation / CI (`ci:`)
- [ ] Documentation (`docs:`)
- [ ] Refactor / cleanup with no behavior change (`refactor:`)
- [ ] Other:

## Affected harness(es)

- [ ] Claude Code
- [ ] Cursor
- [ ] OpenAI Codex CLI
- [ ] All three (single source of truth change)

## Verification

<!-- Show evidence the change works. Paste command output, screenshots, or describe manual testing. -->

- [ ] All 5 manifest files still parse as JSON.
- [ ] Every `skills/*/SKILL.md` frontmatter still parses, with a lowercase hyphenated `name:` matching its folder and no `atk:` prefix.
- [ ] No em-dashes introduced anywhere outside `docs/`.
- [ ] If a document was added or renamed under `docs/`: the `docs/vi/` counterpart matches.
- [ ] If a skill was added or removed: `README.md`, `docs/skills-overview.md`, `docs/vi/skills-overview.md`, `docs/codebase-summary.md`, and the bug-report component dropdown all list it.
- [ ] If a skill's flags changed: the `## Invocation` block, `README.md`, and both `skills-overview.md` files agree.
- [ ] If `release-please-config.json` touched: all `extra-files` paths exist and JSON parses.

## Linked issues

<!-- Closes #123, Refs #456 -->

## Screenshots / output

<!-- Optional. For UX-affecting changes, paste before/after agent transcripts or terminal output. -->
