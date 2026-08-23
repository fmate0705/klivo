/**
 * A gyakori kérdések megjelenési helyei.
 *
 * Külön fájlban, a tárolótól függetlenül: az admin szerkesztő **kliens
 * komponens**, és ha ezt a listát a tárolóból importálná, magával hozná a
 * `revalidateTag`-et is — az pedig csak szerveren létezik, és a build elszáll
 * tőle.
 *
 * Zárt lista, mert egy elgépelt kulcs némán eltüntetné a kérdést: sehol nem
 * jelenne meg, és semmi nem jelezné.
 */
export const FAQ_PAGES = [
  { key: 'fooldal', label: 'Főoldal' },
  { key: 'folyamat', label: 'Folyamat' },
  { key: 'kapcsolat', label: 'Kapcsolat' },
  { key: 'weboldal-keszites', label: 'Weboldal készítés' },
  { key: 'egyedi-fejlesztes', label: 'Egyedi fejlesztés és AI' },
  { key: 'tarhely', label: 'Tárhely és üzemeltetés' },
] as const;

export type FaqPageKey = (typeof FAQ_PAGES)[number]['key'];
