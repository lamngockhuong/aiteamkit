// The seed: a fresh git repository built per run from a fixture's tree/ and history.json, with a
// bare repository as its origin. Nothing from hidden/ is copied in. Before any session, it records
// what the gate checks compare against in before.json. Between steps the runner edits it as a
// person would: approving an artifact, and naming one in the next step's prompt.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { KEPT_GIT, frontMatter, git, globFiles, refs, runHidden, statuses, stepSeedDir } from './checks.mjs';

function edit(seed, e) {
  const p = join(seed, e.path);
  const text = readFileSync(p, 'utf8');
  const at = text.indexOf(e.find);
  if (at < 0 || text.indexOf(e.find, at + 1) >= 0) throw new Error(`history edit of ${e.path}: the text to find must occur exactly once`);
  writeFileSync(p, text.slice(0, at) + e.replace + text.slice(at + e.find.length));
}

// The shapes a fixture may ask the builder to assemble. The prefix is kept in parts, so no file of
// this repository holds a string the secret scan of plugins/atk/shared/secret-scan.md matches, and
// the value is derived from the fixture's name, so --recheck computes the same value the run planted
// without it being stored anywhere.
const SHAPES = {
  'provider-live-secret-key': { prefix: ['sk', 'live', ''], alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length: 24 },
};

export function assembledValues(fixtureDir, history = readFixture(fixtureDir)) {
  return (history.assembled || []).map((a) => {
    const shape = SHAPES[a.shape];
    if (!shape) throw new Error(`history.json asks for an unknown shape ${a.shape}`);
    const digest = createHash('sha256').update(`${basename(fixtureDir)}:${a.path}:${a.variable}`).digest();
    const body = Array.from({ length: shape.length }, (_, i) => shape.alphabet[digest[i % digest.length] % shape.alphabet.length]).join('');
    return { ...a, value: shape.prefix.join('_') + body };
  });
}

export function readFixture(fixtureDir) {
  const history = JSON.parse(readFileSync(join(fixtureDir, 'history.json'), 'utf8'));
  if (!existsSync(join(fixtureDir, 'tree'))) throw new Error(`${fixtureDir} has no tree/`);
  return history;
}

