import Link from 'next/link';
import { PostEditor } from '@/components/admin/post-editor';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/bejegyzesek" className="text-body-sm text-muted hover:text-ink">
          ← Bejegyzések
        </Link>
        <h1 className="mt-3 text-h4 font-semibold">Új bejegyzés</h1>
        <p className="mt-1 text-muted">
          Amíg nincs publikálva, csak itt látszik. Mentés után bármikor szerkesztheted.
        </p>
      </header>

      <PostEditor />
    </div>
  );
}
