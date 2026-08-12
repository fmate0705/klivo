import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { GlowSpot } from '@/components/ui/section-art';
import type { ShowcaseItem } from '@/lib/site';

/**
 * Bemutató felületek: nagy, keret nélküli képek váltakozó sorokban.
 *
 * A képekkel kapcsolatos három döntés, és mindegyik szándékos:
 *
 * - **Nincs keret és nincs árnyék.** A mockupok saját, világos háttérrel jönnek;
 *   egy `mask-soft` maszk feloldja a szélüket a szekció hátterében, így a kép
 *   „beleúszik” az oldalba. Egy keret ugyanezt a problémát csak elfedné, és
 *   minden képet egy találomra odatett dobozba zárna.
 * - **Nagy méret, kevés darab.** Egy sorban egy kép, mellette a hozzá tartozó
 *   magyarázat. Négy apró kártya négyszer kéri a figyelmet, és egyiket sem kapja
 *   meg; egy nagy kép elmond egy dolgot, rendesen.
 * - **Váltakozó oldal.** A kép hol balra, hol jobbra kerül, így a szem
 *   cikkcakkban haladva olvassa a szöveget, nem egyenesen zuhan lefelé.
 *
 * A fejléc kiírja, hogy illusztrációkról van szó. Kitalált referencia helyett
 * ez a tisztességes megoldás — és pontosan ugyanazt magyarázza el.
 */
export function Showcase({
  items,
  exclude,
  eyebrow = 'Példák',
  title = 'Ilyen felületeket építünk',
  lead = 'Az alábbi képek illusztrációk: azt mutatják be, miről beszélünk, amikor webshopot, foglalási felületet vagy admin felületet említünk.',
  tone = 'default',
}: {
  items: ShowcaseItem[];
  /** Kihagyandó kép útvonala — jellemzően az, ami a fejlécben már szerepel. */
  exclude?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: 'default' | 'surface';
}) {
  const visible = exclude ? items.filter((item) => item.image !== exclude) : items;
  if (visible.length === 0) return null;

  return (
    // A szekció háttere pontosan a mockupok saját háttérszíne (`--mockup`).
    // Ettől nem látszik, hol ér véget a kép: keret nélkül, maszkkal feloldott
    // széllel a felület folytatásának hat. Ez az a részlet, amitől a bemutató
    // képek prémiumnak látszanak, nem odabiggyesztettnek.
    <Section tone={tone} className="isolate overflow-hidden bg-mockup">
      <GlowSpot className="-left-32 top-1/4" size="34rem" />
      <GlowSpot className="-right-32 bottom-1/4" color="accent" size="30rem" />

      <Container className="relative">
        <SectionHeader eyebrow={eyebrow} title={title} lead={lead} />

        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
          {visible.map((item, index) => (
            <article key={item.image} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div
                data-reveal="scale"
                className={
                  index % 2 === 0
                    ? 'lg:col-span-8 lg:col-start-1'
                    : 'lg:col-span-8 lg:col-start-5 lg:row-start-1'
                }
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={1200}
                  height={896}
                  sizes="(min-width: 1024px) 48rem, 100vw"
                  className="mask-soft h-auto w-full"
                />
              </div>

              <div
                data-reveal={index % 2 === 0 ? 'right' : 'left'}
                className={
                  index % 2 === 0
                    ? 'lg:col-span-4 lg:col-start-9'
                    : 'lg:col-span-4 lg:col-start-1 lg:row-start-1'
                }
              >
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
