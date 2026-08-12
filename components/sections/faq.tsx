'use client';

import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { GridArt } from '@/components/ui/section-art';
import { faqs } from '@/lib/site';

/**
 * Gyakori kérdések, animált lenyitással.
 *
 * Miért nem natív `<details>`: azt a böngésző pillanatszerűen nyitja ki, és a
 * magassága nem animálható megbízhatóan minden böngészőben. Egy kérdéssor,
 * amely ugrásszerűen kinyílik, szétrántja alatta az egész szekciót — pont az a
 * fajta durva mozdulat, ami elrontja egy egyébként nyugodt oldal ritmusát.
 *
 * Helyette: gomb + `aria-expanded` + `region`, és a válaszdoboz magassága
 * pixelben animálódik. A magasságot `ResizeObserver` tartja naprakészen, tehát
 * ablakátméretezéskor vagy betűméret-változáskor sem ugrik el. A tartalom
 * mindig benne marad a DOM-ban (csak `height: 0` és `overflow: hidden`), így a
 * strukturált adat és a szöveg is elérhető marad.
 *
 * Csökkentett mozgás mellett a globális szabály 0,01 ms-ra rövidíti az
 * átmenetet: a nyitás azonnalivá válik, de semmi nem törik el.
 */
export function Faq({
  items = faqs,
  id = 'gyik',
}: {
  items?: readonly { q: string; a: string }[];
  id?: string;
}) {
  return (
    <Section id={id} className="isolate overflow-hidden">
      <GridArt size={72} opacity={0.45} />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeader
            eyebrow="Gyakori kérdések"
            title="Amit a legtöbben megkérdeznek"
            lead="Ha valami kimaradt, írj nyugodtan — egy munkanapon belül válaszolunk."
          />

          <div className="divide-y divide-border border-y border-border">
            {items.map((item, index) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // A mért magasság a nyitott állapot célértéke. `ResizeObserver` figyeli, mert
  // a válasz magassága a szélességtől függ — átméretezéskor újra kell számolni,
  // különben nyitott állapotban levágódna vagy üres helyet hagyna.
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () => setHeight(element.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const panelId = `gyik-valasz-${index}`;
  const buttonId = `gyik-kerdes-${index}`;

  return (
    <div
      data-reveal
      style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}
      className="group"
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left text-lg font-medium text-foreground transition-colors duration-fast hover:text-primary"
        >
          {question}
          <span
            aria-hidden="true"
            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,color] duration-normal ease-expo ${
              open ? 'rotate-45 border-primary/40 text-primary' : 'border-border text-muted'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 2.5v7M2.5 6h7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{ height: open ? `${height}px` : 0 }}
        className="overflow-hidden transition-[height] duration-normal ease-expo"
      >
        <div ref={contentRef}>
          <p
            className={`max-w-[62ch] pb-7 leading-relaxed text-muted transition-opacity duration-normal ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
