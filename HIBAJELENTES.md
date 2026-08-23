# Hibajelentés és tervezői döntések

Ez a dokumentum két dolgot tartalmaz:

1. **Amit a jelenlegi klivo.hu oldalon problémásnak találtam** — mérésekkel, nem
   benyomás alapján —, és hogy az új változatban mi lett belőle.
2. **Amit az új oldalon szándékosan másképp csináltam**, mint ahogy a feladat
   szó szerint kérte, és miért.

A méréseket 2026. augusztus 20-án végeztem a live `https://klivo.hu` oldalon
(Chromium, 1440×900), az új oldalt pedig a produkciós buildből futtatva.

---

## 1. A jelenlegi oldal mért hibái

### 1.1 Két menüpont vitt ugyanarra az oldalra — **javítva**

A fejlécben a `Kapcsolat` és a `Kérj ajánlatot` is a `/kapcsolat` címre mutatott,
minden oldalon. A látogató két különböző oldalt feltételez, és fölösleges
döntést kap egy olyan választásnál, aminek nincs következménye.

**Mérés:** a fejléc `/kapcsolat`-ra mutató linkjei minden oldalon:
`Kapcsolat`, `Kérj ajánlatot`.

**Most:** a fejlécből **egyetlen** hivatkozás visz oda, az elsődleges gomb
(`Kérj ajánlatot`). A „Kapcsolat” felirat a láblécben marad, ahol a felfedezés a
cél, nem a konverzió. Az oldal címe `Kapcsolat és ajánlatkérés`, tehát maga a lap
mondja ki, hogy a kettő ugyanaz.

### 1.2 Címsor-hierarchia ugrások — **javítva**

Két oldalon a `h1` után rögtön `h3` következett, közbülső `h2` nélkül. A
képernyőolvasók címsor-listája ettől szakadozik, és a kereső sem tudja, mi
tartozik mi alá.

| Oldal             | Mért ugrás                          |
| ----------------- | ----------------------------------- |
| `/szolgaltatasok` | `h1 → h3` („Weboldal készítés”)     |
| `/blog`           | `h1 → h3` („Mit jelent az AI SEO…”) |

**Most:** minden oldalon pontosan egy `h1` van, és nincs szintugrás. Ahol a
látható tartalom nem indokolt új címsort (blog lista), ott egy csak
képernyőolvasónak szóló `h2` tartja a szerkezetet — látható, redundáns címsor
helyett.

**Ellenőrizve az új oldalon:** 7 oldal, 0 ugrás, oldalanként 1 `h1`.

### 1.3 Meta leírások hossza — **javítva**

| Oldal                               | Régi hossz | Probléma                          | Új hossz |
| ----------------------------------- | ---------- | --------------------------------- | -------- |
| `/`                                 | 182        | A Google ~160 karakternél levágja | 152      |
| `/szolgaltatasok/weboldal-keszites` | 109        | Kihasználatlan hely               | 145      |
| `/jogi/impresszum`                  | 69         | Kihasználatlan hely               | 148      |
| `/blog`                             | 123        | Rövid                             | 124      |

A `/szolgaltatasok/weboldal-keszites` **címe** 25 karakter volt
(`Weboldal készítés | Klivo`) — a találati listában ez üresen hagyott hely.
Most 53 karakter, és tartalmazza az ígéretet is:
`Weboldal készítés — egyedi megjelenés, fix ár`.

Az új oldalon minden cím 33–56, minden leírás 120–152 karakter. A cím és a
leírás egyetlen helyen él (`lib/content/site.ts`, `pageMeta`), tehát nem tud
oldalanként elcsúszni.

### 1.4 Alt szövegek — **javítva**

Hiányzó `alt` attribútum nem volt sehol; a probléma finomabb:

- **Öt tartalmi kép üres `alt`-tal.** A `hosting-layers.webp` négy oldalon, az
  `app-modules.webp` a folyamat oldalon `alt=""`-tal szerepelt. Az üres alt azt
  jelenti, hogy „ez a kép dísz, hagyd ki” — ezek viszont a szolgáltatást
  illusztrálták, tehát a képernyőolvasó és a képkereső egyaránt elesett tőlük.
- **A meglévő alt szövegek az illusztrációt írták le, nem a tartalmat.**
  Például: `Absztrakt, hálózatszerű grafika a keresésről`. Ez azt mondja el, hogy
  a kép absztrakt — nem azt, amit a kép közöl.

