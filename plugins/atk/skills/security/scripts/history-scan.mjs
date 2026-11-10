// atk:security history-scan: every commit of every ref the clone holds, read for the secret
// shapes and the files rule 9 of shared/team-roles.md keeps unread, without an agent.
//
// A script because the same history must give the same hits on every run and every harness, and
// the `sh` scan of shared/secret-scan.md reads one diff or one tree, never the history. The design
// is https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md;
// the shapes and the file lists come from ./lib/secret-shapes.mjs, held to that `sh` scan by
// tests/verify.sh, and how git is started from ./lib/git-history-stream.mjs.
//
// Usage: node history-scan.mjs [--max-seconds <n>] [--domains | --identities [--internal <list>]
// [--detail <path>]] from anywhere inside the repository, each flag per ./lib/history-scan-options.mjs.
//
// Output, one JSON object on standard output:
//   { "tool": "history-scan", "version": 1, "complete": bool, "incomplete_reason": text|null,
//     "scanned": { "refs": [refname], "commits": n, "binary_skipped": n },
//     "remotes": [ { "name": text, "last_fetched": ISO time|null } ],
//     "hits": [ { "kind": "secret", "shape": labels, "commit": sha, "path": path|null, "line": n|null,
//                 "at_head": "present" | "removed" | "path-gone" | null where HEAD was not compared }
//             | { "kind": "credential-file", "shape": why, "from": path|null, "commit": sha,
//                 "path": path, "line": null, "at_head": "present" | "path-gone" | null, as a secret's }
//             | an "email" or "host" hit, or a secret in a message, per ./lib/identity-hosts.mjs ],
//     "not_scanned": [], and "domains" and "detail" under those flags, per the same file }
//   A secret is reported once, at the commit that first added that line at that path, so a line a
//   merge only carries over from a parent is not reported again; a private key is one hit, its
//   whole block compared. `at_head` is decided here: the line, or any hash of it, is never printed.
//   `last_fetched` is null where FETCH_HEAD does not record the remote, a fresh clone among them.
//
// What it never prints: a line of any file, a value, or a remote's URL. What it never reads: the
// content of a file rule 9 names, kept out of every diff by pathspec; a file renamed or copied from
// one, a file beside a `.pub` of the same name, and a `.sql` or `.csv` whose blob is over a megabyte
// are found by name and size, kept out of the content passes by pathspec too where the command line
// allows, and otherwise dropped unread as git passes them. Those are reported by name.
//
// It sends nothing anywhere and starts only `git`, with argument arrays and no shell; a partial
// clone, whose git would fetch a missing blob from its remote, is not walked. Exit 0 when the walk
// finished, whatever it found; 3 when it ran and did not finish, a shallow or partial clone, git
// failing, or --max-seconds reached, with `complete: false`; 2 with one line on standard error when
// it could not run: not a repository, no `git`, or an argument it does not take.

import { blobReader, remotesWithLastFetch, runner, stream, unquote } from './lib/git-history-stream.mjs';
import { readKeyVersions, touchesBlock } from './lib/private-key-versions.mjs';
import { BLOCK_BEGIN, BLOCK_END, DUMP_BYTES, EXCLUDE_PATHSPECS, MOVES, REASON, TEMPLATE_PATHSPECS, isCredentialFile, isDump, isTemplate, shapesOf } from './lib/secret-shapes.mjs';
import { readOptions } from './lib/history-scan-options.mjs';
import { decideAtHead } from './lib/head-at-hit-compare.mjs';
import { contentHits } from './lib/host-classes.mjs';
import { detailPath, finishHits, identityPass, pathHitsFor } from './lib/identity-hosts.mjs';

const refuse = (msg) => { process.stderr.write('history-scan: ' + msg + '\n'); process.exit(2); };
let opt; try { opt = readOptions(process.argv.slice(2)); } catch (e) { refuse(e.message); }
const { maxSeconds } = opt; let top;
try { top = runner(process.cwd())(['rev-parse', '--show-toplevel']).trim(); } catch (e) {
  refuse(e.code === 'ENOENT' ? 'git is not on the PATH' : 'not inside a git repository');
}
const run = runner(top);
let detail = null; // checked before anything is walked, so a path git would track exits 2
if (opt.detail) try { detail = detailPath(top, run, opt.detail); } catch (e) { refuse(e.message); }
const git = (args, input) => { try { return run(args, input); } catch { return ''; } }; // a failure reads as nothing
const deadline = maxSeconds ? Date.now() + maxSeconds * 1000 : Infinity;
let incomplete = null;
// Every reason the scan did not finish is kept, each once, so a shallow clone does not hide a pass
// that failed after it.
const stop = (why) => {
  const text = why === 'time limit' ? `time limit of ${maxSeconds} seconds reached` : why;
  if (text && !(incomplete || '').split('; ').includes(text)) incomplete = incomplete ? incomplete + '; ' + text : text;
  return why;
};
const walk = async (args, onLine, onCommit) => stop(await stream(top, ['log', '--all', '-m', '--reverse', '--topo-order',
  '--full-history', '--no-color', '--no-ext-diff', '--no-textconv', '--format=#commit %H', ...args], deadline, onLine, onCommit));

