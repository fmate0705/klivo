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
  flush = false,
  className,
  children,
}: {
  /**
   * Kattintható kártya. A kiemelés két hajszálnyi elmozdulás: egy pixel
   * felfelé és egy fokkal erősebb árnyék. Ennél többet egy kártyarácsban már
   * nyugtalanságként lát a szem.
   */
  interactive?: boolean;
  /**
   * Belső térköz nélküli kártya — a tartalom a kártya széléig ér.
   *
   * Ott kell, ahol egy kép vagy egy színsáv a keretig fut, és a szöveg kapja a
   * saját térközét: borítós kártyák, folyamatkártyák.
   *
   * **Miért kapcsoló, és miért nem elég a hívónak `p-0`-t írnia.** A
   * `tailwind-merge` csak az azonos variánsú osztályokat ejti ki: a `p-0` az
   * alap `p-6`-ot leüti, a `sm:p-7`-et viszont nem. A kártya 640 pixel fölött
   * némán visszakapta a térközt, és a kép köré fehér keret került — a hiba
   * pontosan így fordult elő, és a képernyőn alig látszott.
   */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'border-soft bg-raised card-lift relative rounded-card border',
        !flush && 'p-6 sm:p-7',
        // A kiemelés **minden** kártyán ott van, nem csak a kattinthatókon: a
        // rámutatásra megmozduló felület a lap egészét élővé teszi, és a
        // kártyarácsokban ettől érződik kézzelfoghatónak a tartalom.
        // Az árnyékerősítés viszont csak a kattinthatóké — ott az emelkedés
        // ígéret is: „ez visz valahová”.
        interactive && 'group hover:shadow-float focus-within:shadow-float',
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
