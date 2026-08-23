import type { WaveOptions } from '@/lib/wave-path';

/**
 * Egymásra torlódó hullámtestek geometriája.
 *
 * A nyitóképernyő mezője és a világoskék szekciók háttérmotívuma ugyanabból
 * épül: minden hullám egy **tömör sziluett** — hullámos felső él, alatta tömör
 * test, ami a következő hullámig tart. A rétegek hátulról előre kerülnek fel,
 * mint egy papírkivágás, és minden él mentén ott a vékony fehér kontúr.
 *
 * Ez a modul csak a **helyre tételt** tudja: az útvonalat a `lib/wave-path.ts`
 * rajzolja, a kompozíciót pedig a hívó adja. Azért van külön, mert két helyen
 * kell, és egy másolat előbb-utóbb elcsúszna az eredetitől.
 */

/**
 * A gerinc helye a saját, 2400×100-as térben.
 *
 * A test ez alatt lóg le — a `wavePath` a 100-as aljáig tölt —, tehát a
 * `tall` szorzóval együtt ez adja, meddig ér le a víztömeg.
 */
export const STACK_BASELINE = 0.3;

export type StackWave = {
  /** A gerinc középpontja a rajzterületen, 0–1. */
  x: number;
  y: number;
  /** Elforgatás fokban. */
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
   * helyett. 0,3 körül a görbe még végig lekerekített.
   */
  steep: number;
  /** Fázistolás: enélkül minden hullámhegy egy vonalba esne. */
  phase: number;
  /** A megvilágított taraj vastagsága a rajzterület egységeiben. */
  rim: number;
  /** Mennyivel laposabb a test hulláma a peremnél. 1 = ugyanolyan. */
  swell: number;
  /** A megvilágított taraj tónusa. */
  rimTone: string;
  /** A víztömeg tónusa. */
  bodyTone: string;
  /** A fehér kontúr erőssége a taraj élén. */
  line: number;
};

/**
 * A tényleges kitérés a saját, 2400×100-as térben.
 *
 * A fél hullámhossz ott `600 / crests`, a rajzterületen ennek a `wide`-szerese;
 * a kitérés pedig a `tall`-szorosa. A kettő arányát tartja a `steep`.
 */
export function stackAmplitude(wave: StackWave): number {
  return (6 * wave.steep * wave.wide) / (wave.crests * wave.tall);
}

/**
 * A gerinc vízszintes tartománya, hogy a kitöltött alakzat oldalsó éle biztosan
 * a rajzterületen kívül maradjon.
 *
 * A kitöltés és a fehér kontúr egy útvonalon van, tehát a körvonalból csak a
 * gerinc látszik — de csak akkor, ha a záróélek tényleg kívül esnek. A
 * `stackPlace` a saját teret a `wide` arányában **összenyomja**, és a
 * hullámútvonal beépített túllógása keskeny hullámoknál elfogy: a záróél ilyenkor
 * egy vékony, a semmiben végződő fehér vonalként jelenik meg a hullámok fölött.
 */
export function stackSpan(wave: StackWave, width: number): NonNullable<WaveOptions['span']> {
  const centre = wave.x * width;
  const margin = width * 0.22;
  return {
    from: (-margin - centre) / wave.wide + 1200,
    to: (width + margin - centre) / wave.wide + 1200,
  };
}

/**
 * Egy hullámtest helyre tétele.
 *
 * A `wavePath` a saját, 2400×100-as terében rajzol, és a gerince a
 * `STACK_BASELINE` magasságában fut. A transzformáció ezt a pontot viszi a
 * helyére: először a gerinc közepét az origóba tolja, aztán nyújt, forgat és
 * eltol. (Az SVG jobbról balra alkalmazza a láncot.)
 *
 * Az `offset` a víztömeget csúsztatja a taraj alá — ennyi marad látszani a
 * peremből.
 */
export function stackPlace(wave: StackWave, offset: number, width: number, height: number): string {
  return [
    `translate(${Math.round(wave.x * width)} ${Math.round(wave.y * height + offset)})`,
    `rotate(${wave.angle})`,
    `scale(${wave.wide} ${wave.tall})`,
    `translate(-1200 ${-100 * STACK_BASELINE})`,
  ].join(' ');
}
