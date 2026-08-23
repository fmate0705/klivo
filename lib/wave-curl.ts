/**
 * Örvénylő hullámok geometriája.
 *
 * **Miért nem elég a vízszintes hullámvonal.** A referenciakép hullámai nem egy
 * síkban futnak: mindegyik *befelé fordul*, és a taraján belül újabb, egyre
 * kisebb ívek ülnek — mint egy megtörő hullám keresztmetszete. Ezt egy
 * vízszintes szinuszgörbe nem tudja, akárhány rétegben rakjuk egymásra: annak
 * mindig van egy iránya, és mindig ugyanaz.
 *
 * **Amit tud.** Egy örvény itt koncentrikus, elliptikus **ívsávok** halmaza:
 * közös középpont, közös elforgatás, csökkenő sugarak. Két szomszédos sugár
 * közötti gyűrűcikk egy sáv; a sávok tónusa kívülről befelé lépdel, és minden
 * sáv **köré** vékony fehér keret kerül. Ettől olvasódik hullámtaréjnak, és nem
 * egy céltáblának. A keret a kitöltéssel egy útvonalon van: két külön path
 * sávonként megduplázná a beágyazott rajz méretét.
 *
 * **Miért ellipszis és nem kör.** A kör túl szabályos: egy lapított, elforgatott
 * ellipszis íve pontosan az a megnyúlt, oldalra dőlő taraj, amit a referencián
 * látni. Az elforgatás adja azt is, hogy a hullámok **több irányból** érkeznek.
 *
 * A koordináták a nézetdoboz egységeiben értendők (lásd `CURL_VIEWBOX`).
 */

/** A rajzterület. Négyzetes, mert `slice` skálázással álló és fekvő nézetet is ki kell töltenie. */
export const CURL_SIZE = 1200;

export const CURL_VIEWBOX = `0 0 ${CURL_SIZE} ${CURL_SIZE}`;

export type ArcBand = {
  /** Középpont. */
  cx: number;
  cy: number;
  /** Külső és belső sugár vízszintesen. */
  rxOuter: number;
  rxInner: number;
  /** Lapítás: a függőleges sugár ennyiszerese a vízszintesnek. */
  squash: number;
  /** Az ellipszis elforgatása fokban. */
  rotate: number;
  /** A látható ív kezdete és vége fokban, az elforgatott ellipszis szerint. */
  from: number;
  to: number;
  /**
   * A **belső** ív rövidülése fokban, mindkét végén.
   *
   * Nullánál a sáv vége lekerekített, tompa — ez nagy taréjnál rendben van,
   * mert a vége amúgy is a kereten kívülre esik. A kereten belül végződő
   * sarlóknál viszont pont ez a tompa vég látszik levágásnak: ott a sávnak
   * **hegyben** kell elfogynia, ahogy egy valódi hullámtaréj is elvékonyodik.
   */
  taper?: number;
};

/**
 * Egész koordináták.
 *
 * Az útvonalak a HTML-be ágyazva utaznak, és minden fölösleges számjegy két
 * bájt — a nyitóképernyőn és a betöltő függönyön együtt több száz koordinátáról
 * van szó. A rajzterület 1200 egység széles, és a megjelenítés ezt fölfelé
 * skálázza: egy egységnyi eltérés a képernyőn kevesebb, mint egy képpont.
 */
function round(value: number): number {
  return Math.round(value);
}

/**
 * Egy pont az elforgatott ellipszisen.
 *
 * A szög a *paraméteres* szög, nem a valódi polárszög — ellipszisnél a kettő
 * eltér, de az ívparancsnak úgyis a végpontok kellenek, és a paraméteres szög
 * mentén egyenletesebben oszlanak el a sávok.
 */
function point(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotateDeg: number,
  angleDeg: number,
): [number, number] {
  const t = (angleDeg * Math.PI) / 180;
  const phi = (rotateDeg * Math.PI) / 180;
  const x = rx * Math.cos(t);
  const y = ry * Math.sin(t);
  return [
    round(cx + x * Math.cos(phi) - y * Math.sin(phi)),
    round(cy + x * Math.sin(phi) + y * Math.cos(phi)),
  ];
}

