import type { Metadata } from 'next';
import { fontDisplay, fontSans } from '@/app/fonts';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SiteNav } from '@/components/site/site-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { WaveCurls } from '@/components/wave/wave-curls';

/**
 * A 404 oldal.
 *
 * A gyökérben él, nem a `(site)` csoportban, mert a Next.js a nem létező
 * útvonalakra — beleértve az elrendezésen kívülieket is — ezt szolgálja ki. Így
 * viszont nem örökli sem a betűtípus-változókat, sem a keretet: mindkettőt itt
 * kell kitenni. Enélkül a 404 lenne az egyetlen oldal az egész site-on, amely
 * rendszerbetűvel, fejléc és lábléc nélkül jelenne meg — pont ott, ahol a
 * látogató a legjobban rá van utalva a navigációra.
 *
 * A vízvonal és a lábléc ugyanaz a mély kék, tehát nem kell közéjük átvezetés —
 * ugyanúgy egybeolvadnak, mint a záró felhívás és a lábléc.
 *
 * **Egy cselekvés.** Aki eltévedt, annak nem választék kell, hanem kiút: a
 * főoldal. A fejlécben és a láblécben ott a teljes navigáció, ha valami
 * konkrétat keres.
 */
export const metadata: Metadata = {
  title: 'Ez az oldal nem található',
  description: 'A keresett oldal nem található. Innen tovább tudsz lépni a Klivo oldalain.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    // A lap kitölti a képernyőt: rövid tartalomnál a lábléc alatt különben
    // üres fehér sáv maradna, ami félkész oldal benyomását kelti.
    <div className={`${fontSans.variable} ${fontDisplay.variable} flex min-h-svh flex-col`}>
      <SiteNav />

      <main
        id="main"
        data-tone="dark"
        className="relative isolate flex flex-1 flex-col justify-center overflow-hidden bg-wave-9 pb-28 pt-32 text-on-dark lg:pb-32 lg:pt-40"
      >
        <WaveCurls align="top" waterline />

        <Container className="wave-content">
          <p
            data-numeric
            className="text-body-sm font-semibold uppercase tracking-[0.08em] text-on-dark/70"
          >
            404
          </p>

          <h1 className="mt-3 max-w-3xl font-display text-h1">Ez az oldal nem található</h1>

          <p className="mt-6 max-w-prose text-body-lg font-medium text-on-dark">
            Elképzelhető, hogy a cím megváltozott, vagy elgépelés történt. A tartalom többi része
            változatlanul elérhető — a fenti menüből minden oldal egy kattintásra van.
          </p>

          <div className="mt-9">
            <ButtonLink href="/" tone="dark" size="lg" arrow>
              Vissza a főoldalra
            </ButtonLink>
          </div>
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}
