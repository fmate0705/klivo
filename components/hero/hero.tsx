'use client';

import { useEffect, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { hero, primaryCta, secondaryCta } from '@/lib/site';
import { HeroField } from './hero-field';
import { RotatingWord } from './rotating-word';

/**
 * A nyitóképernyő.
 *
 * Világos felület, középre zárt szövegoszlop, és semmi olyan elem, amely
 * eltakarná a lényeget: nincs álbrowser, nincs termékfotó, nincs felcím-pill.
 * A hierarchia teljesen a tipográfián és a térközön nyugszik — ez az, ami
 * prémiumnak hat, nem a díszítés.
 *
 * A mozgás költségvetése, és hogy miért így költjük el:
 *
 * - **A címsor felfedése tiszta CSS**, inline `animation-delay` lépcsőzéssel.
 *   Egyszer fut, betöltéskor, és nincs hozzá JavaScript — így a hidratálás nem
 *   blokkolja, és nem is akadhat meg tőle.
 * - **A kurzorkövetés két CSS custom propertyt ír**, képkockánként legfeljebb
 *   egyszer, közvetlenül a DOM-ra. Nincs state, nincs újrarenderelés: az egér
 *   mozgatása két property-írásba kerül.
 * - **Durva mutatón (érintőképernyőn) nem fut semmi**: ott nincs hover pozíció,
 *   amit követni lehetne.
 *
 * Csökkentett mozgás mellett az egész statikus, teljesen olvasható elrendezéssé
 * esik össze.
 */
export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let x = 50;
    let y = 34;

    const apply = () => {
      frame = 0;
      root.style.setProperty('--x', `${x}%`);
      root.style.setProperty('--y', `${y}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 100;
      y = ((event.clientY - rect.top) / rect.height) * 100;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // A fény visszatér középre, amikor a kurzor elhagyja a felületet — különben
    // egy sarokban ragadt fénypont maradna utána.
    const onPointerLeave = () => {
      x = 50;
      y = 34;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // A szóindex adja a lépcsőzést. Végig számoljuk a két soron, hogy a ritmus ne
  // induljon újra a második sor elején.
  let wordIndex = 0;

  return (
    <div
      ref={rootRef}
      style={{ '--x': '50%', '--y': '34%' } as React.CSSProperties}
      className="relative isolate overflow-hidden bg-background"
    >
      <HeroField />

      <Container className="relative">
        <div className="flex min-h-[calc(100svh-var(--header-height))] flex-col items-center justify-center py-28 text-center sm:py-32">
          {/* Címsor — egyetlen <h1>, szavanként felfedve. */}
          <h1 className="tracking-display max-w-[15ch] text-5xl sm:text-6xl">
            {hero.titleLines.map((line) => (
              <span key={line} className="block">
                {line.split(' ').map((word) => {
                  const delay = 120 + wordIndex * 85;
                  wordIndex += 1;
                  return (
                    // A vágó span teszi, hogy a szó a semmiből emelkedjen ki,
                    // nem pedig helyben úsztassuk be. A szóköz a vágó spanen
                    // KÍVÜL van: belül a túlcsordulás levágná, és a szavak
                    // összeérnének.
                    <span key={word}>
                      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                        <span
                          className="animate-rise-in inline-block"
                          style={{ animationDelay: `${delay}ms` }}
                        >
                          {word}
                        </span>
                      </span>{' '}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          {/* Bevezető */}
          <p
            className="animate-rise-in mt-8 max-w-[54ch] text-lg leading-relaxed text-muted sm:text-xl"
            style={{ animationDelay: '460ms' }}
          >
            {hero.subtitle}
          </p>

          {/* Váltakozó állítás */}
          <p
            className="animate-rise-in mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.9375rem] text-subtle"
            style={{ animationDelay: '540ms' }}
          >
            <span>{hero.rotatingPrefix}</span>
            <RotatingWord words={hero.rotatingWords} />
          </p>

          {/* Gombok */}
          <div
            className="animate-rise-in mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: '620ms' }}
          >
            <ButtonLink href={primaryCta.href} size="lg" className="w-full sm:w-auto">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={secondaryCta.href}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              {secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </Container>

      <ScrollCue label={hero.scrollCue} />
    </div>
  );
}

/**
 * A görgetésre hívó jel. Valódi link az első szekcióra, tehát billentyűzettel
 * ugyanaz a rövidítés jár, mint egérrel a görgetés.
 */
function ScrollCue({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center sm:bottom-8">
      <a
        href="#ertek"
        className="group pointer-events-auto flex flex-col items-center gap-2 rounded-full px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-subtle transition-colors duration-fast hover:text-foreground"
      >
        {label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="animate-cue-bounce"
        >
          <path
            d="M8 3v9m0 0 3.5-3.5M8 12 4.5 8.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
