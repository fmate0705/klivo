import { ImageResponse } from 'next/og';

/**
 * A favicon.
 *
 * Futásidőben rajzolódik, ugyanabból a geometriából, mint a fejléc jele: három
 * hullámvonal. Nincs külön képfájl, amit egy arculatváltás után el lehetne
 * felejteni frissíteni — a jel egy helyen él.
 *
 * Nincs benne színátmenet, ahogy az oldalon sehol: a paletta legmélyebb kékje
 * az alap, rajta fehér vonalak. Fekete alapon a jel idegen lenne az oldaltól,
 * és a böngészőfülön sem kék foltként jelenne meg.
 */
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0D4F8F',
      }}
    >
      <svg
        width="340"
        height="340"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M2 7c2.5 0 2.5-3.5 5-3.5S9.5 7 12 7s2.5-3.5 5-3.5S19.5 7 22 7" />
        <path d="M2 13.5c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
        <path d="M2 20c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
      </svg>
    </div>,
    size,
  );
}
