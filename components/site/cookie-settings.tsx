'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CONSENT_REOPEN_EVENT, CONSENT_STORAGE_KEY } from '@/components/site/cookie-consent';

/**
 * A süti-választás visszavonása.
 *
 * A GDPR szerint a hozzájárulást **bármikor, ugyanolyan könnyen vissza kell
 * tudni vonni**, ahogy megadták — nem elég egyszer megmutatni a tájékoztatót,
 * és utána örökre elrejteni. A süti tájékoztató oldalán ezért van ez a gomb:
 * törli a mentett választ, és azonnal visszahívja a buborékot.
 *
 * Külön komponens, nem a jogi oldal része: a jogi oldalak szerveren
 * renderelődnek a Markdown szövegből, ez viszont a böngésző tárolójához nyúl.
 *
 * Nem navigál és nem tölt újra: a buborék egy eseményre azonnal megjelenik,
 * tehát a látogató ott marad, ahol volt, és rögtön látja, mi történt.
 */
export function CookieSettings() {
  const [done, setDone] = useState(false);

  function reopen() {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Privát módban nincs tároló. A buborék így is megjelenik — a
      // tájékoztatás megtörténik, csak nem tudjuk megjegyezni.
    }
    window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
    setDone(true);
  }

  return (
    <div className="border-soft bg-raised rounded-card mt-12 border p-6">
      <h2 className="text-h5">Süti-beállítás módosítása</h2>
      <p className="text-soft mt-3 text-body-sm">
        A korábbi tudomásulvételed bármikor visszavonhatod. A gombra kattintva a mentett válasz
        törlődik, és a tájékoztató újra megjelenik.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={reopen} variant="secondary" size="md">
          Tájékoztató újra megjelenítése
        </Button>
        {done ? (
          <span role="status" className="text-body-sm text-ink-soft">
            A mentett válasz törölve.
          </span>
        ) : null}
      </div>
    </div>
  );
}
