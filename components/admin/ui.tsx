import { cn } from '@/lib/cn';

/**
 * Az admin felület apró építőelemei.
 *
 * Külön él a nyilvános oldal komponenseitől, mert más a cél: ott a meggyőzés,
 * itt az áttekinthetőség és a gyors munka. Ugyanazokat a design tokeneket
 * használja, tehát a két felület nem esik szét vizuálisan.
 */

export function AdminCard({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-surface-raised', className)}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

export function AdminField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {hint ? <p className="mt-1 text-sm text-subtle">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function adminInputClass(error?: string): string {
  return cn(
    'w-full rounded-xl border bg-background px-4 py-2.5 text-[0.9375rem] text-foreground',
    'transition-[border-color,box-shadow] duration-fast',
    'focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-focus/15',
    error ? 'border-danger' : 'border-border-strong hover:border-foreground/25',
  );
}

/** Rövid visszajelzés mentés után. Nem tűnik el magától: a felhasználó zárja. */
export function AdminNotice({
  tone = 'success',
  children,
}: {
  tone?: 'success' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  return (
    <p
      role="status"
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'success' && 'border-success/25 bg-success/5 text-success',
        tone === 'danger' && 'border-danger/25 bg-danger/5 text-danger',
        tone === 'info' && 'border-border bg-surface text-muted',
      )}
    >
      {children}
    </p>
  );
}
