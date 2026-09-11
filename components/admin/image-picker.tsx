'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Képfeltöltő mező — egy fájl, egy előnézet, egy „eltávolítás”.
 *
 * A referencia szerkesztőben egy oldalon tíz-tizenöt kép is lehet (borító,
 * embléma, blokkonként egy-kettő). Ugyanez a logika tizenötször bemásolva
 * garantáltan szétcsúszna: az egyik helyen hiányozna a hibaüzenet, a másikon a
 * fájlmező visszaállítása. Ezért egyetlen komponens.
 *
 * **A fájlmező visszaállítása a kiválasztás után nem kozmetika.** Enélkül
 * ugyanannak a fájlnak az újbóli kiválasztása nem indítana `change` eseményt,
 * és a szerkesztő azt látná, hogy a feltöltés „nem csinál semmit”.
 *
 * Az SVG csak a `kind="logo"` mezőknél jön szóba, és ott is fertőtlenítve
 * tárolódik (`lib/svg-sanitize.ts`). Egy borítóképnek sosem kell SVG.
 */
export function ImagePicker({
  label,
  hint,
  value,
  onChange,
  kind = 'image',
  error,
  aspect = 'landscape',
  disabled = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** `logo` esetén SVG is feltölthető. */
  kind?: 'image' | 'logo';
  error?: string;
  aspect?: 'landscape' | 'square';
  disabled?: boolean;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const accept =
    kind === 'logo'
      ? 'image/svg+xml,image/webp,image/png,image/jpeg,image/avif'
      : 'image/webp,image/jpeg,image/png,image/avif';

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProblem(null);

    const body = new FormData();
    body.append('file', file);
    body.append('kind', kind);

    try {
      const response = await fetch('/api/admin/uploads', { method: 'POST', body });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.url) {
        setProblem(result.error ?? 'A feltöltés nem sikerült.');
      } else {
        onChange(result.url);
      }
    } catch {
      setProblem('Hálózati hiba a feltöltés közben.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-body-sm font-medium">
        {label}
      </label>
      {hint ? <p className="mt-1 text-body-sm text-muted">{hint}</p> : null}

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-wave-2',
            aspect === 'square' ? 'h-20 w-20' : 'h-20 w-32',
          )}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              width={256}
              height={160}
              // Az SVG-t a Next optimalizálója csak külön kapcsolóval dolgozná
              // fel; egy emblémán úgysincs mit optimalizálni.
              unoptimized={value.toLowerCase().endsWith('.svg')}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-body-sm text-muted">Nincs</span>
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            id={id}
            type="file"
            accept={accept}
            onChange={upload}
            disabled={disabled || uploading}
            className="w-full text-body-sm file:mr-4 file:rounded-pill file:border-0 file:bg-deep file:px-4 file:py-2 file:text-body-sm file:text-on-dark hover:file:bg-wave-8"
          />

          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || uploading}
              className="self-start text-body-sm text-danger transition-opacity duration-feedback hover:opacity-80 disabled:opacity-50"
            >
              Kép eltávolítása
            </button>
          ) : null}

          {uploading ? <p className="text-body-sm text-muted">Feltöltés…</p> : null}
          {(problem ?? error) ? (
            <p className="text-body-sm text-danger">{problem ?? error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
