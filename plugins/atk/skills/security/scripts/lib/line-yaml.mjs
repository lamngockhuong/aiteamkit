// atk:security line-yaml: the small YAML reader the supply-chain scan reads CI workflows with, so the
// skill adds no dependency. It covers the shapes a workflow is written in: block mappings and
// sequences, a sequence at its key's indent, plain and quoted scalars on one line, a plain scalar
// continued on deeper lines, block scalars (`run: |`), and a flow collection closed on its own line
// (`on: [push, pull_request]`, `- { uses: a/b@v1 }`).
//
// Anything else, an anchor, an alias, a merge key, a tag, a tab in the indentation, a quoted or flow
// value that runs past its line, a second document, throws an Unreadable naming the line, and the
// scan reports the file as not read rather than guessing at what it says.
//
// A node is { kind: 'map', line, entries: Map<key, node>, keyLines: Map<key, line> },
// { kind: 'seq', line, items: [node] }, or { kind: 'scalar', line, text, lines: [{ n, text }] },
// `lines` holding each source line of the value so a rule can name the exact line it matched.

export class Unreadable extends Error {
  constructor(why, line) { super(`${why} at line ${line}`); this.line = line; }
}

const KEY = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s'"#{}[\],&*!|>%@`-][^#]*?|-[^\s#][^#]*?)\s*:(?:\s+(.*)|$)/;
const BLOCK = /^[|>][1-9+-]{0,2}$/;

// The line without a comment: a `#` at its start or after a space, outside quotes.
function stripComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q && !(q === '"' && s[i - 1] === '\\')) q = null; continue; }
    if (c === '"' || c === "'") { if (i === 0 || /[\s:[{,-]/.test(s[i - 1])) q = c; continue; }
    if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i).trimEnd();
  }
  return s.trimEnd();
}

// A quoted scalar's text; a double-quoted escape JSON does not share, `\x41` among them, is not read.
function unquote(k, n) {
  if (k.startsWith("'")) return k.slice(1, -1).replace(/''/g, "'");
  if (!k.startsWith('"')) return k;
  try { return JSON.parse(k); } catch { throw new Unreadable('an escape in a quoted value', n); }
}
const scalarNode = (n, text) => ({ kind: 'scalar', line: n, text, lines: [{ n, text }] });
const isItem = (s) => s === '-' || s.startsWith('- ');
const indentOf = (s) => s.match(/^ */)[0].length;
function noAnchor(s, n) { if (/^[&*!]/.test(s)) throw new Unreadable('an anchor, alias or tag', n); }

// A flow collection written on one line, read into nodes that all carry that line.
function parseFlow(src, n) {
  let i = 0;
  const ws = () => { while (/\s/.test(src[i] || '')) i++; };
  const scalar = (stop) => {
    ws();
    if (src[i] === '"' || src[i] === "'") {
      const q = src[i]; let j = i + 1;
      while (j < src.length && !(src[j] === q && (q === "'" ? src[j + 1] !== "'" : src[j - 1] !== '\\'))) j += q === "'" && src[j] === "'" ? 2 : 1;
      if (j >= src.length) throw new Unreadable('a quoted value runs past its line', n);
      const t = unquote(src.slice(i, j + 1), n); i = j + 1; return t;
    }
    let j = i;
    while (j < src.length && !stop.includes(src[j]) && !(src[j] === ':' && /[\s,\]}]/.test(src[j + 1] || ' '))) j++;
    const t = src.slice(i, j).trim(); i = j; return t;
  };
  // After an item: a comma, taken, or the closing bracket, left for the loop. Anything else is a shape
  // this reader does not cover, `[a: b]` or a `}` inside `[...]`, and stopping here is what keeps an
  // item that read nothing from being read again forever.
  const next = (close) => {
    ws();
    if (src[i] === ',') i++;
    else if (src[i] !== close && i < src.length) throw new Unreadable('a flow collection it cannot read', n);
  };
  const value = () => {
    ws();
    if (src[i] === '[') {
      i++; const items = [];
      for (ws(); src[i] !== ']'; ws()) {
        if (i >= src.length) throw new Unreadable('a flow sequence runs past its line', n);
        items.push(value()); next(']');
      }
      i++; return { kind: 'seq', line: n, items };
    }
    if (src[i] === '{') {
      i++; const entries = new Map(); const keyLines = new Map();
      for (ws(); src[i] !== '}'; ws()) {
        if (i >= src.length) throw new Unreadable('a flow mapping runs past its line', n);
        const k = scalar(',}'); ws();
        let v = scalarNode(n, '');
        if (src[i] === ':') { i++; v = value(); }
        entries.set(k, v); keyLines.set(k, n); next('}');
      }
      i++; return { kind: 'map', line: n, entries, keyLines };
    }
    const t = scalar(',]}');
    noAnchor(t, n);
    return scalarNode(n, t);
  };
  const v = value(); ws();
  if (i < src.length) throw new Unreadable('text after a flow collection', n);
  return v;
}

