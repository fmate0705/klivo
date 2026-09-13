'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Süti-tájékoztató buborék.
 *
 * **Valódi választás, mert van mit eldönteni.** Korábban csak tudomásulvétel
 * volt: az oldalon egyetlen süti futott, a munkamenet-süti, tehát egy
 * „elutasítom” gomb látszatválasztás lett volna. A látogatómérés (Google
 * Analytics) megjelenésével ez megváltozott — az **nem** működéshez szükséges,
 * és az EU-ban **előzetes hozzájárulás** kell hozzá.
 *
 * Ezért a buborék két gombot ad, és a mérés **csak az elfogadás után indul el**
 * (`components/site/analytics.tsx`). Elutasításnál semmilyen mérőkód nem
 * töltődik be — nem „opt-out” után áll le, hanem el sem indul.
 *
 * A választ a `localStorage` őrzi, nem süti: egy süti-tájékoztatót sütivel
 * megjegyezni felesleges kör, és a szervert sem érdekli.
 *
 * A buborék **késleltetve** jelenik meg. Rögtön a nyitó függöny után beúszva
 * versenyezne a nyitóképernyővel; másfél másodperc múlva viszont már a
 * tartalmat nézi az ember, és a sarokban felbukkanó panel nem tolakszik.
 */

export const CONSENT_STORAGE_KEY = 'klivo-cookie-consent';

/**
 * A süti-tájékoztató **újranyitásának** jelzése.
 *
 * A GDPR szerint a látogatónak bármikor meg kell tudnia változtatni a
 * választását, nem csak az első megjelenéskor. A süti tájékoztató oldalán ezért
 * van egy gomb, ami törli a mentett választ, és ezzel az eseménnyel visszahívja
 * a buborékot — újratöltés nélkül, azonnal.
 */
export const CONSENT_REOPEN_EVENT = 'klivo:consent-reopen';

/**
 * A választás **megváltozásának** jelzése.
 *
 * A mérőkód ezt figyeli: elfogadásra azonnal elindul, újratöltés nélkül. Egy
 * `storage` esemény erre nem jó — az csak a *másik* fülön sül el.
 */
export const CONSENT_CHANGED_EVENT = 'klivo:consent-changed';

/** A mentett válasz. Bármi más (régi időbélyeg) tudomásulvételnek számít. */
export type ConsentChoice = 'accepted' | 'rejected';

/**
 * A tárolt válasz beolvasása.
 *
 * A korábbi változat időbélyeget mentett ide, amikor még nem volt mit
 * eldönteni. Azt **nem** vesszük elfogadásnak: mérésre nem adott hozzájárulást
 * senki, aki csak egy tájékoztatót vett tudomásul. Az ilyen látogató újra
 * megkapja a buborékot, most már két gombbal.
 */
export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

/** Ennyi idő után úszik be. A nyitó függöny 2,3 másodpercig tart. */
const APPEAR_DELAY_MS = 2800;

export function CookieConsent() {
  const [state, setState] = useState<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');

  useEffect(() => {
    // Privát módban vagy zárolt tárolónál a hozzáférés dobhat; ilyenkor a
    // `readConsent` `null`-t ad, és a buborék megjelenik. Inkább kérdezzünk
    // egyszer feleslegesen, mint hogy hozzájárulás nélkül mérjünk.
    if (readConsent() !== null) return;

    const timer = window.setTimeout(() => {
      setState('entering');
      window.requestAnimationFrame(() => setState('visible'));
    }, APPEAR_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  // Újranyitás a süti tájékoztató oldaláról. A figyelő akkor is él, amikor a
  // buborék rejtve van: a komponens ilyenkor is a fában marad, csak nem rajzol.
  useEffect(() => {
    const reopen = () => {
      setState('entering');
      window.requestAnimationFrame(() => setState('visible'));
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
  }, []);

  function choose(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ha nem tudjuk megjegyezni, a buborék legközelebb újra megjelenik.
      // Kellemetlen, de nem hiba — és mérni ilyenkor sem fogunk kérdés nélkül.
    }
    // A mérőkód erre indul el, újratöltés nélkül.
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: choice }));
    setState('leaving');
    window.setTimeout(() => setState('hidden'), 320);
  }

  if (state === 'hidden') return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Tájékoztató a sütikről"
      data-open={state === 'visible'}
      className="consent"
    >
      <div className="bg-raised border-soft rounded-panel border p-6 shadow-lift">
        <h2 className="text-h5">Sütikről röviden</h2>
        <WaveRule tone="soft" className="mt-3" />

        <p className="text-soft mt-4 text-body-sm">
          A működéshez szükséges sütiken felül névtelen látogatómérést használnánk, hogy lássuk,
          mely oldalak hasznosak. Hirdetési azonosító nincs rajta, és a döntésed bármikor
          megváltoztathatod.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => choose('accepted')} size="md">
            Elfogadom
          </Button>
          <Button onClick={() => choose('rejected')} variant="secondary" size="md">
            Csak a szükségeset
          </Button>
          <Link
            href="/jogi/cookie-tajekoztato"
            className="link-underline text-body-sm text-ink-soft"
          >
            Részletek
          </Link>
        </div>
      </div>
    </div>
  );
}