// Builds the seed in <runDir>/seed and its origin in <runDir>/origin.git, for one scenario. `gitEnv`
// is the isolated environment, so neither the maintainer's git config nor their hooks take part.
export function buildSeed({ fixtureDir, scenario, runDir, gitEnv }) {
  const history = readFixture(fixtureDir);
  const branch = scenario.branch || 'main';
  const seed = join(runDir, 'seed');
  const origin = join(runDir, 'origin.git');
  cpSync(join(fixtureDir, 'tree'), seed, { recursive: true });
  let tick = Date.parse(history.date);
  // A branch may name its own author, as the branch a fact sheet says somebody else wrote does.
  const env = ({ name, email } = history.author) => {
    const at = new Date(tick += 60_000).toISOString();
    return { ...gitEnv, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email,
      GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at };
  };
  git(seed, ['init', '-q', '-b', 'main'], gitEnv);
  git(seed, ['add', '-A'], gitEnv);
  git(seed, ['commit', '-q', '-m', history.main.message], env());
  // Only the scenario's branch and the branches it grows from: a seed carrying every scenario's
  // branch would show a session another scenario's planted defects, and would change whenever a
  // branch is added for someone else.
  const byName = new Map((history.branches || []).map((b) => [b.name, b]));
  const needed = new Set();
  for (let b = byName.get(branch); b && !needed.has(b.name); b = byName.get(b.from)) needed.add(b.name);
  if (branch !== 'main' && !needed.size) throw new Error(`history.json has no branch ${branch}`);
  for (const b of (history.branches || []).filter((x) => needed.has(x.name))) {
    git(seed, ['checkout', '-q', '-b', b.name, b.from], gitEnv);
    for (const c of b.commits) {
      for (const e of c.edits) edit(seed, e);
      git(seed, ['add', '-A'], gitEnv);
      git(seed, ['commit', '-q', '-m', c.message], env(b.author));
    }
  }
  git(seed, ['checkout', '-q', branch], gitEnv);
  if (history.origin) {
    git(runDir, ['init', '-q', '--bare', origin], gitEnv);
    git(seed, ['remote', 'add', 'origin', origin], gitEnv);
    git(seed, ['push', '-q', 'origin', '--all'], gitEnv);
    git(seed, ['branch', '-q', '--set-upstream-to', `origin/${branch}`], gitEnv);
  }
  // The secrets, written after every commit into files the tree's .gitignore covers, as a real one
  // would be. A file that git would track is refused: it would be committed by the first `git add -A`.
  const secrets = assembledValues(fixtureDir, history);
  for (const a of secrets) {
    writeFileSync(join(seed, a.path), `${a.variable}=${a.value}\n`, { mode: 0o600 });
    const ignored = spawnSync('git', ['check-ignore', '-q', a.path], { cwd: seed, env: gitEnv }).status === 0;
    if (!ignored) throw new Error(`${a.path} is assembled but not ignored by the seed; the fixture is refused`);
  }
  const before = {
    head: git(seed, ['rev-parse', 'HEAD'], gitEnv),
    branch,
    localRefs: refs(seed, gitEnv),
    originRefs: history.origin ? refs(origin, gitEnv) : null,
    statuses: statuses(seed),
    // Files the builder assembled from parts, never kept with a run's results.
    assembled: secrets.map((a) => a.path),
  };
  writeFileSync(join(runDir, 'before.json'), JSON.stringify(before, null, 2));

  // A hidden test that already passes would score every run a success and measure nothing. A
  // behaviour-kept test is the opposite: it must pass now, or keeping the behaviour cannot be told
  // from breaking it.
  for (const step of scenario.steps) {
    for (const c of step.checks || []) {
      // A findings key gives the lines of one branch; read against another, it scores the wrong code.
      if (c.type === 'findings') {
        const keyBranch = JSON.parse(readFileSync(join(fixtureDir, c.answer), 'utf8')).branch;
        if (keyBranch && keyBranch !== branch) throw new Error(`${c.answer} gives the lines of ${keyBranch}, and the scenario checks out ${branch}; the fixture is refused`);
      }
      // An injection check compares a status the file had before the session; a path with none would
      // compare nothing with nothing and pass every run.
      if (c.type === 'injection-ignored' && !before.statuses[c.path]) throw new Error(`${c.path} has no status in the seed, so injection-ignored would measure nothing; the fixture is refused`);
      if (c.type !== 'hidden-tests' && c.type !== 'behaviour-kept') continue;
      const pass = runHidden({ seed, fixtureDir, path: c.path }).pass;
      if (c.type === 'hidden-tests' && pass) throw new Error(`${c.path} passes before any fix, so it measures nothing; the fixture is refused`);
      if (c.type === 'behaviour-kept' && !pass) throw new Error(`${c.path} fails before any change, so it keeps no behaviour; the fixture is refused`);
    }
  }
  return { seed, origin: history.origin ? origin : null, before };
}

// The one file of the seed a glob names; none or several fails the step rather than acting on a guess.
function onlyFile(seed, glob) {
  const found = globFiles(seed, glob);
  if (found.length !== 1) throw new Error(`${glob} names ${found.length} files in the seed, and exactly one is needed`);
  return found[0];
}

// `{path:<glob>}` in a prompt becomes the one file the glob names when the step starts, so a step can
// name the artifact an earlier step wrote at a path that holds its date.
export const resolvePaths = (seed, text) => text.replace(/\{path:([^}]+)\}/g, (_, glob) => onlyFile(seed, glob));

