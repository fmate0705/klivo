'use client';

import { useEffect, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { observeScroll } from '@/components/motion/scroll-driver';
import { processSteps } from '@/lib/site';

/**
 * A munkamenet öt lépése, egy görgetéssel kitöltődő gerincen.
 *
 * Két dolog vezeti itt a szemet, és egyik sem díszítés:
 *
 * - **A nagy, kontúros lépésszám.** Kitöltés nélkül, csak körvonallal — így
 *   elég nagy ahhoz, hogy azonnal megadja a sorrendet, de nem versenyez a
 *   címsorral a figyelemért. Ez a tipográfiai trükk viszi a lépések ritmusát.
 * - **A kitöltődő vonal.** Pontosan annyira van kész, amennyire az olvasó
 *   végighaladt a szekción, tehát a saját haladását mutatja vissza. A kitöltés
 *   egyetlen CSS custom property (`--p`) függvénye, amit a közös scroll driver
 *   ír — nincs se React state, se görgetésenkénti újrarenderelés.
 *
 * A sorok nagy képernyőn oldalt váltanak, hogy a szem cikkcakkban haladjon
 * lefelé, ne egyenesen zuhanjon — ugyanaz az elv, amiért egy magazin is
 * váltogatja, melyik oldalon van a kép.
 */
export function ProcessTimeline({ heading = true }: { heading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeScroll(element, '--p', [0.2, 0.85]);
  }, []);

  const total = processSteps.length;

  return (
    <Section id="folyamat">
      <Container>
        {heading ? (
          <SectionHeader
            eyebrow="Így dolgozunk"
            title="Nem tervrajzokat küldünk, hanem oldalt építünk"
            lead="Öt lépés, ami nem húzódik el. Nincs hetekig tartó egyeztetés arról, hogy melyik gomb legyen kék: megmutatjuk működés közben, és onnan alakítjuk."
          />
        ) : null}

        <div ref={ref} className="relative mt-16 lg:mt-24">
          {/* A gerinc — mobilon balra zárt, nagy képernyőn középen. */}
          <div
            aria-hidden="true"
            data-decorative
            className="absolute bottom-6 left-[7px] top-4 w-px bg-border lg:left-1/2 lg:-translate-x-1/2"
          >
            <div
              className="bg-sheen-primary h-full w-full origin-top"
              style={{ transform: 'scaleY(var(--p, 0))' }}
            />
          </div>

          <ol className="space-y-16 lg:space-y-0">
            {processSteps.map((step, index) => {
              // Az a pont a gerincen, ahol ez a lépés „kigyullad”.
              const threshold = ((index + 0.35) / total).toFixed(3);
              const activation = `clamp(0, calc((var(--p, 0) - ${threshold}) * 12), 1)`;

              return (
                <li
                  key={step.title}
                  className="relative pl-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20 lg:pb-20 lg:pl-0"
                >
                  {/* Csomópont a gerincen. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.6rem] h-[15px] w-[15px] rounded-full border border-border bg-background lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                    style={{
                      borderColor: `color-mix(in srgb, rgb(var(--primary-rgb)) calc(${activation} * 100%), rgb(var(--border-rgb)))`,
                      boxShadow: `0 0 0 calc(5px * ${activation}) rgb(var(--primary-rgb) / calc(0.08 * ${activation}))`,
                    }}
                  />

                  <div
                    data-reveal={index % 2 === 0 ? 'left' : 'right'}
                    className={
                      index % 2 === 0
                        ? 'lg:col-start-1 lg:pr-6 lg:text-right'
                        : 'lg:col-start-2 lg:row-start-auto lg:pl-6'
                    }
                  >
                    {/* A nagy, kontúros lépésszám. Külön felirat nem kell mellé:
                        a szám maga mondja meg, hányadik lépésnél tartunk.
                        Ahogy a gerinc kitöltése ideér, a körvonal a szegély
                        színéből a márkaszínbe vált, és halvány kitöltést kap —
                        ugyanabból a `--p` értékből, tehát külön figyelő nélkül. */}
                    <span
                      aria-hidden="true"
                      className="tracking-display block select-none text-5xl font-semibold leading-none sm:text-6xl"
                      style={{
                        WebkitTextStrokeWidth: '1px',
                        WebkitTextStrokeColor: `color-mix(in srgb, rgb(var(--primary-rgb)) calc(${activation} * 100%), rgb(var(--border-strong-rgb)))`,
                        color: `rgb(var(--primary-rgb) / calc(0.12 * ${activation}))`,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h3 className="mt-5 text-2xl">{step.title}</h3>
                    <p
                      className={`mt-3 max-w-md leading-relaxed text-muted ${
                        index % 2 === 0 ? 'lg:ml-auto' : ''
                      }`}
                    >
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
