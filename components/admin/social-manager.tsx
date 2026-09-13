'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  MAX_SOCIAL_LINKS,
  SOCIAL_LIMITS,
  SOCIAL_PLATFORMS,
  platformOf,
} from '@/lib/content/social';
import type { SocialLink } from '@/lib/store/social';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';

/**
 * A közösségi profilok kezelése.
 *
 * **Egy képernyő, nem három.** Egy hivatkozásnak két mezője van (felület, cím);
 * külön listaoldalra, létrehozóra és szerkesztőre bontva a szerkesztő többet
 * navigálna, mint amennyit gépel. Ugyanaz az elv, mint a partnereknél.
 *
 * **A felület zárt listából jön.** A jel a platformhoz tartozik, tehát nincs
 * mit feltölteni: a szerkesztő kiválasztja, hova mutat a link, a rajz jön
 * magától. Egy szabad „ikon URL" mezőből előbb-utóbb törött kép lenne a
 * láblécben.
 *
 * **Felületenként egy hivatkozás.** Két Facebook-oldal a láblécben nem választás,
 * hanem hiba — a tároló ezért a már használt felületet lecseréli, és a
 * felületválasztó itt ki is írja, melyik foglalt.
 */
export function SocialManager({ links }: { links: SocialLink[] }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');

  function report(message: string, tone: 'success' | 'danger') {
    setNotice(message);
    setNoticeTone(tone);
  }

  const used = links.map((link) => link.platform);
  const free = SOCIAL_PLATFORMS.filter((platform) => !used.includes(platform.value));

  return (
    <div className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard
        title="Profilok"
        description="Ezek jelennek meg a lábléc ikonsorában és a kapcsolat oldalon. A keresőnek is ezeket küldjük el — ebből tudja, hogy az oldal és a profilok ugyanahhoz a céghez tartoznak."
      >
        {links.length === 0 ? (
          <p className="text-muted">
            Még nincs felvéve profil. Amíg üres, sem a láblécben, sem a kapcsolat oldalon nem
            jelenik meg ikonsor.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {links.map((link) => (
              <SocialRow key={link.id} link={link} used={used} onReport={report} />
            ))}
          </ul>
        )}
      </AdminCard>

      {free.length > 0 && links.length < MAX_SOCIAL_LINKS ? (
        <SocialForm free={free} onReport={report} />
      ) : (
        <AdminCard title="Új profil">
          <p className="text-muted">
            {links.length >= MAX_SOCIAL_LINKS
              ? `Elérted a ${MAX_SOCIAL_LINKS} profilos határt.`
              : 'Minden támogatott felület fel van véve.'}
          </p>
        </AdminCard>
      )}
    </div>
  );
}

/** Egy felismerhető jel a felülethez — ugyanaz a rajz, ami a láblécben fut. */
function Glyph({ platform, className }: { platform: string; className?: string }) {
  const found = platformOf(platform);
  if (!found) return null;

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={found.path} />
    </svg>
  );
}

