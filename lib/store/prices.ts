/**
 * Az árak szótára — kulcsok, címkék és alapértelmezett értékek.
 *
 * Ez a modul szándékosan függőségmentes, és külön él a `settings.ts` tárolótól.
 * A tároló `node:fs`-t importál; ha egy kliens komponens *értéket* venne át
 * onnan, a teljes, csak Node alatt működő tároló bekerülne a böngésző
 * bundle-jébe, és a build elhasalna a feloldhatatlan `node:` sémán.
 *
 * A típusok fordításkor eltűnnek, tehát bárhonnan importálhatók; a futásidejű
 * értékek nem. Ezért van itt a lista, és ezért importálja az admin űrlap innen.
 */

export const PRICE_KEYS = [
  // Weboldal csomagok
  'websiteFrom',
  'starter',
  'business',
  'professional',
  'custom',
  // Egyedi fejlesztés
  'customProject',
  // Üzemeltetés
  'hostingFrom',
  'careBasic',
  'carePremium',
  'externalSurcharge',
  'migrationFee',
  // Kiegészítők
  'extraPage',
  'extraFeature',
  'domain',
  'hourlyRate',
] as const;

export type PriceKey = (typeof PRICE_KEYS)[number];

export type Prices = Record<PriceKey, string>;

/** Az admin űrlap ebből épül fel — a mezők sorrendje és leírása is innen jön. */
export const PRICE_FIELDS: {
  key: PriceKey;
  label: string;
  hint: string;
}[] = [
  {
    key: 'websiteFrom',
    label: 'Weboldal — induló ár (kártyán)',
    hint: 'A főoldali és a szolgáltatás listán megjelenő „-tól” ár.',
  },
  { key: 'starter', label: 'Starter csomag', hint: '1–3 oldal, egyszerű landing.' },
  { key: 'business', label: 'Business csomag', hint: '1–5 oldal, értékesítésre hangolva.' },
  {
    key: 'professional',
    label: 'Professional csomag',
    hint: '1–10 oldal, profi termék- és sales oldal.',
  },
  { key: 'custom', label: 'Custom csomag', hint: 'Egyedi felépítés, egyedi funkciók.' },
  {
    key: 'customProject',
    label: 'Egyedi fejlesztés és AI',
    hint: 'Ha nincs fix ár, hagyd „Egyedi ajánlat” értéken.',
  },
  {
    key: 'hostingFrom',
    label: 'Üzemeltetés — induló ár (kártyán)',
    hint: 'A főoldali és a szolgáltatás listán megjelenő havidíj.',
  },
  { key: 'careBasic', label: 'Website Care (alap)', hint: 'Havi üzemeltetési díj.' },
  { key: 'carePremium', label: 'Premium Care', hint: 'Bővített havi üzemeltetési díj.' },
  {
    key: 'externalSurcharge',
    label: 'Külsős oldal felára',
    hint: 'Nem általunk fejlesztett oldal üzemeltetésének havi felára.',
  },
  {
    key: 'migrationFee',
    label: 'Migrációs díj',
    hint: 'Külsős oldal átvételének egyszeri díja.',
  },
  { key: 'extraPage', label: 'Extra oldal', hint: 'Csomagon felüli aloldal ára.' },
  { key: 'extraFeature', label: 'Extra funkció', hint: 'Csomagon felüli funkció ára.' },
  {
    key: 'domain',
    label: 'Domain',
    hint: 'Hogyan jelenjen meg a domain költsége. Például: „Ügyfél saját nevén”.',
  },
  {
    key: 'hourlyRate',
    label: 'Módosítások óradíja',
    hint: 'Ha nem szeretnél konkrét összeget kiírni, írj ide szöveget.',
  },
];

export const DEFAULT_SETTINGS: { prices: Prices } = {
  prices: {
    websiteFrom: '149 000 Ft-tól',
    starter: '149 000 Ft',
    business: '249 000 Ft',
    professional: '399 000 Ft',
    custom: '599 000 Ft-tól',
    customProject: 'Egyedi ajánlat',
    hostingFrom: '9 900 Ft / hó-tól',
    careBasic: '9 900 Ft / hó',
    carePremium: '19 900 Ft / hó',
    externalSurcharge: '+5 000 Ft / hó',
    migrationFee: 'Egyedi ajánlat',
    extraPage: '25 000 – 40 000 Ft',
    extraFeature: 'Egyedi ajánlat',
    domain: 'Ügyfél saját nevén',
    hourlyRate: 'Megállapodás szerint',
  },
};

/** Egy ár feloldása kulcs alapján. Nem nyúl a tárolóhoz, ezért kliensen is fut. */
export function priceOf(settings: { prices: Prices }, key: PriceKey): string {
  return settings.prices[key] ?? DEFAULT_SETTINGS.prices[key];
}