/**
 * Egy taréjsáv — két koncentrikus ív közötti kitöltött, **lekerekített végű**
 * alakzat.
 *
 * A külső íven odafelé, a belsőn visszafelé haladunk, a két véget pedig egy-egy
 * félkör zárja. A lekerekítés nem díszítés: egyenes záróvonallal a sáv vége
 * éles, ferde vágás lenne, és a felület küllős keréknek látszana, nem
 * megtörő hullámnak. A referenciakép szalagjai mind lekerekítve végződnek.
 */
export function arcBand(band: ArcBand): string {
  const { cx, cy, rxOuter, rxInner, squash, rotate, from, to, taper = 0 } = band;
  const ryOuter = rxOuter * squash;
  const ryInner = rxInner * squash;
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  // A belső ív mindkét végén rövidebb: ettől fut hegybe a sáv.
  const trim = Math.min(taper, Math.abs(to - from) / 2.5);
  const innerFrom = from + trim;
  const innerTo = to - trim;
  const largeInner = Math.abs(innerTo - innerFrom) > 180 ? 1 : 0;

  const a = point(cx, cy, rxOuter, ryOuter, rotate, from);
  const b = point(cx, cy, rxOuter, ryOuter, rotate, to);
  const c = point(cx, cy, rxInner, ryInner, rotate, innerTo);
  const d = point(cx, cy, rxInner, ryInner, rotate, innerFrom);

  // A záró félkör sugara a sáv fél vastagsága az adott végponton.
  const capTo = round(Math.hypot(b[0] - c[0], b[1] - c[1]) / 2);
  const capFrom = round(Math.hypot(d[0] - a[0], d[1] - a[1]) / 2);

  return [
    `M${a[0]} ${a[1]}`,
    `A${round(rxOuter)} ${round(ryOuter)} ${rotate} ${large} 1 ${b[0]} ${b[1]}`,
    `A${capTo} ${capTo} 0 0 1 ${c[0]} ${c[1]}`,
    `A${round(rxInner)} ${round(ryInner)} ${rotate} ${largeInner} 0 ${d[0]} ${d[1]}`,
    `A${capFrom} ${capFrom} 0 0 1 ${a[0]} ${a[1]}`,
    'Z',
  ].join(' ');
}

/** Egy örvény: közös középpont, több koncentrikus sávval. */
export type Curl = {
  /** Középpont a nézetdoboz arányában (0–1). Kilóghat: −0,3 … 1,3. */
  cx: number;
  cy: number;
  /** A külső sugár a nézetdoboz arányában. */
  radius: number;
  /** Lapítás. 1 = kör; 0,45 körül a legjellegzetesebb a taraj. */
  squash: number;
  /** Elforgatás fokban — ez adja, hogy melyik irányból érkezik a hullám. */
  rotate: number;
  /** A látható ív kezdete és vége fokban. */
  from: number;
  to: number;
  /** A sávok tónusai kívülről befelé. A hosszuk adja a sávok számát. */
  tones: readonly string[];
  /** A legbelső sugár a külső arányában (0–1). A sávok eddig lépdelnek befelé. */
  inner?: number;
  /** A fehér kontúr erőssége (0–1). */
  line?: number;
  /**
   * A sávvégek hegyesedése fokban.
   *
   * Kereten belül végződő sarlóknál kötelező: enélkül a tompa, lekerekített
   * vég levágásnak látszik a kép közepén.
   */
  taper?: number;
  /**
   * Becsavarodás, 0–0,85.
   *
   * A belső sávok középpontja ennyivel csúszik el a taréj csúcsa felé, a
   * sugárcsökkenés arányában. Nullánál a sávok koncentrikusak — ez mindig
   * ugyanazt a félhold-formát adja. Fölfelé haladva a gyűrűk az egyik oldalon
   * összetorlódnak, a másikon szétnyílnak, és a taréj becsavarodik. 0,85 fölött
   * a sávok egymásba érnének.
   */
  spiral?: number;
  /**
   * A belső sávok rövidülése a teljes szöghossz arányában, sávonként.
   *
   * A kicsi érték hosszú, párhuzamosan futó szalagokat ad; a nagy érték gyorsan
   * elfogyó, hegyes tarajt.
   */
  inset?: number;
  /**
   * A rövidülés elosztása a két vég között, 0–1.
   *
   * 0,5 = szimmetrikus. 1 felé haladva a **csúcs** felőli vég fogy gyorsabban,
   * 0 felé a másik — ettől lesz a taréjnak iránya.
   */
  lead?: number;
};

