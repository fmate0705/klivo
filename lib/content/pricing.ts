/**
 * Az árak szótára.
 *
 * Az árak *tartalmi* döntések, ezért a kódban élnek, egy helyen, és nem
 * szóródnak szét a szolgáltatás-leírások között. Egy áremelés így egyetlen fájl
 * egyetlen sorát érinti, és a főoldal, a szolgáltatás lista, az aloldal és a
 * strukturált adat egyszerre követi.
 *
 * Az értékek szándékosan sztringek, nem számok: az oldalon is szövegként
 * jelennek meg („149 000 Ft-tól”, „Egyedi ajánlat”), és a „-tól” éppolyan
 * fontos része az üzenetnek, mint az összeg. Egy szám mezőbe ez nem fér bele,
 * és a formázás minden hívási helyen újra eldöntendő kérdés lenne.
 */

export const prices = {
  // Weboldal csomagok
  websiteFrom: '149 000 Ft-tól',
  starter: '149 000 Ft',
  business: '249 000 Ft',
  professional: '399 000 Ft',
  custom: '599 000 Ft-tól',
  // Egyedi fejlesztés
  customProject: 'Egyedi ajánlat',
  // Üzemeltetés — havi és éves díj. Az éves fizetésnél a listaár is szerepel,
  // áthúzva: a kedvezmény csak akkor kedvezmény, ha látszik, mihez képest.
  hostingFrom: '9 900 Ft / hó-tól',
  careBasic: '9 900 Ft / hó',
  carePremium: '19 900 Ft / hó',
  careBasicYear: '109 900 Ft / év',
  careBasicYearList: '119 900 Ft',
  carePremiumYear: '219 900 Ft / év',
  carePremiumYearList: '239 900 Ft',
  externalSurcharge: '+5 000 Ft / hó',
  migrationFee: 'Egyedi ajánlat',
  // Kiegészítők
  extraPage: '25 000 – 40 000 Ft',
  extraFeature: 'Egyedi ajánlat',
  domain: 'Ügyfél saját nevén',
  hourlyRate: 'Megállapodás szerint',
  // Óradíjak a már üzemeltetett oldalakon.
  hourlyAdmin: '11 900 Ft / óra',
  hourlyDev: '16 900 Ft / óra',
  hourlyComplex: '19 900 Ft / óra',
  hourlyPriority: '24 900 – 29 900 Ft / óra',
} as const;

export type PriceKey = keyof typeof prices;

/** Egy ár feloldása kulcs alapján. */
export function priceOf(key: PriceKey): string {
  return prices[key];
}
