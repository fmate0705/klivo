# Klivo

A Klivo webügynökség oldala. Next.js 15 (App Router), TypeScript strict mód,
Tailwind, JSON adattár, JWT-s admin a bloghoz.

- **Design rendszer és a hullámmotor:** [`docs/DESIGN.md`](docs/DESIGN.md)
- **Mit találtam problémásnak a korábbi oldalon, és mit döntöttem el másképp:**
  [`HIBAJELENTES.md`](HIBAJELENTES.md)

---

## Indítás

```bash
npm install
cp .env.example .env      # majd töltsd ki — lásd lentebb
npm run dev               # http://localhost:3000
```

Az admin belépéshez kell egy aláíró kulcs és egy jelszó hash:

```bash
npm run gen:secret                     # ADMIN_JWT_SECRET
npm run gen:password -- "a jelszavad"  # ADMIN_PASSWORD_HASH
```

Mindkettő kimenetét másold a `.env`-be, aztán indítsd újra a szervert. Belépés:
`/admin`.

---

## Hol él mi

Ez a legfontosabb kérdés a napi használatnál. Minden adatnak **egy** helye van.

| Mit szeretnél módosítani                  | Hol                      | Mikor lép életbe  |
| ----------------------------------------- | ------------------------ | ----------------- |
| Blogbejegyzés (írás, kép, publikálás)     | Admin → Bejegyzések      | Azonnal           |
| Beérkezett megkeresések                   | Admin → Üzenetek         | Azonnal           |
| Cégadatok, adószám, székhely, elérhetőség | `.env`                   | Újraindítás után  |
| Jogi határidők (felmondás, adatőrzés)     | `.env`                   | Újraindítás után  |
| Árak                                      | `lib/content/pricing.ts` | Új telepítés után |
| Szolgáltatás-szövegek, GYIK, navigáció    | `lib/content/site.ts`    | Új telepítés után |
| Jogi dokumentumok szövege                 | `lib/legal.ts`           | Új telepítés után |
| Színek, betűk, térköz                     | `app/globals.css`        | Új telepítés után |
| Hullámok ritmusa a főoldalon              | `app/(site)/page.tsx`    | Új telepítés után |

**Miért nem szerkeszthető minden az adminból.** A cégadatok korábban két helyről
is módosíthatók voltak (`.env` és admin), és az admin felülírta a `.env`-et.
Ebből előbb-utóbb az lett volna, hogy az impresszum és az ÁSZF más adószámot
mutat, a `.env` átírása pedig látszólag nem csinál semmit. Most egy hely van.
Az árak és a szolgáltatás-szövegek ugyanezen okból a kódban élnek: tartalmi
döntések, a többi szöveg mellett a helyük.

### A `.env`

A `.env.example` minden mezőt elmagyaráz. A lényeg:

- **1. blokk** — `NEXT_PUBLIC_SITE_URL`. Ebből készül minden canonical URL, a
  sitemap és az OG tag. Ha rossz, a produkcióba `localhost` URL-ek kerülnek.
- **2. blokk** — elérhetőség (e-mail, telefon, ügyfélfogadás).
- **3. blokk** — cégadatok az impresszumhoz és az ÁSZF-hez.
- **4. blokk** — jogi határidők. Jogi döntések, ezért nincs hozzájuk
  alapértelmezés.
- **5. blokk** — admin belépés.
- **6. blokk** — adattár és futásidő.

Ami nincs kitöltve, az `[szögletes zárójeles]` helyőrzőként **látszik az
oldalon**, és a jogi oldalak tetején figyelmeztetés jelenik meg. Ez szándékos:
hiányos cégadatokkal ne lehessen véletlenül élesíteni.

> A jogi szövegek minta-szövegek. Közzététel előtt jogi szakemberrel kell
> ellenőriztetni őket. A dokumentumok maguk is kiírják ezt.

---

## Szerkezet

