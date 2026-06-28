# Helyi fejlesztés és futtatás

## Előfeltétel

Docker (a teljes stackhez), vagy Node 20+ (csak a frontendhez).

## Indítás Dockerrel (ajánlott)

```bash
docker compose up --build
```

- Weboldal: **http://localhost:3000**
- Mailpit (a kapcsolati űrlap teszt e-mailjei): **http://localhost:8025**

Leállítás: `docker compose down`. A `web` a Next.js standalone production
buildet futtatja, a `mailpit` egy fejlesztői SMTP + webes postafiók.

## Fejlesztés Docker nélkül

```bash
npm install
npm run dev          # http://localhost:3000 (hot reload)
```

Az e-mail küldés teszteléséhez vagy állíts be valós SMTP-t a `.env`-ben, vagy
indíts Mailpitet külön: `docker compose up mailpit`, majd a `.env`-ben
`SMTP_HOST=localhost`, `SMTP_PORT=1025`.

## Környezeti változók

```bash
cp .env.example .env
```

| Változó | Mire való |
|---|---|
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | E-mail küldés |
| `MAIL_FROM` / `MAIL_TO` | Feladó / címzett |
| `NEXT_PUBLIC_SITE_URL` | Publikus alap-URL |

A docker-compose a `web` szolgáltatáshoz a Mailpit SMTP-jét állítja be
alapból, így a kapcsolati űrlap azonnal tesztelhető.

## Build és minőség-ellenőrzés

```bash
npm run build                       # production build (TypeScript ellenőrzéssel)
npx lighthouse http://localhost:3000 --view   # teljesítmény / a11y / SEO
```

## A kapcsolati űrlap kézi tesztje

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Teszt","email":"teszt@pelda.hu","message":"Kérek egy ajánlatot."}'
# → {"ok":true}, a levél megjelenik a Mailpitben (http://localhost:8025)
```
