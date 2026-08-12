import { PageHeader } from '@/components/site/page-header';
import { ServicesGrid } from '@/components/sections/services-grid';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { Faq } from '@/components/sections/faq';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSettings } from '@/lib/store/settings';
import { primaryCta } from '@/lib/site';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Szolgáltatások — weboldal, egyedi fejlesztés, tárhely',
  description:
    'Weboldal készítés, egyedi webalkalmazások és AI-integrációk, valamint tárhely és üzemeltetés. Fix ár, erős keresőoptimalizálás, napi mentés.',
  path: '/szolgaltatasok',
});

export default async function ServicesPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Szolgáltatások"
        title="Weboldal, webalkalmazás, üzemeltetés"
        lead="Három dolgot csinálunk, azt viszont végig: megépítjük az oldalad, kiegészítjük azzal, amire a működésedhez szükség van, és utána is mellette maradunk."
        art="/images/hosting-layers.webp"
        fadeTo="surface"
      >
        <ButtonLink href={primaryCta.href} size="lg">
          {primaryCta.label}
        </ButtonLink>
      </PageHeader>

      <ServicesGrid settings={settings} heading={false} />

      <ProcessTimeline />

      <Faq />

      <CtaBand />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Szolgáltatások', path: '/szolgaltatasok' },
        ])}
      />
    </>
  );
}
