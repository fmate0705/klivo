import { cn } from '@/lib/cn';

/**
 * A csoportosított tartalom felülete.
 *
 * Az `interactive` hover-emelést ad. Csak akkor kapja meg, ha a teljes kártya
 * link — egy kártya, amely megemelkedik a kurzor alatt, de kattintásra nem tesz
 * semmit, apró hazugság a felületről.
 */
export function Card({
  className,
  interactive = false,
  tone = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  tone?: 'default' | 'surface';
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border transition-[transform,box-shadow,border-color] duration-normal ease-expo',
        tone === 'default' && 'border-border bg-surface-raised',
        tone === 'surface' && 'border-border/70 bg-surface',
        interactive && 'hover:-translate-y-1 hover:border-border-strong hover:shadow-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Kis pill a kategóriákhoz, állapotokhoz és metaadatokhoz. */
export function Badge({
  className,
  tone = 'neutral',
  children,
}: {
  className?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'neutral' && 'bg-surface text-muted ring-1 ring-inset ring-border',
        tone === 'primary' && 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
        tone === 'success' && 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
        tone === 'warning' && 'bg-warning/10 text-warning ring-1 ring-inset ring-warning/20',
        tone === 'danger' && 'bg-danger/10 text-danger ring-1 ring-inset ring-danger/20',
        className,
      )}
    >
      {children}
    </span>
  );
}
