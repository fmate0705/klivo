import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PostCard } from '@/components/blog/post-card';
import { CtaBand } from '@/components/sections/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site-url';
import { listPublishedPosts } from '@/lib/store/posts';
import { site } from '@/lib/site';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Blog — weboldal, keresés, üzemeltetés',
  description:
    'Írásaink arról, mibe kerül egy weboldal, mit jelent az AI-láthatóság, mitől gyors egy oldal, és hogyan érdemes üzemeltetni.',
  path: '/blog',
});

export default async function BlogPage() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Amit tudni érdemes, mielőtt weboldalt rendelsz"
        lead="Árakról, keresésről, sebességről és üzemeltetésről — magyarul, marketingszöveg nélkül."
      />

      <Section spacing="tight">
        <Container>
          {posts.length === 0 ? (
            <p className="text-lg text-muted">Hamarosan érkezik az első bejegyzés.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured ? <PostCard post={featured} featured priority /> : null}
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <CtaBand
        title="Kérdésed van egy konkrét oldalról?"
        lead="Ha nem találod a választ, kérdezz nyugodtan. Egy munkanapon belül válaszolunk."
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Főoldal', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: `${site.name} blog`,
            url: absoluteUrl('/blog'),
            inLanguage: 'hu-HU',
            blogPost: posts.slice(0, 10).map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              url: absoluteUrl(`/blog/${post.slug}`),
              datePublished: post.publishedAt ?? post.createdAt,
            })),
          },
        ]}
      />
    </>
  );
}
