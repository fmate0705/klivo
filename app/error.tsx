'use client';

import { useEffect } from 'react';

/**
 * A globális hibahatár.
 *
 * Kliens komponensnek kell lennie (a React így követeli), és szándékosan nem
 * használ semmit a design rendszerből: ha a hiba oka épp egy komponens vagy egy
 * stíluslap, akkor az a réteg nem megbízható. Ez az oldal beágyazott stílussal
 * dolgozik, tehát akkor is olvasható marad, ha minden más eltörött.
 *
 * A hiba részleteit nem írjuk ki a látogatónak — abból csak a támadó tanul —,
 * de a konzolba bekerül, hogy a naplóban meglegyen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error-boundary]', error);
  }, [error]);

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';

  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,
        padding: '2rem 1.25rem',
        maxWidth: 640,
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
        color: '#08294D',
      }}
    >
      <h1 style={{ fontSize: '1.875rem', lineHeight: 1.2, margin: 0 }}>Valami félrement</h1>

      <p style={{ margin: 0, color: '#3F5F7D', lineHeight: 1.6 }}>
        Az oldal betöltése közben hiba történt. Próbáld újra — ha továbbra sem működik, írj nekünk,
        és megnézzük.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            height: 44,
            padding: '0 20px',
            borderRadius: 9999,
            border: 'none',
            background: '#0D4F8F',
            color: '#ffffff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Újrapróbálom
        </button>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
            Szándékos teljes oldalújratöltés: ha a hiba a routerben van, egy
            kliensoldali navigáció ugyanabba a hibába futna vissza. */}
        <a
          href="/"
          style={{
            height: 44,
            padding: '0 20px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 9999,
            border: '1px solid #D0E7F8',
            color: '#08294D',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Vissza a főoldalra
        </a>
      </div>

      {email ? (
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#3F5F7D' }}>
          <a href={`mailto:${email}`} style={{ color: '#0D4F8F' }}>
            {email}
          </a>
        </p>
      ) : null}
    </main>
  );
}
