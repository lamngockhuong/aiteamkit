# Static checks

Loaded by `atkx:skill-eval` for the static mode. `scripts/static-check.mjs` runs every check below
and prints JSON; this file says what each check looks for, why it exists, and how to do it by hand
on a host without Node. A run done by hand says so in its report, because a count done by reading
is not the count the script gives, and the sample skills the repository keeps in
`tests/skill-eval-fixtures/` are only proven against the script.

Run it as `node scripts/static-check.mjs <skill-dir>`, from the skill's own directory or with the
script's full path. It opens files for reading only and starts no process. A script inside the
evaluated skill is read as text and never run, whatever its name or mode.

## The output

```json
{
  "skill": { "path": "...", "name": "review", "plugin": "atk", "fullName": "atk:review", "pluginRoot": "...", "repoRoot": "..." },
  "checks": [ { "id": "description-length", "status": "pass", "value": 541, "limit": 1024, "file": "SKILL.md", "line": 3 } ],
  "summary": { "passed": 12, "failed": 0, "info": 1, "credentials": 0, "gate": 0 }
}
```

- `status` is `pass`, `fail` or `info`. Only `pass` and `fail` count toward the static score, which
  is 100 x passed / (passed + failed). An `info` line is reported and never scored.
- `fullName` is the plugin's `name`, a colon, and the skill's `name`: `atk:review`, when the skill
  sits at `<plugin>/skills/<name>` with a `.claude-plugin/plugin.json` in `<plugin>`. Anywhere else it
  is the bare `name`. The trigger mode compares against it.
- `repoRoot` is the nearest directory above the skill holding `.git`, or `null`.
- A directory with no `SKILL.md` prints one line naming the path looked in and exits with code 2.
  No score follows, because there is nothing to score. A path to the `SKILL.md` file itself is taken
  as its directory.
- A clean category is one `pass` line under its own id: `cited-paths`, `symlinks`, `outside-paths`,
  `credentials`, `gate`. A failing one is a `fail` line per instance, under the ids below.

## Structure and metadata

| id | Passes when | Why |
|----|-------------|-----|
| `frontmatter` | `SKILL.md` opens with `---`, closes the block with `---`, and every line between is a top-level `key:` or belongs to one | A harness that cannot read the block does not load the skill at all |
| `name-present` | `name` is a non-empty string | Every harness identifies the skill by it |
| `name-format` | `name` is lowercase letters, digits and single hyphens | The Agent Skills form, and what Cursor states outright |
| `name-matches-dir` | `name` equals the directory name | A harness that names the skill after its folder and one that reads `name` would disagree |
| `description-present` | `description` is a non-empty string | It is what the harness matches a request against |
| `description-length` | at most 1024 characters, counted on the YAML-parsed value without its final newline | The limit harnesses apply; past it the text is cut, and the cut part usually holds the trigger phrases |
| `line-count` | `SKILL.md` has at most 300 lines | A long body costs context on every invocation; detail belongs in `references/` |
| `cited-path` | every `references/`, `scripts/` or `assets/` path `SKILL.md` names exists inside the skill | A cited file that is not there is a step the agent cannot follow |
| `outside-path` | no Markdown file in the skill cites a `../` path leaving the skill, or an absolute path | An install copies the skill or its plugin directory and nothing above it |
| `symlink-outside` | no symbolic link in the skill points outside it | See below |
| `plugin-manifest` | the `.claude-plugin/plugin.json` of the plugin holding the skill parses | A plugin that does not parse loads nothing, and the full name of its skills cannot be known |
| `encoding` | `SKILL.md` is UTF-8, a byte-order mark allowed | A UTF-16 file, the default of older Windows shells, is decoded and checked, and reported here rather than as binary |
| `unreadable` | every file and directory in the skill could be read | A file that cannot be read cannot be checked, and is named rather than skipped |

