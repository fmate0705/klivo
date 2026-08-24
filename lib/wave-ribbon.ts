/**
 * Sima hullámszalagok geometriája.
 *
 * Ebből épül a világoskék szekciók hullámsávja (`SkyBand`) és a csapatportrék
 * háttere (`WavePanel`). Mindkettő ugyanaz a szerkezet: néhány **határgörbe**
 * egymás alatt, és a köztük lévő terület egy-egy tömör szalag.
 *
 * Két szabály tartja, és mindkettő egy-egy elrontott változatból jött:
 *
 * 1. **A határ egyetlen sima görbe, nem ívdarabkák sora.** Ha fél
 *    periódusonként külön Bézier-íveket fűzünk össze, a csatlakozásoknál
 *    megtörik az érintő, és a szalag szögletesnek, hibásnak látszik. Itt a
 *    határ mintapontokból épül, és a mintákon Catmull-Rom lánc fut át: az
 *    érintő az egész hosszon folytonos.
 * 2. **A szalag két határ közötti terület, nem alul kitöltött forma.**
 *    Kitöltéssel mindig a legutoljára rajzolt réteg takarna el mindent — így
 *    viszont mindegyik réteg pontosan a saját sávját foglalja el.
 *
 * A koordináták egy 0–1000-es, normalizált térben értendők; a megjelenítés
 * `preserveAspectRatio="none"`-nal nyújtja a helyére.
 */

export type Point = [number, number];
export type Segment = { c1: Point; c2: Point; end: Point };

/** Egy réteg felső határa: kezdőpont és köbös Bézier-szakaszok. */
export type Boundary = { start: Point; segments: Segment[] };

/**
 * A hullám függvénye.
 *
 * Két, egymásra rakott szinusz: az alap adja a nagy ívet, a második a
 * részletet. Egyetlen szinuszból gépi, ismétlődő minta lenne — kettőből, nem
 * egész számú frekvenciaaránnyal, már olyan, mintha kézzel rajzolták volna.
 */
export function wave(t: number): number {
  return 0.66 * Math.sin(2 * Math.PI * t) + 0.34 * Math.sin(4 * Math.PI * t + 1.1);
}

/** Sima átmenet 0 és 1 között — a lezúdulás pereme ettől nem törik meg. */
export function ease(value: number): number {
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
export function spline(points: Point[]): Boundary {
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

const round = (value: number) => Math.round(value * 10) / 10;
const at = (point: Point) => `${round(point[0])} ${round(point[1])}`;

/** A határ oda-útja. */
export function forward(line: Boundary): string {
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
export function backward(line: Boundary): string {
  const points: Point[] = [line.start, ...line.segments.map((s) => s.end)];
  let out = '';
  for (let index = line.segments.length - 1; index >= 0; index -= 1) {
    const segment = line.segments[index]!;
    out += ` C${at(segment.c2)} ${at(segment.c1)} ${at(points[index]!)}`;
  }
  return out;
}

const lastEnd = (line: Boundary) => line.segments[line.segments.length - 1]!.end;

/** Egy szalag: két határ közötti terület. */
export function ribbon(upper: Boundary, lower: Boundary): string {
  return `${forward(upper)} L${at(lastEnd(lower))}${backward(lower)} Z`;
}

/** A legfelső terület: a határ fölött, a doboz tetejéig. */
export function above(line: Boundary, left: number, top: number, right: number): string {
  return `M${left} ${top} L${right} ${top} L${at(lastEnd(line))}${backward(line)} Z`;
}

/** A legalsó terület: a határ alatt, a doboz aljáig. */
export function below(line: Boundary, left: number, right: number, bottom: number): string {
  return `${forward(line)} L${right} ${bottom} L${left} ${bottom} Z`;
}
