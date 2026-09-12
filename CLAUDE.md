# Klivo — munkautasítás

Next.js 15 App Router, TypeScript strict, Tailwind, JSON adattár, JWT admin.
A projekt a Claude Enterprise Framework (`F:/Klivo/CEF/.claude/`) szabályai
szerint épült.

**Olvasd el munka előtt:** [`docs/DESIGN.md`](docs/DESIGN.md) (a design rendszer
és a hullámmotor), [`HIBAJELENTES.md`](HIBAJELENTES.md) (a meghozott döntések és
az eddig talált hibák), [`README.md`](README.md) (szerkezet, parancsok).

## Nem megkerülhető szabályok

1. **Nincs színátmenet és nincs második színcsalád.** A paletta kék és fehér:
   kilenc tónuslépcső a tiszta fehértől (`#FFFFFF`) a **legmélyebb kékig
   (`#0D4F8F`)**. Ennél sötétebb felület nincs — se szekció, se lábléc. Sem
   lilához, sem sárgához, sem más akcentushoz nincs token. A szöveg sem fekete,
   hanem mély tengerkék (`#08294D`).
2. **Nincs „szemöldök”** — a címsorok fölötti apró, csupa nagybetűs címke.
3. **Nincs kitalált tartalom.** Se referencia, se vélemény, se szám. A bemutató
   képek illusztrációk, és a szekció ki is írja ezt.
4. **Egy adatnak egy helye van.** Cégadat → `.env`. Ár → `lib/content/pricing.ts`.
   Szöveg → `lib/content/site.ts`. Bejegyzés, csapattag és GYIK → admin. Ezt ne
   duplázd.
5. **A fejlécből egyetlen hivatkozás visz a `/kapcsolat` oldalra.**
6. **Animálni csak `transform`-ot és `opacity`-t szabad.** A kivételek
   (lenyíló magassága) a `docs/DESIGN.md`-ben vannak megindokolva.
7. **A hullámrétegek között nagy tónuskülönbség és árnyék kell.** Közeli
   árnyalatokból mosott folt lesz, árnyék nélkül pedig nincs mélység — az első
   változat pontosan ezen bukott el.
8. **A szekciók háttere sima.** Hullám csak a szekciók _között_ van, a
   határokon. Két felület váltakozik (`white` és `sky`), a `blue` a záró
   felhívásé és a lábléceé. A sáv `from` értéke a **fölötte** lévő szekció
   felülete; ha elcsúszik, látható varrás marad. Szomszédos szekció nem lehet
   azonos felületű.
9. **A hullám formája SVG, nem `border-radius`.** Az útvonalakat a
   `lib/wave-path.ts` állítja elő; egy réteg tömör blokk + arányhelyes taraj
   (`WaveLayer`). A tarajt soha ne feszítsd a réteg teljes magasságára — a sima
   ív meredek sátorrá torzul.
10. **Minden szekciófejléc balra igazított.** Középre zárt címsor kitör az oldal
    ritmusából.
11. **Mérd a kontrasztot:** `node scripts/contrast.mjs`. A sötét felületeken a
    világos szöveg gyorsan 4,5:1 alá esik.
12. **Betűméret csak a skáláról.** Ha bővíted a `tailwind.config.ts` `fontSize`
    kulcsait, bővítsd a `lib/cn.ts` listáját is — különben a `tailwind-merge`
    némán eldobja a méretet.
13. **`npm run verify` a kapu.** Típus + lint + formázás + teszt + build.

## Csapdák, amikbe már beleszaladtunk

- **A build a _régi_ JSON tartalmat sütheti a statikus oldalakba.** Az
  `unstable_cache` a `.next/cache`-be ír, ami két build között megmarad, a JSON
  fájl viszont a Next tudta nélkül változik. Ezért a gyorsítótár-kulcs része a
  fájl ujjlenyomata (`createCollection().fingerprint()`). Új tárolónál ezt ne
  hagyd ki — a hiba néma: a build sikeres, az oldal hiánytalan, csak elavult.
- **`overflow: hidden` megöli a görgetésvezérelt animációt.** Görgetőkonténert
  csinál az elemből, és az idővonal ahhoz kötődik. A hullámsáv ezért
  `overflow: clip`, és a `view-timeline-name` a **sávon** van, nem a rétegen.
