import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Dekoratív háttérréteg egy szekció mögé.
 *
 * A képek itt *háttérnek* számítanak, nem tartalomnak: nincs keretük, nincs
 * árnyékuk, és nem kapnak külön helyet az elrendezésben. Ez a különbség egy
 * prémium és egy összedobott oldal között — egy dekoratív kép, amit keretbe
 * teszünk, azt állítja magáról, hogy információt hordoz.
 *
 * Ezért:
 * - `aria-hidden` és `data-decorative`, tehát felolvasó és nyomtatás kihagyja;
 * - `pointer-events-none`, hogy soha ne fogja el a kattintást;
 * - a `webp` változat a `next/image`-en megy át (AVIF/WebP, srcset), az SVG viszont
 *   sima `img`, mert egy vektorgrafikán nincs mit optimalizálni, és a Next
 *   alapból nem is nyúl hozzá.
 *
 * A `fit` alapértéke szándékosan `contain`.
 *
 * A háttérgrafikáink nem tapéták, hanem *tárgyak*: egy rétegzett üvegtorony vagy
 * egy laptop mockup. Ha ezeket `cover`-rel nyújtjuk egy magas, keskeny sávba, a
 * tárgy fele kilóg a keretből — pontosan az a „le van vágva, félre van fordítva”
 * hatás, amitől a kép hibásnak látszik. A `contain` a teljes tárgyat mutatja,
 * arányhelyesen; `cover`-t csak valódi, széltől szélig futó felületre
 * (színfátyol, vonalgrafika) érdemes kérni.
 */
export function SectionArt({
  src,
  className,
  position = 'cover',
  align = 'center',
  fit = 'contain',
  opacity,
  priority = false,
}: {
  src: string;
  className?: string;
  /** `cover` a teljes felületre, `bottom` alsó sávként, `top` felső sávként. */
  position?: 'cover' | 'bottom' | 'top';
  /** Merre igazodjon a kép a rendelkezésre álló területen. */
  align?: 'center' | 'right' | 'left';
  fit?: 'cover' | 'contain';
  /**
   * Fix áttetszőség. Ha nincs megadva, a hívó a `className`-ben állítja be —
   * így lehet töréspontonként eltérő (mobilon halványabb, hogy a szöveg alatt
   * ne zavarjon). Inline stílust szándékosan csak akkor írunk, ha kértek:
   * különben felülírná a utility osztályokat.
   */
  opacity?: number;
  priority?: boolean;
}) {
  const isVector = src.endsWith('.svg');

  const objectClass = cn(
    fit === 'cover' ? 'object-cover' : 'object-contain',
    align === 'right' && 'object-right',
    align === 'left' && 'object-left',
    align === 'center' && 'object-center',
  );

  return (
    <div
      aria-hidden="true"
      data-decorative
      style={{ opacity }}
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        position === 'bottom' && 'top-auto h-[70%]',
        position === 'top' && 'bottom-auto h-[70%]',
        className,
      )}
    >
      {isVector ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn('h-full w-full', objectClass)}
        />
      ) : (
        <Image src={src} alt="" fill priority={priority} sizes="100vw" className={objectClass} />
      )}
    </div>
  );
}

/**
 * Puha színfátyol — kép nélküli háttérdísz.
 *
 * Ahol a fotó túl sok lenne, ott ez adja a mélységet: egyetlen elmosott
 * színkorong, tisztán CSS-ből, tehát nulla letöltés és nulla elrendezési költség.
 */
export function GlowSpot({
  className,
  color = 'primary',
  size = '32rem',
}: {
  className?: string;
  color?: 'primary' | 'accent';
  size?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-decorative
      style={{
        width: size,
        height: size,
        background:
          color === 'primary'
            ? 'radial-gradient(circle at 50% 50%, rgb(var(--primary-rgb) / 0.16), transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
      }}
      className={cn('pointer-events-none absolute -z-10 rounded-full blur-[90px]', className)}
    />
  );
}

/**
 * A hero négyzetes rácsa, önálló háttérrétegként.
 *
 * A rács a hero vizuális aláírása: rendet és mérnöki pontosságot sugall, és
 * mivel egyetlen CSS gradiens, semmibe nem kerül. Ezért vihető át más
 * szekciókba is — mindig alul elhalványítva, hogy a szöveg alatt ne zavarjon.
 */
export function GridArt({
  className,
  size = 76,
  opacity = 0.6,
  fade = 'bottom',
}: {
  className?: string;
  size?: number;
  opacity?: number;
  fade?: 'bottom' | 'none';
}) {
  return (
    <div
      aria-hidden="true"
      data-decorative
      style={{ opacity, ['--grid-size' as string]: `${size}px` }}
      className={cn(
        'bg-grid pointer-events-none absolute inset-0 -z-10',
        fade === 'bottom' && 'mask-fade-b',
        className,
      )}
    />
  );
}
