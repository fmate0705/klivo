#!/usr/bin/env node
/**
 * Szövegkontraszt-mérés valódi képpontokon.
 *
 *   node scripts/contrast.mjs [útvonal...] [--w=390,768,1440]
 *
 * Kimenet: minden olyan szöveg, amely nem éri el a WCAG AA küszöböt
 * (4,5:1, nagy betűnél 3:1), a legrosszabbtól lefelé.
 *
 * Két felvétel készül ugyanarról a nézetről: egy normál és egy, amelyen a
 * szöveg átlátszó. Ahol a kettő eltér, ott betű van — a háttérszínt a második
 * felvételből olvassuk. Így a mérés nem a doboz üres részét mintázza, hanem
 * pontosan azt, amin a betű ül.
 *
 * **Előbb végiggörgetünk a lapon.** A görgetésre megjelenő elemek addig
 * eltolva állnak; ha a dobozokat előbb mérnénk meg, mint ahogy a helyükre
 * kerülnek, a mintavétel néhány száz pixellel odébb esne, és hamis bukásokat
 * jelentene.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

function lum(r, g, b) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const x = lum(...a),
    y = lum(...b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const HIDE = '*{color:transparent !important;text-decoration-color:transparent !important}';
const paths = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const widths = (process.argv.find((a) => a.startsWith('--w='))?.slice(4) ?? '390,768,1440')
  .split(',')
  .map(Number);

const b = await chromium.launch();
let worstAll = [];
for (const width of widths) {
  for (const path of paths) {
    const p = await b.newPage({ viewport: { width, height: 900 } });
    await p.addInitScript(() => {
      try {
        window.localStorage.setItem('klivo-cookie-consent', 'measure');
      } catch {
        // Privát módban nincs tároló — a buborék marad, de attól még mérhető.
      }
    });
    await p.goto('http://localhost:3100' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(700);

    // Végiggörgetés, hogy minden „megjelenés” animáció lefusson.
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 700) {
      await p.evaluate((to) => window.scrollTo({ top: to, behavior: 'instant' }), y);
      await p.waitForTimeout(90);
    }
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await p.waitForTimeout(400);

    const boxes = await p.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,button,span,time,label')]
        .filter((el) => {
          if (!el.textContent.trim()) return false;
          // Időzítve cserélődő tartalom: a pillanatkép és a doboz mérése között
          // változik, tehát nem mérhető. Lásd `components/hero/word-cycle.tsx`.
          if (el.closest('[data-nomeasure]')) return false;
          // Csak képernyőolvasónak szánt szöveg: nem festődik, a doboza
          // viszont a szülő méretét veszi fel, és hamis mérést adna.
          if (el.classList.contains('sr-only') || el.querySelector('.sr-only')) return false;
          if ([...el.children].some((c) => c.textContent.trim() === el.textContent.trim()))
            return false;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.opacity !== '0';
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          // Kivágott (képernyőolvasónak szánt) és rejtett példányokat tartalmazó
          // elem nem festődik — ezeket a láthatatlanság-vizsgálat kihagyja.
          const clipped = s.clipPath !== 'none' || s.clip !== 'auto';
          const hiddenChild = [...el.querySelectorAll('*')].some(
            (child) => getComputedStyle(child).opacity === '0',
          );
          // Halványuló ős (nyitó függöny), egymásra tornyozott váltakozó
          // testvérek (szócsere), vagy levágott elem (maszkolt sor): ezek egy
          // pillanatképen nem mérhetők — a doboz nem ott van, ahol a betű.
          let faded = false;
          for (let node = el; node && node !== document.body; node = node.parentElement) {
            const cs = getComputedStyle(node);
            if (Number(cs.opacity) < 1) faded = true;
            if (node.parentElement) {
              for (const sib of node.parentElement.children) {
                if (sib !== node && getComputedStyle(sib).opacity === '0') faded = true;
              }
              const parentStyle = getComputedStyle(node.parentElement);
              const clips = /hidden|clip/.test(parentStyle.overflow + parentStyle.overflowY);
              if (clips) {
                const inner = node.getBoundingClientRect();
                const outer = node.parentElement.getBoundingClientRect();
                if (inner.top < outer.top - 2 || inner.bottom > outer.bottom + 2) faded = true;
              }
            }
          }
          return {
            visible: !clipped && !hiddenChild && !faded && r.width > 8 && r.height > 8,
            t: el.textContent.trim().slice(0, 30),
            color: s.color.match(/\d+/g).slice(0, 3).map(Number),
            size: parseFloat(s.fontSize),
            weight: Number(s.fontWeight),
            x: r.x + scrollX,
            y: r.y + scrollY,
            w: r.width,
            h: r.height,
          };
        }),
    );

    const shot = async () => {
      const buf = await p.screenshot({ fullPage: true });
      const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      return { data, info };
    };
    const normal = await shot();
    await p.addStyleTag({ content: HIDE });
    await p.waitForTimeout(250);
    const blank = await shot();
    await p.close();

    const { info } = normal;
    const at = (img, x, y) => {
      const i = (y * info.width + x) * info.channels;
      return [img.data[i], img.data[i + 1], img.data[i + 2]];
    };

    for (const box of boxes) {
      const large = box.size >= 24 || (box.size >= 18.66 && box.weight >= 700);
      const need = large ? 3 : 4.5;
      const ratios = [];
      let same = 0;
      let bg = null;
      const x0 = Math.max(0, Math.round(box.x)),
        x1 = Math.min(info.width - 1, Math.round(box.x + box.w));
      const y0 = Math.max(0, Math.round(box.y)),
        y1 = Math.min(info.height - 1, Math.round(box.y + box.h));
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          const a = at(normal, x, y),
            c = at(blank, x, y);
          // Csak a teljesen kifestett betűtest számít — az élsimított perem
          // keveréke hamis bukást adna.
          if (
            Math.abs(a[0] - box.color[0]) +
              Math.abs(a[1] - box.color[1]) +
              Math.abs(a[2] - box.color[2]) >
            12
          )
            continue;
          if (Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]) < 20) {
            // A betű és a háttér azonos színű: a két felvétel nem tér el, tehát
            // a képpont kiesne a mintából — pedig épp ez a legrosszabb eset,
            // láthatatlan szöveg. Külön számoljuk.
            same += 1;
            continue;
          }
          ratios.push([ratio(box.color, c), c]);
        }
      }
      // Láthatatlan szöveg: egyetlen kifestett képpont sincs, csak a
      // háttérrel azonos színű. Ez nem kontraszthiba, hanem hiányzó szöveg.
      if (ratios.length === 0 && same > 60 && box.visible) {
        worstAll.push({ width, path, worst: 1, need, bg: box.color, ...box });
        continue;
      }

      // A második százalék, nem a minimum: egy áthaladó hajszálvonal néhány
      // képpontja nem olvashatatlan szöveg, csak egy metszéspont.
      if (ratios.length > 40) {
        ratios.sort((a, b) => a[0] - b[0]);
        const index = Math.floor(ratios.length * 0.02);
        const [worst, sample] = ratios[index];
        bg = sample;
        if (worst < need) worstAll.push({ width, path, worst, need, bg, ...box });
      }
    }
  }
}
worstAll.sort((a, b) => a.worst - b.worst);
for (const w of worstAll.slice(0, 25)) {
  console.log(
    `${w.worst.toFixed(2)} (kell ${w.need}) ${w.width}px ${w.path} — "${w.t}" rgb(${w.color}) / rgb(${w.bg})`,
  );
}
console.log(worstAll.length === 0 ? 'MINDEN SZÖVEG MEGFELEL' : `${worstAll.length} bukás`);
await b.close();