**Most:** minden tartalmi kép alt szövege azt írja le, _mit mutat a képernyő_,
nem azt, hogy „absztrakt grafika”. Például:

> `Időpontfoglaló felület laptopon és telefonon: havi naptár és választható szabad idősávok`

A tisztán dekoratív rétegek (hullámok) nem `img` elemek, hanem `aria-hidden`
CSS-formák, tehát nincs is mit alt-tal ellátni. Az alt szövegek a
`lib/content/site.ts`-ben a kép mellett élnek, egy objektumban — így nem lehet
képet cserélni úgy, hogy az alt a régi képet írja le.

**Ellenőrizve az új oldalon:** 7 oldal, 0 alt nélküli kép.

### 1.5 Lila és színátmenetes képanyag — **részben megoldva**

A régi képanyag jelentős része lila-kék színátmenetes 3D-illusztráció
(`bg-aurora`, `hosting-layers`, `app-modules`, `blog-*`). Ezek nem illenek egy
színátmenet- és lilamentes arculatba, ezért **nem kerültek át**.

Amit átvettem és megtartottam: a négy eszközmakett
(`work-business-site`, `work-restaurant`, `work-webshop`, `work-booking`). Ezek
tiszta, semleges hátterű felvételek. A hátterüket egy hajszállal világosabbra
hangoltam, hogy pontosan illeszkedjenek az új alap háttérszínhez — így a képek
beleolvadnak az oldalba ahelyett, hogy szürke téglalapként ülnének rajta.

Két képet generáltam újra (ez volt a keret): egy admin felület makettet és egy
üzemeltetési áttekintő makettet, ugyanabban a semleges-agyag palettában, hogy a
bemutató rács egységes maradjon.

A blogbejegyzések borítói **nem képek**: hullámokból rajzolt, CSS-ből álló
borítót kapnak, amelynek a mintája a bejegyzés slugjából számolódik. Ez nulla
bájt képadat, mindig ugyanaz marad ugyanahhoz a bejegyzéshez, és nem tesz úgy,
mintha ábrázolna valamit. Az adminban bármikor feltölthető helyette valódi kép.

---

## 2. Amit az építés közben találtam és javítottam

Ezek az új kódban felmerült hibák. Azért írom le őket, mert mindegyik olyan
osztályba tartozik, ami máskor is elő fog jönni.

### 2.1 A `tailwind-merge` némán eldobta a betűméreteket

A `cn()` segéd `tailwind-merge`-öt használ az ütköző Tailwind osztályok
feloldására. A könyvtár a beépített méretnevekből ismeri fel a betűméretet
(`text-sm`, `text-lg`); a mi skálánk viszont saját nevekkel dolgozik
(`text-h3`, `text-body-lg`), amelyeket **szövegszínnek** nézett. Egy
`cn('text-h3', 'text-ink')` hívásban a kettőt ütközőnek hitte, és eldobta a
méretet.

Ez néma hiba: nincs figyelmeztetés és nincs fordítási hiba, csak a mobil menü
címsorai lettek hirtelen akkorák, mint a folyószöveg. A `lib/cn.ts` most
explicit listát ad a könyvtárnak a skáláról.

### 2.2 Negatív margó átcsúszott a szekción (margin collapsing)

A blogcikk borítója negatív felső margóval lógott bele a sötét fejlécbe. A
szekciónak nem volt felső belső térköze, ezért a negatív margó **átcsúszott** a
szekció határán, és az egész szekciót 64 pixellel feljebb húzta — a hullámtaraj
így rárajzolt a cikk szerzőségi sorára (rovat, dátum, olvasási idő), az teljesen
eltűnt.

Javítva: a szekció valódi felső térközt kapott, a borító a helyén marad.

### 2.3 A lebegő sáv eltűnt a nyitott mobil menü alatt

A mobil panel a fejléc saját rétegkörnyezetében ült, magasabb `z-index`-szel,
mint a navigációs sáv — így a **bezáró gomb** a panel alá került. Nyitás után
csak Escape-pel vagy navigációval lehetett kilépni.

Javítva: a sáv rétege a panel fölé került.

### 2.4 A hullámtarajokat levágta a szülő `overflow: hidden`

