'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './logo';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ScrollProgressRing } from '@/components/motion/scroll-progress';
import { cn } from '@/lib/cn';
import { nav, primaryCta } from '@/lib/site';

/**
 * A fejléc: egyetlen lebegő, lekerekített fehér sáv.
 *
 * Két dolog szándékosan **nem** változik görgetéskor: a sáv szélessége és a
 * magassága. Egy fejléc, amely görgetés közben összehúzódik vagy kiszélesedik,
 * minden görgetésnél újrarendezi a lap tetejét — pontosan az a fajta apró
 * instabilitás, amitől egy oldal olcsónak hat. Csak az árnyék és a háttér
 * áttetszősége erősödik, hogy a szöveg fölött is olvasható maradjon.
 *
 * A legördülő menü `absolute` pozíciójú, tehát megnyitása nem tolja el sem a
 * sávot, sem az oldalt. Hoverre és fókuszra is nyílik, Escape-re és kívülre
 * kattintásra zár.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Útvonalváltáskor minden nyitott réteg bezárul — különben a menü átvinné
  // magát a következő oldalra.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header ref={navRef} className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <Container>
        <div
          className={cn(
            'relative flex h-14 items-center justify-between gap-4 rounded-full border pl-5 pr-2 transition-[box-shadow,background-color,border-color] duration-normal sm:pl-6',
            scrolled || mobileOpen
              ? 'border-border bg-background/85 shadow-md backdrop-blur-xl'
              : 'border-border/70 bg-background/70 shadow-sm backdrop-blur-md',
          )}
        >
          {/* Az olvasási haladás a sáv keretét tölti ki — nem külön vonal a lap
              tetején. */}
          <ScrollProgressRing />

          <Logo />

          {/* Asztali navigáció */}
          <nav aria-label="Fő navigáció" className="hidden items-center gap-0.5 lg:flex">
            {nav.map((item) =>
              item.children ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.href)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={openMenu === item.href}
                    aria-haspopup="true"
                    onFocus={() => setOpenMenu(item.href)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors duration-fast hover:bg-surface hover:text-foreground',
                      isActive(item.href) ? 'text-foreground' : 'text-muted',
                    )}
                  >
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className={cn(
                        'transition-transform duration-fast',
                        openMenu === item.href && 'rotate-180',
                      )}
                    >
                      <path
                        d="M3 4.5 6 7.5 9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <div
                    className={cn(
                      'absolute left-1/2 top-full w-[23rem] -translate-x-1/2 pt-3 transition-[opacity,transform] duration-fast',
                      openMenu === item.href
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0',
                    )}
                  >
                    <ul className="overflow-hidden rounded-2xl border border-border bg-surface-raised p-2 shadow-lg">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-xl px-3.5 py-3 transition-colors duration-fast hover:bg-surface"
                          >
                            <span className="block text-[0.9375rem] font-medium text-foreground">
                              {child.label}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted">{child.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors duration-fast hover:bg-surface hover:text-foreground',
                    isActive(item.href) ? 'text-foreground' : 'text-muted',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <ButtonLink href={primaryCta.href} size="sm" className="hidden sm:inline-flex">
              {primaryCta.label}
            </ButtonLink>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobil-menu"
              aria-label={mobileOpen ? 'Menü bezárása' : 'Menü megnyitása'}
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors duration-fast hover:bg-surface lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {mobileOpen ? (
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobil menü — ugyanaz a lekerekített nyelv, a sáv alatt. */}
        <div
          id="mobil-menu"
          hidden={!mobileOpen}
          className="mt-2 max-h-[calc(100svh-var(--header-height)-2rem)] overflow-y-auto rounded-3xl border border-border bg-background p-4 shadow-lg lg:hidden"
        >
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl px-3 py-3 text-lg font-medium text-foreground transition-colors duration-fast hover:bg-surface"
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="mb-2 ml-3 border-l border-border pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 text-[0.9375rem] text-muted transition-colors duration-fast hover:bg-surface hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          <ButtonLink href={primaryCta.href} size="lg" className="mt-4 w-full">
            {primaryCta.label}
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
