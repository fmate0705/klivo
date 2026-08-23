import type { Service } from '@/lib/content/site';
import { priceOf } from '@/lib/content/pricing';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal } from '@/components/motion/reveal';
import { PriceTiers } from '@/components/sections/price-tiers';

/**
 * Egy szolgáltatás árazása.
 *
 * Négy blokk, ebben a sorrendben: csomagok → csomagon felüli tételek → mi
 * mozgatja az árat → mit rögzítünk írásban. Ez az a sorrend, ahogy egy
 * megrendelő gondolkodik: mennyi, mi jön még hozzá, miért annyi, és mi a
 * garancia rá.
 *
 * A kiemelt csomag a tartalomból jön (`ServiceTier.popular`), nem a
 * megjelenítésből: a „legkelendőbb” állítás tartalmi döntés, egy helyen
 * szerkeszthető, és nem szóródik szét a komponensek között.
 */
export function Pricing({
  band,
  service,
  tone = 'white',
  notes = true,
}: {
  band?: SectionBand;
  service: Service;
  tone?: SectionTone;
  /**
   * A csomagok alatti lábjegyzet (csomagon felüli tételek, ármozgató
   * tényezők, írásbeli vállalás). Ahol a csomagkártyák önmagukban is
   * teljesek, ott csak elvonja róluk a figyelmet.
   */
  notes?: boolean;
}) {
  const { pricing } = service;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading
          title="Átlátható árak, meglepetés nélkül"
          lead={pricing.intro}
          className="max-w-3xl"
        />

        {pricing.tiers ? <PriceTiers tiers={pricing.tiers} className="mt-14" /> : null}

        {notes ? (
          <>
            {/* A csomagokon kívüli információ **nem kártya**. Kártyán ugyanolyan
            súllyal jelenne meg, mint az árcsomagok, és elvenné róluk a
            figyelmet — pedig ez lábjegyzet, nem ajánlat. Ezért vékony
            elválasztóval, kisebb betűvel, három hasábban. */}
            <div className="border-soft mt-16 grid gap-x-12 gap-y-10 border-t pt-10 md:grid-cols-3 lg:mt-20">
              {pricing.extras && pricing.extras.length > 0 ? (
                <Reveal>
                  <h3 className="text-body font-semibold text-ink">Csomagon felül</h3>
                  <ul className="divide-soft mt-4 flex flex-col divide-y">
                    {pricing.extras.map((extra) => (
                      <li key={extra.label} className="flex flex-col gap-1 py-3">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <span className="text-body-sm text-ink-soft">{extra.label}</span>
                          <span data-numeric className="text-body-sm font-semibold text-ink">
                            {priceOf(extra.priceKey)}
                          </span>
                        </span>
                        {extra.note ? (
                          <span className="text-soft text-body-sm">{extra.note}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              <Reveal delay={60}>
                <h3 className="text-body font-semibold text-ink">Mi befolyásolja az árat?</h3>
                <ul className="text-soft mt-4 flex flex-col gap-2.5 text-body-sm">
                  {pricing.factors.map((factor) => (
                    <li key={factor} className="flex gap-2.5">
                      <Dot />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120}>
                <h3 className="text-body font-semibold text-ink">Amit írásban rögzítünk</h3>
                <p className="text-soft mt-4 text-body-sm">{pricing.closing}</p>
              </Reveal>
            </div>
          </>
        ) : null}
      </Container>
    </Section>
  );
}

/** Felsoroláspont. A jelentést a szöveg hordozza, ez csak a ritmus. */
function Dot() {
  return (
    <span aria-hidden="true" className="mt-[0.6em] block h-1 w-1 shrink-0 rounded-pill bg-deep" />
  );
}