A skill belongs to a plugin only when it sits at `<plugin>/skills/<name>` with a
`.claude-plugin/plugin.json` in `<plugin>`, the place a harness loads it from; a skill under
`.claude/skills/` in a repository that is itself a plugin is a project skill, with a bare name. For a
plugin skill, a path written as `skills/<other>/references/<file>` is resolved from the plugin root,
and a path holding `..` that stays inside the plugin passes, because a plugin install copies the
whole plugin. An absolute path is one starting with a tilde and a slash, a drive letter, or one of the usual root
directories (`/home`, `/Users`, `/etc`, `/usr`, `/var`, `/opt`, `/tmp`, `/Volumes` and the like). A
span holding `...`, `<`, `*` or `{` is a placeholder or a glob and is not treated as a citation. URLs
are not citations either.

The frontmatter reader covers what skill frontmatter uses: top-level keys, plain, quoted, folded and
literal values, and flow lists. A `#` starts a comment only after an unquoted value. It is not a full
YAML parser, and a construct beyond that, a nested map read for its values for one, is reported as
present rather than read.

By hand: read the frontmatter block, count the description's characters after folding a `>` block
into one line, `wc -l SKILL.md`, and look up every cited path with `ls`.

## Frontmatter keys only some harnesses read

Each frontmatter key other than `name` and `description` is looked up in `frontmatter-keys.tsv`
beside this file. A key read by only some of Claude Code, Codex and Cursor is listed as `info`, with
the harnesses that read it: `argument-hint: read by Claude Code only`. A key in no row is listed as
read by none of them. Neither is a failure: a key one harness reads and the others ignore is often
deliberate, and the author is the one to judge it.

The table has one line per key and harness:

| Field | Meaning |
|-------|---------|
| `key` | The frontmatter key, exactly as written |
| `harness` | `Claude Code`, `Codex` or `Cursor` |
| `meaning` | What that harness does with it, in one line |
| `source` | The harness's own documentation page the line was taken from |
| `checked` | The date the line was read off that page, `YYYY-MM-DD` |

Add a line when a harness documents a new key, with today's date in `checked`. Change a line only
from the source page, and change its date when you do. A line whose `checked` date is old is not
wrong, but it is the first place to look when a harness has moved on. Codex keeps its optional
interface and policy settings in `agents/openai.yaml` rather than in the frontmatter, so it reads
only `name` and `description` there.

## Symbolic links

A link whose target is outside the skill directory, or that points nowhere, is a `fail` named by the
link's own path. The target is never opened, so a link to a key file or a dotenv file outside the
skill never puts its content into the report or into the agent's context. That holds for `SKILL.md`
itself: one that links out ends the check with that single finding, since nothing else can be read
without reading it, and a nested `SKILL.md` that links out declares no host. A link to a file inside
the skill is read like the file it points at, and a link to a directory inside the skill is walked by
the link's own path, since that is the path a harness runs.

By hand: `find <skill-dir> -type l`, and for each, compare the target with the skill directory
without opening it.

## Credentials

Every text file in the skill is read for a string shaped like a credential:

| kind | Shape |
|------|-------|
| `private-key` | a PEM block opening `BEGIN ... PRIVATE KEY` |
| `api-token` | `sk-` followed by 20 or more token characters |
| `github-token` | a `ghp_`, `gho_`, `ghu_`, `ghs_` or `ghr_` token, or `github_pat_` |
| `aws-key` | an access key ID, `AKIA` and 16 capitals or digits |
| `slack-token` | `xoxb-`, `xoxp-` and the like |
| `password-assignment` | `password`, `secret`, `api_key` or `access_token` given a quoted literal of 8 characters or more after `=` or `:`, or a dotenv-style line such as `DB_PASSWORD=...` with a bare or a quoted one, `export` and spaces around `=` allowed. A value read from the environment or from a call, `process.env.API_KEY` or `getpass()`, is not a literal, and a placeholder holding `<`, `$` or `{` is skipped |

