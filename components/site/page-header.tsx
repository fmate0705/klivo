import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { WaveCurls } from '@/components/wave/wave-curls';
import { Bubbles } from '@/components/wave/bubbles';
import { SmartImage } from '@/components/ui/smart-image';

/**
 * Az aloldalak fejléce.
 *
 * Ugyanaz a hullámmotor, mint a főoldali nyitóképernyőn (`WaveCurls`), csak
 * alacsonyabb felületen: az aloldalon a látogató már döntött, hogy itt akar
 * lenni, tehát nem egy újabb teljes képernyős bevezető kell neki, hanem a
 * tartalom. A közös formanyelv viszont megmarad, így minden oldal ugyanannak
 * az oldalnak érződik.
 *
 * **A magasság fix.** Minden aloldal fejléce ugyanakkora, akármilyen hosszú a
 * címsor, és akár van mellette kép, akár nincs. Tartalomhoz igazodó
 * magasságnál oldalanként más méretű hullámfelület fogadná a látogatót — az
 * pedig nem formanyelv, hanem esetlegesség.
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
      // Fix magasság: minden aloldal fejléce ugyanakkora, függetlenül attól,
      // milyen hosszú a címsor vagy van-e mellette kép. Enélkül oldalanként
      // más magasságú hullámfelület fogadná a látogatót.
      className="relative isolate flex min-h-[clamp(28rem,46vh,34rem)] flex-col justify-center overflow-hidden bg-wave-2 pb-28 pt-32 text-ink lg:min-h-[38rem] lg:pb-32 lg:pt-40"
      aria-labelledby="oldal-cim"
    >
      <WaveCurls align="top" waterline />
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
                className="rise mt-6 max-w-prose text-body-lg font-medium text-ink"
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
