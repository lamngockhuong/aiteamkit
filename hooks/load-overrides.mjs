// atk PreToolUse hook: loads a project's override file ahead of the skill that owns it.
//
// This hook saves a file read. It is not where the override mechanism lives, and
// nothing breaks without it: rule 7 of shared/team-roles.md is the behaviour, every
// SKILL.md names its own override file at the top of its workflow, and a skill that
// does not find the content already in front of it opens the file itself. Cursor and
// Codex have no equivalent event and behave identically, one read slower. Keep it
// that way. The moment this script decides something the skill cannot decide on its
// own, the rule exists in two places and the copy in shared/project-overrides.md is
// the one that is correct.
//
// It is Node, registered in exec form, for the reason check-profile.mjs gives and
// docs/system-architecture.md records under "Why the hook is Node and not a shell
// script".
//
// Fail-open on every path: a malformed payload, an unreadable file, a crash in here.
// Printing an empty object lets the Skill call through untouched, and that is the
// only acceptable failure of a hook whose whole job is a convenience.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

// Past this many characters the file is named rather than inlined, and the skill
// reads it on demand. A long override in front of every invocation costs more than
// the read it saves. The number is the one takumi's loader uses for the same
// trade-off; there is nothing special about it beyond being small enough to be
// cheap and large enough to hold the overrides teams actually write.
const MAX_INLINE_CHARS = 4096;

// The sentence shared/project-overrides.md tells a skill to look for. Both sides
// have to agree on it word for word, and that file is where it is defined.
const LOADED_MARKER = 'Loaded from';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// "atk:review" and "review" both name the same file. Anything with a path
// separator in it is not a skill name at all.
function skillFileName(name) {
  const bare = name.includes(':') ? name.slice(name.lastIndexOf(':') + 1) : name;
  return /^[a-z][a-z0-9-]*$/.test(bare) ? `${bare}.md` : null;
}

// Resolve inside .atk/overrides/ and confirm the result stayed there. The name is
// already constrained above; this is the second lock, because a path that escapes
// its directory is the one bug in a file reader worth two checks.
function overridePath(root, fileName) {
  const dir = resolve(root, '.atk', 'overrides');
  const file = resolve(dir, fileName);
  if (!file.startsWith(dir + sep)) return null;
  return file;
}

// Returns the context to inject, or null when there is nothing to say. Writing is
// the caller's job, so there is exactly one write on every path.
function contextFor() {
  const data = JSON.parse(readStdin() || '{}');
  if (data.tool_name && data.tool_name !== 'Skill') return null;

  const skill = (data.tool_input && data.tool_input.skill) || '';
  const fileName = skillFileName(skill);
  if (!fileName) return null;

  // The project directory when the harness gives one, the call's own directory
  // otherwise. First root holding the file wins; a project with no overrides at
  // all falls through both and this hook says nothing.
  const roots = [process.env.CLAUDE_PROJECT_DIR, data.cwd, process.cwd()];
  let file = null;
  for (const root of roots) {
    if (!root) continue;
    const candidate = overridePath(root, fileName);
    if (candidate && existsSync(candidate) && statSync(candidate).isFile()) {
      file = candidate;
      break;
    }
  }
  if (!file) return null;

  const body = readFileSync(file, 'utf8');
  const shown = join('.atk', 'overrides', fileName);

  return body.length > MAX_INLINE_CHARS
    ? `${LOADED_MARKER} ${shown}: too long to inline (${body.length} characters). ` +
        'Read that file and apply it per rule 7 of shared/team-roles.md.'
    : `${LOADED_MARKER} ${shown}. This is the project's override file for ` +
        `${skill}. Apply it per rule 7 of shared/team-roles.md and do not open the ` +
        `file again.\n\n${body}`;
}

let context = null;
try {
  context = contextFor();
} catch {
  // Every failure ends here, silently, and the skill reads the file itself.
}

// One write, always. An empty object leaves the Skill call untouched.
process.stdout.write(
  context === null
    ? '{}'
    : JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: context },
      })
);
