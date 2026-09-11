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
- a világoskék szekciók saját, sarokba zúduló sávja (`SkyBand`),
- a nyitóképernyő és az aloldalak fejlécének hullámmezője (`WaveCurls`),
- a blogbejegyzések borítója, ha nincs képe,
- a csapattagok portréja mögötti felület,
- a nyitó animáció,
- a kártyacímek alatti apró elválasztó (`WaveRule`),
- és a márkajel maga.

Nyolc helyen, nyolc léptékben ugyanaz a forma. Ettől érzi az ember egyetlen
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

| Token      | Érték     |                    |
| ---------- | --------- | ------------------ |
| `--wave-1` | `#FFFFFF` | tiszta fehér       |
| `--wave-2` | `#F0F9FF` |                    |
| `--wave-3` | `#DBEEFC` | világoskék felület |
| `--wave-4` | `#B7DBF7` |                    |
| `--wave-5` | `#7DC3F0` |                    |
| `--wave-6` | `#4FA9E3` |                    |
| `--wave-7` | `#2585CE` |                    |
| `--wave-8` | `#1667AE` |                    |
| `--wave-9` | `#0D4F8F` | a legmélyebb kék   |

### A négy szekciófelület

Az oldal négy felületen váltakozik, és a szekcióhatárok mindig **másik** színbe
vezetnek át:

| Név     | Token     | Skálapont |
| ------- | --------- | --------- |
| `white` | `--white` | `wave-1`  |
| `sky`   | `--sky`   | `wave-3`  |
| `blue`  | `--blue`  | `wave-9`  |
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

Egymásra torlódó **hullámtestek**. Minden hullám egy tömör sziluett: hullámos
felső él, alatta tömör test, ami a következő hullámig tart. A felület úgy épül
fel, ahogy egy papírkivágás — hátulról előre, mindegyik réteg eltakarja az alatta
lévő test alsó részét.

**Egy hullám két testből áll.** Előbb a világos _perem_ kerül fel, utána egy
hajszálnyival lejjebb a sötét _test_; a test eltakarja a perem nagy részét, és
csak egy szalag marad belőle a gerinc mentén. Ez a referenciakép szerkezete:
sötét víztömegek, mindegyik tetején egy megvilágított taraj. Egyetlen testtel ez
nem áll elő, csak nagy, lapos színfoltok. A test hulláma egy hajszálnyival
**laposabb** (`swell`), ezért a taraj a hullámhegyeken kiszélesedik, a
völgyekben elvékonyodik.

**A felület mély kék.** A hullámok között nincs fehér: minden kitöltés a kék
skáláról jön, fehér csak a kontúr. Ezért lehet a nyitóképernyő szövege fehér, és
ezért emelkedik ki belőle a világos gomb.

**A felső mezőben csak a skála sötét vége szerepel — a peremben is.** Fehér
szöveg a `wave-8`-on 5,8:1, a `wave-9`-en 8,3:1; a `wave-7` 3,9:1, ami a nagy
címsornak elég, a bekezdésnek nem. A tarajok fönt ezért nem világos szalagok,
hanem egy fokozatnyi elmozdulások a mély kékek között — a rétegzést ott a
**fehér kontúr** viszi, nem a tónuskülönbség.

**A rajzterület 68 százaléka alatt nyílik ki a skála.** Ez a határ nem
esztétikai: mobilon a nyitóképernyő két gombja a 70 százalékig ér le, és a
másodlagos gomb átlátszó, fehér kerettel. Alatta már nincs se szöveg, se
áttetsző felület — onnan jönnek a referencia világos tarajai és a becsavarodó
örvények (`lib/wave-curl.ts`).

**A hullámhegy meredeksége arány, nem méret.** A kompozíció a magasság és a fél
hullámhossz _arányát_ adja meg (`steep`), és a tényleges kitérés ebből
számolódik. A rajz függőleges nyújtása tizennégyszeres is lehet: ha a magasságot
közvetlenül írnánk be, abból hegyes sátor lenne a lágy ív helyett.

