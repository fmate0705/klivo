import { cn } from '@/lib/cn';
import { arcBand, curlBands, type Curl } from '@/lib/wave-curl';
import { WAVE_VIEWBOX, wavePath, waveLine } from '@/lib/wave-path';

/**
 * A nyitóképernyő és az aloldalak fejlécének hullámmezője.
 *
 * **A referencia egymásra torlódó hullámtestek halmaza.** Nem gyűrűk és nem
 * szalagok: minden hullám egy *tömör sziluett* — hullámos felső él, alatta
 * tömör test, ami a következő hullámig tart. A felület úgy épül fel, ahogy egy
 * papírkivágás: hátulról előre, mindegyik réteg eltakarja az alatta lévő alsó
 * részét, és minden él mentén ott a vékony **fehér kontúr**. Ez a kontúr a
 * referenciakép kulcsa — enélkül a szomszédos tónusok egymásba folynak.
 *
 * **A felület mély kék, nem világos.** A hullámok között nincs fehér: minden
 * kitöltés a kék skáláról jön, fehér csak a kontúr. Így lehet a nyitóképernyő
 * szövege fehér, és így emelkedik ki a világos gomb a felületből.
 *
 * **A szöveg mögött csak a két legmélyebb tónus van.** Fehér szöveg a
 * `wave-8`-on 5,8:1, a `wave-9`-en 8,3:1 — a `wave-7`-en viszont már csak
 * 3,9:1, tehát megbukna. A világosabb tónusok ezért mind a felület alsó
 * harmadában futnak, a szöveg alatt.
 *
 * **Interaktív, de nem görgetésre.** Minden hullám más mértékben húz a mutató
 * felé. Görgetéshez kötött forgás volt itt korábban, de a saját rétegre emelt
 * SVG-csoportok minden görgetési képkockán újrarajzoltatták a felületet, és
 * érezhetően akadt. A görgetés a szekcióhatárok dolga.
 *
 * Szerver komponens: az eltolást a `MotionDriver` írja közvetlenül a három
 * réteg stílusába, a `data-pull` attribútumokból.
 */

/** A rajzterület. Fekvő, mert a hullámtestek vízszintesen futnak. */
const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 800;
const FIELD_VIEWBOX = `0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`;

/**
 * Egy hullám a mezőn.
 *
 * **Két testből áll, nem egyből.** Előbb a világos *perem* kerül fel, utána egy
 * hajszálnyival lejjebb a sötét *test* — a test eltakarja a perem nagy részét,
 * és csak egy vékony világos szalag marad belőle a hullám gerince mentén. Ez a
 * referenciakép szerkezete: sötét víztömegek, mindegyik tetején egy megvilágított
 * taraj. Egyetlen testtel ez nem áll elő, csak nagy, lapos színfoltok.
 *
 * A perem vastagságát a `rim` adja, a formáját pedig az, hogy a test kicsit
 * *laposabb* hullám (`swell`): a perem így a hullámhegyeken kiszélesedik, a
 * völgyekben elvékonyodik — ahogy a valódi taraj is.
 */
type Wave = {
  /** A gerinc középpontja a rajzterületen, 0–1. */
  x: number;
  y: number;
  /** Elforgatás fokban. A referencián a hullámok nem vízszintesek. */
  angle: number;
  /**
   * Vízszintes nyújtás.
   *
   * Kettőt állít egyszerre: mennyire széles a test, és milyen hosszúak a
   * hullámhegyek.
   */
  wide: number;
  /**
   * Függőleges nyújtás.
   *
   * A testnek le kell érnie a rajzterület aljáig, különben alatta kilátszik az
   * előző réteg — ezért a fönt futó hullámok kapják a legnagyobb értéket.
   */
  tall: number;
  /** Hány hullámhegy fér ki. Kevesebb = hosszabb, lomhább hullám. */
  crests: number;
  /**
   * A hullámhegy **meredeksége**: a magasság és a fél hullámhossz aránya.
   *
   * Nem a kitérés, hanem az arány — mert a kitérést a `tall` fölnagyítja, a
   * hullámhosszt viszont a `wide` és a `crests`. Ha a magasságot közvetlenül
   * adnánk meg, egy nagy `tall` értékű hullámból hegyes sátor lenne a lágy ív
   * helyett; pontosan ez történt az első változatban. 0,3 körül a görbe még
   * végig lekerekített.
   */
  steep: number;
  /** Fázistolás: enélkül minden hullámhegy egy vonalba esne. */
  phase: number;
  /** A perem vastagsága a rajzterület egységeiben. */
  rim: number;
  /** Mennyivel laposabb a test hulláma a peremnél. 1 = ugyanolyan. */
  swell: number;
  /** A megvilágított taraj tónusa. */
  rimTone: string;
  /** A víztömeg tónusa. */
  bodyTone: string;
  /** A fehér kontúr erőssége a taraj élén. */
  line: number;
  /** Mennyire húz a mutató felé. */
  pull: number;
  pullY: number;
};

