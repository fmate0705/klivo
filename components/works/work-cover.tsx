import { cn } from '@/lib/cn';
import { SmartImage } from '@/components/ui/smart-image';
import { WavePanel } from '@/components/wave/wave-panel';

/**
 * Egy referencia borítója.
 *
 * Feltöltött kép híján **nem** egy fotóbank-illusztráció áll be, hanem
 * hullámfelület — ugyanaz a szalaglogika, ami a csapatportrék alatt fut
 * (`WavePanel`). Egy odaképzelt képernyőkép azt ígérné, hogy az az ügyfél
 * oldala; a hullám nem tesz úgy, mintha ábrázolna valamit.
 *
 * A minta a slugból választódik, tehát ugyanaz a referencia mindig ugyanúgy néz
 * ki — a listában, a főoldalon és fél év múlva is.
 */
export function WorkCover({
  slug,
  cover,
  alt,
  sizes,
  priority = false,
  className,
}: {
  slug: string;
  cover?: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (cover) {
    return (
      <SmartImage
        src={cover}
        alt={alt ?? ''}
        width={1200}
        height={750}
        sizes={sizes}
        priority={priority}
        className={cn('bg-wave-2', className)}
        imageClassName="h-full object-cover"
      />
    );
  }

  return (
    <span aria-hidden="true" className={cn('relative block overflow-hidden bg-wave-2', className)}>
      <WavePanel index={patternFor(slug)} />
    </span>
  );
}

/** Stabil, előjel nélküli hash a slugból — ugyanaz a bemenet, ugyanaz a minta. */
function patternFor(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}
