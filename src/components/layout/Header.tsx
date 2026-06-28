"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { nav, primaryCta } from "@/lib/site";
import BrandMark from "@/components/ui/BrandMark";

const SERVICE_PATHS = ["/weboldal-keszites", "/egyedi-fejlesztes", "/tarhely"];

export default function Header() {
  const [open, setOpen] = useState(false); // mobil menü
  const [services, setServices] = useState(false); // szolgáltatások dropdown
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // Menük zárása oldalváltáskor.
  useEffect(() => {
    setOpen(false);
    setServices(false);
  }, [pathname]);

  // Body osztály a mobil menü nyitott állapotához.
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  // Nav háttér görgetéskor (sentinel + IntersectionObserver).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Escape zárja mindkét menüt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setServices(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Külső kattintás/érintés zárja a dropdownt (érintőképernyőn is).
  useEffect(() => {
    if (!services) return;
    const onDown = (e: PointerEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setServices(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [services]);

  const servicesActive = SERVICE_PATHS.includes(pathname);
  const isActive = (href: string) =>
    href !== "/" && !href.includes("#") && pathname === href;

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" className="nav-sentinel" />
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="container nav__inner">
          <Link href="/" className="brand" aria-label="Klivo főoldal">
            <span className="brand__mark" aria-hidden="true">
              <BrandMark size={28} />
            </span>
            <span className="brand__name">Klivo</span>
          </Link>

          <nav className="nav__links" id="primary-nav" aria-label="Fő navigáció">
            {nav.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="nav__group"
                  data-open={services}
                  ref={groupRef}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setServices(true);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") setServices(false);
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setServices(false);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={`nav__link${servicesActive ? " is-active" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={services}
                    aria-current={servicesActive ? "page" : undefined}
                    onClick={() => setServices((v) => !v)}
                  >
                    {item.label}
                    <CaretDown size={14} weight="bold" />
                  </button>
                  <div className="nav__menu">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        aria-current={pathname === c.href ? "page" : undefined}
                      >
                        <strong>{c.label}</strong>
                        <span>{c.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav__link${isActive(item.href) ? " is-active" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link href={primaryCta.href} className="btn btn--primary nav__cta">
              {primaryCta.label}
            </Link>
          </nav>

          <button
            className="nav__toggle"
            type="button"
            aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}
