// atk:security secret shapes: the shapes and the credential-file globs of the secret scan,
// restated for the Node scripts of this skill.
//
// The origin is shared/secret-scan.md of this plugin, the `sh` block under "The scan": its awk
// program for the shapes, its F and T lists for the files rule 9 of shared/team-roles.md keeps
// unread. A script cannot read that file at run time without tying a scan to the layout of a
// Markdown file, so the rules are restated here and held to the origin by tests/verify.sh: the
// shapes by behaviour, one fixture of lines given to the `tree` mode of the `sh` scan and to
// shapesOf() below and every line required to get the same labels; the globs as text, each marked
// array compared with the words of F and T. A change to the origin fails that check until this
// file follows.

// credential-files: begin. The words of F in the origin block, verbatim and in order.
export const CREDENTIAL_FILES = [
  '**/.env', '**/.env.*', '**/*.pem', '**/*.key', '**/*.p12', '**/*.pfx', '**/*.jks', '**/id_rsa',
  '**/id_dsa', '**/id_ecdsa', '**/id_ed25519', '**/.netrc', '**/.pgpass', '**/credentials.json',
  '**/serviceaccount*.json', '**/secrets.json', '**/secrets.yml', '**/secrets.yaml',
  '**/secrets.toml', '**/secrets.ini', '**/secrets.env', '**/secrets.txt', '**/.git-credentials',
  '**/.pypirc', '**/.aws/credentials', '**/.docker/config.json', '**/.kube/config',
  '**/kubeconfig', '**/*.tfstate', '**/*.tfstate.backup',
];
// credential-files: end

// credential-file-templates: begin. The words of T in the origin block, verbatim and in order.
export const CREDENTIAL_FILE_TEMPLATES = [
  '**/.env.example', '**/.env.sample', '**/.env.template', '**/.env.dist', '**/.env.*.example',
  '**/.env.*.sample',
];
// credential-file-templates: end

