import { Hero } from '@/components/hero/hero';
import { Pillars } from '@/components/sections/pillars';
import { ServicesGrid } from '@/components/sections/services-grid';
import { Showcase } from '@/components/sections/showcase';
import { Ownership } from '@/components/sections/ownership';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { Assurances } from '@/components/sections/assurances';
import { BlogTeaser } from '@/components/sections/blog-teaser';
import { Faq } from '@/components/sections/faq';
import { CtaBand } from '@/components/sections/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSettings } from '@/lib/store/settings';
import { listPublishedPosts } from '@/lib/store/posts';
import { showcase, site } from '@/lib/site';

/**
 * Az oldal statikusan generálódik, és öt percenként frissül.
 *
 * Az adminban mentett árat vagy cégadatot nem kell megvárni: a mentés
 * érvényteleníti a `SETTINGS_TAG`, illetve a `POSTS_TAG` címkét, és az érintett
 * oldalak — ez is — azonnal újragenerálódnak. Az ötperces ablak csak a
 * biztonsági háló arra az esetre, ha egy jövőbeli adatforrás kimaradna a
 * címkézésből.
 */
export const revalidate = 300;

export const metadata = buildMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: '/',
  absoluteTitle: true,
});

export default async function HomePage() {
  const [settings, posts] = await Promise.all([getSettings(), listPublishedPosts()]);

  // A főoldalra két példa kerül: egy klasszikus bemutatkozó oldal és egy egyedi
  // felület. Négy egyszerre túl sok lenne itt — a többi a szolgáltatás oldalakon
  // van, ahol az olvasó már azt a témát keresi. Képútvonal szerint választunk,
  // nem index szerint: egy új elem beszúrása így nem cseréli ki némán a
  // főoldali példákat.
  const homeShowcase = ['/images/work-restaurant.webp', '/images/work-dashboard.webp']
    .map((image) => showcase.find((item) => item.image === image))
    .filter((item): item is (typeof showcase)[number] => Boolean(item));

  return (
    <>
      <Hero />

      <Pillars />

      <ServicesGrid settings={settings} />

      <Showcase items={homeShowcase} />

      <Ownership />

      <ProcessTimeline />

      <Assurances />

      <BlogTeaser posts={posts.slice(0, 3)} />

      <Faq />

      <CtaBand />

      <JsonLd data={faqJsonLd()} />
    </>
  );
}
