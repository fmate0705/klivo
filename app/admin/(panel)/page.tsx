import Link from 'next/link';
import { AdminCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { listLeads } from '@/lib/store/leads';
import { listPosts } from '@/lib/store/posts';

export const dynamic = 'force-dynamic';

/**
 * Áttekintés.
 *
 * Nem műszerfal: három szám és két lista, amiből egy pillanat alatt látszik,
 * van-e dolgod. Grafikonokat nem rajzolunk oda, ahol nincs mit követni.
 */
export default async function AdminHomePage() {
  const [posts, leads] = await Promise.all([listPosts(), listLeads()]);

  const published = posts.filter((post) => post.published).length;
  const newLeads = leads.filter((lead) => lead.status === 'new').length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold">Áttekintés</h1>
          <p className="mt-1 text-muted">Bejegyzések és beérkezett megkeresések.</p>
        </div>
        <ButtonLink href="/admin/bejegyzesek/uj">Új bejegyzés</ButtonLink>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Publikált bejegyzés" value={String(published)} href="/admin/bejegyzesek" />
        <Stat label="Vázlat" value={String(posts.length - published)} href="/admin/bejegyzesek" />
        <Stat label="Új megkeresés" value={String(newLeads)} href="/admin/uzenetek" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Legutóbbi bejegyzések"
          actions={
            <Link href="/admin/bejegyzesek" className="text-body-sm text-ink hover:underline">
              Összes
            </Link>
          }
        >
          {posts.length === 0 ? (
            <p className="text-muted">Még nincs bejegyzés.</p>
          ) : (
            <ul className="divide-y divide-line">
              {posts.slice(0, 5).map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <Link
                    href={`/admin/bejegyzesek/${post.id}`}
                    className="min-w-0 flex-1 truncate text-body-sm hover:text-ink"
                  >
                    {post.title}
                  </Link>
                  <span className="shrink-0 text-body-sm text-muted">
                    {post.published ? 'Publikált' : 'Vázlat'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard
          title="Legutóbbi megkeresések"
          actions={
            <Link href="/admin/uzenetek" className="text-body-sm text-ink hover:underline">
              Összes
            </Link>
          }
        >
          {leads.length === 0 ? (
            <p className="text-muted">Még nem érkezett megkeresés.</p>
          ) : (
            <ul className="divide-y divide-line">
              {leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="py-3 first:pt-0">
                  <span className="block text-body-sm">{lead.name}</span>
                  <span className="mt-0.5 block text-body-sm text-muted">
                    {lead.topic} · {formatDateTime(lead.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard title="Amit nem itt szerkesztesz">
        <ul className="flex flex-col gap-4 text-body-sm text-muted">
          <li>
            <strong className="font-medium text-ink">Árak és szolgáltatás-szövegek.</strong> A
            kódban élnek: <code>lib/content/pricing.ts</code> és <code>lib/content/site.ts</code>.
            Módosítás után új telepítés kell.
          </li>
          <li>
            <strong className="font-medium text-ink">Cégadatok és jogi szövegek.</strong> A{' '}
            <code>.env</code> fájlban. Egyetlen helyen élnek, hogy az impresszum, az ÁSZF és a
            lábléc soha ne mondjon egymásnak ellent. Módosítás után újraindítás kell.
          </li>
        </ul>
      </AdminCard>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-panel border border-line bg-surface px-6 py-5 transition-[transform,border-color,box-shadow] duration-ui ease-standard hover:-translate-y-px hover:border-line-strong hover:shadow-raise"
    >
      <span className="block text-body-sm text-muted">{label}</span>
      <span data-numeric className="mt-2 block font-display text-h3">
        {value}
      </span>
    </Link>
  );
}
