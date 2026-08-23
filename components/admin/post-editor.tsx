'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { POST_LIMITS, slugify, type FieldErrors } from '@/lib/validation';
import type { Post } from '@/lib/store/posts';
import { PostCover } from '@/components/blog/post-cover';

/**
 * Bejegyzés szerkesztő.
 *
 * Egyszerű szövegmező, nem WYSIWYG. A törzs Markdown, a támogatott nyelvtan
 * szűk és dokumentált (`lib/markdown.ts`) — így nem kerülhet tetszőleges HTML az
 * oldalra, és a szerkesztő nem hoz magával fél megabájtnyi függőséget. A
 * súgósor a mező alatt kiírja a teljes nyelvtant, tehát nem kell megjegyezni.
 *
 * A slug a címből képződik, amíg a felhasználó hozzá nem nyúl. Egy kézzel
 * átírt slugot soha nem írunk felül: egy publikált cikk URL-jének megváltozása
 * elveszít minden rá mutató linket.
 *
 * A borítókép nem kötelező. Kép nélkül a bejegyzés a hullámborítót kapja
 * (`PostCover`), ami az oldal saját formanyelve — nem egy általános fotóbank-kép,
 * aminek semmi köze a cikkhez. Az előnézet itt is ezt mutatja, tehát a
 * szerkesztő pontosan azt látja, ami kikerül.
 */
export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [image, setImage] = useState(post?.image ?? '');
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
      title: String(form.get('title') ?? ''),
      slug: String(form.get('slug') ?? ''),
      excerpt: String(form.get('excerpt') ?? ''),
      body: String(form.get('body') ?? ''),
      category: String(form.get('category') ?? ''),
      image,
      imageAlt: String(form.get('imageAlt') ?? ''),
      author: String(form.get('author') ?? ''),
      published: form.get('published') === 'on',
    };

    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch(isEdit ? `/api/admin/posts/${post?.id}` : '/api/admin/posts', {
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

      if (isEdit) {
        report('Elmentve.', 'success');
        setPending(false);
        router.refresh();
      } else {
        router.replace('/admin/bejegyzesek');
        router.refresh();
      }
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
        setImage(result.url);
        report('A kép feltöltve. A bejegyzés mentésével rögzül.', 'success');
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
    if (!post || pending) return;
    if (!window.confirm(`Biztosan törlöd? „${post.title}” véglegesen eltűnik.`)) return;

    setPending(true);
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });

    if (!response.ok) {
      report('A törlés nem sikerült.', 'danger');
      setPending(false);
      return;
    }

    router.replace('/admin/bejegyzesek');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

      <AdminCard title="Tartalom">
        <div className="flex flex-col gap-5">
          <AdminField label="Cím" htmlFor="title" error={errors.title} required>
            <input
              id="title"
              name="title"
              value={title}
              maxLength={POST_LIMITS.title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              className={adminInputClass(errors.title)}
            />
          </AdminField>

          <AdminField
            label="URL-részlet"
            htmlFor="slug"
            hint="Ez jelenik meg a címsorban: /blog/… Publikálás után ne változtasd meg, mert a rá mutató linkek elromlanak."
            error={errors.slug}
            required
          >
            <input
              id="slug"
              name="slug"
              value={slug}
              maxLength={POST_LIMITS.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              onBlur={(event) => setSlug(slugify(event.target.value))}
              className={adminInputClass(errors.slug)}
            />
          </AdminField>

          <AdminField
            label="Bevezető"
            htmlFor="excerpt"
            hint="Egy-két mondat. Ez látszik a listában, a cikk elején és a keresőben — 120 és 160 karakter között a legjobb."
            error={errors.excerpt}
            required
          >
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt ?? ''}
              maxLength={POST_LIMITS.excerpt}
              className={adminInputClass(errors.excerpt)}
            />
          </AdminField>

          <AdminField
            label="Törzs"
            htmlFor="body"
            hint="Markdown: ## alcím, ### al-alcím, **félkövér**, *dőlt*, - felsorolás, 1. számozás, > idézet, [link](/utvonal), `kód`, --- elválasztó."
            error={errors.body}
            required
          >
            <textarea
              id="body"
              name="body"
              rows={22}
              defaultValue={post?.body ?? ''}
              maxLength={POST_LIMITS.body}
              className={`${adminInputClass(errors.body)} font-mono leading-relaxed`}
            />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Borítókép"
        description="Nem kötelező. Kép nélkül a bejegyzés az oldal hullámborítóját kapja — az előnézet pontosan azt mutatja, ami kikerül."
      >
        <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <AdminField
              label="Kép feltöltése"
              htmlFor="file"
              hint="WebP, JPEG, PNG vagy AVIF, legfeljebb 4 MB. Fekvő, 16:9 arányú kép a legjobb."
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

            {image ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setImage('')}
                disabled={uploading || pending}
              >
                Kép eltávolítása
              </Button>
            ) : null}

            <AdminField
              label="Képleírás"
              htmlFor="imageAlt"
              hint="Mit ábrázol a kép? Ezt olvassa fel a képernyőolvasó, és ezt látja a kereső."
              error={errors.imageAlt}
            >
              <input
                id="imageAlt"
                name="imageAlt"
                defaultValue={post?.imageAlt ?? ''}
                maxLength={POST_LIMITS.imageAlt}
                className={adminInputClass(errors.imageAlt)}
              />
            </AdminField>
          </div>

          <div>
            <p className="text-body-sm text-muted">Előnézet</p>
            <div className="mt-2 overflow-hidden rounded-card border border-line">
              <PostCover
                slug={slug || 'elonezet'}
                {...(image ? { image, imageAlt: '' } : {})}
                sizes="360px"
                className="aspect-[16/9] w-full"
              />
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Besorolás és megjelenés">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Rovat"
            htmlFor="category"
            hint="A blog listán ez alapján lehet szűrni."
            error={errors.category}
          >
            <input
              id="category"
              name="category"
              defaultValue={post?.category ?? 'Általános'}
              maxLength={POST_LIMITS.category}
              className={adminInputClass(errors.category)}
            />
          </AdminField>

          <AdminField label="Szerző" htmlFor="author" error={errors.author}>
            <input
              id="author"
              name="author"
              defaultValue={post?.author ?? 'Klivo'}
              maxLength={POST_LIMITS.author}
              className={adminInputClass(errors.author)}
            />
          </AdminField>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-card border border-line bg-paper p-4">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published ?? false}
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--ink))]"
          />
          <span>
            <span className="block text-body-sm font-medium">Publikálva</span>
            <span className="mt-0.5 block text-body-sm text-muted">
              Amíg nincs bepipálva, a bejegyzés csak itt látszik, az oldalon nem — és a sitemapbe
              sem kerül bele.
            </span>
          </span>
        </label>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? 'Mentés…' : isEdit ? 'Mentés' : 'Bejegyzés létrehozása'}
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
