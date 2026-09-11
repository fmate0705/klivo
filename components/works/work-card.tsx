import type { Work } from '@/lib/store/works';
import { cn } from '@/lib/cn';
import { Card, CardLink } from '@/components/ui/card';
import { LogoMark } from '@/components/ui/logo-mark';
import { WorkCover } from '@/components/works/work-cover';

/**
 * Referencia kártya.
 *
 * A sorrend a döntés sorrendje: **kinek** csináltuk (embléma és cégnév), **mit**
 * (címsor), **mi lett belőle** (összefoglaló), és mikor. Egy esettanulmány
 * kártyáján az ügyfél az első információ — nem a mi címsorunk.
 *
 * Az embléma a borító alsó szélén ül, világos korongon (`LogoMark`). Így egy
 * sötét és egy világos logó is olvasható, és a kártya a sötét szekcióban is
 * ugyanúgy működik, mint a világoson — márpedig a főoldali szekció sötét, a
 * listaoldal világos.
 *
 * A cím a hivatkozás, és a `::after` rétegével az egész kártya kattintható: a
 * linklistában így „ügyfél — mit csináltunk” olvasható, nem „Tovább”.
 */
export function WorkCard({
  work,
  sizes = '(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw',
  className,
}: {
  work: Work;
  sizes?: string;
  className?: string;
}) {
  return (
    <Card interactive className={cn('flex min-w-0 flex-col overflow-hidden p-0', className)}>
      <div className="relative">
        <WorkCover
          slug={work.slug}
          {...(work.cover ? { cover: work.cover, alt: work.coverAlt } : {})}
          sizes={sizes}
          className="border-soft aspect-[16/10] w-full border-b"
        />

        {work.logo ? (
          <LogoMark
            src={work.logo}
            alt={work.client}
            className="shadow-raise absolute bottom-0 left-6 h-14 w-28 translate-y-1/2 px-3 py-2"
          />
        ) : null}
      </div>

      <div className={cn('flex flex-1 flex-col p-6', work.logo && 'pt-11')}>
        <p className="text-body-sm font-semibold">{work.client}</p>

        <h3 className="mt-2 text-h5">
          <CardLink href={`/referenciak/${work.slug}`}>{work.title}</CardLink>
        </h3>

        <p className="text-soft mt-3 text-body-sm">{work.excerpt}</p>

        {work.industry || work.year ? (
          <p className="text-soft mt-auto flex flex-wrap items-center gap-2 pt-6 text-body-sm">
            {work.industry ? <span>{work.industry}</span> : null}
            {work.industry && work.year ? <span aria-hidden="true">·</span> : null}
            {work.year ? <span>{work.year}</span> : null}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