/**
 * A kompozíció — **hátulról előre**.
 *
 * A sorrend maga a rétegzés: minden hullám eltakarja az alatta lévő test alsó
 * részét. A legfelső gerinc fölött a szekció saját mély kékje látszik.
 *
 * **A felső mezőben csak a skála sötét vége szerepel — a peremben is.** Fehér
 * szöveg a `wave-8`-on 5,8:1, a `wave-9`-en 8,3:1; a `wave-7` 3,9:1, ami a nagy
 * címsornak elég, a bekezdésnek nem. A tarajok fönt ezért nem világos szalagok,
 * hanem egy fokozatnyi elmozdulások a mély kékek között — a rétegzést ott a
 * **fehér kontúr** viszi, nem a tónuskülönbség. Egy világos perem mobilon pont a
 * bekezdés sorai mögé kerülne: fehér szöveg a `wave-4`-en 1,5:1.
 *
 * A rajzterület 68 százaléka alatt nyílik ki a skála. Ez a határ nem esztétikai:
 * mobilon a nyitóképernyő két gombja a 70 százalékig ér le, és a másodlagos gomb
 * átlátszó, fehér kerettel — világos hullámon olvashatatlan lenne. Alatta már
 * nincs se szöveg, se áttetsző felület, onnan jönnek a referencia világos tarajai.
 */
