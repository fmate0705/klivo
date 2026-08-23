'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Egy szó, amely helyet cserél — maszkolt ablakon át, felfelé.
 *
 * Két szabályt tart be, amit a legtöbb ilyen elem megszeg:
 *
 * 1. **Nem pörög a végtelenségig.** Egyszer végigmegy a listán, visszaér az
 *    elsőre, és megáll. Egy örökké mozgó elem a képernyő szélén elvonja a
 *    figyelmet a szövegről, amit el kellene olvasni — és a hosszú, magától
 *    induló animáció akadálymentességi szempontból is szüneteltethetőséget
 *    követelne. Ha véges, nincs mit szüneteltetni.
 * 2. **Nem mozog, ha nem látszik.** Kigörgetve leáll, és nem indul újra.
 *
 * A képernyőolvasó a teljes felsorolást kapja meg egyben, a látható, cserélődő
 * szó pedig el van rejtve előle: a szolgáltatások listája így információ marad,
 * nem pedig egy szó, ami időzítéstől függően épp mit mond.
 *
 * A `data-nomeasure` a kontraszt-mérőnek szól (`scripts/contrast.mjs`): a szó
 * időzítve vált, tehát mire a felvétel elkészül, más szó látszik, mint amikor a
 * dobozokat mértük — abból hamis bukás lenne. Mind a négy szó ugyanott,
 * ugyanolyan színnel áll, tehát egyet megmérni is elég.
 */

const STEP_MS = 2400;

export function WordCycle({ words, className }: { words: readonly string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (done) return;
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: number | null = null;

    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer !== null) return;
      timer = window.setInterval(() => {
        setIndex((current) => {
          const next = current + 1;
          // Végigért a listán: visszaáll az elsőre és nem indul újra.
          if (next > words.length) {
            setDone(true);
            return 0;
          }
          return next % words.length;
        });
      }, STEP_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    observer.observe(node);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [done, words.length]);

  return (
    <span ref={ref} className={cn('relative inline-block align-bottom', className)}>
      {/* A teljes lista a képernyőolvasónak, egy mondatban. */}
      <span className="sr-only">{words.join(', ')}.</span>

      {/*
        Rácsba rétegezve: minden szó ugyanabba a cellába kerül, tehát a doboz a
        leghosszabb szóhoz igazodik, és a csere közben nem ugrik a sor szélessége.
        Így mindegyik elem szabadon mozoghat `transform`-mal — elrendezést egyik
        sem számoltat újra.
      */}
      <span aria-hidden="true" data-nomeasure className="grid overflow-hidden pb-[0.14em]">
        {words.map((word, wordIndex) => (
          <span
            key={word}
            className="col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-panel ease-standard"
            style={{
              opacity: wordIndex === index ? 1 : 0,
              transform:
                wordIndex === index
                  ? 'translateY(0)'
                  : wordIndex < index
                    ? 'translateY(-100%)'
                    : 'translateY(100%)',
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
