'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { WorkBlock } from '@/lib/content/work-blocks';
import type { Work } from '@/lib/store/works';
import { WORK_LIMITS, slugify, type FieldErrors } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { ImagePicker } from './image-picker';
import { BlockEditor } from './block-editor';

/**
 * Referencia szerkesztő.
 *
 * Ugyanaz a szerkezet, mint a bejegyzés- és csapattag-szerkesztőé: ugyanaz a
 * mezőkomponens, ugyanaz a feltöltési végpont, ugyanaz a visszajelzés. Aki az
 * egyiket használta, a másikat is ismeri. Ami más: a törzs nem egyetlen
 * szövegdoboz, hanem sablonblokkokból álló oldal (`BlockEditor`).
 *
 * **Az űrlap vezérelt, nem `defaultValue`-s.** A blokkok állapota úgyis
 * Reactben él, és két különböző állapotkezelés egy űrlapon belül garantáltan
 * elcsúszik — például egy mentés utáni visszajelzés után.
 *
 * A slug automatikusan az ügyfél nevéből és a címből képződik, amíg a szerkesztő
 * hozzá nem nyúl. Ha kézzel átírta, onnantól nem írjuk felül: egy publikált
 * oldal URL-je nem változhat meg attól, hogy valaki javít egy elgépelést a
 * címben.
 */