A taraj szándékosan a szekció doboza **fölé** nyúlik. A láblécen volt egy
`overflow-hidden`, ami ezt levágta — a lábléc teteje egyenes vonallal
csatlakozott, nem hullámmal.

Javítva: a vágás oda került, ahol tényleg kell (a hullámmezőre), a doboz
határára nem.

### 2.5 A képek min-content mérete kifeszítette a rácsot

Egy feltöltött, 1200 pixel széles borítókép a blog rácsban vízszintes
túlcsordulást okozott 360 pixeles nézetben: a rács- és flex-elemek
alapértelmezett `min-width: auto` értéke a tartalom minimális szélessége, amit
egy `img` intrinsic mérete felülír. `min-w-0` nélkül a kártya nem tudott
összemenni.

Javítva minden bejegyzés-rácsban. Ellenőrizve: 9 oldal 360 pixelen, nincs
vízszintes túlcsordulás.

### 2.6 A csontváz örökre a képek fölött maradt

A `SmartImage` betöltés közben egy lüktető csontvázat mutat, és betöltés után
`opacity-0`-ra állította. Csakhogy a lüktetés **CSS animáció**, az animáció
pedig erősebb a sima `opacity` deklarációnál: a csontváz nem tűnt el, hanem
0,55 és 1 között lüktetve ott maradt minden kép fölött, és elmosta őket.

Ez a hiba némán jelentkezik. A kép betöltődik, a hálózati panel zöld, a DOM-ban
ott a helyes `src` — csak épp nem látszik. Így derült ki: a blogkártyák
borítói egyforma szürke foltnak látszottak, pedig öt különböző illusztráció
volt bennük.

Javítva: betöltés után a `skeleton` osztály **lekerül** az elemről, nem csak
átlátszóvá válik.

### 2.7 A nyitó függöny vízszintes túlcsordulást okozott

A függöny sávjai szélesebbek a nézetnél. A `<html>` `overflow-x: clip`
beállítása viszont **nem terjed ki a `position: fixed` elemekre**, tehát a
függöny 487 pixelre nyújtotta a dokumentumot egy 360 pixeles nézeten.

Javítva: a vágás a függönyre került, ahol a sávok élnek.

### 2.8 A hosszú magyar szavak kilógtak a nagy címsorokból

Fix 48 pixeles `h2`-n a „keresőoptimalizálásról” 467 pixel széles — egy 360
pixeles nézeten ez menthetetlen, mert **egy szó nem tud elférni**, és semmilyen
sortörés nem javítja.

Javítva két rétegben: a nagy fokozatok `clamp`-pel folyékonyak lettek, és
minden címsor `hyphens: auto` + `overflow-wrap: break-word` (a `lang="hu"`
miatt a böngésző helyesen választ el).

### 2.9 Hidratálási eltérés a mozgásindító szkript miatt

A festés előtt futó szkript adat-attribútumot tesz a `<html>`-re, tehát a
kiszolgált és a hidratáláskor talált markup szükségszerűen eltér. A React ezt
hibaként jelezte. A `suppressHydrationWarning` **csak a `<html>` elemen** van
bekapcsolva, a fa többi részén nem — a valódi eltéréseket továbbra is jelzi.

---

### 2.10 A build a _régi_ JSON tartalmat sütötte a statikus oldalakba

A tárolót `unstable_cache` gyorsítja, az pedig a `.next/cache` mappába ír, ami
két build között megmarad. A JSON fájl viszont a Next tudta nélkül változik —
egy új build tehát a régi tartalmat vette elő.

Ez **némán** történt: a build sikeres volt, az oldal hiánytalan, csak épp
elavult. Két helyen csapott le: a blogborítók képei üresen jöttek vissza (a
kártyák tetején tömör sötét téglalap maradt), és a csapat szekció akkor sem
jelent meg, amikor volt benne adat.

Javítás: a gyorsítótár-kulcs része lett a fájl ujjlenyomata (méret +
módosítási idő). Ha a fájl változott, a kulcs is más, tehát a régi bejegyzés nem
talál. Futásidőben a mutációk `revalidateTag`-je gondoskodik a frissítésről.

### 2.11 A blogborító hullámai a régi színtokenekre hivatkoztak

A kép nélküli borító rétegei `var(--tone-1…7)`-et használtak, ami a kék
paletta óta nem létezik. Minden réteg átlátszó lett, és csak a sötét alap
látszott — tömör téglalap a kártya tetején. A kék skála (`--wave-*`)
megfelelő lépcsőire cseréltem őket.

