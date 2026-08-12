import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { RevealObserver } from '@/components/motion/reveal-observer';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { getSettings, organizationOf } from '@/lib/store/settings';

/**
 * A nyilvános oldalak kerete.
 *
 * Az admin szándékosan nem ezt használja: ott nincs se fejléc, se lábléc, se
 * scroll animáció — más a feladat, más a keret.
 *
 * A kihagyó link (`Ugrás a tartalomra`) az első fókuszálható elem a
 * dokumentumban. Billentyűzettel érkezőnek ez az egyetlen módja, hogy ne kelljen
 * minden oldalon végigtabolnia a navigáción.
 *
 * A cég strukturált adata (név, e-mail, telefon, székhely) a beállításokból jön,
 * nem a kódból — így egy adatváltozás után nem marad elavult telefonszám a
 * keresőkbe küldött JSON-LD-ben.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <a
        href="#tartalom"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-2.5 focus:text-background"
      >
        Ugrás a tartalomra
      </a>

      <Navbar />

      <main id="tartalom">{children}</main>

      <Footer />
      <RevealObserver />

      <JsonLd data={[organizationJsonLd(organizationOf(settings)), websiteJsonLd()]} />
    </>
  );
}
