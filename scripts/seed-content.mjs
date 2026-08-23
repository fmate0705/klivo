#!/usr/bin/env node
/**
 * Kezdő tartalom vetése (seed).
 *
 * Idempotens: csak azokat a bejegyzéseket írja ki, amelyeknek a slugja még nem
 * szerepel az adatfájlban, és soha nem ír felül semmit, amit az adminban
 * szerkesztettél. Ezért futtatható build közben és egy már élő konténerben is:
 *
 *   node scripts/seed-content.mjs
 *
 * A Dockerfile a build előtt hívja meg, hogy az image tartalmazza a kezdő
 * adatokat — a Docker az üres named volume-ot az image tartalmából tölti fel az
 * első csatoláskor, így a blog azonnal működik egy friss deploy után.
 *
 * A borítóképek a `public/images` alatt élnek, szürkeárnyalatra hangolva, hogy
 * illeszkedjenek az egyszínű palettához. Kép nélküli bejegyzés is helyes: olyankor
 * a hullámborító veszi át a helyét (`components/blog/post-cover.tsx`).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data');
const POSTS_FILE = join(DATA_DIR, 'posts.json');

const WORDS_PER_MINUTE = 200;

function readingMinutes(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * A kezdő bejegyzések.
 *
 * A `publishedAt` fix dátum, nem a futás ideje: így a vetés eredménye
 * determinisztikus, és két gépen ugyanaz a sorrend jön ki.
 */
