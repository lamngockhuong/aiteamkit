// atk:security git-history-stream: how this skill's scripts start git, so that the same history
// gives the same output on every machine whatever the user configured, and git reaches nothing
// outside the clone.
//
// Every git child gets the same options and environment. The options are the one form the `sh` scan
// of shared/secret-scan.md asks for, plus what a history walk adds: merges diffed against each parent
// whatever log.diffMerges says, the root commit shown whatever log.showRoot says. The environment
// stops a partial clone fetching a missing blob from its remote, a credential prompt, `git replace`
// showing another commit's content under a sha, and the user's pathspec variables turning the
// pathspecs that keep files unread into literal names.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

export const G = ['-c', 'core.quotePath=false', '-c', 'log.showSignature=false', '-c', 'diff.noprefix=false',
  '-c', 'log.diffMerges=separate', '-c', 'log.showRoot=true'];
export const ENV = { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_NO_REPLACE_OBJECTS: '1' };
for (const k of ['GIT_LITERAL_PATHSPECS', 'GIT_GLOB_PATHSPECS', 'GIT_NOGLOB_PATHSPECS', 'GIT_ICASE_PATHSPECS']) delete ENV[k];

// git in the given directory: its output, or a throw when it fails. raw returns a Buffer.
export function runner(cwd) {
  return (args, input, raw = false) => execFileSync('git', [...G, ...args], {
    cwd, env: ENV, encoding: raw ? undefined : 'utf8', maxBuffer: 1 << 30, input,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'ignore'],
  });
}

// The content of each object named, `<blob sha>` or `HEAD:<path>`, read in one `cat-file --batch`
// and held in memory only, as a map from the name to its text with `\r\n` made `\n`. A name git does
// not find is left out. Throws when git fails.
export function readBlobs(run, names) {
  const out = new Map();
  if (!names.length) return out;
  const buf = run(['cat-file', '--batch'], names.join('\n') + '\n', true);
  let at = 0;
  for (const name of names) {
    const nl = buf.indexOf(10, at);
    if (nl < 0) break;
    const head = /^[0-9a-f]+ \w+ (\d+)$/.exec(buf.toString('utf8', at, nl)); at = nl + 1;
    if (!head) continue;
    const size = Number(head[1]);
    out.set(name, buf.toString('utf8', at, at + size).replace(/\r\n/g, '\n')); at += size + 1;
  }
  return out;
}

// Streams one git command line by line, so no history is held whole, handing each line on with the
// commit it belongs to, from a `#commit <sha>` line; onCommit, when given, hears each new commit.
// Resolves to null when git finished, or to the reason it did not: killed at the deadline, an exit
// status, or git not starting.
export function stream(cwd, args, deadline, onLine, onCommit) {
  return new Promise((done) => {
    if (Date.now() >= deadline) return done('time limit');
    const p = spawn('git', [...G, ...args], { cwd, env: ENV, stdio: ['ignore', 'pipe', 'ignore'] });
    let cut = false; let commit = null;
    const timer = deadline < Infinity ? setTimeout(() => { cut = true; p.kill(); }, deadline - Date.now()) : null;
    createInterface({ input: p.stdout, crlfDelay: Infinity }).on('line', (l) => {
      if (l.startsWith('#commit ')) { commit = l.slice(8); onCommit?.(); } else onLine(l, commit);
    });
    p.on('error', () => { clearTimeout(timer); done('git could not be started'); });
    p.on('close', (code) => {
      clearTimeout(timer);
      done(cut ? 'time limit' : code !== 0 ? `git exited ${code} reading the history` : null);
    });
  });
}

// A path git quotes, in C style, holding a quote, a backslash or a control character. An escape
// with no entry here is the character itself, `\"` and `\\` among them.
const ESC = { n: 10, t: 9, a: 7, b: 8, f: 12, r: 13, v: 11 };
export function unquote(p) {
  if (!p.startsWith('"')) return p;
  const bytes = [];
  const chars = [...p.slice(1, -1)];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== '\\') { bytes.push(...Buffer.from(chars[i])); continue; }
    const n = chars[++i];
    if (/[0-7]/.test(n)) { bytes.push(parseInt(chars.slice(i, i + 3).join(''), 8)); i += 2; } else bytes.push(ESC[n] ?? n.charCodeAt(0));
  }
  return Buffer.from(bytes).toString('utf8');
}

// A remote URL with any login taken out, in the form git writes it into FETCH_HEAD: no `user@`,
// whether the URL has a scheme or is scp-like, no trailing slash, no `.git`.
const bareUrl = (u) => u.trim()
  .replace(/^([a-z][a-z0-9+.-]*:\/\/)[^@/]*@/i, '$1').replace(/^(?![a-z][a-z0-9+.-]*:\/\/)[^@/:]+@/i, '')
  .replace(/\/+$/, '').replace(/\.git$/, '');

// The remotes by name, and when FETCH_HEAD says each was last fetched, so a scan claims nothing
// beyond the refs it lists; null where FETCH_HEAD does not record the remote, a fresh clone among
// them. A URL is compared here and never returned, since it can carry a login. git is a function
// returning a command's output, or '' when it fails.
export function remotesWithLastFetch(top, git) {
  const path = resolve(top, git(['rev-parse', '--git-path', 'FETCH_HEAD']).trim() || '.git/FETCH_HEAD');
  const fetched = existsSync(path)
    ? { urls: new Set(readFileSync(path, 'utf8').split('\n').map((l) => l.split(' of ').pop()).filter(Boolean).map(bareUrl)), at: statSync(path).mtime.toISOString() }
    : null;
  return git(['remote']).split('\n').filter(Boolean).map((name) => {
    const url = git(['remote', 'get-url', name]);
    return { name, last_fetched: fetched && url && fetched.urls.has(bareUrl(url)) ? fetched.at : null };
  });
}
