# A Klivo design rendszere

Ez a dokumentum azt írja le, **mi miért van úgy** az oldalon. Nem stíluslista:
minden érték mögött van egy döntés, és a döntés indoka fontosabb, mint az érték.

A tokenek forrása `app/globals.css`, a Tailwindre fordításuk
`tailwind.config.ts`. A kettőnek mindig egyeznie kell; ha eltérnek, a
`globals.css` az igaz.

---

## 1. A vezérgondolat

A referencia **rétegzett kék hullámok**: tömör felületek, amelyek egymásra
csúsznak, árnyékot vetnek egymásra, és nagy tónuskülönbség van közöttük — mintha
papírból lennének kivágva, vagy mintha víz alatt egymásra úsznának. Az egész
oldal ebből az egy formából épül:

- a szekcióhatárok (`WaveBand`, a `components/wave/section-divider.tsx`-ben),
- a nyitóképernyő és az aloldalak fejlécének örvénylő taréjai (`WaveCurls`),
- a blogbejegyzések borítója, ha nincs képe,
- a csapattagok portréja mögötti felület,
- a nyitó animáció,
- a kártyacímek alatti apró elválasztó (`WaveRule`),
- és a márkajel maga.

Hét helyen, hét léptékben ugyanaz a forma. Ettől érzi az ember egyetlen
tervezett felületnek az oldalt, nem összeollózott szekcióknak.

**Két dolog teszi hullámmá, és mindkettő kötelező:**

1. **Nagy tónuskülönbség a rétegek között.** Közeli árnyalatokból egyetlen
   mosott folt lesz — a szem nem lát benne réteget. A `--wave-*` skála ezért
   lépdel nagyokat.
2. **Árnyék a hullám peremén.** Ettől kerül az egyik réteg a másik _fölé_.
   Enélkül a két forma egy síkban van, és nincs mélység.

**A hullám háttér, nem tartalom.** A mozgás lassú (30–76 másodperces ciklusok),
és soha nem kereszteződik szöveggel. Ha egy hullám elvonja a figyelmet a
mondatról, akkor rossz.

---

## 2. Szín

### Egy szín, kilenc lépcső

A paletta **kék és fehér**. Egyetlen színcsalád, kilenc tónuslépcsőben — a tiszta
fehértől a mély tengerkékig. Más színcsalád nincs: se lila, se sárga, se zöld
akcentus.

Miért egy család: a hullámok hatását a **tónuskülönbség** adja, nem a
színkontraszt. Egy odarakott második szín nem erősít, hanem elmossa a rétegek
határát, és pontosan azt a papírkivágás-hatást öli meg, amiért az egész
formanyelv van. A cselekvést a legnagyobb tónuskontraszt jelöli: mély kék a
fehéren, sötét felületen pedig fordítva.

Nincs színátmenet: nincs hozzá token és nincs hozzá segédosztály.

### A skála

| Token      | Érték     |                        |
| ---------- | --------- | ---------------------- |
| `--wave-1` | `#FFFFFF` | tiszta fehér           |
| `--wave-2` | `#F0F9FF` |                        |
| `--wave-3` | `#DBEEFC` | világoskék felület     |
| `--wave-4` | `#B7DBF7` |                        |
| `--wave-5` | `#7DC3F0` |                        |
| `--wave-6` | `#3DA3E2` |                        |
| `--wave-7` | `#177AC5` |                        |
| `--wave-8` | `#0D4F8F` | kék felület            |
| `--wave-9` | `#082B52` | mély tengerkék felület |

### A négy szekciófelület

Az oldal négy felületen váltakozik, és a szekcióhatárok mindig **másik** színbe
vezetnek át:

| Név     | Token     | Skálapont |
| ------- | --------- | --------- |
| `white` | `--white` | `wave-1`  |
| `sky`   | `--sky`   | `wave-3`  |
| `blue`  | `--blue`  | `wave-8`  |
| `deep`  | `--deep`  | `wave-9`  |

A főoldal ritmusa: mély → fehér → világoskék → fehér → kék → világoskék →
fehér → világoskék → kék → mély. Két azonos felület soha nem követi egymást
hullámsáv nélkül.

### Szöveg és keret

