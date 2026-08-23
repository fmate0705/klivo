import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Tone } from '@/components/wave/section-divider';

/**
 * A világoskék szekciók hullámsávja — **saját**, a `WaveBand`-től független.
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
 * A világoskék szekció mindkét oldalán ez a sáv áll: fölötte lefelé zúdul, alatta
 * (`rise`) fölfelé — a kettő közrefogja és megvezeti a szekciót. Az alsót nem a
 * szekció rajzolja, hanem a **következő**, ugyanúgy, ahogy minden szekcióhatárt:
 * ott a `from` értéke világoskék, és ebből tudja, hogy fordítva kell állnia.
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

/**
 * A rajzterület. Normalizált: a `preserveAspectRatio="none"` nyújtja a helyére.
 *
 * A görbék a nézetdobozon **túlnyúlnak** mindkét oldalon (`OVER`). Enélkül a
 * görgetésre induló vízszintes sodródás kilógatná a rajz szélét a sávból, és a
 * szélén kilátszana az alatta lévő szín. A `svg` a nézetdobozra vág, tehát a
 * túllógó rész nem látszik — csak amikor elcsúszik alá.
 */
const W = 1000;
const H = 1000;
const OVER = 260;

type Point = [number, number];
type Segment = { c1: Point; c2: Point; end: Point };

/** Egy réteg felső határa: kezdőpont és köbös Bézier-szakaszok. */
type Boundary = { start: Point; segments: Segment[] };

/**
 * Egy réteghatár alakja.
 *
 * @param edge  A határ nyugalmi magassága a sávon.
 * @param dip   Mennyivel mélyebb a sarokban a nyugalmi magasságnál.
 * @param reach Meddig tart a lezúdulás vízszintesen.
 * @param phase A hullám eltolása. Ez adja, hogy a szalagok hol szélesednek ki.
 */
type Shape = { edge: number; dip: number; reach: number; phase: number };

/**
 * A hullám kitérése, a sáv magasságának arányában.
 *
 * **Minden határ ugyanekkora.** Ez nem szegényesség, hanem az egyetlen módja
 * annak, hogy a határok soha ne keresztezzék egymást: ha az amplitúdók
 * eltérnének, két szomszédos határ valahol összeérne, a szalag ott nullára
 * fogyna, a folytatásban pedig kifordulna — pontosan ez adta a korábbi változat
 * szaggatott, hibásnak látszó élét. A vastagság így is végig változik, mert a
 * **fázisok** különböznek.
 */
const AMP = 0.06;

/**
 * A négy határ.
 *
 * A nyugalmi magasságok különbsége mindig nagyobb, mint `2 × AMP`: két azonos
 * amplitúdójú, eltérő fázisú hullám távolsága legfeljebb ennyivel változik.
 * Amíg a rés ennél nagyobb, a két határ biztosan nem ér össze — bármilyen
 * fázissal. A `dip` értékek is monoton nőnek, tehát a sarokban sem fordul meg a
 * sorrend.
 */
const SHAPES: Shape[] = [
  { edge: 0.1, dip: 0.16, reach: 0.3, phase: 0.08 },
  { edge: 0.26, dip: 0.22, reach: 0.36, phase: 0.62 },
  { edge: 0.44, dip: 0.28, reach: 0.42, phase: 0.31 },
  { edge: 0.64, dip: 0.32, reach: 0.48, phase: 0.85 },
];

/** Hány mintapontból épül egy határ. Ennyi elég a sima ívhez. */
const SAMPLES = 26;

/**
 * A hullám függvénye.
 *
 * Két, egymásra rakott szinusz: az alap adja a nagy ívet, a második a
 * részletet. Egyetlen szinuszból gépi, ismétlődő minta lenne — kettőből, nem
 * egész számú frekvenciaaránnyal, már olyan, mintha kézzel rajzolták volna.
 */
function wave(t: number): number {
  return 0.66 * Math.sin(2 * Math.PI * t) + 0.34 * Math.sin(4 * Math.PI * t + 1.1);
}

/** Sima átmenet 0 és 1 között — a lezúdulás pereme ettől nem törik meg. */
function ease(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

/**
 * Mintapontokból sima köbös lánc (Catmull-Rom → Bézier).
 *
 * A vezérlőpontok a szomszédos minták különbségéből jönnek, tehát a
 * csatlakozásoknál az érintő folytonos: a görbe áthalad minden mintaponton, és
 * sehol nem törik meg. A végeken a szomszéd hiányzik, ezért ott a pont maga lép
 * a helyére.
 */
function spline(points: Point[]): Boundary {
  const segments: Segment[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)]!;
    const current = points[index]!;
    const next = points[index + 1]!;
    const after = points[Math.min(points.length - 1, index + 2)]!;

    segments.push({
      c1: [current[0] + (next[0] - previous[0]) / 6, current[1] + (next[1] - previous[1]) / 6],
      c2: [next[0] - (after[0] - current[0]) / 6, next[1] - (after[1] - current[1]) / 6],
      end: next,
    });
  }

  return { start: points[0]!, segments };
}

