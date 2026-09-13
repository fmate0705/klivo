/**
 * @type {import('next').NextConfig}
 *
 * A biztonsági fejléceket itt állítjuk be és nem middleware-ben, mert így minden
 * válaszra érvényesek — a statikus fájlokra és a képekre is, amelyeket a
 * middleware nem lát.
 */

/**
 * Content-Security-Policy.
 *
 * A `'unsafe-inline'` a `script-src`-ban a Next.js App Router követelménye: a
 * keretrendszer inline scriptként ágyazza be a bootstrapot és a streamelt RSC
 * payloadot. A szigorúbb megoldás a nonce lenne, az viszont minden oldalt
 * dinamikus rendereléshez kötne, vagyis feladnánk a statikus generálást az
 * egész marketing oldalon. Mivel a site nem jelenít meg felhasználó által
 * beküldött HTML-t (a Markdown renderer előbb escapel, csak utána épít
 * markupot), ez a csere nem éri meg. A többi direktíva továbbra is blokkolja
 * azt, ami itt számít: idegen script, iframe-be ágyazás, idegen form action.
 *
 * A `style-src` inline engedélye a React inline `style` propjai miatt kell,
 * amelyekkel a scroll-vezérelt CSS custom propertyket írjuk.
 */
/**
 * A látogatómérés hosztjai.
 *
 * A Google Analytics külső hostról tölt be, tehát a `default-src 'self'` alatt
 * enélkül **blokkolva lenne** — és ez némán történne: a mérés egyszerűen nem
 * indulna el, a konzolban egy CSP hibával, amit senki nem néz.
 *
 * Csak ez a három host van felsorolva, és csak a szükséges direktívákban: a
 * mérőkód a `googletagmanager.com`-ról jön, a mért adat a
 * `google-analytics.com` felé megy, a régebbi kliensek pedig képpontként is
 * küldhetik.
 *
 * A kód akkor sem fut le, ha a látogató nem járult hozzá — a CSP itt csak
 * megengedi, a betöltésről a `components/site/analytics.tsx` dönt.
 */
const analyticsHosts = {
  script: 'https://www.googletagmanager.com',
  connect:
    'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com',
  image: 'https://*.google-analytics.com https://*.googletagmanager.com',
};

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${analyticsHosts.script}` +
    (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${analyticsHosts.image}`,
  "font-src 'self' data:",
  `connect-src 'self' ${analyticsHosts.connect}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // Clickjacking. Modern böngészőben a fenti `frame-ancestors` felülírja;
  // a régiek kedvéért marad.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Megakadályozza, hogy a böngésző más MIME típusként értelmezze a választ —
  // ez az "tölts fel képet, futtasd scriptként" támadás alapja.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Két év, aldomainekkel. Csak HTTPS felett értelmezi a böngésző, sima HTTP-n
  // figyelmen kívül hagyja — ezért küldhető feltétel nélkül.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  reactStrictMode: true,
  // Önálló szerver build — a deploy Dockerfile ezt várja.
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // A használt minőségeket fel kell sorolni; a Next 16 csak ezeket engedi.
    // 82 a tartalmi képeké, 70 a csontváz mögötti kis előnézeteké.
    qualities: [70, 82],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        /**
         * A feltöltött fájlok.
         *
         * Az admin SVG emblémát is feltölthet, az SVG pedig dokumentum, nem
         * kép: közvetlenül megnyitva a böngésző oldalként rendereli. A fenti,
         * oldalra szabott irányelv `script-src 'unsafe-inline'`-t enged (a Next
         * bootstrapja miatt), ami itt pont a rossz válasz lenne.
         *
         * Két `Content-Security-Policy` fejléc esetén a böngésző a
         * **metszetüket** érvényesíti, tehát ez a sor szigorít, nem lazít. A
         * feltöltés emellett fertőtleníti is az SVG-t
         * (`lib/svg-sanitize.ts`) — két független réteg, mert egy tárolt XSS
         * ára aránytalanul nagy.
         */
        source: '/media/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Az admin felületet sem proxy, sem böngésző nem cache-elheti.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
