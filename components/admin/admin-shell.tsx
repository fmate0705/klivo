'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/site/logo';
import { cn } from '@/lib/cn';

/**
 * Az admin a **változó** tartalmat kezeli: referenciákat, partnereket,
 * bejegyzéseket, a csapatot, a kérdéseket és a beérkező megkereséseket.
 *
 * Árak és cégadatok szándékosan nincsenek benne. Az árak tartalmi döntések és a
 * kódban élnek (`lib/content/pricing.ts`), a cég- és jogi adatok pedig a
 * `.env`-ben. Ezeket két helyről is szerkeszthetővé tenni azt jelentené, hogy
 * két egymásnak ellentmondó impresszum állhat elő, és senki nem tudná, melyik
 * az igazi.
 *
 * A sorrend a használat gyakoriságát követi, nem a fejlesztés sorrendjét: elöl
 * az, amihez a szerkesztő naponta hozzányúl.
 */
const links = [
  { href: '/admin', label: 'Áttekintés' },
  { href: '/admin/referenciak', label: 'Referenciák' },
  { href: '/admin/partnerek', label: 'Partnerek' },
  { href: '/admin/kozossegi', label: 'Közösségi média' },
  { href: '/admin/bejegyzesek', label: 'Bejegyzések' },
  { href: '/admin/csapat', label: 'Csapat' },
  { href: '/admin/gyik', label: 'GYIK' },
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
    <div className="mx-auto flex min-h-svh w-full max-w-wide flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-10 lg:px-10">
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
                      'flex items-center justify-between gap-2 whitespace-nowrap rounded-card px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-feedback',
                      isActive(link.href)
                        ? 'bg-deep text-on-dark'
                        : 'text-muted hover:bg-sky hover:text-ink',
                    )}
                  >
                    {link.label}
                    {link.href === '/admin/uzenetek' && newLeads > 0 ? (
                      <span
                        className={cn(
                          'rounded-pill px-2 py-0.5 text-xs font-medium',
                          isActive(link.href) ? 'bg-paper/20 text-on-dark' : 'bg-deep/10 text-ink',
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

          <div className="mt-8 border-t border-line pt-6 text-body-sm">
            <p className="text-muted">Belépve mint</p>
            <p className="mt-1 font-medium text-ink">{username}</p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="text-muted transition-colors duration-feedback hover:text-ink"
              >
                Oldal megnyitása
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={leaving}
                className="text-left text-danger transition-opacity duration-feedback hover:opacity-80 disabled:opacity-50"
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
