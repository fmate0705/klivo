import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * Görgetésre megjelenő tartalom.
 *
 * Csak megjelöli az elemet; a megfigyelést a `MotionDriver` végzi egyetlen
 * `IntersectionObserver`-rel az egész oldalra. Ezért ez szerver komponens
 * maradhat, és egy húsz kártyás rács sem hoz létre húsz figyelőt.
 *
 * A `delay` a lépcsőzéshez van: egy rácsban 40 ms-onként lépve a szem követni
 * tudja a sorrendet. Négy-öt elem fölött a lépcsőzés már várakozás, ezért a
 * hívó helyek felső korláttal számolják (lásd `staggerDelay`).
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  variant,
  className,
  children,
}: {
  as?: ElementType;
  /** Késleltetés ezredmásodpercben. */
  delay?: number;
  /**
   * `figure` — képekhez, nagyobb elmozdulással.
   * `left` / `right` — oldalról érkező elem, például az idővonal két oldala.
   */
  variant?: 'figure' | 'left' | 'right';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      data-reveal={variant ?? ''}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/** Lépcsőzés felső korláttal: a hatodik elem után nincs további várakozás. */
export function staggerDelay(index: number, step = 40, max = 5): number {
  return Math.min(index, max) * step;
}
