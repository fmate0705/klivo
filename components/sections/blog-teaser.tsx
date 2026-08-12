import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { ArrowLink } from '@/components/ui/button';
import { PostCard } from '@/components/blog/post-card';
import type { Post } from '@/lib/store/posts';

/**
 * A három legfrissebb bejegyzés a főoldalon.
 *
 * Ha nincs publikált bejegyzés, a szekció nem jelenik meg. Egy „hamarosan”
 * felirat üres helyen rosszabb, mint a semmi: azt üzeni, hogy az oldal nincs
 * kész.
 */
export function BlogTeaser({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <Section tone="surface">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Blog"
            title="Amit tudni érdemes, mielőtt weboldalt rendelsz"
            lead="Írásaink arról, hogyan lesz egy oldalból ügyfél: keresés, sebesség, árak, üzemeltetés."
            className="max-w-2xl"
          />
          <ArrowLink href="/blog" className="pb-2">
            Összes bejegyzés
          </ArrowLink>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
