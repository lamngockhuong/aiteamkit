// atk:security line-login-removal: a line of history with every login taken out, before
// ./host-classes.mjs reads an address in it, so a password is never read as a local part and the
// host behind it is a host: in a URL, as in `scheme://<user>:<password>@<host>`; with no scheme, as
// in a DSN `<user>:<password>@<host>`; and the user of an scp address, `git@host:path`, which is
// rewritten as a URL so it stands as one.
//
// A password runs to the `@` that a host follows, then a port, a path or the end, so a raw `/`, `?`,
// `#` or `@` in it goes with it; a login stops at a quote, an angle bracket or a backtick, which no
// URL authority holds, so a URL and an address after it in JSON stay apart. A URL's
// `<host>:<digits>/` is a port, never a password, so `/@scope` stays a path; a user that is itself an
// address, `<local>@<domain>:<password>@`, keeps its `@`. A key whose value is an address, `sip:` or
// `email:` among them, is no login.

const STOP = '\\s"\'<>`';
const AT = '@(?![A-Za-z0-9.-]+(?::\\d+)?(?:[/?#,;)\\]}]|$))';
const USER = '(?:[^' + STOP + '/?#@:]|@(?=[^' + STOP + '/?#@:]+:))*';
const USERINFO = new RegExp('([a-z][a-z0-9+.-]*:\\/\\/)(?:' + USER + ':(?!\\d+[/?#])(?:[^' + STOP + '@]|' + AT + ')*|[^' + STOP + '/?#@]*)@', 'gi');
const DSN = new RegExp('(^|[\\s"\'`=(,[])(?!(?:mailto|sips?|tel|xmpp|e-?mail|mail|from|to|cc|bcc|reply-to|author|contact):)[\\w.%+-]+:(?:[^'
  + STOP + '@/:]|' + AT + ')*@(?=[A-Za-z0-9[])', 'gi');
const SCP = /(^|[\s"'`=(,[])[\w.-]+@(?=[\w.-]+:(?!\/\/|\d+(?:\D|$))[\w.~-]*\/)/g;

export const withoutLogins = (line) => line.replace(USERINFO, '$1').replace(DSN, '$1').replace(SCP, '$1ssh://');
