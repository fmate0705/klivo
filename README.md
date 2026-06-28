# Klivo — webügynökség weboldal

Modern, prémium, magyar nyelvű **többoldalas** weboldal egy webügynökség
számára. **Next.js (App Router) + TypeScript**, valódi e-mail backenddel,
Dockerben futtatva. Light theme, Geist tipográfia, finom mozgás, erős SEO és
AI-láthatóság.

> **Tier 2** (dinamikus marketing oldal e-mail küldéssel). A márkanév-döntésről
> (Kodly helyett **Klivo**) lásd:
> [`docs/decisions/0002-brand-name.md`](docs/decisions/0002-brand-name.md).

---

## Mit tartalmaz

- **Oldalak:** főoldal, 3 szolgáltatás-aloldal
  (`/weboldal-keszites`, `/egyedi-fejlesztes`, `/tarhely`), `/kapcsolat`, és a
  jogi oldalak (`/impresszum`, `/adatkezelesi-tajekoztato`, `/aszf`).
- **E-mail backend:** a kapcsolati űrlap a `/api/contact` végpontra küld, amely
  SMTP-n (nodemailer) keresztül e-mailt küld. Helyi fejlesztésben a **Mailpit**
  fogadja, valódi kiküldés nélkül.
- **SEO / AI SEO:** per-oldal metaadatok, Open Graph, JSON-LD
  (ProfessionalService, WebSite, FAQPage, Service, BreadcrumbList),
  `sitemap.xml`, `robots.txt` (AI-crawlerek engedélyezve), `llms.txt`, manifest.

| Szolgáltatás | Ár |
|---|---|
| Weboldal készítés | 100 000 Ft-tól |
| Egyedi weboldal / webalkalmazás | egyedi árajánlat |
| Tárhely (saját ügyfeleknek) | 20 000 Ft / hó-tól |
| Tárhely (külsős oldalaknak) | 25 000 Ft / hó-tól |
| Módosítások hostolt oldalon | óradíjban |

---

## Futtatás Dockerrel (egy parancs)

```bash
docker compose up --build
```

- Weboldal: **http://localhost:3000**
- Mailpit postafiók (a kapcsolati űrlap teszt e-mailjei): **http://localhost:8025**

A `web` szolgáltatás a Next.js standalone production buildet futtatja, a
`mailpit` pedig egy fejlesztői SMTP + webes postafiók. Leállítás:
`docker compose down`.

### Fejlesztés Docker nélkül

```bash
npm install
npm run dev          # http://localhost:3000
```

Az e-mail küldés teszteléséhez állíts be SMTP-t a `.env`-ben
(`cp .env.example .env`), vagy indítsd a Mailpitet: `docker compose up mailpit`.

---

## Környezeti változók

Lásd [`.env.example`](.env.example). Lényeg:

| Változó | Mire való |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | E-mail küldés (élesben a valós levelezőszolgáltató) |
| `MAIL_FROM`, `MAIL_TO` | Feladó és címzett |
| `NEXT_PUBLIC_SITE_URL` | Publikus alap-URL |

Ha nincs `SMTP_HOST`, az `/api/contact` nem tesz úgy, mintha küldött volna:
hibát ad vissza a felhasználónak a közvetlen e-mail címmel.

---

## Technológia

- **Next.js 16** (App Router, React 19, TypeScript, standalone output)
- **Geist** tipográfia (`next/font`), **Phosphor** ikonok
- Saját CSS design-rendszer (tokenek + komponensstílusok), light theme
- **nodemailer** (SMTP) az e-mailekhez
- Docker (többlépcsős build) + Mailpit a helyi e-mail teszteléshez

Részletek: [`docs/architecture.md`](docs/architecture.md).

---

## ⚠️ Teendők éles indulás előtt (valós adatra cserélendő)

A kódban `PLACEHOLDER`, illetve a jogi oldalakon `[szögletes zárójel]` jelöli:

- [ ] **Domain** (`klivo.hu`) a `src/lib/site.ts`-ben + a `NEXT_PUBLIC_SITE_URL`-ben
- [ ] **Telefon, e-mail, cégadatok** (`src/lib/site.ts` → `contact`, `company`)
- [ ] **Valós SMTP** beállítása élesben (`.env`)
- [ ] **Közösségi média** linkek (`src/lib/seo.ts` → `sameAs`)
- [ ] **OG-kép** (`public/og-image.svg` → 1200×630 PNG)
- [ ] **Jogi szövegek** ügyvédi ellenőrzése (Impresszum, Adatkezelési, ÁSZF)
- [ ] **Klivo név + klivo.hu** védjegy/domain megerősítése

---

Magyarországon, prémium minőségben. © Klivo
