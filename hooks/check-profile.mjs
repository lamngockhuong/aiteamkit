// atk SessionStart hook: reminds, never blocks.
//
// The rule about which skills need `.atk/profile.md` and what they do without it
// lives in shared/project-profile.md, and it stays there. This script answers one
// question only: does this project have a profile yet. If it ever grows a second
// question, the rule has been copied into a second place and the two will drift.
// The reminder below names a class of skills on purpose, never a list of them,
// for the same reason.
//
// It is Node, registered in exec form, because that is the only shape that
// behaves the same on Linux, macOS, and Windows. docs/system-architecture.md
// explains why under "Why the hook is Node and not a shell script"; do not
// rewrite this as a shell script without reading it.
//
// Claude Code cannot block on SessionStart (its exit-code table says exit 2 takes
// no blocking action here), so the reminder is safe by construction. Keep it that
// way: return early rather than throw, print nothing when there is nothing to
// say, and let every failure end in silence rather than in a message the user did
// not ask for.

import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Where the "already reminded" marker lives. The plugin's own data directory when
// the harness provides one, the user's state directory otherwise. Never a
// world-writable directory such as the system temp directory: on a shared machine
// anyone could plant a symlink there under a name derived from a path they can
// guess. And never the user's repository: a stray file in their `git status` is a
// real bug.
function markerRoot() {
  const { CLAUDE_PLUGIN_DATA, XDG_STATE_HOME, LOCALAPPDATA } = process.env;
  if (CLAUDE_PLUGIN_DATA) return join(CLAUDE_PLUGIN_DATA, 'profile-reminder');
  if (XDG_STATE_HOME) return join(XDG_STATE_HOME, 'atk', 'profile-reminder');
  if (process.platform === 'win32' && LOCALAPPDATA) {
    return join(LOCALAPPDATA, 'atk', 'profile-reminder');
  }
  const home = homedir();
  return home ? join(home, '.local', 'state', 'atk', 'profile-reminder') : null;
}

// FNV-1a. The key only has to be a short, stable, filesystem-safe name for a
// path, so this is deliberately not a cryptographic hash: importing node:crypto
// costs a measurable few milliseconds of every session start, and the worst a
// collision can do is cost one project its reminder, which is already how this
// file behaves whenever it is unsure.
function markerKey(path) {
  let h = 0x811c9dc5;
  for (let i = 0; i < path.length; i++) {
    h ^= path.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function main() {
  const project = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Only speak inside something that looks like a source repository. A plain
  // directory is not a project that forgot to run /atk:init. In a worktree the
  // git entry is a file rather than a directory, and existsSync accepts either.
  if (!existsSync(join(project, '.git'))) return;
  if (existsSync(join(project, '.atk', 'profile.md'))) return;

  const root = markerRoot();
  if (!root) return;

  mkdirSync(root, { recursive: true });

  // The marker is a directory, and leaving `recursive` off makes this throw
  // rather than succeed when the name is taken. That one call is both the
  // "already reminded" test and the lock between two sessions starting at once,
  // and it does not follow a symlink at the final component.
  mkdirSync(join(root, markerKey(project)));

  process.stdout.write(
    'atk: this project has no .atk/profile.md, so the atk skills that change code ' +
      "will stop rather than guess this project's commands. Run /atk:init to create it.\n"
  );
}

try {
  main();
} catch {
  // Marker already there, directory not writable, no home directory: every one of
  // them means stay quiet.
}
