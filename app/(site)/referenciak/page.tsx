import { pageMeta } from '@/lib/content/site';
import { listPublishedWorks } from '@/lib/store/works';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/site/page-header';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WorkCard } from '@/components/works/work-card';
import { CtaBand } from '@/components/sections/cta-band';

export const metadata = buildMetadata({
  title: pageMeta.works.title,
  description: pageMeta.works.description,
  path: '/referenciak',
});

/**
 * A referenciák listája.
 *
 * Az üres állapot itt kap helyet, és nem hallgatjuk el: ha még nincs
 * publikált esettanulmány, azt írjuk ki, ami igaz — nem tesszük ki
 * helyőrzőkártyák sorát, ami úgy néz ki, mintha munka lenne mögötte.
 *
 * A kártyák **fehér** felületen ülnek: a borítóképek háttere így beleolvad a
 * lapba, ahelyett hogy dobozként ülnének rajta. Ugyanez az elv a bemutató
 * felületeknél és a blognál.
 */
export default async function WorksPage() {
  const works = await listPublishedWorks();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Referenciák', path: '/referenciak' },
        ])}
      />

      <PageHeader
        title="Referenciák"
        lead="Valódi ügyfélmunkák. Mindegyiknél leírjuk, mi volt a feladat, mit építettünk, és mi lett belőle — nem csak képernyőképeket mutatunk."
      />

      <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
        <Container>
          {works.length > 0 ? (
            <>
              <h2 className="sr-only">Esettanulmányok</h2>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((work, index) => (
                  <Reveal
                    as="li"
                    key={work.id}
                    delay={staggerDelay(index, 60)}
                    className="flex min-w-0"
                  >
                    <WorkCard work={work} className="w-full" />
                  </Reveal>
                ))}
              </ul>
            </>
          ) : (
            <div className="max-w-prose">
              <h2 className="text-h3">Most készülnek az első esettanulmányok</h2>
              <p className="text-soft mt-4 text-body-lg">
                Dolgozunk rajta, hogy a munkáinkat itt részletesen is meg tudjuk mutatni. Addig is:
                ha kíváncsi vagy egy hasonló feladatra, kérdezd meg — elmondjuk, hogyan oldottuk
                meg.
              </p>
              <ButtonLink href="/kapcsolat" className="mt-8" arrow>
                Írj nekünk
              </ButtonLink>
            </div>
          )}
        </Container>
      </Section>

      <CtaBand band={{ from: 'white', layers: 3, depth: 'lg', flip: true }} />
    </>
  );
}
