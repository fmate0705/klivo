'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { FAQ_LIMITS, type FieldErrors } from '@/lib/validation';
import { FAQ_PAGES } from '@/lib/content/faq-pages';
import type { FaqItem } from '@/lib/store/faq';

/**
 * Gyakori kérdés szerkesztő.
 *
 * Ugyanaz a szerkezet, mint a bejegyzés- és a csapatszerkesztőé — ugyanaz a
 * mezőkomponens, ugyanaz a visszajelzés. Aki az egyiket használta, a másikat
 * is ismeri.
 *
 * A megjelenési helyek jelölőnégyzetek. **Ha egyiket sem pipálod be, a kérdés
 * mindenhol megjelenik**: a legtöbb kérdés általános, és jobb, ha az
 * alapértelmezés a „mindenhol”, mint ha hat négyzetet kellene bepipálni
 * minden alkalommal.
 */
export function FaqEditor({ item }: { item?: FaqItem }) {
  const router = useRouter();
  const isEdit = Boolean(item);

  const [pages, setPages] = useState<string[]>(item?.pages ?? []);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');
  const [pending, setPending] = useState(false);

  function report(message: string, tone: 'success' | 'danger') {
    setNotice(message);
    setNoticeTone(tone);
  }

  function togglePage(key: string) {
    setPages((current) =>
      current.includes(key) ? current.filter((value) => value !== key) : [...current, key],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      question: String(form.get('question') ?? ''),
      answer: String(form.get('answer') ?? ''),
      pages,
      order: Number(form.get('order') ?? 0),
    };

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch(isEdit ? `/api/admin/gyik/${item?.id}` : '/api/admin/gyik', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: FieldErrors;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        report(result.error ?? 'A mentés nem sikerült. Nézd át a jelölt mezőket.', 'danger');
        setPending(false);
        return;
      }

      router.replace('/admin/gyik');
      router.refresh();
    } catch {
      report('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  async function onDelete() {
    if (!item || pending) return;
    if (!window.confirm('Biztosan törlöd ezt a kérdést?')) return;

    setPending(true);
    const response = await fetch(`/api/admin/gyik/${item.id}`, { method: 'DELETE' });

    if (!response.ok) {
      report('A törlés nem sikerült.', 'danger');
      setPending(false);
      return;
    }

    router.replace('/admin/gyik');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard title="Kérdés és válasz">
        <div className="flex flex-col gap-5">
          <AdminField label="Kérdés" htmlFor="question" error={errors.question} required>
            <input
              id="question"
              name="question"
              defaultValue={item?.question ?? ''}
              maxLength={FAQ_LIMITS.question}
              className={adminInputClass(errors.question)}
            />
          </AdminField>

          <AdminField
            label="Válasz"
            htmlFor="answer"
            hint="Néhány mondat. Konkrétan válaszolj — a kitérő válasz rosszabb, mint a hiánya."
            error={errors.answer}
            required
          >
            <textarea
              id="answer"
              name="answer"
              rows={6}
              defaultValue={item?.answer ?? ''}
              maxLength={FAQ_LIMITS.answer}
              className={adminInputClass(errors.answer)}
            />
          </AdminField>

          <AdminField label="Sorrend" htmlFor="order" hint="Kisebb szám előrébb kerül a listában.">
            <input
              id="order"
              name="order"
              type="number"
              defaultValue={item?.order ?? 0}
              className={adminInputClass()}
            />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Hol jelenjen meg?"
        description="Ha egyiket sem jelölöd be, a kérdés minden oldalon megjelenik."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {FAQ_PAGES.map((page) => (
            <li key={page.key}>
              <label className="flex items-center gap-3 text-body-sm">
                <input
                  type="checkbox"
                  checked={pages.includes(page.key)}
                  onChange={() => togglePage(page.key)}
                  className="h-4 w-4 rounded border-line text-wave-8"
                />
                {page.label}
              </label>
            </li>
          ))}
        </ul>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Mentés…' : isEdit ? 'Mentés' : 'Kérdés hozzáadása'}
        </Button>

        {isEdit ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
            Törlés
          </Button>
        ) : null}
      </div>
    </form>
  );
}
