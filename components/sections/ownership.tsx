import { assurances, ownership } from '@/lib/content/site';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone, type SectionBand } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { Card } from '@/components/ui/card';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Tulajdonjog és garanciák.
 *
 * A négy pont négy egyszerű kártya, egy sorban. Rövid cím, egy mondat — nincs
 * mit átfutni, a szem egyben látja mind a négyet.
 *
 * Utána egy tömör, négyoszlopos sáv zárja a szekciót az üzemeltetési
 * vállalásokkal. A kettő ugyanarról szól — miért nyugodt az, aki nálunk van —,
 * ezért egy szekcióban van a helyük, nem kettőben.
 *
 * A vállalások közül egyetlen szám kerül ki (a rendelkezésre állás), és az is
 * olyan, aminek egy megrendelő számára jelentése van. LCP-t és CLS-t
 * szándékosan nem mutatunk: azok fejlesztői mérőszámok.
 */
export function Ownership({ band, tone = 'white' }: { band?: SectionBand; tone?: SectionTone }) {
  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={ownership.title} lead={ownership.intro} className="max-w-3xl" />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {ownership.points.map((point, index) => (
            <Reveal as="li" key={point.title} delay={staggerDelay(index, 50)} className="flex">
              <Card className="group flex w-full flex-col">
                <WaveRule tone="soft" />
                <h3 className="mt-5 text-h5">{point.title}</h3>
                <p className="text-soft mt-3 text-body-sm">{point.body}</p>
              </Card>
            </Reveal>
          ))}
        </ul>

        <div className="border-soft mt-16 grid gap-8 border-t pt-10 sm:mt-24 sm:grid-cols-2 lg:grid-cols-4">
          {assurances.map((item, index) => (
            <Reveal key={item.title} delay={staggerDelay(index, 40)}>
              <h3 className="text-body font-semibold">{item.title}</h3>
              <p className="mt-2 text-body-sm text-soft">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
