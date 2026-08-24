'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { faqs } from '@/lib/content/site';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone, type SectionBand } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';

/**
 * Gyakori kérdések.
 *
 * A kérdések a cím alatt állnak, egy hasábban — nem a cím mellett. Egy
 * kérdéslistát fentről lefelé olvas az ember; oldalra tolva a címsor és az
 * első kérdés között fölösleges vízszintes ugrás van.
 *
 * **Balra igazítva és teljes szélességben**, egy hasábban. Két hasábban a szem
 * nem tudja, merre olvasson tovább, és egy nyitott válasz átrendezi a másik
 * oszlopot is.
 *
 * A kérdések az adminból jönnek (`/admin/gyik`), oldalanként szűrve. Amíg nincs
 * felvett kérdés, a beépített alapkészlet jelenik meg — egy üres GYIK rosszabb,
 * mint egy általános.
 *
 * **Minden kérdés külön kártya.** Az oldal minden más felsorolása is kártyákból
 * áll; egyetlen közös panelben a GYIK idegen test lett volna. A nyitott kártya
 * kerete megerősödik — így látszik, melyiken állunk.
 *
 * Egyszerre egy válasz van nyitva. Nem a helytakarékosság miatt: nyolc egyszerre
 * kinyitott bekezdés között ugyanúgy keresni kell, mint a nyitás előtt, tehát a
 * lenyíló szerkezet elveszítené az értelmét.
 *
 * A magasságot `grid-template-rows: 0fr → 1fr` animálja. Ez az egyetlen hely az
 * oldalon, ahol nem kizárólag `transform` mozog — egy lenyíló elem magassága
 * maga az interakció, azt nem lehet eltolással helyettesíteni. Felhasználó
 * indítja, egyszeri, 300 ms: nem folyamatos animáció, tehát nem terheli a
 * képkocka-költségvetést.
 *
 * Csukott állapotban a válasz `visibility: hidden` — így nem csak eltűnik, hanem
 * ki is kerül a képernyőolvasó fájából, miközben az összecsukódás még
 * animálható marad.
 */
export function Faq({
  band,
  items = faqs,
  title = 'Gyakori kérdések',
  lead = 'Amit a legtöbben megkérdeznek, mielőtt elindulnánk.',
  tone = 'sky',
}: {
  band?: SectionBand;
  items?: readonly { q: string; a: string }[];
  title?: string;
  lead?: string;
  tone?: SectionTone;
}) {
  // Alapból egyik kérdés sincs nyitva. Egy előre kinyitott válasz azt sugallja,
  // hogy az a fontos — pedig a látogató a sajátját keresi, és a nyitott blokk
  // csak lejjebb tolja a többit.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={title} lead={lead} />

        <ul className="mt-14 flex flex-col gap-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <li
                key={item.q}
                data-open={open}
                className={cn(
                  'bg-raised overflow-hidden rounded-card border shadow-raise transition-colors duration-feedback ease-standard',
                  open ? 'border-wave-5' : 'border-soft',
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left sm:px-7"
                  >
                    <span className="text-body-lg font-medium">{item.q}</span>
                    <PlusMinus open={open} />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-panel ease-standard',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="accordion-panel">
                    <p className="text-soft px-6 pb-6 pr-10 text-body-sm sm:px-7">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/** Plusz, amely mínusszá fordul. Két vonal, egy forgatás. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative mt-2 block h-3.5 w-3.5 shrink-0">
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
      <span
        className={cn(
          'absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-ui ease-standard',
          open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100',
        )}
      />
    </span>
  );
}
