import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { renderMarkdown } from '@/lib/markdown';
import { getLegalDocument, listLegalDocuments } from '@/lib/legal';
import { getSettings, organizationOf } from '@/lib/store/settings';

/**
 * A jogi oldalak kérésenként renderelődnek.
 *
 * Ezek a lap legritkábban látogatott, viszont jogilag legkényesebb oldalai:
 * impresszum, ÁSZF, adatkezelési tájékoztató. Egy elavult adószám vagy
 * tárhelyszolgáltató itt nem „később majd frissül” kategória. Mivel a
 * renderelés néhány kilobájtnyi JSON beolvasásából áll, és ide jut a legkevesebb
 * kérés, a kérésenkénti generálás ára elhanyagolható — cserébe a `.env`-ből vagy
 * az adminból érkező adat mindig azonnal helyes, még közvetlenül egy újraindítás
 * után is.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const settings = await getSettings();
  const doc = getLegalDocument(slug, organizationOf(settings));
  if (!doc) return {};

  return buildMetadata({
    title: doc.title,
    description: doc.description,
    path: `/jogi/${doc.slug}`,
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationOf(await getSettings());
  const doc = getLegalDocument(slug, organization);
  if (!doc) notFound();

  const others = listLegalDocuments(organization).filter((item) => item.slug !== doc.slug);
  const html = renderMarkdown(doc.body);

  return (
    <>
      <PageHeader eyebrow="Jogi információk" title={doc.title} lead={doc.description} />

      <Section spacing="tight">
        {/* A jogi szöveg a teljes tartalomszélességet használja, nem szűk
            hasábot: itt a végigolvasás helyett a visszakeresés a jellemző
            használat, ahhoz pedig a rövidebb, kevesebb sorból álló dokumentum
            kényelmesebb. A `columns` kétszintű felsorolást nem törne jól, ezért
            marad egyetlen, széles hasáb. */}
        <Container>
          <p className="text-sm text-subtle">Hatályos: {doc.updated}</p>

          <div className="prose-klivo mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

          <nav aria-label="További jogi dokumentumok" className="mt-16 border-t border-border pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">
              További dokumentumok
            </h2>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/jogi/${item.slug}`}
                    className="text-[0.9375rem] text-primary transition-colors duration-fast hover:text-primary-hover"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: doc.title, path: `/jogi/${doc.slug}` },
        ])}
      />
    </>
  );
}
