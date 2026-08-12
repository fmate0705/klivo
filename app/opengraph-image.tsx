import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

/**
 * A megosztási kép.
 *
 * Kódból rajzoljuk, hogy sose kerüljön ki elavult kép a közösségi felületekre:
 * ha a szlogen változik, a kép vele változik. Rendszerbetűvel dolgozik, tehát
 * nincs betűtípus-letöltés a generáláskor.
 */
export const runtime = 'nodejs';
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0b0b0d',
        padding: 80,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -180,
          left: -120,
          width: 700,
          height: 700,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(0,87,216,0.55), rgba(0,87,216,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -220,
          right: -140,
          width: 640,
          height: 640,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(108,92,255,0.45), rgba(108,92,255,0) 70%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: '#0057d8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          K
        </div>
        <div style={{ color: '#ffffff', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>
          {site.name}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          {site.tagline}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 30, maxWidth: 860 }}>
          Weboldal készítés, egyedi fejlesztés és tárhely — fix áron.
        </div>
      </div>
    </div>,
    size,
  );
}
