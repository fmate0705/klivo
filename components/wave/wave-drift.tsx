import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/**
 * Sarokmotívum a világoskék szekciókban.
 *
 * A referencia sarokformái nem sávok, hanem **a sarokba simuló, egymásra
 * rétegzett foltok**: mindegyik a szekció felső élén indul, lefelé-befelé
 * kanyarodik, és az oldalsó élen ér véget. A sarok maga tömör, a rétegek
 * kifelé mélyülnek.
 *
 * Ez a forma old meg egyszerre két dolgot, amin az összes korábbi változat
 * elbukott:
 *
 * 1. **Nincs mit levágni.** A folt két vége nem a levegőben végződik, hanem a
 *    szekció két élén — pontosan ott, ahol a felület amúgy is véget ér. Nincs
 *    tompa vég, nincs egyenes vágás a felület közepén.
 * 2. **Érintkezik a szekcióhatárral.** A felső él a határ alsó pereme, tehát a
 *    folt onnan indul: úgy néz ki, mintha a határ folytatódna a sarokban. A
 *    határhoz magához nem nyúlunk — az a `section-divider.tsx` dolga.
 *
 * **A görbe két köbös Bézier-ből áll, egy fordulóponttal.** Egyetlen ívből
 * lekerekített sarok lenne, nem hullám. A csatlakozásnál a vezérlőpontok
 * tükrözve vannak, tehát az érintő folytonos: a görbe nem törik meg. A felső
 * élnél függőleges, az oldalsónál vízszintes érintővel fut ki — így a folt
 * merőlegesen éri a szekció szélét, nem hegyesszögben.
 *
 * **Átlós pár.** Egy sarok magányos folt; négy sarok keret. A referencián a bal
 * felső és a jobb alsó sarok van kitöltve — ez a kettő egyensúlyban tartja a
 * felületet, és szabadon hagyja a másik átlót. A szekció sorszáma a két átló
 * között vált (`globals.css`), tehát a lapon nem ugyanaz ismétlődik.
 *
 * A tónus a `wave-6`-nál nem megy mélyebbre: tintaszínű szöveg azon még 5,3:1,
 * a `wave-7`-en viszont már csak 3,7:1 — a bal felső sarokban pedig ott áll a
 * szekció címsora.
 *
 * **Keskeny nézetben nincs.** Ott a tartalom a teljes szélességet elfoglalja,
 * tehát nincs margó, amiben a folt megállhatna.
 *
 * **Interaktív, ingyen.** A réteg ugyanazt a `curls__track` osztályt viseli,
 * mint a nyitóképernyő síkjai, tehát a `MotionDriver` ezt is mozgatja a mutató
 * után — külön szkript és külön figyelő nélkül.
 */

/** A rajzterület normalizált: a doboz nyújtja a helyére. */
const FIELD = 100;

type Layer = {
  /** Hol indul a felső élen, a doboz szélességének arányában. */
  top: number;
  /** Hol ér véget az oldalsó élen, a doboz magasságának arányában. */
  side: number;
  /**
   * A görbe hasa: mennyire dudorodik ki a fordulópont előtti szakasz.
   *
   * Nulla közelében a folt lekerekített sarok; a nagyobb érték adja a
   * hullámos, S-alakú élt.
   */
  bend: number;
  tone: string;
};

/**
 * A négy réteg, **kívülről befelé**.
 *
 * A legnagyobb, legmélyebb megy előre, és minden következő világosabb és
 * kisebb — így a sarok a legsötétebb, a folt pereme felé pedig világosodik,
 * ahogy a referencián. A `bend` rétegenként más, különben a négy él párhuzamos
 * lenne, és a folt egyetlen vastag szalagnak látszana.
 */
const LAYERS: Layer[] = [
  { top: 0.99, side: 0.99, bend: 0.34, tone: 'wave-6' },
  { top: 0.8, side: 0.83, bend: 0.52, tone: 'wave-5' },
  { top: 0.56, side: 0.63, bend: 0.36, tone: 'wave-4' },
  { top: 0.31, side: 0.38, bend: 0.58, tone: 'wave-2' },
];

/**
 * Egy sarokfolt útvonala.
 *
 * A görbe a felső él `top` pontjából indul függőleges érintővel, a
 * fordulóponton át az oldalsó él `side` pontjába fut vízszintes érintővel, majd
 * a sarkon keresztül zárul. A fordulópontnál a két vezérlőpont egymás tükörképe
 * — enélkül a görbe ott megtörne.
 */
function cornerPath(layer: Layer): string {
  const tx = layer.top * FIELD;
  const sy = layer.side * FIELD;

  const round = (value: number) => Math.round(value * 10) / 10;

  // Fordulópont: nagyjából a görbe közepén, a saroktól elhúzva.
  const mx = tx * 0.72;
  const my = sy * 0.54;

  // Az első szakasz hasa. A `bend` tolja kifelé a fordulópont előtti kart.
  const c2x = tx * (0.9 + layer.bend * 0.22);
  const c2y = sy * 0.38;

  // A második kar a fordulópont tükörképe — így folytonos az érintő.
  const c3x = 2 * mx - c2x;
  const c3y = 2 * my - c2y;

  return [
    `M${round(tx)} 0`,
    `C${round(tx)} ${round(sy * 0.24)} ${round(c2x)} ${round(c2y)} ${round(mx)} ${round(my)}`,
    `C${round(c3x)} ${round(c3y)} ${round(tx * 0.34)} ${round(sy)} 0 ${round(sy)}`,
    'L0 0',
    'Z',
  ].join(' ');
}

/** A két sarok: bal felső és jobb alsó — a referencia átlója. */
const CORNERS = [
  { key: 'tl', className: 'left-0 top-0', flip: '' },
  { key: 'br', className: 'right-0 bottom-0', flip: 'rotate(180deg)' },
];

export function WaveDrift({ className }: { className?: string }) {
  return (
    <div className={cn('curls curls--corner hidden lg:block', className)} aria-hidden="true">
      <span className="curls__track" data-pull={8} data-pull-y={-4}>
        {CORNERS.map((corner) => (
          <span
            key={corner.key}
            className={cn('absolute block', corner.className)}
            style={
              {
                // A doboz szándékosan keskeny: a szekció címsora a bal felső
                // sarokban kezdődik, és a folt nem érhet alá. A magassága a
                // szélesség kétszerese — a referencián is lefelé nyúlik el.
                width: 'clamp(84px, 10vw, 176px)',
                height: 'clamp(150px, 20vw, 344px)',
                transform: corner.flip || undefined,
              } as CSSProperties
            }
          >
            <svg
              className="block h-full w-full"
              viewBox={`0 0 ${FIELD} ${FIELD}`}
              preserveAspectRatio="none"
              focusable="false"
            >
              {LAYERS.map((layer, index) => (
                <path
                  key={index}
                  d={cornerPath(layer)}
                  fill={`rgb(var(--${layer.tone}))`}
                  // A fehér fénykontúr csak a görbén látszik: a két záróél a
                  // szekció szélére esik, azon kívülre nem fest a böngésző.
                  stroke="rgb(255 255 255 / 0.5)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </span>
        ))}
      </span>
    </div>
  );
}
