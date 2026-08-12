import Link from 'next/link';
import { AdminCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { listLeads } from '@/lib/store/leads';
import { listPosts } from '@/lib/store/posts';
import { getSettings } from '@/lib/store/settings';

export const dynamic = 'force-dynamic';

/**
 * Áttekintés.
 *
 * Nem műszerfal: három szám és két lista, amiből egy pillanat alatt látszik,
 * van-e dolgod. Grafikonokat nem rajzolunk oda, ahol nincs mit követni.
 */
export default async function AdminHomePage() {
  const [posts, leads, settings] = await Promise.all([listPosts(), listLeads(), getSettings()]);

  const published = posts.filter((post) => post.published).length;
  const newLeads = leads.filter((lead) => lead.status === 'new').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Áttekintés</h1>
          <p className="mt-1 text-muted">Bejegyzések, árak és beérkezett megkeresések.</p>
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
            <Link href="/admin/bejegyzesek" className="text-sm text-primary hover:underline">
              Összes
            </Link>
          }
        >
          {posts.length === 0 ? (
            <p className="text-muted">Még nincs bejegyzés.</p>
          ) : (
            <ul className="divide-y divide-border">
              {posts.slice(0, 5).map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <Link
                    href={`/admin/bejegyzesek/${post.id}`}
                    className="min-w-0 flex-1 truncate text-[0.9375rem] text-foreground hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <span className="shrink-0 text-sm text-subtle">
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
            <Link href="/admin/uzenetek" className="text-sm text-primary hover:underline">
              Összes
            </Link>
          }
        >
          {leads.length === 0 ? (
            <p className="text-muted">Még nem érkezett megkeresés.</p>
          ) : (
            <ul className="divide-y divide-border">
              {leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="py-3 first:pt-0">
                  <span className="block text-[0.9375rem] text-foreground">{lead.name}</span>
                  <span className="mt-0.5 block text-sm text-subtle">
                    {lead.topic} · {formatDateTime(lead.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard
        title="Jelenlegi árak"
        description={
          settings.updatedAt
            ? `Utoljára módosítva: ${formatDateTime(settings.updatedAt)}`
            : 'Még nem módosítottad az alapértelmezett árakat.'
        }
        actions={
          <Link href="/admin/arak" className="text-sm text-primary hover:underline">
            Szerkesztés
          </Link>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(settings.prices).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-surface px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.12em] text-subtle">{key}</dt>
              <dd className="mt-1 font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </AdminCard>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface-raised px-6 py-5 transition-[transform,border-color,box-shadow] duration-normal ease-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
    >
      <span className="block text-sm text-subtle">{label}</span>
      <span className="mt-2 block text-3xl font-semibold text-foreground">{value}</span>
    </Link>
  );
}
