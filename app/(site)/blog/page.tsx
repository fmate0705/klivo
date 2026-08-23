import { pageMeta } from '@/lib/content/site';
import { listCategories, listPublishedPosts } from '@/lib/store/posts';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/site/page-header';
import { PostFilter } from '@/components/blog/post-filter';
import { CtaBand } from '@/components/sections/cta-band';

export const metadata = buildMetadata({
  title: pageMeta.blog.title,
  description: pageMeta.blog.description,
  path: '/blog',
});

/**
 * A blog lista.
 *
 * Az üres állapot itt kap helyet, és nem hallgatjuk el: ha még nincs
 * bejegyzés, azt írjuk ki, ami igaz — nem egy „hamarosan” feliratú
 * helyőrzőkártyát mutatunk, ami úgy néz ki, mintha tartalom lenne.
 */
export default async function BlogPage() {
  const posts = await listPublishedPosts();
  const categories = await listCategories();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <PageHeader
        title="Írásaink weboldalról és keresőoptimalizálásról"
        lead="Érthetően, marketingszöveg nélkül. Ugyanazokra a kérdésekre válaszolunk, amiket az ügyfeleink is feltesznek — csak itt hosszabban."
      />

      <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
        <Container>
          {posts.length > 0 ? (
            <>
              <h2 className="sr-only">Bejegyzések</h2>
              <PostFilter posts={posts} categories={categories} />
            </>
          ) : (
            <div className="max-w-prose">
              <h2 className="text-h3">Még nincs publikált bejegyzés</h2>
              <p className="mt-4 text-body-lg text-soft">
                Most készülnek az első írások. Addig is: ha van konkrét kérdésed egy weboldalról
                vagy a keresőoptimalizálásról, kérdezd meg — válaszolunk rá.
              </p>
              <ButtonLink href="/kapcsolat" className="mt-8" arrow>
                Írj nekünk
              </ButtonLink>
            </div>
          )}
        </Container>
      </Section>

      <CtaBand band={{ from: 'white', layers: 3, depth: 'lg', flip: true }} />
    </>
  );
}
