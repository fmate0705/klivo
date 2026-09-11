'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SiteSettings } from '@/lib/content/settings';
import type { Partner } from '@/lib/store/partners';
import { PARTNER_LIMITS, type FieldErrors } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { ImagePicker } from './image-picker';

/**
 * A partnersáv kezelése — kapcsoló, lista, felvétel.
 *
 * **Egy képernyő, nem három.** Egy partnernek három mezője van (név, embléma,
 * cím); külön listaoldalra, létrehozó oldalra és szerkesztő oldalra bontva a
 * szerkesztő többet navigálna, mint amennyit gépel. A bejegyzéseknél és a
 * referenciáknál más a helyzet: ott egy rekord egy egész oldal.
 *
 * **A kapcsoló nem törli a logókat.** A sáv kikapcsolása csak elrejti — így egy
 * kampány idejére ki lehet venni a lapból anélkül, hogy utána mindent újra fel
 * kéne tölteni.
 */
export function PartnerManager({
  partners,
  settings,
}: {
  partners: Partner[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings.partners.enabled);
  const [savingToggle, setSavingToggle] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');

  function report(message: string, tone: 'success' | 'danger') {
    setNotice(message);
    setNoticeTone(tone);
  }

  async function saveToggle(next: boolean) {
    setEnabled(next);
    setSavingToggle(true);
    setNotice(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        // A teljes beállításobjektum megy ki, a referencia szekció állapotával
        // együtt — részleges küldésnél az visszaállna alapértelmezettre.
        body: JSON.stringify({ ...settings, partners: { enabled: next } }),
      });

      if (!response.ok) {
        setEnabled(!next);
        report('A kapcsoló mentése nem sikerült.', 'danger');
      } else {
        router.refresh();
      }
    } catch {
      setEnabled(!next);
      report('Hálózati hiba. Próbáld újra.', 'danger');
    } finally {
      setSavingToggle(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard
        title="A sáv megjelenése"
        description="A nyitóképernyő alatt, a főoldalon. Kikapcsolva a sáv eltűnik, az emblémák viszont megmaradnak."
      >
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={enabled}
            disabled={savingToggle}
            onChange={(event) => saveToggle(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block text-body-sm font-medium">Látszódjon a partnersáv</span>
            <span className="mt-1 block text-body-sm text-muted">
              {partners.length === 0
                ? 'Egyetlen embléma sincs felvéve, ezért a sáv most akkor sem jelenik meg, ha be van kapcsolva.'
                : `${partners.length} embléma. A sáv folyamatosan csúszik, rámutatásra megáll.`}
            </span>
          </span>
        </label>
      </AdminCard>

      <AdminCard title="Emblémák">
        {partners.length === 0 ? (
          <p className="text-muted">Még nincs partner. Az alábbi űrlappal veheted fel az elsőt.</p>
        ) : (
          <ul className="divide-y divide-line">
            {partners.map((partner) => (
              <PartnerRow key={partner.id} partner={partner} onReport={report} />
            ))}
          </ul>
        )}
      </AdminCard>

      <PartnerForm onReport={report} />
    </div>
  );
}

/**
 * Egy meglévő partner sora.
 *
 * Szerkesztés helyben nyílik, nem külön oldalon: három mezőnél egy
 * oldalváltás több időt vesz el, mint amennyit a javítás.
 */
function PartnerRow({
  partner,
  onReport,
}: {
  partner: Partner;
  onReport: (message: string, tone: 'success' | 'danger') => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(partner.name);
  const [logo, setLogo] = useState(partner.logo);
  const [url, setUrl] = useState(partner.url);
  const [order, setOrder] = useState(String(partner.order));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function save() {
    if (pending) return;
    setPending(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, logo, url, order: Number(order) || 0 }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: FieldErrors;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        onReport(result.error ?? 'A mentés nem sikerült.', 'danger');
        setPending(false);
        return;
      }

      setOpen(false);
      setPending(false);
      onReport('Mentve.', 'success');
      router.refresh();
    } catch {
      onReport('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  async function remove() {
    if (pending) return;
    if (!window.confirm(`Biztosan törlöd? „${partner.name}” eltűnik a sávból.`)) return;

    setPending(true);
    const response = await fetch(`/api/admin/partners/${partner.id}`, { method: 'DELETE' });

    if (!response.ok) {
      onReport('A törlés nem sikerült.', 'danger');
      setPending(false);
      return;
    }

    onReport('Törölve.', 'success');
    router.refresh();
  }

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-paper">
            <Image
              src={partner.logo}
              alt=""
              width={160}
              height={96}
              unoptimized={partner.logo.toLowerCase().endsWith('.svg')}
              className="h-full w-full object-contain p-1.5"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-body-sm font-medium">{partner.name}</span>
            <span className="block truncate text-body-sm text-muted">
              sorrend: {partner.order}
              {partner.url ? ` · ${partner.url}` : ''}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="text-body-sm text-wave-7 hover:underline"
          >
            {open ? 'Mégsem' : 'Szerkesztés'}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-body-sm text-danger hover:underline disabled:opacity-50"
          >
            Törlés
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-4 flex flex-col gap-4 rounded-card border border-line bg-paper p-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <AdminField label="Cégnév" htmlFor={`name-${partner.id}`} error={errors.name} required>
              <input
                id={`name-${partner.id}`}
                value={name}
                maxLength={PARTNER_LIMITS.name}
                onChange={(event) => setName(event.target.value)}
                className={adminInputClass(errors.name)}
              />
            </AdminField>

            <AdminField label="Sorrend" htmlFor={`order-${partner.id}`}>
              <input
                id={`order-${partner.id}`}
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className={adminInputClass()}
              />
            </AdminField>
          </div>

          <AdminField
            label="Az ügyfél oldala"
            htmlFor={`url-${partner.id}`}
            hint="Elhagyható. Megadva a logó hivatkozás lesz."
            error={errors.url}
          >
            <input
              id={`url-${partner.id}`}
              value={url}
              maxLength={PARTNER_LIMITS.url}
              onChange={(event) => setUrl(event.target.value)}
              className={adminInputClass(errors.url)}
            />
          </AdminField>

          <ImagePicker
            label="Embléma"
            kind="logo"
            value={logo}
            onChange={setLogo}
            aspect="square"
            {...(errors.logo ? { error: errors.logo } : {})}
            disabled={pending}
          />

          <div>
            <Button type="button" onClick={save} disabled={pending}>
              {pending ? 'Mentés…' : 'Mentés'}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** Új partner felvétele. */
function PartnerForm({
  onReport,
}: {
  onReport: (message: string, tone: 'success' | 'danger') => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState('0');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, logo, url, order: Number(order) || 0 }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: FieldErrors;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        onReport(result.error ?? 'A mentés nem sikerült.', 'danger');
        setPending(false);
        return;
      }

      // Az űrlap kiürül, hogy a következő embléma azonnal jöhessen.
      setName('');
      setLogo('');
      setUrl('');
      setOrder('0');
      setPending(false);
      onReport('Partner felvéve.', 'success');
      router.refresh();
    } catch {
      onReport('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <AdminCard
        title="Új partner"
        description="SVG a legjobb: minden felbontáson éles marad. A feltöltött SVG-t a szerver megtisztítja, tehát szkriptet nem hozhat magával."
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <AdminField label="Cégnév" htmlFor="partner-name" error={errors.name} required>
              <input
                id="partner-name"
                value={name}
                maxLength={PARTNER_LIMITS.name}
                onChange={(event) => setName(event.target.value)}
                className={adminInputClass(errors.name)}
              />
            </AdminField>

            <AdminField label="Sorrend" htmlFor="partner-order">
              <input
                id="partner-order"
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className={adminInputClass()}
              />
            </AdminField>
          </div>

          <AdminField
            label="Az ügyfél oldala"
            htmlFor="partner-url"
            hint="Elhagyható. Megadva a logó hivatkozás lesz."
            error={errors.url}
          >
            <input
              id="partner-url"
              value={url}
              maxLength={PARTNER_LIMITS.url}
              onChange={(event) => setUrl(event.target.value)}
              className={adminInputClass(errors.url)}
            />
          </AdminField>

          <ImagePicker
            label="Embléma"
            hint="SVG, WebP, PNG, JPEG vagy AVIF. Kötelező — ez lesz a sávban látható kép."
            kind="logo"
            value={logo}
            onChange={setLogo}
            aspect="square"
            {...(errors.logo ? { error: errors.logo } : {})}
            disabled={pending}
          />

          <div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Partner hozzáadása'}
            </Button>
          </div>
        </div>
      </AdminCard>
    </form>
  );
}