// A glob of the lists above as git reads it with (glob,icase): `**/` is any directory or none,
// `*` stays inside one path segment, and case is ignored.
// One pattern per list, tested once per path.
function globsToRegExp(globs) {
  const one = (glob) => {
    let src = '';
    for (let i = 0; i < glob.length; i++) {
      if (glob.startsWith('**/', i)) { src += '(?:.*/)?'; i += 2; continue; }
      const c = glob[i];
      src += c === '*' ? '[^/]*' : c === '?' ? '[^/]' : c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    return src;
  };
  return new RegExp('^(?:' + globs.map(one).join('|') + ')$', 'i');
}
const FILE_RE = globsToRegExp(CREDENTIAL_FILES);
const TEMPLATE_RE = globsToRegExp(CREDENTIAL_FILE_TEMPLATES);

export const isTemplate = (path) => TEMPLATE_RE.test(path);
// A file rule 9 names: one of F and not one of T.
export const isCredentialFile = (path) => FILE_RE.test(path) && !isTemplate(path);
// The two lists as git pathspecs, for keeping a file's content out of a diff git prints.
export const EXCLUDE_PATHSPECS = CREDENTIAL_FILES.map((p) => ':(exclude,glob,icase)' + p);
export const TEMPLATE_PATHSPECS = CREDENTIAL_FILE_TEMPLATES.map((p) => ':(glob,icase)' + p);

// The origin's other rules for files it never reads, each held to the block's text by
// tests/verify.sh: a dump is a .sql or .csv over this many bytes; a rename is found when a fifth
// of the file survives it and a copy when it is exact; and the words each is reported with.
export const DUMP_BYTES = 1048576;
export const isDump = (path) => /\.(sql|csv)$/i.test(path);
export const MOVES = { renamed: ['-M20%', '--diff-filter=R'], copied: ['-C100%', '--find-copies-harder', '--diff-filter=C'] };
export const REASON = {
  named: 'a file rule 9 names, not read',
  pub: 'a file beside a .pub of the same name',
  dump: 'a .sql or .csv over a megabyte, ask whether it holds real data',
  renamed: 'renamed from a file rule 9 names, not read',
  copied: 'copied from a file rule 9 names, not read',
};

// The shapes, translated from the awk program. Bracket expressions spell out awk's [:space:]
// rather than using \s, which in JavaScript also matches Unicode spaces awk does not.
const rep = (c, n) => c.repeat(n);
const ci = (s) => s.replace(/[a-z]/g, (c) => '[' + c.toUpperCase() + c + ']');
const SP = ' \\t\\n\\v\\f\\r';
const S = '[' + SP + ']';
const M = ci('redacted');
const K = '(key|token|secret|pass|pwd|credential)';
const W = '[a-z0-9_]*' + K + '[a-z0-9_]*';
const V = '[^\\]' + SP + '"\'`.(){},;<>[]';
const E = '([\\]' + SP + '"\'`)},;<>]|$)';

const SHAPES = [
  ['private key block', '-----BEGIN [A-Z ]*PRIVATE KEY-----', false],
  ['AWS access key', 'AKIA' + rep('[0-9A-Z]', 16), false],
  ['JWT', 'eyJ' + rep('[A-Za-z0-9_-]', 5) + '[A-Za-z0-9_-]*[.]' + rep('[A-Za-z0-9_-]', 5) + '[A-Za-z0-9_-]*[.][A-Za-z0-9_-]', false],
  ['provider key prefix', '(sk_live_|rk_live_|ghp_|gho_|ghs_|github_pat_|xox[abprs]-)[A-Za-z0-9_-]', false],
  ['bearer token', 'authorization["\']?' + S + '*[:=]' + S + '*["\']?bearer' + S + '+[^' + SP + '"\'`$<{]', true],
  ['connection string with a password',
    '((mongodb|postgres|postgresql|mysql|redis|amqp)://[^ ]*:[^ @$<{%][^ @]*|[a-z][a-z0-9+.-]*://([^\\]' + SP + '/:@"\'`%][^\\]' + SP + '/:@"\'`]*)?:[^\\]' + SP + '/@$<{"\'`%][^\\]' + SP + '/@"\'`]*)@', true],
  ['npm registry login', '(^|[^a-z0-9_])_auth["\']?' + S + '*[:=]' + S + '*["\']?[^' + SP + '"\'`$<{]', true],
  ['secret-named assignment', '(^|[^a-z0-9_-])(export' + S + '+)?' + W + '=([^' + SP + '="\'{(`$<0-9]|[0-9]+[^0-9' + SP + '`"\',;)])', true],
  ['secret-named literal', '(^|[^a-z0-9_.-])[a-z0-9_.-]*' + K + '[a-z0-9_.-]*["\']?' + S + '*[:=]' + S + '*(["\']' + rep('[^"\']', 6) + '[^"\']*["\']|' + rep(V, 8) + V + '*' + E + ')', true],
].map(([label, src, lower]) => ({ label, re: new RegExp(src), lower }));

const ENUM = new RegExp('[A-Za-z0-9_.-]*' + ci(K) + '[A-Za-z0-9_.-]*["\']?' + S + '*[:=]' + S + '*["\']?(' + ci('true') + '|' + ci('false') + '|[0-9]+|[a-z][a-z][a-z]' + rep('[a-z]?', 7) + ')["\']?([' + SP + '"\'`,;)}]|$)', 'g');
const MASKED = [
  new RegExp('[A-Za-z0-9_.-]*["\']?[ \\t]*[:=][ \\t]*["\'`]?<' + M + '[^>]*>["\'`]?', 'g'),
  new RegExp(ci('bearer') + '[ \\t]+<' + M + '[^>]*>', 'g'),
  new RegExp('<' + M + '[^>]*>', 'g'),
];
// awk's tolower changes ASCII letters alone; toLowerCase would change others too.
const asciiLower = (s) => (/^[\x00-\x7f]*$/.test(s) ? s.toLowerCase() : s.replace(/[A-Z]/g, (c) => c.toLowerCase()));

// The labels of every shape one line matches, joined as the `sh` scan prints them, or ''.
// A masked value is taken out first, key and quotes with it, and a value an enum holds is kept
// out of the shapes that decide by name, as the origin does. Every masked pattern needs a `<` and
// the enum pattern a `:` or `=`, so a line without them skips that work, the hot path of a history.
// A line holding a character outside ASCII is matched as its UTF-8 bytes, one character each, since
// the origin runs its awk under LC_ALL=C and counts lengths in bytes on every awk.
export function shapesOf(line) {
  let s = /[^\x00-\x7f]/.test(line) ? Buffer.from(line, 'utf8').toString('latin1') : line;
  if (s.includes('<')) for (const re of MASKED) s = s.replace(re, '');
  const x = asciiLower(/[:=]/.test(s) ? s.replace(ENUM, '\t') : s);
  return SHAPES.filter((sh) => sh.re.test(sh.lower ? x : s)).map((sh) => sh.label).join(', ');
}

// The lines that bound a private key, and the complete blocks of one file's text: a BEGIN line, the
// lines after it, and the first END line before another BEGIN. The history scan reads a key from the
// whole file rather than from a diff, since a diff shows only the lines that changed and a key whose
// body alone was replaced shows no BEGIN line. A BEGIN line in no complete block, a sentence naming
// the marker, is a line like any other.
export const BLOCK_BEGIN = SHAPES[0].re;
export const BLOCK_END = new RegExp('-----END [A-Z ]*PRIVATE KEY-----');
export function keyBlocks(text) {
  const lines = text.split('\n'); const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!BLOCK_BEGIN.test(lines[i]) || BLOCK_END.test(lines[i])) continue;
    for (let j = i + 1; j < lines.length && !BLOCK_BEGIN.test(lines[j]); j++) {
      if (BLOCK_END.test(lines[j])) { blocks.push({ line: i + 1, lines: lines.slice(i, j + 1) }); i = j; break; }
    }
  }
  return blocks;
}
