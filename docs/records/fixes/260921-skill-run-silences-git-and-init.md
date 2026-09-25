---
title: "Fix: two skill runs had to decide what the shipped files left unsaid"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-21
updated: 2026-09-21
ticket: none
---

# Fix: two skill runs had to decide what the shipped files left unsaid

Written in English, per the working language in the Team section of `.atk/profile.md`. Author and
approver are the same person because this repository has one maintainer today; the profile records
why the two rows stay separate anyway.

## 1. Symptom as captured

Two skill run reports, written against atk 0.0.3 installed at
`~/.claude/plugins/cache/atk/atk/0.0.3`, on a client project. Neither
reports a wrong output. Both report the same failure mode, in the reporter's own words:

From `atk:init`, section 5:

> Nothing in the run's output was wrong. Every finding above is a place where the shipped file left a
> decision to the run, and the run happened to decide the way the author would have. That is the
> failure mode worth recording precisely because it leaves no trace in the artifact: the profile looks
> correct, and the next run on a different project resolves the same silence the other way.

From `atk:git`, section 5:

> The output matched what was wanted. As with the `atk:init` record, every finding is a silence rather
> than a wrong answer, which is the kind that leaves the artifact looking fine and resolves differently
> on the next project.

The individual findings, verbatim from the reports:

- `atk:git` 3.1: "This run had no calling skill. A person typed `/atk:git pr` after editing one file
  by hand. There is no artifact, so there is nothing to fill the template with and no path to link."
- `atk:git` 3.2: "Both readings of line 52 are available, and they give opposite answers." Cost:
  "the marker is visible to every reviewer and to the client."
- `atk:git` section 2: "a reader checking 'did every step run' against the workflow diagram has to go
  back to the invocation block to learn that one of them is not supposed to."
- `atk:init` 3.1: "That file states, authoritatively and by design, both halves of what the table
  calls undetectable: the handle, and a statement that the person owns something."
- `atk:init` 3.2: "The run detected the value and put it through step 2 for confirmation rather than
  spending an interview turn on it. Read strictly, the table says to ask."
- `atk:init` 3.3: "Under the first reading the ceiling of eight is unreachable and the budget stops
  meaning anything; under the second, a harness feature that costs the user less is scored as though
  it cost them more."

The two records are at `docs/derived/feedback/git-2026-09-21.md` and
`docs/derived/feedback/init-2026-09-21.md` in that project. `docs/derived/` is gitignored there, so
the copies quoted above are the record.

## 2. Root cause

Five instructions that are each complete for the case their author had in front of them and silent
about a neighbouring case that arrives just as often. Line numbers are as the files stood before this
change.

| # | Mechanism | Location |
|---|-----------|----------|
| 1 | The pull request body is specified only for a run a calling skill handed work to, while the skill's own `## Invocation` block documents the bare `/atk:git` that has no calling skill | `skills/git/SKILL.md:52` against `:117`, and `skills/git/references/pr-body.md:37-38`, `:44-46` |
| 2 | The tool-naming rule is stated inside a section headed **3. Commit** and then restated one file away with a scope word, "the body", that means the commit body where it sits and the pull request body one step later | `shared/finalize-steps.md:72` and `skills/git/references/commit-craft.md:51-52` |
| 3 | The workflow pipeline names five steps and says which flags leave the line, for three of the six flags that do | `skills/git/SKILL.md:66`, `:71-72` against `:53-54` |
| 4 | The never-detectable table is absolute, while the Commands section three pages above it already grants the escape the table needs: a project that wrote the answer into its agent instruction file has it detected, not asked for | `skills/init/references/detection.md:170` against `:44-45` |
| 5 | The interview budget is counted in turns and never says what a turn is on a harness that carries several questions in one prompt | `skills/init/references/detection.md:187` |

Mechanism 1 and mechanism 4 are the same shape from two skills: a file that handles one case well and
leaves its mirror unwritten. `pr-body.md` handles "no template" and not "no artifact"; `detection.md`
handles "the project wrote down a command" and not "the project wrote down a handle".

## 3. Evidence

