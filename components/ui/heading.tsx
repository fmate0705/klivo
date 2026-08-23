import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/motion/reveal';

/**
 * Szekciócím és felvezető.
 *
 * Szándékosan nincs benne „szemöldök” (a cím fölötti apró, csupa nagybetűs
 * címke). Az a minta minden sablonon ugyanaz, nem hordoz információt, és a
 * képernyőolvasónak is csak zaj — a címsor maga mondja meg, miről van szó.
 *
 * A címsor szintje paraméter, mert a helyes szint az oldal szerkezetétől függ,
 * nem a mérettől: egy szekció címe a főoldalon `h2`, egy kártyarácson belül
 * `h3`. A méret és a szint így nem csúszik össze.
 *
 * Az `action` a cím **mellé**, a sor jobb szélére kerül — oda, ahol a
 * „mutasd az összeset” gombot keresi az ember. A felvezető alatti `children`
 * ettől külön él: az a szekcióhoz tartozó bevezető cselekvés helye.
 */
export function SectionHeading({
  id,
  as: Tag = 'h2',
  title,
  lead,
  align = 'left',
  className,
  action,
  children,
}: {
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** Gomb a cím sorának jobb szélén. Széles nézetben; keskenyen alá kerül. */
  action?: ReactNode;
  /** További tartalom a felvezető alatt — jellemzően egy gomb. */
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <Reveal as={Tag} className="text-h2">
          <span id={id}>{title}</span>
        </Reveal>

        {action ? (
          <Reveal delay={80} className="shrink-0 sm:pb-1">
            {action}
          </Reveal>
        ) : null}
      </div>

      {lead ? (
        <Reveal as="p" delay={60} className="text-soft max-w-prose text-body-lg font-medium">
          {lead}
        </Reveal>
      ) : null}

      {children ? (
        <Reveal delay={120} className="mt-2">
          {children}
        </Reveal>
      ) : null}
    </div>
  );
}
