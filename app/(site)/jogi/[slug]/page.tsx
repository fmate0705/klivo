import { notFound } from 'next/navigation';
import { legalPages } from '@/lib/content/site';
import { getLegalDocument } from '@/lib/legal';
import { getOrganization } from '@/lib/organization';
import { renderMarkdown } from '@/lib/markdown';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHeader } from '@/components/site/page-header';
import { FooterWave } from '@/components/site/footer-wave';
import { CookieSettings } from '@/components/site/cookie-settings';

/**
 * A jogi dokumentumok.
 *
 * A szövegek a `lib/legal.ts`-ben élnek, a cégadatok viszont a `.env`-ből
 * jönnek, és paraméterként kerülnek beléjük. Egy adószám- vagy címváltozáshoz
 * nem kell a kódhoz nyúlni, és nem fordulhat elő, hogy az impresszum és az ÁSZF
 * két különböző adatot mutat.

 */
export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = getLegalDocument(slug, getOrganization());
  if (!document) return {};

  return buildMetadata({
    title: document.title,
    description: document.description,
    path: `/jogi/${document.slug}`,
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = getOrganization();
  const document = getLegalDocument(slug, organization);
  if (!document) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: document.title, path: `/jogi/${document.slug}` },
        ])}
      />

      <PageHeader title={document.title} lead={document.description} />

      <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
        <Container width="prose">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(document.body) }}
          />

          {/* A süti tájékoztató nem csak leírja a szabályt, hanem eszközt is ad
              hozzá: a hozzájárulást ugyanolyan könnyen kell tudni visszavonni,
              ahogy megadták. */}
          {document.slug === 'cookie-tajekoztato' ? <CookieSettings /> : null}

          <p className="text-soft border-soft mt-12 border-t pt-6 text-body-sm">
            Hatályos: {document.updated}
          </p>
        </Container>
      </Section>

      <FooterWave from="white" />
    </>
  );
}
