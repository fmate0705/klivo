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

    const root = document.documentElement;
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      root.style.setProperty('--pointer-x', x.toFixed(3));
      root.style.setProperty('--pointer-y', y.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      // Képkockánként legfeljebb egy írás. Enélkül egy gyors kurzormozgás
      // néhány száz stílus-újraszámolást indítana másodpercenként.
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