function SocialRow({
  link,
  used,
  onReport,
}: {
  link: SocialLink;
  used: string[];
  onReport: (message: string, tone: 'success' | 'danger') => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<string>(link.platform);
  const [url, setUrl] = useState(link.url);
  const [order, setOrder] = useState(String(link.order));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function save() {
    if (pending) return;
    setPending(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/social/${link.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ platform, url, order: Number(order) || 0 }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: Record<string, string>;
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
    if (!window.confirm(`Biztosan törlöd? A ${platformOf(link.platform)?.label} ikon eltűnik.`)) {
      return;
    }

    setPending(true);
    const response = await fetch(`/api/admin/social/${link.id}`, { method: 'DELETE' });
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-line bg-paper text-ink">
            <Glyph platform={link.platform} className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-body-sm font-medium">
              {platformOf(link.platform)?.label ?? link.platform}
            </span>
            <span className="block truncate text-body-sm text-muted">
              {link.url} · sorrend: {link.order}
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
          <PlatformPicker
            value={platform}
            onChange={setPlatform}
            used={used.filter((item) => item !== link.platform)}
            disabled={pending}
            {...(errors.platform ? { error: errors.platform } : {})}
          />

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <AdminField
              label="A profil címe"
              htmlFor={`url-${link.id}`}
              error={errors.url}
              required
            >
              <input
                id={`url-${link.id}`}
                value={url}
                maxLength={SOCIAL_LIMITS.url}
                onChange={(event) => setUrl(event.target.value)}
                className={adminInputClass(errors.url)}
              />
            </AdminField>

            <AdminField label="Sorrend" htmlFor={`order-${link.id}`}>
              <input
                id={`order-${link.id}`}
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className={adminInputClass()}
              />
            </AdminField>
          </div>

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

/** Új profil felvétele. */
function SocialForm({
  free,
  onReport,
}: {
  free: typeof SOCIAL_PLATFORMS;
  onReport: (message: string, tone: 'success' | 'danger') => void;
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState<string>(free[0]?.value ?? '');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ platform, url, order: Number(order) || 0 }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: Record<string, string>;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        onReport(result.error ?? 'A mentés nem sikerült.', 'danger');
        setPending(false);
        return;
      }

      setUrl('');
      setOrder('0');
      setPending(false);
      onReport('Profil felvéve.', 'success');
      router.refresh();
    } catch {
      onReport('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  const example = platformOf(platform)?.example;

  return (
    <form onSubmit={submit} noValidate>
      <AdminCard title="Új profil">
        <div className="flex flex-col gap-5">
          <PlatformPicker
            value={platform}
            onChange={setPlatform}
            used={[]}
            options={free}
            disabled={pending}
            {...(errors.platform ? { error: errors.platform } : {})}
          />

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <AdminField
              label="A profil címe"
              htmlFor="social-url"
              {...(example ? { hint: `Például: ${example}` } : {})}
              error={errors.url}
              required
            >
              <input
                id="social-url"
                value={url}
                maxLength={SOCIAL_LIMITS.url}
                onChange={(event) => setUrl(event.target.value)}
                className={adminInputClass(errors.url)}
              />
            </AdminField>

            <AdminField label="Sorrend" htmlFor="social-order">
              <input
                id="social-order"
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className={adminInputClass()}
              />
            </AdminField>
          </div>

          <div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Profil hozzáadása'}
            </Button>
          </div>
        </div>
      </AdminCard>
    </form>
  );
}

/**
 * A felület kiválasztása — gombsor, nem legördülő.
 *
 * Hét elemnél a gombsor gyorsabb, és ami fontosabb: a **jel is látszik rajta**,
 * tehát a szerkesztő azt választja ki, amit a látogató látni fog.
 */
function PlatformPicker({
  value,
  onChange,
  used,
  options = SOCIAL_PLATFORMS,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Már felvett felületek — ezek jelölve vannak. */
  used: string[];
  options?: typeof SOCIAL_PLATFORMS;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <p className="text-body-sm font-medium">
        Felület <span className="text-danger">*</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((platform) => {
          const taken = used.includes(platform.value);
          const picked = value === platform.value;

          return (
            <button
              key={platform.value}
              type="button"
              disabled={disabled || taken}
              title={taken ? `${platform.label} — már fel van véve` : platform.label}
              onClick={() => onChange(platform.value)}
              className={cn(
                'flex items-center gap-2 rounded-card border px-3 py-2 text-body-sm',
                'transition-colors duration-feedback ease-standard',
                picked
                  ? 'border-wave-6 bg-sky font-medium'
                  : 'border-line hover:border-line-strong',
                (disabled || taken) && 'opacity-40',
              )}
            >
              <Glyph platform={platform.value} className="h-4 w-4 shrink-0" />
              {platform.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-body-sm text-danger">{error}</p> : null}
    </div>
  );
}
