import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Tone } from '@/components/wave/section-divider';

/**
 * A világoskék szekciók fölötti hullámsáv — **saját**, a `WaveBand`-től
 * független.
 *
 * Miért külön: a világoskék szekciókba sarokmotívum kellett, és amíg a motívum
 * a szekcióban ült, a sáv pedig fölötte, a kettő soha nem illeszkedett. Két
 * külön rajz, két külön koordinátarendszerben — a rétegek magassága nem
 * eshetett egybe, és a találkozásuknál mindig maradt egy törés vagy egy hézag.
 *
 * Itt a sáv **és** a sarokfolt ugyanannak az egyetlen rajznak a része: a folt
 * nem odarakott alakzat, hanem az, hogy a sáv rétegei az egyik sarokban
 * **lezúdulnak**. Nincs mit illeszteni, mert nincs két dolog.
 *
 * A `components/wave/section-divider.tsx` érintetlen: a többi szekcióhatár
 * változatlanul azt használja.
 */

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

/** A szekciófelületek helye a skálán. Ugyanaz a leképezés, mint a `WaveBand`-é. */
const SURFACE: Record<string, (typeof SCALE)[number]> = {
  white: 'wave-1',
  sky: 'wave-3',
  blue: 'wave-9',
  deep: 'wave-9',
};

/** A világoskék felület — ide érkezik a sáv. */
const TO = 'wave-3';

/**
 * A rajzterület. Normalizált: a `preserveAspectRatio="none"` nyújtja a helyére,
 * ahogy a szekcióhatároknál is.
 */
const W = 1000;
const H = 1000;

type Point = [number, number];
type Segment = { c1: Point; c2: Point; end: Point };

/** Egy réteg felső határa: kezdőpont és köbös Bézier-szakaszok. */
type Boundary = { start: Point; segments: Segment[] };

/**
 * Egy réteghatár.
 *
 * Két része van, és ez a lényeg: a sarokban **lezúdul** (`dip`), a felület többi
 * részén pedig egy hosszú, halk hullám (`edge`, `wob`). A kettő egyetlen
 * folytonos görbe — a folt nem „egy ráhelyezett alakzat”, hanem az, hogy a sáv
 * a sarokban mélyre bukik.
 *
 * @param dip   Meddig zúdul le a sarokban, a sáv magasságának arányában.
 * @param reach Meddig tart a lezúdulás vízszintesen.
 * @param edge  A határ nyugalmi magassága a sávon.
 * @param wob   A halk hullám kitérése a nyugalmi magasság körül.
 * @param phase A halk hullám eltolása — enélkül a rétegek párhuzamosak lennének.
 */
function boundary(dip: number, reach: number, edge: number, wob: number, phase: number): Boundary {
  const rx = reach * W;
  const ey = edge * H;
  const dy = dip * H;
  const drop = dy - ey;
  const rest = W - rx;

  return {
    start: [0, dy],
    segments: [
      // A lezúdulás alja: vízszintes érintővel indul a saroktól, tehát a folt
      // nem hegyben kezdődik, hanem lapos fenékkel — mint egy medence.
      { c1: [rx * 0.3, dy], c2: [rx * 0.44, ey + drop * 0.62], end: [rx * 0.6, ey + drop * 0.34] },
      // Kifutás a nyugalmi magasságra, ott már vízszintes érintővel.
      { c1: [rx * 0.78, ey + drop * 0.08], c2: [rx * 0.9, ey], end: [rx, ey] },
      // Innen a halk hullám, két szakaszban.
      {
        c1: [rx + rest * 0.2, ey],
        c2: [rx + rest * 0.3, ey - wob * H],
        end: [rx + rest * 0.55, ey - wob * H * (0.4 + phase * 0.5)],
      },
      {
        c1: [rx + rest * 0.78, ey - wob * H * (1.3 - phase)],
        c2: [W * 0.94, ey + wob * H * phase],
        end: [W, ey + wob * H * (0.3 + phase * 0.4)],
      },
    ],
  };
}

const round = (value: number) => Math.round(value * 10) / 10;
const at = (point: Point) => `${round(point[0])} ${round(point[1])}`;

/** A határ oda-útja. */
function forward(line: Boundary): string {
  return (
    `M${at(line.start)}` +
    line.segments.map((s) => ` C${at(s.c1)} ${at(s.c2)} ${at(s.end)}`).join('')
  );
}

/**
 * A határ vissza-útja, `M` nélkül.
 *
 * Egy köbös szakasz megfordítása a végpontok cseréje és a két vezérlőpont
 * felcserélése — enélkül a szalag alsó és felső éle nem ugyanaz a görbe lenne.
 */
function backward(line: Boundary): string {
  const points: Point[] = [line.start, ...line.segments.map((s) => s.end)];
  let out = '';
  for (let index = line.segments.length - 1; index >= 0; index -= 1) {
    const segment = line.segments[index]!;
    out += ` C${at(segment.c2)} ${at(segment.c1)} ${at(points[index]!)}`;
  }
  return out;
}