// prettier-ignore
const WAVES: Wave[] = [
  { x: 0.5, y: 0.02, angle: -6, wide: 0.66, tall: 14, crests: 0.8, steep: 0.3, phase: 0.1, rim: 20, swell: 0.86, rimTone: 'wave-7', bodyTone: 'wave-8', line: 0.6, pull: 7, pullY: -3 },
  { x: 0.6, y: 0.06, angle: 9, wide: 0.5, tall: 13.5, crests: 1.6, steep: 0.26, phase: 0.35, rim: 14, swell: 0.9, rimTone: 'wave-7', bodyTone: 'wave-9', line: 0.5, pull: -6, pullY: 3 },
  { x: 0.46, y: 0.1, angle: 5, wide: 0.74, tall: 13, crests: 1.2, steep: 0.32, phase: 0.55, rim: 18, swell: 0.88, rimTone: 'wave-7', bodyTone: 'wave-9', line: 0.65, pull: -10, pullY: 4 },
  { x: 0.54, y: 0.19, angle: -10, wide: 0.58, tall: 12, crests: 0.9, steep: 0.28, phase: 0.3, rim: 22, swell: 0.84, rimTone: 'wave-7', bodyTone: 'wave-8', line: 0.55, pull: 13, pullY: -5 },
  { x: 0.44, y: 0.28, angle: 7, wide: 0.7, tall: 11, crests: 1.4, steep: 0.24, phase: 0.8, rim: 20, swell: 0.88, rimTone: 'wave-8', bodyTone: 'wave-9', line: 0.7, pull: -8, pullY: 3 },
  { x: 0.36, y: 0.32, angle: -13, wide: 0.44, tall: 10.5, crests: 1.9, steep: 0.3, phase: 0.62, rim: 16, swell: 0.9, rimTone: 'wave-8', bodyTone: 'wave-9', line: 0.5, pull: 8, pullY: -3 },
  { x: 0.56, y: 0.36, angle: -4, wide: 0.62, tall: 10, crests: 1, steep: 0.34, phase: 0.15, rim: 24, swell: 0.85, rimTone: 'wave-9', bodyTone: 'wave-8', line: 0.6, pull: 11, pullY: -4 },
  { x: 0.42, y: 0.44, angle: 9, wide: 0.76, tall: 9.5, crests: 1.6, steep: 0.26, phase: 0.45, rim: 18, swell: 0.88, rimTone: 'wave-8', bodyTone: 'wave-9', line: 0.7, pull: -13, pullY: 5 },
  { x: 0.68, y: 0.47, angle: 12, wide: 0.4, tall: 9.2, crests: 2.2, steep: 0.3, phase: 0.18, rim: 16, swell: 0.89, rimTone: 'wave-9', bodyTone: 'wave-8', line: 0.55, pull: -7, pullY: 3 },
  { x: 0.52, y: 0.51, angle: -12, wide: 0.54, tall: 9, crests: 1.1, steep: 0.32, phase: 0.7, rim: 26, swell: 0.83, rimTone: 'wave-9', bodyTone: 'wave-8', line: 0.65, pull: 9, pullY: -4 },
  { x: 0.48, y: 0.58, angle: 6, wide: 0.68, tall: 8, crests: 1.8, steep: 0.28, phase: 0.25, rim: 22, swell: 0.87, rimTone: 'wave-8', bodyTone: 'wave-9', line: 0.6, pull: -11, pullY: 4 },

  // Az alsó harmad: a perem vastagszik, a test is világosodik. Itt már nincs se
  // szöveg, se áttetsző gomb, tehát a skála teljes világos vége használható — a
  // referencián is ide esnek a legvilágosabb tarajok.
  { x: 0.58, y: 0.68, angle: -14, wide: 0.46, tall: 7, crests: 1.2, steep: 0.34, phase: 0.6, rim: 30, swell: 0.8, rimTone: 'wave-4', bodyTone: 'wave-7', line: 0.6, pull: 14, pullY: -6 },
  { x: 0.38, y: 0.735, angle: 11, wide: 0.58, tall: 6.5, crests: 1.7, steep: 0.3, phase: 0.9, rim: 26, swell: 0.84, rimTone: 'wave-5', bodyTone: 'wave-9', line: 0.55, pull: -9, pullY: 4 },
  { x: 0.64, y: 0.785, angle: -8, wide: 0.42, tall: 6, crests: 1.4, steep: 0.26, phase: 0.35, rim: 40, swell: 0.78, rimTone: 'wave-3', bodyTone: 'wave-6', line: 0.65, pull: 12, pullY: -5 },
  { x: 0.34, y: 0.83, angle: 13, wide: 0.5, tall: 5.5, crests: 2, steep: 0.32, phase: 0.05, rim: 34, swell: 0.82, rimTone: 'wave-4', bodyTone: 'wave-8', line: 0.6, pull: -14, pullY: 6 },
  { x: 0.68, y: 0.875, angle: -11, wide: 0.36, tall: 5, crests: 1.5, steep: 0.28, phase: 0.5, rim: 52, swell: 0.76, rimTone: 'wave-3', bodyTone: 'wave-5', line: 0.7, pull: 10, pullY: -4 },
  { x: 0.3, y: 0.92, angle: 10, wide: 0.44, tall: 4.5, crests: 2.2, steep: 0.34, phase: 0.75, rim: 44, swell: 0.8, rimTone: 'wave-4', bodyTone: 'wave-7', line: 0.6, pull: -12, pullY: 5 },
  { x: 0.72, y: 0.965, angle: -15, wide: 0.32, tall: 4, crests: 1.6, steep: 0.3, phase: 0.2, rim: 60, swell: 0.74, rimTone: 'wave-2', bodyTone: 'wave-4', line: 0.7, pull: 15, pullY: -6 },
  { x: 0.26, y: 1.01, angle: 12, wide: 0.38, tall: 3.5, crests: 2.5, steep: 0.26, phase: 0.65, rim: 50, swell: 0.78, rimTone: 'wave-3', bodyTone: 'wave-6', line: 0.6, pull: -10, pullY: 4 },
];

/**
 * Az örvények — néhány becsavarodó taraj.
 *
 * A referencián a hullámhegyek egy része nem simán fut ki, hanem **beforog**:
 * egyre kisebb, egyre világosabb ívek ülnek egymásban. Kevés van belőlük, és
 * mind az alsó harmadban: fönt a szöveg miatt csak a két legmélyebb tónus
 * futhat, azokból viszont nem látszana a befelé lépdelő tónussor.
 */
// prettier-ignore
const SWIRLS: (Curl & { pull: number; pullY: number })[] = [
  { cx: 0.17, cy: 0.74, radius: 0.075, squash: 0.84, rotate: 28, from: -150, to: 44, tones: ['wave-3', 'wave-6', 'wave-4'], inner: 0.4, line: 0.65, taper: 34, spiral: 0.62, inset: 0.09, lead: 0.75, pull: 13, pullY: -5 },
  { cx: 0.86, cy: 0.66, radius: 0.06, squash: 0.86, rotate: -146, from: -150, to: 44, tones: ['wave-4', 'wave-7', 'wave-5'], inner: 0.42, line: 0.6, taper: 34, spiral: -0.58, inset: 0.1, lead: 0.25, pull: -11, pullY: 5 },
  { cx: 0.55, cy: 0.88, radius: 0.055, squash: 0.85, rotate: 14, from: -150, to: 44, tones: ['wave-2', 'wave-5', 'wave-3'], inner: 0.4, line: 0.7, taper: 34, spiral: 0.66, inset: 0.1, lead: 0.8, pull: 10, pullY: -4 },
];

