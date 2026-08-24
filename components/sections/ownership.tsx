import { ownership } from '@/lib/content/site';
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
 * A szekció itt véget is ér. Volt alatta egy négyoszlopos sáv az üzemeltetési
 * vállalásokkal, de az ugyanazt mondta el másodszor, amit a négy kártya — a
 * tulajdonjog kérdésére nem válaszolt, csak hosszabbá tette a szekciót.
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
      </Container>
    </Section>
  );
}
