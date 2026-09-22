---
name: convention
description: >
  Extract, record, and enforce the coding conventions a team actually follows: branch and commit
  rules, naming, layering, error handling, test layout, review etiquette, and the tooling that
  enforces each rule automatically.
  Also offers to draft the collaboration files the project has none of, `CONTRIBUTING.md`, the
  pull request template, and `CODEOWNERS`, writing only the ones the team picks.
  Use when a team has no written convention, when the written one no longer matches the code, when
  reviews keep repeating the same comment, or when the repository has no contribution guide, pull
  request template, or owners file.
  Triggers on: "convention", "coding standard", "quy ước code", "coding rule", "style guide",
  "branch strategy", "commit convention", "コーディング規約", "our team rules", "CONTRIBUTING.md",
  "CODEOWNERS", "contribution guide", "set up a pull request template", "tạo CONTRIBUTING",
  "file CODEOWNERS", "mẫu pull request cho dự án", "コントリビューションガイド",
  "プルリクエストのテンプレートを作成", "/atk:convention".
argument-hint: "[--audit|--init|--sync|--scaffold] [--scope <paths>] [--lang <code>] [--out <path>]"
---

# Team Conventions (`atk:convention`)

Writes down the rules a team already follows and enforces, rather than importing a style guide from
elsewhere. A rule that no tool enforces and no reviewer checks is a wish; this skill labels it as
one.

## Scope

Handles: deriving conventions from the existing codebase and git history, recording them, mapping
each rule to the tool that enforces it, auditing whether the code still matches the document, and
offering to draft the collaboration files the project does not have yet.

Does NOT handle: reviewing a specific change (`atk:review`), configuring CI pipelines beyond the
lint and format layer, or choosing the tech stack.

## Roles

Tech Lead owns the document and is the approver. Every Dev is bound by it. A rule added without the
team agreeing is a proposal, marked as such. See `shared/team-roles.md`.

## Invocation

```bash
/atk:convention                   # Derive from the codebase and write or update the document
/atk:convention --audit           # Report where the code and the document disagree; writes no project file
/atk:convention --init            # Bootstrap a document for a project with no conventions yet
/atk:convention --sync            # Update the document, and offer the step 6 files whose source moved
/atk:convention --scaffold        # Offer the collaboration files the project lacks; write only the ones picked
/atk:convention --scope src/api   # Limit derivation to given paths
/atk:convention --lang vi         # Write the document and the report in Vietnamese
/atk:convention --out <path>      # Override the conventions document path; never the step 6 files
```

## Workflow

```
[1. Read existing] -> [2. Derive from code] -> [3. Classify] -> [4. Map to tooling]
  -> [5. Write] -> [6. Offer what is missing]
```

