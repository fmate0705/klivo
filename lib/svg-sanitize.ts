/**
 * SVG fertőtlenítés — engedélyezőlistás újraírással.
 *
 * **Miért van erre szükség.** A partner emblémák SVG-ben érkeznek: az a
 * logóformátum, az skálázódik, és az marad éles minden felbontáson. Csakhogy az
 * SVG **dokumentum**, nem kép: futtathat szkriptet, tölthet külső erőforrást, és
 * ha azonos originről szolgáljuk ki, egy feltöltött SVG tárolt XSS. Pontosan
 * ezért nem engedte a feltöltő eddig (`lib/store/uploads.ts`).
 *
 * **A megközelítés: engedélyezőlista, nem tiltólista.** Nem azt keressük, mi a
 * veszélyes — azt úgysem lehet kimerítően felsorolni —, hanem **újraírjuk** a
 * fájlt: csak az ismert elemek és az ismert attribútumok maradnak meg, minden
 * más eltűnik. Amit nem ismerünk fel, az nem kerül a kimenetbe, tehát egy jövőbeli,
 * ma még nem ismert SVG-trükk is kiesik.
 *
 * **Ez a védelem első rétege, nem az egyetlen.** A `/media/…` válasz külön,
 * szigorú `Content-Security-Policy`-t kap (`default-src 'none'; sandbox`), és a
 * `next.config.mjs` ugyanerre az útvonalra is küld egyet. Két CSP fejlécnél a
 * böngésző a **metszetüket** érvényesíti, tehát ha ez a modul egyszer hibázna, a
 * szkript akkor sem futna le.
 *
 * A kimenet nem formázott, és nem is akar az lenni: a feladat a biztonság, nem
 * az olvashatóság.
 */

/**
 * Engedélyezett elemek.
 *
 * Ami **nincs** benne, és tudatosan: `script` (nyilvánvaló), `style` (a CSS
 * `url()`-lel külső kérést indít, `@import`-tal pedig idegen stíluslapot húz be),
 * `foreignObject` (tetszőleges HTML-t ágyaz be), `image` és `iframe` (külső
 * erőforrás, tehát követés), `a` (egy logó nem visz sehova — a hivatkozást a
 * megjelenítés adja hozzá, ha kell), `animate` és társai (SMIL-lel is lehet
 * attribútumot átírni futás közben).
 *
 * **Az SVG kis- és nagybetűérzékeny.** A `linearGradient` nem ugyanaz, mint a
 * `lineargradient`: az utóbbit a böngésző nem ismeri fel, és a színátmenet
 * egyszerűen eltűnik. A felismerés ezért kisbetűsítve történik, a kimenetre
 * viszont a **szabványos írásmód** kerül — ezt tárolja ez a leképezés.
 */
const ALLOWED_ELEMENTS = new Map(
  [
    'svg',
    'g',
    'defs',
    'title',
    'desc',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'text',
    'tspan',
    'linearGradient',
    'radialGradient',
    'stop',
    'clipPath',
    'mask',
    'symbol',
    'use',
    'pattern',
  ].map((name) => [name.toLowerCase(), name] as const),
);

/**
 * Engedélyezett attribútumok, ugyanazzal a kisbetűs → szabványos leképezéssel.
 *
 * Eseménykezelő (`on…`) egy sincs köztük, és a szűrő külön is kizárja őket. A
 * `href`/`xlink:href` benne van, de csak **dokumentumon belüli** hivatkozásként
 * (`#valami`) — lásd `isSafeReference`.
 */
const ALLOWED_ATTRIBUTES = new Map(
  [
    'xmlns',
    'xmlns:xlink',
    'viewBox',
    'width',
    'height',
    'preserveAspectRatio',
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-dasharray',
    'stroke-dashoffset',
    'opacity',
    'transform',
    'd',
    'points',
    'x',
    'y',
    'x1',
    'x2',
    'y1',
    'y2',
    'cx',
    'cy',
    'r',
    'rx',
    'ry',
    'dx',
    'dy',
    'offset',
    'stop-color',
    'stop-opacity',
    'gradientUnits',
    'gradientTransform',
    'spreadMethod',
    'patternUnits',
    'patternContentUnits',
    'patternTransform',
    'clip-path',
    'clip-rule',
    'clipPathUnits',
    'mask',
    'maskUnits',
    'maskContentUnits',
    'id',
    'class',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'text-anchor',
    'dominant-baseline',
    'vector-effect',
    'shape-rendering',
    'href',
    'xlink:href',
    'style',
  ].map((name) => [name.toLowerCase(), name] as const),
);

