// atk:security history-scan-options: the arguments history-scan.mjs takes, read and checked before
// git is started, so a wrong one exits 2 with nothing walked and nothing written.
//
// --max-seconds <n>   stop the walk after n seconds, at most 2147483, the longest delay a Node timer
//                     holds, and exit 3.
// --domains           read only the identities and the remotes, and print the domains they use, which
//                     the skill proposes to the owner as the internal ones before --identities runs.
//                     No content and no secret is read, and the output says so in `not_scanned`.
// --identities        report staff emails and internal hosts as well, per ./identity-hosts.mjs.
// --internal <list>   the domains the owner confirmed, comma-separated; needs --identities.
// --detail <path>     where the full emails and hosts go, a file the script writes and the session never
//                     reads; needs --identities, and is checked by ./identity-hosts.mjs before the walk.

import { parseDomains } from './host-classes.mjs';

const USAGE = 'takes --max-seconds <n> (at most 2147483), --domains, or --identities with --internal <domain>[,<domain>] and --detail <path>';

// The options, or a throw with the line history-scan.mjs prints before it exits 2.
export function readOptions(argv) {
  const o = { maxSeconds: null, domains: false, identities: false, internal: [], detail: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]; const v = argv[i + 1]; let ds = null;
    const value = v !== undefined && v !== '' && !v.startsWith('--');
    if (a === '--max-seconds' && /^[1-9][0-9]{0,6}$/.test(v || '') && Number(v) <= 2147483) { o.maxSeconds = Number(v); i++; }
    else if (a === '--domains') o.domains = true;
    else if (a === '--identities') o.identities = true;
    else if (a === '--internal' && value && (ds = parseDomains(v))) { o.internal = ds; i++; }
    else if (a === '--detail' && value) { o.detail = v; i++; }
    // a value with no flag before it may be an address, so only a flag is echoed back
    else throw new Error((a.startsWith('--') ? 'unknown or incomplete argument ' + JSON.stringify(a) : 'a value with no flag before it') + '; ' + USAGE);
  }
  if (o.domains && (o.identities || o.internal.length || o.detail)) throw new Error('--domains reads identities only and takes none of --identities, --internal, --detail');
  if (!o.identities && (o.internal.length || o.detail)) throw new Error('--internal and --detail need --identities');
  return o;
}