### 2.12 A hibahatár a régi paletta színeivel jelent meg

Az `app/error.tsx` szándékosan beágyazott stílussal dolgozik (ha a stíluslap a
hiba oka, arra nem lehet támaszkodni), de a beégetett hexák az agyag-szürke
palettából maradtak. A kék tokenek értékeire cseréltem őket — beágyazva, de
azonos színvilágban.

### 2.13 A nyitóképernyő szövege nem érte el a 4,5:1 kontrasztot

A mutatókövető hullámkompozíció élénk kékjei keskeny nézetben a szöveg alá
kerültek: a bevezető bekezdés 2,2:1-en állt. Három javítás:

- keskeny nézetben az élénk rétegek átlátszóbbak (`--swirl-damp`), és a mély
  alap üt át rajtuk;
- a kompozíció záró rétege teljes szélességben a legmélyebb kék;
- a sötét felületek bevezető bekezdései tiszta fehérek lettek.

A mérést a `scripts/contrast.mjs` végzi: két felvétel készül ugyanarról a
nézetről, egy normál és egy átlátszó szöveggel, és ahol a kettő eltér, ott van
betű — így a háttér mintavétele pontosan a betűtestre esik, nem a doboz üres
részére. Jelenleg mind a kilenc nyilvános oldal mindhárom töréspontban átmegy.

## 2/b. Az átdolgozás — mi változott az első változathoz képest

Az első változat visszajelzése az volt, hogy nem elég figyelemfelkeltő, a
hullámok nem adják át a referenciaképeket, a betűstílus nem tetszik, és
hiányoznak a régi képek. Mind a négy jogos volt. Amit átalakítottam:

**A hullámok.** Az első változat rétegei egymáshoz túl közeli tónusokból
álltak (`#1C1F27` és `#242833` — 8 fokozat különbség), és nem volt köztük
árnyék. Ebből egyetlen mosott sötét folt lett, nem rétegzett hullám. Most hét
lépcsős tónusskála van, nagy ugrásokkal, és minden réteg árnyékot vet a
következőre — ez a papírkivágás-hatás, amit a referenciaképek mutatnak. A
szekcióhatárok mindegyike ilyen sáv, és a hangsúlyuk váltakozik.

**A tipográfia.** A talpas display betű (Instrument Serif, 400-as súly, 68 px)
elegáns volt, de halk és távolságtartó. Helyette Outfit 700-as súllyal, 96
pixelig skálázva — a nyitóképernyő címsora most az oldal leghangosabb eleme.
A folyószöveg Plus Jakarta Sans, 17 pixelen.

**A szín.** Az agyag akcentust elhagytam. A paletta egyszínű lett: meleg krém
és meleg, majdnem fekete tinta. A referencia szürkeárnyalatos, és a hatását a
tónuskülönbség adja — egy akcentusszín ebben nem erősít, hanem elmossa a
rétegek közötti különbséget.

**A nyitó animáció.** Korábban egyetlen sötét lap húzódott fel. Most a
hullámsávok egyenként, a legvilágosabbtól a legsötétebbig — ugyanaz a forma,
ami az oldalon végigfut.

**A régi képek.** Az illusztrációk (`blog-seo`, `blog-speed`, `blog-build`,
`blog-ai`, `hosting-layers`, `app-modules`) visszakerültek,
szürkeárnyalatra hangolva és kinyújtott tónustartománnyal. Így a lila eltűnt, a
forma megmaradt, és a képek illeszkednek a palettához.

**A CEF keretrendszer.** A `.cef/` állapot most a projektben van
(`manifest.yaml`, `project.json`, `runtime.json`, `memory.md`), a valós
projektre hangolva: ügynökségi oldal, magyar nyelv, JWT admin, blog, Docker. A
`cef analyze`, `design`, `review` és `score` parancsok innen dolgoznak.

---

## 2/c. A kék átdolgozás — mi változott a szürke változathoz képest

A visszajelzés az volt, hogy a szürke téma helyett kék-fehér kell, a
szekcióhatárok másik színű szekcióba vezessenek, a nyitóképernyő hullámai
legyenek örvénylők és mutatókövetők, a szekcióhatárok görgetésre animáljanak, a
képek fehér háttérre kerüljenek, a szövegek kártyára, és legyen csapat szekció
az adminból szerkeszthetően. Amit átalakítottam:

