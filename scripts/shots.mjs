#!/usr/bin/env node
/**
 * Képernyőképek a böngésző-ellenőrzéshez.
 *
 *   node scripts/shots.mjs [útvonal...] [--w=szélesség] [--full]
 *
 * A CEF lifecycle „Browser Validation” szakaszához készült: a kimenet
 * összehasonlítható, azonos nagyítású kép minden töréspontról.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const paths = args.filter((a) => !a.startsWith('--'));
const width = Number(args.find((a) => a.startsWith('--w='))?.slice(4) ?? 1440);
const full = args.includes('--full');
const height = Number(args.find((a) => a.startsWith('--h='))?.slice(4) ?? 900);
const out = 'C:/Users/mate/AppData/Local/Temp/klivo-shots';

mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

// A süti-buborék rögzített pozíciójú: a teljes oldalas felvételen végigkísérné
// a lapot, és eltakarná a tartalmat. A felvétel előtt „elfogadott” állapot.
await page.addInitScript(() => {
  try {
    window.localStorage.setItem('klivo-cookie-consent', 'measure');
  } catch {
    // Privát módban nincs tároló — a buborék marad a képen.
  }
});

for (const path of paths.length ? paths : ['/']) {
  await page.goto(`http://localhost:3100${path}`, { waitUntil: 'networkidle' });
  // Hagyunk időt a nyitó függönynek és a görgetésre megjelenő tartalomnak.
  if (full) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  // A nyitó függöny 3,5 másodpercig takarja a képernyőt: enélkül róla készülne
  // a kép, nem az oldalról.
  const curtain = await page.locator(`.intro__sheet`).count();
  await page.waitForTimeout(curtain ? 3800 : 1400);
  const name = (path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-/, '')) + `-${width}`;
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  console.log(`${out}/${name}.png`);
}

await browser.close();
