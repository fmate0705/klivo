'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { CONTACT_LIMITS, CONTACT_TOPICS, type FieldErrors } from '@/lib/validation';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * A kapcsolati űrlap.
 *
 * Három tulajdonság, ami miatt így néz ki:
 *
 * - **A böngésző saját validációja ki van kapcsolva** (`noValidate`), és helyette
 *   a szerver válasza rajzolja ki a hibákat. Így pontosan ugyanazt a szabályt
 *   látja a látogató, amit a szerver alkalmaz — nem fordulhat elő, hogy a
 *   böngésző átengedi, a szerver meg visszadobja, magyarázat nélkül.
 * - **A hibák mezőnként jelennek meg**, `aria-describedby` kapcsolattal, tehát
 *   képernyőolvasóval is kiderül, melyik mező hibás és miért.
 * - **A rejtett mező (`webcim`) csapda.** Ember nem tölti ki, egyszerű bot igen;
 *   ha van benne érték, a szerver sikert jelez, de nem ment el semmit.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus('sending');
    setErrors({});

    try {
      const response = await fetch('/api/kapcsolat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        errors?: FieldErrors;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.error ?? 'Az üzenetet nem sikerült elküldeni. Próbáld újra.');
        setStatus('error');
        return;
      }

      form.reset();
      setStatus('sent');
    } catch {
      setMessage('Hálózati hiba. Ellenőrizd a kapcsolatot, és próbáld újra.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-success/25 bg-success/5 p-10 text-center"
      >
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="rgb(var(--success-rgb))"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-5 text-xl">Megkaptuk az üzeneted</h3>
        <p className="mt-3 text-muted">
          Egy munkanapon belül válaszolunk. Ha sürgős, hívj nyugodtan telefonon.
        </p>
        <Button type="button" variant="outline" className="mt-7" onClick={() => setStatus('idle')}>
          Új üzenet írása
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Neved" name="name" error={errors.name} required>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            className={inputClass(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </Field>

        <Field label="E-mail cím" name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            className={inputClass(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>

        <Field label="Telefonszám" name="phone" error={errors.phone} hint="Nem kötelező">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={CONTACT_LIMITS.phone}
            className={inputClass(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
        </Field>

        <Field label="Cég" name="company" error={errors.company} hint="Nem kötelező">
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={CONTACT_LIMITS.company}
            className={inputClass(errors.company)}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
        </Field>
      </div>

      <Field label="Miben segíthetünk?" name="topic" error={errors.topic}>
        <select
          id="topic"
          name="topic"
          className={inputClass(errors.topic)}
          defaultValue={CONTACT_TOPICS[0]}
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Üzenet" name="message" error={errors.message} required>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={CONTACT_LIMITS.message}
          placeholder="Írd le pár mondatban, mire van szükséged. Ha van már oldalad vagy elképzelésed, azt is."
          className={cn(inputClass(errors.message), 'min-h-[10rem] resize-y py-3')}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
      </Field>

      {/* Csapdamező botoknak. Ember számára rejtett, de nem `display: none` —
          néhány bot kifejezetten a rejtett mezőket keresi. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="webcim">Ezt a mezőt hagyd üresen</label>
        <input id="webcim" name="webcim" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && message ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Küldés…' : 'Üzenet küldése'}
        </Button>
        <p className="text-sm text-subtle">
          Az adataidat kizárólag a megkeresés megválaszolására használjuk.
        </p>
      </div>
    </form>
  );
}

function inputClass(error?: string): string {
  return cn(
    'h-12 w-full rounded-xl border bg-surface-raised px-4 text-[0.9375rem] text-foreground',
    'transition-[border-color,box-shadow] duration-fast',
    'focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-focus/15',
    error ? 'border-danger' : 'border-border-strong hover:border-foreground/25',
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required = false,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
        {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
