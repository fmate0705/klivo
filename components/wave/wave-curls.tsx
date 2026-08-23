import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { CURL_VIEWBOX, arcBand, curlBands, type Curl } from '@/lib/wave-curl';
import { WAVE_VIEWBOX, wavePath, waveLine } from '@/lib/wave-path';

/**
 * A nyitóképernyő hullámmotorja — örvénylő taréjok.
 *
 * A referenciakép hullámai **körbemennek**: mindegyik befelé fordul, és a
 * taraján belül egyre kisebb, egyre világosabb ívek ülnek. Ezt egy vízszintes
 * hullámvonal nem tudja — akárhány réteget rakunk egymásra, annak mindig egy
 * iránya van. Itt minden hullám koncentrikus, elliptikus ívsávokból áll
 * (`lib/wave-curl.ts`), és a saját elforgatása adja, hogy **melyik irányból**
 * érkezik.
 *
 * **A nézetdoboz négyzetes, a skálázás `slice`.** Így a taraj se álló, se fekvő
 * nézetben nem nyúlik meg — a forma ugyanaz marad, csak más részlete látszik.
 * Ez a különbség a korábbi motorhoz képest: az `preserveAspectRatio="none"`
 * miatt széles képernyőn laposra húzódott, és épp a jellegzetes ív tűnt el.
 *
 * **Interaktív, de nem görgetésre.** Minden örvény más mértékben húz a mutató
 * felé — ennyi. Görgetéshez kötött forgás volt itt korábban, de harminc
 * egyszerre forgó, saját rétegre emelt SVG-csoport minden görgetési képkockán
 * újrarajzoltatta a teljes felületet, és érezhetően akadt. A felület él a
 * mutatótól; a görgetés a szekcióhatárok dolga.
 *
 * Szerver komponens: a mutató helyét a globális `--pointer-x/y` hordozza,
 * amelyet a `MotionDriver` ír.
 */

type Composed = Curl & {
  /** A rétegsorrend kulcsa: minél nagyobb, annál előrébb kerül. */
  layer: number;
  /** Mennyire húz a mutató felé, pixelben. */
  pull: number;
  pullY: number;
};

/**
 * A kompozíció.
 *
 * Nem véletlengenerátor: rögzített sorozat, amely mindig ugyanúgy néz ki — egy
 * „random” változat minden újratöltésre mást adna, és sosem lehetne
 * ellenőrizni, hogy a szöveg mögé nem kerül-e sötét folt.
 *
 * **A nagy ívek középpontja a képen kívül van.** Két korábbi változat bukott el
 * ezen. Ha egy nagy taréj középpontja beesik a képbe, akkor a sáv két vége is
 * beesik — és egy ívnek a semmiben végződő vége pontosan úgy néz ki, mint egy
 * félbevágott hullám a képernyő közepén. Kívülről indítva viszont csak az ív
 * *közepe* látszik: a hullám a képernyő széléről érkezik, átível a felületen,
 * és a másik szélen megy ki. A `depth` mondja meg, milyen messze a kereten
 * kívül van a középpont — a kis értékek szoros, közeli ívet adnak, a nagyok
 * széles sodrást.
 *
 * **Három méret, nem egy.** A referencián nagy sodrások között apró tarajok
 * ülnek, és épp ettől olvasódik tengernek: egyméretű hullámokból minta lesz,
 * nem víz. A nagyok a keret mentén futnak, a kicsik (negatív `depth`, tehát
 * kereten belüli középpont) a hézagokat töltik ki. A kicsik vége látszik, ezért
 * ott erősebb a hegyesedés — hegyben elfogyó ív kis hullám, tompán elvágott ív
 * viszont hiba.
 *
 * **A sugár nagy, a gyűrű mégis vékony.** A `RING` tartja a sávok együttes
 * vastagságát: a belső sugár mindig úgy áll be, hogy a gyűrű ugyanolyan vastag
 * maradjon, akármekkora a taréj. Enélkül a nagy ívek kövér szalagokká híznának.
 *
 * **A tónus attól függ, hol fut az ív.** A felső kétharmadban csak a skála
 * világos vége szerepel, mert ott ül a címsor és a bekezdés: tintaszínű szöveg
 * a `wave-5`-ön 7,5:1, a `wave-7`-en már csak 3,6:1. A sötét tömeg lent van.
 */

