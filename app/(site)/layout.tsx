import { getOrganization } from '@/lib/organization';
import { listSocialLinks } from '@/lib/store/social';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { MotionDriver } from '@/components/motion/motion-driver';
import { ImageWarmup } from '@/components/motion/image-warmup';
import { IntroCurtain } from '@/components/site/intro-curtain';
import { SiteNav } from '@/components/site/site-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { CookieConsent } from '@/components/site/cookie-consent';
import { Analytics } from '@/components/site/analytics';

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
/**
 * **A nyilvános oldal kérésre renderelődik, nem build időben.**
 *
 * A cég- és jogi adatok a `.env`-ből jönnek, és a konténer azokat **futásidőben**
 * kapja meg (`env_file` a compose-ban). A `.env` viszont szándékosan nincs benne
 * a Docker build kontextusában (lásd `.dockerignore`), tehát a build alatt
 * minden ilyen érték üres — előre renderelve a helyőrzők (`[adószám]`) égtek
 * bele a kész HTML-be, és onnantól semmilyen `.env` módosítás vagy újraindítás
 * nem látszott az oldalon. A lábléc, az impresszum és az ÁSZF mind így viselkedett.
 *
 * Kérésre renderelve a `.env` az marad, aminek a modul doksija mondja: az
 * adatok egyetlen élő forrása. Az ár mérve ~15 ms kiszolgálási idő a korábbi
 * ~5 ms helyett — a JSON adattár memóriában gyorsítótárazott, tehát a
 * renderelés nem olvas lemezt.
 */
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const organization = getOrganization();
  const social = await listSocialLinks();

  return (
    <>
      <JsonLd
        data={organizationJsonLd(
          organization,
          social.map((link) => link.url),
        )}
      />
      <JsonLd data={websiteJsonLd()} />

      <IntroCurtain />
      <MotionDriver />
      <ImageWarmup />

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
      {/* A mérés csak hozzájárulás után indul el — lásd `Analytics`. Az
          azonosítót a szerver olvassa futásidőben: `NEXT_PUBLIC_` előtaggal a
          build sütné be, a `.env` viszont nincs a Docker build kontextusában. */}
      <Analytics id={process.env.GA_MEASUREMENT_ID ?? ''} />
    </>
  );
}
