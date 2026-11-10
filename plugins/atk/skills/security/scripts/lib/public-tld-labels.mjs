// atk:security public-tld-labels: whether a name ends in a label a public registry delegates, for
// the domains --domains proposes per ./host-classes.mjs proposable(). A name under any other last
// label, `.lab`, `.home`, `.dc`, `.vm`, names a network of its own and is printed by its class alone.
//
// The list is of public labels, never of private suffixes: every two-letter country code the root
// zone delegates, from ISO 3166 and its exceptional reservations (`ac`, `eu`, `su`, `uk`), and the
// generic labels most companies register under. A newer generic label left out is proposed as a
// machine name, and the owner adds that domain by hand, which prints nothing it should not.

const COUNTRY = new Set(`
  ac ad ae af ag ai al am ao aq ar as at au aw ax az ba bb bd be bf bg bh bi bj bm bn bo bq br bs bt bv bw by bz
  ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz de dj dk dm do dz ec ee eg er es et eu fi fj fk fm
  fo fr ga gb gd ge gf gg gh gi gl gm gn gp gq gr gs gt gu gw gy hk hm hn hr ht hu id ie il im in io iq ir is
  it je jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me mg mh mk ml mm
  mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np nr nu nz om pa pe pf pg ph pk pl pm pn pr
  ps pt pw py qa re ro rs ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr ss st su sv sx sy sz tc td tf tg th
  tj tk tl tm tn to tr tt tv tw tz ua ug uk us uy uz va vc ve vg vi vn vu wf ws ye yt za zm zw`.trim().split(/\s+/));
const GENERIC = new Set(['com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
  'dev', 'app', 'cloud', 'tech', 'online', 'site', 'xyz', 'page']);

// Whether a lowercased name of two labels or more ends in one of them.
export function endsInPublicLabel(name) {
  const last = name.slice(name.lastIndexOf('.') + 1);
  return COUNTRY.has(last) || GENERIC.has(last);
}