**A gerinc a rajzterületen kívül kezdődik és végződik.** A kitöltés és a fehér
kontúr egy útvonalon van — a kitöltött alakzat oldalsó és alsó élei mind a
képen kívülre esnek, tehát a körvonalból csak a gerinc látszik, és nem kell
külön vonal-útvonal. Cserébe a hívónak biztosítania kell, hogy tényleg kívül
essenek: a vízszintes nyújtás **összenyomja** a beépített túllógást, és a záróél
egy a semmiben végződő fehér vonalként jelenik meg a hullámok fölött.

**A nézetdoboz fekvő, a skálázás `slice`.** A hullámtestek vízszintesen futnak,
és így se álló, se fekvő nézetben nem nyúlnak meg. Az aloldalak fejléce ugyanez
a mező, a rajzterület tetejéhez igazítva (`align="top"`): a széles, alacsony
doboz csak a felső kétharmadot mutatja, tehát pontosan a sötét mezőt — a szöveg
olvashatósága nem múlhat a doboz arányán.

**Követi a mutatót, de görgetésre nem mozog.** A mező **három**, egymásra
fektetett rétegből áll — három mélységi sík —, és a `MotionDriver` közvetlenül
ezek stílusába írja az eltolást, a `data-pull` attribútumokból. Ez
teljesítménykérdés, és a felület kétszer is elbukott rajta: hullámonkénti
eltolásnál az SVG-n belüli `transform` nem kerül külön compositor-rétegre, tehát
a teljes, képernyő méretű rajz újrarajzolódik; a mutató helyét hordozó
gyökér-CSS-változó pedig az **egész dokumentumra** újraszámoltatja a stílust,
képkockánként. Mindkettő akadó felületet és látható rajzolási hibákat adott —
üres fejlécsávot, eltűnő szövegsorokat, beragadt csempéket. A rétegre emelés
(`will-change`) csak finom mutató mögött aktív: érintőképernyőn nincs mit
követni. Görgetéshez kötött forgás is volt itt; az ugyanezen bukott el. A
görgetés a szekcióhatárok dolga.

**A vízvonal zárja le.** A felület alján tömör `wave-9` blokk, hullámos felső
éllel: a következő szekcióhatárnak egyszínű felülettel kell találkoznia, a mező
alja viszont tarka. A nyitóképernyőn ez a zárósor háttere is; a fejléceken nincs
zárósor, ott keskenyebb (`--slim`).

### `SkyBand` — a világoskék szekciók saját hullámsávja

A világoskék szekciók fölött nem a `WaveBand` áll, hanem egy **saját** sáv. Az
oka egyetlen mondat: a sarokmotívum és a szekcióhatár nem tud illeszkedni, ha
két külön rajz két külön koordinátarendszerben. A rétegek magassága nem eshet
egybe, és a találkozásuknál mindig marad egy törés vagy egy hézag — ezt négy
változaton át próbáltuk másképp.

Itt a sáv **és** a sarokfolt ugyanannak az egyetlen rajznak a része: a folt nem
odarakott alakzat, hanem az, hogy a sáv rétegei az egyik sarokban
**lezúdulnak**. Nincs mit illeszteni, mert nincs két dolog.

1. **A rétegek szalagok, nem alul kitöltött formák.** A `WaveBand` rétegei a
   gerincüktől lefelé tömörek, és egymásra festődnek. Itt minden réteg két határ
   közötti terület, a visszaút a felső határ megfordított Bézier-lánca. Kitöltött
   formákkal a sarokban mindig a legutoljára rajzolt réteg takarna el mindent;
   szalagokkal viszont egymásba ágyazódnak, ahogy a referencián.
2. **A lezúdulás és a hullám egyetlen függvény.** A határ mintapontokból épül —
   a nyugalmi magasság plusz a hullám plusz a sarok felé simán felfutó
   lezúdulás —, és a mintákon Catmull-Rom lánc fut át, ami az egész hosszon
   folytonos érintőt ad. Az első változat fél periódusonként külön Bézier-ívekből
   rakta össze a hullámot, és a csatlakozásoknál megtört az érintő: a sáv attól
   látszott szaggatottnak, hibásnak.
