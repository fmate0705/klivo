'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { nav, primaryCta } from '@/lib/content/site';
import { Logo } from '@/components/site/logo';
import { ButtonLink } from '@/components/ui/button';

/**
 * A lebegő navigáció.
 *
 * Egyetlen, lekerekített sáv, amely a tartalom fölött úszik. A nyitóképernyő
 * tetején egy hajszállal lejjebb ül és árnyék nélkül; görgetéskor felzárkózik a
 * lap széléhez, és megkapja az árnyékát. A váltás `transform`-mal és
 * festési tulajdonságokkal történik, elrendezés-számolás nélkül — tehát
 * görgetés közben sem esik ki képkocka.
 *
 * A kapcsolat oldalra **egyetlen** hivatkozás mutat innen: a jobb szélső gomb.
 * Korábban két menüpont vitt ugyanoda, ami két különböző oldalt ígért.
 *
 * A „Szolgáltatások” egy `button`, nem hivatkozás. Egy elem nem tud egyszerre
 * navigálni és almenüt nyitni anélkül, hogy az egyik viselkedés
 * kiszámíthatatlan lenne; az almenü első eleme viszi tovább a teljes
 * szolgáltatás listára. Így billentyűzettel és képernyőolvasóval is pontosan
 * az történik, amit a vezérlő ígér.
 */

/** Ennyi görgetés után zárkózik fel a sáv. Egy teljes „egy pörgetés” alatt. */
const SCROLL_THRESHOLD_PX = 12;

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const submenuId = useId();
  const desktopSubmenuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Görgetési állapot.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigáció után minden nyitott felület záródik. Enélkül a mobil menü
  // ottmaradna az új oldal fölött.
  useEffect(() => {
    setMenuOpen(false);
    setSubmenu(null);
  }, [pathname]);

  // Escape zár, bárhonnan.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setSubmenu(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Nyitott mobil menü mögött nem görög a lap.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Az asztali almenü kattintásra záródik odébb.
  useEffect(() => {
    if (!submenu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (desktopSubmenuRef.current?.contains(event.target as Node)) return;
      setSubmenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [submenu]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  /**
   * Rálebegésre nyílik, de nem csukódik be azonnal, ha a mutató egy pillanatra
   * a menüpont és a panel közti résre téved. 120 ms türelem — ennyi elég, hogy
   * ne kelljen precízen célozni, és még nem érződik ragadósnak.
   */
  const openOnHover = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setSubmenu(label);
  };

  const closeOnHover = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setSubmenu(null), 120);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* A sáv a panel fölött marad: a bezáró gomb csak így érhető el. */}
      <div className="relative z-10 mx-auto w-full max-w-content px-4 pt-3 sm:px-8 sm:pt-4">
        <nav
          aria-label="Fő navigáció"
          className={cn(
            'pointer-events-auto relative flex items-center justify-between gap-3 rounded-pill border px-3 py-2 sm:pl-5 sm:pr-2.5',
            'transition-[transform,background-color,border-color,box-shadow] duration-panel ease-standard',
            // Az elmosás mértéke szándékosan mérsékelt. A sáv a hullámmező
            // fölött lebeg, és a `backdrop-filter` minden képkockán újramintázza
            // az alatta lévő réteget — nagy sugárnál ez a legdrágább művelet az
            // egész oldalon, és rajzolási hibákat is okozott (üres, szürke sáv a
            // fejléc helyén).
            'bg-surface/90 supports-[backdrop-filter]:backdrop-blur-md',
            scrolled ? 'translate-y-0 border-line shadow-float' : 'translate-y-1 border-line/70',
          )}
        >
          <Logo />

          {/* Asztali menü */}
          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className="relative"
                  onPointerEnter={() => openOnHover(item.label)}
                  onPointerLeave={closeOnHover}
                >
                  <button
                    type="button"
                    aria-expanded={submenu === item.label}
                    aria-controls={submenuId}
                    onClick={() => setSubmenu(submenu === item.label ? null : item.label)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-pill px-3.5 text-body-sm transition-colors duration-feedback ease-standard',
                      isActive(item.href) ? 'text-ink' : 'text-muted hover:bg-sky hover:text-ink',
                    )}
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 12 12"
                      className={cn(
                        'h-3 w-3 transition-transform duration-ui ease-standard',
                        submenu === item.label && 'rotate-180',
                      )}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 4.5 6 7.5 9 4.5" />
                    </svg>
                  </button>

                  <div
                    id={submenuId}
                    ref={desktopSubmenuRef}
                    className={cn(
                      'absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-3',
                      'transition-[opacity,transform] duration-ui ease-standard',
                      submenu === item.label
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0',
                    )}
                  >
                    <div className="overflow-hidden rounded-panel border border-line bg-surface p-2 shadow-lift">
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              tabIndex={submenu === item.label ? undefined : -1}
                              aria-current={isActive(child.href) ? 'page' : undefined}
                              // A jelölés bal oldali sáv, nem háttérszín és nem
                              // nagyítás. A keret mindig ott van, csak átlátszó,
                              // tehát a doboz szélessége egy pixelt sem mozdul.
                              className={cn(
                                'submenu-item block rounded-card border-l-2 py-3 pl-3 pr-3.5',
                                'transition-colors duration-feedback ease-standard',
                                isActive(child.href) ? 'border-wave-7' : 'border-transparent',
                              )}
                            >
                              <span className="block text-body-sm font-medium text-ink">
                                {child.label}
                              </span>
                              <span className="mt-0.5 block text-body-sm text-muted">
                                {child.desc}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center rounded-pill px-3.5 text-body-sm transition-colors duration-feedback ease-standard',
                      isActive(item.href) ? 'text-ink' : 'text-muted hover:bg-sky hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-1.5">
            <ButtonLink href={primaryCta.href} className="hidden sm:inline-flex" arrow>
              {primaryCta.label}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobil-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-ink transition-colors duration-feedback ease-standard hover:bg-sky lg:hidden"
            >
              <span className="sr-only">{menuOpen ? 'Menü bezárása' : 'Menü megnyitása'}</span>
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </nav>
      </div>

      <MobileMenu open={menuOpen} isActive={isActive} />
    </header>
  );
}