- **A sötét hullámmezők alja legyen a legsötétebb.** Onnan indul a következő
  hullámsáv; világosabb aljú mező után látható varrás marad.
- **A `skeleton` osztály CSS animációt futtat az `opacity`-n**, ami erősebb a
  sima `opacity: 0`-nál. Elrejtéskor az _osztályt_ kell levenni, nem az
  átlátszóságot állítani — különben a csontváz ottmarad a kép fölött.
- **Az `overflow-x: clip` a `<html>`-en nem vágja a `position: fixed`
  elemeket.** A nyitó függönynek saját `overflow: hidden` kell.
- **Hosszú magyar szavak nagy címsorban.** Fix betűméreten kilógnak, és
  semmilyen sortörés nem javítja. A skála ezért `clamp`-es, és a `hyphens: auto`
  **csak `h1`–`h3`-on** van — kártyacímen csúnya töréseket adna.
- **Negatív margó a szekció első gyerekén átcsúszik a szekción** (margin
  collapsing), és az egész szekciót elmozdítja.
- **Kép rácsban `min-w-0` nélkül** kifeszíti a cellát az intrinsic szélességére,
  és vízszintes túlcsordulást okoz mobilon.
- **A `data-motion` attribútumot festés előtt írja egy beágyazott szkript**,
  ezért a `<html>`-en `suppressHydrationWarning` van. Máshová ne tedd ki.
- **A `WaveBand` `SURFACE` térképe a paletta része.** Ha egy felület tokenje
  változik (`--blue`, `--deep`), ezt a térképet is át kell írni — különben a
  sáv utolsó hulláma más színű lesz, mint a szekció, és éles vágás marad.
- **A `tailwind-merge` csak azonos variánsú osztályt ejt ki.** A `p-0` az alap
  `p-6`-ot leüti, a `sm:p-7`-et **nem** — a térköz 640 pixel fölött némán
  visszajön. Ezért van a `Card`-on `flush` kapcsoló a `p-0` helyett; ahol
  hasonló felülírás kell, ott is a komponens adjon rá kapcsolót.
- **Kliens komponens nem importálhat a tárolóból.** A tároló `revalidateTag`-et
  húz be, ami csak szerveren létezik, és a build elszáll tőle. Ami a szerkesztő
  felületnek is kell (pl. `FAQ_PAGES`), az `lib/content/` alá megy.
- **Kapcsolható szekció nem döntheti el magáról, hogy megjelenik-e.** Minden
  szekció a **fölötte lévő** felületről érkezik (`band.from`). Ha egy szekció
  maga dönt a láthatóságáról, az alatta lévő rossz színről indítja a sávját, és
  látható varrás marad. A főoldali referencia szekció ezért nem olvas: az adatot
  a lap adja neki, és ugyanott dől el a következő szekció `from` értéke is.
- **SVG csak fertőtlenítve mehet a feltöltésbe.** Az SVG dokumentum, nem kép:
  azonos originről kiszolgálva szkriptet futtathat. A `lib/svg-sanitize.ts`
  engedélyezőlistával újraírja, a `/media/…` pedig `default-src 'none'; sandbox`
  CSP-t küld rá. A felismerést kisbetűsítve végezd, de a **kimenetre a
  szabványos írásmód** kerüljön — az SVG kis- és nagybetűérzékeny, a `viewbox`
  és a `lineargradient` némán nem rajzolódik ki.
- **Ne buildelj futó szerver mellé.** A `next build` felülírja a `.next`-et a
  futó `next start` alól: a kiszolgált HTML régi chunkokra hivatkozik, azok
  400-at adnak, és a lap stílus nélkül, óriási elemekkel jelenik meg. Állítsd
  le a szervert, buildelj, indítsd újra.

## Ellenőrzés

```bash
npm run verify
```

```bash
node scripts/shots.mjs / /blog /kapcsolat --w=390 --full
```

```bash
node scripts/contrast.mjs / /rolunk /szolgaltatasok/weboldal-keszites /blog /kapcsolat
```

```bash
node scripts/overflow.mjs
```

Böngészőben ellenőrizd: 360 / 768 / 1440 px, csökkentett mozgással is, és
billentyűzettel végig a fejlécen és az űrlapon.