The responsible lines, with the check that shows they produce the behaviour. All five reproduce at
`6b6dd54`, the repository head when this fix started, so none of them was already closed by the work
that landed after 0.0.3 was cut.

**1. No artifact.** `skills/git/SKILL.md:117` and `shared/finalize-steps.md:82` both say "the artifact
the calling skill produced". `pr-body.md:37-38` says the sections are answered "from the artifact the
calling skill produced and from what this run actually did", and `:44-46` makes the artifact link
mandatory: "a body that drops the link has lost it". The same file's `:30-33` handles the mirror case
for templates and says it is the normal one. Check: `grep -n "calling skill" skills/git/SKILL.md
skills/git/references/pr-body.md shared/finalize-steps.md` returns four hits and no line anywhere
under `skills/git/` says what happens when there is no calling skill.

**2. Scope of the tool-naming rule.** `shared/finalize-steps.md:66` opens `## 3. Commit`; the rule
sits at `:72`, inside it; `## 4. Push and pull request` opens at `:79`. So the owning file scopes the
rule to the commit by position and never by sentence. `commit-craft.md:51-52` then says it "applies
to the body, to a trailer, and to anything a host would otherwise append", inside a section headed
`## The message` whose two preceding paragraphs are about the subject and body of a commit.
`pr-body.md` is silent. Check: `grep -rn "name the tool" skills/ shared/` returns three hits, the
third being `skills/convention/SKILL.md:104` which is an unrelated use of the same words.

**3. Which flag ended the run.** `skills/git/SKILL.md:66` draws five steps. `:71-72` says `--rebase`,
`--resolve` and `--stack` leave the line. `--commit` at `:53` and `--pr` at `:54` also end the run
early and are named only in the invocation block, 17 lines above the pipeline they change.

**4. The never-detectable table.** `detection.md:170` reads "Ask these, and nothing else:" with no
exception anywhere in the section. `:44-45` grants exactly that exception for a Commands cell: "The
agent instruction file (`CLAUDE.md`, `AGENTS.md`). A repository that ships content rather than an
application often has its only checks written down here and nowhere else." Check:
`grep -rn "CODEOWNERS" skills/init/` returned one hit before this change,
`profile-template.md:81`, which names `CODEOWNERS` as a consumer of the host identifier. No file
under `skills/init/` named it as a source, while `shared/host-file-locations.md:35` already holds
every location a host reads it from.

**5. What a turn is.** `detection.md:187` reads "The unit is **one turn asking the user**, not one
fact. Four turns are fixed". `:199` reads "Eight is a ceiling, not a target." The same sentence at
`:187-189` already treats one prompt carrying several facts as one turn, for the team table: "all
roles, their host identifiers and their approvals in a single question, never one question per role
and never a second turn for the identifiers". That is the reading the run took, and nothing states it
as the rule. `skills/tailor/SKILL.md:98` works to the same budget, so the ambiguity was in front of
two skills, not one.

## 4. Why it surfaced now

Broken since each file was written, and each was written before the case existed.