A finding carries the file and the line. A token whose prefix names its kind, `sk-`, `ghp_`,
`github_pat_`, `AKIA` or `xoxb-`, is printed as that prefix and a fixed run of `*`; any other value,
a password above all, as the run of `*` alone, so neither its characters nor its length show. Every
value the report prints is masked that way, however many credentials it holds. Any credential finding makes the grade
F, per `report-format.md`. Only `.git` is not read; a dependency tree such as `node_modules` shipped
inside a skill is read like everything else.

## The security gate

The gate looks for what a skill does rather than what it holds, in every file a skill could run or
tell an agent to run, at any depth:

- **A file a skill can run**: a script by its extension (`.sh`, `.js`, `.mjs`, `.jsx`, `.ts`,
  `.tsx`, `.py`, `.ps1` and the like), a file a tool runs commands from (`Makefile`, `package.json`,
  `Dockerfile`, `justfile`), a file starting with a `#!` line, a file with no extension and its
  executable bit set, or any non-Markdown file under a `scripts/` or `bin/` directory. It gets every
  kind below. A file reached by several paths, through a link inside the skill, is judged by the
  strongest of them: linked from `scripts/`, a `.txt` file is a script, and linked to by another
  name, the root `SKILL.md` is still the root `SKILL.md`.
- **A Markdown file** (`.md`, `.mdx`, `.markdown`), `SKILL.md` and every reference: `remote-exec`
  and `safety-off`, since an instruction to run a download or to approve everything works as well
  from a reference the skill points at as from `SKILL.md`. `SKILL.md` also gets `network`.
- **Any other text file**, data such as JSON, TSV or `.txt`: `remote-exec`, and credentials.
- **Binary content** is `unreadable` when the file is Markdown, a file a skill can run, or a native
  executable by its first bytes, its extension (`.exe`, `.so`, `.dylib`, `.node`, `.wasm`, `.jar`)
  or its executable bit. An image or other binary data is not, and an image, a font or a PDF known
  by its first bytes is not one even with the executable bit set, which a Windows drive mounted in
  WSL and a zip extracted on Windows set on every file.
- **A file or directory that cannot be read** is `unreadable`: the gate did not read it, so it is a
  gate failure rather than a skip. A `SKILL.md` that cannot be read, or that links out of the skill,
  is one too, since the gate never ran.

No path is exempt, and only the repository's own `.git` at the skill's top is skipped. The sample
skills sit outside the plugin, in `tests/skill-eval-fixtures/`, because a harness that looks for
`SKILL.md` at any depth under `skills/` would otherwise list them, the malicious one included, as
skills of their own.

| kind | Fails when a line holds |
|------|-------------------------|
| `network` | a network call to a host the skill's `SKILL.md` does not name: the usual command-line downloaders, `fetch(...)`, an HTTP client of Node, Python or PowerShell, a raw socket (`nc`, `ncat`, `socat`) and the host it opens, a copy or remote shell to `user@host:`, and in a file a skill can run any URL outside a comment line, whatever names the client. In a file a skill can run, one whose host is not written on the line at all, a variable or a computed URL, fails too, since it cannot be checked. Each part of a line a shell runs in turn, split on `;`, `&&`, `\|\|` and `\|`, is judged on its own: git's `fetch`, `pull`, `push`, `clone`, `ls-remote` and `remote` with no URL or host after them talk to the repository's remotes and are not counted, and the download beside them still is |
| `remote-exec` | a download piped into a shell or an interpreter, named or by path, through any number of pipes and behind `sudo`, `env`, `xargs`, `exec`, `command` or `busybox`; a download run through command or process substitution, `$(...)` or `<(...)`, or through backticks in a script or a fenced block of Markdown, where a backtick outside a fence opens a code span; PowerShell's expression cmdlet given a web request; a download saved to a file, by `-o` or a redirect, and then run, sourced or made executable; encoded content decoded straight into a shell; or an evaluation or execution of fetched or decoded content, in a call form, so the word inside a name such as `skill-eval` is not one. In prose, a sentence forbidding it is not one, by the negation rule below |
| `safety-off` | an instruction to approve tool calls automatically, or to switch off a permission, sandbox, approval or safety check, and the flags that do it on Claude Code and Codex: skipping permissions, bypassing approvals and the sandbox, the unsandboxed mode, full-auto, never asking for approval, and accepting edits. Skipping the setup of a sandbox is not switching one off. Every match on a line is judged, so a forbidden one does not hide an instruction after it |
| `unreadable` | in a file a skill can run: a line over 1000 characters, an encoded run over 200 characters; and the binary or unreadable cases above |