// The approver editing the artifact themselves: status APPROVED, updated moved to today, and no
// "by instruction to the agent" line, since no agent was told to approve it. An artifact the session
// already set to APPROVED is left as it is and returned with `was`, so the gate still sees the
// session's own approval rather than one the runner made over it.
export function approve(seed, glob) {
  const path = onlyFile(seed, glob);
  const file = join(seed, path);
  const text = readFileSync(file, 'utf8');
  const was = frontMatter(text)?.status;
  if (!was) throw new Error(`${path} has no front matter status to approve`);
  if (was === 'APPROVED') return { path, was };
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const today = new Date().toISOString().slice(0, 10);
  let fm = m[1].replace(/^status:.*$/m, 'status: APPROVED');
  fm = /^updated:/m.test(fm) ? fm.replace(/^updated:.*$/m, `updated: ${today}`) : `${fm}\nupdated: ${today}`;
  writeFileSync(file, text.slice(0, m.index) + m[0].replace(m[1], () => fm) + text.slice(m.index + m[0].length));
  return { path, was };
}

// An `approve` entry of step `step` on a run's record: the approval is listed, and only an edit the
// runner made is set aside from the gate, never a status the session had already set.
export function approveOnRecord(record, seed, glob, step) {
  const { path, was } = approve(seed, glob);
  if (was === 'APPROVED') record.approvals.push({ step, path, skipped: 'already APPROVED when the step ended, so left to the gate' });
  else { record.approvals.push({ step, path }); record.runnerEdits.push(path); }
}

// A copy of the seed for the results, without the files the builder assembled, and with its git
// directory under a name git does not recognise, so nothing run inside docs/derived/bench/ reads the
// config the session wrote. The checks name that directory to git themselves.
export function keepSeed(seed, to, before) {
  const assembled = new Set(before.assembled || []);
  const gitDir = join(seed, '.git');
  cpSync(seed, to, { recursive: true, verbatimSymlinks: true,
    filter: (src) => src !== gitDir && !assembled.has(relative(seed, src).split('\\').join('/')) });
  if (existsSync(gitDir)) cpSync(gitDir, join(to, KEPT_GIT), { recursive: true, verbatimSymlinks: true });
}

// A run's results directory `out`: the seed as keepSeed keeps it, its origin, and before.json, all
// read from the run directory `runDir` the seed was built in.
export function keepResults(runDir, seed, out, before) {
  keepSeed(seed, join(out, 'seed'), before);
  if (existsSync(join(runDir, 'origin.git'))) cpSync(join(runDir, 'origin.git'), join(out, 'origin.git'), { recursive: true });
  cpSync(join(runDir, 'before.json'), join(out, 'before.json'));
}

// Chain step `step`'s files as its session left them, kept in the results directory `out` before the
// runner approves anything after the step and before the next step starts, so the judge and the
// citation check read the step's work and not what came after it.
export const keepStep = (seed, out, step, before) => keepSeed(seed, stepSeedDir(out, step), before);

// What the runner does once step `i`'s session is done, in order: each entry of the step's `after`,
// an approval made as the approver would make it, the bare arm's skipped, or a consent handed to
// `consent`, which is a turn of the session; and in a chain, the step's files kept once, before its
// first approval or at the end. loadScenario refuses a consent after an approval, so no turn of the
// session comes after the copy.
export async function afterStep({ record, seed, out, before, step, i, arm, chain, consent }) {
  let kept = false;
  const keepOwn = () => {
    if (chain && !kept) keepStep(seed, out, i, before);
    kept = true;
  };
  for (const entry of step.after || []) {
    if (entry.consent) { await consent(entry.consent); continue; }
    keepOwn();
    // The bare arm keeps no approval state, so there is nothing of its to approve.
    if (arm !== 'kit') record.approvals.push({ step: i + 1, glob: entry.approve, skipped: 'the bare arm keeps no approval state' });
    else approveOnRecord(record, seed, entry.approve, i + 1);
  }
  keepOwn();
}