const posts = [
  {
    id: 'seed-01-ai-seo',
    slug: 'mit-jelent-az-ai-seo',
    title: 'Mit jelent az AI SEO, és miért nem elég a régi recept?',
    excerpt:
      'A keresés átalakult: a válasz gyakran már nem tíz kék link, hanem egy összefoglaló. Így kell felépíteni egy oldalt, hogy az AI-asszisztensek is idézzék.',
    category: 'SEO',
    image: '/images/blog-seo.webp',
    imageAlt: 'Nagyító üveglapok fölött — a keresés, amely átnézi a tartalmat',
    publishedAt: '2026-07-22T08:00:00.000Z',
    body: `A klasszikus keresőoptimalizálás célja egyszerű volt: kerülj be a Google első tíz találata közé. Ez a cél nem tűnt el, de mellé került egy másik. A felhasználók egyre gyakrabban nem listát kapnak, hanem kész választ — az AI-összefoglalóktól a ChatGPT-n és a Perplexityn át a Gemini válaszdobozáig.

## Miben más az AI-keresés?

Egy hagyományos találati lista a *linkre* kattintást jutalmazza. Egy AI-válasz viszont a **tartalmat idézi**, és mellé teszi a forrást. Ez két dolgot jelent a gyakorlatban:

- A tartalomnak önmagában, kontextus nélkül is érthetőnek kell lennie.
- A forrásmegjelölés az új átkattintás. Ha nem idéznek, nem is látszol.

## Amit egy oldalon meg kell tenni

### Írj kérdésre választ

Az AI-modellek a kérdés–válasz szerkezetet szeretik. Egy alcím, ami kérdés, alatta három mondat, ami tényleg megválaszolja — ez többet ér, mint egy ezerszavas bevezető.

### Adj strukturált adatot

A JSON-LD nem dísz. Az \`Organization\`, \`Service\`, \`FAQPage\` és \`BlogPosting\` sémák pontosan megmondják a gépnek, hogy mi micsoda az oldalon.

\`\`\`json
{
  "@type": "FAQPage",
  "mainEntity": [{ "@type": "Question", "name": "Mennyibe kerül egy weboldal?" }]
}
\`\`\`

### Tartsd tisztán a HTML-t

Egy \`h2\` legyen \`h2\`, ne egy félkövér \`div\`. A szemantikus szerkezet az, amiből a modell megérti a dokumentum vázát.

### Engedd be a botokat

A \`robots.txt\` és az \`llms.txt\` együtt mondja meg, mit szabad indexelni és mit érdemes beolvasni. Ha véletlenül kizárod az AI-crawlereket, hiába jó a tartalom.

> A gyakorlatban a legtöbb magyar kkv-oldal nem azért nem látszik az AI-válaszokban, mert rossz a szövege, hanem mert a gép nem tudja értelmezni a szerkezetét.

## Mérés

Nem tudsz javítani azon, amit nem mérsz. Kérdezd meg havonta ugyanazt az öt kérdést a nagy asszisztensektől, és nézd meg, kit idéznek. Ez ma a legpontosabb ellenőrzés, ami rendelkezésre áll.

## Összefoglalva

Az AI SEO nem külön szolgáltatás, hanem az, ahogy ma egy weboldalt fel kell építeni: tiszta szerkezet, strukturált adat, kérdésre adott válasz és gyors betöltés. Ha ez megvan, a klasszikus Google-találatokban is jobb helyen leszel.`,
  },
  {
    id: 'seed-02-sebesseg',
    slug: 'core-web-vitals-magyarul',
    title: 'Core Web Vitals magyarul: mit mér a Google, és mit ér el vele az oldalad?',
    excerpt:
      'Három mérőszám dönti el, hogy a látogató marad-e. Végigmegyünk rajtuk emberi nyelven, és megmutatjuk, mi javít rajtuk a legtöbbet.',
    category: 'Teljesítmény',
    image: '/images/blog-speed.webp',
    imageAlt: 'Sebességmérő óra, mutatója a skála felső harmadában',
    publishedAt: '2026-07-08T08:00:00.000Z',
    body: `A sebesség nem technikai hiúság. Egy másodperc pluszbetöltés mérhetően csökkenti az érdeklődők számát, és a Google is figyeli, milyen gyorsan használható az oldalad.

Ha megrendelőként olvasod: ezeket a mérőszámokat nem neked kell ismerned. Azért írjuk le, hogy lásd, mire figyelünk helyetted.

## A három mérőszám

### Mennyi idő alatt jelenik meg a lényeg?

A Google azt méri, mikor rajzolódik ki a legnagyobb tartalmi elem: általában a főcím vagy a nyitókép. Ami ezen a legtöbbet javít:

- modern képformátum és pontos méretezés
- a nyitókép előre töltése, a többi kép késleltetése
- szerveroldali renderelés, hogy a szöveg ne egy JavaScript letöltése után érkezzen

### Mennyi idő telik el egy kattintás és a válasz között?

Ha kattintasz, és semmi nem történik, az oldal élettelennek hat. A késés szinte mindig a böngészőt lefoglaló JavaScript miatt van: nehéz animációs könyvtárak, harmadik féltől érkező widgetek, és a mindent kliensen összerakó oldalfelépítés.

### Mennyit ugrál az elrendezés töltés közben?

Az a bosszantó pillanat, amikor épp rákattintanál valamire, és a gomb elugrik. Megelőzhető: minden képnek fix helyet adunk, és a betűtípus sem tolhatja el a szöveget betöltéskor.

## Hogyan mérünk?

Kétféle adat van, és a kettő nem ugyanaz:

1. **Laboradat.** A fejlesztő gépén futtatott mérés. Gyors visszajelzés, de szimulált.
2. **Terepadat.** A valódi látogatóktól származó mérés a Search Console-ban. A rangsorban ez számít.

> Ha a labormérés jó, de a terepadat rossz, szinte biztosan a mobilhálózat és a gyengébb telefonok az okok. Ezért tesztelünk lassított kapcsolaton is.

## Amit mi csinálunk másképp

Az oldalakat szerveroldalon rendereljük, a JavaScriptet a valóban interaktív részekre korlátozzuk, az animációkat pedig olyan CSS-megoldásokra építjük, amelyek nem terhelik a böngésző fő szálát. Nem külön optimalizálási csomag: így épül minden oldal, amit kiadunk a kezünkből.`,
  },
  {
    id: 'seed-03-arak',
    slug: 'mennyibe-kerul-egy-weboldal',
    title: 'Mennyibe kerül egy weboldal? Őszinte árbontás',
    excerpt:
      'Miért százezer forint az egyik oldal és több millió a másik? Végigvesszük, mi viszi az árat, és hogyan lehet fix ajánlatot adni meglepetések nélkül.',
    category: 'Árazás',
    image: '/images/blog-build.webp',
    imageAlt: 'Egymásra épülő elemekből összeálló szerkezet, építkezés közben',
    publishedAt: '2026-06-19T08:00:00.000Z',
    body: `A leggyakoribb kérdés, és a legnehezebben megválaszolható egy mondatban. Az ár nem az oldalak számától függ, hanem attól, mennyi *döntést* kell meghozni és mennyi *egyedi* munkát elvégezni.

## Mi viszi az árat?

### Tartalom és szerkezet

Egy fókuszált kampányoldal egyetlen üzenetet visz végig. Egy bemutatkozó oldal öt-tíz aloldalt, navigációt és belső linkelést jelent. A tartalom mennyisége az egyik legnagyobb tényező.

### A megjelenés mélysége

Sablonból indulni olcsó, de a sablon látszik. Az egyedi megjelenés több munka, viszont ez az, amitől a látogató komolyan vesz.

### Funkciók

- kapcsolati űrlap: alap
- blog saját admin felülettel: plusz munka
- foglalás, fizetés, számlázási integráció: külön projekt

### Adatköltöztetés

Egy meglévő oldal átvétele, a régi címek átirányítása és a felépített keresőérték megőrzése önálló feladat.

## Nálunk hogyan néz ki?

Négy csomag, mindegyiknél kiírt árral:

- **Starter** — 1–3 oldal, egyszerű landing. Egyedi megjelenés, űrlap, keresőoptimalizálás alapból.
- **Business** — 1–5 oldal, értékesítésre hangolt szerkezettel, kulcsszókutatással.
- **Professional** — 1–10 oldal, kidolgozott termékoldallal és blogos adminnal.
- **Custom** — egyedi felépítés, egyedi funkciók, AI-integrációk.

A csomagon felüli tételeket (extra aloldal, extra funkció) külön áraztuk be, hogy
ne legyen meglepetés. A pontos, aktuális árakat a
[szolgáltatás oldalakon](/szolgaltatasok) találod.

## Miért adunk fix árat?

Mert az órabecslés kockázata mindig a megrendelőé. A felmérés után pontosan tudjuk, mi a feladat, és azt írásban rögzítjük. Ha menet közben új igény jön, arra külön ajánlat készül — de a megállapodott tételek ára nem változik.

> Ha valaki árat mond a projekt megismerése nélkül, az vagy túlárazza, vagy később fogja.

## Mire figyelj más ajánlatoknál?

1. Benne van-e a szövegírás és a képanyag?
2. Kié lesz a forráskód és a domain?
3. Mi történik az átadás után: ki javítja a hibát, és mennyiért?
4. Van-e havi díj, és mit fedez pontosan?`,
  },
  {
    id: 'seed-04-admin',
    slug: 'admin-felulet-amit-tenyleg-hasznalsz',
    title: 'Admin felület, amit tényleg használni fogsz',
    excerpt:
      'A legtöbb tartalomkezelő azért marad üresen, mert bonyolult. Öt elv, ami alapján úgy tervezünk admin felületet, hogy hetente használd.',
    category: 'Termék',
    image: '/images/blog-ai.webp',
    imageAlt: 'Kezelőfelület lebegő panelekkel és vezérlőelemekkel',
    publishedAt: '2026-05-30T08:00:00.000Z',
    body: `Sok céget láttunk már, amelyik fizetett egy tartalomkezelőért, aztán soha nem nyitotta meg. Nem lustaságból: a felület egyszerűen nem az ő nyelvükön beszélt.

## Csak azt mutasd, ami az adott munkához kell

Egy blogbejegyzéshez cím, rövid leírás, szöveg, kategória és borítókép kell. Nem harminc mező és nyolc fül.

## A vázlat legyen az alapértelmezett

Aki fél attól, hogy véletlenül élesít valamit, bele sem kezd. Minden új tartalom vázlatként születik, és egy külön, tudatos lépés teszi közzé.

## Beszélj magyarul, ne fejlesztőül

„Slug” helyett „URL-részlet”, „meta description” helyett „rövid leírás a keresőben”. A mezőnév melletti egy mondat többet ér, mint egy húszoldalas kézikönyv.

## Legyen visszaút

Törlés előtt kérdezz rá. A közzétett tartalom legyen visszaállítható vázlattá. Egy hibás kattintás ne kerüljön órákba.

## Ne legyen benne, amire nincs szükség

Minden extra mező és funkció döntést kér a felhasználótól. Ha egy funkciót évente egyszer használnál, ott a helye egy e-mailben, nem a felületen.

> Egy jó admin felület mércéje egyszerű: az ügyfél egy hónappal az átadás után is használja, kérdés nélkül.

## Hogyan néz ki ez a gyakorlatban?

Ezen az oldalon is pontosan ilyen admin fut: belépés után látod a bejegyzések listáját, egy gombbal írsz újat, külön oldalon állítod az árakat, és egy helyen olvasod a beérkező megkereséseket. Semmi több.`,
  },
  {
    id: 'seed-05-koltoztetes',
    slug: 'weboldal-koltoztetes-seo-vesztes-nelkul',
    title: 'Weboldal költöztetés keresőérték-vesztés nélkül',
    excerpt:
      'Az új oldal indulása a leggyakoribb pont, ahol egy cég elveszíti az addig felépített forgalmát. Ellenőrzőlista, hogy ne így legyen.',
    category: 'SEO',
    image: '/images/blog-seo.webp',
    imageAlt: 'Nagyító üveglapok fölött — a keresés, amely átnézi a tartalmat',
    publishedAt: '2026-05-12T08:00:00.000Z',
    body: `Új megjelenés, új rendszer, jobb sebesség — és két héttel az élesítés után feleannyi látogató. Ez nem véletlen, és szinte mindig megelőzhető.

## Az élesítés előtt

1. **Térképezd fel a régi oldalt.** Minden címet, a forgalmi adatokkal együtt.
2. **Készíts átirányítási táblát.** Minden régi cím kapjon egy állandó átirányítást az új oldalon. Ne a főoldalra mutasson minden.
3. **Mentsd le a jelenlegi pozíciókat.** Ez lesz a viszonyítási alap.
4. **Vidd át a tartalmat, ne írd újra mindet egyszerre.** Két nagy változás egyszerre lehetetlenné teszi a hibakeresést.

## Az élesítés napján

- Ellenőrizd, hogy a \`robots.txt\` nem tiltja-e ki a keresőket. Ez a leggyakoribb hiba.
- Küldd be az új sitemapet a Search Console-ban.
- Nézd meg mintavételesen, hogy az átirányítások tartósak (301), nem ideiglenesek (302).

## Az élesítés után

Az első két hétben napi, utána heti ellenőrzés:

- indexelési hibák a Search Console-ban
- nem található oldalak a szervernaplóban
- pozícióváltozás a fő kulcsszavakon

> Az organikus forgalom átmeneti, 10–20 százalékos ingadozása normális. A tartós, 40 százalék feletti esés mindig hiba jele.

## Amit mi vállalunk

A költöztetéseknél az átirányítási táblát mi készítjük el és teszteljük, az élesítést pedig alacsony forgalmú időszakra időzítjük. A régi oldalt a költözés lezárásáig érintetlenül hagyjuk, így baj esetén van hová visszalépni.`,
  },
];