```
app/
  (site)/            A nyilvános oldal — fejléc, lábléc, hullámok
  admin/             Az admin felület (JWT mögött)
  api/               Kapcsolati űrlap, admin munkamenet, bejegyzések, feltöltés
  media/[name]/      A feltöltött borítóképek kiszolgálása
  globals.css        Design tokenek + a hullámmotor
components/
  wave/              WaveLayer, WaveBand, WaveSwirl, WaveRule, Bubbles — a hullám formanyelv
  motion/            MotionDriver, MotionBoot, Reveal — az egész oldal mozgása
  sections/          A szekciók: hero, szolgáltatások, folyamat, GYIK, CTA…
  ui/                Gomb, kártya, konténer, szekció, címsor, kép
  blog/  site/  admin/  seo/
lib/
  content/           site.ts (szövegek, navigáció, SEO), pricing.ts (árak)
  organization.ts    Cég- és jogi adatok — kizárólag a .env-ből
  legal.ts           A jogi dokumentumok szövege
  auth/              JWT, jelszó (PBKDF2), sebességkorlát, munkamenet
  store/             JSON adattár: bejegyzések, csapat, megkeresések, feltöltések
  seo/               Metaadat és strukturált adat (JSON-LD)
  markdown.ts        Szűk nyelvtanú Markdown renderer (escape, majd markup)
data/                posts.json, team.json, leads.json, uploads/ — csatolt kötetre való
```

---

## Parancsok

| Parancs                                         | Mit csinál                                          |
| ----------------------------------------------- | --------------------------------------------------- |
| `npm run dev`                                   | Fejlesztői szerver                                  |
| `npm run build` / `start`                       | Produkciós build és futtatás                        |
| `npm run verify`                                | Típusellenőrzés + lint + formázás + tesztek + build |
| `npm test`                                      | Vitest                                              |
| `npm run seed`                                  | Kezdő blogbejegyzések vetése (idempotens)           |
| `npm run gen:secret`                            | `ADMIN_JWT_SECRET` generálása                       |
| `npm run gen:password -- "jelszó"`              | `ADMIN_PASSWORD_HASH` generálása                    |
| `node scripts/shots.mjs / /blog --w=390 --full` | Képernyőképek töréspontonként                       |
| `node scripts/contrast.mjs / /blog`             | Szövegkontraszt mérése valódi képpontokon           |
| `node scripts/overflow.mjs`                     | Vízszintes túlcsordulás keresése három töréspontban |

A `verify` a kapu: commit előtt ennek végig kell futnia.

---

## Admin

Három dolgot csinál, és szándékosan nem többet.

**Bejegyzések.** Írás Markdownban (szűk, dokumentált nyelvtan — lásd
`lib/markdown.ts`), borítókép feltöltése, publikálás, törlés. A slug a címből
képződik, amíg hozzá nem nyúlsz; egy kézzel átírt slugot soha nem írunk felül,
mert egy publikált cikk URL-jének megváltozása elveszít minden rá mutató linket.

Borítókép nem kötelező. Kép nélkül a bejegyzés a hullámborítót kapja — az oldal
saját formanyelvét —, és a szerkesztőben ott az előnézete.

**Csapat.** A „Rólunk” oldal csapat rovata: név, szerep, egy-két mondat,
sorrend és fotó. A fotó nem kötelező — kép nélkül mély kék korongon monogram
jelenik meg. A feltöltött portrék átlátszó hátterűek lehetnek: a hátteret az
oldal adja alájuk, hullámokból. Ha egyetlen tag sincs, a szekció meg sem jelenik.

**Üzenetek.** A kapcsolati űrlapon érkezett megkeresések, állapotjelöléssel.
Azért tároljuk és nem e-mailben küldjük, mert SMTP hozzáférés nélkül egy
elküldetlen e-mail néma adatvesztés volna.

### Biztonság

- Munkamenet: HS256 JWT, 8 óra, `httpOnly` + `SameSite=strict` süti, HTTPS-en
  `__Host-` előtaggal.
