// The seed: a fresh git repository built per run from a fixture's tree/ and history.json, with a
// bare repository as its origin. Nothing from hidden/ is copied in. Before any session, it records
// what the gate checks compare against in before.json.

import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { git, refs, runHidden } from './checks.mjs';

// The front matter status of every Markdown file in the tree, so a status a session moved can be told
// from one the runner set.
export function statuses(dir) {
  const out = {};
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name === '.git' || name === 'node_modules') continue;
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.md')) {
        const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(p, 'utf8'));
        const s = m && /^status:\s*(.+)$/m.exec(m[1]);
        if (s) out[relative(dir, p).split(sep).join('/')] = s[1].trim();
      }
    }
  };
  walk(dir);
  return out;
}

function edit(seed, e) {
  const p = join(seed, e.path);
  const text = readFileSync(p, 'utf8');
  const at = text.indexOf(e.find);
  if (at < 0 || text.indexOf(e.find, at + 1) >= 0) throw new Error(`history edit of ${e.path}: the text to find must occur exactly once`);
  writeFileSync(p, text.slice(0, at) + e.replace + text.slice(at + e.find.length));
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
  const { name, email } = history.author;
  let tick = Date.parse(history.date);
  const env = () => {
    const at = new Date(tick += 60_000).toISOString();
    return { ...gitEnv, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email,
      GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at };
  };
  git(seed, ['init', '-q', '-b', 'main'], gitEnv);
  git(seed, ['add', '-A'], gitEnv);
  git(seed, ['commit', '-q', '-m', history.main.message], env());
  for (const b of history.branches || []) {
    git(seed, ['checkout', '-q', '-b', b.name, b.from], gitEnv);
    for (const c of b.commits) {
      for (const e of c.edits) edit(seed, e);
      git(seed, ['add', '-A'], gitEnv);
      git(seed, ['commit', '-q', '-m', c.message], env());
    }
  }
  git(seed, ['checkout', '-q', branch], gitEnv);
  if (history.origin) {
    git(runDir, ['init', '-q', '--bare', origin], gitEnv);
    git(seed, ['remote', 'add', 'origin', origin], gitEnv);
    git(seed, ['push', '-q', 'origin', '--all'], gitEnv);
    git(seed, ['branch', '-q', '--set-upstream-to', `origin/${branch}`], gitEnv);
  }
  const before = {
    head: git(seed, ['rev-parse', 'HEAD'], gitEnv),
    branch,
    localRefs: refs(seed, gitEnv),
    originRefs: history.origin ? refs(origin, gitEnv) : null,
    statuses: statuses(seed),
    // Files the builder assembled from parts, never kept with a run's results.
    assembled: [],
  };
  writeFileSync(join(runDir, 'before.json'), JSON.stringify(before, null, 2));

  // A hidden test that already passes would score every run a success and measure nothing.
  for (const step of scenario.steps) {
    for (const c of step.checks || []) {
      if (c.type !== 'hidden-tests') continue;
      if (runHidden({ seed, fixtureDir, path: c.path, scratch: join(runDir, 'probe') }).pass) {
        throw new Error(`${c.path} passes before any fix, so it measures nothing; the fixture is refused`);
      }
    }
  }
  return { seed, origin: history.origin ? origin : null, before };
}
