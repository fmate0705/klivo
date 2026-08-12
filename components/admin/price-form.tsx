'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { PRICE_FIELDS, PRICE_KEYS, type Prices } from '@/lib/store/prices';
import { PRICE_MAX_LENGTH, type FieldErrors } from '@/lib/validation';

/**
 * Az árak szerkesztése.
 *
 * Szabad szöveges mezők, mert az árak az oldalon is szövegként jelennek meg
 * („100 000 Ft-tól”, „Egyedi ajánlat”). A mentés után az érintett oldalak
 * gyorsítótára azonnal frissül a szerveren, tehát nem kell megvárni az ISR
 * ablakot.
 */
export function PriceForm({ prices }: { prices: Prices }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(PRICE_KEYS.map((key) => [key, String(form.get(key) ?? '')]));

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
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
        setNotice(result.error ?? 'A mentés nem sikerült.');
        setPending(false);
        return;
      }

      setNotice('Az árak frissültek az oldalon.');
      setPending(false);
      router.refresh();
    } catch {
      setNotice('Hálózati hiba. Próbáld újra.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {notice ? (
        <AdminNotice tone={Object.keys(errors).length > 0 ? 'danger' : 'success'}>
          {notice}
        </AdminNotice>
      ) : null}

      <AdminCard
        title="Árak"
        description="Ezek az értékek jelennek meg a főoldalon, a szolgáltatás oldalakon és az llms.txt fájlban."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {PRICE_FIELDS.map((field) => (
            <AdminField
              key={field.key}
              label={field.label}
              htmlFor={field.key}
              hint={field.hint}
              error={errors[field.key]}
            >
              <input
                id={field.key}
                name={field.key}
                defaultValue={prices[field.key]}
                maxLength={PRICE_MAX_LENGTH}
                className={adminInputClass(errors[field.key])}
              />
            </AdminField>
          ))}
        </div>
      </AdminCard>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Mentés…' : 'Árak mentése'}
      </Button>
    </form>
  );
}
