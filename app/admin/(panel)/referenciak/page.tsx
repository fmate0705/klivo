import Link from 'next/link';
import Image from 'next/image';
import { AdminCard } from '@/components/admin/ui';
import { WorksSectionSettings } from '@/components/admin/works-section-settings';
import { ButtonLink } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/store/site-settings';
import { listWorks } from '@/lib/store/works';

export const dynamic = 'force-dynamic';

/**
 * A referenciák áttekintése.
 *
 * Két dolog van egy képernyőn: a **lista** és a **főoldali szekció**
 * beállítása. Azért együtt, mert a kettő ugyanarról szól: a szerkesztő itt
 * dönti el, mi készül el és mi kerül ki a nyitólapra — két külön menüpontban
 * ezt a kapcsolatot nem látná.
 */
export default async function AdminWorksPage() {
  const works = await listWorks();
  const settings = await getSiteSettings();
  const publishedCount = works.filter((work) => work.published).length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold">Referenciák</h1>
          <p className="mt-1 text-muted">
            {works.length} esettanulmány, ebből {publishedCount} publikált. Ezek jelennek meg a
            Referenciák oldalon.
          </p>
        </div>
        <ButtonLink href="/admin/referenciak/uj">Új referencia</ButtonLink>
      </header>

      <AdminCard>
        {works.length === 0 ? (
          <p className="text-muted">
            Még nincs referencia. Amíg üres, a főoldali szekció nem jelenik meg, a Referenciák oldal
            pedig kiírja, hogy most készülnek az elsők.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {works.map((work) => (
              <li
                key={work.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-wave-2">
                    {work.logo ? (
                      <Image
                        src={work.logo}
                        alt=""
                        width={160}
                        height={96}
                        unoptimized={work.logo.toLowerCase().endsWith('.svg')}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : null}
                  </span>

                  <span className="min-w-0">
                    <Link
                      href={`/admin/referenciak/${work.id}`}
                      className="block truncate text-body-sm font-medium hover:text-wave-7"
                    >
                      {work.client} — {work.title}
                    </Link>
                    <span className="block text-body-sm text-muted">
                      {work.published ? 'Publikált' : 'Vázlat'} · {work.blocks.length} szekció ·
                      sorrend: {work.order}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {work.published ? (
                    <Link
                      href={`/referenciak/${work.slug}`}
                      target="_blank"
                      className="text-body-sm text-muted hover:text-ink"
                    >
                      Megnézem
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/referenciak/${work.id}`}
                    className="text-body-sm text-wave-7 hover:underline"
                  >
                    Szerkesztés
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <WorksSectionSettings settings={settings} works={works} />
    </div>
  );
}