3. **Minden határ amplitúdója azonos, csak a fázisuk más.** Ez az egyetlen módja
   annak, hogy soha ne keresztezzék egymást: eltérő amplitúdóval két szomszédos
   határ valahol összeérne, a szalag ott nullára fogyna, a folytatásban pedig
   kifordulna. A nyugalmi magasságok különbsége mindig nagyobb, mint a kitérés
   kétszerese — ennyivel változhat két azonos amplitúdójú, eltérő fázisú hullám
   távolsága. A vastagság így is végig változik, csak épp nem tud elfogyni.
4. **A sáv mély.** Jóval mélyebb a sima szekcióhatárnál, és ez nem díszítés: a
   folt a sáv **magasságából** él. Sekély sávban a lezúdulás széles, lapos teknő
   lenne, mert a `preserveAspectRatio="none"` vízszintesen sokkal jobban nyújt,
   mint függőlegesen.
5. **A hullám nem ismétlődik.** Két egymásra rakott szinusz, nem egész számú
   frekvenciaaránnyal: egyetlen szinuszból gépi, ismétlődő minta lenne.
6. **A `flip` viszi a másik sarokba.** Egy lapon így nem ugyanott ismétlődik.
7. **A világoskék szekció mindkét oldalán ez a sáv áll**: fölötte lefelé zúdul,
   alatta (`rise`) fölfelé — a kettő közrefogja és megvezeti a szekciót. Az
   alsót nem a szekció rajzolja, hanem a **következő**, ugyanúgy, ahogy minden
   szekcióhatárt: ott a `from` értéke világoskék, és ebből tudja, hogy fordítva
   kell állnia. A szekciónak emiatt **nincs** függőleges térköze: a két mély sáv
   adja a levegőt, a szokásos szekció-térköz csak eltolná a hullámoktól a
   tartalmat.
8. **Görgetésre sodródik**, ugyanúgy, mint a szekcióhatárok, rétegenként más
   ütemben. A rajz mindkét oldalon **túlnyúlik** a nézetdobozon, tehát a
   sodródás nem enged rést a széleken.

A sáv blokk, mint a többi szekcióhatár: helyet foglal, nem lóg bele semmibe, és
nem kell hozzá z-index-trükk, hogy a folt a szöveg mögé kerüljön. Szöveget soha
nem takar, mert nincs is benne szöveg — így keskeny nézetben sem kell kikapcsolni.

A `components/wave/section-divider.tsx` érintetlen: a többi szekcióhatár
változatlanul azt használja.

### `WavePanel` — a portrék háttere

A csapattagok képe alatti kék felület. Ugyanazt a `lib/wave-ribbon.ts`
szalagmértant használja, mint a `SkyBand`: mintavételezett pontsor, Catmull-Rom
spline, és két határgörbe közötti valódi tartomány.

Korábban három, egymásra fektetett, alul kitöltött hullámréteg volt itt
(`WaveLayer`). A rétegek élei megtörtek ott, ahol a következő réteg alóluk
kifutott, és a portré teteje szaggatott, hullámpapírszerű lett. A szalagoknál ez
nem fordulhat elő: a határok **azonos amplitúdójúak**, csak fázisban térnek el,
tehát soha nem keresztezik egymást.

A tag sorszáma választja ki a tónusnégyest — a sor nem lesz egyhangú, de ugyanaz
a tag mindig ugyanúgy néz ki.

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

- **A nyitóképernyő és a fejlécek hullámai követik a mutatót.** Egyetlen
  `pointermove` figyelő van az egész oldalra (`MotionDriver`), amely
  képkockánként legfeljebb egyszer ír — **közvetlenül a három hullámréteg
  `style.transform`-jába**, a `data-pull` és `data-pull-y` attribútumok alapján.
  Nem a `<html>` CSS változóiba: egy gyökérszintű változó minden képkockán az
  egész dokumentum stílusait újraszámoltatta. Így az interaktivitás egyetlen
  bájt komponens-szintű JavaScriptbe sem kerül, és a hullámkomponensek szerver
  komponensek maradhatnak.
