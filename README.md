# AI Team Kit (`atk`)

Twelve skills covering the software delivery lifecycle of a **company project team**, not a solo
developer. Every skill assumes work has an author and a separate reviewer, decisions have an owner,
and artifacts are read by someone who was not in the conversation that produced them.

Compatible with Claude Code, Cursor, and OpenAI Codex CLI.

Walkthrough of what each skill means and when to use it:
[docs/skills-overview.md](docs/skills-overview.md) (English) /
[docs/vi/skills-overview.md](docs/vi/skills-overview.md) (Tiếng Việt).

## Lifecycle

```
intake -> estimate -> design-doc -> breakdown -> convention -> review -> qa -> release
                                                                                  |
                         onboard / handover (any time)          incident <--------+
                                                                    |
                                                                  retro
```

## Skills

| Skill | What it produces |
|-------|------------------|
| `atk:intake` | A raw request turned into user stories, testable acceptance criteria, non-goals, and open questions with an owner each. |
| `atk:estimate` | Sizes with a stated basis and confidence, net capacity after leave and ceremonies, a sprint commitment, and the overflow that did not fit. |
| `atk:design-doc` | A technical design reviewable without a meeting: cited current state, compared options, data and API changes, rollback, plus the ADR. |
| `atk:breakdown` | An epic split into owned tasks with a dependency graph, parallel lanes with file ownership, and a definition of done per task. |
| `atk:convention` | The team's real conventions derived from the code, each classified as enforced by tooling, checked in review, or merely aspirational. |
| `atk:review` | A pull request reviewed against requirement, design, and conventions, with blocking findings separated from preferences. |
| `atk:qa` | A test plan, test cases traced to acceptance criteria, negative and boundary coverage, a justified regression matrix, and entry and exit criteria. |
| `atk:release` | Release notes per audience, a checklist with an owner per step, migration reversibility, and a rollback path written before the deploy. |
| `atk:incident` | A timestamped incident timeline, a root cause supported by evidence, a blameless postmortem, follow-up actions with owners, and the runbook. |
| `atk:retro` | Last retro's actions verified first, sprint evidence from git and the tracker, at most three new actions, and the status report. |
| `atk:onboard` | Setup verified against the repository, an access list with who grants what, a code map by owner, and a first week ending in a merged change. |
| `atk:handover` | In-flight work with its true state, the decisions and traps that live in one head, access transfer, and a receiver who validates before signing. |

## Invocation

Every skill is its own slash command, namespaced `atk:`. There is no separate command layer.

```bash
/atk:intake <request-file|ticket|text>   # --interview/--no-interview --lang --out
/atk:estimate <backlog|epic>             # --points|--days --sprint --capacity --out
/atk:design-doc <requirement|topic>      # --adr|--no-adr --options --lang --out
/atk:breakdown <design|epic>             # --members --parallel --tdd --out
/atk:convention                          # --audit|--init|--sync --scope --lang --out
/atk:review <pr|branch|paths>            # --against --comment --strict --out
/atk:qa <requirement|feature>            # --plan|--cases|--regression --lang --out
/atk:release <version|range>             # --notes|--checklist --audience --env --out
/atk:incident                            # --live|--postmortem|--runbook --out
/atk:retro <sprint|range>                # --data-only|--report --audience --lang --out
/atk:onboard                             # --role --refresh|--audit --lang --out
/atk:handover --from <a> --to <b>        # --scope --phase|--offboard --lang --out
```

## Where the output goes

Artifacts are Markdown, written into the **target project** under `docs/`, one folder per lifecycle
stage. The full path table, the naming rules, and the shared front matter live in
[shared/artifact-paths.md](shared/artifact-paths.md).

`atk` is tool-agnostic: the Markdown artifact is the source of truth and a tracker holds a pointer
to it. [shared/ticket-adapters.md](shared/ticket-adapters.md) maps the vocabulary to GitHub Issues,
Jira, Backlog, and Redmine, and no skill creates tickets without showing the list and getting a yes.

The role vocabulary every skill shares is in [shared/team-roles.md](shared/team-roles.md).

`atk:convention` and `atk:review` share one more file,
[shared/review-checklist.md](shared/review-checklist.md), so a team rule is written once and
enforced in the same words: `convention` records each rule with an ID and a default severity, and
`review` cites that ID in its findings instead of restating the rule from memory.

## Installation

### Claude Code

```bash
/plugin marketplace add lamngockhuong/aiteamkit
/plugin install atk@atk
```

### Cursor

In Cursor Agent chat:

```
/add-plugin atk
```

### OpenAI Codex CLI

Open plugin search with `/plugins`, search for "atk", then Install Plugin.

## Local development install

```bash
git clone https://github.com/lamngockhuong/aiteamkit
cd aiteamkit
/plugin marketplace add .
/plugin install atk@atk
```

## Relationship to other kits

`atk` stands on its own. Every skill runs on what the kit ships plus the project it was installed
into, and no skill hands work to a command from another kit. Where a skill stops, its `## Scope`
section names the `atk` skill that takes over, or says the work belongs to a person.

Installing `atk` beside another kit is fine. Neither needs to know about the other.

## License

MIT. See [LICENSE](LICENSE).
