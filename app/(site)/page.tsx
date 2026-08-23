import { faqs, pageMeta, showcase } from '@/lib/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Hero } from '@/components/sections/hero';
import { Pillars } from '@/components/sections/pillars';
import { ServicesGrid } from '@/components/sections/services-grid';
import { Showcase } from '@/components/sections/showcase';
import { ProcessSteps } from '@/components/sections/process-steps';
import { Ownership } from '@/components/sections/ownership';
import { BlogTeaser } from '@/components/sections/blog-teaser';
import { FaqSection } from '@/components/sections/faq-section';
import { CtaBand } from '@/components/sections/cta-band';

/**
 * A főoldal.
 *
 * A szekciók sorrendje egy érvelés, nem tetszőleges felsorolás: mit kapsz
 * (ígéret) → miben segítünk (szolgáltatás) → hogy néz ki (bizonyíték) → hogyan
 * zajlik (folyamat) → mi lesz a tiéd (kockázat) → mit gondolunk (blog) → mi az,
 * ami még kérdés (GYIK) → beszéljünk (cselekvés).
 *
 * **A felületek körbejárnak:** mély kék → fehér → világoskék → fehér → kék →
 * világoskék → fehér → világoskék → kék → mély kék. Minden váltást hullámsáv
 * visz át, és a hangsúly váltakozik: a nagy, világos↔sötét váltásoknál öt réteg
 * mély sávon, az árnyalaton belülieknél három réteg vékonyon.
 *
 * A képes szekciók (bemutató felületek, blog) szándékosan **fehér** felületen
 * ülnek: a makettek háttere így beleolvad a lapba ahelyett, hogy dobozként
 * ülnének rajta.
 */
export const metadata = buildMetadata({
  title: pageMeta.home.title,
  description: pageMeta.home.description,
  path: '/',
  absoluteTitle: true,
});

/**
 * A strukturált adathoz kellő kérdések.
 *
 * A megjelenítés az adminból olvas (`FaqSection`), a JSON-LD viszont a
 * kiszolgáláskor ismert alapkészletből épül: a kettő ugyanarra a témára
 * vonatkozik, és a keresőnek nem az a fontos, hogy szó szerint egyezzen.
 */
const HOME_FAQS = faqs.slice(0, 5);

/** A nagy, világos↔sötét váltás: három hullám, mély sáv. */
const LOUD = { layers: 3, depth: 'lg' } as const;
/** A halk, árnyalaton belüli váltás: három hullám, közepes sáv. */
const QUIET = { layers: 3, depth: 'md' } as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQS)} />

      <Hero />
      {/* A nyitóképernyő után mindig sima fehér: a sötét kékből érkezve egy
          újabb sötét felület nem enged levegőt. */}
      <Pillars tone="white" band={{ from: 'blue', ...LOUD }} />
      {/* Előbb a példák, utána a szolgáltatások: aki most találkozik velünk,
          előbb látni akarja, mit építünk, és csak utána, hogy mennyiért. */}
      <ServicesGrid tone="blue" band={{ from: 'white', ...LOUD }} />
      <Showcase
        items={showcase.slice(0, 3)}
        tone="white"
        band={{ from: 'blue', ...LOUD, flip: true }}
      />
      <ProcessSteps tone="sky" band={{ from: 'white', ...QUIET }} />
      <BlogTeaser tone="white" band={{ from: 'sky', ...QUIET, flip: true }} />
      {/* A világoskék szekciók sávja az egyik sarokban lezúdul; a `flip`
          átviszi a másik oldalra, hogy a lapon ne ugyanott ismétlődjön. */}
      <Ownership tone="sky" band={{ from: 'white', ...QUIET, flip: true }} />
      <FaqSection
        page="fooldal"
        limit={5}
        tone="white"
        band={{ from: 'sky', ...QUIET, flip: true }}
      />
      <CtaBand band={{ from: 'white', ...LOUD }} />
    </>
  );
}