const lastEnd = (line: Boundary) => line.segments[line.segments.length - 1]!.end;

/**
 * Egy szalag: két határ közötti terület.
 *
 * A rétegek **nem** egymásra festett, alul kitöltött formák, hanem valódi
 * szalagok. Kitöltéssel a sarokban mindig a legutoljára rajzolt réteg takarna el
 * mindent — így viszont mindegyik réteg pontosan a saját sávját foglalja el, és
 * a sarokban egymásba ágyazódnak.
 */
function ribbon(upper: Boundary, lower: Boundary): string {
  return `${forward(upper)} L${at(lastEnd(lower))}${backward(lower)} Z`;
}

/** A sáv legfelső területe: a fölötte lévő szekció színe. */
function above(line: Boundary): string {
  return `M0 0 L${W} 0 L${at(lastEnd(line))}${backward(line)} Z`;
}

/** A sáv legalsó területe: a világoskék felület, ami a szekcióban folytatódik. */
function below(line: Boundary): string {
  return `${forward(line)} L${W} ${H} L0 ${H} Z`;
}

/**
 * A négy réteghatár.
 *
 * A `dip` értékek egyre mélyebbek: a sarokban ettől ágyazódnak egymásba, mint a
 * referencia rétegzett foltja. A `reach` is nő, tehát a lezúdulás lefelé
 * szélesedik — a folt nem csúcs, hanem örvény.
 */
const BOUNDARIES = [
  boundary(0.3, 0.24, 0.1, 0.045, 0.2),
  boundary(0.53, 0.31, 0.21, 0.055, 0.75),
  boundary(0.75, 0.37, 0.33, 0.04, 0.35),
  boundary(0.95, 0.44, 0.46, 0.05, 0.9),
];

/**
 * A tónuslépcsők a `from` felülettől a világoskékig.
 *
 * Ha a két felület közel van egymáshoz a skálán (fehér ↔ világoskék), a sáv
 * szándékosan **lemerül** a kék közepéig, és onnan jön vissza — különben nem
 * látszana hullámnak, csak egy alig érzékelhető élnek. Ez ugyanaz a szabály,
 * mint a `WaveBand` `ACCENT`-je.
 */
function tones(from: Tone): string[] {
  const source = SCALE.indexOf(SURFACE[from] ?? (from as (typeof SCALE)[number]));
  const target = SCALE.indexOf(TO);
  const start = source === -1 ? 0 : source;

  if (Math.abs(target - start) < 3) return ['wave-4', 'wave-6', 'wave-5', 'wave-4'];

  return [0.28, 0.52, 0.72, 0.88].map((ratio) => {
    const raw = start + (target - start) * ratio;
    const step = target > start ? Math.ceil(raw) : Math.floor(raw);
    return SCALE[Math.min(SCALE.length - 1, Math.max(0, step))] as string;
  });
}

/**
 * A sáv mélysége.
 *
 * Jóval nagyobb, mint a sima szekcióhatáré, és ez nem díszítés: a sarokfolt a
 * sáv **magasságából** él. Sekély sávban a lezúdulás egy széles, lapos teknő
 * lenne — a rajzterületet a `preserveAspectRatio="none"` vízszintesen jóval
 * jobban nyújtja, mint függőlegesen.
 */
const DEPTH: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'clamp(150px, 16vw, 270px)',
  md: 'clamp(210px, 24vw, 420px)',
  lg: 'clamp(260px, 30vw, 520px)',
};

export function SkyBand({
  from,
  depth = 'md',
  flip = false,
  className,
}: {
  /** A **fölötte** lévő szekció felülete. Ez a sáv alapszíne. */
  from: Tone;
  depth?: 'sm' | 'md' | 'lg';
  /** Tükrözés: a lezúdulás a jobb sarokba kerül. */
  flip?: boolean;
  className?: string;
}) {
  const palette = tones(from);
  const base = SURFACE[from] ?? from;
  const last = BOUNDARIES[BOUNDARIES.length - 1]!;

  return (
    <div
      aria-hidden="true"
      className={cn('sky-band', flip && 'sky-band--flip', className)}
      style={{ '--sky-band-height': DEPTH[depth] } as CSSProperties}
    >
      <svg
        className="sky-band__canvas"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={above(BOUNDARIES[0]!)} fill={`rgb(var(--${base}))`} />

        {BOUNDARIES.slice(0, -1).map((line, index) => (
          <path
            key={index}
            d={ribbon(line, BOUNDARIES[index + 1]!)}
            fill={`rgb(var(--${palette[index]}))`}
          />
        ))}

        <path d={below(last)} fill={`rgb(var(--${TO}))`} />

        {/* A fehér fénykontúr minden határon. Ez teszi láthatóvá a rétegeket —
            enélkül a szomszédos tónusok egymásba folynak. */}
        {BOUNDARIES.map((line, index) => (
          <path
            key={`line-${index}`}
            d={forward(line)}
            fill="none"
            stroke={`rgb(255 255 255 / ${0.55 - index * 0.06})`}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
