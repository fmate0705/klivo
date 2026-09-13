import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedPostBySlug, getRelatedPosts } from '@/lib/store/posts';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate, toDateAttribute } from '@/lib/format';
import { buildMetadata } from '@/lib/seo/metadata';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { PostCover } from '@/components/blog/post-cover';
import { PostCard } from '@/components/blog/post-card';
import { WaveCurls } from '@/components/wave/wave-curls';
import { CtaBand } from '@/components/sections/cta-band';

/**
 * Egy blogbejegyzés.
 *
 * A fejléc sötét, mint minden aloldalé, de itt a cím alatt a szerzőségi sor is
 * ott van: rovat, dátum, olvasási idő. Mindhárom döntési információ (miről
 * szól, friss-e, belefér-e most), nem díszítés.
 *
 * A törzs a `lib/markdown.ts` szűk nyelvtanával renderelődik. A renderer előbb
 * escapel, csak utána épít markupot, tehát az adminból beírt szöveg soha nem
 * válhat futtatható HTML-lé — ezért adható át `dangerouslySetInnerHTML`-lel.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    ...(post.image ? { image: post.image } : {}),
    publishedTime: post.publishedAt ?? post.createdAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  // A záró felhívás taraja onnan indul, ahol az utolsó szekció véget ér.
  const relatedTone = related.length > 0 ? 'sky' : 'white';
  const published = post.publishedAt ?? post.createdAt;

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <article>
        <header className="relative isolate flex min-h-[clamp(28rem,46vh,34rem)] flex-col justify-center overflow-hidden bg-wave-2 pb-28 pt-32 text-ink lg:min-h-[38rem] lg:pb-32 lg:pt-40">
          <WaveCurls align="top" waterline />

          <Container className="wave-content">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-wave-9">
                  {post.category}
                </p>

                <h1 className="rise mt-3 font-display text-h1">{post.title}</h1>

                <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-medium text-ink">
                  <time dateTime={toDateAttribute(published)}>{formatDate(published)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} perc olvasás</span>
                  <span aria-hidden="true">·</span>
                  <Link href="/blog" className="link-underline hover:text-ink">
                    Vissza a bloghoz
                  </Link>
                </p>
              </div>

              <div className="lg:col-span-6">
                <PostCover
                  slug={post.slug}
                  {...(post.image ? { image: post.image, imageAlt: post.imageAlt } : {})}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  priority
                  className="aspect-[16/9] w-full overflow-hidden rounded-panel"
                />
              </div>
            </div>
          </Container>
        </header>

        <Section
          tone="white"
          band={{ from: 'blue', layers: 3, depth: 'lg' }}
          className="pt-16 md:pt-20 lg:pt-24"
        >
          <Container>
            {/* A szöveg a navigáció szélességét kapja, a sorhossz mégis
                kényelmes marad: a folyószöveg 62 rem-nél megáll, tehát nem lesz
                belőle 120 karakteres sor. */}
            <p className="text-ink-soft max-w-[62rem] text-body-lg font-medium">{post.excerpt}</p>

            <div
              className="prose mt-10 max-w-[62rem]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
            />
          </Container>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section tone="sky" band={{ from: 'white', layers: 3, depth: 'md', flip: true }}>
          <Container>
            <h2 className="text-h3">További írások</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.id}
                  delay={staggerDelay(index, 60)}
                  className="flex min-w-0"
                >
                  <PostCard post={item} className="w-full" />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        band={{ from: relatedTone, layers: 3, depth: 'lg', flip: true }}
        title="Weboldalt terveztek?"
        lead="Ha ebből az írásból arra jutottál, hogy nálad is van tennivaló, mondd el, mire van szükséged — fix árat adunk rá."
      />
    </>
  );
}
