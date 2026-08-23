import { getOrganization } from '@/lib/organization';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { MotionDriver } from '@/components/motion/motion-driver';
import { IntroCurtain } from '@/components/site/intro-curtain';
import { SiteNav } from '@/components/site/site-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { CookieConsent } from '@/components/site/cookie-consent';

/**
 * A nyilvános oldal kerete.
 *
 * A szervezet és a weboldal strukturált adata itt kerül be egyszer, nem
 * oldalanként: mindkettő az egész site-ra vonatkozik, és az aloldalak
 * `@id`-vel hivatkoznak rájuk ahelyett, hogy újra leírnák a céget.
 *
 * Az „Ugrás a tartalomra” hivatkozás az első fókuszálható elem. Billentyűzettel
 * vagy képernyőolvasóval így nem kell minden oldalon végigmenni a
 * navigáción — a lebegő sávnál ez nem apróság, mert a menü mindig ott van.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const organization = getOrganization();

  return (
    <>
      <JsonLd data={organizationJsonLd(organization)} />
      <JsonLd data={websiteJsonLd()} />

      <IntroCurtain />
      <MotionDriver />

      <a
        href="#main"
        className="sr-only rounded-pill bg-deep px-5 py-3 text-body-sm text-on-dark focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]"
      >
        Ugrás a tartalomra
      </a>

      <SiteNav />

      <main id="main">{children}</main>

      <SiteFooter />

      <CookieConsent />
    </>
  );
}
