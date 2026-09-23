# Stack standards

Loaded by `atk:convention` at step 2, which names the languages and technologies the repository is
built with before deriving any rule, and at step 5, which writes one standards document per
technology when the project has recorded no conventions yet.

The rule behind the detection half is the one `skills/init/references/detection.md` opens with:
detect what a file states, ask what only a person knows. Which languages a repository is written in
is on disk. A question about it is a defect here, not a question.

## What counts as evidence

Four kinds, in falling order of trust. A technology is named from the strongest kind that answers,
and the evidence is recorded as the path that answered, never as "looks like".

| Evidence | What it proves | Examples |
|----------|----------------|----------|
| A manifest or lock file | The language and its package ecosystem, and every dependency it declares | `package.json` with its lock file, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle` or `build.gradle.kts`, `*.csproj`, `composer.json`, `Gemfile`, `Package.swift`, `mix.exs`, `CMakeLists.txt` |
| A framework's own config file, or a framework in the manifest's dependencies | The framework, on top of the language the manifest named | `tsconfig.json`, `next.config.*`, `angular.json`, `vite.config.*`, `manage.py`, `artisan`, `config/routes.rb`, a `react` or `spring-boot` dependency |
| File extensions, counted | A language with no manifest, such as shell scripts or SQL files | `*.sh`, `*.sql`, `*.tf`, `*.proto` |
| A conventional directory or contract file | A concern the team keeps rules for, rather than a language | `migrations/`, `openapi.yaml`, `Dockerfile`, `.github/workflows/` |

Count tracked files only, from `git ls-files`, so that vendored, generated, and ignored paths such as
`node_modules/`, `vendor/`, `dist/`, and `build/` never vote. Outside a git repository, exclude those
directories by name and say the count was taken without git.

## When the repository gives two answers, or none

| Case | What to do |
|------|------------|
| JavaScript and TypeScript both present | TypeScript when a `tsconfig.json` exists and `*.ts` files outnumber `*.js`; name both when each passes the threshold below, because their rules differ |
| Java and Kotlin under one Gradle or Maven build | Count `*.java` against `*.kt` and name each that passes the threshold |
| A manifest in a member directory as well as at the root | Record each technology with the paths it applies to. On a project whose shape names members, per `shared/project-profile.md`, the answer is per member |
| A manifest declares a framework no source file imports | Name the language and leave the framework out. A dependency nobody uses is not a stack |
| A framework config file with no matching dependency | Name it with both paths and say they disagree. Which one is current is the Tech Lead's call |
| Nothing answers | Say that no technology was detected, and derive the rules that hold across the repository, as step 2 always has. Do not guess a language from the repository's name |

## The threshold

A language with four files in a repository of two thousand is not the project's stack. Name a
technology when either holds:

- a manifest or a framework config file declares it, which is a statement rather than a count;
- counted by extension, it makes up at least 10 percent of the tracked source files.

Say the share in the same shape step 2 already uses for a pattern: "412 of 530 source files", not
"mostly TypeScript". A technology below the threshold is listed in the index as seen and below the
threshold, with its count, and gets no standards document. A team that wants one anyway says so in
`.atk/overrides/convention.md`, per `shared/project-overrides.md`.

## Grouping the derived rules

Every rule step 2 derives lands in exactly one of two places:

- **Under one technology** when the pattern exists because of it: import order, naming of files and
  symbols, error handling idiom, logging calls, where test files sit and how they are named. The
  population it was counted over is that technology's files, not the whole repository.
- **Across the repository** when it holds whatever the language: branch names, commit message
  shape, pull request size, review turnaround, directory layout above the level of one technology.

A rule does not appear under two technologies. Where TypeScript and JavaScript files follow the same
naming rule, it is written once under the one that dominates and the other file links to it.

## The standards set

For a project whose resolution in `shared/review-checklist.md` found nothing, the output is a
directory under the docs root, placed per `shared/artifact-paths.md`. Under `--out` the path names
that directory, and the index sits inside it:

```
docs/standards/
  index.md       the stack, the cross-cutting rules, the checklist, the enforcement table, proposals
  <tech>.md      one per technology that yielded at least one rule
```

`<tech>` is the lowercase key of the technology: `typescript`, `python`, `go`, `react`, `sql`,
`rest-api`. Use a key that is safe as a file name, so `csharp` and `cpp` rather than `c#` and `c++`.
The kit's source list in `references/standard-sources.md` uses the same keys, so a run can match a
document to its sources without translating names.

`index.md` carries, in this order:

1. The front matter block from `shared/artifact-paths.md`.
2. The stack table: each technology, the evidence path, the count, and the paths it applies to,
   plus the technologies seen below the threshold and those that yielded no rule.
3. The rules that hold across the repository: branch and commit, layout above one technology,
   review etiquette.
4. The review checklist in the record format of `shared/review-checklist.md`, for every document in
   the set. `atk:review` reads exactly one checklist section, so the `REVIEWED` rows of every
   technology are here, not in the file they describe.
5. The enforcement table mapping every rule in the set to its bucket and tool.
6. A link to each `<tech>.md`.
7. Under `--suggest`, the proposals section: each rule drawn from a published standard and picked by
   the user, with its link, outside the checklist, per `references/standard-sources.md`.

Each `<tech>.md` carries the front matter block, the evidence it was named from and the paths it
applies to, then the sections that technology has rules for: code layout and naming, error handling
and logging, testing. A section with no derived rule is left out rather than written empty. Rules
here are prose with their `source` as `path:line`; a rule that is also a checklist row names its
`CONV-NNN` so a reader can find the row in `index.md`.

`CONV-NNN` is sequential across the whole set, never per file. Two files each starting at
`CONV-001` give `atk:review` two rules with one ID.

## Three rules the set never breaks

- **The project's own shape wins.** A project that already keeps a `docs/conventions.md`, a
  `CONTRIBUTING.md` section, or a standards directory of its own gets its rules in that shape, per
  The project's own shape wins in `shared/review-checklist.md`. This set is for a project with
  nothing written, and converting an existing shape into it is its own piece of work with its own
  approver.
- **No empty file.** A technology the run looked at and derived no rule for gets one line in the
  index saying so, never a `<tech>.md` holding headings and nothing else. An empty document reads as
  a technology with no rules, which is a claim the run did not make.
- **No rule the code does not show.** Grouping by technology is a way of arranging what step 2
  found. A rule that sounds right for a language and has no `path:line` behind it is not written
  here, and it is not a convention of this project. Drawn from a published standard under
  `--suggest`, it is a proposal in the proposals section and nothing more.
