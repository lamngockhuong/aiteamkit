# Host capabilities

What a skill may use from the agent it runs inside, and what it does when that agent does not have
it. Referenced from `skills/<name>/SKILL.md` as `shared/host-capabilities.md`, which is
`../../shared/host-capabilities.md` relative to a skill file.

Cited by `implement`, `fix`, and `verify` for the tidy step, by `review` and `design-doc` for
parallel reviewers, by `init`, and through it `tailor`, for what counts as one turn of an interview,
and by `design-sources.md` for naming a connection to a design tool. What the tidy step looks for is
in `shared/tidy-pass.md`, which is the same list whichever way the step runs.

## What may be named

A host capability is something the harness itself ships: a built-in command, a built-in skill, or
the ability to run several agents at once. It is available to every team that installed atk on that
harness, because it arrived with the harness rather than with a kit.

| Named in a skill | Allowed |
|------------------|---------|
| A capability the host ships, written as a capability first and a local name second | yes |
| An `atk:` skill | yes |
| A connection to an outside service, such as a design tool's MCP server or connector, named after the service, with the fallback for a harness that has none | yes |
| A command belonging to another kit or marketplace plugin | no |

The connection row is how `shared/design-sources.md` can say "the Figma connection": the service is
what the team already works in, and the skill reads it as a source. The row names the service, never
a skill or command that the plugin carrying the connection also ships, and every use of it says what
happens without it.

The last row is the rule `CLAUDE.md` states as "the kit stands alone", and it has not moved. A team
that installed only atk still has its harness; it does not have somebody else's kit. A pointer at a
host capability degrades into doing the work by hand, and a pointer at a foreign kit degrades into a
dead end the team only finds by following it.

## Name the capability, then the command

In that order: "the host's code clean-up capability, `/simplify` in Claude Code". The kit ships to
three harnesses and only the Claude Code name could be verified here, so a bare command name reads
as a requirement on the two harnesses where it may not exist.

Resolve the local name from the harness's own list of commands and skills at the time of use. Never
carry a name from another session, another machine, or another kit into a harness that did not list
it.

## When the capability is missing

Do the work inside the step that wanted it, and say in the record that the host offered no such
capability. Both halves matter: a step skipped without a trace reads exactly like a step that ran
and found nothing.

No skill stops for a missing host capability. Every capability below improves work the skill already
owns; none of them is a precondition for it. That is the opposite of `.atk/profile.md`, whose
absence does stop three skills, and the difference is that the profile carries facts nobody else can
supply.

## Several questions in one prompt

Claude Code ships this as a single prompt carrying up to four questions, which the user answers in
one action.

A skill that budgets what its interview costs counts **round trips, not facts**. One prompt answered
once is one turn, however many questions it carried. `atk:init` sets that budget in
`skills/init/references/detection.md`, and `atk:tailor` works to the same one.

Where the harness asks one question at a time, the questions that would have shared a prompt still
count as the one turn they stand for, and they are still sent together in one message. Otherwise the
same interview scores differently on three harnesses, and a team is charged for a capability its
harness does not have.

## Tidy the change, after it is verified and before it is reviewed

Claude Code ships this as `/simplify`. It reads what the session just changed and applies clean-ups:
duplication removed, a name corrected, a helper reused instead of written a second time.

Where the harness ships no such capability, the skill runs the pass itself, working through
`shared/tidy-pass.md`: the three lenses, what may be changed, and what is never touched. That file is
why the degradation is a real step rather than a good intention. It applies to the host capability
too, as the standard the result is read against.

Where the harness does ship one, the handoff is not a judgement call. A run does not read the diff
itself instead because the capability looks heavier than the change deserves: how this capability
goes about its work inside itself is the harness's business rather than this kit's, and a step that
may be reasoned away is a step that will be, on every diff, since no diff argues for its own size.

Cited by `implement`, `fix`, and `verify`, under four rules that hold in all three:

1. **Only after the verification for that change has passed.** Tidying code that does not work yet
   rewrites lines that are about to be rewritten anyway, and buries the failure under the diff.
2. **Only the code this change touched.** The clean-up inherits the scope of the change it follows.
   A file the change never opened is somebody else's work, and a tidy-up that reaches it turns a
   reviewable diff into an unreviewable one.
3. **Re-verify afterwards, narrowest first.** A clean-up is a code change like any other, and it
   arrives after the verification that covered the original change. Read the resulting diff for the
   accident `shared/tidy-pass.md` describes, then re-run what covers what it touched, per
   `shared/layer-verification.md`.
4. **Revert rather than debug.** A clean-up that breaks a check is not worth the round it would take
   to fix: restore the files it changed, record that it was reverted and why, and carry on. The
   change was already correct before it ran.

Two skills narrow it further, for reasons their own files explain:

- `atk:fix` is bound by its minimal-change rule, so the clean-up covers only the lines the fix
  touched, and the captured reproduction is re-run after it.
- `atk:verify` applies it only to code its retry rounds changed, and re-runs the case that was
  failing after it.

The record carries one line either way: what the capability changed, or that it ran and changed
nothing, or that the harness ships none and the pass was run by hand. There is no fourth thing to
write, which is the point: a run that read the diff itself instead has nothing true to put here.

## Independent reviewers, in parallel

`atk:review` may put several agents over the same diff and reconcile what they return. The
procedure, including which rounds run, how many copies each runs, and how findings are merged, is in
`skills/review/references/review-rounds.md`. `atk:design-doc --challenge` puts one agent per signing
role over the same draft design, per `skills/design-doc/references/role-challenge.md`; the policy
below holds for it too, with the design in place of the diff and each role as a round of one.

What stays here is the policy the procedure may not overrule:

- The number of agents running at once is bounded by the machine, never by ambition, and every agent
  in flight counts against it: the copies inside a round, and the round dispatched ahead of the one
  being synthesized. It bounds concurrency, not the review's total number of passes, which follows
  from the round list. Where the bound will not hold both, the round ahead is what yields rather than
  the copies, because copies are what a round finds with. An agent killed halfway through reports
  fewer findings rather than failing loudly, which reads as a clean review.
- The total is not bounded, it is stated. A run knows how many passes and how many agents its round
  list asks for before it spawns the first one, so it says that number, and the measured cap, before
  spawning rather than after. A person who can see the cost can stop it or pay it; a person who
  cannot see it finds out from the rate limit. The skill that calls the review says the same number
  before it calls, since a run's cost is what its caller spends.
- Every agent within a round receives the same scope. Agents split by file agree trivially and prove
  nothing; the point of running copies is independent passes over one diff. Scope differs between
  rounds on purpose, because each round is a different question over that same whole diff.
- Synthesis, severity, and the report stay with the calling agent. A reviewer sees one pass and
  cannot judge whether a finding is consensus or noise.
- A finding only one reviewer raised is checked against the code before it reaches the report.
- None of it is an approval. Several reviewers agreeing is several passes by the same model, not a
  colleague reading the change. `shared/team-roles.md` rule 2 is unaffected by how many passes ran.
