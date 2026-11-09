// atk:security workflow-candidates: the GitHub Actions rows of the supply-chain scan, read from the
// tree ./line-yaml.mjs gives back. Each candidate names its rule, path and line, and what it names
// from the file is an action's name and ref, never a line. The design is fork 3 of
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md.
//
// Rules: action-not-pinned, pull-request-target, pull-request-target-checks-out-head, event-in-run,
// secrets-inherit, no-permissions. What a workflow is granted in the repository's settings, a
// self-hosted runner, and a secret an organisation shares are not in the file, and are the triage
// reference's to ask about.

const get = (node, key) => (node?.kind === 'map' ? node.entries.get(key) : undefined);
const items = (node) => (node?.kind === 'seq' ? node.items : []);
const entries = (node) => (node?.kind === 'map' ? [...node.entries] : []);
const EVENT = /\$\{\{\s*github\s*\.\s*(event\s*\.|head_ref\b)/;
// The pull request's code: its head, its merge commit, or a `pull/<n>/head|merge` ref fetched by hand.
const HEAD_REF = /github\s*\.\s*(event\s*\.\s*pull_request\s*\.\s*(head|merge_commit_sha)|head_ref)\b|refs\/pull\/|(^|[\s:'"])pull\/(\$\{\{[^}]*\}\}|[^\s/])+\/(head|merge)\b/;

// An action reference not pinned to a commit: a 40-hex ref for a repository action, a sha256 digest
// for a container image; a local path is part of the repository and pinned with it.
function unpinned(uses) {
  if (uses.startsWith('./') || uses.startsWith('.\\')) return null;
  if (uses.startsWith('docker://')) {
    if (/@sha256:[0-9a-f]{64}$/.test(uses)) return null;
    // An unpinned image holds no `@` but a login's, which may itself hold `/` or `@`: keep what follows the last.
    const image = uses.slice(9);
    return { action: 'docker://' + image.slice(image.lastIndexOf('@') + 1), ref: null };
  }
  const at = uses.lastIndexOf('@');
  const action = at < 0 ? uses : uses.slice(0, at); const ref = at < 0 ? null : uses.slice(at + 1);
  return ref && /^[0-9a-f]{40}$/.test(ref) ? null : { action, ref };
}

// An action-not-pinned candidate for a `uses:` value, when it is one.
function pin(uses, path, add) {
  const u = uses?.kind === 'scalar' ? unpinned(uses.text) : null;
  if (u) add({ rule: 'action-not-pinned', path, line: uses.line, ...u });
}

// The candidates of every step list in a job or a composite action.
function stepCandidates(steps, path, add, prTarget) {
  for (const step of items(steps)) {
    const uses = get(step, 'uses');
    pin(uses, path, add);
    if (uses?.kind === 'scalar') {
      const ref = get(get(step, 'with'), 'ref');
      if (prTarget && /^actions\/checkout@/.test(uses.text) && ref?.kind === 'scalar' && HEAD_REF.test(ref.text)) {
        add({ rule: 'pull-request-target-checks-out-head', path, line: ref.line });
      }
    }
    const run = get(step, 'run');
    if (run?.kind !== 'scalar') continue;
    for (const l of run.lines) if (EVENT.test(l.text)) add({ rule: 'event-in-run', path, line: l.n });
    if (prTarget) {
      const hit = run.lines.find((l) => /\bgh\s+pr\s+checkout\b/.test(l.text) || (/\bgit\b/.test(l.text) && HEAD_REF.test(l.text)));
      if (hit) add({ rule: 'pull-request-target-checks-out-head', path, line: hit.n });
    }
  }
}

// The events a workflow runs on, each with the line it is named on.
function events(on) {
  if (on?.kind === 'scalar') return [{ name: on.text, line: on.line }];
  if (on?.kind === 'seq') return on.items.filter((i) => i.kind === 'scalar').map((i) => ({ name: i.text, line: i.line }));
  if (on?.kind === 'map') return [...on.entries.keys()].map((k) => ({ name: k, line: on.keyLines.get(k) }));
  return [];
}

// The candidates of a workflow, handed to `add`; `root` is the mapping line-yaml.mjs read.
export function workflowCandidates(root, path, add) {
  const prt = events(root.entries.get('on')).find((e) => e.name === 'pull_request_target');
  if (prt) add({ rule: 'pull-request-target', path, line: prt.line });
  const jobs = get(root, 'jobs'); const topPermissions = root.entries.has('permissions');
  for (const [name, job] of entries(jobs)) {
    if (!topPermissions && !(job.kind === 'map' && job.entries.has('permissions'))) add({ rule: 'no-permissions', path, line: jobs.keyLines.get(name), job: name });
    pin(get(job, 'uses'), path, add); // a reusable workflow
    const secrets = get(job, 'secrets');
    if (secrets?.kind === 'scalar' && secrets.text === 'inherit') add({ rule: 'secrets-inherit', path, line: secrets.line, job: name });
    stepCandidates(get(job, 'steps'), path, add, !!prt);
  }
}

// A local action.yml: only a composite one runs steps of its own.
export function actionCandidates(root, path, add) {
  const runs = get(root, 'runs');
  if (get(runs, 'using')?.text === 'composite') stepCandidates(get(runs, 'steps'), path, add, false);
}
