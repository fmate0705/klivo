# Helyi fejlesztés és futtatás

## Előfeltétel

Docker (a teljes stackhez), vagy Node 20+ (csak a frontendhez).

## Indítás Dockerrel (ajánlott)

```bash
docker compose up --build
```

- Weboldal: **http://localhost:3000**

Leállítás: `docker compose down`. Egyetlen `web` szolgáltatás fut (Next.js
standalone production build). Az e-mail küldés ki van kapcsolva, ezért nincs
Mailpit/SMTP szolgáltatás, és a `network_mode: bridge` miatt a Compose nem hoz
létre külön projekt-hálózatot (lásd `docs/decisions/0005-disable-email.md`).

## Fejlesztés Docker nélkül

```bash
npm install
npm run dev          # http://localhost:3000 (hot reload)
```

## Környezeti változók

```bash
cp .env.example .env
```

| Változó | Mire való |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Publikus alap-URL |
| ~~`SMTP_*` / `MAIL_*`~~ | E-mail küldéshez — **jelenleg kikapcsolva**, kikommentelve a `.env.example`-ben |

Az e-mail küldés ki van kapcsolva, ezért SMTP változókra most nincs szükség; a
`/kapcsolat` oldal közvetlen e-mail/telefon linkeket használ.

## Build és minőség-ellenőrzés

```bash
npm run build                       # production build (TypeScript ellenőrzéssel)
npx lighthouse http://localhost:3000 --view   # teljesítmény / a11y / SEO
```

## Kapcsolat

A `/kapcsolat` oldal jelenleg közvetlen e-mail/telefon linkeket kínál, nincs
űrlapos küldés. A `/api/contact` endpoint megőrizve, de kikapcsolva: `POST`
esetén `503`-at ad vissza a közvetlen e-mail címmel. Az űrlapos e-mail küldés
visszakapcsolásához lásd `docs/decisions/0005-disable-email.md`.
