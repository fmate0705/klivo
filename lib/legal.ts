import { legalPages, site } from '@/lib/content/site';
import type { Organization } from '@/lib/organization';

/**
 * A jogi oldalak tartalma.
 *
 * **Ezek a szövegek minta-szövegek.** A tényleges közzététel előtt jogi
 * szakemberrel kell átnézetni őket. A cégadatokat (név, székhely, adószám,
 * tárhelyszolgáltató, hatálybalépés) NEM ez a fájl tartalmazza: azok az admin
 * „Cégadatok” lapjáról, illetve a `.env`-ből érkeznek, és paraméterként jönnek
 * be. Így egy adószám- vagy címváltozáshoz nem kell a kódhoz nyúlni, és nem
 * fordulhat elő, hogy az impresszum és az ÁSZF két különböző adatot mutat.
 *
 * A törzs Markdown, ugyanazzal a szűk nyelvtannal, amit a blog használ
 * (`lib/markdown.ts`), tehát a rendereléshez nincs külön kódút.
 */

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  body: string;
};

function impresszum({ contact, company }: Organization): string {
  return `
## Szolgáltató adatai

- **Név:** ${company.legalName}
- **Székhely:** ${company.seat}
- **Adószám:** ${company.taxNumber}
- **Nyilvántartási szám:** ${company.registrationNumber}
- **Képviselő:** ${company.representative}
- **E-mail:** ${contact.email}
- **Telefon:** ${contact.phone}
- **Bankszámla:** ${company.bank}

## Tárhelyszolgáltató

${company.hostingProvider}

## Felügyeleti szerv

${company.supervisoryAuthority}

## Az oldal célja

A ${site.url} weboldal a ${site.name} szolgáltatásait mutatja be: weboldal készítés,
egyedi webfejlesztés és AI-integrációk, valamint tárhely és üzemeltetés.

## Kapcsolatfelvétel

Kérdés, panasz vagy adatkezeléssel kapcsolatos megkeresés esetén a fenti e-mail
címen vagy telefonszámon érsz el minket. ${contact.responseTime}
`;
}

function aszf({ contact, company }: Organization): string {
  return `
## 1. A szolgáltató

${company.legalName} (székhely: ${company.seat}, adószám: ${company.taxNumber}),
a továbbiakban: Szolgáltató.

## 2. A szolgáltatások

A Szolgáltató az alábbi szolgáltatásokat nyújtja:

- weboldal készítés,
- egyedi webfejlesztés, webalkalmazások és AI-integrációk,
- tárhely és üzemeltetés (a Szolgáltató által készített és a máshol készült oldalakra egyaránt),
- az üzemeltetett oldalakon végzett módosítások, óradíjban.

## 3. Ajánlat és díjazás

A Szolgáltató minden megrendelés előtt írásos ajánlatot ad, amely tartalmazza a
vállalt tartalmat, a díjat és a határidőt. **Az elfogadott ajánlatban rögzített díj
a teljesítés során nem változik.** Ha a Megrendelő az ajánlatban nem szereplő új
igényt fogalmaz meg, arra a Szolgáltató külön ajánlatot ad, és a munkát csak a
Megrendelő írásos jóváhagyása után kezdi meg.

A tárhely és üzemeltetés havi díjas szolgáltatás. Az üzemeltetett oldalakon
végzett módosítások óradíját a felek a szerződéskötés előtt írásban rögzítik.

## 4. Teljesítés

A Szolgáltató a megrendelést követően elkészíti a weboldalt vagy alkalmazást, és
azt működő formában mutatja be a Megrendelőnek. A Megrendelő visszajelzései alapján
a Szolgáltató elvégzi a szükséges módosításokat. Az átadás az elfogadott változat
éles környezetbe helyezésével történik.

## 5. Tulajdonjog és forráskód

A domainnév a Megrendelő tulajdona, és a Megrendelő nevére szól. Az elkészült
weboldal, illetve alkalmazás a teljes vételár megfizetését követően a Megrendelő
tulajdonába kerül.

A Szolgáltató a forráskódot a Megrendelő kérésére bármikor átadja, továbbá
átadja a szerződés megszűnésekor is, ha a Megrendelő az üzemeltetést máshol
folytatja. A forráskód átadása nem jár külön díjjal.

A Szolgáltató által használt, harmadik féltől származó összetevőkre (például nyílt
forráskódú programkönyvtárak, betűtípusok, képek) az adott összetevő saját licence
vonatkozik.

## 6. Tárhely és üzemeltetés

Az üzemeltetési szolgáltatás tartalma: tárhely, rendszeres — jellemzően napi —
biztonsági mentés, biztonsági és rendszerfrissítések, az elérhetőség figyelése,
valamint havi látogatói statisztika.

A Szolgáltató az általa üzemeltetett oldalakra tartósan 98% feletti éves
rendelkezésre állásra törekszik. A tervezett karbantartások ideje, valamint a
Szolgáltató érdekkörén kívül eső kiesések (például a Megrendelő domain- vagy
DNS-szolgáltatójánál fellépő hiba) nem számítanak bele.

## 7. A Megrendelő kötelezettségei

A Megrendelő köteles a teljesítéshez szükséges tartalmakat és hozzáféréseket
biztosítani, valamint felelős az általa átadott anyagok (szöveg, kép, logó)
jogtisztaságáért.

## 8. Felmondás

A határozatlan idejű üzemeltetési szerződést bármelyik fél felmondhatja a másik
félhez intézett írásos nyilatkozattal, ${company.noticePeriod} felmondási idővel. A
felmondás nem érinti a már kiszámlázott díjakat.

## 9. Panaszkezelés és jogorvoslat

Panaszt a ${contact.email} címen lehet bejelenteni. A Szolgáltató a panaszt
megvizsgálja, és arra írásban válaszol. Fogyasztói jogvita esetén a Megrendelő
békéltető testülethez fordulhat: ${company.disputeResolution}.

## 10. Záró rendelkezések

A jelen feltételekben nem szabályozott kérdésekben a magyar jog, különösen a
Polgári Törvénykönyv rendelkezései az irányadók.

Hatályos: ${company.effectiveDate}
`;
}

