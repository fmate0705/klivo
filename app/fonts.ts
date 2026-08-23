import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';

/**
 * Két betűcsalád, két feladattal.
 *
 * **Outfit** viszi a címsorokat. Geometrikus, barátságos formák, kilenc
 * fokozat — nagy méretben, 700-as súllyal és szoros betűközzel hangos és
 * magabiztos, mégsem rideg. A címsor az oldal leghangosabb eleme; ha az halk,
 * az egész oldal az.
 *
 * **Plus Jakarta Sans** viszi a folyószöveget. Magas x-magasság, nyitott
 * betűformák, kerekded részletek: barátságos és 17 pixelen is kényelmesen
 * olvasható hosszabb bekezdésben.
 *
 * Korábban talpas display betű (Instrument Serif) volt itt. Kicseréltem: a
 * szerkesztői talpas betű elegáns, de távolságtartó, és nem azt az azonnali,
 * barátságos hatást adja, amit ez az oldal kér.
 *
 * Mindkettő `next/font`-tal töltődik, tehát a build a saját kiszolgálónkra
 * másolja őket. Nincs külső kérés a Google felé (a CSP `font-src 'self'` így
 * maradhat szigorú), nincs elrendezés-ugrás a `size-adjust` miatt, és nincs
 * harmadik fél, aki a látogatót követhetné.
 */

export const fontDisplay = Outfit({
  subsets: ['latin-ext'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin-ext'],
  display: 'swap',
  variable: '--font-sans',
});
