# Audit

What `/atk:tailor --audit` checks, and why the two checks report differently.

The audit reads. It changes nothing, including the files it finds to be wrong, and including the
obvious one-word fixes. The output goes to the person named as approver in each file, and a fix
applied by the audit is a change that person never agreed to.

## Scope of a run

With no skill named, every `.atk/overrides/*.md` in the project. With a skill named, that one file.

A file whose name matches no installed skill is reported and not parsed: the team may have written
it for a skill they have not installed yet, or misspelled the name, and the audit cannot tell which.
Say both readings and let the reader pick.

## Check 1: does it break one of the seven

Read each `## Before` and `## After` against the table in `shared/project-overrides.md`.

Report a match as a fact. The seven are fixed, they are written down, and an instruction either asks
for one of them or does not. Quote the instruction, name which of the seven it breaks, and name the
approver from the file's front matter.

```
BREAKS   .atk/overrides/release.md
         "chốt ngày phát hành khi checklist đã xong"
         Breaks 2: a skill does not decide what a role owns. Release date is the PM's call.
         Approver: Nguyen Thi A
```

This check has a false negative worth knowing about. An instruction can break one of the seven
through what it implies rather than what it says: "kết thúc luôn cho nhanh" does not name the consent
line, but a skill following it skips asking. The audit reports what it can read; the run itself
catches the rest, and that is why a skipped instruction is reported in the artifact at the time.

## Check 2: does it still match the skill

Read each file against the current `skills/<skill>/SKILL.md`. Look for an instruction that names a
step, a section, a flag, or an output the skill no longer has.

Report a match as a question, never as a fact. A step that disappeared from the skill may have been
renamed, split in two, or folded into its neighbour, and an override written against the old name
may still say exactly the right thing. The audit cannot tell the difference, and a team that gets
told "this is dead" about a rule that still works stops reading audits.

```
CHECK    .atk/overrides/verify.md
         Names step "3. Exercise and assert", which the current skill still has.
         Names "the smoke list", which appears nowhere in skills/verify/SKILL.md.
         Renamed, or no longer needed? Approver: Tran Van B
```

Name what the skill has now, so the reader can answer without opening it.

## Check 3: the cheap ones

Three things worth reporting as facts because they are unambiguous:

- A heading other than `## Before` and `## After` carrying instructions. It is ignored at run time,
  so the team wrote a rule that has never once applied.
- Front matter with no approver, or an approver still `TBD` with no name attached.
- Any `status` other than `APPROVED`, or no front matter at all. The override is not applied and
  the skill runs as shipped, per Only an approved override applies in `shared/project-overrides.md`,
  which surprises a team that committed it and expects an effect. Report the file, its status, and
  the approver who has to move it.

## Output

One block per file, checks in the order above, and a closing line per file: clean, or the number of
items and who owns them.

End with the files that were not checked and why: a name matching no installed skill, a file that is
not Markdown, a file with no front matter. A silent skip is how an audit comes back clean on a
project that has a broken file in it.
