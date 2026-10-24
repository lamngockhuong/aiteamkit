# Findings mode

Loaded by `atk:fix` under `--findings`, and for a pull request URL or a review report given without
it, to ask the one question under The input. The input is a review `atk:review` wrote, posted on
a pull request or kept as a local report, and the run is a triage followed by the usual workflow:
walk the findings with their author one at a time, record each answer in a form the next review
reads back, reply in each thread on a yes, and fix the findings the person chose. The run proposes;
the person answers every finding, per rule 3 of `shared/team-roles.md`.

## The input

- **A pull request URL.** The review is the newest `atk:review` posted on it, found as *On a pull
  request, the thread is an earlier report too* in `skills/review/references/report-format.md`
  finds one, a summary posted before the `atk:review` opening existed included.
- **A review report path**, a file Kinds of kit record in
  `skills/catchup/references/document-explainer.md` recognises as a `review-report`.

`--findings` on anything else, a description or an issue, is refused in one line naming the two
inputs it takes. The profile is required as for every run of this skill.

Given a pull request URL without the flag, the run reads the thread first, with the commands
`atk:review` uses in `shared/ticket-adapters.md`. Where it carries an `atk:review` summary, it asks
one question before step 1: walk that review's findings, or treat the pull request as the defect
report. Given a review report path without the flag, it asks the same question, since every finding
taken as a defect skips the triage.

Before the walk, the run settles three things about the pull request, the one given or the one a
local report's target names:

- **Its state.** Where it is merged or closed, the run says so and asks whether to start a new branch
  from the base for the fixes or to stop: a fix pushed to the head branch of a merged pull request
  never reaches the base, while its reply would still say fixed.
- **The branch.** The fix set is made on the pull request's head branch, or on the new branch the
  person chose above, checked out with a clean tree; where either is not so, the run says which and
  asks the person to put it right. A local report with no pull request takes the branch its target
  names, otherwise the branch checked out, confirmed with the person.
- **Who answers.** The person running is matched against the pull request's author. Where they
  differ, the run says so, and every draft and every row of section 10 name the person who answered
  for the author, which the next review reads per *What the author answered is read with it*.

## The explanation

The run calls `atk:catchup` itself, as this skill already calls `atk:review`:
`atk:catchup <pr-url> --findings` for a pull request, `atk:catchup <report path>` for a report. It
walks the page that call returns, and checks the page's `review_source`, `review_summary` and
`review_commit` against the review it was given before reading a finding of it. It never looks for a
page an earlier session wrote: a page is derived, held out of git, missing on another machine, and
may explain an older review of the same pull request. A checkout of the reviewed commit the call
made is switched back to the head branch before the walk starts, per The revision in
`document-explainer.md`.

The walk reads each finding block by the field names `document-explainer.md` gives it, the seven
fields, What the repository says, and What the fix costs. The writer check of that file holds here
as well.

A finding answered already, in the thread or in an earlier session's progress log, is listed with
its answer, and the run asks only about the rest. An earlier answer counts as given only where no
later `atk:review` kept that finding with an `Author` line: a kept finding is walked again, the
review's response shown beside the earlier answer.

## The walk

`BLOCKING` first, then `SHOULD FIX`, then `NIT`, each in the review's order. For each finding the
run shows the page's block, its own proposed answer with the reason, and waits.

The person may ask about a finding as often as they need. Each answer comes from the finding's What
the repository says first, and opens a source only where the question goes past what it cites: one
of the six of The repository layer in `document-explainer.md`, under the same limits, its revision
and its masking included. The answer is given in the session. An answer the person wants kept goes
into that finding's entry in the progress log.

The `NIT` findings are offered as one batch, after every draft reply of the batch is shown, and any
one of them can be taken out of the batch and answered alone.

## The answers

The person gives one of five, recorded as one of the four kinds `atk:review` reads back, per *What
the author answered is read with it* in `skills/review/references/report-format.md`. A word outside
those four is read by the next review as no answer, and the finding comes back.