/**
 * Tónushármasok: külső perem, fehér fény, tömör test.
 *
 * Minden taréj így épül fel kívülről befelé — sötét perem, alatta a fehér
 * fénycsík, alatta a test. Ez a hármas adja, hogy a szalag megvilágított
 * víztömegnek látszik, és nem egy lapos gyűrűnek.
 *
 * **Egyik tónus sem lehet a felület saját színe.** A nyitóképernyő `wave-2`-n
 * ül; ha egy sáv is `wave-2`, az a sáv egyszerűen eltűnik, és a taréj úgy néz
 * ki, mintha ki lenne lyukasztva — pontosan ez volt a „nincs kitöltve” hiba.
 */
const PALETTES = [
  ['wave-4', 'wave-1', 'wave-3'],
  ['wave-5', 'wave-1', 'wave-4'],
  ['wave-6', 'wave-3', 'wave-5'],
  ['wave-7', 'wave-4', 'wave-6'],
  ['wave-8', 'wave-5', 'wave-7'],
  ['wave-9', 'wave-6', 'wave-8'],
] as const;

/**
 * A gyűrű vastagsága a nézetdoboz arányában.
 *
 * A három sáv együtt ennyit foglal. Ez az a méret, amit a jelenlegi felület
 * mutat — a taréj sugarától független, hogy a nagy, széles ívek se legyenek
 * vastagabbak a szűkeknél.
 */
const RING = 0.105;

/**
 * A látható ív közepe fokban.
 *
 * Minden taréj erre a szögre van középre igazítva, és a `span` mondja meg,
 * milyen hosszan. Így a `FACING` elforgatások akkor is érvényesek maradnak, ha
 * az ívhossz taréjonként más.
 */
const MIDPOINT = -57;

type Placed = {
  /** Melyik oldalon kívül ül a középpont. */
  edge: 'top' | 'right' | 'bottom' | 'left';
  /** Hol az oldal mentén, 0–1. */
  at: number;
  /** Milyen messze a kereten kívül. Negatív érték: a középpont a kereten belül. */
  depth: number;
  /** A külső sugár. Nagy érték = lapos, széles sodrás. */
  radius: number;
  /** Lapítás. */
  squash: number;
  /** Elforgatás a befelé nézéshez képest, fokban. */
  tilt: number;
  /** Az ív hossza fokban. Rövid = hurok, hosszú = körbeérő sodrás. */
  span: number;
  /** Becsavarodás. Előjeles: a két irány két különböző hullámot ad. */
  swirl: number;
  /** A belső sávok rövidülése sávonként, a szöghossz arányában. */
  inset: number;
  /** A rövidülés elosztása a két vég között. */
  lead: number;
};

/**
 * Az alapelforgatás oldalanként.
 *
 * A látható ív közepe a `MIDPOINT`. Ahhoz, hogy a kidudorodás **befelé**
 * nézzen, ennyivel kell elforgatni a taréjt. (Az SVG y tengelye lefelé nő,
 * tehát a 90° lefelé mutat.)
 */
const FACING: Record<Placed['edge'], number> = {
  top: 90 - MIDPOINT,
  right: 180 - MIDPOINT,
  bottom: -90 - MIDPOINT,
  left: -MIDPOINT,
};

/**
 * A kompozíció.
 *
 * Harminc taréj, és **mind más alakú**: a `span`, a `swirl`, az `inset` és a
 * `lead` négyese határozza meg a formát, nem csak a méret és az elforgatás.
 * Egyetlen szögtartománnyal minden taréj ugyanaz a félhold lenne, akárhogy
 * forgatjuk — ezen bukott el az előző változat.
 */
