import { revalidateTag, unstable_cache } from 'next/cache';
import { createDocument } from './json-store';
import { DEFAULT_SETTINGS, PRICE_KEYS, type PriceKey, type Prices } from './prices';
import { defaultOrganization, type Company, type Contact, type Organization } from './organization';

/**
 * A szerkeszthető beállítások tárolása: árak, elérhetőség, cégadatok.
 *
 * A kulcsok, címkék és alapértelmezések a `./prices` és a `./organization`
 * modulban élnek, mert azokat kliens komponens is használja — ez a fájl
 * `node:fs`-t húz be, tehát kizárólag szerveren futhat.
 *
 * Az árak azért sztringek és nem számok, mert az oldalon is szövegként jelennek
 * meg („100 000 Ft-tól”, „Egyedi ajánlat”), és a „-tól” éppolyan fontos része az
 * üzenetnek, mint az összeg.
 */

export { PRICE_FIELDS, PRICE_KEYS, priceOf, type PriceKey, type Prices } from './prices';
export {
  CONTACT_FIELDS,
  COMPANY_FIELDS,
  ORGANIZATION_FIELDS,
  ORGANIZATION_MAX_LENGTH,
  emailHref,
  phoneHref,
  type Company,
  type Contact,
  type Organization,
  type OrganizationField,
} from './organization';

export type Settings = {
  prices: Prices;
  contact: Contact;
  company: Company;
  updatedAt: string;
};

/**
 * A tárolt dokumentum kezdőértéke.
 *
 * A cégadatok alapja a `.env`, ezért függvényként számoljuk ki: egy modulszintű
 * konstans a build pillanatában fagyasztaná be a környezeti változókat.
 */
function initialSettings(): Settings {
  const organization = defaultOrganization();
  return {
    prices: DEFAULT_SETTINGS.prices,
    contact: organization.contact,
    company: organization.company,
    updatedAt: '',
  };
}

const document = createDocument<Settings>('settings.json', initialSettings());

/**
 * A beállításokat használó oldalak gyorsítótár-címkéje.
 *
 * Miért címke és nem csak `revalidatePath`: az árak és a cégadatok az oldal
 * *minden* felületén megjelennek (lábléc, kapcsolat, jogi oldalak, JSON-LD,
 * llms.txt), és útvonalanként felsorolni őket törékeny — egy új oldal
 * hozzáadásakor némán kimaradna a listából. Ráadásul a `revalidatePath('/')`
 * mérésünk szerint pont a gyökér oldalt nem üríti megbízhatóan, tehát a főoldal
 * lábléce elavult telefonszámmal maradt volna.
 *
 * A címkézett olvasás ezt megoldja: minden oldal, amely `getSettings()`-et
 * hívott, ugyanahhoz a bejegyzéshez kötődik, és egyetlen `revalidateTag`
 * érvényteleníti mindet — a főoldalt is.
 */
export const SETTINGS_TAG = 'settings';

/**
 * Beolvassa a beállításokat.
 *
 * Minden csoport külön összefésülődik az alapértelmezéssel. Ennek két
 * következménye van, és mindkettő szándékos:
 *
 * - Ha új mező kerül a kódba, a régi `settings.json` mellett is működő értéket
 *   ad, ahelyett hogy `undefined`-ot renderelnénk az oldalra.
 * - Amíg egy mezőhöz nem nyúltak az adminban, a `.env` értéke érvényesül —
 *   tehát a környezeti változó cseréje elég egy még nem szerkesztett adathoz.
 */
export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    const stored = await document.read();
    const organization = defaultOrganization();

    return {
      prices: { ...DEFAULT_SETTINGS.prices, ...stored.prices },
      contact: { ...organization.contact, ...stored.contact },
      company: { ...organization.company, ...stored.company },
      updatedAt: stored.updatedAt ?? '',
    };
  },
  ['klivo-settings'],
  {
    tags: [SETTINGS_TAG],
    /**
     * A címke mellett idő alapú lejárat is kell.
     *
     * A címkét egy adminban végzett mentés üríti — de az alapértékek a `.env`-ből
     * jönnek, és azt a konténer újraindítása változtatja meg, nem egy mentés.
     * Lejárat nélkül a gyorsítótár a régi környezeti értéket őrizné meg
     * határozatlan ideig, és a `.env` átírása látszólag hatástalan maradna.
     * Öt perccel a szerkesztés továbbra is azonnali (címke), a környezeti
     * változás pedig legkésőbb ennyi idő alatt átfut.
     */
    revalidate: 300,
  },
);

/** A tárolt állapot a gyorsítótár megkerülésével — mentés előtti összefésüléshez. */
async function readSettings(): Promise<Settings> {
  const stored = await document.read();
  const organization = defaultOrganization();

  return {
    prices: { ...DEFAULT_SETTINGS.prices, ...stored.prices },
    contact: { ...organization.contact, ...stored.contact },
    company: { ...organization.company, ...stored.company },
    updatedAt: stored.updatedAt ?? '',
  };
}

export async function updatePrices(prices: Partial<Record<PriceKey, string>>): Promise<Settings> {
  const current = await readSettings();

  const next: Prices = { ...current.prices };
  for (const key of PRICE_KEYS) {
    const value = prices[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      next[key] = value.trim();
    }
  }

  const saved = await document.update({
    ...current,
    prices: next,
    updatedAt: new Date().toISOString(),
  });

  revalidateTag(SETTINGS_TAG);
  return saved;
}

/** Elérhetőség és cégadatok mentése. Üres mezőt nem írunk felül. */
export async function updateOrganization(input: {
  contact?: Partial<Contact>;
  company?: Partial<Company>;
}): Promise<Settings> {
  const current = await readSettings();

  const merge = <T extends Record<string, string>>(base: T, patch: Partial<T> | undefined): T => {
    if (!patch) return base;
    const next = { ...base };
    for (const [key, value] of Object.entries(patch)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        (next as Record<string, string>)[key] = value.trim();
      }
    }
    return next;
  };

  const saved = await document.update({
    ...current,
    contact: merge(current.contact, input.contact),
    company: merge(current.company, input.company),
    updatedAt: new Date().toISOString(),
  });

  revalidateTag(SETTINGS_TAG);
  return saved;
}

/** A cégadatok kiemelése a beállításokból, egy csomagban. */
export function organizationOf(settings: Settings): Organization {
  return { contact: settings.contact, company: settings.company };
}
