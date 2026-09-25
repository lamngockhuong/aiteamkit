---
name: tailor
description: >
  Write down how this team wants a skill to behave, as a file in the project rather than an edit to
  the kit: read the shipped skill, ask what the team does differently and why, refuse the parts that
  would let a skill decide what a person owns, and write the override file with the person who
  approved it named in it.
  Use when a team keeps repeating the same correction to a skill's output, when a client or an
  internal standard adds a step the kit does not know about, or when an override written earlier no
  longer matches the skill it belongs to.
  Triggers on: "tailor", "customise a skill", "customize skill", "override a skill", "tùy biến
  skill", "sửa skill theo đội", "thêm bước cho skill", "ghi đè skill", "スキルをカスタマイズ",
  "チーム独自のルール", "our team does this differently", "make the skill always", "/atk:tailor".
argument-hint: "[<skill>] [--audit|--feedback] [--out <path>]"
---

# Skill Tailoring (`atk:tailor`)

Writes `.atk/overrides/<skill>.md`, the file that tells one skill what this team does differently.
The kit stays as shipped, so the next update lands cleanly and the team's own rules survive it.

Most teams reach this skill after correcting the same output three times. That correction is a rule
the team already agreed on and never wrote down, so the interview here is short: the answer usually
exists, it just lives in somebody's head.

## Scope

Handles: reading a shipped skill to see what it already does, interviewing for what the team wants
different, refusing the instructions an override may not carry, writing or updating
`.atk/overrides/<skill>.md`, auditing existing override files against the skills they belong to, and
turning a run that went wrong into an override for this team or into a record for the author of the
skill. A run of a skill this kit does not ship reaches the record and not the override.

Does NOT handle: editing anything inside the kit, which nothing in atk does; writing an override for
a skill this kit does not ship, because nothing would read it; recording the team's coding rules,
which is `atk:convention` and lands in the conventions document rather than here; recording project
facts such as build commands or the docs root, which is `atk:init` and lands in `.atk/profile.md`.

The line against `atk:convention` is the one teams get wrong. "Every pull request needs a test" is a
rule about the code, so it is a `CONV-NNN` row that `atk:review` enforces. "`atk:review` should also
check our i18n helper" is a rule about the skill, so it belongs here. When both readings fit, the
rule about the code wins: it is checkable by a person without the kit installed.

## Roles

The approver is the role that owns what the skill produces, not always the Tech Lead: PM for
`intake`, `estimate`, `breakdown`, `release` and `retro`; BrSE or BA for `design-doc` and `spec`;
QA for `qa`; Tech Lead for the rest and for any override that touches how code is written or
reviewed. Where the team cannot say who owns it, write `APPROVER: TBD` with the name of the person
who must decide, and never guess. See `shared/team-roles.md`.

## Invocation

```bash
/atk:tailor <skill>            # Write or update .atk/overrides/<skill>.md
/atk:tailor --audit            # Check every override file in the project, change nothing
/atk:tailor --audit <skill>    # Check one override file
/atk:tailor --feedback <skill> # Turn a run that went wrong into an override or a record
/atk:tailor --feedback         # Same, with the skill taken from this session
/atk:tailor <skill> --out <path>   # Override the default output path
```

## Workflow

```
[1. Read the skill] -> [2. Ask what differs] -> [3. Check against the seven] -> [4. Write]
  -> [5. Read back]
```

Before step 1, read `.atk/overrides/tailor.md` when it exists, per rule 7 of `shared/team-roles.md`.

### 1. Read the skill

Open `skills/<skill>/SKILL.md` in the installed kit and any `.atk/overrides/<skill>.md` already in
the project. Both, always. An interview that has not read the skill proposes things the skill
already does, and the team has to say "it does that" three times before anything useful starts.

Resolve the skill name with or without the `atk:` prefix, and with no prefix at all. When the name
matches nothing, list the skills that exist and ask. Do not guess at the nearest one.

Under `--feedback` a name that matches no skill of this kit is not yet wrong, because that mode
also takes a skill from outside it. Its definition lives somewhere else: the project's own skill
directory, another installed kit, wherever the harness keeps them. Look there, and ask the user for
the path when looking finds nothing. A definition that cannot be read at all does not stop the
mode; `references/feedback.md` holds what the record loses without it.

The reverse case is the dangerous one. This kit's skill names are ordinary words, so a bare `review`
or `plan` may mean a skill of the same name from somewhere else, and under `--feedback` that name no
longer has one possible owner. Where a skill of that name from outside the kit also ran in the
session, or the user names one, confirm which is meant before opening any definition. Everything
after this point is decided against the file that opens: a record sorted against a definition that
never ran is aimed at a maintainer who cannot act on it.

