import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { WaveBand, type Tone } from '@/components/wave/wave-band';
import { Bubbles } from '@/components/wave/bubbles';

/**
 * Egy szekció: felület, függőleges ritmus, háttérhullám és a fölötte lévő
 * hullámsáv.
 *
 * Négy felület van, és ezek járnak körbe az oldalon: **fehér → világoskék →
 * kék → mély kék**. A szekció maga rajzolja ki a fölötte lévő hullámsávot, és
 * ehhez egyetlen dolgot kell tudnia: milyen színről érkezünk (`band.from`). A
 * cél színe a saját felülete. Így az oldal szintjén csak a sorrendet kell
 * helyesen megadni, a határok maguktól következnek belőle.
 *
 * **A szekció háttere sima.** Hullám csak a szekciók *között* van, a
 * határokon: ott vezet át egyik felületről a másikra. A szekció belsejében a
 * háttérminta csak versenyezne a tartalommal, és a hullám elveszítené a
 * jelentését — ha mindenhol hullám van, egyik sem jelent semmit.
 *
 * A függőleges térköz 80 / 96 / 128 px. Bőven a CEF spacing.policy felső
 * határán: a sok üres hely maga a prémium érzet, és a hullámoknak is kell hely,
 * hogy ne érjenek szöveghez.
 */

export type SectionTone = 'white' | 'sky' | 'blue' | 'deep';

/**
 * A szekció fölötti hullámsáv.
 *
 * A `from` a fentebbi szekció felülete. A `layers` és a `depth` a hangsúly:
 * két hullám vékony sávon halk átvezetés, három hullám mély sávon a nagy
 * váltás. Ennél több nem fér el anélkül, hogy zsúfolt legyen.
 */
export type SectionBand = {
  from: Tone;
  layers?: 2 | 3;
  depth?: 'sm' | 'md' | 'lg';
  flip?: boolean;
};

const TONE_CLASS: Record<SectionTone, string> = {
  white: 'bg-white text-ink',
  sky: 'bg-sky text-ink',
  blue: 'bg-blue text-on-dark',
  deep: 'bg-deep text-on-dark',
};

const DARK: SectionTone[] = ['blue', 'deep'];

export function Section({
  id,
  tone = 'white',
  band,
  /** Felszálló buborékok. Csak sötét szekcióban van értelme. */
  bubbles = false,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: SectionTone;
  band?: SectionBand;
  bubbles?: boolean;
  className?: string;
  children: ReactNode;
  /** Annak a címsornak az azonosítója, amely a szekciót elnevezi. */
  labelledBy?: string;
}) {
  const dark = DARK.includes(tone);

  return (
    <>
      {band ? (
        <WaveBand
          from={band.from}
          to={tone}
          flip={band.flip ?? false}
          {...(band.layers ? { layers: band.layers } : {})}
          {...(band.depth ? { depth: band.depth } : {})}
        />
      ) : null}

      <section
        id={id}
        aria-labelledby={labelledBy}
        data-tone={dark ? 'dark' : 'light'}
        className={cn('relative isolate py-20 md:py-24 lg:py-32', TONE_CLASS[tone], className)}
      >
        {bubbles ? <Bubbles /> : null}
        <div className="wave-content">{children}</div>
      </section>
    </>
  );
}