// prettier-ignore
const PLACED: Placed[] = [
  // Fölülről érkezők. Csak világos tónus: a címsor is itt van.
  { edge: 'top', at: 0.06, depth: 0.06, radius: 0.34, squash: 0.86, tilt: -18, span: 165, swirl: 0.55, inset: 0.07, lead: 0.75 },
  { edge: 'top', at: 0.3, depth: 0.2, radius: 0.56, squash: 0.78, tilt: 12, span: 210, swirl: -0.4, inset: 0.045, lead: 0.3 },
  { edge: 'top', at: 0.55, depth: 0.05, radius: 0.36, squash: 0.9, tilt: -8, span: 130, swirl: 0.7, inset: 0.09, lead: 0.85 },
  { edge: 'top', at: 0.82, depth: 0.18, radius: 0.52, squash: 0.8, tilt: 20, span: 190, swirl: 0.3, inset: 0.05, lead: 0.55 },

  // Balról érkezők, fentről lefelé mélyülő tónussal.
  { edge: 'left', at: 0.1, depth: 0.08, radius: 0.38, squash: 0.84, tilt: 14, span: 150, swirl: -0.6, inset: 0.08, lead: 0.25 },
  { edge: 'left', at: 0.36, depth: 0.22, radius: 0.58, squash: 0.76, tilt: -12, span: 235, swirl: 0.45, inset: 0.04, lead: 0.65 },
  { edge: 'left', at: 0.6, depth: 0.05, radius: 0.34, squash: 0.9, tilt: 22, span: 120, swirl: 0.75, inset: 0.1, lead: 0.8 },
  { edge: 'left', at: 0.84, depth: 0.19, radius: 0.54, squash: 0.8, tilt: -20, span: 200, swirl: -0.35, inset: 0.05, lead: 0.35 },

  // Jobbról érkezők.
  { edge: 'right', at: 0.08, depth: 0.17, radius: 0.5, squash: 0.8, tilt: -14, span: 180, swirl: 0.5, inset: 0.06, lead: 0.7 },
  { edge: 'right', at: 0.32, depth: 0.06, radius: 0.36, squash: 0.88, tilt: 16, span: 140, swirl: -0.7, inset: 0.09, lead: 0.2 },
  { edge: 'right', at: 0.58, depth: 0.23, radius: 0.6, squash: 0.76, tilt: -6, span: 225, swirl: 0.35, inset: 0.04, lead: 0.6 },
  { edge: 'right', at: 0.8, depth: 0.07, radius: 0.38, squash: 0.86, tilt: 24, span: 155, swirl: 0.65, inset: 0.08, lead: 0.8 },

  // Alulról érkezők: a mély kékek. A vízvonal alattuk zárja le a felületet.
  { edge: 'bottom', at: 0.14, depth: 0.06, radius: 0.36, squash: 0.88, tilt: 16, span: 145, swirl: -0.55, inset: 0.085, lead: 0.3 },
  { edge: 'bottom', at: 0.4, depth: 0.21, radius: 0.58, squash: 0.78, tilt: -14, span: 215, swirl: 0.4, inset: 0.045, lead: 0.7 },
  { edge: 'bottom', at: 0.66, depth: 0.05, radius: 0.34, squash: 0.9, tilt: 10, span: 125, swirl: 0.72, inset: 0.1, lead: 0.85 },
  { edge: 'bottom', at: 0.9, depth: 0.19, radius: 0.54, squash: 0.8, tilt: -22, span: 195, swirl: -0.3, inset: 0.05, lead: 0.4 },

  // Sarkokból induló, nagy sodrások. Ezek kötik össze a négy oldalt, hogy a
  // felület ne négy különálló szegélyre essen szét.
  { edge: 'left', at: -0.1, depth: 0.3, radius: 0.7, squash: 0.72, tilt: 28, span: 245, swirl: 0.3, inset: 0.035, lead: 0.6 },
  { edge: 'right', at: -0.08, depth: 0.32, radius: 0.72, squash: 0.72, tilt: -26, span: 230, swirl: -0.25, inset: 0.04, lead: 0.45 },
  { edge: 'left', at: 1.1, depth: 0.28, radius: 0.68, squash: 0.74, tilt: -30, span: 240, swirl: 0.28, inset: 0.035, lead: 0.65 },
  { edge: 'right', at: 1.08, depth: 0.33, radius: 0.74, squash: 0.72, tilt: 24, span: 220, swirl: -0.3, inset: 0.04, lead: 0.5 },

  // Apró taréjok a nagyok között.
  //
  // A referencián a hullámok nem egyméretűek: a nagy sodrások között ott ül egy
  // csomó kis taraj, és épp ettől olvasódik tengernek. Ezeknek a középpontja
  // **negatív mélységgel** a kereten belül van — csak így lehetnek kicsik. A
  // végük ezért látszik, tehát erős hegyesedést kapnak.
  { edge: 'top', at: 0.19, depth: -0.14, radius: 0.15, squash: 0.9, tilt: -24, span: 135, swirl: 0.65, inset: 0.1, lead: 0.8 },
  { edge: 'right', at: 0.22, depth: -0.2, radius: 0.18, squash: 0.86, tilt: 30, span: 160, swirl: -0.6, inset: 0.09, lead: 0.25 },
  { edge: 'top', at: 0.72, depth: -0.1, radius: 0.13, squash: 0.92, tilt: 34, span: 115, swirl: 0.75, inset: 0.11, lead: 0.85 },
  { edge: 'left', at: 0.46, depth: -0.16, radius: 0.17, squash: 0.88, tilt: -32, span: 150, swirl: 0.5, inset: 0.095, lead: 0.7 },
  { edge: 'right', at: 0.44, depth: -0.24, radius: 0.2, squash: 0.84, tilt: 26, span: 175, swirl: -0.45, inset: 0.08, lead: 0.3 },
  { edge: 'bottom', at: 0.28, depth: -0.12, radius: 0.16, squash: 0.9, tilt: -28, span: 140, swirl: 0.7, inset: 0.1, lead: 0.75 },
  { edge: 'left', at: 0.72, depth: -0.18, radius: 0.19, squash: 0.86, tilt: 36, span: 165, swirl: -0.55, inset: 0.085, lead: 0.2 },
  { edge: 'bottom', at: 0.78, depth: -0.15, radius: 0.14, squash: 0.9, tilt: 22, span: 125, swirl: 0.68, inset: 0.105, lead: 0.8 },
  { edge: 'right', at: 0.66, depth: -0.11, radius: 0.13, squash: 0.92, tilt: -34, span: 130, swirl: 0.6, inset: 0.1, lead: 0.75 },
  { edge: 'top', at: 0.44, depth: -0.22, radius: 0.21, squash: 0.84, tilt: 18, span: 185, swirl: -0.4, inset: 0.07, lead: 0.35 },
];

