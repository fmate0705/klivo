import type { Work } from '@/lib/store/works';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WorkCard } from '@/components/works/work-card';

/**
 * A kiemelt referenciák a főoldalon.
 *
 * **Mit dönt az admin, és mit a kód.** Az admin azt állítja, *hány* referencia
 * fér ide és *melyek* (`/admin/referenciak`); a szekció szövege és elrendezése
 * a kódban marad. Így egy szerkesztő nem tud véletlenül szétverni egy rácsot, és
 * a szöveg is ott él, ahol az oldal minden más szövege (egy adatnak egy helye
 * van).
 *
 * **A referenciákat a hívó oldal adja, nem ez a komponens olvassa be.** Nem
 * kényelmi döntés: ha a szekció maga döntené el, hogy megjelenik-e, a hívó
 * oldal nem tudná, milyen felületről érkezik az *alatta* lévő szekció — és egy
 * rossz `band.from` látható varrást hagy a hullámhatáron. Így a főoldal egy
 * helyen dönt a láthatóságról és a hullámláncról is.
 *
 * A felület **mély kék**, mint a szolgáltatásoké: ez a lap második súlypontja, és
 * a fehér bemutató szekció után a váltás maga a hangsúly. Az ügyfelek emblémái
 * világos korongon ülnek (`LogoMark`), tehát a sötét felület nem nyeli el őket.
 */
export function WorksTeaser({
  works,
  band,
  tone = 'blue',
  title = 'Referenciák: amit eddig építettünk',
  lead = 'Valódi ügyfélmunkák, nem bemutató felületek. Mindegyiknél leírjuk, mi volt a feladat, mit építettünk és mi lett belőle.',
}: {
  works: Work[];
  band?: SectionBand;
  tone?: SectionTone;
  title?: string;
  lead?: string;
}) {
  if (works.length === 0) return null;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading
          title={title}
          lead={lead}
          className="max-w-3xl"
          action={
            <ButtonLink href="/referenciak" variant="secondary" tone="dark" arrow>
              Referenciák
            </ButtonLink>
          }
        />

        {/* A rács osztása a darabszámhoz igazodik: két referenciánál egy
            háromhasábos rácsban árván maradna egy üres cella. */}
        <ul
          className={
            works.length === 2
              ? 'mt-14 grid gap-5 sm:grid-cols-2'
              : 'mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {works.map((work, index) => (
            <Reveal as="li" key={work.id} delay={staggerDelay(index, 60)} className="flex min-w-0">
              <WorkCard work={work} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
