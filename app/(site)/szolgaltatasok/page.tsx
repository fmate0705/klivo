import { pageMeta } from '@/lib/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/site/page-header';
import { ServicesGrid } from '@/components/sections/services-grid';
import { Showcase } from '@/components/sections/showcase';
import { ProcessSteps } from '@/components/sections/process-steps';
import { HourlyRates } from '@/components/sections/hourly-rates';
import { CtaBand } from '@/components/sections/cta-band';

export const metadata = buildMetadata({
  title: pageMeta.services.title,
  description: pageMeta.services.description,
  path: '/szolgaltatasok',
});

/**
 * A szolgáltatások áttekintő oldala.
 *
 * Nem ismétli meg az aloldalak tartalmát: itt csak a választás történik meg,
 * a részletek és az árak az aloldalakon vannak. Ezért nincs is rajta GYIK — a
 * kérdések akkor jönnek, amikor már tudni lehet, miről van szó.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Szolgáltatások', path: '/szolgaltatasok' },
        ])}
      />

      <PageHeader
        title="Amiben segítünk"
        lead="Weboldalt építünk, egyedi rendszert fejlesztünk, és üzemeltetjük is őket. A legtöbb munka az elsővel kezdődik — de bármelyik önmagában is megáll."
      >
        <ButtonLink href="/kapcsolat" size="lg" arrow>
          Kérj ajánlatot
        </ButtonLink>
      </PageHeader>

      <ServicesGrid
        tone="white"
        band={{ from: 'blue', layers: 3, depth: 'lg' }}
        title="Szolgáltatásaink és áraik"
        lead="Mindegyiknél kiírjuk, hogy mit tartalmaz és mennyibe kerül. Az ajánlatot a munka előtt írásban rögzítjük."
      />
      <HourlyRates tone="blue" band={{ from: 'white', layers: 3, depth: 'lg' }} />
      <Showcase tone="white" band={{ from: 'blue', layers: 3, depth: 'lg', flip: true }} />
      <ProcessSteps tone="sky" band={{ from: 'white', layers: 3, depth: 'md' }} />
      <CtaBand band={{ from: 'sky', layers: 3, depth: 'lg', flip: true }} />
    </>
  );
}
