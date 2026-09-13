# A jogi adatok kitöltése

Ez a leírás végigmegy a `.env` minden jogi és cégadat mezőjén: mi az, **hol
jelenik meg** az oldalon, mit írj bele, és honnan szedd a valódi értéket.

**Miért fontos pontosan kitölteni.** Ez a fájl a jogi adatok egyetlen forrása.
Ami ide kerül, az jelenik meg az impresszumban, az ÁSZF-ben, az adatkezelési és
a cookie tájékoztatóban, a láblécben, a kapcsolat oldalon és a keresőknek
küldött strukturált adatban. Nincs mögötte admin felület — szándékosan, mert két
szerkesztési hely két egymásnak ellentmondó impresszumot jelentene.

**Ami üresen marad, az `[szögletes zárójelben]` jelenik meg a kész oldalon.**
Nem tűnik el, nem lesz üres sor: kiírjuk, hogy hiányzik. Élesítés előtt nyisd
meg mind a négy jogi oldalt, és nézd végig, maradt-e benne szögletes zárójel.

**A `.env` módosítása után elég a konténert újraindítani.** A nyilvános oldalak
kérésre renderelődnek, tehát a cég- és jogi adatokat mindig a futó konténer
környezetéből olvassák — újrabuildelni nem kell.

> Ez korábban nem így volt, és emiatt **a jogi oldalakon semmilyen `.env`
> módosítás nem látszott**. Az oldalak build időben renderelődtek, a `.env`
> viszont szándékosan nincs benne a Docker build kontextusában — így a
> helyőrzők égtek bele a kész HTML-be. Lásd `HIBAJELENTES.md` 2/g.1.

> Ez a leírás a mezők **kitöltésében** segít, nem jogi tanácsadás. A jogi
> dokumentumok szövege minta; élesítés előtt nézesse át jogi szakemberrel.

---

## 1. Elérhetőség

Ezek nem „csak" kapcsolati adatok: az impresszumban kötelező elemek.

### `NEXT_PUBLIC_CONTACT_EMAIL`

**Hol jelenik meg:** lábléc, kapcsolat oldal, impresszum, és ide érkeznek az
adatkezeléssel kapcsolatos kérelmek (adatkezelési tájékoztató 6. pont), valamint
a panaszok (ÁSZF 9. pont).

```
NEXT_PUBLIC_CONTACT_EMAIL=hello@klivo.hu
```

Olyan címet adj meg, amit **tényleg olvasol**: a GDPR szerint az érintetti
kérelmet egy hónapon belül meg kell válaszolni, és a tájékoztató ezt ki is írja.

### `NEXT_PUBLIC_CONTACT_PHONE`

**Hol jelenik meg:** lábléc, kapcsolat oldal, impresszum. A hívható `tel:` link
automatikusan képződik belőle — a szóközöket és kötőjeleket kiszedi, a `+`-t
megtartja, tehát nyugodtan írd emberi formában.

```
NEXT_PUBLIC_CONTACT_PHONE=+36 30 123 4567
```

### `CONTACT_AREA_SERVED`, `CONTACT_HOURS`, `CONTACT_RESPONSE_TIME`

Nem jogi mezők, de a kapcsolat oldal és a strukturált adat használja őket.

```
CONTACT_AREA_SERVED=Magyarország
CONTACT_HOURS=Hétköznap 9:00 és 17:00 között
CONTACT_RESPONSE_TIME=Egy munkanapon belül válaszolunk.
```

A válaszidő **ígéret** — olyat írj, amit tartani tudsz.

---

## 2. Cégadatok

### `COMPANY_LEGAL_NAME`

