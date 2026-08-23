import Link from 'next/link';
import { AdminCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { FAQ_PAGES, listFaq } from '@/lib/store/faq';

export const dynamic = 'force-dynamic';

const PAGE_LABEL = new Map<string, string>(FAQ_PAGES.map((page) => [page.key, page.label]));

export default async function AdminFaqPage() {
  const items = await listFaq();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold">Gyakori kérdések</h1>
          <p className="mt-1 text-muted">
            {items.length} kérdés. Minden kérdéshez megadható, mely oldalakon jelenjen meg.
          </p>
        </div>
        <ButtonLink href="/admin/gyik/uj">Új kérdés</ButtonLink>
      </header>

      <AdminCard>
        {items.length === 0 ? (
          <p className="text-muted">
            Még nincs felvett kérdés. Amíg üres, a nyilvános oldalakon a beépített alapkérdések
            jelennek meg.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/gyik/${item.id}`}
                  className="text-body-sm font-medium hover:text-wave-7"
                >
                  {item.question}
                </Link>
                <span className="text-body-sm text-muted">
                  sorrend: {item.order} ·{' '}
                  {item.pages.length === 0
                    ? 'minden oldalon'
                    : item.pages.map((key) => PAGE_LABEL.get(key) ?? key).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