function adatkezeles({ contact, company }: Organization): string {
  return `
## 1. Az adatkezelő

${company.legalName}
Székhely: ${company.seat}
E-mail: ${contact.email}

## 2. Milyen adatokat kezelünk?

**Kapcsolatfelvételi űrlap.** Az űrlapon megadott név, e-mail cím, telefonszám,
cégnév, a megkeresés témája és az üzenet szövege.

Az adatkezelés célja a megkeresés megválaszolása és — szerződéskötés esetén — a
szerződés előkészítése. Jogalapja az érintett hozzájárulása, illetve a
szerződéskötést megelőző lépések megtétele.

**Szervernaplók.** A weboldalt kiszolgáló rendszer technikai naplót vezet
(IP-cím, időbélyeg, kért útvonal, böngésző azonosító). Ennek célja az üzemeltetés
biztonsága és a hibák felderítése, jogalapja az adatkezelő jogos érdeke.

## 3. Meddig őrizzük az adatokat?

A megkereséseket a megválaszolást követő ${company.leadRetention}, szerződéskötés esetén
a szerződéses jogviszonyból eredő igények elévüléséig őrizzük. A szerverek
technikai naplóit legfeljebb ${company.logRetention} tároljuk.

## 4. Kik férnek hozzá?

Az adatokat a ${site.name} munkatársai kezelik. Adatfeldolgozóként a
tárhelyszolgáltató jár el: ${company.hostingProvider}.

Az adatokat harmadik félnek marketing célból nem adjuk át, és nem értékesítjük.

## 5. Sütik

A weboldal működéséhez szükséges sütiket használ. Részletek a
[cookie tájékoztatóban](/jogi/cookie-tajekoztato).

## 6. Az érintett jogai

Az érintett kérheti a rá vonatkozó személyes adatokhoz való hozzáférést, azok
helyesbítését, törlését vagy kezelésének korlátozását, tiltakozhat az adatkezelés
ellen, és élhet az adathordozhatósághoz való jogával. A hozzájárulás bármikor
visszavonható.

Kérelmét a ${contact.email} címre küldheti; azt legfeljebb egy hónapon belül
megválaszoljuk.

## 7. Jogorvoslat

Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) lehet
fordulni, illetve bírósághoz lehet keresetet benyújtani.

Hatályos: ${company.effectiveDate}
`;
}

function cookie({ company }: Organization): string {
  return `
## Mik azok a sütik?

A süti (cookie) egy kis adatfájl, amelyet a weboldal helyez el a látogató
eszközén. A sütik önmagukban nem alkalmasak a látogató személyének azonosítására.

## Milyen sütiket használ ez az oldal?

**Működéshez szükséges sütik.** Ezek nélkül az oldal egyes funkciói nem
működnének. Ilyen az adminisztrációs felület bejelentkezési munkamenetét azonosító
süti, amelyet kizárólag a belépett adminisztrátor böngészője kap meg. Ez a süti
csak a szerver számára olvasható (httpOnly), tehát JavaScript nem fér hozzá, és a
munkamenet lejártakor érvényét veszti.

**Nyomkövető és marketing sütik.** A weboldal ilyeneket nem használ. Nem futtatunk
külső hirdetési vagy közösségimédia-követő szkriptet.

## Hogyan lehet kezelni a sütiket?

A böngészők beállításai között a sütik letilthatók és törölhetők. A működéshez
szükséges sütik letiltása esetén az adminisztrációs felület nem használható.

Hatályos: ${company.effectiveDate}
`;
}

const builders: Record<string, (organization: Organization) => string> = {
  impresszum,
  aszf,
  'adatkezelesi-tajekoztato': adatkezeles,
  'cookie-tajekoztato': cookie,
};

export function getLegalDocument(
  slug: string,
  organization: Organization,
): LegalDocument | undefined {
  const page = legalPages.find((item) => item.slug === slug);
  const build = builders[slug];
  if (!page || !build) return undefined;

  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    updated: organization.company.effectiveDate,
    body: build(organization).trim(),
  };
}

export function listLegalDocuments(organization: Organization): LegalDocument[] {
  return legalPages
    .map((page) => getLegalDocument(page.slug, organization))
    .filter((doc): doc is LegalDocument => doc !== undefined);
}