- **A kártyák rámutatásra megemelkednek**: négy pixel föl és egy százalék
  nagyítás (`.card-lift`), 200 ms alatt, `--ease-out` görbével. Minden kártya
  megkapja, nem csak a kattinthatók — az `interactive` jelző már csak az árnyékot
  erősíti. Rámutatásra és `focus-within`-re egyaránt: billentyűzettel is
  ugyanaz a visszajelzés.
- **A szekcióhatárok görgetésre sodródnak** (lásd `WaveBand`). A
  nyitóképernyő taréjai viszont **nem** — lásd `WaveCurls`.
- **A gombokon víz emelkedik** rámutatásra: egy hullámperemű réteg 220 ms alatt
  följebb ér. Csak `@media (hover: hover) and (pointer: fine)` mögött — érintésen
  a koppintás hamis hovert vált ki.
- **A görgetésjelző egér ikonjában a pont mozog** le-föl, 2200 ms-os ciklusban.

### A partnersáv

A nyitóképernyő alatt futó embléma-sáv, a tartalom mértékében (`Container`) —
nem teljes szélességben, mert akkor nem a laphoz tartozna, hanem alá lenne
csúsztatva.

**A sáv a nyitóképernyő zárósorát váltja ki.** Ahol van partner, ott a hero nem
írja ki a saját záró sorát (`Hero closing={false}`): két záró gesztus egymás
alatt kioltaná egymást, és a nyitókép a duplájára nyúlna. Emiatt a sávnak
felirata sincs — a logók magukért beszélnek, egy címke pedig épp azt a sort
hozná vissza, amit levettünk. A nyitóképernyő ilyenkor alacsonyabb, és a
hullámmezője a `top` igazítású változatra vált: alacsonyabb felületen a
`center` igazításból a **világos taréjok** is a felvezető bekezdés mögé
csúsznának, és fehér szöveg azokon 1,2:1. Ez nem elmélet — a kontrasztmérés
fogta meg.

**Korong nélkül.** A partnerlogók fehérben érkeznek, tehát a mély kéken magukban
is olvashatók; korongon a sáv kártyák sorává esne szét. A referencia kártyákon
más a helyzet: ott tetszőleges színű ügyféllogó jöhet, és ott a `LogoMark`
korongos változata fut.

**Csak akkor csúszik, ha van mit csúsztatni.** Hét embléma alatt a sor kifér,
tehát a mozgás öncélú lenne: ott állókép van, középre zárva, tördelve. A küszöb
fölött indul a végtelenített csúszás — két azonos sáv áll egymás után, és
mindkettő a **saját szélességével** tolódik el balra, tehát a ciklus végén a
második pontosan ott áll, ahol az első indult. Egyetlen sávval és egy
visszaugrással ugyanez minden körben megpattanna.

Tisztán `transform`, `linear` ütemben — folyamatos mozgásnak nincs kezdete és
vége, és minden gyorsulás azt sugallná, hogy történik valami. CSS animáció, nem
`requestAnimationFrame`: az betöltés közben képkockákat veszít, ez nem.

Rámutatásra és fókuszra megáll. Az előbbi azért, hogy egy nevet el lehessen
olvasni; az utóbbi azért, mert egy fókuszált logó különben kicsúszna a
képernyőről a fókuszgyűrűjével együtt.

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

**A hajlat alatti képek a nyitó függöny alatt töltődnek.** Amíg a függöny fut,
a hálózat üresen állna; az `ImageWarmup` ezt az időt tölti ki: tétlen időben
(`requestIdleCallback`) legfeljebb hat lusta képet előre letölt egy külön
`Image` példánnyal, a `sizes` és a `srcset` átmásolásával — enélkül a böngésző
más felbontást választana, és ugyanaz a kép kétszer utazna. Aki adatot spórol
(`saveData`) vagy 2G-n van, annak semmit nem töltünk előre.

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
