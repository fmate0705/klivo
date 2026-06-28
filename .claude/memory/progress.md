# Project Memory — Klivo

## Stack & Tier
- Tier: 2 (dinamikus marketing oldal, valódi e-mail küldéssel)
- Framework: Next.js 16 (App Router), React 19, TypeScript, standalone output
- Tipográfia: Geist (next/font); Ikonok: Phosphor (@phosphor-icons/react/dist/ssr)
- Styling: saját CSS design-rendszer (src/styles/tokens.css + main.css), light theme
- E-mail: nodemailer (SMTP); helyi teszt: Mailpit (docker-compose)
- Futás: Docker (web + mailpit), `docker compose up --build` → :3000, mailpit :8025
- Nyelv: magyar

## Oldalak (multi-page)
- `/` főoldal, `/weboldal-keszites`, `/egyedi-fejlesztes`, `/tarhely`,
  `/kapcsolat`, `/impresszum`, `/adatkezelesi-tajekoztato`, `/aszf`
- API: `/api/contact` (POST, nodemailer)

## Completed
- [2026-06-24] Tier 1 (statikus) → Tier 2 (Next.js) átállás; design megtartva
- [2026-06-24] E-mail backend: /api/contact + lib/email.ts (nodemailer) +
  validation.ts (honeypot, szerveroldali ellenőrzés). Mailpittel tesztelve:
  POST → {ok:true}, levél megérkezett (Docker).
- [2026-06-24] Multi-page: 3 szolgáltatás-aloldal, kapcsolat, 3 jogi oldal
  (Impresszum, Adatkezelési tájékoztató, ÁSZF — sablonok, ügyvédi review kell)
- [2026-06-24] Új szolgáltatás info: hostolt oldalakon óradíjas módosítások
  (site.ts + /tarhely + ÁSZF + GYIK)
- [2026-06-24] Design/copy pass a `taste` skill alapján: em-dash kivezetése,
  eyebrow-ok ritkítása (max 1/3 szekció), hero rövidítése (2 sor), trust strip
  hero alá, bento ritmussal (nem 6 egyforma kártya), Geist + Phosphor,
  egységes CTA ("Kérj ajánlatot"), CTA-label/intent konszolidáció
- [2026-06-24] `web-design-guidelines` review: first-error focus, inputMode/
  spellCheck, touch-action, overscroll-behavior javítva
- [2026-06-24] SEO: per-oldal metaadat, JSON-LD (ProfessionalService, WebSite,
  FAQPage, Service, BreadcrumbList), sitemap.ts, robots.ts, manifest.ts
- [2026-06-24] Docker többlépcsős build (standalone), `next build` zöld,
  vizuális ellenőrzés desktop+mobil (hero, services, bento, service page,
  kapcsolat, mobil menü)
- [2026-06-26] UX/a11y pass (ui-ux-pro-max skill): a "Szolgáltatások" dropdown
  hover-rés bugja javítva. Most kattintásra/billentyűzetre is nyílik (button +
  aria-expanded/aria-haspopup), láthatatlan híd a hover-réshez, visibility:hidden
  zárt állapotban (a zárt menü linkjei nem fókuszálhatók), Escape + külső kattintás
  zárás, aktív oldal kiemelése (is-active + aria-current). Tesztelve.
- [2026-06-26] Biztonsági fejlécek a next.config.ts-ben (X-Content-Type-Options,
  X-Frame-Options, Referrer-Policy, Permissions-Policy), poweredByHeader off.
  (.htaccess nem releváns: Next.js/Node, nem Apache.)
- [2026-06-26] Vitest + unit tesztek a validációhoz (7 teszt zöld), `npm test`.
- [2026-06-26] Üres "fantom" mappák törölve a gyökérből (régi Docker bind-mount
  hagyatéka).
- [2026-06-26] `.badge` szöveg középre igazítva (inline-flex center; a
  subhero__actions align-items:center, hogy a badge ne nyúljon a gomb magasságára).
- [2026-06-26] 404 oldal: `src/app/not-found.tsx` ("Vissza a főoldalra" gombbal +
  hasznos linkekkel), noindex. Ellenőrizve: ismeretlen URL → 404 + a saját oldal.
- [2026-06-26] Szolgáltatás-aloldalak gazdagítva: bővebb intro + detail blokkok,
  "Ideális:" célközönség-címkék, és külön "Árazás" szekció (ársáv-kártyák + "Mi
  befolyásolja az árat" + záró megjegyzés). Új mezők a site.ts-ben: ServiceTier,
  ServicePricing, Service.idealFor, Service.pricing. Nincs kitalált, kamu-pontos
  ár (csak a megadott horgonyok: 100k, 20k, 25k); az óradíj összege a megrendelő
  által megadandó (PLACEHOLDER comment a tarhely.pricing.closing-nál). "Mit
  tartalmaz" → "Minden projektben benne van". Build + tesztek zöldek, Dockerben
  ellenőrizve.

- [2026-06-26] Animáció/teljesítmény/SEO polírozás (framer-motion + emil +
  nextjs-seo skillek). Motion (LazyMotion) finom hero belépő spring-gel,
  reduced-motion + noscript fallback (SEO-barát). Emil-finomítások: gomb :active
  scale 0.97, reveal 540ms/16px, rövidebb stagger. PERF: az LCP-elem (H1) NEM
  animált → LCP 770ms→181ms, CLS 0.00; optimizePackageImports. SEO: generált PNG
  OG-kép (next/og, Geist betűvel, magyar ékezetek OK), keywords (honlapkészítés
  is), googleBot direktívák, /api/ disallow, PostalAddress (HU) a JSON-LD-ben.
  Kulcsszókutatás: "honlapkészítés"/"honlap" beépítve.

## Known Decisions (lásd docs/decisions/)
- 0001: statikus stack (Tier 1) — felülírva a 0003-mal
- 0002: márkanév Kodly → Klivo
- 0003: Tier 2 Next.js + e-mail backend, design megtartásával
- 0004: nav dropdown click+billentyűzet hozzáférhetőség, biztonsági fejlécek, unit tesztek

## Open Questions / Teendők (valós adat kell)
- Domain (klivo.hu) + védjegy megerősítés
- Telefon, e-mail, cégadatok (site.ts company/contact)
- Valós SMTP élesben (.env)
- Közösségi média linkek (seo.ts sameAs)
- og-image.svg → 1200×630 PNG
- Jogi szövegek ügyvédi ellenőrzése