Before step 1, read `.atk/overrides/convention.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Read what exists

Read `.atk/profile.md` first, since its Docs section opens the resolution below. This skill is
Required-soft in the three-group table of `shared/project-profile.md`: a missing profile does not
stop the run, and the artifact says none was found.

Resolve where this project keeps its conventions, per Where the rules live in
`shared/review-checklist.md`, and read what is there. A project that keeps a standards directory
rather than one file has its conventions across all of those documents, so read the set, not the
first file in it.

Read the convention gaps that reviews have already reported, from the `Convention gaps` section of
the review reports under the reviews path in `shared/artifact-paths.md`. That section is where
`atk:review` puts a rule it wanted and the project has not recorded, and this is the step that
carries it across, per Keeping them in step in `shared/review-checklist.md`. Each one enters step 3
as a candidate like any other rule, with the review that raised it as its source, and is offered to
the Tech Lead rather than written in as agreed. Where the reports are gone, or the project keeps
them outside version control, nothing is lost here that the next review will not raise again.

Read `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`, `.editorconfig`, linter and formatter configs,
`CODEOWNERS`, and PR templates as well, and record which of them exist: a convention nobody read is
reported as absent rather than as followed. Of these, the three that step 6 offers are
`CONTRIBUTING.md`, the pull request template, and `CODEOWNERS`; resolve whether each exists through
`shared/host-file-locations.md`, which lists every location its host reads. The rest are read here
and never drafted. Do not duplicate what a config file already states: link to it. A rule the project has already written is not
rewritten here either; it is classified in step 3 and cited where it lives.

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

Update the document resolved in step 1, in place. Its review checklist section holds the `REVIEWED`
rules only, per `shared/review-checklist.md`; an `ENFORCED` rule is already checked by a tool and
repeating it wastes a reviewer's attention, and `ASPIRATIONAL` rules are listed apart and marked
unchecked.

Where the project already keeps conventions, its shape wins, under the rule of that name in
`shared/review-checklist.md`. Write into the set as it is arranged, put the checklist section in its
index document, and leave the rest of the set alone. Converting a team's standards directory into
this skill's default layout is its own piece of work with its own approver, never a side effect of
recording one rule.

Tell the user which document now carries the checklist, so the Docs section of `.atk/profile.md`
records it and the next skill resolves it without guessing.

Where the project has a `CONTRIBUTING.md`, keep the human contribution flow there and link to the
conventions rather than copying them.

### 6. Offer what is missing

Three files decide how a change is proposed, what a reviewer is shown, and who is asked to look at
it: `CONTRIBUTING.md`, the pull request template, and `CODEOWNERS`. Step 1 already knows which of
them this project does not have.

Say which are missing, offer a draft of each, and write only the ones the user picks. Picking none
is an answer and ends the step. A code host reads these three per repository, so in a project whose
shape names members the question is asked per repository and the answer may differ: a parent that
carries `CONTRIBUTING.md` for everyone and members that carry their own `CODEOWNERS` is an ordinary
answer, and one set written at the parent is one the members' hosts never read. Never write one because a project of this shape usually has it: the
three files bind everyone who opens a pull request here, including people who never installed this
kit, so which of them exists is the Tech Lead's call under rule 3 of `shared/team-roles.md`.

`references/collaboration-files.md` holds what each file carries, what a drafted `CODEOWNERS` needs
before it may be offered at all, and why an owner is never derived from who touched a file last.
Where each file lives is `shared/host-file-locations.md`, and a file present at any of its locations
is left alone on every run but one. A drafted file is built from something that keeps moving, the
enforcement table for the template and the Team section for `CODEOWNERS`, so under `--sync` this
step also says which of them the source has moved under, shows what would change, and writes only
what the user picks. What it shows is the change, never a fresh draft laid over the file, so a
person can see whether their own edits are in the way. Outside `--sync`, a disagreement is an open
question carrying a name and nothing more.

A written file is a proposal until the Tech Lead accepts the pull request carrying it, the same as
every rule `--init` writes. Record who picked it and which role approves it where this run's other
output goes, and name the paths written so the Docs section of `.atk/profile.md` records them, as
step 5 does for the checklist. Under `--scope`, say which part of the repository the run actually
read, because these three files bind all of it.

### `--audit`

Runs steps 1 to 4 and stops. It writes nothing into the project: the report comes back in the
session, and goes to a file only under `--out`, because an audit records one moment while the
conventions document is the thing meant to last.

It reports five things, in this order:

1. Which document the resolution in step 1 landed on, and which one carries the review checklist.
   Where the resolution came up empty, say the project has recorded no conventions rather than
   naming the default as though it existed.
2. Every disagreement between a written rule and the code: the rule, where it is written as
   `path:line`, and the counter-evidence as a count over a population, such as "69 of 568 files".
   Two documents stating the same rule differently are one finding carrying both sources, and which
   of them is right is the Tech Lead's call under rule 3 of `shared/team-roles.md`.
3. Every `ASPIRATIONAL` rule with the tool that could enforce it, or `none` where there is none, and
   every checklist rule no recent review has cited, per Keeping them in step in
   `shared/review-checklist.md`.
4. Which of the three collaboration files the project has, which are missing, and which carry a
   checklist or an owner list the enforcement table and the Team section no longer agree with. It
   reports them and writes nothing, which is what separates this flag from `--sync`.
5. One line naming the rules checked and found clean, so "checked, no drift" reads as different from
   "not checked".

Findings cite `path:line`, never `CONV-NNN`. An ID is assigned when a rule is written into the
document, and one invented during an audit collides with the next write.

### `--init` and `--sync`

Both run the whole workflow. They differ in what step 1 expects to find and what step 5 may touch.

`--init` is for a project the step 1 resolution found nothing for. It still reads the configs and
derives from the code, and every rule it writes is a proposal until the Tech Lead agrees, per the
Roles section above.

`--sync` is for a document that has fallen behind the code. It changes only the rules the code
contradicts and the buckets that moved, and leaves the wording of every rule the code still matches
exactly as it is. It is also the one mode where step 6 looks at a file the project already has: a
template whose checklist no longer matches the enforcement table, or a `CODEOWNERS` whose names the
Team section has moved past, is offered as the change it would make. `--init` and a plain run offer
the missing files only. A disagreement it cannot settle becomes an open question carrying the name of
whoever can answer it, never a silent rewrite.

### `--scaffold`

Runs step 1 and step 6 and nothing else, and offers the missing files only; bringing a file that
already exists back in step with its source is `--sync`. It is for a team that has its conventions
written already and wants the files that carry them into daily work, without a full derivation pass
rewriting the document on the way.

The drafts are built from what step 1 read. A conventions document written by hand carries rules
with no bucket against them, and this flag does not classify them, because that is step 3 and it is
the Tech Lead's output. Such a rule gets no checkbox: list them in the template as a link to the
document and say how many were left unclassified, or run the skill without the flag to have them
classified first.

Where the project has recorded no rules at all, say so and draft the template with the baseline
items alone, per `references/collaboration-files.md`. Where nothing is missing, say that too; a run
that found all three present has an answer rather than no output.

## Output

Written to the document resolved per `shared/review-checklist.md`, which is `docs/conventions.md`
by default under `shared/artifact-paths.md`.

For a project with nothing written yet, the sections are: front matter, branch and commit rules,
code layout and naming, error handling and logging, testing rules, the review checklist in the
`shared/review-checklist.md` record format, and the enforcement table mapping every rule to its
bucket and tool.

For a project that already keeps conventions, the same content goes into the shape it already uses,
and the two sections it will not have are the review checklist and the enforcement table. Those are
the addition; the rest is classification of what is already written.

The files the user picked in step 6 go where their host reads them, per
`shared/host-file-locations.md`, and not into the docs tree `shared/artifact-paths.md` governs. They
are the project's own collaboration files rather than artifacts of this kit: none carries the front
matter block, and they are committed like the project's linter config.

Putting the conventions document where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. Automation gaps found in step 4 become issues, one per rule,
only when the user asks.

## Definition of done

- [ ] Every rule is derived from the code or explicitly agreed, never imported unexamined.
- [ ] Every rule is classified `ENFORCED`, `REVIEWED`, or `ASPIRATIONAL`.
- [ ] The document links to config files instead of restating their contents.
- [ ] A project that already keeps conventions still has its own shape afterwards.
- [ ] The document carrying the checklist is named to the user, for the profile to record.
- [ ] Every file listed in step 1 was checked, and the absent ones were reported as absent.
- [ ] Convention gaps already reported by a review were read and carried in as candidates, each
      naming the review that raised it, or the run said no review report was there to read.
- [ ] `--audit` changed no file and cited `path:line` rather than assigning an ID.
- [ ] `--sync` left the wording of every rule the code still matches untouched.
- [ ] Rules the team has not agreed to are marked as proposals.
- [ ] The review checklist section carries only `REVIEWED` rules, each with an ID and a default severity.
- [ ] On a run reaching step 6, every missing collaboration file was offered and none was written
      unpicked. A file the project already had was left alone, except under `--sync`, where the
      change was shown and picked before anything was written.
- [ ] A drafted `CODEOWNERS` was offered only where the Team section named owners with host
      identifiers, and no owner came from git history or from commit metadata.
