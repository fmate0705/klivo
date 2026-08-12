'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminField, adminInputClass, AdminNotice } from './ui';

/**
 * Belépés az adminba.
 *
 * A `tovabb` paraméter csak útvonal lehet (a middleware is így írja ki), ezért
 * itt is ellenőrizzük: abszolút URL-t elfogadva nyílt átirányítást építenénk a
 * belépő oldalra.
 *
 * Siker után `router.refresh()` fut a navigáció mellett. Enélkül a szerver
 * komponensek a belépés előtti — jogosultság nélküli — állapotukból jönnének a
 * kliens cache-ből.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: String(form.get('username') ?? ''),
          password: String(form.get('password') ?? ''),
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result.error ?? 'A belépés nem sikerült.');
        setPending(false);
        return;
      }

      router.replace(target);
      router.refresh();
    } catch {
      setError('Hálózati hiba. Próbáld újra.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

      <AdminField label="Felhasználónév" htmlFor="username" required>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className={adminInputClass()}
        />
      </AdminField>

      <AdminField label="Jelszó" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={adminInputClass()}
        />
      </AdminField>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Belépés…' : 'Belépés'}
      </Button>
    </form>
  );
}
