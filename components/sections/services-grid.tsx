import { priceOf } from '@/lib/content/pricing';
import { services } from '@/lib/content/site';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { Card, CardLink } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * A három szolgáltatás.
 *
 * Minden kártyán ugyanaz a négy információ, ugyanabban a sorrendben: mi az,
 * mennyi, mit tartalmaz, hova visz tovább. Egy szolgáltatásválasztásnál az
 * összehasonlíthatóság többet ér, mint a változatosság — ezért néz ki mind a
 * három egyformán.
 *
 * Az árat itt is kiírjuk, nem csak az aloldalon. Aki árat keres és nem talál,
 * az nem kattint tovább, hanem elmegy.
 *
 * A kártya felépítése **azonos az árcsomagokéval** (`PriceTiers`): név, rövid
 * alcím, az ár nagyban, hullámvonal, felsorolás. Két különböző árkártya egy
 * oldalon azt üzenné, hogy kétféle ajánlatról van szó.
 */
export function ServicesGrid({
  tone = 'sky',
  band,
  title = 'Weboldal, egyedi fejlesztés és üzemeltetés',
  lead = 'Három szolgáltatás, egy csapat. A legtöbb munka az elsővel kezdődik, és a harmadikkal folytatódik — de bármelyik önmagában is megáll.',
}: {
  tone?: SectionTone;
  band?: SectionBand;
  title?: string;
  lead?: string;
}) {
  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={title} lead={lead} className="max-w-3xl" />

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={staggerDelay(index, 60)} className="flex">
              <Card interactive className="flex w-full flex-col">
                <h3 className="text-h5">
                  <CardLink href={`/szolgaltatasok/${service.slug}`}>{service.title}</CardLink>
                </h3>

                <p className="text-soft mt-1.5 text-body-sm">{service.summary}</p>

                <p data-numeric className="mt-5 font-display text-h3">
                  {priceOf(service.priceKey)}
                </p>

                <WaveRule className="mt-5" />

                <ul className="mt-5 flex flex-col gap-2.5 text-body-sm">
                  {service.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Pipa a felsorolásokhoz. Dekoráció, a jelentést a szöveg hordozza. */
function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-1 h-3.5 w-3.5 shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}
