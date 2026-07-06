# Klivo — dokumentáció

Ez a mappa a rendszer „térképe" egy jövőbeli fejlesztő (ember vagy AI) számára.

| Fájl | Mit ír le |
|---|---|
| [architecture.md](architecture.md) | Stack, tier-választás, hogyan illeszkednek a részek |
| [setup.md](setup.md) | Helyi futtatás, Docker parancsok, környezeti változók |
| [folder-structure.md](folder-structure.md) | Annotált könyvtárfa |
| [design-system.md](design-system.md) | Tokenek, típusskála, komponensek, signature elem |
| [seo-and-discoverability.md](seo-and-discoverability.md) | Mit valósítottunk meg a SEO/AI-baseline-ból |
| [decisions/](decisions/) | Egy-egy rövid jegyzék minden fontos döntésről |

## Gyors indítás

```bash
docker compose up -d --build   # web → http://localhost:3000 (egyetlen konténer)
```

## Aktuális állapot

Tier 2 (Next.js, többoldalas). Főoldal + 3 szolgáltatás-aloldal + kapcsolat + 3
jogi oldal, teljes SEO/AI-discoverability baseline. **E-mail küldés jelenleg
kikapcsolva** (a kapcsolat közvetlen e-mail/telefon linkeken megy; a backend
megőrizve — lásd [decisions/0005-disable-email.md](decisions/0005-disable-email.md)).
A nyitott teendők (valós adatok) a gyökér `README.md` „Teendők éles indulás
előtt" listájában találhatók.