**A paletta.** A meleg krém–tinta skála helyére kilenc lépcsős kék skála
került, a tiszta fehértől (`#FFFFFF`) a mély tengerkékig (`#082B52`). Négy
felület váltakozik — fehér, világoskék, kék, mély kék —, és a szekcióhatárok
mindig **másik** felületbe vezetnek át. A szöveg sem fekete: mély tengerkék
tinta, hogy a lap egyetlen színcsaládban maradjon.

**Három hullámforma egy helyett.** _(A `WaveField` és a `WaveSwirl` azóta
megszűnt — lásd a 2/d szakaszt.)_ A szekcióhatár (`WaveBand`) görgetésre
sodródik, a szekcióháttér (`WaveField`) lassan, alig érzékelhetően lélegzik, a
nyitóképernyő (`WaveSwirl`) pedig örvénylő, egymásba érő foltokból áll, és
követi a mutatót. A három más ütemben és más léptékben mozog, tehát nem
egyetlen effekt ismétlődik nyolcszor.

**Szöveg kártyán, kép fehéren.** A szolgáltatás aloldalak felsorolásai és
részletblokkjai kártyára kerültek, a bemutató képek fehér szekcióba. Így a
szöveg mindig nyugodt felületen ül, a kép széle pedig beleolvad a lapba.

**Az elrendezés kért javításai.** A főoldali „Négy dolog…” négy kártyája egymás
mellé került; a gyakori kérdések a cím alá, nem mellé; a láblécnek is lett
átvezető hullámsávja.

**Csapat szekció.** A „Rólunk” oldal kapott egy adminból szerkeszthető csapat
rovatot (`/admin/csapat`). Ha nincs egyetlen tag sem, a szekció nem jelenik
meg. A feltöltött portrék átlátszó hátterűek lesznek, ezért mindegyik alá
világoskék, hullámos felület kerül; fotó híján mély kék korongon monogram áll
be.

**Kis víz-effektusok.** A gombokon rámutatásra víz emelkedik (220 ms), a sötét
szekciókban buborékok szállnak fel, a nyitóképernyőn pedig egy görgető egér
ikon mutatja, hogy van még lejjebb.

**A betöltő animáció hosszabb lett.** A jel megjelenik, megáll egy ütemre, és a
sávok kaszkádja csak 700 ms után indul — így a függöny 1,9 másodpercig tart, és
a képeknek van idejük megérkezni.

---

## 2/d. A hullámmotor átírása

A visszajelzés az volt, hogy a nyitóképernyő hullámai ne egy síkon mozogjanak,
hanem több irányból érkezzenek és becsavarodjanak, mint a referenciaképeken;
töltsék ki a teljes felületet; az aloldalak fejlécei ugyanezt a hátteret
használják egységes magassággal; és a szekcióhatárok logikájához **ne** nyúljak
hozzá. Menet közben derült ki a többi: a görgetésanimáció akadt, a hullámok
elhelyezkedése nem stimmelt, és minden taréj ugyanaz a félhold volt.

**A geometria.** Minden taréj koncentrikus, elliptikus ívsávokból áll
(`lib/wave-curl.ts`), és a saját elforgatása adja, melyik irányból érkezik. Egy
vízszintes hullámvonal ezt nem tudja: akárhány rétegben rakjuk egymásra, mindig
egy iránya van.

**A szekcióhatár külön fájlba került.** A `components/wave/section-divider.tsx`
a határ teljes kódja: komponens, formák, osztálynevek (`divider-*`) és
kulcskockák. Korábban közös rétegkomponensen és közös CSS-osztályokon osztozott
a hullámmotorral — és amikor a hero átírásakor a közös kód is változott, az
összes addig működő szekcióhatár egyszerre romlott el. A szétválasztás azóta
megakadályozza, hogy ez megismétlődjön.

### 2/d.1 A kompozíció háromszor volt rossz, három különböző okból

1. **Kézzel elhelyezett taréjok** → a jobb oldal zsúfolt lett, a bal fele üres.
2. **Rácsra rendezett taréjok** → egyenletes lett, de a kereten belüli
   középpontok miatt a sávok _vége_ a kép közepére esett: tompán elvágott
   félhullámok a képernyő közepén.
