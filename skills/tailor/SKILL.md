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
argument-hint: "<skill> [--audit] [--out <path>]"
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
`.atk/overrides/<skill>.md`, and auditing existing override files against the skills they belong to.

Does NOT handle: editing anything inside the kit, which nothing in atk does; recording the team's
coding rules, which is `atk:convention` and lands in the conventions document rather than here;
recording project facts such as build commands or the docs root, which is `atk:init` and lands in
`.atk/profile.md`.

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
refused in step 3 and why, and who must approve it before `status` leaves `IN REVIEW`.

### `--audit`

`references/audit.md` holds the two checks and why they report differently. In short: an instruction
that breaks one of the seven is stated as a fact, because the list is fixed; an instruction that
names a step or a section the skill no longer has is raised as a question, because the step may have
been renamed rather than removed.

Change nothing, including the files found to be wrong. The output is a list the approver acts on.
With no override files in the project, say so and stop rather than offering to create one.

## Output

Written to `.atk/overrides/<skill>.md` in the target project, not under `docs/`, and never into the
kit. See `shared/project-overrides.md` for the format and the seven exclusions, and
`shared/artifact-paths.md` for why this skill is one of the three exceptions to the docs-root rule.

## Ticket

Follow `shared/ticket-adapters.md`. An override that a role other than the author must approve can
become one issue carrying the proposed file and the name of the approver, when the user asks. The
file itself lives in the repository; the tracker holds a pointer to it.

## Definition of done

- [ ] The shipped `SKILL.md` was read before any question was asked.
- [ ] Any existing override file was read and updated in place rather than replaced.
- [ ] No more than eight questions were asked.
- [ ] Every proposed instruction was checked against the seven exclusions before writing.
- [ ] A refused instruction was reported with which of the seven it breaks and what was offered instead.
- [ ] An answer that belongs to `atk:init` or `atk:convention` was sent there instead of written here.
- [ ] Front matter names an owner and an approver, and the approver is the role that owns what the
      skill produces.
- [ ] The two heading names are in English and the instructions are in the team's language.
- [ ] The user was told the file is committed.
- [ ] Under `--audit`, no file was modified.