/**
 * Hamburger, amely kereszté fordul.
 *
 * Két vonal, nem három: a középső amúgy is eltűnne, és nélküle tisztább a
 * záró alakzat. `transform`-mal animál, tehát nem rajzol újra semmit.
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-5">
      <span
        className={cn(
          'absolute left-0 h-px w-full bg-current transition-transform duration-ui ease-standard',
          open ? 'top-1/2 rotate-45' : 'top-1',
        )}
      />
      <span
        className={cn(
          'absolute left-0 h-px w-full bg-current transition-transform duration-ui ease-standard',
          open ? 'top-1/2 -rotate-45' : 'top-[calc(100%-0.25rem)]',
        )}
      />
    </span>
  );
}

/**
 * A mobil menü.
 *
 * A DOM-ban mindig ott van, csak `invisible` — így a nyitás és a zárás is
 * animálható, és nincs az a fajta „bevillan, aztán elindul” hiba, amit a
 * feltételes renderelés okoz. Zárt állapotban a fókusz nem juthat bele
 * (`inert`), tehát a tabulátor nem tűnik el egy láthatatlan panelben.
 */
function MobileMenu({ open, isActive }: { open: boolean; isActive: (href: string) => boolean }) {
  type MenuLink = { label: string; href: string; child?: boolean };

  const links: MenuLink[] = [
    ...nav.flatMap((item) =>
      item.children
        ? [
            { label: item.label, href: item.href },
            ...item.children.map(({ label, href }) => ({ label, href, child: true })),
          ]
        : [{ label: item.label, href: item.href }],
    ),
    { label: 'Kapcsolat', href: primaryCta.href },
  ];

  return (
    <div
      id="mobil-menu"
      inert={open ? undefined : true}
      className={cn(
        'pointer-events-auto fixed inset-0 top-0 z-0 lg:hidden',
        'transition-[opacity,visibility] duration-panel ease-standard',
        open ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className="absolute inset-0 bg-paper" />

      <nav
        aria-label="Mobil navigáció"
        className="relative flex h-full flex-col justify-center overflow-y-auto px-6 pb-16 pt-28"
      >
        <ul className="flex flex-col gap-1">
          {links.map((link, index) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                style={{ transitionDelay: open ? `${80 + index * 40}ms` : '0ms' }}
                className={cn(
                  'block border-b border-line transition-[opacity,transform] duration-panel ease-entrance',
                  link.child ? 'py-3 pl-5 font-sans text-body-lg' : 'py-4 font-display text-h3',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                  isActive(link.href) ? 'text-ink' : 'text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