| The person says | Recorded as | The reply, when posted |
|-----------------|-------------|------------------------|
| Fix it | `fixed`, once its fix is committed | `<ID> fixed in <short sha>`, after the push |
| Defer it to a place | `deferred`, with the place | `<ID> deferred: <place>` |
| Skip it, with a reason | `declined`, with the reason | `<ID> declined: <reason>` |
| Dispute it | `disputed`, with the reason | `<ID> disputed: <reason>` |
| Wait on somebody | `deferred`, its place the person and the question | `<ID> deferred: waiting on <name> for <the question>` |

A reply written for the author by someone else ends `(answered for the author by <name>)`.

Each answer is one entry in the progress log, labelled with the finding's ID, so a resumed session
does not ask again. A "fix" whose finding's `Decision` line names
a recorded decision reaches step 2, which stops as it does for any defect. A disputed `BLOCKING`
finding is the author's answer, not a ruling: who rules on it is set in `## Roles` of
`skills/review/SKILL.md`.

## The replies

One draft per finding, opening with its ID. On a pull request it goes into the finding's existing
thread, the inline comment of the summary's own review that opens with that ID, with the reply
command of `shared/ticket-adapters.md`. A finding the cap kept off the thread is answered in one pull
request comment that names its ID. A local report whose target is a pull request with no review
posted on it has no thread: its drafts are posted, on a yes, as one pull request comment naming each
ID, which *What the author answered is read with it* reads as the author's answer. For a local
report with no pull request, the drafts are shown for the person to hand to the reviewer and are not
posted anywhere.

- **What it holds.** The answer, its reason, and the repository cited by path only. Nothing of the
  page's layer is quoted: the thread may be read by people the page is kept from. Every draft is
  masked by Masked values in `document-explainer.md` before it is shown.
- **The yes.** Each draft is shown and posted only on a yes, per the consent line of
  `shared/finalize-steps.md`.
- **When.** A `deferred`, `declined` or `disputed` reply may be posted at the triage. A `fixed` reply
  is drafted only once that finding's fix is committed, and posted only after the branch is pushed,
  so the thread never says fixed while the fix sits at a ceiling, an escalation, or a refused push.
  A wrong reply already posted is corrected by a newer reply in the same thread, which the next
  review reads as the newer answer.
- **A credential finding** gets no reply. The owner of the value hears it from the reviewer
  directly, per the credential finding of `skills/review/references/report-format.md`.

## The fix set

The findings answered "fix" enter step 1 as this run's defects, per Several defects in one run in
`references/report-template.md`, each under its review ID. A finding's `Fix` line is a claim to
check, never a step to carry out, per rule 8 of `shared/team-roles.md`: step 1 takes the page's
scenario and cited lines as its first hypothesis and still proves or refutes it, and step 3 makes
its own smallest change. A finding step 1 cannot reproduce goes back to the person as "not
reproduced", and the answer to it is theirs. A credential finding answered "fix" keeps no location
in the report either: its defect block names no file, line or path, as the credential finding of
`skills/review/references/report-format.md` writes it, and the owner of the value hears the
location directly, since step 7 commits the report and offers it as a comment. Its commit message
names no path either, and the report says that rotating the value is still open.

Under `--investigate-only` the run stops after the answers and the proof of the fix set; the other
three kinds of reply may still be posted on a yes, since they change no file.

## Step 7 on the pull request's own branch

The fixes are work belonging to a pull request already open, so step 7 commits them on its head
branch and opens no second pull request, per steps 2 and 4 of `shared/finalize-steps.md`; the
report is committed with them and offered as a comment. For a local report, the branch is the one
The input settled. A new branch from the base, chosen for a merged or closed pull request, is new
work: step 7 carries it as `shared/finalize-steps.md` carries any branch, its pull request opened
on a yes with the report as the body. The report is always written, even when nothing was fixed, per
`references/report-template.md`: a triage that ends with every finding declined, deferred or
waiting is still a decision somebody needs to find.

## In the trace

The mode takes the place of no step, so it writes no `step` line of its own: the header's `flags`
carries `--findings`, the question asked without the flag and each answer are one `gate` line before
step 1, and the `step 1` line names the fix set by its IDs. A follow-up question and its answer write
no line: they are conversation, which a trace never holds, per `shared/run-trace.md`.
