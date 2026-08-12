'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminField, adminInputClass, AdminNotice } from './ui';
import { POST_LIMITS, slugify, type FieldErrors } from '@/lib/validation';
import type { Post } from '@/lib/store/posts';

const IMAGE_OPTIONS = [
  { value: '', label: 'Nincs borítókép' },
  { value: '/images/blog-seo.webp', label: 'Keresés / SEO' },
  { value: '/images/blog-speed.webp', label: 'Sebesség' },
  { value: '/images/blog-build.webp', label: 'Építés / árak' },
  { value: '/images/blog-ai.webp', label: 'AI / admin' },
  { value: '/images/hosting-layers.webp', label: 'Tárhely, rétegek (absztrakt)' },
  { value: '/images/app-modules.webp', label: 'Modulok, alkalmazás (absztrakt)' },
  { value: '/images/work-business-site.webp', label: 'Bemutatkozó oldal (mockup)' },
  { value: '/images/work-dashboard.webp', label: 'Vezérlőpult (mockup)' },
] as const;

/**
 * Bejegyzés szerkesztő.
 *
 * Egyszerű textarea, nem WYSIWYG. A törzs Markdown, a támogatott nyelvtan szűk
 * és dokumentált (`lib/markdown.ts`) — így nem kerülhet be tetszőleges HTML az
 * oldalra, és a szerkesztő nem hoz magával fél megabájtnyi függőséget.
 *
 * A slug a címből képződik, amíg a felhasználó hozzá nem nyúl. Egy kézzel
 * átírt slugot soha nem írunk felül: egy publikált cikk URL-jének megváltozása
 * elveszít minden rá mutató linket.
 */
export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      image: String(form.get('image') ?? ''),
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
        post?: Post;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setNotice(result.error ?? 'A mentés nem sikerült. Nézd át a jelölt mezőket.');
        setPending(false);
        return;
      }

      if (isEdit) {
        setNotice('Elmentve.');
        setPending(false);
        router.refresh();
      } else {
        router.replace('/admin/bejegyzesek');
        router.refresh();
      }
    } catch {
      setNotice('Hálózati hiba. Próbáld újra.');
      setPending(false);
    }
  }

  async function onDelete() {
    if (!post || pending) return;
    if (!window.confirm(`Biztosan törlöd? „${post.title}” véglegesen eltűnik.`)) return;

    setPending(true);
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });

    if (!response.ok) {
      setNotice('A törlés nem sikerült.');
      setPending(false);
      return;
    }

    router.replace('/admin/bejegyzesek');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {notice ? (
        <AdminNotice tone={Object.keys(errors).length > 0 ? 'danger' : 'success'}>
          {notice}
        </AdminNotice>
      ) : null}

      <AdminCard title="Tartalom">
        <div className="space-y-5">
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
            hint="Ez jelenik meg a címsorban: /blog/…"
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
            hint="Egy-két mondat. Ez látszik a listában és a keresőben."
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
            hint="Markdown: ## alcím, **félkövér**, - felsorolás, [link](/utvonal)."
            error={errors.body}
            required
          >
            <textarea
              id="body"
              name="body"
              rows={22}
              defaultValue={post?.body ?? ''}
              maxLength={POST_LIMITS.body}
              className={`${adminInputClass(errors.body)} font-mono text-sm leading-relaxed`}
            />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Megjelenés és besorolás">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Kategória" htmlFor="category" error={errors.category}>
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

          <AdminField label="Borítókép" htmlFor="image" error={errors.image}>
            <select
              id="image"
              name="image"
              defaultValue={post?.image ?? ''}
              className={adminInputClass(errors.image)}
            >
              {IMAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label="Képleírás"
            htmlFor="imageAlt"
            hint="Mit ábrázol a kép? Üresen hagyva dísznek számít."
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

        <label className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published ?? false}
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary-rgb))]"
          />
          <span>
            <span className="block text-[0.9375rem] font-medium text-foreground">Publikálva</span>
            <span className="mt-0.5 block text-sm text-muted">
              Amíg nincs bepipálva, a bejegyzés csak itt látszik, az oldalon nem.
            </span>
          </span>
        </label>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
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