A name that is missing is not the same as a name that is wrong, and it is not guessed either.
`--audit` already means every override file in the project when no skill is named, and `--feedback`
resolves one from the session per the rules below. Those rules end where every other mode starts:
asking which skill this is about.

Under `--feedback` with no name those rules run before this step, per the `--feedback` section
below. Asked before any skill file has been read, the disambiguating question is asked blind.

Note what the skill already covers in the area the user is asking about. That note is what step 2
opens with.

### 2. Ask what differs

`references/interview.md` holds the question set, grouped by what teams actually change: an extra
step, an extra section in the artifact, a tighter constraint, a person who must be consulted, the
language or tone of the result.

Ask about one group at a time and stop when the user has nothing more. Four questions is usual and
eight is the ceiling, the same budget `atk:init` works to.

Every answer gets one follow-up: does this hold for every project this team runs, or only this one.
A rule that holds everywhere is still written here, because the kit is shared and the project is
not, but the answer belongs in the file so the next team copying it knows what they are taking.

An answer that is really a project fact goes to `atk:init` instead, and an answer that is really a
coding rule goes to `atk:convention`. Say which and why; do not write it here and also there.

### 3. Check against the seven

`shared/project-overrides.md` lists the seven things an override may never remove. Walk each
proposed instruction against that list before writing anything.

A conflict is not a reason to end the session. Say which of the seven it breaks and what the
instruction was trying to achieve, then offer the nearest thing that does not break it: an
instruction that makes the skill surface a decision earlier is almost always available where an
instruction that makes the skill take the decision is not.

Record the refusal even when the user accepts it. Step 5 reports it, and the person reading the file
in six months needs to know the question was asked.

### 4. Write

Write `.atk/overrides/<skill>.md` per the format in `shared/project-overrides.md`: the shared front
matter block, then `## Before`, `## After`, or both. Nothing else is read by a skill, so anything
the team wants to remember about why goes inside those sections as prose.

Updating an existing file means updating it in place. It is a reference document per
`shared/artifact-paths.md`, so a line that no longer holds is wrong rather than old. Keep what still
applies, replace what changed, and move `status` back to `IN REVIEW` when the change alters what the
skill will do.

Write the instructions in the team's working language. The two heading names stay in English because
the skill matches on them.

The file is committed. Say so: a team that leaves it untracked gets a different skill on every
machine, and no way to tell why two people got two different answers.

### 5. Read back

Show the file, then three things: what it will change about the next run of that skill, what was
refused in step 3 and why, and who must approve it before `status` leaves `IN REVIEW`. Say too that
until then the skill runs as shipped, per Only an approved override applies in
`shared/project-overrides.md`, and for an update, that the earlier approved version stops applying
as well, since the file has one status.

### `--audit`

`references/audit.md` holds the two checks and why they report differently. In short: an instruction
that breaks one of the seven is stated as a fact, because the list is fixed; an instruction that
names a step or a section the skill no longer has is raised as a question, because the step may have
been renamed rather than removed.

Change nothing, including the files found to be wrong. The output is a list the approver acts on.
With no override files in the project, say so and stop rather than offering to create one.

### `--feedback`

Takes a run that went wrong and reaches the right one of three outcomes: an override for this team,
a record for whoever wrote the skill, or neither. `references/feedback.md` holds the question that
separates them, the shape the record is written in, and the two things it must never carry.

The record has a fixed shape, in `references/feedback.md`: the run in a table, the findings counted
and split across the three rows of the fork, one row per finding carrying a severity and either a
`path:line` in the definition or the word silent, a section per finding under it, and which steps of
the skill ran out of how many it has. Written as prose instead, it leaves its reader counting
paragraphs to work out how much is wrong and reading all of them to find what is worst.

Ask that question once per finding rather than once per run. One bad run usually produces findings
of more than one kind, and sorting them is the work. A finding that lands on the override side
rejoins step 2 above and is written like any other. A finding that belongs to the author goes into
`docs/derived/feedback/<skill>-<date>.md` and stops there.

The skill need not be one of this kit's, and a skill kept in the project or in another kit gets a
record and no override. The first of the three outcomes is closed to it: `.atk/overrides/<skill>.md`
is opened by the `atk` skill named after it and by nothing else, so a file written there for any
other skill is read by nobody while looking like a rule the team agreed on. Say that instead of
writing it, and carry the finding into the record under a section of its own, apart from the
findings the author is being asked to act on. Where the team itself owns that definition, which is
the ordinary case for a skill kept in the project, the record may also propose the change owed, in a
section of its own. `references/feedback.md` holds when that applies, along with the two other
things that change: what the record loses where the definition cannot be read at all, and who it
names in place of this kit's issue form.

