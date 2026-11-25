// atk:review post-review: one review on a GitHub pull request, carrying the summary, the inline
// comments and the event at once, with every inline line checked against the pull request's diff
// before anything is sent, and each comment read back afterwards.
//
// A script because the same review must be checked and posted the same way on every run: a line
// outside every hunk is refused by GitHub, and a payload built by hand breaks on the backticks,
// quotes and `<details>` blocks a summary holds. What to post, and whether to post at all, stays
// with the session, per `## Ticket` of SKILL.md and Under `--comment` in references/report-format.md.
// The decision is
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/adr/0018-review-posts-through-a-script.md.
//
// Usage: node post-review.mjs <spec.json> [--post], from anywhere inside the repository that holds
// the reviewed commit. Without --post it checks and sends nothing.
//
// The spec, written by the session with its file write, never through shell quoting:
//   { "repo": "<owner>/<name>", "pr": n, "base": "<ref or sha>", "commit": "<sha reviewed>",
//     "event": "COMMENT" | "REQUEST_CHANGES", "body": "<summary>",
//     "comments": [ { "id": "B1", "path": "<path>", "line": n, "body": "B1 ..." } ] }
//   `base` is the base the mask diffed against, `<remote>/<baseRefName>` or its sha, never FETCH_HEAD,
//   which names another commit from another worktree, and the lines are checked against
//   `<base>...<commit>`, the diff GitHub shows. Each comment's body opens
//   with its id, bare or after a leading `**` as in `**S1 · SHOULD FIX**`, and never with a longer
//   id, so B1 is not B10. APPROVE is refused: approving is a person's act, never a review's.
//
// Output, one JSON object on standard output:
//   { "tool": "post-review", "version": 1, "mode": "check" | "post",
//     "anchors": [ { "id", "path", "line", "anchored": bool, "nearest": n|null } ],
//     "posted": bool, "review_id": n|null, "url": text|null,
//     "landed": [ { "id", "path", "line", "landed": bool } ], "error": text|null }
//   `nearest` is the closest added line of the same file, or null when the diff adds none there.
//
// Each file is diffed alone, by its path, so a file no comment names is never read; a renamed file
// is therefore diffed as added, and a line GitHub would not show there is refused by GitHub, which
// sends the whole review back and posts nothing. Nothing of a file is printed but its path and line
// numbers.
//
// The read-back takes every page of the pull request's inline comments and keeps those whose
// `pull_request_review_id` is the posted review's: the review's own comments endpoint answers
// `line` and `original_line` null for every comment, which would report each one off its line.
//
// It starts only `git`, and `gh` under --post, with argument arrays and no shell. Exit 0 when every
// line is anchored and, under --post, the review was created and every comment landed on its line;
// 3 when a line is not anchored, in which case nothing is sent, or GitHub refused the review, or a
// comment did not land; 2 with one line on standard error when it could not run: an argument, a
// spec that does not hold, a commit or base git does not have, or no `git` or `gh`.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runner } from '../../security/scripts/lib/git-history-stream.mjs';

const refuse = (msg) => { process.stderr.write('post-review: ' + msg + '\n'); process.exit(2); };

const args = process.argv.slice(2);
const post = args.includes('--post');
const rest = args.filter((a) => a !== '--post');
if (rest.length !== 1 || rest[0].startsWith('-')) refuse('usage: node post-review.mjs <spec.json> [--post]');

let spec;
try { spec = JSON.parse(readFileSync(rest[0], 'utf8')); } catch (e) { refuse('cannot read the spec as JSON: ' + e.message); }
const isInt = (n) => Number.isInteger(n) && n > 0;
const opens = (body, id) => typeof body === 'string' && new RegExp('^(?:\\*\\*)?' + id + '(?!\\d)').test(body); // B1 is not B10
if (typeof spec?.repo !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(spec.repo)) refuse('repo must be <owner>/<name>');
if (!isInt(spec.pr)) refuse('pr must be a positive integer');
if (typeof spec.base !== 'string' || !spec.base || spec.base.startsWith('-')) refuse('base must be a ref or a sha');
if (typeof spec.commit !== 'string' || !/^[0-9a-f]{7,64}$/.test(spec.commit)) refuse('commit must be a sha');
if (!['COMMENT', 'REQUEST_CHANGES'].includes(spec.event)) refuse('event must be COMMENT or REQUEST_CHANGES');
if (typeof spec.body !== 'string' || !spec.body.trim()) refuse('body must be the summary');
if (!Array.isArray(spec.comments)) refuse('comments must be an array');
const ids = new Set();
for (const c of spec.comments) {
  if (typeof c?.id !== 'string' || !/^[BSN]\d+$/.test(c.id)) refuse('a comment id must be shaped B1, S1 or N1');
  if (ids.has(c.id)) refuse('comment id ' + c.id + ' appears twice');
  ids.add(c.id);
  if (typeof c.path !== 'string' || !c.path || c.path.startsWith('/') || c.path.split('/').includes('..')) refuse(c.id + ': path must be relative to the repository');
  if (!isInt(c.line)) refuse(c.id + ': line must be a positive integer');
  if (!opens(c.body, c.id)) refuse(c.id + ': body must open with its id');
}

