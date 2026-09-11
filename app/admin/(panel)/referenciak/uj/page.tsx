import Link from 'next/link';
import { WorkEditor } from '@/components/admin/work-editor';

export const dynamic = 'force-dynamic';

export default function NewWorkPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link href="/admin/referenciak" className="text-body-sm text-muted hover:text-ink">
          ← Referenciák
        </Link>
        <h1 className="mt-2 text-h4 font-semibold">Új referencia</h1>
        <p className="mt-1 text-muted">
          Az alapadatok után az oldal tartalma sablonokból rakható össze. Publikálás nélkül is
          menthető — akkor vázlat marad.
        </p>
      </header>

      <WorkEditor />
    </div>
  );
}