export function parseYaml(text) {
  const raw = text.replace(/\r\n?/g, '\n').split('\n');
  const L = []; // { n, indent, s } for every line holding content, comments stripped
  let started = false;
  raw.forEach((line, k) => {
    const n = k + 1;
    const s = stripComment(line);
    if (!s.trim()) return; // a blank or comment-only line, a tab in it included
    if (s.startsWith('\t')) throw new Unreadable('a tab in the indentation', n);
    if (/^(---|\.\.\.)(\s|$)/.test(s)) { if (started) throw new Unreadable('a second document', n); return; }
    started = true; L.push({ n, indent: indentOf(s), s: s.trim() });
  });
  let p = 0;
  const scalarAt = (rest, n, indent) => {
    if (BLOCK.test(rest)) { // a block scalar: every raw line deeper than its key, comments kept
      const lines = []; let k = n;
      while (k < raw.length && (!raw[k].trim() || indentOf(raw[k]) > indent)) { lines.push({ n: k + 1, text: raw[k].trim() }); k++; }
      while (p < L.length && L[p].n <= k) p++;
      return { kind: 'scalar', line: n, text: lines.map((l) => l.text).join('\n'), lines };
    }
    noAnchor(rest, n);
    if (/^[[{]/.test(rest)) return parseFlow(rest, n);
    if (/^["']/.test(rest)) {
      const q = rest[0]; const closed = q === '"' ? /^"(?:[^"\\]|\\.)*"$/ : /^'(?:[^']|'')*'$/;
      if (!closed.test(rest)) throw new Unreadable('a quoted value runs past its line', n);
      return scalarNode(n, unquote(rest, n));
    }
    const lines = [{ n, text: rest }]; // a plain scalar continues on deeper lines
    while (p < L.length && L[p].indent > indent) { lines.push({ n: L[p].n, text: L[p].s }); p++; }
    return { kind: 'scalar', line: n, text: lines.map((l) => l.text).join(' '), lines };
  };
  const block = (indent) => {
    const { s, n } = L[p];
    if (isItem(s)) return seq(L[p].indent);
    if (KEY.test(s)) return map(L[p].indent);
    p++; return scalarAt(s, n, indent - 1);
  };
  const valueAfter = (rest, n, indent) => {
    if (rest) return scalarAt(rest, n, indent);
    if (p < L.length && L[p].indent > indent) return block(L[p].indent);
    if (p < L.length && L[p].indent === indent && isItem(L[p].s)) return seq(indent);
    return scalarNode(n, '');
  };
  function map(indent) {
    const node = { kind: 'map', line: L[p].n, entries: new Map(), keyLines: new Map() };
    while (p < L.length && L[p].indent === indent) {
      const m = KEY.exec(L[p].s);
      if (!m) throw new Unreadable('a line that is neither a key nor a list item', L[p].n);
      const n = L[p].n; const key = unquote(m[1].trim(), n); p++;
      if (key === '<<') throw new Unreadable('a merge key', n);
      node.keyLines.set(key, n); node.entries.set(key, valueAfter((m[2] || '').trim(), n, indent));
    }
    if (p < L.length && L[p].indent > indent) throw new Unreadable('a line deeper than the key before it', L[p].n);
    return node;
  }
  function seq(indent) {
    const node = { kind: 'seq', line: L[p].n, items: [] };
    while (p < L.length && L[p].indent === indent && isItem(L[p].s)) {
      const { n } = L[p]; const rest = L[p].s.slice(1).trim();
      if (!rest) { p++; node.items.push(valueAfter('', n, indent)); continue; }
      const at = indent + L[p].s.indexOf(rest);
      if (KEY.test(rest) && !/^[[{"']/.test(rest)) { L[p] = { n, indent: at, s: rest }; node.items.push(map(at)); } else { p++; node.items.push(scalarAt(rest, n, at - 1)); }
    }
    return node;
  }
  if (!L.length) return { kind: 'map', line: 1, entries: new Map(), keyLines: new Map() };
  const root = block(L[0].indent);
  if (p < L.length) throw new Unreadable('a line outside the document structure', L[p].n);
  return root;
}
