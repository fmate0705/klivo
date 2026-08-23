import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/**
 * Felszálló buborékok.
 *
 * Halvány körök szállnak fel a kék szekciókban — annyi vízérzet, amennyi nem
 * vonja el a figyelmet az olvasnivalóról. Ezért lassúak (14–26 másodperc), és
 * ezért csak néhány szekcióban.
 *
 * **A méret erősen szór (4–26 pixel).** Csupa egyforma pont mintázatnak
 * látszana; a nagy és a kicsi buborék együtt viszont mélységet ad — a nagyok
 * közelinek, a kicsik távolinak olvasódnak.
 *
 * A pozíciók és az időzítések rögzítettek, nem véletlenek: a szerveren és a
 * kliensen ugyanaz kell hogy szülessen, különben hidratálási eltérés lenne —
 * és egy újratöltésenként máshogy kinéző oldal amúgy sem tervezés.
 *
 * Csökkentett mozgásnál a réteg nem jelenik meg (`globals.css`).
 */

const DOTS = [
  { left: '9%', size: 18, duration: '24s', delay: '0s', sway: 30, rise: 560 },
  { left: '17%', size: 6, duration: '18s', delay: '-6s', sway: -16, rise: 480 },
  { left: '28%', size: 11, duration: '21s', delay: '-11s', sway: 26, rise: 540 },
  { left: '37%', size: 4, duration: '16s', delay: '-3s', sway: -12, rise: 460 },
  { left: '46%', size: 26, duration: '26s', delay: '-15s', sway: 38, rise: 600 },
  { left: '55%', size: 7, duration: '19s', delay: '-9s', sway: -20, rise: 500 },
  { left: '64%', size: 14, duration: '23s', delay: '-2s', sway: 24, rise: 560 },
  { left: '73%', size: 5, duration: '17s', delay: '-13s', sway: -14, rise: 470 },
  { left: '81%', size: 21, duration: '25s', delay: '-19s', sway: 34, rise: 580 },
  { left: '89%', size: 8, duration: '20s', delay: '-7s', sway: -18, rise: 510 },
  { left: '96%', size: 12, duration: '22s', delay: '-16s', sway: 22, rise: 540 },
];

export function Bubbles({ className }: { className?: string }) {
  return (
    <div className={cn('bubbles', className)} aria-hidden="true">
      {DOTS.map((dot, index) => (
        <span
          key={index}
          className="bubbles__dot"
          style={
            {
              '--bubble-left': dot.left,
              '--bubble-size': `${dot.size}px`,
              '--bubble-duration': dot.duration,
              '--bubble-delay': dot.delay,
              '--bubble-sway': `${dot.sway}px`,
              '--bubble-rise': `${dot.rise}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
