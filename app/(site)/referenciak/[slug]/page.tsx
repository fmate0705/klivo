import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedWorkBySlug, listPublishedWorks } from '@/lib/store/works';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LogoMark } from '@/components/ui/logo-mark';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WaveCurls } from '@/components/wave/wave-curls';
import { WorkCover } from '@/components/works/work-cover';
import { WorkCard } from '@/components/works/work-card';
import { WorkBlocks } from '@/components/works/work-blocks';
import { CtaBand } from '@/components/sections/cta-band';

/**
 * Egy esettanulmány.
 *
 * A fejléc ugyanaz a hullámmező, mint az aloldalaké, csak itt az **ügyfél** áll
 * elöl: embléma, cégnév, aztán a munka címe. Egy referencia oldalon az első
 * információ az, kiről van szó — a mi címsorunk csak a második.
 *
 * A törzset az admin rakja össze sablonblokkokból (`lib/content/work-blocks.ts`),
 * a megjelenítés a `WorkBlocks` dolga. Szabad HTML sehol nincs benne: a
 * hosszabb szövegmezők a `lib/markdown.ts` szűk nyelvtanát használják, ami
 * előbb escapel, csak utána épít markupot.
 */
export async function generateStaticParams() {
  const works = await listPublishedWorks();
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getPublishedWorkBySlug(slug);
  if (!work) return {};

  return buildMetadata({
    title: `${work.client} — ${work.title}`,
    description: work.excerpt,
    path: `/referenciak/${work.slug}`,
    type: 'article',
    ...(work.cover ? { image: work.cover } : {}),
    publishedTime: work.publishedAt ?? work.createdAt,
    modifiedTime: work.updatedAt,
  });
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getPublishedWorkBySlug(slug);
  if (!work) notFound();

  const others = (await listPublishedWorks()).filter((item) => item.id !== work.id).slice(0, 3);
  // A záró felhívás taraja onnan indul, ahol az utolsó szekció véget ér.
  const lastTone = others.length > 0 ? 'sky' : 'white';

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Referenciák', path: '/referenciak' },
          { name: work.client, path: `/referenciak/${work.slug}` },
        ])}
      />

      <article>
        <header
          data-tone="dark"
          className="relative isolate flex min-h-[clamp(26rem,44vh,32rem)] flex-col justify-center overflow-hidden bg-wave-9 pb-24 pt-32 text-on-dark lg:min-h-[34rem] lg:pb-28 lg:pt-40"
        >
          <WaveCurls align="top" waterline />

          <Container className="wave-content">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-4">
                {work.logo ? (
                  <LogoMark src={work.logo} alt={work.client} className="h-14 w-36 px-3 py-2" />
                ) : null}
                <p className="text-body-lg font-semibold">{work.client}</p>
              </div>

              <h1 className="rise mt-7 font-display text-h1">{work.title}</h1>

              <p
                className="rise mt-6 max-w-prose text-body-lg font-medium text-on-dark"
                style={{ '--rise-delay': '90ms' } as React.CSSProperties}
              >
                {work.excerpt}
              </p>

              <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-medium">
                {work.industry ? <span>{work.industry}</span> : null}
                {work.industry && work.year ? <span aria-hidden="true">·</span> : null}
                {work.year ? <span>{work.year}</span> : null}
                {work.industry || work.year ? <span aria-hidden="true">·</span> : null}
                <Link href="/referenciak" className="link-underline">
                  Összes referencia
                </Link>
              </p>
            </div>
          </Container>
        </header>

        <Section
          tone="white"
          band={{ from: 'blue', layers: 3, depth: 'lg' }}
          className="pt-16 md:pt-20 lg:pt-24"
        >
          <Container width="wide">
            <Reveal variant="figure">
              <WorkCover
                slug={work.slug}
                {...(work.cover ? { cover: work.cover, alt: work.coverAlt } : {})}
                sizes="(min-width: 1440px) 1360px, 100vw"
                priority
                className="border-soft aspect-[16/9] w-full rounded-panel border"
              />
            </Reveal>
          </Container>

          {work.services.length > 0 || work.siteUrl ? (
            <Container className="mt-12 lg:mt-16">
              <div className="border-soft flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-start sm:justify-between">
                {work.services.length > 0 ? (
                  <div>
                    <h2 className="text-body-sm font-semibold">Mit csináltunk</h2>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {work.services.map((service) => (
                        <li
                          key={service}
                          className="border-soft rounded-pill border px-3 py-1 text-body-sm"
                        >
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {work.siteUrl ? (
                  <a
                    href={work.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline shrink-0 text-body-sm font-medium"
                  >
                    Az élő oldal megnyitása
                  </a>
                ) : null}
              </div>
            </Container>
          ) : null}

          <div className="mt-14 lg:mt-20">
            <WorkBlocks blocks={work.blocks} />
          </div>
        </Section>
      </article>

      {others.length > 0 ? (
        <Section tone="sky" band={{ from: 'white', layers: 3, depth: 'md', flip: true }}>
          <Container>
            <h2 className="text-h3">További referenciák</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.id}
                  delay={staggerDelay(index, 60)}
                  className="flex min-w-0"
                >
                  <WorkCard work={item} className="w-full" />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        band={{ from: lastTone, layers: 3, depth: 'lg', flip: true }}
        title="Hasonlóra van szükséged?"
        lead="Mondd el, mit szeretnél, és fix árat adunk rá. Egy munkanapon belül válaszolunk."
      />
    </>
  );
}