/** Ezek az attribútumok csak dokumentumon belülre mutathatnak. */
const REFERENCE_ATTRIBUTES = new Set(['href', 'xlink:href']);

/**
 * A festési attribútumok, amelyek `url(…)`-lel hivatkozhatnak.
 *
 * Egy embléma jogosan írja azt, hogy `fill="url(#szinatmenet)"` — a saját
 * színátmenetére mutat. Amit viszont nem írhat: `url(https://idegen.hu/…)`. A
 * böngészők ezt a gyakorlatban úgysem oldanák fel, de a szabály itt kimondva
 * is szerepel, mert a „gyakorlatban nem szokott” nem biztonsági garancia.
 */
const PAINT_ATTRIBUTES = new Set(['fill', 'stroke', 'clip-path', 'mask']);

/** Az önzáró elemek — ezekhez nem írunk zárótagot. */
const VOID_ELEMENTS = new Set([
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'stop',
  'use',
]);

export type SanitizeResult = { ok: true; svg: string } | { ok: false; error: string };

/** Legfeljebb ekkora SVG-t fogadunk el. Egy logó töredéke ennek. */
export const MAX_SVG_BYTES = 256 * 1024;

/**
 * Egy hivatkozás akkor biztonságos, ha a **saját** dokumentumra mutat.
 *
 * A `javascript:` és a `data:` a két séma, ami számít, és mindkettő kiesik: itt
 * csak a `#` kezdetű töredékhivatkozás megy át. Egy embléma legfeljebb a saját
 * színátmenetére vagy vágómaszkjára hivatkozik, külső címre soha.
 */
function isSafeReference(value: string): boolean {
  return value.trim().startsWith('#');
}

/**
 * A `style` attribútum tartalma.
 *
 * Az inline stílus önmagában nem veszélyes, de az `url()` külső kérést indít (a
 * látogató IP-címe elmegy egy idegen szerverhez), az `@import` stíluslapot húz
 * be, a `expression()` pedig régi böngészőkben kódot futtat. Ha bármelyik
 * szerepel benne, az egész attribútum kiesik — a logó legfeljebb egy árnyalatot
 * veszít, de nem kér le semmit kívülről.
 */
