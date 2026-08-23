import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Klivo admin',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Az admin gyökere.
 *
 * Szándékosan nincs benne se fejléc, se lábléc, se görgetés-animáció: ez egy
 * munkaeszköz, nem egy értékesítési oldal. A `no-store` fejlécet a
 * `next.config.mjs` állítja minden `/admin/*` válaszra.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-paper">{children}</div>;
}
