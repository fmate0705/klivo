'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/site/logo';
import { cn } from '@/lib/cn';

const links = [
  { href: '/admin', label: 'Áttekintés' },
  { href: '/admin/bejegyzesek', label: 'Bejegyzések' },
  { href: '/admin/arak', label: 'Árak' },
  { href: '/admin/cegadatok', label: 'Cégadatok' },
  { href: '/admin/uzenetek', label: 'Üzenetek' },
] as const;

/**
 * Az admin keretrendszer: oldalsó navigáció és kilépés.
 *
 * A kilépés `DELETE` kérés, nem link. Egy `GET`-tel kiváltható kijelentkezés
 * távolról is triggerelhető lenne (elég egy kép URL), ami idegesítő, ha nem is
 * veszélyes — a `DELETE` + azonos origin ellenőrzés ezt kizárja.
 */
export function AdminShell({
  username,
  newLeads,
  children,
}: {
  username: string;
  newLeads: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  async function signOut() {
    if (leaving) return;
    setLeaving(true);
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/admin/belepes');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-container-wide flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-10 lg:px-10">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="lg:sticky lg:top-8">
          <Logo />

          <nav aria-label="Admin navigáció" className="mt-8">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-fast',
                      isActive(link.href)
                        ? 'bg-foreground text-background'
                        : 'text-muted hover:bg-surface-raised hover:text-foreground',
                    )}
                  >
                    {link.label}
                    {link.href === '/admin/uzenetek' && newLeads > 0 ? (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          isActive(link.href)
                            ? 'bg-background/20 text-background'
                            : 'bg-primary/10 text-primary',
                        )}
                      >
                        {newLeads}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 border-t border-border pt-6 text-sm">
            <p className="text-subtle">Belépve mint</p>
            <p className="mt-1 font-medium text-foreground">{username}</p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="text-muted transition-colors duration-fast hover:text-foreground"
              >
                Oldal megnyitása
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={leaving}
                className="text-left text-danger transition-opacity duration-fast hover:opacity-80 disabled:opacity-50"
              >
                {leaving ? 'Kilépés…' : 'Kilépés'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-16">{children}</main>
    </div>
  );
}
