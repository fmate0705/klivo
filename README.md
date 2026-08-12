# Klivo

A Klivo webügynökség nyilvános oldala és admin felülete. Next.js 15 (App Router),
TypeScript, Tailwind, JSON fájlalapú tárolás, egyetlen Docker konténer a 3000-es
porton.

---

## Mit tud

- **Nyilvános oldal** magyarul: főoldal, szolgáltatások (3 aloldallal), folyamat,
  rólunk, blog, kapcsolat, jogi oldalak.
- **Blog** rács elrendezéssel, Markdown törzzsel, admin felületről szerkesztve.
- **Admin**: bejegyzések kezelése, árak átírása, beérkezett megkeresések.
  JWT munkamenet, PBKDF2 jelszó, sebességkorlát, middleware-es kapu.
- **SEO**: oldalankénti metaadat, canonical, JSON-LD (`ProfessionalService`,
  `Service`, `FAQPage`, `BlogPosting`, `BreadcrumbList`), sitemap, robots,
  dinamikus `llms.txt`, kódból rajzolt OG kép.
- **Mozgás**: görgetésre épülő felfedés, scroll-vezérelt folyamatvonal, kurzort
  követő hero. Minden animáció megáll `prefers-reduced-motion` esetén.

### Vizuális alapelvek

Három szabály, amit érdemes betartani a további fejlesztésnél:

1. **Az oldal végig világos.** Nincs sötét szekció, és nincs sötét-világos váltás
   görgetés közben. Két tónus van: fehér (`Section tone="default"`) és nyugvó
   szürke (`tone="surface"`).
2. **A dekoratív kép háttér, nem tartalom.** Keret és árnyék nélkül, a szekció
   széléig kifutva, maszkkal elhalványítva (`components/ui/section-art.tsx`).
   Bekeretezett dekoráció azt állítja magáról, hogy információt hordoz.
3. **A bemutató képek nagyok és keret nélküliek.** A `mask-soft` utility oldja fel
   a szélüket a háttérben, így a mockup beleúszik az oldalba
   (`components/sections/showcase.tsx`).

---

## Gyors indítás (fejlesztés)

```bash
npm install
cp .env.example .env
npm run gen:secret        # ADMIN_JWT_SECRET
npm run gen:password -- "a jelszavad"   # ADMIN_PASSWORD_HASH
npm run seed              # kezdő blogbejegyzések a data/ könyvtárba
npm run dev               # http://localhost:3000
```

Az admin a `/admin` címen érhető el.

---

## Ellenőrzés

```bash
npm run verify
```

Sorrendben: `typecheck` → `lint` → `format:check` → `test` → `build`.
Commit előtt ennek hibátlanul le kell futnia.

---

## Docker

A konténer a **3000**-es porton figyel — ezt várja a tárhelyszolgáltatás.

```bash
docker compose up -d --build
```

A `docker-compose.yml` két named volume-ot csatol:

- `klivo_data` → `/app/data` — bejegyzések, megkeresések, árak.
- `klivo_uploads` → `/app/public/uploads` — feltöltött képek.

**Enélkül minden bejegyzés és megkeresés elvész a következő deploynál.**

A build a vetést (`scripts/seed-content.mjs`) a `next build` előtt futtatja, így
az image tartalmazza a kezdő tartalmat. A Docker az üres named volume-ot az image
tartalmából tölti fel az első csatoláskor — ettől működik a blog azonnal egy friss
deploy után, és ezért marad érintetlen minden későbbi deploynál.

