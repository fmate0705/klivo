import { showcase, type ShowcaseItem } from '@/lib/content/site';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal } from '@/components/motion/reveal';
import { SmartImage } from '@/components/ui/smart-image';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Bemutató felületek.
 *
 * Váltakozó sorok: a kép hol balra, hol jobbra kerül, a szöveg mindig a másik
 * oldalra. Görgetés közben ettől cikázik a tekintet a kép és a bekezdés között
 * ahelyett, hogy egy hasábban lefelé zuhanna — és minden sornál újraindul az
 * olvasás. Egy egyforma kártyarács ugyanezt az öt elemet átugorhatóvá tenné.
 *
 * A felvezetőben kimondjuk, hogy ezek illusztrációk és nem ügyfélmunkák. Egy
 * ügynökségi oldalon a kitalált referencia az a fajta apró hazugság, amiből
 * később nem lehet visszajönni.
 */
export function Showcase({
  band,
  items = showcase,
  title = 'Ilyen felületeket építünk',
  lead = 'Ezek bemutató felületek, nem ügyfélmunkák — azt mutatják meg, milyen típusú oldalról van szó, amikor webshopról vagy foglalási rendszerről beszélünk.',
  tone = 'white',
}: {
  band?: SectionBand;
  items?: ShowcaseItem[];
  title?: string;
  lead?: string;
  tone?: SectionTone;
}) {
  if (items.length === 0) return null;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={title} lead={lead} className="max-w-3xl" />

        <div className="mt-16 flex flex-col gap-20 lg:mt-20 lg:gap-28">
          {items.map((item, index) => {
            const imageFirst = index % 2 === 0;

            return (
              <article
                key={item.image.src}
                className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
              >
                <Reveal
                  variant="figure"
                  className={cn(
                    'lg:col-span-7',
                    imageFirst ? 'lg:order-1' : 'lg:order-2 lg:col-start-6',
                  )}
                >
                  <SmartImage
                    src={item.image.src}
                    alt={item.image.alt}
                    width={1200}
                    height={896}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="rounded-panel border border-soft bg-sky"
                  />
                </Reveal>

                <div
                  className={cn(
                    'lg:col-span-5',
                    imageFirst ? 'lg:order-2' : 'lg:order-1 lg:row-start-1',
                  )}
                >
                  <Reveal delay={80}>
                    <h3 className="text-h3">{item.title}</h3>
                    <WaveRule className="mt-5" />
                    <p className="mt-5 max-w-prose text-body text-soft">{item.body}</p>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