export function WorkEditor({ work }: { work?: Work }) {
  const router = useRouter();
  const isEdit = Boolean(work);

  const [client, setClient] = useState(work?.client ?? '');
  const [title, setTitle] = useState(work?.title ?? '');
  const [slug, setSlug] = useState(work?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(work?.slug));
  const [excerpt, setExcerpt] = useState(work?.excerpt ?? '');
  const [industry, setIndustry] = useState(work?.industry ?? '');
  const [year, setYear] = useState(work?.year ?? '');
  const [services, setServices] = useState((work?.services ?? []).join(', '));
  const [siteUrl, setSiteUrl] = useState(work?.siteUrl ?? '');
  const [logo, setLogo] = useState(work?.logo ?? '');
  const [cover, setCover] = useState(work?.cover ?? '');
  const [coverAlt, setCoverAlt] = useState(work?.coverAlt ?? '');
  const [order, setOrder] = useState(String(work?.order ?? 0));
  const [published, setPublished] = useState(work?.published ?? false);
  const [blocks, setBlocks] = useState<WorkBlock[]>(work?.blocks ?? []);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');
  const [pending, setPending] = useState(false);

  /** A slug előnézete: amit a szerver képezne, ha most mentenénk. */
  const effectiveSlug = slugTouched ? slugify(slug) : slugify(`${client} ${title}`);

  function report(message: string, tone: 'success' | 'danger') {
    setNotice(message);
    setNoticeTone(tone);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const payload = {
      client,
      title,
      slug: effectiveSlug,
      excerpt,
      industry,
      year,
      // Vesszővel elválasztva kényelmesebb, mint soronként egy mező — és a
      // szolgáltatáscímkék úgyis két-három szavasak.
      services: services
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      siteUrl,
      logo,
      cover,
      coverAlt,
      blocks,
      order: Number(order) || 0,
      published,
    };

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch(isEdit ? `/api/admin/works/${work?.id}` : '/api/admin/works', {
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

      router.replace('/admin/referenciak');
      router.refresh();
    } catch {
      report('Hálózati hiba. Próbáld újra.', 'danger');
      setPending(false);
    }
  }

  async function onDelete() {
    if (!work || pending) return;
    if (!window.confirm(`Biztosan törlöd? „${work.client} — ${work.title}” eltűnik az oldalról.`)) {
      return;
    }

    setPending(true);
    const response = await fetch(`/api/admin/works/${work.id}`, { method: 'DELETE' });

    if (!response.ok) {
      report('A törlés nem sikerült.', 'danger');
      setPending(false);
      return;
    }

    router.replace('/admin/referenciak');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard title="Az ügyfél és a munka">
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label="Ügyfél" htmlFor="client" error={errors.client} required>
              <input
                id="client"
                value={client}
                maxLength={WORK_LIMITS.client}
                onChange={(event) => setClient(event.target.value)}
                className={adminInputClass(errors.client)}
              />
            </AdminField>

            <AdminField
              label="Mit csináltunk"
              htmlFor="title"
              hint="Ez a címsor az oldal tetején. Például: „Új webshop és foglalási rendszer”."
              error={errors.title}
              required
            >
              <input
                id="title"
                value={title}
                maxLength={WORK_LIMITS.title}
                onChange={(event) => setTitle(event.target.value)}
                className={adminInputClass(errors.title)}
              />
            </AdminField>
          </div>

          <AdminField
            label="Összefoglaló"
            htmlFor="excerpt"
            hint="Egy-két mondat. Ez látszik a kártyán és a keresőben."
            error={errors.excerpt}
            required
          >
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              maxLength={WORK_LIMITS.excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className={adminInputClass(errors.excerpt)}
            />
          </AdminField>

          <div className="grid gap-5 sm:grid-cols-3">
            <AdminField
              label="Ágazat"
              htmlFor="industry"
              hint="Például: vendéglátás."
              error={errors.industry}
            >
              <input
                id="industry"
                value={industry}
                maxLength={WORK_LIMITS.industry}
                onChange={(event) => setIndustry(event.target.value)}
                className={adminInputClass(errors.industry)}
              />
            </AdminField>

            <AdminField label="Év" htmlFor="year" error={errors.year}>
              <input
                id="year"
                value={year}
                maxLength={WORK_LIMITS.year}
                onChange={(event) => setYear(event.target.value)}
                className={adminInputClass(errors.year)}
              />
            </AdminField>

            <AdminField
              label="Sorrend"
              htmlFor="order"
              hint="Kisebb szám előrébb."
              error={errors.order}
            >
              <input
                id="order"
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className={adminInputClass()}
              />
            </AdminField>
          </div>

          <AdminField
            label="Mit tartalmazott"
            htmlFor="services"
            hint="Vesszővel elválasztva. Például: weboldal, webshop, keresőoptimalizálás."
            error={errors.services}
          >
            <input
              id="services"
              value={services}
              onChange={(event) => setServices(event.target.value)}
              className={adminInputClass(errors.services)}
            />
          </AdminField>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField
              label="URL-részlet"
              htmlFor="slug"
              hint={`Az oldal címe: /referenciak/${effectiveSlug || '…'}`}
              error={errors.slug}
            >
              <input
                id="slug"
                value={slugTouched ? slug : effectiveSlug}
                maxLength={WORK_LIMITS.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                className={adminInputClass(errors.slug)}
              />
            </AdminField>

            <AdminField
              label="Az élő oldal címe"
              htmlFor="siteUrl"
              hint="Elhagyható. Teljes cím, például https://pelda.hu."
              error={errors.siteUrl}
            >
              <input
                id="siteUrl"
                value={siteUrl}
                maxLength={WORK_LIMITS.siteUrl}
                onChange={(event) => setSiteUrl(event.target.value)}
                className={adminInputClass(errors.siteUrl)}
              />
            </AdminField>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Embléma és borító"
        description="Az embléma a kártyán és az oldal fejlécében jelenik meg, világos korongon — így egy sötét logó is olvasható marad a kék felületen."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ImagePicker
            label="Ügyfél emblémája"
            hint="SVG a legjobb: minden felbontáson éles marad. PNG és WebP is mehet."
            kind="logo"
            value={logo}
            onChange={setLogo}
            aspect="square"
            {...(errors.logo ? { error: errors.logo } : {})}
            disabled={pending}
          />

          <ImagePicker
            label="Borítókép"
            hint="Elhagyható. Kép nélkül hullámborító áll be. Fekvő, 16:10 arányú kép a legjobb."
            value={cover}
            onChange={setCover}
            {...(errors.cover ? { error: errors.cover } : {})}
            disabled={pending}
          />
        </div>

        <div className="mt-5">
          <AdminField
            label="Borító képleírása"
            htmlFor="coverAlt"
            hint="Mit ábrázol a kép? Képernyőolvasó ezt olvassa fel."
            error={errors.coverAlt}
          >
            <input
              id="coverAlt"
              value={coverAlt}
              maxLength={WORK_LIMITS.coverAlt}
              onChange={(event) => setCoverAlt(event.target.value)}
              className={adminInputClass(errors.coverAlt)}
            />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Az oldal tartalma"
        description="Sablonokból rakható össze. Húzd a lapra, amire szükség van, rendezd sorba, és töltsd ki — a tipográfiát és az elrendezést az oldal adja."
      >
        <BlockEditor blocks={blocks} onChange={setBlocks} disabled={pending} />
      </AdminCard>

      <AdminCard title="Publikálás">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block text-body-sm font-medium">Megjelenjen az oldalon</span>
            <span className="mt-1 block text-body-sm text-muted">
              Amíg nincs bepipálva, a referencia sem a listán, sem a főoldalon nem látszik, és a
              saját oldala sem érhető el.
            </span>
          </span>
        </label>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Mentés…' : isEdit ? 'Mentés' : 'Referencia létrehozása'}
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
