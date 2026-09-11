import { faqs, pageMeta, showcase } from '@/lib/content/site';
import { listPartners } from '@/lib/store/partners';
import { getSiteSettings } from '@/lib/store/site-settings';
import { listWorksForHome } from '@/lib/store/works';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Hero } from '@/components/sections/hero';
import { PartnerStrip } from '@/components/sections/partner-strip';
import { Pillars } from '@/components/sections/pillars';
import { ServicesGrid } from '@/components/sections/services-grid';
import { Showcase } from '@/components/sections/showcase';
import { WorksTeaser } from '@/components/sections/works-teaser';
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
 * **A felületek körbejárnak:** mély kék → fehér → kék → fehér → kék →
 * világoskék → fehér → világoskék → fehér → kék. Minden váltást hullámsáv visz
 * át, és a hangsúly váltakozik: a nagy, világos↔sötét váltásoknál mély sáv, az
 * árnyalaton belülieknél vékony. Szomszédos szekció soha nem azonos felületű —
 * ezért függ a folyamat szekció sávja attól, megjelenik-e fölötte a referencia
 * szekció.
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

export default async function HomePage() {
  // A kapcsolható szekciók tartalmát **itt** olvassuk be, nem magukban a
  // szekciókban. Két dolog múlik rajta, és mindkettő a lap szintjén dől el: a
  // hullámlánc csak akkor helyes, ha tudjuk, megjelenik-e a referencia szekció,
  // és a nyitóképernyő is csak akkor hagyhatja el a zárósorát, ha tudja, hogy
  // partnersáv kerül alá.
  const settings = await getSiteSettings();
  const works = settings.works.enabled
    ? await listWorksForHome(settings.works.ids, settings.works.count)
    : [];
  const partners = settings.partners.enabled ? await listPartners() : [];

  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQS)} />

      {/* Partnersáv mellett a nyitóképernyő nem írja ki a saját zárósorát: a
          sáv veszi át ugyanazt a szerepet, és két záró gesztus egymás alatt
          kioltaná egymást. */}
      <Hero closing={partners.length === 0} />
      {/* A partnersáv nem új felület, hanem a nyitóképernyő folytatása:
          ugyanaz a mély kék, hullámhatár nélkül. Ezért nem borítja fel a lap
          hullámláncát — a Pillars akkor is kékről érkezik, ha a sáv ki van
          kapcsolva vagy nincs benne egyetlen embléma sem. */}
      <PartnerStrip partners={partners} />
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
      {/* A bemutató felületek után a valódi munkák: „ilyet tudunk” után
          „ilyet csináltunk”. A felület mély kék, mert a világos bemutató
          szekció után a váltás maga a hangsúly — és mert ez a lap második
          súlypontja a nyitóképernyő után. */}
      <WorksTeaser works={works} band={{ from: 'white', ...LOUD }} />
      {/* A folyamat arról a felületről érkezik, ami ténylegesen fölötte van:
          referenciákkal a mély kékről, nélkülük a fehér bemutató szekcióról.
          Rossz `from` értéknél látható varrás maradna a hullámhatáron. */}
      <ProcessSteps
        tone="sky"
        band={works.length > 0 ? { from: 'blue', ...LOUD } : { from: 'white', ...QUIET }}
      />
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
