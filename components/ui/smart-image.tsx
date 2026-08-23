'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Kép, amely nem ugrat és nem villan be.
 *
 * A helyét a `width`/`height` aránypár azonnal lefoglalja, tehát a kép
 * megérkezése nem tolja el a körülötte lévő szöveget (nincs elrendezés-ugrás).
 * Amíg tölt, egy halkan lüktető csontváz áll a helyén; betöltéskor a kép
 * 300 ms alatt úszik be — pont annyira, hogy érzékelhető legyen a megérkezés,
 * de ne kelljen megvárni.
 *
 * A `priority` képeknél (a nyitóképernyő nagy képe) nincs csontváz és nincs
 * beúszás: azok a leggyorsabban megjelenő elemek, és egy átmenettel csak
 * késleltetnénk a legfontosabb festést.
 *
 * A gyorsítótárból érkező kép már készen lehet, mire a React ráakasztaná az
 * eseménykezelőt — ilyenkor az `onLoad` soha nem sülne el, és a csontváz
 * örökre ottmaradna. Ezért a felcsatoláskor a `complete` jelzőt is
 * megnézzük.
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
  imageClassName,
  quality = 82,
}: {
  src: string;
  /**
   * Mit ábrázol a kép. Üres sztring csak akkor helyes, ha a kép tisztán
   * dekoratív — ilyen kép ezen az oldalon nincs.
   */
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  quality?: number;
}) {
  const [loaded, setLoaded] = useState(priority);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <span className={cn('relative block overflow-hidden', className)}>
      {priority ? null : (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 transition-opacity duration-panel ease-standard',
            // Betöltés után a `skeleton` osztály **lekerül**, nem csak
            // átlátszóvá válik. A lüktetés CSS animáció, az animáció pedig
            // erősebb a sima `opacity` deklarációnál: osztályostul hagyva a
            // csontváz örökre ott maradna a kép fölött, és minden képet
            // elmosna. Ez a hiba némán jelentkezik — a kép betöltődik, csak nem
            // látszik.
            loaded ? 'opacity-0' : 'skeleton',
          )}
        />
      )}
      <Image
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          'relative block h-auto w-full transition-opacity duration-panel ease-entrance',
          loaded ? 'opacity-100' : 'opacity-0',
          imageClassName,
        )}
      />
    </span>
  );
}