3. **Kereten kívüli középpont, nagy sugár** → a végek kikerültek, de az ívek
   ellaposodtak, és a felület négy sarokból induló csíkra esett szét.

A megoldás mindháromból tanult: a **nagy** ívek középpontja a kereten kívül van
(a végük így nem látszik), az **apró** tarajoké a kereten belül, erős
hegyesedéssel (a hegyben elfogyó vég hullám, a tompa vég hiba), és a méretek
váltakoznak — egyméretű hullámokból minta lesz, nem víz.

### 2/d.2 Minden taréj ugyanaz a félhold volt

Az összes taréj ugyanazt a szögtartományt használta, tehát az elforgatás és a
méret volt köztük az egyetlen különbség. Négy paraméter került be: az ív hossza,
a **becsavarodás** (a belső sávok középpontja a csúcs felé csúszik, így a
gyűrűk egyik oldalon összetorlódnak, a másikon szétnyílnak), a belső sávok
rövidülése, és a rövidülés elosztása a két vég között. Ettől lett harminc
különböző hullám egy alakzat harminc példánya helyett.

### 2/d.3 A taréj közepe eltűnt a háttérben

A legvilágosabb tónushármas belső sávja pont `wave-2` volt — a nyitóképernyő
saját felülete. Az a sáv nem látszott, és a taréj kilyukasztottnak tűnt. Azóta
egyik tónus sem lehet a felület színe.

### 2/d.4 A rétegsorrend a felsorolás sorrendje volt

Világos sarlók feküdtek rá sötét tömegekre, és a kép lapos matricákra esett
szét. A rajzolási sorrend most a tónus mélysége: a közelebbi, sötétebb hullám
takarja a távolabbit.

### 2/d.5 A görgetésre forgó taréjok akadtak

Harminc SVG-csoport forgott egyszerre görgetésre, mindegyiket `will-change`
saját rétegre emelte — ez minden görgetési képkockán
újrarajzoltatta a teljes felületet. A forgás kikerült; a felület a mutatótól él,
a görgetés a szekcióhatárok dolga. Ezzel együtt kikerült harminc réteg, hatvan
beágyazott CSS-változó, és a vonaltulajdonságok a sávokról a csoportra
költöztek (öröklődnek, tehát sávonként háromszor szerepeltek fölöslegesen).

### 2/d.6 A vízszintes vonal a hero zárósora fölött

A zárósor felső szegélye mobilon kicsúszott a vízvonal fölé, és egy vízszintes
karcként ült a világos hullámokon. A szegély azóta csak `sm`-től van meg — ahol
a sor egy sorba fér, tehát biztosan a mély kéken belül marad.

### 2/d.7 A 404 oldal alatt fehér sáv maradt

Rövid tartalomnál a lábléc alatt üres fehér rész maradt. A lap most
`min-h-svh` magas oszlop, és a törzs nyúlik ki — a lábléc mindig a képernyő
alján ér véget.

## 3. Amit szándékosan másképp csináltam

### 3.1 Az admin csak blogot kezel — az árakat és a cégadatokat nem

A feladat két dolgot kért: a jogi adatok a `.env`-ből jöjjenek, és legyen egy
JWT-s admin a blogolásra. A korábbi rendszerben a cégadatok **két helyről** is
szerkeszthetők voltak (`.env` és admin), ahol az admin felülírta a `.env`-et.

Ezt megszüntettem. A cégadatok kizárólag a `.env`-ben élnek. Ha két helyen
lehetne szerkeszteni őket, előbb-utóbb előállna az az állapot, hogy az
impresszum és az ÁSZF más adószámot mutat, és senki nem tudná, melyik az igazi —
ráadásul a `.env` átírása látszólag „nem csinálna semmit”.

Ugyanezért kerültek az árak a kódba (`lib/content/pricing.ts`) és nem az adminba:
tartalmi döntések, a szolgáltatás-szövegek mellett a helyük.

Az admin így két dolgot tud: **bejegyzéseket kezelni** (írás, borítókép
feltöltése, publikálás, törlés) és **a beérkezett megkereséseket megnézni**.

### 3.2 A hullámvonal (kis elválasztó) SVG, nem CSS-forma