/**
 * Egy hullámtest helyre tétele.
 *
 * A `wavePath` a saját, 2400×100-as terében rajzol, és a gerince a
 * `BASELINE` magasságában fut. A transzformáció ezt a pontot viszi a helyére:
 * először a gerinc közepét az origóba tolja, aztán nyújt, forgat és eltol.
 * (Az SVG jobbról balra alkalmazza a láncot.)
 */
const BASELINE = 0.3;

/**
 * A tényleges kitérés a saját, 2400×100-as térben.
 *
 * A fél hullámhossz ott `600 / crests`, a rajzterületen ennek a `wide`-szerese;
 * a kitérés pedig a `tall`-szorosa. A kettő arányát tartja a `steep`.
 */
function amplitudeOf(wave: Wave): number {
  return (6 * wave.steep * wave.wide) / (wave.crests * wave.tall);
}

/**
 * A gerinc vízszintes tartománya, hogy a kitöltött alakzat oldalsó éle biztosan
 * a rajzterületen kívül maradjon.
 *
 * A `place` a saját teret a `wide` arányában **összenyomja**, tehát a
 * beépített túllógás keskeny hullámoknál elfogy, és a záróél fehér vonalként
 * megjelenik a képen. Ez a két érték a rajzterületen kívüli −260 és 1460
 * pontokat számolja vissza a saját térbe.
 */
function spanOf(wave: Wave): { from: number; to: number } {
  const centre = wave.x * FIELD_WIDTH;
  return {
    from: (-260 - centre) / wave.wide + 1200,
    to: (FIELD_WIDTH + 260 - centre) / wave.wide + 1200,
  };
}

function place(wave: Wave, offset: number): string {
  return [
    `translate(${Math.round(wave.x * FIELD_WIDTH)} ${Math.round(wave.y * FIELD_HEIGHT + offset)})`,
    `rotate(${wave.angle})`,
    `scale(${wave.wide} ${wave.tall})`,
    `translate(-1200 ${-100 * BASELINE})`,
  ].join(' ');
}

