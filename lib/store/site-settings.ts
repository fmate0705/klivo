import { revalidateTag, unstable_cache } from 'next/cache';
import { DEFAULT_SETTINGS, type SiteSettings } from '@/lib/content/settings';
import { createDocument } from './json-store';

/**
 * Az adminból állítható megjelenési kapcsolók tárolása.
 *
 * **Nem tartalom, hanem elrendezés.** Szöveg ide nem kerül: a szekciók címe és
 * felvezetője a `lib/content/site.ts`-ben él, ahogy a projekt többi szövege is
 * (egy adatnak egy helye van). Ami itt van, az kizárólag az, amit a szerkesztő
 * *kapcsolgat*: látszik-e a partnersáv, hány referencia fér a főoldali
 * szekcióba, és melyek azok.
 *
 * Egyetlen JSON **dokumentum**, nem gyűjtemény: egy beállításnak nincs
 * sorrendje és nincs belőle több. A `createDocument` az alapértelmezésekre
 * olvas rá, tehát egy új kapcsoló azelőtt is működik, hogy a fájl újraíródna —
 * nincs migráció, és egy friss telepítésen sem lesz `undefined`.
 *
 * A típus és az alapértelmezés a `lib/content/settings.ts`-ben van, mert azt a
 * szerkesztő felület (kliens komponens) is használja, ez a modul viszont
 * `revalidateTag`-et húz be, ami csak szerveren létezik.
 */
const settings = createDocument<SiteSettings>('settings.json', DEFAULT_SETTINGS);

export const SETTINGS_TAG = 'settings';

const readSettings = unstable_cache(
  async () => settings.read(),
  ['klivo-settings', settings.fingerprint()],
  { tags: [SETTINGS_TAG] },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return readSettings();
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const next = await settings.update(patch);
  revalidateTag(SETTINGS_TAG);
  return next;
}