- Jelszó: PBKDF2-HMAC-SHA256, 210 000 iteráció; a jelszó soha nem kerül tárolásra.
- Sebességkorlát: 5 belépési kísérlet / 15 perc / IP, 10 űrlapbeküldés / óra / IP.
- Két réteg: az edge middleware kiszűri az azonosítatlan kérést, és minden admin
  oldal, illetve végpont külön is ellenőrzi a munkamenetet.
- Biztonsági fejlécek (CSP, HSTS, `frame-ancestors`, `nosniff`) a
  `next.config.mjs`-ben, minden válaszra.
- Feltöltés: csak WebP/JPEG/PNG/AVIF, legfeljebb 4 MB, szervergenerált fájlnév.
  SVG **nincs** engedélyezve: futtathat szkriptet, tehát azonos originről
  kiszolgálva tárolt XSS lenne.

---

## SEO és AI-láthatóság

- Oldalankénti cím és leírás egy helyen (`lib/content/site.ts`, `pageMeta`);
  minden cím 33–56, minden leírás 120–152 karakter.
- Canonical URL, Open Graph és Twitter kártya minden oldalon, egy építőfüggvényből.
- Strukturált adat: `ProfessionalService`, `WebSite`, `Service`, `FAQPage`,
  `BlogPosting`, `BreadcrumbList`. A `FAQPage` **egyetlen** URL-en él (a
  főoldalon) — ugyanaz több oldalon konkuráló jelzés lenne.
- `sitemap.xml`, `robots.txt`, `llms.txt` generálva; a nem publikált bejegyzések
  egyikbe sem kerülnek bele.
- Az OG kép és a favicon kódból rajzolódik, tehát nem tud elavulni.
- Oldalanként egy `h1`, szintugrás nélkül. Minden tartalmi képnek van alt
  szövege, amely azt írja le, mit mutat a képernyő.

---

## Telepítés

Egy konténer, 3000-es port, `output: 'standalone'`.

### Élesben (tárhelyplatform)

```bash
docker compose up -d --build
```

A `docker-compose.yml` a platformra készült: a Traefik `client_klivo_net`
hálózatára csatlakozik, és szándékosan **nem publikál portot**, mert a forgalom
a proxyn keresztül jön. A hálózatot a platform hozza létre a deploy előtt, ezért
van `external: true`-ként megadva.

Ha a platform mégsem hozta létre, egyszer kézzel kell:

```bash
docker network create client_klivo_net
```

### Helyben, próbára

Fejlesztői gépen sem a `client_klivo_net` hálózat nincs meg, sem a proxy —
ezért a fenti parancs
`network client_klivo_net declared as external, but could not be found`
hibával áll meg. Helyi futtatáshoz a `docker-compose.local.yml` felülírás kell:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Ez három dolgot állít át: saját hálózatot hoz létre a külső helyett, kipublikálja
a 3000-es portot, és a `NEXT_PUBLIC_SITE_URL`-t `http://localhost:3000`-re
állítja (különben a helyi példány a klivo.hu-ra hivatkozna vissza minden
canonical URL-ben és a sitemapban). Utána: <http://localhost:3000>.

A felülírás fájlját **ne másold a szerverre**. Ha ott véletlenül betöltődne, a
konténer a saját hálózatára állna, és a Traefik nem találná meg (502).

Amire figyelni kell:

- A `NEXT_PUBLIC_SITE_URL` **build időben** ég bele a kliens kódba. A
  `docker-compose.yml` build argumentumként adja át; élesítés előtt ezt kell
  helyesre állítani.
- A `/app/data` kötet tartalmazza a bejegyzéseket, a megkereséseket **és a
  feltöltött borítóképeket**. Enélkül minden deploynál üres blogra és üres
  postaládára áll vissza az oldal.
- A `.env` futásidőben töltődik be (`env_file`), tehát cégadat-módosítás után
  elég újraindítani a konténert — nem kell újraépíteni.
