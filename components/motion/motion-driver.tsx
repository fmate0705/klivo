'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Az oldal egyetlen mozgásvezérlője.
 *
 * Két dolgot csinál, és mindkettőt egy helyen, egyszer:
 *
 * 1. **Mutatókövetés.** A kurzor helyzetét −1..1 tartományba normalizálva
 *    kiírja a `<html>`-re két CSS változóként. A hullámrétegek ezekből
 *    számolnak parallaxist. Így egyetlen esemény-figyelő szolgálja ki az egész
 *    oldalt, ahelyett hogy minden hullámmező sajátot regisztrálna.
 * 2. **Megjelenés görgetésre.** Egyetlen `IntersectionObserver` figyeli az
 *    összes `[data-reveal]` elemet, és láthatóvá váláskor kiteszi rájuk a
 *    `data-revealed` jelzőt. Utána azonnal le is iratkozik róluk: a megjelenés
 *    egyszeri esemény, nem oda-vissza kapcsolgatás.
 *
 * Mindkettő némán kimarad, ha a látogató csökkentett mozgást kért — ilyenkor a
 * CSS eleve mindent láthatóra és mozdulatlanra állít, tehát nincs mit vezérelni.
 *
 * Ez a komponens semmit nem renderel. Kliens komponens, mert böngésző-eseményre
 * iratkozik fel; ez az a kivétel, amiért a „szerver alapértelmezés” szabály alól
 * felmentést kap.
 */

/** Ennyivel a nézet alja fölött indul a megjelenés — a mozgás így ér véget épp
 *  akkor, amikor az elem tényleg olvasható helyre ér. */
const REVEAL_MARGIN = '0px 0px -12% 0px';

export function MotionDriver() {
  const pathname = usePathname();

  // Megjelenés-figyelő. Útvonalanként újraindul, mert navigáció után új
  // elemek kerülnek a fába.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: REVEAL_MARGIN, threshold: 0.01 },
    );

    const observeAll = () => {
      for (const node of document.querySelectorAll<HTMLElement>(
        '[data-reveal]:not([data-revealed])',
      )) {
        observer.observe(node);
      }
    };

    observeAll();

    // A blog lista szűrése és az admin listák menet közben cserélik a
    // tartalmat. Egy figyelő olcsóbb, mint minden ilyen helyen kézzel
    // újraindítani a megfigyelést — és nem is felejthető el.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  // Mutatókövetés.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Érintőképernyőn nincs lebegő kurzor: a követés ott csak fölösleges munka.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    /**
     * A mozgatott rétegek.
     *
     * Az eltolás **közvetlenül ezekre az elemekre** kerül, nem a `<html>` egy
     * CSS-változójába. A gyökéren megváltozó egyedi tulajdonság ugyanis az egész
     * dokumentumra újraszámoltatja a stílust, és ezt minden képkockán megtenné —
     * ettől akadt a felület, és ettől maradtak beragadt csempék a képernyőn.
     * Három elem stílusát írni ehhez képest semmi.
     *
     * A nyitó függöny rétegei kimaradnak: azok három másodpercig élnek, és
     * közben úgyis ráközelítenek.
     */
    let layers: HTMLElement[] = [];
    const collect = () => {
      layers = [...document.querySelectorAll<HTMLElement>('.curls__track')].filter(
        (node) => !node.closest('.intro'),
      );
    };

    collect();

    const apply = () => {
      frame = 0;
      for (const layer of layers) {
        const pull = Number(layer.dataset.pull ?? 0);
        const pullY = Number(layer.dataset.pullY ?? 0);
        layer.style.transform = `translate(${(x * pull).toFixed(1)}px, ${(y * pullY).toFixed(1)}px)`;
      }
    };

    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      // Képkockánként legfeljebb egy írás. Enélkül egy gyors kurzormozgás
      // néhány száz stílusírást indítana másodpercenként.
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    // Oldalváltáskor új hullámmező kerül a DOM-ba; a régi elemekre mutató
    // hivatkozások különben ottmaradnának, és semmi nem mozogna.
    const nodes = new MutationObserver(collect);
    nodes.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      nodes.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