/**
 * Egy réteghatár: hullám + a sarokban egy lezúdulás.
 *
 * A kettő **nem két külön szakasz**, hanem ugyanannak a függvénynek a két tagja.
 * A korábbi változat a hullámot fél periódusonként külön Bézier-ívekből rakta
 * össze, és a csatlakozásoknál megtört az érintő — a sáv attól látszott
 * szaggatottnak, hibásnak.
 */
function boundary(shape: Shape): Boundary {
  const { edge, dip, reach, phase } = shape;
  const rx = reach * W;
  const points: Point[] = [];

  for (let index = 0; index <= SAMPLES; index += 1) {
    const x = -OVER + ((W + 2 * OVER) * index) / SAMPLES;
    const t = (x / W) * 1.35 + phase;
    // A lezúdulás a saroktól a `reach`-ig fut ki; azon túl nulla.
    const plunge = dip * H * ease((rx - x) / rx);
    points.push([x, edge * H + AMP * H * wave(t) + plunge]);
  }

  return spline(points);
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
  return `M${-OVER} ${-OVER} L${W + OVER} ${-OVER} L${at(lastEnd(line))}${backward(line)} Z`;
}

/** A sáv legalsó területe: az alatta lévő szekció színe. */
function below(line: Boundary): string {
  return `${forward(line)} L${W + OVER} ${H + OVER} L${-OVER} ${H + OVER} Z`;
}

const BOUNDARIES = SHAPES.map(boundary);

/** A sodródás mértéke rétegenként. Előjeles: a szomszédos rétegek szétcsúsznak. */
const DRIFT = ['4%', '-6%', '5%', '-7%'];

/**
 * A tónuslépcsők az egyik felülettől a másikig.
 *
 * Ha a két felület közel van egymáshoz a skálán (fehér ↔ világoskék), a sáv
 * szándékosan **lemerül** a kék közepéig, és onnan jön vissza — különben nem
 * látszana hullámnak, csak egy alig érzékelhető élnek. Ez ugyanaz a szabály,
 * mint a `WaveBand` `ACCENT`-je.
 */
function tones(from: Tone, to: Tone): string[] {
  const source = SCALE.indexOf(SURFACE[from] ?? (from as (typeof SCALE)[number]));
  const target = SCALE.indexOf(SURFACE[to] ?? (to as (typeof SCALE)[number]));
  const start = source === -1 ? 0 : source;
  const end = target === -1 ? 2 : target;

  if (Math.abs(end - start) < 3) return ['wave-4', 'wave-6', 'wave-5', 'wave-4'];

  return [0.28, 0.52, 0.72, 0.88].map((ratio) => {
    const raw = start + (end - start) * ratio;
    const step = end > start ? Math.ceil(raw) : Math.floor(raw);
    return SCALE[Math.min(SCALE.length - 1, Math.max(0, step))] as string;
  });
}

const DEPTH: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'clamp(150px, 16vw, 270px)',
  md: 'clamp(210px, 24vw, 420px)',
  lg: 'clamp(260px, 30vw, 520px)',
};

export function SkyBand({
  from,
  to,
  depth = 'md',
  flip = false,
  rise = false,
  className,
}: {
  /** A **fölötte** lévő szekció felülete. */
  from: Tone;
  /** Az alatta lévő szekció felülete. */
  to: Tone;
  depth?: 'sm' | 'md' | 'lg';
  /** Tükrözés: a lezúdulás a jobb sarokba kerül. */
  flip?: boolean;
  /**
   * Fordított állás: a folt **fölfelé** nyúlik.
   *
   * A világoskék szekció alatti sávnál kell, hogy a folt a szekcióba nyúljon
   * vissza, ne a következőbe. A rajz ilyenkor függőlegesen tükrözve áll, tehát a
   * tónussorrendet is meg kell fordítani — különben a felső felület kerülne
   * alulra.
   */
  rise?: boolean;
  className?: string;
}) {
  const palette = rise ? tones(to, from).reverse() : tones(from, to);
  const base = SURFACE[rise ? to : from] ?? (rise ? to : from);
  const tail = SURFACE[rise ? from : to] ?? (rise ? from : to);
  const last = BOUNDARIES[BOUNDARIES.length - 1]!;

  return (
    <div
      aria-hidden="true"
      className={cn('sky-band', flip && 'sky-band--flip', rise && 'sky-band--rise', className)}
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
          <g
            key={index}
            className="sky-band__layer"
            style={{ '--sky-drift': DRIFT[index] } as CSSProperties}
          >
            <path d={ribbon(line, BOUNDARIES[index + 1]!)} fill={`rgb(var(--${palette[index]}))`} />
            {/* A fehér fénykontúr a szalag felső élén. Ez teszi láthatóvá a
                rétegeket — enélkül a szomszédos tónusok egymásba folynak. */}
            <path
              d={forward(line)}
              fill="none"
              stroke={`rgb(255 255 255 / ${0.55 - index * 0.06})`}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        <g className="sky-band__layer" style={{ '--sky-drift': DRIFT[3] } as CSSProperties}>
          <path d={below(last)} fill={`rgb(var(--${tail}))`} />
          <path
            d={forward(last)}
            fill="none"
            stroke="rgb(255 255 255 / 0.34)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