| Token                           | Érték                 | Mire való                             |
| ------------------------------- | --------------------- | ------------------------------------- |
| `--paper`                       | `#F6FBFF`             | A törzs alapja, hajszálnyi kék        |
| `--ink`                         | `#08294D`             | Főszöveg — mély tengerkék, nem fekete |
| `--ink-soft`                    | `#1A4269`             | Folyószöveg a hosszú írásokban        |
| `--muted`                       | `#3F5F7D`             | Másodlagos szöveg — 6,7:1 fehéren     |
| `--on-dark` / `--on-dark-muted` | `#FFFFFF` / `#D6E9F8` | Szöveg sötét felületen                |
| `--line` / `--line-strong`      | `#D0E7F8` / `#A8D0EE` | Hajszálvonal, erősebb keret           |

**A szöveg soha nem fekete.** A mély tengerkék tinta ugyanazt a kontrasztot adja,
de a lap egyetlen színcsaládban marad.

### Hangnemhez igazodó osztályok

Ugyanaz a komponens világos és sötét felületen is előfordul. A komponensek a
_jelentést_ nevezik meg, a szín a szülő `data-tone` értékéből következik:

| Osztály        | Világos szekcióban | Sötét szekcióban  |
| -------------- | ------------------ | ----------------- |
| `.text-soft`   | `--muted`          | `--on-dark-muted` |
| `.border-soft` | `--line`           | `--line-dark`     |
| `.bg-raised`   | `--surface`        | sötét panel       |

A `Section` teszi ki a `data-tone`-t. A komponens nem tud a hangnemről, mégis
mindkettőben helyes.

> **Kontraszt-korlát.** A `--on-dark-muted` (`#D6E9F8`) csak `wave-8`-nál nem
> világosabb háttéren éri el a 4,5:1-et. A sötét szekciók bevezető bekezdései
> ezért **tiszta fehérek**, a hullámmezők pedig nem mennek `wave-8` fölé ott,
> ahol szöveg is van. Ez nem ízlés kérdése: mérhető, és a
> `node scripts/contrast.mjs` méri is.

---

## 3. Tipográfia

**Outfit** viszi a címsorokat. Geometrikus, barátságos formák, 700-as súly,
szoros betűköz. A nyitóképernyőn 3–9 rem között skálázik: a címsor az oldal
leghangosabb eleme, és ha az halk, az egész oldal az.

**Plus Jakarta Sans** viszi a folyószöveget. Magas x-magasság, nyitott
betűformák, kerekded részletek — barátságos és hosszabb bekezdésben is
kényelmes.

Mindkettő `next/font`-tal töltődik, tehát a build a saját kiszolgálónkra
másolja őket: nincs külső kérés a Google felé (a CSP `font-src 'self'` így
maradhat szigorú), nincs elrendezés-ugrás, és nincs harmadik fél, aki a
látogatót követhetné.

### A skála

| Fokozat     | Méret                      |
| ----------- | -------------------------- |
| `body-sm`   | 14 px                      |
| `body`      | 17 px                      |
| `body-lg`   | 19 px                      |
| `h6` … `h4` | 18 / 22 / 28 px            |
| `h3`        | `clamp(26px, 3.6vw, 36px)` |
| `h2`        | `clamp(32px, 5vw, 48px)`   |
| `h1`        | `clamp(40px, 6.5vw, 64px)` |
| `display`   | `clamp(48px, 9vw, 96px)`   |

A törzsszöveg 17 px, nem 16: hosszabb bekezdésben ez a különbség érezhető.

A nagy fokozatok `clamp`-pel folyékonyak. Fix méreten a hosszú magyar szavak
(például „keresőoptimalizálásról”) 360 pixeles nézeten kilógnának a lapból, és
ezt semmilyen sortörés nem javítja — egy szó nem tud elférni.

A `hyphens: auto` **csak `h1`–`h3`-ra** vonatkozik. A kártyacímeken (`h4`–`h6`)
kikapcsolva marad: ott a sor rövid, és az elválasztás csúnya töréseket ad
(„Első benyo-mására”).

> **Csapda.** A skála saját neveket használ (`text-h3`), amelyeket a
> `tailwind-merge` szövegszínnek nézne, és `cn('text-h3', 'text-ink')` esetén
> eldobná a méretet. A `lib/cn.ts` ezért explicit listát ad a könyvtárnak.
> Ha a skála bővül, azt a listát is bővíteni kell.

---

## 4. Térköz és elrendezés

Alapegység 4 px, ritmus 8 px. Szekció-térköz: 80 / 96 / 128 px (mobil / tablet /
asztali), mindig egyenlő fent és lent. A bőséges térköz nem üresjárat: a prémium
érzet nagyrészt abból jön, hogy semmi nem szorong.

Tartalmi szélesség 1280 px, széles rács 1440 px, folyószöveg 720 px.

