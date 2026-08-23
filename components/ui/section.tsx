import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { WaveBand, type Tone } from '@/components/wave/section-divider';
import { SkyBand } from '@/components/wave/sky-band';
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
 * **A szekció háttere ott sima, ahol a szöveg fut.** A felület él, de csak a
 * szélein: a sötét szekciókban buborékok szállnak föl, a világoskékekben a
 * felső és az alsó élhez tapad néhány halk hullám (`WaveDrift`). A szekció
 * *közepén* nincs semmi — egy tartalom mögé terített minta versenyezne az
 * olvasnivalóval, és a hullám elveszítené a jelentését.
 *
 * Mindkettő a **felülethez** tartozik, nem a tartalomhoz, ezért nem is kell
 * külön kérni: a `tone` dönti el, melyik jár. Fehér felületen egyik sem — ott a
 * nyugalom a lényeg, és a `wave-2` amúgy sem látszana a fehéren.
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
  /**
   * A felület háttérrétege: buborék sötéten, hullám világoskéken.
   *
   * Alapból a `tone` dönt. Kikapcsolni ott érdemes, ahol a szekció tartalma
   * maga is nagy felület (kép, űrlap), és a háttér már zaj lenne.
   */
  texture = true,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: SectionTone;
  band?: SectionBand;
  texture?: boolean;
  className?: string;
  children: ReactNode;
  /** Annak a címsornak az azonosítója, amely a szekciót elnevezi. */
  labelledBy?: string;
}) {
  const dark = DARK.includes(tone);
  // A világoskék szekció **mindkét** oldalán a saját sáv áll: fölötte lefelé
  // zúdul, alatta fölfelé. Az alsót nem ez a szekció rajzolja, hanem a
  // következő — annak a `from` értéke világoskék, és ebből tudja, hogy
  // fordítva kell állnia.
  const sky = tone === 'sky' || band?.from === 'sky';

  return (
    <>
      {band ? (
        sky ? (
          // A világoskék szekciók saját sávot kapnak: abban a sarokfolt is
          // benne van, egyetlen rajzban. Lásd `components/wave/sky-band.tsx`.
          <SkyBand
            from={band.from}
            to={tone}
            rise={tone !== 'sky'}
            flip={band.flip ?? false}
            {...(band.depth ? { depth: band.depth } : {})}
          />
        ) : (
          <WaveBand
            from={band.from}
            to={tone}
            flip={band.flip ?? false}
            {...(band.layers ? { layers: band.layers } : {})}
            {...(band.depth ? { depth: band.depth } : {})}
          />
        )
      ) : null}

      <section
        id={id}
        aria-labelledby={labelledBy}
        data-tone={dark ? 'dark' : 'light'}
        className={cn(
          'relative isolate',
          // A világoskék szekciónak **nincs** függőleges térköze: két mély
          // hullámsáv fogja közre, azok adják a levegőt. A szokásos
          // szekció-térköz fölöslegesen eltolná a hullámoktól a tartalmat.
          tone === 'sky' ? 'py-0' : 'py-20 md:py-24 lg:py-32',
          TONE_CLASS[tone],
          className,
        )}
      >
        {texture && dark ? <Bubbles /> : null}
        <div className="wave-content">{children}</div>
      </section>
    </>
  );
}