// git started as atk:security's scripts start it: one output form whatever the user configured, and
// no replace object, graft or exported variable showing another repository or another commit.
const git = runner(process.cwd());
try { git(['rev-parse', '--show-toplevel']); } catch (e) { refuse(e.code === 'ENOENT' ? 'git is not on the PATH' : 'not inside a git repository'); }
for (const [name, ref] of [['commit', spec.commit], ['base', spec.base]]) {
  try { git(['rev-parse', '--verify', '--quiet', '--end-of-options', ref + '^{commit}']); } catch { refuse(name + ' ' + JSON.stringify(ref) + ' is not a commit git has; fetch it first'); }
}

// The new-side lines GitHub shows for one file, three lines of context as its diff has, and the
// added lines among them.
function linesOf(path) {
  const out = git(['diff', '--no-color', '--no-ext-diff', '--no-textconv', '-U3', '--end-of-options', spec.base + '...' + spec.commit, '--', ':(literal)' + path]);
  const shown = new Set(); const added = [];
  let n = 0; let inHunk = false;
  for (const l of out.split('\n')) {
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(l);
    if (h) { n = Number(h[1]); inHunk = true; continue; }
    if (!inHunk) continue;
    if (l.startsWith('diff --git ')) { inHunk = false; continue; }
    if (l.startsWith('+')) { shown.add(n); added.push(n); n++; } else if (l.startsWith(' ')) { shown.add(n); n++; }
  }
  return { shown, added };
}

const result = { tool: 'post-review', version: 1, mode: post ? 'post' : 'check', anchors: [], posted: false, review_id: null, url: null, landed: [], error: null };
const byPath = new Map();
for (const c of spec.comments) {
  if (!byPath.has(c.path)) byPath.set(c.path, linesOf(c.path));
  const { shown, added } = byPath.get(c.path);
  const nearest = added.length ? added.reduce((a, b) => (Math.abs(b - c.line) < Math.abs(a - c.line) ? b : a)) : null;
  result.anchors.push({ id: c.id, path: c.path, line: c.line, anchored: shown.has(c.line), nearest });
}
const done = (code) => { process.stdout.write(JSON.stringify(result) + '\n'); process.exit(code); };
const unanchored = result.anchors.filter((a) => !a.anchored);
if (unanchored.length) { result.error = 'not in the diff: ' + unanchored.map((a) => a.id).join(', ') + '; nothing sent'; done(3); }
if (!post) done(0);

const gh = (a) => {
  const p = spawnSync('gh', a, { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (p.error) refuse(p.error.code === 'ENOENT' ? 'gh is not on the PATH' : 'gh could not start');
  return p;
};
// gh prints the status on standard error and GitHub's body, with its reasons, on standard output.
const refusal = (p) => {
  try {
    const b = JSON.parse(p.stdout);
    const why = [b.message, ...(Array.isArray(b.errors) ? b.errors.map((e) => (typeof e === 'string' ? e : e?.message)) : [])].filter(Boolean);
    if (why.length) return why.join('; ');
  } catch { /* not JSON: fall back to standard error */ }
  return (p.stderr || '').trim().split('\n').join(' ') || 'gh exited ' + p.status;
};
const dir = mkdtempSync(join(tmpdir(), 'atk-post-review-'));
try {
  const payload = join(dir, 'review.json');
  writeFileSync(payload, JSON.stringify({
    commit_id: spec.commit, event: spec.event, body: spec.body,
    comments: spec.comments.map((c) => ({ path: c.path, line: c.line, side: 'RIGHT', body: c.body })),
  }));
  const p = gh(['api', '-X', 'POST', `repos/${spec.repo}/pulls/${spec.pr}/reviews`, '--input', payload]);
  if (p.status !== 0) { result.error = refusal(p); done(3); }
  const review = JSON.parse(p.stdout);
  result.posted = true; result.review_id = review.id ?? null; result.url = review.html_url ?? null;
} finally { rmSync(dir, { recursive: true, force: true }); }

if (!spec.comments.length) done(0);
// gh joins the pages of --paginate into one JSON array.
const r = gh(['api', '--paginate', `repos/${spec.repo}/pulls/${spec.pr}/comments?per_page=100`]);
let got = null;
try { if (r.status === 0) got = JSON.parse(r.stdout); } catch { got = null; }
if (!Array.isArray(got)) { result.error = 'posted, but the comments could not be read back'; got = []; }
got = got.filter((x) => x?.pull_request_review_id === result.review_id);
for (const c of spec.comments) {
  const g = got.find((x) => x.path === c.path && opens(x.body, c.id));
  result.landed.push({ id: c.id, path: c.path, line: c.line, landed: !!g && (g.line ?? g.original_line) === c.line });
}
done(result.error || result.landed.some((l) => !l.landed) ? 3 : 0);
