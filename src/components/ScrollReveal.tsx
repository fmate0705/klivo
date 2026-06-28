"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Felfedi a `.reveal` elemeket görgetéskor (IntersectionObserver).
 * A tartalom alapból a HTML-ben van és látható (SEO + JS nélkül is olvasható);
 * a rejtett kezdőállapotot csak a `.js` osztály kapcsolja be (lásd layout.tsx).
 * Mozgáscsökkentés esetén azonnal mindent megjelenít.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
    );
    if (els.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