A kérés az volt, hogy a hullámok CSS-ből készüljenek. A **nagy háttérhullámok**
mind CSS-ből vannak: `border-radius`-szal formázott tömör felületek, kizárólag
`transform`-mal animálva.

A kártyacímek alatti apró hullámvonal viszont egy két pixel vastag **vonal**.
CSS-ből ezt csak úgy lehetne, hogy egy második, háttérszínű formával takarjuk ki
a kitöltés nagy részét — ami minden háttéren külön hangolást igényelne, és
kártyán, világos és sötét szekcióban is máshogy törne el. Ott ezért egy SVG
útvonal áll, ugyanabból a görbéből, amiből a logó jele. Ez a **kivétel**, nem a
szabály.

### 3.3 A bemutató képek illusztrációk, nem ügyfélmunkák

Ez a régi oldalon is így volt, és megtartottam: a szekció felvezetője kiírja,
hogy ezek bemutató felületek. Kitalált referenciát nem tettem az oldalra.

### 3.4 A blogborítók valódi képek, a hullámborító csak tartalék

A bejegyzések a korábbi oldal illusztrációit kapták vissza, szürkeárnyalatban.
Kép nélküli bejegyzésnél a hullámborító veszi át a helyét — az oldal saját
formanyelve, nulla bájt képadat —, és az adminban bármikor tölthető fel valódi
kép helyette.

---

## 4. Amihez adat vagy döntés kell tőled

Ezek nem hibák, hanem hiányzó bemenetek. Amíg nincsenek kitöltve, az oldal
`[szögletes zárójeles]` helyőrzőt mutat — szándékosan feltűnően, hogy ne
lehessen véletlenül így élesíteni.

1. **Cégadatok a `.env`-ben.** Cégnév, székhely, adószám, cégjegyzékszám,
   képviselő, bankszámla, tárhelyszolgáltató, felügyeleti szerv, békéltető
   testület. Lásd `.env.example`, 3. blokk.
2. **Jogi határidők a `.env`-ben.** Felmondási idő, a megkeresések és a
   szervernaplók őrzési ideje, a dokumentumok hatálybalépése. Ezek jogi
   döntések, ezért nincs hozzájuk alapértelmezés.
3. **A jogi szövegek átnézetése.** Az ÁSZF és az adatkezelési tájékoztató
   minta-szöveg, és ezt a dokumentum eleje ki is írja. Közzététel előtt jogi
   szakemberrel kell ellenőriztetni.
4. **Valódi telefonszám és e-mail cím.** Jelenleg a `+36 30 000 0000` helyőrző
   szám van a `.env`-ben.
5. **Admin jelszó.** A fejlesztői `.env`-ben egy ideiglenes jelszó hash-e van;
   éles környezetben `npm run gen:secret` és `npm run gen:password` kell.
6. **Valós ügyfélmunkák**, ha lesznek publikálhatók. A bemutató felületek helyére
   esettanulmányok kerülhetnek — a tartalmi szerkezet (`showcase`) készen áll rá.

---

## 5. Mérési eredmények az új oldalon

Produkciós buildből, 4× lassított CPU-val és 10 Mbit/s hálózaton mérve
(Chromium, 1440×900):

| Oldal                               | TTFB | FCP    | LCP     | Átvitel |
| ----------------------------------- | ---- | ------ | ------- | ------- |
| `/`                                 | 5 ms | 576 ms | 1212 ms | 509 kB  |
| `/szolgaltatasok/weboldal-keszites` | 6 ms | 520 ms | 520 ms  | 490 kB  |
| `/blog`                             | 4 ms | 540 ms | 908 ms  | 505 kB  |

Az átvitel a `transferSize` összege, tehát a betűtípusokkal és a képekkel együtt
értendő. A főoldal LCP-je azért magasabb a többinél, mert ott a nyitó függöny is
fut.

Görgetés közben, ugyanezen a 4× lassított CPU-n, futó hullámanimációkkal:
**medián 16,7 ms, 95. percentilis 16,8 ms, leglassabb 16,8 ms** — vagyis
egyetlen kiesett képkocka sincs. Ez a nyitóképernyő görgetésre forgó taréjainak
eltávolítása után mérve; addig harminc, saját rétegre emelt SVG-csoport
rajzolódott újra minden képkockán, és a görgetés érezhetően akadt.

Kiinduló JavaScript az egész oldalra: 103 kB megosztva, oldalanként +0,2–3,7 kB.
