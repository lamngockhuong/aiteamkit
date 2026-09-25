---
name: security
description: >
  Review the security of a change, a release, or a feature the way a team has to answer for it:
  the assets and trust boundaries in scope, the project's own scanners run, threats walked per
  boundary, every finding verified against the code with the path from entry point to impact, a
  checklist from the client or the company answered item by item with evidence, and the residual
  risk left for a named person to accept. Also keeps the threat model of a feature current.
  Use before a release that touches authentication, personal data, payments, or an external
  integration, when a client asks for a security checklist, or when a design needs its threats
  written down before anyone builds it.
  Triggers on: "security review", "security audit", "security checklist", "threat model",
  "STRIDE", "OWASP", "kiểm tra bảo mật", "đánh giá bảo mật", "checklist bảo mật",
  "mô hình mối đe dọa", "セキュリティレビュー", "セキュリティチェックリスト", "脅威モデル",
  "脆弱性診断", "is this secure enough to ship", "/atk:security".
argument-hint: "[branch|range|paths|feature|design-path] [--threat-model] [--checklist <path>] [--lang <code>] [--out <path>]"
---

# Security Review (`atk:security`)

Produces the security record a Tech Lead can sign and a client can read: what was in scope, what was
checked and how, what was found with the evidence behind it, and what is left open with the name of
whoever accepted it. A finding without a path from an entry point to an impact is a worry, not a
finding, and the record keeps the two apart.

## Scope

Handles: resolving the scope into assets, actors, entry points, and trust boundaries; running the
project's own dependency audit and the secret scan over tracked files; walking the threats per
boundary against `references/threat-checklist.md`; verifying each candidate against the code;
answering a supplied security checklist item by item; and writing or updating the threat model of a
feature.

Does NOT handle: fixing a finding, which is `atk:fix` for a defect and `atk:implement` for a missing
control; rotating a credential or rewriting git history, which the owner of the credential and the
repository does; reviewing a pull request for everything else (`atk:review`); writing test cases
for a control (`atk:qa`); responding to a live breach (`atk:incident`); or deciding that a risk is
acceptable, which belongs to a role. It never probes, scans, or attacks a system it does not run
locally: penetration testing a deployed environment is work for whoever the client authorises to do
it.

## Roles

Dev or TL authors. Tech Lead approves the record and the severities, unless the team has a security
officer, who approves instead: ask who plays that role rather than assuming it, per
`shared/team-roles.md`. Accepting a finding that ships unfixed is a compliance call, so it is
recorded with the person who made it, the PM, or the Stakeholder where the contract gives the client
that decision. SRE reviews findings in configuration, infrastructure, and secret handling. QA reads
the record at release sign-off.

## Invocation

```bash
/atk:security                                 # No argument: propose the unreleased range, then ask
/atk:security <branch|range>                  # Review what a branch or a commit range changes
/atk:security <paths>                         # Review given paths in the working tree
/atk:security v1.3.0..HEAD                    # Review the scope of a release
/atk:security --checklist <path>              # Answer a client or company checklist, item by item
/atk:security --threat-model <feature|design> # Write or update the threat model of a feature
/atk:security --lang ja                       # Write the artifact in Japanese
/atk:security --out <path>                    # Override the default output path
```

## Workflow

```
[1. Scope and assets] -> [2. Automated checks] -> [3. Threats by boundary] -> [4. Verify] -> [5. Checklist and sign-off]
```

Before step 1, read `.atk/overrides/security.md` when it exists, per rule 7 of `shared/team-roles.md`.

This skill is in the Required-soft group of `shared/project-profile.md`: without a profile it
continues, and the record says which commands it had to infer.

### 1. Scope and assets

Resolve the argument into the code it covers: the diff of a branch or range, the paths given, or,
under `--threat-model`, the entry points of the feature, found from the design, the reference
documents under `docs/api/`, `docs/features/` and `docs/screens/`, and the code. Where the shape in
`.atk/profile.md` names member repositories, a release scope is read once per member, per the same
rule `atk:release` follows.

With no argument, propose a scope rather than choose one: the unreleased range, from the last tag to
`HEAD`, or the whole repository at `HEAD` when that range is empty or the repository has no tag. Put
the proposal and why in one question, offering the other of the two and a set of paths as the
alternatives, and continue once it is answered. The Scope section of the record says which was
chosen and by whom.

Then name what the scope protects, with `path:line` citations: the assets (credentials, personal
data, money, anything an administrator alone may change), the actors who reach it (anonymous,
signed-in, another tenant, an administrator, a job, a third party calling back), the entry points,
and the trust boundaries between them. Read the threat model under `docs/security/` for the area
when one exists, and the design behind the change. Severity in step 4 is decided against this list,
so a scope with no named asset produces a record nobody can rank.

### 2. Automated checks

Run what the project already runs, and say what it is. `references/threat-checklist.md` holds the
order to look for each command in and the checks to run when the project has none.

