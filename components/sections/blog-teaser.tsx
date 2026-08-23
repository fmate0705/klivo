import { listPublishedPosts } from '@/lib/store/posts';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone, type SectionBand } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { PostCard } from '@/components/blog/post-card';

/**
 * A három legfrissebb bejegyzés a főoldalon.
 *
 * Ha még nincs publikált bejegyzés, a szekció **nem jelenik meg**. Egy üres
 * blogrovat a főoldalon rosszabb, mint a hiánya: azt üzeni, hogy elkezdtük és
 * abbahagytuk. Az üres állapotot a blog oldalán kezeljük, ahol a látogató
 * kifejezetten oda ment.
 */
export async function BlogTeaser({
  band,
  tone = 'white',
}: {
  band?: SectionBand;
  tone?: SectionTone;
} = {}) {
  const posts = (await listPublishedPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading
          title="Írásaink weboldalról és keresőoptimalizálásról"
          lead="Érthetően, marketingszöveg nélkül. Ugyanazokra a kérdésekre válaszolnak, amiket az ügyfeleink is feltesznek."
          action={
            <ButtonLink href="/blog" variant="secondary" arrow>
              Összes bejegyzés
            </ButtonLink>
          }
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal as="li" key={post.id} delay={staggerDelay(index, 60)} className="flex min-w-0">
              <PostCard post={post} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