if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') stop('shallow clone');
const partial = git(['config', '--get', 'extensions.partialClone']).trim() || /\btrue\b/i.test(git(['config', '--get-regexp', '^remote\\..*\\.promisor$']));
if (partial) stop('partial clone: git would fetch missing blobs from the remote, so the history was not walked');
let refs = [];
try { refs = run(['for-each-ref', '--format=%(refname)']).split('\n').filter(Boolean); } catch { stop('git could not list the refs'); }
const headSha = git(['rev-parse', '-q', '--verify', 'HEAD^{commit}']).trim();
if (headSha && !git(['symbolic-ref', '-q', 'HEAD'])) refs.push('HEAD');

const hits = [];
const unread = new Map(); // path -> its credential-file hit; the content of each is never read
function fileHit(path, commit, shape, from = null) {
  if (unread.has(path)) return;
  const hit = { kind: 'credential-file', shape, from, commit, path, line: null, at_head: null };
  unread.set(path, hit); hits.push(hit);
}

// Identities, raw: per ./lib/identity-hosts.mjs, a hit under --identities, a count under --domains.
let domains = null;
if ((opt.identities || opt.domains) && refs.length && !partial) {
  const ids = await identityPass(top, run, deadline, opt, stop); hits.push(...ids.hits); domains = ids.domains;
}

