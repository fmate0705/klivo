import { cn } from '@/lib/cn';
import {
  above,
  below,
  forward,
  ribbon,
  spline,
  wave,
  type Boundary,
  type Point,
} from '@/lib/wave-ribbon';

/**
 * Hullámfelület egy doboz alján — a csapatportrék háttere.
 *
 * A portrék átlátszó hátterűek, ezért kell alájuk egy felület: a kivágott alak
 * így nem lyukként hat, hanem mintha vízből emelkedne ki.
 *
 * **Ugyanaz a szalaglogika, mint a szekciósávoké** (`lib/wave-ribbon.ts`). A
 * korábbi változat három, egymásra fektetett, alul kitöltött hullámréteg volt,
 * és a rétegek élei ott is megtörtek, ahol a következő réteg alóluk kifutott —
 * a portré teteje ettől szaggatott, hullámpapírszerű lett. Itt minden réteg két
 * sima határgörbe közötti szalag, a határok pedig egyetlen függvényből, azonos
 * amplitúdóval és eltérő fázissal készülnek: nem keresztezhetik egymást, tehát
 * nincs hol megtörniük.
 *
 * **A víz a doboz alján áll, nem a tetején.** Az arc a kép felső kétharmadában
 * van; a hullámok ezért alulról jönnek föl, és a fej mögött már csak a
 * legvilágosabb tónus marad.
 */

/** A rajzterület. Normalizált: a megjelenítés nyújtja a helyére. */
const W = 1000;
const H = 1000;

/** Hány mintapontból épül egy határ. */
const SAMPLES = 22;

/**
 * A hullám kitérése.
 *
 * Minden határ ugyanekkora — csak a fázisuk más. Eltérő amplitúdóval két
 * szomszédos határ valahol összeérne, a szalag ott nullára fogyna, a
 * folytatásban pedig kifordulna.
 */
const AMP = 0.045;

/** A határok nyugalmi magassága. A rés mindenütt nagyobb, mint `2 × AMP`. */
const EDGES = [0.34, 0.52, 0.7, 0.87];

/** Fázisok — ettől változik a szalagok vastagsága a kép szélessége mentén. */
const PHASES = [0.12, 0.58, 0.31, 0.79];

const BOUNDARIES: Boundary[] = EDGES.map((edge, index) => {
  const points: Point[] = [];
  for (let sample = 0; sample <= SAMPLES; sample += 1) {
    const x = (W * sample) / SAMPLES;
    const t = (x / W) * 1.15 + (PHASES[index] as number);
    points.push([x, edge * H + AMP * H * wave(t)]);
  }
  return spline(points);
});

/**
 * A tónusnégyesek a tag sorszámától függően.
 *
 * A sor nem lesz egyhangú, de ugyanaz a tag mindig ugyanúgy néz ki — a
 * sorszámból számolt választás nem véletlen, tehát szerveren és kliensen is
 * ugyanaz.
 */
const PALETTES = [
  ['wave-2', 'wave-4', 'wave-6', 'wave-8'],
  ['wave-2', 'wave-3', 'wave-5', 'wave-7'],
  ['wave-2', 'wave-4', 'wave-5', 'wave-8'],
  ['wave-2', 'wave-3', 'wave-6', 'wave-9'],
];

export function WavePanel({ index = 0, className }: { index?: number; className?: string }) {
  const palette = PALETTES[index % PALETTES.length] as string[];
  const last = BOUNDARIES[BOUNDARIES.length - 1]!;

  return (
    <svg
      aria-hidden="true"
      className={cn('absolute inset-0 block h-full w-full', className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      focusable="false"
    >
      <path d={above(BOUNDARIES[0]!, 0, 0, W)} fill={`rgb(var(--${palette[0]}))`} />

      {BOUNDARIES.slice(0, -1).map((line, layer) => (
        <path
          key={layer}
          d={ribbon(line, BOUNDARIES[layer + 1]!)}
          fill={`rgb(var(--${palette[layer + 1]}))`}
        />
      ))}

      <path d={below(last, 0, W, H)} fill={`rgb(var(--${palette[palette.length - 1]}))`} />

      {/* A fehér fénykontúr minden határon. Ez teszi láthatóvá a rétegeket —
          enélkül a szomszédos tónusok egymásba folynak. */}
      {BOUNDARIES.map((line, layer) => (
        <path
          key={`line-${layer}`}
          d={forward(line)}
          fill="none"
          stroke={`rgb(255 255 255 / ${0.5 - layer * 0.07})`}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
