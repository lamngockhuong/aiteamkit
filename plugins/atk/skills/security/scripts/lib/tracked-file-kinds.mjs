// atk:security tracked-file-kinds: which tracked files the supply-chain scan reads, which it only
// looks for, and which it names under `not_scanned` because they belong to an ecosystem or a CI
// system it does not read, so nothing in scope is passed over in silence. The one place the scan's
// file names are kept. The design is fork 3 of
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md.

import { posix } from 'node:path';
import { isCredentialFile } from './secret-shapes.mjs';

export const isWorkflow = (p) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p);
export const isAction = (p) => /^(?:.*\/)?action\.ya?ml$/.test(p) && !isWorkflow(p);
export const isRequirements = (p) => /^requirements[^/]*\.txt$/i.test(posix.basename(p)) || /(^|\/)requirements\/[^/]+\.txt$/i.test(p);
const NODE_MODULES = /(^|\/)node_modules\/.*$/;

// The lockfiles a manifest is checked against. The two JSON ones are read for install scripts; the
// others record none and are never opened, so each is named under `not_scanned` for that.
export const NPM_LOCKS = ['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb'];
export const PY_LOCKS = ['poetry.lock', 'uv.lock', 'pdm.lock', 'Pipfile.lock'];
const READ = new Set(['package.json', 'package-lock.json', 'npm-shrinkwrap.json', '.npmrc', 'pip.conf', 'pip.ini', 'pyproject.toml']);
const NO_INSTALL_SCRIPTS = new Set(NPM_LOCKS.filter((n) => !READ.has(n)));

const OTHER = [
  [/^Gemfile(\.lock)?$/, 'Ruby (Bundler)'], [/^go\.(mod|sum|work)$/, 'Go modules'], [/^Cargo\.(toml|lock)$/, 'Rust (Cargo)'],
  [/^composer\.(json|lock)$/, 'PHP (Composer)'], [/^pom\.xml$/, 'Java (Maven)'],
  [/^(build|settings)\.gradle(\.kts)?$|^gradle\.lockfile$/, 'Java or Kotlin (Gradle)'],
  [/\.(cs|fs|vb)proj$|^packages\.(config|lock\.json)$|^Directory\.Packages\.props$/, '.NET (NuGet)'],
  [/^Package\.(swift|resolved)$/, 'Swift Package Manager'], [/^Podfile(\.lock)?$/, 'CocoaPods'],
  [/^pubspec\.(yaml|lock)$/, 'Dart (pub)'], [/^mix\.(exs|lock)$/, 'Elixir (Mix)'], [/^deno\.(json|jsonc|lock)$/, 'Deno'],
  [/^Pipfile$/, 'Python (Pipfile)'], [/^setup\.(py|cfg)$/, 'Python (setup.py or setup.cfg)'],
  [/^environment\.ya?ml$/, 'Python (conda environment)'], [/^\.yarnrc\.yml$/, 'Yarn registry settings (.yarnrc.yml)'],
  [/^Dockerfile(\..+)?$|\.dockerfile$/i, 'container images (Dockerfile)'],
  [/^\.gitlab-ci\.ya?ml$/, 'GitLab CI'], [/^Jenkinsfile$/, 'Jenkins'], [/^azure-pipelines\.ya?ml$/, 'Azure Pipelines'],
  [/^bitbucket-pipelines\.ya?ml$/, 'Bitbucket Pipelines'], [/^\.travis\.ya?ml$/, 'Travis CI'], [/^\.drone\.ya?ml$/, 'Drone'],
];
const OTHER_DIRS = [[/^\.circleci\//, 'CircleCI'], [/^\.buildkite\//, 'Buildkite']];

// One tracked path: { read: true }, { name, at } for a `not_scanned` entry at that path, or null
// when it is none of the scan's. A file the scan would read is named instead, never opened, where
// rule 9 of shared/team-roles.md names it or it is a symbolic link, whose blob is its target's path.
export function kindOf(path, mode) {
  if (mode === '160000') return { name: 'git submodule', at: path };
  if (NODE_MODULES.test(path)) return { name: 'tracked node_modules', at: path.replace(NODE_MODULES, '$1node_modules') };
  const base = posix.basename(path);
  if (isWorkflow(path) || isAction(path) || READ.has(base) || isRequirements(path)) {
    if (isCredentialFile(path)) return { name: 'a file rule 9 names, not opened', at: path };
    return mode === '120000' ? { name: 'a symbolic link, not followed', at: path } : { read: true };
  }
  if (NO_INSTALL_SCRIPTS.has(base)) return { name: 'install scripts in ' + base, at: path };
  for (const [re, name] of OTHER_DIRS) if (re.test(path)) return { name, at: path };
  for (const [re, name] of OTHER) if (re.test(base)) return { name, at: path };
  return null;
}
