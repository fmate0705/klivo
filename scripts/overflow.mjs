#!/usr/bin/env node
/**
 * Vízszintes túlcsordulás keresése.
 *
 *   node scripts/overflow.mjs
 *
 * Végigjárja a nyilvános oldalakat három töréspontban, és kiírja, melyik elem
 * lóg ki a nézetből. Mobilon ez a leggyakoribb néma elrendezési hiba: a lap
 * oldalra görgethetővé válik, és semmi sem jelzi.
 */
import { chromium } from 'playwright';
const b = await chromium.launch();
const paths = [
  '/',
  '/rolunk',
  '/folyamat',
  '/szolgaltatasok',
  '/szolgaltatasok/weboldal-keszites',
  '/referenciak',
  '/blog',
  '/blog/mit-jelent-az-ai-seo',
  '/kapcsolat',
  '/jogi/impresszum',
];
for (const w of [360, 768, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.addInitScript(() => {
    try {
      window.localStorage.setItem('klivo-cookie-consent', 'measure');
    } catch {
      // Privát módban nincs tároló — a buborék marad, de attól még mérhető.
    }
  });
  for (const path of paths) {
    await p.goto('http://localhost:3100' + path, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      if (de.scrollWidth > de.clientWidth) {
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if (b.right > de.clientWidth + 1 || b.left < -1) {
            over.push(
              el.tagName +
                '.' +
                String(el.className).slice(0, 60) +
                ' [' +
                Math.round(b.left) +
                '..' +
                Math.round(b.right) +
                ']',
            );
            if (over.length > 4) break;
          }
        }
      }
      return { sw: de.scrollWidth, cw: de.clientWidth, over };
    });
    if (r.sw > r.cw + 1)
      console.log(`TÚLCSORDULÁS ${w}px ${path}: ${r.sw} > ${r.cw}\n  ` + r.over.join('\n  '));
  }
  await p.close();
}
console.log('túlcsordulás-vizsgálat kész');
await b.close();
