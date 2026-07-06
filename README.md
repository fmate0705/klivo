# Klivo — webügynökség weboldal

Modern, prémium, magyar nyelvű **többoldalas** weboldal egy webügynökség
számára. **Next.js (App Router) + TypeScript**, Dockerben futtatva. Light theme,
Geist tipográfia, finom mozgás, erős SEO és AI-láthatóság.

> **Megjegyzés — e-mail küldés kikapcsolva.** Az űrlapos, SMTP-s e-mail küldést
> egyelőre kivezettük, hogy a weboldal háttérszolgáltatás nélkül, egyetlen
> konténerben stabilan fusson a VPS-en. A kapcsolatfelvétel most közvetlen
> e-mail/telefon linkeken keresztül történik. A kód megőrizve, később
> visszakapcsolható — lásd
> [`docs/decisions/0005-disable-email.md`](docs/decisions/0005-disable-email.md).

> **Tier 2** (dinamikus marketing oldal). A márkanév-döntésről
> (Kodly helyett **Klivo**) lásd:
> [`docs/decisions/0002-brand-name.md`](docs/decisions/0002-brand-name.md).

---

## Mit tartalmaz

- **Oldalak:** főoldal, 3 szolgáltatás-aloldal
  (`/weboldal-keszites`, `/egyedi-fejlesztes`, `/tarhely`), `/kapcsolat`, és a
  jogi oldalak (`/impresszum`, `/adatkezelesi-tajekoztato`, `/aszf`).
- **Kapcsolat:** a `/kapcsolat` oldal közvetlen e-mail/telefon linkeket kínál
  (nincs háttérszolgáltatás). Az e-mailt küldő űrlap kódja megőrizve, de
  jelenleg kikapcsolva (lásd `docs/decisions/0005-disable-email.md`).
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

Egyetlen `web` szolgáltatás fut (a Next.js standalone production build). A
`network_mode: bridge` miatt a Compose **nem hoz létre külön projekt-hálózatot**,
és nincs Mailpit/SMTP háttérszolgáltatás. Leállítás: `docker compose down`.

### Fejlesztés Docker nélkül

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Környezeti változók

Lásd [`.env.example`](.env.example). Lényeg:

| Változó | Mire való |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Publikus alap-URL |
| ~~`SMTP_*`, `MAIL_*`~~ | E-mail küldéshez — **jelenleg kikapcsolva**, kikommentelve a `.env.example`-ben |

Az e-mail küldés ki van kapcsolva, ezért SMTP változókra most nincs szükség. A
`/kapcsolat` oldal közvetlen e-mail/telefon linkeket használ. Visszakapcsolás:
lásd `docs/decisions/0005-disable-email.md`.

---

## Technológia

- **Next.js 16** (App Router, React 19, TypeScript, standalone output)
- **Geist** tipográfia (`next/font`), **Phosphor** ikonok
- Saját CSS design-rendszer (tokenek + komponensstílusok), light theme
- Docker (többlépcsős, standalone build) — egyetlen `web` konténer
- **nodemailer** (SMTP) az e-mailekhez — a kód megőrizve, jelenleg kikapcsolva

Részletek: [`docs/architecture.md`](docs/architecture.md).

---

## ⚠️ Teendők éles indulás előtt (valós adatra cserélendő)

A kódban `PLACEHOLDER`, illetve a jogi oldalakon `[szögletes zárójel]` jelöli:

- [ ] **Domain** (`klivo.hu`) a `src/lib/site.ts`-ben + a `NEXT_PUBLIC_SITE_URL`-ben
- [ ] **Telefon, e-mail, cégadatok** (`src/lib/site.ts` → `contact`, `company`)
- [ ] **E-mail küldés** újbóli bekapcsolása, ha kell (lásd `docs/decisions/0005-disable-email.md`), majd valós SMTP a `.env`-ben
- [ ] **Közösségi média** linkek (`src/lib/seo.ts` → `sameAs`)
- [ ] **OG-kép** (`public/og-image.svg` → 1200×630 PNG)
- [ ] **Jogi szövegek** ügyvédi ellenőrzése (Impresszum, Adatkezelési, ÁSZF)
- [ ] **Klivo név + klivo.hu** védjegy/domain megerősítése

---

Magyarországon, prémium minőségben. © Klivo
