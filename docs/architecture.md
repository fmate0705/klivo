# Architektúra

## Tier és stack

- **Tier 2** — dinamikus, többoldalas marketing oldal.
- **Next.js 16** (App Router), React 19, TypeScript, `output: "standalone"`.
- **Tipográfia:** Geist (`next/font`). **Ikonok:** Phosphor
  (`@phosphor-icons/react/dist/ssr`, szerver-komponens-barát).
- **Styling:** saját CSS design-rendszer (`src/styles/tokens.css` + `main.css`),
  light theme. (Nem Tailwind: a redesign-preserve a meglévő, tetszést elnyert
  design-rendszert tartja meg.)
- **E-mail:** nodemailer (SMTP) — a kód megőrizve, de **jelenleg kikapcsolva**
  (lásd `decisions/0005-disable-email.md`). A kapcsolat közvetlen e-mail/telefon
  linkeken megy.
- **Futás:** Docker, egyetlen `web` szolgáltatás (`network_mode: bridge`, nincs
  külön projekt-hálózat), `docker compose up -d --build`.

## Miért ez a stack

A backend (e-mail) + többoldalas szerkezet + per-oldal SEO együtt a
keretrendszerrel a legkarbantarthatóbb, és ez a CLAUDE.md Tier 2 mintája. Lásd
[decisions/0003-tier2-nextjs-email.md](decisions/0003-tier2-nextjs-email.md).

## Részek és összefüggésük

```
src/app/
  layout.tsx          → html lang=hu, Geist fontok, fejléc/lábléc, szervezet JSON-LD,
                        skip-link, .js osztály (progresszív reveal), ScrollReveal
  page.tsx            → főoldal (Hero, Trust, Services, WhyUs, Process, Faq, CtaBand)
  <slug>/page.tsx     → szolgáltatás-aloldalak (ServiceDetail), kapcsolat, jogi oldalak
  api/contact/route.ts→ POST végpont — e-mail KIKAPCSOLVA (stub 503); az eredeti
                        nodemailer-es kód a fájlban kikommentelve megőrizve
  sitemap.ts / robots.ts / manifest.ts → generált SEO fájlok

src/lib/
  site.ts             → tartalmi single source (szövegek, árak, nav, cégadatok)
  seo.ts              → metaadat + JSON-LD builderek
  email.ts            → nodemailer SMTP (server-only) — KIKAPCSOLVA (kikommentelve)
  validation.ts       → kapcsolati űrlap validáció (a megőrzött űrlaphoz)

src/components/
  layout/Header.tsx   → 'use client': mobil menü, dropdown, scroll-állapot
  layout/Footer.tsx   → szerver komponens
  sections/*          → Hero, Trust, ServicesOverview, WhyUs, Process, Faq,
                        CtaBand, ServiceDetail, LegalPage, ContactInfo (aktív),
                        ContactForm('use client', megőrizve, jelenleg nem használt)
  ScrollReveal.tsx    → 'use client': IntersectionObserver reveal
  JsonLd.tsx, ui/BrandMark.tsx
```

## Adatfolyam: kapcsolat (jelenlegi)

```
ContactInfo (szerver komponens) → közvetlen mailto: / tel: linkek
  (nincs háttérszolgáltatás, nincs /api hívás)
```

Az e-mailes űrlap-adatfolyam (`ContactForm → /api/contact → email.ts → SMTP`)
megőrizve, de kikapcsolva — a visszakapcsolás lépéseit lásd
`decisions/0005-disable-email.md`.

## Akadálymentesség és teljesítmény

- Szemantikus landmarkok, egy `<h1>` / oldal, logikus címsorhierarchia,
  skip-link, látható `:focus-visible`, `aria-*`, `aria-live` az űrlapstátuszon.
- A scroll-reveal úgy működik, hogy a tartalom JS nélkül is látható (a `.js`
  osztály kapcsolja be a rejtett kezdőállapotot) → SEO- és no-JS-barát.
- `prefers-reduced-motion` minden mozgást kikapcsol.
- Standalone Docker build, statikusan prerenderelt oldalak (a `/api/contact`
  kivételével).
