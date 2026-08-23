import { about, pageMeta } from '@/lib/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { PageHeader } from '@/components/site/page-header';
import { ServicesGrid } from '@/components/sections/services-grid';
import { Team } from '@/components/sections/team';
import { listTeam } from '@/lib/store/team';
import { CtaBand } from '@/components/sections/cta-band';
import { WaveRule } from '@/components/wave/wave-rule';

export const metadata = buildMetadata({
  title: pageMeta.about.title,
  description: pageMeta.about.description,
  path: '/rolunk',
});

/**
 * A rólunk oldal.
 *
 * Nincs rajta csapatfotó és nincsenek kitalált számok („120+ projekt”). Amit
 * nem tudunk igazolni, azt nem írjuk ki — egy ügynökségi oldalon a kitalált
 * mérőszám az első dolog, amiért egy tájékozott megrendelő továbbáll.
 * Ami itt van, az négy munkamódszer, és mindegyikről eldönthető, hogy
 * teljesült-e.
 */
export default async function AboutPage() {
  const team = await listTeam();

  // A csapat szekció megléte egy lépéssel eltolja a felületek váltakozását.
  const hasTeam = team.length > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Rólunk', path: '/rolunk' },
        ])}
      />

      <PageHeader title={about.title} lead={about.intro}>
        <ButtonLink href="/kapcsolat" size="lg" arrow>
          Kérj ajánlatot
        </ButtonLink>
      </PageHeader>

      <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
        <Container>
          <SectionHeading
            title="Ahogy dolgozunk"
            lead="Négy dolog, amiben nem kötünk kompromisszumot. Nem szlogenek: mindegyikről meg lehet mondani, hogy teljesült-e."
            className="max-w-3xl"
          />

          <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2">
            {about.values.map((value, index) => (
              <Reveal key={value.title} delay={staggerDelay(index)}>
                <h3 className="text-h4">{value.title}</h3>
                <WaveRule className="mt-4" />
                <p className="mt-4 max-w-prose text-body text-soft">{value.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Team
        members={team}
        tone="sky"
        band={{ from: 'white', layers: 3, depth: 'md', flip: true }}
      />

      <ServicesGrid
        tone={hasTeam ? 'white' : 'sky'}
        band={{ from: hasTeam ? 'sky' : 'white', layers: 3, depth: 'md', flip: !hasTeam }}
        title="Amiben segítünk"
        lead="Weboldalt építünk, egyedi rendszert fejlesztünk, és üzemeltetjük is őket."
      />

      <CtaBand
        band={{ from: hasTeam ? 'white' : 'sky', layers: 3, depth: 'lg', flip: true }}
        title="Beszéljünk arról, mire van szükséged"
        lead="Nem sablonajánlatot küldünk. Előbb megértjük, mit csinálsz, és utána mondjuk meg, mi éri meg neked — és mi nem."
      />
    </>
  );
}