**A szöveg kártyán vagy fehér felületen ül.** Hullámmezőre közvetlenül csak
címsor és rövid bevezető kerül; minden hosszabb szöveg és minden felsorolás
kártyát kap. A kép ugyanígy: fehér szekcióban a legjobb, mert ott beleolvad a
lapba ahelyett, hogy ablakként ülne rajta.

---

## 5. A hullámmotor

Két forma, két feladat, **két teljesen külön fájl**. Mindkettő kizárólag
`transform`-ot és `opacity`-t animál.

> A szétválasztás szándékos. A szekcióhatár viselkedése kész és jó; a
> nyitóképernyő motorját viszont többször át kellett írni. Amíg közös
> rétegkomponensen és közös osztályneveken osztoztak, minden hero-átírás
> egyben a határokat is átírta — és pontosan ez történt egyszer: az összes
> működő szekcióhatár egyszerre romlott el. Azóta a határ a
> `components/wave/section-divider.tsx`-ben lakik, saját `divider-*`
> osztályokkal és saját kulcskockákkal, amelyekhez a hullámmotor nem nyúl.

### `WaveBand` — a szekcióhatár

Három–öt réteg egymáson: mindegyik a sáv tetejéről indul, mindegyik más
magasságig ér le, és mindegyik alsó pereme hullám. A rövidebbek alól így bukkan
ki a hosszabbak pereme.

A tónusok **felülről lefelé** lépdelnek: a sáv teteje a fenti szekció színe, az
alja a lentebbié. A sáv így nemcsak elválaszt, hanem varrás nélkül _átvezet_.

A hangsúly két paraméterrel állítható:

| Használat                | Rétegek | Mélység | Hatás                          |
| ------------------------ | ------- | ------- | ------------------------------ |
| Világos ↔ sötét váltás   | 5       | `lg`    | Nagy, papírkivágásszerű váltás |
| Árnyalaton belüli váltás | 3       | `sm`    | Halk átvezetés                 |

A hívás a szekció szintjén történik, és csak azt kell megadni, honnan érkezünk:

```tsx
<Pillars band={{ from: 'deep', layers: 5, depth: 'lg' }} />
```

**Görgetésre animál.** A rétegek vízszintesen sodródnak, ahogy a sáv áthalad a
képernyőn — `animation-timeline`, tehát a compositoron fut, és nincs hozzá
görgetésfigyelő. Ahol a böngésző nem támogatja, időalapú sodródás lép a helyére
(`@supports`).

> **Két néma csapda a görgetésvezérelt idővonalban.**
>
> 1. Az `overflow: hidden` görgetőkonténert csinál az elemből, és az idővonal a
>    legközelebbi görgetőkonténerhez kötődik — egy soha nem görgő dobozhoz kötve
>    az animáció „fut”, de a haladása nem változik. A sáv ezért `overflow: clip`
>    (előtte `hidden` a régi böngészőknek).
> 2. Az idővonal alanya a **sáv**, nem a réteg: a réteg egy jóval szélesebb,
>    kilógó ellipszis, amelynek a látható tartománya nem esik egybe a sávéval.
>    Ezért `view-timeline-name: --wave-band` a sávon, és a rétegek erre a névre
>    hivatkoznak.

### `WaveCurls` — a nyitóképernyő és az aloldalak fejléce

Örvénylő taréjok: minden hullám koncentrikus, elliptikus **ívsávokból** áll
(`lib/wave-curl.ts`), és a saját elforgatása adja, melyik irányból érkezik. Egy
vízszintes hullámvonal ezt nem tudja — akárhány réteget rakunk egymásra, annak
mindig egy iránya van, a referenciakép hullámai viszont körbemennek.

Egy taréj felépítése kívülről befelé: **sötét perem → fehér fénycsík → tömör
test**, mindhárom köré vékony fehér kontúr. Ettől olvasódik megvilágított
víztömegnek, és nem lapos gyűrűnek.

A nézetdoboz **négyzetes**, a skálázás `slice`. Így a taraj se álló, se fekvő
nézetben nem nyúlik meg — a forma ugyanaz marad, csak más részlete látszik. A
korábbi motor `preserveAspectRatio="none"`-t használt, és széles képernyőn
laposra húzódott: pont a jellegzetes ív tűnt el.

**A nagy ívek középpontja a képen kívül van.** Ez a kompozíció fő szabálya, és
két változat bukott el rajta. Ha egy nagy taréj középpontja beesik a képbe,
akkor a sáv két vége is beesik — egy ívnek a semmiben végződő vége pedig
pontosan úgy néz ki, mint egy félbevágott hullám a képernyő közepén. Kívülről
indítva csak az ív _közepe_ látszik: a hullám a képernyő széléről érkezik,
átível a felületen, és a másik szélen megy ki.

