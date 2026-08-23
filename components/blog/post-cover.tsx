import { cn } from '@/lib/cn';
import { SmartImage } from '@/components/ui/smart-image';
import { WaveLayer } from '@/components/wave/wave-layer';

/**
 * Egy bejegyzés borítója.
 *
 * Ha az adminban feltöltöttek képet, az jelenik meg. Ha nincs kép, nem egy
 * általános „blog” illusztráció kerül a helyére, hanem hullámokból rajzolt
 * borító — ugyanaz a formanyelv, ami az oldal hátterét adja, csak
 * kártyaméretben.
 *
 * Miért így: egy fotóbank-kép, aminek semmi köze a cikkhez, nem tájékoztat —
 * csak kitölt egy helyet. A hullámborító viszont nulla bájt képadat, és nem
 * tesz úgy, mintha ábrázolna valamit.
 *
 * A minta a slugból számolódik, tehát ugyanaz a bejegyzés mindig ugyanúgy néz
 * ki — a listában, a cikkoldalon és két hónap múlva is.
 */

type Layer = { tone: string; top: number; crests: number; amplitude: number; phase: number };

/**
 * Négy kompozíció, mind a kék skáláról. A tónusok fentről lefelé mélyülnek, és
 * minden hullám gerincén ott a fehér él — ugyanaz a rétegzés, mint a nagy
 * hullámoknál, csak kártyaméretben.
 */
const COMPOSITIONS: Layer[][] = [
  [
    { tone: 'wave-3', top: 0.18, crests: 1, amplitude: 0.34, phase: 0.1 },
    { tone: 'wave-5', top: 0.44, crests: 1.4, amplitude: 0.28, phase: 0.6 },
    { tone: 'wave-8', top: 0.72, crests: 1.8, amplitude: 0.22, phase: 0.3 },
  ],
  [
    { tone: 'wave-2', top: 0.22, crests: 1.2, amplitude: 0.3, phase: 0.5 },
    { tone: 'wave-4', top: 0.5, crests: 1.6, amplitude: 0.26, phase: 0.15 },
    { tone: 'wave-7', top: 0.78, crests: 1.1, amplitude: 0.3, phase: 0.75 },
  ],
  [
    { tone: 'wave-4', top: 0.16, crests: 1.5, amplitude: 0.26, phase: 0.85 },
    { tone: 'wave-6', top: 0.46, crests: 1, amplitude: 0.34, phase: 0.35 },
    { tone: 'wave-9', top: 0.76, crests: 1.7, amplitude: 0.2, phase: 0.05 },
  ],
  [
    { tone: 'wave-3', top: 0.2, crests: 1.8, amplitude: 0.24, phase: 0.25 },
    { tone: 'wave-6', top: 0.48, crests: 1.2, amplitude: 0.32, phase: 0.7 },
    { tone: 'wave-8', top: 0.74, crests: 1.5, amplitude: 0.26, phase: 0.45 },
  ],
];

/** Stabil, előjel nélküli hash a slugból — ugyanaz a bemenet, ugyanaz a minta. */
function compositionFor(slug: string): Layer[] {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return COMPOSITIONS[hash % COMPOSITIONS.length] as Layer[];
}

export function PostCover({
  slug,
  image,
  imageAlt,
  sizes,
  priority = false,
  fill = false,
  className,
}: {
  slug: string;
  image?: string;
  imageAlt?: string;
  sizes: string;
  priority?: boolean;
  /** Kitölti a szülő magasságát is — a fekvő, kiemelt kártyához. */
  fill?: boolean;
  className?: string;
}) {
  if (image) {
    return (
      <SmartImage
        src={image}
        alt={imageAlt ?? ''}
        width={1200}
        height={675}
        sizes={sizes}
        priority={priority}
        className={cn('bg-white', className)}
        {...(fill ? { imageClassName: 'h-full object-cover' } : {})}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('wave-stack relative block aspect-[16/9] overflow-hidden bg-wave-2', className)}
    >
      {compositionFor(slug).map((layer, index) => (
        <WaveLayer
          key={index}
          tone={layer.tone}
          top={layer.top}
          crest="clamp(22px, 4vw, 44px)"
          crests={layer.crests}
          amplitude={layer.amplitude}
          phase={layer.phase}
          line={0.55}
          drift={`${index % 2 === 0 ? '' : '-'}${3 + index}%`}
          duration={`${40 + index * 8}s`}
          delay={`-${index * 7}s`}
          zIndex={index}
        />
      ))}
    </span>
  );
}
