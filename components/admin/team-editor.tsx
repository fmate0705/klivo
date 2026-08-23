'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { TEAM_LIMITS, type FieldErrors } from '@/lib/validation';
import type { TeamMember } from '@/lib/store/team';

/**
 * Csapattag szerkesztő.
 *
 * Ugyanaz a szerkezet, mint a bejegyzés szerkesztőé — ugyanaz a mezőkomponens,
 * ugyanaz a feltöltési végpont, ugyanaz a visszajelzés. Aki az egyiket
 * használta, a másikat is ismeri.
 *
 * A fotó nem kötelező: kép nélkül a névből képzett monogram jelenik meg a
 * nyilvános oldalon, hullámos háttéren. Így egy új kolléga akkor is felvehető,
 * ha a fotója még nem készült el — nem marad lyuk a rácsban.
 */
export function TeamEditor({ member }: { member?: TeamMember }) {
  const router = useRouter();
  const isEdit = Boolean(member);

  const [photo, setPhoto] = useState(member?.photo ?? '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function report(message: string, tone: 'success' | 'danger') {
    setNotice(message);
    setNoticeTone(tone);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      role: String(form.get('role') ?? ''),
      bio: String(form.get('bio') ?? ''),
      photo,
      order: Number(form.get('order') ?? 0),
    };

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch(isEdit ? `/api/admin/team/${member?.id}` : '/api/admin/team', {
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

      router.replace('/admin/csapat');
      router.refresh();
    } catch {
      report('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotice(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const response = await fetch('/api/admin/uploads', { method: 'POST', body });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.url) {
        report(result.error ?? 'A feltöltés nem sikerült.', 'danger');
      } else {
        setPhoto(result.url);
        report('A kép feltöltve. A mentéssel rögzül.', 'success');
      }
    } catch {
      report('Hálózati hiba a feltöltés közben.', 'danger');
    } finally {
      setUploading(false);
      // Enélkül ugyanannak a fájlnak az újbóli kiválasztása nem indítana eseményt.
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onDelete() {
    if (!member || pending) return;
    if (!window.confirm(`Biztosan törlöd? „${member.name}” eltűnik a csapat listájából.`)) return;

    setPending(true);
    const response = await fetch(`/api/admin/team/${member.id}`, { method: 'DELETE' });

    if (!response.ok) {
      report('A törlés nem sikerült.', 'danger');
      setPending(false);
      return;
    }

    router.replace('/admin/csapat');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard title="Adatok">
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label="Név" htmlFor="name" error={errors.name} required>
              <input
                id="name"
                name="name"
                defaultValue={member?.name ?? ''}
                maxLength={TEAM_LIMITS.name}
                className={adminInputClass(errors.name)}
              />
            </AdminField>

            <AdminField
              label="Szerep"
              htmlFor="role"
              hint="Például: fejlesztő, tervező, projektvezető."
              error={errors.role}
              required
            >
              <input
                id="role"
                name="role"
                defaultValue={member?.role ?? ''}
                maxLength={TEAM_LIMITS.role}
                className={adminInputClass(errors.role)}
              />
            </AdminField>
          </div>

          <AdminField
            label="Bemutatkozás"
            htmlFor="bio"
            hint="Egy-két mondat. Nem kötelező."
            error={errors.bio}
          >
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={member?.bio ?? ''}
              maxLength={TEAM_LIMITS.bio}
              className={adminInputClass(errors.bio)}
            />
          </AdminField>

          <AdminField
            label="Sorrend"
            htmlFor="order"
            hint="Kisebb szám előrébb kerül a rácsban. Azonos számnál név szerint rendeződnek."
          >
            <input
              id="order"
              name="order"
              type="number"
              defaultValue={member?.order ?? 0}
              className={adminInputClass()}
            />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Fotó"
        description="Nem kötelező. Kép nélkül a névből képzett monogram jelenik meg, ugyanazon a hullámos háttéren — a rács így sem marad lyukas."
      >
        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4">
            <AdminField
              label="Kép feltöltése"
              htmlFor="file"
              hint="WebP, PNG, JPEG vagy AVIF, legfeljebb 4 MB. Álló, 4:5 arányú kép a legjobb. Átlátszó hátterű PNG-t is fogad: a hátteret az oldal adja alá."
              error={errors.photo}
            >
              <input
                ref={fileRef}
                id="file"
                type="file"
                accept="image/webp,image/jpeg,image/png,image/avif"
                onChange={onUpload}
                disabled={uploading}
                className="w-full text-body-sm file:mr-4 file:rounded-pill file:border-0 file:bg-deep file:px-4 file:py-2 file:text-body-sm file:text-on-dark hover:file:bg-wave-8"
              />
            </AdminField>

            {photo ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPhoto('')}
                disabled={uploading || pending}
              >
                Kép eltávolítása
              </Button>
            ) : null}
          </div>

          <div>
            <p className="text-body-sm text-muted">Előnézet</p>
            <div className="mt-2 h-40 w-32 overflow-hidden rounded-card border border-line bg-wave-3">
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  width={256}
                  height={320}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-body-sm text-muted">
                  Nincs kép
                </span>
              )}
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? 'Mentés…' : isEdit ? 'Mentés' : 'Csapattag hozzáadása'}
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
