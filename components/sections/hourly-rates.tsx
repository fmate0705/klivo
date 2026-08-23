import { hourlyRates } from '@/lib/content/site';
import { priceOf } from '@/lib/content/pricing';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { Card } from '@/components/ui/card';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Óradíjas módosítások.
 *
 * Négy sáv, a feladat összetettsége szerint. Az árak azért vannak kiírva, mert
 * a „megbeszéljük” válasz pontosan az a bizonytalanság, amiért az emberek nem
 * mernek kérni egy apró módosítást sem — és utána mégis kérnek, csak máshol.
 *
 * A kikötések a kártyák alatt, vékony sávban: fontosak, de nem ajánlatok, tehát
 * nem kaphatnak akkora súlyt, mint az árak.
 */
export function HourlyRates({ band, tone = 'white' }: { band?: SectionBand; tone?: SectionTone }) {
  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={hourlyRates.title} lead={hourlyRates.lead} className="max-w-3xl" />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {hourlyRates.tiers.map((tier, index) => (
            <Reveal as="li" key={tier.label} delay={staggerDelay(index, 60)} className="flex">
              <Card className="flex w-full flex-col">
                <h3 className="text-h5">{tier.label}</h3>

                <p data-numeric className="mt-4 font-display text-h4">
                  {priceOf(tier.priceKey)}
                </p>

                <WaveRule tone="soft" className="mt-5" />

                <p className="text-soft mt-5 text-body-sm">{tier.body}</p>
              </Card>
            </Reveal>
          ))}
        </ul>

        <div className="border-soft mt-12 grid gap-x-12 gap-y-6 border-t pt-8 md:grid-cols-3">
          {hourlyRates.notes.map((note, index) => (
            <Reveal key={note} delay={staggerDelay(index, 50)}>
              <p className="text-soft text-body-sm">{note}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
