import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { WAVE_VIEWBOX, wavePath, waveLine } from '@/lib/wave-path';

/**
 * A szekcióhatár hulláma — **önálló, semmivel nem osztozó modul**.
 *
 * Ez a fájl a szekciók közötti átvezetés teljes kódja: a komponens, a formák és
 * az osztálynevek is csak ide tartoznak (`divider-*`). Korábban közös
 * rétegkomponensen és közös CSS-osztályokon osztozott a nyitóképernyő
 * hullámmotorjával, és emiatt a hero átírása egyben ezt is átírta volna.
 * A határ viselkedése viszont kész és jó — ezért van külön.
 *
 * Három sima, hosszú hullám egymáson: a fenti szekció színétől a lentebbiig
 * lépdelnek, és mindegyik gerincén ott a vékony **fehér fénykontúr**. Ez a
 * kontúr a referenciaképek egyik kulcsa — enélkül a szomszédos tónusok
 * egymásba folynak, és nem látszik, hogy rétegek vannak.
 *
 * A rétegek görgetésre sodródnak vízszintesen, egymáshoz képest eltérő
 * mértékben — ettől él a felület, miközben semmi nem ugrik.
 */

export type Tone =
  | 'white'
  | 'sky'
  | 'blue'
  | 'deep'
  | 'wave-1'
  | 'wave-2'
  | 'wave-3'
  | 'wave-4'
  | 'wave-5'
  | 'wave-6'
  | 'wave-7'
  | 'wave-8'
  | 'wave-9';

/** A skála, amin a sáv lépdel. */
const SCALE = [
  'wave-1',
  'wave-2',
  'wave-3',
  'wave-4',
  'wave-5',
  'wave-6',
  'wave-7',
  'wave-8',
  'wave-9',
] as const;

/** A szekciófelületek helye a skálán. */
const SURFACE: Record<string, (typeof SCALE)[number]> = {
  white: 'wave-1',
  sky: 'wave-3',
  // Mindkettő ugyanaz a szín: a #0D4F8F a legmélyebb kék az oldalon.
  blue: 'wave-9',
  deep: 'wave-9',
};

function indexOf(tone: Tone): number {
  const key = SURFACE[tone] ?? (tone as (typeof SCALE)[number]);
  const index = SCALE.indexOf(key);
  return index === -1 ? 0 : index;
}

/**
 * A két világos felület között használt kiemelő tónusok.
 *
 * Fehér és világoskék között a skálán másfél fokozat a különbség — abból nem
 * lesz látható hullám, csak egy alig érzékelhető él. Ilyenkor a sáv szándékosan
 * **lemerül** a kék közepéig, és onnan jön vissza: így a határ ugyanaz a
 * háromlépcsős, rétegzett hullám, mint a világos↔sötét váltásoknál, csak
 * rövidebb úton.
 */
const ACCENT = ['wave-4', 'wave-6'] as const;

/**
 * A köztes tónus.
 *
 * A sáv teteje a fenti szekció felülete, az alja a lentebbié; a közbenső
 * rétegek egyenletesen osztják el a kettő közti utat. Ha a két felület közel
 * van egymáshoz a skálán, a kiemelő tónusok lépnek a helyükre — lásd `ACCENT`.
 */
function toneStep(from: Tone, to: Tone, index: number, total: number): string {
  const a = indexOf(from);
  const b = indexOf(to);

  if (Math.abs(b - a) < 3) {
    return (ACCENT[Math.min(index, ACCENT.length - 1)] ?? ACCENT[0]) as string;
  }

  const ratio = (index + 1) / (total + 1);
  const raw = a + (b - a) * ratio;
  const step = b > a ? Math.ceil(raw) : Math.floor(raw);
  return SCALE[Math.min(SCALE.length - 1, Math.max(0, step))] as string;
}

/**
 * A három réteg alakja.
 *
 * Hosszú hullámok (1–2 hegy a teljes szélességen) és mérsékelt kitérés: a
 * referenciaképek határai nyugodtak, nem fodrozódnak. A fázis rétegenként más,
 * tehát a gerincek nem esnek egybe.
 */
const SHAPES = [
  { crests: 0.9, amplitude: 0.34, phase: 0, top: 0.26, skew: 0.4, drift: '9%', line: 0.55 },
  { crests: 1.3, amplitude: 0.3, phase: 0.55, top: 0.52, skew: 0.3, drift: '-14%', line: 0.5 },
  { crests: 1.8, amplitude: 0.24, phase: 0.25, top: 0.74, skew: 0.45, drift: '20%', line: 0.45 },
];

const DEPTH: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'clamp(64px, 6.5vw, 108px)',
  md: 'clamp(88px, 8.5vw, 140px)',
  lg: 'clamp(112px, 11vw, 190px)',
};

export function WaveBand({
  from,
  to,
  layers = 3,
  depth = 'md',
  flip = false,
  className,
}: {
  /** A **fölötte** lévő szekció felülete. Ez a sáv alapszíne. */
  from: Tone;
  /** Az alatta lévő szekció felülete. Ide érkezik a sáv. */
  to: Tone;
  /** Hány hullám legyen. Kettő halk, három az alap. */
  layers?: 2 | 3;
  depth?: 'sm' | 'md' | 'lg';
  /** Tükrözés: a hullám a másik irányba hajlik. */
  flip?: boolean;
  className?: string;
}) {
  const shapes = SHAPES.slice(0, layers);

  return (
    <div
      aria-hidden="true"
      className={cn('divider', flip && 'divider--flip', className)}
      style={
        {
          '--divider-base': `var(--${SURFACE[from] ?? from})`,
          '--divider-height': DEPTH[depth],
        } as CSSProperties
      }
    >
      {shapes.map((shape, index) => {
        const last = index === shapes.length - 1;
        const tone = last ? (SURFACE[to] ?? to) : toneStep(from, to, index, shapes.length);

        return (
          <span
            key={index}
            className="divider__layer"
            style={
              {
                '--divider-color': `var(--${tone})`,
                '--divider-top': `${shape.top * 100}%`,
                '--divider-drift': shape.drift,
                zIndex: index,
              } as CSSProperties
            }
          >
            <svg
              className="divider__crest"
              viewBox={WAVE_VIEWBOX}
              preserveAspectRatio="none"
              focusable="false"
            >
              <path
                d={wavePath({
                  crests: shape.crests,
                  amplitude: shape.amplitude,
                  phase: shape.phase,
                  skew: shape.skew,
                  fill: 'down',
                })}
                fill="currentColor"
              />
              <path
                d={waveLine({
                  crests: shape.crests,
                  amplitude: shape.amplitude,
                  phase: shape.phase,
                  skew: shape.skew,
                })}
                fill="none"
                stroke={`rgb(255 255 255 / ${shape.line})`}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