export function WaveCurls({
  waterline = false,
  align = 'center',
  sparse = false,
  className,
}: {
  /**
   * Ritkított kompozíció: minden harmadik hullám kimarad.
   *
   * A betöltő függönynek nem kell a teljes sűrűség — három másodpercig látszik,
   * és közben nagyít is. Kevesebb útvonal viszont érezhetően kevesebb beágyazott
   * rajz a HTML-ben, márpedig az a betöltés első bájtjaiban utazik.
   */
  sparse?: boolean;
  /**
   * Hol legyen a rajzterület a felülethez képest.
   *
   * A `slice` skálázás mindig levág valamennyit, de hogy *mit*, az a doboz
   * arányától függ — széles fejlécnél a közepét, keskenynél az egészet. A
   * szöveg olvashatósága nem múlhat ezen.
   *
   * A `top` változat ezért a rajzterületet a doboznál magasabbra feszíti, és a
   * tetejéhez igazítja: így minden méretnél a felső kétharmad látszik, ahol a
   * víztömeg csak a két legmélyebb tónusból áll.
   */
  align?: 'center' | 'top';
  /**
   * Tömör vízvonal a felület alján.
   *
   * A felület alatt szekcióhatár következik, annak pedig **egyszínű** felülettel
   * kell találkoznia — a hullámmező alja viszont tarka. Ez a réteg zárja le: a
   * legmélyebb kék, hullámos felső éllel.
   */
  waterline?: boolean;
  className?: string;
}) {
  const waves = sparse ? WAVES.filter((_, index) => index % 3 !== 1) : WAVES;
  const swirls = sparse ? SWIRLS.slice(0, 1) : SWIRLS;

  /**
   * A mutatókövetés **három rétegen** fut, nem hullámonként.
   *
   * Ez teljesítménykérdés, és a felület ezen bukott el egyszer. Ha minden hullám
   * saját `<g>`-t kap saját eltolással, akkor a mutató minden mozdulata
   * huszonvalahány SVG-csoport transzformációját írja át — az SVG-n belüli
   * `transform` viszont nem kerül külön compositor-rétegre, tehát **a teljes,
   * képernyő méretű rajz újrarajzolódik minden képkockán**. Ez akadó görgetést és
   * látható rajzolási hibákat okozott: üres fejlécsáv, eltűnő szövegsorok,
   * beragadt csempék.
   *
   * Három, egymásra fektetett `<svg>` viszont három **HTML-elem** gyereke, és a
   * `will-change: transform` ezeket valódi rétegre emeli: az eltolás a
   * compositoron fut, rajzolás nélkül. A parallaxis megmarad — három mélységi
   * síkban, ami épp elég a térérzethez.
   */
  // A sávok **összefüggő** szeletek, nem minden harmadik hullám: a rétegsorrend
  // hátulról előre halad, és egy váltogatott felosztás összekeverné.
  const perBand = Math.ceil(waves.length / 3);
  const bands = [0, 1, 2].map((band) => waves.slice(band * perBand, (band + 1) * perBand));

  return (
    <div className={cn('curls', className)} aria-hidden="true">
      {bands.map((band, bandIndex) => (
        <span
          key={bandIndex}
          className="curls__track"
          data-pull={6 + bandIndex * 7}
          data-pull-y={-3 - bandIndex * 3}
        >
          <svg
            className={cn('curls__canvas', align === 'top' && 'curls__canvas--top')}
            viewBox={FIELD_VIEWBOX}
            preserveAspectRatio={align === 'top' ? 'xMidYMin slice' : 'xMidYMid slice'}
            focusable="false"
          >
            {band.map((wave, index) => {
              const amplitude = amplitudeOf(wave);
              const shape = {
                span: spanOf(wave),
                crests: wave.crests,
                phase: wave.phase,
                baseline: BASELINE,
                skew: 0.38,
              };

              return (
                <g key={index}>
                  {/* A megvilágított taraj. Ebből csak egy szalag marad látszani:
                      a test rögtön utána eltakarja az alsó részét.

                      A kitöltés és a fehér kontúr **egy útvonalon** van. A kitöltött
                      alakzat alsó és oldalsó élei mind a rajzterületen kívülre esnek
                      (a test a nézetdoboz alja alá lóg, a két vége pedig oldalt kilóg),
                      tehát a körvonalból csak a gerinc látszik — egy külön vonal-útvonal
                      megduplázná a beágyazott rajzot a semmiért. */}
                  <g transform={place(wave, 0)}>
                    <path
                      d={wavePath({ ...shape, amplitude, fill: 'down' })}
                      fill={`rgb(var(--${wave.rimTone}))`}
                      stroke={`rgb(255 255 255 / ${wave.line})`}
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>

                  {/* A víztömeg. Laposabb hullám, ezért a taraj a hegyeken
                      kiszélesedik, a völgyekben elvékonyodik. */}
                  <g transform={place(wave, wave.rim)}>
                    <path
                      d={wavePath({
                        ...shape,
                        amplitude: amplitude * wave.swell,
                        fill: 'down',
                      })}
                      fill={`rgb(var(--${wave.bodyTone}))`}
                    />
                  </g>
                </g>
              );
            })}

            {/* Az örvények a legelső síkon ülnek: ott mozognak a legtöbbet. */}
            {bandIndex === bands.length - 1
              ? swirls.map((swirl, index) => (
                  <g
                    key={`swirl-${index}`}
                    // A vonaltulajdonságok öröklődnek: a csoporton egyszer
                    // szerepelnek, nem mind a három sávon külön.
                    stroke={`rgb(255 255 255 / ${swirl.line ?? 0})`}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  >
                    {curlBands(
                      // A `cy` a **magassághoz** mért arány, a `curlBands` viszont
                      // egyetlen mérethez skáláz — a fekvő nézetdobozban ezt át kell
                      // számolni.
                      { ...swirl, cy: (swirl.cy * FIELD_HEIGHT) / FIELD_WIDTH },
                      FIELD_WIDTH,
                    ).map(({ band: arc, tone }, bandNo) => (
                      <path key={bandNo} d={arcBand(arc)} fill={`rgb(var(--${tone}))`} />
                    ))}
                  </g>
                ))
              : null}
          </svg>
        </span>
      ))}

      {waterline ? (
        <span className={cn('curls__waterline', align === 'top' && 'curls__waterline--slim')}>
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
