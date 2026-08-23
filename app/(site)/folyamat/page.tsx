import { pageMeta } from '@/lib/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/site/page-header';
import { ProcessSteps } from '@/components/sections/process-steps';
import { Ownership } from '@/components/sections/ownership';
import { FaqSection } from '@/components/sections/faq-section';
import { CtaBand } from '@/components/sections/cta-band';

export const metadata = buildMetadata({
  title: pageMeta.process.title,
  description: pageMeta.process.description,
  path: '/folyamat',
});

/**
 * A folyamat oldal.
 *
 * Itt van a teljes GYIK, és **csak itt**. A kérdés-válasz szerkezet
 * strukturált adata (FAQPage) a főoldalon él, négy kérdéssel; ugyanazt több
 * URL-en megismételve a kereső nem tudná, melyik az elsődleges, és jellemzően
 * egyiket sem mutatná meg.
 */
export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Folyamat', path: '/folyamat' },
        ])}
      />

      <PageHeader
        title="Így dolgozunk"
        lead="Nem tervrajzokat küldözgetünk hetekig. Megbeszéljük, mire van szükséged, fix árat adunk rá, megépítjük, és utána is melletted maradunk."
      >
        <ButtonLink href="/kapcsolat" tone="dark" size="lg" arrow>
          Kérj ajánlatot
        </ButtonLink>
      </PageHeader>

      <ProcessSteps
        tone="white"
        band={{ from: 'blue', layers: 3, depth: 'lg' }}
        title="A megkereséstől az élesítésig"
        lead="Öt lépés. Mindegyiknél tudod, mi történik éppen, mi következik, és mikor kell tőled valami."
      />

      <Ownership tone="sky" band={{ from: 'white', layers: 3, depth: 'md', flip: true }} />

      <FaqSection
        page="folyamat"
        tone="white"
        band={{ from: 'sky', layers: 3, depth: 'md' }}
        title="Gyakori kérdések a folyamatról"
        lead="Amit a legtöbben megkérdeznek, mielőtt elindulnánk."
      />

      <CtaBand band={{ from: 'white', layers: 3, depth: 'lg', flip: true }} />
    </>
  );
}