**Hol jelenik meg:** az impresszum első sora, az ÁSZF 1. pontja („a
továbbiakban: Szolgáltató"), és a lábléc szerzői jogi sora.

A **teljes, hivatalos** név, pontosan úgy, ahogy a cégkivonatban vagy az egyéni
vállalkozói nyilvántartásban szerepel — a társasági formával együtt.

```
# Cégként:
COMPANY_LEGAL_NAME=Klivo Kft.

# Egyéni vállalkozóként:
COMPANY_LEGAL_NAME=Kovács Máté egyéni vállalkozó
```

Ne a márkanevet írd ide, ha az eltér a jogi névtől. A márkanév a `site.name`
(`lib/content/site.ts`), az külön van.

### `COMPANY_POSTCODE`, `COMPANY_CITY`, `COMPANY_STREET`

**Hol jelenik meg:** impresszum, ÁSZF 1. pont.

A **székhely**, nem a levelezési cím és nem az, ahol dolgozol — az az adat,
ami a cégkivonatban / EV-nyilvántartásban áll.

**Három külön mező**, mert az oldalon is három külön helyőrző jelenik meg
helyettük. Egyetlen `COMPANY_SEAT` állt itt korábban, és abból a kitöltetlen
oldalon ez lett: `[irányítószám] [település], [utca, házszám]` — három zárójel
egyetlen sor mögött, és nem derült ki, melyiket hova kell írni.

```
COMPANY_POSTCODE=1094
COMPANY_CITY=Budapest
COMPANY_STREET=Példa utca 12. 3. em. 4.
```

A megjelenő cím ebből áll össze: **1094 Budapest, Példa utca 12. 3. em. 4.** A
strukturált adatba is külön mezőként kerülnek (`postalCode`,
`addressLocality`, `streetAddress`), nem egyetlen sztringként — a kereső így
ki tudja olvasni belőle a várost.

Ha székhelyszolgáltatót használsz, a székhelyszolgáltató címét kell megadni —
az a bejegyzett székhely.

### `COMPANY_TAX_NUMBER`

**Hol jelenik meg:** impresszum, ÁSZF 1. pont.

A magyar adószám 8-1-2 tagolású. Egyéni vállalkozónak is van ilyen.

```
COMPANY_TAX_NUMBER=12345678-2-42
```

A **közösségi adószám** (`HU12345678`) nem ide jön — az a számlázáshoz kell, az
impresszumban nem kötelező.

### `COMPANY_REGISTRATION_NUMBER`

**Hol jelenik meg:** impresszum („Nyilvántartási szám" címke alatt).

Cégnél a **cégjegyzékszám**, egyéni vállalkozónál a **nyilvántartási szám**.

```
# Kft., Bt., Zrt. — cégjegyzékszám, 2-2-6 tagolással:
COMPANY_REGISTRATION_NUMBER=01-09-123456

# Egyéni vállalkozó — nyilvántartási szám:
COMPANY_REGISTRATION_NUMBER=51234567
```

Cégnél a „Nyilvántartási szám" címke helyett a „Cégjegyzékszám" lenne a pontosabb
szó; ha zavar, a `lib/legal.ts`-ben egy sor átírása.

### `COMPANY_REPRESENTATIVE`

**Hol jelenik meg:** impresszum.

Cégnél az ügyvezető (vagy aki a cégjegyzésre jogosult), egyéni vállalkozónál a
saját neved. Nyugodtan írd oda a tisztséget is.

```
COMPANY_REPRESENTATIVE=Kovács Máté ügyvezető
```

### `COMPANY_BANK`

**Hol jelenik meg:** impresszum, „Bankszámla" sorban.

A számlavezető bank neve és a számlaszám.

```
COMPANY_BANK=OTP Bank Nyrt. — 11111111-22222222-33333333
```

A bankszámlaszám **nyilvános kiírása nem kötelező**. Ha nem akarod közzétenni,
írd ide csak a bank nevét (`OTP Bank Nyrt.`) — a mező akkor sem marad helyőrzős,
és a számlaszám úgyis rajta lesz a kiállított számlán.

---

## 3. Tárhelyszolgáltató — a te eseted

### `COMPANY_HOSTING_PROVIDER`

**Hol jelenik meg:** két helyen, és mindkettő kötelező.

1. **Impresszum, „Tárhelyszolgáltató" szakasz.** Az elektronikus kereskedelmi
   törvény (2001. évi CVIII. tv.) írja elő, hogy a tárhelyszolgáltatót meg kell
   nevezni.
2. **Adatkezelési tájékoztató 4. pont**, adatfeldolgozóként: „Adatfeldolgozóként
   a tárhelyszolgáltató jár el: …". A GDPR szerint az adatfeldolgozókat meg kell
   nevezni, mert ők is hozzáférhetnek a személyes adatokhoz.

**Kit kell megnevezni a te felállásodban?** A saját Docker-alapú hosting
rendszered **nem** külön szereplő: az a te szoftvered, a te bérelt gépeden. Ami
számít, az az, hogy **fizikailag kinek a szerverén van az adat** — a VPS-t
üzemeltető szolgáltató. Nálad ez a Rackhost.

```
COMPANY_HOSTING_PROVIDER=Rackhost Zrt., 6722 Szeged, Tisza Lajos körút 41., info@rackhost.hu, +36 1 445 1200
```

> **Ellenőrizd a saját szerződéseden vagy számládon.** Ezt az adatot a Rackhost
> ÁSZF-jéből vettem (cégjegyzékszám: 06-10-000489, adószám: 25333572-2-06), de
> a cégadatok változhatnak, és az a hiteles, ami a te szerződéseden áll. Ha
> viszonteladón keresztül bérled a gépet, vagy a VPS más adatközpontban van,
> értelemszerűen az igazodjon.

**Amit nem kell ide írni:** a saját Docker-rendszeredet, a konténerek neveit, a
CI-t vagy bármit, ami a te üzemeltetésed belügye. A látogatót az érdekli, kinek
a vasán van az adata.

**Egy dolog, amivel érdemes tisztában lenni.** Ha ugyanezen a VPS-en **ügyfelek
oldalait is** futtatod, akkor **feléjük te vagy a tárhelyszolgáltató** — az ő
impresszumukba a te cégadataid kerülnek, és feléjük te vagy az adatfeldolgozó.
Ez a mező nem arról szól: ez a saját oldalad saját impresszuma. De ha ilyen
szolgáltatást adsz, arra külön adatfeldolgozói szerződés kell az ügyfeleiddel.

---

## 4. Hatóságok

Mindkettő **a székhelyed szerint illetékes** szerv — nem egy általános cím.

### `COMPANY_SUPERVISORY_AUTHORITY`

**Hol jelenik meg:** impresszum, „Felügyeleti szerv" szakasz.

Fogyasztóvédelmi ügyekben a székhely szerinti **megyei/fővárosi kormányhivatal**
fogyasztóvédelmi szervezeti egysége.

```
# Budapesti székhellyel:
COMPANY_SUPERVISORY_AUTHORITY=Budapest Főváros Kormányhivatala, Fogyasztóvédelmi Főosztály, 1051 Budapest, Sas utca 19. III. em.
```

A saját megyédhez tartozót a kormanyhivatalok.hu oldalon találod meg. Ha a
tevékenységedhez külön engedélyező hatóság is tartozik, azt is fel lehet
sorolni — webfejlesztésnél jellemzően nincs ilyen.

Az **adatvédelmi** hatóság (NAIH) nem ide jön: az már benne van az adatkezelési
tájékoztató 7. pontjában, fixen.

### `COMPANY_DISPUTE_RESOLUTION`

**Hol jelenik meg:** ÁSZF 9. pont — „Fogyasztói jogvita esetén a Megrendelő
békéltető testülethez fordulhat: …".

A székhely szerint illetékes **békéltető testület** neve és elérhetősége.

```
# Budapesti székhellyel:
COMPANY_DISPUTE_RESOLUTION=Budapesti Békéltető Testület, 1016 Budapest, Krisztina krt. 99., bekelteto.testulet@bkik.hu
```

A testületek a területi kereskedelmi és iparkamarák mellett működnek, tehát a
saját megyei kamarád oldalán találod meg az illetékeset.

Megjegyzés: a békéltető testület **fogyasztói** jogvitákra való. Ha kizárólag
cégeknek dolgozol, ez a pont a gyakorlatban nem fog előjönni — de a mondat
attól még helyes, és a szöveg is így fogalmaz.

---

## 5. Határidők a szerződésben és az adatkezelésben

Ezek **jogi döntések**, ezért nincs hozzájuk alapértelmezés. Az alábbi értékek
szokásosak, de neked kell eldöntened (és jogásszal átnézetned).

Mindegyiknél figyelj a **ragozásra**: az érték beleolvad egy mondatba, tehát
abban a formában kell megadni, ahogy a mondatban helyes.

### `COMPANY_NOTICE_PERIOD`

A mondat: „…bármelyik fél felmondhatja a másik félhez intézett írásos
nyilatkozattal, **{ide kerül}** felmondási idővel."

```
COMPANY_NOTICE_PERIOD=30 napos
```

Melléknévi alak kell (`30 napos`, `15 napos`, `kéthónapos`) — nem `30 nap`.

### `COMPANY_LEAD_RETENTION`

Meddig őrzöd a kapcsolati űrlapon érkezett megkereséseket. A mondat: „A
megkereséseket a megválaszolást követő **{ide kerül}**, szerződéskötés esetén a
szerződéses jogviszonyból eredő igények elévüléséig őrizzük."

```
COMPANY_LEAD_RETENTION=12 hónapig
```

`-ig` raggal kell, mert a mondat nem teszi hozzá. Az adatminimalizálás elve
szerint ne írj ide indokolatlanul hosszú időt: ami nem kell, azt ne őrizd.

### `COMPANY_LOG_RETENTION`

Meddig őrzöd a szerverek technikai naplóit (IP-cím, időbélyeg, kért útvonal).
A mondat: „A szerverek technikai naplóit legfeljebb **{ide kerül}** tároljuk."

```
COMPANY_LOG_RETENTION=30 napig
```

Szintén `-ig` raggal. **Ellenőrizd, hogy igaz-e**: ha a saját Docker-rendszered
vagy a VPS naplórotációja ennél tovább tart meg naplókat, akkor vagy a beállítást
igazítsd a vállaláshoz, vagy a vállalást a beállításhoz. Ez az a sor, amit a
legkönnyebb véletlenül valótlanná tenni.

### `COMPANY_EFFECTIVE_DATE`

**Hol jelenik meg:** mind a négy jogi dokumentum alján („Hatályos: …").

```
COMPANY_EFFECTIVE_DATE=2026. szeptember 15.
```

Szabad szöveg, tehát magyar dátumformátumban írd. Ha később érdemben módosítod a
dokumentumokat, ezt is frissítsd — a dátum arról tájékoztat, melyik változat van
érvényben.

---

## 6. Kitöltött minta — egyéni vállalkozóként, Rackhost VPS-en

Csak a jogi blokk; a többi mezőt lásd a `.env.example`-ben.

```dotenv
NEXT_PUBLIC_CONTACT_EMAIL=hello@klivo.hu
NEXT_PUBLIC_CONTACT_PHONE=+36 30 123 4567
CONTACT_AREA_SERVED=Magyarország
CONTACT_HOURS=Hétköznap 9:00 és 17:00 között
CONTACT_RESPONSE_TIME=Egy munkanapon belül válaszolunk.

COMPANY_LEGAL_NAME=Kovács Máté egyéni vállalkozó
COMPANY_POSTCODE=1094
COMPANY_CITY=Budapest
COMPANY_STREET=Példa utca 12. 3. em. 4.
COMPANY_TAX_NUMBER=12345678-1-42
COMPANY_REGISTRATION_NUMBER=51234567
COMPANY_REPRESENTATIVE=Kovács Máté
COMPANY_BANK=OTP Bank Nyrt. — 11111111-22222222-33333333
COMPANY_HOSTING_PROVIDER=Rackhost Zrt., 6722 Szeged, Tisza Lajos körút 41., info@rackhost.hu, +36 1 445 1200
COMPANY_SUPERVISORY_AUTHORITY=Budapest Főváros Kormányhivatala, Fogyasztóvédelmi Főosztály, 1051 Budapest, Sas utca 19. III. em.
COMPANY_DISPUTE_RESOLUTION=Budapesti Békéltető Testület, 1016 Budapest, Krisztina krt. 99., bekelteto.testulet@bkik.hu

COMPANY_NOTICE_PERIOD=30 napos
COMPANY_LEAD_RETENTION=12 hónapig
COMPANY_LOG_RETENTION=30 napig
COMPANY_EFFECTIVE_DATE=2026. szeptember 15.
```

---

## 7. Ellenőrzés élesítés előtt

1. Indítsd újra a konténert. **Újrabuildelni nem kell**: a nyilvános oldalak
   kérésre renderelődnek, tehát a cégadatokat mindig a futó konténer
   környezetéből olvassák.
2. Nyisd meg mind a négy jogi oldalt, és keress szögletes zárójelet:
   - `/jogi/impresszum`
   - `/jogi/aszf`
   - `/jogi/adatkezelesi-tajekoztato`
   - `/jogi/cookie-tajekoztato`
3. Olvasd el **hangosan** azt a három mondatot, amibe ragozott érték kerül
   (felmondási idő, két őrzési idő). Ha döcög, a ragon múlik.
4. Nézd meg a láblécet: ott a cégnév és a hatályossági év jelenik meg.
5. Ellenőrizd, hogy amit a naplók őrzéséről írsz, az a valóságban is így van.

Amíg a jogi szövegeket nem nézette át szakember, a dokumentumok **minta-szövegek**
— a szerkezetük helyes, de a tartalmi felelősség a tiéd.
