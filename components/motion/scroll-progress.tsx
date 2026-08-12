'use client';

import { useEffect, useRef } from 'react';

/**
 * Olvasási haladásjelző — a navigációs sáv köré rajzolva.
 *
 * Korábban ez egy hajszálvékony vonal volt a fejléc alatt, végig a képernyő
 * szélességében. Az a megoldás egy külön, vízszintes vonalat húzott a lapra,
 * ami elvágta a tartalmat a fejléctől. Gyűrűként a jelzés ugyanazt mondja el,
 * de nem tesz hozzá új elemet a felülethez: maga a navigáció kerete telik meg.
 *
 * Megvalósítás: kúpos (`conic`) színátmenet a szülő elem alakjára vágva. A
 * `mask-composite: exclude` két maszkot von ki egymásból — a külső a teljes
 * felület, a belső a `padding`-gel kisebbített belseje —, így csak egy 1,5
 * pixeles keret marad látható. Ettől követi a gyűrű pontosan a lekerekített
 * sáv alakját, SVG és méretszámolás nélkül.
 *
 * Teljesítmény: a görgetésfigyelő passzív és képkockára van fogva, és nem React
 * statet, hanem egy CSS custom propertyt ír. Görgetés közben tehát semmi nem
 * renderelődik újra.
 */
export function ScrollProgressRing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A képernyőnél nem hosszabb oldalon nincs értelmes haladás.
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      element.style.setProperty('--progress', progress.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-decorative
      style={{
        // A kezdőszög felül van (−90°), így a gyűrű a sáv tetejének közepéről
        // indul, és óramutató járásával egyezően fut körbe.
        background:
          'conic-gradient(from -90deg, rgb(var(--primary-rgb)) calc(var(--progress, 0) * 360deg), transparent 0deg)',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        maskComposite: 'exclude',
        padding: '1.5px',
      }}
      className="pointer-events-none absolute inset-0 rounded-full opacity-90"
    />
  );
}
