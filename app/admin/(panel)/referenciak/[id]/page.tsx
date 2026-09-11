import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WorkEditor } from '@/components/admin/work-editor';
import { getWorkById } from '@/lib/store/works';

export const dynamic = 'force-dynamic';

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await getWorkById(id);
  if (!work) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link href="/admin/referenciak" className="text-body-sm text-muted hover:text-ink">
          ← Referenciák
        </Link>
        <h1 className="mt-2 text-h4 font-semibold">{work.client}</h1>
        <p className="mt-1 text-muted">
          {work.title} · {work.published ? 'publikált' : 'vázlat'}
        </p>
      </header>

      <WorkEditor work={work} />
    </div>
  );
}
