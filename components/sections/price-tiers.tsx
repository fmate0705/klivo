'use client';

import { useState } from 'react';
import type { ServiceTier } from '@/lib/content/site';
import { priceOf } from '@/lib/content/pricing';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Az árcsomagok kártyái.
 *
 * Ez az oldal **egyetlen** árkártya-formája: a szolgáltatás aloldalak és a
 * főoldal is ezt használja. Egy másik elrendezésű árkártya a főoldalon azt
 * üzenné, hogy más ajánlatról van szó.
 *
 * **Az Éves/Havi váltó** csak akkor jelenik meg, ha van olyan csomag, amelynek
 * éves díja is van. Éves fizetésnél a listaár áthúzva mellette marad — a
 * kedvezmény csak akkor kedvezmény, ha látszik, mihez képest.
 *
 * **A kiemelt csomag** jelölése egy felirat a kártya tetején és egy erősebb
 * keret. Nem nagyítás és nem eltolás: egy kilógó kártya megbontja a rács
 * alapvonalát, és a szomszédjai mellette hibásnak látszanak.
 */
export function PriceTiers({
  tiers,
  className,
}: {
  tiers: readonly ServiceTier[];
  className?: string;
}) {
  const hasYear = tiers.some((tier) => tier.yearPriceKey);
  const [yearly, setYearly] = useState(false);

  return (
    <div className={className}>
      {hasYear ? (
        <Reveal className="mb-8 flex justify-start sm:-mt-14 sm:mb-10 sm:justify-end">
          <PeriodToggle yearly={yearly} onChange={setYearly} />
        </Reveal>
      ) : null}

      <ul
        className={cn(
          'grid gap-5',
          tiers.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2',
        )}
      >
        {tiers.map((tier, index) => {
          const useYear = yearly && tier.yearPriceKey;
          return (
            <Reveal as="li" key={tier.name} delay={staggerDelay(index, 60)} className="flex">
              <Card
                className={cn('flex w-full flex-col', tier.popular && 'border-wave-7 shadow-lift')}
              >
                {tier.popular ? (
                  <p className="mb-4 inline-flex w-fit items-center rounded-pill bg-blue px-3 py-1 text-body-sm font-semibold text-on-dark">
                    Legkelendőbb
                  </p>
                ) : null}

                <h3 className="text-h5">{tier.name}</h3>
                {tier.note ? <p className="text-soft mt-1.5 text-body-sm">{tier.note}</p> : null}

                <p data-numeric className="mt-5 font-display text-h3">
                  {priceOf(useYear ? (tier.yearPriceKey as never) : tier.priceKey)}
                </p>

                {useYear && tier.yearListPriceKey ? (
                  <p className="text-soft mt-1.5 text-body-sm">
                    <span data-numeric className="line-through">
                      {priceOf(tier.yearListPriceKey)}
                    </span>{' '}
                    helyett — egy hónapot megspórolsz.
                  </p>
                ) : null}

                <WaveRule className="mt-5" />

                <ul className="mt-5 flex flex-col gap-2.5 text-body-sm">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Dot />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Éves/Havi váltó.
 *
 * Két gomb egy csoportban, nem kapcsoló: a kapcsoló nem mondja meg, mi a másik
 * állapot, itt viszont mindkét lehetőség olvasható. A csúszó háttér
 * `transform`-mal mozog, tehát nem számoltat elrendezést.
 */
function PeriodToggle({
  yearly,
  onChange,
}: {
  yearly: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Fizetési időszak"
      className="border-soft bg-raised relative inline-flex rounded-pill border p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-pill bg-blue',
          'transition-transform duration-ui ease-standard',
          yearly && 'translate-x-full',
        )}
      />
      {(
        [
          { label: 'Havi', value: false },
          { label: 'Éves', value: true },
        ] as const
      ).map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={yearly === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative w-24 rounded-pill px-4 py-2 text-body-sm font-medium',
            'transition-colors duration-feedback ease-standard',
            yearly === option.value ? 'text-on-dark' : 'text-ink-soft hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Felsoroláspont. A jelentést a szöveg hordozza, ez csak a ritmus. */
function Dot() {
  return (
    <span aria-hidden="true" className="mt-[0.6em] block h-1 w-1 shrink-0 rounded-pill bg-wave-6" />
  );
}
