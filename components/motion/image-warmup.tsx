'use client';

import { useEffect } from 'react';

/**
 * A hajlat alatti képek előmelegítése.
 *
 * A lap képei `loading="lazy"`-vel érkeznek: a böngésző csak akkor tölti le
 * őket, amikor a látogató a közelükbe görget. Ez a helyes alapértelmezés — de a
 * nyitóképernyőn van egy **holt idő**, amíg a nyitó függöny fut, és a hálózat
 * addig üresen áll. Ez a réteg ezt az időt tölti ki: a legelső néhány lusta
 * képet a háttérben letölti, hogy mire odaérünk, már a gyorsítótárban legyenek.
 *
 * **Miért `new Image()` és nem `loading="eager"` átállítás.** A `loading`
 * attribútum utólagos átírása böngészőnként máshogy viselkedik, és a React
 * legközelebbi renderelésénél visszaáll. Egy külön `Image` példány ugyanarra az
 * URL-re viszont mindenütt ugyanazt csinálja: letölti, és a HTTP-gyorsítótárba
 * teszi, ahonnan a valódi `<img>` már azonnal megkapja.
 *
 * **A `srcset` és a `sizes` átmásolása kötelező.** Enélkül a böngésző más
 * felbontású változatot választana, mint amit a valódi kép majd kér — és akkor
 * kétszer töltenénk le ugyanazt a képet két méretben, ami rosszabb, mint ha
 * bele sem kezdtünk volna.
 *
 * **Csak hat kép, és csak tétlen időben.** A `requestIdleCallback` garantálja,
 * hogy az előmelegítés nem verseng a nyitóképernyő saját erőforrásaival: az
 * LCP-t nem szabad lassítania. A hatos korlát pedig azt őrzi, hogy egy hosszú
 * lapon ne kezdjünk el mindent letölteni — az adatforgalom is költség.
 */

/** Ennyi képet melegítünk elő. */
const LIMIT = 6;

export function ImageWarmup() {
  useEffect(() => {
    // Aki adatforgalmat spórol, annak semmit nem töltünk előre.
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return;

    const warm = () => {
      const images = [...document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')]
        .filter((image) => !image.complete)
        .slice(0, LIMIT);

      for (const image of images) {
        const preload = new Image();
        if (image.sizes) preload.sizes = image.sizes;
        if (image.srcset) preload.srcset = image.srcset;
        preload.src = image.src;
      }
    };

    // A Safari sokáig nem ismerte a tétlenségi visszahívást; ott időzítő a
    // tartalék. A hosszabb késleltetés ott szándékos: időzítővel nem tudjuk
    // megkérdezni, hogy a böngésző ráér-e, tehát inkább kivárunk.
    const idle = typeof window.requestIdleCallback === 'function';
    const handle = idle
      ? window.requestIdleCallback(warm, { timeout: 2000 })
      : window.setTimeout(warm, 900);

    return () => {
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  return null;
}
