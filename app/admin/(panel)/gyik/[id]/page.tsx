import { notFound } from 'next/navigation';
import { FaqEditor } from '@/components/admin/faq-editor';
import { getFaqItem } from '@/lib/store/faq';

export const dynamic = 'force-dynamic';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getFaqItem(id);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h4 font-semibold">Kérdés szerkesztése</h1>
        <p className="mt-1 truncate text-muted">{item.question}</p>
      </header>

      <FaqEditor item={item} />
    </div>
  );
}
