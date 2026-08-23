/**
 * Hullámok útvonala.
 *
 * **Miért SVG és nem `border-radius`.** A CSS-ellipszis egyetlen kupolát tud
 * rajzolni. Egy hullám viszont több váltakozó hegyből és völgyből áll, sima
 * érintővel a fordulópontokon — ez `border-radius`-szal nem áll elő, és
 * pontosan ez hiányzott: a korábbi rétegek nem hullámnak, hanem foltnak
 * látszottak. Egy köbös Bézier-lánc viszont pontosan ezt a formát adja.
 *
 * **Miért csempézhető.** Az útvonal a rajzterület kétszeresére készül, tehát a
 * réteg vízszintesen a fél szélességgel eltolva ugyanúgy néz ki — a sodródó
 * animáció varrás nélkül ismételhető.
 */

/** A rajzterület szélessége. A megjelenítés `preserveAspectRatio="none"`-nal nyújt. */
export const WAVE_WIDTH = 1200;

/** A rajzterület magassága. */
export const WAVE_HEIGHT = 100;

/** A teljes, csempézhető nézetdoboz. */
export const WAVE_VIEWBOX = `0 0 ${WAVE_WIDTH * 2} ${WAVE_HEIGHT}`;

export type WaveOptions = {
  /**
   * Hány hullámhegy fér ki a rajzterület szélességén. Kevesebb hegy hosszabb,
   * lomhább hullámot ad — a referenciaképek hullámai hosszúak: 1–2 hegy.
   */
  crests?: number;
  /** Kitérés a középvonaltól, a magasság arányában (0–0,5). */
  amplitude?: number;
  /** Fázistolás hullámhosszban mérve (0–1). Ettől nem esik egybe két réteg. */
  phase?: number;
  /** A középvonal helye, a magasság arányában (0–1). */
  baseline?: number;
  /**
   * Mennyivel laposabb a völgy a hegynél (0–1).
   *
   * Tiszta szinuszból gépi, ismétlődő minta lesz. A valódi hullám csúcsa
   * hegyesebb, a völgye laposabb — ez a paraméter ezt az aszimmetriát adja.
   */
  skew?: number;
  /**
   * A gerinc vízszintes tartománya a saját terében, felülírva.
   *
   * Alapból a rajzterület kétszerese, egy hullámhossznyi túllógással — ez a
   * sodródó szekcióhatároknak pont elég. A hullámmező viszont **kicsinyíti** a
   * rajzot vízszintesen (`scale`), és ott ez a túllógás összemehet annyira, hogy
   * a kitöltött alakzat oldalsó éle beessen a képbe: egy vékony, a semmiben
   * végződő fehér vonal a hullámok fölött. Ilyenkor a hívó adja meg, meddig
   * kell érnie a gerincnek.
   */
  span?: { from: number; to: number };
};

type Crest = { d: string; start: number; end: number };

/**
 * A hullám gerince: köbös Bézier-lánc, félhullámonként egy szakasz.
 *
 * A `0.36`/`0.64` vezérlőpont-arány a szinusz fél periódusának bevett
 * közelítése. A két vezérlőpont vízszintes — ettől lesz a fordulópontokon az
 * érintő folytonos, tehát a gerinc nem törik meg, hanem folyik.
 */
function crest(options: WaveOptions): Crest {
  const { crests = 1.5, amplitude = 0.26, phase = 0, baseline = 0.5, skew = 0.35, span } = options;

  const period = WAVE_WIDTH / crests;
  const half = period / 2;
  const mid = WAVE_HEIGHT * baseline;
  const peak = WAVE_HEIGHT * amplitude;
  const trough = peak * (1 - skew);

  // Egy hullámhossznyi túllógás mindkét oldalon: a sodródó animáció így sem
  // enged rést a szélekre.
  const start = span ? span.from - phase * period : -period - phase * period;
  const end = span ? span.to : WAVE_WIDTH * 2 + period;

  let x = start;
  let y = mid - peak;
  let down = true;
  let d = `M ${roundX(x)} ${round(y)}`;

  while (x < end) {
    const next = down ? mid + trough : mid - peak;
    d += ` C ${roundX(x + half * 0.36)} ${round(y)} ${roundX(x + half * 0.64)} ${round(next)} ${roundX(x + half)} ${round(next)}`;
    x += half;
    y = next;
    down = !down;
  }

  return { d, start, end: x };
}

/**
 * A vízszintes koordináták egészek, a függőlegesek két tizedesig mennek.
 *
 * Az útvonalak a HTML-be ágyazva utaznak, tehát minden számjegy két bájt. A
 * rajzterület 2400 egység **széles** és 100 egység **magas**: vízszintesen egy
 * egység mindig kevesebb, mint egy képpont, függőlegesen viszont a
 * hullámmezőben tizennégyszeres nyújtás is előfordul, ott egy egész egységnyi
 * kerekítés már látható lépcsőt adna.
 */
function roundX(value: number): number {
  return Math.round(value);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Kitöltött hullám. A gerinc alatt (`down`) vagy fölött (`up`) tömör.
 */
export function wavePath(options: WaveOptions & { fill?: 'down' | 'up' } = {}): string {
  const { fill = 'down', ...rest } = options;
  const { d, start, end } = crest(rest);
  const edge = fill === 'down' ? WAVE_HEIGHT : 0;
  return `${d} L ${roundX(end)} ${edge} L ${roundX(start)} ${edge} Z`;
}

/**
 * Ugyanaz az ív, kitöltés nélkül — ez a világos fénykontúr a hullám gerincén.
 *
 * A referenciaképeken minden sávot elválaszt egy vékony világos él. Ez adja a
 * rétegzettséget: enélkül a szomszédos tónusok egymásba folynak.
 */
export function waveLine(options: WaveOptions = {}): string {
  return crest(options).d;
}
