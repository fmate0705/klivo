import { ImageResponse } from 'next/og';
import { site } from '@/lib/content/site';

/**
 * A megosztási kép.
 *
 * Kódból rajzoljuk, hogy sose kerüljön ki elavult kép a közösségi felületekre:
 * ha a szlogen változik, a kép vele változik.
 *
 * A háttér ugyanaz a rétegzett hullámkompozíció, mint a nyitóképernyőé, csak
 * álló formákká egyszerűsítve — színátmenet nélkül, tömör tintaárnyalatokból.
 * Rendszerbetűvel dolgozik, tehát nincs betűtípus-letöltés a generáláskor.
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
        backgroundColor: '#14161C',
        padding: 72,
        position: 'relative',
      }}
    >
      {/* Hullámrétegek: tömör tintaárnyalatok, egymásra csúsztatva. */}
      <div
        style={{
          position: 'absolute',
          top: -260,
          left: -180,
          width: 820,
          height: 700,
          borderRadius: '50%',
          backgroundColor: '#1C1F27',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -320,
          right: -120,
          width: 900,
          height: 760,
          borderRadius: '50%',
          backgroundColor: '#242833',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 90,
          width: 220,
          height: 220,
          borderRadius: '50%',
          backgroundColor: '#2E333F',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E8825F"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M2 7c2.5 0 2.5-3.5 5-3.5S9.5 7 12 7s2.5-3.5 5-3.5S19.5 7 22 7" />
          <path d="M2 13.5c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
          <path d="M2 20c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
        </svg>
        <div style={{ color: '#F0F1F4', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>
          {site.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            color: '#F0F1F4',
            fontSize: 74,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Weboldal, ami jó benyomást tesz és elad.
        </div>
        <div style={{ color: '#A8ADB8', fontSize: 30, maxWidth: 860 }}>
          Weboldal készítés, egyedi fejlesztés és üzemeltetés — fix áron.
        </div>
      </div>
    </div>,
    size,
  );
}
