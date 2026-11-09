// atk:security host-classes: which emails and hosts the history scan reports under --identities, and
// the redacted form each is printed in, for a repository about to be handed to a client.
//
// The design is fork 2 of
// https://github.com/lamngockhuong/aiteamkit/blob/main/docs/records/design/261108-2243-security-scripts.md.
// A host is reported when it ends in a domain the owner confirmed, matched label by label so that
// `evil-corp.com` is not `corp.com`; when it is a private address, 10.0.0.0/8, 172.16.0.0/12,
// 192.168.0.0/16 or fc00::/7; when it is a loopback name other than `localhost`; or when it ends in
// .internal, .local, .corp or .lan. An email is reported when its domain is such a host. `localhost`,
// 127.0.0.1 and public addresses name no host of the company and are left alone.
//
// What leaves this module for standard output is `shown`: an email as `<redacted: email>@<domain>`,
// a host as `<redacted: host>.<domain>` under a confirmed domain, or as `<redacted: host>` beside its
// class otherwise; never a local part and never a host in full. `full` is kept for the --detail file
// alone, and the scan deletes it from every hit before it prints.

const CLASS = { domain: 'confirmed domain', private: 'private address', suffix: 'internal suffix', loopback: 'loopback name' };
const SUFFIX = /\.(?:internal|local|corp|lan)$/;
const LOOPBACK = /^(?:ip6-localhost|ip6-loopback|localhost\.localdomain|.+\.localhost)$/;
const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?';
const DOMAIN = new RegExp('^' + LABEL + '(?:\\.' + LABEL + ')*$');
const END = '(?![A-Za-z0-9_-]|\\.[A-Za-z0-9])';
// a local part may hold any letter, so `josé@` hides neither the address nor its host
const LOCAL = "[\\p{L}\\p{M}\\p{N}._%+'-]";
const EMAIL = new RegExp('(?<!' + LOCAL + ')' + LOCAL + '+@' + LABEL + '(?:\\.' + LABEL + ')+' + END, 'gu');
const NAME = new RegExp('(?<![A-Za-z0-9.@_-])(?:ip6-localhost|ip6-loopback|' + LABEL + '(?:\\.' + LABEL + ')+)' + END, 'gi');
const V6 = /(?<![0-9A-Za-z:.])[fF][cCdD][0-9a-fA-F]{0,2}(?::[0-9a-fA-F]{0,4}){1,7}(?![0-9A-Za-z:.])/g;
// A login is taken out before any address is read, so a password is never read as a local part and
// the host behind it is a host: in a URL up to the last `@` of its authority, as in
// `scheme://<user>:<password>@<host>`; with no scheme, as in a DSN `<user>:<password>@<host>`; and
// the user of an scp address, `git@host:path`, which is rewritten as a URL so it stands as one.
const USERINFO = /([a-z][a-z0-9+.-]*:\/\/)[^\s/?#]*@/gi;
const DSN = /(^|[\s"'`=(,[])(?!mailto:)[\w.%+-]+:[^\s@/:]*@(?=[A-Za-z0-9[])/gi;
const SCP = /(^|[\s"'`=(,[])[\w.-]+@(?=[\w.-]+:(?!\/\/|\d+(?:\D|$))[\w.~-]*\/)/g;
const MACHINE = /\.(?:localdomain|home|test|example|invalid|intranet|private|arpa)$/;

// The confirmed domains of --internal, lowercased, longest first so the narrowest one names a host;
// null when one of them is not a domain of two labels or more, or is an address.
export function parseDomains(list) {
  const ds = list.split(',').map((d) => d.trim().toLowerCase().replace(/\.$/, ''));
  const ok = (d) => DOMAIN.test(d) && d.includes('.') && !/^[\d.]+$/.test(d);
  return ds.every(ok) ? [...new Set(ds)].sort((a, b) => b.length - a.length) : null;
}

function privateV4(h) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return null;
  const n = m.slice(1).map(Number);
  if (n.some((x) => x > 255)) return false;
  const [a, b] = n;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function privateV6(h) {
  const halves = h.split('::');
  if (halves.length > 2) return false;
  const groups = halves.map((x) => (x ? x.split(':') : []));
  const n = groups.flat().length;
  if ((halves.length === 1 ? n !== 8 : n > 7) || !groups.flat().every((g) => /^[0-9a-f]{1,4}$/.test(g))) return false;
  return groups[0].length > 0 && (parseInt(groups[0][0], 16) & 0xfe00) === 0xfc00;
}

// Why a host is reported, or null when it is not: { cls, domain, sub } with the confirmed domain it
// ends in and whether it is longer than that domain. An address literal, `[10.1.2.3]`, is read bare.
function hostClass(host, domains) {
  const h = host.toLowerCase().replace(/\.$/, '').replace(/^\[(?:ipv6:)?(.*)\]$/, '$1');
  if (h.includes(':')) return privateV6(h) ? { cls: CLASS.private } : null;
  const v4 = privateV4(h);
  if (v4 !== null) return v4 ? { cls: CLASS.private } : null;
  const d = domains.find((x) => h === x || h.endsWith('.' + x));
  if (d) return { cls: CLASS.domain, domain: d, sub: h !== d };
  if (LOOPBACK.test(h)) return { cls: CLASS.loopback };
  return SUFFIX.test(h) ? { cls: CLASS.suffix } : null;
}
const hostShown = (c) => (c.cls === CLASS.domain ? (c.sub ? '<redacted: host>.' : '') + c.domain : '<redacted: host>');

// An address as a hit, or null when its domain is no host this module reports.
export function emailHit(addr, domains) {
  const at = addr.lastIndexOf('@');
  const c = at > 0 ? hostClass(addr.slice(at + 1), domains) : null;
  return c && { kind: 'email', class: c.cls, shown: '<redacted: email>@' + hostShown(c), full: addr.toLowerCase() };
}

// What --domains prints for the domain of an address or a remote: an address, a private, loopback,
// internal-suffix or machine host, a name that is no domain, or one with no dot, by its class alone;
// any other folded to the part a company registers, the last two labels or three under a two-letter
// country code such as `co.jp`, so a machine or a host is never named.
export function proposable(d) {
  const h = d.toLowerCase().replace(/\.$/, '').replace(/^\[(?:ipv6:)?(.*)\]$/, '$1');
  if (h.includes(':') || /^[\d.]+$/.test(h)) return '<redacted: host> (address)';
  const c = hostClass(h, []);
  if (c) return '<redacted: host> (' + c.cls + ')';
  if (!DOMAIN.test(h)) return '<redacted: host> (not a domain)';
  if (!h.includes('.')) return '<redacted: host> (no dot)';
  if (MACHINE.test(h)) return '<redacted: host> (machine name)';
  const l = h.split('.');
  const keep = l.length > 2 && l.at(-1).length === 2 && /^(?:co|com|ac|ne|or|go|net|org|edu|gov)$/.test(l.at(-2)) ? 3 : 2;
  return l.slice(-keep).join('.');
}

// A name that ends in a suffix, or a loopback name, is reported from a line only where it stands as a
// host: after `://`; quoted, or as an element's text, with only a port or a path after it; as a value
// after `=` with no space, followed by a space, a comma or nothing; as a value after `=` or `:` and a
// space, with nothing after it but a port or a comment; as a list item, or in a list after a comma or
// an opening bracket; or as a directive's argument after a word, followed by anything but a call.
// Never after `import`, `from`, `return` and the like, so `obj.local;`, `if (cfg.internal)`,
// `from settings.local import` and `return obj.local` are not hosts.
const KEYWORD = /(?:^|[^\w.])(?:import|from|return|await|yield|new|typeof|delete|throw|in|of|as|is|not|and|or)\s*$/;
function standsAsHost(line, i, end) {
  const before = line.slice(Math.max(0, i - 300), i); const after = line.slice(end);
  if (/:\/\/$/.test(before)) return true;
  if (/["'`>]$/.test(before)) return /^(?::\d{1,5})?[/"'`<]/.test(after);
  if (KEYWORD.test(before) || /^(?::\d{1,5})?\s*\(/.test(after)) return false;
  const b = before.replace(/\s+$/, ''); const c = b.slice(-1); const spaced = b.length < before.length;
  if (c === '=' && !spaced) return /^(?::\d{1,5})?(?:[\s,;]|$)/.test(after);
  if (c === '' || c === '=' || c === ':' || /^\s*[-*+]$/.test(b)) return /^(?::\d{1,5})?\s*(?:#.*)?$/.test(after);
  if (c === ',' || (c === '[' && /(?:^|[\s:=])\[$/.test(b))) return /^(?::\d{1,5})?\s*(?:[,\]]|#.*$|$)/.test(after);
  return spaced && /\w/.test(c);
}

// Every host hostClass() reports, and so every email domain, holds one of these, so a line holding
// none is passed over before any name in it is parsed: most lines of code, on the hot path of a
// history. Built once per list of confirmed domains.
let gate = null;
function gateFor(domains) {
  if (gate?.domains !== domains) {
    const parts = ['\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', 'f[cd][0-9a-f]{0,2}:', 'localhost', 'ip6-', '\\.(?:internal|local|corp|lan)'];
    gate = { domains, re: new RegExp([...parts, ...domains.map((d) => d.replace(/\./g, '\\.'))].join('|'), 'i') };
  }
  return gate.re;
}

// The emails and hosts one line holds, each as a hit without its place.
export function contentHits(line, domains) {
  const out = [];
  if (!gateFor(domains).test(line)) return out;
  let rest = line.includes('@') ? line.replace(USERINFO, '$1').replace(DSN, '$1').replace(SCP, '$1ssh://') : line;
  // each email is blanked once read, so its local part is not taken for a host
  if (rest.includes('@')) rest = rest.replace(EMAIL, (m) => { const h = emailHit(m, domains); if (h) out.push(h); return ' '.repeat(m.length); });
  for (const re of [NAME, V6]) {
    for (const m of rest.matchAll(re)) {
      const c = hostClass(m[0], domains);
      if (!c || ((c.cls === CLASS.suffix || c.cls === CLASS.loopback) && !standsAsHost(rest, m.index, m.index + m[0].length))) continue;
      out.push({ kind: 'host', class: c.cls, shown: hostShown(c), full: m[0].toLowerCase() });
    }
  }
  return out;
}

// A path or a ref name, redacted, and the hosts and emails it names as hits. Every local part is
// redacted, whatever its domain; a name in a confirmed domain, wherever it sits in a segment,
// `db01.<domain>.tar.gz` and `fix-db01.<domain>-timeout` among them, and a private address are
// redacted and reported; a name ending in a suffix or `localhost` is redacted and not reported, since
// `settings.local.py` names a file more often than a host. Matching ignores case.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function pathHosts(path, domains) {
  const hits = [];
  const add = (h) => { if (!hits.some((x) => x.kind === h.kind && x.full === h.full)) hits.push(h); };
  let shown = path.replace(new RegExp('(' + LOCAL + '+)@([A-Za-z0-9.-]*)', 'gu'), (m, local, rest) => {
    const l = rest.split('.');
    for (let n = l.length; n >= 2; n--) {
      const host = l.slice(0, n).join('.'); const c = hostClass(host, domains);
      if (c && (c.cls === CLASS.domain || c.cls === CLASS.private)) { add({ kind: 'email', class: c.cls, shown: '<redacted: email>@' + hostShown(c), full: (local + '@' + host).toLowerCase() }); break; }
    }
    return '<redacted: email>@' + rest;
  });
  for (const d of domains) {
    shown = shown.replace(new RegExp('(?<![A-Za-z0-9.-])(?:[A-Za-z0-9-]+\\.)*' + esc(d) + '(?![A-Za-z0-9])', 'gi'), (h, at, s) => {
      const c = { cls: CLASS.domain, domain: d, sub: h.toLowerCase() !== d };
      // the domain of an address was reported with the address
      if (s[at - 1] !== '@') add({ kind: 'host', class: c.cls, shown: hostShown(c), full: h.toLowerCase() });
      return hostShown(c);
    });
  }
  shown = shown.replace(/(?<![\d.])\d{1,3}(?:\.\d{1,3}){3}(?![\d])/g, (h) => {
    if (!privateV4(h)) return h;
    add({ kind: 'host', class: CLASS.private, shown: '<redacted: host>', full: h });
    return '<redacted: host>';
  });
  shown = shown.replace(/(?<![A-Za-z0-9.-])(?:ip6-(?:localhost|loopback)|(?:[A-Za-z0-9-]+\.)+(?:internal|local|corp|lan|localhost))(?![A-Za-z0-9])/gi, '<redacted: host>');
  return { hits, shown };
}
