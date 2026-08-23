import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { WaveLayer } from '@/components/wave/wave-layer';

/**
 * A nyitóképernyő hullámai — márványos, egymásba folyó szalagok.
 *
 * A referenciaképek nem foltok, hanem **szalagok**: hosszú, sima hullámok
 * egymáson, világostól a mélykékig, és a szalagokat vékony fehér él választja
 * el. Ettől olvasódik a felület víznek, nem absztrakt formáknak.
 *
 * A kompozíció **világos**. A felső kétharmad fehér és halványkék, a víz csak
 * lentről kúszik föl — a címsor és a bekezdés így tintaszínű a fehéren, ami a
 * legolvashatóbb, és az oldal nem lesz sötét.
 *
 * **Követi a mutatót.** Minden szalag más mértékben húz a kurzor felé, tehát a
 * felület nem egyben tolódik el, hanem hullámzik: a közeli szalagok erősebben
 * reagálnak, mint a mélyebbek. Két elem kell rétegenként — a `track` viszi a
 * mutatókövetést, a `shape` a saját sodródását. Egy elem `transform`-ján nem
 * futhat egyszerre animáció és interaktív érték.
 *
 * Szerver komponens: a mutatókövetés a globális `--pointer-x/y` változókból
 * jön, amelyeket a `MotionDriver` ír — a szalagok csak olvassák.
 */

type Ribbon = {
  tone: string;
  /** Hol kezdődik a szalag a nyitóképernyő magasságához képest (0–1). */
  top: number;
  /**
   * A taraj magassága. Fentről lefelé csökken: a távoli víz hulláma laposabb,
   * a közelié magasabb — ettől lesz perspektívája a felületnek.
   */
  crest: string;
  crests: number;
  amplitude: number;
  phase: number;
  skew?: number;
  /** A fehér él erőssége (0–1). Nulla: nincs él. */
  line: number;
  /** Mennyire húz a mutató felé, pixelben. */
  pull: number;
  pullY: number;
  duration: string;
  delay: string;
  drift: string;
  /** Dőlésszög fokban. Ettől érkezik a hullám oldalról. */
  tilt: number;
  /** Nagyítás, hogy a megdöntött réteg sarka ne engedjen rést. */
  zoom: number;
};

/**
 * A szalagok — tizenhárom réteg, a felület teljes magasságában.
 *
 * Három megkötés, mind a referenciaképből:
 *
 * 1. **Nincs fehér kitöltés.** A hullámok között csak a kék skála szerepel; a
 *    fehér kizárólag a hullám **körvonala**. Fehér foltokkal a kompozíció
 *    márványpapírrá válik, nem vízzé.
 * 2. **A hullámok oldalról is érkeznek.** Minden szalag saját dőlésszöget kap
 *    (±3–13°), tehát nem egymással párhuzamos sávok sorakoznak. A dőléshez
 *    nagyítás is jár, különben a sarkoknál kilátszana a háttér.
 * 3. **Fentről lefelé mélyül a tónus.** A felső harmadban csak a világos vég
 *    van (`wave-3`…`wave-5`), mert ott ül a címsor: tintaszínű szöveg a
 *    `wave-5`-ön 7,5:1.
 *
 * A taraj lefelé alacsonyodik, a fázis szalagonként máshol tart — így sehol nem
 * esik egybe két gerinc.
 */
