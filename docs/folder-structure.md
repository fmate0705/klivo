# Könyvtárszerkezet (annotált)

```
velion site test másolat/
├── package.json · tsconfig.json · next.config.ts   # Next.js (standalone)
├── Dockerfile · docker-compose.yml · .dockerignore # egyetlen web szolgáltatás
├── .env.example                                    # NEXT_PUBLIC_SITE_URL (SMTP kikommentelve)
├── public/
│   ├── favicon.svg · og-image.svg                  # (production: 1200×630 PNG)
│   ├── llms.txt                                     # AI-olvasható összefoglaló
│   └── .well-known/security.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx                # gyökér layout: fejléc, lábléc, fontok, JSON-LD
│   │   ├── page.tsx                  # főoldal (szekciók összerakva)
│   │   ├── globals?                  # a CSS-t a layout importálja (tokens + main)
│   │   ├── weboldal-keszites/page.tsx
│   │   ├── egyedi-fejlesztes/page.tsx
│   │   ├── tarhely/page.tsx          # tárhely + óradíjas módosítások
│   │   ├── kapcsolat/page.tsx
│   │   ├── impresszum/page.tsx
│   │   ├── adatkezelesi-tajekoztato/page.tsx
│   │   ├── aszf/page.tsx
│   │   ├── api/contact/route.ts      # e-mail backend (POST) — KIKAPCSOLVA (stub 503)
│   │   ├── sitemap.ts · robots.ts · manifest.ts
│   ├── components/
│   │   ├── layout/Header.tsx (client) · Footer.tsx
│   │   ├── sections/                 # Hero, Trust, ServicesOverview, WhyUs,
│   │   │                             # Process, Faq, CtaBand, ServiceDetail,
│   │   │                             # LegalPage, ContactInfo (aktív),
│   │   │                             # ContactForm (client, megőrizve, nem használt)
│   │   ├── ScrollReveal.tsx (client) · JsonLd.tsx
│   │   └── ui/BrandMark.tsx
│   ├── lib/
│   │   ├── site.ts                   # tartalmi single source (szöveg, ár, nav, cég)
│   │   ├── seo.ts                    # metaadat + JSON-LD builderek
│   │   ├── email.ts                  # nodemailer SMTP (server-only) — KIKAPCSOLVA
│   │   └── validation.ts             # űrlap validáció (a megőrzött űrlaphoz)
│   └── styles/
│       ├── tokens.css                # design tokenek (szín, típus, térköz…)
│       └── main.css                  # komponens- és szekció-stílusok
├── docs/                             # ez a dokumentáció
└── .claude/memory/progress.md        # munkamenet-napló
```

## Aloldal hozzáadása

1. Hozz létre egy mappát `src/app/<slug>/page.tsx` néven.
2. Exportálj `metadata`-t a `pageMetadata({ title, description, path })` helperrel.
3. A `src/app/sitemap.ts` automatikusan tartalmazza a szolgáltatás-oldalakat;
   új típusú oldalt vegyél fel a `staticPaths` listába.
4. A közös fejléc/lábléc a `layout.tsx`-ből öröklődik.