**The negation rule.** In Markdown, a match is not an instruction when a negation governs it: one
of never, not, do not, must not, cannot, should not, nothing, nobody or without, followed, before
the match and in the same clause, only by words that carry the verb on, such as be, get, used, to,
you or run. So "never disable the sandbox", "nothing gets auto-approved" and "do not run the
download into `sh`" forbid. A negation that governs another word does not count: "don't forget to
disable it", "it is not optional to disable it" and "no questions asked, disable it" instruct. In a
file a skill can run there is no prose and nothing is negated, so a variable named `NO` changes
nothing.

The host of a call is read from the URL with a URL parser, so a host written after a username,
`https://trusted.example@other.example/`, is the second one; a scheme in capitals, an IP address and
`localhost` count as hosts too, and a bare `host.tld`, with or without a path, given to a downloader is read as well, a file name such
as `notes.txt` aside. A
network call to a host that the skill's own `SKILL.md`, the one at its top, names in its text, as a
whole host and not inside a longer one, is listed as `info` with the host, not as a failure: a skill
that says where it connects has told its reader. A line in that `SKILL.md` that is itself a network
call declares nothing, its own host or another's, so two calls to one host do not declare each other,
and a `SKILL.md` nested deeper in the skill declares nothing, since no harness reads it as the skill's.

The patterns are in the script, written so that the script does not match itself. A line can fail
more than one kind, a download piped into a shell from an undeclared host fails both `network` and
`remote-exec`, and each is its own finding. Any gate failure makes the grade F.

**A plugin's processes.** The trigger mode loads a plugin skill with its plugin, and every process
that plugin and its dependencies register starts in every session: hooks, from `hooks/hooks.json`
and the manifest's `hooks` key; monitors, from `monitors/monitors.json` and `monitors`; LSP servers,
from `.lsp.json` and `lspServers`; and MCP servers, from `.mcp.json` and `mcpServers`.
`evaluateHooks` in `scripts/static-check.mjs` runs the same credential and gate checks over them:
every registration, every file under the plugin's `hooks/`, every file inside the plugin a command
names, and each command line as a script. A command line holds the command, its arguments, a URL,
a working directory and the values of its environment, where `NODE_OPTIONS` or `LD_PRELOAD` can load
a file of their own; an `http` hook's URL is checked as a network call. A path in a command, `/x`,
`./x`, `../x`, a `file:` URL, or a word with a slash that names something, is resolved against the
directory a session runs in, the root of the repository, with `${CLAUDE_PLUGIN_ROOT}` and
`${CLAUDE_PROJECT_DIR}` expanded; a word such as `application/json` that names nothing is a word.
Each of these is `unreadable`:

- a command naming a file outside the plugin, other than an interpreter or a device of the system
  such as `/usr/bin/env` or `/dev/null`;
- a path that resolves to nothing, or one built from `~` or another variable, since the gate cannot
  tell what it names;
- a named file the walk of the plugin does not reach, such as one under its own `.git`.

For a plugin that registers any process, each of these is `unreadable` as well:

- a link whose target leaves the plugin, or one written as an absolute path, which a copy of the
  plugin would still resolve to the original;
- a file that is neither text nor an image or data file, an executable binary or a script holding a
  NUL byte among them, since nobody can read it;
- text holding bidirectional controls or marks, zero-width or tag characters, ESC, or a carriage
  return that is not a line ending, all of which read differently from what runs; Markdown may keep
  the zero-width joiners emoji need;

