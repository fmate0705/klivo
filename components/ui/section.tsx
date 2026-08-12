import { cn } from '@/lib/cn';

/**
 * Vertikális ritmus és a szekciófejléc.
 *
 * A térköz szándékosan nagy. Egy jórészt fehér oldalon a szekciók közötti hely
 * *maga* a hierarchia: az mondja meg a szemnek, hol ér véget az egyik gondolat és
 * hol kezdődik a következő — anélkül, hogy vonal vagy doboz végezné el a munkát.
 *
 * Kétféle tónus van, és mindkettő világos: `default` (fehér) és `surface`
 * (nyugvó, halványan szürke). Sötét változat nincs — az oldal végig világos,
 * hogy a görgetés ne villogjon, és a figyelem a tartalmon maradjon.
 */
export function Section({
  id,
  className,
  tone = 'default',
  spacing = 'default',
  children,
}: {
  id?: string;
  className?: string;
  tone?: 'default' | 'surface';
  spacing?: 'default' | 'tight' | 'loose';
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        spacing === 'tight' && 'py-16 sm:py-20',
        spacing === 'default' && 'py-24 sm:py-32 lg:py-40',
        spacing === 'loose' && 'py-32 sm:py-40 lg:py-48',
        tone === 'surface' && 'bg-surface',
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * A szabványos szekciófejléc: felcím, cím, bevezető.
 *
 * A felcím kis kapitálisos címke, amely egy szóban megválaszolja a „mit látok
 * most” kérdést, még mielőtt az olvasó belekezdene a címsorba.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
  as: Heading = 'h2',
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' && 'items-center text-center',
        align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl',
        className,
      )}
    >
      {eyebrow ? (
        <span
          data-reveal
          className="mb-5 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-primary"
        >
          <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
          {eyebrow}
        </span>
      ) : null}

      <Heading
        data-reveal
        style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
        className="text-3xl sm:text-4xl"
      >
        {title}
      </Heading>

      {lead ? (
        <p
          data-reveal
          style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          className="mt-6 text-lg leading-relaxed text-muted"
        >
          {lead}
        </p>
      ) : null}

      {children}
    </div>
  );
}
