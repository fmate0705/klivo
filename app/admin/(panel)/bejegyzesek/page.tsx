import Link from 'next/link';
import { AdminCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { listPosts } from '@/lib/store/posts';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await listPosts();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bejegyzések</h1>
          <p className="mt-1 text-muted">
            {posts.length} bejegyzés, ebből {posts.filter((post) => post.published).length}{' '}
            publikált.
          </p>
        </div>
        <ButtonLink href="/admin/bejegyzesek/uj">Új bejegyzés</ButtonLink>
      </header>

      <AdminCard>
        {posts.length === 0 ? (
          <p className="text-muted">Még nincs bejegyzés. Kezdd az elsővel.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/bejegyzesek/${post.id}`}
                    className="text-[0.9375rem] font-medium text-foreground hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-sm text-subtle">
                    /blog/{post.slug} · {post.category} · módosítva {formatDateTime(post.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={
                      post.published
                        ? 'rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/20'
                        : 'rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted ring-1 ring-inset ring-border'
                    }
                  >
                    {post.published ? 'Publikált' : 'Vázlat'}
                  </span>

                  {post.published ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="text-sm text-muted hover:text-foreground"
                    >
                      Megnézem
                    </Link>
                  ) : null}

                  <Link
                    href={`/admin/bejegyzesek/${post.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Szerkesztés
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