async function main() {
  await mkdir(dirname(POSTS_FILE), { recursive: true });

  let existing = [];
  try {
    existing = JSON.parse(await readFile(POSTS_FILE, 'utf8'));
    if (!Array.isArray(existing)) existing = [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // Sérült fájlt soha nem írunk felül: inkább leáll a vetés, mint hogy
      // elveszítsük a meglévő tartalmat.
      if (error instanceof SyntaxError) {
        console.error(`[seed] ${POSTS_FILE} nem érvényes JSON. A vetés kimarad.`);
        return;
      }
      throw error;
    }
  }

  const taken = new Set(existing.map((post) => post.slug));
  const added = [];

  for (const post of posts) {
    if (taken.has(post.slug)) continue;
    added.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      image: post.image,
      imageAlt: post.imageAlt,
      author: 'Klivo',
      readingMinutes: readingMinutes(post.body),
      published: true,
      publishedAt: post.publishedAt,
      createdAt: post.publishedAt,
      updatedAt: post.publishedAt,
    });
  }

  if (added.length === 0) {
    console.log('[seed] Nincs mit hozzáadni — minden kezdő bejegyzés megvan.');
    return;
  }

  const next = [...added, ...existing].sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
  );

  await writeFile(POSTS_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`[seed] ${added.length} bejegyzés hozzáadva: ${POSTS_FILE}`);
}

main().catch((error) => {
  console.error('[seed] Hiba:', error);
  process.exit(1);
});