- `skills/git/references/pr-body.md` arrived at `81e0053` (#25), whose subject is filling the
  project's template. The case it was written for is a calling skill handing over an artifact.
- `shared/finalize-steps.md` arrived at `cf90c7f` (#3), before `atk:git` existed as a skill, so the
  rule at `:72` had only a commit to scope itself against.
- `skills/init/references/detection.md` arrived at `03b6234` (#2), the commit that added `atk:init`.
- `shared/host-file-locations.md` arrived at `89d3fa3` (#26), well after `detection.md`'s
  never-detectable table, so the table could not have cited it.

What made all five reachable on the same day is the same thing: the kit was run against a real
project that is not this repository. That project has a `CODEOWNERS`, an agent instruction
file that states where the spec lives, an optional section in its pull request template, and a house
rule about authorship markers. This repository has none of those, so its own runs never reached any
of the five.

## 4b. Recorded intent, and the conflict when there is one

Searched for a recorded decision on each of the five before changing anything:
`grep -rn "name the tool\|authorship\|Co-authored\|marker" skills/ shared/ docs/ README.md CLAUDE.md`
and `grep -rn "one turn\|question budget\|turns are fixed" skills/ shared/ docs/`. Nothing in the kit
records a decision on the scope of the tool-naming rule or on what a turn is. `CLAUDE.md` under
"Commits" governs this repository's own commits and says nothing about a pull request body.

Two of the five are decisions a role owns rather than gaps a run may close, so both were put to the
approver before any file changed, and both answers are recorded here as the decision:

1. **The tool-naming rule stops at the commit.** The pull request body and the issue comment are
   outside it. A team whose own policy requires an authorship marker on what it posts to the host is
   following its own policy, and needs no override to do so.
2. **The two findings the reports classified as project overrides stay classified that way.**
   `atk:git` 3.3 and `atk:init` 3.4 are not changed in the kit. Section 9 records them.

## 5. The change

Five instructions gained the sentence they were missing, and nothing else moved. `pr-body.md` gained
a paragraph for the run with no artifact, which says what fills the template instead and that the
link bullet is dropped rather than pointed at an invented path. `shared/finalize-steps.md` gained the
scope of the tool-naming rule as the approver decided it, and `commit-craft.md` stopped restating
that scope in its own words and now points at the file that owns it, which is what made the two
readings possible. `skills/git/SKILL.md` gained one paragraph naming `--commit` and `--pr` beside the
paragraph that already does this for the other three flags. `detection.md` gained the exception the
never-detectable table lacked, naming `CODEOWNERS` and the agent instruction file, plus the split
that `CODEOWNERS` answers the handle and the ownership scope and never the role name. The interview
budget now says a multi-question prompt spends one turn, with the definition itself in
`shared/host-capabilities.md`, which is where the kit keeps facts about the harness and where
`atk:tailor` reaches it through `atk:init`.

Two shared files gained a third citer as a consequence, `host-capabilities.md` and
`host-file-locations.md`, and the four documents that enumerate citers were corrected to match, in
both languages.

Tidy step: run by hand against `shared/tidy-pass.md`, because the host capability, `/simplify` in
Claude Code, reviews changed code and this diff is Markdown prose with no code in it. It found one
real duplication and three wording defects inside the lines this change added, all fixed: the scope
sentence was stated twice, once in `shared/finalize-steps.md` and once in `commit-craft.md`, which is
the exact duplication that caused finding 2, so `commit-craft.md` now defers instead; two paragraphs
were re-wrapped after edits left ragged lines; one sentence in `skills/git/SKILL.md` was split at a
misplaced "otherwise". Nothing outside the added lines was touched.

## 6. Verified

This repository ships content and does not run, so `.atk/profile.md` points the Commands row at
`CLAUDE.md`, section "Common verification commands". That block is what stands in for a test suite,
and all of it was run after the change and again after the tidy step.

| Check | Result | What it proves |
|-------|--------|----------------|
| All five manifests parse | pass | No manifest was touched, and none was broken by a stray edit |
| Every skill folder's `name:` matches its folder | pass, 21 of 21 | The frontmatter of `skills/git/SKILL.md` survived the edit to its body |
| `docs/` and `docs/vi/` mirrored | pass, empty diff | The four documents edited in both languages stayed paired |
| `hooks.json` parses, both hooks pass `node --check`, exec form holds | pass | Untouched, confirmed untouched |
| Every `evals/trigger_evals.json` parses | pass, 21 files | No description changed, so no eval needed rewriting |
| No `ak:` in `skills/`, `shared/`, `README.md`, `docs/` | pass, grep exit 1 | The added prose names no other kit's command |
| No em-dash outside the two files that document the rule | pass, grep exit 1 | Also checked per added line: `git diff` shows zero U+2013 or U+2014 in anything this change added |
| No hardcoded diagram fill | pass, grep exit 1 | No diagram was added |
| `SKILL.md` under 300 lines | pass, `git/SKILL.md` at 180 | The only `SKILL.md` this change touched |
| Added lines within the repository's 100 column wrap | pass | Checked per added line, one line reflowed after the tidy step |

The captured symptom re-run: each of the five findings was re-read at its location after the change.
All five now state the case the report said they were silent about. This is the honest form of a
reproduction for a defect whose symptom is an absent sentence; there is no command that reproduces
it.

## 7. Not verified

- **That a fresh run of either skill now decides the same way.** The two reports came from runs
  against the client project, which this session did not re-run. What was verified is that the
  instruction each run had to guess at is now written down, not that a new run reads it as intended.
  Re-running `atk:init --audit` and `atk:git --pr` on that project is the check that would close
  this, and it belongs to whoever next works there.
- **The claim about the harness in `shared/host-capabilities.md`.** "Claude Code ships this as a
  single prompt carrying up to four questions" is taken from this session's own behaviour, not from a
  Claude Code document. It is true of the harness this ran on and was not verified against Cursor or
  Codex, which is why the paragraph that follows it is written to hold on a harness that asks one
  question at a time.
- **The Vietnamese prose in the four mirrored documents.** Translated by hand and checked
  fact-by-fact against the English, not run through a checker. The mirror check proves the files
  pair, not that the sentences agree.

## 8. Blast radius

Every reader of a changed file. The two `shared/` files that gained a citer are the ones worth
checking against the diff.

| Reader | Of what | Exercised |
|--------|---------|-----------|
| `skills/convention/SKILL.md:76`, `:137` | `shared/host-file-locations.md` | not exercised; the added sentences name `atk:init` and change nothing `convention` reads |
| `skills/git/references/pr-body.md:24` | `shared/host-file-locations.md` | read; the intro it cites now says three skills instead of two, and the resolution it needs is unchanged |
| `skills/implement`, `skills/fix`, `skills/verify` | `shared/host-capabilities.md`, tidy step | not exercised; the new section sits above theirs and adds no rule they read |
| `skills/review/SKILL.md` | `shared/host-capabilities.md`, parallel reviewers | not exercised; same reason |
| `skills/tailor/SKILL.md:98` | the budget in `detection.md`, by citing `atk:init` | read, not run; the chain to the new definition holds through `detection.md:187` |
| `skills/implement`, `skills/fix`, `skills/verify`, `skills/tailor` | `shared/finalize-steps.md` | not exercised; the added paragraph narrows nothing they already do, it states where an existing rule stops |
| `CLAUDE.md`, `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`, and the three `docs/vi/` mirrors | the citer lists for the two shared files | read and corrected in this change; the mirror check passes |

No public contract moved, so no reference document is owed under `shared/spec-docs.md`. The four
documents above are not reference documents for a contract; they describe the `shared/` layer, and
they were corrected because this change made three of their sentences false.

## 9. Left for later

- **`atk:git` 3.3, the optional template section.** A project template that marks a section optional
  meets `pr-body.md`'s rule that a section the artifact cannot answer "keeps its heading and gets one
  line saying what is missing and who can answer it", and there is nobody to name for a
  documentation change that will never have a screenshot. Decided in this run to stay a project
  override. Reopen it if a second project reports the same line.
- **`atk:init` 3.4, ownership that is not a role.** The Team table in `profile-template.md` ships a
  row per job title, and a `CODEOWNERS` that splits by area has owners who are not a PM, a BrSE, a
  Tech Lead, a QA or an SRE. Decided in this run to stay a project override.
- **A profile that is untracked in the project it describes.** Raised in the `atk:git` report,
  section 5: that run read the Team section to pick a reviewer from a `.atk/profile.md` the project
  excludes from git locally, so a second person running the same skill there has no profile and the
  reviewer choice comes from somewhere else. Whether a skill should say something when the profile it
  read is untracked is a question for `shared/project-profile.md` and affects every skill that reads
  the file, which is more than this fix should decide. Owner: Lam Ngoc Khuong.
- **The `atk:init` report, section 4.** The Team table reads as a roster, and the user asked during
  the interview whether every member belongs in it. `profile-template.md` answers that in a comment
  addressed to whoever fills the template rather than to whoever reads the result. One line, not
  taken here because it was not among the numbered findings.

## Correction, 2026-09-25

The client project this record was written against was named in three places. It is now "a client
project", per "A record here names no client" in `CLAUDE.md`. Nothing else in the record changed.
