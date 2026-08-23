import type { Metadata } from 'next';
import { fontDisplay, fontSans } from '@/app/fonts';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { WaveSwirl } from '@/components/wave/wave-swirl';

/**
 * A 404 oldal.
 *
 * A gyökérben él, nem a `(site)` csoportban, mert a Next.js a nem létező
 * útvonalakra — beleértve az elrendezésen kívülieket is — ezt szolgálja ki. Így
 * viszont nem örökli a betűtípus-változókat, ezért azokat itt is ki kell tenni;
 * enélkül a 404 lenne az egyetlen oldal az egész site-on, amely rendszerbetűvel
 * jelenne meg.
 *
 * Nem hibaüzenetet ad, hanem továbbvezet: aki eltévedt, annak három konkrét
 * hely kell, nem egy nagy „404” felirat.
 */
export const metadata: Metadata = {
  title: 'Nincs ilyen oldal',
  description: 'A keresett oldal nem található. Innen tovább tudsz lépni a Klivo oldalain.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      data-tone="dark"
      className={`${fontSans.variable} ${fontDisplay.variable} relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-blue py-24 text-on-dark`}
    >
      <WaveSwirl />

      <Container className="wave-content">
        <p data-numeric className="text-soft font-display text-h3">
          404
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-h1 lg:text-display">
          Ez az oldal nincs meg.
        </h1>

        <p className="text-soft mt-6 max-w-prose text-body-lg">
          Vagy elköltözött, vagy sosem létezett. Nem baj — innen egy kattintással ott vagy, ahova
          indultál.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg" arrow>
            Vissza a főoldalra
          </ButtonLink>
          <ButtonLink href="/szolgaltatasok" variant="secondary" tone="dark" size="lg">
            Szolgáltatások
          </ButtonLink>
          <ButtonLink href="/kapcsolat" variant="secondary" tone="dark" size="lg">
            Kapcsolat
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