function isSafeStyle(value: string): boolean {
  return !/url\s*\(|@import|expression\s*\(|javascript:/i.test(value);
}

/**
 * Egy festési érték.
 *
 * Ha nincs benne `url(`, akkor sima szín vagy kulcsszó — mehet. Ha van, akkor
 * csak dokumentumon belülre (`url(#…)`) mutathat.
 */
function isSafePaint(value: string): boolean {
  if (!/url\s*\(/i.test(value)) return true;
  return /^url\s*\(\s*["']?#/i.test(value.trim());
}

/** Az XML-ben jelentéssel bíró karakterek, hogy a kimenet ne törhessen ki. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Egy tag attribútumai. A név–érték párokat egyenként olvassuk ki. */
const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

function sanitizeAttributes(raw: string): string {
  const parts: string[] = [];
  ATTRIBUTE_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ATTRIBUTE_PATTERN.exec(raw)) !== null) {
    const key = (match[1] ?? '').toLowerCase();
    const value = match[3] ?? match[4] ?? '';

    // Az eseménykezelőket külön is kizárjuk. Az engedélyezőlista már kiszűrné
    // őket, de ez a sor az, ami egy jövőbeli bővítésnél is megvédi a fájlt.
    if (key.startsWith('on')) continue;

    const name = ALLOWED_ATTRIBUTES.get(key);
    if (!name) continue;
    if (REFERENCE_ATTRIBUTES.has(key) && !isSafeReference(value)) continue;
    if (key === 'style' && !isSafeStyle(value)) continue;
    if (PAINT_ATTRIBUTES.has(key) && !isSafePaint(value)) continue;

    parts.push(`${name}="${escapeXml(value)}"`);
  }

  return parts.join(' ');
}

/**
 * Egy SVG fertőtlenítése.
 *
 * A kimenet mindig egyetlen `<svg>` elem: a gyökér előtti feldolgozási
 * utasítások, a `<!DOCTYPE>` és a megjegyzések eltűnnek. Ez nem kényelmi
 * döntés — a `<!DOCTYPE>` az, amin az entitás-alapú támadások (külső entitás,
 * „billion laughs”) utaznak, és egy logónak soha nincs rá szüksége.
 */
export function sanitizeSvg(source: string): SanitizeResult {
  if (source.length > MAX_SVG_BYTES) {
    return { ok: false, error: 'Az SVG nagyobb 256 kB-nál.' };
  }

  // Megjegyzések és feldolgozási utasítások: a tartalmuk sosem jelenik meg,
  // viszont tagot rejthetnek el a lentebbi elemzés elől.
  let text = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '');

  // Entitásdeklaráció esetén nem próbálunk javítani: az ilyen fájl nem logó.
  if (/<!ENTITY/i.test(text) || /<!DOCTYPE/i.test(text)) {
    return {
      ok: false,
      error: 'Az SVG doctype-ot vagy entitást tartalmaz. Mentsd el újra, egyszerű SVG-ként.',
    };
  }
  text = text.replace(/<![\s\S]*?>/g, '');

  const rootStart = text.search(/<svg[\s>]/i);
  if (rootStart === -1) return { ok: false, error: 'Ez a fájl nem SVG.' };
  text = text.slice(rootStart);

  const output: string[] = [];
  /** A nyitott, **megtartott** elemek — csak ezekhez írunk zárótagot. */
  const open: string[] = [];
  /**
   * Hány szinttel vagyunk egy eldobott elem belsejében. Amíg nem nulla, a
   * tartalom nem kerül a kimenetbe: egy `<script>` gyermekei pont ugyanolyan
   * veszélyesek, mint maga a tag.
   */
  let skipDepth = 0;

  const TAG = /<\/?([a-zA-Z_][-a-zA-Z0-9_:.]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG.exec(text)) !== null) {
    const [tag, rawName = '', rawAttributes = ''] = match;
    const key = rawName.toLowerCase();
    // A kimenetre a szabványos írásmód kerül, nem az, amit a fájl írt: az SVG
    // kis- és nagybetűérzékeny, és egy `lineargradient` egyszerűen nem
    // rajzolódik ki.
    const name = ALLOWED_ELEMENTS.get(key);
    const closing = tag.startsWith('</');
    const selfClosing = tag.endsWith('/>');

    // A tagek közötti szöveg. `<text>` tartalma lehet, ezért megtartjuk —
    // escapelve, tehát markuppá nem válhat.
    if (skipDepth === 0) {
      const between = text.slice(cursor, match.index);
      if (between.trim()) output.push(escapeXml(between));
    }
    cursor = TAG.lastIndex;

    if (closing) {
      if (skipDepth > 0) {
        if (!name) skipDepth -= 1;
        continue;
      }
      if (name && open[open.length - 1] === name) {
        open.pop();
        output.push(`</${name}>`);
      }
      continue;
    }

    if (skipDepth > 0) {
      // Eldobott elemen belül vagyunk: a beágyazott, szintén eldobott elemeket
      // számolni kell, különben a zárótagjuk zárná le a külsőt.
      if (!name && !selfClosing) skipDepth += 1;
      continue;
    }

    if (!name) {
      if (!selfClosing) skipDepth = 1;
      continue;
    }

    const attributes = sanitizeAttributes(rawAttributes);
    const head = attributes ? `${name} ${attributes}` : name;

    if (selfClosing || VOID_ELEMENTS.has(key)) {
      output.push(`<${head}/>`);
      continue;
    }

    open.push(name);
    output.push(`<${head}>`);
  }

  // A lezáratlanul maradt elemek zárása — egy csonka fájl így sem törheti el a
  // köré rendert oldalt.
  while (open.length > 0) output.push(`</${open.pop()}>`);

  const svg = output.join('');
  if (!svg.startsWith('<svg')) return { ok: false, error: 'Ez a fájl nem SVG.' };

  return { ok: true, svg };
}
