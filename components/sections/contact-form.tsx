'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { CONTACT_LIMITS, CONTACT_TOPICS, type FieldErrors } from '@/lib/validation';
import { Button } from '@/components/ui/button';

/**
 * A kapcsolati űrlap.
 *
 * Hét mező, ebből kettő kötelező (név, üzenet) és egy szükséges a válaszhoz
 * (e-mail). Minden további mező opcionális, és ez ki is van írva: egy kötelező
 * telefonszám ott, ahol e-mailben is lehet válaszolni, csak elveszi a
 * megkeresések egy részét.
 *
 * Amit betart:
 *
 * - **Nem tűnik el a beírt szöveg.** Hiba esetén a mezők megmaradnak, csak a
 *   hibaüzenetek kerülnek melléjük.
 * - **A hiba a mezőnél van**, nem csak egy összefoglalóban a lap tetején, és
 *   `aria-describedby`-jal kötve — a képernyőolvasó a mezőn állva hallja meg.
 * - **Nem lehet kétszer elküldeni.** Beküldés közben a gomb letiltva.
 * - **Az eredmény bejelentődik** (`aria-live`), tehát az is megtudja, hogy
 *   sikerült, aki nem látja a képernyőt.
 * - **Csapdamező** (`webcim`) fogja a botokat. Nem `display: none`, mert azt a
 *   fejlettebb botok felismerik: a nézeten kívülre van téve, és a
 *   billentyűzet-bejárásból is ki van véve.
 */

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrors({});
    setMessage('');

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch('/api/kapcsolat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        errors?: FieldErrors;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setStatus('error');
        setMessage(result.error ?? 'Nem sikerült elküldeni. Próbáld újra.');
        return;
      }

      formRef.current?.reset();
      setStatus('sent');
      setMessage('Megkaptuk az üzeneted. Egy munkanapon belül válaszolunk.');
    } catch {
      setStatus('error');
      setMessage('Nem sikerült elküldeni. Ellenőrizd a kapcsolatot, vagy írj e-mailt.');
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="name"
          label="Neved"
          required
          maxLength={CONTACT_LIMITS.name}
          autoComplete="name"
          error={errors.name}
        />
        <Field
          name="email"
          label="E-mail cím"
          type="email"
          required
          maxLength={CONTACT_LIMITS.email}
          autoComplete="email"
          error={errors.email}
        />
        <Field
          name="phone"
          label="Telefonszám"
          type="tel"
          hint="Nem kötelező"
          maxLength={CONTACT_LIMITS.phone}
          autoComplete="tel"
          error={errors.phone}
        />
        <Field
          name="company"
          label="Cégnév"
          hint="Nem kötelező"
          maxLength={CONTACT_LIMITS.company}
          autoComplete="organization"
          error={errors.company}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-sm font-medium">Miben segíthetünk?</span>
        <select
          name="topic"
          defaultValue={CONTACT_TOPICS[0]}
          className="border-soft bg-raised h-12 rounded-card border px-4 transition-colors duration-feedback ease-standard hover:border-line-strong"
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <Field
        name="message"
        label="Mire van szükséged?"
        required
        multiline
        maxLength={CONTACT_LIMITS.message}
        hint="Néhány mondat elég. Mit csinál a vállalkozásod, és mit szeretnél elérni az oldallal?"
        error={errors.message}
      />

      {/* Csapdamező. A nézeten kívül, a bejárásból kivéve, de a botok kitöltik. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="webcim">Weboldal címe</label>
        <input id="webcim" name="webcim" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === 'sending'} arrow>
          {status === 'sending' ? 'Küldés…' : 'Üzenet küldése'}
        </Button>

        <p className="text-soft max-w-xs text-body-sm">
          Az adataidat kizárólag a válaszadásra használjuk.{' '}
          <Link href="/jogi/adatkezelesi-tajekoztato" className="link-underline text-ink">
            Adatkezelési tájékoztató
          </Link>
        </p>
      </div>

      <p
        aria-live="polite"
        className={cn(
          'text-body-sm',
          status === 'sent' && 'text-success',
          status === 'error' && 'text-danger',
        )}
      >
        {message}
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
  multiline = false,
  hint,
  error,
  maxLength,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  hint?: string;
  error?: string;
  maxLength: number;
  autoComplete?: string;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const shared = {
    id: name,
    name,
    maxLength,
    autoComplete,
    'aria-describedby': describedBy,
    'aria-invalid': error ? (true as const) : undefined,
    className: cn(
      'border-soft bg-raised rounded-card border px-4 transition-colors duration-feedback ease-standard hover:border-line-strong',
      multiline ? 'min-h-40 resize-y py-3' : 'h-12',
      error && 'border-danger',
    ),
  };

  return (
    <div className={cn('flex flex-col gap-2', multiline && 'sm:col-span-2')}>
      <label htmlFor={name} className="text-body-sm font-medium">
        {label}
        {required ? <span className="text-ink"> *</span> : null}
      </label>

      {multiline ? <textarea {...shared} /> : <input type={type} {...shared} />}

      {hint ? (
        <p id={hintId} className="text-soft text-body-sm">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
