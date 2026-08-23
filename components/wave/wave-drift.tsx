import { cn } from '@/lib/cn';
import { arcBand, curlBands, type Curl } from '@/lib/wave-curl';

/**
 * Háttérmotívum a világoskék szekciókban.
 *
 * A nyitóképernyő hullámmezője a lap legerősebb felülete; a világoskék
 * szekciók viszont teljesen simák voltak, és a kettő között nagy a szakadék. Ez
 * a réteg **egymásba boruló hullámtarajokat** emel a szekció jobb alsó
 * sarkába, ugyanabból a geometriából, amiből a nyitóképernyő örvényei
 * (`lib/wave-curl.ts`): elliptikus ívsávok befelé lépdelő tónussal és fehér
 * fénykontúrral.
 *
 * Három szabály tartja, és mind a három egy-egy elrontott változatból jött:
 *
 * 1. **A taraj fölfelé néz.** Az ív a csúcsánál a sugárra merőleges: ha a
 *    kidudorodás oldalra néz, a látható darab függőleges szalag, aminek semmi
 *    köze a hullámhoz. A középpontok ezért a felület alatt vannak, és a
 *    tarajok fölfelé domborodnak — ez az, amit hullámnak látunk.
 * 2. **A sávok vége a felület alá esik.** Egy ívnek a semmiben végződő vége
 *    félbevágott hullámnak látszik. A középpont magasságában végződnek, az
 *    pedig a szekció alsó éle alatt van.
 * 3. **A réteg teljes szélességű, a kompozíció mégsem az.** Egy sarokba tett
 *    doboznak *egyenes éle* van, és a sáv azon elvágva ragasztott képnek
 *    látszik. A réteg ezért a szekció szélességét viszi — a bal széle a nézet
 *    széle, ott nincs mit levágni —, a tarajok viszont mind a jobb oldalon
 *    ülnek, a szöveghasábtól távol.
 *
 * A tónus a `wave-6`-nál nem megy mélyebbre: tintaszínű szöveg azon még 5,3:1,
 * a `wave-7`-en viszont már csak 3,7:1.
 *
 * **Keskeny nézetben nincs.** Ott a tartalom a teljes szélességet elfoglalja,
 * tehát nincs margó, amiben a motívum megállhatna — a szöveg mögé csúszva pedig
 * már nem háttér, hanem zaj.
 *
 * **Interaktív, ingyen.** A réteg ugyanazt a `curls__track` osztályt viseli,
 * mint a nyitóképernyő síkjai, tehát a `MotionDriver` ezt is mozgatja a mutató
 * után — külön szkript és külön figyelő nélkül.
 */

/** A rajzterület. Fekvő, mert a tarajok vízszintesen futnak. */
const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 600;
const FIELD_VIEWBOX = `0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`;

/** A gyűrű vastagsága a rajzterület szélességének arányában. */
const RING = 0.05;

/**
 * A látható ív közepe **fölfelé** néz.
 *
 * A `curlBands` a −150°…40° szakaszt rajzolja, aminek a közepe −55°. Az SVG
 * y tengelye lefelé nő, tehát a „fölfelé” a 270°: ennyivel kell elforgatni.
 */
const FACING = 325;

type Placed = {
  /** Középpont a rajzterület **szélességének** arányában. */
  cx: number;
  cy: number;
  /** A taraj csúcsa: eddig emelkedik a hullám. */
  radius: number;
  squash: number;
  /** Elforgatás a fölfelé nézéshez képest. */
  tilt: number;
  tones: readonly string[];
  line: number;
  spiral: number;
};

/**
 * A torlasz — öt egymásba boruló taraj.
 *
 * A középpontok nagyjából egy magasságban, a felület alatt vannak: a sugár adja,
 * melyik meddig emelkedik. Így a tarajok egymásba borulnak, ahogy a
 * nyitóképernyőn is.
 *
 * A tónushármasok a skála világos vége felől jönnek, mert a felület `wave-3`.
 * Egyik sem lehet maga a `wave-3`: az a sáv egyszerűen eltűnne, és a taraj
 * kilyukasztottnak látszana.
 */
// prettier-ignore
const PLACED: Placed[] = [
  { cx: 0.99, cy: 1.02, radius: 0.34, squash: 0.82, tilt: -13, tones: ['wave-4', 'wave-2', 'wave-5'], line: 0.5, spiral: 0.35 },
  { cx: 1.04, cy: 1.05, radius: 0.28, squash: 0.86, tilt: 9, tones: ['wave-6', 'wave-2', 'wave-4'], line: 0.55, spiral: -0.3 },
  { cx: 0.95, cy: 1.03, radius: 0.23, squash: 0.88, tilt: -20, tones: ['wave-5', 'wave-2', 'wave-6'], line: 0.6, spiral: 0.45 },
  { cx: 1.08, cy: 1.06, radius: 0.18, squash: 0.9, tilt: 16, tones: ['wave-4', 'wave-2', 'wave-6'], line: 0.6, spiral: -0.4 },
  { cx: 1, cy: 1.04, radius: 0.13, squash: 0.92, tilt: -6, tones: ['wave-6', 'wave-2', 'wave-5'], line: 0.65, spiral: 0.5 },
];

const CLUSTER: Curl[] = PLACED.map((placed) => ({
  cx: placed.cx,
  // A `curlBands` egyetlen mérethez skáláz; a fekvő nézetdobozban a függőleges
  // arányt át kell számolni, különben a taraj magasabb lenne, mint a felület.
  cy: (placed.cy * FIELD_HEIGHT) / FIELD_WIDTH,
  radius: placed.radius,
  squash: placed.squash,
  rotate: Math.round(FACING + placed.tilt),
  from: -150,
  to: 40,
  tones: placed.tones,
  // A gyűrű vastagsága állandó: a belső sugár a külsőhöz igazodik.
  inner: 1 - RING / placed.radius,
  line: placed.line,
  // A végek a felület alá esnek, tehát nem kell hegyben elfogyniuk.
  taper: 8,
  spiral: placed.spiral,
  inset: 0.05,
  lead: 0.6,
}));

export function WaveDrift({ className }: { className?: string }) {
  return (
    <div className={cn('curls hidden lg:block', className)} aria-hidden="true">
      <span className="curls__track" data-pull={11} data-pull-y={-6}>
        <span className="absolute inset-x-0 bottom-0 block h-[clamp(220px,30vh,420px)]">
          <svg
            className="block h-full w-full"
            viewBox={FIELD_VIEWBOX}
            // A jobb alsó sarokhoz igazítva: a kompozíció ott ül, és széles
            // nézetben is ott kell maradnia.
            preserveAspectRatio="xMaxYMax slice"
            focusable="false"
          >
            {CLUSTER.map((curl, index) => (
              <g
                key={index}
                // A vonaltulajdonságok öröklődnek: a csoporton egyszer
                // szerepelnek, nem mind a három sávon külön.
                stroke={`rgb(255 255 255 / ${curl.line ?? 0})`}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              >
                {curlBands(curl, FIELD_WIDTH).map(({ band, tone }, bandIndex) => (
                  <path key={bandIndex} d={arcBand(band)} fill={`rgb(var(--${tone}))`} />
                ))}
              </g>
            ))}
          </svg>
        </span>
      </span>
    </div>
  );
}
