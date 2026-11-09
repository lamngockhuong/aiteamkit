// atk:security supply-chain-scan: the CI workflows, manifests and lockfiles of the tracked tree,
// read for the supply-chain candidates the skill then triages per references/supply-chain.md.
//
// A script because the same tree must give the same candidates on every run and every harness. The
// design is fork 3, 5 and 7 of
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md;
// how git is started comes from ./lib/git-history-stream.mjs, the rules from
// ./lib/workflow-candidates.mjs and ./lib/package-candidates.mjs, and the names a typosquat is
// measured against from references/popular-packages.tsv beside this skill.
//
// Usage: node supply-chain-scan.mjs, from anywhere inside the repository. It takes no argument.
//
// Output, one JSON object on standard output:
//   { "tool": "supply-chain-scan", "version": 1, "complete": bool, "incomplete_reason": text|null,
//     "scanned": { "files": n, "workflows": n, "actions": n,
//                  "popular_names": { "npm": n, "pypi": n, "oldest_checked": date|null, "unchecked": n } },
//     "hits": [ { "kind": "candidate", "rule": rule, "path": path, "line": n|null, ...what the rule
//                 names: "action" and "ref", "job", "package" and "like", or "host" } ],
//     "not_scanned": [ { "name": text, "paths": [path] } ] }
//   `host` is a host with any login taken out, or null where it came from a variable or could not
//   be told from a login with certainty.
//
// What it never prints: a line of any file. What it never reads: a file rule 9 of
// shared/team-roles.md names, or the working tree; every file is read as git's index holds it.
//
// It sends nothing anywhere and starts only `git`, with argument arrays and no shell. Exit 0 when
// every file it reads was read, whatever it found; 3 when one was not, git failing, a file that is
// not valid JSON, or a workflow the line reader cannot read, with `complete: false` and every
// reason; 2 with one line on standard error when it could not run: not a repository, no `git`, or an
// argument, since it takes none.

import { readFileSync } from 'node:fs';
import { blobReader, runner } from './lib/git-history-stream.mjs';
import { parseYaml } from './lib/line-yaml.mjs';
import { npmCandidates, pythonCandidates } from './lib/package-candidates.mjs';
import { isAction, isWorkflow, kindOf } from './lib/tracked-file-kinds.mjs';
import { actionCandidates, workflowCandidates } from './lib/workflow-candidates.mjs';

const refuse = (msg) => { process.stderr.write('supply-chain-scan: ' + msg + '\n'); process.exit(2); };
if (process.argv.length > 2) refuse('unknown argument ' + JSON.stringify(process.argv[2]) + '; takes none');
let top;
try { top = runner(process.cwd())(['rev-parse', '--show-toplevel']).trim(); } catch (e) {
  refuse(e.code === 'ENOENT' ? 'git is not on the PATH' : 'not inside a git repository');
}

const reasons = [];
const fail = (path, why) => { const t = path ? `${path}: ${why}` : why; if (!reasons.includes(t)) reasons.push(t); };
const notScanned = new Map();
const note = (name, path) => { if (!notScanned.has(name)) notScanned.set(name, new Set()); notScanned.get(name).add(path); };

let entries = [];
try {
  entries = runner(top)(['ls-files', '-z', '-s']).split('\0').filter(Boolean).map((e) => {
    const tab = e.indexOf('\t'); const [mode, , stage] = e.slice(0, tab).split(' '); // a path may hold a tab
    return { mode, stage, path: e.slice(tab + 1) };
  });
} catch { fail(null, 'git could not list the tracked files'); }
const paths = new Set(entries.map((e) => e.path));

const toRead = [];
for (const { mode, stage, path } of entries) {
  const kind = kindOf(path, mode);
  if (!kind) continue;
  if (!kind.read) note(kind.name, kind.at);
  else if (stage !== '0') fail(path, 'in a merge conflict, not read');
  else if (path.includes('\n')) fail(path, 'a name git cannot be asked for by line, not read');
  else toRead.push(path);
}

const files = new Map();
if (toRead.length) {
  const reader = blobReader(top, Infinity);
  try {
    for (const path of toRead) {
      const text = await reader.read(':' + path);
      if (text === null) fail(path, 'git could not read it');
      // UTF-16, as some Windows shells write a requirements file, decodes with NULs: not read, not guessed
      else if (text.includes('\0')) fail(path, 'not UTF-8 text, not read');
      else files.set(path, text.replace(/^﻿/, '')); // a byte-order mark, which npm and pip both skip
    }
  } catch (e) { fail(null, 'git stopped reading the files: ' + e.message); } finally { reader.end(); }
}

// The popular names, per ecosystem, and the oldest date one of them was checked.
const popular = {}; let oldest = null; let unchecked = 0;
try {
  const rows = readFileSync(new URL('../references/popular-packages.tsv', import.meta.url), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t'));
  const head = rows.shift(); const [ie, iname, ic] = ['ecosystem', 'name', 'checked'].map((f) => head.indexOf(f));
  for (const r of rows) {
    (popular[r[ie]] ||= new Set()).add(r[iname]);
    if (!r[ic]) unchecked++; else if (!oldest || r[ic] < oldest) oldest = r[ic];
  }
} catch { fail(null, 'references/popular-packages.tsv could not be read, so no typosquat candidate was looked for'); }

const hits = [];
const add = (c) => hits.push({ kind: 'candidate', ...c });
let workflows = 0; let actions = 0;
for (const [path, text] of files) {
  const workflow = isWorkflow(path);
  if (!workflow && !isAction(path)) continue;
  let root;
  try { root = parseYaml(text); } catch (e) { fail(path, 'the line reader could not read it: ' + e.message); continue; }
  if (root.kind !== 'map') { fail(path, 'the line reader could not read it: not a mapping'); continue; }
  if (workflow) { workflowCandidates(root, path, add); workflows++; } else { actionCandidates(root, path, add); actions++; }
}
npmCandidates(files, paths, popular, add, note, fail);
pythonCandidates(files, paths, popular, add, note);

hits.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : (a.line ?? 0) - (b.line ?? 0)));
process.stdout.write(JSON.stringify({
  tool: 'supply-chain-scan', version: 1, complete: !reasons.length, incomplete_reason: reasons.length ? reasons.join('; ') : null,
  scanned: {
    files: files.size, workflows, actions,
    popular_names: { npm: popular.npm?.size ?? 0, pypi: popular.pypi?.size ?? 0, oldest_checked: oldest, unchecked },
  },
  hits,
  not_scanned: [...notScanned].map(([name, set]) => ({ name, paths: [...set].sort() })).sort((a, b) => (a.name < b.name ? -1 : 1)),
}, null, 2) + '\n');
process.exitCode = reasons.length ? 3 : 0;
