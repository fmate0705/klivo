import { pillars } from '@/lib/content/site';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Az értékajánlat — négy kártya egymás mellett.
 *
 * A négy állítás egyenrangú, és egy sorban állva egyszerre látszik mind: a
 * szem végigfut rajtuk, ahelyett hogy négyszer görgetne. Ezért kártya és nem
 * lista — a kártya kiemeli az állítást a lapból, és fehér felületen a szöveg is
 * jobban olvasható.
 *
 * A cím a rács fölött, középen: így a négy oszlop szimmetrikus marad, és nem
 * kell egy ötödik hasábot kihagyni a címsornak.
 */
export function Pillars({ band, tone = 'white' }: { band?: SectionBand; tone?: SectionTone }) {
  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading
          title="Négy dolog, ami minden Klivo-oldalban közös"
          lead="Nem szolgáltatásokat sorolunk fel, hanem azt, amit az oldaladtól kapsz — akkor is, ha egyoldalas kampányoldalról van szó, és akkor is, ha egy egész webshopról."
          className="max-w-3xl"
        />

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.title} delay={staggerDelay(index, 60)} className="flex">
              <Card className="group flex w-full flex-col">
                <WaveRule />
                <h3 className="mt-5 text-h5">{pillar.title}</h3>
                <p className="text-soft mt-3 text-body-sm">{pillar.body}</p>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