let binarySkipped = 0;
if (refs.length && !partial && !opt.domains) {
  // Pass 1, names only: every file ever added, with its blob, for the files rule 9 names, the files
  // beside a .pub, and the dumps over a megabyte at every path they were ever at; and whether passes
  // 2, 3 and 5 can find anything, so a history that never held what they look for is not walked for it.
  const added = new Map(); const pubs = new Set(); const dumps = []; const credBlobs = new Set();
  let renamable = false; let copied = false; let templates = false;
  let namesFailed = false; // a shallow clone is still walked; a names pass that failed is not
  const onPath = pathHitsFor(opt, hits); // under --identities, a path that is itself a host
  namesFailed ||= !!await walk(['--no-renames', '--raw', '--no-abbrev'], (l, commit) => {
    const m = /^:\d+ \d+ [0-9a-f]+ ([0-9a-f]+) ([A-Z])\d*\t(.*)$/.exec(l);
    if (!m) return;
    const [, blob, status] = m; const path = unquote(m[3]); const cred = isCredentialFile(path);
    if (status === 'D') { renamable ||= cred; return; }
    if (status !== 'A' && status !== 'M') return;
    if (status === 'A') onPath(path, commit);
    if (cred) { credBlobs.add(blob); if (status === 'A') fileHit(path, commit, REASON.named); } else if (isTemplate(path)) templates = true;
    else if (status === 'A' && credBlobs.has(blob)) copied = true;
    if (/\.pub$/.test(path)) pubs.add(path.slice(0, -4));
    else if (status === 'A' && !added.has(path)) added.set(path, commit);
    if (isDump(path)) dumps.push({ path, blob, commit });
  });
  for (const [path, c] of added) if (pubs.has(path)) fileHit(path, c, REASON.pub);
  if (dumps.length) {
    try {
      const big = new Set(run(['cat-file', '--batch-check=%(objectname) %(objectsize)'], [...new Set(dumps.map((d) => d.blob))].join('\n') + '\n')
        .split('\n').map((l) => l.split(' ')).filter(([, n]) => Number(n) > DUMP_BYTES).map(([b]) => b));
      for (const d of dumps) if (big.has(d.blob)) fileHit(d.path, d.commit, REASON.dump);
    } catch { namesFailed = true; stop('git could not size the .sql and .csv files'); }
  }
  // Passes 2 and 3: a file rule 9 names renamed, or copied exactly, to a name that is not one.
  for (const [verb, flags] of [['renamed', renamable && MOVES.renamed], ['copied', copied && MOVES.copied]]) {
    if (!flags) continue;
    namesFailed ||= !!await walk([...flags, '--name-status'], (l, commit) => {
      const [s, a, b] = l.split('\t');
      if (!/^[RC]\d*$/.test(s) || b === undefined) return;
      const from = unquote(a); const to = unquote(b);
      if (isCredentialFile(from) && !isTemplate(to)) fileHit(to, commit, REASON[verb], from);
    });
  }
  // Passes 4 and 5, content, only once every file kept unread is known: every line each commit
  // added, against each parent of a merge, with the files rule 9 names and the unread ones left out
  // by pathspec, and the templates read on their own.
  if (!namesFailed) {
    const literal = [...unread.keys()].map((p) => ':(exclude,literal)' + p);
    const extra = literal.join('').length < 16000 ? literal : []; // the rest are dropped below
    const seen = new Set();
    const record = (hit, key) => { if (!seen.has(key)) { seen.add(key); hits.push(hit); } };
    // A private key is read from the whole blob of the versions of a file that ever held a BEGIN
    // line which ./lib/private-key-versions.mjs says can hold one, below.
    const keyPaths = new Set(); const versions = []; const begins = [];
    for (const spec of templates ? [['.', ...EXCLUDE_PATHSPECS], TEMPLATE_PATHSPECS] : [['.', ...EXCLUDE_PATHSPECS]]) {
      let file = null; let header = false; let ln = 0; let blob = null; let old = null; let at = null; let touched = false;
      const closeFile = () => {
        if (file && blob && keyPaths.has(file)) versions.push({ blob, old, path: file, commit: at, touched });
        file = null; blob = null; touched = false;
      };
      await walk(['--no-renames', '-p', '-U0', '--full-index', '--inter-hunk-context=0', '--src-prefix=a/', '--dst-prefix=b/', '--', ...spec, ...extra], (l, commit) => {
        if (l.startsWith('diff --git ')) { closeFile(); header = true; return; }
        if (header) {
          const ix = /^index ([0-9a-f]+)\.\.([0-9a-f]+)/.exec(l);
          if (ix) { old = ix[1]; blob = /^0+$/.test(ix[2]) ? null : ix[2]; }
          else if (l.startsWith('+++ ')) {
            // git ends the name with a tab when it holds a space, so the end of it can be told apart.
            const p = l.slice(4).replace(/\t$/, ''); header = false; at = commit;
            file = p === '/dev/null' ? null : unquote(p).replace(/^b\//, '');
            if (file && unread.has(file)) file = null;
          } else if (l.startsWith('Binary files ')) binarySkipped++;
          return;
        }
        if (!file) return;
        if (l.startsWith('@@ ')) { ln = Number(/\+(\d+)/.exec(l)[1]); return; }
        touched ||= touchesBlock(l);
        if (!l.startsWith('+')) return;
        const text = l.slice(1); const line = ln++;
        if (opt.identities) for (const h of contentHits(text, opt.internal)) record({ ...h, shape: 'content', commit, path: file, line, at_head: null, block: [text] }, h.kind + '\0' + file + '\0' + h.full);
        const shape = shapesOf(text);
        if (!shape) return;
        const hit = { kind: 'secret', shape, commit, path: file, line, at_head: null, block: [text] };
        if (BLOCK_BEGIN.test(text) && !BLOCK_END.test(text)) { keyPaths.add(file); begins.push({ hit, blob }); } else record(hit, file + '\0' + text);
      }, closeFile);
      closeFile();
    }
    // Each complete block is one hit, at the first commit that held it at that path, compared whole
    // with HEAD; a BEGIN line in no complete block stays a hit of its own line.
    const starts = new Set(); const reader = versions.length ? blobReader(top, deadline) : null;
    try {
      await readKeyVersions(versions, reader?.read, ({ blob, path, commit }, b) => {
        starts.add(blob + '\0' + b.line);
        record({ kind: 'secret', shape: 'private key block', commit, path, line: b.line, at_head: null, block: b.lines }, path + '\0' + b.lines.join('\n'));
      });
    } catch (e) { stop(e.message === 'time limit' ? 'time limit' : 'git could not read the files that held a private key'); } finally { reader?.end(); }
    for (const { hit, blob } of begins) if (!starts.has(blob + '\0' + hit.line)) record(hit, hit.path + '\0' + hit.block[0]);
  }
}

await decideAtHead(hits, { top, run, headSha, partial, stop });
// Full emails, hosts and paths go to the --detail file alone, per ./lib/identity-hosts.mjs.
const remotes = remotesWithLastFetch(top, git);
const detailOut = finishHits(hits, { opt, detail, refs, remotes, stop });

const commits = Number(git(['rev-list', '--all', '--count']).trim()) || 0;
process.stdout.write(JSON.stringify({
  tool: 'history-scan', version: 1, complete: !incomplete, incomplete_reason: incomplete,
  scanned: { refs, commits, binary_skipped: binarySkipped }, remotes, hits,
  not_scanned: opt.domains ? ['secrets, credential files and content: --domains reads the identities and the remotes only'] : opt.identities ? [] : ['commit and tag messages: read under --identities only'],
  ...(domains && { domains }), ...(detailOut && { detail: detailOut }),
}, null, 2) + '\n');
process.exitCode = incomplete ? 3 : 0;
