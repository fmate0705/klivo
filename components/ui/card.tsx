import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Kártya — egyetlen felület, egyetlen belső térköz, egyetlen rádiusz.
 *
 * A színeit nem paraméterből kapja, hanem a szülő szekció hangneméből
 * (`.bg-raised`, `.border-soft`). Egy kártya világos és sötét szekcióban is
 * helyes anélkül, hogy a hívó helynek tudnia kellene róla, melyikben van.
 */

export function Card({
  interactive = false,
  className,
  children,
}: {
  /**
   * Kattintható kártya. A kiemelés két hajszálnyi elmozdulás: egy pixel
   * felfelé és egy fokkal erősebb árnyék. Ennél többet egy kártyarácsban már
   * nyugtalanságként lát a szem.
   */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'border-soft bg-raised relative rounded-card border p-6 sm:p-7',
        interactive && [
          'group transition-[transform,box-shadow,border-color] duration-ui ease-standard',
          'hover:-translate-y-px hover:shadow-float focus-within:-translate-y-px focus-within:shadow-float',
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A kártya címében ülő hivatkozás, amely a *teljes* kártyát kattinthatóvá
 * teszi.
 *
 * A `::after` réteg kiterül a kártyára, tehát nagyobb a célfelület mutatóval és
 * érintéssel is. Közben egyetlen hivatkozás van, és annak a szövege a cím —
 * a képernyőolvasó „Weboldal készítés, hivatkozás”-t mond, nem „Tovább”-ot,
 * és a linklistában is megkülönböztethető marad.
 *
 * A szülő kártyának `relative`-nek kell lennie; a `Card` az.
 */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn('after:absolute after:inset-0 after:rounded-card', className)}>
      {children}
    </Link>
  );
}
