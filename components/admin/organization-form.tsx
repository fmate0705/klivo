'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import {
  COMPANY_FIELDS,
  CONTACT_FIELDS,
  ORGANIZATION_FIELDS,
  ORGANIZATION_MAX_LENGTH,
  type Company,
  type Contact,
  type OrganizationField,
} from '@/lib/store/organization';
import type { FieldErrors } from '@/lib/validation';

/**
 * Elérhetőség és cégadatok szerkesztése.
 *
 * Ezek az értékek jelennek meg a láblécben, a kapcsolat oldalon, az
 * impresszumban, az ÁSZF-ben, az adatkezelési tájékoztatóban és a keresőknek
 * küldött strukturált adatban is. Egyetlen helyen kell átírni őket — nem kell
 * hozzá fejlesztő, és nem kell új deploy.
 *
 * A mezőlista ugyanabból a leírásból jön, amit a mentő végpont is használ, tehát
 * az űrlap és a szerver nem tud szétcsúszni.
 */
export function OrganizationForm({ contact, company }: { contact: Contact; company: Company }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const values: Record<string, string> = { ...contact, ...company };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      ORGANIZATION_FIELDS.map((field) => [field.key, String(form.get(field.key) ?? '')]),
    );

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch('/api/admin/organization', {
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
        setNotice(result.error ?? 'A mentés nem sikerült. Nézd át a jelölt mezőket.');
        setPending(false);
        return;
      }

      setNotice('Elmentve. Az oldalon, a jogi dokumentumokban és a keresőadatokban is frissült.');
      setPending(false);
      router.refresh();
    } catch {
      setNotice('Hálózati hiba. Próbáld újra.');
      setPending(false);
    }
  }

  const renderField = (field: OrganizationField) => (
    <AdminField
      key={field.key}
      label={field.label}
      htmlFor={field.key}
      hint={field.hint || undefined}
      error={errors[field.key]}
    >
      {field.multiline ? (
        <textarea
          id={field.key}
          name={field.key}
          rows={3}
          defaultValue={values[field.key] ?? ''}
          maxLength={ORGANIZATION_MAX_LENGTH}
          className={adminInputClass(errors[field.key])}
        />
      ) : (
        <input
          id={field.key}
          name={field.key}
          defaultValue={values[field.key] ?? ''}
          maxLength={ORGANIZATION_MAX_LENGTH}
          className={adminInputClass(errors[field.key])}
        />
      )}
    </AdminField>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {notice ? (
        <AdminNotice tone={Object.keys(errors).length > 0 ? 'danger' : 'success'}>
          {notice}
        </AdminNotice>
      ) : null}

      <AdminCard
        title="Elérhetőség"
        description="A láblécben, a kapcsolat oldalon és a keresőknek küldött adatokban jelenik meg."
      >
        <div className="grid gap-5 sm:grid-cols-2">{CONTACT_FIELDS.map(renderField)}</div>
      </AdminCard>

      <AdminCard
        title="Cégadatok a jogi oldalakhoz"
        description="Az impresszum, az ÁSZF és az adatkezelési tájékoztató ezekből az adatokból épül fel."
      >
        <div className="grid gap-5 sm:grid-cols-2">{COMPANY_FIELDS.map(renderField)}</div>
      </AdminCard>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Mentés…' : 'Cégadatok mentése'}
      </Button>
    </form>
  );
}
