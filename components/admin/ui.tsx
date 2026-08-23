import { cn } from '@/lib/cn';

/**
 * Az admin felület apró építőelemei.
 *
 * Ugyanazokból a design tokenekből épül, mint a nyilvános oldal, de más a cél:
 * ott a meggyőzés, itt a gyors, hibamentes munka. Ezért nincs benne hullám,
 * nincs görgetésre megjelenés és nincs beúszás — az admin mozgásszintje
 * „csak visszajelzés” (CEF motion.policy, `admin: 1`). Egy szerkesztő
 * felületen az animáció késleltetés, nem élmény.
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
    <section className={cn('rounded-card border border-line bg-surface', className)}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-h6 font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-body-sm text-muted">{description}</p> : null}
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
      <label htmlFor={htmlFor} className="block text-body-sm font-medium">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {hint ? <p className="mt-1 text-body-sm text-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function adminInputClass(error?: string): string {
  return cn(
    'w-full rounded-card border bg-paper px-4 py-2.5 text-body-sm',
    'transition-colors duration-feedback ease-standard',
    error ? 'border-danger' : 'border-line-strong hover:border-ink/25',
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
        'rounded-card border px-4 py-3 text-body-sm',
        tone === 'success' && 'border-success/25 bg-success/5 text-success',
        tone === 'danger' && 'border-danger/25 bg-danger/5 text-danger',
        tone === 'info' && 'border-line bg-sky text-muted',
      )}
    >
      {children}
    </p>
  );
}
