---
title: "Fix: spec stamped one ticket on shared documents, cited an ignored design, and left translations behind; git left a new branch tracking main"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-02
updated: 2026-10-02
ticket: none
---

# Fix: spec stamped one ticket on shared documents, cited an ignored design, and left translations behind; git left a new branch tracking main

## In short

On a client project, `/atk:spec --from <design>` updated six existing API, database and feature
documents, each with Vietnamese and Japanese copies. It wrote `ticket: <one epic>` into all eighteen
files, although each document describes work from many earlier tickets. It cited the design's path
and section numbers in every not-yet-implemented item, although the project ignores that directory,
so no reader of the pull request could follow one. And it changed the six English files and left the
twelve translations stale. The same session's `/atk:git --pr draft` created the conforming branch
from `origin/main`, which git recorded as its upstream, so a bare `git push` could have reached
`main`; and `draft` was not a defined argument.

Each cause is a gap in the definition rather than a run going astray. Now a reference document
carries no `ticket` field; a cited path the project ignores is replaced by the ticket it was written
for; an update carries the document's existing translations or names each one left behind; the front
matter is written whatever the neighbours carry; `atk:git` creates the branch with `--no-track`; and
`--draft` opens the pull request as a draft. The `owner` field was raised in the same feedback and
left unchanged, by the maintainer's decision.

Lam Ngoc Khuong approves the change and decides when it ships.

The feedback came as three records written on 2026-10-02 in `docs/derived/feedback/vi/`, which is
not committed: `spec-261002.md`, `git-261002.md` and `design-doc-261002.md`. The IDs below are their
finding numbers, `S` for spec, `G` for git, `D` for design-doc.

## S1: one ticket in the front matter of a document many tickets changed

### 1. Symptom as captured

```text
Lần chạy đã làm gì: thêm `ticket: .../issues/<epic>` vào 18 file (6 tài liệu × 3 ngôn ngữ).
Team mong đợi: không có trường này. [...] là spec cho nhiều ticket đã làm trước đó; một ticket duy
nhất khiến cả tài liệu trông như thuộc <epic>.
Thiệt hại: thêm một commit sửa 18 file sau khi PR đã mở.
```

### 2. Root cause

The templates told the run to write the field: `skills/spec/references/api-spec-template.md:19`,
`db-spec-template.md:19`, `feature-spec-template.md:20`, `screen-spec-template.md:22`, each
`ticket: <the ticket that last changed this, or none>`, and `skills/spec/SKILL.md:228-229`, "record
the ticket in the `ticket:` field". A document updated in place for the life of the project has no
one ticket.

### 3. Evidence

The quoted lines above are the instruction the run followed: every template carried the field and
the skill's `## Ticket` section told the run to fill it.

### 4. Why it surfaced now

Broken since the templates were written. It shows on the first update of an existing document that
other tickets wrote, which a client project with a mature `docs/api/` reached first.

### 4b. Recorded intent

`shared/artifact-paths.md`, Front matter, says every artifact opens with the same block including
`ticket`. The maintainer decided on 2026-10-02 that reference documents drop the field, with a list
form rejected because it is a history the document does not keep and `git log` already holds.
`owner` was raised in the same finding (S2) and kept as it is, by the same decision.

## S3: a committed document cited a design the project ignores

### 1. Symptom as captured

```text
Lần chạy đã làm gì: trích `docs/records/design/261001-...md §5.x` ở ghi chú đầu trang và mọi mục
"Not implemented yet", dù đã biết thư mục đó bị exclude.
Team mong đợi: không có đường dẫn nào trong tài liệu được commit trỏ tới file không được commit.
Thiệt hại: viết lại mọi trích dẫn trong 18 file; bỏ luôn số mục `§5.x` và số câu hỏi `Q1`…
```

### 2. Root cause

`skills/spec/SKILL.md:138-139` says to cite the design's section under `--from`, and
`shared/spec-docs.md:43` says the same, with no condition on whether the design is committed. The
kit already knew the rule for one field: `shared/artifact-paths.md`, Front matter, says "a path to
an uncommitted file breaks for everyone but its author" for `ticket`, and nothing extended it to the
body.

### 3. Evidence

The two quoted lines carry the instruction; `shared/artifact-paths.md`, Persistence, allows a project
to ignore the directory the design sits in, so both hold at once on such a project.

### 4. Why it surfaced now

Broken since `--from` was written. It needs a project that ignores its design records, which the
kit's own repository does not.

### 4b. Recorded intent