/**
 * Egy örvény sávjai, kívülről befelé.
 *
 * A sugarak **nem egyenletesen** csökkennek, hanem egyre sűrűbben: a hullám
 * taraja kívül széles, befelé összeszűkül. Egyenletes osztásból koncentrikus
 * körök lennének, nem hullám.
 */
/**
 * @param size A rajzterület mérete, amihez a 0–1 közötti arányok mérődnek.
 *   Alapból a négyzetes `CURL_SIZE`; a hullámmező a saját szélességét adja át,
 *   hogy az örvény ugyanolyan arányú maradjon egy fekvő nézetdobozban is.
 */
export function curlBands(curl: Curl, size: number = CURL_SIZE): { band: ArcBand; tone: string }[] {
  const {
    cx,
    cy,
    radius,
    squash,
    rotate,
    from,
    to,
    tones,
    inner = 0.18,
    taper = 0,
    spiral = 0,
    inset: insetRatio = 0.055,
    lead = 0.5,
  } = curl;
  const outer = radius * size;
  const innermost = outer * inner;
  const count = tones.length;

  const radii: number[] = [];
  for (let index = 0; index <= count; index += 1) {
    // Négyzetes ütem: a külső sávok szélesek, a belsők keskenyek.
    const t = index / count;
    radii.push(outer - (outer - innermost) * (t * t * 0.65 + t * 0.35));
  }

  // A belső sávok **rövidebbek**: beljebb kezdődnek, mint a fölöttük lévő.
  // Ettől lesz a taréj hegyes, és nem egy koncentrikus céltábla.
  //
  // A rövidülés két vége **nem egyforma**: a `lead` osztja el. Fél-fél aránynál
  // szimmetrikus a taréj, egyoldalú aránynál az egyik vége hosszan elnyúlik, a
  // másik gyorsan elfogy — ez a különbség a sarló és a megtörő hullám között.
  const span = to - from;
  const inset = span * insetRatio;

  // A csúcs iránya: efelé csúsznak a belső sávok középpontjai.
  //
  // Koncentrikus sávokból mindig ugyanaz a félhold-forma jön ki, akárhogy
  // forgatjuk. Ha viszont a belső sávok középpontja a taréj *csúcsa* felé
  // csúszik, a gyűrűk egy oldalon összesűrűsödnek, a másikon szétnyílnak — és
  // a taréj **becsavarodik**, mint egy megtörő hullám. Ez adja a formák
  // egyediségét: ugyanaz a szögtartomány más `spiral` értékkel más hullám.
  const tipAngle = ((to * Math.PI) / 180) as number;
  const phi = (rotate * Math.PI) / 180;
  const ux = Math.cos(tipAngle);
  const uy = squash * Math.sin(tipAngle);
  const length = Math.hypot(ux, uy) || 1;
  const dirX = (ux * Math.cos(phi) - uy * Math.sin(phi)) / length;
  const dirY = (ux * Math.sin(phi) + uy * Math.cos(phi)) / length;

  return tones.map((tone, index) => {
    // A sávok nem keresztezhetik egymást: az eltolás legfeljebb akkora lehet,
    // amennyivel a sugár csökkent.
    const shift = spiral * (outer - (radii[index] as number));

    return {
      tone,
      band: {
        cx: cx * size + dirX * shift,
        cy: cy * size + dirY * shift,
        rxOuter: radii[index] as number,
        rxInner: radii[index + 1] as number,
        squash,
        rotate,
        from: from + inset * index * 2 * (1 - lead),
        to: to - inset * index * 2 * lead,
        taper,
      },
    };
  });
}
