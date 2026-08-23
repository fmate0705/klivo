import { FaqEditor } from '@/components/admin/faq-editor';

export const dynamic = 'force-dynamic';

export default function NewFaqPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h4 font-semibold">Új kérdés</h1>
        <p className="mt-1 text-muted">
          Ha egyik oldalt sem jelölöd be, a kérdés mindegyiken megjelenik.
        </p>
      </header>

      <FaqEditor />
    </div>
  );
}