Searched `shared/spec-docs.md`, `shared/artifact-paths.md` and `skills/spec/`; nothing says a
committed document may point at an ignored file. The same finding covers D2 and S6, an ADR the
project also keeps out of its repository, so the rule is written for any cited path rather than for
the design alone.

## S4: the English copies changed, the translations did not

### 1. Symptom as captured

```text
Lần chạy đã làm gì: sửa 6 file tiếng Anh, không đụng 12 file trong `docs/vi/`, `docs/ja/`; chỉ báo
ở cuối.
Thiệt hại: một vòng nữa, hai agent dịch 12 file.
```

### 2. Root cause

`shared/artifact-paths.md`, A root partitioned by language, says where a language's copy goes and
says "Do not write a language nobody asked for", but nothing about a copy that already exists when
its source changes. `skills/spec/SKILL.md` does not mention translations.

### 3. Evidence

The section quoted is the whole of the kit's rule on language branches; a reading of it finds no
sentence about updating an existing mirror.

### 4. Why it surfaced now

Broken since the partitioned-tree rule was written. It needs an update in place to a document that
has mirrors, rather than a new document.

### 4b. Recorded intent

None found. The rule against writing an unasked language does not cover a mirror that exists, since
somebody asked for it when it was written.

## S5: two rules pulled two ways on front matter

### 1. Symptom as captured

```text
Định nghĩa nói gì: `SKILL.md:118`: "When the directory already holds documents of this kind, read one
and follow it". `SKILL.md:168`: "Front matter per `shared/artifact-paths.md`".
Lần chạy đã làm gì: các tài liệu hàng xóm không có front matter; lần chạy vẫn thêm vào 6 tài liệu.
```

### 2. Root cause

`shared/spec-docs.md`, The project's own shape wins, lists what the neighbours decide (heading order,
depth, table columns, language) without saying whether the front matter is among them.

### 3. Evidence

The two quoted lines, read together, give two answers for a directory whose documents carry no front
matter.

### 4. Why it surfaced now

Broken since both rules existed; it needs a directory of documents with no front matter.

### 4b. Recorded intent

Rule 2 of `shared/team-roles.md` requires an approval state on any artifact another role accepts, and
the front matter is where it lives. That decides it: the front matter is written whatever the
neighbours carry.

## G1: the conforming branch tracked the default branch

### 1. Symptom as captured

```text
Lần chạy đã làm gì: [...] chạy `git switch -c docs/<ticket>-<slug> origin/main`. Git đặt upstream là
`origin/main`; lần chạy thấy và chạy `git branch --unset-upstream`, rồi push bằng
`git push -u origin HEAD`.
Thiệt hại: không có, vì đã bắt được trước khi push. Nếu không bắt được, một lệnh push trơn sẽ đẩy
lên default branch.
```

### 2. Root cause

`skills/git/SKILL.md:152-155` says "create the conforming branch now and carry the changes across"
and nothing about how. Git's default `branch.autoSetupMerge` records a remote-tracking start point
as the new branch's upstream.

### 3. Evidence

A direct reproduction in a scratch repository with a bare remote:

```text
$ git switch -c feat-x origin/main; git rev-parse --abbrev-ref @{u}
upstream: origin/main
$ git -c push.default=simple push
fatal: The upstream branch of your current branch does not match
the name of your current branch.  To push to the upstream branch
$ git -c push.default=upstream push
   a775ef3..b45d933  feat-x -> main
$ git switch -c feat-y --no-track origin/main; git rev-parse --abbrev-ref @{u}
fatal: no upstream configured for branch 'feat-y'
```

Under the default `simple` the push is refused; under `upstream` it lands on `main`.

### 4. Why it surfaced now

Broken since the branch step was written. It needs a branch created from a remote ref, which is what
a run does when the local default branch is behind.

### 4b. Recorded intent

None found; the step's own purpose, never committing onto the default branch, points the same way.

## G2: `--pr draft` was not a defined argument

### 1. Symptom as captured

```text
Định nghĩa nói gì: `SKILL.md:55`: `/atk:git --pr  # Through to the pull request, then stop`. Không có
dạng PR nháp.
Lần chạy đã làm gì: hiểu `draft` là `gh pr create --draft`.
```

### 2. Root cause

`skills/git/SKILL.md`, `## Invocation` and `argument-hint`, define no draft form, so the run guessed.

### 3. Evidence

The quoted invocation block is the whole list of `--pr` forms.

### 4. Why it surfaced now

Absent since the skill was written; the first team to ask for a draft pull request hit it.