- **Dependencies.** The project's audit command, from the Commands section of `.atk/profile.md`, a
  CI workflow, or a script in the manifest. Where there is none, the package manager's own audit
  command, when its lockfile is present, recorded as run by this skill rather than by the project's
  gate. Never install a scanner without asking. An audit command sends the dependency list to its
  registry; say so in the record, and skip it where the project's override forbids that.
- **Secrets.** The patterns and the paths of `skills/git/references/secret-scan.md`, its scan and
  its path list only, run over the tracked files rather than the staged diff, plus whether an
  environment file is tracked at all. Its procedure on a hit belongs to `atk:git`: here a hit is a
  finding, redacted, and nothing is unstaged.
- **Configuration.** Debug flags, permissive cross-origin rules, and default credentials in the
  configuration the scope ships.

A command that failed or could not run is reported as not run, never as clean.

### 3. Threats by boundary

Walk each trust boundary from step 1 through the six STRIDE questions, then map what surfaced to the
OWASP Top 10 categories, per `references/threat-checklist.md`. Trace an input from where it enters
to where it is used; a dangerous function name alone is a place to look, not a finding. Every
boundary gets a result, including "checked, nothing found", because a boundary with no line in the
record reads the same as one nobody walked.

### 4. Verify

Every candidate gets one verdict against the code, with the rules in `references/record-template.md`:
`CONFIRMED` names the entry point, the path to the sink, the missing control, and the impact;
`PLAUSIBLE` names the mechanism and the one check that would settle it; `REFUTED` is recorded as a
non-issue with the line that refutes it, because a client checklist asks for what was ruled out as
well as what was found. Then rank what is left Critical, High, Medium, or Low against the assets of
step 1.

Secret values are redacted everywhere they are printed, per the same file. A credential found is
never used to authenticate, not even to see whether it still works.

### 5. Checklist and sign-off

Answer the checklist: the one given with `--checklist`, keeping its item IDs and its wording so the
answers paste back into the client's sheet, or the baseline in `references/threat-checklist.md`
without one. Each item is `PASS`, `FAIL`, `N/A`, or `NOT VERIFIED`, with the evidence that decided
it; `NOT VERIFIED` names what would verify it and who can. A checklist in a format the harness
cannot read, a spreadsheet most often, is asked for as CSV or pasted text rather than guessed at.

Every finding not fixed before the release goes into the residual risk table with an empty
`Accepted by` cell. Leave it empty: filling it is the decision rule 3 of `shared/team-roles.md`
keeps with a person. Set `status: IN REVIEW` and name the approver.

## Output

The security record at `docs/records/security/<date>-<ticket>-<slug>.md`, or
`docs/records/security/<version>.md` for a release scope, per `shared/artifact-paths.md`. It is a
record of what was checked on one day against one version of the code. It may be corrected until it
is committed, per Before writing in `shared/artifact-paths.md`, and a finding fixed in that window
changes the residual risk table as Residual risk in `references/record-template.md` says. From the
commit on it is not edited: a later review of the same scope writes a new one, and the earlier record
takes `status: SUPERSEDED` with a link forward, per `shared/artifact-paths.md`.

Under `--threat-model`, the threat model at `docs/security/threat-model-<slug>.md`, named after the
feature. It describes the feature's threats as the code stands, so it is updated in place when the
feature changes, and its front matter goes back to `IN REVIEW` when an update changes what it
claims. Its `Covers` list names the paths it models, which is how `atk:help` tells that it has
drifted. `references/record-template.md` holds the shape of both.

The session gets the summary: findings per severity, the Critical and High ones in one line each,
the checklist items that failed or were not verified, and the path to the file.

Putting it where the team can see it is `atk:git`, which follows the artifact section of
`shared/finalize-steps.md`. A record naming an unfixed vulnerability is itself sensitive: before it
is committed to a repository the client or the public can read, say so and let its approver decide
where it lives.

## Ticket

Follow `shared/ticket-adapters.md`. Show the list before filing anything. A finding is never filed
as an issue on a tracker the public can read: name the private channel instead, the code host's
private security advisory or the team's private tracker, and let the approver choose. Each ticket
links the record and the finding ID.

## Definition of done

- [ ] The scope names its assets, actors, entry points, and trust boundaries, each cited to a path.
- [ ] Every automated check says which command ran and whose it was, and one that could not run is
      reported as not run.
- [ ] Every trust boundary has a result, including "checked, nothing found".
- [ ] Every `CONFIRMED` finding traces an entry point to an impact; every `PLAUSIBLE` one names the
      check that would settle it; every `REFUTED` one cites the line that refutes it.
- [ ] No secret value appears in the record, the session, or a ticket.
- [ ] Every checklist item has a status and evidence, and a supplied checklist keeps its own IDs.
- [ ] Every unfixed finding is in the residual risk table with `Accepted by` left for a person.
- [ ] No finding was fixed, no credential used or rotated, and no request sent outside the local
      environment by this skill.
