import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Badge } from '@/components/ui/card';
import { ArrowLink } from '@/components/ui/button';
import { PostCard } from '@/components/blog/post-card';
import { CtaBand } from '@/components/sections/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatDate, toDateAttribute } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { getPublishedPostBySlug, getRelatedPosts, listPublishedPosts } from '@/lib/store/posts';

export const revalidate = 300;

/**
 * A publikált bejegyzések build időben elkészülnek; egy később felvett
 * bejegyzés az első kérésre generálódik le, és onnantól cache-elt marad.
 */
export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image || undefined,
    type: 'article',
    publishedTime: post.publishedAt ?? post.createdAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const html = renderMarkdown(post.body);

  return (
    <>
      <article>
        <header className="border-b border-border bg-surface pb-14 pt-[calc(var(--header-height)+3.5rem)] sm:pb-16">
          <Container width="prose">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="primary">{post.category}</Badge>
              <span className="text-sm text-subtle">{post.readingMinutes} perc olvasás</span>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl">{post.title}</h1>

            <p className="mt-6 text-lg leading-relaxed text-muted">{post.excerpt}</p>

            <div className="mt-8 flex items-center gap-3 text-sm text-subtle">
              <span>{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={toDateAttribute(post.publishedAt)}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </Container>
        </header>

        {post.image ? (
          <Container width="prose" className="-mt-2">
            {/* A borítókép keret nélkül áll: a lekerekítés elég ahhoz, hogy a
                lap részének látsszon, egy szegély viszont dobozba zárná. */}
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={post.image}
                alt={post.imageAlt || ''}
                fill
                priority
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        ) : null}

        <Section spacing="tight">
          <Container width="prose">
            {/* A törzs a saját, szűk Markdown rendererünkből jön. A szöveg
                escape-elve van, mielőtt bármilyen markup készülne belőle —
                lásd `lib/markdown.ts`. */}
            <div className="prose-klivo" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="mt-14 border-t border-border pt-8">
              <ArrowLink href="/blog">Vissza a blogra</ArrowLink>
            </div>
          </Container>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section tone="surface" spacing="tight">
          <Container>
            <h2 className="text-2xl">További írások</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <CtaBand />

      <JsonLd
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: 'Főoldal', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
    </>
  );
}