A publikus URL build időben ég bele a kliens bundle-be:

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://klivo.hu -t klivo-web .
```

---

## Mit lehet kód nélkül átírni?

| Adat                                                                                                | Hol                 | Mikor látszik |
| --------------------------------------------------------------------------------------------------- | ------------------- | ------------- |
| Árak                                                                                                | Admin → Árak        | azonnal       |
| E-mail, telefon, ügyfélfogadás, válaszidő                                                           | Admin → Cégadatok   | azonnal       |
| Cégnév, székhely, adószám, cégjegyzékszám, képviselő, bankszámla, tárhelyszolgáltató, hatálybalépés | Admin → Cégadatok   | azonnal       |
| Blogbejegyzések                                                                                     | Admin → Bejegyzések | azonnal       |

Ugyanezek az adatok a `.env`-ből is megadhatók — az ott megadott érték a
**kezdőérték**, amíg az adminban nem nyúlnak hozzá. `.env` átírása után indítsd
újra a konténert: a jogi oldalak azonnal, a többi oldal legfeljebb öt percen
belül követi. Ez a különbség szándékos: a jogi oldalak kérésenként generálódnak
(ott az elavult adat nem opció), a marketing oldalak pedig gyorsítótárazottak.

Az admin mentése emellett gyorsítótár-címkét is érvénytelenít (`SETTINGS_TAG`,
`POSTS_TAG`), ezért ott nincs várakozás — a főoldal láblécében is azonnal az új
telefonszám jelenik meg.

## Környezeti változók

Lásd `.env.example`. A kötelezőek:

| Változó                | Mire való                                          |
| ---------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, sitemap, OG tag. Build időben kell. |
| `ADMIN_JWT_SECRET`     | A munkamenet aláíró kulcsa, legalább 32 karakter.  |
| `ADMIN_USERNAME`       | Az admin felhasználóneve.                          |
| `ADMIN_PASSWORD_HASH`  | PBKDF2 hash — soha nem a jelszó maga.              |
| `DATA_DIR`             | Az adatfájlok helye. Dockerben `/app/data`.        |

---

## Szerkezet

```
app/
  (site)/          nyilvános oldalak (fejléc, lábléc, scroll animációk)
  admin/           admin felület — külön keret, nincs indexelve
  api/             kapcsolati űrlap és admin végpontok
components/
  hero/            a nyitóképernyő és a mögötte futó fényfelület
  sections/        a főoldal és az aloldalak szekciói
  motion/          scroll driver, reveal observer, folyamatvonal
  admin/           admin űrlapok és listák
  ui/              gomb, kártya, konténer, szekció
lib/
  site.ts          a marketing szövegek (szolgáltatások, folyamat, GYIK)
  store/           JSON tároló: bejegyzések, megkeresések, árak, cégadatok
    prices.ts        árkulcsok és alapértékek (kliensen is használható)
    organization.ts  elérhetőség és cégadatok, .env kezdőértékekkel
    settings.ts      a tároló + gyorsítótár-címkék (csak szerveren)
  auth/            JWT, jelszó, sebességkorlát, munkamenet
  seo/             metaadat és JSON-LD építők
  legal.ts         a jogi oldalak minta-szövegei
scripts/           vetés, kulcs- és jelszógenerálás
tests/             vitest: markdown, validáció, auth, árak
```

---

## Indulás előtti teendők

1. **Cégadatok.** Admin → Cégadatok (vagy `.env`): minden `[szögletes zárójeles]`
   helyőrzőt valós adatra kell cserélni. Az admin oldal kiírja, hány mező van még
   kitöltetlenül.
2. **Jogi szövegek.** A `lib/legal.ts` tartalma **minta**. Közzététel előtt
   jogi szakemberrel át kell nézetni.
3. **Domain.** A `NEXT_PUBLIC_SITE_URL` és a `docker-compose.yml` build argumentuma
   az éles domainre állítandó.
4. **Admin jelszó.** Új `ADMIN_JWT_SECRET` és `ADMIN_PASSWORD_HASH` generálása
   éles indulás előtt.
5. **security.txt.** A `public/.well-known/security.txt` `Expires` mezőjét évente
   frissíteni kell.

---

## Amit tudni érdemes a döntésekről

- **Nincs adatbázis.** Néhány száz sorról van szó (bejegyzések, megkeresések, egy
  beállítás objektum). A fájltároló egyetlen konténerben tartja a deployt, az
  írások atomikusak (temp fájl + `rename`), és fájlonként sorosítva futnak.
- **Nincs `.htaccess`.** A Next.js standalone szerver mögött nincs Apache, ezért
  az `.htaccess` itt nem értelmezhető. Az admin védelme három rétegű: Edge
  middleware, oldalankénti `requireSession()`, és `no-store` + `noindex` fejlécek.
- **Nincs Core Web Vitals számokkal teli marketing.** Az egyetlen kiírt szám a
  rendelkezésre állás, mert annak van jelentése egy megrendelőnek.
