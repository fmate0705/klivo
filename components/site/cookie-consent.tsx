'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Süti-tájékoztató buborék.
 *
 * **Miért csak tudomásulvétel, és miért nincs „elutasítom” gomb.** Az oldal
 * egyetlen sütije a működéshez szükséges munkamenet-süti; nyomkövetés,
 * hirdetési azonosító és harmadik fél sehol nincs. Egy „elutasítom” gomb tehát nem csinálna semmit, és
 * pontosan az a fajta látszatválasztás lenne, amit a szabályozás tiltani akar.
 * Ha később bekerül bármilyen mérés, ez a komponens kap egy valódi választást —
 * addig őszintébb kiírni, hogy nincs mit eldönteni.
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

/** Ennyi idő után úszik be. A nyitó függöny 2,3 másodpercig tart. */
const APPEAR_DELAY_MS = 2800;

export function CookieConsent() {
  const [state, setState] = useState<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');

  useEffect(() => {
    // A tárolóhoz hozzáférés privát módban vagy zárolt tárolónál dobhat.
    let seen = false;
    try {
      seen = window.localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
    } catch {
      seen = true;
    }
    if (seen) return;

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

  function dismiss() {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, new Date().toISOString());
    } catch {
      // Ha nem tudjuk megjegyezni, a buborék legközelebb újra megjelenik.
      // Kellemetlen, de nem hiba: a tájékoztatás így is megtörtént.
    }
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
          Ez az oldal csak a működéshez szükséges sütit használ. Nyomkövetés, hirdetési azonosító és
          harmadik fél nincs rajta.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={dismiss} size="md">
            Rendben
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