**Három méret, nem egy.** Egyméretű hullámokból minta lesz, nem víz. A nagyok a
keret mentén futnak, az aprók (kereten belüli középponttal) a hézagokat töltik
ki. Az aprók vége látszik, ezért erősebb hegyesedést kapnak — hegyben elfogyó ív
kis hullám, tompán elvágott ív viszont hiba.

**Minden taréj más alakú.** Négy paraméter formálja: az ív hossza (`span`), a
becsavarodás (`swirl`), a belső sávok rövidülése (`inset`) és a rövidülés
elosztása a két vég között (`lead`). A becsavarodás a legfontosabb: a belső
sávok középpontja a taréj csúcsa felé csúszik, a gyűrűk egyik oldalon
összetorlódnak, a másikon szétnyílnak. Enélkül minden taréj ugyanaz a félhold,
akárhogy forgatjuk.

**A tónust a hely adja, nem kézi érték.** A taréj csúcsának magasságából
számolódik: a felső kétharmadban csak a skála világos vége szerepel, mert ott ül
a címsor és a bekezdés — tintaszínű szöveg a `wave-5`-ön 7,5:1, a `wave-7`-en
már csak 3,6:1. Kézzel osztott palettáknál ez minden átrendezésnél elcsúszott.
Egyik tónus sem lehet `wave-2`, a felület saját színe: az a sáv eltűnne, és a
taréj kilyukasztottnak látszana.

**A rajzolási sorrend a tónus mélysége.** Vízben a közelebbi, sötétebb hullám
takarja a távolabbit; ha a rétegsorrend a felsorolást követi, a kép lapos
matricákra esik szét.

**Követi a mutatót, de görgetésre nem mozog.** Minden taréj más mértékben húz a
kurzor felé, a globális `--pointer-x/y` változókból — komponens-szintű
JavaScript nélkül, szerver komponensként. Görgetéshez kötött forgás is volt itt,
de harminc egyszerre forgó, saját rétegre emelt SVG-csoport minden görgetési
képkockán újrarajzoltatta a teljes felületet, és érezhetően akadt. A görgetés a
szekcióhatárok dolga.

**Az aloldalak fejléce ugyanez, felülre igazítva** (`align="top"`): a
rajzterület a doboznál másfélszer magasabb, tehát minden méretnél pontosan a
világos felső kétharmad látszik. A `slice` skálázás magától a doboz arányától
függően vágna, és a szöveg olvashatósága nem múlhat ezen.

**A vízvonal zárja le.** A felület alján tömör `wave-9` blokk, hullámos felső
éllel: a következő szekcióhatárnak egyszínű felülettel kell találkoznia, az
örvények alja viszont tarka.

### `WaveRule` — az apró elválasztó

A márkajel egyetlen hulláma, két pixel vastag vonalként. Ez az egy elem SVG és
nem CSS-forma: egy _vonalat_ CSS-ből csak úgy lehetne, hogy egy második,
háttérszínű formával takarjuk ki a kitöltés nagy részét — az pedig minden
háttéren külön hangolást igényelne.

### `Bubbles` — a buborékok

Néhány apró, felfelé szálló kör a sötét szekciókban. Fix pozíciókkal, nem
véletlenszerűen: egy `Math.random()` szerveren és kliensen mást adna, és
hidratálási eltérést okozna.

---

## 6. Mozgás

### A nyitó animáció

Az első betöltéskor a képernyőt ugyanazok a hullámsávok fedik, amelyek az
oldalon végigfutnak. A jel előbb megjelenik és megáll egy ütemre; a sávok
kaszkádja 700 ms után indul, és 1,9 másodperc körül ér véget — a legmélyebb
tengerkéktől a legvilágosabbig, 110 ezredmásodpercenként lépcsőzve. Ennyi idő
alatt a nyitóképernyő képei megérkeznek, de a látogató még nem vár.

A rétegsorrendnek egyeznie kell a késleltetéssel: a legsötétebb van legfelül, és
az indul elsőként. Ha a felső réteg indulna utoljára, a kaszkádból semmi nem
látszana — csak egy sötét lap húzódna fel.

Egyetlen sor kliensoldali JavaScript sem tartozik hozzá: egy fejlécbe ágyazott,
festés előtt lefutó szkript kirakja a `data-intro="run"` jelzőt a `<html>`-re
(csak az első betöltéskor, és csak ha a látogató nem kért csökkentett mozgást),
a többit a CSS animáció intézi. Ha bármi elakad, a függöny alapból rejtett.

