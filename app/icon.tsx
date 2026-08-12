import { ImageResponse } from 'next/og';

/**
 * A favicon futásidőben rajzolódik, ugyanabból a geometriából, mint a lábléc
 * logója. Így nincs külön képfájl, amit egy arculatváltás után el lehet
 * felejteni frissíteni.
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
        background: 'linear-gradient(135deg, #0057d8, #6c5cff)',
        color: '#ffffff',
        fontSize: 300,
        fontWeight: 700,
        letterSpacing: '-0.06em',
      }}
    >
      K
    </div>,
    size,
  );
}