function center(placed: Placed): { cx: number; cy: number } {
  const { edge, at, depth } = placed;
  if (edge === 'top') return { cx: at, cy: -depth };
  if (edge === 'bottom') return { cx: at, cy: 1 + depth };
  if (edge === 'left') return { cx: -depth, cy: at };
  return { cx: 1 + depth, cy: at };
}

/**
 * A taréj csúcsának magassága a felületen, 0–1.
 *
 * A tónust ez adja, nem kézzel beírt érték. A csúcs az a pont, ahol az ív a
 * legmélyebben benyúlik a keretbe — oldalról érkező taréjnál ez nagyjából a
 * középpont magasságában van, fentről vagy lentről érkezőnél a sugárral
 * eltolva.
 */
function apex(placed: Placed): number {
  const { cy } = center(placed);
  const reach = placed.radius * placed.squash;
  if (placed.edge === 'top') return cy + reach;
  if (placed.edge === 'bottom') return cy - reach;
  return cy;
}

/**
 * A tónus a magasságból.
 *
 * **A felső kétharmadban csak a skála világos vége szerepel**, mert ott ül a
 * címsor és a bekezdés: tintaszínű szöveg a `wave-5`-ön 7,5:1, a `wave-7`-en
 * már csak 3,6:1. Kézzel osztott palettáknál ez a szabály minden átrendezésnél
 * elcsúszott — így viszont a hely dönt, és nem lehet elrontani.
 */
const TONE_STOPS = [0.22, 0.4, 0.56, 0.72, 0.86];

function paletteOf(placed: Placed): number {
  const height = apex(placed);
  const step = TONE_STOPS.findIndex((stop) => height < stop);
  return step === -1 ? PALETTES.length - 1 : step;
}

/**
 * A rajzolási sorrend **a tónus mélysége**, nem a felsorolás sorrendje.
 *
 * Vízben a közelebbi, sötétebb hullám takarja a távolabbi, világosabbat — ha a
 * rétegsorrend a táblázat sorrendjét követi, akkor egy világos sarló ráfekszik
 * egy sötét tömegre, és a kép azonnal szétesik lapos matricákra. A `sort`
 * stabil, tehát azonos tónuson belül a felsorolás sorrendje marad.
 */