### Időzítés és görbe

| Sáv        | Idő    | Mire                             |
| ---------- | ------ | -------------------------------- |
| `feedback` | 140 ms | Gomb, hivatkozás, mező           |
| `ui`       | 200 ms | Menü, kapcsoló, aláhúzás         |
| `panel`    | 300 ms | Lenyíló, mobil menü, kép beúszás |
| `page`     | 420 ms | —                                |
| —          | 520 ms | Görgetésre megjelenés            |
| —          | 760 ms | Nyitóképernyő sorbeúszása        |

Görbék (a mozgás-skillből): `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` és
`--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. A beépített CSS-görbék túl
gyengék; ezeken kívül más görbe nincs az oldalon. `ease-in` sehol: lassan indul,
épp abban a pillanatban, amikor a felhasználó odanéz.

### Mi animálódik

Kizárólag `transform` és `opacity` — ezek a compositoron maradnak. Két kimondott
kivétel: a lenyíló válasz magassága (`grid-template-rows: 0fr → 1fr`, mert egy
lenyíló magassága maga az interakció), és a statikus árnyék a hullámrétegeken
(az nem animálódik, csak a réteg textúrájának része).

### Interaktivitás

- **A nyitóképernyő hullámai követik a mutatót.** Egyetlen `pointermove` figyelő
  van az egész oldalra (`MotionDriver`), amely képkockánként legfeljebb egyszer
  ír két CSS változót a `<html>`-re; a rétegek ezeket olvassák. Így az
  interaktivitás egyetlen bájt komponens-szintű JavaScriptbe sem kerül, és a
  hullámkomponensek szerver komponensek maradhatnak.
- **A szekcióhatárok görgetésre sodródnak** (lásd `WaveBand`). A
  nyitóképernyő taréjai viszont **nem** — lásd `WaveCurls`.
- **A gombokon víz emelkedik** rámutatásra: egy hullámperemű réteg 220 ms alatt
  följebb ér. Csak `@media (hover: hover) and (pointer: fine)` mögött — érintésen
  a koppintás hamis hovert vált ki.
- **A görgetésjelző egér ikonjában a pont mozog** le-föl, 2200 ms-os ciklusban.

### Csökkentett mozgás

A `prefers-reduced-motion: reduce` nem lassítás: a folyamatos mozgás teljesen
leáll, a megjelenések azonnaliak, a mutatókövetés kikapcsol, és a nyitó függöny
el sem indul. Ami visszajelzés (fókusz, állapotváltás), az megmarad.

---

## 7. Képek

Az oldal képanyaga a korábbi klivo.hu-ról származik, **kék duotónusra
hangolva**. Az eredetik halvány lila-kék színátmenetes 3D-illusztrációk voltak;
kétlépcsős átalakítás után viszont pontosan illenek a palettához, és a forma meg
a mondanivaló megmarad.

A két lépcső:

1. **Tónustartomány-nyújtás.** Az eredeti illusztrációk mediánja 234–249 közé
   esett — vagyis szinte minden fehér volt —, és szimplán deszaturálva a formák
   eltűntek. A ténylegesen használt tartomány szétnyújtásával lettek olvashatók.
2. **Csatornánkénti leképezés.** A kinyújtott szürke a `#082B52`–fehér tengelyre
   kerül, tehát a kép a paletta mély kékjében ül.

Az eszközmakettek csak hűvös árnyalatot kaptak: azok fotorealisztikus képernyők,
és a duotónus elvenné a hitelességüket.

**A képek fehér szekcióba kerülnek.** Fehér háttéren az illusztráció széle
eltűnik, és a kép a lap részének látszik, nem ablaknak rajta.

---

## 8. Amit ez a rendszer nem enged

Ezek nem ízlésbeli megjegyzések: nincs hozzájuk token, komponens vagy
segédosztály.

- Színátmenet díszítésként.
- Második színcsalád — lila, sárga vagy bármi más akcentus.
- Szemöldök a címsorok fölött.
- Kitalált szám, referencia vagy vélemény.
- Kétszer ugyanaz a hivatkozás a fejlécben.
- Betűméret a skálán kívülről.
- Harmadik betűcsalád.
- Animáció olyan tulajdonságon, ami elrendezést számoltat.
- Egymáshoz közeli tónusú hullámrétegek: abból folt lesz, nem hullám.
- Világos hullámtónus sötét szekcióban ott, ahol szöveg is van.
