import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { hero, site } from '@/lib/content/site';
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
 * A megosztási kép.
 *
 * Kódból rajzoljuk, hogy sose kerüljön ki elavult kép a közösségi felületekre:
 * ha a szlogen vagy a nyitómondat változik, a kép vele változik. A szöveg
 * ezért nem is itt él, hanem a `lib/content/site.ts`-ben, a lap többi szövege
 * mellett.
 *
 * **A hullámok ugyanabból a mértanból készülnek, mint az oldalé**
 * (`lib/wave-ribbon.ts`): mintavételezett pontsor, Catmull-Rom spline, és két
 * határgörbe közötti valódi szalag, fehér kontúrral. Nem „hullámszerű" formák,
 * hanem ugyanaz a függvény, ami a szekcióhatárokat és a portrék hátterét
 * rajzolja — így a megosztási kép nem *emlékeztet* az oldalra, hanem az oldal.
 *
 * A tónusok fentről lefelé világosodnak, mint a nyitóképernyő vízvonalánál, és
 * a szalagok a kép alsó harmadában maradnak: fölöttük fut a szöveg, ott pedig
 * csak a két legmélyebb kék lehet — fehér szöveg a `wave-8`-on 5,8:1, a
 * `wave-9`-en 8,3:1.
 *
 * **A betűk az oldal betűi**, az `assets/fonts/` alól beolvasva. Ez nem
 * kényelmi döntés: a `next/font` woff2-t tesz a buildbe, azt viszont a
 * képgenerátor nem olvassa, és fallback betűvel a címsor **nem lesz félkövér** —
 * a `fontWeight: 700` némán elvész, és a kép egy másik márkáé lesz. Két
 * fájl, két súly: a címsoré (Outfit 700) és a felvezetőé (Plus Jakarta 500).
 *
 * A beolvasás a `process.cwd()`-ből megy, és ez biztonságos: a kép **build
 * időben** generálódik (statikus útvonal), tehát a fájlok ott vannak, ahol a
 * build fut. Futásidőben semmit nem olvas.
 */
export const runtime = 'nodejs';
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** A paletta, amivel dolgozunk. Ugyanazok az értékek, mint a `globals.css`-ben. */
const TONE = {
  wave2: '#F0F9FF',
  wave3: '#DBEEFC',
  wave4: '#B7DBF7',
  wave6: '#4FA9E3',
  wave7: '#2585CE',
  wave8: '#1667AE',
  wave9: '#0D4F8F',
  white: '#FFFFFF',
} as const;

const W = size.width;
const H = size.height;

/** Hány mintapontból épül egy határ. Fekvő formátumon több kell, mint állón. */
const SAMPLES = 28;

/**
 * A hullám kitérése.
 *
 * Minden határ ugyanekkora — csak a fázisuk más. Eltérő amplitúdóval két
 * szomszédos határ valahol összeérne, a szalag ott nullára fogyna, a
 * folytatásban pedig kifordulna.
 */
const AMP = 0.042;

/**
 * A határok nyugalmi magassága a kép arányában.
 *
 * Az első a vízvonal: efölött csak a mély kék van, ott fut a szöveg. A rés
 * mindenütt nagyobb, mint `2 × AMP`, tehát a határok nem keresztezhetik egymást.
 */
const EDGES = [0.62, 0.74, 0.84, 0.93];
const PHASES = [0.1, 0.52, 0.28, 0.76];

/** A szalagok tónusa fentről lefelé: a mély kékből a világos taréj felé. */
const FILLS = [TONE.wave8, TONE.wave7, TONE.wave6, TONE.wave4, TONE.wave2];

function boundary(edge: number, phase: number): Boundary {
  const points: Point[] = [];
  for (let index = 0; index <= SAMPLES; index += 1) {
    const x = (W * index) / SAMPLES;
    const t = (x / W) * 1.6 + phase;
    points.push([x, edge * H + AMP * H * wave(t)]);
  }
  return spline(points);
}

/** A márka betűi. Build időben, a projekt gyökeréből. */
async function loadFont(file: string): Promise<ArrayBuffer> {
  const buffer = await readFile(join(process.cwd(), 'assets', 'fonts', file));
  return Uint8Array.from(buffer).buffer;
}

export default async function OpengraphImage() {
  const [display, sans] = await Promise.all([
    loadFont('Outfit-Bold.ttf'),
    loadFont('PlusJakartaSans-Medium.ttf'),
  ]);

  const lines = EDGES.map((edge, index) => boundary(edge, PHASES[index] as number));
  const first = lines[0] as Boundary;
  const last = lines[lines.length - 1] as Boundary;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // A szöveg **fölül** van, nem alul: a vízvonal alatti szalagok között
        // világos tónusok is futnak, és fehér szöveg azokon olvashatatlan.
        justifyContent: 'flex-start',
        backgroundColor: TONE.wave9,
        padding: 72,
        position: 'relative',
      }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* A vízvonal fölötti mély kék: ez a szöveg felülete. */}
        <path d={above(first, 0, 0, W)} fill={TONE.wave9} />

        {lines.slice(0, -1).map((line, index) => (
          <path key={index} d={ribbon(line, lines[index + 1] as Boundary)} fill={FILLS[index]} />
        ))}

        <path d={below(last, 0, W, H)} fill={FILLS[FILLS.length - 1]} />

        {/* A fehér fénykontúr minden határon. Ez teszi láthatóvá a rétegeket —
              enélkül a szomszédos tónusok egymásba folynak. A vízvonal kontúrja
              halkabb: az ér legközelebb a szöveghez. */}
        {lines.map((line, index) => (
          <path
            key={`kontur-${index}`}
            d={forward(line)}
            fill="none"
            stroke={TONE.white}
            strokeOpacity={index === 0 ? 0.28 : 0.55}
            strokeWidth={2.5}
          />
        ))}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Ugyanaz a három hullámvonal, ami a fejléc jele és a favicon. */}
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke={TONE.white}
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M2 7c2.5 0 2.5-3.5 5-3.5S9.5 7 12 7s2.5-3.5 5-3.5S19.5 7 22 7" />
          <path d="M2 13.5c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
          <path d="M2 20c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
        </svg>
        <div
          style={{
            color: TONE.white,
            fontFamily: 'Outfit',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {site.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 56 }}>
        {/* A nyitóképernyő mondata, ugyanabból a forrásból. */}
        <div
          style={{
            color: TONE.white,
            fontFamily: 'Outfit',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            maxWidth: 900,
          }}
        >
          {hero.titleLines.join(' ')}
        </div>
        <div
          style={{
            color: TONE.wave3,
            fontFamily: 'Jakarta',
            fontSize: 31,
            fontWeight: 500,
            maxWidth: 820,
          }}
        >
          {site.tagline}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Outfit', data: display, weight: 700, style: 'normal' },
        { name: 'Jakarta', data: sans, weight: 500, style: 'normal' },
      ],
    },
  );
}
