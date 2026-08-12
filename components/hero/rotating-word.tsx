'use client';

import { useEffect, useState } from 'react';

/**
 * Egy szó, amely bizonyos időnként a következőre vált.
 *
 * A szélessége a *leghosszabb* szóra van rögzítve (egy láthatatlan mérőréteggel),
 * így a váltás nem tolja odébb a mellette álló szöveget. Egy ugráló sor a hero
 * kellős közepén pontosan az az apró hiba, amitől egy oldal olcsónak hat.
 *
 * A lista `aria-hidden`, és a látható szó `aria-live` nélkül cserélődik: egy
 * képernyőolvasónak nem segít, ha másodpercenként felolvas egy új szót. A
 * teljes lista szövegként ott van a DOM-ban a mérőrétegben, tehát a tartalom
 * nem vész el.
 */
export function RotatingWord({
  words,
  intervalMs = 2600,
  className,
}: {
  words: readonly string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [words.length, intervalMs]);

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className ?? ''}`}>
      {/* Mérőréteg: kijelöli a legszélesebb szó helyét, és nem látszik. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap font-medium">
        {words.reduce((longest, word) => (word.length > longest.length ? word : longest), '')}
      </span>

      <span
        key={index}
        className="animate-rise-in col-start-1 row-start-1 whitespace-nowrap font-medium text-foreground"
      >
        {words[index]}
      </span>
    </span>
  );
}