const RIBBONS: Ribbon[] = [
  {
    tone: 'wave-3',
    top: 0,
    crest: '150px',
    crests: 0.8,
    amplitude: 0.4,
    phase: 0.1,
    line: 0.9,
    pull: 5,
    pullY: 4,
    duration: '70s',
    delay: '0s',
    drift: '2%',
    tilt: -9,
    zoom: 1.35,
  },
  {
    tone: 'wave-4',
    top: 0.1,
    crest: '142px',
    crests: 1.5,
    amplitude: 0.32,
    phase: 0.55,
    line: 0.85,
    pull: -7,
    pullY: 5,
    duration: '64s',
    delay: '-11s',
    drift: '-2.5%',
    tilt: 6,
    zoom: 1.3,
  },
  {
    tone: 'wave-3',
    top: 0.17,
    crest: '136px',
    crests: 1,
    amplitude: 0.42,
    phase: 0.3,
    line: 0.9,
    pull: 9,
    pullY: -5,
    duration: '60s',
    delay: '-25s',
    drift: '3%',
    tilt: -13,
    zoom: 1.4,
  },
  {
    tone: 'wave-5',
    top: 0.24,
    crest: '128px',
    crests: 2,
    amplitude: 0.28,
    phase: 0.82,
    line: 0.8,
    pull: -12,
    pullY: 6,
    duration: '56s',
    delay: '-7s',
    drift: '-3.5%',
    tilt: 8,
    zoom: 1.32,
  },
  {
    tone: 'wave-4',
    top: 0.32,
    crest: '120px',
    crests: 1.2,
    amplitude: 0.4,
    phase: 0.44,
    line: 0.85,
    pull: 15,
    pullY: -7,
    duration: '52s',
    delay: '-31s',
    drift: '4%',
    tilt: -6,
    zoom: 1.28,
  },
  {
    tone: 'wave-6',
    top: 0.4,
    crest: '112px',
    crests: 0.9,
    amplitude: 0.44,
    phase: 0.16,
    line: 0.75,
    pull: -18,
    pullY: 8,
    duration: '48s',
    delay: '-15s',
    drift: '-4.5%',
    tilt: 11,
    zoom: 1.36,
  },
  {
    tone: 'wave-5',
    top: 0.48,
    crest: '104px',
    crests: 1.8,
    amplitude: 0.3,
    phase: 0.7,
    line: 0.8,
    pull: 21,
    pullY: -9,
    duration: '44s',
    delay: '-3s',
    drift: '5%',
    tilt: -8,
    zoom: 1.3,
  },
  {
    tone: 'wave-7',
    top: 0.55,
    crest: '96px',
    crests: 1.1,
    amplitude: 0.42,
    phase: 0.06,
    line: 0.7,
    pull: -24,
    pullY: 10,
    duration: '40s',
    delay: '-27s',
    drift: '-5.5%',
    tilt: 7,
    zoom: 1.3,
  },
  {
    tone: 'wave-6',
    top: 0.62,
    crest: '88px',
    crests: 2.2,
    amplitude: 0.26,
    phase: 0.88,
    line: 0.7,
    pull: 27,
    pullY: -11,
    duration: '37s',
    delay: '-19s',
    drift: '6%',
    tilt: -11,
    zoom: 1.36,
  },
  {
    tone: 'wave-8',
    top: 0.69,
    crest: '80px',
    crests: 1.3,
    amplitude: 0.38,
    phase: 0.36,
    line: 0.6,
    pull: -30,
    pullY: 12,
    duration: '34s',
    delay: '-9s',
    drift: '-6.5%',
    tilt: 5,
    zoom: 1.26,
  },
  {
    tone: 'wave-7',
    top: 0.7,
    crest: '72px',
    crests: 1.9,
    amplitude: 0.28,
    phase: 0.62,
    line: 0.6,
    pull: 33,
    pullY: -13,
    duration: '31s',
    delay: '-33s',
    drift: '7%',
    tilt: -6,
    zoom: 1.28,
  },
  {
    tone: 'wave-8',
    top: 0.78,
    crest: '64px',
    crests: 2.1,
    amplitude: 0.3,
    phase: 0.2,
    line: 0.5,
    pull: -36,
    pullY: 14,
    duration: '28s',
    delay: '-5s',
    drift: '-7.5%',
    tilt: 4,
    zoom: 1.24,
  },
  {
    tone: 'wave-9',
    top: 0.85,
    crest: '58px',
    crests: 1.2,
    amplitude: 0.34,
    phase: 0.76,
    line: 0.45,
    pull: 30,
    pullY: -12,
    duration: '25s',
    delay: '-21s',
    drift: '6%',
    tilt: 0,
    zoom: 1,
  },
];

export function WaveSwirl({
  /**
   * Hol kezdődjön a víz a felület magasságához képest (0–1).
   *
   * A főoldali nyitóképernyőn nulla: a kompozíció a teljes magasságot
   * használja. Az aloldalak fejléce alacsonyabb, és ott kép is állhat — oda
   * összenyomott változat kell, hogy a tartalom világos felületen maradjon.
   *
   * Az eltolás a **konténeré**, nem a rétegeké: így egy médialekérdezés
   * keskeny nézetben lejjebb tolhatja az egészet, ahol a szöveg több sorba
   * törik, és különben a víz alá kerülne.
   */
  start = 0,
  className,
}: {
  start?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('wave-swirl', className)}
      aria-hidden="true"
      style={start ? ({ '--swirl-start': `${start * 100}%` } as CSSProperties) : undefined}
    >
      {RIBBONS.map((ribbon, index) => (
        <span
          key={index}
          className="wave-swirl__track"
          style={
            {
              '--layer-pull': `${ribbon.pull}px`,
              '--layer-pull-y': `${ribbon.pullY}px`,
              zIndex: index,
            } as CSSProperties
          }
        >
          <WaveLayer
            tone={ribbon.tone}
            top={ribbon.top}
            crest={ribbon.crest}
            crests={ribbon.crests}
            amplitude={ribbon.amplitude}
            phase={ribbon.phase}
            {...(ribbon.skew === undefined ? {} : { skew: ribbon.skew })}
            line={ribbon.line}
            drift={ribbon.drift}
            duration={ribbon.duration}
            delay={ribbon.delay}
          />
        </span>
      ))}
    </div>
  );
}
