import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Egy ügyfél- vagy partnerembléma.
 *
 * **A világos korong nem dísz, hanem olvashatóság.** A referencia kártyák
 * emblémáját az admin tölti fel, tehát bármilyen színű lehet: egy sötét logó a
 * mély kék szekción eltűnne. Korongon minden embléma ugyanúgy olvasható, és a
 * márkák saját színe is megmarad — egy fehérre festett monokróm változat azt
 * nem tudja.
 *
 * A partnersáv viszont `plate={false}`-szal hívja: oda fehér emblémák
 * érkeznek, tehát a mély kéken korong nélkül is olvashatók, és ott a korong
 * már csak kártyák sorát csinálna a sávból.
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
  plate = true,
  className,
  imageClassName,
}: {
  src: string;
  /** A cég neve. Üresen nem hagyható: a logó önmagában néma. */
  alt: string;
  /** Világos korong az embléma alatt. Fehér emblémáknál nem kell. */
  plate?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span
      className={cn(
        'flex items-center justify-center overflow-hidden',
        plate && 'bg-paper rounded-card p-4',
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
