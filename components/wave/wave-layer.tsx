import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { WAVE_VIEWBOX, wavePath, waveLine } from '@/lib/wave-path';

/**
 * Egy hullámréteg: tömör felület, a tetején hullámos taraj.
 *
 * **Miért két rész.** Az útvonal 100 egység magas nézetdobozban készül, és a
 * megjelenítés nyújtja ki. Ha ugyanez a doboz fedné a réteg teljes magasságát
 * is, akkor egy 1200 pixeles rétegnél a függőleges nyújtás tizenkétszeres
 * lenne — a sima ív meredek sátorrá torzulna. Ezért a taraj **külön, alacsony
 * sáv** a tömör blokk fölött: a magassága a hullámhosszhoz igazodik, tehát az
 * ív olyan lapos marad, amilyennek terveztük.
 *
 * A tömör rész a réteg tetejétől a szülő aljáig ér, sőt egy kicsit túl is.
 * Enélkül a réteg alján éles vízszintes él keletkezne ott, ahol a kitöltés
 * véget ér.
 *
 * A réteg kétszer olyan széles a szülőnél, és középre van igazítva: a
 * vízszintes sodródás így sehol nem enged rést a széleken.
 */

export type WaveLayerProps = {
  /** A felület színe — a kék skála egy tokenje (`wave-1` … `wave-9`). */
  tone: string;
  /** Hol kezdődik a réteg a szülő magasságához képest (0–1). */
  top: number;
  /** A taraj magassága. A hullám laposságát ez szabja meg. */
  crest?: string;
  /** Hány hullámhegy fér ki a szélességen. */
  crests?: number;
  /** Kitérés a taraj magasságához képest (0–0,5). */
  amplitude?: number;
  /** Fázistolás (0–1). Ettől nem esik egybe két réteg gerince. */
  phase?: number;
  /** A völgy laposítása (0–1). */
  skew?: number;
  /** A fehér fénykontúr erőssége (0–1). Nulla: nincs kontúr. */
  line?: number;
  /** A vízszintes sodródás mértéke. */
  drift?: string;
  duration?: string;
  delay?: string;
  zIndex?: number;
  /** Extra osztály a rétegre — a sodródást ezzel lehet más motorra kötni. */
  className?: string;
};

export function WaveLayer({
  tone,
  top,
  crest = 'clamp(40px, 4.5vw, 86px)',
  crests = 1.2,
  amplitude = 0.3,
  phase = 0,
  skew,
  line = 0,
  drift = '3%',
  duration,
  delay,
  zIndex,
  className,
}: WaveLayerProps) {
  const shape = {
    crests,
    amplitude,
    phase,
    ...(skew === undefined ? {} : { skew }),
  };

  return (
    <span
      className={cn('wave-layer', className)}
      style={
        {
          '--layer-color': `var(--${tone})`,
          '--layer-top': `${top * 100}%`,
          '--layer-crest': crest,
          '--layer-drift': drift,
          ...(duration ? { '--layer-duration': duration } : {}),
          ...(delay ? { '--layer-delay': delay } : {}),
          ...(zIndex === undefined ? {} : { zIndex }),
        } as CSSProperties
      }
    >
      <svg
        className="wave-layer__crest"
        viewBox={WAVE_VIEWBOX}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={wavePath({ ...shape, fill: 'down' })} fill="currentColor" />
        {line > 0 ? (
          <path
            d={waveLine(shape)}
            fill="none"
            stroke={`rgb(255 255 255 / ${line})`}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
    </span>
  );
}