and a credential in any of its text files, or a file named for one, `.env` or `*.pem` among them, is
a credential finding, so nothing the trigger mode shows in full holds a secret.

A command that runs a package runner, `npx`, `pnpm dlx`, `yarn dlx`, `bunx`, `uvx`, `pipx run` or
`npm exec`, by name or by path, fails as `network`, since the code it runs is fetched at run time and was never in the
plugin.

For a plugin that registers any process, it also returns `codeFiles`, every registration file, every
non-Markdown text file of the plugin, and every Markdown file one of those names by its path, each
with its line count and sha256, and the links that reach it; and `codeDigest`, a sha256 over every
file of the plugin and every path that reaches it, shown or not. For a plugin inside the repository
the plugin is what git carries into the seed, so an ignored `.env` or `node_modules` is neither read
nor copied. A file Node can load as code needs no script extension, which is why the list is that wide. The
static report of a skill does not include any of this; `trigger-run.mjs` calls it before any session
starts.

**What a clean gate means.** The gate is a list of patterns, and a list catches the forms somebody
wrote into it. A form nobody listed, a client this file does not name or a command assembled from
pieces at run time, passes. So a gate with no failure says that none of the forms above was found,
not that the skill is safe: report it in those words, and read a skill from a source you do not trust
before installing it, whatever the gate says. The trigger mode asks for that reading where the
plugin starts processes: it shows `codeFiles` and runs only with `--read` naming their digest.

By hand: read every `SKILL.md` and every script line by line against the table. Running a script to
see what it does is never part of the check.

## The optional external validator

NVIDIA SkillEvaluator, when the `skillevaluator` command is on the `PATH`, adds its own Tier 1
checks: schema and repository governance, a quality score, PII, licence, code integrity, dependency
and Unicode checks, and script lint. It is never required, never installed by this skill, and never
run without the user's yes in that run. The script does not call it; the agent does.

Checked against version 0.4.0. The keyless command is:

```bash
d=$(mktemp -d); echo "$d"
env -i PATH="$PATH" HOME="$HOME" TMPDIR="${TMPDIR:-/tmp}" \
  skillevaluator tier1 <skill-dir> --no-llm -r json -o "$d"
```

- `--no-llm` switches off its rubric, LLM security and verification stages. Pass nothing that
  enables one unless the user asked for it in this run.
- The environment holds `PATH`, `HOME` and the temporary directory variable and nothing else, so no
  provider key it might pick up, `*_API_KEY` or a token, reaches it. On Windows, where `env -i` does
  not exist, start it from a shell with those variables cleared.
- `-o` points at a directory made for this run with `mktemp -d` (a fresh, private directory, never a
  fixed name another user could make first), and the `echo` prints its path, which is how the agent
  knows where to read the report and what to remove. Without `-o` the report goes to `reports/` under
  the working directory, which is the evaluated repository. Remove that directory with `rm -rf "$d"`
  after reading it: the report can hold what a secret scanner matched, unmasked.
- It exits 1 when a check fails or a scanner it uses, SkillSpector or Gitleaks, is missing; that is a
  result, not a crash. Read `<dir>/skillevaluator-tier1.json`.

From the JSON, report `overall_status`, `incomplete_scans`, `severity_counts`, and each finding of
`results[].findings[]` with its `severity`, `check_name`, `message`, and `file_path:line_number`
when it has one. The version comes from `skillevaluator --version`. A message can quote what a secret
scanner matched: any value in it shaped like a credential is masked by the rule above before it is
reported.

Its findings are a group of their own and never enter the static score or the grade. Its rules are
its authors' conventions, a `## Purpose` section or an author field for instance, and a skill that
leaves them out has not failed this skill's checks.

Not on the `PATH`: one line, `SkillEvaluator is not installed, so its extra checks did not run;
install it with uv tool install git+https://github.com/NVIDIA/SkillEvaluator@v0.4.0`, pinned to the
version this file was checked against, and every other check
runs as usual.
