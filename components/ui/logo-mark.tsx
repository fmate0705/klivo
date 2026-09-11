import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Egy ügyfél- vagy partnerembléma.
 *
 * **Miért kell alá világos korong.** Az emblémákat az admin tölti fel, tehát
 * bármilyen színűek lehetnek: egy sötét logó sötét kék szekción eltűnne, egy
 * fehér logó világos szekción ugyanígy. A megoldás nem az, hogy megkérjük a
 * szerkesztőt, gondolja végig — hanem hogy minden embléma ugyanarra a **világos
 * felületre** kerül. Így egy tetszőleges logó is olvasható marad, és a márkák
 * saját színe is megmarad (egy fehérre festett monokróm sáv azt nem tudja).
 *
 * **`unoptimized` az SVG-nél.** A Next képoptimalizálója SVG-t csak a
 * `dangerouslyAllowSVG` kapcsolóval dolgoz fel, az viszont az egész oldalon
 * megnyitná az SVG-utat. Egy embléma amúgy is pár kilobájt, nincs mit
 * optimalizálni rajta: a fájl változatlanul megy ki.
 *
 * A `sizes` szándékosan hiányzik: a `width`/`height` fix, a doboz mérete
 * ismert, tehát nincs mit mérlegelni a böngészőnek.
 */
export function LogoMark({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string;
  /** A cég neve. Üresen nem hagyható: a logó önmagában néma. */
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span
      className={cn(
        'bg-paper flex items-center justify-center overflow-hidden rounded-card p-4',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={200}
        height={80}
        unoptimized={src.toLowerCase().endsWith('.svg')}
        className={cn('h-full w-auto max-w-full object-contain', imageClassName)}
      />
    </span>
  );
}