### 4b. Recorded intent

None found.

## 5. The change

- S1: the `ticket:` line is removed from the four templates. `shared/artifact-paths.md`, Front matter,
  says a reference document written by `atk:spec` carries no `ticket`, and why;
  `shared/ticket-adapters.md`, Linking rule, says such a document is linked one way only;
  `skills/spec/SKILL.md` step 4, `## Ticket` and the Definition of done say the same.
- S3: `shared/artifact-paths.md`, Front matter, gains the rule for any path cited in a committed
  artifact: run `git check-ignore -v` before citing it, and where it is ignored cite the ticket it
  was written for, dropping section numbers and question IDs only that file resolves, and ask when no
  stand-in is obvious. `skills/spec/SKILL.md` step 3 under `--from` and the citation cell of
  `shared/spec-docs.md` point at it.
- S4: `shared/artifact-paths.md`, A root partitioned by language, says an update in place carries
  every existing copy of the document, or names each one left behind and asks before the run ends.
  `skills/spec/SKILL.md` step 4 points at it.
- S5: `shared/spec-docs.md`, The project's own shape wins, and `skills/spec/SKILL.md` step 2 say the
  front matter is not part of the shape, is written whatever the neighbours carry, and that the run
  summary says it was added.
- G1: `skills/git/SKILL.md` step 3 says to create a branch started from a remote ref with
  `--no-track`, and that the push in step 4 sets the upstream with `git push -u origin HEAD`.
- G2: `--draft` is added to `argument-hint`, `## Invocation` and step 4 of `skills/git/SKILL.md`, to
  the `README.md` invocation block, and to both `skills-overview.md` files. It works with or without
  `--pr`, leaves an already open pull request's state alone and says so, and on a host with no draft
  state asks before opening one ready for review.

Each change is a sentence or a paragraph beside the rule it completes; nothing was restructured.

Tidy step: the host's clean-up capability was not run. The change is prose only, and the pass from
`shared/tidy-pass.md` was done by hand over the added lines: two over-long lines were rewrapped, and
nothing else changed.

## 6. Verified

- content and docs layers: the whole block under "Common verification commands" in `CLAUDE.md`, plus
  the em-dash and `ak:` checks. Every line printed `OK`, including "plugins read nothing outside
  themselves, 932 citations resolved", which covers the new section references, and the `docs/` and
  `docs/vi/` mirror diff, which printed nothing.
- G1: the reproduction above, re-run with `--no-track`, shows no upstream on the new branch.
- `wc -l`: `skills/spec/SKILL.md` 267 lines, `skills/git/SKILL.md` 256, both under 300.

## 7. Not verified

- No skill was re-run against a project. Whether a run now asks before leaving a translation behind,
  or cites the ticket in place of an ignored design, is read from the wording and not observed.
- `--draft` was not exercised against GitHub; `gh pr create --draft` is the documented flag.
- Trigger behaviour was not measured; no `description:` changed.

## 8. Blast radius

- `shared/artifact-paths.md`, Front matter: read by every skill. The `ticket` exception names
  `atk:spec` documents alone, so records, cases files (whose `ticket` `skills/run-cases/SKILL.md:180`
  reads) and `.atk/` files keep the field. `skills/help/SKILL.md:100-101` reads `ticket` from front
  matter and treats a missing one like any other absent field. Not exercised by a run.
- `shared/artifact-paths.md`, the cited-path rule: applies to every committed artifact's body; the
  likeliest readers are `atk:spec`, `atk:design-doc` and `atk:plan`. Not exercised by a run.
- `shared/artifact-paths.md`, the mirror rule: applies to every Reference-group artifact under a
  partitioned docs root, so `atk:qa` cases files and `atk:convention` documents as well as `atk:spec`.
  Not exercised by a run.
- `shared/ticket-adapters.md`, Linking rule: cited by every skill; the added sentence names one
  exception. Not exercised by a run.
- `skills/git/SKILL.md` step 3: reached by `atk:fix`, `atk:implement` and `atk:verify` through
  `shared/finalize-steps.md`, which hands branching to `atk:git`. Exercised by the scratch
  reproduction only.

## 9. Left for later

- D1: `atk:design-doc` wrote into an ignored directory and said so afterwards, although
  `shared/artifact-paths.md`, Persistence, already says to ask first. Only `fix`, `verify` and `init`
  restate that check in their own `SKILL.md`; adding the line to `design-doc` would make the skip
  less likely. Not a definition gap, so not done here.
