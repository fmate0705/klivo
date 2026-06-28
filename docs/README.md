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
docker compose up --build   # web → http://localhost:3000, mailpit → http://localhost:8025
```

## Aktuális állapot

Tier 2 (Next.js, többoldalas, e-mail backenddel). Főoldal + 3 szolgáltatás-
aloldal + kapcsolat + 3 jogi oldal, működő kapcsolati űrlap (Mailpittel
tesztelve), teljes SEO/AI-discoverability baseline. A nyitott teendők (valós
adatok) a gyökér `README.md` „Teendők éles indulás előtt" listájában találhatók.
