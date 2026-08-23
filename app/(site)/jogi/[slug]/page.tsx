import { notFound } from 'next/navigation';
import { legalPages } from '@/lib/content/site';
import { getLegalDocument } from '@/lib/legal';
import { getOrganization, hasIncompleteLegalData } from '@/lib/organization';
import { renderMarkdown } from '@/lib/markdown';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHeader } from '@/components/site/page-header';
import { FooterWave } from '@/components/site/footer-wave';

/**
 * A jogi dokumentumok.
 *
 * A szövegek a `lib/legal.ts`-ben élnek, a cégadatok viszont a `.env`-ből
 * jönnek, és paraméterként kerülnek beléjük. Egy adószám- vagy címváltozáshoz
 * nem kell a kódhoz nyúlni, és nem fordulhat elő, hogy az impresszum és az ÁSZF
 * két különböző adatot mutat.
 *
 * Ha a `.env`-ben maradt kitöltetlen mező, az oldal tetején figyelmeztetés
 * jelenik meg. Ez szándékosan feltűnő: egy hiányos impresszum jogi kockázat, és
 * a `[szögletes zárójeles]` helyőrző önmagában könnyen elsikkad a szövegben.
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

  const incomplete = hasIncompleteLegalData(organization);

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
          {incomplete ? (
            <div
              role="note"
              className="mb-10 rounded-card border border-danger/30 bg-sky p-5 text-body-sm"
            >
              <strong className="block font-semibold">Hiányos cégadatok</strong>
              <p className="mt-2 text-ink-soft">
                A dokumentumban <code>[szögletes zárójeles]</code> helyőrzők látszanak. Töltsd ki a
                hiányzó sorokat a <code>.env</code> fájlban, és indítsd újra a szervert. Élesítés
                előtt a jogi szövegeket nézesd át jogi szakemberrel.
              </p>
            </div>
          ) : null}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(document.body) }}
          />

          <p className="text-soft border-soft mt-12 border-t pt-6 text-body-sm">
            Hatályos: {document.updated}
          </p>
        </Container>
      </Section>

      <FooterWave from="white" />
    </>
  );
}