const CURLS: Composed[] = PLACED.map((placed, index) => {
  const { cx, cy } = center(placed);
  const palette = paletteOf(placed);
  const swing = index % 2 === 0 ? 1 : -1;
  const half = placed.span / 2;

  return {
    cx,
    cy,
    radius: placed.radius,
    squash: placed.squash,
    rotate: Math.round(FACING[placed.edge] + placed.tilt),
    from: Math.round(MIDPOINT - half),
    to: Math.round(MIDPOINT + half),
    tones: PALETTES[palette] as readonly string[],
    // A gyűrű vastagsága állandó — de csak addig, amíg a taréj elbírja. Az apró
    // taréjoknál a rögzített vastagság a sugár kétharmadát elvinné, és a
    // hullámból tömör folt lenne; ott a szalag a sugár arányában vékonyodik.
    inner: Math.max(0.58, 1 - RING / placed.radius),
    line: palette < 4 ? 0.9 : 0.65,
    // Az apró taréjok a kereten belül végződnek, tehát a végük látszik: ott
    // hosszabb hegyesedés kell, hogy pontban fogyjanak el.
    taper: placed.radius < 0.25 ? 40 : 26,
    spiral: placed.swirl,
    inset: placed.inset,
    lead: placed.lead,
    pull: swing * (9 + (index % 5) * 3),
    pullY: -swing * (5 + (index % 4) * 2),
    layer: palette,
  };
}).sort((a, b) => a.layer - b.layer);

export function WaveCurls({
  waterline = false,
  align = 'center',
  sparse = false,
  className,
}: {
  /**
   * Ritkított kompozíció: minden harmadik taréj kimarad.
   *
   * A betöltő függönynek nem kell a teljes sűrűség — három másodpercig látszik,
   * és közben nagyít is. Egyharmaddal kevesebb útvonal viszont érezhetően
   * kevesebb beágyazott rajz a HTML-ben, márpedig az a betöltés első
   * bájtjaiban utazik. Ennél többet nem szabad elvenni: felezésnél a felület
   * közepén akkora lyuk marad, hogy a függöny félkésznek látszik.
   */
  sparse?: boolean;
  /**
   * Hol legyen a rajzterület a felülethez képest.
   *
   * A `slice` skálázás mindig levág valamennyit, de hogy *mit*, az a doboz
   * arányától függ — széles fejlécnél a közepét, keskenynél az egészet. A
   * szöveg olvashatósága nem múlhat ezen.
   *
   * A `top` változat ezért a rajzterületet a doboznál **másfélszer magasabbra**
   * feszíti, és a tetejéhez igazítja: így minden méretnél pontosan a felső
   * kétharmad látszik, ahol csak a skála világos vége szerepel. A sötét tömeg
   * mindig a rajzterület alsó harmadában van.
   */
  align?: 'center' | 'top';
  /**
   * Tömör vízvonal a felület alján.
   *
   * A nyitóképernyő alatt szekcióhatár következik, annak pedig **egyszínű**
   * felülettel kell találkoznia — az örvények alja viszont tarka. Ez a réteg
   * zárja le: a legmélyebb kék, hullámos felső éllel. Egyben ez adja a
   * zárósor (`Építünk… / Görgess`) hátterét is, hogy a fehér szöveg olvasható
   * legyen.
   */
  waterline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('curls', className)} aria-hidden="true">
      <svg
        className={cn('curls__canvas', align === 'top' && 'curls__canvas--top')}
        viewBox={CURL_VIEWBOX}
        preserveAspectRatio={align === 'top' ? 'xMidYMin slice' : 'xMidYMid slice'}
        focusable="false"
      >
        {(sparse ? CURLS.filter((_, index) => index % 3 !== 1) : CURLS).map((curl, index) => (
          <g
            key={index}
            className="curls__track"
            // A vonaltulajdonságok öröklődnek: a csoporton egyszer szerepelnek,
            // nem mind a három sávon külön. A rajz a HTML-be ágyazva utazik, és
            // a szerverkomponens kimenete kétszer is benne van (HTML + RSC).
            stroke={`rgb(255 255 255 / ${curl.line ?? 0})`}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            style={
              {
                '--curl-pull': `${curl.pull}`,
                '--curl-pull-y': `${curl.pullY}`,
              } as CSSProperties
            }
          >
            {curlBands(curl).map(({ band, tone }, bandIndex) => (
              <path key={bandIndex} d={arcBand(band)} fill={`rgb(var(--${tone}))`} />
            ))}
          </g>
        ))}
      </svg>

      {waterline ? (
        <span className="curls__waterline">
          <svg
            className="curls__waterline-crest"
            viewBox={WAVE_VIEWBOX}
            preserveAspectRatio="none"
            focusable="false"
          >
            <path
              d={wavePath({ crests: 1.2, amplitude: 0.34, phase: 0.3, skew: 0.4, fill: 'down' })}
              fill="currentColor"
            />
            <path
              d={waveLine({ crests: 1.2, amplitude: 0.34, phase: 0.3, skew: 0.4 })}
              fill="none"
              stroke="rgb(255 255 255 / 0.45)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>
      ) : null}
    </div>
  );
}