With no skill named, three rules settle which one this is about. They run before step 1, which
cannot open a skill file without a name, and the run returns to that step once the name exists:

1. Take it from the session: the skill of this kit that ran in it.
2. Where more than one of them ran, ask which this feedback is for, or whether it is for all
   of them. A skill from outside the kit joins that count only where the user names it: a harness
   runs skills of its own alongside a run, `atk:implement` reaches for the host's clean-up
   capability by design, and counting those would put the question in front of the user in every
   ordinary session. Do not pick one. A run that went wrong rarely went wrong in one skill, and
   the one nobody named is the one nobody looks at. All of them means one record each, because the
   file is named after a single skill and a record covering two gets read as covering neither. With
   more than one record, `--out` names the directory they go in; a single file path is refused
   rather than made to hold them all.
3. Where the session leaves nothing, ask. A session that ran no skill of this kit is the
   ordinary way a record gets filed, a day after the run it is about, so treat it as such: list the
   skills this kit has, and say that a skill from outside it can be named instead. Where the user
   has handed over a record that names its skill in the first line, confirm that name instead of
   asking blind. What no rule here permits is picking one from the surrounding conversation and
   carrying on.

A finding whose cause is that the run ignored something the skill states plainly changes nothing in
either place. Say so, and say which line of the skill already covers it, so the team can tell a
definition that is wrong apart from a run that was.

The record leaves the repository only when the user asks, per the consent line in
`shared/finalize-steps.md`. Offer it, name the issue form it fits, and wait. Never open the issue as
a side effect of writing the record. The form belongs to this kit's repository, so it is named for
this kit's skills alone; for any other skill, name who owns it and leave the sending to the user,
who knows where their own skills are reported and this skill does not.

## Output

Written to `.atk/overrides/<skill>.md` in the target project, not under `docs/`, and never into the
kit. See `shared/project-overrides.md` for the format and the seven exclusions, and
`shared/artifact-paths.md` for why this skill is one of the three exceptions to the docs-root rule.

A `--feedback` record goes to `docs/derived/feedback/<skill>-<date>.md` instead. It is derived under
`shared/artifact-paths.md`, because once it is filed the issue holds the original, the same reason
an implementation record is derived from the pull request that carries it. Until somebody files it
the record is the only copy, which is a reason to keep the directory rather than a reason to place
it elsewhere.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`: the branch, the commit, and the judgement about whether this one belongs
in a pull request for its approver to read. Whether it is committed at all is the persistence group
it falls into, per `shared/artifact-paths.md`.

## Ticket

Follow `shared/ticket-adapters.md`. An override that a role other than the author must approve can
become one issue carrying the proposed file and the name of the approver, when the user asks. The
file itself lives in the repository; the tracker holds a pointer to it.

A `--feedback` record about a skill of this kit goes to the kit repository rather than the
project's tracker, and only when the user asks. A record about any other skill goes wherever that
skill's owner takes reports, which is the user's to know, so the record names the owner and stops
there. One record is one issue: a form listing four unrelated findings gets triaged as one.

## Definition of done

- [ ] The shipped `SKILL.md` was read before any question was asked.
- [ ] Any existing override file was read and updated in place rather than replaced.
- [ ] No more than eight questions were asked in the step 2 interview. The one-per-finding sort
      under `--feedback` is a different count and is not measured against it.
- [ ] Every proposed instruction was checked against the seven exclusions before writing.
- [ ] A refused instruction was reported with which of the seven it breaks and what was offered instead.
- [ ] An answer that belongs to `atk:init` or `atk:convention` was sent there instead of written here.
- [ ] Front matter names an owner and an approver, and the approver is the role that owns what the
      skill produces.
- [ ] The two heading names are in English and the instructions are in the team's language.
- [ ] The user was told the file is committed.
- [ ] Under `--audit`, no file was modified.
- [ ] Under `--feedback`, every finding was sorted one at a time into an override, a record, or neither.
- [ ] Under `--feedback` with no skill named, the skill came from the session or from the user, and
      where the session held more than one skill of this kit or none, the user chose rather than
      the skill guessing.
- [ ] Under `--feedback` on a skill from outside this kit, no override file was written, the finding
      that would have been one went into a section of the record of its own, and the record named
      that skill's owner rather than this kit's issue form.
- [ ] A bare name that could mean a skill of this kit or one from outside it was confirmed with the
      user before any definition was opened.
- [ ] A feedback record follows the shape in `references/feedback.md`: every finding carries a
      severity and either a `path:line` in the definition or the word silent, and the record states
      how many findings there are, how they split across the three rows of the fork, and how many
      steps of the skill ran out of how many it has.
- [ ] A feedback record names the person reporting, and proposes no wording for a definition its
      reader does not own.
- [ ] Nothing left the project without being asked.
