# Architektúra

## Tier és stack

- **Tier 2** — dinamikus marketing oldal valódi e-mail küldéssel.
- **Next.js 16** (App Router), React 19, TypeScript, `output: "standalone"`.
- **Tipográfia:** Geist (`next/font`). **Ikonok:** Phosphor
  (`@phosphor-icons/react/dist/ssr`, szerver-komponens-barát).
- **Styling:** saját CSS design-rendszer (`src/styles/tokens.css` + `main.css`),
  light theme. (Nem Tailwind: a redesign-preserve a meglévő, tetszést elnyert
  design-rendszert tartja meg.)
- **E-mail:** nodemailer (SMTP). Helyi teszt: Mailpit.
- **Futás:** Docker (web + mailpit), `docker compose up --build`.

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
  api/contact/route.ts→ POST végpont: validál → e-mailt küld
  sitemap.ts / robots.ts / manifest.ts → generált SEO fájlok

src/lib/
  site.ts             → tartalmi single source (szövegek, árak, nav, cégadatok)
  seo.ts              → metaadat + JSON-LD builderek
  email.ts            → nodemailer SMTP (server-only)
  validation.ts       → kapcsolati űrlap validáció (kliens + szerver közös)

src/components/
  layout/Header.tsx   → 'use client': mobil menü, dropdown, scroll-állapot
  layout/Footer.tsx   → szerver komponens
  sections/*          → Hero, Trust, ServicesOverview, WhyUs, Process, Faq,
                        CtaBand, ServiceDetail, LegalPage, ContactForm('use client')
  ScrollReveal.tsx    → 'use client': IntersectionObserver reveal
  JsonLd.tsx, ui/BrandMark.tsx
```

## Adatfolyam: kapcsolati űrlap

```
ContactForm (client) → validateContact() → POST /api/contact
  → route.ts: honeypot + validateContact() → email.ts sendContactEmail()
  → SMTP (élesben valós; helyben Mailpit :1025, UI :8025)
```

Ha nincs `SMTP_HOST`, az API nem tesz úgy, mintha küldött volna: hibát ad vissza
a felhasználónak a közvetlen e-mail címmel (nem vész el üzenet).

## Akadálymentesség és teljesítmény

- Szemantikus landmarkok, egy `<h1>` / oldal, logikus címsorhierarchia,
  skip-link, látható `:focus-visible`, `aria-*`, `aria-live` az űrlapstátuszon.
- A scroll-reveal úgy működik, hogy a tartalom JS nélkül is látható (a `.js`
  osztály kapcsolja be a rejtett kezdőállapotot) → SEO- és no-JS-barát.
- `prefers-reduced-motion` minden mozgást kikapcsol.
- Standalone Docker build, statikusan prerenderelt oldalak (a `/api/contact`
  kivételével).
