import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { WaveSwirl } from '@/components/wave/wave-swirl';
import { Bubbles } from '@/components/wave/bubbles';
import { SmartImage } from '@/components/ui/smart-image';

/**
 * Az aloldalak fejléce.
 *
 * Ugyanaz a világos felület és ugyanazok a mutatót követő hullámszalagok, mint
 * a főoldali nyitóképernyőn — csak **összenyomva**: az aloldalon a látogató már
 * döntött, hogy itt akar lenni, tehát nem egy újabb teljes képernyős bevezető
 * kell neki, hanem a tartalom. A közös formanyelv viszont megmarad, így minden
 * oldal ugyanannak az oldalnak érződik.
 *
 * **Ha kép is van, a víz még lejjebb kezdődik.** A kép fehér felületen ül, és
 * keret nélkül — így beleolvad a lapba ahelyett, hogy ablakként ülne rajta.
 *
 * Morzsamenü nincs: az oldal két szint mély, a fejlécből minden elérhető, és
 * egy kétszavas morzsa csak zajt vitt a címsor fölé. A hierarchiát a
 * strukturált adat (`BreadcrumbList`) továbbra is közli a keresővel.
 */
export function PageHeader({
  title,
  lead,
  image,
  children,
}: {
  title: string;
  lead?: string;
  image?: { src: string; alt: string };
  /** Gombok vagy kiegészítő tartalom a felvezető alatt. */
  children?: ReactNode;
}) {
  return (
    <section
      className="relative isolate overflow-hidden bg-white pb-28 pt-28 text-ink sm:pt-32 lg:pb-36 lg:pt-40"
      aria-labelledby="oldal-cim"
    >
      <WaveSwirl className={image ? 'wave-swirl--header-low' : 'wave-swirl--header'} />
      <Bubbles />

      <Container className="wave-content">
        <div
          className={cn(
            'grid items-center gap-10',
            image ? 'lg:grid-cols-12 lg:gap-14' : 'max-w-4xl',
          )}
        >
          <div className={image ? 'lg:col-span-6' : undefined}>
            <h1 id="oldal-cim" className="rise font-display text-h1">
              {title}
            </h1>

            {lead ? (
              <p
                className="rise text-soft mt-6 max-w-prose text-body-lg"
                style={{ '--rise-delay': '90ms' } as React.CSSProperties}
              >
                {lead}
              </p>
            ) : null}

            {children ? (
              <div
                className="rise mt-8 flex flex-wrap items-center gap-3"
                style={{ '--rise-delay': '160ms' } as React.CSSProperties}
              >
                {children}
              </div>
            ) : null}
          </div>

          {image ? (
            <div className="lg:col-span-6">
              <SmartImage
                src={image.src}
                alt={image.alt}
                width={1200}
                height={896}
                sizes="(min-width: 1024px) 46vw, 100vw"
                priority
                className="rounded-panel"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
